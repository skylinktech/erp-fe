import { defineStore } from 'pinia'
import type { ApprovalLogEntry } from '~/types/approval'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'

export interface LeTechReviewForm {
  id?: number | null
  iroId: string | null
  quotationId: string | null
  noLr?: string | null
  legalDocMatch: boolean
  installVerif: boolean
  serviceEligi: boolean
  deviceAvailConf: boolean
  slaTermsRev: boolean
  contractTermValid: boolean
  notes: string
  status: string
  attachments?: File[] | null
  attachmentPreviews?: string[] | null
  existingAttachments?: string[] | null
}

export interface LeTechReview {
  id: number
  iroId: string | null
  quotationId: string
  noLr: string
  legalDocMatch: boolean
  installVerif: boolean
  serviceEligi: boolean
  deviceAvailConf: boolean
  slaTermsRev: boolean
  contractTermValid: boolean
  notes: string | null
  attachment: string | null
  status: string
  createdBy: number
  approvedBy: number | null
  rejectedBy: number | null
  approvedAt: string | null
  rejectedAt: string | null
  createdAt: string
  updatedAt: string
  currentApprovalStep?: number | null
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  approvalLogs?: ApprovalLogEntry[]
  quotation?: { id: string; noQuotation?: string; customerId?: number; customer?: { id: number; name?: string } }
  createdByUser?: { id: number; full_name?: string; fullName?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  rejectedByUser?: { id: number; full_name?: string; fullName?: string }
}

interface LeTechState {
  reviews: LeTechReview[]
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    quotationId?: string | null
    status?: string | null
  }
  form: LeTechReviewForm
  isEditMode: boolean
  isViewMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    total: number
    draft: number
    pending: number
    approved: number
    rejected: number
  }
}

const emptyForm = (): LeTechReviewForm => ({
  id: null,
  iroId: null,
  quotationId: null,
  legalDocMatch: false,
  installVerif: false,
  serviceEligi: false,
  deviceAvailConf: false,
  slaTermsRev: false,
  contractTermValid: false,
  notes: '',
  status: 'draft',
  attachments: null,
  attachmentPreviews: null,
  existingAttachments: null,
})

