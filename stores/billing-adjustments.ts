import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface BillingAdjustment {
  id: string
  customerId: number
  serviceLineId: string | null
  billingPeriod: string
  type: string
  description: string | null
  amount: number
  status: 'draft' | 'approved' | 'cancelled'
  attachment: string | null
  customer?: { id: number; name: string; email?: string } | null
  serviceLine?: { id: string; serviceName?: string; planName?: string } | null
  createdAt?: string
  approvedAt?: string | null
}

function normalizeAdj(raw: any): BillingAdjustment {
  return {
    id: raw.id,
    customerId: raw.customerId ?? raw.customer_id,
    serviceLineId: raw.serviceLineId ?? raw.service_line_id ?? null,
    billingPeriod: raw.billingPeriod ?? raw.billing_period,
    type: raw.type,
    description: raw.description ?? null,
    amount: Number(raw.amount ?? 0),
    status: raw.status,
    attachment: raw.attachment ?? null,
    customer: raw.customer
      ? { id: raw.customer.id, name: raw.customer.name, email: raw.customer.email }
      : null,
    serviceLine: raw.serviceLine || raw.service_line
      ? {
          id: (raw.serviceLine || raw.service_line).id,
          serviceName:
            (raw.serviceLine || raw.service_line).serviceName ??
            (raw.serviceLine || raw.service_line).service_name,
          planName:
            (raw.serviceLine || raw.service_line).planName ??
            (raw.serviceLine || raw.service_line).plan_name,
        }
      : null,
    createdAt: raw.createdAt ?? raw.created_at,
    approvedAt: raw.approvedAt ?? raw.approved_at ?? null,
  }
}

export const useBillingAdjustmentStore = defineStore('billingAdjustment', {
  state: () => ({
    rows: [] as BillingAdjustment[],
    selected: null as BillingAdjustment | null,
    loading: false,
    loadingStats: false,
    saving: false,
    totalRecords: 0,
    statistics: {
      total: 0,
      draft: 0,
      approved: 0,
      cancelled: 0,
      approvedAmount: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: -1,
      search: '',
      customerId: null as number | null,
      status: '',
      billingPeriod: '',
      type: '',
    },
  }),

  actions: {
    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.billingAdjustmentsStatistics(), {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        this.statistics = {
          total: Number(json.total ?? 0),
          draft: Number(json.draft ?? 0),
          approved: Number(json.approved ?? 0),
          cancelled: Number(json.cancelled ?? 0),
          approvedAmount: Number(json.approvedAmount ?? 0),
        }
      } catch (e: any) {
        console.error('Billing adjustment statistics:', e)
      } finally {
        this.loadingStats = false
      }
    },

    async fetchList() {
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const page = Math.floor(this.params.first / this.params.rows) + 1
        const qs = new URLSearchParams({
          page: String(page),
          rows: String(this.params.rows),
          sortField: this.params.sortField,
          sortOrder: this.params.sortOrder > 0 ? '1' : '-1',
          search: this.params.search || '',
        })
        if (this.params.customerId) qs.set('customerId', String(this.params.customerId))
        if (this.params.status) qs.set('status', this.params.status)
        if (this.params.billingPeriod) qs.set('billingPeriod', this.params.billingPeriod)
        if (this.params.type) qs.set('type', this.params.type)

        const res = await fetch(`${$api.billingAdjustments()}?${qs}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || err.error || `HTTP ${res.status}`)
        }
        const json = await res.json()
        this.rows = (json.data || []).map(normalizeAdj)
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'topRight' })
      } finally {
        this.loading = false
      }
    },

    async create(payload: Record<string, any>, file?: File | null) {
      this.saving = true
      const { $api } = useNuxtApp()
      try {
        const body = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) body.append(k, String(v))
        })
        if (file) body.append('attachment', file)

        const res = await fetch($api.billingAdjustments(), {
          method: 'POST',
          credentials: 'include',
          body,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message || 'Adjustment dibuat',
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'topRight' })
        return false
      } finally {
        this.saving = false
      }
    },

    async update(id: string, payload: Record<string, any>, file?: File | null) {
      this.saving = true
      const { $api } = useNuxtApp()
      try {
        const body = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) body.append(k, String(v))
        })
        if (file) body.append('attachment', file)

        const res = await fetch($api.billingAdjustmentsShow(id), {
          method: 'PUT',
          credentials: 'include',
          body,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message || 'Adjustment diperbarui',
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'topRight' })
        return false
      } finally {
        this.saving = false
      }
    },

    async approve(id: string) {
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({
        title: 'Approve Adjustment?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Approve',
      })
      if (!ok.isConfirmed) return false
      try {
        const res = await fetch($api.billingAdjustmentsApprove(id), {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'topRight' })
        return false
      }
    },

    async remove(id: string) {
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({
        title: 'Hapus Adjustment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        confirmButtonColor: '#ea5455',
      })
      if (!ok.isConfirmed) return false
      try {
        const res = await fetch($api.billingAdjustmentsShow(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'topRight' })
        return false
      }
    },
  },
})
