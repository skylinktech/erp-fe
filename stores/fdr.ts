import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'
import type { Customer } from './customer'
import type { User } from './userManagement'

export interface FdrPriceListLineOption {
  id            : number
  price_list_id : number
  priceable_type: 'product' | 'service' | 'did'
  priceable_id  : number
  price         : number
  quantity      : number
  billing_type?: string
  billing_cycle?: string | null
  price_list?: { id: number; name: string }
  product?: { id: number; name: string; sku?: string }
  service?: { id: number; name: string; code?: string }
  did?: {
    id: number
    code: string
    name?: string
    services?: Array<{ id: number; category: string; servicePlan?: { id: number; name: string } }>
  }
  terminal_kit_count?: number | null
  quota_priority?: number | null
  new_service_line?: number | null
  additional_data?: number | null
}

interface FdrItem {
  id?: string
  fdrId?: string
  priceListLineId: number
  quantity: number
  price: number
  subtotal: number
  isPriceOverridden?: boolean
  priceListLine?: FdrPriceListLineOption
}

interface FdrService {
  id?: string
  fdrId?: string
  priceListLineId: number
  quantity: number
  price: number
  subtotal: number
  isPriceOverridden?: boolean
  terminalKitCount?: number | null
  quotaPriority?: number | null
  newServiceLine?: number | null
  additionalData?: number | null
  priceListLine?: FdrPriceListLineOption
}

interface FdrDid {
  id?: string
  fdrId?: string
  priceListLineId: number
  quantity: number
  price: number
  subtotal: number
  isPriceOverridden?: boolean
  priceListLine?: FdrPriceListLineOption
}

interface Stats {
  total: number | undefined
  draft: number | undefined
  pending: number | undefined
  approved: number | undefined
  rejected: number | undefined
  expired: number | undefined
  cancelled: number | undefined
}

export interface Fdr {
  id: string
  fdrNumber: string
  customerId: number | null
  name: string
  priority: 'low' | 'medium' | 'high'
  quantity: number
  location: string
  fdrDate: string | null
  estimatedStartDate: string | null
  estimatedCompletionDate: string | null
  serviceSubtotal: number
  materialSubtotal: number
  didSubtotal: number
  total: number
  grandTotal: number
  overBudget: boolean
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled'
  pocNeeded: boolean
  siteId?: number | null
  site?: { id: number; code?: string; name?: string; address?: string | null }
  businessSchemeId?: number | null
  businessScheme?: { id: number; code?: string; name?: string }
  createdAt: string
  updatedAt: string
  createdBy: number | null
  approvedBy: number | null
  approvedAt: string | null
  rejectedBy: number | null
  rejectedAt: string | null
  cancelledBy: number | null
  cancelledAt: string | null
  notes?: string | null
  attachment?: string | null
  customer?: Customer
  createdByUser?: User
  approvedByUser?: User
  rejectedByUser?: User
  fdrItems?: FdrItem[]
  fdrServices?: FdrService[]
  fdrDids?: FdrDid[]
}

