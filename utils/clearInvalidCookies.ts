/**
 * Utility untuk clear invalid cookies
 * Digunakan saat login untuk memastikan tidak ada cookie lama yang invalid
 */
export const clearInvalidCookies = () => {
  if (typeof window === 'undefined') return
  
  // Get all cookies
  const cookies = document.cookie.split(';')
  
  // Clear each cookie
  cookies.forEach(cookie => {
    const [name] = cookie.split('=')
    const cookieName = name.trim()
    
    // Clear untuk semua possible paths dan domains
    const domains = ['', `.${window.location.hostname}`, window.location.hostname]
    const paths = ['/', '/auth', '/api']
    
    domains.forEach(domain => {
      paths.forEach(path => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`
      })
    })
  })
}

/**
 * Clear specific cookie by name
 */
export const clearCookie = (name: string) => {
  if (typeof window === 'undefined') return
  
  const domains = ['', `.${window.location.hostname}`, window.location.hostname]
  const paths = ['/', '/auth', '/api']
  
  domains.forEach(domain => {
    paths.forEach(path => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`
    })
  })
}

/**
 * Get all cookies as object
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  
  return document.cookie
    .split(';')
    .reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=').map(c => c.trim())
      if (name) cookies[name] = decodeURIComponent(value)
      return cookies
    }, {} as Record<string, string>)
}
