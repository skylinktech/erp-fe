import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import {
  normalizeProgressTrackerStatus,
  type ProgressTrackerStatus,
} from '~/constants/implementation/progressTrackerStatuses'

export interface ProgressTrackerAttachment {
  id: string
  fileUrl?: string
  file_url?: string
  fileName?: string
  file_name?: string
  mimeType?: string | null
  mime_type?: string | null
  createdAt?: string
  created_at?: string
  uploadedByUser?: { id: number; fullName?: string; full_name?: string }
}

export interface ProgressTrackerStatusLog {
  id: string
  fromStatus?: ProgressTrackerStatus | null
  from_status?: ProgressTrackerStatus | null
  toStatus?: ProgressTrackerStatus
  to_status?: ProgressTrackerStatus
  notes?: string | null
  changedAt?: string
  changed_at?: string
  changedByUser?: { id: number; fullName?: string; full_name?: string }
}

export interface ProgressTrackerNode {
  id?: string
  nodeCode?: string
  node_code?: string
  name: string
  networkIdentifier?: string | null
  network_identifier?: string | null
  arfId?: number | null
  arf_id?: number | null
  currentStatus?: ProgressTrackerStatus
  current_status?: ProgressTrackerStatus
  notes?: string | null
  sortOrder?: number
  sort_order?: number
  arf?: {
    id: number
    requestNo?: string
    request_no?: string
    status?: string
    totalAmount?: number
  }
  statusLogs?: ProgressTrackerStatusLog[]
  status_logs?: ProgressTrackerStatusLog[]
  attachments?: ProgressTrackerAttachment[]
}

export interface ProgressTrackerSiteInvestmentLine {
  id?: string
  quantity?: number
  price?: number
  subtotal?: number
  priceListLine?: {
    product?: { id?: number; name?: string; sku?: string }
    service?: { id?: number; name?: string; code?: string }
    did?: { id?: number; name?: string; code?: string }
  }
  price_list_line?: ProgressTrackerSiteInvestmentLine['priceListLine']
}

export interface ProgressTrackerSiteInvestment {
  id: string
  siNumber?: string
  si_number?: string
  name?: string
  status?: string
  materialSubtotal?: number
  material_subtotal?: number
  serviceSubtotal?: number
  service_subtotal?: number
  didSubtotal?: number
  did_subtotal?: number
  total?: number
  grandTotal?: number
  grand_total?: number
  marketingFee?: number
  marketing_fee?: number
  siteInvestMaterials?: ProgressTrackerSiteInvestmentLine[]
  site_invest_materials?: ProgressTrackerSiteInvestmentLine[]
  siteInvestServices?: ProgressTrackerSiteInvestmentLine[]
  site_invest_services?: ProgressTrackerSiteInvestmentLine[]
  siteInvestDids?: ProgressTrackerSiteInvestmentLine[]
  site_invest_dids?: ProgressTrackerSiteInvestmentLine[]
}

export interface ProgressTrackerProject {
  id: string
  projectCode?: string
  project_code?: string
  name: string
  description?: string | null
  siteInvestmentId?: string | null
  site_investment_id?: string | null
  customerId?: number | null
  customer_id?: number | null
  siteId?: number | null
  site_id?: number | null
  status: string
  approvalStatus?: string
  approval_status?: string
  currentApprovalStep?: number | null
  current_approval_step?: number | null
  submittedAt?: string | null
  submitted_at?: string | null
  rejectionReason?: string | null
  rejection_reason?: string | null
  approvedByUser?: { id: number; fullName?: string; full_name?: string }
  nodesCount?: number
  nodes_count?: number
  customer?: { id: number; customerName?: string; customer_name?: string }
  site?: { id: number; siteName?: string; site_name?: string }
  siteInvestment?: ProgressTrackerSiteInvestment
  nodes?: ProgressTrackerNode[]
  approvalLogs?: Array<Record<string, unknown>>
  approval_logs?: Array<Record<string, unknown>>
  currentApprovers?: Array<{
    userId?: number
    user_id?: number
    fullName?: string
    full_name?: string
    email?: string
    source?: string
  }>
  current_approvers?: Array<Record<string, unknown>>
  nextApprovalStep?: number | null
  next_approval_step?: number | null
  createdAt?: string
  created_at?: string
}

