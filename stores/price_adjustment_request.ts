import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface PriceAdjustmentRequest {
  id: number
  customerId: number | null
  productId: number | null
  serviceId: number | null
  servicePlanId: number | null
  didId: number | null
  currentPrice: number | null
  proposedPrice: number
  reason: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  type: 'site_investment' | 'walk_in' | 'promo'
  requestedBy: number
  approvedBy: number | null
  rejectedBy: number | null
  approvedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  customer?: {
    id: number
    name: string
  }
  product?: {
    id: number
    name: string
    sku: string
  }
  service?: {
    id: number
    name: string
    code: string
  }
  servicePlan?: {
    id: number
    name: string
  }
  did?: {
    id: number
    code: string
    name: string
  }
  requestedByUser?: {
    id: number
    fullName: string
    email: string
  }
  approvedByUser?: {
    id: number
    fullName: string
    email: string
  }
  rejectedByUser?: {
    id: number
    fullName: string
    email: string
  }
  currentApprovalStep?: number | null
  submittedAt?: string | null
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  approvalLogs?: Array<{
    id: number
    stepOrder: number
    action: 'approved' | 'rejected'
    remarks?: string | null
    user?: { id: number; fullName?: string; full_name?: string; email?: string }
    workflow?: {
      steps?: Array<{
        step_order?: number
        stepOrder?: number
        step_name?: string
        stepName?: string
        jabatan?: { nm_jabatan?: string; nmJabatan?: string }
      }>
    }
    createdAt?: string
  }>
}

interface PriceAdjustmentRequestState {
  requests: PriceAdjustmentRequest[]
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    status?: string
    type?: string
    customerId?: number
  }
  statistics: {
    pending: number
    approved: number
    rejected: number
    draft: number
  }
}

export const usePriceAdjustmentRequestStore = defineStore('priceAdjustmentRequest', {
  state: (): PriceAdjustmentRequestState => ({
    requests: [],
    loading: true,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: -1,
      search: '',
      status: undefined,
      type: undefined,
    customerId: undefined,
    requestedBy: undefined,
    },
    statistics: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
    },
  }),
  actions: {
    async fetchRequests(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || 'id',
          sortOrder: this.params.sortOrder === -1 ? 'desc' : 'asc',
          search: this.params.search || '',
        })

        if (this.params.status) {
          params.append('status', this.params.status)
        }
        if (this.params.type) {
          params.append('type', this.params.type)
        }
        if (this.params.customerId) {
          params.append('customerId', this.params.customerId.toString())
        }
        if (this.params.requestedBy) {
          params.append('requestedBy', String(this.params.requestedBy))
        }

        const response = await fetch(`${$api.priceAdjustmentRequests()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data price adjustment request dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data price adjustment request')
        }

        const result = await response.json()

        this.requests = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data price adjustment request: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch(`${$api.priceAdjustmentStatistics()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        if (response.ok) {
          const data = await response.json()
          this.statistics = data
        }
      } catch (e) {
        console.error('Error fetching statistics:', e)
      }
    },

    async submitRequest(id: number, reason: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()

      try {
        const response = await fetch(`${$api.priceAdjustmentSubmit(id)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Gagal submit price adjustment request')
        }

        toast.success({
          title: 'Berhasil',
          message: 'Price adjustment request berhasil disubmit ke finance',
          color: 'green',
          position: 'bottomRight',
        })

        await this.fetchRequests()
        await this.fetchStatistics()
        return result.data
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message,
          color: 'red',
          position: 'bottomRight',
        })
        throw e
      } finally {
        this.loading = false
      }
    },

    async approveRequest(id: number) {
      const toast = useToast()
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Approve Price Request?',
        text: 'Price list akan otomatis diupdate setelah approval',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Approve',
        cancelButtonText: 'Batal',
      })

      if (result.isConfirmed) {
        try {
          this.loading = true
          const response = await fetch(`${$api.priceAdjustmentApprove(id)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          const responseData = await response.json()

          if (!response.ok) {
            throw new Error(responseData.message || 'Gagal approve price adjustment request')
          }

          toast.success({
            title: 'Berhasil',
            message: 'Price adjustment request berhasil diapprove',
            color: 'green',
            position: 'bottomRight',
          })

          await this.fetchRequests()
          await this.fetchStatistics()
        } catch (e: any) {
          toast.error({
            title: 'Error',
            message: e.message,
            color: 'red',
            position: 'bottomRight',
          })
        } finally {
          this.loading = false
        }
      }
    },

    async rejectRequest(id: number, rejectionReason: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()

      try {
        const response = await fetch(`${$api.priceAdjustmentReject(id)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ rejectionReason }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Gagal reject price adjustment request')
        }

        toast.success({
          title: 'Berhasil',
          message: 'Price adjustment request berhasil direject',
          color: 'green',
          position: 'bottomRight',
        })

        await this.fetchRequests()
        await this.fetchStatistics()
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message,
          color: 'red',
          position: 'bottomRight',
        })
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteRequest(id: number) {
      const toast = useToast()
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Data price adjustment request akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (result.isConfirmed) {
        try {
          this.loading = true
          const response = await fetch(`${$api.priceAdjustmentRequests()}/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Gagal menghapus price adjustment request')
          }

          toast.success({
            title: 'Berhasil',
            message: 'Price adjustment request berhasil dihapus',
            color: 'green',
            position: 'bottomRight',
          })

          await this.fetchRequests()
          await this.fetchStatistics()
        } catch (e: any) {
          toast.error({
            title: 'Error',
            message: e.message,
            color: 'red',
            position: 'bottomRight',
          })
        } finally {
          this.loading = false
        }
      }
    },
  },
})
