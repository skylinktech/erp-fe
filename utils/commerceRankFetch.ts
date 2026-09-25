import type { InfiniteFetchResult } from '~/composables/useInfiniteScrollLoader'
import { readAccessToken } from '~/utils/authCookie'

/**
 * Shared paginated fetch for commerce ranking endpoints (top shops / top products).
 * Keeps auth headers + meta normalization in one place (DRY / SRP).
 */
export async function fetchCommerceRankPage<T>(opts: {
  endpoint: string
  companyId: number | string
  days: number
  page: number
  perPage: number
  errorLabel?: string
}): Promise<InfiniteFetchResult<T>> {
  const qs = new URLSearchParams({
    perusahaanId: String(opts.companyId),
    days: String(opts.days),
    page: String(opts.page),
    perPage: String(opts.perPage),
  })
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  headers['X-Active-Company-Id'] = String(opts.companyId)

  const res = await fetch(`${opts.endpoint}?${qs}`, {
    headers,
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(
      json.message || `${opts.errorLabel || 'Gagal memuat data'} (${res.status})`
    )
  }

  const meta = json.meta || {}
  return {
    data: (json.data || []) as T[],
    meta: {
      page: Number(meta.page || opts.page),
      perPage: Number(meta.perPage || opts.perPage),
      total: Number(meta.total || 0),
      lastPage: Number(meta.lastPage || 1),
      hasMore: Boolean(meta.hasMore),
    },
  }
}

export function emptyRankPage<T>(perPage: number): InfiniteFetchResult<T> {
  return {
    data: [],
    meta: { page: 1, perPage, total: 0, lastPage: 1, hasMore: false },
  }
}
