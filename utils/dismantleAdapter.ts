import type {
  DismantleAttachmentItem,
  DismantleAttachmentRequirementSummary,
  DismantleBlocker,
  DismantleCompletionReadiness,
  DismantleFinancialSummary,
  DismantleReadiness,
  DismantleReconciliation,
  DismantleRecoverySummary,
  DismantleRequest,
  DismantleRequestEquipment,
  DismantleRequestListItem,
  DismantleRequestService,
  DismantleStatistics,
} from '~/types/operations/dismantle'

function pick<T>(obj: Record<string, unknown>, camel: string, snake: string): T | undefined {
  if (obj[camel] !== undefined && obj[camel] !== null) return obj[camel] as T
  if (obj[snake] !== undefined && obj[snake] !== null) return obj[snake] as T
  return undefined
}

function str(val: unknown): string | null {
  if (val === undefined || val === null || val === '') return null
  return String(val)
}

function num(val: unknown): number | null {
  if (val === undefined || val === null || val === '') return null
  const n = Number(val)
  return Number.isFinite(n) ? n : null
}

function bool(val: unknown, fallback = false): boolean {
  if (typeof val === 'boolean') return val
  if (val === 'true' || val === 1 || val === '1') return true
  if (val === 'false' || val === 0 || val === '0') return false
  return fallback
}

export function normalizeBlocker(raw: Record<string, unknown>): DismantleBlocker {
  return {
    code: String(raw.code ?? 'UNKNOWN'),
    message: String(raw.message ?? 'Blocker'),
    referenceType: str(raw.referenceType ?? raw.reference_type) ?? undefined,
    referenceId: str(raw.referenceId ?? raw.reference_id) ?? undefined,
    metadata: (raw.metadata as Record<string, unknown>) ?? undefined,
  }
}

export function normalizeEquipment(raw: Record<string, unknown>): DismantleRequestEquipment {
  return {
    id: String(raw.id),
    dismantleRequestServiceId: String(
      pick(raw, 'dismantleRequestServiceId', 'dismantle_request_service_id') ?? ''
    ),
    equipmentId: String(pick(raw, 'equipmentId', 'equipment_id') ?? ''),
    equipmentAssignmentId:
      str(pick(raw, 'equipmentAssignmentId', 'equipment_assignment_id')) ?? null,
    equipmentWithdrawalId: str(pick(raw, 'equipmentWithdrawalId', 'equipment_withdrawal_id')) ?? null,
    productId: num(pick(raw, 'productId', 'product_id')),
    equipmentNo: str(pick(raw, 'equipmentNo', 'equipment_no')),
    serialNumber: str(pick(raw, 'serialNumber', 'serial_number')),
    kitNumber: str(pick(raw, 'kitNumber', 'kit_number')),
    ownershipType: (pick(raw, 'ownershipType', 'ownership_type') ??
      'UNKNOWN') as DismantleRequestEquipment['ownershipType'],
    ownerPerusahaanId: num(pick(raw, 'ownerPerusahaanId', 'owner_perusahaan_id')),
    ownerCustomerId: num(pick(raw, 'ownerCustomerId', 'owner_customer_id')),
    ownerVendorId: num(pick(raw, 'ownerVendorId', 'owner_vendor_id')),
    ownershipVerifiedAt: str(pick(raw, 'ownershipVerifiedAt', 'ownership_verified_at')),
    expectedToReturn: bool(pick(raw, 'expectedToReturn', 'expected_to_return')),
    foundStatus: (pick(raw, 'foundStatus', 'found_status') ??
      'PENDING') as DismantleRequestEquipment['foundStatus'],
    physicalCondition: str(pick(raw, 'physicalCondition', 'physical_condition')),
    dismantledAt: str(pick(raw, 'dismantledAt', 'dismantled_at')),
    warehouseReceivedAt: str(pick(raw, 'warehouseReceivedAt', 'warehouse_received_at')),
    dispositionStatus: str(pick(raw, 'dispositionStatus', 'disposition_status')),
    expectedComponentSnapshot:
      (pick(raw, 'expectedComponentSnapshot', 'expected_component_snapshot') as Record<
        string,
        unknown
      >) ?? null,
    equipment: (raw.equipment as DismantleRequestEquipment['equipment']) ?? undefined,
  }
}

