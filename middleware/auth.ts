export default defineNuxtRouteMiddleware(async (to, from) => {
  // Hanya jalankan di client side
  if (typeof window === 'undefined') return
  
  if (!localStorage.getItem('token')) {
    setTimeout(() => {
      document.querySelectorAll('.layout-wrapper, .layout-content-navbar').forEach(el => el.remove())
    }, 0)
    return navigateTo('/errors/401')
  }

  // Cek validitas token ke backend
  try {
    const token = localStorage.getItem('token')
    const { $api } = useNuxtApp()
    
    const response = await fetch($api.me(), {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Token tidak valid')
    }
  } catch (e) {
    // Jangan tampilkan notifikasi error untuk validasi token
    // Ini adalah proses normal untuk user yang tidak memiliki permission
    console.warn('Token validation failed:', e)
    localStorage.removeItem('token')
    setTimeout(() => {
      document.querySelectorAll('.layout-wrapper, .layout-content-navbar').forEach(el => el.remove())
    }, 0)
    return navigateTo('/errors/401')
  }
})