import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface DocumentationItem {
  id: number
  title: string
  description: string | null
  type: string | null
  order?: number
  file_path?: string | null
  file_name?: string | null
  filePath?: string | null
  fileName?: string | null
  created_by?: number | null
  createdBy?: number | null
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  created_by_user?: {
    id: number
    full_name: string | null
    fullName?: string | null
    email: string
  } | null
  createdByUser?: {
    id: number
    full_name: string | null
    fullName?: string | null
    email: string
  } | null
}

interface DocumentationState {
  items: DocumentationItem[]
  flowSteps: DocumentationItem[]
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    type: string
  }
  form: Partial<DocumentationItem>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useDocumentationStore = defineStore('documentation', {
  state: (): DocumentationState => ({
    items: [],
    flowSteps: [],
    loading: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: -1,
      search: '',
      type: '',
    },
    form: {},
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),

  getters: {
    /** Untuk timeline: urutan terbaru dulu (created_at desc) */
    /** Timeline: urutan by order asc, lalu created_at asc */
    timelineItems(state): DocumentationItem[] {
      return [...state.items].sort((a, b) => {
        const orderA = a.order ?? 0
        const orderB = b.order ?? 0
        if (orderA !== orderB) return orderA - orderB
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime()
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime()
        return dateA - dateB
      })
    },
    /** Semua step untuk summary flow card, urut by order asc */
    flowStepsSorted(state): DocumentationItem[] {
      return [...state.flowSteps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    },
  },

  actions: {
    async fetchDocumentations() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const page = Math.floor(this.params.first / this.params.rows) + 1
        const params = new URLSearchParams({
          page: String(page),
          rows: String(this.params.rows),
          search: this.params.search || '',
          type: this.params.type || '',
        })
        const url = `${$api.documentations()}?${params}`
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal mengambil data dokumentasi')
        const result = await response.json()
        this.items = result.data || []
        this.totalRecords = result.meta?.total ?? this.items.length
      } catch (e: any) {
        this.error = e.message
        const toast = useToast()
        toast?.error?.({ title: 'Error', message: `Tidak dapat memuat data: ${e.message}` })
      } finally {
        this.loading = false
      }
    },

    async fetchAllForTimeline() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({ rows: '100', page: '1' })
        const response = await fetch(`${$api.documentations()}?${params}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal mengambil data dokumentasi')
        const result = await response.json()
        this.items = result.data || []
        this.totalRecords = result.meta?.total ?? this.items.length
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchFlowSteps() {
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({ rows: '100', page: '1' })
        const response = await fetch(`${$api.documentations()}?${params}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) return
        const result = await response.json()
        this.flowSteps = result.data || []
      } catch {
        this.flowSteps = []
      }
    },

    async saveDocumentation() {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      try {
        const url = this.isEditMode && this.form.id
          ? $api.documentationUpdate(this.form.id)
          : $api.documentations()
        const method = this.isEditMode ? 'PUT' : 'POST'
        const body = {
          title: this.form.title,
          description: this.form.description ?? null,
          type: this.form.type ?? null,
          order: this.form.order ?? 0,
          file_path: this.form.file_path ?? this.form.filePath ?? null,
          file_name: this.form.file_name ?? this.form.fileName ?? null,
        }
        const response = await fetch(url, {
          method,
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Dokumentasi gagal diperbarui.' : 'Dokumentasi gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        this.closeModal()
        await this.fetchDocumentations()
        await this.fetchFlowSteps()
        const toast = useToast()
        toast?.success?.({ title: 'Berhasil', message: `Dokumentasi berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.` })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Dokumentasi gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteDocumentation(id: number) {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data dokumentasi yang dihapus tidak dapat dikembalikan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) return
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.documentationDelete(id), {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Dokumentasi gagal dihapus.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchDocumentations()
        await this.fetchFlowSteps()
        const toast = useToast()
        toast?.success?.({ title: 'Berhasil', message: 'Dokumentasi berhasil dihapus.' })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Dokumentasi gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    openModal(item: DocumentationItem | null = null) {
      this.isEditMode = !!item
      this.validationErrors = []
      if (item) {
        this.form = {
          id: item.id,
          title: item.title,
          description: item.description ?? '',
          type: item.type ?? '',
          order: item.order ?? 0,
          file_path: item.file_path ?? item.filePath ?? '',
          file_name: item.file_name ?? item.fileName ?? '',
        }
      } else {
        this.form = { title: '', description: '', type: '', order: 0, file_path: '', file_name: '' }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {}
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchDocumentations()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchDocumentations()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchDocumentations()
    },

    setType(value: string) {
      this.params.type = value
      this.params.first = 0
      this.fetchDocumentations()
    },
  },
})
