<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Payment batch gaji. Item PAID tidak ditransfer ulang saat retry.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loadingStats && !store.paymentStats" />
      <CollapsibleFilterCard title="Filter Payment" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="1">
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2
              v-model="status"
              :options="statusOptions"
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
          search-placeholder="Cari batch, run, status..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="onRowsChange"
          @update:search="(v) => { search = v }"
          @export="exportData"
        >
          <template #add>
            <button v-if="canCreatePayment" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Buat Payment Batch
            </button>
          </template>
        </ListPageTableHeader>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="columnFilters"
            :data="store.payments"
            :rows="rows"
            :loading="store.loading"
            :totalRecords="store.paymentTotal"
            :first="store.paymentParams.first"
            :lazy="true"
            filterDisplay="row"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
            @page="onPage"
          >
            <Column field="batchSearch" header="Batch" :showFilterMenu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/payroll/payments/${data.id}`">#{{ data.id }}</NuxtLink>
              </template>
              <template #filter>
                <InputText v-model="search" placeholder="Cari batch..." class="p-column-filter w-100" />
              </template>
            </Column>
            <Column header="Run" class="d-none d-md-table-cell"><template #body="{ data }">{{ data.payrollRunId || data.payroll_run_id }}</template></Column>
            <Column header="Items" class="d-none d-lg-table-cell"><template #body="{ data }">{{ data.totalItems ?? data.total_items }}</template></Column>
            <Column header="Amount" class="text-end"><template #body="{ data }">{{ money(data.totalAmount ?? data.total_amount) }}</template></Column>
            <Column field="status" header="Status" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter>
                <Dropdown
                  v-model="status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                />
              </template>
            </Column>
            <Column header="Tanggal" class="d-none d-lg-table-cell"><template #body="{ data }">{{ formatDate(data.paymentDate || data.payment_date) }}</template></Column>
          </MyDataTable>
        </div>
      </div>
      <Modal id="payrollPaymentModal" v-model="showModal" title="Buat Payment Batch" description="Payroll Run harus sudah POSTED.">
        <form @submit.prevent="create">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Payroll Run <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="form.payroll_run_id"
                :options="postedRunOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                placeholder="Pilih run posted"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Bank Account <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="form.bank_account_id"
                :options="bankAccountOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                placeholder="Pilih rekening"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Payment Date <span class="text-danger">*</span></label>
              <input v-model="form.payment_date" type="date" class="form-control" required />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
            <button class="btn btn-primary" :disabled="saving || !form.payroll_run_id || !form.bank_account_id">Buat</button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { PAYROLL_CONFIRM, PAYROLL_RUN_STATUS } from '~/constants/payroll'

definePageMeta({ title: 'Payroll Payment', middleware: ['auth', 'check-permission'], alias: '/payroll/payments' })

const store = usePayrollStore()
const route = useRoute()
const { canCreatePayment } = usePayrollPermissions()
const { money, formatDate, runLabel } = usePayrollStatus()
const { bankAccountOptions, fetchBankAccounts } = usePayrollLookups()
const myDataTableRef = ref<{ exportCSV: (options?: Record<string, unknown>) => void } | null>(null)
const showModal = ref(false)
const saving = ref(false)
const rows = ref(20)
const search = ref('')
const status = ref<string | null>(null)
const statusOptions = [
  { label: 'Ready', value: 'READY' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Failed', value: 'FAILED' },
]
const columnFilters = ref({
  batchSearch: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
})
const hasActiveFilters = computed(() => Boolean(status.value))
const form = reactive({
  payroll_run_id: (String(route.query.run_id || '').trim() || null) as string | null,
  bank_account_id: '' as string,
  payment_date: new Date().toISOString().slice(0, 10),
})

const postedRunOptions = computed(() =>
  store.runs
    .filter((r) => {
      const s = String(r.status)
      return (
        s === PAYROLL_RUN_STATUS.POSTED ||
        s === PAYROLL_RUN_STATUS.PAYMENT_PROCESSING ||
        s === PAYROLL_RUN_STATUS.PARTIALLY_PAID
      )
    })
    .map((r) => ({ label: `${runLabel(r)} — ${r.period?.name || r.status}`, value: r.id }))
)

const statItems = computed<ListPageStatItem[]>(() => {
  const s = store.paymentStats || {}
  return [
    { label: 'Total', value: s.total ?? 0, icon: 'ri-bank-card-line', iconBgClass: 'bg-label-primary' },
    { label: 'Ready', value: s.ready ?? 0, icon: 'ri-time-line', iconBgClass: 'bg-label-info' },
    { label: 'Partial', value: s.partiallyPaid ?? 0, icon: 'ri-error-warning-line', iconBgClass: 'bg-label-warning' },
    { label: 'Paid', value: s.paid ?? 0, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
  ]
})

function query() {
  return {
    page: store.paymentParams.page,
    per_page: rows.value,
    run_id: route.query.run_id,
    status: status.value,
    search: search.value,
  }
}
function reload() {
  store.paymentParams.page = 1
  store.fetchPayments(query())
  store.fetchListStats('payments', { run_id: route.query.run_id })
}
function resetFilters() {
  status.value = null
  search.value = ''
}
function onRowsChange(value: number) {
  rows.value = value
  reload()
}
function onPage(e: { page?: number; rows?: number }) {
  store.paymentParams.page = (e.page ?? 0) + 1
  rows.value = e.rows || rows.value
  store.fetchPayments(query())
}
function exportData() {
  myDataTableRef.value?.exportCSV({ title: 'Payroll Payments' })
}

watch(status, reload)
watch(search, useDebounceFn(() => {
  store.paymentParams.page = 1
  store.fetchPayments(query())
}, 400))

async function openCreate() {
  await Promise.all([
    store.fetchRuns({ status: PAYROLL_RUN_STATUS.POSTED, per_page: 50 }),
    fetchBankAccounts(),
  ])
  if (route.query.run_id) form.payroll_run_id = String(route.query.run_id)
  showModal.value = true
}

async function create() {
  if (!form.payroll_run_id || !form.bank_account_id) return
  saving.value = true
  const ok = await store.confirmAction(PAYROLL_CONFIRM.payment)
  if (!ok) {
    saving.value = false
    return
  }
  const row = await store.createPayment({
    payroll_run_id: form.payroll_run_id,
    bank_account_id: form.bank_account_id,
    payment_date: form.payment_date,
  })
  saving.value = false
  if (row) {
    showModal.value = false
    await navigateTo(`/payroll/payments/${row.id}`)
  }
}

onMounted(() => {
  store.fetchPayments(query())
  store.fetchListStats('payments', { run_id: route.query.run_id })
})
</script>
