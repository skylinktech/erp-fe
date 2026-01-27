import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'

interface ArfItem {
  id?: string
  arfId?: string
  productId: number
  warehouseId: number
  unitId: number
  quantity: number
  price: number
  subtotal: number
  description?: string | null
  additional?: boolean | null
  product?: any
  warehouse?: any
  unit?: any
}

interface Stats {
  total: number | undefined
  draft: number | undefined
  submitted: number | undefined
  approved: number | undefined
  rejected: number | undefined
  disbursed: number | undefined
  settled: number | undefined
  cancelled: number | undefined
}

export interface Arf {
  id: string
  noArf: string
  requestDate: string
  neededDate: string | null
  siteId: number | null
  purpose: string
  estimatedAmount: number
  currency: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'disbursed' | 'settled' | 'cancelled'
  purchaseRequestId: string | null
  requestorId: number | null
  costCenterId: number | null
  approvedBy: number | null
  rejectedBy: number | null
  disbursedBy: number | null
  settledBy: number | null
  cancelledBy: number | null
  approvedAt?: string | null
  rejectedAt?: string | null
  disbursedAt?: string | null
  settledAt?: string | null
  cancelledAt?: string | null
  createdAt: string
  updatedAt: string
  site?: { id: number; name?: string }
  purchaseRequest?: { id: number; name?: string }
  costCenter?: { id: number; name?: string }
  purchaseRequest?: { id: string; noPr?: string }
  requestor?: any
  approvedByUser?: any
  rejectedByUser?: any
  disbursedByUser?: any
  settledByUser?: any
  cancelledByUser?: any
  arfItems?: ArfItem[]
}

interface ArfState {
  arfs: Arf[]
  arf: Arf | null
  originalArf: Arf | null
  loading: boolean
  error: any
  stats: Stats
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    siteId?: number | null
    costCenterId?: number | null
    status?: string | null
    startDate?: string | null
    endDate?: string | null
  }
  form: any
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  enableAdditional: boolean
}

