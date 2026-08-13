import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface CostCenter {
  id?: number | string
  code: string
  name: string
  type: 'company' | 'department' | 'site' | 'project'
  parentId?: number | null
  isActive: boolean
}

interface CostCenterState {
  costCenters: CostCenter[]
  selectedCostCenter: CostCenter | null
  loading: boolean
  saving: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
  }
  form: Partial<CostCenter>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useCostCenterStore = defineStore('cost-center', {
  state: (): CostCenterState => ({
    costCenters: [],
    selectedCostCenter: null,
    loading: false,
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'code',
      sortOrder: 1,
      search: '',
    },
    form: {
      code: '',
      name: '',
      type: 'company',
      parentId: null,
      isActive: true,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),

  actions: {
    async fetchCostCenters(suppressError = false) {
      this.loading = true
      this.error = null
      const toast = useToast()
      const { $api } = useNuxtApp()

      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? '1' : '-1',
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.costCenters()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data cost center.',
          }))
          throw new Error(errorData.message || 'Gagal memuat data cost center.')
        }

        const result = await response.json()

        // Bentuk response mengikuti pola paginator AdonisJS
        if (result.data && Array.isArray(result.data)) {
          this.costCenters = result.data
          this.totalRecords = result.meta?.total || result.data.length
        } else {
          this.costCenters = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        console.error('Error fetching cost centers:', e)
        this.error = e.message
        this.costCenters = []
        this.totalRecords = 0

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data cost center: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
            icon: 'error',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async saveCostCenter() {
      this.saving = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const toast = useToast()

      try {
        // Kode di-generate otomatis oleh backend (format CC-SIP + 4 digit), tidak dikirim
        const payload = {
          name: this.form.name,
          type: this.form.type,
          parentId: this.form.parentId || null,
          isActive: this.form.isActive ?? true,
        }

        let method = 'POST'
        let url = $api.costCenters()

        if (this.isEditMode && this.form.id) {
          url = `${$api.costCenters()}/${this.form.id}`
          method = 'PUT'
        }

        const response = await fetch(url, {
          method,
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Cost Center gagal diperbarui.' : 'Cost Center gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }

        this.closeModal()
        await this.fetchCostCenters(true)

        toast.success({
          title: 'Success',
          message: `Cost center berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Cost Center gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteCostCenter(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data cost center yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (result.isConfirmed) {
        this.loading = true
        try {
          const url = `${$api.costCenters()}/${id}`

          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Cost Center gagal dihapus.')
            toastNormalizedError(err)
            return false
          }

          await this.fetchCostCenters(true)

          toast.success({
            title: 'Success',
            message: 'Cost center berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          })
        } catch (error: any) {
          const err = normalizeApiError(error, 'Cost Center gagal dihapus.')
          toastNormalizedError(err)
        } finally {
          this.loading = false
        }
      }
    },

    openModal(costCenter?: CostCenter) {
      this.isEditMode = !!costCenter
      this.validationErrors = []

      if (costCenter) {
        this.form = { ...costCenter }
      } else {
        this.form = {
          code: '',
          name: '',
          type: 'company',
          parentId: null,
          isActive: true,
        }
      }

      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        code: '',
        name: '',
        type: 'company',
        parentId: null,
        isActive: true,
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first || 0
      this.params.rows = event.rows || 10
      this.fetchCostCenters(true)
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || 'code'
      this.params.sortOrder = event.sortOrder || 1
      this.fetchCostCenters(true)
    },

    setSearch(search: string) {
      this.params.search = search
      this.params.first = 0
      this.fetchCostCenters(true)
    },

    async fetchCostCentersForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.costCentersExportExcel()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data cost center untuk export dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data cost center untuk export')
        }

        const result = await response.json()
        return {
          data: result.data || [],
          nmPerusahaan: result.nmPerusahaan || '',
        }
      } catch (error: any) {
        console.error('Error fetching cost centers for export:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data cost center untuk export',
          color: 'red',
          position: 'bottomRight',
        })
        throw error
      }
    },
  },
})

