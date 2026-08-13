import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'
import type { Customer } from './customer'
import type { User } from './userManagement'

/** Price list line option (from API site-investment/price-list-lines) */
export interface SiteInvestPriceListLineOption {
  id: number
  price_list_id: number
  priceable_type: 'product' | 'service' | 'did'
  priceable_id: number
  price: number
  quantity: number
  billing_type?: string
  billing_cycle?: string | null
  price_list?: { id: number; name: string }
  product?: { id: number; name: string; sku?: string }
  service?: { id: number; name: string; code?: string }
  did?: { id: number; code: string; name?: string }
  terminal_kit_count?: number | null
  quota_priority?: number | null
  new_service_line?: number | null
  additional_data?: number | null
}

interface SiteInvestMaterial {
  id?: string
  siteInvestId?: string
  priceListLineId: number
  quantity: number
  price: number
  subtotal: number
  isPriceOverridden?: boolean
  priceReason?: string
  priceListLine?: SiteInvestPriceListLineOption
}

interface SiteInvestService {
  id?: string
  siteInvestId?: string
  priceListLineId: number
  quantity: number
  price: number
  subtotal: number
  isPriceOverridden?: boolean
  priceReason?: string
  terminalKitCount?: number | null
  quotaPriority?: number | null
  newServiceLine?: number | null
  additionalData?: number | null
  priceListLine?: SiteInvestPriceListLineOption
}

interface SiteInvestDid {
  id?: string
  siteInvestId?: string
  priceListLineId: number
  quantity: number
  price: number
  subtotal: number
  isPriceOverridden: boolean
  priceReason?: string
  priceListLine?: SiteInvestPriceListLineOption
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
  signatureToken?: string | null
  signedAt?: string | null
  signedBy?: number | null
  didSubtotal: number
  marketingFee: number
  total: number
  grandTotal: number
  overBudget: boolean
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled'
  siteId?: number | null
  fdrId?: string | null
  fdr?: { id: string; fdrNumber?: string; name?: string }
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
  rejectReason?: string | null
  reject_reason?: string | null
  cancelledBy: number | null
  cancelledAt: string | null
  customer?: Customer
  createdByUser?: User
  approvedByUser?: User
  rejectedByUser?: User
  siteInvestMaterials?: SiteInvestMaterial[]
  siteInvestServices?: SiteInvestService[]
  notes?: string | null
  attachment?: string | null
  preparedBy?: Array<{ id_pegawai: number; nm_pegawai: string }>
  currentApprovalStep?: number | null
  signatureProgress?: { count: number; required: number }
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  approvalLogs?: Array<{
    id: number
    stepOrder: number
    action: 'approved' | 'rejected'
    remarks?: string | null
    user?: { fullName?: string; full_name?: string; email?: string }
    workflow?: { steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string; jabatan?: { nm_jabatan?: string; nmJabatan?: string }; role?: { name?: string } }> }
    createdAt?: string
  }>
}

