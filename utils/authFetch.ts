export const authFetch = async <T = any>(endpoint: string, options: any = {}) => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.authBase
    
    // Gunakan SSO token dari localStorage (prioritas) atau fallback ke cookie
    let accessToken: string | null = null
    if (process.client) {
      accessToken = localStorage.getItem('token') || localStorage.getItem('sso_token')
    }
    
    // Fallback ke cookie jika tidak ada di localStorage
    if (!accessToken) {
      const tokenCookie = useCookie('token')
      accessToken = tokenCookie.value || null
    }
    
    const refreshToken = useCookie('refresh_token')
  
    try {
      return await $fetch<T>(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...options?.headers,
        },
      })
    } catch (error: any) {
      // cek kalau token expired
      const status = error?.response?.status ?? error?.statusCode ?? error?.status
      
      // Untuk SSO, tidak ada refresh token mechanism
      // Jika token expired, langsung logout
      if (status === 401) {
        // Cek apakah ini SSO token (ada sso_token di localStorage)
        if (process.client && localStorage.getItem('sso_token')) {
          // SSO token expired, paksa logout
          const toast = useToast()
          toast.error({
            title: 'Sesi Berakhir',
            message: 'Sesi anda telah berakhir, silakan logout dan login kembali',
            color: 'red',
          })
          
          // Clear tokens
          localStorage.removeItem('token')
          localStorage.removeItem('sso_token')
          if (refreshToken.value) {
            refreshToken.value = null
          }
          
          // Redirect ke login
          if (process.client) {
            const router = useRouter()
            router.push('/auth/login')
          }
          
          throw new Error('Session expired. Please login again.')
        }
        
        // Fallback untuk refresh token mechanism (jika masih menggunakan auth lama)
        if (refreshToken.value) {
          try {
            const { token: newAccessToken } = await $fetch<{ token: string }>(`${baseUrl}/refresh-token`, {
              method: 'POST',
              body: { refresh_token: refreshToken.value },
            })
    
            // Update token di localStorage dan cookie
            if (process.client) {
              localStorage.setItem('token', newAccessToken)
            }
            const tokenCookie = useCookie('token')
            tokenCookie.value = newAccessToken
    
            // ulang request sebelumnya dengan token baru
            return await $fetch<T>(`${baseUrl}${endpoint}`, {
              ...options,
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                ...options?.headers,
              },
            })
          } catch (refreshError) {
            // Refresh gagal, paksa logout
            if (process.client) {
              localStorage.removeItem('token')
              localStorage.removeItem('sso_token')
            }
            if (refreshToken.value) {
              refreshToken.value = null
            }
            const toast = useToast()
            toast.error({
              title: 'Sesi Berakhir',
              message: 'Sesi anda telah berakhir, silakan logout dan login kembali',
              color: 'red',
            })
            throw new Error('Session expired. Please login again.')
          }
        }
      }
  
      if (status === 419 || status === 401) {
        const toast = useToast()
        toast.error({
          title: 'Sesi Berakhir',
          message: 'Sesi anda telah berakhir, silakan logout dan login kembali',
          color: 'red',
        })
      } else if (status === 403) {
        // Redirect ke halaman 403 untuk permission denied
        if (process.client) {
          const router = useRouter()
          router.push('/errors/403')
        }
      }
      // Tidak menampilkan toast untuk error 403 (permission denied)
  
      throw error
    }
  }
  