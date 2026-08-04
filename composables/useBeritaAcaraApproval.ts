import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import type { BeritaAcara } from '~/stores/berita-acara'

export function useBeritaAcaraApproval() {
  const { userHasRole, userHasPermission } = usePermissions()
  const userStore = useUserStore()

  function getApprovers(row: BeritaAcara) {
    return row.currentApprovers ?? (row as { current_approvers?: typeof row.currentApprovers }).current_approvers ?? []
  }

  function isUserInApprovers(row: BeritaAcara): boolean {
    const uid = userStore.user?.id
    if (uid == null) return false
    const approvers = getApprovers(row)
    if (approvers.length === 0) return false
    return approvers.some((a) => {
      const aid = a.userId ?? (a as { user_id?: number }).user_id
      return aid != null && Number(aid) === Number(uid)
    })
  }

  function canApproveBeritaAcara(row: BeritaAcara | null | undefined): boolean {
    if (!row || row.status !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      userHasRole('superadmin') || userHasPermission('approve_berita_acara')

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }

    return isUserInApprovers(row)
  }

  function canRejectBeritaAcara(row: BeritaAcara | null | undefined): boolean {
    if (!row || row.status !== 'pending') return false
    if (userStore.user?.id == null) return false

    const privileged =
      userHasRole('superadmin') ||
      userHasPermission('reject_berita_acara') ||
      userHasPermission('approve_berita_acara')

    if (privileged) {
      const approvers = getApprovers(row)
      if (approvers.length === 0) return true
      return isUserInApprovers(row)
    }

    return isUserInApprovers(row)
  }

  return { canApproveBeritaAcara, canRejectBeritaAcara }
}
