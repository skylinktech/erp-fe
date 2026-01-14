/**
 * Utility untuk debug dan cek role user
 * Bisa dipanggil dari browser console: window.checkMyRole()
 */

export const checkMyRole = () => {
  try {
    // Token sekarang disimpan di httpOnly cookie, tidak bisa diakses dari JavaScript
    const userCache = localStorage.getItem('user')
    
    console.log('=== CHECK MY ROLE DEBUG ===')
    console.log('Note: Token sekarang disimpan di httpOnly cookie (tidak bisa diakses dari JS)')
    console.log('User cache:', userCache ? JSON.parse(userCache) : null)
    
    // Cek Pinia store
    if (typeof window !== 'undefined') {
      const userStore = (window as any).$nuxt?.$store?.user
      if (userStore) {
        console.log('User Store:', {
          id: userStore.user?.id,
          username: userStore.user?.username,
          email: userStore.user?.email,
          fullName: userStore.user?.fullName,
          roles: userStore.user?.roles,
        })
      } else {
        console.log('User Store not available')
      }
    }
    
    console.log('=== END DEBUG ===')
    
    return {
      userCache: userCache ? JSON.parse(userCache) : null,
    }
  } catch (error) {
    console.error('Error checking role:', error)
    return null
  }
}

// Export ke window untuk debugging
if (typeof window !== 'undefined') {
  (window as any).checkMyRole = checkMyRole
}
