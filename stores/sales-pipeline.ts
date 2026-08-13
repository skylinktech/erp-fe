import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'

export interface SalesPipelineStage {
  id: number
  code: string
  name: string
  order: number
  probability: number
  isClosingStage: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SalesOpportunity {
  id: number
  pipelineStageId: number
  customerId: number | null
  assignedSalesId: number | null
  estimatedValue: number
  expectedCloseDate: string | null
  notes: string | null
  isActive: boolean
  createdBy: number | null
  createdAt: string
  updatedAt: string
  pipelineStage?: SalesPipelineStage
  customer?: { id: number; name: string; email?: string; phone?: string }
  assignedSales?: { id: number; full_name?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; email?: string }
  histories?: SalesPipelineHistory[]
  activities?: SalesOpportunityActivity[]
  quotations?: any[]
  subscriptions?: any[]
}

export interface SalesPipelineHistory {
  id: number
  salesOpportunityId: number
  fromStageId: number | null
  toStageId: number
  movedBy: number | null
  remarks: string | null
  createdAt: string
  fromStage?: SalesPipelineStage
  toStage?: SalesPipelineStage
  movedByUser?: { id: number; full_name?: string }
}

export interface SalesOpportunityActivity {
  id: number
  salesOpportunityId: number
  type: string
  description: string | null
  createdBy: number | null
  createdAt: string
  createdByUser?: { id: number; full_name?: string }
}

interface SalesPipelineState {
  stages: SalesPipelineStage[]
  opportunities: SalesOpportunity[]
  opportunity: SalesOpportunity | null
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    pipelineStageId?: number | null
    customerId?: number | null
    assignedSalesId?: number | null
    isActive?: boolean | null
  }
  form: {
    id?: number | null
    pipelineStageId: number | null
    customerId: number | null
    assignedSalesId: number | null
    estimatedValue: number
    expectedCloseDate: string | null
    notes: string | null
    isActive: boolean
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  forecast: any
}

export const useSalesPipelineStore = defineStore('salesPipeline', {
  state: (): SalesPipelineState => ({
    stages: [],
    opportunities: [],
    opportunity: null,
    loading: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: null,
      sortOrder: null,
      search: '',
      pipelineStageId: null,
      customerId: null,
      assignedSalesId: null,
      isActive: null,
    },
    form: {
      id: null,
      pipelineStageId: null,
      customerId: null,
      assignedSalesId: null,
      estimatedValue: 0,
      expectedCloseDate: null,
      notes: null,
      isActive: true,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    forecast: null,
  }),

  actions: {
    async fetchStages() {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const data = await apiFetch($api.salesPipelineStage())
        // apiFetch menggunakan $fetch yang langsung mengembalikan data, bukan Response object
        const stagesData = data?.data || data || []
        // Normalize data: handle both camelCase and snake_case
        this.stages = stagesData.map((stage: any) => ({
          ...stage,
          id: stage.id,
          code: stage.code,
          name: stage.name,
          order: stage.order,
          probability: stage.probability,
          isClosingStage: stage.isClosingStage !== undefined ? stage.isClosingStage : (stage.is_closing_stage !== undefined ? stage.is_closing_stage : false),
          isActive: stage.isActive !== undefined ? stage.isActive : (stage.is_active !== undefined ? stage.is_active : true),
        }))
        console.log('Fetched stages:', this.stages.length)
        console.log('Stages:', this.stages.map(s => ({ id: s.id, code: s.code, name: s.name, order: s.order })))
      } catch (error) {
        this.error = error
        console.error('Error fetching stages:', error)
        this.stages = [] // Reset stages on error
      } finally {
        this.loading = false
      }
    },

    async fetchOpportunities() {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const queryParams = new URLSearchParams()
        // For kanban view, fetch all active opportunities without pagination
        queryParams.append('page', '1')
        queryParams.append('rows', '1000')
        queryParams.append('isActive', 'true')
        if (this.params.search) queryParams.append('search', this.params.search)
        if (this.params.pipelineStageId) queryParams.append('pipelineStageId', String(this.params.pipelineStageId))
        if (this.params.customerId) queryParams.append('customerId', String(this.params.customerId))
        if (this.params.assignedSalesId) queryParams.append('assignedSalesId', String(this.params.assignedSalesId))

        const data = await apiFetch(`${$api.salesOpportunity()}?${queryParams.toString()}`)
        // apiFetch menggunakan $fetch yang langsung mengembalikan data, bukan Response object
        const opps = data?.data || data || []
        // Normalize data: handle both camelCase and snake_case
        this.opportunities = opps.map((opp: any) => {
          const normalized = {
            ...opp,
            id: opp.id,
            pipelineStageId: opp.pipelineStageId || opp.pipeline_stage_id || null,
            customerId: opp.customerId || opp.customer_id || null,
            assignedSalesId: opp.assignedSalesId || opp.assigned_sales_id || null,
            estimatedValue: opp.estimatedValue || opp.estimated_value || 0,
            expectedCloseDate: opp.expectedCloseDate || opp.expected_close_date || null,
            isActive: opp.isActive !== undefined ? opp.isActive : (opp.is_active !== undefined ? opp.is_active : true),
            createdAt: opp.createdAt || opp.created_at,
            updatedAt: opp.updatedAt || opp.updated_at,
            // Preserve relations
            pipelineStage: opp.pipelineStage || opp.pipeline_stage,
            customer: opp.customer,
            assignedSales: opp.assignedSales || opp.assigned_sales,
            quotations: opp.quotations || [],
            subscriptions: opp.subscriptions || [],
          }
          return normalized
        })
        this.totalRecords = data?.meta?.total || this.opportunities.length
        console.log('Fetched opportunities:', this.opportunities.length)
        console.log('Sample opportunity:', this.opportunities[0])
        console.log('All opportunities:', this.opportunities.map(o => ({ id: o.id, stageId: o.pipelineStageId, isActive: o.isActive })))
      } catch (error) {
        this.error = error
        console.error('Error fetching opportunities:', error)
        this.opportunities = [] // Reset opportunities on error
      } finally {
        this.loading = false
      }
    },

    async fetchOpportunity(id: number) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const data = await apiFetch($api.salesOpportunity() + `/${id}`)
        this.opportunity = data?.data || null
      } catch (error) {
        this.error = error
        console.error('Error fetching opportunity:', error)
        this.opportunity = null
      } finally {
        this.loading = false
      }
    },

    async fetchForecast(startDate?: string, endDate?: string, groupBy: string = 'month') {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const queryParams = new URLSearchParams()
        if (startDate) queryParams.append('startDate', startDate)
        if (endDate) queryParams.append('endDate', endDate)
        queryParams.append('groupBy', groupBy)

        const data = await apiFetch(`${$api.salesOpportunityForecast()}?${queryParams.toString()}`)
        this.forecast = data
      } catch (error) {
        this.error = error
        console.error('Error fetching forecast:', error)
        this.forecast = null
      } finally {
        this.loading = false
      }
    },

    async saveOpportunity() {
      this.loading = true
      this.validationErrors = []
      try {
        const { $api } = useNuxtApp()
        const url = this.isEditMode
          ? `${$api.salesOpportunity()}/${this.form.id}`
          : $api.salesOpportunity()
        const method = this.isEditMode ? 'POST' : 'POST'

        await apiFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        })

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: this.isEditMode ? 'Opportunity berhasil diupdate' : 'Opportunity berhasil dibuat',
        })
        this.closeModal()
        await this.fetchOpportunities()
      } catch (error: any) {
        this.error = error
        const err = normalizeApiError(
          error,
          this.isEditMode ? 'Opportunity gagal diperbarui.' : 'Opportunity gagal dibuat.'
        )
        this.validationErrors = err.fieldErrorList
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async moveStage(opportunityId: number, toStageId: number, remarks?: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        await apiFetch($api.salesOpportunityMoveStage(opportunityId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toStageId, remarks }),
        })

        await this.fetchOpportunities()
      } catch (error: any) {
        this.error = error
        const err = normalizeApiError(error, 'Opportunity gagal diproses.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async addActivity(opportunityId: number, type: string, description?: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        await apiFetch($api.salesOpportunityAddActivity(opportunityId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, description }),
        })

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Activity berhasil ditambahkan',
        })
        await this.fetchOpportunity(opportunityId)
      } catch (error: any) {
        this.error = error
        const err = normalizeApiError(error, 'Opportunity gagal diproses.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async deleteOpportunity(id: number) {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data yang dihapus tidak dapat dikembalikan',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (!result.isConfirmed) return

      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await apiFetch(`${$api.salesOpportunity()}/${id}`, {
          method: 'DELETE',
        })

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Opportunity berhasil dihapus',
        })
        await this.fetchOpportunities()
      } catch (error) {
        this.error = error
        const err = normalizeApiError(error, 'Opportunity gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    openModal(opportunity?: SalesOpportunity) {
      if (opportunity) {
        this.isEditMode = true
        this.form = {
          id: opportunity.id,
          pipelineStageId: opportunity.pipelineStageId,
          customerId: opportunity.customerId,
          assignedSalesId: opportunity.assignedSalesId,
          estimatedValue: opportunity.estimatedValue,
          expectedCloseDate: opportunity.expectedCloseDate || null,
          notes: opportunity.notes || null,
          isActive: opportunity.isActive,
        }
      } else {
        this.isEditMode = false
        this.form = {
          id: null,
          pipelineStageId: null,
          customerId: null,
          assignedSalesId: null,
          estimatedValue: 0,
          expectedCloseDate: null,
          notes: null,
          isActive: true,
        }
      }
      this.validationErrors = []
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        id: null,
        pipelineStageId: null,
        customerId: null,
        assignedSalesId: null,
        estimatedValue: 0,
        expectedCloseDate: null,
        notes: null,
        isActive: true,
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first || 0
      this.params.rows = event.rows || 10
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = event.sortOrder || null
    },

    setSearch(search: string) {
      this.params.search = search
      this.params.first = 0
    },

    setFilters(filters: any) {
      this.params.pipelineStageId = filters.pipelineStageId || null
      this.params.customerId = filters.customerId || null
      this.params.assignedSalesId = filters.assignedSalesId || null
      this.params.isActive = filters.isActive !== undefined ? filters.isActive : null
      this.params.first = 0
    },
  },
})
