export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  // Cookie-based auth: cek apakah user sudah ter-load di store
  if (import.meta.client) {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    
    // Coba load user data dari cookie (via API)
    try {
      await userStore.ensureUserLoaded()
      
      // Jika user tidak ter-load (401 dari server), redirect ke login
      if (!userStore.user) {
        return navigateTo('/errors/401')
      }
    } catch (error) {
      // Jika error (termasuk 401), redirect ke login
      console.error('Auth middleware: User load failed:', error)
      return navigateTo('/errors/401')
    }
  }
})