export interface ProgressTrackerNodeForm {
  id?: string
  nodeCode: string
  name: string
  networkIdentifier: string
  arfId: number | null
  currentStatus: ProgressTrackerStatus
  notes: string
  sortOrder: number
}

interface ProgressTrackerState {
  projects: ProgressTrackerProject[]
  project: ProgressTrackerProject | null
  loading: boolean
  saving: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    status?: string | null
    approvalStatus?: string | null
    customerId?: number | null
    siteInvestmentId?: string | null
  }
  form: {
    id?: string | null
    name: string
    description: string
    siteInvestmentId: string | null
    customerId: number | null
    siteId: number | null
    status: string
    nodes: ProgressTrackerNodeForm[]
  }
  isEditMode: boolean
  statistics: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    onHoldProjects: number
    cancelledProjects: number
    nodesByStatus: Record<string, number>
  }
  statusOptions: { value: string; label: string }[]
  workflowConfigured: boolean
}

function emptyNode(index: number): ProgressTrackerNodeForm {
  return {
    nodeCode: `NODE-${index + 1}`,
    name: '',
    networkIdentifier: '',
    arfId: null,
    currentStatus: 'material_readiness',
    notes: '',
    sortOrder: index,
  }
}

function mapNodeFromApi(n: ProgressTrackerNode, index: number): ProgressTrackerNodeForm {
  return {
    id: n.id,
    nodeCode: n.nodeCode ?? n.node_code ?? `NODE-${index + 1}`,
    name: n.name,
    networkIdentifier: n.networkIdentifier ?? n.network_identifier ?? '',
    arfId: n.arfId ?? n.arf_id ?? null,
    currentStatus: normalizeProgressTrackerStatus(
      n.currentStatus ?? n.current_status,
      'material_readiness'
    ),
    notes: n.notes ?? '',
    sortOrder: n.sortOrder ?? n.sort_order ?? index,
  }
}

