/**
 * Shared pagination helpers for commerce list pages (orders / returns).
 * BE clamps perPage to 1..100 — keep FE options inside that range (no fake 500).
 */

export type CommerceListMeta = {
  total?: number
  perPage?: number
  currentPage?: number
  lastPage?: number
  firstPage?: number
}

export const COMMERCE_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const
export const COMMERCE_DEFAULT_PER_PAGE = 20
export const COMMERCE_MAX_PER_PAGE = 100

export function clampCommercePerPage(value: unknown, fallback = COMMERCE_DEFAULT_PER_PAGE): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(COMMERCE_MAX_PER_PAGE, Math.max(1, Math.floor(n)))
}

export function normalizeCommerceMeta(meta: CommerceListMeta | null | undefined): {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
} {
  const total = Math.max(0, Number(meta?.total ?? 0) || 0)
  const perPage = clampCommercePerPage(meta?.perPage, COMMERCE_DEFAULT_PER_PAGE)
  const currentPage = Math.max(1, Number(meta?.currentPage ?? 1) || 1)
  const lastPage = Math.max(1, Number(meta?.lastPage ?? 1) || 1)
  return { total, perPage, currentPage, lastPage }
}
