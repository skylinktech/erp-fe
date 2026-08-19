<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Profil payroll employee: struktur, metode pajak, BPJS, dan metode pembayaran.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !tableRows.length" />
      <CollapsibleFilterCard title="Filter Profile" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="3">
          <FilterField>
            <label class="form-label">Tax Method</label>
            <CustomSelect2 v-model="cardFilters.taxMethod" :options="taxMethodOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua" />
          </FilterField>
          <FilterField>
            <label class="form-label">Payment</label>
            <CustomSelect2 v-model="cardFilters.paymentMethod" :options="paymentMethodOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua" />
          </FilterField>
          <FilterField>
            <label class="form-label">Eligible</label>
            <CustomSelect2 v-model="cardFilters.eligible" :options="eligibleOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua" />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari pegawai, tax method..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData('Payroll Profiles')"
        >
          <template #add>
            <button v-if="canManageProfile" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Tambah Profile
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
            :globalFilterFields="['pegawaiLabel', 'eligibleLabel', 'taxMethod', 'paymentMethod', 'status']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column field="eligibleLabel" header="Eligible" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Ya', 'Tidak']" /></template>
            </Column>
            <Column field="taxMethod" header="Tax Method" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['GROSS', 'NET', 'GROSS_UP']" /></template>
            </Column>
            <Column field="paymentMethod" header="Payment" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'paymentMethod')" /></template>
            </Column>
            <Column field="effectiveFromDisplay" header="Effective" class="d-none d-xl-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column field="status" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'status')" /></template>
            </Column>
          </MyDataTable>
        </div>
      </div>
      <Modal id="payrollProfileModal" v-model="showModal" title="Employee Payroll Profile" dialog-class="modal-lg">
        <form @submit.prevent="submit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.pegawai_id" :options="pegawaiOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.perusahaan_id" :options="perusahaanOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Salary Structure</label>
              <CustomSelect2 v-model="form.salary_structure_id" :options="structureOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable />
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
              <label class="form-label">Payment Method</label>
              <select v-model="form.payment_method" class="form-select">
                <option value="PAYROLL_BANK">PAYROLL_BANK</option>
                <option value="MANUAL">MANUAL</option>
                <option value="EXTERNAL">EXTERNAL</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="form.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6 form-check mt-4">
              <input id="eligible" v-model="form.payroll_eligible" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="eligible">Payroll eligible</label>
            </div>
            <div class="col-md-6 form-check mt-4">
              <input id="bpjs-h" v-model="form.bpjs_health_active" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="bpjs-h">BPJS Kesehatan</label>
            </div>
            <div class="col-md-6 form-check mt-4">
              <input id="bpjs-e" v-model="form.bpjs_employment_active" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="bpjs-e">BPJS Ketenagakerjaan</label>
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

definePageMeta({ title: 'Payroll Profiles', middleware: ['auth', 'check-permission'], alias: '/payroll/profiles' })

const store = usePayrollStore()
const { canManageProfile } = usePayrollPermissions()
const { formatDate } = usePayrollStatus()
const { pegawaiOptions, perusahaanOptions, fetchPegawaiOptions, fetchPerusahaanOptions } = usePayrollLookups()
const showModal = ref(false)
const saving = ref(false)
const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  pegawai_id: null as number | null,
  perusahaan_id: null as number | null,
  salary_structure_id: null as string | null,
  tax_method: 'GROSS',
  payment_method: 'PAYROLL_BANK',
  payroll_eligible: true,
  bpjs_health_active: true,
  bpjs_employment_active: true,
  effective_from: today,
})
const { pageRows, globalFilterValue, filters, myDataTableRef, exportData, uniqueValues } = usePayrollClientTable([
  'pegawaiLabel',
  { field: 'eligibleLabel', mode: 'equals' },
  { field: 'taxMethod', mode: 'equals' },
  { field: 'paymentMethod', mode: 'equals' },
  'effectiveFromDisplay',
  { field: 'status', mode: 'equals' },
])
const cardFilters = reactive({
  taxMethod: null as string | null,
  paymentMethod: null as string | null,
  eligible: null as string | null,
})
const taxMethodOptions = [
  { label: 'GROSS', value: 'GROSS' },
  { label: 'NET', value: 'NET' },
  { label: 'GROSS_UP', value: 'GROSS_UP' },
]
const paymentMethodOptions = [
  { label: 'PAYROLL_BANK', value: 'PAYROLL_BANK' },
  { label: 'MANUAL', value: 'MANUAL' },
  { label: 'EXTERNAL', value: 'EXTERNAL' },
]
const eligibleOptions = [
  { label: 'Ya', value: 'Ya' },
  { label: 'Tidak', value: 'Tidak' },
]
const rows = computed(() => store.profiles)
const structureOptions = computed(() =>
  store.structures.map((s) => ({ label: `${s.code} — ${s.name}`, value: s.id }))
)
function pegawaiLabel(id: unknown) {
  return pegawaiOptions.value.find((o) => Number(o.value) === Number(id))?.label || String(id || '—')
}
const tableRows = computed(() =>
  store.profiles.map((row) => {
    const eligible = Boolean(row.payrollEligible ?? row.payroll_eligible)
    return {
      ...row,
      pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
      eligibleLabel: eligible ? 'Ya' : 'Tidak',
      taxMethod: String(row.taxMethod || row.tax_method || ''),
      paymentMethod: String(row.paymentMethod || row.payment_method || ''),
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      status: String(row.status || ''),
    }
  })
)
const displayRows = computed(() =>
  tableRows.value.filter((row) => {
    if (cardFilters.taxMethod && row.taxMethod !== cardFilters.taxMethod) return false
    if (cardFilters.paymentMethod && row.paymentMethod !== cardFilters.paymentMethod) return false
    if (cardFilters.eligible && row.eligibleLabel !== cardFilters.eligible) return false
    return true
  })
)
const hasActiveFilters = computed(() => Boolean(cardFilters.taxMethod || cardFilters.paymentMethod || cardFilters.eligible))
function resetFilters() {
  cardFilters.taxMethod = null
  cardFilters.paymentMethod = null
  cardFilters.eligible = null
}
const statItems = computed<ListPageStatItem[]>(() => {
  const list = rows.value
  return [
    { label: 'Total', value: list.length, icon: 'ri-user-settings-line', iconBgClass: 'bg-label-primary' },
    { label: 'Eligible', value: list.filter((r) => r.payrollEligible ?? r.payroll_eligible).length, icon: 'ri-user-follow-line', iconBgClass: 'bg-label-success' },
    { label: 'GROSS', value: list.filter((r) => String(r.taxMethod || r.tax_method) === 'GROSS').length, icon: 'ri-percent-line', iconBgClass: 'bg-label-info' },
    { label: 'NET / GROSS_UP', value: list.filter((r) => ['NET', 'GROSS_UP'].includes(String(r.taxMethod || r.tax_method))).length, icon: 'ri-exchange-line', iconBgClass: 'bg-label-warning' },
  ]
})

async function openCreate() {
  await Promise.all([fetchPegawaiOptions(), fetchPerusahaanOptions(), store.fetchMasters()])
  showModal.value = true
}

async function submit() {
  saving.value = true
  const ok = await store.saveProfile({ ...form })
  saving.value = false
  if (ok) showModal.value = false
}

onMounted(async () => {
  await Promise.all([store.fetchMasters(), fetchPegawaiOptions()])
})
</script>
