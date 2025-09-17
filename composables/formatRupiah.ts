export const useFormatRupiah = () => {
  const formatter = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })

  return (value: number | string): string => {
    if (value === null || value === undefined || value === '') return 'Rp 0'

    // Bersihkan input string lalu konversi ke number
    const numericValue = typeof value === 'string'
      ? Number(value.replace(/[^0-9.-]/g, ''))
      : value

    if (Number.isNaN(numericValue)) return 'Rp 0'

    return `Rp ${formatter.format(Math.round(numericValue))}`
  }
}