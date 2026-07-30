<template>
  <div
    class="dashboard-grid-wrapper"
    :style="{
      '--dashboard-grid-gap': `${gridGap}px`,
      // Batalkan outer margin library agar tepi card rata dengan header.
      marginInline: `calc(-1 * var(--dashboard-grid-gap))`,
      width: `calc(100% + 2 * var(--dashboard-grid-gap))`,
    }"
  >
    <GridLayout
      v-model:layout="gridItems"
      :col-num="layout.gridColumns || 12"
      :row-height="layout.rowHeight || 90"
      :margin="[gridGap, gridGap]"
      :is-draggable="editable"
      :is-resizable="editable"
      vertical-compact
      use-css-transforms
      @layout-updated="onLayoutUpdated"
    >
      <template #item="{ item }">
        <DashboardWidgetHost
          v-if="resolveMeta(item.i)"
          :widget="resolveMeta(item.i)!.widget"
          :instance-key="resolveMeta(item.i)!.instanceKey"
          :config="resolveMeta(item.i)!.instanceConfig"
          :editable="editable"
          :builder-mode="builderMode"
          :allow-configure="allowWidgetConfigure"
          :dashboard-code="dashboardCode"
          :dashboard-layout-id="layout.id"
          :dashboard-layout-widget-id="Number(item.i)"
          @remove="emit('widget-remove', Number(item.i))"
          @configure="emit('widget-configure', Number(item.i))"
        />
      </template>
    </GridLayout>

    <div v-if="visibleItems.length === 0" class="dashboard-grid-empty">
      <i class="ri-layout-grid-line ri-24px text-muted mb-2"></i>
      <p class="text-muted mb-0">Dashboard ini belum memiliki widget.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { GridLayout } from 'grid-layout-plus'
import type { Layout, LayoutItem } from 'grid-layout-plus'
import DashboardWidgetHost from '~/components/dashboard-engine/DashboardWidgetHost.vue'
import type { DashboardLayoutDTO, DashboardLayoutWidgetDTO } from '~/composables/useDashboardEngine'

/**
 * Grid renderer — Fase 2 (drag & resize, dibungkus grid-layout-plus).
 * Skema `pos_x/pos_y/width/height/grid_columns/row_height` dari backend
 * memang didesain 1:1 dengan model data library ini (x/y/w/h/colNum/rowHeight)
 * sejak Fase 1, jadi konversinya cuma penamaan kolom saja.
 *
 * Komponen ini murni presentational: tidak tahu cara menyimpan preferensi ke
 * backend — itu tanggung jawab pemanggil (pages/dashboard/[code].vue) lewat
 * event `layout-change`. Ini menjaga Single Responsibility & memudahkan
 * reuse (mis. dipakai juga di admin layout builder pada Fase 3 nanti).
 */
export type LayoutChangeItem = {
  dashboardLayoutWidgetId: number
  posX: number
  posY: number
  width: number
  height: number
}

const props = withDefaults(
  defineProps<{
  layout: DashboardLayoutDTO
  /** Mode edit: aktifkan drag & resize. Default false (read-only). */
  editable?: boolean
  /** Fase 3: tampilkan tombol configure/remove per widget (Admin Layout Builder). */
  builderMode?: boolean
  /**
   * Topik 4: dashboard personal pakai `builderMode` (untuk tombol hapus)
   * tapi tidak punya tombol "Konfigurasi" (fitur admin-only). Default true
   * supaya Admin Layout Builder tetap seperti semula.
   */
  allowWidgetConfigure?: boolean
  /**
   * Widget & Dashboard Analytics — kode dashboard pemilik grid ini, diteruskan
   * ke tiap `DashboardWidgetHost` supaya event `widget_view`/`widget_error`
   * bisa didenormalisasi ke dashboard yang benar. Opsional: kalau tidak diisi
   * (mis. dipakai di konteks lain nanti), widget host cukup skip pencatatan.
   */
  dashboardCode?: string
  }>(),
  { allowWidgetConfigure: true }
)

