import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import { enrichCutiBalanceErrorMessage } from '~/utils/cutiBalanceErrors'
import {
  MANUAL_SALDO_COPY,
  allowsManualBalanceProvision,
  annualQuotaLimit,
  normalizeKodeCuti,
} from '~/constants/hrd/cutiBalancePolicy'
import type { CutiBersamaBreakdownItem, CutiTypeRow } from '~/stores/cuti'

export interface CutiBalanceConsumptionFloor {
  approved_leave_days: number
  cuti_bersama_adjustments: number
  cancellation_reversals: number
  minimum_cuti_terpakai: number
}

export interface CutiBalanceRow {
  id: number
  pegawaiId: number
  cuti_type_id: number
  tahun: number
  sisa_jatah_cuti: number
  cuti_terpakai: number
  sisa_cuti_tahun_lalu: number
  valid_sampai: string | null
  jatah_awal: number
  cuti_bersama_total: number
  cuti_pengajuan_terpakai: number
  sisa_tersedia?: number
  pegawai: {
    idPegawai: number
    nmPegawai: string
    nikPegawai: string | null
  } | null
  cutiType: {
    id: number
    nmTipeCuti: string
    kodeCuti: string | null
    jatahCuti: number
  } | null
  breakdown?: CutiBersamaBreakdownItem[]
  consumption_floor?: CutiBalanceConsumptionFloor
}

export interface CutiBalanceFormModel {
  id: number | null
  pegawai_id: number | null
  cuti_type_id: number | null
  tahun: number
  sisa_jatah_cuti: number | null
  cuti_terpakai: number
  sisa_cuti_tahun_lalu: number
  valid_sampai: string
}

export interface PegawaiEligibilityMeta {
  pegawai_id: number
  nm_pegawai: string | null
  status_pegawai: number | null
  status_label: string
  tgl_masuk: string | null
  kontrak_aktif: boolean
  eligible_at: string | null
  tenure_met: boolean
  status_eligible: boolean
  business_today: string | null
  tahun: number
  can_provision_ct: boolean
  can_provision: boolean
  reasons: string[]
}

function emptyForm(): CutiBalanceFormModel {
  return {
    id: null,
    pegawai_id: null,
    cuti_type_id: null,
    tahun: new Date().getFullYear(),
    sisa_jatah_cuti: null,
    cuti_terpakai: 0,
    sisa_cuti_tahun_lalu: 0,
    valid_sampai: `${new Date().getFullYear()}-12-31`,
  }
}

export const CUTI_BALANCE_INELIGIBLE_KONTRAK_MESSAGE =
  'Saldo cuti hanya dapat diisi untuk pegawai yang kontraknya sudah disetujui (aktif). Pegawai tanpa kontrak, masih ditinjau, atau belum disetujui tidak dapat ditambahkan.'

export { MANUAL_SALDO_COPY }

/** Normalisasi ke `YYYY-MM-DD` agar `<input type="date">` dan validator VineJS selaras. */
function toDateOnly(value: string | Date | null | undefined): string | null {
  if (value == null || value === '') return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    const yyyy = value.getFullYear()
    const mm = String(value.getMonth() + 1).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  const s = String(value).trim()
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso) return iso[1]
  const dmy = s.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  return null
}

interface CutiBalanceState {
  rows: CutiBalanceRow[]
  loading: boolean
  totalRecords: number
  detail: CutiBalanceRow | null
  detailLoading: boolean
  params: {
    first: number
    rows: number
    page: number
    sortField: string | null
    sortOrder: number | null
    search: string
    pegawaiId: number | null
    cutiTypeId: number | null
    tahun: number | null
  }
  cutiTypes: CutiTypeRow[]
  pegawaiOptions: Array<{ id: number; label: string }>
  eligibility: PegawaiEligibilityMeta | null
  eligibilityLoading: boolean
  form: CutiBalanceFormModel
  isEditMode: boolean
  showModal: boolean
  showDetailModal: boolean
  saving: boolean
  validationErrors: string[]
  editFloor: CutiBalanceConsumptionFloor | null
}

