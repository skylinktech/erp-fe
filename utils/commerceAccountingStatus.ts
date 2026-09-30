/**
 * FE-only presentation mapping for commerce order accounting state.
 *
 * The backend (`commerce_order_import_service.ts#serializeOrder`) currently exposes a
 * coarse `accountingStatus` (`N_A | PENDING_RETRY | POSTED | UNKNOWN`) plus release
 * blockers surfaced ad-hoc via `release_gate.ts` blockerCodes. This helper maps that
 * into the richer badges the Omnichannel UI needs without inventing new backend state.
 */

export type CommerceAccountingBadge =
  | 'PENDING_RECOGNITION'
  | 'PENDING_SETTLEMENT'
  | 'BLOCKED'
  | 'POSTED'
  | 'PENDING_CONFIG'
  | 'NOT_APPLICABLE'

export const COMMERCE_ACCOUNTING_BADGE_LABELS: Record<CommerceAccountingBadge, string> = {
  PENDING_RECOGNITION: 'Menunggu syarat pengakuan',
  PENDING_SETTLEMENT: 'Menunggu settlement',
  BLOCKED: 'Terblokir',
  POSTED: 'Posted',
  PENDING_CONFIG: 'Pending config',
  NOT_APPLICABLE: 'Belum rilis',
}

export const COMMERCE_ACCOUNTING_BADGE_CLASS: Record<CommerceAccountingBadge, string> = {
  PENDING_RECOGNITION: 'bg-label-warning',
  PENDING_SETTLEMENT: 'bg-label-info',
  BLOCKED: 'bg-label-danger',
  POSTED: 'bg-label-success',
  PENDING_CONFIG: 'bg-label-secondary',
  NOT_APPLICABLE: 'bg-label-secondary',
}

export type CommerceAccountingPolicyMode = 'ON_ELIGIBLE_RELEASE' | 'AFTER_VERIFIED_SETTLEMENT'

export function resolveCommerceAccountingBadge(order: {
  stockIssuedAt?: string | null
  accountingStatus?: string | null
  revenuePostingStatus?: string | null
  releaseBlockerCodes?: string[] | null
}, policyMode?: CommerceAccountingPolicyMode | null): CommerceAccountingBadge {
  const blockers = order.releaseBlockerCodes || []
  const revenue = String(order.revenuePostingStatus || '').toUpperCase()
  if (revenue === 'POSTED' || String(order.accountingStatus || '').toUpperCase() === 'POSTED') {
    return 'POSTED'
  }
  if (
    blockers.includes('ACCOUNTING_POLICY_NOT_CONFIGURED') ||
    revenue === 'PENDING_CONFIG'
  ) {
    return 'PENDING_CONFIG'
  }
  if (revenue === 'WAITING_SETTLEMENT' || blockers.includes('SETTLEMENT_NOT_VERIFIED')) {
    return 'PENDING_SETTLEMENT'
  }
  if (revenue === 'WAITING_RECOGNITION') return 'PENDING_RECOGNITION'
  if (revenue === 'BLOCKED' || blockers.length > 0) return 'BLOCKED'

  const status = String(order.accountingStatus || '').toUpperCase()
  if (!order.stockIssuedAt || status === 'N_A' || !revenue) return 'NOT_APPLICABLE'
  if (policyMode === 'AFTER_VERIFIED_SETTLEMENT') return 'PENDING_SETTLEMENT'
  return 'PENDING_RECOGNITION'
}

export function commerceAccountingBadgeMeta(
  order: { stockIssuedAt?: string | null; accountingStatus?: string | null; releaseBlockerCodes?: string[] | null },
  policyMode?: CommerceAccountingPolicyMode | null
) {
  const key = resolveCommerceAccountingBadge(order, policyMode)
  return { key, label: COMMERCE_ACCOUNTING_BADGE_LABELS[key], badgeClass: COMMERCE_ACCOUNTING_BADGE_CLASS[key] }
}

/** Indonesian labels for release-gate blocker codes (see erp_skl release_gate.ts). */
export const COMMERCE_RELEASE_BLOCKER_LABELS: Record<string, string> = {
  NOT_RETAIL_PROFILE: 'Company bukan profil RETAIL',
  FLOW_ELIGIBILITY: 'Grant RETAIL_DIRECT_SALE tidak aktif',
  OWNERSHIP: 'Warehouse allocation / ownership tidak memenuhi',
  STATUS_NOT_RELEASABLE: 'Status pesanan tidak boleh dirilis',
  FULFILLMENT_UNSUPPORTED: 'Tipe fulfillment belum didukung rilis otomatis',
  SKU_UNMAPPED: 'Mapping SKU belum lengkap',
  WAREHOUSE_UNMAPPED: 'Shop warehouse belum dipetakan',
  STOCK_UNAVAILABLE: 'Stok tidak cukup untuk reservasi',
  MONEY_SNAPSHOT_INCOMPLETE: 'Snapshot uang dari marketplace belum lengkap',
  MONEY_SNAPSHOT_TOTAL_MISMATCH: 'Total snapshot uang tidak konsisten',
  MONEY_SNAPSHOT_CURRENCY_MISSING: 'Mata uang snapshot tidak tersedia',
  MONEY_SNAPSHOT_NOT_LOCKED: 'Snapshot uang belum dikunci dari platform',
  ACCOUNTING_POLICY_NOT_CONFIGURED: 'Kebijakan accounting omnichannel belum dikonfigurasi',
}

export function commerceReleaseBlockerLabel(code: string): string {
  return COMMERCE_RELEASE_BLOCKER_LABELS[code] || code
}
