/**
 * Composable untuk handle page data loading dengan robust error handling
 * Menggantikan pattern onMounted yang prone to race conditions
 */

import { ref } from 'vue'

interface UsePageDataOptions {
  /**
   * Nama halaman untuk debugging
   */
  pageName: string
  
  /**
   * Functions yang akan dijalankan untuk load data
   * Gunakan Promise.allSettled untuk better error handling
   */
  loaders: (() => Promise<any>)[]
  
  /**
   * Callback setelah semua data berhasil di-load
   */
  onSuccess?: () => void
  
  /**
   * Callback jika ada error
   */
  onError?: (error: any) => void
  
  /**
   * Apakah harus menunggu semua loader selesai sebelum set loading = false
   * Default: true
   */
  waitAll?: boolean
}

export const usePageData = (options: UsePageDataOptions) => {
  const { pageName, loaders, onSuccess, onError, waitAll = true } = options
  
  const isLoading = ref(true)
  const error = ref<any>(null)
  const loadingProgress = ref(0)
  
  /**
   * Wrapper untuk loader dengan timeout
   */
  const withTimeout = (promise: Promise<any>, timeoutMs: number = 30000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ])
  }

  /**
   * Load data dengan proper error handling
   */
  const loadData = async () => {
    isLoading.value = true
    error.value = null
    loadingProgress.value = 0
    
    console.log(`[${pageName}] 🚀 Starting data load...`)
    const startTime = Date.now()
    
    try {
      if (waitAll) {
        // Load semua data dengan Promise.allSettled + timeout protection
        const loadersWithTimeout = loaders.map(loader => 
          withTimeout(loader(), 30000).catch(err => {
            console.warn(`[${pageName}] Loader failed:`, err)
            return Promise.reject(err)
          })
        )
        
        const results = await Promise.allSettled(loadersWithTimeout)
        
        // Update progress
        loadingProgress.value = 100
        
        // Check for errors
        const failures = results.filter(r => r.status === 'rejected')
        const successes = results.filter(r => r.status === 'fulfilled')
        
        console.log(`[${pageName}] 📊 Results: ${successes.length} success, ${failures.length} failed`)
        
        if (failures.length > 0) {
          console.warn(`[${pageName}] ⚠️ ${failures.length} loaders failed:`, failures)
          
          // Jika semua gagal, throw error
          if (failures.length === results.length) {
            throw new Error(`All data loaders failed for ${pageName}`)
          }
        }
        
        const duration = Date.now() - startTime
        console.log(`[${pageName}] ✅ Data loaded successfully in ${duration}ms`)
        
        if (onSuccess) {
          try {
            onSuccess()
          } catch (successError) {
            console.error(`[${pageName}] Error in onSuccess callback:`, successError)
          }
        }
      } else {
        // Load data satu per satu dengan progress tracking
        const total = loaders.length
        let completed = 0
        
        for (const loader of loaders) {
          try {
            await loader()
            completed++
            loadingProgress.value = Math.round((completed / total) * 100)
          } catch (err) {
            console.warn(`[${pageName}] ⚠️ Loader failed:`, err)
            // Continue dengan loader berikutnya
          }
        }
        
        const duration = Date.now() - startTime
        console.log(`[${pageName}] ✅ Data loading completed in ${duration}ms`)
        
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime
      console.error(`[${pageName}] ❌ Data load failed after ${duration}ms:`, err)
      error.value = err
      
      if (onError) {
        onError(err)
      } else {
        // Default error handling dengan toast (with try-catch)
        try {
          const toast = useToast()
          toast.error({
            title: 'Error Loading Data',
            message: `Failed to load data for ${pageName}. Please refresh the page.`,
            color: 'red'
          })
        } catch (toastError) {
          console.error('Toast error:', toastError)
          // Fallback to alert if toast fails
          alert(`Failed to load data for ${pageName}. Please refresh the page.`)
        }
      }
    } finally {
      // ✅ CRITICAL: ALWAYS set loading to false
      isLoading.value = false
      console.log(`[${pageName}] ✅ Loading state set to false`)
    }
  }
  
  /**
   * Reload data (untuk refresh button)
   */
  const reload = async () => {
    await loadData()
  }
  
  // Auto-load saat composable dipanggil
  loadData()
  
  return {
    isLoading,
    error,
    loadingProgress,
    reload
  }
}

