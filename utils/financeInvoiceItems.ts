/**
 * Klasifikasi baris Finance Invoice untuk tampilan detail/cetak.
 * Prioritas: tax → adjustment → OTC/MRC marker → product.billingType.
 */

const ADJUSTMENT_TYPE_RE =
  /^\[(restitution|additional_charge|discount|penalty|correction|other)\]/i

const TAX_CODE_RE =
  /^(PPN|PPH21|PPH22|PPH23|PPH4|PPH\s*21|PPH\s*22|PPH\s*23|PPH\s*4)\b/i

export function isBillingAdjustmentItem(item) {
  const desc = String(item?.description || '')
  if (/\(ADJUSTMENT\)/i.test(desc)) return true
  if (ADJUSTMENT_TYPE_RE.test(desc.trim())) return true
  return false
}

/** Baris pajak dari Tax Master / Billing Preparation (bukan charge layanan). */
export function isFinanceInvoiceTaxItem(item) {
  const desc = String(item?.description || '').trim()
  if (!desc) return false
  if (/\(TAX\)/i.test(desc)) return true
  if (/^[A-Z0-9]+\s+[—–-]\s+.+/u.test(desc) && TAX_CODE_RE.test(desc)) return true
  if (TAX_CODE_RE.test(desc)) return true
  return false
}

export function classifyFinanceInvoiceItem(item) {
  const desc = String(item?.description || '')
  const descUpper = desc.toUpperCase()

  if (isFinanceInvoiceTaxItem(item)) return 'tax'
  if (isBillingAdjustmentItem(item)) return 'adjustment'
  if (/\(OTC\)/.test(descUpper) || /\bOTC\b/.test(descUpper)) return 'otc'
  if (/\(MRC\)/.test(descUpper) || /\bMRC\b/.test(descUpper)) return 'mrc'

  const billingType = String(
    item?.product?.billingType || item?.product?.billing_type || ''
  ).toLowerCase()
  if (billingType === 'one_time') return 'otc'
  if (billingType === 'recurring') return 'mrc'
  return 'other'
}

export function groupFinanceInvoiceItems(items = []) {
  const groups = { otc: [], mrc: [], adjustment: [], tax: [], other: [] }
  for (const item of items) {
    groups[classifyFinanceInvoiceItem(item)].push(item)
  }
  return groups
}

/** Label tipe adjustment dari prefix deskripsi `[restitution] ...` */
export function adjustmentTypeLabel(item) {
  const desc = String(item?.description || '').trim()
  const m = desc.match(ADJUSTMENT_TYPE_RE)
  if (!m) return 'Adjustment'
  const map = {
    restitution: 'Restitution',
    additional_charge: 'Additional Charge',
    discount: 'Discount',
    penalty: 'Penalty',
    correction: 'Correction',
    other: 'Other',
  }
  return map[m[1].toLowerCase()] || m[1]
}

/** Label ringkas untuk baris pajak di ringkasan (kode + rate jika ada). */
export function taxItemSummaryLabel(item) {
  const desc = String(item?.description || '').trim()
  if (!desc) return 'Pajak'
  // "PPN — Pajak Pertambahan Nilai (11%)" → "PPN (11%)"
  const m = desc.match(/^([A-Z0-9]+)\s+[—–-]\s+.+?(\([^)]+\))?\s*$/u)
  if (m) {
    const code = m[1]
    const ratePart = m[2] || ''
    return ratePart ? `${code} ${ratePart}` : code
  }
  return desc.length > 40 ? `${desc.slice(0, 37)}…` : desc
}

/** Bersihkan marker teknis dari deskripsi untuk tampilan */
export function cleanInvoiceItemDescription(item) {
  return String(item?.description || '')
    .replace(/\s*\(ADJUSTMENT\)\s*/gi, ' ')
    .replace(/\s*\((OTC|MRC|TAX)\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '—'
}