export function normalizeService(raw: Record<string, unknown>): DismantleRequestService {
  const equipmentsRaw = (raw.equipments ?? raw.equipment ?? []) as Record<string, unknown>[]
  return {
    id: String(raw.id),
    serviceInstanceId: String(pick(raw, 'serviceInstanceId', 'service_instance_id') ?? ''),
    subscriptionId: str(pick(raw, 'subscriptionId', 'subscription_id')),
    subscriptionServiceId: str(pick(raw, 'subscriptionServiceId', 'subscription_service_id')),
    siteId: num(pick(raw, 'siteId', 'site_id')),
    serviceNumber: str(pick(raw, 'serviceNumber', 'service_number')),
    serviceName: str(pick(raw, 'serviceName', 'service_name')),
    planName: str(pick(raw, 'planName', 'plan_name')),
    currentServiceStatus: str(pick(raw, 'currentServiceStatus', 'current_service_status')),
    contractStart: str(pick(raw, 'contractStart', 'contract_start')),
    contractEnd: str(pick(raw, 'contractEnd', 'contract_end')),
    effectiveTerminationAt: str(pick(raw, 'effectiveTerminationAt', 'effective_termination_at')),
    billingCutoffPolicy: (pick(raw, 'billingCutoffPolicy', 'billing_cutoff_policy') ??
      'EFFECTIVE_DATE') as DismantleRequestService['billingCutoffPolicy'],
    prorateEnabled: bool(pick(raw, 'prorateEnabled', 'prorate_enabled')),
    earlyTermination: bool(pick(raw, 'earlyTermination', 'early_termination')),
    financeReviewStatus: (pick(raw, 'financeReviewStatus', 'finance_review_status') ??
      null) as DismantleRequestService['financeReviewStatus'],
    terminationStatus: str(pick(raw, 'terminationStatus', 'termination_status')),
    terminatedAt: str(pick(raw, 'terminatedAt', 'terminated_at')),
    terminationLastError: str(pick(raw, 'terminationLastError', 'termination_last_error')),
    billingCutoffResolvedAt: str(pick(raw, 'billingCutoffResolvedAt', 'billing_cutoff_resolved_at')),
    equipments: Array.isArray(equipmentsRaw) ? equipmentsRaw.map((e) => normalizeEquipment(e)) : [],
    serviceInstance: (raw.serviceInstance ?? raw.service_instance ?? null) as Record<
      string,
      unknown
    > | null,
  }
}

