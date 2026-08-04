/**
 * Shared auth cookie helpers.
 * Cookie attributes MUST match login (pages/auth/login.vue) or browsers
 * keep the stale cookie — the root cause of "logout → dashboard" in normal mode.
 */

export type AuthCookieOptions = {
  maxAge?: number
  secure: boolean
  sameSite: 'lax' | 'none' | 'strict'
  path: string
}

export const ACCESS_TOKEN_COOKIE = 'access_token'

export function getAccessTokenCookieOptions(maxAgeSeconds = 24 * 60 * 60): AuthCookieOptions {
  return {
    maxAge: maxAgeSeconds,
    secure: !import.meta.dev,
    sameSite: import.meta.dev ? 'lax' : 'none',
    path: '/',
  }
}

/** Read non-HttpOnly access_token (FE copy used for Authorization header). */
export function readAccessToken(): string | null {
  if (import.meta.server) return null

  const cookie = useCookie<string | null>(ACCESS_TOKEN_COOKIE, getAccessTokenCookieOptions())
  const value = cookie.value
  if (!value || value === 'null' || value === 'undefined' || !String(value).trim()) {
    return null
  }
  return String(value).trim()
}

/** Clear FE-readable access_token with login-matching attributes. */
export function clearAccessTokenCookie(): void {
  if (import.meta.server) return

  const cookie = useCookie<string | null>(ACCESS_TOKEN_COOKIE, getAccessTokenCookieOptions())
  cookie.value = null

  // Belt-and-suspenders: expire via document.cookie with matching Secure/SameSite
  clearDocumentCookie(ACCESS_TOKEN_COOKIE)
}

/**
 * Expire a cookie via document.cookie across common path/domain/SameSite variants.
 * Needed when older sessions set cookies with different attributes.
 */
export function clearDocumentCookie(name: string): void {
  if (typeof window === 'undefined') return

  const hostname = window.location.hostname
  const domains = ['', hostname, `.${hostname}`]
  const paths = ['/', '/auth', '/api']
  const sameSiteVariants: Array<'None' | 'Lax' | 'Strict'> = ['None', 'Lax', 'Strict']
  const secureFlags = [true, false]

  for (const domain of domains) {
    for (const path of paths) {
      for (const sameSite of sameSiteVariants) {
        for (const secure of secureFlags) {
          // Secure cookies require Secure flag; skip invalid combo
          if (sameSite === 'None' && !secure) continue

          let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=${sameSite}`
          if (secure) cookie += '; Secure'
          if (domain) cookie += `; domain=${domain}`
          document.cookie = cookie
        }
      }
    }
  }
}

/** Clear all readable cookies (cannot touch HttpOnly — server must clear those). */
export function clearAllReadableCookies(): void {
  if (typeof window === 'undefined') return

  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0]?.trim())
    .filter(Boolean)

  for (const name of names) {
    clearDocumentCookie(name)
  }
}
