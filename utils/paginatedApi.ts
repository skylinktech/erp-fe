/** Shared helpers for Lucid / ApiResponse paginated payloads. */

export type PaginatedMeta = {
  total: number
  page: number
  rows: number
  lastPage: number
}

export function parsePaginatedData<T = unknown>(res: unknown): T[] {
  if (!res || typeof res !== 'object') return []
  const body = res as Record<string, unknown>
  const data = body.data
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).data)) {
    return (data as Record<string, unknown>).data as T[]
  }
  if (Array.isArray(res)) return res as T[]
  return []
}

export function parsePaginatedMeta(res: unknown, fallbackRows = 10): PaginatedMeta {
  const body = (res && typeof res === 'object' ? res : {}) as Record<string, unknown>
  const meta = (body.meta ?? {}) as Record<string, unknown>
  const data = parsePaginatedData(res)
  const total = Number(meta.total ?? meta.totalCount ?? data.length)
  const rows = Number(meta.rows ?? meta.perPage ?? meta.per_page ?? fallbackRows)
  const page = Number(meta.page ?? meta.currentPage ?? meta.current_page ?? 1)
  const lastPage = Number(meta.lastPage ?? meta.last_page ?? (Math.ceil(total / rows) || 1))
  return { total, page, rows, lastPage }
}

export function buildQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export async function fetchJson<T = unknown>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      (body as Record<string, unknown>)?.message ||
      (body as Record<string, unknown>)?.error ||
      `HTTP ${response.status}`
    throw new Error(String(message))
  }
  return body as T
}
