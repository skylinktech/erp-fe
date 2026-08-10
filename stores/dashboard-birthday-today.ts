import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type BirthdayTodayItem = {
  idPegawai: number
  nmPegawai: string
  avatar: string | null
  tglLahir: string
  age: number | null
  departemen: { id: number; nama: string } | null
  divisi: { id: number; nama: string } | null
}

export type BirthdayTodayData = {
  date: string
  total: number
  items: BirthdayTodayItem[]
}

const DASHBOARD_LIMIT = 20

export const useDashboardBirthdayTodayStore = defineStore('dashboardBirthdayToday', {
  state: () => ({
    data: null as BirthdayTodayData | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    items: (state): BirthdayTodayItem[] => state.data?.items ?? [],
    isEmpty: (state) => !state.loading && (state.data?.items?.length ?? 0) === 0,
  },

  actions: {
    async fetchBirthdays() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const params = new URLSearchParams({
          limit: String(DASHBOARD_LIMIT),
        })

        const res = await apiFetch<{
          success?: boolean
          data: BirthdayTodayData
        }>(`${$api.pegawaiBirthdaysToday()}?${params.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        this.data = res.data ?? {
          date: new Date().toISOString().slice(0, 10),
          total: 0,
          items: [],
        }
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat ulang tahun hari ini'
        this.data = null
      } finally {
        this.loading = false
      }
    },
  },
})
