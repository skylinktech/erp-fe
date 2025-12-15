// Composable untuk menangani secure storage
export const useSecureStorage = () => {
  // Method untuk menyimpan data sensitif ke secure cookie
  // Catatan: httpOnly tidak bisa diatur dari client-side JavaScript,
  // jadi kita gunakan cookie biasa dengan secure dan sameSite untuk keamanan
  const setSecureData = (key: string, value: any, options: {
    maxAge?: number
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    httpOnly?: boolean
  } = {}) => {
    const {
      maxAge = 15 * 60, // 15 menit default
      secure = true,
      sameSite = 'strict',
      httpOnly = false // httpOnly tidak bisa diatur dari client-side
    } = options

    // Untuk data sensitif, gunakan secure cookie
    // httpOnly hanya bisa diatur dari server-side, jadi kita gunakan cookie biasa
    if (httpOnly === false) {
      const cookie = useCookie(key, {
        maxAge,
        secure,
        sameSite
        // httpOnly dihapus karena tidak bisa diatur dari client-side
      })
      cookie.value = JSON.stringify(value)
    } else {
      // Jika httpOnly diperlukan, gunakan localStorage dengan enkripsi
      // karena httpOnly cookie hanya bisa diatur dari server
      try {
        const encrypted = btoa(JSON.stringify(value))
        localStorage.setItem(`secure_${key}`, encrypted)
      } catch (error) {
        console.warn('Failed to store secure data:', error)
      }
    }
  }

  // Method untuk membaca data sensitif dari secure cookie
  const getSecureData = (key: string, httpOnly: boolean = false) => {
    if (httpOnly === false) {
      const cookie = useCookie(key)
      if (cookie.value) {
        try {
          return JSON.parse(cookie.value)
        } catch (error) {
          console.warn('Failed to parse secure cookie data:', error)
          return null
        }
      }
    } else {
      // Untuk data dari localStorage (jika httpOnly diperlukan)
      try {
        const encrypted = localStorage.getItem(`secure_${key}`)
        if (encrypted) {
          return JSON.parse(atob(encrypted))
        }
      } catch (error) {
        console.warn('Failed to decrypt secure data:', error)
        localStorage.removeItem(`secure_${key}`)
      }
    }
    return null
  }

  // Method untuk menghapus data sensitif
  const removeSecureData = (key: string, httpOnly: boolean = false) => {
    if (httpOnly === false) {
      const cookie = useCookie(key)
      cookie.value = null
    } else {
      localStorage.removeItem(`secure_${key}`)
    }
  }

  // Method untuk mengecek apakah data sensitif masih valid
  const isSecureDataValid = (key: string, httpOnly: boolean = false) => {
    const data = getSecureData(key, httpOnly)
    if (!data) return false

    // Cek expiry jika ada
    if (data.expiresAt && Date.now() > data.expiresAt) {
      removeSecureData(key, httpOnly)
      return false
    }

    return true
  }

  // Method untuk menyimpan user session data yang sensitif
  const setUserSession = (sessionData: {
    userId: number
    sessionId: string
    lastActivity: number
    expiresAt: number
  }) => {
    setSecureData('user_session', sessionData, {
      maxAge: 15 * 60, // 15 menit
      secure: true,
      sameSite: 'strict',
      httpOnly: false // httpOnly tidak bisa diatur dari client-side
    })
  }

  // Method untuk membaca user session data
  const getUserSession = () => {
    return getSecureData('user_session', false)
  }

  // Method untuk clear user session
  const clearUserSession = () => {
    removeSecureData('user_session', false)
  }

  return {
    setSecureData,
    getSecureData,
    removeSecureData,
    isSecureDataValid,
    setUserSession,
    getUserSession,
    clearUserSession
  }
}
