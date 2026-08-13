import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface ServiceType {
  id: number
  name: string
  description: string | null
  sortOrder: number
}

export interface ServicePlan {
  id: number
  serviceTypeId?: number | null
  serviceType?: ServiceType | null
  name: string
  description: string | null
  planFunction?: string | null
  quota?: string | null
  typeQuota?: string | null
  contractMonth?: number | null
  fup?: string | null
  hasIpPublic?: boolean
  hasSla?: boolean
  hasTopup?: boolean
  hasAutoTopup?: boolean
  hasApi?: boolean
  hasDashboard?: boolean
  hasMonthlyReport?: boolean
  paymentInfo?: string | null
  registrationInfo?: string | null
  createdAt: string
  updatedAt: string
}

interface ServicePlanState {
  servicePlans: ServicePlan[]
  serviceTypes: ServiceType[]
  loading: boolean
  loadingStats: boolean
  error: any
  totalRecords: number
  totalServicePlans: number
  statistics: {
    total: number
    withType: number
    withSla: number
    withIpPublic: number
  }
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    serviceTypeId: string
  }
  form: Partial<ServicePlan>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useServicePlanStore = defineStore('servicePlan', {
  state: (): ServicePlanState => ({
    servicePlans: [],
    serviceTypes: [],
    loading: true,
    loadingStats: false,
    error: null,
    totalRecords: 0,
    totalServicePlans: 0,
    statistics: {
      total: 0,
      withType: 0,
      withSla: 0,
      withIpPublic: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: 1,
      search: '',
      serviceTypeId: '',
    },
    form: {
      serviceTypeId: null as number | null,
      name: '',
      description: '',
      planFunction: '',
      quota: '',
      typeQuota: '',
      contractMonth: null as number | null,
      fup: '',
      hasIpPublic: false,
      hasSla: false,
      hasTopup: false,
      hasAutoTopup: false,
      hasApi: false,
      hasDashboard: false,
      hasMonthlyReport: false,
      paymentInfo: '',
      registrationInfo: '',
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
        if (this.params.serviceTypeId) {
          params.set('service_type_id', this.params.serviceTypeId)
        }

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
            position: 'bottomRight',
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

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Service Plan gagal diperbarui.' : 'Service Plan gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }

        this.closeModal()
        await Promise.all([this.fetchServicePlans(), this.fetchStatistics()])
        toast.success({
          title: 'Success',
          message: `Service plan berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Service Plan gagal disimpan.')
        toastNormalizedError(err)
        return false
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
        const response = await fetch($api.servicePlan() + `/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Service Plan gagal dihapus.')
          toastNormalizedError(err)
          return false
        }

        await Promise.all([this.fetchServicePlans(), this.fetchStatistics()])
        toast.success({
          title: 'Success',
          message: 'Service plan berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Service Plan gagal dihapus.')
        toastNormalizedError(err)
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
          serviceTypeId: servicePlan.serviceTypeId ?? null,
          planFunction: servicePlan.planFunction ?? '',
          quota: servicePlan.quota ?? '',
          typeQuota: servicePlan.typeQuota ?? '',
          contractMonth: servicePlan.contractMonth ?? null,
          fup: servicePlan.fup ?? '',
          hasIpPublic: servicePlan.hasIpPublic ?? false,
          hasSla: servicePlan.hasSla ?? false,
          hasTopup: servicePlan.hasTopup ?? false,
          hasAutoTopup: servicePlan.hasAutoTopup ?? false,
          hasApi: servicePlan.hasApi ?? false,
          hasDashboard: servicePlan.hasDashboard ?? false,
          hasMonthlyReport: servicePlan.hasMonthlyReport ?? false,
          paymentInfo: servicePlan.paymentInfo ?? '',
          registrationInfo: servicePlan.registrationInfo ?? '',
        }
      } else {
        this.form = {
          serviceTypeId: null,
          name: '',
          description: '',
          planFunction: '',
          quota: '',
          typeQuota: '',
          contractMonth: null,
          fup: '',
          hasIpPublic: false,
          hasSla: false,
          hasTopup: false,
          hasAutoTopup: false,
          hasApi: false,
          hasDashboard: false,
          hasMonthlyReport: false,
          paymentInfo: '',
          registrationInfo: '',
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        serviceTypeId: null,
        name: '',
        description: '',
        planFunction: '',
        quota: '',
        typeQuota: '',
        contractMonth: null,
        fup: '',
        hasIpPublic: false,
        hasSla: false,
        hasTopup: false,
        hasAutoTopup: false,
        hasApi: false,
        hasDashboard: false,
        hasMonthlyReport: false,
        paymentInfo: '',
        registrationInfo: '',
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

    setServiceTypeId(value: string) {
      this.params.serviceTypeId = value
      this.params.first = 0
      this.fetchServicePlans()
    },

    async fetchServiceTypes() {
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.serviceType(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        this.serviceTypes = Array.isArray(data) ? data : []
      } catch {
        this.serviceTypes = []
      }
    },

    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.servicePlanStatistics(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        this.statistics = {
          total: Number(result.total ?? 0),
          withType: Number(result.withType ?? 0),
          withSla: Number(result.withSla ?? 0),
          withIpPublic: Number(result.withIpPublic ?? 0),
        }
        this.totalServicePlans = this.statistics.total
      } catch (error: any) {
        console.error('Error fetching service plan statistics:', error)
      } finally {
        this.loadingStats = false
      }
    },

    /** @deprecated gunakan fetchStatistics */
    async fetchTotalServicePlans() {
      await this.fetchStatistics()
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
          position: 'bottomRight',
        })
        throw error
      }
    },
  },
})
