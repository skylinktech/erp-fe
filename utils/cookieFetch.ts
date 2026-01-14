/**
 * Cookie-based fetch utility
 * Automatically sends httpOnly cookies with every request
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options (method, headers, body, etc)
 * @returns Fetch response
 */
export const cookieFetch = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    credentials: 'include', // CRITICAL: Send httpOnly cookies
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * $fetch wrapper with cookie support
 * Uses Nuxt's $fetch with credentials: 'include'
 */
export const $cookieFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
  return await $fetch<T>(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // CRITICAL: Send httpOnly cookies
  })
}
