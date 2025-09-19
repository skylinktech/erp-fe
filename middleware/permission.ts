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
    
    // Load user data jika belum ada
    if (!userStore.user) {
      await userStore.loadUser()
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
    // Jika ada error, redirect ke 403 untuk keamanan
    return navigateTo('/errors/403')
  }
})
