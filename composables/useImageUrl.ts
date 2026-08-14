export const useImageUrl = () => {
  const config = useRuntimeConfig()

  const getApiBase = () => String(config.public.apiBase || '').replace(/\/$/, '')

  const getApiOrigin = () => {
    const apiBase = getApiBase()
    if (apiBase.endsWith('/api')) {
      return apiBase.slice(0, -4)
    }
    if (apiBase.includes('/api/')) {
      return apiBase.replace('/api/', '/')
    }
    return apiBase
  }

  const isRemoteObjectUrl = (path: string) =>
    path.includes('storage.googleapis.com') ||
    path.includes('s3.amazonaws.com') ||
    path.includes('s3.')

  /**
   * Path lokal public/uploads — disajikan lewat /api/uploads/* agar lolos API gateway.
   */
  const toLocalUploadPath = (path: string): string | null => {
    let pathname = path.trim()

    if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
      try {
        pathname = new URL(pathname).pathname
      } catch {
        return null
      }
    }

    pathname = pathname.replace(/^\/+/, '')
    if (pathname.startsWith('api/')) {
      pathname = pathname.slice(4)
    }

    if (pathname.startsWith('uploads/')) {
      return pathname
        .split('/')
        .filter(Boolean)
        .map((segment) => {
          try {
            return encodeURIComponent(decodeURIComponent(segment))
          } catch {
            return encodeURIComponent(segment)
          }
        })
        .join('/')
    }

    return null
  }

  /**
   * Get image URL dengan fallback ke default image
   */
  const getImageUrl = (path: string | null | undefined, defaultImage: string = '/img/default-avatar.png') => {
    if (!path) return defaultImage

    const trimmed = String(path).trim()
    if (!trimmed) return defaultImage

    if (isRemoteObjectUrl(trimmed)) {
      if (trimmed.includes('storage.googleapis.com')) {
        const url = new URL(trimmed)
        if (!url.searchParams.has('t')) {
          url.searchParams.set('t', Date.now().toString())
        }
        return url.toString()
      }
      return trimmed
    }

    const uploadPath = toLocalUploadPath(trimmed)
    const apiBase = getApiBase()

    if (uploadPath) {
      if (apiBase) {
        return `${apiBase}/${uploadPath}`
      }
      return `/${uploadPath}`
    }

    const origin = getApiOrigin()
    const cleanPath = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed
    if (!origin) {
      return `/${cleanPath}`
    }
    return `${origin}/${cleanPath}`
  }

  /**
   * Get image URL untuk customer logo
   */
  const getCustomerLogo = (logoPath: string | null | undefined) => {
    if (!logoPath) return '/img/default-customer-logo.png'

    const trimmed = String(logoPath).trim()
    const isAbsolute = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    const isUpload = trimmed.includes('/uploads/') || trimmed.startsWith('uploads/')

    // Data seeder lama hanya menyimpan nama file, tanpa folder uploads/customers
    if (!isAbsolute && !isUpload && !trimmed.includes('/')) {
      return getImageUrl(`uploads/customers/${trimmed}`, '/img/default-customer-logo.png')
    }

    return getImageUrl(trimmed, '/img/default-customer-logo.png')
  }

  /**
   * Get image URL untuk product image
   */
  const getProductImage = (imagePath: string | null | undefined) => {
    return getImageUrl(imagePath, '/img/default-product-image.png')
  }

  /**
   * Get image URL untuk user avatar
   */
  const getUserAvatar = (avatarPath: string | null | undefined) => {
    return getImageUrl(avatarPath, '/img/default-avatar.png')
  }

  /**
   * Get image URL untuk company logo
   */
  const getCompanyLogo = (logoPath: string | null | undefined) => {
    return getImageUrl(logoPath, '/img/default-company-logo.png')
  }

  /**
   * Get image URL untuk vendor logo
   */
  const getVendorLogo = (logoPath: string | null | undefined) => {
    return getImageUrl(logoPath, '/img/default-vendor-logo.png')
  }

  /**
   * Get file URL untuk attachment (PDF, Excel, Image)
   */
  const getAttachmentUrl = (filePath: string | null | undefined) => {
    return getImageUrl(filePath, '/img/default-file.png')
  }

  /**
   * Get file icon berdasarkan extension
   */
  const getFileIcon = (fileName: string | null | undefined): string => {
    if (!fileName) return 'ri-file-line'
    
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    
    switch (extension) {
      case 'pdf':
        return 'ri-file-pdf-line'
      case 'xlsx':
      case 'xls':
        return 'ri-file-excel-line'
      case 'docx':
      case 'doc':
        return 'ri-file-word-line'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'ri-image-line'
      default:
        return 'ri-file-line'
    }
  }

  /**
   * Check apakah file adalah image
   */
  const isImageFile = (fileName: string | null | undefined): boolean => {
    if (!fileName) return false
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
  }

  /**
   * Check apakah file adalah PDF
   */
  const isPdfFile = (fileName: string | null | undefined): boolean => {
    if (!fileName) return false
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    return extension === 'pdf'
  }

  /**
   * Check apakah file adalah Excel
   */
  const isExcelFile = (fileName: string | null | undefined): boolean => {
    if (!fileName) return false
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    return ['xlsx', 'xls'].includes(extension)
  }

  /**
   * Handle image error dengan fallback
   */
  const handleImageError = (event: Event, fallbackSrc: string = '/img/default-avatar.png') => {
    const target = event.target as HTMLImageElement
    if (target.dataset.fallbackApplied === '1') return
    target.dataset.fallbackApplied = '1'
    console.warn('Image failed to load:', target.src, 'falling back to:', fallbackSrc)
    target.src = fallbackSrc
  }

  /**
   * Handle CORS error untuk Google Cloud Storage
   */
  const handleCorsError = (event: Event, originalSrc: string) => {
    const target = event.target as HTMLImageElement
    
    // Jika error karena CORS, coba dengan proxy atau fallback
    if (originalSrc.includes('storage.googleapis.com')) {
      console.warn('CORS error untuk GCS image:', originalSrc)
      
      // Coba dengan mode no-cors atau gunakan fallback
      target.crossOrigin = 'anonymous'
      target.src = originalSrc + '?t=' + Date.now()
      
      // Jika masih error, gunakan fallback
      setTimeout(() => {
        if (target.naturalWidth === 0) {
          target.src = '/img/default-product-image.png'
        }
      }, 1000)
    }
  }

  /**
   * Check apakah URL adalah S3 URL
   */
  const isS3Url = (url: string): boolean => {
    return url.includes('s3.amazonaws.com') || url.includes('s3.')
  }

  /**
   * Get file extension dari URL
   */
  const getFileExtension = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      return pathname.split('.').pop()?.toLowerCase() || ''
    } catch {
      return ''
    }
  }



  /**
   * Test image URL accessibility
   */
  const testImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.error('Image URL test failed:', error)
      return false
    }
  }

  /**
   * Debug image URL generation
   */
  const debugImageUrl = (path: string | null | undefined) => {
    
    if (path) {
      const generatedUrl = getImageUrl(path)
      
      // Test URL accessibility
      testImageUrl(generatedUrl).then(() => {})
    } else {
      
    }
  }

  return {
    getImageUrl,
    getCustomerLogo,
    getProductImage,
    getUserAvatar,
    getCompanyLogo,
    getVendorLogo,
    getAttachmentUrl,
    getFileIcon,
    handleImageError,
    handleCorsError,
    isS3Url,
    getFileExtension,
    isImageFile,
    isPdfFile,
    isExcelFile,
    testImageUrl,
    debugImageUrl
  }
}