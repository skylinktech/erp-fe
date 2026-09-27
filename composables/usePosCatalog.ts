import { computed, ref, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { readAccessToken } from '~/utils/authCookie'
import {
  shouldIgnoreStaleCatalog,
  type PosCatalogRow,
} from '~/utils/posCart'

/** Max products per POS catalog page (3×3 grid). */
const PAGE_SIZE = 9

/**
 * Server-paginated POS catalog with generation guard against stale responses.
 */
export function usePosCatalog(opts: {
  companyId: Ref<number | null | undefined>
  warehouseId: Ref<number | null>
  generation: Ref<number>
}) {
  const searchInput = ref('')
  const appliedSearch = ref('')
  const items = ref<PosCatalogRow[]>([])
  const page = ref(1)
  const lastPage = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')

  const canLoad = computed(() => !!opts.companyId.value)
  const hasMultiplePages = computed(() => lastPage.value > 1)

  function authHeaders(): Record<string, string> {
    const token = readAccessToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (opts.companyId.value) headers['X-Active-Company-Id'] = String(opts.companyId.value)
    return headers
  }

  async function fetchPage(targetPage: number) {
    if (!opts.companyId.value) {
      items.value = []
      total.value = 0
      return
    }
    const requestGeneration = opts.generation.value
    const requestSearch = appliedSearch.value
    const requestWarehouseId = opts.warehouseId.value
    const { $api } = useNuxtApp()
    const qs = new URLSearchParams({
      page: String(targetPage),
      rows: String(PAGE_SIZE),
      search: requestSearch,
      perusahaanId: String(opts.companyId.value),
    })
    if (requestWarehouseId) qs.set('warehouseId', String(requestWarehouseId))

    loading.value = true
    error.value = ''

    try {
      const res = await fetch(`${$api.directSaleCatalog()}?${qs}`, {
        headers: authHeaders(),
        credentials: 'include',
      })
      const payload = await res.json().catch(() => ({}))
      if (
        shouldIgnoreStaleCatalog(
          requestGeneration,
          opts.generation.value,
          requestSearch,
          appliedSearch.value,
          requestWarehouseId,
          opts.warehouseId.value
        )
      ) {
        return
      }
      if (!res.ok) {
        error.value = payload?.message || 'Gagal memuat katalog POS.'
        items.value = []
        return
      }
      const rows = Array.isArray(payload.data) ? (payload.data as PosCatalogRow[]) : []
      items.value = rows
      page.value = Number(payload.meta?.currentPage || targetPage)
      lastPage.value = Number(payload.meta?.lastPage || 1)
      total.value = Number(payload.meta?.total || rows.length)
    } catch (err: any) {
      if (
        shouldIgnoreStaleCatalog(
          requestGeneration,
          opts.generation.value,
          requestSearch,
          appliedSearch.value,
          requestWarehouseId,
          opts.warehouseId.value
        )
      ) {
        return
      }
      error.value = err?.message || 'Gagal memuat katalog POS.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function reload() {
    page.value = 1
    await fetchPage(1)
  }

  async function goToPage(nextPage: number) {
    const safe = Math.min(lastPage.value, Math.max(1, Number(nextPage) || 1))
    if (safe === page.value && items.value.length) {
      await fetchPage(safe)
      return
    }
    if (loading.value) return
    await fetchPage(safe)
  }

  function applySearch() {
    appliedSearch.value = searchInput.value.trim()
    void reload()
  }

  const debouncedSearch = useDebounceFn(() => {
    applySearch()
  }, 350)

  function onSearchInput() {
    debouncedSearch()
  }

  function clear() {
    items.value = []
    page.value = 1
    lastPage.value = 1
    total.value = 0
    error.value = ''
  }

  return {
    searchInput,
    appliedSearch,
    items,
    page,
    lastPage,
    total,
    loading,
    error,
    canLoad,
    hasMultiplePages,
    pageSize: PAGE_SIZE,
    reload,
    goToPage,
    applySearch,
    onSearchInput,
    clear,
  }
}
