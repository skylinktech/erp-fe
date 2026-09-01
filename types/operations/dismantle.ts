import type { ApprovalLogEntry } from '~/types/approval'

export type DismantleRequestStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'in_progress'
  | 'blocked'
  | 'cancelled'
  | 'completed'

export type DismantleSummaryPhase =
  | 'AWAITING_PHYSICAL'
  | 'AWAITING_RECEIPT'
  | 'AWAITING_TERMINATION'
  | 'AWAITING_BILLING'
  | 'READY_TO_COMPLETE'
  | 'PARTIAL'
  | 'BLOCKED'

export type DismantleTerminationType =
  | 'NORMAL'
  | 'EARLY_TERMINATION'
  | 'CUSTOMER_REQUEST'
  | 'INTERNAL'
  | 'CONTRACT_EXPIRED'
  | 'OTHER'

export type DismantleBillingCutoffPolicy =
  | 'EFFECTIVE_DATE'
  | 'END_OF_PERIOD'
  | 'FULL_PERIOD'
  | 'MANUAL_REVIEW'

export type DismantleEquipmentOwnership =
  | 'COMPANY_OWNED'
  | 'CUSTOMER_OWNED'
  | 'LEASED'
  | 'THIRD_PARTY'
  | 'UNKNOWN'

export type DismantleFoundStatus =
  | 'PENDING'
  | 'FOUND'
  | 'NOT_FOUND'
  | 'PARTIAL'
  | 'NOT_APPLICABLE'

export type DismantleCustodyStatus = string
export type DismantleDispositionStatus = string

export type DismantleFinanceReviewStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUIRED'

export type DismantleFinanceChargeResolution = 'APPROVE' | 'REJECT' | 'REQUEST_REVISION'

export type DismantleReadinessPurpose = 'submit' | 'approve' | 'schedule' | 'unblock' | 'cancel'

export interface DismantleBlocker {
  code: string
  message: string
  referenceType?: string
  referenceId?: string
  metadata?: Record<string, unknown>
}

export type DismantleWarning = DismantleBlocker

export interface DismantleReadiness {
  eligible: boolean
  purpose: DismantleReadinessPurpose
  blockers: DismantleBlocker[]
  warnings: DismantleWarning[]
  checks: Record<string, boolean>
  dismantleRequestId: string
}

export interface DismantleCompletionReadiness {
  eligible: boolean
  blockers: DismantleBlocker[]
}

export interface DismantleRequestEquipment {
  id: string
  dismantleRequestServiceId: string
  equipmentId: string
  equipmentAssignmentId: string | null
  equipmentWithdrawalId: string | null
  productId: number | null
  equipmentNo: string | null
  serialNumber: string | null
  kitNumber: string | null
  ownershipType: DismantleEquipmentOwnership
  ownerPerusahaanId: number | null
  ownerCustomerId: number | null
  ownerVendorId: number | null
  ownershipVerifiedAt: string | null
  expectedToReturn: boolean
  foundStatus: DismantleFoundStatus
  physicalCondition: string | null
  dismantledAt: string | null
  warehouseReceivedAt: string | null
  dispositionStatus: DismantleDispositionStatus | null
  expectedComponentSnapshot: Record<string, unknown> | null
  equipment?: { id: string; status?: string; serialNumber?: string }
}

export interface DismantleRequestService {
  id: string
  serviceInstanceId: string
  subscriptionId: string | null
  subscriptionServiceId: string | null
  siteId: number | null
  serviceNumber: string | null
  serviceName: string | null
  planName: string | null
  currentServiceStatus: string | null
  contractStart: string | null
  contractEnd: string | null
  effectiveTerminationAt: string | null
  billingCutoffPolicy: DismantleBillingCutoffPolicy
  prorateEnabled: boolean
  earlyTermination: boolean
  financeReviewStatus: DismantleFinanceReviewStatus | null
  terminationStatus: string | null
  terminatedAt: string | null
  terminationLastError: string | null
  billingCutoffResolvedAt: string | null
  equipments: DismantleRequestEquipment[]
  serviceInstance?: Record<string, unknown> | null
}

