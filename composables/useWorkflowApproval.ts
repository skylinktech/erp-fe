import { usePermissions } from '~/composables/usePermissions'
import { useApprovalOverride } from '~/composables/useApprovalOverride'
import { useUserStore } from '~/stores/user'

type ApproverLike = { userId?: number; user_id?: number }
type WorkflowRow = {
  status?: string
  documentStatus?: string
  document_status?: string
  currentApprovers?: ApproverLike[]
  current_approvers?: ApproverLike[]
}

/**
 * Generic FE gate for approval-workflow documents (currentApprovers + pending).
 */
export function useWorkflowApproval(options: {
  approvePermission: string
  rejectPermission?: string
  /** Status values treated as pending approval */
  pendingStatuses?: string[]
}) {
  const { userHasPermission } = usePermissions()
  const { canEmergencyOverride } = useApprovalOverride()
  const userStore = useUserStore()
  const pendingStatuses = options.pendingStatuses ?? ['pending', 'submitted']

  function getStatus(row: WorkflowRow | null | undefined): string {
    if (!row) return ''
    return String(row.status ?? row.documentStatus ?? row.document_status ?? '')
  }

  function getApprovers(row: WorkflowRow) {
    return row.currentApprovers ?? row.current_approvers ?? []
  }

  function isPending(row: WorkflowRow | null | undefined): boolean {
    return pendingStatuses.includes(getStatus(row))
  }

  function isUserInApprovers(row: WorkflowRow): boolean {
    const uid = userStore.user?.id
    if (uid == null) return false
    const approvers = getApprovers(row)
    if (approvers.length === 0) return false
    return approvers.some((a) => {
      const aid = a.userId ?? a.user_id
      return aid != null && Number(aid) === Number(uid)
    })
  }

  function canApprove(row: WorkflowRow | null | undefined): boolean {
    if (!row || !isPending(row)) return false
    if (userStore.user?.id == null) return false
    if (!userHasPermission(options.approvePermission)) return false
    const approvers = getApprovers(row)
    if (approvers.length === 0) return true
    return isUserInApprovers(row)
  }

  function canEmergencyOverrideApprove(row: WorkflowRow | null | undefined): boolean {
    if (!row || !isPending(row)) return false
    if (!canEmergencyOverride.value) return false
    if (!canApprove(row)) return true
    const approvers = getApprovers(row)
    // Empty approver list can show Approve in FE while backend still blocks (maker-checker, etc.)
    if (approvers.length === 0) return true
    return !isUserInApprovers(row)
  }

  function canReject(row: WorkflowRow | null | undefined): boolean {
    if (!row || !isPending(row)) return false
    if (userStore.user?.id == null) return false

    const rejectPerm = options.rejectPermission || options.approvePermission
    if (!userHasPermission(rejectPerm) && !userHasPermission(options.approvePermission)) {
      return false
    }
    const approvers = getApprovers(row)
    if (approvers.length === 0) return true
    return isUserInApprovers(row)
  }

  return {
    canApprove,
    canReject,
    canEmergencyOverrideApprove,
    isPending,
    isUserInApprovers,
    getApprovers,
    getStatus,
  }
}
