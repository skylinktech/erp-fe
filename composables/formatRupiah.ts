/**
 * Parse nilai dari input berformat Rupiah (ID) ke integer.
 * Titik dianggap pemisah ribuan, bukan desimal — agar "Rp 1.500" → 1500, bukan 1.5.
 */
export function parseRupiahToNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits)
}

export const useFormatRupiah = () => {
  const formatter = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })

  return (value: number | string): string => {
    if (value === null || value === undefined || value === '') return 'Rp 0'

    const numericValue = typeof value === 'string' ? parseRupiahToNumber(value) : value

    if (Number.isNaN(numericValue)) return 'Rp 0'

    return `Rp ${formatter.format(Math.round(numericValue))}`
  }
}