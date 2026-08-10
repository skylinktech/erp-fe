/** Label UI standar modul sales. */
export const LABEL_SITE_INVESTMENT = 'Site Investment' as const

/** Opsi dropdown / tabel yang terhubung ke Site Investment. */
export function formatSiteInvestmentOptionLabel(
  row: {
    id?: string | number
    siNumber?: string
    si_number?: string
    name?: string
    customer?: { name?: string } | null
  } | null | undefined
): string {
  if (!row) return ''
  const no = row.siNumber ?? row.si_number ?? ''
  const name = row.name ?? ''
  const client = row.customer?.name ?? ''
  const parts = [no || null, name || null, client ? `(${client})` : null]
  const label = parts.filter(Boolean).join(' — ')
  if (label) return label
  return row.id != null ? `SI-${row.id}` : ''
}
