import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type RevenuePeriodKey = '6' | '12' | '24'

export type RevenueMonthRow = {
  month: string
  label: string
  total: number
  invoiceCount: number
}

export type RevenueStats = {
  months: number
  totalRevenue: number
  invoiceCount: number
  averagePerMonth: number
  monthly: RevenueMonthRow[]
  currency: 'IDR'
}

function formatIdr(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export const useRevenueStore = defineStore('revenue', {
  state: () => ({
    stats: null as RevenueStats | null,
    selectedPeriod: '12' as RevenuePeriodKey,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    formattedTotalRevenue(): string {
      return formatIdr(this.stats?.totalRevenue ?? 0)
    },

    formattedAveragePerMonth(): string {
      return formatIdr(this.stats?.averagePerMonth ?? 0)
    },

    chartData() {
      const monthly = this.stats?.monthly ?? []
      return {
        labels: monthly.map((row) => row.label),
        datasets: [
          {
            label: 'Revenue',
            data: monthly.map((row) => row.total),
            borderColor: '#696cff',
            backgroundColor: 'rgba(105, 108, 255, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      }
    },

    chartOptions() {
      const monthly = this.stats?.monthly ?? []
      const selectedPeriod = this.selectedPeriod

      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (ctx: { raw: number }) => formatIdr(Number(ctx.raw) || 0),
              afterLabel: (ctx: { dataIndex: number }) => {
                const count = monthly[ctx.dataIndex]?.invoiceCount ?? 0
                return `${count} invoice`
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: selectedPeriod === '6' ? 6 : selectedPeriod === '12' ? 12 : 12,
              padding: 4,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              padding: 4,
              callback: (value: number | string) => {
                const n = Number(value) || 0
                if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
                if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
                if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
                return String(n)
              },
            },
          },
        },
      }
    },
  },

  actions: {
    setPeriod(period: RevenuePeriodKey) {
      if (this.selectedPeriod === period) return
      this.selectedPeriod = period
      void this.fetchRevenue()
    },

    async fetchRevenue() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const response = await apiFetch<{ success: boolean; data: RevenueStats }>(
          $api.financeRevenue(),
          {
            query: { months: this.selectedPeriod },
            credentials: 'include',
            skip403Redirect: true,
          }
        )

        if (response.success && response.data) {
          this.stats = response.data
        } else {
          this.error = 'Response tidak berhasil'
        }
      } catch (error: any) {
        this.error = error.message || 'Gagal mengambil data revenue'
      } finally {
        this.loading = false
      }
    },
  },
})
