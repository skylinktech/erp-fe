import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface Service {
  id: number
  name: string
  code: string
  period: number
  servicePlanId: number
  description: string
  serviceLineType?: string | null
  quotaLabel?: string | null
  billingType?: 'one_time' | 'recurring' | null
  createdBy: number
  updatedBy: number
  deletedBy?: number | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
  servicePlan?: {
    id: number
    name: string
  }
  createdByUser?: {
    id: number
    fullName: string
    email: string
  }
  updatedByUser?: {
    id: number
    fullName: string
    email: string
  }
  deletedByUser?: {
    id: number
    fullName: string
    email: string
  }
}

interface ServiceState {
  services: Service[]
  loading: boolean
  loadingStats: boolean
  error: any
  totalRecords: number
  totalServices: number
  statistics: {
    total: number
    withPlan: number
    leased: number
    addQuota: number
  }
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    serviceLineType: string
    billingType: string
  }
  form: Partial<Service>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useServiceStore = defineStore('service', {
  state: (): ServiceState => ({
    services: [],
    loading: true,
    loadingStats: false,
    error: null,
    totalRecords: 0,
    totalServices: 0,
    statistics: {
      total: 0,
      withPlan: 0,
      leased: 0,
      addQuota: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: 1,
      search: '',
      serviceLineType: '',
      billingType: '',
    },
    form: {
      name: '',
      code: '',
      period: 0,
      servicePlanId: null as number | null,
      description: '',
      serviceLineType: null as string | null,
      quotaLabel: null as string | null,
      billingType: null as 'one_time' | 'recurring' | null,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchServices(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || 'id',
          sortOrder: this.params.sortOrder === -1 ? 'desc' : 'asc',
          search: this.params.search || '',
        })
        if (this.params.serviceLineType) {
          params.set('service_line_type', this.params.serviceLineType)
        }
        if (this.params.billingType) {
          params.set('billing_type', this.params.billingType)
        }

        const response = await fetch(`${$api.service()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data service dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data service')
        }

        const result = await response.json()

        this.services = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data service: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async saveService() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      try {
        const formData = new FormData()
        Object.keys(this.form).forEach((key) => {
          const value = this.form[key as keyof typeof this.form]
          if (value !== null && value !== undefined) {
            formData.append(key, String(value))
          }
        })

        let url = $api.service()
        let method = 'POST'

        if (this.isEditMode && this.form.id) {
          url = `${$api.service()}/${this.form.id}`
          formData.append('_method', 'PUT')
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Service gagal diperbarui.' : 'Service gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }

        this.closeModal()
        await Promise.all([this.fetchServices(), this.fetchStatistics()])
        toast.success({
          title: 'Success',
          message: `Service berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Service gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteService(id: number) {
      const toast = useToast()
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data service yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#008fec',
        cancelButtonColor: '#f13636',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (!result.isConfirmed) {
        return
      }

      this.loading = true
      try {
        const response = await fetch($api.service() + `/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Service gagal dihapus.')
          toastNormalizedError(err)
          return false
        }

        await this.fetchServices()
        await Promise.all([this.fetchServices(), this.fetchStatistics()])
        toast.success({
          title: 'Success',
          message: 'Service berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Service gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    openModal(service: Service | null = null) {
      this.isEditMode = !!service
      this.validationErrors = []
      if (service) {
        this.form = {
          id: service.id,
          name: service.name,
          code: service.code ?? '',
          period: service.period,
          servicePlanId: service.servicePlanId ?? service.servicePlan?.id ?? null,
          description: service.description ?? '',
          serviceLineType: service.serviceLineType ?? null,
          quotaLabel: service.quotaLabel ?? null,
          billingType: service.billingType ?? null,
        }
      } else {
        this.form = {
          name: '',
          code: '',
          period: 0,
          servicePlanId: null,
          description: '',
          serviceLineType: null,
          quotaLabel: null,
          billingType: null,
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        name: '',
        code: '',
        period: 0,
        servicePlanId: null,
        description: '',
        serviceLineType: null,
        quotaLabel: null,
        billingType: null,
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchServices()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchServices()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchServices()
    },

    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.serviceStatistics(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        this.statistics = {
          total: Number(result.total ?? 0),
          withPlan: Number(result.withPlan ?? 0),
          leased: Number(result.leased ?? 0),
          addQuota: Number(result.addQuota ?? 0),
        }
        this.totalServices = this.statistics.total
      } catch (error: any) {
        console.error('Error fetching service statistics:', error)
      } finally {
        this.loadingStats = false
      }
    },

    /** @deprecated gunakan fetchStatistics */
    async fetchTotalServices() {
      await this.fetchStatistics()
    },

    async fetchServicesForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.serviceExportExcel()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data service untuk export dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data service untuk export')
        }

        const result = await response.json()
        return {
          data: result.data || [],
          nmPerusahaan: result.nmPerusahaan || '',
        }
      } catch (error: any) {
        console.error('Error fetching services for export:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data service untuk export',
          color: 'red',
          position: 'bottomRight',
        })
        throw error
      }
    },
  },
})
