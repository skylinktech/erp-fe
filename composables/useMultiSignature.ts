import { ref, computed } from 'vue'

export interface DocumentSignature {
  id: number
  user: {
    id: number
    name: string
    email?: string
  }
  role: string | null
  order: number
  signedAt: string
  notes?: string | null
  token: string
}

export interface SignatureProgress {
  count: number
  required: number
  isFully: boolean
  percentage: number
  remaining: number
}

/**
 * Composable untuk handle multi-signature functionality
 * Usage: const { signatures, loading, fetchSignatures, addSignature } = useMultiSignature()
 */
export function useMultiSignature() {
  const config = useRuntimeConfig()
  const toast = useToast()

  // State
  const signatures = ref<DocumentSignature[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref<SignatureProgress | null>(null)

  /**
   * Fetch signatures untuk dokumen
   * @param documentType - 'site-investments', 'purchase-orders', etc
   * @param documentId - ID dokumen
   */
  async function fetchSignatures(documentType: string, documentId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>(`${config.public.apiBase}/api/${documentType}/${documentId}/signatures`)

      signatures.value = response.signatures || []
      return response
    } catch (err: any) {
      console.error('Error fetching signatures:', err)
      error.value = err.message || 'Gagal mengambil data tanda tangan'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch signature progress/status
   * @param documentType - 'site-investments', 'purchase-orders', etc
   * @param documentId - ID dokumen
   */
  async function fetchSignatureStatus(documentType: string, documentId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>(`${config.public.apiBase}/api/${documentType}/${documentId}/signature-status`)

      progress.value = {
        count: response.count,
        required: response.required,
        isFully: response.isFully,
        percentage: response.percentage,
        remaining: response.required - response.count,
      }

      return response
    } catch (err: any) {
      console.error('Error fetching signature status:', err)
      error.value = err.message || 'Gagal mengambil status tanda tangan'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add signature ke dokumen (sign document)
   * @param documentType - 'site-investments', 'purchase-orders', etc
   * @param documentId - ID dokumen
   * @param signatureRole - Role signature (optional)
   * @param notes - Catatan (optional)
   */
  async function addSignature(
    documentType: string,
    documentId: string,
    signatureRole?: string,
    notes?: string
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>(`${config.public.apiBase}/api/${documentType}/${documentId}/signatures`, {
        method: 'POST',
        body: {
          signatureRole,
          notes,
          signatureOrder: 0, // default parallel
        },
      })

      toast?.success({
        title: 'Berhasil!',
        message: response.message || 'Dokumen berhasil ditandatangani',
      })

      // Refresh signatures after adding
      await fetchSignatures(documentType, documentId)

      return response
    } catch (err: any) {
      console.error('Error adding signature:', err)
      error.value = err.data?.message || err.message || 'Gagal menandatangani dokumen'
      
      toast?.error({
        title: 'Gagal!',
        message: error.value,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Generate verification URL untuk QR code
   * @param token - Signature token
   */
  function generateVerificationUrl(token: string): string {
    if (!token) return ''

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : config.public.siteUrl || 'https://yourdomain.com'

    return `${baseUrl}/verify?token=${token}`
  }

  /**
   * Format date untuk display
   */
  function formatDate(date: string | Date): string {
    if (!date) return '-'

    try {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return String(date)
    }
  }

  /**
   * Get role label yang user-friendly
   */
  function getRoleLabel(role: string | null): string {
    if (!role) return 'Penandatangan'

    const roleLabels: Record<string, string> = {
      'manager': 'Manager',
      'director': 'Director',
      'cfo': 'CFO',
      'ceo': 'CEO',
      'approver': 'Approver',
      'reviewer': 'Reviewer',
      'witness': 'Witness',
      'finance': 'Finance',
      'technical': 'Technical',
      'commercial': 'Commercial',
      'buyer': 'Buyer',
      'sales': 'Sales',
    }

    return roleLabels[role.toLowerCase()] || role
  }

  /**
   * Get required signature count based on amount (client-side estimation)
   * Note: Server-side is source of truth
   */
  function estimateRequiredSignatures(documentType: string, amount: number = 0): number {
    // This is estimation only - actual count comes from server
    switch (documentType) {
      case 'site-investments':
      case 'sales-orders':
      case 'quotations':
        if (amount >= 100_000_000) return 4
        if (amount >= 50_000_000) return 3
        if (amount >= 10_000_000) return 2
        return 1

      case 'purchase-orders':
      case 'purchase-requests':
        if (amount >= 100_000_000) return 3
        if (amount >= 25_000_000) return 2
        return 1

      default:
        return 1
    }
  }

  /**
   * Check if current user already signed
   */
  function hasCurrentUserSigned(currentUserId: number): boolean {
    return signatures.value.some(sig => sig.user.id === currentUserId)
  }

  /**
   * Get signature by user ID
   */
  function getSignatureByUserId(userId: number): DocumentSignature | undefined {
    return signatures.value.find(sig => sig.user.id === userId)
  }

  // Computed
  const signatureCount = computed(() => signatures.value.length)
  
  const isFullySigned = computed(() => {
    return progress.value?.isFully || false
  })

  const progressPercentage = computed(() => {
    return progress.value?.percentage || 0
  })

  const remainingSignatures = computed(() => {
    return progress.value?.remaining || 0
  })

  // Reset function
  function reset() {
    signatures.value = []
    loading.value = false
    error.value = null
    progress.value = null
  }

  return {
    // State
    signatures,
    loading,
    error,
    progress,

    // Computed
    signatureCount,
    isFullySigned,
    progressPercentage,
    remainingSignatures,

    // Methods
    fetchSignatures,
    fetchSignatureStatus,
    addSignature,
    generateVerificationUrl,
    formatDate,
    getRoleLabel,
    estimateRequiredSignatures,
    hasCurrentUserSigned,
    getSignatureByUserId,
    reset,
  }
}
