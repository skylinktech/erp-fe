import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'

/* ------------------------------------------------------------------
 * Type
 * ------------------------------------------------------------------ */
export interface CutiTypeRow {
  id: number
  nmTipeCuti: string
  kodeCuti: string | null
  deskripsi: string | null
  jatahCuti: number
  isPaid: boolean
  isActive: boolean
}

export interface CutiApproverInfo {
  userId: number
  fullName: string
  email: string
  source: 'role' | 'jabatan' | 'user'
}

export interface CutiRow {
  id: number
  cutiTypeId: number
  pegawaiId: number
  tanggalMulai: string
  tanggalSelesai: string
  lamaCuti: number
  alasan: string
  status: number
  approvedBy: number | null
  approval_date: string | null
  alasanDitolak: string | null
  attachment: string | null
  isPerJam: boolean
  durasiJam: number
  jamMulai: string | null
  jamSelesai: string | null
  currentApprovalStep: number | null
  submittedAt: string | null
  rejectReason: string | null
  createdAt: string
  updatedAt: string
  cutiType?: CutiTypeRow | null
  /**
   * Lucid default `CamelCaseNamingStrategy.serializedName` mengubah atribut model
   * (mis. `nm_pegawai`, `id_pegawai`) menjadi camelCase saat di-serialize.
   * Karena itu di response API field-nya `nmPegawai` & `idPegawai`, bukan snake_case.
   */
  pegawai?: { idPegawai: number; nmPegawai: string; userId?: number | null } | null
  approvalLogs?: Array<Record<string, any>>
  currentApprovers?: CutiApproverInfo[]
}

export interface CutiBalanceRow {
  cuti_type: CutiTypeRow
  balance: {
    id: number
    pegawaiId: number
    cuti_type_id: number
    tahun: number
    sisa_jatah_cuti: number
    cuti_terpakai: number
    sisa_cuti_tahun_lalu: number
    valid_sampai: string | null
  }
}

/* ------------------------------------------------------------------
 * Form model untuk create/edit
 * ------------------------------------------------------------------ */
export interface CutiFormModel {
  id: number | null
  cuti_type_id: number | null
  pegawai_id: number | null
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  is_per_jam: boolean
  jam_mulai: string | null
  jam_selesai: string | null
  attachment: File | null
  attachmentUrl: string | null
  auto_submit: boolean
}

function emptyForm(): CutiFormModel {
  return {
    id: null,
    cuti_type_id: null,
    pegawai_id: null,
    tanggalMulai: '',
    tanggalSelesai: '',
    alasan: '',
    is_per_jam: false,
    jam_mulai: null,
    jam_selesai: null,
    attachment: null,
    attachmentUrl: null,
    auto_submit: false,
  }
}

export interface CutiStats {
  total: number
  approved: number
  rejected: number
  menunggu: number
  draft: number
  cancelled: number
}

interface CutiState {
  rows: CutiRow[]
  loading: boolean
  totalRecords: number
  workflowConfigured: boolean
  detail: CutiRow | null
  detailLoading: boolean
  params: {
    first: number
    rows: number
    page: number
    sortField: string | null
    sortOrder: number | null
    search: string
    status: number | null
    cutiTypeId: number | null
    pegawaiId: number | null
    tahun: number | null
  }
  cutiTypes: CutiTypeRow[]
  cutiTypesLoading: boolean
  balances: CutiBalanceRow[]
  balancesLoading: boolean
  stats: CutiStats
  statsLoading: boolean
  form: CutiFormModel
  isEditMode: boolean
  saving: boolean
  validationErrors: any[]
}

