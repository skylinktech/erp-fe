import { useNuxtApp } from '#app'

// Utilitas fetch terpusat yang secara otomatis menangani otentikasi (Bearer & CSRF).
export const apiFetch = async <T = any>(url: string, options: any = {}) => {
  // Gunakan localStorage token alih-alih cookie token
  const token = process.client ? localStorage.getItem('token') : null
  const { $api } = useNuxtApp()

  const customHeaders: any = {
    ...options.headers,
    Accept: 'application/json',
  }

  if (token) {
    customHeaders.Authorization = `Bearer ${token}`
    
    // Tambahkan lokasi user ke header jika tersedia (hanya untuk request yang terautentikasi)
    // Menggunakan lazy import untuk menghindari load composable jika tidak diperlukan
    if (process.client) {
      try {
        // Lazy import composable untuk optimasi
        const locationCacheModule = await import('~/composables/useLocationCache').catch(() => null)
        if (locationCacheModule) {
          const { useLocationCache } = locationCacheModule
          const { getLocation } = useLocationCache()
          
          // Get location dengan timeout untuk menghindari blocking request terlalu lama
          const locationPromise = getLocation()
          const timeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 2000) // Timeout 2 detik
          )
          
          const location = await Promise.race([locationPromise, timeoutPromise])
          
          if (location) {
            customHeaders['X-Latitude'] = location.latitude.toString()
            customHeaders['X-Longitude'] = location.longitude.toString()
          }
        }
      } catch (error) {
        // Jangan block request jika gagal mendapatkan lokasi
        // Error bisa terjadi jika user menolak izin atau geolocation tidak tersedia
        // Hanya log di development mode
        if (process.dev) {
          console.debug('Tidak dapat mendapatkan lokasi untuk activity log:', error)
        }
      }
    }
  }

  const method = options.method?.toUpperCase() || 'GET'
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

  // Untuk metode penulisan, ambil dan lampirkan token CSRF.
  // Ini hanya berjalan di sisi klien.
  if (process.client && writeMethods.includes(method)) {
    try {
      // Menggunakan fetch bawaan di sini untuk mendapatkan token CSRF 
      // untuk menghindari loop tak terbatas jika apiFetch memanggil dirinya sendiri.
      const csrfResponse = await fetch($api.csrfToken(), { credentials: 'include' });
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        if (csrfData.token) {
          customHeaders['X-CSRF-TOKEN'] = csrfData.token
        }
      }
    } catch (e) {
      console.error('Tidak dapat mengambil token CSRF:', e)
    }
  }

  try {
    return await $fetch<T>(url, {
      ...options,
      // credentials: 'include' penting untuk otentikasi berbasis cookie/sesi
      credentials: 'include',
      headers: customHeaders,
    })
  } catch (error: any) {
    const status = error?.response?.status ?? error?.statusCode ?? error?.status
    if (status === 401 || status === 419) {
      const toast = useToast()
      toast.error({
        title: 'Sesi Berakhir',
        message: 'Sesi anda telah berakhir, silakan logout dan login kembali',
        color: 'red',
      })
      
      // Clear user data dan redirect ke login jika session expired
      if (process.client) {
        const { useUserStore } = await import('~/stores/user')
        const userStore = useUserStore()
        userStore.clearUser()
        
        // Redirect ke login page
        const router = useRouter()
        router.push('/auth/login')
      }
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