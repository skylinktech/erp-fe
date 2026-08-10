import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'

export interface ApprovalWorkflowStepItem {
  id: number
  workflowId: number
  stepOrder: number
  stepName: string
  roleId: number | null
  jabatanId: number | null
  userId: number | null
  minAmount: number | null
  maxAmount: number | null
  description: string | null
  role?: { id: number; name: string }
  jabatan?: { id_jabatan: number; nm_jabatan: string }
  user?: { id: number; full_name: string; email: string }
}

export interface ApprovalWorkflowEntity {
  id: number
  code: string
  name: string
  description: string | null
  module: string | null
  aliases: string[]
  sortOrder: number
  isActive: boolean
}

export interface ApprovalWorkflow {
  id: number
  name: string
  approvalWorkflowEntityId: number
  entityType?: string
  entity?: ApprovalWorkflowEntity
  description: string | null
  isActive: boolean
  steps?: ApprovalWorkflowStepItem[]
}

export interface ApprovalWorkflowStats {
  total: number
  aktif: number
  nonaktif: number
  entities: number
  total_steps: number
}

export const useApprovalWorkflowsStore = defineStore('approval-workflows', {
  state: () => ({
    workflows: [] as ApprovalWorkflow[],
    workflow: null as ApprovalWorkflow | null,
    entities: [] as ApprovalWorkflowEntity[],
    entitiesLoading: false,
    stats: {
      total: 0,
      aktif: 0,
      nonaktif: 0,
      entities: 0,
      total_steps: 0,
    } as ApprovalWorkflowStats,
    loading: false,
    error: null as string | null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      page: 1,
      search: '',
      isActive: '' as string | boolean,
    },
    form: {
      name: '',
      approvalWorkflowEntityId: null as number | null,
      description: '',
      isActive: true,
    } as Partial<ApprovalWorkflow>,
    isEditMode: false,
    showModal: false,
    validationErrors: [] as string[],
  }),

  getters: {
    entityTypeOptions: (state) =>
      state.entities.map((e) => ({
        value: e.id,
        label: e.name,
        code: e.code,
        module: e.module,
      })),
  },

  actions: {
    async fetchStats() {
      const { $api } = useNuxtApp()
      try {
        const res = await apiFetch($api.approvalWorkflowStats(), { credentials: 'include' })
        this.stats = {
          total: res.total ?? 0,
          aktif: res.aktif ?? 0,
          nonaktif: res.nonaktif ?? 0,
          entities: res.entities ?? 0,
          total_steps: res.total_steps ?? 0,
        }
      } catch {
        // stats opsional — tidak blokir halaman
      }
    },

    async fetchEntities(force = false) {
      if (this.entities.length > 0 && !force) return this.entities
      this.entitiesLoading = true
      const { $api } = useNuxtApp()
      try {
        const res = await apiFetch(`${$api.approvalWorkflowEntities()}?activeOnly=true`, {
          credentials: 'include',
        })
        this.entities = res.data || []
        return this.entities
      } catch (e: any) {
        this.error = e.message || 'Gagal memuat entity types'
        return []
      } finally {
        this.entitiesLoading = false
      }
    },

    async fetchWorkflows() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: this.params.page.toString(),
          rows: this.params.rows.toString(),
          search: this.params.search || '',
        })
        if (this.params.isActive !== '' && this.params.isActive !== null) {
          params.set('isActive', String(this.params.isActive))
        }
        const res = await apiFetch(`${$api.approvalWorkflows()}?${params}`, {
          credentials: 'include',
        })
        this.workflows = res.data || []
        this.totalRecords = res.meta?.total ?? this.workflows.length
      } catch (e: any) {
        this.error = e.message || 'Gagal memuat data'
        const toast = useToast()
        toast.error({ title: 'Error', message: this.error, color: 'red', position: 'bottomRight' })
      } finally {
        this.loading = false
      }
    },

    async fetchWorkflow(id: number | string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const res = await apiFetch($api.approvalWorkflowShow(id), { credentials: 'include' })
        this.workflow = res
        return res
      } catch (e: any) {
        this.error = e.message || 'Gagal memuat detail'
        const toast = useToast()
        toast.error({ title: 'Error', message: this.error, color: 'red', position: 'bottomRight' })
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchWorkflowSteps(workflowId: number | string) {
      const { $api } = useNuxtApp()
      const res = await apiFetch($api.approvalWorkflowSteps(workflowId), { credentials: 'include' })
      return res.data || []
    },

    resetForm() {
      this.form = {
        name: '',
        approvalWorkflowEntityId: null,
        description: '',
        isActive: true,
      }
      this.isEditMode = false
      this.validationErrors = []
    },

    openModal(data?: ApprovalWorkflow | null) {
      this.resetForm()
      if (data) {
        this.isEditMode = true
        this.form = {
          id: data.id,
          name: data.name,
          approvalWorkflowEntityId: data.approvalWorkflowEntityId ?? data.entity?.id ?? null,
          description: data.description ?? '',
          isActive: data.isActive,
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
    },

    async saveWorkflow() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const payload = {
        name: this.form.name,
        approvalWorkflowEntityId: this.form.approvalWorkflowEntityId,
        description: this.form.description || null,
        isActive: this.form.isActive ?? true,
      }
      try {
        if (this.isEditMode && this.form.id) {
          await apiFetch($api.approvalWorkflowShow(this.form.id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          })
        } else {
          await apiFetch($api.approvalWorkflows(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          })
        }
        toast.success({ title: 'Berhasil', message: this.isEditMode ? 'Workflow berhasil diupdate' : 'Workflow berhasil dibuat', color: 'green', position: 'bottomRight' })
        this.closeModal()
        await Promise.all([this.fetchWorkflows(), this.fetchStats()])
      } catch (e: any) {
        const errData = e?.data || e
        this.validationErrors = errData?.errors ? Object.values(errData.errors).flat() as string[] : [errData?.message || e.message || 'Gagal menyimpan']
        toast.error({ title: 'Error', message: this.validationErrors[0] || 'Gagal menyimpan', color: 'red', position: 'bottomRight' })
      } finally {
        this.loading = false
      }
    },

    async deleteWorkflow(id: number) {
      const result = await Swal.fire({
        title: 'Hapus Workflow?',
        text: 'Workflow dan semua step akan dihapus. Tindakan ini tidak dapat dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
      })
      if (!result.isConfirmed) return
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.approvalWorkflowShow(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error((await res.json()).message || 'Gagal menghapus')
        toast.success({ title: 'Berhasil', message: 'Workflow berhasil dihapus', color: 'green', position: 'bottomRight' })
        await Promise.all([this.fetchWorkflows(), this.fetchStats()])
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal menghapus', color: 'red', position: 'bottomRight' })
      }
    },

    async storeStep(workflowId: number, payload: Partial<ApprovalWorkflowStepItem>) {
      const { $api } = useNuxtApp()
      const res = await apiFetch($api.approvalWorkflowStepsStore(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, workflowId }),
        credentials: 'include',
      })
      return res
    },

    async updateStep(id: number, payload: Partial<ApprovalWorkflowStepItem>) {
      const { $api } = useNuxtApp()
      const res = await apiFetch($api.approvalWorkflowStepsUpdate(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      return res
    },

    async deleteStep(id: number) {
      const { $api } = useNuxtApp()
      const res = await fetch($api.approvalWorkflowStepsDelete(id), {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal menghapus step')
    },
  },
})
