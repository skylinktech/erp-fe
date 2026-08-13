import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export type RequestActivationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed'

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface RequestActivation {
  id: number
  requestNo?: string
  request_no?: string
  requestDate?: string
  request_date?: string
  customerId?: number | null
  customer_id?: number | null
  serviceLine?: string | null
  service_line?: string | null
  servicePlanId?: number | null
  service_plan_id?: number | null
  planName?: string | null
  plan_name?: string | null
  snKit?: string | null
  sn_kit?: string | null
  locationName?: string | null
  location_name?: string | null
  picName?: string | null
  pic_name?: string | null
  picPhone?: string | null
  pic_phone?: string | null
  subscriptionFormUrl?: string | null
  subscription_form_url?: string | null
  subscriptionId?: string | null
  subscription_id?: string | null
  subscription?: { id: string; noSubscription?: string; no_subscription?: string; status?: string } | null
  notes?: string | null
  contactAm?: string | null
  contact_am?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  status: RequestActivationStatus
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
  customer?: { id: number; name: string; email?: string; phone?: string; code?: string }
  servicePlan?: { id: number; name: string; quota?: string | null } | null
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  nextApprovalStep?: number | null
}

interface RequestActivationState {
  requestActivations: RequestActivation[]
  requestActivation: RequestActivation | null
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
    customerId?: number | null
  }
  form: {
    id?: number | null
    status?: RequestActivationStatus
    requestDate: string
    customerId: number | null
    serviceLine: string
    servicePlanId: number | null
    planName: string
    snKit: string
    locationName: string
    picName: string
    picPhone: string
    subscriptionFormUrl: string
    subscriptionId: string | null
    notes: string
    contactAm: string
    address: string
    latitude: number | null
    longitude: number | null
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

function emptyForm(): RequestActivationState['form'] {
  return {
    status: 'draft',
    requestDate: todayIso(),
    customerId: null,
    serviceLine: '',
    servicePlanId: null,
    planName: '',
    snKit: '',
    locationName: '',
    picName: '',
    picPhone: '',
    subscriptionFormUrl: '',
    subscriptionId: null,
    notes: '',
    contactAm: '',
    address: '',
    latitude: null,
    longitude: null,
  }
}

export const useRequestActivationStore = defineStore('requestActivation', {
  state: (): RequestActivationState => ({
    requestActivations: [],
    requestActivation: null,
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
        list: () => $api.requestActivation(),
        details: (id: number | string) => $api.getRequestActivationDetails(id),
        statistics: () => $api.requestActivationStatistics(),
        submit: (id: number | string) => $api.submitRequestActivation(id),
        approve: (id: number | string) => $api.approveRequestActivation(id),
        reject: (id: number | string) => $api.rejectRequestActivation(id),
        complete: (id: number | string) => $api.completeRequestActivation(id),
      }
    },

    async fetchRequestActivations(suppressError = false) {
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
        if (!res.ok) throw new Error('Gagal mengambil data Request Activation')
        const json = await res.json()
        this.requestActivations = json.data ?? []
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

    async getRequestActivationDetails(id: number | string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.details(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (res?.data) this.requestActivation = res.data
        else if (res?.id) this.requestActivation = res
      } finally {
        this.loading = false
      }
    },

    async saveRequestActivation(): Promise<boolean | number> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      const isEdit = !!(this.form as any).id
      const body: Record<string, any> = {
        requestDate: this.form.requestDate || todayIso(),
        customerId: this.form.customerId,
        serviceLine: this.form.serviceLine?.trim() || null,
        servicePlanId: this.form.servicePlanId,
        planName: this.form.planName?.trim() || null,
        snKit: this.form.snKit?.trim() || null,
        locationName: this.form.locationName?.trim() || null,
        picName: this.form.picName?.trim() || null,
        picPhone: this.form.picPhone?.trim() || null,
        subscriptionFormUrl: this.form.subscriptionFormUrl?.trim() || null,
        subscriptionId: this.form.subscriptionId || null,
        notes: this.form.notes?.trim() || null,
        contactAm: this.form.contactAm?.trim() || null,
        address: this.form.address?.trim() || null,
        latitude: this.form.latitude,
        longitude: this.form.longitude,
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
            isEdit ? 'Request Activation gagal diperbarui.' : 'Request Activation gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        const result = await res.json()
        toast.success({
          title: 'Sukses',
          message: `Request Activation berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return result?.data?.id ?? true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Request Activation gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteRequestActivation(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const ok = await Swal.fire({
        title: 'Yakin?',
        text: 'Request Activation akan dihapus (soft delete).',
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
          const err = await normalizeFailedResponse(res, 'Request Activation gagal dihapus.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchRequestActivations()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Request Activation dihapus',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (e: any) {
        const err = normalizeApiError(e, 'Request Activation gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async submitRequestActivation(id: number | string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.submit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Request Activation gagal disubmit.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchRequestActivations()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Request Activation berhasil di-submit',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Request Activation gagal disubmit.')
        toastNormalizedError(err)
        return false
      }
    },

    async approveRequestActivation(id: number | string, remarks?: string): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()

      const result = await Swal.fire({
        title: 'Approve Request Activation',
        text: 'Apakah Anda yakin akan menyetujui Request Activation ini?',
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
          const err = await normalizeFailedResponse(res, 'Request Activation gagal disetujui.')
          toastNormalizedError(err)
          return false
        }
        const json = await res.json().catch(() => ({}))
        await this.fetchRequestActivations()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: json.message || 'Request Activation berhasil diapprove',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Request Activation gagal disetujui.')
        toastNormalizedError(err)
        return false
      }
    },

    async rejectRequestActivation(id: number | string, reason: string): Promise<boolean> {
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
          const err = await normalizeFailedResponse(res, 'Request Activation gagal ditolak.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchRequestActivations()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Request Activation ditolak',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Request Activation gagal ditolak.')
        toastNormalizedError(err)
        return false
      }
    },

    async markCompleted(id: number | string, subscriptionId?: string | null): Promise<boolean> {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.complete(id), {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            subscriptionId: subscriptionId || this.form.subscriptionId || null,
          }),
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'Request Activation gagal diselesaikan.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchRequestActivations()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Request Activation ditandai selesai',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'Request Activation gagal diselesaikan.')
        toastNormalizedError(err)
        return false
      }
    },

    openForm(data: RequestActivation | null = null) {
      if (data) {
        const raw = data as any
        this.form = {
          id: raw.id,
          status: raw.status ?? 'draft',
          requestDate: (raw.requestDate ?? raw.request_date ?? todayIso()).toString().slice(0, 10),
          customerId: raw.customerId ?? raw.customer_id ?? null,
          serviceLine: raw.serviceLine ?? raw.service_line ?? '',
          servicePlanId: raw.servicePlanId ?? raw.service_plan_id ?? null,
          planName: raw.planName ?? raw.plan_name ?? '',
          snKit: raw.snKit ?? raw.sn_kit ?? '',
          locationName: raw.locationName ?? raw.location_name ?? '',
          picName: raw.picName ?? raw.pic_name ?? '',
          picPhone: raw.picPhone ?? raw.pic_phone ?? '',
          subscriptionFormUrl: raw.subscriptionFormUrl ?? raw.subscription_form_url ?? '',
          subscriptionId: raw.subscriptionId ?? raw.subscription_id ?? null,
          notes: raw.notes ?? '',
          contactAm: raw.contactAm ?? raw.contact_am ?? '',
          address: raw.address ?? '',
          latitude: raw.latitude != null ? Number(raw.latitude) : null,
          longitude: raw.longitude != null ? Number(raw.longitude) : null,
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
      this.fetchRequestActivations()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchRequestActivations()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchRequestActivations()
    },

    setFilters(f: { status?: string | null; customerId?: number | null }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.customerId !== undefined) this.params.customerId = f.customerId
      this.params.first = 0
      this.fetchRequestActivations()
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

export function getRequestActivationNo(row: RequestActivation | null | undefined): string {
  if (!row) return ''
  return row.requestNo ?? row.request_no ?? ''
}
