export function configurationAccess(input: { isAdmin: boolean; permissions: string[] }) {
  const allowed = (name: string) => input.isAdmin || input.permissions.includes(name)
  return {
    canView: allowed('view_business_model_configuration') || allowed('manage_business_model_configuration'),
    canChangeProfile: allowed('manage_business_model_configuration'),
    canChangeEligibility: allowed('manage_company_flow_eligibility'),
    canChangeWarehouse: allowed('manage_company_warehouse_allocation'),
    canChangeOwnership: allowed('manage_company_inventory_ownership'),
    canChangeReturnPolicy: allowed('manage_retail_return_policy'),
  }
}

export function grantControlsPrimaryFlow(source: string) {
  return source !== 'PRIMARY_PROFILE'
}

export function activationLabel(profileCode: string | null | undefined, overallStatus: string | null | undefined) {
  if (profileCode !== 'RETAIL') return 'NOT_RETAIL_PROFILE'
  if (overallStatus === 'READY') return 'READY_FOR_ACTIVATION'
  return 'CONFIGURED_NOT_READY'
}