interface FdrState {
  fdrs: Fdr[]
  fdr: Fdr | null
  loading: boolean
  saving: boolean
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

export const useFdrStore = defineStore('fdr', {
  state: (): FdrState => ({
    fdrs        : [],
    fdr         : null,
    loading     : false,
    saving      : false,
    error       : null,
    totalRecords: 0,
    stats       : {
      total    : 0,
      draft    : 0,
      pending  : 0,
      approved : 0,
      rejected : 0,
      expired  : 0,
      cancelled: 0,
    },
    params: {
      first     : 0,
      rows      : 10,
      sortField : 'created_at',
      sortOrder : 2,
      draw      : 1,
      search    : '',
      customerId: null,
      status    : null,
      priority  : null,
      startDate : null,
      endDate   : null,
    },
    form: {
      name                   : '',
      customerId             : null,
      siteId                 : null,
      businessSchemeId       : null,
      priority               : 'medium',
      quantity               : 1,
      location               : '',
      fdrDate                : new Date().toISOString().split('T')[0],
      estimatedStartDate     : new Date().toISOString().split('T')[0],
      estimatedCompletionDate: new Date().toISOString().split('T')[0],
      pocNeeded              : false,
      status                 : 'draft',
      notes                  : '',
      attachment             : null,
      attachmentPreview      : null,
      fdrItems               : [],
      fdrServices            : [],
      fdrDids                : [],
    },
    isEditMode      : false,
    showModal       : false,
    validationErrors: [],
  }),

  actions: {
    async fetchFdrs(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.fdr())
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: this.params.draw.toString(),
          search: this.params.search || '',
          includeItems: 'true',
        })
        if (this.params.customerId) params.append('customerId', this.params.customerId.toString())
        if (this.params.status) params.append('status', this.params.status)
        if (this.params.priority) params.append('priority', this.params.priority)
        if (this.params.startDate) params.append('startDate', this.params.startDate)
        if (this.params.endDate) params.append('endDate', this.params.endDate)
        url.search = params.toString()

        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal mengambil data FDR')
        const result = await response.json()
        this.fdrs = result.data
        this.totalRecords = result.meta?.total ?? result.total ?? 0
      } catch (e: any) {
        console.error('Gagal mengambil data FDR:', e)
        this.error = e
        if (!suppressError) {
          const toast = useToast()
          toast.error({ title: 'Error', message: `Tidak dapat memuat data FDR: ${e?.message || e}`, color: 'red' })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchAllFdrsForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.fdr())
        const params = new URLSearchParams({
          page: '1',
          rows: '10000',
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: '1',
          search: this.params.search || '',
          includeItems: 'true',
        })
        if (this.params.customerId) params.append('customerId', this.params.customerId.toString())
        if (this.params.status) params.append('status', this.params.status)
        if (this.params.priority) params.append('priority', this.params.priority)
        if (this.params.startDate) params.append('startDate', this.params.startDate)
        if (this.params.endDate) params.append('endDate', this.params.endDate)
        url.search = params.toString()
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal mengambil data FDR untuk export')
        const result = await response.json()
        return Array.isArray(result.data) ? result.data : []
      } catch (e) {
        console.error(e)
        toast.error({ title: 'Error', message: 'Gagal mengambil data untuk export', color: 'red' })
        return []
      }
    },

    async fetchStats() {
      const { $api } = useNuxtApp()
      const defaultStats = { total: undefined, draft: undefined, pending: undefined, approved: undefined, rejected: undefined, expired: undefined, cancelled: undefined }
      try {
        const response = await fetch($api.countFdrByStatus(), { headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
        if (response.ok) {
          const result = await response.json()
          this.stats = result
        } else {
          this.stats = defaultStats
        }
      } catch {
        this.stats = defaultStats
      }
    },

    async saveFdr(options?: { navigateToList?: boolean }) {
      this.saving = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        const formItems = this.form.fdrItems ?? []
        const formServices = this.form.fdrServices ?? []
        const formDids = this.form.fdrDids ?? []
        const plLineId = (item: any) => Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
        const qty = (item: any) => Number(item?.quantity ?? 0)
        const missingItem = formItems.some((item: any) => qty(item) > 0 && plLineId(item) <= 0)
        const missingService = formServices.some((item: any) => qty(item) > 0 && plLineId(item) <= 0)
        const missingDid = formDids.some((item: any) => qty(item) > 0 && plLineId(item) <= 0)
        if (missingItem || missingService || missingDid) {
          this.saving = false
          this.validationErrors = [{ priceListLineId: ['Price list harus diisi untuk setiap baris item'] }]
          const toast = useToast()
          toast.error({ title: 'Validasi', message: 'Price list harus diisi untuk setiap baris Material, Service, atau DID.', color: 'red' })
          return
        }

        const formData = new FormData()
        const dataToAppend = { ...this.form }
        delete dataToAppend.fdrItems
        delete dataToAppend.fdrServices
        delete dataToAppend.fdrDids
        delete dataToAppend.customer
        delete dataToAppend.site
        delete dataToAppend.businessScheme
        delete dataToAppend.createdByUser
        delete dataToAppend.approvedByUser
        delete dataToAppend.rejectedByUser
        delete dataToAppend.attachment
        delete dataToAppend.attachmentPreview

        const nullableFields = ['customerId', 'siteId', 'businessSchemeId', 'notes']
        Object.keys(dataToAppend).forEach((key) => {
          const value = dataToAppend[key]
          if (nullableFields.includes(key)) {
            formData.append(key, value === null || value === undefined || value === '' ? '' : String(value))
          } else if (value !== null && value !== undefined && value !== '') {
            formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
          }
        })

        if (!this.isEditMode && userStore.user?.id) {
          formData.append('createdBy', userStore.user.id.toString())
        }

        const itemKeys = ['priceListLineId', 'quantity', 'price', 'subtotal', 'isPriceOverridden']
        const itemKeysToSnake: Record<string, string> = { priceListLineId: 'price_list_line_id', quantity: 'quantity', price: 'price', subtotal: 'subtotal', isPriceOverridden: 'is_price_overridden' }
        ;(this.form.fdrItems ?? []).forEach((item: any, i: number) => {
          const plLineId = Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
          const qty = Number(item?.quantity ?? 0)
          if (plLineId && qty > 0) {
            itemKeys.forEach((k) => {
              const v = item[k] ?? item[itemKeysToSnake[k]]
              if (v !== null && v !== undefined) formData.append(`fdrItems[${i}][${k}]`, String(v))
            })
          }
        })

        const serviceKeys = ['priceListLineId', 'quantity', 'price', 'subtotal', 'isPriceOverridden', 'terminalKitCount', 'quotaPriority', 'newServiceLine', 'additionalData']
        const serviceKeysToSnake: Record<string, string> = { priceListLineId: 'price_list_line_id', quantity: 'quantity', price: 'price', subtotal: 'subtotal', isPriceOverridden: 'is_price_overridden', terminalKitCount: 'terminal_kit_count', quotaPriority: 'quota_priority', newServiceLine: 'new_service_line', additionalData: 'additional_data' }
        ;(this.form.fdrServices ?? []).forEach((item: any, i: number) => {
          const plLineId = Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
          const qty = Number(item?.quantity ?? 0)
          if (plLineId && qty > 0) {
            serviceKeys.forEach((k) => {
              const v = item[k] ?? item[serviceKeysToSnake[k]]
              if (v !== null && v !== undefined) formData.append(`fdrServices[${i}][${k}]`, String(v))
            })
          }
        })

        const didKeys = ['priceListLineId', 'quantity', 'price', 'subtotal', 'isPriceOverridden']
        const didKeysToSnake: Record<string, string> = { priceListLineId: 'price_list_line_id', quantity: 'quantity', price: 'price', subtotal: 'subtotal', isPriceOverridden: 'is_price_overridden' }
        ;(this.form.fdrDids ?? []).forEach((item: any, i: number) => {
          const plLineId = Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
          if (plLineId) {
            didKeys.forEach((k) => {
              const v = item[k] ?? item[didKeysToSnake[k]]
              if (v !== null && v !== undefined) formData.append(`fdrDids[${i}][${k}]`, String(v))
            })
          }
        })

        if (this.form.attachment instanceof File) {
          formData.append('attachment', this.form.attachment)
        }

        const url = this.isEditMode ? `${$api.fdr()}/${this.form.id}` : $api.fdr()
        if (this.isEditMode) formData.append('_method', 'PUT')

        const response = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' }, body: formData, credentials: 'include' })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 422) {
            this.validationErrors = errorData.errors ?? []
            const toast = useToast()
            toast.error({ title: 'Error', message: 'Gagal Validasi', color: 'red' })
          } else {
            throw new Error(errorData.message || 'Gagal menyimpan data FDR')
          }
        } else {
          this.closeModal()
          await this.fetchFdrs()
          await this.fetchStats()
          const toast = useToast()
          toast.success({ title: 'Success', message: `FDR berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`, color: 'green', position: 'topRight', layout: 2 })
          if (options?.navigateToList) {
            await navigateTo('/sales/fdr')
          }
        }
      } catch (error: any) {
        this.validationErrors = []
        const toast = useToast()
        toast.error({ title: 'Error', message: error.message || 'Operasi gagal', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.saving = false
      }
    },

    async deleteFdr(id: string) {
      this.loading = true
      const { $api } = useNuxtApp()
      const result = await Swal.fire({ title: 'Apakah Anda yakin?', text: 'Data yang dihapus tidak dapat dikembalikan!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
      try {
        const response = await fetch(`${$api.fdr()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Gagal menghapus FDR')
        }
        await this.fetchFdrs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({ title: 'Success', message: 'FDR berhasil dihapus.', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error({ title: 'Error', message: error.message || 'Gagal menghapus FDR', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async approveFdr(fdrId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const result = await Swal.fire({ title: 'Approve FDR', text: 'Apakah Anda yakin akan menyetujui FDR ini?', icon: 'question', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Approve', cancelButtonText: 'Batal' })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
      try {
        const response = await fetch($api.approveFdr(fdrId), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Gagal mengapprove FDR')
        }
        await this.fetchFdrs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({ title: 'Success', message: 'FDR berhasil diapprove.', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error({ title: 'Error', message: error.message || 'Gagal mengapprove FDR.', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async cancelFdr(fdrId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const result = await Swal.fire({ title: 'Cancel FDR', text: 'Apakah Anda yakin akan membatalkan FDR ini?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Batalkan', cancelButtonText: 'Batal' })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
      try {
        const response = await fetch($api.cancelFdr(fdrId), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Gagal membatalkan FDR')
        }
        await this.fetchFdrs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({ title: 'Success', message: 'FDR berhasil dibatalkan.', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error({ title: 'Error', message: error.message || 'Gagal membatalkan FDR.', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectFdr(fdrId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const result = await Swal.fire({ title: 'Reject FDR', text: 'Apakah Anda yakin akan menolak FDR ini?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Reject', cancelButtonText: 'Batal' })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
      try {
        const response = await fetch($api.rejectFdr(fdrId), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Gagal mereject FDR')
        }
        await this.fetchFdrs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({ title: 'Success', message: 'FDR berhasil direject.', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error({ title: 'Error', message: error.message || 'Gagal mereject FDR.', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitFdr(fdrId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const result = await Swal.fire({ title: 'Submit FDR', text: 'Apakah Anda yakin akan mengirim FDR ini? Status akan berubah menjadi Pending.', icon: 'question', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Submit', cancelButtonText: 'Batal' })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
      try {
        const response = await fetch($api.submitFdr(fdrId), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Gagal submit FDR')
        }
        await this.fetchFdrs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({ title: 'Success', message: 'FDR berhasil di-submit (status: pending).', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error({ title: 'Error', message: error.message || 'Gagal submit FDR.', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async getFdrDetails(fdrId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const resData = await apiFetch(`${$api.fdr()}/${fdrId}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (resData?.data) {
          this.fdr = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getFdrDetails.')
        }
      } catch (e: any) {
        console.error('Error details:', e)
        this.error = e
        throw new Error(e.message || 'Gagal mengambil detail FDR')
      } finally {
        this.loading = false
      }
    },

    async openModal(fdrData: Fdr | null = null) {
      this.isEditMode = !!fdrData
      this.validationErrors = []

      if (fdrData) {
        await this.getFdrDetails(fdrData.id)
        const fullData = this.fdr
        if (!fullData) {
          const toast = useToast()
          toast.error({ title: 'Error', message: 'Tidak dapat memuat data FDR.', color: 'red', position: 'topRight', layout: 2 })
          return
        }

        const formatDate = (dateStr: string | null) => (dateStr ? new Date(dateStr).toISOString().split('T')[0] : null)
        const formData: any = { ...JSON.parse(JSON.stringify(fullData)) }
        const dateFields = ['fdrDate', 'estimatedStartDate', 'estimatedCompletionDate', 'approvedAt', 'rejectedAt']
        dateFields.forEach((f) => {
          if (formData[f]) formData[f] = formatDate(formData[f])
        })
        formData.fdrItems = formData.fdrItems ?? formData.fdr_items ?? []
        formData.fdrServices = formData.fdrServices ?? formData.fdr_services ?? []
        formData.fdrDids = formData.fdrDids ?? formData.fdr_dids ?? []

        const nm = (v: any) => (v !== null && v !== undefined && v !== '' ? Number(v) : 0)
        ;(formData.fdrItems || []).forEach((m: any) => {
          m.priceListLineId = m.priceListLineId ?? m.price_list_line_id ?? 0
          const q = nm(m.quantity) || 1
          const p = nm(m.price) || 0
          m.quantity = q
          m.price = p
          m.subtotal = nm(m.subtotal) || q * p
          m.isPriceOverridden = m.isPriceOverridden ?? m.is_price_overridden ?? false
        })
        ;(formData.fdrServices || []).forEach((s: any) => {
          s.priceListLineId = s.priceListLineId ?? s.price_list_line_id ?? 0
          const q = nm(s.quantity) || 1
          const p = nm(s.price) || 0
          s.quantity = q
          s.price = p
          s.subtotal = nm(s.subtotal) || q * p
          s.isPriceOverridden = s.isPriceOverridden ?? s.is_price_overridden ?? false
          s.terminalKitCount = s.terminalKitCount ?? s.terminal_kit_count ?? null
          s.quotaPriority = s.quotaPriority ?? s.quota_priority ?? null
          s.newServiceLine = s.newServiceLine ?? s.new_service_line ?? null
          s.additionalData = s.additionalData ?? s.additional_data ?? null
        })
        ;(formData.fdrDids || []).forEach((d: any) => {
          d.priceListLineId = d.priceListLineId ?? d.price_list_line_id ?? 0
          const q = nm(d.quantity) || 1
          const p = nm(d.price) || 0
          d.quantity = q
          d.price = p
          d.subtotal = nm(d.subtotal) || q * p
          d.isPriceOverridden = d.isPriceOverridden ?? d.is_price_overridden ?? false
        })

        this.form = formData
        this.form.attachment = null
        const { getAttachmentUrl } = useImageUrl()
        this.form.attachmentPreview = fullData.attachment ? getAttachmentUrl(fullData.attachment) : null

        if (!this.form.fdrItems?.length) this.addItem()
        if (!this.form.fdrServices?.length) this.addService()
        if (!this.form.fdrDids?.length) this.addDid()
      } else {
        this.resetForm()
        this.addItem()
        this.addService()
        this.addDid()
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
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
        quantity: 1,
        location: '',
        fdrDate: new Date().toISOString().split('T')[0],
        estimatedStartDate: new Date().toISOString().split('T')[0],
        estimatedCompletionDate: new Date().toISOString().split('T')[0],
        pocNeeded: false,
        status: 'draft',
        notes: '',
        attachment: null,
        attachmentPreview: null,
        fdrItems: [],
        fdrServices: [],
        fdrDids: [],
      }
    },

    addItem() {
      if (!this.form.fdrItems) this.form.fdrItems = []
      this.form.fdrItems.push({ priceListLineId: 0, quantity: 1, price: 0, subtotal: 0, isPriceOverridden: false })
    },
    removeItem(index: number) {
      this.form.fdrItems?.splice(index, 1)
    },

    addService() {
      if (!this.form.fdrServices) this.form.fdrServices = []
      this.form.fdrServices.push({ priceListLineId: 0, quantity: 1, price: 0, subtotal: 0, isPriceOverridden: false, terminalKitCount: null, quotaPriority: null, newServiceLine: null, additionalData: null })
    },
    removeService(index: number) {
      this.form.fdrServices?.splice(index, 1)
    },

    addDid() {
      if (!this.form.fdrDids) this.form.fdrDids = []
      this.form.fdrDids.push({ priceListLineId: 0, quantity: 1, price: 0, subtotal: 0, isPriceOverridden: false })
    },
    removeDid(index: number) {
      this.form.fdrDids?.splice(index, 1)
    },

    async fetchPriceListLines(priceableType: 'product' | 'service' | 'did') {
      const { $api } = useNuxtApp()
      const url = $api.fdrPriceListLines(priceableType)
      const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
      if (!response.ok) return []
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },

    async fetchProductStock(productId: number): Promise<{ quantity: number } | null> {
      if (!productId || Number(productId) <= 0) return null
      const { $api } = useNuxtApp()
      const url = `${$api.fdrProductStock()}?productId=${encodeURIComponent(productId)}`
      try {
        const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!response.ok) return null
        const data = await response.json()
        return data && typeof data.quantity === 'number' ? { quantity: data.quantity } : null
      } catch {
        return null
      }
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchFdrs()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = Number(event.sortOrder) ?? null
      this.fetchFdrs()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchFdrs()
    },

    setFilters(filters: { customerId?: number | null; status?: string | null; priority?: string | null; startDate?: string | null; endDate?: string | null; search?: string }) {
      this.params.customerId = filters.customerId
      this.params.status = filters.status
      this.params.priority = filters.priority
      this.params.startDate = filters.startDate
      this.params.endDate = filters.endDate
      this.params.search = filters.search || ''
      this.params.first = 0
      this.fetchFdrs()
    },
  },
})
