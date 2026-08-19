<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary" /></div>
      <div v-else-if="!detail" class="alert alert-danger">Detail tidak ditemukan atau Anda tidak memiliki izin melihat kompensasi.</div>
      <template v-else>
        <div class="mb-4">
          <NuxtLink :to="`/payroll/runs/${runId}`" class="btn btn-outline-secondary btn-sm mb-2">
            <i class="ri-arrow-left-line me-1"></i>Kembali ke Run
          </NuxtLink>
          <h4 class="fw-semibold mb-1">{{ employeeName(employee) }}</h4>
          <PageBreadcrumb :current-label="employeeName(employee)" />
        </div>

        <ListPageStatsCards :items="statItems" />

        <div class="row g-4">
          <div class="col-lg-4">
            <div class="card mb-4">
              <div class="card-header"><h5 class="mb-0">Employee Snapshot</h5></div>
              <div class="card-body">
                <p class="mb-1"><span class="text-muted">NIK:</span> {{ snapshot.nik || '—' }}</p>
                <p class="mb-1"><span class="text-muted">Departemen:</span> {{ snapshot.department || '—' }}</p>
                <p class="mb-1"><span class="text-muted">Jabatan:</span> {{ snapshot.position || '—' }}</p>
                <p class="mb-1"><span class="text-muted">PTKP:</span> {{ snapshot.tax_profile?.ptkp || '—' }}</p>
                <p class="mb-0"><span class="text-muted">Bank:</span> {{ maskAccount(String(snapshot.bank_account || '')) }}</p>
              </div>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="card mb-4">
              <div class="card-header"><h5 class="mb-0">Earnings</h5></div>
              <div class="card-body"><PayrollComponentBreakdown :lines="earnings" /></div>
            </div>
            <div class="card mb-4">
              <div class="card-header"><h5 class="mb-0">Deductions</h5></div>
              <div class="card-body"><PayrollComponentBreakdown :lines="deductions" /></div>
            </div>
            <div class="card">
              <div class="card-header"><h5 class="mb-0">Employer Contribution</h5></div>
              <div class="card-body"><PayrollComponentBreakdown :lines="employer" /></div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PayrollEmployeeDetail, PayrollLine } from '~/types/payroll'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({
  title: 'Payroll Employee Detail',
  middleware: ['auth', 'check-permission'],
  alias: '/payroll/runs/:id/employees/:employeeId',
  hidePageHeading: true,
})

const route = useRoute()
const store = usePayrollStore()
const { money, employeeName, maskAccount } = usePayrollStatus()
const loading = ref(true)
const detail = ref<PayrollEmployeeDetail | null>(null)
const runId = computed(() => String(route.params.id))
const employee = computed(() => detail.value?.employee || {})
const snapshot = computed(() => employee.value.employeeSnapshot || {})
const lines = computed(() => detail.value?.lines || [])
const statItems = computed<ListPageStatItem[]>(() => [
  { label: 'Gross', value: money(employee.value.grossAmount), icon: 'ri-money-dollar-circle-line', iconBgClass: 'bg-label-info' },
  { label: 'Deduction', value: money(employee.value.employeeDeductionAmount), icon: 'ri-subtract-line', iconBgClass: 'bg-label-warning' },
  { label: 'PPh 21', value: money(employee.value.taxAmount), icon: 'ri-percent-line', iconBgClass: 'bg-label-danger' },
  { label: 'Net Pay', value: money(employee.value.netPayAmount), icon: 'ri-wallet-3-line', iconBgClass: 'bg-label-success' },
])
const earnings = computed(() => lines.value.filter((l: PayrollLine) => (l.componentType || (l as { component_type?: string }).component_type) === 'EARNING'))
const deductions = computed(() => lines.value.filter((l: PayrollLine) => (l.componentType || (l as { component_type?: string }).component_type) === 'DEDUCTION'))
const employer = computed(() => lines.value.filter((l: PayrollLine) => (l.componentType || (l as { component_type?: string }).component_type) === 'EMPLOYER_CONTRIBUTION'))

onMounted(async () => {
  loading.value = true
  const data = await store.fetchEmployeeDetail(String(route.params.id), String(route.params.employeeId))
  detail.value = (data as PayrollEmployeeDetail | null) || null
  loading.value = false
})
</script>
