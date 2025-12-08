import { useLayoutStore } from '~/stores/layout'

export default defineNuxtPlugin((nuxtApp) => {
  const layoutStore = useLayoutStore()
  let loadingTimeout: NodeJS.Timeout | null = null

  nuxtApp.hook('page:start', () => {
    // Clear timeout sebelumnya jika ada
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
    
    layoutStore.setLoading(true)
    
    // Safety timeout: pastikan loading di-reset setelah 10 detik
    loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout - forcing loading to false')
      layoutStore.setLoading(false)
      loadingTimeout = null
    }, 10000)
  })

  nuxtApp.hook('page:finish', () => {
    // Clear timeout jika ada
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
    
    // Delay kecil untuk memastikan konten sudah di-render
    setTimeout(() => {
      layoutStore.setLoading(false)
    }, 100)
  })

  // Juga handle error case
  nuxtApp.hook('page:error', () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
    layoutStore.setLoading(false)
  })
}) 