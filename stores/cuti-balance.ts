import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import type { CutiBersamaBreakdownItem, CutiTypeRow } from '~/stores/cuti'

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
}

export interface CutiBalanceFormModel {
  id: number | null
  pegawai_id: number | null
  cuti_type_id: number | null
  tahun: number
  sisa_jatah_cuti: number
  cuti_terpakai: number
  sisa_cuti_tahun_lalu: number
  valid_sampai: string
  auto_prorata: boolean
}

function emptyForm(): CutiBalanceFormModel {
  return {
    id: null,
    pegawai_id: null,
    cuti_type_id: null,
    tahun: new Date().getFullYear(),
    sisa_jatah_cuti: 0,
    cuti_terpakai: 0,
    sisa_cuti_tahun_lalu: 0,
    valid_sampai: `${new Date().getFullYear()}-12-31`,
    auto_prorata: true,
  }
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
  form: CutiBalanceFormModel
  isEditMode: boolean
  showModal: boolean
  showDetailModal: boolean
  saving: boolean
  validationErrors: string[]
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
    form: emptyForm(),
    isEditMode: false,
    showModal: false,
    showDetailModal: false,
    saving: false,
    validationErrors: [],
  }),

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
        const qs = search ? `?search=${encodeURIComponent(search)}` : ''
        const res = await fetch(`${$api.dataPegawai()}${qs}`, { credentials: 'include' })
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
      } catch {
        this.detail = null
      } finally {
        this.detailLoading = false
      }
    },

    openCreate() {
      this.isEditMode = false
      this.validationErrors = []
      this.form = emptyForm()
      this.showModal = true
      void this.fetchPegawaiOptions()
    },

    openEdit(row: CutiBalanceRow) {
      this.isEditMode = true
      this.validationErrors = []
      this.form = {
        id: row.id,
        pegawai_id: row.pegawaiId,
        cuti_type_id: row.cuti_type_id,
        tahun: row.tahun,
        sisa_jatah_cuti: row.sisa_jatah_cuti,
        cuti_terpakai: row.cuti_terpakai,
        sisa_cuti_tahun_lalu: row.sisa_cuti_tahun_lalu,
        valid_sampai: row.valid_sampai || `${row.tahun}-12-31`,
        auto_prorata: false,
      }
      this.showModal = true
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
      this.form = emptyForm()
    },

    closeDetailModal() {
      this.showDetailModal = false
      this.detail = null
    },

    async save(): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.saving = true
      this.validationErrors = []

      if (!this.isEditMode) {
        if (!this.form.pegawai_id) {
          this.validationErrors = ['Pegawai wajib dipilih']
          this.saving = false
          return false
        }
        if (!this.form.cuti_type_id) {
          this.validationErrors = ['Tipe cuti wajib dipilih']
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

        const body = this.isEditMode
          ? {
              sisa_jatah_cuti: this.form.sisa_jatah_cuti,
              cuti_terpakai: this.form.cuti_terpakai,
              sisa_cuti_tahun_lalu: this.form.sisa_cuti_tahun_lalu,
              valid_sampai: this.form.valid_sampai || null,
            }
          : {
              pegawai_id: this.form.pegawai_id,
              cuti_type_id: this.form.cuti_type_id,
              tahun: this.form.tahun,
              sisa_jatah_cuti: this.form.auto_prorata ? undefined : this.form.sisa_jatah_cuti,
              cuti_terpakai: this.form.cuti_terpakai,
              sisa_cuti_tahun_lalu: this.form.sisa_cuti_tahun_lalu,
              valid_sampai: this.form.valid_sampai || null,
              auto_prorata: this.form.auto_prorata,
            }

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
        this.validationErrors = err.fieldErrorList
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
        confirmButtonColor: '#d33',
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
        toastNormalizedError(err)
        return false
      }
    },
  },
})
