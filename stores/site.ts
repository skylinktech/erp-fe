import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface Site {
  id?: number | string
  code: string
  name: string
  type: 'office' | 'warehouse' | 'tower' | 'project' | 'other'
  address?: string | null
  city?: string | null
  province?: string | null
  country?: string
  latitude?: number | null
  longitude?: number | null
  startDate?: string | null
  endDate?: string | null
  status?: 'planned' | 'active' | 'inactive' | 'closed'
  parentId?: number | null
  costCenterId?: number | null
  parent?: Site
  costCenter?: { id: number; code: string; name: string; type: string }
}

interface SiteState {
  sites: Site[]
  selectedSite: Site | null
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
  }
  form: Partial<Site>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useSiteStore = defineStore('site', {
  state: (): SiteState => ({
    sites: [],
    selectedSite: null,
    loading: false,
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
      name: '',
      type: 'office',
      address: null,
      city: null,
      province: null,
      country: 'Indonesia',
      latitude: null,
      longitude: null,
      startDate: null,
      endDate: null,
      status: 'planned',
      parentId: null,
      costCenterId: null,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),

  actions: {
    async fetchSites(suppressError = false) {
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

        const response = await fetch(`${$api.sites()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data site.',
          }))
          throw new Error(errorData.message || 'Gagal memuat data site.')
        }

        const result = await response.json()

        // Bentuk response mengikuti pola paginator AdonisJS
        if (result.data && Array.isArray(result.data)) {
          this.sites = result.data
          this.totalRecords = result.meta?.total || result.data.length
        } else {
          this.sites = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        console.error('Error fetching sites:', e)
        this.error = e.message
        this.sites = []
        this.totalRecords = 0

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data site: ${e.message}`,
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

    async saveSite(overrides?: { latitude?: unknown; longitude?: unknown }) {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const toast = useToast()

      try {
        // Konversi ke number; terima string (termasuk "1,23") dan number. Kosong/undefined/null → null.
        const toCoord = (v: unknown): number | null => {
          if (v === '' || v === undefined || v === null) return null
          const s = String(v).trim().replace(',', '.')
          if (!s) return null
          const n = Number(s)
          return isNaN(n) ? null : n
        }

        const lat = toCoord(overrides?.latitude ?? this.form.latitude)
        const lng = toCoord(overrides?.longitude ?? this.form.longitude)

        const payload = {
          name: this.form.name,
          type: this.form.type,
          address: this.form.address || null,
          city: this.form.city || null,
          province: this.form.province || null,
          country: this.form.country || 'Indonesia',
          latitude: lat,
          longitude: lng,
          startDate: this.form.startDate || null,
          endDate: this.form.endDate || null,
          status: this.form.status || 'planned',
          parentId: this.form.parentId || null,
          costCenterId: this.form.costCenterId || null,
        }

        let method = 'POST'
        let url = $api.sites()

        if (this.isEditMode && this.form.id) {
          url = `${$api.sites()}/${this.form.id}`
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
            this.isEditMode ? 'Site gagal diperbarui.' : 'Site gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }

        this.closeModal()
        await this.fetchSites(true)

        toast.success({
          title: 'Success',
          message: `Site berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Site gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteSite(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data site yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (result.isConfirmed) {
        this.loading = true
        try {
          const url = `${$api.sites()}/${id}`

          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Site gagal dihapus.')
            toastNormalizedError(err)
            return false
          }

          await this.fetchSites(true)

          toast.success({
            title: 'Success',
            message: 'Site berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          })
        } catch (error: any) {
          const err = normalizeApiError(error, 'Site gagal dihapus.')
          toastNormalizedError(err)
        } finally {
          this.loading = false
        }
      }
    },

    openModal(site?: Site) {
      this.isEditMode = !!site
      this.validationErrors = []

      if (site) {
        this.form = { ...site }
      } else {
        this.form = {
          name: '',
          type: 'office',
          address: null,
          city: null,
          province: null,
          country: 'Indonesia',
          latitude: null,
          longitude: null,
          startDate: null,
          endDate: null,
          status: 'planned',
          parentId: null,
          costCenterId: null,
        }
      }

      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        name: '',
        type: 'office',
        address: null,
        city: null,
        province: null,
        country: 'Indonesia',
        latitude: null,
        longitude: null,
        startDate: null,
        endDate: null,
        status: 'planned',
        parentId: null,
        costCenterId: null,
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first || 0
      this.params.rows = event.rows || 10
      this.fetchSites(true)
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || 'code'
      this.params.sortOrder = event.sortOrder || 1
      this.fetchSites(true)
    },

    setSearch(search: string) {
      this.params.search = search
      this.params.first = 0
      this.fetchSites(true)
    },

    async fetchSitesForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.sitesExportExcel()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data site untuk export dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data site untuk export')
        }

        const result = await response.json()
        return {
          data: result.data || [],
          nmPerusahaan: result.nmPerusahaan || '',
        }
      } catch (error: any) {
        console.error('Error fetching sites for export:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data site untuk export',
          color: 'red',
          position: 'bottomRight',
        })
        throw error
      }
    },
  },
})
