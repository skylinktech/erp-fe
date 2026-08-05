import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type InvoiceAlertType = 'overdue' | 'unsent' | 'unpaid'
export type InvoiceAlertSeverity = 'critical' | 'warning' | 'info'
export type InvoiceAlertFilter = 'all' | InvoiceAlertType

export type InvoiceAlertItem = {
  alertType: InvoiceAlertType
  severity: InvoiceAlertSeverity
  invoiceId: string
  noInvoice: string
  customerId: number | null
  customerName: string
  dueDate: string | null
  daysOverdue: number | null
  daysUntilDue: number | null
  status: 'unpaid' | 'partial' | 'paid'
  remainingAmount: number
  total: number
  sentAt: string | null
  isOverdue: boolean
  isUnsent: boolean
  isUnpaid: boolean
  subscriptionId: string | null
}

export type InvoiceAlertsData = {
  total: number
  overdueCount: number
  unsentCount: number
  unpaidCount: number
  items: InvoiceAlertItem[]
}

const DASHBOARD_LIMIT = 20

export const useDashboardInvoiceAlertsStore = defineStore('dashboardInvoiceAlerts', {
  state: () => ({
    data: null as InvoiceAlertsData | null,
    selectedFilter: 'all' as InvoiceAlertFilter,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    items: (state): InvoiceAlertItem[] => state.data?.items ?? [],
    isEmpty: (state) => !state.loading && (state.data?.items?.length ?? 0) === 0,
    criticalCount: (state) =>
      (state.data?.items ?? []).filter((i) => i.severity === 'critical').length,
  },

  actions: {
    async setFilter(filter: InvoiceAlertFilter) {
      if (this.selectedFilter === filter) return
      this.selectedFilter = filter
      await this.fetchAlerts()
    },

    async fetchAlerts() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const params = new URLSearchParams({
          limit: String(DASHBOARD_LIMIT),
        })
        if (this.selectedFilter !== 'all') {
          params.set('type', this.selectedFilter)
        }

        const res = await apiFetch<{
          success?: boolean
          data: InvoiceAlertsData
        }>(`${$api.financeInvoicesAlerts()}?${params.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        this.data = res.data ?? {
          total: 0,
          overdueCount: 0,
          unsentCount: 0,
          unpaidCount: 0,
          items: [],
        }
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat alert invoice'
        this.data = null
      } finally {
        this.loading = false
      }
    },
  },
})