export function normalizeDismantleRequest(raw: Record<string, unknown>): DismantleRequest {
  const servicesRaw = (raw.services ?? []) as Record<string, unknown>[]
  return {
    id: String(raw.id),
    requestNumber: String(pick(raw, 'requestNumber', 'request_number') ?? ''),
    perusahaanId: num(pick(raw, 'perusahaanId', 'perusahaan_id')) ?? 0,
    customerId: num(pick(raw, 'customerId', 'customer_id')) ?? 0,
    siteId: num(pick(raw, 'siteId', 'site_id')) ?? 0,
    requestDate: String(pick(raw, 'requestDate', 'request_date') ?? ''),
    requestedEffectiveTerminationAt: String(
      pick(raw, 'requestedEffectiveTerminationAt', 'requested_effective_termination_at') ?? ''
    ),
    approvedEffectiveTerminationAt: str(
      pick(raw, 'approvedEffectiveTerminationAt', 'approved_effective_termination_at')
    ),
    scheduledAt: str(pick(raw, 'scheduledAt', 'scheduled_at')),
    terminationType: (pick(raw, 'terminationType', 'termination_type') ??
      'NORMAL') as DismantleRequest['terminationType'],
    reasonCode: str(pick(raw, 'reasonCode', 'reason_code')),
    reason: str(pick(raw, 'reason', 'reason')),
    destinationWarehouseId: num(pick(raw, 'destinationWarehouseId', 'destination_warehouse_id')),
    status: (raw.status ?? 'draft') as DismantleRequest['status'],
    summaryPhase: (pick(raw, 'summaryPhase', 'summary_phase') ??
      null) as DismantleRequest['summaryPhase'],
    version: num(raw.version) ?? 1,
    notes: str(raw.notes),
    approvalStatus: str(pick(raw, 'approvalStatus', 'approval_status')),
    rejectionReason: str(pick(raw, 'rejectionReason', 'rejection_reason')),
    blockReason: str(pick(raw, 'blockReason', 'block_reason')),
    submittedAt: str(pick(raw, 'submittedAt', 'submitted_at')),
    approvedAt: str(pick(raw, 'approvedAt', 'approved_at')),
    startedAt: str(pick(raw, 'startedAt', 'started_at')),
    completedAt: str(pick(raw, 'completedAt', 'completed_at')),
    customer: (raw.customer as DismantleRequest['customer']) ?? undefined,
    site: (raw.site as DismantleRequest['site']) ?? undefined,
    destinationWarehouse:
      (raw.destinationWarehouse ?? raw.destination_warehouse ?? null) as DismantleRequest['destinationWarehouse'],
    services: Array.isArray(servicesRaw) ? servicesRaw.map((s) => normalizeService(s)) : [],
    events: (raw.events as DismantleRequest['events']) ?? [],
    attachments: (raw.attachments as DismantleRequest['attachments']) ?? [],
    approvalLogs: (raw.approvalLogs ?? raw.approval_logs) as DismantleRequest['approvalLogs'],
    currentApprovers: (raw.currentApprovers ?? raw.current_approvers) as DismantleRequest['currentApprovers'],
    nextApprovalStep: num(pick(raw, 'nextApprovalStep', 'next_approval_step')) ?? undefined,
  }
}

export function normalizeListItem(raw: Record<string, unknown>): DismantleRequestListItem {
  const base = normalizeDismantleRequest(raw)
  const services = base.services ?? []
  const equipmentCount = services.reduce((sum, s) => sum + (s.equipments?.length ?? 0), 0)
  return {
    ...base,
    serviceCount: services.length,
    equipmentCount,
  }
}

export function unwrapApiArray<T = Record<string, unknown>>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data
  }
  return []
}

export function unwrapListPayload(payload: unknown): { items: DismantleRequestListItem[]; total: number } {
  if (Array.isArray(payload)) {
    return { items: payload.map((r) => normalizeListItem(r as Record<string, unknown>)), total: payload.length }
  }
  if (payload && typeof payload === 'object') {
    const p = payload as { data?: unknown[]; meta?: { total?: number } }
    const rows = Array.isArray(p.data) ? p.data : []
    return {
      items: rows.map((r) => normalizeListItem(r as Record<string, unknown>)),
      total: Number(p.meta?.total) || rows.length,
    }
  }
  return { items: [], total: 0 }
}

export function normalizeStatistics(raw: Record<string, unknown>): DismantleStatistics {
  const keys = [
    'total',
    'draft',
    'submitted',
    'approved',
    'rejected',
    'scheduled',
    'in_progress',
    'blocked',
    'cancelled',
    'completed',
  ] as const
  const out = {} as DismantleStatistics
  for (const k of keys) out[k] = Number(raw[k]) || 0
  return out
}