interface SiteInvestState {
  siteInvests: SiteInvest[]
  siteInvest: SiteInvest | null
  originalSiteInvest: SiteInvest | null
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

export const useSiteInvestStore = defineStore('siteInvest', {
  state: (): SiteInvestState => ({
    siteInvests: [],
    siteInvest: null,
    originalSiteInvest: null,
    loading: true,
    saving: false,
    error: null,
    totalRecords: 0,
    stats: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
        cancelled: 0,
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
      fdrId: null,
      businessSchemeId: null,
      priority: 'medium',
      location: '',
      lat: null,
      long: null,
      siDate: new Date().toISOString().split('T')[0],
      estimatedStartDate: new Date().toISOString().split('T')[0],
      estimatedCompletionDate: new Date().toISOString().split('T')[0],
      marketingFee: 0,
      status: 'draft',
      notes: '',
      attachment: null,
      attachmentPreview: null,
      siteInvestMaterials: [],
      siteInvestServices: [],
      siteInvestDids: [],
      preparedByIds: [] as number[],
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
        this.siteInvests = result.data || []
        this.totalRecords = result.meta?.total ?? 0
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

    async saveSiteInvest(options?: { navigateToList?: boolean }) {
      this.saving = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        // Validasi: price list harus diisi untuk setiap baris yang punya quantity
        const formMaterials = this.form.siteInvestMaterials ?? []
        const formServices = this.form.siteInvestServices ?? []
        const formDids = this.form.siteInvestDids ?? []
        const plLineId = (item: any) => Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
        const qty = (item: any) => Number(item?.quantity ?? 0)
        const missingMaterial = formMaterials.some((item: any) => qty(item) > 0 && plLineId(item) <= 0)
        const missingService = formServices.some((item: any) => qty(item) > 0 && plLineId(item) <= 0)
        const missingDid = formDids.some((item: any) => qty(item) > 0 && plLineId(item) <= 0)
        if (missingMaterial || missingService || missingDid) {
          this.saving = false
          this.validationErrors = [{ priceListLineId: ['Price list harus diisi untuk setiap baris item'] }]
          const toast = useToast()
          toast.error({
            title: 'Validasi',
            message: 'Price list harus diisi untuk setiap baris Material, Service, atau DID.',
            color: 'red',
          })
          return false
        }

        const formData = new FormData()

        const dataToAppend = { ...this.form }
        delete dataToAppend.siteInvestMaterials
        delete dataToAppend.siteInvestServices
        delete dataToAppend.siteInvestDids
        delete dataToAppend.customer
        delete dataToAppend.site
        delete dataToAppend.fdr
        delete dataToAppend.businessScheme
        delete dataToAppend.createdByUser
        delete dataToAppend.approvedByUser
        delete dataToAppend.rejectedByUser
        delete dataToAppend.attachment
        delete dataToAppend.attachmentPreview
        delete dataToAppend.preparedByIds
        delete dataToAppend.preparedBy

        // Field yang nullable - selalu kirim (termasuk null/undefined)
        // Untuk FormData, kita kirim string kosong untuk null, dan backend akan menanganinya
        const nullableFields = ['customerId', 'siteId', 'fdrId', 'businessSchemeId', 'lat', 'long', 'notes']
        
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
          } else if (key === 'marketingFee') {
            const rawVal = value != null && value !== '' ? String(value).replace(/[Rp\s.]/g, '').replace(',', '.') : '0'
            const numVal = parseFloat(rawVal) || 0
            formData.append(key, String(numVal))
          } else {
            if (value !== null && value !== undefined && value !== '') {
              formData.append(key, String(value))
            }
          }
        })

        if (!this.isEditMode && userStore.user && userStore.user.id) {
          formData.append('createdBy', userStore.user.id.toString())
        }

        const materialKeys = ['priceListLineId', 'quantity', 'price', 'subtotal', 'isPriceOverridden', 'priceReason']
        const materialKeysToSnake: Record<string, string> = { priceListLineId: 'price_list_line_id', quantity: 'quantity', price: 'price', subtotal: 'subtotal', isPriceOverridden: 'is_price_overridden', priceReason: 'price_reason' }
        const materials = this.form.siteInvestMaterials ?? []
        materials.forEach((item: any, i: number) => {
          const plLineId = Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
          const qty = Number(item?.quantity ?? 0)
          if (plLineId && qty > 0) {
            materialKeys.forEach(itemKey => {
              const value = item[itemKey] ?? item[materialKeysToSnake[itemKey]]
              if (value !== null && value !== undefined) {
                formData.append(`siteInvestMaterials[${i}][${itemKey}]`, String(value))
              }
            })
          }
        })

        const serviceKeys = ['priceListLineId', 'quantity', 'price', 'subtotal', 'isPriceOverridden', 'priceReason', 'terminalKitCount', 'quotaPriority', 'newServiceLine', 'additionalData']
        const serviceKeysToSnake: Record<string, string> = { priceListLineId: 'price_list_line_id', quantity: 'quantity', price: 'price', subtotal: 'subtotal', isPriceOverridden: 'is_price_overridden', priceReason: 'price_reason', terminalKitCount: 'terminal_kit_count', quotaPriority: 'quota_priority', newServiceLine: 'new_service_line', additionalData: 'additional_data' }
        const services = this.form.siteInvestServices ?? []
        services.forEach((item: any, i: number) => {
          const plLineId = Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
          const qty = Number(item?.quantity ?? 0)
          if (plLineId && qty > 0) {
            serviceKeys.forEach(itemKey => {
              const value = item[itemKey] ?? item[serviceKeysToSnake[itemKey]]
              if (value !== null && value !== undefined) {
                formData.append(`siteInvestServices[${i}][${itemKey}]`, String(value))
              }
            })
          }
        })

        const didKeys = ['priceListLineId', 'quantity', 'price', 'subtotal', 'isPriceOverridden', 'priceReason']
        const didKeysToSnake: Record<string, string> = { priceListLineId: 'price_list_line_id', quantity: 'quantity', price: 'price', subtotal: 'subtotal', isPriceOverridden: 'is_price_overridden', priceReason: 'price_reason' }
        const dids = this.form.siteInvestDids ?? []
        dids.forEach((item: any, i: number) => {
          const plLineId = Number(item?.priceListLineId ?? item?.price_list_line_id ?? 0)
          if (plLineId) {
            didKeys.forEach(itemKey => {
              const value = item[itemKey] ?? item[didKeysToSnake[itemKey]]
              if (value !== null && value !== undefined) {
                formData.append(`siteInvestDids[${i}][${itemKey}]`, String(value))
              }
            })
          }
        })

        const preparedByIds = this.form.preparedByIds ?? []
        if (Array.isArray(preparedByIds)) {
          preparedByIds.forEach((id: unknown, i: number) => {
            const numId = typeof id === 'object' && id != null
              ? Number((id as any).id_pegawai ?? (id as any).idPegawai)
              : Number(id)
            if (!Number.isNaN(numId) && numId > 0) {
              formData.append(`preparedBy[${i}]`, String(numId))
            }
          })
        }

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
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Site Investment gagal diperbarui.' : 'Site Investment gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          const toast = useToast()
          toast.error({
            title: err.type === 'validation' ? 'Validasi' : 'Error',
            message: err.message,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
          return false
        } else {
          this.closeModal()
          await this.fetchSiteInvests()
          await this.fetchStats()
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: `Site Investment berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          })
          if (options?.navigateToList) {
            await navigateTo('/sales/site-investment')
          }
          return true
        }
      } catch (error: any) {
        const err = normalizeApiError(error, 'Site Investment gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteSiteInvest(id: string) {
      const { $api } = useNuxtApp()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!id || id === 'undefined' || id === 'null' || String(id).trim() === '' || !uuidRegex.test(String(id))) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: 'ID Site Investment tidak valid',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }

      this.loading = true
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
        return false
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
          const err = await normalizeFailedResponse(response, 'Site Investment gagal dihapus.')
          throw new Error(err.message)
        }

        await this.fetchSiteInvests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus Site Investment',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async approveSiteInvest(siteInvestId: string) {
      const { $api } = useNuxtApp()
      if (!siteInvestId || siteInvestId === 'undefined' || siteInvestId === 'null' || String(siteInvestId).trim() === '') {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: 'ID Site Investment tidak valid',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }
      this.loading = true
      this.error = null
      const result = await Swal.fire({
        title: 'Approve Site Investment',
        text: 'Apakah Anda yakin akan menyetujui Site Investment ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Approve',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
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
          const err = await normalizeFailedResponse(response, 'Site Investment gagal disetujui.')
          throw new Error(err.message)
        }

        this.params.status = null
        this.params.first = 0
        await this.fetchSiteInvests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil diapprove.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error approving site investment:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mengapprove site investment.',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async cancelSiteInvest(siteInvestId: string) {
      if (!siteInvestId || siteInvestId === 'undefined' || siteInvestId === 'null' || String(siteInvestId).trim() === '') {
        const toast = useToast()
        toast.error({ title: 'Error', message: 'ID Site Investment tidak valid', color: 'red', position: 'bottomRight', layout: 2 })
        return false
      }
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const result = await Swal.fire({
        title: 'Cancel Site Investment',
        text: 'Apakah Anda yakin akan membatalkan Site Investment ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
      try {
        const response = await fetch($api.cancelSiteInvestment(siteInvestId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Site Investment gagal dibatalkan.')
          throw new Error(err.message)
        }

        this.params.status = null
        this.params.first = 0
        await this.fetchSiteInvests()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil dibatalkan.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error cancelling site investment:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal membatalkan site investment.',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectSiteInvest(siteInvestId: string, rejectReason?: string) {
      if (!siteInvestId || siteInvestId === 'undefined' || siteInvestId === 'null' || String(siteInvestId).trim() === '') {
        const toast = useToast()
        toast.error({ title: 'Error', message: 'ID Site Investment tidak valid', color: 'red', position: 'bottomRight', layout: 2 })
        return false
      }
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      let reason = rejectReason
      if (reason === undefined) {
        const result = await Swal.fire({
          title: 'Reject Site Investment',
          html: `
            <p class="mb-4" style="text-align: center;">Apakah Anda yakin akan menolak Site Investment ini?</p>
            <div class="swal-reject-form" style="text-align: left; max-width: 100%;">
              <label for="swal-reject-reason" class="d-block mb-2 fw-medium" style="font-size: 0.9375rem;">Alasan penolakan <span class="text-danger">*</span></label>
              <textarea id="swal-reject-reason" class="form-control" rows="4" placeholder="Masukkan alasan penolakan..." style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d9dee3; border-radius: 0.375rem; resize: vertical; font-size: 0.9375rem;" required></textarea>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Ya, Reject',
          cancelButtonText: 'Batal',
          preConfirm: () => {
            const el = document.getElementById('swal-reject-reason') as HTMLTextAreaElement
            const val = el?.value?.trim() || ''
            if (!val) {
              Swal.showValidationMessage('Alasan penolakan wajib diisi')
              return false
            }
            return val
          },
        })
        if (!result.isConfirmed || typeof result.value !== 'string') {
          this.loading = false
          return false
        }
        reason = result.value
      }

      try {
        const response = await fetch($api.rejectSiteInvestment(siteInvestId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ reject_reason: reason || '' }),
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Site Investment gagal ditolak.')
          throw new Error(err.message)
        }

        this.params.status = null
        this.params.first = 0
        await this.fetchSiteInvests()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil direject.',
          color: 'green',
          position: 'bottomRight',
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
          position: 'bottomRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitSiteInvest(siteInvestId: string) {
      if (!siteInvestId || siteInvestId === 'undefined' || siteInvestId === 'null' || String(siteInvestId).trim() === '') {
        const toast = useToast()
        toast.error({ title: 'Error', message: 'ID Site Investment tidak valid', color: 'red', position: 'bottomRight', layout: 2 })
        return false
      }
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const result = await Swal.fire({
        title: 'Submit Site Investment',
        text: 'Apakah Anda yakin akan mengirim Site Investment ini? Status akan berubah menjadi Pending.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Submit',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) {
        this.loading = false
        return false
      }
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
          const err = await normalizeFailedResponse(response, 'Site Investment gagal disubmit.')
          throw new Error(err.message)
        }

        this.params.status = null
        this.params.first = 0
        await this.fetchSiteInvests()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Site Investment berhasil di-submit (status: pending).',
          color: 'green',
          position: 'bottomRight',
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
          position: 'bottomRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async getSiteInvestDetails(siId: string) {
      if (!siId || siId === 'undefined' || siId === 'null' || String(siId).trim() === '') {
        this.error = new Error('ID Site Investment tidak valid')
        return
      }
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
        const siId = siteInvestData.id ?? (siteInvestData as any).id
        if (!siId || siId === 'undefined') {
          const toast = useToast()
          toast.error({ title: 'Error', message: 'ID Site Investment tidak valid.', color: 'red', position: 'bottomRight' })
          return
        }
        await this.getSiteInvestDetails(siId)
        const fullData = this.siteInvest

        if (!fullData) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tidak dapat memuat data Site Investment.',
            color: 'red',
            position: 'bottomRight',
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

        formData.marketingFee = Number(formData.marketingFee ?? formData.marketing_fee) || 0

        // Pastikan array items pakai key camelCase (API bisa return snake_case)
        formData.siteInvestMaterials = formData.siteInvestMaterials ?? formData.site_invest_materials ?? []
        formData.siteInvestServices = formData.siteInvestServices ?? formData.site_invest_services ?? []
        formData.siteInvestDids = formData.siteInvestDids ?? formData.site_invest_dids ?? []
        const preparedByRaw = fullData.preparedBy ?? fullData.prepared_by ?? []
        formData.preparedByIds = Array.isArray(preparedByRaw)
          ? preparedByRaw
              .map((p: any) => Number(p.id_pegawai ?? p.idPegawai ?? p))
              .filter((id: number) => Number.isFinite(id) && id > 0)
          : []

        // Normalisasi item: pastikan priceListLineId dan subtotal/isPriceOverridden
        const nm = (v: any) => (v !== null && v !== undefined && v !== '') ? Number(v) : 0
        if (Array.isArray(formData.siteInvestMaterials)) {
          formData.siteInvestMaterials.forEach((m: any) => {
            m.priceListLineId = m.priceListLineId ?? m.price_list_line_id ?? 0
            const q = nm(m.quantity) || 1
            const p = nm(m.price) || 0
            m.quantity = q
            m.price = p
            m.subtotal = nm(m.subtotal) || q * p
            m.isPriceOverridden = m.isPriceOverridden ?? m.is_price_overridden ?? false
            m.priceReason = m.priceReason ?? m.price_reason ?? ''
          })
        }
        if (Array.isArray(formData.siteInvestServices)) {
          formData.siteInvestServices.forEach((s: any) => {
            s.priceListLineId = s.priceListLineId ?? s.price_list_line_id ?? 0
            const q = nm(s.quantity) || 1
            const p = nm(s.price) || 0
            s.quantity = q
            s.price = p
            s.subtotal = nm(s.subtotal) || q * p
            s.isPriceOverridden = s.isPriceOverridden ?? s.is_price_overridden ?? false
            s.priceReason = s.priceReason ?? s.price_reason ?? ''
            s.terminalKitCount = s.terminalKitCount ?? s.terminal_kit_count ?? null
            s.quotaPriority = s.quotaPriority ?? s.quota_priority ?? null
            s.newServiceLine = s.newServiceLine ?? s.new_service_line ?? null
            s.additionalData = s.additionalData ?? s.additional_data ?? null
          })
        }
        if (Array.isArray(formData.siteInvestDids)) {
          formData.siteInvestDids.forEach((d: any) => {
            d.priceListLineId = d.priceListLineId ?? d.price_list_line_id ?? 0
            const q = nm(d.quantity) || 1
            const p = nm(d.price) || 0
            d.quantity = q
            d.price = p
            d.subtotal = nm(d.subtotal) || q * p
            d.isPriceOverridden = d.isPriceOverridden ?? d.is_price_overridden ?? false
            d.priceReason = d.priceReason ?? d.price_reason ?? ''
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
      } else {
        this.resetForm()
        this.addMaterialItem()
        this.addServiceItem()
        this.addDidItem()
      }
      this.loading = false
      this.showModal = true
    },

    /** Open modal with prefilled FDR (e.g. from FDR detail "Proceed to SI" flow) */
    openModalFromFdr(fdrId: string) {
      this.isEditMode = false
      this.loading = false
      this.validationErrors = []
      this.resetForm()
      this.form.fdrId = fdrId
      this.showModal = true
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
        fdrId: null,
        businessSchemeId: null,
        priority: 'medium',
        location: '',
        lat: null,
        long: null,
        siDate: new Date().toISOString().split('T')[0],
        estimatedStartDate: new Date().toISOString().split('T')[0],
        estimatedCompletionDate: new Date().toISOString().split('T')[0],
        marketingFee: 0,
        status: 'draft',
        siteInvestMaterials: [],
        siteInvestServices: [],
        siteInvestDids: [],
        preparedByIds: [],
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
        priceListLineId: 0,
        quantity: 1,
        price: 0,
        subtotal: 0,
        isPriceOverridden: false,
        priceReason: '',
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
        priceListLineId: 0,
        quantity: 1,
        price: 0,
        subtotal: 0,
        isPriceOverridden: false,
        priceReason: '',
        terminalKitCount: null,
        quotaPriority: null,
        newServiceLine: null,
        additionalData: null,
      })
    },

