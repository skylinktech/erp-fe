import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type ExpiringPeriodKey = '7' | '14' | '30'

export type ExpiringItemType = 'contract' | 'service'
export type ExpiringSeverity = 'critical' | 'warning' | 'info'

export type ExpiringContractItem = {
  type: ExpiringItemType
  subscriptionId: string
  noSubscription: string
  customerId: number
  customerName: string
  serviceId: string | null
  serviceName: string | null
  endDate: string
  daysRemaining: number
  severity: ExpiringSeverity
  assignedSalesId: number | null
  assignedSalesName: string | null
}

export type ExpiringContractsData = {
  days: number
  total: number
  contractCount: number
  serviceCount: number
  items: ExpiringContractItem[]
}

const DASHBOARD_LIMIT = 20

export const useDashboardExpiringContractsStore = defineStore('dashboardExpiringContracts', {
  state: () => ({
    data: null as ExpiringContractsData | null,
    selectedPeriod: '30' as ExpiringPeriodKey,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    items: (state): ExpiringContractItem[] => state.data?.items ?? [],
    isEmpty: (state) => !state.loading && (state.data?.items?.length ?? 0) === 0,
    criticalCount: (state) =>
      (state.data?.items ?? []).filter((i) => i.severity === 'critical').length,
  },

  actions: {
    async setPeriod(period: ExpiringPeriodKey) {
      if (this.selectedPeriod === period) return
      this.selectedPeriod = period
      await this.fetchExpiring()
    },

    async fetchExpiring() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const params = new URLSearchParams({
          days: this.selectedPeriod,
          limit: String(DASHBOARD_LIMIT),
        })

        const res = await apiFetch<{
          success?: boolean
          data: ExpiringContractsData
        }>(`${$api.subscriptionExpiringSoon()}?${params.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        this.data = res.data ?? {
          days: Number(this.selectedPeriod),
          total: 0,
          contractCount: 0,
          serviceCount: 0,
          items: [],
        }
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat kontrak/layanan yang akan berakhir'
        this.data = null
      } finally {
        this.loading = false
      }
    },
  },
})
