import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'

export interface LemburRow {
  id: number
  pegawaiId: number
  tanggal: string
  tipeHari: string
  jamMulai: string
  jamSelesai: string
  durasiJam: number
  istirahatMenit: number
  pekerjaan: string
  alasan: string
  status: number
  attachment: string | null
  currentApprovalStep: number | null
  submittedAt: string | null
  rejectReason: string | null
  createdAt: string
  updatedAt: string
  pegawai?: { idPegawai: number; nmPegawai: string; nikPegawai?: string | null } | null
  approvalLogs?: Array<Record<string, any>>
  currentApprovers?: Array<Record<string, any>>
}

export interface LemburWeeklySummary {
  pegawai_id: number
  nm_pegawai: string | null
  minggu_mulai: string
  minggu_selesai: string
  total_jam_minggu: number
  sisa_kuota_minggu: number
  max_jam_hari: number
  max_jam_minggu: number
}

export interface LemburFormModel {
  id: number | null
  pegawai_id: number | null
  tanggal: string
  tipe_hari: string
  jam_mulai: string
  jam_selesai: string
  istirahat_menit: number
  pekerjaan: string
  alasan: string
  attachment: File | null
  attachmentUrl: string | null
  auto_submit: boolean
}

export interface LemburStats {
  total: number
  approved: number
  rejected: number
  menunggu: number
  draft: number
  cancelled: number
  total_jam_disetujui: number
}

function emptyForm(): LemburFormModel {
  return {
    id: null,
    pegawai_id: null,
    tanggal: '',
    tipe_hari: 'hari_kerja',
    jam_mulai: '',
    jam_selesai: '',
    istirahat_menit: 0,
    pekerjaan: '',
    alasan: '',
    attachment: null,
    attachmentUrl: null,
    auto_submit: false,
  }
}

interface LemburState {
  rows: LemburRow[]
  loading: boolean
  totalRecords: number
  workflowConfigured: boolean
  detail: LemburRow | null
  detailLoading: boolean
  params: {
    first: number
    rows: number
    page: number
    sortField: string | null
    sortOrder: number | null
    search: string
    status: number | null
    tipeHari: string | null
    pegawaiId: number | null
    tahun: number | null
  }
  weeklySummary: LemburWeeklySummary | null
  weeklySummaryLoading: boolean
  stats: LemburStats
  statsLoading: boolean
  form: LemburFormModel
  isEditMode: boolean
  saving: boolean
  validationErrors: any[]
}

