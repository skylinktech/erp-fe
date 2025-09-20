export default defineNuxtPlugin(async () => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    
    // Pastikan user data ter-load saat aplikasi start
    await userStore.ensureUserLoaded()
  } catch (error) {
    console.error('Error initializing user:', error)
  }
})
