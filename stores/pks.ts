import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'

export interface PksDocument {
  id?: string
  pksId?: string
  docType: 'main' | 'addendum' | 'amendment'
  attachment: File | string | null
  attachmentPreview?: string | null
}

export interface PksSubscription {
  id?: string
  pksId?: string
  subscriptionId: string
  subscription?: {
    id: string
    noSubscription?: string
    status?: string
    customer?: { id: number; name: string }
  }
}

export interface Pks {
  id: string
  noPks: string
  customerId: number
  customerName: string
  description?: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  signingLocation?: string | null
  signingDate?: string | null
  custPic?: string | null
  telkomPic?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  status: 'draft' | 'signed' | 'active' | 'expired' | 'terminated'
  createdAt: string
  updatedAt: string
  customer?: { id: number; name: string }
  pksSubscriptions?: PksSubscription[]
  pksDocuments?: PksDocument[]
}

interface PksState {
  pksList: Pks[]
  pks: Pks | null
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
    customerId: number | null
    customerName: string
    description: string
    contractStartDate: string | null
    contractEndDate: string | null
    signingLocation: string
    signingDate: string | null
    custPic: string
    telkomPic: string
    approvedAt: string | null
    rejectedAt: string | null
    pksSubscriptions: PksSubscription[]
    pksDocuments: PksDocument[]
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    totalPks: number
    draftPks: number
    signedPks: number
    activePks: number
    expiredPks: number
    terminatedPks: number
  }
}