export const useArfStore = defineStore('arf', {
  state: (): ArfState => ({
    arfs: [],
    arf: null,
    originalArf: null,
    loading: true,
    error: null,
    totalRecords: 0,
    stats: {
      total: 0,
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      disbursed: 0,
      settled: 0,
      cancelled: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      siteId: null,
      costCenterId: null,
      status: null,
      startDate: null,
      endDate: null,
    },
    form: {
      requestDate: null,
      neededDate: null,
      siteId: null,
      purpose: '',
      estimatedAmount: 0,
      currency: 'IDR',
      status: 'draft',
      purchaseRequestId: null,
      requestorId: null,
      costCenterId: null,
      arfItems: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    enableAdditional: false,
  }),

  actions: {
    async fetchArfs(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.arf())
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: this.params.draw.toString(),
          search: this.params.search || '',
          includeItems: 'true',
        })

        if (this.params.siteId) {
          params.append('siteId', this.params.siteId.toString())
        }
        if (this.params.costCenterId) {
          params.append('costCenterId', this.params.costCenterId.toString())
        }
        if (this.params.status) {
          params.append('status', this.params.status)
        }
        if (this.params.startDate) {
          params.append('startDate', this.params.startDate)
        }
        if (this.params.endDate) {
          params.append('endDate', this.params.endDate)
        }

        url.search = params.toString()

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) throw new Error('Gagal mengambil data ARF')

        const result = await response.json()
        this.arfs = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data ARF:', e)
        this.error = e

        if (!suppressError) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data ARF: ${e?.message || e}`,
            color: 'red'
          })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      const { $api } = useNuxtApp()
      const defaultStats = {
        total: undefined,
        draft: undefined,
        submitted: undefined,
        approved: undefined,
        rejected: undefined,
        disbursed: undefined,
        settled: undefined,
        cancelled: undefined,
      }
      try {
        const response = await fetch($api.countArfByStatus(), {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          this.stats = result
        } else {
          this.stats = defaultStats
        }
      } catch (error) {
        console.error('Gagal mengambil data statistik:', error)
        this.stats = defaultStats
      }
    },

    async saveArf() {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        const formData = new FormData()

        const dataToAppend = { ...this.form }
        delete dataToAppend.arfItems
        delete dataToAppend.site
        delete dataToAppend.costCenter
        delete dataToAppend.purchaseRequest
        delete dataToAppend.requestor
        delete dataToAppend.approvedByUser
        delete dataToAppend.rejectedByUser
        delete dataToAppend.disbursedByUser
        delete dataToAppend.settledByUser
        delete dataToAppend.cancelledByUser

        // Hapus status saat create (default draft di backend)
        if (!this.isEditMode) {
          delete dataToAppend.status
        }

        Object.keys(dataToAppend).forEach(key => {
          const value = dataToAppend[key]
          if (value !== null && value !== undefined) {
            formData.append(key, String(value))
          }
        })

        if (!this.isEditMode && userStore.user && userStore.user.id) {
          formData.append('requestorId', userStore.user.id.toString())
        }

        // Filter hanya item yang valid dan lengkap
        const validItems = this.form.arfItems.filter((item: any) => {
          return item.productId && item.warehouseId && item.unitId && item.quantity && item.quantity > 0
        })

        if (validItems.length === 0) {
          throw new Error('Minimal harus ada 1 item yang valid (Product, Warehouse, Unit, dan Quantity harus diisi)')
        }

        // Calculate estimated amount from valid items
        let calculatedEstimatedAmount = 0
        const finalValidItems: any[] = []
        
        validItems.forEach((item: any) => {
          const productId = Number(item.productId)
          const warehouseId = Number(item.warehouseId)
          const unitId = Number(item.unitId)
          const quantity = Number(item.quantity) || 1
          const price = Number(item.price) || 0
          const subtotal = Number(item.subtotal) || (quantity * price)

          if (!productId || !warehouseId || !unitId || quantity <= 0) {
            return
          }

          calculatedEstimatedAmount += subtotal
          
          // Handle additional field
          let additionalValue = false
          if (item.additional !== undefined && item.additional !== null) {
            if (typeof item.additional === 'boolean') {
              additionalValue = item.additional
            } else if (typeof item.additional === 'string') {
              additionalValue = item.additional.toLowerCase() === 'true' || item.additional === '1'
            } else if (typeof item.additional === 'number') {
              additionalValue = item.additional === 1
            }
          }

          finalValidItems.push({
            productId,
            warehouseId,
            unitId,
            quantity,
            price,
            subtotal,
            additional: additionalValue,
            description: item.description || null
          })
        })

        // Append items dengan index yang benar
        finalValidItems.forEach((item: any, i: number) => {
          formData.append(`arfItems[${i}][productId]`, String(item.productId))
          formData.append(`arfItems[${i}][warehouseId]`, String(item.warehouseId))
          formData.append(`arfItems[${i}][unitId]`, String(item.unitId))
          formData.append(`arfItems[${i}][quantity]`, String(item.quantity))
          formData.append(`arfItems[${i}][price]`, String(item.price))
          formData.append(`arfItems[${i}][subtotal]`, String(item.subtotal))
          formData.append(`arfItems[${i}][additional]`, item.additional ? 'true' : 'false')
          if (item.description) {
            formData.append(`arfItems[${i}][description]`, String(item.description))
          }
        })

        // Append estimated amount
        formData.append('estimatedAmount', String(calculatedEstimatedAmount))

        const method = this.isEditMode ? 'POST' : 'POST'
        const url = this.isEditMode ? `${$api.arf()}/${this.form.id}` : $api.arf()
        if (this.isEditMode) {
          formData.append('_method', 'PUT')
        }

        const response = await fetch(url, {
          method: method,
          headers: {
            'Accept': 'application/json',
          },
          body: formData,
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 422) {
            this.validationErrors = errorData.errors
            const toast = useToast()
            toast.error({
              title: 'Error',
              message: 'Gagal Validasi',
              color: 'red'
            })
          } else {
            throw new Error(errorData.message || 'Gagal menyimpan data ARF')
          }
        } else {
          this.closeModal()
          await this.fetchArfs()
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: `ARF berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
            color: 'green',
            position: 'topRight',
            layout: 2,
          })
        }
      } catch (error: any) {
        this.validationErrors = []
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Operasi gagal',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async deleteArf(id: string) {
      this.loading = true
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      })

      if (!result.isConfirmed) {
        this.loading = false
        return
      }

      try {
        const response = await fetch(`${$api.arf()}/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus ARF')
        }

        await this.fetchArfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil dihapus.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      } catch (error: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus ARF',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async submitArf(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.submitArf(arfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal submit ARF' }))
          throw new Error(errorData.message || 'Gagal submit ARF')
        }

        await this.fetchArfs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil di-submit (status: submitted).',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error submit ARF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal submit ARF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async approveArf(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.approveArf(arfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mengapprove ARF' }))
          throw new Error(errorData.message || 'Gagal mengapprove ARF')
        }

        await this.fetchArfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil diapprove.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error approving ARF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mengapprove ARF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectArf(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.rejectArf(arfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mereject ARF' }))
          throw new Error(errorData.message || 'Gagal mereject ARF')
        }

        await this.fetchArfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil direject.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error rejecting ARF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mereject ARF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async disburseArf(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.disburseArf(arfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mendisburse ARF' }))
          throw new Error(errorData.message || 'Gagal mendisburse ARF')
        }

        await this.fetchArfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil didisburse.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error disbursing ARF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mendisburse ARF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async settleArf(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.settleArf(arfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal menyettle ARF' }))
          throw new Error(errorData.message || 'Gagal menyettle ARF')
        }

        await this.fetchArfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil disettle.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error settling ARF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menyettle ARF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async cancelArf(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.cancelArf(arfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal membatalkan ARF' }))
          throw new Error(errorData.message || 'Gagal membatalkan ARF')
        }

        await this.fetchArfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'ARF berhasil dibatalkan.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error cancelling ARF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal membatalkan ARF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async getArfDetails(arfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const url = `${$api.arf()}/${arfId}`
        console.log('Fetching ARF details from:', url)
        
        const resData = await apiFetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        console.log('ARF details response:', resData)

        if (resData && resData.data) {
          this.arf = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getArfDetails.')
        }
      } catch (e: any) {
        console.error('Error details:', e)
        console.error('ARF ID:', arfId)
        this.error = e
        throw new Error(e.message || 'Gagal mengambil detail ARF')
      } finally {
        this.loading = false
      }
    },

    async openModal(arfData: Arf | null = null) {
      this.isEditMode = !!arfData
      this.validationErrors = []

      if (arfData) {
        await this.getArfDetails(arfData.id)
        const fullData = this.arf

        if (!fullData) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tidak dapat memuat data ARF.',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
          return
        }

        this.originalArf = JSON.parse(JSON.stringify(fullData))
        const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null

        const formData: { [key: string]: any } = {
          ...JSON.parse(JSON.stringify(fullData)),
        }

        const dateFields = ['requestDate', 'neededDate', 'approvedAt', 'rejectedAt', 'disbursedAt', 'settledAt', 'cancelledAt']
        dateFields.forEach(field => {
          if (formData[field]) {
            formData[field] = formatDate(formData[field])
          }
        })

        // Normalisasi item
        const nm = (v: any) => (v !== null && v !== undefined && v !== '') ? Number(v) : 0
        if (Array.isArray(formData.arfItems)) {
          formData.arfItems.forEach((item: any) => {
            const q = nm(item.quantity) || 1
            const p = nm(item.price) || 0
            item.quantity = q
            item.price = p
            item.subtotal = nm(item.subtotal) || q * p
            if (item.additional === undefined || item.additional === null) {
              item.additional = false
            } else {
              item.additional = item.additional === true || item.additional === 'true' || item.additional === 1
            }
          })
        }

        // Set estimated amount dari data atau hitung dari items
        if (formData.estimatedAmount) {
          formData.estimatedAmount = Number(formData.estimatedAmount) || 0
        } else if (Array.isArray(formData.arfItems)) {
          formData.estimatedAmount = formData.arfItems.reduce((sum: number, item: any) => sum + (Number(item.subtotal) || 0), 0)
        } else {
          formData.estimatedAmount = 0
        }

        this.form = formData

        if (this.form.arfItems && this.form.arfItems.length === 0) {
          this.addItem()
        }
        this.enableAdditional = false
      } else {
        this.resetForm()
        this.addItem()
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.originalArf = null
      this.resetForm()
      this.validationErrors = []
    },

    resetForm() {
      this.form = {
        requestDate: null,
        neededDate: null,
        siteId: null,
        purpose: '',
        estimatedAmount: 0,
        currency: 'IDR',
        status: 'draft',
        purchaseRequestId: null,
        requestorId: null,
        costCenterId: null,
        arfItems: [],
      }
      this.enableAdditional = false
    },

    addItem(additional: boolean = false) {
      if (!this.form.arfItems) {
        this.form.arfItems = []
      }
      this.form.arfItems.push({
        productId: null,
        warehouseId: null,
        unitId: null,
        quantity: 1,
        price: 0,
        subtotal: 0,
        additional: additional,
        description: '',
      })
    },

    removeItem(index: number) {
      this.form.arfItems.splice(index, 1)
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchArfs()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = Number(event.sortOrder) || null
      this.fetchArfs()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchArfs()
    },

    setFilters(filters: { siteId?: number | null, costCenterId?: number | null, status?: string | null, startDate?: string | null, endDate?: string | null, search?: string }) {
      this.params.siteId = filters.siteId
      this.params.costCenterId = filters.costCenterId
      this.params.status = filters.status
      this.params.startDate = filters.startDate
      this.params.endDate = filters.endDate
      this.params.search = filters.search || ''
      this.params.first = 0
      this.fetchArfs()
    },
  }
})
