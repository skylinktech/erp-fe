import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'

interface MgrfItem {
  id?: string
  mgrfId?: string
  productId: number
  warehouseId: number
  unitId: number
  quantity: number
  price: number
  subtotal: number
  description?: string | null
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
}

export interface Mgrf {
  id: string
  iroId: number
  noMgrf: string
  status: 'draft' | 'approved' | 'rejected' | 'pending'
  date: string
  description?: string | null
  attachment?: string | null
  total: number
  createdBy: number | null
  approvedBy: number | null
  rejectedBy: number | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt: string
  updatedAt: string
  iro?: { id: number; noIro?: string }
  createdByUser?: any
  approvedByUser?: any
  rejectedByUser?: any
  mgrfItems?: MgrfItem[]
}

interface MgrfState {
  mgrfs: Mgrf[]
  mgrf: Mgrf | null
  originalMgrf: Mgrf | null
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
    iroId?: number | null
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

export const useMgrfStore = defineStore('mgrf', {
  state: (): MgrfState => ({
    mgrfs: [],
    mgrf: null,
    originalMgrf: null,
    loading: true,
    error: null,
    totalRecords: 0,
    stats: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      iroId: null,
      status: null,
      startDate: null,
      endDate: null,
    },
    form: {
      iroId: null,
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'draft',
      total: 0,
      attachment: null,
      attachmentPreview: null,
      mgrfItems: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    enableAdditional: false,
  }),

  actions: {
    async fetchMgrfs(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.mgrf())
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: this.params.draw.toString(),
          search: this.params.search || '',
          includeItems: 'true',
        })

        if (this.params.iroId) {
          params.append('iroId', this.params.iroId.toString())
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

        if (!response.ok) throw new Error('Gagal mengambil data MGRF')

        const result = await response.json()
        this.mgrfs = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data MGRF:', e)
        this.error = e

        if (!suppressError) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data MGRF: ${e?.message || e}`,
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
      }
      try {
        const response = await fetch($api.countMgrfByStatus(), {
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

    async saveMgrf() {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        const formData = new FormData()

        const dataToAppend = { ...this.form }
        delete dataToAppend.mgrfItems
        delete dataToAppend.iro
        delete dataToAppend.createdByUser
        delete dataToAppend.approvedByUser
        delete dataToAppend.rejectedByUser
        delete dataToAppend.attachment
        delete dataToAppend.attachmentPreview

        Object.keys(dataToAppend).forEach(key => {
          const value = dataToAppend[key]
          if (value !== null && value !== undefined) {
            // Convert semua nilai ke string
            formData.append(key, String(value))
          }
        })

        if (!this.isEditMode && userStore.user && userStore.user.id) {
          formData.append('createdBy', userStore.user.id.toString())
        }

        // Filter hanya item yang valid dan lengkap
        const validItems = this.form.mgrfItems.filter((item: any) => {
          return item.productId && item.warehouseId && item.unitId && item.quantity && item.quantity > 0
        })

        if (validItems.length === 0) {
          throw new Error('Minimal harus ada 1 item yang valid (Product, Warehouse, Unit, dan Quantity harus diisi)')
        }

        // Calculate total from valid items
        let calculatedTotal = 0
        const finalValidItems: any[] = []
        
        validItems.forEach((item: any) => {
          // Pastikan semua field required dikirim dengan nilai yang valid
          const productId = Number(item.productId)
          const warehouseId = Number(item.warehouseId)
          const unitId = Number(item.unitId)
          const quantity = Number(item.quantity) || 1
          const price = Number(item.price) || 0
          const subtotal = Number(item.subtotal) || (quantity * price)

          if (!productId || !warehouseId || !unitId || quantity <= 0) {
            return // Skip item yang tidak valid
          }

          // Determine additional value - preserve from original item
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
          formData.append(`mgrfItems[${i}][productId]`, String(item.productId))
          formData.append(`mgrfItems[${i}][warehouseId]`, String(item.warehouseId))
          formData.append(`mgrfItems[${i}][unitId]`, String(item.unitId))
          formData.append(`mgrfItems[${i}][quantity]`, String(item.quantity))
          formData.append(`mgrfItems[${i}][price]`, String(item.price))
          formData.append(`mgrfItems[${i}][subtotal]`, String(item.subtotal))
          // Always append additional field, even if false
          formData.append(`mgrfItems[${i}][additional]`, item.additional ? 'true' : 'false')
          if (item.description) {
            formData.append(`mgrfItems[${i}][description]`, String(item.description))
          }
        })

        // Append total
        formData.append('total', String(calculatedTotal))

        if (this.form.attachment instanceof File) {
          formData.append('attachment', this.form.attachment)
        }

        const method = this.isEditMode ? 'POST' : 'POST'
        const url = this.isEditMode ? `${$api.mgrf()}/${this.form.id}` : $api.mgrf()
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
            throw new Error(errorData.message || 'Gagal menyimpan data MGRF')
          }
        } else {
          this.closeModal()
          await this.fetchMgrfs()
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: `MGRF berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
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

    async deleteMgrf(id: string) {
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
        const response = await fetch(`${$api.mgrf()}/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus MGRF')
        }

        await this.fetchMgrfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'MGRF berhasil dihapus.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      } catch (error: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus MGRF',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async approveMgrf(mgrfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.approveMgrf(mgrfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mengapprove MGRF' }))
          throw new Error(errorData.message || 'Gagal mengapprove MGRF')
        }

        await this.fetchMgrfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'MGRF berhasil diapprove.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error approving MGRF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mengapprove MGRF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectMgrf(mgrfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.rejectMgrf(mgrfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mereject MGRF' }))
          throw new Error(errorData.message || 'Gagal mereject MGRF')
        }

        await this.fetchMgrfs()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'MGRF berhasil direject.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error rejecting MGRF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mereject MGRF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitMgrf(mgrfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.submitMgrf(mgrfId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal submit MGRF' }))
          throw new Error(errorData.message || 'Gagal submit MGRF')
        }

        await this.fetchMgrfs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'MGRF berhasil di-submit (status: pending).',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error submit MGRF:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal submit MGRF.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async getMgrfDetails(mgrfId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const resData = await apiFetch(`${$api.mgrf()}/${mgrfId}`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (resData && resData.data) {
          this.mgrf = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getMgrfDetails.')
        }
      } catch (e: any) {
        console.error('Error details:', e)
        this.error = e
        throw new Error(e.message || 'Gagal mengambil detail MGRF')
      } finally {
        this.loading = false
      }
    },

    async openModal(mgrfData: Mgrf | null = null) {
      this.isEditMode = !!mgrfData
      this.validationErrors = []

      if (mgrfData) {
        await this.getMgrfDetails(mgrfData.id)
        const fullData = this.mgrf

        if (!fullData) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tidak dapat memuat data MGRF.',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
          return
        }

        this.originalMgrf = JSON.parse(JSON.stringify(fullData))
        const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null

        const formData: { [key: string]: any } = {
          ...JSON.parse(JSON.stringify(fullData)),
        }

        const dateFields = ['date', 'approvedAt', 'rejectedAt']
        dateFields.forEach(field => {
          if (formData[field]) {
            formData[field] = formatDate(formData[field])
          }
        })

        // Normalisasi item
        const nm = (v: any) => (v !== null && v !== undefined && v !== '') ? Number(v) : 0
        if (Array.isArray(formData.mgrfItems)) {
          formData.mgrfItems.forEach((item: any) => {
            const q = nm(item.quantity) || 1
            const p = nm(item.price) || 0
            item.quantity = q
            item.price = p
            item.subtotal = nm(item.subtotal) || q * p
            // Set additional default false jika tidak ada
            if (item.additional === undefined || item.additional === null) {
              item.additional = false
            } else {
              // Convert to boolean
              item.additional = item.additional === true || item.additional === 'true' || item.additional === 1
            }
          })
        }

        // Set total dari data atau hitung dari items
        if (formData.total) {
          formData.total = Number(formData.total) || 0
        } else if (Array.isArray(formData.mgrfItems)) {
          formData.total = formData.mgrfItems.reduce((sum: number, item: any) => sum + (Number(item.subtotal) || 0), 0)
        } else {
          formData.total = 0
        }

        this.form = formData
        this.form.attachment = null
        const { getAttachmentUrl } = useImageUrl()
        this.form.attachmentPreview = fullData.attachment ? getAttachmentUrl(fullData.attachment) : null

        if (this.form.mgrfItems && this.form.mgrfItems.length === 0) {
          this.addItem()
        }
        // Reset enableAdditional saat edit
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
      this.originalMgrf = null
      this.resetForm()
      this.validationErrors = []
    },

    resetForm() {
      this.form = {
        iroId: null,
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'draft',
        total: 0,
        attachment: null,
        attachmentPreview: null,
        mgrfItems: [],
      }
      this.enableAdditional = false
    },

    addItem(additional: boolean = false) {
      if (!this.form.mgrfItems) {
        this.form.mgrfItems = []
      }
      this.form.mgrfItems.push({
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
      this.form.mgrfItems.splice(index, 1)
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchMgrfs()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = Number(event.sortOrder) || null
      this.fetchMgrfs()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchMgrfs()
    },

    setFilters(filters: { iroId?: number | null, status?: string | null, startDate?: string | null, endDate?: string | null, search?: string }) {
      this.params.iroId = filters.iroId
      this.params.status = filters.status
      this.params.startDate = filters.startDate
      this.params.endDate = filters.endDate
      this.params.search = filters.search || ''
      this.params.first = 0
      this.fetchMgrfs()
    },
  }
})
