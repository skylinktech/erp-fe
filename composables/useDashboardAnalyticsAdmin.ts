import { ref } from 'vue'
import { apiFetch } from '~/utils/apiFetch'
import { getApiErrorMessage } from '~/utils/apiError'

export type TopDashboardRow = {
  dashboardCode: string
  views: number
  uniqueUsers: number
  name: string
  icon: string | null
}

export type TopWidgetRow = {
  widgetCode: string
  views: number
  errors: number
  errorRate: number
  title: string
  icon: string | null
}

export type DashboardAnalyticsOverview = {
  days: number
  totals: {
    dashboardViews: number
    widgetViews: number
    widgetErrors: number
    widgetRefreshes: number
  }
  topDashboards: TopDashboardRow[]
  topWidgets: TopWidgetRow[]
}

export type DashboardAnalyticsDetail = {
  dashboard: { id: number; code: string; name: string }
  days: number
  totalViews: number
  uniqueUsers: number
  dailyViews: { date: string; views: number }[]
  topWidgets: { widgetCode: string; views: number; errors: number; errorRate: number }[]
}

export type WidgetAnalyticsDetail = {
  widget: { id: number; code: string; title: string }
  days: number
  views: number
  errors: number
  errorRate: number
  usedInDashboards: { dashboardCode: string; views: number }[]
}

/** Widget & Dashboard Analytics — client admin (halaman overview & detail). */
export function useDashboardAnalyticsAdmin() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOverview(days: number): Promise<DashboardAnalyticsOverview | null> {
    loading.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      return await apiFetch<DashboardAnalyticsOverview>($api.dashboardAnalyticsOverview(), {
        params: { days },
      })
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal memuat ringkasan analytics')
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboardDetail(
    dashboardId: number | string,
    days: number
  ): Promise<DashboardAnalyticsDetail | null> {
    loading.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      return await apiFetch<DashboardAnalyticsDetail>($api.dashboardAnalyticsShow(dashboardId), {
        params: { days },
      })
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal memuat analytics dashboard')
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchWidgetDetail(
    widgetId: number | string,
    days: number
  ): Promise<WidgetAnalyticsDetail | null> {
    loading.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      return await apiFetch<WidgetAnalyticsDetail>($api.dashboardWidgetAnalyticsShow(widgetId), {
        params: { days },
      })
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal memuat analytics widget')
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchOverview, fetchDashboardDetail, fetchWidgetDetail }
}
