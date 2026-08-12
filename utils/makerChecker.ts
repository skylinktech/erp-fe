import { useUserStore } from '~/stores/user'

/**
 * Client-side maker-checker (SoD).
 * Superadmin may act on their own documents; other roles cannot.
 */

export function isSuperadminUser(user?: { roles?: Array<{ name?: string }> } | null): boolean {
  return Boolean(user?.roles?.some((role) => String(role?.name || '').toLowerCase() === 'superadmin'))
}

export function isMakerCheckerSelfBlocked(params: {
  createdBy: number | string | null | undefined
  actorId: number | string | null | undefined
  isSuperadmin?: boolean
}): boolean {
  if (params.isSuperadmin) return false
  if (params.createdBy == null || params.createdBy === '') return false
  if (params.actorId == null || params.actorId === '') return false
  return Number(params.createdBy) === Number(params.actorId)
}

export function makerCheckerSelfBlockMessage(action: string): string {
  return `Maker-checker: pembuat dokumen tidak boleh melakukan ${action} terhadap dokumen sendiri`
}

/**
 * Store/page helper: toast + return false when blocked.
 * Returns true when the action may proceed.
 */
export function guardMakerCheckerAction(
  createdBy: number | string | null | undefined,
  action: string
): boolean {
  const userStore = useUserStore()
  const blocked = isMakerCheckerSelfBlocked({
    createdBy,
    actorId: userStore.user?.id,
    isSuperadmin: isSuperadminUser(userStore.user),
  })
  if (!blocked) return true

  const toast = useToast()
  toast.error({
    title: 'Validasi',
    message: makerCheckerSelfBlockMessage(action),
    color: 'red',
    position: 'bottomRight',
  })
  return false
}

export function resolveCreatedBy(
  row?: { createdBy?: number | string | null; created_by?: number | string | null } | null
): number | string | null | undefined {
  if (!row) return null
  return row.createdBy ?? row.created_by ?? null
}
