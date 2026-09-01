import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, normalizeFailedResponse, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import {
  extractBlockersFromError,
  normalizeAttachment,
  normalizeAttachmentRequirements,
  normalizeCompletionReadiness,
  normalizeDismantleRequest,
  normalizeFinancialSummary,
  normalizeReadiness,
  normalizeReconciliation,
  normalizeRecoverySummary,
  normalizeStatistics,
  unwrapListPayload,
} from '~/utils/dismantleAdapter'
import {
  clearDismantleIdempotencyKey,
  getDismantleIdempotencyKey,
} from '~/utils/dismantleIdempotency'
import type {
  DismantleCompletionReadiness,
  DismantleAttachmentItem,
  DismantleAttachmentRequirementSummary,
  DismantleAttachmentUploadPayload,
  DismantleCreatePayload,
  DismantleCustomerHandoverPayload,
  DismantleFinanceReviewPayload,
  DismantleFinancialSummary,
  DismantlePhysicalRemovalPayload,
  DismantleReadiness,
  DismantleReadinessPurpose,
  DismantleReconciliation,
  DismantleRecoverySummary,
  DismantleRequest,
  DismantleRequestListItem,
  DismantleStatistics,
  DismantleUpdatePayload,
  DismantleWarehouseReceiptPayload,
  DismantleWizardForm,
} from '~/types/operations/dismantle'

