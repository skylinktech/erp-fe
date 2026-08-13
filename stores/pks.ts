import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { navigateTo, useNuxtApp } from '#app'
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
  customerId: number | null
  customerName: string | null
  description?: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  signingLocation?: string | null
  signingDate?: string | null
  custPic?: string | null
  sitePic?: string | null
  custPicNoTlp?: string | null
  sitePicNoTlp?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  status: 'draft' | 'signed' | 'active' | 'expired' | 'terminated'
  createdAt: string
  updatedAt: string
  isInternal?: boolean
  isExternal?: boolean
  noSurat?: string | null
  vendorId?: number | null
  nominal?: number | null
  purchaseOrderId?: string | null
  customer?: { id: number; name: string }
  pksSubscriptions?: PksSubscription[]
  pksDocuments?: PksDocument[]
}

interface PksState {
  pksList: Pks[]
  pks: Pks | null
  loading: boolean
  saving: boolean
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
    isInternal: boolean
    isExternal: boolean
    customerId: number | null
    customerName: string
    description: string
    contractStartDate: string | null
    contractEndDate: string | null
    signingLocation: string
    signingDate: string | null
    custPic: string
    sitePic: string
    custPicNoTlp: string
    sitePicNoTlp: string
    approvedAt: string | null
    rejectedAt: string | null
    noSurat: string
    vendorId: string | null
    nominal: string | null
    purchaseOrderId: string | null
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
    loading: false,
    saving: false,
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
      isInternal: true,
      isExternal: false,
      customerId: null,
      customerName: '',
      description: '',
      contractStartDate: null,
      contractEndDate: null,
      signingLocation: '',
      signingDate: null,
      custPic: '',
      sitePic: '',
      custPicNoTlp: '',
      sitePicNoTlp: '',
      approvedAt: null,
      rejectedAt: null,
      noSurat: '',
      vendorId: null,
      nominal: null,
      purchaseOrderId: null,
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
          toast.error({ title: 'Error', message: `Tidak dapat memuat data PKS: ${e.message}`, color: 'red', position: 'bottomRight', layout: 2 })
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
        if (data?.data) this.openModal(data.data, { noModal: true })
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        this.error = e
        toast.error({ title: 'Error', message: 'Gagal mengambil data PKS untuk edit', color: 'red', position: 'bottomRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async savePks(options?: { navigateToList?: boolean }): Promise<boolean> {
      const toast = useToast()
      this.saving = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      const formData = new FormData()
      let timeoutId: ReturnType<typeof setTimeout> | null = null

      // Mode internal/external (untuk backend menentukan skema validasi + field mana yang dipakai)
      formData.append('isInternal', String(this.form.isInternal))
      formData.append('isExternal', String(this.form.isExternal))

      // External fields
      if (this.form.noSurat) formData.append('noSurat', this.form.noSurat)
      if (this.form.vendorId != null && this.form.vendorId !== '') formData.append('vendorId', String(this.form.vendorId))
      if (this.form.nominal != null && this.form.nominal !== '') formData.append('nominal', String(this.form.nominal))
      if (this.form.purchaseOrderId) formData.append('purchaseOrderId', this.form.purchaseOrderId)

      if (this.form.customerId) formData.append('customerId', String(this.form.customerId))
      if (this.form.customerName) formData.append('customerName', this.form.customerName)
      if (this.form.description) formData.append('description', this.form.description)
      if (this.form.contractStartDate) formData.append('contractStartDate', this.form.contractStartDate)
      if (this.form.contractEndDate) formData.append('contractEndDate', this.form.contractEndDate)
      if (this.form.signingLocation) formData.append('signingLocation', this.form.signingLocation)
      if (this.form.signingDate) formData.append('signingDate', this.form.signingDate)
      if (this.form.custPic) formData.append('custPic', this.form.custPic)
      if (this.form.sitePic) formData.append('sitePic', this.form.sitePic)
      if (this.form.custPicNoTlp) formData.append('custPicNoTlp', this.form.custPicNoTlp)
      if (this.form.sitePicNoTlp) formData.append('sitePicNoTlp', this.form.sitePicNoTlp)
      if (this.form.approvedAt) formData.append('approvedAt', this.form.approvedAt)
      if (this.form.rejectedAt) formData.append('rejectedAt', this.form.rejectedAt)

      // Append pksSubscriptions (many-to-many)
      formData.append('pksSubscriptions', JSON.stringify((this.form.pksSubscriptions || []).filter((s) => !!s.subscriptionId).map((s) => ({
        subscriptionId: s.subscriptionId,
      }))))

      // Append pksDocuments dengan file attachments
      ;(this.form.pksDocuments || []).forEach((doc, index) => {
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
        const controller = new AbortController()
        timeoutId = setTimeout(() => controller.abort(), 30000)
        const res = await fetch(url, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          body: formData,
          signal: controller.signal,
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(
            res,
            this.isEditMode ? 'PKS gagal diperbarui.' : 'PKS gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        this.closeModal()
        // Jangan `await` karena jika endpoint refresh macet, spinner tombol bisa terus aktif.
        // Halaman list biasanya akan fetch ulang saat mount.
        void this.fetchPks(true)
        void this.fetchStatistics()
        toast.success({ title: 'Sukses', message: `PKS berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`, color: 'green', position: 'bottomRight', layout: 2 })
        if (options?.navigateToList) {
          await navigateTo('/order-process/pks')
        }
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'PKS gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        this.saving = false
      }
    },

    async deletePks(id: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({ title: 'Yakin?', text: 'Data yang dihapus tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#008fec', cancelButtonColor: '#f13636', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' })
      if (!ok.isConfirmed) { this.loading = false; return }
      try {
        const res = await fetch(`${$api.pks()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'PKS gagal dihapus.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchPks()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'PKS berhasil dihapus', color: 'green', position: 'bottomRight', layout: 2 })
      } catch (e: any) {
        const err = normalizeApiError(e, 'PKS gagal dihapus.')
        toastNormalizedError(err)
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
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'PKS gagal disubmit.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchPks()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'PKS berhasil di-signed', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'PKS gagal disubmit.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    openModal(data: Pks | null = null, opts?: { noModal?: boolean }) {
      this.isEditMode = !!data
      this.validationErrors = []
      if (data) {
        const raw = data as any
        const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null
        const { getAttachmentUrl } = useImageUrl()
        
        this.form = {
          id: raw.id,
          isInternal: raw.isInternal ?? raw.is_internal ?? true,
          isExternal: raw.isExternal ?? raw.is_external ?? false,
          customerId: raw.customerId ?? raw.customer_id ?? raw.customer?.id ?? null,
          customerName: raw.customerName ?? raw.customer_name ?? raw.customer?.name ?? '',
          description: raw.description ?? '',
          contractStartDate: formatDate(raw.contractStartDate ?? raw.contract_start_date),
          contractEndDate: formatDate(raw.contractEndDate ?? raw.contract_end_date),
          signingLocation: raw.signingLocation ?? raw.signing_location ?? '',
          signingDate: formatDate(raw.signingDate ?? raw.signing_date),
          custPic: raw.custPic ?? raw.cust_pic ?? '',
          sitePic: raw.sitePic ?? raw.site_pic ?? '',
          custPicNoTlp: raw.custPicNoTlp ?? raw.cust_pic_no_tlp ?? '',
          sitePicNoTlp: raw.sitePicNoTlp ?? raw.site_pic_no_tlp ?? '',
          approvedAt: formatDate(raw.approvedAt ?? raw.approved_at),
          rejectedAt: formatDate(raw.rejectedAt ?? raw.rejected_at),
          noSurat: raw.noSurat ?? raw.no_surat ?? '',
          vendorId: (raw.vendorId ?? raw.vendor_id) != null ? String(raw.vendorId ?? raw.vendor_id) : null,
          nominal: (raw.nominal ?? raw.nominal) != null ? String(raw.nominal ?? raw.nominal) : null,
          purchaseOrderId: raw.purchaseOrderId ?? raw.purchase_order_id ?? null,
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
      }
      this.showModal = !opts?.noModal
    },

    closeModal() {
      this.loading = false
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
        isInternal: true,
        isExternal: false,
        customerId: null,
        customerName: '',
        description: '',
        contractStartDate: null,
        contractEndDate: null,
        signingLocation: '',
        signingDate: null,
        custPic: '',
        sitePic: '',
        custPicNoTlp: '',
        sitePicNoTlp: '',
        approvedAt: null,
        rejectedAt: null,
        noSurat: '',
        vendorId: null,
        nominal: null,
        purchaseOrderId: null,
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
        toast.error({ title: 'Error', message: 'Gagal memuat statistik PKS', color: 'red', position: 'bottomRight', layout: 2 })
      }
    },
  },
})
