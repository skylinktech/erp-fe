import { ref, watch, type Ref } from 'vue'
import type { StockAvailabilityResult } from '~/types/purchasing/stock-availability'

type CacheEntry = {
  loading: boolean
  result: StockAvailabilityResult | null
  error: string | null
}

/** Status PR yang perlu dicek stok di kolom tabel */
const STOCK_CHECK_STATUSES = new Set(['pending', 'approved', 'completed'])

/**
 * Cache status stok per PR untuk kolom tabel list (fetch on-demand per baris approved).
 */
export function usePurchaseRequestListStockCache(
  purchaseRequests: Ref<Array<{ id: number; status?: string }>>
) {
  const cache = ref<Map<number, CacheEntry>>(new Map())

  async function fetchOne(id: number) {
    const existing = cache.value.get(id)
    if (existing?.loading || (existing && (existing.result != null || existing.error))) return

    const next = new Map(cache.value)
    next.set(id, { loading: true, result: null, error: null })
    cache.value = next

    const { $api } = useNuxtApp()
    try {
      const response = await fetch($api.purchaseRequestStockAvailability(id), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message || 'Gagal cek stok')
      }
      const json = await response.json()
      const result = (json.data ?? json) as StockAvailabilityResult
      cache.value = new Map(cache.value).set(id, { loading: false, result, error: null })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal cek stok'
      cache.value = new Map(cache.value).set(id, { loading: false, result: null, error: msg })
    }
  }

  function syncFetch(rows: Array<{ id: number; status?: string }>) {
    for (const row of rows) {
      if (!row?.id || !STOCK_CHECK_STATUSES.has(String(row.status ?? ''))) continue
      fetchOne(Number(row.id))
    }
  }

  watch(purchaseRequests, (rows) => syncFetch(rows ?? []), { immediate: true, deep: true })

  function getEntry(prId: number): CacheEntry | undefined {
    return cache.value.get(prId)
  }

  function refresh(prId: number) {
    const next = new Map(cache.value)
    next.delete(prId)
    cache.value = next
    fetchOne(prId)
  }

  return { getEntry, refresh }
}