export function emptyDismantleForm(): DismantleWizardForm {
  const today = new Date().toISOString().slice(0, 10)
  return {
    perusahaanId: null,
    customerId: null,
    siteId: null,
    requestDate: today,
    requestedEffectiveTerminationAt: `${today}T00:00:00`,
    terminationType: 'CUSTOMER_REQUEST',
    reasonCode: '',
    reason: '',
    notes: '',
    destinationWarehouseId: null,
    scheduledAt: '',
    serviceLines: [],
    selectedServiceInstanceIds: [],
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

interface RequestDismantleState {
  items: DismantleRequestListItem[]
  selected: DismantleRequest | null
  totalRecords: number
  statistics: DismantleStatistics
  filters: {
    search: string
    status: string | null
    customerId: number | null
    siteId: number | null
    terminationType: string | null
  }
  params: { first: number; rows: number }
  form: DismantleWizardForm
  wizardStep: number
  readiness: DismantleReadiness | null
  completionReadiness: DismantleCompletionReadiness | null
  reconciliation: DismantleReconciliation | null
  financialSummary: DismantleFinancialSummary | null
  recoverySummary: DismantleRecoverySummary | null
  financialReviewData: unknown | null
  attachments: DismantleAttachmentItem[]
  attachmentRequirements: DismantleAttachmentRequirementSummary | null
  loadingList: boolean
  loadingDetail: boolean
  loadingStatistics: boolean
  savingDraft: boolean
  submitting: boolean
  approving: boolean
  rejecting: boolean
  scheduling: boolean
  starting: boolean
  executingEquipment: boolean
  receivingEquipment: boolean
  reviewingFinance: boolean
  syncingCharges: boolean
  terminatingServices: boolean
  completing: boolean
  blocking: boolean
  unblocking: boolean
  cancelling: boolean
  loadingAttachments: boolean
  uploadingAttachment: boolean
  downloadById: Record<string, boolean>
  deletingAttachmentById: Record<string, boolean>
  voidingAttachmentById: Record<string, boolean>
  readinessLoading: boolean
  fieldErrors: Record<string, string>
  serverError: string | null
  lastBlockers: Array<{ code: string; message: string }>
}

export const useRequestDismantleStore = defineStore('request-dismantle', {
  state: (): RequestDismantleState => ({
    items: [],
    selected: null,
    totalRecords: 0,
    statistics: {
      total: 0,
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      scheduled: 0,
      in_progress: 0,
      blocked: 0,
      cancelled: 0,
      completed: 0,
    },
    filters: {
      search: '',
      status: null,
      customerId: null,
      siteId: null,
      terminationType: null,
    },
    params: { first: 0, rows: 10 },
    form: emptyDismantleForm(),
    wizardStep: 0,
    readiness: null,
    completionReadiness: null,
    reconciliation: null,
    financialSummary: null,
    recoverySummary: null,
    financialReviewData: null,
    attachments: [],
    attachmentRequirements: null,
    loadingList: false,
    loadingDetail: false,
    loadingStatistics: false,
    savingDraft: false,
    submitting: false,
    approving: false,
    rejecting: false,
    scheduling: false,
    starting: false,
    executingEquipment: false,
    receivingEquipment: false,
    reviewingFinance: false,
    syncingCharges: false,
    terminatingServices: false,
    completing: false,
    blocking: false,
    unblocking: false,
    cancelling: false,
    loadingAttachments: false,
    uploadingAttachment: false,
    downloadById: {},
    deletingAttachmentById: {},
    voidingAttachmentById: {},
    readinessLoading: false,
    fieldErrors: {},
    serverError: null,
    lastBlockers: [],
  }),

  getters: {
    currentVersion: (s) => s.selected?.version ?? s.form.version ?? 1,
  },

  actions: {
    api() {
      const { $api } = useNuxtApp()
      return $api
    },

    listQueryParams() {
      const page = Math.floor(this.params.first / this.params.rows) + 1
      const sp = new URLSearchParams({
        page: String(page),
        rows: String(this.params.rows),
      })
      if (this.filters.search?.trim()) sp.set('search', this.filters.search.trim())
      if (this.filters.status) sp.set('status', this.filters.status)
      if (this.filters.customerId) sp.set('customerId', String(this.filters.customerId))
      if (this.filters.siteId) sp.set('siteId', String(this.filters.siteId))
      return sp
    },

    async fetchList(suppressError = false) {
      if (this.loadingList) return
      this.loadingList = true
      this.serverError = null
      try {
        const url = `${this.api().dismantleRequests()}?${this.listQueryParams()}`
        const res = await apiFetch<{ data: unknown; meta?: { total?: number } }>(url)
        const { items, total } = unwrapListPayload(res?.data)
        this.items = items
        this.totalRecords = res?.meta?.total ?? total
      } catch (e: unknown) {
        if (!suppressError) toastNormalizedError(normalizeApiError(e, 'Gagal memuat daftar Request Dismantle'))
        this.serverError = normalizeApiError(e, 'Gagal memuat daftar').message
      } finally {
        this.loadingList = false
      }
    },

    async fetchStatistics() {
      this.loadingStatistics = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestsStatistics())
        this.statistics = normalizeStatistics((res?.data ?? {}) as Record<string, unknown>)
      } catch {
        /* non-fatal */
      } finally {
        this.loadingStatistics = false
      }
    },

    async fetchDetail(id: string) {
      if (this.loadingDetail) return
      this.loadingDetail = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestShow(id))
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        this.hydrateFormFromRequest(this.selected)
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal memuat detail Request Dismantle'))
        throw e
      } finally {
        this.loadingDetail = false
      }
    },

    hydrateFormFromRequest(req: DismantleRequest) {
      this.form = {
        id: req.id,
        version: req.version,
        perusahaanId: req.perusahaanId,
        customerId: req.customerId,
        siteId: req.siteId,
        requestDate: req.requestDate?.slice(0, 10) ?? todayIsoDate(),
        requestedEffectiveTerminationAt: req.requestedEffectiveTerminationAt,
        terminationType: req.terminationType,
        reasonCode: req.reasonCode ?? '',
        reason: req.reason ?? '',
        notes: req.notes ?? '',
        destinationWarehouseId: req.destinationWarehouseId,
        scheduledAt: req.scheduledAt ?? '',
        selectedServiceInstanceIds: req.services.map((s) => s.serviceInstanceId),
        serviceLines: req.services.map((s) => ({
          serviceInstanceId: s.serviceInstanceId,
          billingCutoffPolicy: s.billingCutoffPolicy,
          prorateEnabled: s.prorateEnabled,
          earlyTermination: s.earlyTermination,
          effectiveTerminationAt: s.effectiveTerminationAt ?? undefined,
        })),
      }
    },

    buildCreatePayload(): DismantleCreatePayload {
      if (!this.form.perusahaanId || !this.form.customerId || !this.form.siteId) {
        throw new Error('Customer, site, dan perusahaan wajib diisi')
      }
      if (!this.form.terminationType) throw new Error('Tipe terminasi wajib dipilih')
      if (!this.form.serviceLines.length) throw new Error('Minimal satu layanan harus dipilih')
      return {
        perusahaanId: this.form.perusahaanId,
        customerId: this.form.customerId,
        siteId: this.form.siteId,
        requestDate: this.form.requestDate,
        requestedEffectiveTerminationAt: this.form.requestedEffectiveTerminationAt,
        terminationType: this.form.terminationType,
        reasonCode: this.form.reasonCode || null,
        reason: this.form.reason || null,
        destinationWarehouseId: this.form.destinationWarehouseId,
        notes: this.form.notes || null,
        serviceLines: this.form.serviceLines,
      }
    },

    buildUpdatePayload(): DismantleUpdatePayload {
      if (!this.form.terminationType) throw new Error('Tipe terminasi wajib dipilih')
      if (!this.form.serviceLines.length) throw new Error('Minimal satu layanan harus dipilih')
      return {
        requestDate: this.form.requestDate,
        requestedEffectiveTerminationAt: this.form.requestedEffectiveTerminationAt,
        terminationType: this.form.terminationType,
        reasonCode: this.form.reasonCode || null,
        reason: this.form.reason || null,
        destinationWarehouseId: this.form.destinationWarehouseId,
        notes: this.form.notes || null,
        serviceLines: this.form.serviceLines,
        version: this.form.version ?? this.currentVersion,
      }
    },

    async saveDraft(): Promise<string | null> {
      if (this.savingDraft) return null
      this.savingDraft = true
      this.fieldErrors = {}
      const toast = useToast()
      try {
        const isEdit = !!this.form.id
        const body = isEdit ? this.buildUpdatePayload() : this.buildCreatePayload()
        const url = isEdit
          ? this.api().dismantleRequestShow(this.form.id!)
          : this.api().dismantleRequests()
        const res = await apiFetch<{ data: Record<string, unknown> }>(url, {
          method: isEdit ? 'PUT' : 'POST',
          body,
        })
        const row = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        this.selected = row
        this.form.id = row.id
        this.form.version = row.version
        toast.success({
          title: 'Berhasil',
          message: isEdit ? 'Draft Request Dismantle diperbarui' : 'Draft Request Dismantle dibuat',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return row.id
      } catch (e: unknown) {
        const err = normalizeApiError(e, 'Gagal menyimpan draft Request Dismantle')
        this.lastBlockers = extractBlockersFromError(e)
        toastNormalizedError(err)
        return null
      } finally {
        this.savingDraft = false
      }
    },

    async fetchReadiness(id: string, purpose: DismantleReadinessPurpose = 'submit') {
      this.readinessLoading = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(
          this.api().dismantleRequestReadiness(id, purpose)
        )
        this.readiness = normalizeReadiness((res?.data ?? {}) as Record<string, unknown>)
        return this.readiness
      } finally {
        this.readinessLoading = false
      }
    },

    async submitRequest(id?: string) {
      if (this.submitting) return false
      const requestId = id ?? this.selected?.id ?? this.form.id
      if (!requestId) return false
      this.submitting = true
      const toast = useToast()
      try {
        const readiness = await this.fetchReadiness(requestId, 'submit')
        if (readiness && !readiness.eligible) {
          this.lastBlockers = readiness.blockers
          await Swal.fire({
            icon: 'warning',
            title: 'Submit diblokir',
            html: readiness.blockers.map((b) => `<div><code>${b.code}</code> — ${b.message}</div>`).join(''),
          })
          return false
        }
        const confirmed = await Swal.fire({
          title: 'Submit Request Dismantle?',
          text: 'Request akan dikirim untuk approval.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Submit',
        })
        if (!confirmed.isConfirmed) return false

        const res = await apiFetch<{ data: Record<string, unknown> }>(
          this.api().dismantleRequestSubmit(requestId),
          {
            method: 'POST',
            body: { version: this.currentVersion },
          }
        )
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        toast.success({ title: 'Berhasil', message: 'Request Dismantle di-submit', color: 'green', position: 'bottomRight', layout: 2 })
        await this.fetchList(true)
        return true
      } catch (e: unknown) {
        this.lastBlockers = extractBlockersFromError(e)
        toastNormalizedError(normalizeApiError(e, 'Gagal submit Request Dismantle'))
        return false
      } finally {
        this.submitting = false
      }
    },

    async approveRequest(
      id: string,
      remarks?: string,
      options?: {
        override?: { mode: 'SUPERADMIN_EMERGENCY_OVERRIDE'; reason: string; ticketRef?: string }
        idempotencyKey?: string
      }
    ) {
      if (this.approving) return false
      this.approving = true
      try {
        const intent = `approve:${id}`
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestApprove(id), {
          method: 'POST',
          body: {
            version: this.currentVersion,
            remarks,
            idempotencyKey: options?.idempotencyKey ?? getDismantleIdempotencyKey(intent),
            override: options?.override,
          },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        const msg = options?.override
          ? 'Dokumen berhasil disetujui menggunakan Emergency Override.'
          : 'Request disetujui'
        useToast().success({ title: 'Berhasil', message: msg, color: 'green', position: 'bottomRight', layout: 2 })
        if (options?.override) clearDismantleIdempotencyKey(intent)
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal approve Request Dismantle'))
        return false
      } finally {
        this.approving = false
      }
    },

    async rejectRequest(id: string, reason: string) {
      if (this.rejecting) return false
      this.rejecting = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestReject(id), {
          method: 'POST',
          body: { version: this.currentVersion, reason },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        useToast().success({ title: 'Ditolak', message: 'Request ditolak — buat request baru jika diperlukan', color: 'orange', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal reject Request Dismantle'))
        return false
      } finally {
        this.rejecting = false
      }
    },

    async startRequest(id: string) {
      if (this.starting) return false
      this.starting = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestStart(id), {
          method: 'POST',
          body: { version: this.currentVersion },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        useToast().success({ title: 'Berhasil', message: 'Eksekusi dimulai', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal memulai eksekusi'))
        return false
      } finally {
        this.starting = false
      }
    },

    async blockRequest(id: string, reason: string) {
      if (this.blocking) return false
      this.blocking = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestBlock(id), {
          method: 'POST',
          body: { version: this.currentVersion, reason },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal block request'))
        return false
      } finally {
        this.blocking = false
      }
    },

    async unblockRequest(id: string, targetStatus: 'scheduled' | 'in_progress' = 'scheduled') {
      if (this.unblocking) return false
      this.unblocking = true
      try {
        const readiness = await this.fetchReadiness(id, 'unblock')
        if (readiness && !readiness.eligible) {
          this.lastBlockers = readiness.blockers
          await Swal.fire({
            icon: 'warning',
            title: 'Unblock diblokir',
            html: readiness.blockers.map((b) => `<div>${b.message}</div>`).join(''),
          })
          return false
        }
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestUnblock(id), {
          method: 'POST',
          body: { version: this.currentVersion, targetStatus },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal unblock request'))
        return false
      } finally {
        this.unblocking = false
      }
    },

    async cancelRequest(id: string, reason: string) {
      if (this.cancelling) return false
      this.cancelling = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestCancel(id), {
          method: 'POST',
          body: { version: this.currentVersion, reason },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal cancel request'))
        return false
      } finally {
        this.cancelling = false
      }
    },

    async physicalRemoval(requestId: string, lineId: string, payload: Omit<DismantlePhysicalRemovalPayload, 'idempotencyKey'>) {
      if (this.executingEquipment) return false
      this.executingEquipment = true
      const intent = `physical-removal:${requestId}:${lineId}`
      try {
        const res = await apiFetch(this.api().dismantleEquipmentPhysicalRemoval(requestId, lineId), {
          method: 'POST',
          body: {
            ...payload,
            idempotencyKey: getDismantleIdempotencyKey(intent),
            version: this.currentVersion,
          },
        })
        clearDismantleIdempotencyKey(intent)
        await Promise.all([this.fetchDetail(requestId), this.fetchRecoverySummary(requestId)])
        useToast().success({ title: 'Berhasil', message: 'Physical removal tercatat', color: 'green', position: 'bottomRight', layout: 2 })
        return res
      } catch (e: unknown) {
        this.lastBlockers = extractBlockersFromError(e)
        toastNormalizedError(normalizeApiError(e, 'Gagal physical removal'))
        return false
      } finally {
        this.executingEquipment = false
      }
    },

    async warehouseReceipt(requestId: string, lineId: string, payload: Omit<DismantleWarehouseReceiptPayload, 'idempotencyKey'>) {
      if (this.receivingEquipment) return false
      this.receivingEquipment = true
      const intent = `warehouse-receipt:${requestId}:${lineId}`
      try {
        const res = await apiFetch(this.api().dismantleEquipmentReceive(requestId, lineId), {
          method: 'POST',
          body: {
            ...payload,
            idempotencyKey: getDismantleIdempotencyKey(intent),
            version: this.currentVersion,
          },
        })
        clearDismantleIdempotencyKey(intent)
        await Promise.all([this.fetchDetail(requestId), this.fetchRecoverySummary(requestId)])
        useToast().success({ title: 'Berhasil', message: 'Equipment diterima warehouse', color: 'green', position: 'bottomRight', layout: 2 })
        return res
      } catch (e: unknown) {
        this.lastBlockers = extractBlockersFromError(e)
        toastNormalizedError(normalizeApiError(e, 'Gagal warehouse receipt'))
        return false
      } finally {
        this.receivingEquipment = false
      }
    },

    async customerHandover(requestId: string, lineId: string, payload: Omit<DismantleCustomerHandoverPayload, 'idempotencyKey'>) {
      if (this.receivingEquipment) return false
      this.receivingEquipment = true
      const intent = `customer-handover:${requestId}:${lineId}`
      try {
        const res = await apiFetch(this.api().dismantleEquipmentCustomerHandover(requestId, lineId), {
          method: 'POST',
          body: {
            ...payload,
            idempotencyKey: getDismantleIdempotencyKey(intent),
            version: this.currentVersion,
          },
        })
        clearDismantleIdempotencyKey(intent)
        await this.fetchDetail(requestId)
        useToast().success({ title: 'Berhasil', message: 'Customer handover tercatat', color: 'green', position: 'bottomRight', layout: 2 })
        return res
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal customer handover'))
        return false
      } finally {
        this.receivingEquipment = false
      }
    },

    async fetchCompletionReadiness(id: string) {
      const res = await apiFetch<{ data: Record<string, unknown> }>(
        this.api().dismantleRequestCompletionReadiness(id)
      )
      this.completionReadiness = normalizeCompletionReadiness((res?.data ?? {}) as Record<string, unknown>)
      return this.completionReadiness
    },

    async fetchReconciliation(id: string) {
      const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestReconciliation(id))
      this.reconciliation = normalizeReconciliation((res?.data ?? {}) as Record<string, unknown>)
      return this.reconciliation
    },

    async fetchFinancialSummary(id: string) {
      const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestFinancialSummary(id))
      this.financialSummary = normalizeFinancialSummary((res?.data ?? {}) as Record<string, unknown>)
      return this.financialSummary
    },

    async fetchRecoverySummary(id: string) {
      const res = await apiFetch<{ data: Record<string, unknown> }>(
        this.api().dismantleRequestEquipmentRecoverySummary(id)
      )
      this.recoverySummary = normalizeRecoverySummary((res?.data ?? {}) as Record<string, unknown>)
      return this.recoverySummary
    },

    async fetchFinancialReviewData(id: string) {
      const res = await apiFetch(this.api().dismantleRequestFinancialReview(id))
      this.financialReviewData = res?.data ?? res
      return this.financialReviewData
    },

    async fetchAttachments(requestId: string) {
      this.loadingAttachments = true
      try {
        const res = await apiFetch<{ data: { data?: unknown[] } | unknown[] }>(
          this.api().dismantleRequestAttachments(requestId)
        )
        const payload = res?.data as Record<string, unknown>
        const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        this.attachments = rows.map((r) => normalizeAttachment(r as Record<string, unknown>))
        return this.attachments
      } finally {
        this.loadingAttachments = false
      }
    },

    async fetchAttachmentRequirements(requestId: string) {
      const res = await apiFetch<{ data: Record<string, unknown> }>(
        this.api().dismantleRequestAttachmentRequirements(requestId)
      )
      this.attachmentRequirements = normalizeAttachmentRequirements(
        (res?.data ?? {}) as Record<string, unknown>
      )
      return this.attachmentRequirements
    },

    async uploadAttachment(requestId: string, payload: DismantleAttachmentUploadPayload) {
      if (this.uploadingAttachment) return false
      this.uploadingAttachment = true
      const intent = `attachment-upload:${requestId}:${payload.attachmentType}:${payload.file.name}:${payload.file.size}`
      const { getDismantleIdempotencyKey, clearDismantleIdempotencyKey } = await import(
        '~/utils/dismantleIdempotency'
      )
      const { validateAttachmentFileClient, dismantleAttachmentErrorLabel } = await import(
        '~/utils/dismantleAttachmentLabels'
      )
      const clientErr = validateAttachmentFileClient(payload.file)
      if (clientErr) {
        useToast().error({ title: 'Validasi', message: clientErr, color: 'red', position: 'bottomRight', layout: 2 })
        this.uploadingAttachment = false
        return false
      }
      try {
        const body = new FormData()
        body.append('file', payload.file)
        body.append('attachmentType', payload.attachmentType)
        body.append('idempotencyKey', getDismantleIdempotencyKey(intent))
        if (payload.equipmentLineId) body.append('equipmentLineId', payload.equipmentLineId)
        if (payload.serviceLineId) body.append('serviceLineId', payload.serviceLineId)
        if (payload.description) body.append('description', payload.description)

        const token = useCookie('access_token')
        const headers: Record<string, string> = { Accept: 'application/json' }
        if (token.value) headers.Authorization = `Bearer ${token.value}`

        const res = await fetch(this.api().dismantleRequestAttachments(requestId), {
          method: 'POST',
          credentials: 'include',
          headers,
          body,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const code = json?.code ?? json?.data?.code
          throw new Error(dismantleAttachmentErrorLabel(code, json?.message))
        }
        clearDismantleIdempotencyKey(intent)
        await Promise.all([
          this.fetchAttachments(requestId),
          this.fetchAttachmentRequirements(requestId),
        ])
        useToast().success({
          title: 'Berhasil',
          message: json?.message || 'Attachment diunggah',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return json
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Gagal upload attachment'
        useToast().error({ title: 'Error', message: msg, color: 'red', position: 'bottomRight', layout: 2 })
        return false
      } finally {
        this.uploadingAttachment = false
      }
    },

    async downloadAttachment(requestId: string, attachmentId: string, preview = false) {
      this.downloadById = { ...this.downloadById, [attachmentId]: true }
      try {
        const url = preview
          ? this.api().dismantleRequestAttachmentPreview(requestId, attachmentId)
          : this.api().dismantleRequestAttachmentDownload(requestId, attachmentId)
        const token = useCookie('access_token')
        const headers: Record<string, string> = {}
        if (token.value) headers.Authorization = `Bearer ${token.value}`
        const res = await fetch(url, { credentials: 'include', headers })
        if (!res.ok) throw new Error('Gagal mengunduh file')
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        if (preview) {
          window.open(objectUrl, '_blank', 'noopener')
        } else {
          const a = document.createElement('a')
          a.href = objectUrl
          a.download = attachmentId
          a.click()
        }
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
        return true
      } catch (e: unknown) {
        useToast().error({
          title: 'Error',
          message: e instanceof Error ? e.message : 'Gagal download',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      } finally {
        this.downloadById = { ...this.downloadById, [attachmentId]: false }
      }
    },

    async deleteDraftAttachment(requestId: string, attachmentId: string) {
      this.deletingAttachmentById = { ...this.deletingAttachmentById, [attachmentId]: true }
      try {
        await apiFetch(this.api().dismantleRequestAttachments(requestId) + `/${attachmentId}`, {
          method: 'DELETE',
        })
        await Promise.all([
          this.fetchAttachments(requestId),
          this.fetchAttachmentRequirements(requestId),
        ])
        useToast().success({ title: 'Berhasil', message: 'Attachment dihapus', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal hapus attachment'))
        return false
      } finally {
        this.deletingAttachmentById = { ...this.deletingAttachmentById, [attachmentId]: false }
      }
    },

    async voidAttachment(requestId: string, attachmentId: string, reason: string) {
      this.voidingAttachmentById = { ...this.voidingAttachmentById, [attachmentId]: true }
      try {
        await apiFetch(this.api().dismantleRequestAttachmentVoid(requestId, attachmentId), {
          method: 'POST',
          body: { reason, version: this.currentVersion },
        })
        await Promise.all([
          this.fetchAttachments(requestId),
          this.fetchAttachmentRequirements(requestId),
        ])
        useToast().success({ title: 'Berhasil', message: 'Attachment di-void', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal void attachment'))
        return false
      } finally {
        this.voidingAttachmentById = { ...this.voidingAttachmentById, [attachmentId]: false }
      }
    },

    async financeReview(requestId: string, serviceLineId: string, payload: DismantleFinanceReviewPayload) {
      if (this.reviewingFinance) return false
      this.reviewingFinance = true
      const intent = `finance-review:${requestId}:${serviceLineId}`
      try {
        const res = await apiFetch(this.api().dismantleServiceFinanceReview(requestId, serviceLineId), {
          method: 'POST',
          body: {
            ...payload,
            idempotencyKey: payload.idempotencyKey ?? getDismantleIdempotencyKey(intent),
            version: payload.version ?? this.currentVersion,
          },
        })
        clearDismantleIdempotencyKey(intent)
        await Promise.all([this.fetchDetail(requestId), this.fetchFinancialReviewData(requestId)])
        useToast().success({ title: 'Berhasil', message: 'Finance review diproses', color: 'green', position: 'bottomRight', layout: 2 })
        return res
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal finance review'))
        return false
      } finally {
        this.reviewingFinance = false
      }
    },

    async syncFinalCharges(id: string) {
      if (this.syncingCharges) return false
      this.syncingCharges = true
      try {
        await apiFetch(this.api().dismantleRequestSyncFinalCharges(id), { method: 'POST', body: {} })
        await Promise.all([this.fetchDetail(id), this.fetchFinancialSummary(id)])
        useToast().success({ title: 'Berhasil', message: 'Final charges disinkronkan', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal sync final charges'))
        return false
      } finally {
        this.syncingCharges = false
      }
    },

    async terminateServices(id: string) {
      if (this.terminatingServices) return false
      this.terminatingServices = true
      const intent = `terminate-services:${id}`
      try {
        await apiFetch(this.api().dismantleRequestTerminateServices(id), {
          method: 'POST',
          body: { idempotencyKey: getDismantleIdempotencyKey(intent), version: this.currentVersion },
        })
        clearDismantleIdempotencyKey(intent)
        await this.fetchDetail(id)
        useToast().success({ title: 'Berhasil', message: 'Service termination diproses', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        toastNormalizedError(normalizeApiError(e, 'Gagal terminate services'))
        return false
      } finally {
        this.terminatingServices = false
      }
    },

    async completeRequest(id: string) {
      if (this.completing) return false
      this.completing = true
      try {
        const readiness = await this.fetchCompletionReadiness(id)
        if (!readiness.eligible) {
          this.lastBlockers = readiness.blockers
          await Swal.fire({
            icon: 'warning',
            title: 'Completion diblokir',
            html: readiness.blockers.map((b) => `<div>${b.message}</div>`).join(''),
          })
          return false
        }
        const confirmed = await Swal.fire({
          title: 'Complete Request Dismantle?',
          icon: 'question',
          showCancelButton: true,
        })
        if (!confirmed.isConfirmed) return false
        const res = await apiFetch<{ data: Record<string, unknown> }>(this.api().dismantleRequestComplete(id), {
          method: 'POST',
          body: { version: this.currentVersion },
        })
        this.selected = normalizeDismantleRequest((res?.data ?? {}) as Record<string, unknown>)
        useToast().success({ title: 'Selesai', message: 'Request Dismantle completed', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: unknown) {
        this.lastBlockers = extractBlockersFromError(e)
        toastNormalizedError(normalizeApiError(e, 'Gagal complete request'))
        return false
      } finally {
        this.completing = false
      }
    },

    resetForm() {
      this.form = emptyDismantleForm()
      this.wizardStep = 0
      this.fieldErrors = {}
    },
  },
})

export function getDismantleRequestNo(row: { requestNumber?: string } | null | undefined): string {
  return row?.requestNumber ?? ''
}
