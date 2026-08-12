import { computed } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import {
  isMakerCheckerSelfBlocked,
  makerCheckerSelfBlockMessage,
  resolveCreatedBy,
} from '~/utils/makerChecker'

/** Shared FE maker-checker helpers (superadmin may self-approve/post). */
export function useMakerChecker() {
  const userStore = useUserStore()
  const { userHasRole } = usePermissions()

  const currentUserId = computed(() => Number(userStore.user?.id || 0))
  const isSuperadmin = computed(() => userHasRole('superadmin'))

  function isSelfActor(userId: number | string | null | undefined) {
    return Boolean(currentUserId.value && userId != null && userId !== '' && Number(userId) === currentUserId.value)
  }

  /** True when FE should block the action (non-superadmin acting on own doc). */
  function blocksSelfAction(userId: number | string | null | undefined) {
    return isMakerCheckerSelfBlocked({
      createdBy: userId,
      actorId: currentUserId.value,
      isSuperadmin: isSuperadmin.value,
    })
  }

  function selfBlockMessage(action: string) {
    return makerCheckerSelfBlockMessage(action)
  }

  function assertCanActOnCreatedBy(
    createdBy: number | string | null | undefined,
    action: string
  ): { ok: true } | { ok: false; message: string } {
    if (blocksSelfAction(createdBy)) {
      return { ok: false, message: selfBlockMessage(action) }
    }
    return { ok: true }
  }

  function assertCanActOnRow(
    row: { createdBy?: number | string | null; created_by?: number | string | null } | null | undefined,
    action: string
  ) {
    return assertCanActOnCreatedBy(resolveCreatedBy(row), action)
  }

  return {
    currentUserId,
    isSuperadmin,
    isSelfActor,
    blocksSelfAction,
    selfBlockMessage,
    assertCanActOnCreatedBy,
    assertCanActOnRow,
    resolveCreatedBy,
  }
}