export function normalizeReadiness(raw: Record<string, unknown>): DismantleReadiness {
  const blockers = (raw.blockers ?? []) as Record<string, unknown>[]
  const warnings = (raw.warnings ?? []) as Record<string, unknown>[]
  return {
    eligible: bool(raw.eligible),
    purpose: (raw.purpose ?? 'submit') as DismantleReadiness['purpose'],
    blockers: blockers.map(normalizeBlocker),
    warnings: warnings.map(normalizeBlocker),
    checks: (raw.checks as Record<string, boolean>) ?? {},
    dismantleRequestId: String(raw.dismantleRequestId ?? raw.dismantle_request_id ?? ''),
  }
}

export function normalizeCompletionReadiness(raw: Record<string, unknown>): DismantleCompletionReadiness {
  const blockers = (raw.blockers ?? []) as Record<string, unknown>[]
  return {
    eligible: bool(raw.eligible),
    blockers: blockers.map(normalizeBlocker),
  }
}

export function normalizeReconciliation(raw: Record<string, unknown>): DismantleReconciliation {
  const readiness = normalizeCompletionReadiness(
    (raw.readiness as Record<string, unknown>) ?? { eligible: false, blockers: [] }
  )
  const services = ((raw.services ?? []) as Record<string, unknown>[]).map((s) => ({
    id: String(s.id),
    serviceInstanceId: String(s.serviceInstanceId ?? s.service_instance_id ?? ''),
    terminationStatus: str(s.terminationStatus ?? s.termination_status),
    billingCutoffPolicy: (s.billingCutoffPolicy ??
      s.billing_cutoff_policy ??
      'EFFECTIVE_DATE') as DismantleReconciliation['services'][0]['billingCutoffPolicy'],
    billingCutoffResolved: bool(s.billingCutoffResolved ?? s.billing_cutoff_resolved),
  }))
  const equipment = ((raw.equipment ?? []) as Record<string, unknown>[]).map((e) => ({
    id: String(e.id),
    equipmentId: String(e.equipmentId ?? e.equipment_id ?? ''),
    ownershipType: (e.ownershipType ?? e.ownership_type ?? 'UNKNOWN') as DismantleReconciliation['equipment'][0]['ownershipType'],
    foundStatus: (e.foundStatus ?? e.found_status ?? 'PENDING') as DismantleReconciliation['equipment'][0]['foundStatus'],
    dismantledAt: str(e.dismantledAt ?? e.dismantled_at),
    warehouseReceivedAt: str(e.warehouseReceivedAt ?? e.warehouse_received_at),
    dispositionStatus: str(e.dispositionStatus ?? e.disposition_status),
  }))
  return {
    dismantleRequestId: String(raw.dismantleRequestId ?? raw.dismantle_request_id ?? ''),
    status: (raw.status ?? 'draft') as DismantleReconciliation['status'],
    summaryPhase: (raw.summaryPhase ?? raw.summary_phase ?? null) as DismantleReconciliation['summaryPhase'],
    readiness,
    services,
    equipment,
  }
}

export function normalizeFinancialSummary(raw: Record<string, unknown>): DismantleFinancialSummary {
  return {
    dismantleRequestId: String(raw.dismantleRequestId ?? raw.dismantle_request_id ?? ''),
    charges: ((raw.charges ?? []) as Record<string, unknown>[]).map((c) => ({
      chargeKey: String(c.chargeKey ?? c.charge_key ?? ''),
      status: String(c.status ?? ''),
      amount: (c.amount ?? 0) as string | number,
      chargeType: String(c.chargeType ?? c.charge_type ?? ''),
    })),
    note: str(raw.note) ?? undefined,
  }
}

export function normalizeRecoverySummary(raw: Record<string, unknown>): DismantleRecoverySummary {
  return {
    total: Number(raw.total) || 0,
    pendingPhysical: Number(raw.pendingPhysical ?? raw.pending_physical) || 0,
    inTransit: Number(raw.inTransit ?? raw.in_transit) || 0,
    received: Number(raw.received) || 0,
    customerHandover: Number(raw.customerHandover ?? raw.customer_handover) || 0,
    notFound: Number(raw.notFound ?? raw.not_found) || 0,
    companyOwned: Number(raw.companyOwned ?? raw.company_owned) || 0,
    customerOwned: Number(raw.customerOwned ?? raw.customer_owned) || 0,
  }
}

