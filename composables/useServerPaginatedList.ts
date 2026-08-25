import { FilterMatchMode } from '@primevue/core/api'

export type ListExportColumn = {
  field: string
  header: string
  exportable?: boolean
}

export type ServerListMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  summary?: Record<string, number>
}

/**
 * Shared server-paginated list state for Inventory Phase 18 pages.
 * Keeps controllers thin on FE: one fetch path, debounced search, export helpers.
 */
export function useServerPaginatedList(options: {
  /** Build absolute API URL */
  endpoint: () => string
  /** Extra query params from page filters (reactive getter) */
  buildFilters?: () => Record<string, unknown>
  defaultRows?: number
  searchDebounceMs?: number
  /** When true, request includeSummary=1 for GROUP BY counts (anti-N+1) */
  includeSummary?: boolean
}) {
  const toast = useToast()
  const rows = ref<any[]>([])
  const loading = ref(false)
  const totalRecords = ref(0)
  const summary = ref<Record<string, number>>({})
  const globalFilterValue = ref('')
  const params = reactive({
    first: 0,
    rows: options.defaultRows ?? 10,
    page: 1,
    sortField: null as string | null,
    sortOrder: null as number | null,
  })
  const tableControls = reactive({
    rows: options.defaultRows ?? 10,
    search: '',
  })
  const rowsPerPageOptionsArray = [10, 25, 50, 100]

  /** PrimeVue column row-filters (client refine on current page) */
  const columnFilters = ref<Record<string, { value: unknown; matchMode: string }>>({})

  function initColumnFilters(fields: string[]) {
    const next: Record<string, { value: unknown; matchMode: string }> = {}
    for (const f of fields) {
      next[f] = { value: null, matchMode: FilterMatchMode.CONTAINS }
    }
    columnFilters.value = next
  }

  function parsePaginated(res: any): { data: any[]; meta: ServerListMeta } {
    const data = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : []
    const metaRaw = res?.meta || {}
    const total = Number(
      metaRaw.total ?? metaRaw.totalCount ?? metaRaw.total_count ?? data.length
    )
    return {
      data,
      meta: {
        total,
        perPage: Number(metaRaw.perPage ?? metaRaw.per_page ?? params.rows),
        currentPage: Number(metaRaw.currentPage ?? metaRaw.current_page ?? params.page),
        lastPage: Number(metaRaw.lastPage ?? metaRaw.last_page ?? 1),
        summary: metaRaw.summary || {},
      },
    }
  }

  async function fetchList(extra: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const query: Record<string, unknown> = {
        page: params.page,
        rows: params.rows,
        search: globalFilterValue.value || undefined,
        ...(options.includeSummary !== false ? { includeSummary: 1 } : {}),
        ...(options.buildFilters?.() || {}),
        ...extra,
      }
      // Drop empty filters
      for (const k of Object.keys(query)) {
        if (query[k] === '' || query[k] === null || query[k] === undefined) delete query[k]
      }

      const res = await $fetch(options.endpoint(), {
        credentials: 'include',
        query,
      })
      const parsed = parsePaginated(res)
      rows.value = parsed.data
      totalRecords.value = parsed.meta.total
      summary.value = parsed.meta.summary || {}
    } catch (e: any) {
      rows.value = []
      totalRecords.value = 0
      summary.value = {}
      const { getApiErrorMessage } = await import('~/utils/apiError')
      toast.error({
        title: 'Error',
        message: getApiErrorMessage(e, 'Gagal memuat data'),
        color: 'red',
        position: 'bottomRight',
      })
    } finally {
      loading.value = false
    }
  }

  function onPage(event: { first: number; rows: number }) {
    params.first = event.first
    params.rows = event.rows
    params.page = Math.floor(event.first / event.rows) + 1
    tableControls.rows = event.rows
    fetchList()
  }

  function onToolbarRows(value: number) {
    const rowsN = Number(value) || 10
    params.rows = rowsN
    params.first = 0
    params.page = 1
    tableControls.rows = rowsN
    fetchList()
  }

  function onSort(event: { sortField?: string; sortOrder?: number }) {
    params.sortField = event.sortField || null
    params.sortOrder = event.sortOrder ?? null
    fetchList({
      sortField: params.sortField || undefined,
      sortOrder: params.sortOrder ?? undefined,
    })
  }

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  function onSearchUpdate(value: string) {
    globalFilterValue.value = value ?? ''
    tableControls.search = globalFilterValue.value
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      params.first = 0
      params.page = 1
      fetchList()
    }, options.searchDebounceMs ?? 400)
  }

  function reload() {
    params.first = 0
    params.page = 1
    return fetchList()
  }

  /** Fetch all matching rows for export (clamped). */
  async function fetchAllForExport(maxRows = 5000) {
    const query: Record<string, unknown> = {
      page: 1,
      rows: maxRows,
      search: globalFilterValue.value || undefined,
      ...(options.buildFilters?.() || {}),
    }
    for (const k of Object.keys(query)) {
      if (query[k] === '' || query[k] === null || query[k] === undefined) delete query[k]
    }
    const res = await $fetch(options.endpoint(), { credentials: 'include', query })
    return parsePaginated(res).data
  }

  async function exportData(
    format: string,
    myDataTableRef: { value: any },
    exportOpts: { title: string; columns?: ListExportColumn[] }
  ) {
    try {
      if (format === 'csv') {
        myDataTableRef.value?.exportCSV?.({ title: exportOpts.title, border: true })
        return
      }
      if (format === 'excel') {
        const data = await fetchAllForExport()
        if (myDataTableRef.value?.exportExcel) {
          await myDataTableRef.value.exportExcel({ title: exportOpts.title, data })
        } else {
          const { useExcelExport } = await import('~/composables/useExcelExport')
          const { exportToExcel } = useExcelExport()
          await exportToExcel(data, exportOpts.columns || [], {
            title: exportOpts.title,
            filename: `${exportOpts.title.replace(/\s+/g, '_').toLowerCase()}.xlsx`,
          })
        }
        return
      }
      if (format === 'pdf') {
        toast.info?.({
          title: 'Export PDF',
          message: 'Gunakan Excel/CSV untuk export lengkap, atau cetak dari browser.',
          color: 'blue',
          position: 'bottomRight',
        }) ||
          toast.success({
            title: 'Info',
            message: 'Export PDF: gunakan Excel/CSV untuk data lengkap.',
            color: 'green',
            position: 'bottomRight',
          })
      }
    } catch (e: any) {
      const { getApiErrorMessage } = await import('~/utils/apiError')
      toast.error({
        title: 'Export gagal',
        message: getApiErrorMessage(e, 'Gagal export'),
        color: 'red',
        position: 'bottomRight',
      })
    }
  }

  function summaryCount(...keys: string[]) {
    return keys.reduce((sum, k) => sum + Number(summary.value[k] || 0), 0)
  }

  return {
    rows,
    loading,
    totalRecords,
    summary,
    summaryCount,
    globalFilterValue,
    params,
    tableControls,
    rowsPerPageOptionsArray,
    columnFilters,
    initColumnFilters,
    fetchList,
    reload,
    onPage,
    onToolbarRows,
    onSort,
    onSearchUpdate,
    fetchAllForExport,
    exportData,
  }
}
