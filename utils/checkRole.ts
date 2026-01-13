/**
 * Utility untuk debug dan cek role user
 * Bisa dipanggil dari browser console: window.checkMyRole()
 */

export const checkMyRole = () => {
  try {
    // Cek localStorage
    const token = localStorage.getItem('token')
    const ssoToken = localStorage.getItem('sso_token')
    const userCache = localStorage.getItem('user')
    
    console.log('=== CHECK MY ROLE DEBUG ===')
    console.log('Token exists:', !!token)
    console.log('SSO Token exists:', !!ssoToken)
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
      token: !!token,
      ssoToken: !!ssoToken,
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
