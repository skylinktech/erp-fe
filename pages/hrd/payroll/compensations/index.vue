<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Compensation menyimpan nominal aktual per pegawai. Versi ACTIVE tidak diedit di tempat — buat versi baru.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !tableRows.length" />
      <CollapsibleFilterCard title="Filter Compensation" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2 v-model="cardFilters.status" :options="statusOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua status" />
          </FilterField>
          <FilterField>
            <label class="form-label">Pegawai</label>
            <CustomSelect2 v-model="cardFilters.pegawaiId" :options="pegawaiOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua pegawai" />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari pegawai, structure, atau status..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData('Compensation')"
        >
          <template #add>
            <NuxtLink v-if="canManageCompensation" to="/payroll/compensations/create" class="btn btn-primary">
              <i class="ri-add-line me-1"></i>Tambah Compensation
            </NuxtLink>
          </template>
        </ListPageTableHeader>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="filters"
            :data="displayRows"
            :rows="pageRows"
            :loading="store.loading"
            :totalRecords="displayRows.length"
            :lazy="false"
            filterDisplay="row"
            :globalFilterFields="['pegawaiLabel', 'structureLabel', 'status']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column field="structureLabel" header="Structure" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari structure" /></template>
            </Column>
            <Column field="effectiveFromDisplay" header="Effective From" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column field="effectiveToDisplay" header="Effective To" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column field="fixedTotalDisplay" header="Fixed Total" class="d-none d-xl-table-cell text-end" :sortable="true" :showFilterMenu="false" />
            <Column field="status" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['DRAFT', 'ACTIVE', 'INACTIVE']" /></template>
            </Column>
            <Column header="Action" class="text-end" :showFilterMenu="false">
              <template #body="{ data }">
                <PayrollCompensationRowActions :row="data" />
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import PayrollColumnFilter from '~/components/payroll/PayrollColumnFilter.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Compensation', middleware: ['auth', 'check-permission'], alias: '/payroll/compensations' })

const store = usePayrollStore()
const { canManageCompensation } = usePayrollPermissions()
const { formatDate, money } = usePayrollStatus()
const { pegawaiOptions, fetchPegawaiOptions } = usePayrollLookups()
const { pageRows, globalFilterValue, filters, myDataTableRef, exportData } = usePayrollClientTable([
  'pegawaiLabel',
  'structureLabel',
  'effectiveFromDisplay',
  'effectiveToDisplay',
  { field: 'status', mode: 'equals' },
])
const cardFilters = reactive({ status: null as string | null, pegawaiId: null as number | null })
const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]
const rows = computed(() => store.compensations)
function pegawaiLabel(id: unknown) {
  return pegawaiOptions.value.find((o) => Number(o.value) === Number(id))?.label || String(id || '—')
}
const tableRows = computed(() =>
  store.compensations.map((row) => ({
    ...row,
    pegawaiId: row.pegawaiId || row.pegawai_id,
    pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
    structureLabel: String(row.structureName || row.structureCode || row.structure_name || row.structure_code || '—'),
    effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
    effectiveToDisplay: formatDate(row.effectiveTo || row.effective_to) || '',
    fixedTotalDisplay: money(row.fixedTotal ?? row.fixed_total ?? 0),
    lineCount: Number(row.lineCount ?? row.line_count ?? 0),
    status: String(row.status || ''),
  }))
)
const displayRows = computed(() =>
  tableRows.value.filter((row) => {
    if (cardFilters.status && row.status !== cardFilters.status) return false
    if (cardFilters.pegawaiId && Number(row.pegawaiId) !== Number(cardFilters.pegawaiId)) return false
    return true
  })
)
const hasActiveFilters = computed(() => Boolean(cardFilters.status || cardFilters.pegawaiId))
function resetFilters() {
  cardFilters.status = null
  cardFilters.pegawaiId = null
}
const statItems = computed<ListPageStatItem[]>(() => {
  const list = rows.value
  return [
    { label: 'Total', value: list.length, icon: 'ri-money-cny-circle-line', iconBgClass: 'bg-label-primary' },
    { label: 'Draft', value: list.filter((r) => String(r.status) === 'DRAFT').length, icon: 'ri-draft-line', iconBgClass: 'bg-label-secondary' },
    { label: 'Active', value: list.filter((r) => String(r.status) === 'ACTIVE').length, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
    { label: 'Inactive', value: list.filter((r) => !['DRAFT', 'ACTIVE'].includes(String(r.status))).length, icon: 'ri-stop-circle-line', iconBgClass: 'bg-label-warning' },
  ]
})

onMounted(async () => {
  await Promise.all([store.fetchMasters(), fetchPegawaiOptions()])
})
</script>
