export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  // Cookie-based auth: tidak perlu check localStorage
  
  try {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    
    // Pastikan user data sudah ter-load menggunakan method yang robust
    const user = await userStore.ensureUserLoaded()
    
    if (!user) {
      return navigateTo('/errors/401')
    }

    // Mapping route ke permission yang diperlukan
    const routePermissionMap: Record<string, string> = {
      '/inventory/product': 'view_product',
      '/inventory/stock': 'view_stock',
      '/inventory/stock-in': 'view_stock_in',
      '/inventory/stock-out': 'view_stock_out',
      '/inventory/stock-transfer': 'view_stock_transfer',
      '/inventory/gudang': 'view_gudang',
      '/inventory/unit': 'view_unit',
      '/inventory/kategori': 'view_kategori',
      '/inventory/service': 'view_service',
      '/inventory/service-plan': 'view_service_plan',
      '/inventory/adjustment': 'view_inventory_adjustment',
      '/inventory/purchase-return': 'view_purchase_return',
      '/inventory/stock-card': 'view_stock_card',
      '/inventory/reconciliation': 'view_inventory_reconciliation',
      '/inventory/stock-movements': 'view_stock_movements',
      '/inventory/valuation': 'view_inventory_valuation',
      '/inventory/cost-balance': 'view_inventory_cost_balance',
      '/finance/inventory-accounting-events': 'view_inventory_accounting_event',
      '/finance/accounting-processing-monitor': 'view_accounting_outbox',
      '/finance/accounting-exceptions': 'view_accounting_exception',
      '/finance/grni': 'view_inventory_grni',
      '/finance/inventory-cogs': 'view_inventory_cogs',
      '/finance/ppv': 'view_inventory_ppv',
      '/finance/nrv': 'view_inventory_nrv',
      '/finance/inventory-accounting-reconciliation': 'view_inventory_accounting_reconciliation',
      '/service/service': 'view_service',
      '/service/service-plan': 'view_service_plan',
      '/service/did': 'view_did',
      '/inventory/otc': 'view_otc',
      '/sales/sales-order': 'view_sales_order',
      '/sales/sales-invoice': 'view_sales_invoice',
      '/sales/surat-jalan': 'view_surat_jalan',
      '/sales/quotation': 'view_quotation',
      '/sales/sales-return': 'view_sales_return',
      '/sales/customer': 'view_customer',
      '/purchasing/purchase-order': 'view_purchase_order',
      '/purchasing/material-request': 'access_material_request',
      '/purchasing/purchase-invoice': 'view_purchase_invoice',
      '/purchasing/vendor': 'view_vendor',
      '/accounting/accounts/': 'view_account',
      '/accounting/assets/': 'view_asset',
      '/accounting/bank-account/': 'view_bank_account',
      '/finance/bank-account': 'view_bank_account',
      '/accounting/expenses/': 'view_expense',
      '/accounting/journals/': 'view_journal',
      '/finance/tax-masters': 'view_tax_master',
      '/accounting/ap-payments/': 'view_ap_payment',
      '/accounting/ar-receipts/': 'view_ar_receipt',
      '/finance/invoices': 'view_invoice',
      '/finance/payment-request': 'view_payment_request',
      '/operations/request-activation': 'view_request_activation',
      '/operations/berita-acara': 'view_berita_acara',
      '/operations/cetak-berita-acara': 'view_berita_acara',
      '/finance/billing-adjustments': 'view_billing_adjustment',
      '/finance/billing-preparations': 'view_billing_preparation',
      '/finance/ar-receipts': 'view_ar_receipt',
      '/finance/ap-payments': 'view_ap_payment',
      '/finance/fiscal-periods': 'view_fiscal_period',
      '/finance/reports/ar-aging': 'view_ar_aging',
      '/finance/reports/ap-aging': 'view_ap_aging',
      '/finance/bank-recon': 'view_bank_recon',
      '/finance/credit-notes': 'view_credit_note',
      '/finance/journals': 'view_journal',
      '/service-management/customer-service': 'view_service_instance',
      '/service-management/pending': 'view_service_instance',
      '/service-management/events': 'view_service_instance',
      '/service-management/monitoring': 'view_service_instance',
      '/hrd/pegawai': 'view_pegawai',
      '/hrd/departemen': 'view_departemen',
      '/hrd/divisi': 'view_divisi',
      '/hrd/jabatan': 'view_jabatan',
      '/hrd/cuti': 'view_cuti',
      '/hrd/lembur': 'view_lembur',
      '/hrd/kehadiran': 'view_kehadiran',
      '/hrd/perjalanan-dinas': 'view_perjalanan_dinas',
      '/hrd/saldo-cuti': 'view_saldo_cuti',
      '/hrd/struktur-organisasi': 'view_struktur_organisasi',
      '/hrd/cetak-struktur-organisasi': 'view_struktur_organisasi',
      '/hrd/kalender': 'view_kalender',
      '/payroll': 'view_payroll_dashboard',
      '/payroll/dashboard': 'view_payroll_dashboard',
      '/payroll/periods': 'view_payroll_period',
      '/payroll/runs': 'view_payroll_run_summary',
      '/payroll/runs/create': 'calculate_payroll',
      '/payroll/variable-inputs': 'manage_variable_payroll',
      '/payroll/adjustments': 'view_payroll_run_summary',
      '/payroll/payments': 'create_payroll_payment',
      '/payroll/payslips': 'view_all_payslip',
      '/payroll/components': 'view_salary_component',
      '/payroll/structures': 'view_salary_structure',
      '/payroll/profiles': 'view_payroll_profile',
      '/payroll/compensations': 'view_compensation',
      '/payroll/tax-profiles': 'view_tax_profile',
      '/payroll/bpjs-profiles': 'view_bpjs_profile',
      '/payroll/configuration': 'view_payroll_config',
      '/payroll/me/payslips': 'view_own_payslip',
      '/payroll/cetak-payslip': 'view_own_payslip',
      '/hrd/cetak-cuti': 'view_cuti',
      '/hrd/cetak-lembur': 'view_lembur',
      '/hrd/cetak-perjalanan-dinas': 'view_perjalanan_dinas',
      '/implementation/cetak-arf': 'view_arf',
      '/finance/cetak-payment-request': 'view_payment_request',
      '/company/perusahaan': 'view_perusahaan',
      '/company/cabang': 'view_cabang',
      '/admin/roles': 'view_role',
      '/admin/permissions': 'view_permission',
      '/admin/dashboards': 'manage_dashboard',
      '/admin/dashboards/widgets': 'manage_dashboard_widget',
    }

    // Cek apakah user adalah superadmin
    const isSuperadmin = userStore.user?.roles?.some(role => role.name === 'superadmin')
    
    // Jika user adalah superadmin, biarkan akses ke semua halaman
    if (isSuperadmin) {
      return
    }

    // Dapatkan permission yang diperlukan untuk route saat ini
    let requiredPermission = routePermissionMap[to.path]
    
    // Handle dynamic routes yang menggunakan pattern matching
    if (!requiredPermission) {
      if (/^\/hrd\/pegawai\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'view_pegawai'
      } else if (/^\/hrd\/pegawai\/profile(\/.*)?$/.test(to.path)) {
        requiredPermission = 'view_pegawai'
      } else if (/^\/hrd\/cuti\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'create_cuti'
      } else if (/^\/hrd\/kehadiran\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'manage_jadwal_kehadiran'
      } else if (/^\/hrd\/payroll(\/|$)/.test(to.path)) {
        const canonical = to.path.replace(/^\/hrd\/payroll/, '/payroll') || '/payroll/dashboard'
        requiredPermission = routePermissionMap[canonical]
        if (!requiredPermission && /^\/payroll\/runs\/create/.test(canonical)) {
          requiredPermission = 'calculate_payroll'
        } else if (!requiredPermission && /^\/payroll\/runs\/\d+/.test(canonical)) {
          requiredPermission = 'view_payroll_run_summary'
        } else if (!requiredPermission && /^\/payroll\/payments\/\d+/.test(canonical)) {
          requiredPermission = 'create_payroll_payment'
        } else if (!requiredPermission && /^\/payroll\/structures\/\d+/.test(canonical)) {
          requiredPermission = 'view_salary_structure'
        }
      } else if (/^\/payroll\/runs\/create/.test(to.path)) {
        requiredPermission = 'calculate_payroll'
      } else if (/^\/payroll\/runs\/\d+/.test(to.path)) {
        requiredPermission = 'view_payroll_run_summary'
      } else if (/^\/payroll\/payments\/\d+/.test(to.path)) {
        requiredPermission = 'create_payroll_payment'
      } else if (/^\/payroll\/structures\/\d+/.test(to.path)) {
        requiredPermission = 'view_salary_structure'
      } else if (/^\/hrd\/perjalanan-dinas\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'create_perjalanan_dinas'
      } else if (/^\/hrd\/perjalanan-dinas\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_perjalanan_dinas'
      } else if (/^\/finance\/invoices\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_invoice'
      } else if (/^\/finance\/billing-preparations\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_billing_preparation'
      } else if (/^\/finance\/tax-masters/.test(to.path)) {
        requiredPermission = 'view_tax_master'
      } else if (/^\/finance\/billing-adjustments/.test(to.path)) {
        requiredPermission = 'view_billing_adjustment'
      } else if (/^\/finance\/payment-request\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_payment_request'
      } else if (/^\/finance\/payment-request\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_payment_request'
      } else if (/^\/finance\/payment-request/.test(to.path)) {
        requiredPermission = 'view_payment_request'
      } else if (/^\/finance\/fiscal-periods/.test(to.path)) {
        requiredPermission = 'view_fiscal_period'
      } else if (/^\/finance\/reports\/ar-aging/.test(to.path)) {
        requiredPermission = 'view_ar_aging'
      } else if (/^\/finance\/reports\/ap-aging/.test(to.path)) {
        requiredPermission = 'view_ap_aging'
      } else if (/^\/finance\/bank-recon/.test(to.path)) {
        requiredPermission = 'view_bank_recon'
      } else if (/^\/finance\/bank-account/.test(to.path)) {
        requiredPermission = 'view_bank_account'
      } else if (/^\/finance\/credit-notes/.test(to.path)) {
        requiredPermission = 'view_credit_note'
      } else if (/^\/finance\/journals/.test(to.path)) {
        requiredPermission = 'view_journal'
      } else if (/^\/service-management(\/.*)?$/.test(to.path)) {
        requiredPermission = 'view_service_instance'
      } else if (/^\/operations\/request-activation\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_request_activation'
      } else if (/^\/operations\/request-activation\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_request_activation'
      } else if (/^\/operations\/request-activation/.test(to.path)) {
        requiredPermission = 'view_request_activation'
      } else if (/^\/operations\/berita-acara\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_berita_acara'
      } else if (/^\/operations\/berita-acara\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_berita_acara'
      } else if (/^\/operations\/cetak-berita-acara/.test(to.path)) {
        requiredPermission = 'view_berita_acara'
      } else if (/^\/operations\/berita-acara/.test(to.path)) {
        requiredPermission = 'view_berita_acara'
      } else if (/^\/finance\/cetak-payment-request/.test(to.path)) {
        requiredPermission = 'view_payment_request'
      } else if (/^\/finance\/billing-preparations/.test(to.path)) {
        requiredPermission = 'view_billing_preparation'
      } else if (/^\/purchasing\/purchase-order\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'view_purchase_order'
      } else if (/^\/implementation\/arf\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_arf'
      } else if (/^\/implementation\/progress-tracker\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_progress_tracker'
      } else if (/^\/purchasing\/purchase-request\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_purchase_request'
      } else if (/^\/purchasing\/material-request\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_material_request'
      } else if (/^\/purchasing\/material-request\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_material_request'
      } else if (/^\/purchasing\/purchase-invoice\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'view_purchase_invoice'
      } else if (/^\/sales\/sales-invoice\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'create_sales_invoice'
      } else if (/^\/finance\/invoices\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'view_invoice'
      } else if (/^\/finance\/cetak-invoice/.test(to.path)) {
        requiredPermission = 'view_invoice'
      } else if (/^\/admin\/dashboards\/\d+\/layout-builder$/.test(to.path)) {
        requiredPermission = 'manage_dashboard'
      }
    }

    if (!requiredPermission) {
      // Cek untuk route yang menggunakan pattern matching
      for (const [routePattern, permission] of Object.entries(routePermissionMap)) {
        if (routePattern.endsWith('/') && to.path.startsWith(routePattern)) {
          requiredPermission = permission
          break
        }
      }
    }
    
    if (requiredPermission) {
      // Cek apakah user memiliki permission yang diperlukan
      const hasPermission = userStore.user?.roles?.some(role => 
        role.permissions?.some(permission => 
          permission.name === requiredPermission
        )
      )

      if (!hasPermission && to.path === '/hrd/kehadiran') {
        const selfServiceAllowed = ['access_kehadiran', 'view_own_kehadiran', 'show_kehadiran']
        const hasSelfService = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => selfServiceAllowed.includes(permission.name))
        )
        if (hasSelfService) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/runs/') || to.path.startsWith('/hrd/payroll/runs/'))) {
        const allowed = ['view_payroll_run_summary', 'view_payroll_run_detail', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path === '/payroll/payslips' || to.path === '/payroll/me/payslips' || to.path.startsWith('/payroll/cetak-payslip') || to.path === '/hrd/payroll/payslips' || to.path === '/hrd/payroll/me/payslips' || to.path.startsWith('/hrd/payroll/cetak-payslip'))) {
        const allowed = ['view_own_payslip', 'view_all_payslip', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path === '/payroll/variable-inputs' || to.path === '/hrd/payroll/variable-inputs')) {
        const allowed = ['view_payroll_variable', 'manage_variable_payroll', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/payments') || to.path.startsWith('/hrd/payroll/payments'))) {
        const allowed = ['view_payroll_payment', 'create_payroll_payment', 'post_payroll', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path === '/payroll/configuration' || to.path === '/hrd/payroll/configuration')) {
        const allowed = ['view_payroll_config', 'manage_salary_component', 'manage_salary_structure', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path === '/payroll/periods' || to.path === '/hrd/payroll/periods')) {
        const allowed = ['view_payroll_period', 'view_payroll_run_summary', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/components') || to.path.startsWith('/hrd/payroll/components'))) {
        const allowed = ['view_salary_component', 'manage_salary_component', 'view_payroll_config', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/structures') || to.path.startsWith('/hrd/payroll/structures'))) {
        const allowed = ['view_salary_structure', 'manage_salary_structure', 'view_payroll_config', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/profiles') || to.path.startsWith('/hrd/payroll/profiles'))) {
        const allowed = ['view_payroll_profile', 'manage_compensation', 'view_payroll_config', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/compensations') || to.path.startsWith('/hrd/payroll/compensations') || to.path.includes('/configuration/compensations'))) {
        const allowed = ['view_compensation', 'manage_compensation', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && (to.path.startsWith('/payroll/tax-profiles') || to.path.startsWith('/hrd/payroll/tax-profiles'))) {
        const allowed = ['view_tax_profile', 'manage_tax_profile', 'access_payroll']
        const ok = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => allowed.includes(permission.name))
        )
        if (ok) return
      }

      if (!hasPermission && /^\/hrd\/kehadiran\/form/.test(to.path)) {
        const scheduleAllowed = ['manage_jadwal_kehadiran', 'edit_kehadiran']
        const hasScheduleAccess = userStore.user?.roles?.some(role =>
          role.permissions?.some(permission => scheduleAllowed.includes(permission.name))
        )
        if (hasScheduleAccess) return
      }

      // Jika user tidak memiliki permission yang diperlukan, redirect ke 403
      if (!hasPermission) {
        return navigateTo('/errors/403')
      }
    }

  } catch (error) {
    console.error('Error checking permissions:', error)
    return navigateTo('/errors/403')
  }
})
