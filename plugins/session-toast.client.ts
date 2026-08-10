export default defineNuxtPlugin((nuxtApp) => {
  const showSessionExpiredToast = () => {
    const toast = useToast()
    toast.error({
      title: 'Sesi Berakhir',
      message: 'Sesi anda telah berakhir, silakan logout dan login kembali',
      color: 'red',
      position: 'bottomRight',
    })
  }

  // Helper function untuk mengecek apakah request adalah preload atau validasi token
  const shouldSuppressError = (url: string) => {
    // Suppress error untuk preload requests (data yang di-load di background)
    const preloadEndpoints = [
      '/api/accounts',
      '/api/customers', 
      '/api/products',
      '/api/sales-orders',
      '/api/purchase-orders',
      '/api/vendors',
      '/api/roles',
      '/api/sales-returns',
      '/api/surat-jalans',
      '/api/quotations'
    ]
    
    // Suppress error untuk validasi token di middleware
    const authEndpoints = ['/api/me']
    
    const allSuppressedEndpoints = [...preloadEndpoints, ...authEndpoints]
    
    return allSuppressedEndpoints.some(endpoint => url.includes(endpoint))
  }

  // Interceptor untuk $fetch (ofetch) - tambah Authorization header untuk semua request API
  const token = useCookie('access_token')
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase || '').replace(/\/$/, '')
  const authBase = (config.public.authBase || '').replace(/\/$/, '')

  const isApiRequest = (url: string) => {
    if (!url) return false
    return url.includes(apiBase) || url.includes(authBase) || url.includes('/api') || url.includes('/auth/')
  }

  // @ts-ignore - override instance diperbolehkan
  nuxtApp.$fetch = $fetch.create({
    onRequest({ options, request }) {
      const url = typeof request === 'string' ? request : request?.url || ''
      if (token.value && isApiRequest(url)) {
        options.headers = new Headers(options.headers || {})
        ;(options.headers as Headers).set('Authorization', `Bearer ${token.value}`)
      }
    },
    onResponseError({ response, request }) {
      const status = response?.status
      const url = request?.toString() || ''
      
      if (status === 401 || status === 419) {
        // Hanya tampilkan notifikasi jika bukan preload atau validasi token
        if (!shouldSuppressError(url)) {
          showSessionExpiredToast()
        }
      }
      // Tidak menampilkan toast untuk error 403 (permission denied)
    },
  }) as any

  // Interceptor untuk window.fetch (hanya di client side)
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch.bind(window)
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await originalFetch(input, init)
      try {
        if (res && (res.status === 401 || res.status === 419)) {
          const url = input.toString()
          
          // Hanya tampilkan notifikasi jika bukan preload atau validasi token
          if (!shouldSuppressError(url)) {
            showSessionExpiredToast()
          }
        }
        // Tidak menampilkan toast untuk error 403 (permission denied)
      } catch {}
      return res
    }
  }
})


