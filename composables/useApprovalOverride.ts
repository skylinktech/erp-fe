import { computed } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'

export type ApprovalOverrideCapabilities = {
  approvalOverrideEnabled?: boolean
  canEmergencyOverrideApprove?: boolean
}

export type EmergencyOverridePayload = {
  mode: 'SUPERADMIN_EMERGENCY_OVERRIDE'
  reason: string
  ticketRef?: string
}

export function useApprovalOverride() {
  const { userHasPermission, userHasRole } = usePermissions()
  const userStore = useUserStore()

  const capabilities = computed<ApprovalOverrideCapabilities>(() => {
    const user = userStore.user as Record<string, unknown> | null
    const caps = user?.capabilities as ApprovalOverrideCapabilities | undefined
    return caps ?? {}
  })

  const overrideEnabled = computed(() => {
    if (capabilities.value.approvalOverrideEnabled != null) {
      return Boolean(capabilities.value.approvalOverrideEnabled)
    }
    // Cached session may predate capabilities — backend still enforces flag
    return userHasRole('superadmin') && userHasPermission('override_workflow_approval')
  })

  const canEmergencyOverride = computed(() => {
    if (capabilities.value.canEmergencyOverrideApprove != null) {
      return Boolean(capabilities.value.canEmergencyOverrideApprove)
    }
    return (
      overrideEnabled.value &&
      userHasRole('superadmin') &&
      userHasPermission('override_workflow_approval')
    )
  })

  return {
    capabilities,
    overrideEnabled,
    canEmergencyOverride,
  }
}
