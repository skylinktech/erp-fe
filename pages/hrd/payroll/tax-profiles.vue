<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Tax profile employee (PTKP + metode). Rate PPh21 dikelola engine backend, bukan form rate bebas.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !tableRows.length" />
      <CollapsibleFilterCard title="Filter Tax Profile" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">PTKP</label>
            <CustomSelect2 v-model="cardFilters.ptkp" :options="ptkpFilterOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua PTKP" />
          </FilterField>
          <FilterField>
            <label class="form-label">Tax Method</label>
            <CustomSelect2 v-model="cardFilters.taxMethod" :options="taxMethodOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua method" />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari pegawai, PTKP..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData('Tax Profiles')"
        >
          <template #add>
            <button v-if="canManageTax" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Tambah Tax Profile
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
            :globalFilterFields="['pegawaiLabel', 'ptkpStatus', 'taxMethod']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column field="ptkpStatus" header="PTKP" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="ptkpOptions" /></template>
            </Column>
            <Column field="taxMethod" header="Method" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['GROSS', 'NET', 'GROSS_UP']" /></template>
            </Column>
            <Column field="effectiveFromDisplay" header="Effective From" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column field="effectiveToDisplay" header="Effective To" class="d-none d-xl-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
          </MyDataTable>
        </div>
      </div>
      <Modal id="payrollTaxModal" v-model="showModal" title="Employee Tax Profile" dialog-class="modal-lg">
        <form @submit.prevent="submit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.pegawai_id" :options="pegawaiOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">PTKP <span class="text-danger">*</span></label>
              <select v-model="form.ptkp_status" class="form-select" required>
                <option v-for="p in ptkpOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Tax Method</label>
              <select v-model="form.tax_method" class="form-select">
                <option value="GROSS">GROSS</option>
                <option value="NET">NET</option>
                <option value="GROSS_UP">GROSS_UP</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="form.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective To</label>
              <input v-model="form.effective_to" type="date" class="form-control" />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>
<script setup lang="ts">
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import PayrollColumnFilter from '~/components/payroll/PayrollColumnFilter.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Tax Profiles', middleware: ['auth', 'check-permission'], alias: '/payroll/tax-profiles' })

const store = usePayrollStore()
const { canManageTax } = usePayrollPermissions()
const { formatDate } = usePayrollStatus()
const { pegawaiOptions, fetchPegawaiOptions } = usePayrollLookups()
const showModal = ref(false)
const saving = ref(false)
const today = new Date().toISOString().slice(0, 10)
const ptkpOptions = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3']
const { pageRows, globalFilterValue, filters, myDataTableRef, exportData } = usePayrollClientTable([
  'pegawaiLabel',
  { field: 'ptkpStatus', mode: 'equals' },
  { field: 'taxMethod', mode: 'equals' },
  'effectiveFromDisplay',
  'effectiveToDisplay',
])
const cardFilters = reactive({ ptkp: null as string | null, taxMethod: null as string | null })
const ptkpFilterOptions = ptkpOptions.map((p) => ({ label: p, value: p }))
const taxMethodOptions = [
  { label: 'GROSS', value: 'GROSS' },
  { label: 'NET', value: 'NET' },
  { label: 'GROSS_UP', value: 'GROSS_UP' },
]
const form = reactive({
  pegawai_id: null as number | null,
  ptkp_status: 'TK/0',
  tax_method: 'GROSS',
  effective_from: today,
  effective_to: '',
})
const rows = computed(() => store.taxProfiles)
function pegawaiLabel(id: unknown) {
  return pegawaiOptions.value.find((o) => Number(o.value) === Number(id))?.label || String(id || '—')
}
const tableRows = computed(() =>
  store.taxProfiles.map((row) => ({
    ...row,
    pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
    ptkpStatus: String(row.ptkpStatus || row.ptkp_status || ''),
    taxMethod: String(row.taxMethod || row.tax_method || ''),
    effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
    effectiveToDisplay: formatDate(row.effectiveTo || row.effective_to) || '',
  }))
)
const displayRows = computed(() =>
  tableRows.value.filter((row) => {
    if (cardFilters.ptkp && row.ptkpStatus !== cardFilters.ptkp) return false
    if (cardFilters.taxMethod && row.taxMethod !== cardFilters.taxMethod) return false
    return true
  })
)
const hasActiveFilters = computed(() => Boolean(cardFilters.ptkp || cardFilters.taxMethod))
function resetFilters() {
  cardFilters.ptkp = null
  cardFilters.taxMethod = null
}
const statItems = computed<ListPageStatItem[]>(() => {
  const list = rows.value
  return [
    { label: 'Total', value: list.length, icon: 'ri-percent-line', iconBgClass: 'bg-label-primary' },
    { label: 'GROSS', value: list.filter((r) => String(r.taxMethod || r.tax_method) === 'GROSS').length, icon: 'ri-funds-line', iconBgClass: 'bg-label-info' },
    { label: 'NET', value: list.filter((r) => String(r.taxMethod || r.tax_method) === 'NET').length, icon: 'ri-wallet-3-line', iconBgClass: 'bg-label-success' },
    { label: 'GROSS_UP', value: list.filter((r) => String(r.taxMethod || r.tax_method) === 'GROSS_UP').length, icon: 'ri-arrow-up-circle-line', iconBgClass: 'bg-label-warning' },
  ]
})

async function openCreate() {
  await fetchPegawaiOptions()
  showModal.value = true
}
async function submit() {
  saving.value = true
  const ok = await store.saveTaxProfile({ ...form, effective_to: form.effective_to || null })
  saving.value = false
  if (ok) showModal.value = false
}
onMounted(async () => {
  await Promise.all([store.fetchMasters(), fetchPegawaiOptions()])
})
</script>
