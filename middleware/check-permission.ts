export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  // Cek apakah user sudah login
  const token = localStorage.getItem('token')
  if (!token) {
    return navigateTo('/errors/401')
  }

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
      '/sales/sales-order': 'view_sales_order',
      '/sales/sales-invoice': 'view_sales_invoice',
      '/sales/surat-jalan': 'view_surat_jalan',
      '/sales/quotation': 'view_quotation',
      '/sales/sales-return': 'view_sales_return',
      '/sales/customer': 'view_customer',
      '/purchasing/purchase-order': 'view_purchase_order',
      '/purchasing/purchase-invoice': 'view_purchase_invoice',
      '/purchasing/vendor': 'view_vendor',
      '/accounting/accounts/': 'view_account',
      '/accounting/assets/': 'view_asset',
      '/accounting/bank-account/': 'view_bank_account',
      '/accounting/expenses/': 'view_expense',
      '/accounting/journals/': 'view_journal',
      '/accounting/taxes/': 'view_tax',
      '/accounting/ap-payments/': 'view_ap_payment',
      '/accounting/ar-receipts/': 'view_ar_receipt',
      '/hrd/pegawai': 'view_pegawai',
      '/hrd/departemen': 'view_department',
      '/hrd/divisi': 'view_divisi',
      '/hrd/jabatan': 'view_jabatan',
      '/company/perusahaan': 'view_perusahaan',
      '/company/cabang': 'view_cabang',
      '/admin/roles': 'view_role',
      '/admin/permissions': 'view_permission',
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
