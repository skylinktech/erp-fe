import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface ServicePlan {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface ServicePlanState {
  servicePlans: ServicePlan[]
  loading: boolean
  error: any
  totalRecords: number
  totalServicePlans: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
  }
  form: Partial<ServicePlan>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useServicePlanStore = defineStore('servicePlan', {
  state: (): ServicePlanState => ({
    servicePlans: [],
    loading: true,
    error: null,
    totalRecords: 0,
    totalServicePlans: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: 1,
      search: '',
    },
    form: {
      name: '',
      description: '',
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchServicePlans(suppressError = false) {
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

        const response = await fetch(`${$api.servicePlan()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data service plan dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data service plan')
        }

        const result = await response.json()

        this.servicePlans = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data service plan: ${e.message}`,
            color: 'red',
            position: 'topRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async saveServicePlan() {
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

        let url = $api.servicePlan()
        let method = 'POST'

        if (this.isEditMode && this.form.id) {
          url = `${$api.servicePlan()}/${this.form.id}`
          formData.append('_method', 'PUT')
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
          credentials: 'include',
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
          throw new Error(result.message || 'Gagal menyimpan data service plan')
        }

        this.closeModal()
        await this.fetchServicePlans()
        await this.fetchTotalServicePlans()
        toast.success({
          title: 'Success',
          message: `Service plan berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
        })
      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'topRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async deleteServicePlan(id: number) {
      const toast = useToast()
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data service plan yang dihapus tidak dapat dikembalikan!',
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
        const response = await fetch($api.servicePlan() + `/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus service plan')
        }

        await this.fetchServicePlans()
        await this.fetchTotalServicePlans()
        toast.success({
          title: 'Success',
          message: 'Service plan berhasil dihapus.',
          color: 'green',
          position: 'topRight',
        })
      } catch (error: any) {
        console.error('Gagal menghapus service plan:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus service plan',
          color: 'red',
          position: 'topRight',
        })
      } finally {
        this.loading = false
      }
    },

    openModal(servicePlan: ServicePlan | null = null) {
      this.isEditMode = !!servicePlan
      this.validationErrors = []
      if (servicePlan) {
        this.form = {
          ...servicePlan,
        }
      } else {
        this.form = {
          name: '',
          description: '',
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        name: '',
        description: '',
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchServicePlans()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchServicePlans()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchServicePlans()
    },

    async fetchTotalServicePlans() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const response = await fetch(`${$api.servicePlan()}/totalServicePlans`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Gagal memuat total service plan')
        }

        const result = await response.json()
        this.totalServicePlans = result.total
      } catch (error: any) {
        console.error('Error fetching total service plans:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat total service plan',
          color: 'red',
          position: 'topRight',
        })
      }
    },

    async fetchServicePlansForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.servicePlanExportExcel()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data service plan untuk export dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data service plan untuk export')
        }

        const result = await response.json()
        return {
          data: result.data || [],
          nmPerusahaan: result.nmPerusahaan || '',
        }
      } catch (error: any) {
        console.error('Error fetching service plans for export:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data service plan untuk export',
          color: 'red',
          position: 'topRight',
        })
        throw error
      }
    },
  },
})
