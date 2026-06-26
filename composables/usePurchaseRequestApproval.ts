import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import type { PurchaseRequest } from '~/stores/purchase-request'

/** Cek apakah user boleh approve/reject PR (list & detail). */
export function usePurchaseRequestApproval() {
  const { userHasRole, userHasPermission } = usePermissions()
  const userStore = useUserStore()

  function getApprovers(row: PurchaseRequest) {
    return row.currentApprovers ?? (row as { current_approvers?: typeof row.currentApprovers }).current_approvers ?? []
  }

  function isUserInApprovers(row: PurchaseRequest): boolean {
    const uid = userStore.user?.id
    if (uid == null) return false
    const approvers = getApprovers(row)
    if (approvers.length === 0) return false
    return approvers.some((a) => {
      const aid = a.userId ?? (a as { user_id?: number }).user_id
      return aid != null && Number(aid) === Number(uid)
    })
  }

  function canApprovePurchaseRequest(row: PurchaseRequest | null | undefined): boolean {
    if (!row || row.status !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      userHasRole('superadmin') ||
      userHasPermission('approve_purchase_request')

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }

    return isUserInApprovers(row)
  }

  function canRejectPurchaseRequest(row: PurchaseRequest | null | undefined): boolean {
    if (!row || row.status !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      userHasRole('superadmin') ||
      userHasPermission('reject_purchase_request') ||
      userHasPermission('approve_purchase_request')

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }

    return isUserInApprovers(row)
  }

  return { canApprovePurchaseRequest, canRejectPurchaseRequest }
}
