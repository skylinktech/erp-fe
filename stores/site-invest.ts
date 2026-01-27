import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'
import type { Customer } from './customer'
import type { User } from './userManagement'
import type { Product } from './product'
import type { Service } from './service'

interface SiteInvestMaterial {
  id?: string
  siteInvestId?: string
  productId: number
  warehouseId?: number | null
  quantity: number
  price: number
  subtotal: number
  product?: Product
}

interface SiteInvestService {
  id?: string
  siteInvestId?: string
  unitId: number
  serviceId: number
  quantity: number
  price: number
  subtotal: number
  service?: Service
  unit?: any
}

interface SiteInvestDid {
  id?: string
  siteInvestId?: string
  didId: number
  servicePlanId?: number | null
  category?: 'delivery' | 'installation' | 'survey' | 'dismantle' | null
  unitId?: number | null
  quantity: number
  price: number
  isPriceOverridden: boolean
  did?: any
}

interface SiteInvestBudget {
  id?: number
  siteInvestmentId?: string
  budgetSourceId: number
  budgetHolderId: number
  budgetSource?: any
  budgetHolder?: any
}

interface Stats {
  total: number | undefined
  draft: number | undefined
  pending: number | undefined
  approved: number | undefined
  rejected: number | undefined
  expired: number | undefined
}

export interface SiteInvest {
  id: string
  siNumber: string
  revision: number
  customerId: number | null
  name: string
  priority: 'low' | 'medium' | 'high'
  location: string
  lat: string | null
  long: string | null
  siDate: string
  estimatedStartDate: string
  estimatedCompletionDate: string
  serviceSubtotal: number
  materialSubtotal: number
  didSubtotal: number
  contingencyPercent: number
  contingencyAmount: number
  total: number
  grandTotal: number
  overBudget: boolean
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired'
  siteId?: number | null
  site?: { id: number; code?: string; name?: string; address?: string | null; latitude?: number | null; longitude?: number | null }
  businessSchemeId?: number | null
  businessScheme?: { id: number; code?: string; name?: string }
  createdAt: string
  updatedAt: string
  createdBy: number | null
  approvedBy: number | null
  approvedAt: string | null
  rejectedBy: number | null
  rejectedAt: string | null
  customer?: Customer
  createdByUser?: User
  approvedByUser?: User
  rejectedByUser?: User
  siteInvestMaterials?: SiteInvestMaterial[]
  siteInvestServices?: SiteInvestService[]
  siteInvestBudgets?: SiteInvestBudget[]
  notes?: string | null
  attachment?: string | null
}

