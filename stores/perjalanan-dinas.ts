import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface PerjalananDinasRow {
  id: string
  nomorSppd: string
  pegawaiId: number
  kotaAsal: string
  kotaTujuan: string
  provinsiTujuan: string | null
  jenisPerjalanan: string
  kendaraan: string
  tanggalBerangkat: string
  tanggalKembali: string
  lamaHari: number
  keperluan: string
  namaKegiatan: string | null
  uangHarianSatuan: number
  uangHarianTotal: number
  biayaTransport: number
  biayaAkomodasi: number
  biayaRepresentasi: number
  biayaLainnya: number
  totalBiaya: number
  mataUang: string
  attachment: string | null
  status: number
  currentApprovalStep: number | null
  submittedAt: string | null
  rejectReason: string | null
  createdAt: string
  updatedAt: string
  pegawai?: { idPegawai: number; nmPegawai: string; nikPegawai?: string | null } | null
  approvalLogs?: Array<Record<string, any>>
  currentApprovers?: Array<Record<string, any>>
}

export interface PerjalananDinasFormModel {
  id: string | null
  pegawai_id: number | null
  kota_asal: string
  kota_tujuan: string
  provinsi_tujuan: string
  jenis_perjalanan: string
  kendaraan: string
  tanggal_berangkat: string
  tanggal_kembali: string
  keperluan: string
  nama_kegiatan: string
  uang_harian_satuan: number | null
  biaya_transport: number
  biaya_akomodasi: number
  biaya_representasi: number
  biaya_lainnya: number
  mata_uang: string
  attachment: File | null
  attachmentUrl: string | null
  auto_submit: boolean
}

export interface PerjalananDinasStats {
  total: number
  approved: number
  rejected: number
  menunggu: number
  draft: number
  cancelled: number
  total_biaya_disetujui: number
}

function emptyForm(): PerjalananDinasFormModel {
  return {
    id: null,
    pegawai_id: null,
    kota_asal: '',
    kota_tujuan: '',
    provinsi_tujuan: '',
    jenis_perjalanan: 'luar_kota',
    kendaraan: 'pesawat',
    tanggal_berangkat: '',
    tanggal_kembali: '',
    keperluan: '',
    nama_kegiatan: '',
    uang_harian_satuan: null,
    biaya_transport: 0,
    biaya_akomodasi: 0,
    biaya_representasi: 0,
    biaya_lainnya: 0,
    mata_uang: 'IDR',
    attachment: null,
    attachmentUrl: null,
    auto_submit: false,
  }
}

interface PerjalananDinasState {
  rows: PerjalananDinasRow[]
  loading: boolean
  totalRecords: number
  workflowConfigured: boolean
  detail: PerjalananDinasRow | null
  detailLoading: boolean
  params: {
    first: number
    rows: number
    page: number
    sortField: string | null
    sortOrder: number | null
    search: string
    status: number | null
    jenisPerjalanan: string | null
    pegawaiId: number | null
    tahun: number | null
  }
  stats: PerjalananDinasStats
  statsLoading: boolean
  form: PerjalananDinasFormModel
  isEditMode: boolean
  saving: boolean
  validationErrors: any[]
}

