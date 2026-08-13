import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export type WorkOrderJobType = 'pm' | 'cm' | 'relocation'
export type WorkOrderUrgencyLevel = 'high' | 'medium' | 'low'
export type WorkOrderStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed'

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface WorkOrderRequest {
  id: number
  requestNo?: string
  request_no?: string
  requestDate?: string
  request_date?: string
  siteInvestmentId?: string | null
  site_investment_id?: string | null
  siteName?: string | null
  site_name?: string | null
  clientId?: number | null
  client_id?: number | null
  location?: string | null
  picName?: string | null
  pic_name?: string | null
  picPhone?: string | null
  pic_phone?: string | null
  jobType?: WorkOrderJobType
  job_type?: WorkOrderJobType
  jobDescription?: string | null
  job_description?: string | null
  faultIndication?: string | null
  fault_indication?: string | null
  urgencyLevel?: WorkOrderUrgencyLevel
  urgency_level?: WorkOrderUrgencyLevel
  targetDate?: string | null
  target_date?: string | null
  estimatedDuration?: string | null
  estimated_duration?: string | null
  notes?: string | null
  attachment?: string | null
  status: WorkOrderStatus
  approvalStatus?: string | null
  rejectionReason?: string | null
  approvedAt?: string | null
  currentApprovalStep?: number | null
  submittedAt?: string | null
  requestedBy?: number | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
  requestedByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  client?: { id: number; name: string; email?: string; phone?: string }
  siteInvestment?: {
    id: string
    siNumber?: string
    si_number?: string
    name: string
    location?: string | null
    customerId?: number | null
    customer_id?: number | null
    customer?: { id: number; name: string } | null
  } | null
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  nextApprovalStep?: number | null
}

interface WorkOrderRequestState {
  workOrderRequests: WorkOrderRequest[]
  workOrderRequest: WorkOrderRequest | null
  loading: boolean
  saving: boolean
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
    jobType?: string | null
    urgencyLevel?: string | null
  }
  form: {
    id?: number | null
    status?: WorkOrderStatus
    requestDate: string
    siteInvestmentId: string | null
    siteName: string
    clientId: number | null
    location: string
    picName: string
    picPhone: string
    jobType: WorkOrderJobType
    jobDescription: string
    faultIndication: string
    urgencyLevel: WorkOrderUrgencyLevel
    targetDate: string
    estimatedDuration: string
    notes: string
    attachment: string | null
  }
  statistics: {
    total: number
    draft: number
    pending: number
    approved: number
    rejected: number
    completed: number
    highUrgency: number
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): WorkOrderRequestState['form'] {
  return {
    status: 'draft',
    requestDate: todayIso(),
    siteInvestmentId: null,
    siteName: '',
    clientId: null,
    location: '',
    picName: '',
    picPhone: '',
    jobType: 'pm',
    jobDescription: '',
    faultIndication: '',
    urgencyLevel: 'medium',
    targetDate: '',
    estimatedDuration: '',
    notes: '',
    attachment: null,
  }
}

