import { clearAllReadableCookies, clearDocumentCookie } from '~/utils/authCookie'

/**
 * Utility untuk clear invalid cookies
 * Digunakan saat login untuk memastikan tidak ada cookie lama yang invalid
 */
export const clearInvalidCookies = () => {
  clearAllReadableCookies()
}

/**
 * Clear specific cookie by name (matching Secure/SameSite variants)
 */
export const clearCookie = (name: string) => {
  clearDocumentCookie(name)
}

/**
 * Get all cookies as object
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}

  return document.cookie
    .split(';')
    .reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=').map((c) => c.trim())
      if (name) cookies[name] = decodeURIComponent(value || '')
      return cookies
    }, {} as Record<string, string>)
}
