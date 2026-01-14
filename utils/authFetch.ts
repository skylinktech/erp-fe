export const authFetch = async <T = any>(endpoint: string, options: any = {}) => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.authBase
    
    // Cookie-based authentication: token akan otomatis dikirim via httpOnly cookie
    // Tidak perlu ambil token dari localStorage lagi
  
    try {
      return await $fetch<T>(`${baseUrl}${endpoint}`, {
        ...options,
        credentials: 'include', // PENTING: kirim cookies ke server
        headers: {
          ...options?.headers,
        },
      })
    } catch (error: any) {
      // cek kalau token expired atau unauthorized
      const status = error?.response?.status ?? error?.statusCode ?? error?.status
      
      // Cookie-based auth: jika 401, redirect ke login (cookie expired atau invalid)
      if (status === 401) {
        const toast = useToast()
        toast.error({
          title: 'Sesi Berakhir',
          message: 'Sesi anda telah berakhir, silakan login kembali',
          color: 'red',
        })
        
        // Redirect ke login
        if (process.client) {
          const router = useRouter()
          router.push('/auth/login')
        }
        
        throw new Error('Session expired. Please login again.')
      }
  
      if (status === 419) {
        const toast = useToast()
        toast.error({
          title: 'CSRF Token Expired',
          message: 'Silakan refresh halaman dan coba lagi',
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
  