interface SiteInvestState {
  siteInvests: SiteInvest[]
  siteInvest: SiteInvest | null
  originalSiteInvest: SiteInvest | null
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
    customerId?: number | null
    status?: string | null
    priority?: string | null
    startDate?: string | null
    endDate?: string | null
  }
  form: any
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useSiteInvestStore = defineStore('siteInvest', {
  state: (): SiteInvestState => ({
    siteInvests: [],
    siteInvest: null,
    originalSiteInvest: null,
    loading: true,
    error: null,
    totalRecords: 0,
    stats: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      customerId: null,
      status: null,
      priority: null,
      startDate: null,
      endDate: null,
    },
    form: {
      name: '',
      customerId: null,
      siteId: null,
      businessSchemeId: null,
      priority: 'medium',
      location: '',
      lat: null,
      long: null,
      siDate: new Date().toISOString().split('T')[0],
      estimatedStartDate: new Date().toISOString().split('T')[0],
      estimatedCompletionDate: new Date().toISOString().split('T')[0],
      contingencyPercent: 10,
      status: 'draft',
      notes: '',
      attachment: null,
      attachmentPreview: null,
      siteInvestMaterials: [],
      siteInvestServices: [],
      siteInvestDids: [],
      siteInvestBudgets: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),

  actions: {
    async fetchSiteInvests(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.siteInvestment())
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: this.params.draw.toString(),
          search: this.params.search || '',
          includeItems: 'true',
        })

        if (this.params.customerId) {
          params.append('customerId', this.params.customerId.toString())
        }
        if (this.params.status) {
          params.append('status', this.params.status)
        }
        if (this.params.priority) {
          params.append('priority', this.params.priority)
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

        if (!response.ok) throw new Error('Gagal mengambil data site investment')

        const result = await response.json()
        this.siteInvests = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data site investment:', e)
        this.error = e

        if (!suppressError) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Site Investment: ${e?.message || e}`,
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
        expired: undefined,
      }
      try {
        const response = await fetch($api.countSiteInvestByStatus(), {
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

    async saveSiteInvest() {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        const formData = new FormData()

        const dataToAppend = { ...this.form }
        delete dataToAppend.siteInvestMaterials
        delete dataToAppend.siteInvestServices
        delete dataToAppend.siteInvestDids
        delete dataToAppend.siteInvestBudgets
        delete dataToAppend.customer
        delete dataToAppend.site
        delete dataToAppend.businessScheme
        delete dataToAppend.createdByUser
        delete dataToAppend.approvedByUser
        delete dataToAppend.rejectedByUser
        delete dataToAppend.attachment
        delete dataToAppend.attachmentPreview

        // Field yang nullable - selalu kirim (termasuk null/undefined)
        // Untuk FormData, kita kirim string kosong untuk null, dan backend akan menanganinya
        const nullableFields = ['customerId', 'siteId', 'businessSchemeId', 'lat', 'long', 'notes']
        
        Object.keys(dataToAppend).forEach(key => {
          const value = dataToAppend[key]
          // Untuk field nullable, selalu kirim
          if (nullableFields.includes(key)) {
            if (value === null || value === undefined || value === '') {
              // Kirim string kosong untuk null/undefined, backend akan mengkonversi ke null
              formData.append(key, '')
            } else {
              formData.append(key, String(value))
            }
          } else {
            // Untuk field lain, hanya kirim jika tidak null/undefined
            if (value !== null && value !== undefined && value !== '') {
              formData.append(key, value)
            }
          }
        })

        if (!this.isEditMode && userStore.user && userStore.user.id) {
          formData.append('createdBy', userStore.user.id.toString())
        }

        this.form.siteInvestMaterials.forEach((item: any, i: number) => {
          if (item.productId && item.quantity > 0) {
            Object.keys(item).forEach(itemKey => {
              const value = item[itemKey]
              if (value !== null && value !== undefined) {
                formData.append(`siteInvestMaterials[${i}][${itemKey}]`, value)
              }
            })
          }
        })

        this.form.siteInvestServices.forEach((item: any, i: number) => {
          if (item.serviceId && item.quantity > 0) {
            Object.keys(item).forEach(itemKey => {
              const value = item[itemKey]
              if (value !== null && value !== undefined) {
                formData.append(`siteInvestServices[${i}][${itemKey}]`, value)
              }
            })
          }
        })

        this.form.siteInvestDids.forEach((item: any, i: number) => {
          if (item.didId) {
            Object.keys(item).forEach(itemKey => {
              const value = item[itemKey]
              if (value !== null && value !== undefined) {
                formData.append(`siteInvestDids[${i}][${itemKey}]`, value)
              }
            })
          }
        })

        ;(this.form.siteInvestBudgets || []).forEach((item: any, i: number) => {
          if (item.budgetSourceId && item.budgetHolderId) {
            formData.append(`siteInvestBudgets[${i}][budgetSourceId]`, item.budgetSourceId)
            formData.append(`siteInvestBudgets[${i}][budgetHolderId]`, item.budgetHolderId)
          }
        })

        if (this.form.attachment instanceof File) {
          formData.append('attachment', this.form.attachment)
        }

        const method = this.isEditMode ? 'POST' : 'POST'
        const url = this.isEditMode ? `${$api.siteInvestment()}/${this.form.id}` : $api.siteInvestment()
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
            throw new Error(errorData.message || 'Gagal menyimpan data site investment')
          }
        } else {
          this.closeModal()
          await this.fetchSiteInvests()
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: `Site Investment berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
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

    async deleteSiteInvest(id: string) {
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
        const response = await fetch(`${$api.siteInvestment()}/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus Site Investment')
        }

        await this.fetchSiteInvests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil dihapus.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      } catch (error: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus Site Investment',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async approveSiteInvest(siteInvestId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.approveSiteInvestment(siteInvestId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mengapprove site investment' }))
          
          // Handle error stock tidak mencukupi
          if (response.status === 400 && errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.join('\n')
            const toast = useToast()
            toast.error({
              title: 'Stock Tidak Mencukupi',
              message: errorMessages,
              color: 'red',
              position: 'topRight',
              layout: 2,
              duration: 5000,
            })
            throw new Error(errorMessages)
          }
          
          throw new Error(errorData.message || 'Gagal mengapprove site investment')
        }

        await this.fetchSiteInvests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil diapprove.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error approving site investment:', error)
        // Jangan tampilkan toast lagi jika sudah ditampilkan di atas
        if (!error.message || !error.message.includes('Stock')) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal mengapprove site investment.',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
        }
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectSiteInvest(siteInvestId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.rejectSiteInvestment(siteInvestId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mereject site investment' }))
          throw new Error(errorData.message || 'Gagal mereject site investment')
        }

        await this.fetchSiteInvests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil direject.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error rejecting site investment:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mereject site investment.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitSiteInvest(siteInvestId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.submitSiteInvestment(siteInvestId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal submit site investment' }))
          throw new Error(errorData.message || 'Gagal submit site investment')
        }

        await this.fetchSiteInvests()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil di-submit (status: pending).',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error submit site investment:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal submit site investment.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async getSiteInvestDetails(siId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const resData = await apiFetch(`${$api.siteInvestment()}/${siId}`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (resData && resData.data) {
          this.siteInvest = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getSiteInvestDetails.')
        }
      } catch (e: any) {
        console.error('Error details:', e)
        this.error = e
        throw new Error(e.message || 'Gagal mengambil detail site investment')
      } finally {
        this.loading = false
      }
    },

    async openModal(siteInvestData: SiteInvest | null = null) {
      this.isEditMode = !!siteInvestData
      this.validationErrors = []

      if (siteInvestData) {
        await this.getSiteInvestDetails(siteInvestData.id)
        const fullData = this.siteInvest

        if (!fullData) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tidak dapat memuat data Site Investment.',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
          return
        }

        this.originalSiteInvest = JSON.parse(JSON.stringify(fullData))
        const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null

        const formData: { [key: string]: any } = {
          ...JSON.parse(JSON.stringify(fullData)),
        }

        const dateFields = ['siDate', 'estimatedStartDate', 'estimatedCompletionDate', 'approvedAt', 'rejectedAt']
        dateFields.forEach(field => {
          if (formData[field]) {
            formData[field] = formatDate(formData[field])
          }
        })

        formData.contingencyPercent = Number(formData.contingencyPercent) || 0

        // Normalisasi item agar subtotal/price/quantity siap dipakai computed ringkasan (Total Investasi, Contingency, Grand Total)
        const nm = (v: any) => (v !== null && v !== undefined && v !== '') ? Number(v) : 0
        if (Array.isArray(formData.siteInvestMaterials)) {
          formData.siteInvestMaterials.forEach((m: any) => {
            const q = nm(m.quantity) || 1
            const p = nm(m.price) || 0
            m.quantity = q
            m.price = p
            m.subtotal = nm(m.subtotal) || q * p
          })
        }
        if (Array.isArray(formData.siteInvestServices)) {
          formData.siteInvestServices.forEach((s: any) => {
            const q = nm(s.quantity) || 1
            const p = nm(s.price) || 0
            s.quantity = q
            s.price = p
            s.subtotal = nm(s.subtotal) || q * p
          })
        }
        if (Array.isArray(formData.siteInvestDids)) {
          formData.siteInvestDids.forEach((d: any) => {
            d.quantity = nm(d.quantity) || 1
            d.price = nm(d.price) || 0
            d.servicePlanId = d.servicePlanId || null
            d.category = d.category || null
            d.unitId = d.unitId || null
          })
        }

        this.form = formData
        this.form.attachment = null
        const { getAttachmentUrl } = useImageUrl()
        this.form.attachmentPreview = fullData.attachment ? getAttachmentUrl(fullData.attachment) : null

        if (this.form.siteInvestMaterials && this.form.siteInvestMaterials.length === 0) {
          this.addMaterialItem()
        }
        if (this.form.siteInvestServices && this.form.siteInvestServices.length === 0) {
          this.addServiceItem()
        }
        if (this.form.siteInvestDids && this.form.siteInvestDids.length === 0) {
          this.addDidItem()
        }
        if (!this.form.siteInvestBudgets) {
          this.form.siteInvestBudgets = []
        }
        if (this.form.siteInvestBudgets.length === 0) {
          this.addBudgetItem()
        }
      } else {
        this.resetForm()
        this.addMaterialItem()
        this.addServiceItem()
        this.addDidItem()
        this.addBudgetItem()
      }
      this.showModal = true
    },

    addBudgetItem() {
      if (!this.form.siteInvestBudgets) {
        this.form.siteInvestBudgets = []
      }
      this.form.siteInvestBudgets.push({
        budgetSourceId: null,
        budgetHolderId: null,
      })
    },

    removeBudgetItem(index: number) {
      if (!this.form.siteInvestBudgets) return
      this.form.siteInvestBudgets.splice(index, 1)
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.originalSiteInvest = null
      this.resetForm()
      this.validationErrors = []
    },

    resetForm() {
      this.form = {
        name: '',
        customerId: null,
        siteId: null,
        businessSchemeId: null,
        priority: 'medium',
        location: '',
        lat: null,
        long: null,
        siDate: new Date().toISOString().split('T')[0],
        estimatedStartDate: new Date().toISOString().split('T')[0],
        estimatedCompletionDate: new Date().toISOString().split('T')[0],
        contingencyPercent: 10,
        status: 'draft',
        siteInvestMaterials: [],
        siteInvestServices: [],
        siteInvestDids: [],
        siteInvestBudgets: [],
        notes: '',
        attachment: null,
        attachmentPreview: null,
      }
    },

    addMaterialItem() {
      if (!this.form.siteInvestMaterials) {
        this.form.siteInvestMaterials = []
      }
      this.form.siteInvestMaterials.push({
        productId: null,
        warehouseId: null,
        quantity: 1,
        price: 0,
        subtotal: 0,
      })
    },

    removeMaterialItem(index: number) {
      this.form.siteInvestMaterials.splice(index, 1)
    },

    addServiceItem() {
      if (!this.form.siteInvestServices) {
        this.form.siteInvestServices = []
      }
      this.form.siteInvestServices.push({
        unitId: null,
        serviceId: null,
        quantity: 1,
        price: 0,
        subtotal: 0,
      })
    },

    removeServiceItem(index: number) {
      this.form.siteInvestServices.splice(index, 1)
    },

    addDidItem() {
      if (!this.form.siteInvestDids) {
        this.form.siteInvestDids = []
      }
      // Get didId from first item if exists, or use null
      const didId = this.form.siteInvestDids.length > 0 
        ? this.form.siteInvestDids[0].didId 
        : null
      this.form.siteInvestDids.push({
        didId: didId,
        servicePlanId: null,
        category: null,
        unitId: null,
        quantity: 1,
        price: 0,
        isPriceOverridden: false,
      })
    },

    removeDidItem(index: number) {
      this.form.siteInvestDids.splice(index, 1)
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchSiteInvests()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = Number(event.sortOrder) || null
      this.fetchSiteInvests()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchSiteInvests()
    },

    setFilters(filters: { customerId?: number | null, status?: string | null, priority?: string | null, startDate?: string | null, endDate?: string | null, search?: string }) {
      this.params.customerId = filters.customerId
      this.params.status = filters.status
      this.params.priority = filters.priority
      this.params.startDate = filters.startDate
      this.params.endDate = filters.endDate
      this.params.search = filters.search || ''
      this.params.first = 0
      this.fetchSiteInvests()
    },
  }
})
