/**
 * Shared display helper: snake_case / kebab-case / SCREAMING_SNAKE → readable Title Case.
 * Domain maps (journalSourceLabel, etc.) stay authoritative; this is the safe fallback.
 */

export type HumanizeLabelOptions = {
  /** Returned when value is null/empty. Default: empty string. */
  fallback?: string
  /** Exact overrides keyed by original or lowercased value (e.g. ar_receipt → AR Receipt). */
  labels?: Record<string, string>
  /** Extra acronym tokens forced to UPPERCASE (merged with defaults). */
  acronyms?: Iterable<string>
}

/** Common ERP / finance / ops acronyms kept uppercase in labels. */
const DEFAULT_ACRONYMS = new Set([
  'ar',
  'ap',
  'gl',
  'je',
  'po',
  'pr',
  'pi',
  'si',
  'so',
  'do',
  'sku',
  'id',
  'qr',
  'npwp',
  'ppn',
  'pph',
  'grni',
  'rma',
  'wo',
  'fdr',
  'arf',
  'pks',
  'coa',
  'cogs',
  'vat',
  'api',
  'url',
  'uuid',
  'csv',
  'pdf',
  'erp',
  'sso',
  'wac',
  'bom',
  'asn',
  'dn',
  'cn',
  'ui',
  'ux',
])

function lookupLabel(raw: string, labels?: Record<string, string>): string | undefined {
  if (!labels) return undefined
  return labels[raw] ?? labels[raw.toLowerCase()]
}

function titleWord(word: string, acronyms: Set<string>): string {
  const lower = word.toLowerCase()
  if (!lower) return word
  if (acronyms.has(lower)) return lower.toUpperCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * Normalize machine codes for UI display.
 * @example humanizeLabel('ar_receipt') → 'AR Receipt'
 * @example humanizeLabel('SALES_ISSUE') → 'Sales Issue'
 * @example humanizeLabel('inventory-movement') → 'Inventory Movement'
 */
export function humanizeLabel(
  value?: string | null,
  options: HumanizeLabelOptions = {}
): string {
  const { fallback = '', labels, acronyms: extraAcronyms } = options
  if (value == null) return fallback

  const raw = String(value).trim()
  if (!raw) return fallback

  const mapped = lookupLabel(raw, labels)
  if (mapped) return mapped

  const acronyms = extraAcronyms
    ? new Set([...DEFAULT_ACRONYMS, ...[...extraAcronyms].map((a) => String(a).toLowerCase())])
    : DEFAULT_ACRONYMS

  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => titleWord(word, acronyms))
    .join(' ')
}
