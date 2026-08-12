import { defineStore } from 'pinia'
import { ref } from 'vue'

function joinApiPath(apiBase: string, path: string) {
  const base = String(apiBase || '').replace(/\/$/, '')
  const cleanPath = String(path || '').replace(/^\//, '')
  if (!base) return `/${cleanPath}`
  // apiBase already includes /api in most envs (e.g. https://host/api)
  if (base.endsWith('/api')) return `${base}/${cleanPath}`
  return `${base}/api/${cleanPath}`
}

export const useDocumentVerificationStore = defineStore('documentVerification', () => {
  const loading = ref(false)
  const error = ref(null)
  const verificationResult = ref(null)

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  /**
   * Verify document by signature token (legacy document token or multi-signature token).
   */
  async function verifyDocument(token, options = {}) {
    loading.value = true
    error.value = null
    verificationResult.value = null

    try {
      const params = { token }
      if (options.type) params.type = options.type

      const response = await $fetch(joinApiPath(apiBase, 'verify-document'), {
        method: 'GET',
        params,
      })

      verificationResult.value = response
      return response
    } catch (err) {
      console.error('Error verifying document:', err)

      const data = err?.data || err?.response?._data || null
      if (data?.message) {
        error.value = data.message
        verificationResult.value = data
      } else if (err?.message) {
        error.value = err.message
      } else {
        error.value = 'Terjadi kesalahan saat memverifikasi dokumen'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  function generateVerificationUrl(token) {
    if (!token) {
      console.warn('Token is required to generate verification URL')
      return ''
    }

    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : config.public.siteUrl || 'https://yourdomain.com'

    return `${baseUrl}/verify?token=${token}`
  }

  function reset() {
    loading.value = false
    error.value = null
    verificationResult.value = null
  }

  function getStatusBadgeClass(valid) {
    return valid ? 'badge bg-success' : 'badge bg-danger'
  }

  function getStatusText(valid) {
    return valid ? 'Valid & Terverifikasi' : 'Tidak Valid'
  }

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
    loading,
    error,
    verificationResult,
    verifyDocument,
    generateVerificationUrl,
    reset,
    getStatusBadgeClass,
    getStatusText,
    formatDate,
  }
})
