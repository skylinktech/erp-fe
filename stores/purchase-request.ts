import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'

interface PurchaseRequestItem {
  id?: string
  purchaseRequestId?: string
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
  pending: number | undefined
  approved: number | undefined
  rejected: number | undefined
  received: number | undefined
}

export interface PurchaseRequest {
  id: string
  mgrfId: string
  vendorId: number | null
  noPr: string
  status: 'draft' | 'approved' | 'rejected' | 'received' | 'pending'
  description?: string | null
  attachment?: string | null
  total: number
  createdBy: number | null
  approvedBy: number | null
  rejectedBy: number | null
  receivedBy: number | null
  approvedAt?: string | null
  rejectedAt?: string | null
  receivedAt?: string | null
  createdAt: string
  updatedAt: string
  mgrf?: { id: number; noMgrf?: string }
  vendor?: { id: number; name?: string }
  createdByUser?: any
  approvedByUser?: any
  rejectedByUser?: any
  receivedByUser?: any
  purchaseRequestItems?: PurchaseRequestItem[]
}

interface PurchaseRequestState {
  purchaseRequests: PurchaseRequest[]
  purchaseRequest: PurchaseRequest | null
  originalPurchaseRequest: PurchaseRequest | null
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
    mgrfId?: number | null
    vendorId?: number | null
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

export const usePurchaseRequestStore = defineStore('purchaseRequest', {
  state: (): PurchaseRequestState => ({
    purchaseRequests: [],
    purchaseRequest: null,
    originalPurchaseRequest: null,
    loading: true,
    error: null,
    totalRecords: 0,
    stats: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      received: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      mgrfId: null,
      vendorId: null,
      status: null,
      startDate: null,
      endDate: null,
    },
    form: {
      mgrfId: null,
      vendorId: null,
      description: '',
      status: 'draft',
      total: 0,
      attachment: null,
      attachmentPreview: null,
      purchaseRequestItems: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    enableAdditional: false,
  }),

  actions: {
    async fetchPurchaseRequests(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.purchaseRequest())
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: this.params.draw.toString(),
          search: this.params.search || '',
          includeItems: 'true',
        })

        if (this.params.mgrfId) {
          params.append('mgrfId', this.params.mgrfId.toString())
        }
        if (this.params.vendorId) {
          params.append('vendorId', this.params.vendorId.toString())
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

        if (!response.ok) throw new Error('Gagal mengambil data Purchase Request')

        const result = await response.json()
        this.purchaseRequests = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data Purchase Request:', e)
        this.error = e

        if (!suppressError) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Purchase Request: ${e?.message || e}`,
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
        pending: undefined,
        approved: undefined,
        rejected: undefined,
        received: undefined,
      }
      try {
        const response = await fetch($api.countPurchaseRequestByStatus(), {
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

    async savePurchaseRequest() {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        const formData = new FormData()

        const dataToAppend = { ...this.form }
        delete dataToAppend.purchaseRequestItems
        delete dataToAppend.mgrf
        delete dataToAppend.vendor
        delete dataToAppend.createdByUser
        delete dataToAppend.approvedByUser
        delete dataToAppend.rejectedByUser
        delete dataToAppend.receivedByUser
        delete dataToAppend.attachment
        delete dataToAppend.attachmentPreview

        Object.keys(dataToAppend).forEach(key => {
          const value = dataToAppend[key]
          if (value !== null && value !== undefined) {
            formData.append(key, String(value))
          }
        })

        if (!this.isEditMode && userStore.user && userStore.user.id) {
          formData.append('createdBy', userStore.user.id.toString())
        }

        // Filter hanya item yang valid dan lengkap
        const validItems = this.form.purchaseRequestItems.filter((item: any) => {
          return item.productId && item.warehouseId && item.unitId && item.quantity && item.quantity > 0
        })

        if (validItems.length === 0) {
          throw new Error('Minimal harus ada 1 item yang valid (Product, Warehouse, Unit, dan Quantity harus diisi)')
        }

        // Calculate total from valid items
        let calculatedTotal = 0
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

          calculatedTotal += subtotal
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
          formData.append(`purchaseRequestItems[${i}][productId]`, String(item.productId))
          formData.append(`purchaseRequestItems[${i}][warehouseId]`, String(item.warehouseId))
          formData.append(`purchaseRequestItems[${i}][unitId]`, String(item.unitId))
          formData.append(`purchaseRequestItems[${i}][quantity]`, String(item.quantity))
          formData.append(`purchaseRequestItems[${i}][price]`, String(item.price))
          formData.append(`purchaseRequestItems[${i}][subtotal]`, String(item.subtotal))
          formData.append(`purchaseRequestItems[${i}][additional]`, item.additional ? 'true' : 'false')
          if (item.description) {
            formData.append(`purchaseRequestItems[${i}][description]`, String(item.description))
          }
        })

        // Append total
        formData.append('total', String(calculatedTotal))

        if (this.form.attachment instanceof File) {
          formData.append('attachment', this.form.attachment)
        }

        const method = this.isEditMode ? 'POST' : 'POST'
        const url = this.isEditMode ? `${$api.purchaseRequest()}/${this.form.id}` : $api.purchaseRequest()
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
            throw new Error(errorData.message || 'Gagal menyimpan data Purchase Request')
          }
        } else {
          this.closeModal()
          await this.fetchPurchaseRequests()
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: `Purchase Request berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
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

    async deletePurchaseRequest(id: string) {
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
        const response = await fetch(`${$api.purchaseRequest()}/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus Purchase Request')
        }

        await this.fetchPurchaseRequests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Purchase Request berhasil dihapus.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      } catch (error: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus Purchase Request',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async approvePurchaseRequest(prId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.approvePurchaseRequest(prId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mengapprove Purchase Request' }))
          throw new Error(errorData.message || 'Gagal mengapprove Purchase Request')
        }

        await this.fetchPurchaseRequests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Purchase Request berhasil diapprove.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error approving Purchase Request:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mengapprove Purchase Request.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectPurchaseRequest(prId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.rejectPurchaseRequest(prId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mereject Purchase Request' }))
          throw new Error(errorData.message || 'Gagal mereject Purchase Request')
        }

        await this.fetchPurchaseRequests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Purchase Request berhasil direject.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error rejecting Purchase Request:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mereject Purchase Request.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitPurchaseRequest(prId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.submitPurchaseRequest(prId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal submit Purchase Request' }))
          throw new Error(errorData.message || 'Gagal submit Purchase Request')
        }

        await this.fetchPurchaseRequests()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Purchase Request berhasil di-submit (status: pending).',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error submit Purchase Request:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal submit Purchase Request.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async getPurchaseRequestDetails(prId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const url = `${$api.purchaseRequest()}/${prId}`
        console.log('Fetching Purchase Request details from:', url)
        
        const resData = await apiFetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        console.log('Purchase Request details response:', resData)

        if (resData && resData.data) {
          this.purchaseRequest = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getPurchaseRequestDetails.')
        }
      } catch (e: any) {
        console.error('Error details:', e)
        console.error('Purchase Request ID:', prId)
        this.error = e
        throw new Error(e.message || 'Gagal mengambil detail Purchase Request')
      } finally {
        this.loading = false
      }
    },

    async openModal(prData: PurchaseRequest | null = null) {
      this.isEditMode = !!prData
      this.validationErrors = []

      if (prData) {
        await this.getPurchaseRequestDetails(prData.id)
        const fullData = this.purchaseRequest

        if (!fullData) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tidak dapat memuat data Purchase Request.',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
          return
        }

        this.originalPurchaseRequest = JSON.parse(JSON.stringify(fullData))
        const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null

        const formData: { [key: string]: any } = {
          ...JSON.parse(JSON.stringify(fullData)),
        }

        const dateFields = ['approvedAt', 'rejectedAt', 'receivedAt']
        dateFields.forEach(field => {
          if (formData[field]) {
            formData[field] = formatDate(formData[field])
          }
        })

        // Normalisasi item
        const nm = (v: any) => (v !== null && v !== undefined && v !== '') ? Number(v) : 0
        if (Array.isArray(formData.purchaseRequestItems)) {
          formData.purchaseRequestItems.forEach((item: any) => {
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

        // Set total dari data atau hitung dari items
        if (formData.total) {
          formData.total = Number(formData.total) || 0
        } else if (Array.isArray(formData.purchaseRequestItems)) {
          formData.total = formData.purchaseRequestItems.reduce((sum: number, item: any) => sum + (Number(item.subtotal) || 0), 0)
        } else {
          formData.total = 0
        }

        this.form = formData
        this.form.attachment = null
        const { getAttachmentUrl } = useImageUrl()
        this.form.attachmentPreview = fullData.attachment ? getAttachmentUrl(fullData.attachment) : null

        if (this.form.purchaseRequestItems && this.form.purchaseRequestItems.length === 0) {
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
      this.originalPurchaseRequest = null
      this.resetForm()
      this.validationErrors = []
    },

    resetForm() {
      this.form = {
        mgrfId: null,
        vendorId: null,
        description: '',
        status: 'draft',
        total: 0,
        attachment: null,
        attachmentPreview: null,
        purchaseRequestItems: [],
      }
      this.enableAdditional = false
    },

    addItem(additional: boolean = false) {
      if (!this.form.purchaseRequestItems) {
        this.form.purchaseRequestItems = []
      }
      this.form.purchaseRequestItems.push({
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
      this.form.purchaseRequestItems.splice(index, 1)
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchPurchaseRequests()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = Number(event.sortOrder) || null
      this.fetchPurchaseRequests()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchPurchaseRequests()
    },

    setFilters(filters: { mgrfId?: number | null, vendorId?: number | null, status?: string | null, startDate?: string | null, endDate?: string | null, search?: string }) {
      this.params.mgrfId = filters.mgrfId
      this.params.vendorId = filters.vendorId
      this.params.status = filters.status
      this.params.startDate = filters.startDate
      this.params.endDate = filters.endDate
      this.params.search = filters.search || ''
      this.params.first = 0
      this.fetchPurchaseRequests()
    },
  }
})
