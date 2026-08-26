/** Shared view models for AR/AP finance workspace tabs (presentation only). */

export type AgingBucketKey = 'current' | 'b1_30' | 'b31_60' | 'b61_90' | 'b90_plus'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type AgingViewMode = 'by_document' | 'by_party'

export interface AgingBucketSummary {
  key: AgingBucketKey | string
  label: string
  amount: number
  count: number
}

export interface AgingReportRow {
  id: string
  number: string
  partyId: number | string | null
  partyName: string
  dueDate: string | null
  documentDate?: string | null
  total?: number
  paidAmount?: number
  paymentStatus?: PaymentStatus | string
  remainingAmount: number
  daysPastDue: number
  bucket: AgingBucketKey | string
}

export interface AgingReportView {
  asOf: string
  buckets: AgingBucketSummary[]
  totalAmount: number
  totalCount: number
  rows: AgingReportRow[]
}

export interface AgingPartyAggregate {
  partyId: string
  partyName: string
  invoiceCount: number
  remainingAmount: number
  maxDaysPastDue: number
  worstBucket: AgingBucketKey | string
}

export interface OpenDocumentRow {
  id: string
  number: string
  partyId: number | string | null
  partyName: string
  documentDate: string | null
  dueDate: string | null
  total: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: PaymentStatus
  overdueDays: number
  agingBucket: AgingBucketKey | string
}

export interface FinanceWorkspaceTab {
  id: string
  label: string
  permission?: string | string[]
  count?: number | null
}

export interface ArReceiptPrefill {
  customerId: string | number
  invoiceId: string
  amount: number
  notes?: string
}

export interface ApPaymentPrefill {
  vendorId: string | number
  invoiceId: string
  amount: number
  description?: string
}
