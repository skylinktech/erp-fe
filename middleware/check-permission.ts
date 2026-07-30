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
      '/accounting/expenses/': 'view_expense',
      '/accounting/journals/': 'view_journal',
      '/accounting/taxes/': 'view_tax',
      '/finance/taxes': 'view_tax',
      '/finance/tax-masters': 'view_tax_master',
      '/accounting/ap-payments/': 'view_ap_payment',
      '/accounting/ar-receipts/': 'view_ar_receipt',
      '/finance/invoices': 'view_invoice',
      '/finance/payment-request': 'view_payment_request',
      '/operations/request-activation': 'view_request_activation',
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
      '/hrd/pegawai': 'view_pegawai',
      '/hrd/departemen': 'view_departemen',
      '/hrd/divisi': 'view_divisi',
      '/hrd/jabatan': 'view_jabatan',
      '/hrd/cuti': 'view_cuti',
      '/hrd/lembur': 'view_lembur',
      '/hrd/perjalanan-dinas': 'view_perjalanan_dinas',
      '/hrd/saldo-cuti': 'view_saldo_cuti',
      '/hrd/struktur-organisasi': 'view_struktur_organisasi',
      '/hrd/cetak-struktur-organisasi': 'view_struktur_organisasi',
      '/hrd/kalender': 'view_kalender',
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
      } else if (/^\/finance\/taxes/.test(to.path)) {
        requiredPermission = 'view_tax'
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
      } else if (/^\/finance\/credit-notes/.test(to.path)) {
        requiredPermission = 'view_credit_note'
      } else if (/^\/finance\/journals/.test(to.path)) {
        requiredPermission = 'view_journal'
      } else if (/^\/operations\/request-activation\/form(\/.*)?$/.test(to.path)) {
        requiredPermission = 'access_request_activation'
      } else if (/^\/operations\/request-activation\/detail\/.+$/.test(to.path)) {
        requiredPermission = 'show_request_activation'
      } else if (/^\/operations\/request-activation/.test(to.path)) {
        requiredPermission = 'view_request_activation'
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
