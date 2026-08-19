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

/** Format angka untuk input biaya saat mengetik (contoh: Rp 1.234.567). */
export function formatRupiahInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const digits = String(value).replace(/[^0-9]/g, '')
  if (!digits) return ''

  const split = digits.split(',')
  const sisa = split[0].length % 3
  let rupiah = split[0].substring(0, sisa)
  const ribuan = split[0].substring(sisa).match(/\d{3}/gi)
  if (ribuan) {
    const separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }
  return `Rp ${rupiah}`
}

/** Parse input Rupiah ke number; string kosong → null. */
export function parseRupiahInputNullable(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : null
}