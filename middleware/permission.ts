export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  // Cek apakah user sudah login
  if (!localStorage.getItem('token')) {
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

    // Cek apakah user adalah superadmin
    const isSuperadmin = userStore.user?.roles?.some(role => role.name === 'superadmin')
    
    // Jika user adalah superadmin, biarkan akses ke semua halaman
    if (isSuperadmin) {
      return
    }

    // Cek apakah user memiliki permission view_*
    const hasViewPermission = userStore.user?.roles?.some(role => 
      role.permissions?.some(permission => 
        permission.name?.startsWith('view_')
      )
    )

    // Jika user tidak memiliki permission view_*, redirect ke 403
    if (!hasViewPermission) {
      return navigateTo('/errors/403')
    }

  } catch (error) {
    console.error('Error checking permissions:', error)
    return navigateTo('/errors/403')
  }
})
