export default defineNuxtPlugin(() => {
  // Fix untuk CORS error pada Google Cloud Storage
  if (process.client) {
    // Intercept fetch untuk menambahkan CORS headers
    const originalFetch = window.fetch
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      
      // Jika URL adalah Google Cloud Storage, tambahkan mode cors
      if (url.includes('storage.googleapis.com')) {
        const corsInit: RequestInit = {
          ...init,
          mode: 'cors',
          credentials: 'omit', // Jangan kirim credentials untuk CORS
        }
        
        try {
          return await originalFetch(input, corsInit)
        } catch (error) {
          console.warn('CORS error untuk GCS URL:', url, error)
          // Fallback: coba dengan mode no-cors
          return originalFetch(input, { ...corsInit, mode: 'no-cors' })
        }
      }
      
      return originalFetch(input, init)
    }
    
    // Fix untuk image loading dengan CORS
    const originalImage = window.Image
    window.Image = class extends originalImage {
      constructor() {
        super()
        
        // Set crossOrigin untuk semua image yang dimuat
        this.crossOrigin = 'anonymous'
      }
    }
    
    // Fix untuk img tag yang sudah ada
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            
            // Set crossOrigin untuk semua img tag
            if (element.tagName === 'IMG') {
              const img = element as HTMLImageElement
              if (img.src.includes('storage.googleapis.com')) {
                img.crossOrigin = 'anonymous'
              }
            }
            
            // Set crossOrigin untuk img tag di dalam element
            const images = element.querySelectorAll('img')
            images.forEach((img) => {
              if (img.src.includes('storage.googleapis.com')) {
                img.crossOrigin = 'anonymous'
              }
            })
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
})