export const usePksStore = defineStore('pks', {
  state: (): PksState => ({
    pksList: [],
    pks: null,
    loading: true,
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
      id: null,
      customerId: null,
      customerName: '',
      description: '',
      contractStartDate: null,
      contractEndDate: null,
      signingLocation: '',
      signingDate: null,
      custPic: '',
      telkomPic: '',
      approvedAt: null,
      rejectedAt: null,
      pksSubscriptions: [],
      pksDocuments: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    statistics: {
      totalPks: 0,
      draftPks: 0,
      signedPks: 0,
      activePks: 0,
      expiredPks: 0,
      terminatedPks: 0,
    },
  }),

  actions: {
    async fetchPks(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.pks())
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
        if (!res.ok) throw new Error('Gagal mengambil data PKS')
        const json = await res.json()
        this.pksList = json.data ?? []
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        this.error = e
        if (!suppressError) {
          toast.error({ title: 'Error', message: `Tidak dapat memuat data PKS: ${e.message}`, color: 'red', position: 'topRight', layout: 2 })
        }
      } finally {
        this.loading = false
      }
    },

    async getPksDetails(id: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const data = await apiFetch(`${$api.pks()}/${id}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.pks = data.data
        else throw new Error('Struktur data tidak valid')
      } catch (e: any) {
        this.error = e
      } finally {
        this.loading = false
      }
    },

    async fetchPksForEdit(id: string) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const data = await apiFetch(`${$api.pks()}/${id}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.openModal(data.data)
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        this.error = e
        toast.error({ title: 'Error', message: 'Gagal mengambil data PKS untuk edit', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async savePks() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      // Validasi: minimal 1 subscription harus dipilih
      if (!this.form.pksSubscriptions || this.form.pksSubscriptions.length === 0) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Minimal 1 subscription harus dipilih', color: 'red', position: 'topRight', layout: 2 })
        return
      }

      // Validasi: semua subscription harus memiliki status == 'signed'
      try {
        for (const pksSub of this.form.pksSubscriptions) {
          if (!pksSub.subscriptionId) {
            this.loading = false
            toast.error({ title: 'Validasi', message: 'Semua subscription harus dipilih', color: 'red', position: 'topRight', layout: 2 })
            return
          }
          const subRes = await fetch(`${$api.subscription()}/${pksSub.subscriptionId}`, {
            headers: { Accept: 'application/json' },
            credentials: 'include'
          })
          if (!subRes.ok) {
            this.loading = false
            toast.error({ title: 'Validasi', message: `Gagal memverifikasi subscription ${pksSub.subscriptionId}`, color: 'red', position: 'topRight', layout: 2 })
            return
          }
          const subData = await subRes.json()
          const subscription = subData.data || subData
          const status = subscription.status
          if (status !== 'signed') {
            this.loading = false
            const noSub = subscription.noSubscription || subscription.no_subscription || pksSub.subscriptionId
            toast.error({ title: 'Validasi', message: `Subscription ${noSub} belum memiliki status 'signed'. Status saat ini: ${status}`, color: 'red', position: 'topRight', layout: 2 })
            return
          }
        }
      } catch (e: any) {
        this.loading = false
        toast.error({ title: 'Error', message: `Gagal memverifikasi subscription: ${e.message}`, color: 'red', position: 'topRight', layout: 2 })
        return
      }

      // Validasi: minimal 1 document harus diisi
      if (!this.form.pksDocuments || this.form.pksDocuments.length === 0) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Minimal 1 dokumen harus diisi', color: 'red', position: 'topRight', layout: 2 })
        return
      }

      const formData = new FormData()

      if (this.form.customerId) formData.append('customerId', String(this.form.customerId))
      if (this.form.customerName) formData.append('customerName', this.form.customerName)
      if (this.form.description) formData.append('description', this.form.description)
      if (this.form.contractStartDate) formData.append('contractStartDate', this.form.contractStartDate)
      if (this.form.contractEndDate) formData.append('contractEndDate', this.form.contractEndDate)
      if (this.form.signingLocation) formData.append('signingLocation', this.form.signingLocation)
      if (this.form.signingDate) formData.append('signingDate', this.form.signingDate)
      if (this.form.custPic) formData.append('custPic', this.form.custPic)
      if (this.form.telkomPic) formData.append('telkomPic', this.form.telkomPic)
      if (this.form.approvedAt) formData.append('approvedAt', this.form.approvedAt)
      if (this.form.rejectedAt) formData.append('rejectedAt', this.form.rejectedAt)

      // Append pksSubscriptions (many-to-many)
      formData.append('pksSubscriptions', JSON.stringify(this.form.pksSubscriptions.map((s) => ({
        subscriptionId: s.subscriptionId,
      }))))

      // Append pksDocuments dengan file attachments
      this.form.pksDocuments.forEach((doc, index) => {
        formData.append(`pksDocuments[${index}][docType]`, doc.docType)
        if (doc.attachment instanceof File) {
          formData.append(`pksDocuments[${index}][attachment]`, doc.attachment)
        } else if (doc.attachment && typeof doc.attachment === 'string') {
          // Existing attachment (untuk edit mode)
          formData.append(`pksDocuments[${index}][attachment]`, doc.attachment)
        }
      })

      const url = this.isEditMode && this.form.id ? `${$api.pks()}/${this.form.id}` : $api.pks()

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          body: formData,
        })
        if (!res.ok) {
          const ed = await res.json().catch(() => ({}))
          this.validationErrors = ed.errors || []
          toast.error({ title: 'Error', message: ed.message || (this.isEditMode ? 'Gagal memperbarui PKS' : 'Gagal menyimpan PKS'), color: 'red', position: 'topRight', layout: 2 })
          return
        }
        this.closeModal()
        await this.fetchPks()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: `PKS berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`, color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Operasi gagal', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async deletePks(id: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({ title: 'Yakin?', text: 'Data yang dihapus tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' })
      if (!ok.isConfirmed) { this.loading = false; return }
      try {
        const res = await fetch(`${$api.pks()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal menghapus PKS')
        await this.fetchPks()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'PKS berhasil dihapus', color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal menghapus PKS', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async submitPks(id: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.submitPks(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal signed PKS')
        await this.fetchPks()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'PKS berhasil di-signed', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal signed PKS', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    openModal(data: Pks | null = null) {
      this.isEditMode = !!data
      this.validationErrors = []
      if (data) {
        const raw = data as any
        const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null
        const { getAttachmentUrl } = useImageUrl()
        
        this.form = {
          id: raw.id,
          customerId: raw.customerId ?? raw.customer_id ?? raw.customer?.id ?? null,
          customerName: raw.customerName ?? raw.customer_name ?? raw.customer?.name ?? '',
          description: raw.description ?? '',
          contractStartDate: formatDate(raw.contractStartDate ?? raw.contract_start_date),
          contractEndDate: formatDate(raw.contractEndDate ?? raw.contract_end_date),
          signingLocation: raw.signingLocation ?? raw.signing_location ?? '',
          signingDate: formatDate(raw.signingDate ?? raw.signing_date),
          custPic: raw.custPic ?? raw.cust_pic ?? '',
          telkomPic: raw.telkomPic ?? raw.telkom_pic ?? '',
          approvedAt: formatDate(raw.approvedAt ?? raw.approved_at),
          rejectedAt: formatDate(raw.rejectedAt ?? raw.rejected_at),
          pksSubscriptions: (raw.pksSubscriptions ?? raw.pks_subscriptions ?? []).map((s: any) => ({
            id: s.id,
            subscriptionId: s.subscriptionId ?? s.subscription_id ?? s.subscription?.id ?? '',
            subscription: s.subscription,
          })),
          pksDocuments: (raw.pksDocuments ?? raw.pks_documents ?? []).map((d: any) => ({
            id: d.id,
            docType: d.docType ?? d.doc_type ?? 'main',
            attachment: d.attachment ?? null,
            attachmentPreview: d.attachment ? getAttachmentUrl(d.attachment) : null,
          })),
        }
      } else {
        this.resetForm()
        this.addSubscription()
        this.addDocument()
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      // Clean up blob URLs
      if (this.form.pksDocuments) {
        for (const doc of this.form.pksDocuments) {
          if (doc.attachmentPreview && doc.attachmentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(doc.attachmentPreview)
          }
        }
      }
      this.resetForm()
      this.validationErrors = []
    },

    resetForm() {
      this.form = {
        id: null,
        customerId: null,
        customerName: '',
        description: '',
        contractStartDate: null,
        contractEndDate: null,
        signingLocation: '',
        signingDate: null,
        custPic: '',
        telkomPic: '',
        approvedAt: null,
        rejectedAt: null,
        pksSubscriptions: [],
        pksDocuments: [],
      }
    },

    addSubscription() {
      if (!this.form.pksSubscriptions) {
        this.form.pksSubscriptions = []
      }
      this.form.pksSubscriptions.push({
        subscriptionId: '',
      })
    },

    removeSubscription(index: number) {
      this.form.pksSubscriptions.splice(index, 1)
    },

    addDocument() {
      if (!this.form.pksDocuments) {
        this.form.pksDocuments = []
      }
      this.form.pksDocuments.push({
        docType: 'main',
        attachment: null,
        attachmentPreview: null,
      })
    },

    removeDocument(index: number) {
      const doc = this.form.pksDocuments[index]
      if (doc.attachmentPreview && doc.attachmentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(doc.attachmentPreview)
      }
      this.form.pksDocuments.splice(index, 1)
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchPks()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchPks()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchPks()
    },

    setFilters(f: { customerId?: number | null; status?: string | null; search?: string }) {
      this.params.customerId = f.customerId
      this.params.status = f.status ?? null
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchPks()
    },

    async fetchStatistics() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.pksStatistics(), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil statistik PKS')
        const json = await res.json()
        this.statistics = json.data ?? this.statistics
      } catch (e: any) {
        toast.error({ title: 'Error', message: 'Gagal memuat statistik PKS', color: 'red', position: 'topRight', layout: 2 })
      }
    },
  },
})
