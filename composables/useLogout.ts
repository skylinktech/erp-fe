import { useUserStore } from '~/stores/user'
import {
  clearAccessTokenCookie,
  clearAllReadableCookies,
  readAccessToken,
} from '~/utils/authCookie'

/**
 * Centralized logout orchestration (SRP).
 *
 * Order matters:
 * 1. Capture token while still available
 * 2. ERP logout first (clears HttpOnly ERP cookie while request can still send it)
 * 3. SSO logout (revoke Sanctum PAT + clear SSO-domain cookie)
 * 4. Wipe local store / readable cookies
 * 5. Hard navigate to login (avoids Pinia/middleware rehydrate race)
 */
export function useLogout() {
  const { $api } = useNuxtApp()
  const config = useRuntimeConfig()
  const userStore = useUserStore()

  const logoutFromErp = async (token: string | null): Promise<void> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch($api.logout(), {
      method: 'POST',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      console.warn('ERP logout failed:', response.status)
    }
  }

  const logoutFromSso = async (token: string | null): Promise<void> => {
    const ssoUrl = config.public.ssoUrl as string | undefined
    if (!ssoUrl) return

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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

    if (!response.ok) {
      console.warn('SSO logout failed:', response.status)
    }
  }

  const clearLocalSession = (): void => {
    userStore.clearUser()
    clearAccessTokenCookie()
    clearAllReadableCookies()

    if (typeof document !== 'undefined') {
      document.documentElement.className = ''
    }
  }

  const redirectToLogin = (): void => {
    // Hard navigation resets Pinia + avoids redirect-auth rehydrate race
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?logged_out=1'
      return
    }
    navigateTo('/auth/login?logged_out=1')
  }

  const logout = async (): Promise<void> => {
    const token = readAccessToken()

    try {
      await logoutFromErp(token)
    } catch (error: any) {
      console.warn('ERP logout unreachable:', error?.message)
    }

    try {
      await logoutFromSso(token)
    } catch (error: any) {
      console.warn('SSO logout unreachable:', error?.message)
    }

    try {
      clearLocalSession()
    } catch (error: any) {
      console.warn('Local session clear failed:', error?.message)
    } finally {
      redirectToLogin()
    }
  }

  return { logout }
}
