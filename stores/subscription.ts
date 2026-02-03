import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'

export interface SubscriptionService {
  id?: string
  subscriptionId?: string
  serviceId: number
  serviceName: string
  servicePlan: string
  planName: string
  quantity: number
  mrcAmount: number
  otcAmount: number
  startDate?: string | null
  endDate?: string | null
}

export interface SubscriptionInstallation {
  id?: string
  subscriptionId?: string
  installAddress: string
  city?: string | null
  province?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface SubscriptionContact {
  id?: string
  subscriptionId?: string
  contactType: 'billing' | 'technical'
  name: string
  department?: string | null
  phone?: string | null
  email?: string | null
}

export interface Subscription {
  id: string
  noSubscription: string
  iroId: string
  quotationId: string
  customerId: number
  customerName: string
  status: 'draft' | 'signed' | 'active' | 'terminated' | 'expired'
  contractPeriod: number
  targetActiveDate: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  paymentMethod: string
  termOfPayment: string
  leTechReviewId?: number | null
  leTechReviewAt?: string | null
  createdAt: string
  updatedAt: string
  iro?: { id: string; noIro?: string }
  quotation?: { id: string; noQuotation?: string }
  customer?: { id: number; name: string }
  subscriptionServices?: SubscriptionService[]
  subscriptionInstallations?: SubscriptionInstallation[]
  subscriptionContacts?: SubscriptionContact[]
  leTechReview?: { id: number; noReview?: string }
}

interface SubscriptionState {
  subscriptions: Subscription[]
  subscription: Subscription | null
  loading: boolean
  error: any
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
  }
  form: {
    id?: string | null
    iroId: string | null
    quotationId: string | null
    customerId: number | null
    customerName: string
    contractPeriod: number
    targetActiveDate: string | null
    contractStartDate: string | null
    contractEndDate: string | null
    paymentMethod: string
    termOfPayment: string
    subscriptionServices: SubscriptionService[]
    subscriptionInstallations: SubscriptionInstallation[]
    subscriptionContacts: SubscriptionContact[]
    attachments?: File[] | null
    attachmentPreviews?: string[] | null
    existingAttachments?: string[] | null
    leTechReviewId?: number | null
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    totalSubscriptions: number
    draftSubscriptions: number
    signedSubscriptions: number
    activeSubscriptions: number
    terminatedSubscriptions: number
    expiredSubscriptions: number
  }
}

