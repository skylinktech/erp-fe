import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export type BeritaAcaraStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed'

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface BeritaAcaraItem {
  id?: number
  pid: string
  lokasi: string
  bandwidth?: string | null
  uptimeStatus?: string | null
  uptime_status?: string | null
  averagePing?: number | null
  average_ping?: number | null
  keterangan?: string | null
  sortOrder?: number
  sort_order?: number
}

export interface BeritaAcara {
  id: number
  documentNo?: string
  document_no?: string
  documentDate?: string
  document_date?: string
  customerId?: number | null
  customer_id?: number | null
  contractNo?: string | null
  contract_no?: string | null
  periodStart?: string
  period_start?: string
  periodEnd?: string
  period_end?: string
  partnerName?: string | null
  partner_name?: string | null
  notes?: string | null
  status: BeritaAcaraStatus
  approvalStatus?: string | null
  rejectionReason?: string | null
  approvedAt?: string | null
  currentApprovalStep?: number | null
  submittedAt?: string | null
  sentAt?: string | null
  sent_at?: string | null
  requestedBy?: number | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
  requestedByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  customer?: { id: number; name: string; email?: string; phone?: string; code?: string }
  items?: BeritaAcaraItem[]
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  nextApprovalStep?: number | null
}

interface BeritaAcaraState {
  beritaAcaras: BeritaAcara[]
  beritaAcara: BeritaAcara | null
  loading: boolean
  saving: boolean
  sending: boolean
  error: any
  validationErrors: any[]
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    status?: string | null
    customerId?: number | null
  }
  form: {
    id?: number | null
    status?: BeritaAcaraStatus
    documentDate: string
    customerId: number | null
    contractNo: string
    periodStart: string
    periodEnd: string
    partnerName: string
    notes: string
    items: BeritaAcaraItem[]
  }
  statistics: {
    total: number
    draft: number
    pending: number
    approved: number
    rejected: number
    completed: number
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyItem(): BeritaAcaraItem {
  return {
    pid: '',
    lokasi: '',
    bandwidth: '',
    uptimeStatus: '100%',
    averagePing: null,
    keterangan: '',
  }
}

function emptyForm(): BeritaAcaraState['form'] {
  return {
    status: 'draft',
    documentDate: todayIso(),
    customerId: null,
    contractNo: '',
    periodStart: todayIso(),
    periodEnd: todayIso(),
    partnerName: 'SKYLINK',
    notes: 'SLA 99%',
    items: [emptyItem()],
  }
}

export const useBeritaAcaraStore = defineStore('beritaAcara', {
  state: (): BeritaAcaraState => ({
    beritaAcaras: [],
    beritaAcara: null,
    loading: false,
    saving: false,
    sending: false,
    error: null,
    validationErrors: [],
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      status: null,
      customerId: null,
    },
    form: emptyForm(),
    statistics: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    },
  }),

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: () => $api.beritaAcara(),
        details: (id: number | string) => $api.getBeritaAcaraDetails(id),
        statistics: () => $api.beritaAcaraStatistics(),
        submit: (id: number | string) => $api.submitBeritaAcara(id),
        approve: (id: number | string) => $api.approveBeritaAcara(id),
        reject: (id: number | string) => $api.rejectBeritaAcara(id),
        complete: (id: number | string) => $api.completeBeritaAcara(id),
        send: (id: number | string) => $api.beritaAcaraSend(id),
        sendBulk: () => $api.beritaAcaraSendBulk(),
      }
    },

    async fetchBeritaAcaras(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const api = this.apiEndpoints()
      try {
        const url = new URL(api.list())
        const sp = new URLSearchParams({
          page: String(Math.floor(this.params.first / this.params.rows) + 1),
          rows: String(this.params.rows),
          sortField: this.params.sortField || '',
          sortOrder: String(this.params.sortOrder ?? ''),
          draw: String(this.params.draw),
          search: this.params.search || '',
        })
        if (this.params.status) sp.append('status', this.params.status)
        if (this.params.customerId) sp.append('customerId', String(this.params.customerId))
        url.search = sp.toString()

        const res = await fetch(String(url), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Gagal mengambil data Berita Acara')
        const json = await res.json()
        this.beritaAcaras = json.data ?? []
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        this.error = e
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: e.message,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
        }
      } finally {
        this.loading = false
      }
    },

    async getBeritaAcaraDetails(id: number | string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.details(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (res?.data) this.beritaAcara = res.data
        else if (res?.id) this.beritaAcara = res
      } finally {
        this.loading = false
      }
    },

    async saveBeritaAcara(): Promise<boolean | number> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      const isEdit = !!(this.form as any).id
      const body: Record<string, any> = {
        documentDate: this.form.documentDate || todayIso(),
        customerId: this.form.customerId,
        contractNo: this.form.contractNo?.trim() || null,
        periodStart: this.form.periodStart,
        periodEnd: this.form.periodEnd,
        partnerName: this.form.partnerName?.trim() || 'SKYLINK',
        notes: this.form.notes?.trim() || null,
        items: (this.form.items || []).map((item, idx) => ({
          pid: item.pid?.trim(),
          lokasi: item.lokasi?.trim(),
          bandwidth: item.bandwidth?.trim() || null,
          uptimeStatus: item.uptimeStatus?.trim() || item.uptime_status?.trim() || null,
          averagePing:
            item.averagePing != null && item.averagePing !== ('' as any)
              ? Number(item.averagePing)
              : item.average_ping != null
                ? Number(item.average_ping)
                : null,
          keterangan: item.keterangan?.trim() || null,
          sortOrder: item.sortOrder ?? item.sort_order ?? idx,
        })),
        createdBy: isEdit ? undefined : (userStore.user?.id ?? null),
      }

      const url = isEdit ? `${api.list()}/${(this.form as any).id}` : api.list()
      const method = isEdit ? 'PUT' : 'POST'

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(
            res,
            isEdit ? 'Berita Acara gagal diperbarui.' : 'Berita Acara gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        const result = await res.json()
        toast.success({
          title: 'Sukses',
          message: `Berita Acara berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return result?.data?.id ?? true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Berita Acara gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteBeritaAcara(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const ok = await Swal.fire({
        title: 'Yakin?',
        text: 'Berita Acara akan dihapus (soft delete).',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus',
        cancelButtonText: 'Batal',
      })
      if (!ok.isConfirmed) {
        this.loading = false
        return
      }
      try {
        const res = await fetch(`${api.list()}/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Berita Acara gagal dihapus.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchBeritaAcaras()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Berita Acara dihapus',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (e: any) {
        const err = normalizeApiError(e, 'Berita Acara gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async submitBeritaAcara(id: number | string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.submit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Berita Acara gagal disubmit.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchBeritaAcaras()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Berita Acara berhasil di-submit',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Berita Acara gagal disubmit.')
        toastNormalizedError(err)
        return false
      }
    },

    async approveBeritaAcara(id: number | string, remarks?: string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()

      const result = await Swal.fire({
        title: 'Approve Berita Acara',
        text: 'Apakah Anda yakin akan menyetujui Berita Acara ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Approve',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) return false

      try {
        const res = await fetch(api.approve(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks }),
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Berita Acara gagal disetujui.')
          toastNormalizedError(err)
          return false
        }
        const json = await res.json().catch(() => ({}))
        await this.fetchBeritaAcaras()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: json.message || 'Berita Acara berhasil diapprove',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Berita Acara gagal disetujui.')
        toastNormalizedError(err)
        return false
      }
    },

    async rejectBeritaAcara(id: number | string, reason: string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.reject(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rejection_reason: reason }),
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Berita Acara gagal ditolak.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchBeritaAcaras()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Berita Acara ditolak',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Berita Acara gagal ditolak.')
        toastNormalizedError(err)
        return false
      }
    },

    async markCompleted(id: number | string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.complete(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Berita Acara gagal diselesaikan.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchBeritaAcaras()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Berita Acara ditandai selesai',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Berita Acara gagal diselesaikan.')
        toastNormalizedError(err)
        return false
      }
    },

    applySentAt(id: number | string, sentAt: string) {
      const numId = Number(id)
      if (this.beritaAcara && Number(this.beritaAcara.id) === numId) {
        this.beritaAcara = { ...this.beritaAcara, sentAt }
      }
      const idx = this.beritaAcaras.findIndex((row) => Number(row.id) === numId)
      if (idx !== -1) {
        this.beritaAcaras[idx] = { ...this.beritaAcaras[idx], sentAt }
      }
    },

    async sendBeritaAcara(id: number | string): Promise<boolean> {
      this.sending = true
      const api = this.apiEndpoints()

      const confirm = await Swal.fire({
        title: 'Kirim Berita Acara?',
        text: 'Berita Acara akan dikirim ke email customer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) {
        this.sending = false
        return false
      }

      try {
        const response = await fetch(api.send(id), {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Berita Acara gagal dikirim.')
          toastNormalizedError(err)
          return false
        }
        const result = await response.json().catch(() => ({}))

        const sentAt = result.data?.sentAt || new Date().toISOString()
        this.applySentAt(id, sentAt)

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Berita Acara berhasil dikirim',
          color: 'green',
          position: 'bottomRight',
        })
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Berita Acara gagal dikirim.')
        toastNormalizedError(err)
        return false
      } finally {
        this.sending = false
      }
    },

    /**
     * Bulk send — satu request API, partial success ditampilkan ke user.
     */
    async sendBeritaAcarasBulk(ids: Array<number | string>) {
      const uniqueIds = [
        ...new Set(
          (ids || [])
            .map((id) => Number(id))
            .filter((n) => Number.isFinite(n) && n > 0)
        ),
      ]
      if (!uniqueIds.length) {
        useToast().error({
          title: 'Error',
          message: 'Pilih minimal 1 Berita Acara',
          color: 'red',
          position: 'bottomRight',
        })
        return null
      }
      if (uniqueIds.length > 50) {
        useToast().error({
          title: 'Error',
          message: 'Maksimal 50 Berita Acara per bulk send',
          color: 'red',
          position: 'bottomRight',
        })
        return null
      }

      this.sending = true
      const api = this.apiEndpoints()

      const confirm = await Swal.fire({
        title: 'Kirim Berita Acara Terpilih?',
        html: `${uniqueIds.length} Berita Acara akan dikirim ke email customer masing-masing.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) {
        this.sending = false
        return null
      }

      try {
        const response = await fetch(api.sendBulk(), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ ids: uniqueIds }),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}`)
        }

        const data = result.data || {}
        const results = Array.isArray(data.results) ? data.results : []

        for (const row of results) {
          if (!row?.ok || !row.id) continue
          this.applySentAt(row.id, row.sentAt || new Date().toISOString())
        }

        const failedRows = results.filter((r: any) => !r.ok)
        if (failedRows.length && data.success > 0) {
          const failList = failedRows
            .slice(0, 5)
            .map((r: any) => `${r.documentNo || r.id}: ${r.error || 'gagal'}`)
            .join('<br>')
          await Swal.fire({
            title: 'Sebagian berhasil',
            html: `${data.success} terkirim, ${data.failed} gagal.<br><br>${failList}`,
            icon: 'warning',
          })
        } else if (failedRows.length && !data.success) {
          const failList = failedRows
            .slice(0, 5)
            .map((r: any) => `${r.documentNo || r.id}: ${r.error || 'gagal'}`)
            .join('<br>')
          await Swal.fire({
            title: 'Gagal mengirim',
            html: failList || result.message || 'Semua Berita Acara gagal dikirim',
            icon: 'error',
          })
        } else {
          useToast().success({
            title: 'Berhasil',
            message: result.message || `${data.success || uniqueIds.length} Berita Acara terkirim`,
            color: 'green',
            position: 'bottomRight',
          })
        }

        return data
      } catch (error: any) {
        const err = normalizeApiError(error, 'Berita Acara gagal dikirim.')
        toastNormalizedError(err)
        return null
      } finally {
        this.sending = false
      }
    },

    openForm(data: BeritaAcara | null = null) {
      if (data) {
        const raw = data as any
        const items = (raw.items || []).map((item: any) => ({
          id: item.id,
          pid: item.pid ?? '',
          lokasi: item.lokasi ?? '',
          bandwidth: item.bandwidth ?? '',
          uptimeStatus: item.uptimeStatus ?? item.uptime_status ?? '',
          averagePing:
            item.averagePing != null
              ? Number(item.averagePing)
              : item.average_ping != null
                ? Number(item.average_ping)
                : null,
          keterangan: item.keterangan ?? '',
          sortOrder: item.sortOrder ?? item.sort_order ?? 0,
        }))
        this.form = {
          id: raw.id,
          status: raw.status ?? 'draft',
          documentDate: (raw.documentDate ?? raw.document_date ?? todayIso()).toString().slice(0, 10),
          customerId: raw.customerId ?? raw.customer_id ?? null,
          contractNo: raw.contractNo ?? raw.contract_no ?? '',
          periodStart: (raw.periodStart ?? raw.period_start ?? todayIso()).toString().slice(0, 10),
          periodEnd: (raw.periodEnd ?? raw.period_end ?? todayIso()).toString().slice(0, 10),
          partnerName: raw.partnerName ?? raw.partner_name ?? 'SKYLINK',
          notes: raw.notes ?? '',
          items: items.length ? items : [emptyItem()],
        }
      } else {
        this.form = emptyForm()
      }
    },

    resetForm() {
      this.form = emptyForm()
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchBeritaAcaras()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchBeritaAcaras()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchBeritaAcaras()
    },

    setFilters(f: { status?: string | null; customerId?: number | null }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.customerId !== undefined) this.params.customerId = f.customerId
      this.params.first = 0
      this.fetchBeritaAcaras()
    },

    async fetchStatistics() {
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.statistics(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) return
        const json = await res.json()
        const d = json.data ?? {}
        this.statistics = {
          total: d.total ?? 0,
          draft: d.draft ?? 0,
          pending: d.pending ?? 0,
          approved: d.approved ?? 0,
          rejected: d.rejected ?? 0,
          completed: d.completed ?? 0,
        }
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export function getBeritaAcaraNo(row: BeritaAcara | null | undefined): string {
  if (!row) return ''
  return row.documentNo ?? row.document_no ?? ''
}

export function formatPeriod(row: BeritaAcara | null | undefined): string {
  if (!row) return '—'
  const start = row.periodStart ?? row.period_start
  const end = row.periodEnd ?? row.period_end
  if (!start || !end) return '—'
  return `${start} – ${end}`
}

export function isBeritaAcaraSendable(row: BeritaAcara | null | undefined): boolean {
  if (!row?.status) return false
  return row.status === 'approved' || row.status === 'completed'
}

export { emptyItem }
