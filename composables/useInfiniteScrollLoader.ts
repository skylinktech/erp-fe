import { onBeforeUnmount, onMounted, ref, unref, watch, type Ref, type MaybeRef } from 'vue'

export type InfinitePageMeta = {
  page: number
  perPage: number
  total: number
  lastPage: number
  hasMore: boolean
}

export type InfiniteFetchResult<T> = {
  data: T[]
  meta: InfinitePageMeta
}

/**
 * Generic infinite-scroll loader (IntersectionObserver + sentinel).
 * Pass scrollRoot when the list scrolls inside a container (not the viewport).
 * Caller supplies fetchPage — keeps data fetching out of UI (SRP).
 */
export function useInfiniteScrollLoader<T>(opts: {
  fetchPage: (page: number) => Promise<InfiniteFetchResult<T>>
  /** Reset & reload when this changes (e.g. companyId / days) */
  resetKey?: Ref<string | number | null | undefined>
  /** Scrollable parent; defaults to viewport when omitted */
  scrollRoot?: Ref<HTMLElement | null>
  rootMargin?: string
  enabled?: MaybeRef<boolean>
}) {
  const items = ref<T[]>([]) as Ref<T[]>
  const page = ref(0)
  const hasMore = ref(true)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const sentinelEl = ref<HTMLElement | null>(null)

  let observer: IntersectionObserver | null = null
  let inflight = false

  function isEnabled() {
    if (opts.enabled === undefined) return true
    return Boolean(unref(opts.enabled))
  }

  async function loadMore() {
    if (!hasMore.value || inflight) return
    if (!isEnabled()) return
    inflight = true
    loading.value = true
    error.value = null
    try {
      const next = page.value + 1
      const result = await opts.fetchPage(next)
      items.value = next === 1 ? result.data : [...items.value, ...result.data]
      page.value = result.meta.page
      hasMore.value = Boolean(result.meta.hasMore)
      total.value = Number(result.meta.total || 0)
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat data'
    } finally {
      loading.value = false
      inflight = false
    }
  }

  async function resetAndLoad() {
    page.value = 0
    items.value = []
    hasMore.value = true
    total.value = 0
    error.value = null
    await loadMore()
  }

  function bindObserver() {
    observer?.disconnect()
    if (typeof IntersectionObserver === 'undefined') return
    if (!sentinelEl.value) return
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore()
      },
      {
        root: opts.scrollRoot?.value ?? null,
        rootMargin: opts.rootMargin || '120px',
        threshold: 0,
      }
    )
    observer.observe(sentinelEl.value)
  }

  onMounted(() => {
    bindObserver()
    resetAndLoad()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  watch(
    () => [sentinelEl.value, opts.scrollRoot?.value] as const,
    () => bindObserver()
  )

  if (opts.resetKey) {
    watch(opts.resetKey, () => {
      resetAndLoad()
    })
  }

  return {
    items,
    page,
    hasMore,
    loading,
    error,
    total,
    sentinelEl,
    loadMore,
    resetAndLoad,
  }
}
