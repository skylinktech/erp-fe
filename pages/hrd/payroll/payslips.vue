<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Payslip immutable dari snapshot Payroll Run.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loadingStats && !store.payslipStats" />
      <CollapsibleFilterCard title="Filter Payslip" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="1">
          <FilterField>
            <label class="form-label">Payment Status</label>
            <CustomSelect2
              v-model="paymentStatus"
              :options="paymentStatusOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              searchable
              clearable
              placeholder="Semua status"
            />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="rows"
          :rows-options="[10, 20, 50, 100]"
          :search="search"
          search-placeholder="Cari nama karyawan..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="onRowsChange"
          @update:search="(v) => { search = v }"
          @export="exportData"
        />
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="columnFilters"
            :data="displayRows"
            :rows="rows"
            :loading="store.loading"
            :totalRecords="store.payslipTotal"
            :first="store.payslipParams.first"
            :lazy="true"
            filterDisplay="row"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
            @page="onPage"
          >
            <Column field="employeeName" header="Employee" :showFilterMenu="false">
              <template #body="{ data }">{{ employeeName(data) }}</template>
              <template #filter>
                <InputText v-model="search" placeholder="Cari nama..." class="p-column-filter w-100" />
              </template>
            </Column>
            <Column header="Periode" class="d-none d-md-table-cell"><template #body="{ data }">{{ data.run?.period?.name || '—' }}</template></Column>
            <Column header="Run" class="d-none d-lg-table-cell"><template #body="{ data }">{{ data.payrollRunId || data.payroll_run_id }}</template></Column>
            <Column header="Net" class="text-end"><template #body="{ data }">{{ money(data.netPayAmount || data.net_pay_amount) }}</template></Column>
            <Column field="paymentStatus" header="Payment" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.paymentStatus || data.payment_status" /></template>
              <template #filter>
                <Dropdown
                  v-model="paymentStatus"
                  :options="paymentStatusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                />
              </template>
            </Column>
            <Column header="Action" class="text-end" :showFilterMenu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/payroll/cetak-payslip?id=${data.id}`" class="btn btn-sm btn-outline-primary">Cetak</NuxtLink>
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
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Payslip', middleware: ['auth', 'check-permission'], alias: '/payroll/payslips' })

const store = usePayrollStore()
const { money } = usePayrollStatus()
const myDataTableRef = ref<{ exportCSV: (options?: Record<string, unknown>) => void } | null>(null)
const rows = ref(20)
const search = ref('')
const paymentStatus = ref<string | null>(null)
const paymentStatusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Failed', value: 'FAILED' },
]
const columnFilters = ref({
  employeeName: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  paymentStatus: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
})
const hasActiveFilters = computed(() => Boolean(paymentStatus.value))
const displayRows = computed(() => {
  if (!paymentStatus.value) return store.payslips
  return store.payslips.filter((row) => String(row.paymentStatus || row.payment_status) === paymentStatus.value)
})
const statItems = computed<ListPageStatItem[]>(() => {
  const s = store.payslipStats || {}
  return [
    { label: 'Total', value: s.total ?? 0, icon: 'ri-file-text-line', iconBgClass: 'bg-label-primary' },
    { label: 'Pending', value: s.pending ?? 0, icon: 'ri-time-line', iconBgClass: 'bg-label-warning' },
    { label: 'Paid', value: s.paid ?? 0, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
    { label: 'Failed', value: s.failed ?? 0, icon: 'ri-error-warning-line', iconBgClass: 'bg-label-danger' },
  ]
})

function employeeName(data: Record<string, any>) {
  return data.employeeSnapshot?.employee_name || data.employee_snapshot?.employee_name || '—'
}
function reload() {
  store.fetchPayslips({ page: 1, per_page: rows.value, search: search.value })
  store.fetchListStats('payslips')
}
function resetFilters() {
  paymentStatus.value = null
  search.value = ''
}
function onRowsChange(value: number) {
  rows.value = value
  reload()
}
function onPage(e: { page?: number }) {
  store.fetchPayslips({ page: (e.page ?? 0) + 1, per_page: rows.value, search: search.value })
}
function exportData() {
  myDataTableRef.value?.exportCSV({ title: 'Payslips' })
}

watch(search, useDebounceFn(reload, 500))
watch(paymentStatus, () => {
  /* client-side overlay on current page; search remains server-side */
})

onMounted(() => {
  store.fetchPayslips({ per_page: rows.value })
  store.fetchListStats('payslips')
})
</script>
