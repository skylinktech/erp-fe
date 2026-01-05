/**
 * Composable untuk cache lokasi user
 * Menggunakan memory cache dengan durasi yang dapat dikonfigurasi
 * 
 * @example
 * const { location, getLocation, clearCache } = useLocationCache()
 * 
 * // Mendapatkan lokasi (akan menggunakan cache jika masih valid)
 * await getLocation()
 * 
 * // Force refresh
 * await getLocation(true)
 * 
 * // Clear cache
 * clearCache()
 */

interface Location {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

interface LocationCache {
  data: Location | null
  timestamp: number | null
}

export const useLocationCache = (cacheDuration: number = 5 * 60 * 1000) => {
  // Cache di memory (reactive untuk Vue)
  const cache = useState<LocationCache>('location_cache', () => ({
    data: null,
    timestamp: null
  }))

  /**
   * Request lokasi dari browser
   */
  const requestLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!process.client) {
        reject(new Error('Geolocation hanya tersedia di client-side'))
        return
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: false, // false untuk lebih cepat dan hemat baterai
          timeout: 5000, // timeout 5 detik
          maximumAge: 0 // Jangan gunakan cache browser, kita handle sendiri
        }
      )
    })
  }

  /**
   * Cek apakah cache masih valid
   */
  const isCacheValid = (): boolean => {
    if (!cache.value.data || !cache.value.timestamp) {
      return false
    }

    const age = Date.now() - cache.value.timestamp
    return age < cacheDuration
  }

  /**
   * Mendapatkan lokasi dari cache atau request baru
   * @param forceRefresh - Jika true, akan memaksa request lokasi baru
   */
  const getLocation = async (forceRefresh: boolean = false): Promise<Location | null> => {
    // Hanya berjalan di client-side
    if (!process.client) {
      return null
    }

    // Cek apakah cache masih valid
    if (!forceRefresh && isCacheValid()) {
      return cache.value.data
    }

    try {
      // Request lokasi baru
      const location = await requestLocation()
      
      // Update cache
      cache.value = {
        data: location,
        timestamp: Date.now()
      }

      return location
    } catch (error: any) {
      // Jika gagal mendapatkan lokasi baru, coba gunakan cache lama jika ada
      if (cache.value.data) {
        console.warn('Gagal mendapatkan lokasi baru, menggunakan cache lama:', error.message)
        return cache.value.data
      }

      // Jika tidak ada cache, return null
      console.warn('Gagal mendapatkan lokasi:', error.message)
      return null
    }
  }

  /**
   * Clear cache
   */
  const clearCache = () => {
    cache.value = {
      data: null,
      timestamp: null
    }
  }

  /**
   * Set cache duration (dalam milliseconds)
   */
  const setCacheDuration = (duration: number) => {
    // Note: Ini tidak akan mengubah cache yang sudah ada
    // Hanya akan mempengaruhi validasi cache selanjutnya
    // Untuk mengubah duration, perlu membuat instance baru
    console.warn('setCacheDuration tidak mengubah duration instance yang sudah ada. Buat instance baru untuk duration berbeda.')
  }

  /**
   * Get current cached location (tanpa request baru)
   */
  const getCachedLocation = (): Location | null => {
    if (isCacheValid()) {
      return cache.value.data
    }
    return null
  }

  return {
    location: computed(() => cache.value.data),
    getLocation,
    clearCache,
    setCacheDuration,
    getCachedLocation,
    isCacheValid
  }
}