export const usePerjalananDinasStore = defineStore('perjalanan-dinas', {
  state: (): PerjalananDinasState => ({
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
      jenisPerjalanan: null,
      pegawaiId: null,
      tahun: null,
    },
    stats: {
      total: 0,
      approved: 0,
      rejected: 0,
      menunggu: 0,
      draft: 0,
      cancelled: 0,
      total_biaya_disetujui: 0,
    },
    statsLoading: false,
    form: emptyForm(),
    isEditMode: false,
    saving: false,
    validationErrors: [],
  }),

  actions: {
    async fetchList() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const qs = new URLSearchParams()
        qs.set('page', String(this.params.page))
        qs.set('rows', String(this.params.rows))
        if (this.params.search) qs.set('search', this.params.search)
        if (this.params.status !== null) qs.set('status', String(this.params.status))
        if (this.params.jenisPerjalanan) qs.set('jenis_perjalanan', this.params.jenisPerjalanan)
        if (this.params.pegawaiId !== null) qs.set('pegawai_id', String(this.params.pegawaiId))
        if (this.params.tahun !== null) qs.set('tahun', String(this.params.tahun))

        const res = await apiFetch<{
          data: PerjalananDinasRow[]
          workflowConfigured: boolean
          meta: { total: number }
        }>(`${$api.perjalananDinas()}?${qs.toString()}`, { credentials: 'include' })

        this.rows = res.data || []
        this.totalRecords = res.meta?.total || 0
        this.workflowConfigured = !!res.workflowConfigured
      } catch (error: any) {
        this.rows = []
        this.totalRecords = 0
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data perjalanan dinas',
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string): Promise<PerjalananDinasRow | null> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.detailLoading = true
      try {
        const res = await apiFetch<{ data: PerjalananDinasRow }>($api.perjalananDinasShow(id), {
          credentials: 'include',
        })
        this.detail = res.data ?? null
        return this.detail
      } catch (error: any) {
        this.detail = null
        toast.error({
          title: 'Error',
          message: error?.data?.message || error?.message || 'Gagal memuat detail perjalanan dinas',
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
        const url = qs.toString() ? `${$api.perjalananDinasStats()}?${qs}` : $api.perjalananDinasStats()
        const res = await apiFetch<{ data: PerjalananDinasStats }>(url, { credentials: 'include' })
        this.stats = res.data || this.stats
      } catch {
        // opsional
      } finally {
        this.statsLoading = false
      }
    },

    openCreate() {
      this.form = emptyForm()
      this.isEditMode = false
      this.validationErrors = []
    },

    openEdit(row: PerjalananDinasRow) {
      this.form = {
        id: row.id,
        pegawai_id: row.pegawaiId,
        kota_asal: row.kotaAsal || '',
        kota_tujuan: row.kotaTujuan || '',
        provinsi_tujuan: row.provinsiTujuan || '',
        jenis_perjalanan: row.jenisPerjalanan || 'luar_kota',
        kendaraan: row.kendaraan || 'pesawat',
        tanggal_berangkat: (row.tanggalBerangkat || '').slice(0, 10),
        tanggal_kembali: (row.tanggalKembali || '').slice(0, 10),
        keperluan: row.keperluan || '',
        nama_kegiatan: row.namaKegiatan || '',
        uang_harian_satuan: row.uangHarianSatuan ?? null,
        biaya_transport: row.biayaTransport ?? 0,
        biaya_akomodasi: row.biayaAkomodasi ?? 0,
        biaya_representasi: row.biayaRepresentasi ?? 0,
        biaya_lainnya: row.biayaLainnya ?? 0,
        mata_uang: row.mataUang || 'IDR',
        attachment: null,
        attachmentUrl: row.attachment,
        auto_submit: false,
      }
      this.isEditMode = true
      this.validationErrors = []
    },

    async save(): Promise<PerjalananDinasRow | null> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.saving = true
      this.validationErrors = []
      try {
        const fd = new FormData()
        fd.append('kota_asal', this.form.kota_asal)
        fd.append('kota_tujuan', this.form.kota_tujuan)
        if (this.form.provinsi_tujuan) fd.append('provinsi_tujuan', this.form.provinsi_tujuan)
        fd.append('jenis_perjalanan', this.form.jenis_perjalanan)
        fd.append('kendaraan', this.form.kendaraan)
        fd.append('tanggal_berangkat', this.form.tanggal_berangkat)
        fd.append('tanggal_kembali', this.form.tanggal_kembali)
        fd.append('keperluan', this.form.keperluan)
        if (this.form.nama_kegiatan) fd.append('nama_kegiatan', this.form.nama_kegiatan)
        if (this.form.uang_harian_satuan != null) {
          fd.append('uang_harian_satuan', String(this.form.uang_harian_satuan))
        }
        fd.append('biaya_transport', String(this.form.biaya_transport ?? 0))
        fd.append('biaya_akomodasi', String(this.form.biaya_akomodasi ?? 0))
        fd.append('biaya_representasi', String(this.form.biaya_representasi ?? 0))
        fd.append('biaya_lainnya', String(this.form.biaya_lainnya ?? 0))
        fd.append('mata_uang', this.form.mata_uang || 'IDR')
        if (this.form.pegawai_id) fd.append('pegawai_id', String(this.form.pegawai_id))
        if (this.form.attachment instanceof File) fd.append('attachment', this.form.attachment)
        if (!this.isEditMode && this.form.auto_submit) fd.append('auto_submit', '1')

        const url = this.isEditMode
          ? $api.perjalananDinasUpdate(this.form.id!)
          : $api.perjalananDinasStore()

        const res = await fetch(url, {
          method: this.isEditMode ? 'PUT' : 'POST',
          credentials: 'include',
          body: fd,
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(
            res,
            this.isEditMode ? 'Perjalanan Dinas gagal diperbarui.' : 'Perjalanan Dinas gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return null
        }
        const result = await res.json().catch(() => ({} as any))

        toast.success({
          title: 'Berhasil',
          message:
            result?.message ||
            (this.isEditMode ? 'Perjalanan dinas diperbarui' : 'Perjalanan dinas dibuat'),
          color: 'green',
        })
        await Promise.all([this.fetchList(), this.fetchStats()])
        return result?.data as PerjalananDinasRow
      } catch (error: any) {
        const err = normalizeApiError(error, 'Perjalanan Dinas gagal disimpan.')
        toastNormalizedError(err)
        return null
      } finally {
        this.saving = false
      }
    },

    async destroy(id: string): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        await apiFetch($api.perjalananDinasDelete(id), { method: 'DELETE', credentials: 'include' })
        toast.success({ title: 'Berhasil', message: 'Pengajuan perjalanan dinas dihapus', color: 'green' })
        await Promise.all([this.fetchList(), this.fetchStats()])
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Perjalanan Dinas gagal dihapus.')
        toastNormalizedError(err)
        return false
      }
    },

    async submitForApproval(id: string) {
      return this._workflowAction(id, 'perjalananDinasSubmitApproval', 'Pengajuan dikirim untuk persetujuan')
    },
    async approve(id: string, remarks?: string) {
      return this._workflowAction(id, 'perjalananDinasApprove', 'Pengajuan disetujui', { remarks })
    },
    async reject(id: string, remarks: string) {
      if (!remarks?.trim()) {
        useToast().error({ title: 'Error', message: 'Alasan penolakan wajib diisi', color: 'red' })
        return false
      }
      return this._workflowAction(id, 'perjalananDinasReject', 'Pengajuan ditolak', { remarks })
    },
    async cancelPending(id: string) {
      return this._workflowAction(id, 'perjalananDinasCancelPending', 'Pengajuan dibatalkan')
    },

    async _workflowAction(
      id: string,
      apiKey:
        | 'perjalananDinasSubmitApproval'
        | 'perjalananDinasApprove'
        | 'perjalananDinasReject'
        | 'perjalananDinasCancelPending',
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
        await Promise.all([this.fetchList(), this.fetchStats()])
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Perjalanan Dinas gagal diproses.')
        toastNormalizedError(err)
        return false
      }
    },
  },
})
