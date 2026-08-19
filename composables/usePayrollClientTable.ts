import { FilterMatchMode } from '@primevue/core/api'
import { useDebounceFn } from '@vueuse/core'

type FieldMode = 'contains' | 'equals'
type FieldInput = string | { field: string; mode?: FieldMode }

export function usePayrollClientTable(fields: FieldInput[]) {
  const pageRows = ref(10)
  const globalFilterValue = ref('')
  const myDataTableRef = ref<{ exportCSV: (options?: Record<string, unknown>) => void } | null>(null)

  const columnFilters = Object.fromEntries(
    fields.map((item) => {
      const field = typeof item === 'string' ? item : item.field
      const mode = typeof item === 'string' ? 'contains' : item.mode || 'contains'
      return [
        field,
        {
          value: null as string | null,
          matchMode: mode === 'equals' ? FilterMatchMode.EQUALS : FilterMatchMode.CONTAINS,
        },
      ]
    })
  )

  const filters = ref({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    ...columnFilters,
  })

  const applySearch = useDebounceFn((value: string) => {
    filters.value.global.value = value || null
  }, 300)
  watch(globalFilterValue, (value) => applySearch(value))

  function exportData(title: string) {
    myDataTableRef.value?.exportCSV({ title })
  }

  function uniqueValues(rows: Array<Record<string, unknown>>, field: string) {
    return [...new Set(rows.map((row) => row[field]).filter((value) => value != null && value !== '' && value !== '—'))]
      .map(String)
      .sort()
  }

  function uniqueOptions(
    rows: Array<Record<string, unknown>>,
    field: string,
    labels?: Record<string, string>
  ) {
    return uniqueValues(rows, field).map((value) => ({ label: labels?.[value] || value, value }))
  }

  return {
    pageRows,
    globalFilterValue,
    filters,
    myDataTableRef,
    exportData,
    uniqueValues,
    uniqueOptions,
  }
}
