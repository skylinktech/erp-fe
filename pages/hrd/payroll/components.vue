<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Master komponen gaji. Formula hanya dieksekusi backend, bukan di browser.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !tableRows.length" />
      <CollapsibleFilterCard title="Filter Component" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="3">
          <FilterField>
            <label class="form-label">Type</label>
            <CustomSelect2 v-model="cardFilters.type" :options="typeOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua type" />
          </FilterField>
          <FilterField>
            <label class="form-label">Method</label>
            <CustomSelect2 v-model="cardFilters.method" :options="methodFilterOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua method" />
          </FilterField>
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2 v-model="cardFilters.status" :options="activeOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua status" />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari kode atau nama..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData('Salary Components')"
        >
          <template #add>
            <button v-if="canManageComponent" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Tambah Component
            </button>
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
            :globalFilterFields="['code', 'name', 'componentType', 'calculationMethod', 'taxableLabel', 'statusLabel']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column field="code" header="Code" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari kode" /></template>
            </Column>
            <Column field="name" header="Name" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari nama" /></template>
            </Column>
            <Column field="componentType" header="Type" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'componentType')" /></template>
            </Column>
            <Column field="calculationMethod" header="Method" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'calculationMethod')" /></template>
            </Column>
            <Column field="taxableLabel" header="Taxable" class="d-none d-xl-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Ya', 'Tidak']" /></template>
            </Column>
            <Column field="effectiveFromDisplay" header="Effective" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column field="statusLabel" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.isActive === false ? 'CANCELLED' : 'APPROVED'" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Aktif', 'Nonaktif']" /></template>
            </Column>
            <Column header="Action" class="text-end" :showFilterMenu="false">
              <template #body="{ data }">
                <PayrollSalaryComponentRowActions :row="data" @edit="openEdit" @delete="confirmDelete" />
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>

      <PayrollSalaryComponentFormModal v-model="showModal" :edit-row="editRow" @saved="onSaved" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Swal from 'sweetalert2'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import PayrollColumnFilter from '~/components/payroll/PayrollColumnFilter.vue'
import PayrollSalaryComponentFormModal from '~/components/payroll/PayrollSalaryComponentFormModal.vue'
import PayrollSalaryComponentRowActions from '~/components/payroll/PayrollSalaryComponentRowActions.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Salary Components', middleware: ['auth', 'check-permission'], alias: '/payroll/components' })

const store = usePayrollStore()
const { canManageComponent } = usePayrollPermissions()
const { formatDate } = usePayrollStatus()
const showModal = ref(false)
const editRow = ref<Record<string, unknown> | null>(null)

const { pageRows, globalFilterValue, filters, myDataTableRef, exportData, uniqueValues } = usePayrollClientTable([
  'code',
  'name',
  { field: 'componentType', mode: 'equals' },
  { field: 'calculationMethod', mode: 'equals' },
  { field: 'taxableLabel', mode: 'equals' },
  'effectiveFromDisplay',
  { field: 'statusLabel', mode: 'equals' },
])
const cardFilters = reactive({ type: null as string | null, method: null as string | null, status: null as string | null })
const typeOptions = [
  { label: 'Earning', value: 'EARNING' },
  { label: 'Deduction', value: 'DEDUCTION' },
  { label: 'Employer Contribution', value: 'EMPLOYER_CONTRIBUTION' },
  { label: 'Information', value: 'INFORMATION' },
]
const activeOptions = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]
const methodFilterOptions = computed(() =>
  ['FIXED', 'FORMULA', 'ATTENDANCE', 'OVERTIME', 'VARIABLE', 'TAX', 'BPJS', 'SYSTEM'].map((m) => ({ label: m, value: m }))
)
const tableRows = computed(() =>
  store.components.map((row) => {
    const isActive = row.isActive !== false
    return {
      ...row,
      componentType: String(row.componentType || row.component_type || ''),
      calculationMethod: String(row.calculationMethod || row.calculation_method || ''),
      taxableLabel: row.taxable ? 'Ya' : 'Tidak',
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      statusLabel: isActive ? 'Aktif' : 'Nonaktif',
      isActive,
    }
  })
)
const displayRows = computed(() =>
  tableRows.value.filter((row) => {
    if (cardFilters.type && row.componentType !== cardFilters.type) return false
    if (cardFilters.method && row.calculationMethod !== cardFilters.method) return false
    if (cardFilters.status && row.statusLabel !== cardFilters.status) return false
    return true
  })
)
const hasActiveFilters = computed(() => Boolean(cardFilters.type || cardFilters.method || cardFilters.status))
function resetFilters() {
  cardFilters.type = null
  cardFilters.method = null
  cardFilters.status = null
}
const rows = computed(() => tableRows.value)
const statItems = computed<ListPageStatItem[]>(() => {
  const list = rows.value
  const typeOf = (r: Record<string, unknown>) => String(r.componentType || r.component_type || '')
  return [
    { label: 'Total', value: list.length, icon: 'ri-price-tag-3-line', iconBgClass: 'bg-label-primary' },
    { label: 'Earning', value: list.filter((r) => typeOf(r) === 'EARNING').length, icon: 'ri-add-circle-line', iconBgClass: 'bg-label-success' },
    { label: 'Deduction', value: list.filter((r) => typeOf(r) === 'DEDUCTION').length, icon: 'ri-indeterminate-circle-line', iconBgClass: 'bg-label-warning' },
    { label: 'Aktif', value: list.filter((r) => r.isActive !== false).length, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-info' },
  ]
})

function openCreate() {
  editRow.value = null
  showModal.value = true
}

function openEdit(row: Record<string, unknown>) {
  editRow.value = row
  showModal.value = true
}

function onSaved() {
  editRow.value = null
}

async function confirmDelete(row: Record<string, unknown>) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Salary Component?',
    html: `Komponen <strong>${row.code}</strong> — ${row.name} akan dihapus.<br><small class="text-muted">Jika masih dipakai di structure, komponen akan dinonaktifkan saja.</small>`,
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
    buttonsStyling: false,
  })
  if (!result.isConfirmed) return
  await store.deleteComponent(String(row.id))
}

onMounted(() => store.fetchMasters())
</script>
