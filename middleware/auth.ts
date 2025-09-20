export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  // Tunggu sebentar untuk memastikan plugin sudah selesai
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const token = localStorage.getItem('token')
  if (!token) {
    setTimeout(() => {
      document.querySelectorAll('.layout-wrapper, .layout-content-navbar').forEach(el => el.remove())
    }, 0)
    return navigateTo('/errors/401')
  }

  try {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    
    // Pastikan user data ter-load dengan robust method
    const user = await userStore.ensureUserLoaded()
    
    if (!user) {
      localStorage.removeItem('token')
      setTimeout(() => {
        document.querySelectorAll('.layout-wrapper, .layout-content-navbar').forEach(el => el.remove())
      }, 0)
      return navigateTo('/errors/401')
    }
    
  } catch (e) {
    // Jika error karena timeout atau loading, coba sekali lagi
    if (e.message?.includes('Timeout') || e.message?.includes('loading')) {
      try {
        const { useUserStore } = await import('~/stores/user')
        const userStore = useUserStore()
        
        const user = await userStore.ensureUserLoaded()
        if (user) {
          return
        }
      } catch (retryError) {
        // Ignore retry error
      }
    }
    
    localStorage.removeItem('token')
    setTimeout(() => {
      document.querySelectorAll('.layout-wrapper, .layout-content-navbar').forEach(el => el.remove())
    }, 0)
    return navigateTo('/errors/401')
  }
})