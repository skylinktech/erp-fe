export function usePayrollPermissions() {
  const { userHasPermission, userHasRole } = usePermissions()

  const isSuperadmin = computed(() => userHasRole('superadmin'))
  const can = (name: string) => isSuperadmin.value || userHasPermission(name)
  const canAny = (...names: string[]) => names.some((n) => can(n))

  const canViewSummary = computed(() =>
    canAny('view_payroll_run_summary', 'view_payroll_run_detail', 'access_payroll', 'view_payroll_dashboard')
  )
  const canViewDetail = computed(() => canAny('view_payroll_run_detail'))
  const canViewDashboard = computed(() => canAny('view_payroll_dashboard', 'access_payroll', 'view_payroll_run_summary'))
  const canCalculate = computed(() => canAny('calculate_payroll', 'access_payroll'))
  const canSubmit = computed(() => canAny('submit_payroll', 'access_payroll'))
  const canApprove = computed(() => canAny('approve_payroll'))
  const canPost = computed(() => canAny('post_payroll'))
  const canCreatePayment = computed(() => canAny('create_payroll_payment', 'post_payroll'))
  const canExportBank = computed(() => canAny('export_payroll_bank_file', 'create_payroll_payment'))
  const canManageVariable = computed(() => canAny('manage_variable_payroll', 'view_payroll_variable'))
  const canViewCompensation = computed(() => canAny('view_compensation', 'manage_compensation'))
  const canManageComponent = computed(() => canAny('manage_salary_component'))
  const canViewComponent = computed(() => canAny('manage_salary_component', 'view_salary_component', 'view_payroll_config'))
  const canManageCompensation = computed(() => canAny('manage_compensation'))
  const canManageTax = computed(() => canAny('manage_tax_profile'))
  const canManageBpjs = computed(() => canAny('manage_bpjs_profile'))
  const canManageStructure = computed(() => canAny('manage_salary_structure'))
  const canManagePeriod = computed(() => canAny('calculate_payroll', 'access_payroll'))
  const canManageProfile = computed(() => canAny('manage_compensation', 'access_payroll'))
  const canViewAllPayslip = computed(() => canAny('view_all_payslip', 'view_payroll_run_detail'))
  const canViewOwnPayslip = computed(() => canAny('view_own_payslip', 'view_all_payslip'))
  const canViewConfig = computed(() =>
    canAny(
      'view_payroll_config',
      'manage_salary_component',
      'manage_salary_structure',
      'view_compensation',
      'view_tax_profile',
      'view_bpjs_profile',
      'access_payroll'
    )
  )

  return {
    can,
    canAny,
    isSuperadmin,
    canViewSummary,
    canViewDetail,
    canViewDashboard,
    canCalculate,
    canSubmit,
    canApprove,
    canPost,
    canCreatePayment,
    canExportBank,
    canManageVariable,
    canViewCompensation,
    canManageComponent,
    canViewComponent,
    canManageCompensation,
    canManageTax,
    canManageBpjs,
    canManageProfile,
    canManageStructure,
    canManagePeriod,
    canViewAllPayslip,
    canViewOwnPayslip,
    canViewConfig,
  }
}
