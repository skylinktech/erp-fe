<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Input variabel (bonus, insentif, potongan) harus di-approve sebelum masuk Payroll Run.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loadingStats && !store.variableStats" />
      <CollapsibleFilterCard title="Filter Variable Input" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">Periode</label>
            <CustomSelect2 v-model="periodId" :options="periodOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Periode" />
          </FilterField>
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2 v-model="cardFilters.status" :options="statusOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua status" />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari pegawai, komponen, reason..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData('Variable Input')"
        >
          <template #add>
            <button v-if="canManageVariable" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Tambah
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
            :globalFilterFields="['pegawaiLabel', 'componentLabel', 'reason', 'status']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column field="pegawaiLabel" header="Employee" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column field="componentLabel" header="Component" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari komponen" /></template>
            </Column>
            <Column field="amount" header="Amount" class="text-end" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }">{{ money(data.amount) }}</template>
            </Column>
            <Column field="reason" header="Reason" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari reason" /></template>
            </Column>
            <Column field="status" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['DRAFT', 'APPROVED', 'REJECTED']" /></template>
            </Column>
            <Column header="Action" class="text-end" :showFilterMenu="false">
              <template #body="{ data }">
                <button v-if="canManageVariable && data.status === 'DRAFT'" class="btn btn-sm btn-outline-primary" @click="approve(data.id)">Approve</button>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
      <Modal id="payrollVariableModal" v-model="showModal" title="Variable Input" description="Komponen harus eligible sebagai variable input." dialog-class="modal-lg">
        <form @submit.prevent="submitCreate">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="form.pegawai_id"
                :options="pegawaiOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                placeholder="Pilih pegawai"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Periode <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.payroll_period_id" :options="periodOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Component <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.salary_component_id" :options="componentOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Amount <span class="text-danger">*</span></label>
              <input v-model.number="form.amount" type="number" class="form-control" required min="0" />
            </div>
            <div class="col-12">
              <label class="form-label">Reason <span class="text-danger">*</span></label>
              <textarea v-model="form.reason" class="form-control" required minlength="3" />
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
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import PayrollColumnFilter from '~/components/payroll/PayrollColumnFilter.vue'
import Modal from '~/components/modal/Modal.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { apiFetch } from '~/utils/apiFetch'
import { toastApiError } from '~/utils/apiError'

definePageMeta({ title: 'Variable Input', middleware: ['auth', 'check-permission'], alias: '/payroll/variable-inputs' })

const store = usePayrollStore()
const { canManageVariable } = usePayrollPermissions()
const { money } = usePayrollStatus()
const { $api } = useNuxtApp()
const toast = useToast()
const { pegawaiOptions, fetchPegawaiOptions } = usePayrollLookups()
const periodId = ref<string | null>(null)
const cardFilters = reactive({ status: null as string | null })
const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
]
const { pageRows, globalFilterValue, filters, myDataTableRef, exportData } = usePayrollClientTable([
  'pegawaiLabel',
  'componentLabel',
  'reason',
  { field: 'status', mode: 'equals' },
])
const showModal = ref(false)
const saving = ref(false)
const form = reactive({ pegawai_id: null as number | null, payroll_period_id: null as string | null, salary_component_id: null as string | null, amount: 0, reason: '' })
const rows = computed(() => store.variableInputs)
const periodOptions = computed(() => store.periods.map((p) => ({ label: p.name || p.code || `#${p.id}`, value: p.id })))
const componentOptions = computed(() =>
  store.components
    .filter((c) => String(c.calculationMethod || c.calculation_method || '').toUpperCase() === 'VARIABLE')
    .map((c) => ({ label: `${c.code} — ${c.name}`, value: c.id }))
)
function pegawaiLabel(id: unknown) {
  return pegawaiOptions.value.find((o) => Number(o.value) === Number(id))?.label || String(id || '—')
}
function componentLabel(id: unknown) {
  const c = store.components.find((row) => String(row.id) === String(id))
  return c ? `${c.code} — ${c.name}` : String(id || '—')
}
const tableRows = computed(() =>
  store.variableInputs.map((row) => ({
    ...row,
    pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
    componentLabel: componentLabel(row.salaryComponentId || row.salary_component_id),
    reason: row.reason || '',
    status: String(row.status || ''),
  }))
)
const displayRows = computed(() =>
  tableRows.value.filter((row) => {
    if (cardFilters.status && row.status !== cardFilters.status) return false
    return true
  })
)
const hasActiveFilters = computed(() => Boolean(periodId.value || cardFilters.status))
function resetFilters() {
  periodId.value = null
  cardFilters.status = null
}
const statItems = computed<ListPageStatItem[]>(() => {
  const s = store.variableStats || {}
  return [
    { label: 'Total', value: s.total ?? 0, icon: 'ri-list-check-2', iconBgClass: 'bg-label-primary' },
    { label: 'Draft', value: s.draft ?? 0, icon: 'ri-draft-line', iconBgClass: 'bg-label-secondary' },
    { label: 'Approved', value: s.approved ?? 0, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
    { label: 'Rejected', value: s.rejected ?? 0, icon: 'ri-close-circle-line', iconBgClass: 'bg-label-danger' },
  ]
})

function reload() {
  store.fetchVariableInputs(periodId.value)
  store.fetchListStats('variables', { payroll_period_id: periodId.value })
}

function openCreate() {
  form.payroll_period_id = periodId.value
  showModal.value = true
}

async function submitCreate() {
  saving.value = true
  try {
    await apiFetch($api.payrollVariableInputs(), { method: 'POST', credentials: 'include', body: { ...form } })
    toast.success({ title: 'Berhasil', message: 'Variable input dibuat.', color: 'green' })
    showModal.value = false
    await store.fetchVariableInputs(periodId.value)
    await store.fetchListStats('variables', { payroll_period_id: periodId.value })
  } catch (error) {
    toastApiError(error, 'Variable input gagal disimpan.')
  } finally {
    saving.value = false
  }
}

async function approve(id: string) {
  const ok = await store.confirmAction('Approve variable input ini?')
  if (!ok) return
  try {
    await apiFetch($api.payrollVariableApprove(id), { method: 'POST', credentials: 'include', body: {} })
    toast.success({ title: 'Berhasil', message: 'Variable input di-approve.', color: 'green' })
    await store.fetchVariableInputs(periodId.value)
    await store.fetchListStats('variables', { payroll_period_id: periodId.value })
  } catch (error) {
    toastApiError(error, 'Approve gagal.')
  }
}

watch(periodId, reload)
onMounted(async () => {
  await Promise.all([store.fetchPeriods(), store.fetchMasters(), fetchPegawaiOptions()])
  await reload()
})
</script>
