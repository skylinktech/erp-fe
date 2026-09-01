/**
 * Thin display helpers for commercial duration / billing semantics.
 * Authoritative TCV/margin live on backend (`commercialSummary`).
 * Do NOT derive duration from quantity or billingCycle regex.
 */

export function formatContractDurationMonths(value) {
  if (value === null || value === undefined || value === '') return '-'
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '-'
  return String(Math.trunc(n))
}

/**
 * Prefer snapshotted line duration; never invent from qty / billingCycle.
 */
export function resolveLineDurationMonths(line) {
  if (!line) return null
  const snap =
    line.contractDurationMonths ??
    line.contract_duration_months ??
    null
  if (snap != null && snap !== '') {
    const n = Number(snap)
    if (Number.isFinite(n) && n > 0) return Math.trunc(n)
  }
  return null
}

/**
 * Header duration for SI print: first known snapshotted service duration, else '-'.
 * If all lines share the same duration, that value is used.
 */
export function resolveDocumentDurationMonths(services) {
  const list = Array.isArray(services) ? services : []
  const values = list
    .map((s) => resolveLineDurationMonths(s))
    .filter((v) => v != null)
  if (!values.length) return null
  const first = values[0]
  if (values.every((v) => v === first)) return first
  return first
}

export function billingFrequencyLabel(freq) {
  if (!freq) return '-'
  const map = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    SEMI_ANNUALLY: 'Semi-Annually',
    ANNUALLY: 'Annually',
    ONE_TIME: 'One-Time',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    semi_annually: 'Semi-Annually',
    yearly: 'Annually',
  }
  return map[freq] || String(freq)
}

export function pricingPeriodLabel(period) {
  if (!period) return '-'
  const map = {
    MONTH: '/ Month',
    QUARTER: '/ Quarter',
    SEMI_YEAR: '/ Semi-Year',
    YEAR: '/ Year',
    ONE_TIME: 'One-Time',
  }
  return map[period] || String(period)
}