const emit = defineEmits<{
  (e: 'layout-change', items: LayoutChangeItem[]): void
  (e: 'widget-remove', dashboardLayoutWidgetId: number): void
  (e: 'widget-configure', dashboardLayoutWidgetId: number): void
}>()

/** Jarak antar card + outer margin library (px). Outer dikompensasi di wrapper. */
const gridGap = 24

const visibleItems = computed<DashboardLayoutWidgetDTO[]>(() =>
  [...(props.layout.layoutWidgets || [])]
    .filter((item) => !item.isHiddenByDefault)
    .sort((a, b) => a.sortOrder - b.sortOrder)
)

/** Lookup metadata widget — key string supaya aman vs number/string dari library. */
const widgetMetaById = computed(() => {
  const map = new Map<string, DashboardLayoutWidgetDTO>()
  for (const item of visibleItems.value) {
    map.set(String(item.id), item)
  }
  return map
})

function resolveMeta(id: string | number) {
  return widgetMetaById.value.get(String(id))
}

function toGridItems(items: DashboardLayoutWidgetDTO[], editable: boolean): Layout {
  return items.map((item) => ({
    i: String(item.id),
    x: item.posX,
    y: item.posY,
    w: item.width,
    h: item.height,
    minW: item.widget?.minWidth ?? undefined,
    minH: item.widget?.minHeight ?? undefined,
    maxW: item.widget?.maxWidth ?? undefined,
    maxH: item.widget?.maxHeight ?? undefined,
    // Batasi area drag ke handle khusus (lihat DashboardWidgetHost) supaya
    // tombol/interaksi di dalam widget (mis. refresh) tetap bisa diklik saat
    // mode edit aktif — bukan seluruh card jadi area drag.
    ...(editable ? { dragAllowFrom: '.dashboard-widget-drag-handle' } : {}),
  }))
}

const gridItems = ref<Layout>(toGridItems(visibleItems.value, Boolean(props.editable)))

// Resync kalau layout dari backend berganti (mis. pindah dashboard, atau
// setelah save selesai & backend mengembalikan state terbaru), atau saat
// mode edit di-toggle (perlu re-apply dragAllowFrom).
watch(
  [() => props.layout, () => props.editable],
  ([newLayout, editable]) => {
    gridItems.value = toGridItems(
      [...(newLayout.layoutWidgets || [])]
        .filter((item) => !item.isHiddenByDefault)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      Boolean(editable)
    )
  }
)

// grid-layout-plus juga memancarkan `layout-updated` sekali saat mount &
// setiap kali `compact()` jalan (bukan cuma saat user drag/resize). Kita
// hanya boleh "save" kalau memang sedang di mode edit DAN ada item yang
// posisi/ukurannya benar-benar berubah dari sumber saat ini (hindari
// PUT request percuma ke backend).
function onLayoutUpdated(updatedLayout: Layout) {
  if (!props.editable) return

  const originalByI = new Map(visibleItems.value.map((item) => [String(item.id), item]))

  const items: LayoutChangeItem[] = []
  for (const item of updatedLayout as LayoutItem[]) {
    const original = originalByI.get(String(item.i))
    if (
      !original ||
      original.posX !== item.x ||
      original.posY !== item.y ||
      original.width !== item.w ||
      original.height !== item.h
    ) {
      items.push({
        dashboardLayoutWidgetId: Number(item.i),
        posX: item.x,
        posY: item.y,
        width: item.w,
        height: item.h,
      })
    }
  }

  if (items.length > 0) {
    emit('layout-change', items)
  }
}
</script>

<style scoped>
/*
 * Jangan pakai overflow-x: clip di wrapper ini.
 * Di CSS, overflow-x ≠ visible memaksa overflow-y ikut non-visible —
 * sehingga card di bawah viewport pertama ikut terpotong / “hilang”.
 */
.dashboard-grid-wrapper {
  max-width: none;
  overflow: visible;
}

.dashboard-grid-wrapper :deep(.dashboard-widget-host) {
  height: 100%;
  min-height: 0;
}

.dashboard-grid-wrapper :deep(.card) {
  height: 100%;
  margin-bottom: 0;
}

.dashboard-grid-empty {
  text-align: center;
  padding: 3rem 1rem;
}
</style>
