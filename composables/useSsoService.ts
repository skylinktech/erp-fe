/**
 * Composable untuk handle SSO authentication
 * Menggunakan OAuth2 password grant type untuk authenticate dengan SSO server
 */

interface SsoTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  user?: {
    id: number
    name: string
    email: string
    username?: string
  }
}

interface SsoUserInfo {
  id: number
  name: string
  email: string
  username?: string
  roles: string[]
  permissions: string[]
}

export const useSsoService = () => {
  const config = useRuntimeConfig()
  const toast = useToast()

  const ssoUrl = config.public.ssoUrl || ''
  const clientId = config.public.ssoClientId || ''
  const clientSecret = config.public.ssoClientSecret || ''

  /**
   * Authenticate user dengan SSO server
   * @param username - Username atau email user
   * @param password - Password user
   * @returns Promise<SsoTokenResponse | null>
   */
  const authenticate = async (
    username: string,
    password: string
  ): Promise<SsoTokenResponse | null> => {
    if (!ssoUrl || !clientId || !clientSecret) {
      console.error('SSO configuration is missing', {
        hasSsoUrl: !!ssoUrl,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
      })
      toast.error({
        title: 'Konfigurasi SSO Belum Lengkap',
        message: 'Silakan buat file .env dan isi NUXT_PUBLIC_SSO_URL, NUXT_PUBLIC_SSO_CLIENT_ID, dan NUXT_PUBLIC_SSO_CLIENT_SECRET. Lihat docs/SSO_INTEGRATION.md untuk panduan lengkap.',
        timeout: 8000,
        position: 'bottomRight',
        layout: 2,
      })
      return null
    }

    try {
      const formData = new URLSearchParams()
      formData.append('grant_type', 'password')
      formData.append('client_id', clientId)
      formData.append('client_secret', clientSecret)
      formData.append('username', username)
      formData.append('password', password)

      const response = await fetch(`${ssoUrl}/api/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        credentials: 'include', // PENTING: Untuk menerima cookies dari server
        body: formData.toString(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle error spesifik
        if (errorData.error === 'access_denied') {
          const errorMessage = errorData.error_description || 'Anda tidak memiliki akses ke aplikasi ini.'
          throw new Error(errorMessage)
        }
        
        if (errorData.error === 'invalid_credentials') {
          throw new Error('Username atau password salah.')
        }
        
        if (errorData.error === 'invalid_client') {
          throw new Error('Client ID atau Client Secret tidak valid.')
        }

        throw new Error(errorData.error_description || `SSO authentication failed: ${response.status}`)
      }

      const data: SsoTokenResponse = await response.json()
      return data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Get user info dari SSO server menggunakan access token
   * @param token - SSO access token
   * @returns Promise<SsoUserInfo | null>
   */
  const getUserInfo = async (token: string): Promise<SsoUserInfo | null> => {
    if (!ssoUrl || !token) {
      return null
    }

    try {
      const response = await fetch(`${ssoUrl}/api/oauth/user?client_id=${clientId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'X-Client-Id': clientId, // Untuk auto-update last_seen_at
        },
        credentials: 'include', // PENTING: Untuk mengirim cookies ke server
      })

      if (!response.ok) {
        return null
      }

      const data: SsoUserInfo = await response.json()
      return data
    } catch (error) {
      return null
    }
  }

  /**
   * Logout dari SSO server
   * @param token - SSO access token
   * @returns Promise<boolean>
   */
  const logout = async (token?: string | null): Promise<boolean> => {
    if (!ssoUrl) {
      return false
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${ssoUrl}/api/oauth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  return {
    authenticate,
    getUserInfo,
    logout,
  }
}