    removeServiceItem(index: number) {
      this.form.siteInvestServices.splice(index, 1)
    },

    addDidItem() {
      if (!this.form.siteInvestDids) {
        this.form.siteInvestDids = []
      }
      this.form.siteInvestDids.push({
        priceListLineId: 0,
        quantity: 1,
        price: 0,
        subtotal: 0,
        isPriceOverridden: false,
        priceReason: '',
      })
    },

    removeDidItem(index: number) {
      this.form.siteInvestDids.splice(index, 1)
    },

    async fetchPriceListLines(priceableType: 'product' | 'service' | 'did') {
      const { $api } = useNuxtApp()
      const { parsePriceListLinesResponse, normalizePriceListLine } = await import('~/utils/priceListLines')
      const url = $api.siteInvestmentPriceListLines(priceableType)
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      if (!response.ok) return []
      const data = await response.json()
      return parsePriceListLinesResponse(data).map((line) => normalizePriceListLine(line))
    },

    /**
     * Fetch total stock quantity for a product (for site investment modal stock check).
     * Returns { quantity: number } or null on error.
     */
    async fetchProductStock(productId: number): Promise<{ quantity: number } | null> {
      if (!productId || Number(productId) <= 0) return null
      const { $api } = useNuxtApp()
      const url = `${$api.getProductStock()}?productId=${encodeURIComponent(productId)}`
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
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