export const useCutiStore = defineStore('cuti', {
  state: (): CutiState => ({
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
      cutiTypeId: null,
      pegawaiId: null,
      tahun: null,
    },
    cutiTypes: [],
    cutiTypesLoading: false,
    balances: [],
    balancesLoading: false,
    stats: {
      total: 0,
      approved: 0,
      rejected: 0,
      menunggu: 0,
      draft: 0,
      cancelled: 0,
    },
    statsLoading: false,
    form: emptyForm(),
    isEditMode: false,
    saving: false,
    validationErrors: [],
  }),

  actions: {
    /* -------- LIST -------- */
    async fetchCutis() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const qs = new URLSearchParams()
        qs.set('page', String(this.params.page))
        qs.set('rows', String(this.params.rows))
        if (this.params.search) qs.set('search', this.params.search)
        if (this.params.status !== null) qs.set('status', String(this.params.status))
        if (this.params.cutiTypeId !== null) qs.set('cuti_type_id', String(this.params.cutiTypeId))
        if (this.params.pegawaiId !== null) qs.set('pegawai_id', String(this.params.pegawaiId))
        if (this.params.tahun !== null) qs.set('tahun', String(this.params.tahun))

        const res = await apiFetch<{
          data: CutiRow[]
          workflowConfigured: boolean
          meta: { total: number; page: number; perPage: number; lastPage: number }
        }>(`${$api.cuti()}?${qs.toString()}`, { credentials: 'include' })

        this.rows = res.data || []
        this.totalRecords = res.meta?.total || 0
        this.workflowConfigured = !!res.workflowConfigured
      } catch (error: any) {
        this.rows = []
        this.totalRecords = 0
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data cuti: ${error.message || error}`,
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchCutiTypes() {
      const { $api } = useNuxtApp()
      this.cutiTypesLoading = true
      try {
        const res = await apiFetch<{ data: CutiTypeRow[] }>($api.cutiTypes(), { credentials: 'include' })
        this.cutiTypes = res.data || []
      } catch (e) {
        this.cutiTypes = []
      } finally {
        this.cutiTypesLoading = false
      }
    },

    /**
     * Ambil detail satu pengajuan cuti dengan eager-loaded relations
     * (cutiType, pegawai, approvalLogs.user). Dipakai oleh modal detail.
     */
    async fetchOne(id: number): Promise<CutiRow | null> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.detailLoading = true
      try {
        const res = await apiFetch<{ data: CutiRow; currentApprovers?: any[] }>(
          $api.cutiShow(id),
          { credentials: 'include' }
        )
        const row = res.data
          ? ({ ...res.data, currentApprovers: res.currentApprovers ?? [] } as CutiRow)
          : null
        this.detail = row
        return row
      } catch (error: any) {
        this.detail = null
        toast.error({
          title: 'Error',
          message: error?.data?.message || error?.message || 'Gagal memuat detail cuti',
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

    /**
     * Statistik agregat untuk card summary di halaman list.
     * Default: tahun berjalan. Bisa di-filter ke pegawai tertentu.
     */
    async fetchStats(opts?: { tahun?: number; pegawaiId?: number }) {
      const { $api } = useNuxtApp()
      this.statsLoading = true
      try {
        const qs = new URLSearchParams()
        if (opts?.tahun) qs.set('tahun', String(opts.tahun))
        if (opts?.pegawaiId) qs.set('pegawai_id', String(opts.pegawaiId))
        const url = qs.toString() ? `${$api.cutiStats()}?${qs}` : $api.cutiStats()
        const res = await apiFetch<{ data: CutiStats }>(url, { credentials: 'include' })
        this.stats = res.data || this.stats
      } catch (e) {
        // Stats opsional — tetap silent agar tidak ganggu UX list.
      } finally {
        this.statsLoading = false
      }
    },

    async fetchBalances(pegawaiId: number, tahun?: number) {
      const { $api } = useNuxtApp()
      this.balancesLoading = true
      try {
        const qs = tahun ? `?tahun=${tahun}` : ''
        const res = await apiFetch<{ data: CutiBalanceRow[]; tahun: number }>(
          `${$api.cutiBalance(pegawaiId)}${qs}`,
          { credentials: 'include' }
        )
        this.balances = res.data || []
      } catch (e) {
        this.balances = []
      } finally {
        this.balancesLoading = false
      }
    },

    /* -------- CRUD -------- */
    openCreate() {
      this.form = emptyForm()
      this.isEditMode = false
      this.validationErrors = []
    },

    openEdit(row: CutiRow) {
      this.form = {
        id: row.id,
        cuti_type_id: row.cutiTypeId,
        pegawai_id: row.pegawaiId,
        tanggalMulai: (row.tanggalMulai || '').slice(0, 10),
        tanggalSelesai: (row.tanggalSelesai || '').slice(0, 10),
        alasan: row.alasan || '',
        is_per_jam: !!row.isPerJam,
        jam_mulai: row.jamMulai ? row.jamMulai.slice(0, 5) : null,
        jam_selesai: row.jamSelesai ? row.jamSelesai.slice(0, 5) : null,
        attachment: null,
        attachmentUrl: row.attachment,
        auto_submit: false,
      }
      this.isEditMode = true
      this.validationErrors = []
    },

    async save(): Promise<CutiRow | null> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.saving = true
      this.validationErrors = []
      try {
        const fd = new FormData()
        if (this.form.cuti_type_id) fd.append('cuti_type_id', String(this.form.cuti_type_id))
        fd.append('tanggalMulai', this.form.tanggalMulai)
        fd.append('tanggalSelesai', this.form.tanggalSelesai)
        fd.append('alasan', this.form.alasan)
        if (this.form.is_per_jam) {
          fd.append('is_per_jam', '1')
          if (this.form.jam_mulai) fd.append('jam_mulai', this.form.jam_mulai)
          if (this.form.jam_selesai) fd.append('jam_selesai', this.form.jam_selesai)
        }
        if (this.form.pegawai_id) fd.append('pegawai_id', String(this.form.pegawai_id))
        if (this.form.attachment instanceof File) fd.append('attachment', this.form.attachment)
        if (!this.isEditMode && this.form.auto_submit) fd.append('auto_submit', '1')

        const url = this.isEditMode ? $api.cutiUpdate(this.form.id!) : $api.cutiStore()
        if (this.isEditMode) fd.append('_method', 'PUT')

        const res = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        })
        const result = await res.json().catch(() => ({} as any))
        if (!res.ok) {
          if (result?.errors) this.validationErrors = result.errors
          throw new Error(result?.message || 'Gagal menyimpan pengajuan cuti')
        }
        toast.success({
          title: 'Berhasil',
          message: result?.message || (this.isEditMode ? 'Cuti diperbarui' : 'Cuti dibuat'),
          color: 'green',
        })
        await Promise.all([this.fetchCutis(), this.fetchStats()])
        return result?.data as CutiRow
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error.message || String(error),
          color: 'red',
        })
        return null
      } finally {
        this.saving = false
      }
    },

    async destroy(id: number): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        await apiFetch($api.cutiDelete(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        toast.success({ title: 'Berhasil', message: 'Pengajuan cuti dihapus', color: 'green' })
        await Promise.all([this.fetchCutis(), this.fetchStats()])
        return true
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.data?.message || error?.message || 'Gagal menghapus pengajuan cuti',
          color: 'red',
        })
        return false
      }
    },

    /* -------- WORKFLOW -------- */
    async submitForApproval(id: number): Promise<boolean> {
      return this._workflowAction(id, 'cutiSubmitApproval', 'Pengajuan dikirim untuk persetujuan')
    },
    async approve(id: number, remarks?: string): Promise<boolean> {
      return this._workflowAction(id, 'cutiApprove', 'Pengajuan disetujui', { remarks })
    },
    async reject(id: number, remarks: string): Promise<boolean> {
      if (!remarks?.trim()) {
        useToast().error({ title: 'Error', message: 'Alasan penolakan wajib diisi', color: 'red' })
        return false
      }
      return this._workflowAction(id, 'cutiReject', 'Pengajuan ditolak', { remarks })
    },
    async cancelPending(id: number): Promise<boolean> {
      return this._workflowAction(id, 'cutiCancelPending', 'Pengajuan dibatalkan')
    },
    async cancelDraft(id: number): Promise<boolean> {
      return this._workflowAction(id, 'cutiCancel', 'Draft dibatalkan')
    },

    async _workflowAction(
      id: number,
      apiKey:
        | 'cutiSubmitApproval'
        | 'cutiApprove'
        | 'cutiReject'
        | 'cutiCancelPending'
        | 'cutiCancel',
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
        await Promise.all([this.fetchCutis(), this.fetchStats()])
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
