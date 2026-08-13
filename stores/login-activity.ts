import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type LoginActivityPeriodKey = '7' | '30' | '90'

export type LoginActivityDaily = {
  date: string
  logins: number
  uniqueUsers: number
}

export type LoginActivityPeriod = {
  totalLogins: number
  uniqueUsers: number
  daily: LoginActivityDaily[]
}

export type LoginActivityStats = {
  periods: Record<LoginActivityPeriodKey, LoginActivityPeriod>
  source: string
}

export const useLoginActivityStore = defineStore('loginActivity', {
  state: () => ({
    stats: null as LoginActivityStats | null,
    selectedPeriod: '7' as LoginActivityPeriodKey,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    currentPeriod(state): LoginActivityPeriod | null {
      return state.stats?.periods[state.selectedPeriod] ?? null
    },

    chartLabels(): string[] {
      const daily = this.currentPeriod?.daily ?? []
      return daily.map((item) => {
        const date = new Date(`${item.date}T00:00:00`)
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      })
    },

    chartData() {
      const daily = this.currentPeriod?.daily ?? []

      return {
        labels: this.chartLabels,
        datasets: [
          {
            label: 'Total Login',
            data: daily.map((item) => item.logins),
            borderColor: '#008fec',
            backgroundColor: 'rgba(0, 143, 236, 0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'User Unik',
            data: daily.map((item) => item.uniqueUsers),
            borderColor: '#00ac4f',
            backgroundColor: 'rgba(0, 172, 79, 0.08)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      }
    },

    chartOptions() {
      const period = this.currentPeriod
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
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 14,
            },
          },
          tooltip: {
            callbacks: {
              title: (items: Array<{ dataIndex: number }>) => {
                const index = items[0]?.dataIndex ?? 0
                const date = period?.daily[index]?.date
                if (!date) return ''
                return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              },
            },
          },
        },
        layout: {
          padding: { top: 0, bottom: 0 },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: selectedPeriod === '7' ? 7 : selectedPeriod === '30' ? 10 : 12,
              padding: 4,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              padding: 4,
            },
          },
        },
      }
    },
  },

  actions: {
    setPeriod(period: LoginActivityPeriodKey) {
      this.selectedPeriod = period
    },

    async fetchLoginActivity() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()

        const response = await apiFetch<{ success: boolean; data: LoginActivityStats }>(
          $api.userSessionsLoginActivity(),
          {
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
        this.error = error.message || 'Gagal mengambil data login activity'
      } finally {
        this.loading = false
      }
    },
  },
})
