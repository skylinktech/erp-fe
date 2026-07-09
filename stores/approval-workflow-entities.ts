import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import type { ApprovalWorkflowEntity } from '~/stores/approval-workflows'

export interface ApprovalWorkflowEntityStats {
  total: number
  aktif: number
  nonaktif: number
  modules: number
}

export const useApprovalWorkflowEntitiesStore = defineStore('approval-workflow-entities', {
  state: () => ({
    entities: [] as ApprovalWorkflowEntity[],
    stats: {
      total: 0,
      aktif: 0,
      nonaktif: 0,
      modules: 0,
    } as ApprovalWorkflowEntityStats,
    loading: false,
    error: null as string | null,
    totalRecords: 0,
    params: {
      page: 1,
      rows: 10,
      search: '',
      module: '' as string,
      activeOnly: '' as string,
    },
    form: {
      id: undefined as number | undefined,
      code: '',
      name: '',
      description: '',
      module: '',
      aliasesText: '',
      sortOrder: 0,
      isActive: true,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [] as string[],
  }),

  actions: {
    async fetchStats() {
      const { $api } = useNuxtApp()
      try {
        const res = await apiFetch(`${$api.approvalWorkflowEntities()}?activeOnly=false`, {
          credentials: 'include',
        })
        const all: ApprovalWorkflowEntity[] = res.data || []
        this.stats = {
          total: all.length,
          aktif: all.filter((e) => e.isActive).length,
          nonaktif: all.filter((e) => !e.isActive).length,
          modules: new Set(all.map((e) => e.module).filter(Boolean)).size,
        }
      } catch {
        // non-blocking
      }
    },

    async fetchEntities() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          paginate: 'true',
          page: String(this.params.page),
          rows: String(this.params.rows),
          search: this.params.search || '',
        })
        if (this.params.module) params.set('module', this.params.module)
        if (this.params.activeOnly !== '') params.set('activeOnly', this.params.activeOnly)

        const res = await apiFetch(`${$api.approvalWorkflowEntities()}?${params}`, {
          credentials: 'include',
        })
        this.entities = res.data || []
        this.totalRecords = res.meta?.total ?? this.entities.length
      } catch (e: any) {
        this.error = e.message || 'Gagal memuat data entity'
        const toast = useToast()
        toast.error({ title: 'Error', message: this.error, color: 'red', position: 'topRight' })
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.form = {
        code: '',
        name: '',
        description: '',
        module: '',
        aliasesText: '',
        sortOrder: 0,
        isActive: true,
      }
      this.isEditMode = false
      this.validationErrors = []
    },

    openModal(data?: ApprovalWorkflowEntity | null) {
      this.resetForm()
      if (data) {
        this.isEditMode = true
        this.form = {
          id: data.id,
          code: data.code,
          name: data.name,
          description: data.description ?? '',
          module: data.module ?? '',
          aliasesText: (data.aliases || []).join(', '),
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive,
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
    },

    parseAliases(text: string): string[] {
      return text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    },

    async saveEntity() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const payload = {
        code: this.form.code,
        name: this.form.name,
        description: this.form.description || null,
        module: this.form.module || null,
        aliases: this.parseAliases(this.form.aliasesText),
        sortOrder: Number(this.form.sortOrder) || 0,
        isActive: this.form.isActive ?? true,
      }
      try {
        if (this.isEditMode && this.form.id) {
          await apiFetch($api.approvalWorkflowEntityShow(this.form.id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          })
        } else {
          await apiFetch($api.approvalWorkflowEntities(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          })
        }
        toast.success({
          title: 'Berhasil',
          message: this.isEditMode ? 'Entity berhasil diupdate' : 'Entity berhasil dibuat',
          color: 'green',
          position: 'topRight',
        })
        this.closeModal()
        await Promise.all([this.fetchEntities(), this.fetchStats()])
        const wfStore = useApprovalWorkflowsStore()
        await wfStore.fetchEntities(true)
      } catch (e: any) {
        const errData = e?.data || e
        this.validationErrors = errData?.errors
          ? (Object.values(errData.errors).flat() as string[])
          : [errData?.message || e.message || 'Gagal menyimpan']
        toast.error({
          title: 'Error',
          message: this.validationErrors[0] || 'Gagal menyimpan',
          color: 'red',
          position: 'topRight',
        })
      } finally {
        this.loading = false
      }
    },

    async deleteEntity(id: number) {
      const result = await Swal.fire({
        title: 'Hapus Entity?',
        text: 'Entity yang masih dipakai workflow tidak dapat dihapus.',
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
        const res = await fetch($api.approvalWorkflowEntityShow(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error((await res.json()).message || 'Gagal menghapus')
        toast.success({ title: 'Berhasil', message: 'Entity berhasil dihapus', color: 'green', position: 'topRight' })
        await Promise.all([this.fetchEntities(), this.fetchStats()])
        const wfStore = useApprovalWorkflowsStore()
        await wfStore.fetchEntities(true)
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal menghapus', color: 'red', position: 'topRight' })
      }
    },
  },
})