export const useLegalTechStore = defineStore('legal-tech', {
  state: (): LeTechState => ({
    reviews: [],
    loading: true,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'createdAt',
      sortOrder: 2,
      search: '',
      quotationId: null,
      status: null,
    },
    form: emptyForm(),
    isEditMode: false,
    isViewMode: false,
    showModal: false,
    validationErrors: [],
    statistics: { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0 },
  }),

  actions: {
    async fetchLeTechReviews(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.leTechReview())
        const sp = new URLSearchParams({
          page: String(Math.floor(this.params.first / this.params.rows) + 1),
          rows: String(this.params.rows),
          sortField: this.params.sortField || 'createdAt',
          sortOrder: String(this.params.sortOrder ?? 2),
          search: this.params.search || '',
        })
        if (this.params.quotationId) sp.set('quotationId', this.params.quotationId)
        if (this.params.status) sp.set('status', this.params.status)
        url.search = sp.toString()

        const r = await fetch(String(url), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!r.ok) throw new Error('Gagal mengambil data Legal-Tech Review')
        const j = await r.json()
        this.reviews = j.data ?? []
        this.totalRecords = j.meta?.total ?? 0
      } catch (e: any) {
        this.error = e
        if (!suppressError) {
          toast.error({ title: 'Error', message: `Tidak dapat memuat data: ${e.message}`, color: 'red', position: 'topRight', layout: 2 })
        }
      } finally {
        this.loading = false
      }
    },

    async getLeTechReviewDetails(reviewId: number | string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const idNum = Number(reviewId)
        if (isNaN(idNum)) {
          // Coba cari di list yang sudah ada
          const existingReview = this.reviews.find(rev => String(rev.id) === String(reviewId))
          if (existingReview) {
            this.loading = false
            return existingReview
          }
          throw new Error('ID tidak valid')
        }
        
        const r = await fetch($api.leTechReviewShow(idNum), { 
          headers: { Accept: 'application/json' }, 
          credentials: 'include' 
        })
        
        if (!r.ok) {
          // Jika 404 atau error lain, coba ambil dari list yang sudah ada
          const existingReview = this.reviews.find(rev => rev.id === idNum)
          if (existingReview) {
            this.loading = false
            return existingReview
          }
          
          const j = await r.json().catch(() => ({ message: 'Legal-Tech Review tidak ditemukan' }))
          throw new Error(j.message || 'Legal-Tech Review tidak ditemukan')
        }
        
        const j = await r.json().catch(() => ({}))
        const d = j.data || j
        
        if (!d || !d.id) {
          // Coba cari di list sebagai fallback
          const existingReview = this.reviews.find(rev => rev.id === idNum)
          if (existingReview) {
            this.loading = false
            return existingReview
          }
          throw new Error('Data tidak valid')
        }
        
        // Update review di list jika ada
        const idx = this.reviews.findIndex(r => r.id === d.id)
        if (idx >= 0) {
          this.reviews[idx] = d
        } else {
          this.reviews.push(d)
        }
        return d
      } catch (e: any) {
        this.error = e
        // Jangan throw error jika data ada di list
        const existingReview = this.reviews.find(rev => String(rev.id) === String(reviewId))
        if (existingReview) {
          console.warn('Using existing review from list due to fetch error:', e.message)
          return existingReview
        }
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchLeTechReviewForView(id: number | string) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const idNum = Number(id)
        if (isNaN(idNum)) {
          throw new Error('ID tidak valid')
        }
        const r = await fetch($api.leTechReviewShow(idNum), { headers: { Accept: 'application/json' }, credentials: 'include' })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) {
          throw new Error(j.message || 'Gagal mengambil data')
        }
        const d = j.data || j
        if (!d || !d.id) {
          throw new Error('Data tidak valid')
        }
        this.openModal(d, true)
      } catch (e: any) {
        this.error = e
        console.error('fetchLeTechReviewForView error:', e, 'ID:', id)
        toast.error({ title: 'Error', message: e.message || 'Gagal mengambil data untuk dilihat', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async fetchLeTechReviewForEdit(id: number | string) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const idNum = Number(id)
        if (isNaN(idNum)) {
          throw new Error('ID tidak valid')
        }
        const r = await fetch($api.leTechReviewShow(idNum), { headers: { Accept: 'application/json' }, credentials: 'include' })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) {
          throw new Error(j.message || 'Gagal mengambil data')
        }
        const d = j.data || j
        if (!d || !d.id) {
          throw new Error('Data tidak valid')
        }
        this.openModal(d, false)
      } catch (e: any) {
        this.error = e
        console.error('fetchLeTechReviewForEdit error:', e, 'ID:', id)
        toast.error({ title: 'Error', message: e.message || 'Gagal mengambil data untuk edit', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async saveLeTechReview() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      if (!this.form.quotationId) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Quotation wajib dipilih', color: 'red', position: 'topRight', layout: 2 })
        return
      }

      const hasFiles = this.form.attachments && this.form.attachments.length > 0
      const hasExisting = this.form.existingAttachments && this.form.existingAttachments.length > 0
      const formData = new FormData()
      if (this.form.iroId) {
        formData.append('iroId', String(this.form.iroId))
      }
      formData.append('quotationId', String(this.form.quotationId))
      formData.append('legalDocMatch', String(this.form.legalDocMatch))
      formData.append('installVerif', String(this.form.installVerif))
      formData.append('serviceEligi', String(this.form.serviceEligi))
      formData.append('deviceAvailConf', String(this.form.deviceAvailConf))
      formData.append('slaTermsRev', String(this.form.slaTermsRev))
      formData.append('contractTermValid', String(this.form.contractTermValid))
      formData.append('notes', this.form.notes || '')
      formData.append('status', this.form.status || 'draft')
      if (!this.isEditMode && userStore.user?.id) {
        formData.append('createdBy', String(userStore.user.id))
      }
      if (hasFiles) {
        for (let i = 0; i < this.form.attachments!.length; i++) {
          formData.append('attachments', this.form.attachments![i])
        }
      }
      if (this.isEditMode && hasExisting) {
        formData.append('existingAttachments', JSON.stringify(this.form.existingAttachments))
      }

      const url = this.isEditMode && this.form.id ? `${$api.leTechReview()}/${this.form.id}` : $api.leTechReview()
      const method = this.isEditMode ? 'POST' : 'POST'

      try {
        const res = await fetch(url, {
          method,
          headers: { Accept: 'application/json' },
          credentials: 'include',
          body: formData,
        })
        const ed = await res.json().catch(() => ({}))
        if (!res.ok) {
          this.validationErrors = ed.errors || []
          toast.error({ title: 'Error', message: ed.message || (this.isEditMode ? 'Gagal memperbarui' : 'Gagal menyimpan'), color: 'red', position: 'topRight', layout: 2 })
          return
        }
        this.closeModal()
        await this.fetchLeTechReviews()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: `Legal-Tech Review berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`, color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Operasi gagal', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async deleteLeTechReview(id: number | string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({ title: 'Yakin?', text: 'Data yang dihapus tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' })
      if (!ok.isConfirmed) { this.loading = false; return }
      try {
        const r = await fetch(`${$api.leTechReview()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal menghapus')
        await this.fetchLeTechReviews()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Legal-Tech Review berhasil dihapus', color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal menghapus', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async submitLeTechReview(id: number | string) {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const r = await fetch($api.submitLeTechReview(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal submit')
        await this.fetchLeTechReviews()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Legal-Tech Review berhasil di-submit', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal submit', color: 'red', position: 'topRight', layout: 2 })
        return false
      }
    },

    async approveLeTechReview(id: number | string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const r = await fetch($api.approveLeTechReview(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal approve')
        await this.fetchLeTechReviews()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Legal-Tech Review berhasil diapprove', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal approve', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectLeTechReview(id: number | string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const r = await fetch($api.rejectLeTechReview(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include' })
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal reject')
        await this.fetchLeTechReviews()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Legal-Tech Review berhasil direject', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal reject', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async openModal(data: LeTechReview | null = null, viewOnly: boolean = false) {
      this.isEditMode = !!data && !viewOnly
      this.isViewMode = !!data && viewOnly
      this.validationErrors = []
      
      if (data) {
        // Fetch detail lengkap seperti di Site Investment
        try {
          const { $api } = useNuxtApp()
          const idNum = Number(data.id)
          if (!isNaN(idNum)) {
            const r = await fetch($api.leTechReviewShow(idNum), { headers: { Accept: 'application/json' }, credentials: 'include' })
            const j = await r.json().catch(() => ({}))
            if (r.ok && j.data) {
              data = j.data
            }
          }
        } catch (e) {
          console.warn('Gagal fetch detail, menggunakan data dari tabel:', e)
        }

        const r = data as any
        const attachmentStr = r.attachment ?? null
        let existingAttachments: string[] = []
        if (attachmentStr) {
          try {
            existingAttachments = JSON.parse(attachmentStr)
            if (!Array.isArray(existingAttachments)) existingAttachments = [attachmentStr]
          } catch {
            existingAttachments = [attachmentStr]
          }
        }
        this.form = {
          id: r.id,
          iroId: r.iroId ?? r.iro_id ?? null,
          quotationId: r.quotationId ?? r.quotation_id ?? r.quotation?.id ?? null,
          noLr: r.noLr ?? r.no_lr ?? '',
          legalDocMatch: !!(r.legalDocMatch ?? r.legal_doc_match ?? false),
          installVerif: !!(r.installVerif ?? r.install_verif ?? false),
          serviceEligi: !!(r.serviceEligi ?? r.service_eligi ?? false),
          deviceAvailConf: !!(r.deviceAvailConf ?? r.device_avail_conf ?? false),
          slaTermsRev: !!(r.slaTermsRev ?? r.sla_terms_rev ?? false),
          contractTermValid: !!(r.contractTermValid ?? r.contract_term_valid ?? false),
          notes: r.notes ?? '',
          status: r.status ?? 'draft',
          attachments: null,
          attachmentPreviews: null,
          existingAttachments,
        }
      } else {
        this.form = emptyForm()
      }
      this.showModal = true
    },

    closeModal() {
      if (this.form.attachmentPreviews) {
        for (const url of this.form.attachmentPreviews) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
        }
      }
      this.showModal = false
      this.isEditMode = false
      this.isViewMode = false
      this.form = emptyForm()
      this.validationErrors = []
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchLeTechReviews()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchLeTechReviews()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchLeTechReviews()
    },

    setFilters(f: { quotationId?: string | null; status?: string | null }) {
      this.params.quotationId = f.quotationId ?? null
      this.params.status = f.status ?? null
      this.params.first = 0
      this.fetchLeTechReviews()
    },

    async fetchStatistics() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const r = await fetch($api.leTechReviewStatistics(), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!r.ok) throw new Error('Gagal mengambil statistik')
        const j = await r.json()
        this.statistics = j.data ?? this.statistics
      } catch (e: any) {
        toast.error({ title: 'Error', message: 'Gagal memuat statistik', color: 'red', position: 'topRight', layout: 2 })
      }
    },
  },
})