export const useProgressTrackerStore = defineStore('progressTracker', {
  state: (): ProgressTrackerState => ({
    projects: [],
    project: null,
    loading: false,
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: -1,
      draw: 0,
      search: '',
      status: null,
      approvalStatus: null,
      customerId: null,
      siteInvestmentId: null,
    },
    form: {
      id: null,
      name: '',
      description: '',
      siteInvestmentId: null,
      customerId: null,
      siteId: null,
      status: 'active',
      nodes: [emptyNode(0)],
    },
    isEditMode: false,
    statistics: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      cancelledProjects: 0,
      nodesByStatus: {},
    },
    statusOptions: [],
    workflowConfigured: false,
  }),

  actions: {
    resetForm() {
      this.form = {
        id: null,
        name: '',
        description: '',
        siteInvestmentId: null,
        customerId: null,
        siteId: null,
        status: 'active',
        nodes: [emptyNode(0)],
      }
      this.isEditMode = false
    },

    addNode() {
      this.form.nodes.push(emptyNode(this.form.nodes.length))
    },

    removeNode(index: number) {
      if (this.form.nodes.length <= 1) return
      this.form.nodes.splice(index, 1)
      this.form.nodes.forEach((n, i) => {
        n.sortOrder = i
      })
    },

    async fetchStatistics() {
      const { $api } = useNuxtApp()
      try {
        const res = await apiFetch($api.countProgressTrackerByStatus())
        const data = (res as any)?.data ?? res
        this.statistics = {
          totalProjects: data.totalProjects ?? 0,
          activeProjects: data.activeProjects ?? 0,
          completedProjects: data.completedProjects ?? 0,
          onHoldProjects: data.onHoldProjects ?? 0,
          cancelledProjects: data.cancelledProjects ?? 0,
          nodesByStatus: data.nodesByStatus ?? {},
        }
      } catch {
        /* ignore */
      }
    },

    async fetchProjects() {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const page = Math.floor(this.params.first / this.params.rows) + 1
        const qs = new URLSearchParams({
          page: String(page),
          rows: String(this.params.rows),
          draw: String(this.params.draw),
        })
        if (this.params.search) qs.set('search', this.params.search)
        if (this.params.sortField) qs.set('sortField', this.params.sortField)
        if (this.params.sortOrder != null) qs.set('sortOrder', String(this.params.sortOrder))
        if (this.params.status) qs.set('status', this.params.status)
        if (this.params.approvalStatus) qs.set('approvalStatus', this.params.approvalStatus)
        if (this.params.customerId) qs.set('customerId', String(this.params.customerId))
        if (this.params.siteInvestmentId) qs.set('siteInvestmentId', this.params.siteInvestmentId)

        const res = await apiFetch(`${$api.progressTracker()}?${qs}`)
        const body = res as any
        this.projects = body.data ?? []
        this.totalRecords = body.meta?.total ?? body.meta?.total ?? this.projects.length
        this.workflowConfigured = body.workflowConfigured ?? body.workflow_configured ?? false
      } catch (e: any) {
        this.error = e
        this.projects = []
      } finally {
        this.loading = false
      }
    },

    async getProjectDetails(id: string) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const res = await apiFetch($api.getProgressTrackerDetails(id))
        const body = res as any
        this.project = body.data ?? null
        this.statusOptions = body.statusOptions ?? []
        this.workflowConfigured = body.workflowConfigured ?? body.workflow_configured ?? false
        return this.project
      } catch (e: any) {
        this.error = e
        this.project = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async loadFormForEdit(id: string) {
      const p = await this.getProjectDetails(id)
      if (!p) return
      this.isEditMode = true
      this.form = {
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        siteInvestmentId: p.siteInvestmentId ?? p.site_investment_id ?? null,
        customerId: p.customerId ?? p.customer_id ?? null,
        siteId: p.siteId ?? p.site_id ?? null,
        status: p.status,
        nodes: (p.nodes?.length ? p.nodes : []).map((n, i) => mapNodeFromApi(n, i)),
      }
      if (!this.form.nodes.length) this.form.nodes = [emptyNode(0)]
    },

    async saveProject() {
      const { $api } = useNuxtApp()
      this.saving = true
      try {
        const payload = {
          name: this.form.name.trim(),
          description: this.form.description?.trim() || null,
          siteInvestmentId: this.form.siteInvestmentId,
          customerId: this.form.customerId,
          siteId: this.form.siteId,
          status: this.form.status,
          nodes: this.form.nodes.map((n, i) => ({
            id: n.id,
            nodeCode: n.nodeCode,
            name: n.name.trim(),
            networkIdentifier: n.networkIdentifier?.trim() || null,
            arfId: n.arfId,
            currentStatus: n.currentStatus,
            notes: n.notes?.trim() || null,
            sortOrder: i,
          })),
        }

        if (!payload.name) throw new Error('Nama project wajib diisi')
        if (!payload.nodes.length || payload.nodes.some((n) => !n.name)) {
          throw new Error('Setiap node/network wajib memiliki nama')
        }

        const url = this.isEditMode && this.form.id
          ? $api.progressTrackerShow(this.form.id)
          : $api.progressTracker()
        const method = this.isEditMode ? 'PUT' : 'POST'

        const res = await apiFetch(url, { method, body: payload })
        const data = (res as any)?.data
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: (res as any)?.message || 'Data tersimpan',
          timer: 2000,
          showConfirmButton: false,
        })
        return data?.id ?? this.form.id
      } finally {
        this.saving = false
      }
    },

    async deleteProject(id: string) {
      const { $api } = useNuxtApp()
      const confirm = await Swal.fire({
        title: 'Hapus project?',
        text: 'Project dan node terkait akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batal',
      })
      if (!confirm.isConfirmed) return false
      await apiFetch($api.progressTrackerShow(id), { method: 'DELETE' })
      await Swal.fire({ icon: 'success', title: 'Terhapus', timer: 1500, showConfirmButton: false })
      return true
    },

    async updateNodeStatus(
      nodeId: string,
      toStatus: ProgressTrackerStatus,
      notes: string,
      files?: File[]
    ) {
      const { $api } = useNuxtApp()
      const formData = new FormData()
      formData.append('toStatus', toStatus)
      if (notes) formData.append('notes', notes)
      if (files?.length) {
        for (const f of files) formData.append('attachments', f)
      }

      const res = await apiFetch($api.updateProgressTrackerNodeStatus(nodeId), {
        method: 'PATCH',
        body: formData,
      })
      return (res as any)?.data
    },

    async uploadNodeAttachments(nodeId: string, files: File[], statusLogId?: string) {
      const { $api } = useNuxtApp()
      const formData = new FormData()
      for (const f of files) formData.append('attachments', f)
      if (statusLogId) formData.append('statusLogId', statusLogId)
      const res = await apiFetch($api.uploadProgressTrackerAttachments(nodeId), {
        method: 'POST',
        body: formData,
      })
      return (res as any)?.data ?? []
    },

    async deleteAttachment(attachmentId: string) {
      const { $api } = useNuxtApp()
      await apiFetch($api.deleteProgressTrackerAttachment(attachmentId), { method: 'DELETE' })
    },

    async _workflowAction(
      action: 'submit' | 'approve' | 'reject',
      id: string,
      payload?: { remarks?: string }
    ) {
      const { $api } = useNuxtApp()
      const url =
        action === 'submit'
          ? $api.submitProgressTracker(id)
          : action === 'approve'
            ? $api.approveProgressTracker(id)
            : $api.rejectProgressTracker(id)

      const res = await apiFetch(url, {
        method: 'PATCH',
        body: payload ?? {},
      })
      const data = (res as any)?.data
      if (data) this.project = data
      return res
    },

    async submitForApproval(id: string) {
      try {
        await this._workflowAction('submit', id)
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Project diajukan untuk persetujuan',
          timer: 2000,
          showConfirmButton: false,
        })
        return true
      } catch (e: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: e?.data?.message || e?.message || 'Gagal mengajukan persetujuan',
        })
        return false
      }
    },

    async approve(id: string, remarks?: string) {
      try {
        await this._workflowAction('approve', id, { remarks })
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Project disetujui',
          timer: 2000,
          showConfirmButton: false,
        })
        return true
      } catch (e: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: e?.data?.message || e?.message || 'Gagal approve project',
        })
        return false
      }
    },

    async reject(id: string, remarks: string) {
      try {
        await this._workflowAction('reject', id, { remarks })
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Project ditolak',
          timer: 2000,
          showConfirmButton: false,
        })
        return true
      } catch (e: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: e?.data?.message || e?.message || 'Gagal reject project',
        })
        return false
      }
    },
  },
})

export function getProjectCode(p: ProgressTrackerProject | null | undefined): string {
  return p?.projectCode ?? p?.project_code ?? ''
}

export function getNodeStatus(n: ProgressTrackerNode | null | undefined): ProgressTrackerStatus {
  return normalizeProgressTrackerStatus(
    n?.currentStatus ?? n?.current_status,
    'material_readiness'
  )
}

export function getNodeStatusLogs(n: ProgressTrackerNode | null | undefined): ProgressTrackerStatusLog[] {
  return n?.statusLogs ?? n?.status_logs ?? []
}

export function getNodeAttachments(n: ProgressTrackerNode | null | undefined): ProgressTrackerAttachment[] {
  return n?.attachments ?? []
}
