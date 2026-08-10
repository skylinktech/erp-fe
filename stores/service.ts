import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

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
  error: any
  totalRecords: number
  totalServices: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
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
    error: null,
    totalRecords: 0,
    totalServices: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: 1,
      search: '',
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

        let result
        try {
          result = await response.json()
        } catch (parseError) {
          toast.error({
            title: 'Error',
            message: 'Server response tidak valid',
            color: 'red',
          })
          throw new Error('Server response tidak valid')
        }

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            const errors = result.errors as unknown
            if (Array.isArray(errors)) {
              this.validationErrors = errors as any[]
            } else if (errors && typeof errors === 'object') {
              this.validationErrors = Object.entries(
                errors as Record<string, string | string[]>
              )
                .flatMap(([field, messages]) => {
                  const messageList = Array.isArray(messages) ? messages : [messages]
                  return messageList
                    .filter(Boolean)
                    .map((message) => ({ field, message, rule: 'unique' }))
                })
            } else {
              this.validationErrors = []
            }
            return
          }
          throw new Error(result.message || 'Gagal menyimpan data service')
        }

        this.closeModal()
        await this.fetchServices()
        await this.fetchTotalServices()
        toast.success({
          title: 'Success',
          message: `Service berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'bottomRight',
          })
        }
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
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
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
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus service')
        }

        await this.fetchServices()
        await this.fetchTotalServices()
        toast.success({
          title: 'Success',
          message: 'Service berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        console.error('Gagal menghapus service:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus service',
          color: 'red',
          position: 'bottomRight',
        })
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

    async fetchTotalServices() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const response = await fetch(`${$api.service()}/totalServices`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          throw new Error('Gagal memuat total service')
        }

        const result = await response.json()
        this.totalServices = result.total
      } catch (error: any) {
        console.error('Error fetching total services:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat total service',
          color: 'red',
          position: 'bottomRight',
        })
      }
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
