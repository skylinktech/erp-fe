import type { PayrollRunStatus, PayrollRunType } from '~/types/payroll'

export const PAYROLL_RUN_STATUS = {
  DRAFT: 'DRAFT',
  CALCULATED: 'CALCULATED',
  REVIEW: 'REVIEW',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  POSTED: 'POSTED',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  REVERSED: 'REVERSED',
} as const satisfies Record<string, PayrollRunStatus>

export const PAYROLL_RUN_TYPE = {
  REGULAR: 'REGULAR',
  THR: 'THR',
  BONUS: 'BONUS',
  CORRECTION: 'CORRECTION',
  OFF_CYCLE: 'OFF_CYCLE',
  FINAL_PAY: 'FINAL_PAY',
} as const satisfies Record<string, PayrollRunType>

export const PAYROLL_RUN_TYPE_OPTIONS = [
  { label: 'Regular', value: PAYROLL_RUN_TYPE.REGULAR },
  { label: 'THR', value: PAYROLL_RUN_TYPE.THR },
  { label: 'Bonus', value: PAYROLL_RUN_TYPE.BONUS },
  { label: 'Correction', value: PAYROLL_RUN_TYPE.CORRECTION },
  { label: 'Off Cycle', value: PAYROLL_RUN_TYPE.OFF_CYCLE },
  { label: 'Final Pay', value: PAYROLL_RUN_TYPE.FINAL_PAY },
]

export const PAYROLL_RUN_STATUS_OPTIONS = [
  { label: 'Draft', value: PAYROLL_RUN_STATUS.DRAFT },
  { label: 'Calculated', value: PAYROLL_RUN_STATUS.CALCULATED },
  { label: 'Review', value: PAYROLL_RUN_STATUS.REVIEW },
  { label: 'Submitted', value: PAYROLL_RUN_STATUS.SUBMITTED },
  { label: 'Approved', value: PAYROLL_RUN_STATUS.APPROVED },
  { label: 'Rejected', value: PAYROLL_RUN_STATUS.REJECTED },
  { label: 'Posted', value: PAYROLL_RUN_STATUS.POSTED },
  { label: 'Payment Processing', value: PAYROLL_RUN_STATUS.PAYMENT_PROCESSING },
  { label: 'Partially Paid', value: PAYROLL_RUN_STATUS.PARTIALLY_PAID },
  { label: 'Paid', value: PAYROLL_RUN_STATUS.PAID },
  { label: 'Closed', value: PAYROLL_RUN_STATUS.CLOSED },
  { label: 'Cancelled', value: PAYROLL_RUN_STATUS.CANCELLED },
]

export const PAYROLL_STATUS_BADGE: Record<string, { text: string; class: string }> = {
  DRAFT: { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' },
  CALCULATED: { text: 'Calculated', class: 'badge rounded-pill bg-label-info' },
  REVIEW: { text: 'Review', class: 'badge rounded-pill bg-label-primary' },
  SUBMITTED: { text: 'Submitted', class: 'badge rounded-pill bg-label-warning' },
  APPROVED: { text: 'Approved', class: 'badge rounded-pill bg-label-success' },
  REJECTED: { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' },
  POSTED: { text: 'Posted', class: 'badge rounded-pill bg-label-success' },
  PAYMENT_PROCESSING: { text: 'Payment Processing', class: 'badge rounded-pill bg-label-info' },
  PARTIALLY_PAID: { text: 'Partially Paid', class: 'badge rounded-pill bg-label-warning' },
  PAID: { text: 'Paid', class: 'badge rounded-pill bg-label-success' },
  CLOSED: { text: 'Closed', class: 'badge rounded-pill bg-label-dark' },
  CANCELLED: { text: 'Cancelled', class: 'badge rounded-pill bg-label-secondary' },
  REVERSED: { text: 'Reversed', class: 'badge rounded-pill bg-label-danger' },
  PENDING: { text: 'Pending', class: 'badge rounded-pill bg-label-secondary' },
  PROCESSING: { text: 'Processing', class: 'badge rounded-pill bg-label-info' },
  FAILED: { text: 'Failed', class: 'badge rounded-pill bg-label-danger' },
  READY: { text: 'Ready', class: 'badge rounded-pill bg-label-primary' },
  BLOCKING_ERROR: { text: 'Blocking', class: 'badge rounded-pill bg-label-danger' },
  WARNING: { text: 'Warning', class: 'badge rounded-pill bg-label-warning' },
  ACTIVE: { text: 'Active', class: 'badge rounded-pill bg-label-success' },
  INACTIVE: { text: 'Inactive', class: 'badge rounded-pill bg-label-secondary' },
}

export const PAYROLL_CONFIRM = {
  calculate: 'Payroll akan dihitung dari source data terbaru (kompensasi, attendance, tax, BPJS). Lanjutkan?',
  recalculate:
    'Recalculate Payroll akan mengganti calculation snapshot saat ini menggunakan source data terbaru. Lanjutkan?',
  submit: 'Payroll akan diajukan ke approval. Employee yang blocked harus diselesaikan terlebih dahulu. Lanjutkan?',
  approve: 'Payroll Run akan disetujui. Lanjutkan?',
  reject: 'Payroll Run akan ditolak dan kembali ke Review. Lanjutkan?',
  post: 'Payroll yang sudah diposting tidak dapat diedit dan akan menghasilkan accounting transaction. Lanjutkan?',
  payment: 'Payment batch akan dibuat dari Payroll Run yang sudah posted. Lanjutkan?',
  retryFailed: 'Hanya item FAILED yang akan diproses ulang. Item yang sudah PAID tidak ikut. Lanjutkan?',
  processPayment: 'Payment batch akan diproses. Item yang sudah PAID tidak akan ditransfer ulang. Lanjutkan?',
}

export const PAYROLL_SUCCESS = {
  calculated: 'Payroll berhasil dihitung.',
  recalculated: 'Payroll berhasil dihitung ulang.',
  submitted: 'Payroll berhasil diajukan.',
  approved: 'Payroll berhasil disetujui.',
  rejected: 'Payroll ditolak.',
  posted: 'Payroll berhasil diposting.',
  paymentCreated: 'Payment batch berhasil dibuat.',
  paymentProcessed: 'Payment batch berhasil diproses.',
  paymentRetried: 'Failed payment berhasil di-retry.',
}