export function normalizeAttachment(raw: Record<string, unknown>): DismantleAttachmentItem {
  const caps = (raw.capabilities as Record<string, unknown>) ?? {}
  return {
    id: String(raw.id),
    dismantleRequestId: String(pick(raw, 'dismantleRequestId', 'dismantle_request_id') ?? ''),
    attachmentType: String(raw.attachmentType ?? raw.attachment_type ?? 'OTHER') as DismantleAttachmentItem['attachmentType'],
    status: String(raw.status ?? 'ACTIVE') as DismantleAttachmentItem['status'],
    originalFileName: str(pick(raw, 'originalFileName', 'original_file_name') ?? raw.fileName ?? raw.file_name),
    mimeType: str(pick(raw, 'mimeType', 'mime_type')),
    fileExtension: str(pick(raw, 'fileExtension', 'file_extension')),
    fileSize: num(pick(raw, 'fileSize', 'file_size')),
    equipmentLineId: str(pick(raw, 'equipmentLineId', 'dismantle_request_equipment_id')),
    serviceLineId: str(pick(raw, 'serviceLineId', 'dismantle_request_service_id')),
    uploadedBy: num(pick(raw, 'uploadedBy', 'uploaded_by')),
    uploadedAt: str(pick(raw, 'uploadedAt', 'uploaded_at')),
    voidedBy: num(pick(raw, 'voidedBy', 'voided_by')),
    voidedAt: str(pick(raw, 'voidedAt', 'voided_at')),
    voidReason: str(pick(raw, 'voidReason', 'void_reason')),
    metadata: (raw.metadata ?? raw.metadata_json) as Record<string, unknown> | null,
    uploader: raw.uploader
      ? {
          id: Number((raw.uploader as Record<string, unknown>).id),
          fullName: str((raw.uploader as Record<string, unknown>).fullName ?? (raw.uploader as Record<string, unknown>).full_name) ?? undefined,
          email: str((raw.uploader as Record<string, unknown>).email) ?? undefined,
        }
      : null,
    capabilities: {
      canUpload: bool(caps.canUpload),
      canDelete: bool(caps.canDelete),
      canVoid: bool(caps.canVoid),
      canPreview: bool(caps.canPreview),
      canDownload: bool(caps.canDownload),
    },
  }
}

export function normalizeAttachmentRequirements(
  raw: Record<string, unknown>
): DismantleAttachmentRequirementSummary {
  const mapReq = (list: unknown) =>
    Array.isArray(list)
      ? list.map((item) => {
          const r = item as Record<string, unknown>
          return {
            attachmentType: String(r.attachmentType ?? r.attachment_type ?? ''),
            equipmentLineId: str(pick(r, 'equipmentLineId', 'equipment_line_id')),
            serviceLineId: str(pick(r, 'serviceLineId', 'service_line_id')),
            severity: (r.severity ?? 'optional') as 'required' | 'warning' | 'optional',
            message: String(r.message ?? ''),
          }
        })
      : []
  return {
    requirements: mapReq(raw.requirements),
    fulfilled: mapReq(raw.fulfilled),
    missing: mapReq(raw.missing),
    warnings: mapReq(raw.warnings),
    blockers: mapReq(raw.blockers),
  }
}

export function extractBlockersFromError(err: unknown): DismantleBlocker[] {
  const raw = err as { data?: { blockers?: unknown[] }; response?: { _data?: { data?: { blockers?: unknown[] } } } }
  const list =
    raw?.data?.blockers ??
    raw?.response?._data?.data?.blockers ??
    (Array.isArray(raw?.data) ? raw.data : null)
  if (!Array.isArray(list)) return []
  return list.map((b) => normalizeBlocker(b as Record<string, unknown>))
}
