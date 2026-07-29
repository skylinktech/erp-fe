import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import { getProjectApprovalStatus } from '~/constants/implementation/progressTrackerStatuses'
import type { ProgressTrackerProject } from '~/stores/progress-tracker'

export function useProgressTrackerApproval() {
  const { userHasRole, userHasPermission } = usePermissions()
  const userStore = useUserStore()

  function getApprovers(row: ProgressTrackerProject) {
    return (
      row.currentApprovers ??
      (row as { current_approvers?: typeof row.currentApprovers }).current_approvers ??
      []
    )
  }

  function isUserInApprovers(row: ProgressTrackerProject): boolean {
    const uid = userStore.user?.id
    if (uid == null) return false
    const approvers = getApprovers(row)
    if (approvers.length === 0) return false
    return approvers.some((a) => {
      const aid = a.userId ?? (a as { user_id?: number }).user_id
      return aid != null && Number(aid) === Number(uid)
    })
  }

  function canApproveProgressTracker(row: ProgressTrackerProject | null | undefined): boolean {
    if (!row || getProjectApprovalStatus(row) !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      userHasRole('superadmin') || userHasPermission('approve_progress_tracker')
    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }
    return isUserInApprovers(row)
  }

  function canRejectProgressTracker(row: ProgressTrackerProject | null | undefined): boolean {
    if (!row || getProjectApprovalStatus(row) !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      userHasRole('superadmin') ||
      userHasPermission('reject_progress_tracker') ||
      userHasPermission('approve_progress_tracker')

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }
    return isUserInApprovers(row)
  }

  function canSubmitProgressTracker(row: ProgressTrackerProject | null | undefined): boolean {
    if (!row) return false
    const approvalStatus = getProjectApprovalStatus(row)
    return (
      (approvalStatus === 'draft' || approvalStatus === 'rejected') &&
      (userHasRole('superadmin') ||
        userHasPermission('edit_progress_tracker') ||
        userHasPermission('create_progress_tracker'))
    )
  }

  return {
    canApproveProgressTracker,
    canRejectProgressTracker,
    canSubmitProgressTracker,
  }
}
