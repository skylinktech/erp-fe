import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import type { PaymentRequest } from '~/stores/payment-request'

export function usePaymentRequestApproval() {
  const { userHasRole, userHasPermission } = usePermissions()
  const userStore = useUserStore()

  function getApprovers(row: PaymentRequest) {
    return row.currentApprovers ?? (row as { current_approvers?: typeof row.currentApprovers }).current_approvers ?? []
  }

  function isUserInApprovers(row: PaymentRequest): boolean {
    const uid = userStore.user?.id
    if (uid == null) return false
    const approvers = getApprovers(row)
    if (approvers.length === 0) return false
    return approvers.some((a) => {
      const aid = a.userId ?? (a as { user_id?: number }).user_id
      return aid != null && Number(aid) === Number(uid)
    })
  }

  function hasApprovePermission(row: PaymentRequest): boolean {
    const type = row.requestType || row.request_type || 'project'
    if (userHasRole('superadmin')) return true
    if (userHasPermission('approve_payment_request')) return true
    if (type === 'operational' && userHasPermission('approve_operational_payment_request')) return true
    if (type === 'reimbursement' && userHasPermission('approve_reimbursement_payment_request')) {
      return true
    }
    return false
  }

  function canApprovePaymentRequest(row: PaymentRequest | null | undefined): boolean {
    if (!row || row.status !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged = hasApprovePermission(row)

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }

    return isUserInApprovers(row)
  }

  function canRejectPaymentRequest(row: PaymentRequest | null | undefined): boolean {
    if (!row || row.status !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      hasApprovePermission(row) || userHasPermission('reject_payment_request')

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }

    return isUserInApprovers(row)
  }

  return { canApprovePaymentRequest, canRejectPaymentRequest }
}