export interface DismantleRequest {
  id: string
  requestNumber: string
  perusahaanId: number
  customerId: number
  siteId: number
  requestDate: string
  requestedEffectiveTerminationAt: string
  approvedEffectiveTerminationAt: string | null
  scheduledAt: string | null
  terminationType: DismantleTerminationType
  reasonCode: string | null
  reason: string | null
  destinationWarehouseId: number | null
  status: DismantleRequestStatus
  summaryPhase: DismantleSummaryPhase | null
  version: number
  notes: string | null
  approvalStatus: string | null
  rejectionReason: string | null
  blockReason: string | null
  submittedAt: string | null
  approvedAt: string | null
  startedAt: string | null
  completedAt: string | null
  customer?: { id: number; name: string; code?: string }
  site?: { id: number; name: string }
  destinationWarehouse?: { id: number; name: string } | null
  services: DismantleRequestService[]
  events?: Array<Record<string, unknown>>
  attachments?: DismantleAttachmentItem[]
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  nextApprovalStep?: number | null
}

export interface DismantleRequestListItem extends Pick<
  DismantleRequest,
  | 'id'
  | 'requestNumber'
  | 'customerId'
  | 'siteId'
  | 'terminationType'
  | 'requestedEffectiveTerminationAt'
  | 'scheduledAt'
  | 'status'
  | 'summaryPhase'
  | 'version'
> {
  customer?: DismantleRequest['customer']
  site?: DismantleRequest['site']
  services?: DismantleRequestService[]
  serviceCount?: number
  equipmentCount?: number
}

export interface DismantleStatistics {
  total: number
  draft: number
  submitted: number
  approved: number
  rejected: number
  scheduled: number
  in_progress: number
  blocked: number
  cancelled: number
  completed: number
}

export interface DismantleReconciliation {
  dismantleRequestId: string
  status: DismantleRequestStatus
  summaryPhase: DismantleSummaryPhase | null
  readiness: DismantleCompletionReadiness
  services: Array<{
    id: string
    serviceInstanceId: string
    terminationStatus: string | null
    billingCutoffPolicy: DismantleBillingCutoffPolicy
    billingCutoffResolved: boolean
  }>
  equipment: Array<{
    id: string
    equipmentId: string
    ownershipType: DismantleEquipmentOwnership
    foundStatus: DismantleFoundStatus
    dismantledAt: string | null
    warehouseReceivedAt: string | null
    dispositionStatus: string | null
  }>
}

export interface DismantleFinancialSummary {
  dismantleRequestId: string
  charges: Array<{
    chargeKey: string
    status: string
    amount: string | number
    chargeType: string
  }>
  note?: string
}

export interface DismantleRecoverySummary {
  total: number
  pendingPhysical: number
  inTransit: number
  received: number
  customerHandover: number
  notFound: number
  companyOwned: number
  customerOwned: number
}

export interface DismantleServiceLineInput {
  serviceInstanceId: string
  billingCutoffPolicy: DismantleBillingCutoffPolicy
  prorateEnabled?: boolean
  earlyTermination?: boolean
  effectiveTerminationAt?: string
}

export interface DismantleCreatePayload {
  perusahaanId: number
  customerId: number
  siteId: number
  requestDate: string
  requestedEffectiveTerminationAt: string
  terminationType: DismantleTerminationType
  reasonCode?: string | null
  reason?: string | null
  destinationWarehouseId?: number | null
  notes?: string | null
  serviceLines: DismantleServiceLineInput[]
  copyFromRequestId?: string
}

export interface DismantleUpdatePayload extends Partial<Omit<DismantleCreatePayload, 'perusahaanId' | 'customerId' | 'siteId'>> {
  version: number
}

