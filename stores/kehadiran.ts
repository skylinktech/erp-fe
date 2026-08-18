import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export const useKehadiranStore = defineStore('kehadiran', {
  state: () => ({
    loading: false,
    periods: [] as any[],
    schedules: [] as any[],
    summaries: [] as any[],
    dailyRows: [] as any[],
    adjustments: [] as any[],
    totalSummaries: 0,
    totalDaily: 0,
    stats: {
      totalEmployee: 0,
      present: 0,
      absent: 0,
      late: 0,
      paidLeave: 0,
      unpaidLeave: 0,
      overtimeHours: 0,
      overtimeMinutes: 0,
      incomplete: 0,
      period: null as any,
    },
    selectedPeriodId: null as number | null,
    summaryParams: {
      first: 0,
      rows: 10,
      page: 1,
      search: '',
      departemenId: null as number | null,
      exception: null as string | null,
    },
    dailyParams: {
      first: 0,
      rows: 10,
      page: 1,
      pegawaiId: null as number | null,
      attendanceState: null as string | null,
    },
  }),
  actions: {
    async fetchPeriods() {
      try {
        const { $api } = useNuxtApp()
        const res = await apiFetch<{ data: any[] }>($api.kehadiranPeriods(), { credentials: 'include' })
        this.periods = Array.isArray(res.data) ? res.data : []
        if (!this.selectedPeriodId && this.periods.length) {
          this.selectedPeriodId = this.periods[0].id
        }
      } catch (e) {
        this.periods = []
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat periode kehadiran'))
      }
    },
    async fetchSchedules() {
      try {
        const { $api } = useNuxtApp()
        const res = await apiFetch<{ data: any[] }>($api.kehadiranSchedules(), { credentials: 'include' })
        this.schedules = Array.isArray(res.data) ? res.data : []
      } catch (e) {
        this.schedules = []
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat jadwal kerja'))
      }
    },
    async fetchStats() {
      if (!this.selectedPeriodId) return
      try {
        const { $api } = useNuxtApp()
        const res = await apiFetch<{ data: any }>(
          `${$api.kehadiranStats()}?period_id=${this.selectedPeriodId}`,
          { credentials: 'include' }
        )
        this.stats = { ...this.stats, ...(res.data || {}) }
      } catch (e) {
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat statistik kehadiran'))
      }
    },
    async fetchSummaries() {
      if (!this.selectedPeriodId) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const qs = new URLSearchParams()
        qs.set('period_id', String(this.selectedPeriodId))
        qs.set('page', String(this.summaryParams.page))
        qs.set('rows', String(this.summaryParams.rows))
        if (this.summaryParams.search) qs.set('search', this.summaryParams.search)
        if (this.summaryParams.departemenId) qs.set('departemen_id', String(this.summaryParams.departemenId))
        if (this.summaryParams.exception) qs.set('exception', this.summaryParams.exception)
        const res = await apiFetch<{ data: any[]; meta: { total: number } }>(
          `${$api.kehadiranSummary()}?${qs.toString()}`,
          { credentials: 'include' }
        )
        this.summaries = Array.isArray(res.data) ? res.data : []
        this.totalSummaries = res.meta?.total || 0
      } catch (e) {
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat ringkasan kehadiran'))
      } finally {
        this.loading = false
      }
    },
    async fetchDaily() {
      if (!this.selectedPeriodId) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const qs = new URLSearchParams()
        qs.set('period_id', String(this.selectedPeriodId))
        qs.set('page', String(this.dailyParams.page))
        qs.set('rows', String(this.dailyParams.rows))
        if (this.dailyParams.pegawaiId) qs.set('pegawai_id', String(this.dailyParams.pegawaiId))
        if (this.dailyParams.attendanceState) qs.set('attendance_state', this.dailyParams.attendanceState)
        const res = await apiFetch<{ data: any[]; meta: { total: number } }>(
          `${$api.kehadiranRecords()}?${qs.toString()}`,
          { credentials: 'include' }
        )
        this.dailyRows = Array.isArray(res.data) ? res.data : []
        this.totalDaily = res.meta?.total || 0
      } catch (e) {
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat kehadiran harian'))
      } finally {
        this.loading = false
      }
    },
    async fetchAdjustments() {
      if (!this.selectedPeriodId) return
      try {
        const { $api } = useNuxtApp()
        const res = await apiFetch<{ data: any[] }>(
          `${$api.kehadiranAdjustments()}?period_id=${this.selectedPeriodId}`,
          { credentials: 'include' }
        )
        this.adjustments = Array.isArray(res.data) ? res.data : []
      } catch (e) {
        this.adjustments = []
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat adjustment kehadiran'))
      }
    },
    async periodAction(id: number, action: 'calculate' | 'recalculate' | 'finalize', body?: Record<string, string>) {
      const toast = useToast()
      const { $api } = useNuxtApp()
      const url =
        action === 'calculate'
          ? $api.kehadiranPeriodCalculate(id)
          : action === 'recalculate'
            ? $api.kehadiranPeriodRecalculate(id)
            : $api.kehadiranPeriodFinalize(id)
      try {
        await apiFetch(url, { method: 'POST', credentials: 'include', body: body || {} })
        toast.success({ title: 'Berhasil', message: 'Aksi periode berhasil', color: 'green' })
        await this.fetchPeriods()
        await this.fetchStats()
        await this.fetchSummaries()
      } catch (e) {
        toastNormalizedError(normalizeApiError(e, 'Aksi periode gagal'))
      }
    },
    async reopenPeriod(id: number, reason: string) {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        await apiFetch($api.kehadiranPeriodReopen(id), {
          method: 'POST',
          credentials: 'include',
          body: { reason },
        })
        toast.success({ title: 'Berhasil', message: 'Period dibuka kembali', color: 'green' })
        await this.fetchPeriods()
      } catch (e) {
        toastNormalizedError(normalizeApiError(e, 'Gagal reopen'))
      }
    },
    async importFile(file: File) {
      const toast = useToast()
      const { $api } = useNuxtApp()
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await apiFetch<{ data: any }>($api.kehadiranPunchesImport(), {
          method: 'POST',
          credentials: 'include',
          body: fd,
        })
        toast.success({
          title: 'Berhasil',
          message: `Import selesai: ${res.data?.inserted ?? 0} masuk, ${res.data?.duplicate ?? 0} duplikat, ${res.data?.invalid ?? 0} invalid`,
          color: 'green',
        })
        return res.data
      } catch (e) {
        toastNormalizedError(normalizeApiError(e, 'Import gagal'))
        return null
      }
    },
    async createSchedule(payload: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      const res = await apiFetch<{ data: any }>($api.kehadiranScheduleStore(), {
        method: 'POST',
        credentials: 'include',
        body: payload,
      })
      return res.data
    },
    async createScheduleAssignment(payload: {
      pegawai_id: number
      schedule_id: number
      effective_from: string
      effective_to?: string | null
    }) {
      const { $api } = useNuxtApp()
      const res = await apiFetch<{ data: any }>($api.kehadiranScheduleAssignments(), {
        method: 'POST',
        credentials: 'include',
        body: payload,
      })
      return res.data
    },
  },
})
