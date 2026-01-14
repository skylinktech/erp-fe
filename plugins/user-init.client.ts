export default defineNuxtPlugin(async () => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return

  // Cookie-based auth: coba load user data dari cookie (via API)
  try {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    
    // Pastikan user data ter-load saat aplikasi start
    // Jika tidak ada cookie atau cookie expired, akan error dan di-skip
    await userStore.ensureUserLoaded()
  } catch (error) {
    // Tidak perlu log error jika user belum login (expected behavior)
    // console.debug('User not authenticated or error loading user:', error)
  }
})
