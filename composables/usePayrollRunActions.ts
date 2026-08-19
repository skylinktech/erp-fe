import { PAYROLL_RUN_STATUS, PAYROLL_CONFIRM } from '~/constants/payroll'
import type { PayrollRunSummary } from '~/types/payroll'

export type PayrollRunActionKey =
  | 'view'
  | 'calculate'
  | 'recalculate'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'post'
  | 'payment'

export interface PayrollRunAction {
  key: PayrollRunActionKey
  label: string
  icon: string
  variant?: 'primary' | 'outline' | 'danger'
  confirm?: string
}

export function usePayrollRunActions() {
  const perms = usePayrollPermissions()

  function actionsFor(run: PayrollRunSummary | null | undefined): PayrollRunAction[] {
    if (!run) return []
    const status = String(run.status || '')
    const items: PayrollRunAction[] = [{ key: 'view', label: 'Lihat', icon: 'ri-eye-line' }]

    if (status === PAYROLL_RUN_STATUS.DRAFT && perms.canCalculate.value) {
      items.push({
        key: 'calculate',
        label: 'Calculate',
        icon: 'ri-calculator-line',
        variant: 'primary',
        confirm: PAYROLL_CONFIRM.calculate,
      })
    }

    if (
      (status === PAYROLL_RUN_STATUS.CALCULATED || status === PAYROLL_RUN_STATUS.REVIEW) &&
      perms.canCalculate.value
    ) {
      items.push({
        key: 'recalculate',
        label: 'Recalculate',
        icon: 'ri-refresh-line',
        confirm: PAYROLL_CONFIRM.recalculate,
      })
    }

    if (
      (status === PAYROLL_RUN_STATUS.REVIEW || status === PAYROLL_RUN_STATUS.CALCULATED) &&
      perms.canSubmit.value
    ) {
      items.push({
        key: 'submit',
        label: 'Submit',
        icon: 'ri-send-plane-line',
        variant: 'primary',
        confirm: PAYROLL_CONFIRM.submit,
      })
    }

    if (status === PAYROLL_RUN_STATUS.SUBMITTED && perms.canApprove.value) {
      items.push({
        key: 'approve',
        label: 'Approve',
        icon: 'ri-check-line',
        variant: 'primary',
        confirm: PAYROLL_CONFIRM.approve,
      })
      items.push({
        key: 'reject',
        label: 'Reject',
        icon: 'ri-close-line',
        variant: 'danger',
        confirm: PAYROLL_CONFIRM.reject,
      })
    }

    if (status === PAYROLL_RUN_STATUS.APPROVED && perms.canPost.value) {
      items.push({
        key: 'post',
        label: 'Post',
        icon: 'ri-file-check-line',
        variant: 'primary',
        confirm: PAYROLL_CONFIRM.post,
      })
    }

    if (
      (status === PAYROLL_RUN_STATUS.POSTED ||
        status === PAYROLL_RUN_STATUS.PAYMENT_PROCESSING ||
        status === PAYROLL_RUN_STATUS.PARTIALLY_PAID) &&
      perms.canCreatePayment.value
    ) {
      items.push({
        key: 'payment',
        label: 'Payment',
        icon: 'ri-bank-card-line',
        confirm: PAYROLL_CONFIRM.payment,
      })
    }

    return items
  }

  return { actionsFor }
}
