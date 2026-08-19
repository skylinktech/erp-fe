<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Satu periode boleh punya beberapa Payroll Run (REGULAR, THR, BONUS, CORRECTION).</p>

      <ListPageStatsCards :items="statItems" :loading="store.loadingStats && !store.runStats" />

      <CollapsibleFilterCard title="Filter Payroll Run" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <div class="row g-4">
          <div class="col-md-4">
            <FilterField>
              <label class="form-label">Periode</label>
              <CustomSelect2
                v-model="filters.periodId"
                :options="periodOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Periode"
              />
            </FilterField>
          </div>
          <div class="col-md-4">
            <FilterField>
              <label class="form-label">Tipe</label>
              <CustomSelect2
                v-model="filters.runType"
                :options="PAYROLL_RUN_TYPE_OPTIONS"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Tipe"
              />
            </FilterField>
          </div>
          <div class="col-md-4">
            <FilterField>
              <label class="form-label">Status</label>
              <CustomSelect2
                v-model="filters.status"
                :options="PAYROLL_RUN_STATUS_OPTIONS"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Status"
              />
            </FilterField>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div class="card">
        <ListPageTableHeader
          :rows="rows"
          :rows-options="[10, 20, 50, 100]"
          :search="search"
          search-placeholder="Cari nomor run, periode, status..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="onRowsChange"
          @update:search="(v) => { search = v }"
          @export="exportData"
        >
          <template #add>
            <NuxtLink v-if="canCalculate" to="/payroll/runs/create" class="btn btn-primary">
              <i class="ri-add-line me-1"></i>Buat Payroll Run
            </NuxtLink>
          </template>
        </ListPageTableHeader>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="columnFilters"
            :data="store.runs"
            :rows="rows"
            :loading="store.loading"
            :totalRecords="store.runTotal"
            :first="store.runParams.first"
            :lazy="true"
            filterDisplay="row"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
            @page="onPage"
          >
            <Column field="runSearch" header="Run" class="text-nowrap" :showFilterMenu="false">
              <template #body="{ data }">
                <a class="text-primary" style="cursor:pointer;text-decoration:underline" @click="navigateTo(`/payroll/runs/${data.id}`)">
                  {{ runLabel(data) }}
                </a>
              </template>
              <template #filter>
                <InputText v-model="search" placeholder="Cari run..." class="p-column-filter w-100" />
              </template>
            </Column>
            <Column field="periodId" header="Periode" class="d-none d-md-table-cell" :showFilterMenu="false">
              <template #body="{ data }">{{ data.period?.name || data.period?.code || '—' }}</template>
              <template #filter>
                <Dropdown
                  v-model="filters.periodId"
                  :options="periodOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                />
              </template>
            </Column>
            <Column field="runType" header="Tipe" class="d-none d-lg-table-cell" :showFilterMenu="false">
              <template #body="{ data }">{{ runTypeLabel(data.runType || data.run_type) }}</template>
              <template #filter>
                <Dropdown
                  v-model="filters.runType"
                  :options="PAYROLL_RUN_TYPE_OPTIONS"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                />
              </template>
            </Column>
            <Column header="Employees" class="d-none d-xl-table-cell">
              <template #body="{ data }">{{ data.employeeCount ?? data.employee_count ?? 0 }}</template>
            </Column>
            <Column header="Gross" class="d-none d-xl-table-cell text-end">
              <template #body="{ data }">{{ canViewDetail ? money(data.grossTotal ?? data.gross_total) : '—' }}</template>
            </Column>
            <Column header="Net" class="text-end">
              <template #body="{ data }">{{ canViewDetail ? money(data.netTotal ?? data.net_total) : '—' }}</template>
            </Column>
            <Column field="status" header="Status" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter>
                <Dropdown
                  v-model="filters.status"
                  :options="PAYROLL_RUN_STATUS_OPTIONS"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                />
              </template>
            </Column>
            <Column header="Dibuat" class="d-none d-lg-table-cell">
              <template #body="{ data }">{{ formatDate(data.createdAt || data.created_at) }}</template>
            </Column>
            <Column header="Action" class="text-end" :showFilterMenu="false">
              <template #body="{ data }">
                <PayrollRunActions :run="data" layout="dropdown" @action="(key) => onAction(data, key)" />
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterField from '~/components/list/FilterField.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { PAYROLL_CONFIRM, PAYROLL_RUN_STATUS_OPTIONS, PAYROLL_RUN_TYPE_OPTIONS } from '~/constants/payroll'
import Swal from 'sweetalert2'