export const useCutiBalanceStore = defineStore('cuti-balance', {
  state: (): CutiBalanceState => ({
    rows: [],
    loading: false,
    totalRecords: 0,
    detail: null,
    detailLoading: false,
    params: {
      first: 0,
      rows: 10,
      page: 1,
      sortField: 'tahun',
      sortOrder: -1,
      search: '',
      pegawaiId: null,
      cutiTypeId: null,
      tahun: new Date().getFullYear(),
    },
    cutiTypes: [],
    pegawaiOptions: [],
    eligibility: null,
    eligibilityLoading: false,
    form: emptyForm(),
    isEditMode: false,
    showModal: false,
    showDetailModal: false,
    saving: false,
    validationErrors: [],
    editFloor: null,
  }),

  getters: {
    provisionableCutiTypes(state): CutiTypeRow[] {
      return state.cutiTypes.filter((t) => allowsManualBalanceProvision(t.kodeCuti))
    },
    selectedType(state): CutiTypeRow | null {
      return state.cutiTypes.find((t) => t.id === state.form.cuti_type_id) ?? null
    },
    selectedQuotaLimit(): number | null {
      return annualQuotaLimit(this.selectedType?.kodeCuti)
    },
    allocatedPreview(state): number {
      const sisa = Number(state.form.sisa_jatah_cuti ?? 0)
      const terpakai = Number(state.form.cuti_terpakai ?? 0)
      return (Number.isFinite(sisa) ? sisa : 0) + (Number.isFinite(terpakai) ? terpakai : 0)
    },
  },

  actions: {
    async fetchCutiTypes() {
      if (this.cutiTypes.length) return
      const { $api } = useNuxtApp()
      try {
        const res = await apiFetch<{ data: CutiTypeRow[] }>($api.cutiTypes(), {
          credentials: 'include',
        })
        this.cutiTypes = res.data ?? []
      } catch {
        this.cutiTypes = []
      }
    },

    async fetchPegawaiOptions(search = '') {
      const { $api } = useNuxtApp()
      try {
        const base = $api.dataPegawai(undefined, { requireKontrakAktif: true })
        const url = search
          ? `${base}${base.includes('?') ? '&' : '?'}search=${encodeURIComponent(search)}`
          : base
        const res = await fetch(url, { credentials: 'include' })
        const json = await res.json()
        const list = json?.data ?? json ?? []
        this.pegawaiOptions = (Array.isArray(list) ? list : []).map((p: any) => ({
          id: Number(p.id_pegawai ?? p.idPegawai ?? p.id),
          label: `${p.nm_pegawai ?? p.nmPegawai ?? '-'} (${p.nik_pegawai ?? p.nikPegawai ?? p.id_pegawai ?? p.idPegawai ?? ''})`,
        }))
      } catch {
        this.pegawaiOptions = []
      }
    },

    async fetchEligibility(pegawaiId: number, tahun?: number) {
      const { $api } = useNuxtApp()
      this.eligibilityLoading = true
      try {
        const res = await apiFetch<{ data: PegawaiEligibilityMeta }>(
          $api.cutiBalanceEligibility(pegawaiId, tahun ?? this.form.tahun),
          { credentials: 'include' }
        )
        this.eligibility = res.data ?? null
      } catch {
        this.eligibility = null
      } finally {
        this.eligibilityLoading = false
      }
    },

    async fetchRows() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const qs = new URLSearchParams({
          page: String(this.params.page),
          rows: String(this.params.rows),
          search: this.params.search || '',
        })
        if (this.params.sortField) qs.set('sortField', this.params.sortField)
        if (this.params.sortOrder !== null) {
          qs.set('sortOrder', this.params.sortOrder > 0 ? 'asc' : 'desc')
        }
        if (this.params.pegawaiId) qs.set('pegawai_id', String(this.params.pegawaiId))
        if (this.params.cutiTypeId) qs.set('cuti_type_id', String(this.params.cutiTypeId))
        if (this.params.tahun) qs.set('tahun', String(this.params.tahun))

        const res = await apiFetch<{ data: CutiBalanceRow[]; meta: { total: number } }>(
          `${$api.cutiBalanceList()}?${qs.toString()}`,
          { credentials: 'include' }
        )
        this.rows = res.data ?? []
        this.totalRecords = res.meta?.total ?? 0
      } catch (error: any) {
        this.rows = []
        this.totalRecords = 0
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal memuat saldo cuti',
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id: number) {
      const { $api } = useNuxtApp()
      this.detailLoading = true
      try {
        const res = await apiFetch<{ data: CutiBalanceRow }>($api.cutiBalanceShow(id), {
          credentials: 'include',
        })
        this.detail = res.data ?? null
        if (res.data?.consumption_floor) {
          this.editFloor = res.data.consumption_floor
        }
      } catch {
        this.detail = null
      } finally {
        this.detailLoading = false
      }
    },

    openCreate() {
      this.isEditMode = false
      this.validationErrors = []
      this.eligibility = null
      this.editFloor = null
      this.form = emptyForm()
      this.showModal = true
      void this.fetchPegawaiOptions()
    },

    openEdit(row: CutiBalanceRow) {
      this.isEditMode = true
      this.validationErrors = []
      this.eligibility = null
      this.editFloor = row.consumption_floor ?? null
      this.form = {
        id: row.id,
        pegawai_id: row.pegawaiId,
        cuti_type_id: row.cuti_type_id,
        tahun: row.tahun,
        sisa_jatah_cuti: row.sisa_jatah_cuti,
        cuti_terpakai: row.cuti_terpakai,
        sisa_cuti_tahun_lalu: row.sisa_cuti_tahun_lalu,
        valid_sampai: toDateOnly(row.valid_sampai) || `${row.tahun}-12-31`,
      }
      this.showModal = true
      void this.fetchDetail(row.id)
    },

    async openDetail(row: CutiBalanceRow) {
      this.detail = row
      this.showDetailModal = true
      await this.fetchDetail(row.id)
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.validationErrors = []
      this.eligibility = null
      this.editFloor = null
      this.form = emptyForm()
    },

    closeDetailModal() {
      this.showDetailModal = false
      this.detail = null
    },

    buildCreatePayload() {
      return {
        pegawai_id: this.form.pegawai_id,
        cuti_type_id: this.form.cuti_type_id,
        tahun: this.form.tahun,
        sisa_jatah_cuti: Number(this.form.sisa_jatah_cuti),
        cuti_terpakai: Number(this.form.cuti_terpakai ?? 0),
        sisa_cuti_tahun_lalu: Number(this.form.sisa_cuti_tahun_lalu ?? 0),
        valid_sampai: toDateOnly(this.form.valid_sampai),
      }
    },

    buildUpdatePayload() {
      // Identity fields must NOT be sent on PUT (backend rejects as immutable).
      return {
        sisa_jatah_cuti: Number(this.form.sisa_jatah_cuti),
        cuti_terpakai: Number(this.form.cuti_terpakai),
        sisa_cuti_tahun_lalu: Number(this.form.sisa_cuti_tahun_lalu ?? 0),
        valid_sampai: toDateOnly(this.form.valid_sampai),
      }
    },

    async save(): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      if (this.saving) return false
      this.saving = true
      this.validationErrors = []

      if (!this.isEditMode) {
        if (!this.form.pegawai_id) {
          this.validationErrors = ['Pegawai wajib dipilih']
          this.saving = false
          return false
        }
        if (!this.pegawaiOptions.some((p) => p.id === this.form.pegawai_id)) {
          this.validationErrors = [CUTI_BALANCE_INELIGIBLE_KONTRAK_MESSAGE]
          this.saving = false
          return false
        }
        if (!this.form.cuti_type_id) {
          this.validationErrors = ['Tipe cuti wajib dipilih']
          this.saving = false
          return false
        }
        const kode = normalizeKodeCuti(this.selectedType?.kodeCuti)
        if (!allowsManualBalanceProvision(kode)) {
          this.validationErrors = [
            'Tipe CM/CTB tidak memakai saldo manual dan tidak dapat dipilih untuk provisioning.',
          ]
          this.saving = false
          return false
        }
        if (this.form.sisa_jatah_cuti === null || this.form.sisa_jatah_cuti === undefined) {
          this.validationErrors = ['Sisa jatah cuti wajib diisi secara eksplisit']
          this.saving = false
          return false
        }
        if (kode === 'CT' && this.eligibility && !this.eligibility.can_provision_ct) {
          this.validationErrors =
            this.eligibility.reasons.length > 0
              ? this.eligibility.reasons
              : ['Pegawai belum eligible untuk saldo Cuti Tahunan.']
          this.saving = false
          return false
        }
      }

      if (this.isEditMode && this.editFloor) {
        if (Number(this.form.cuti_terpakai) < this.editFloor.minimum_cuti_terpakai) {
          this.validationErrors = [
            `Cuti terpakai tidak boleh lebih kecil dari konsumsi aktual (${this.editFloor.minimum_cuti_terpakai}).`,
          ]
          this.saving = false
          return false
        }
      }

      try {
        const url =
          this.isEditMode && this.form.id
            ? $api.cutiBalanceShow(this.form.id)
            : $api.cutiBalanceList()
        const method = this.isEditMode ? 'PUT' : 'POST'
        const body = this.isEditMode ? this.buildUpdatePayload() : this.buildCreatePayload()

        await apiFetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        })

        toast.success({
          title: 'Berhasil',
          message: this.isEditMode ? 'Saldo cuti diperbarui' : 'Saldo cuti ditambahkan',
          color: 'green',
        })
        this.closeModal()
        await this.fetchRows()
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Saldo Cuti gagal disimpan.')
        err.message = enrichCutiBalanceErrorMessage(err)
        this.validationErrors = err.fieldErrorList.length
          ? err.fieldErrorList.map((e) => e.message)
          : [err.message]
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async destroy(id: number): Promise<boolean> {
      const { $api } = useNuxtApp()
      const result = await Swal.fire({
        title: 'Hapus saldo cuti?',
        text: 'Data saldo cuti akan dihapus permanen. Pastikan tidak ada cuti terpakai.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, hapus',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) return false

      try {
        await apiFetch($api.cutiBalanceShow(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        useToast().success({
          title: 'Berhasil',
          message: 'Saldo cuti dihapus',
          color: 'green',
        })
        await this.fetchRows()
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Saldo Cuti gagal dihapus.')
        err.message = enrichCutiBalanceErrorMessage(err)
        toastNormalizedError(err)
        return false
      }
    },
  },
})
