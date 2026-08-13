<template>
  <div
    class="dashboard-widget-host h-100"
    :class="{ 'dashboard-widget-host--editable': editable }"
    :data-widget-code="widget.code"
    :data-instance-key="instanceKey"
  >
    <!-- Toolbar aksi: drag handle (Fase 2) + configure/remove (Fase 3 — Admin
         Layout Builder). Drag area dibatasi ke `.dashboard-widget-drag-handle`
         saja (lihat DashboardGrid `dragAllowFrom`) supaya tombol lain di
         dalam toolbar ini tidak ikut memicu drag saat diklik. -->
    <div v-if="editable || builderMode" class="dashboard-widget-toolbar">
      <button
        v-if="builderMode && allowConfigure"
        type="button"
        class="dashboard-widget-action"
        title="Konfigurasi widget"
        @click.stop="emit('configure')"
      >
        <i class="ri-settings-3-line"></i>
      </button>
      <button
        v-if="builderMode"
        type="button"
        class="dashboard-widget-action dashboard-widget-action--danger"
        title="Hapus dari layout"
        @click.stop="emit('remove')"
      >
        <i class="ri-delete-bin-line"></i>
      </button>
      <span v-if="editable" class="dashboard-widget-action dashboard-widget-drag-handle" title="Geser widget">
        <i class="ri-drag-move-2-line"></i>
      </span>
    </div>

    <!-- Widget crash saat render/setup: isolasi supaya tidak menjatuhkan dashboard lain -->
    <div v-if="fatalError" class="card h-100">
      <div class="card-body d-flex flex-column align-items-center justify-content-center text-center py-4">
        <i class="ri-error-warning-line ri-24px text-danger mb-2"></i>
        <p class="text-danger small mb-2">Widget "{{ widget.title }}" gagal dimuat.</p>
        <button type="button" class="btn btn-sm btn-outline-primary" @click="retry">
          <i class="ri-refresh-line me-1"></i> Coba Lagi
        </button>
      </div>
    </div>

    <!-- component_key belum terdaftar di registry: degrade dengan aman, jangan crash -->
    <div v-else-if="!resolvedComponent" class="card h-100">
      <div class="card-body d-flex flex-column align-items-center justify-content-center text-center py-4">
        <i class="ri-puzzle-line ri-24px text-muted mb-2"></i>
        <p class="text-muted small mb-1">Widget "{{ widget.title }}" belum didukung.</p>
        <p class="text-muted small mb-0"><code>{{ widget.componentKey }}</code></p>
      </div>
    </div>

    <component :is="resolvedComponent" v-else :key="retryToken" />
  </div>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, ref } from 'vue'
import { useWidgetRegistry } from '~/composables/useWidgetRegistry'
import { useDashboardAnalytics } from '~/composables/useDashboardAnalytics'
import type { DashboardWidgetDTO } from '~/composables/useDashboardEngine'

const props = withDefaults(
  defineProps<{
    widget: DashboardWidgetDTO
    instanceKey: string
    config?: Record<string, unknown> | null
    /** Fase 2: tampilkan handle drag & nonaktifkan interaksi normal saat true. */
    editable?: boolean
    /** Fase 3: tampilkan tombol configure/remove (dipakai Admin Layout Builder). */
    builderMode?: boolean
    /**
     * Topik 4: dashboard personal pakai `builderMode` juga (untuk tombol
     * hapus) TAPI tidak punya konsep `instanceConfig` (fitur admin-only) —
     * default true supaya Admin Layout Builder tetap seperti semula.
     */
    allowConfigure?: boolean
    /** Widget & Dashboard Analytics — lihat DashboardGrid untuk konteks. */
    dashboardCode?: string
    dashboardLayoutId?: number
    dashboardLayoutWidgetId?: number
  }>(),
  { allowConfigure: true }
)

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'configure'): void
}>()

const { resolve } = useWidgetRegistry()
const { recordEvent } = useDashboardAnalytics()

const fatalError = ref(false)
const retryToken = ref(0)

const resolvedComponent = computed(() => resolve(props.widget.componentKey))

function retry() {
  fatalError.value = false
  retryToken.value += 1
}

/**
 * Widget & Dashboard Analytics — hanya catat event di mode viewer sungguhan
 * (BUKAN Admin Layout Builder: admin menambah/mengatur widget di sana bukan
 * representasi "penggunaan" widget oleh end-user).
 */
function trackWidgetEvent(eventType: 'widget_view' | 'widget_error', metadata?: Record<string, unknown>) {
  if (props.builderMode || !props.dashboardCode) return
  recordEvent(props.dashboardCode, {
    eventType,
    widgetCode: props.widget.code,
    dashboardLayoutId: props.dashboardLayoutId,
    dashboardLayoutWidgetId: props.dashboardLayoutWidgetId,
    metadata,
  })
}

onMounted(() => {
  if (resolvedComponent.value) {
    trackWidgetEvent('widget_view')
  }
})

// Error boundary per-widget: widget lain di dashboard yang sama tetap tampil normal
// walau satu widget crash saat render/setup.
onErrorCaptured((err) => {
  console.error(
    `❌ [DashboardWidgetHost] Widget "${props.widget.componentKey}" (instance: ${props.instanceKey}) crashed:`,
    err
  )
  fatalError.value = true
  trackWidgetEvent('widget_error', { message: (err as Error)?.message })
  return false
})
</script>

<style scoped>
.dashboard-widget-host {
  position: relative;
}

.dashboard-widget-host--editable {
  outline: 1px dashed var(--bs-primary, #008fec);
  outline-offset: 2px;
  border-radius: 0.5rem;
}

.dashboard-widget-toolbar {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dashboard-widget-action {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--bs-primary, #008fec);
  color: #fff;
  cursor: pointer;
  opacity: 0.85;
}

.dashboard-widget-drag-handle {
  cursor: move;
}

.dashboard-widget-action--danger {
  background: var(--bs-danger, #f13636);
}

.dashboard-widget-action:hover {
  opacity: 1;
}
</style>
