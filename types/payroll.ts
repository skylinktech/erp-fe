export type PayrollRunStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'REVIEW'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'POSTED'
  | 'PAYMENT_PROCESSING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REVERSED'

export type PayrollRunType = 'REGULAR' | 'THR' | 'BONUS' | 'CORRECTION' | 'OFF_CYCLE' | 'FINAL_PAY'

export type PayrollPaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED'

export type PayrollPaymentBatchStatus =
  | 'DRAFT'
  | 'READY'
  | 'PROCESSING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'

export type PayrollIssueSeverity = 'BLOCKING_ERROR' | 'WARNING'

export interface PayrollIssue {
  code: string
  message: string
  severity: PayrollIssueSeverity
  pegawaiId?: number
  recommendedAction?: string
}

export interface PayrollPeriod {
  id: string
  perusahaanId?: number
  code?: string
  name?: string
  periodMonth?: number
  periodYear?: number
  paymentDate?: string | null
  attendancePeriodId?: number | null
  isLastPeriod?: boolean
  status?: string
}

export interface PayrollEmployeeSnapshot {
  employee_name?: string
  nik?: string
  department?: string
  position?: string
  company?: string
  branch?: string
  bank_account?: string
  tax_profile?: { ptkp?: string; tax_method?: string }
  bpjs_profile?: { health?: boolean; employment?: boolean }
  [key: string]: unknown
}

export interface PayrollRunSummary {
  id: string
  payrollPeriodId?: string
  perusahaanId?: number
  runNumber?: number
  runType?: PayrollRunType | string
  status: PayrollRunStatus | string
  revision?: number
  attendancePeriodId?: number | null
  attendanceRevision?: number | null
  attendanceCurrentRevision?: number | null
  attendanceRevisionOutdated?: boolean
  employeeCount?: number
  blockedCount?: number
  warningCount?: number
  grossTotal?: number
  netTotal?: number
  employerCostTotal?: number
  employeeDeductionAmount?: number
  taxAmount?: number
  accountingStatus?: string
  journalId?: string | null
  calculationVersion?: string | number
  taxRuleVersion?: string | null
  bpjsRuleVersion?: string | null
  createdAt?: string
  calculatedAt?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  postedAt?: string | null
  period?: PayrollPeriod | null
  currentApprovalStep?: number | null
  nextApprovalStep?: number | null
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  approvalLogs?: Array<Record<string, unknown>>
}

export interface PayrollEmployeeSummary {
  id: string
  pegawaiId?: number
  departemenId?: number | null
  paymentStatus?: string
  issues?: PayrollIssue[] | null
  employeeSnapshot?: PayrollEmployeeSnapshot | null
  grossAmount?: number
  netPayAmount?: number
  taxAmount?: number
  employeeDeductionAmount?: number
  employerContributionAmount?: number
}

export interface PayrollLine {
  id?: string
  componentCodeSnapshot?: string
  componentNameSnapshot?: string
  componentType?: string
  amount?: number
  quantity?: number | null
  rate?: number | null
  baseAmount?: number | null
  employeeBorne?: boolean
  employerBorne?: boolean
  taxable?: boolean
  calculationSource?: string
}

export interface PayrollEmployeeDetail {
  employee: PayrollEmployeeSummary
  lines: PayrollLine[]
}

export interface PayrollPaymentItem {
  id: string
  pegawaiId?: number
  amount?: number
  status?: string
  bankName?: string
  accountNumber?: string
  accountName?: string
  reference?: string | null
  failureMessage?: string | null
  employeeSnapshot?: PayrollEmployeeSnapshot | null
}

export interface PayrollPaymentBatch {
  id: string
  payrollRunId?: string
  bankAccountId?: string | number | null
  paymentDate?: string
  status?: PayrollPaymentBatchStatus | string
  totalItems?: number
  totalAmount?: number
  items?: PayrollPaymentItem[]
  run?: PayrollRunSummary
}

export interface PayrollPayslip {
  id: string
  snapshot?: PayrollEmployeeSnapshot | null
  period?: PayrollPeriod | null
  run?: { id: string; runType?: string; status?: string; paymentStatus?: string }
  earnings?: PayrollLine[]
  deductions?: PayrollLine[]
  employerContributions?: PayrollLine[]
  gross?: number
  tax?: number
  employeeDeductions?: number
  netPay?: number
}

export interface Paginated<T> {
  rows: T[]
  total: number
  page: number
  perPage: number
}

export interface PayrollPayslipStats {
  total: number
  paid: number
  pending: number
  failed: number
}

export function pickVal(row: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!row) return undefined
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key]
  }
  return undefined
}

export function unwrapCollection<T>(payload: unknown): Paginated<T> {
  if (Array.isArray(payload)) {
    return { rows: payload as T[], total: payload.length, page: 1, perPage: payload.length }
  }
  if (payload && typeof payload === 'object') {
    const p = payload as { data?: T[]; meta?: { total?: number; currentPage?: number; perPage?: number } }
    if (Array.isArray(p.data)) {
      return {
        rows: p.data,
        total: Number(p.meta?.total ?? p.data.length),
        page: Number(p.meta?.currentPage ?? 1),
        perPage: Number(p.meta?.perPage ?? p.data.length),
      }
    }
  }
  return { rows: [], total: 0, page: 1, perPage: 20 }
}

export function unwrapPayslipPage<T>(payload: unknown): Paginated<T> & { stats: PayrollPayslipStats } {
  const page = unwrapCollection<T>(payload)
  const empty: PayrollPayslipStats = { total: page.total, paid: 0, pending: 0, failed: 0 }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ...page, stats: empty }
  }
  const raw = (payload as { stats?: Partial<PayrollPayslipStats> }).stats
  return {
    ...page,
    stats: {
      total: Number(raw?.total ?? empty.total),
      paid: Number(raw?.paid ?? 0),
      pending: Number(raw?.pending ?? 0),
      failed: Number(raw?.failed ?? 0),
    },
  }
}