export interface DismantlePhysicalRemovalPayload {
  withdrawalId: string
  foundStatus: DismantleFoundStatus
  physicalCondition?: string
  actualSerial?: string
  notes?: string
  idempotencyKey: string
  version?: number
}

export interface DismantleWarehouseReceiptPayload {
  withdrawalId: string
  destinationWarehouseId: number
  actualSerial?: string
  receivedCondition?: string
  idempotencyKey: string
  version?: number
}

export interface DismantleCustomerHandoverPayload {
  attachmentId: string
  handoverAt?: string
  receivedBy?: string
  documentRef?: string
  notes?: string
  idempotencyKey: string
  version?: number
}

export type DismantleAttachmentType =
  | 'CUSTOMER_REQUEST'
  | 'TERMINATION_LETTER'
  | 'WORK_ORDER'
  | 'SITE_PERMIT'
  | 'PHOTO_BEFORE'
  | 'PHOTO_AFTER'
  | 'CUSTOMER_HANDOVER'
  | 'WAREHOUSE_RECEIPT'
  | 'INSPECTION_DOCUMENT'
  | 'OTHER'

export type DismantleAttachmentStatus = 'ACTIVE' | 'VOIDED'

export interface DismantleAttachmentCapabilities {
  canUpload: boolean
  canDelete: boolean
  canVoid: boolean
  canPreview: boolean
  canDownload: boolean
}

export interface DismantleAttachmentItem {
  id: string
  dismantleRequestId: string
  attachmentType: DismantleAttachmentType
  status: DismantleAttachmentStatus
  originalFileName: string | null
  mimeType: string | null
  fileExtension: string | null
  fileSize: number | null
  equipmentLineId: string | null
  serviceLineId: string | null
  uploadedBy: number | null
  uploadedAt: string | null
  voidedBy: number | null
  voidedAt: string | null
  voidReason: string | null
  metadata?: Record<string, unknown> | null
  uploader?: { id: number; fullName?: string; email?: string } | null
  capabilities?: DismantleAttachmentCapabilities
}

export interface DismantleAttachmentRequirementSummary {
  requirements: Array<{
    attachmentType: string
    equipmentLineId?: string | null
    serviceLineId?: string | null
    severity: 'required' | 'warning' | 'optional'
    message: string
  }>
  fulfilled: DismantleAttachmentRequirementSummary['requirements']
  missing: DismantleAttachmentRequirementSummary['requirements']
  warnings: DismantleAttachmentRequirementSummary['requirements']
  blockers: DismantleAttachmentRequirementSummary['requirements']
}

export interface DismantleAttachmentUploadPayload {
  file: File
  attachmentType: DismantleAttachmentType
  equipmentLineId?: string
  serviceLineId?: string
  description?: string
}

export interface DismantleFinanceReviewPayload {
  decision: DismantleFinanceChargeResolution
  approvedCutoff?: string
  approvedAmounts?: Record<string, string>
  notes?: string
  version?: number
  idempotencyKey?: string
}

export interface DismantleListParams {
  page: number
  rows: number
  search?: string
  status?: string | null
  customerId?: number | null
  siteId?: number | null
  terminationType?: string | null
}

export interface DismantleWizardForm {
  id?: string
  version?: number
  perusahaanId: number | null
  customerId: number | null
  siteId: number | null
  requestDate: string
  requestedEffectiveTerminationAt: string
  terminationType: DismantleTerminationType | null
  reasonCode: string
  reason: string
  notes: string
  destinationWarehouseId: number | null
  scheduledAt: string
  serviceLines: DismantleServiceLineInput[]
  selectedServiceInstanceIds: string[]
}

export interface ApiListResponse<T> {
  success?: boolean
  message?: string
  data: T[] | { data: T[]; meta?: { total?: number } }
  meta?: { total?: number }
}
