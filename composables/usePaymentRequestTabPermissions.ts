import { computed } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import type { PaymentRequestRequestType } from '~/stores/payment-request'

const ALL_TABS: Array<{ label: string; value: PaymentRequestRequestType }> = [
  { label: 'Project Request', value: 'project' },
  { label: 'Operational Request', value: 'operational' },
  { label: 'Reimbursement', value: 'reimbursement' },
]

/** Tab visible if superadmin OR any of view|edit|create|delete for that type. */
const TAB_PERMISSIONS: Record<PaymentRequestRequestType, string[]> = {
  project: [
    'view_payment_request',
    'edit_payment_request',
    'create_payment_request',
    'delete_payment_request',
  ],
  operational: [
    'view_operational_payment_request',
    'edit_operational_payment_request',
    'create_operational_payment_request',
    'delete_operational_payment_request',
  ],
  reimbursement: [
    'view_reimbursement_payment_request',
    'edit_reimbursement_payment_request',
    'create_reimbursement_payment_request',
    'delete_reimbursement_payment_request',
  ],
}

const CREATE_PERMISSIONS: Record<PaymentRequestRequestType, string> = {
  project: 'create_payment_request',
  operational: 'create_operational_payment_request',
  reimbursement: 'create_reimbursement_payment_request',
}

const EDIT_PERMISSIONS: Record<PaymentRequestRequestType, string> = {
  project: 'edit_payment_request',
  operational: 'edit_operational_payment_request',
  reimbursement: 'edit_reimbursement_payment_request',
}

const DELETE_PERMISSIONS: Record<PaymentRequestRequestType, string> = {
  project: 'delete_payment_request',
  operational: 'delete_operational_payment_request',
  reimbursement: 'delete_reimbursement_payment_request',
}

export function usePaymentRequestTabPermissions() {
  const { userHasPermission, userHasRole } = usePermissions()

  function canAccessTab(type: PaymentRequestRequestType): boolean {
    if (userHasRole('superadmin')) return true
    return TAB_PERMISSIONS[type].some((p) => userHasPermission(p))
  }

  function canCreateType(type: PaymentRequestRequestType): boolean {
    if (userHasRole('superadmin')) return true
    return userHasPermission(CREATE_PERMISSIONS[type])
  }

  function canEditType(type: PaymentRequestRequestType): boolean {
    if (userHasRole('superadmin')) return true
    return userHasPermission(EDIT_PERMISSIONS[type])
  }

  function canDeleteType(type: PaymentRequestRequestType): boolean {
    if (userHasRole('superadmin')) return true
    return userHasPermission(DELETE_PERMISSIONS[type])
  }

  const visibleTabs = computed(() => ALL_TABS.filter((t) => canAccessTab(t.value)))

  const defaultRequestType = computed<PaymentRequestRequestType>(() => {
    const first = visibleTabs.value[0]
    return first?.value ?? 'project'
  })

  function resolveAllowedType(
    preferred?: string | null
  ): PaymentRequestRequestType | null {
    if (preferred === 'project' || preferred === 'operational' || preferred === 'reimbursement') {
      if (canAccessTab(preferred)) return preferred
    }
    return visibleTabs.value[0]?.value ?? null
  }

  return {
    ALL_TABS,
    TAB_PERMISSIONS,
    visibleTabs,
    defaultRequestType,
    canAccessTab,
    canCreateType,
    canEditType,
    canDeleteType,
    resolveAllowedType,
  }
}
