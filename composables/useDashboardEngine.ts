import { ref } from 'vue'
import { apiFetch } from '~/utils/apiFetch'
import { useDashboardAnalytics } from '~/composables/useDashboardAnalytics'

export type DashboardWidgetConfigField = {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'textarea'
  default?: unknown
  helpText?: string
}

export type DashboardWidgetDTO = {
  id: number
  code: string
  title: string
  description: string | null
  componentKey: string
  icon: string | null
  category: string | null
  widgetType: string
  defaultWidth: number
  defaultHeight: number
  minWidth?: number | null
  minHeight?: number | null
  maxWidth?: number | null
  maxHeight?: number | null
  refreshIntervalSeconds: number | null
  endpoint: string | null
  /** Fase 3: skema field untuk form dinamis "Konfigurasi Widget" di Admin Layout Builder. */
  configSchema?: DashboardWidgetConfigField[] | null
  isActive?: boolean
}

export type DashboardLayoutWidgetDTO = {
  id: number
  dashboardLayoutId: number
  widgetId: number
  instanceKey: string
  posX: number
  posY: number
  width: number
  height: number
  sortOrder: number
  isHiddenByDefault: boolean
  instanceConfig: Record<string, unknown> | null
  widget: DashboardWidgetDTO
  /** Fase 2: true kalau posX/posY/width/height di atas sudah hasil override user. */
  isPersonalized?: boolean
}

export type LayoutPreferenceItem = {
  dashboardLayoutWidgetId: number
  posX: number
  posY: number
  width: number
  height: number
}

export type DashboardLayoutDTO = {
  id: number
  dashboardId: number
  versionNumber: number
  label: string | null
  status: 'draft' | 'published' | 'archived'
  gridColumns: number
  rowHeight: number
  breakpoints: Record<string, unknown> | null
  isDefault: boolean
  publishedAt?: string | null
  layoutWidgets: DashboardLayoutWidgetDTO[]
}

export type DashboardDTO = {
  id: number
  code: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  isActive: boolean
}

type DashboardDetailResponse = {
  dashboard: DashboardDTO
  activeLayout: DashboardLayoutDTO | null
}

/**
 * Cache stale-while-revalidate di level module (bukan di dalam composable),
 * supaya bertahan selintas antar-navigasi dalam 1 sesi SPA — pindah dari
 * dashboard A -> B -> A tidak perlu spinner loading lagi utk A yang ke-2
 * kalinya, meskipun composable ini dipanggil ulang tiap kali halaman di-mount.
 *
 * Sengaja TIDAK pakai TTL/kedaluwarsa numerik: data lama SELALU ditampilkan
 * dulu (instan) kalau ada, lalu SELALU direvalidate ke backend di
 * background. Backend sendiri sudah punya cache (Redis, TTL 5 menit +
 * invalidasi aktif saat publish/update — lihat DashboardService), jadi
 * revalidate di sini murah (kemungkinan besar cache-hit di backend) dan
 * cukup untuk menjaga data tetap benar tanpa perlu duplikasi logika TTL di
 * 2 tempat.
 */
const dashboardDetailCache = new Map<string, DashboardDetailResponse>()

/**
 * Dashboard Engine (Fase 1) — memuat 1 dashboard by code beserta layout aktif
 * (published + default) dari backend. Belum menangani preferensi personal
 * user, versioning selain default, atau drag/resize (Fase 2+).
 */
