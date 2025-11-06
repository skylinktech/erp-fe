export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  // ✅ Cek token SAJA - Jangan fetch data di middleware!
  const token = localStorage.getItem('token')
  if (!token) {
    return navigateTo('/errors/401')
  }

  // ✅ Start loading user data di background (non-blocking)
  if (import.meta.client) {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    
    // Trigger load tapi jangan tunggu
    userStore.ensureUserLoaded().catch(error => {
      console.error('Background user load failed:', error)
    })
  }
})