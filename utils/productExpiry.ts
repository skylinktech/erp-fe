/**
 * Product expired_at visibility / requirement (mirrors BE domain rule).
 * Visible when Active Company is RETAIL, or when isBundling is checked.
 * Always optional (nullable).
 */
export function isProductExpiredAtRequired(_input: {
  isRetailCompany: boolean
  isBundling: boolean
}): boolean {
  return false
}

export function isProductExpiredAtVisible(input: {
  isRetailCompany: boolean
  isBundling: boolean
}): boolean {
  return Boolean(input.isRetailCompany || input.isBundling)
}

/** Date input value YYYY-MM-DD from API datetime / date. */
export function toProductExpiredAtInput(value: unknown): string {
  if (value == null || value === '') return ''
  return String(value).slice(0, 10)
}

export function formatProductExpiredAtDisplay(value: unknown): string {
  const day = toProductExpiredAtInput(value)
  if (!day) return '—'
  try {
    return new Date(`${day}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return day
  }
}
