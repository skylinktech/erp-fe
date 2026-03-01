/**
 * Plugin untuk menambahkan Authorization header ke SEMUA request API
 * Memperbaiki 401 di production: fetch() dan $fetch yang tidak pakai apiFetch
 */
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
    const token = useCookie('access_token')
    if (token.value) {
      return { Authorization: `Bearer ${token.value}` }
    }
    return {}
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
      init = { ...init, headers }
    }
    return originalFetch(input, init)
  }
})
