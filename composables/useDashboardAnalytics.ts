import { apiFetch } from '~/utils/apiFetch'

export type DashboardWidgetEventType = 'dashboard_view' | 'widget_view' | 'widget_error' | 'widget_refresh'

export type RecordDashboardEventPayload = {
  eventType: DashboardWidgetEventType
  widgetCode?: string
  dashboardLayoutId?: number
  dashboardLayoutWidgetId?: number
  metadata?: Record<string, unknown> | null
}

/**
 * Widget & Dashboard Analytics — client tipis buat kirim event telemetry.
 *
 * SENGAJA "fire and forget": kegagalan network/500 di endpoint ini TIDAK
 * PERNAH boleh mengganggu pengalaman viewer (tidak ada loading state, tidak
 * ada toast error). Dipanggil dari `useDashboardEngine` (dashboard_view) dan
 * `DashboardWidgetHost` (widget_view/widget_error).
 */
export function useDashboardAnalytics() {
  function recordEvent(dashboardCode: string, payload: RecordDashboardEventPayload): void {
    const { $api } = useNuxtApp()
    apiFetch($api.dashboardEvents(dashboardCode), {
      method: 'POST',
      body: payload,
    }).catch(() => {
      // Diamkan — analytics tidak boleh menjatuhkan UI viewer.
    })
  }

  return { recordEvent }
}
