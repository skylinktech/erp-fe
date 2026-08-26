import { buildQueryString, fetchJson } from '~/utils/paginatedApi'
import { normalizeAgingReport } from '~/utils/finance/agingView'
import type { AgingReportView } from '~/types/finance/workspace'

type AgingSide = 'ar' | 'ap'

type CacheKey = string

/**
 * Lazy-fetch aging report with simple in-memory cache per filter signature.
 * Does not recalculate buckets — uses backend AgingReportService.
 */
export function useAgingReport(side: AgingSide) {
  const { $api } = useNuxtApp()
  const report = ref<AgingReportView | null>(null)
  const loading = ref(false)
  const error = ref('')
  const cache = new Map<CacheKey, AgingReportView>()
  let requestSeq = 0

  function endpoint(qs: string) {
    return side === 'ar' ? $api.arAgingReport(qs) : $api.apAgingReport(qs)
  }

  async function load(filters: {
    asOf?: string
    customerId?: string | number | null
    vendorId?: string | number | null
    perusahaanId?: string | number | null
    force?: boolean
  } = {}) {
    const params: Record<string, unknown> = {
      asOf: filters.asOf || undefined,
      customerId: side === 'ar' ? filters.customerId || undefined : undefined,
      vendorId: side === 'ap' ? filters.vendorId || undefined : undefined,
      perusahaanId: filters.perusahaanId || undefined,
    }
    const qs = buildQueryString(params).replace(/^\?/, '')
    const key = `${side}|${qs}`

    if (!filters.force && cache.has(key)) {
      report.value = cache.get(key)!
      error.value = ''
      return report.value
    }

    const seq = ++requestSeq
    loading.value = true
    error.value = ''
    try {
      const json = await fetchJson<{ data?: unknown; message?: string }>(endpoint(qs))
      if (seq !== requestSeq) return report.value
      const normalized = normalizeAgingReport(json.data ?? json)
      cache.set(key, normalized)
      report.value = normalized
      return normalized
    } catch (e: any) {
      if (seq !== requestSeq) return report.value
      error.value = e?.message || `Gagal memuat ${side.toUpperCase()} aging`
      report.value = null
      return null
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  function invalidate() {
    cache.clear()
  }

  return { report, loading, error, load, invalidate }
}
