/**
 * Parse nilai ke integer Rupiah.
 * - Number dari API: dipakai langsung
 * - Desimal DB/API: "3325000.00" → 3325000 (bukan 332500000)
 * - Format ID: "Rp 3.325.000" / "3.325.000" → 3325000 (titik = pemisah ribuan)
 */
export function parseRupiahToNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0

  const raw = String(value).trim()
  if (!raw) return 0

  const normalized = raw.replace(/,/g, '')
  if (/^\d+\.\d+$/.test(normalized)) {
    const n = parseFloat(normalized)
    return Number.isFinite(n) ? Math.round(n) : 0
  }

  const digits = raw.replace(/\D/g, '')
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

    const numericValue = typeof value === 'string'
      ? parseRupiahToNumber(value)
      : (Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0)

    if (Number.isNaN(numericValue)) return 'Rp 0'

    return `Rp ${formatter.format(Math.round(numericValue))}`
  }
}