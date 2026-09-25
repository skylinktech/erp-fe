/**
 * Plugin untuk menambahkan Authorization header ke SEMUA request API
 * Memperbaiki 401 di production: fetch() dan $fetch yang tidak pakai apiFetch
 */
import { readAccessToken } from '~/utils/authCookie'

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || ''
  const authBase = config.public.authBase || ''

  const getApiOrigins = () => {
    const origins: string[] = []
    if (apiBase) {
      try {
        const url = new URL(apiBase)
        origins.push(url.origin)
      } catch {}
    }
    if (authBase) {
      try {
        const url = new URL(authBase)
        if (!origins.includes(url.origin)) origins.push(url.origin)
      } catch {}
    }
    return origins
  }

  const isApiRequest = (urlStr: string) => {
    if (!urlStr || typeof urlStr !== 'string') return false
    if (urlStr.startsWith('/api') || urlStr.includes('/api/') || urlStr.includes('/auth/')) return true
    const origins = getApiOrigins()
    if (origins.length === 0) return false
    try {
      const url = new URL(urlStr, window.location.origin)
      return origins.some((origin) => url.origin === origin || urlStr.startsWith(origin))
    } catch {
      return false
    }
  }

  const getAuthHeaders = () => {
    const token = readAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    try {
      const persisted = localStorage.getItem('skyflow.activeCompanyId')
      if (persisted) headers['X-Company-Id'] = persisted
    } catch {
      // ignore
    }
    return headers
  }

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = typeof input === 'string' ? input : input.toString()
    if (isApiRequest(urlStr)) {
      const authHeaders = getAuthHeaders()
      const headers = new Headers(init?.headers)
      Object.entries(authHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      // ERP sets an HttpOnly access_token on /me. A page on another port
      // cannot read that cookie, so credentialed fetches must send it.
      init = { ...init, headers, credentials: init?.credentials ?? 'include' }
    }
    return originalFetch(input, init)
  }
})
