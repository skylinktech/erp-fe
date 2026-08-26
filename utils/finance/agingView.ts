import type {
  AgingBucketKey,
  AgingPartyAggregate,
  AgingReportRow,
  AgingReportView,
  OpenDocumentRow,
  PaymentStatus,
} from '~/types/finance/workspace'

const BUCKET_ORDER: AgingBucketKey[] = ['current', 'b1_30', 'b31_60', 'b61_90', 'b90_plus']

export function normalizeAgingReport(raw: unknown): AgingReportView {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const bucketsRaw = Array.isArray(data.buckets) ? data.buckets : []
  const rowsRaw = Array.isArray(data.rows) ? data.rows : []

  return {
    asOf: String(data.asOf ?? ''),
    totalAmount: Number(data.totalAmount ?? 0),
    totalCount: Number(data.totalCount ?? 0),
    buckets: bucketsRaw.map((b: any) => ({
      key: String(b.key ?? ''),
      label: String(b.label ?? b.key ?? ''),
      amount: Number(b.amount ?? 0),
      count: Number(b.count ?? 0),
    })),
    rows: rowsRaw.map((r: any) => ({
      id: String(r.id ?? ''),
      number: String(r.number ?? r.noInvoice ?? r.no_invoice ?? ''),
      partyId: r.partyId ?? r.party_id ?? null,
      partyName: String(r.partyName ?? r.party_name ?? ''),
      dueDate: r.dueDate ?? r.due_date ?? null,
      documentDate: r.documentDate ?? r.document_date ?? null,
      total: Number(r.total ?? r.remainingAmount ?? r.remaining_amount ?? 0),
      paidAmount: Number(r.paidAmount ?? r.paid_amount ?? 0),
      paymentStatus: r.paymentStatus ?? r.payment_status ?? r.status ?? undefined,
      remainingAmount: Number(r.remainingAmount ?? r.remaining_amount ?? 0),
      daysPastDue: Number(r.daysPastDue ?? r.days_past_due ?? 0),
      bucket: String(r.bucket ?? 'current'),
    })),
  }
}

/** Client-side rollup of aging rows by party — no recalculation of days/buckets. */
export function aggregateAgingByParty(rows: AgingReportRow[]): AgingPartyAggregate[] {
  const map = new Map<string, AgingPartyAggregate>()

  for (const row of rows) {
    const key = String(row.partyId ?? row.partyName ?? 'unknown')
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        partyId: key,
        partyName: row.partyName || '—',
        invoiceCount: 1,
        remainingAmount: Number(row.remainingAmount || 0),
        maxDaysPastDue: Number(row.daysPastDue || 0),
        worstBucket: row.bucket,
      })
      continue
    }
    existing.invoiceCount += 1
    existing.remainingAmount += Number(row.remainingAmount || 0)
    if (Number(row.daysPastDue || 0) > existing.maxDaysPastDue) {
      existing.maxDaysPastDue = Number(row.daysPastDue || 0)
      existing.worstBucket = row.bucket
    } else if (
      Number(row.daysPastDue || 0) === existing.maxDaysPastDue &&
      bucketRank(row.bucket) > bucketRank(existing.worstBucket)
    ) {
      existing.worstBucket = row.bucket
    }
  }

  return [...map.values()].sort((a, b) => b.remainingAmount - a.remainingAmount)
}

function bucketRank(key: string): number {
  const idx = BUCKET_ORDER.indexOf(key as AgingBucketKey)
  return idx >= 0 ? idx : 0
}

export function filterAgingRows(
  rows: AgingReportRow[],
  opts: { search?: string; bucket?: string; partyId?: string | number | null }
): AgingReportRow[] {
  const search = (opts.search || '').trim().toLowerCase()
  return rows.filter((row) => {
    if (opts.bucket && opts.bucket !== 'all' && row.bucket !== opts.bucket) return false
    if (opts.partyId != null && opts.partyId !== '' && String(row.partyId) !== String(opts.partyId)) {
      return false
    }
    if (!search) return true
    return (
      row.number.toLowerCase().includes(search) ||
      row.partyName.toLowerCase().includes(search)
    )
  })
}

/** Map aging row → open-document row (remaining already > 0 from aging API). */
export function agingRowToOpenDocument(row: AgingReportRow): OpenDocumentRow {
  const total = Number(row.total ?? row.remainingAmount ?? 0)
  const paidAmount = Number(row.paidAmount ?? 0)
  const remainingAmount = Number(row.remainingAmount || 0)
  const fromApi = String(row.paymentStatus || '').toLowerCase()
  const paymentStatus: PaymentStatus =
    fromApi === 'partial' || fromApi === 'paid' || fromApi === 'unpaid'
      ? (fromApi as PaymentStatus)
      : derivePaymentStatus(paidAmount, remainingAmount, total)

  return {
    id: row.id,
    number: row.number,
    partyId: row.partyId,
    partyName: row.partyName,
    documentDate: row.documentDate
      ? String(row.documentDate).slice(0, 10)
      : null,
    dueDate: row.dueDate ? String(row.dueDate).slice(0, 10) : null,
    total,
    paidAmount,
    remainingAmount,
    paymentStatus,
    overdueDays: Math.max(0, Number(row.daysPastDue || 0)),
    agingBucket: row.bucket,
  }
}

export function derivePaymentStatus(paid: number, remaining: number, total: number): PaymentStatus {
  if (remaining <= 0 || (total > 0 && paid >= total)) return 'paid'
  if (paid > 0) return 'partial'
  return 'unpaid'
}

export function agingBucketBadgeClass(bucket: string): string {
  switch (bucket) {
    case 'current':
      return 'bg-label-success'
    case 'b1_30':
      return 'bg-label-info'
    case 'b31_60':
      return 'bg-label-warning'
    case 'b61_90':
      return 'bg-label-warning'
    case 'b90_plus':
      return 'bg-label-danger'
    default:
      return 'bg-label-secondary'
  }
}

export function paymentStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-label-success'
    case 'partial':
      return 'bg-label-warning'
    default:
      return 'bg-label-danger'
  }
}

export function formatFinanceMoney(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}