export const useLemburStore = defineStore('lembur', {
  state: (): LemburState => ({
    rows: [],
    loading: false,
    totalRecords: 0,
    workflowConfigured: false,
    detail: null,
    detailLoading: false,
    params: {
      first: 0,
      rows: 10,
      page: 1,
      sortField: 'createdAt',
      sortOrder: -1,
      search: '',
      status: null,
      tipeHari: null,
      pegawaiId: null,
      tahun: null,
    },
    weeklySummary: null,
    weeklySummaryLoading: false,
    stats: {
      total: 0,
      approved: 0,
      rejected: 0,
      menunggu: 0,
      draft: 0,
      cancelled: 0,
      total_jam_disetujui: 0,
    },
    statsLoading: false,
    form: emptyForm(),
    isEditMode: false,
    saving: false,
    validationErrors: [],
  }),

  actions: {
    async fetchLemburs() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const qs = new URLSearchParams()
        qs.set('page', String(this.params.page))
        qs.set('rows', String(this.params.rows))
        if (this.params.search) qs.set('search', this.params.search)
        if (this.params.status !== null) qs.set('status', String(this.params.status))
        if (this.params.tipeHari) qs.set('tipe_hari', this.params.tipeHari)
        if (this.params.pegawaiId !== null) qs.set('pegawai_id', String(this.params.pegawaiId))
        if (this.params.tahun !== null) qs.set('tahun', String(this.params.tahun))

        const res = await apiFetch<{
          data: LemburRow[]
          workflowConfigured: boolean
          meta: { total: number }
        }>(`${$api.lembur()}?${qs.toString()}`, { credentials: 'include' })

        this.rows = res.data || []
        this.totalRecords = res.meta?.total || 0
        this.workflowConfigured = !!res.workflowConfigured
      } catch (error: any) {
        this.rows = []
        this.totalRecords = 0
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data lembur',
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: number): Promise<LemburRow | null> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.detailLoading = true
      try {
        const res = await apiFetch<{ data: LemburRow }>($api.lemburShow(id), {
          credentials: 'include',
        })
        this.detail = res.data ?? null
        return this.detail
      } catch (error: any) {
        this.detail = null
        toast.error({
          title: 'Error',
          message: error?.data?.message || error?.message || 'Gagal memuat detail lembur',
          color: 'red',
        })
        return null
      } finally {
        this.detailLoading = false
      }
    },

    clearDetail() {
      this.detail = null
    },

    async fetchStats(opts?: { tahun?: number; pegawaiId?: number }) {
      const { $api } = useNuxtApp()
      this.statsLoading = true
      try {
        const qs = new URLSearchParams()
        if (opts?.tahun) qs.set('tahun', String(opts.tahun))
        if (opts?.pegawaiId) qs.set('pegawai_id', String(opts.pegawaiId))
        const url = qs.toString() ? `${$api.lemburStats()}?${qs}` : $api.lemburStats()
        const res = await apiFetch<{ data: LemburStats }>(url, { credentials: 'include' })
        this.stats = res.data || this.stats
      } catch {
        // opsional
      } finally {
        this.statsLoading = false
      }
    },

    async fetchWeeklySummary(tanggal?: string) {
      const { $api } = useNuxtApp()
      this.weeklySummaryLoading = true
      try {
        const qs = tanggal ? `?tanggal=${encodeURIComponent(tanggal)}` : ''
        const res = await apiFetch<{ data: LemburWeeklySummary }>(
          `${$api.lemburSummaryMe()}${qs}`,
          { credentials: 'include' }
        )
        this.weeklySummary = res.data ?? null
        if (res.data?.pegawai_id && !this.form.pegawai_id) {
          this.form.pegawai_id = res.data.pegawai_id
        }
      } catch {
        this.weeklySummary = null
      } finally {
        this.weeklySummaryLoading = false
      }
    },

    openCreate() {
      this.form = emptyForm()
      this.isEditMode = false
      this.validationErrors = []
    },

    openEdit(row: LemburRow) {
      this.form = {
        id: row.id,
        pegawai_id: row.pegawaiId,
        tanggal: (row.tanggal || '').slice(0, 10),
        tipe_hari: row.tipeHari || 'hari_kerja',
        jam_mulai: row.jamMulai ? row.jamMulai.slice(0, 5) : '',
        jam_selesai: row.jamSelesai ? row.jamSelesai.slice(0, 5) : '',
        istirahat_menit: row.istirahatMenit ?? 0,
        pekerjaan: row.pekerjaan || '',
        alasan: row.alasan || '',
        attachment: null,
        attachmentUrl: row.attachment,
        auto_submit: false,
      }
      this.isEditMode = true
      this.validationErrors = []
    },

    async save(): Promise<LemburRow | null> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.saving = true
      this.validationErrors = []
      try {
        const fd = new FormData()
        fd.append('tanggal', this.form.tanggal)
        fd.append('tipe_hari', this.form.tipe_hari)
        fd.append('jam_mulai', this.form.jam_mulai)
        fd.append('jam_selesai', this.form.jam_selesai)
        fd.append('istirahat_menit', String(this.form.istirahat_menit ?? 0))
        fd.append('pekerjaan', this.form.pekerjaan)
        fd.append('alasan', this.form.alasan)
        if (this.form.pegawai_id) fd.append('pegawai_id', String(this.form.pegawai_id))
        if (this.form.attachment instanceof File) fd.append('attachment', this.form.attachment)
        if (!this.isEditMode && this.form.auto_submit) fd.append('auto_submit', '1')

        const url = this.isEditMode ? $api.lemburUpdate(this.form.id!) : $api.lemburStore()
        if (this.isEditMode) fd.append('_method', 'PUT')

        const res = await fetch(url, { method: 'POST', credentials: 'include', body: fd })
        const result = await res.json().catch(() => ({} as any))
        if (!res.ok) {
          if (result?.errors) this.validationErrors = result.errors
          throw new Error(result?.message || 'Gagal menyimpan pengajuan lembur')
        }

        toast.success({
          title: 'Berhasil',
          message: result?.message || (this.isEditMode ? 'Lembur diperbarui' : 'Lembur dibuat'),
          color: 'green',
        })
        await Promise.all([this.fetchLemburs(), this.fetchStats(), this.fetchWeeklySummary(this.form.tanggal)])
        return result?.data as LemburRow
      } catch (error: any) {
        toast.error({ title: 'Error', message: error.message || String(error), color: 'red' })
        return null
      } finally {
        this.saving = false
      }
    },

    async destroy(id: number): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        await apiFetch($api.lemburDelete(id), { method: 'DELETE', credentials: 'include' })
        toast.success({ title: 'Berhasil', message: 'Pengajuan lembur dihapus', color: 'green' })
        await Promise.all([this.fetchLemburs(), this.fetchStats()])
        return true
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.data?.message || error?.message || 'Gagal menghapus',
          color: 'red',
        })
        return false
      }
    },

    async submitForApproval(id: number) {
      return this._workflowAction(id, 'lemburSubmitApproval', 'Pengajuan dikirim untuk persetujuan')
    },
    async approve(id: number, remarks?: string) {
      return this._workflowAction(id, 'lemburApprove', 'Pengajuan disetujui', { remarks })
    },
    async reject(id: number, remarks: string) {
      if (!remarks?.trim()) {
        useToast().error({ title: 'Error', message: 'Alasan penolakan wajib diisi', color: 'red' })
        return false
      }
      return this._workflowAction(id, 'lemburReject', 'Pengajuan ditolak', { remarks })
    },
    async cancelPending(id: number) {
      return this._workflowAction(id, 'lemburCancelPending', 'Pengajuan dibatalkan')
    },

    async _workflowAction(
      id: number,
      apiKey:
        | 'lemburSubmitApproval'
        | 'lemburApprove'
        | 'lemburReject'
        | 'lemburCancelPending',
      successMsg: string,
      payload?: Record<string, any>
    ): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const url = ($api as any)[apiKey](id)
        const res = await apiFetch<any>(url, {
          method: 'POST',
          credentials: 'include',
          body: payload || {},
        })
        toast.success({ title: 'Berhasil', message: res?.message || successMsg, color: 'green' })
        await Promise.all([this.fetchLemburs(), this.fetchStats()])
        return true
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.data?.message || error?.message || 'Aksi gagal',
          color: 'red',
        })
        return false
      }
    },
  },
})