export const useSubscriptionStore = defineStore('subscription', {
  state: (): SubscriptionState => ({
    subscriptions: [],
    subscription: null,
    loading: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      customerId: null,
      status: null,
    },
    form: {
      iroId: null,
      quotationId: null,
      customerId: null,
      customerName: '',
      contractPeriod: 12,
      targetActiveDate: null,
      contractStartDate: null,
      contractEndDate: null,
      paymentMethod: '',
      termOfPayment: '',
      subscriptionServices: [],
      subscriptionInstallations: [],
      subscriptionContacts: [],
      attachments: null,
      attachmentPreviews: null,
      existingAttachments: null,
      leTechReviewId: null,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    statistics: {
      totalSubscriptions: 0,
      draftSubscriptions: 0,
      signedSubscriptions: 0,
      activeSubscriptions: 0,
      terminatedSubscriptions: 0,
      expiredSubscriptions: 0,
    },
  }),

  actions: {
    async fetchSubscriptions(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.subscription())
        const sp = new URLSearchParams({
          page: String(Math.floor(this.params.first / this.params.rows) + 1),
          rows: String(this.params.rows),
          sortField: this.params.sortField || '',
          sortOrder: String(this.params.sortOrder ?? ''),
          draw: String(this.params.draw),
          search: this.params.search || '',
        })
        if (this.params.customerId != null) sp.append('customerId', String(this.params.customerId))
        if (this.params.status) sp.append('status', this.params.status)
        url.search = sp.toString()

        const res = await fetch(String(url), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil data Subscription')
        const json = await res.json()
        this.subscriptions = json.data ?? []
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        this.error = e
        if (!suppressError) {
          toast.error({ title: 'Error', message: `Tidak dapat memuat data Subscription: ${e.message}`, color: 'red', position: 'topRight', layout: 2 })
        }
      } finally {
        this.loading = false
      }
    },

    async getSubscriptionDetails(id: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const data = await apiFetch(`${$api.subscription()}/${id}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.subscription = data.data
        else throw new Error('Struktur data tidak valid')
      } catch (e: any) {
        this.error = e
      } finally {
        this.loading = false
      }
    },

    async fetchSubscriptionForEdit(id: string) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const data = await apiFetch(`${$api.subscription()}/${id}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.openModal(data.data)
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        this.error = e
        toast.error({ title: 'Error', message: 'Gagal mengambil data Subscription untuk edit', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async saveSubscription() {
      console.log('saveSubscription: START')
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      if (!this.form.quotationId || !this.form.customerId) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Quotation dan Customer wajib diisi', color: 'red', position: 'topRight', layout: 2 })
        return false
      }

      if (!this.form.contractPeriod || this.form.contractPeriod <= 0) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Contract Period harus lebih dari 0', color: 'red', position: 'topRight', layout: 2 })
        return false
      }

      if (this.form.subscriptionServices.length === 0) {
        this.loading = false
        console.error('Validation failed: subscriptionServices is empty', this.form)
        toast.error({ title: 'Validasi', message: 'Minimal 1 service harus diisi. Pastikan Quotation sudah memiliki services.', color: 'red', position: 'topRight', layout: 2 })
        return false
      }

      // Validasi planName untuk setiap service
      for (let i = 0; i < this.form.subscriptionServices.length; i++) {
        const s = this.form.subscriptionServices[i]
        if (!s.planName || s.planName.trim() === '') {
          // Jika planName kosong, gunakan servicePlan sebagai fallback
          if (s.servicePlan && s.servicePlan.trim() !== '') {
            s.planName = s.servicePlan
          } else {
            this.loading = false
            toast.error({ title: 'Validasi', message: `Plan Name untuk service ${i + 1} wajib diisi`, color: 'red', position: 'topRight', layout: 2 })
            return false
          }
        }
      }

      if (this.form.subscriptionInstallations.length === 0) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Minimal 1 installation address harus diisi', color: 'red', position: 'topRight', layout: 2 })
        return false
      }

      const hasFiles = this.form.attachments && this.form.attachments.length > 0
      const hasExisting = this.form.existingAttachments && this.form.existingAttachments.length > 0
      const formData = new FormData()

      formData.append('iroId', this.form.iroId || '')
      formData.append('quotationId', String(this.form.quotationId))
      formData.append('customerId', String(this.form.customerId))
      formData.append('customerName', this.form.customerName)
      formData.append('contractPeriod', String(this.form.contractPeriod))
      if (this.form.targetActiveDate) formData.append('targetActiveDate', this.form.targetActiveDate)
      if (this.form.contractStartDate) formData.append('contractStartDate', this.form.contractStartDate)
      if (this.form.contractEndDate) formData.append('contractEndDate', this.form.contractEndDate)
      formData.append('paymentMethod', this.form.paymentMethod)
      formData.append('termOfPayment', this.form.termOfPayment)
      formData.append('subscriptionServices', JSON.stringify(this.form.subscriptionServices.map((s) => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName || '',
        servicePlan: s.servicePlan || '',
        planName: s.planName || s.servicePlan || '',
        quantity: Number(s.quantity) || 1,
        mrcAmount: Number(s.mrcAmount) || 0,
        otcAmount: Number(s.otcAmount) || 0,
        startDate: s.startDate || null,
        endDate: s.endDate || null,
      }))))
      formData.append('subscriptionInstallations', JSON.stringify(this.form.subscriptionInstallations.map((i) => ({
        installAddress: i.installAddress,
        city: i.city || null,
        province: i.province || null,
        latitude: i.latitude ? Number(i.latitude) : null,
        longitude: i.longitude ? Number(i.longitude) : null,
      }))))
      formData.append('subscriptionContacts', JSON.stringify(this.form.subscriptionContacts.map((c) => ({
        contactType: c.contactType,
        name: c.name,
        department: c.department || null,
        phone: c.phone || null,
        email: c.email || null,
      }))))

      if (hasFiles) {
        for (let i = 0; i < this.form.attachments!.length; i++) {
          formData.append('attachments', this.form.attachments![i])
        }
      }
      if (this.isEditMode && hasExisting) {
        formData.append('existingAttachments', JSON.stringify(this.form.existingAttachments))
      }

      const url = this.isEditMode && this.form.id ? `${$api.subscription()}/${this.form.id}` : $api.subscription()

      try {
        console.log('saveSubscription: Sending request to', url)
        const res = await fetch(url, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          body: formData,
        })
        
        console.log('saveSubscription: Got response', res.status, res.statusText)
        const responseData = await res.json().catch(() => ({}))
        console.log('saveSubscription: Response data', responseData)
        
        if (!res.ok) {
          console.error('Subscription save error:', responseData)
          this.validationErrors = responseData.errors || []
          const errorMessage = responseData.message || (this.isEditMode ? 'Gagal memperbarui Subscription' : 'Gagal menyimpan Subscription')
          toast.error({ title: 'Error', message: errorMessage, color: 'red', position: 'topRight', layout: 2 })
          console.log('saveSubscription: Returning false (not ok)')
          this.loading = false
          return false
        }
        
        console.log('saveSubscription: Success, closing modal and refreshing data')
        this.closeModal()
        await this.fetchSubscriptions()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: `Subscription berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`, color: 'green', position: 'topRight', layout: 2 })
        console.log('saveSubscription: Returning true')
        return true
      } catch (e: any) {
        console.error('saveSubscription: Caught error', e)
        toast.error({ title: 'Error', message: e.message || 'Operasi gagal', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        console.log('saveSubscription: Finally block, setting loading to false')
        this.loading = false
      }
    },

    async deleteSubscription(id: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({ title: 'Yakin?', text: 'Data yang dihapus tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' })
      if (!ok.isConfirmed) { this.loading = false; return }
      try {
        const res = await fetch(`${$api.subscription()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal menghapus Subscription')
        await this.fetchSubscriptions()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Subscription berhasil dihapus', color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal menghapus Subscription', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async submitSubscription(id: string) {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.submitSubscription(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal submit Subscription')
        await this.fetchSubscriptions()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Subscription berhasil di-submit', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal submit Subscription', color: 'red', position: 'topRight', layout: 2 })
        return false
      }
    },

    // Open modal with prefilled data from Legal Tech Review
    openModalFromLeTechReview(leTechReview: any) {
      console.log('openModalFromLeTechReview called with:', leTechReview)
      this.isEditMode = false
      this.validationErrors = []
      this.loading = false // Ensure loading is reset when opening modal
      
      // Reset form with default values
      this.form = {
        id: null,
        iroId: leTechReview.iroId ?? leTechReview.iro_id ?? leTechReview.iro?.id ?? null,
        quotationId: leTechReview.quotationId ?? leTechReview.quotation_id ?? leTechReview.quotation?.id ?? null,
        customerId: leTechReview.quotation?.customerId ?? leTechReview.quotation?.customer_id ?? leTechReview.quotation?.customer?.id ?? null,
        customerName: leTechReview.quotation?.customer?.name ?? leTechReview.quotation?.customerName ?? '',
        contractPeriod: 12,
        targetActiveDate: null,
        contractStartDate: null,
        contractEndDate: null,
        paymentMethod: '',
        termOfPayment: '',
        subscriptionServices: [],
        subscriptionInstallations: [],
        subscriptionContacts: [],
        attachments: null,
        attachmentPreviews: null,
        existingAttachments: null,
      }
      
      // Store the leTechReviewId for reference
      ;(this.form as any).leTechReviewId = leTechReview.id
      
      this.showModal = true
    },

    openModal(data: Subscription | null = null) {
      this.isEditMode = !!data
      this.validationErrors = []
      this.loading = false // Ensure loading is reset when opening modal
      if (data) {
        const raw = data as any
        this.form = {
          id: raw.id,
          iroId: raw.iroId ?? raw.iro_id ?? raw.iro?.id ?? null,
          quotationId: raw.quotationId ?? raw.quotation_id ?? raw.quotation?.id ?? null,
          customerId: raw.customerId ?? raw.customer_id ?? raw.customer?.id ?? null,
          customerName: raw.customerName ?? raw.customer_name ?? raw.customer?.name ?? '',
          contractPeriod: Number(raw.contractPeriod ?? raw.contract_period) || 12,
          targetActiveDate: raw.targetActiveDate ?? raw.target_active_date ? new Date(raw.targetActiveDate ?? raw.target_active_date).toISOString().split('T')[0] : null,
          contractStartDate: raw.contractStartDate ?? raw.contract_start_date ? new Date(raw.contractStartDate ?? raw.contract_start_date).toISOString().split('T')[0] : null,
          contractEndDate: raw.contractEndDate ?? raw.contract_end_date ? new Date(raw.contractEndDate ?? raw.contract_end_date).toISOString().split('T')[0] : null,
          paymentMethod: raw.paymentMethod ?? raw.payment_method ?? '',
          termOfPayment: raw.termOfPayment ?? raw.term_of_payment ?? '',
          subscriptionServices: (raw.subscriptionServices ?? raw.subscription_services ?? []).map((s: any) => ({
            id: s.id,
            serviceId: s.serviceId ?? s.service_id ?? s.service?.id,
            serviceName: s.serviceName ?? s.service_name ?? s.service?.name ?? '',
            servicePlan: s.servicePlan ?? s.service_plan ?? s.servicePlan?.name ?? s.service?.servicePlan?.name ?? '',
            planName: s.planName ?? s.plan_name ?? '',
            quantity: Number(s.quantity) || 1,
            mrcAmount: Number(s.mrcAmount ?? s.mrc_amount) || 0,
            otcAmount: Number(s.otcAmount ?? s.otc_amount) || 0,
            startDate: s.startDate ?? s.start_date ? new Date(s.startDate ?? s.start_date).toISOString().split('T')[0] : null,
            endDate: s.endDate ?? s.end_date ? new Date(s.endDate ?? s.end_date).toISOString().split('T')[0] : null,
          })),
          subscriptionInstallations: (raw.subscriptionInstallations ?? raw.subscription_installations ?? []).map((i: any) => ({
            id: i.id,
            installAddress: i.installAddress ?? i.install_address ?? '',
            city: i.city ?? null,
            province: i.province ?? null,
            latitude: i.latitude ? Number(i.latitude) : null,
            longitude: i.longitude ? Number(i.longitude) : null,
          })),
          subscriptionContacts: (raw.subscriptionContacts ?? raw.subscription_contacts ?? []).map((c: any) => ({
            id: c.id,
            contactType: c.contactType ?? c.contact_type ?? 'billing',
            name: c.name ?? '',
            department: c.department ?? null,
            phone: c.phone ?? null,
            email: c.email ?? null,
          })),
          attachments: null,
          attachmentPreviews: null,
          existingAttachments: (() => {
            const attachmentStr = raw.attachment ?? null
            if (attachmentStr) {
              try {
                const parsed = JSON.parse(attachmentStr)
                return Array.isArray(parsed) ? parsed : [attachmentStr]
              } catch (e) {
                return [attachmentStr]
              }
            }
            return null
          })(),
        }
      } else {
        this.form = {
          id: null,
          iroId: null,
          quotationId: null,
          customerId: null,
          customerName: '',
          contractPeriod: 12,
          targetActiveDate: null,
          contractStartDate: null,
          contractEndDate: null,
          paymentMethod: '',
          termOfPayment: '',
          subscriptionServices: [],
          subscriptionInstallations: [],
          subscriptionContacts: [],
          attachments: null,
          attachmentPreviews: null,
          existingAttachments: null,
          leTechReviewId: null,
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      // Clean up blob URLs
      if (this.form.attachmentPreviews) {
        for (const url of this.form.attachmentPreviews) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
        }
      }
      this.form = {
        id: null,
        iroId: null,
        quotationId: null,
        customerId: null,
        customerName: '',
        contractPeriod: 12,
        targetActiveDate: null,
        contractStartDate: null,
        contractEndDate: null,
        paymentMethod: '',
        termOfPayment: '',
        subscriptionServices: [],
        subscriptionInstallations: [],
        subscriptionContacts: [],
        attachments: null,
        attachmentPreviews: null,
        existingAttachments: null,
        leTechReviewId: null,
      }
      this.validationErrors = []
    },

    addService() {
      this.form.subscriptionServices.push({
        serviceId: 0,
        serviceName: '',
        servicePlan: '',
        planName: '',
        quantity: 1,
        mrcAmount: 0,
        otcAmount: 0,
        startDate: null,
        endDate: null,
      })
    },

    removeService(index: number) {
      this.form.subscriptionServices.splice(index, 1)
    },

    addInstallation() {
      this.form.subscriptionInstallations.push({
        installAddress: '',
        city: null,
        province: null,
        latitude: null,
        longitude: null,
      })
    },

    removeInstallation(index: number) {
      this.form.subscriptionInstallations.splice(index, 1)
    },

    addContact() {
      this.form.subscriptionContacts.push({
        contactType: 'billing',
        name: '',
        department: null,
        phone: null,
        email: null,
      })
    },

    removeContact(index: number) {
      this.form.subscriptionContacts.splice(index, 1)
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchSubscriptions()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchSubscriptions()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchSubscriptions()
    },

    setFilters(f: { customerId?: number | null; status?: string | null; search?: string }) {
      this.params.customerId = f.customerId
      this.params.status = f.status ?? null
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchSubscriptions()
    },

    async fetchStatistics() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.subscriptionStatistics(), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil statistik Subscription')
        const json = await res.json()
        this.statistics = json.data ?? this.statistics
      } catch (e: any) {
        toast.error({ title: 'Error', message: 'Gagal memuat statistik Subscription', color: 'red', position: 'topRight', layout: 2 })
      }
    },
  },
})