export function useDashboardEngine() {
  const dashboard = ref<DashboardDTO | null>(null)
  const activeLayout = ref<DashboardLayoutDTO | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)
  const forbidden = ref(false)

  const savingPreferences = ref(false)
  const savePreferencesError = ref<string | null>(null)

  const { recordEvent } = useDashboardAnalytics()

  async function loadByCode(code: string) {
    error.value = null
    notFound.value = false
    forbidden.value = false

    // Widget & Dashboard Analytics: catat "dashboard dilihat" TEPAT SEKALI
    // per pemanggilan loadByCode ini — begitu ada data valid utk ditampilkan
    // ke user, entah dari cache (langsung) atau fetch baru (di bawah).
    // Fire-and-forget, tidak pernah menunggu/memblok render.
    let viewEventFired = false

    // Stale-while-revalidate: kalau ada data lama utk code ini, tampilkan
    // dulu langsung (tanpa spinner) sambil fetch data terbaru di background.
    const cached = dashboardDetailCache.get(code)
    if (cached) {
      dashboard.value = cached.dashboard
      activeLayout.value = cached.activeLayout
      loading.value = false
      recordEvent(code, { eventType: 'dashboard_view', dashboardLayoutId: cached.activeLayout?.id })
      viewEventFired = true
    } else {
      loading.value = true
      dashboard.value = null
      activeLayout.value = null
    }

    try {
      const { $api } = useNuxtApp()
      const result = await apiFetch<DashboardDetailResponse>($api.dashboardShow(code), {
        // Dashboard bisa saja tidak diizinkan untuk user tertentu (403) — itu
        // adalah state yang wajar untuk ditampilkan inline, bukan redirect paksa.
        skip403Redirect: true,
      })

      dashboard.value = result.dashboard
      activeLayout.value = result.activeLayout
      dashboardDetailCache.set(code, result)

      if (!viewEventFired) {
        recordEvent(code, { eventType: 'dashboard_view', dashboardLayoutId: result.activeLayout?.id })
      }
    } catch (err: any) {
      // Kalau ini cuma revalidate background (sudah ada data lama yang
      // ditampilkan), jangan timpa UI dengan state error/notFound/forbidden —
      // biarkan user tetap lihat data terakhir yang valid. Munculkan error
      // penuh hanya kalau memang belum ada apa-apa untuk ditampilkan.
      if (cached) {
        console.warn(`[useDashboardEngine] Gagal revalidate dashboard "${code}" di background:`, err)
      } else {
        const status = err?.response?.status ?? err?.statusCode ?? err?.status

        if (status === 404) {
          notFound.value = true
        } else if (status === 403) {
          forbidden.value = true
        } else {
          error.value =
            err?.data?.message || err?.response?._data?.message || err?.message || 'Gagal memuat dashboard'
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fase 2 — simpan hasil drag & resize. Optimistic update ke state lokal
   * dulu (supaya UI langsung terasa responsif), lalu request ke backend;
   * kalau backend menolak (mis. item tidak valid), state di-refresh ulang
   * dari response terbaru supaya tetap konsisten dengan sumber kebenaran.
   */
  async function savePreferences(code: string, items: LayoutPreferenceItem[]) {
    if (!activeLayout.value || items.length === 0) return

    const itemById = new Map(items.map((item) => [item.dashboardLayoutWidgetId, item]))
    activeLayout.value.layoutWidgets = activeLayout.value.layoutWidgets.map((lw) => {
      const override = itemById.get(lw.id)
      if (!override) return lw
      return { ...lw, posX: override.posX, posY: override.posY, width: override.width, height: override.height, isPersonalized: true }
    })

    savingPreferences.value = true
    savePreferencesError.value = null

    try {
      const { $api } = useNuxtApp()
      const result = await apiFetch<DashboardDetailResponse>($api.dashboardPreferences(code), {
        method: 'PUT',
        body: { items },
        skip403Redirect: true,
      })
      dashboard.value = result.dashboard
      activeLayout.value = result.activeLayout
      dashboardDetailCache.set(code, result)
    } catch (err: any) {
      savePreferencesError.value =
        err?.data?.message || err?.response?._data?.message || err?.message || 'Gagal menyimpan layout'
      // State lokal sudah optimis berubah; muat ulang dari server supaya tidak "nyangkut" salah.
      // Hapus cache lama dulu supaya loadByCode tidak menampilkan balik data
      // optimis yang salah itu sebagai "cache" sebelum revalidate selesai.
      dashboardDetailCache.delete(code)
      await loadByCode(code)
    } finally {
      savingPreferences.value = false
    }
  }

  return {
    dashboard,
    activeLayout,
    loading,
    error,
    notFound,
    forbidden,
    loadByCode,
    savingPreferences,
    savePreferencesError,
    savePreferences,
  }
}
