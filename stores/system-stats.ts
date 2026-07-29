import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type SystemStats = {
  cpu: { percent: number }
  ram: { usedGb: number; totalGb: number; percent: number }
  disk: { percent: number }
  redis: { memoryMb: number; available: boolean }
  queue: { waiting: number; available: boolean }
  workers: { online: number; available: boolean }
  api: { latencyMs: number }
  collectedAt: string
}

export const useSystemStatsStore = defineStore('systemStats', {
  state: () => ({
    stats: null as SystemStats | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchSystemStats() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const response = await apiFetch<{ success: boolean; data: SystemStats }>($api.systemStats(), {
          credentials: 'include',
          skip403Redirect: true,
        })

        if (response.success && response.data) {
          this.stats = response.data
        } else {
          this.error = 'Response tidak berhasil'
        }
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat statistik sistem'
        this.stats = null
      } finally {
        this.loading = false
      }
    },
  },
})
