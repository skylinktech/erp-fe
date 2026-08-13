import { computed, ref } from 'vue'
import { apiFetch } from '~/utils/apiFetch'
import { getApiErrorMessage } from '~/utils/apiError'
import type {
  DashboardDTO,
  DashboardLayoutDTO,
  DashboardLayoutWidgetDTO,
  DashboardWidgetDTO,
} from '~/composables/useDashboardEngine'

type PersonalDashboardResponse = {
  dashboard: DashboardDTO
  activeLayout: DashboardLayoutDTO | null
}

function genInstanceKey(widgetCode: string): string {
  return `${widgetCode}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Personal/Custom Dashboard — dipakai oleh:
 * - Dashboard → Main (`/dashboard`) — tampilan read-only hasil layout tersimpan
 * - Dashboard → Settings (`/dashboard/settings`) — builder (tambah/geser/hapus + Simpan)
 *
 * State canvas di Settings murni LOKAL sampai user klik "Simpan".
 * Setelah disimpan, Main langsung membaca layout yang sama dari backend.
 */
export function usePersonalDashboard() {
  const dashboard = ref<DashboardDTO | null>(null)
  const layout = ref<DashboardLayoutDTO | null>(null)
  const catalog = ref<DashboardWidgetDTO[]>([])

  const loading = ref(false)
  const loadingCatalog = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const hasUnsavedChanges = ref(false)

  const hasWidgets = computed(() => (layout.value?.layoutWidgets?.length ?? 0) > 0)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      const result = await apiFetch<PersonalDashboardResponse>($api.myDashboard())
      dashboard.value = result.dashboard
      layout.value = result.activeLayout
      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal memuat dashboard personal')
    } finally {
      loading.value = false
    }
  }

  async function loadCatalog() {
    loadingCatalog.value = true
    try {
      const { $api } = useNuxtApp()
      const result = await apiFetch<{ data: DashboardWidgetDTO[] }>($api.myDashboardWidgetCatalog())
      catalog.value = result?.data ?? []
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil katalog widget')
    } finally {
      loadingCatalog.value = false
    }
  }

  /** Tambah widget dari katalog ke posisi paling bawah canvas (belum tersimpan). */
  function addWidget(widget: DashboardWidgetDTO) {
    if (!layout.value) return

    const items = layout.value.layoutWidgets
    const nextY = items.reduce((max, lw) => Math.max(max, lw.posY + lw.height), 0)
    const tempId = -(Date.now() + Math.floor(Math.random() * 1000))

    const newItem: DashboardLayoutWidgetDTO = {
      id: tempId,
      dashboardLayoutId: layout.value.id,
      widgetId: widget.id,
      instanceKey: genInstanceKey(widget.code),
      posX: 0,
      posY: nextY,
      width: widget.defaultWidth,
      height: widget.defaultHeight,
      sortOrder: items.length,
      isHiddenByDefault: false,
      instanceConfig: null,
      widget,
    }

    layout.value = { ...layout.value, layoutWidgets: [...items, newItem] }
    hasUnsavedChanges.value = true
  }

  /** Hapus 1 instance widget dari canvas (belum tersimpan). */
  function removeWidget(dashboardLayoutWidgetId: number) {
    if (!layout.value) return

    layout.value = {
      ...layout.value,
      layoutWidgets: layout.value.layoutWidgets.filter((lw) => lw.id !== dashboardLayoutWidgetId),
    }
    hasUnsavedChanges.value = true
  }

  /** Terapkan hasil drag & resize dari event `layout-change` DashboardGrid ke state lokal. */
  function applyPositionChanges(
    items: { dashboardLayoutWidgetId: number; posX: number; posY: number; width: number; height: number }[]
  ) {
    if (!layout.value || items.length === 0) return

    const byId = new Map(items.map((item) => [item.dashboardLayoutWidgetId, item]))
    layout.value = {
      ...layout.value,
      layoutWidgets: layout.value.layoutWidgets.map((lw) => {
        const change = byId.get(lw.id)
        if (!change) return lw
        return { ...lw, posX: change.posX, posY: change.posY, width: change.width, height: change.height }
      }),
    }
    hasUnsavedChanges.value = true
  }

  /** Kirim seluruh state canvas saat ini sebagai snapshot penuh ke backend (delete + recreate). */
  async function save() {
    if (!layout.value) return

    saving.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      const items = layout.value.layoutWidgets.map((lw, index) => ({
        widgetId: lw.widgetId,
        instanceKey: lw.instanceKey,
        posX: lw.posX,
        posY: lw.posY,
        width: lw.width,
        height: lw.height,
        sortOrder: index,
      }))

      const result = await apiFetch<PersonalDashboardResponse>($api.myDashboardUpdateWidgets(), {
        method: 'PUT',
        body: { items },
      })
      dashboard.value = result.dashboard
      layout.value = result.activeLayout
      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal menyimpan dashboard personal')
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    dashboard,
    layout,
    catalog,
    loading,
    loadingCatalog,
    saving,
    error,
    hasUnsavedChanges,
    hasWidgets,
    load,
    loadCatalog,
    addWidget,
    removeWidget,
    applyPositionChanges,
    save,
  }
}
