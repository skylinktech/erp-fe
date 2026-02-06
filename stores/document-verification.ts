import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDocumentVerificationStore = defineStore('documentVerification', () => {
  // State
  const loading = ref(false)
  const error = ref(null)
  const verificationResult = ref(null)

  // Get runtime config for API base
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  /**
   * Verify document by signature token
   * @param {string} token - Signature token from QR code
   * @returns {Promise<Object>} Verification result
   */
  async function verifyDocument(token) {
    loading.value = true
    error.value = null
    verificationResult.value = null

    try {
      const response = await $fetch(`${apiBase}/api/verify-document`, {
        method: 'GET',
        params: { token },
        // Public endpoint, no auth needed
      })

      verificationResult.value = response
      return response
    } catch (err) {
      console.error('Error verifying document:', err)
      
      // Handle different error types
      if (err.response) {
        error.value = err.response._data?.message || 'Gagal memverifikasi dokumen'
        verificationResult.value = err.response._data
      } else if (err.request) {
        error.value = 'Tidak dapat terhubung ke server'
      } else {
        error.value = err.message || 'Terjadi kesalahan'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Generate verification URL for QR code
   * @param {string} token - Signature token
   * @returns {string} Full verification URL
   */
  function generateVerificationUrl(token) {
    if (!token) {
      console.warn('Token is required to generate verification URL')
      return ''
    }

    // Get base URL from window location or config
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}`
      : config.public.siteUrl || 'https://yourdomain.com'

    return `${baseUrl}/verify?token=${token}`
  }

  /**
   * Reset store state
   */
  function reset() {
    loading.value = false
    error.value = null
    verificationResult.value = null
  }

  /**
   * Get human-readable status badge class
   */
  function getStatusBadgeClass(valid) {
    return valid ? 'badge bg-success' : 'badge bg-danger'
  }

  /**
   * Get human-readable status text
   */
  function getStatusText(valid) {
    return valid ? 'Valid & Terverifikasi' : 'Tidak Valid'
  }

  /**
   * Format date for display
   */
  function formatDate(date) {
    if (!date) return '-'
    
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return String(date)
    }
  }

  return {
    // State
    loading,
    error,
    verificationResult,
    
    // Actions
    verifyDocument,
    generateVerificationUrl,
    reset,
    
    // Helpers
    getStatusBadgeClass,
    getStatusText,
    formatDate,
  }
})