export const useWorkOrderRequestStore = defineStore('workOrderRequest', {
  state: (): WorkOrderRequestState => ({
    workOrderRequests: [],
    workOrderRequest: null,
    loading: false,
    saving: false,
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
      jobType: null,
      urgencyLevel: null,
    },
    form: emptyForm(),
    statistics: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      highUrgency: 0,
    },
  }),

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: () => $api.workOrderRequest(),
        details: (id: number | string) => $api.getWorkOrderRequestDetails(id),
        statistics: () => $api.workOrderRequestStatistics(),
        submit: (id: number | string) => $api.submitWorkOrderRequest(id),
        approve: (id: number | string) => $api.approveWorkOrderRequest(id),
        reject: (id: number | string) => $api.rejectWorkOrderRequest(id),
        complete: (id: number | string) => $api.completeWorkOrderRequest(id),
      }
    },

    async fetchWorkOrderRequests(suppressError = false) {
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
        if (this.params.jobType) sp.append('jobType', this.params.jobType)
        if (this.params.urgencyLevel) sp.append('urgencyLevel', this.params.urgencyLevel)
        url.search = sp.toString()

        const res = await fetch(String(url), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Gagal mengambil data Work Order Request')
        const json = await res.json()
        this.workOrderRequests = json.data ?? []
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

    async getWorkOrderRequestDetails(id: number | string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.details(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (res?.data) this.workOrderRequest = res.data
        else if (res?.id) this.workOrderRequest = res
      } finally {
        this.loading = false
      }
    },

    async saveWorkOrderRequest(): Promise<boolean> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      const isEdit = !!(this.form as any).id
      const body: Record<string, any> = {
        requestDate: this.form.requestDate || todayIso(),
        siteInvestmentId: this.form.siteInvestmentId ?? null,
        siteName: this.form.siteName?.trim() || null,
        clientId: this.form.clientId,
        location: this.form.location?.trim() || null,
        picName: this.form.picName?.trim() || null,
        picPhone: this.form.picPhone?.trim() || null,
        jobType: this.form.jobType || 'pm',
        jobDescription: this.form.jobDescription?.trim() || null,
        faultIndication: this.form.faultIndication?.trim() || null,
        urgencyLevel: this.form.urgencyLevel || 'medium',
        targetDate: this.form.targetDate || null,
        estimatedDuration: this.form.estimatedDuration?.trim() || null,
        notes: this.form.notes?.trim() || null,
        attachment: this.form.attachment ?? null,
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
            isEdit ? 'Work Order Request gagal diperbarui.' : 'Work Order Request gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        const result = await res.json()
        toast.success({
          title: 'Sukses',
          message: `Work Order Request berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return result?.data?.id ?? true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Work Order Request gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteWorkOrderRequest(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const ok = await Swal.fire({
        title: 'Yakin?',
        text: 'Work Order Request akan dihapus (soft delete).',
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
          const err = await normalizeFailedResponse(res, 'Work Order Request gagal dihapus.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchWorkOrderRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Work Order Request dihapus',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (e: any) {
        const err = normalizeApiError(e, 'Work Order Request gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async submitWorkOrderRequest(id: number | string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.submit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Work Order Request gagal disubmit.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchWorkOrderRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Work Order Request berhasil di-submit',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Work Order Request gagal disubmit.')
        toastNormalizedError(err)
        return false
      }
    },

    async approveWorkOrderRequest(id: number | string, remarks?: string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()

      const result = await Swal.fire({
        title: 'Approve Work Order Request',
        text: 'Apakah Anda yakin akan menyetujui Work Order Request ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#008fec',
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
          const err = await normalizeFailedResponse(res, 'Work Order Request gagal disetujui.')
          toastNormalizedError(err)
          return false
        }
        const json = await res.json().catch(() => ({}))
        await this.fetchWorkOrderRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: json.message || 'Work Order Request berhasil diapprove',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Work Order Request gagal disetujui.')
        toastNormalizedError(err)
        return false
      }
    },

    async rejectWorkOrderRequest(id: number | string, reason: string): Promise<boolean> {
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
          const err = await normalizeFailedResponse(res, 'Work Order Request gagal ditolak.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchWorkOrderRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Work Order Request ditolak',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Work Order Request gagal ditolak.')
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
          const err = await normalizeFailedResponse(res, 'Work Order Request gagal diselesaikan.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchWorkOrderRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Work Order Request ditandai selesai',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Work Order Request gagal diselesaikan.')
        toastNormalizedError(err)
        return false
      }
    },

    openForm(data: WorkOrderRequest | null = null) {
      if (data) {
        const raw = data as any
        this.form = {
          id: raw.id,
          status: raw.status ?? 'draft',
          requestDate: (raw.requestDate ?? raw.request_date ?? todayIso()).toString().slice(0, 10),
          siteInvestmentId: raw.siteInvestmentId ?? raw.site_investment_id ?? null,
          siteName: raw.siteName ?? raw.site_name ?? '',
          clientId: raw.clientId ?? raw.client_id ?? null,
          location: raw.location ?? '',
          picName: raw.picName ?? raw.pic_name ?? '',
          picPhone: raw.picPhone ?? raw.pic_phone ?? '',
          jobType: raw.jobType ?? raw.job_type ?? 'pm',
          jobDescription: raw.jobDescription ?? raw.job_description ?? '',
          faultIndication: raw.faultIndication ?? raw.fault_indication ?? '',
          urgencyLevel: raw.urgencyLevel ?? raw.urgency_level ?? 'medium',
          targetDate: (raw.targetDate ?? raw.target_date ?? '').toString().slice(0, 10),
          estimatedDuration: raw.estimatedDuration ?? raw.estimated_duration ?? '',
          notes: raw.notes ?? '',
          attachment: raw.attachment ?? null,
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
      this.fetchWorkOrderRequests()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchWorkOrderRequests()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchWorkOrderRequests()
    },

    setFilters(f: {
      status?: string | null
      jobType?: string | null
      urgencyLevel?: string | null
    }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.jobType !== undefined) this.params.jobType = f.jobType
      if (f.urgencyLevel !== undefined) this.params.urgencyLevel = f.urgencyLevel
      this.params.first = 0
      this.fetchWorkOrderRequests()
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
          highUrgency: d.highUrgency ?? 0,
        }
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export function getWorkOrderRequestNo(wor: WorkOrderRequest | null | undefined): string {
  if (!wor) return ''
  return wor.requestNo ?? wor.request_no ?? ''
}

export const JOB_TYPE_LABELS: Record<WorkOrderJobType, string> = {
  pm: 'Preventive Maintenance (PM)',
  cm: 'Corrective Maintenance (CM)',
  relocation: 'Relokasi / Moving Perangkat',
}

export const URGENCY_LABELS: Record<WorkOrderUrgencyLevel, string> = {
  high: 'High (Penanganan ≤ 1×24 jam)',
  medium: 'Medium (Penanganan 2–3 hari kerja)',
  low: 'Low (Penanganan > 3 hari kerja)',
}

export const URGENCY_BADGE_CLASS: Record<WorkOrderUrgencyLevel, string> = {
  high: 'bg-label-danger',
  medium: 'bg-label-warning',
  low: 'bg-label-info',
}
