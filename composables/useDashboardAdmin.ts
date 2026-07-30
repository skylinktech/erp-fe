import { ref } from 'vue'
import { apiFetch } from '~/utils/apiFetch'
import type { DashboardWidgetConfigField } from '~/composables/useDashboardEngine'

/**
 * Admin CRUD — Fase 3. Dua composable terpisah (dashboard vs widget catalog)
 * supaya tetap Single Responsibility, meski keduanya pola-nya mirip (list +
 * create/update/delete lewat endpoint admin Fase 1 yang sudah ada).
 */

export type AdminDashboardRow = {
  id: number
  code: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  isActive: boolean
  sortOrder: number
  defaultLayoutId: number | null
}

export type AdminDashboardPayload = {
  code?: string
  name: string
  description?: string | null
  icon?: string | null
  category?: string | null
  isActive?: boolean
  sortOrder?: number
}

function extractErrorMessage(err: any, fallback: string): string {
  return (
    err?.data?.message ||
    err?.response?._data?.message ||
    err?.message ||
    fallback
  )
}

export function useDashboardAdmin() {
  const dashboards = ref<AdminDashboardRow[]>([])
  const loading = ref(false)
  const totalRecords = ref(0)
  const error = ref<string | null>(null)

  async function fetchDashboards(params: { search?: string; page?: number; rows?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      const result = await apiFetch<any>($api.dashboards(), {
        query: {
          all: true,
          search: params.search ?? '',
          page: params.page ?? 1,
          rows: params.rows ?? 100,
        },
      })
      dashboards.value = result?.data ?? []
      totalRecords.value = result?.meta?.total ?? dashboards.value.length
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Gagal memuat daftar dashboard')
    } finally {
      loading.value = false
    }
  }

  async function createDashboard(payload: AdminDashboardPayload & { code: string }) {
    const { $api } = useNuxtApp()
    return apiFetch($api.dashboardStore(), { method: 'POST', body: payload })
  }

  async function updateDashboard(id: number, payload: AdminDashboardPayload) {
    const { $api } = useNuxtApp()
    return apiFetch($api.dashboardUpdate(id), { method: 'PUT', body: payload })
  }

  async function deleteDashboard(id: number) {
    const { $api } = useNuxtApp()
    return apiFetch($api.dashboardDelete(id), { method: 'DELETE' })
  }

  return {
    dashboards,
    loading,
    totalRecords,
    error,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  }
}

export type AdminWidgetRow = {
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
  minWidth: number | null
  minHeight: number | null
  maxWidth: number | null
  maxHeight: number | null
  refreshIntervalSeconds: number | null
  endpoint: string | null
  configSchema: DashboardWidgetConfigField[] | null
  isActive: boolean
}

export type AdminWidgetPayload = {
  code?: string
  title: string
  description?: string | null
  componentKey: string
  icon?: string | null
  category?: string | null
  widgetType?: string
  defaultWidth: number
  defaultHeight: number
  minWidth?: number | null
  minHeight?: number | null
  maxWidth?: number | null
  maxHeight?: number | null
  refreshIntervalSeconds?: number | null
  endpoint?: string | null
  configSchema?: DashboardWidgetConfigField[] | null
  isActive?: boolean
}

export function useDashboardWidgetAdmin() {
  const widgets = ref<AdminWidgetRow[]>([])
  const loading = ref(false)
  const totalRecords = ref(0)
  const error = ref<string | null>(null)

  async function fetchWidgets(params: { search?: string; page?: number; rows?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      const result = await apiFetch<any>($api.dashboardWidgets(), {
        query: {
          all: true,
          search: params.search ?? '',
          page: params.page ?? 1,
          rows: params.rows ?? 100,
        },
      })
      widgets.value = result?.data ?? []
      totalRecords.value = result?.meta?.total ?? widgets.value.length
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Gagal memuat katalog widget')
    } finally {
      loading.value = false
    }
  }

  /** Katalog widget AKTIF saja — dipakai widget picker di Admin Layout Builder. */
  async function fetchActiveWidgets(): Promise<AdminWidgetRow[]> {
    const { $api } = useNuxtApp()
    const result = await apiFetch<any>($api.dashboardWidgets(), { query: { rows: 200 } })
    return result?.data ?? []
  }

  async function createWidget(payload: AdminWidgetPayload & { code: string }) {
    const { $api } = useNuxtApp()
    return apiFetch($api.dashboardWidgetStore(), { method: 'POST', body: payload })
  }

  async function updateWidget(id: number, payload: AdminWidgetPayload) {
    const { $api } = useNuxtApp()
    return apiFetch($api.dashboardWidgetUpdate(id), { method: 'PUT', body: payload })
  }

  async function deleteWidget(id: number) {
    const { $api } = useNuxtApp()
    return apiFetch($api.dashboardWidgetDelete(id), { method: 'DELETE' })
  }

  return {
    widgets,
    loading,
    totalRecords,
    error,
    fetchWidgets,
    fetchActiveWidgets,
    createWidget,
    updateWidget,
    deleteWidget,
  }
}