definePageMeta({
  title: 'Payroll Runs',
  middleware: ['auth', 'check-permission'],
  alias: '/payroll/runs',
})

const store = usePayrollStore()
const { canCalculate, canViewDetail } = usePayrollPermissions()
const { money, runTypeLabel, runLabel, formatDate } = usePayrollStatus()
const myDataTableRef = ref<{ exportCSV: (options?: Record<string, unknown>) => void } | null>(null)
const rows = ref(20)
const search = ref('')
const filters = ref<{ periodId: string | null; runType: string | null; status: string | null }>({
  periodId: null,
  runType: null,
  status: null,
})
const columnFilters = ref({
  runSearch: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  periodId: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  runType: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
})

const periodOptions = computed(() => store.periods.map((p) => ({ label: p.name || p.code || `#${p.id}`, value: p.id })))
const hasActiveFilters = computed(() => Boolean(filters.value.periodId || filters.value.runType || filters.value.status))
const statItems = computed<ListPageStatItem[]>(() => {
  const s = store.runStats || {}
  return [
    { label: 'Total', value: s.total ?? 0, icon: 'ri-file-list-3-line', iconBgClass: 'bg-label-primary' },
    { label: 'Draft', value: s.draft ?? 0, icon: 'ri-draft-line', iconBgClass: 'bg-label-secondary' },
    { label: 'Review', value: s.review ?? 0, icon: 'ri-eye-line', iconBgClass: 'bg-label-info' },
    { label: 'Submitted', value: s.submitted ?? 0, icon: 'ri-time-line', iconBgClass: 'bg-label-warning' },
    { label: 'Posted', value: s.posted ?? 0, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
  ]
})

function query() {
  return {
    page: store.runParams.page,
    per_page: rows.value,
    period_id: filters.value.periodId,
    run_type: filters.value.runType,
    status: filters.value.status,
    search: search.value,
  }
}
function reload() {
  store.runParams.page = 1
  store.fetchRuns(query())
  store.fetchListStats('runs', { period_id: filters.value.periodId, run_type: filters.value.runType })
}
function resetFilters() {
  filters.value = { periodId: null, runType: null, status: null }
  search.value = ''
}
function onRowsChange(value: number) {
  rows.value = value
  reload()
}
function onPage(e: { page?: number; first?: number; rows?: number }) {
  store.runParams.page = (e.page ?? 0) + 1
  rows.value = e.rows || rows.value
  store.fetchRuns(query())
}
function exportData() {
  myDataTableRef.value?.exportCSV({ title: 'Payroll Runs' })
}

async function onAction(run: any, key: string) {
  if (key === 'view') return navigateTo(`/payroll/runs/${run.id}`)
  if (key === 'payment') return navigateTo(`/payroll/payments?run_id=${run.id}`)
  const map: Record<string, 'calculate' | 'recalculate' | 'submit' | 'approve' | 'reject' | 'post'> = {
    calculate: 'calculate',
    recalculate: 'recalculate',
    submit: 'submit',
    approve: 'approve',
    reject: 'reject',
    post: 'post',
  }
  const action = map[key]
  if (!action) return
  if (action === 'reject') {
    const { value, isConfirmed } = await Swal.fire({
      title: 'Tolak Payroll',
      input: 'textarea',
      inputLabel: 'Catatan',
      showCancelButton: true,
      confirmButtonText: 'Tolak',
      cancelButtonText: 'Batal',
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
    })
    if (!isConfirmed) return
    await store.runAction(run.id, 'reject', { remarks: value })
  } else {
    await store.runAction(run.id, action, { confirm: PAYROLL_CONFIRM[action as keyof typeof PAYROLL_CONFIRM] })
  }
  await store.fetchRuns(query())
}

watch(filters, reload, { deep: true })
watch(search, useDebounceFn(() => {
  store.runParams.page = 1
  store.fetchRuns(query())
}, 400))

onMounted(async () => {
  await store.fetchPeriods()
  await Promise.all([
    store.fetchRuns(query()),
    store.fetchListStats('runs', { period_id: filters.value.periodId, run_type: filters.value.runType }),
  ])
})
</script>
