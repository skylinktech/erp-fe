<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="!batch" class="text-center py-5"><div class="spinner-border text-primary" /></div>
      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <NuxtLink to="/payroll/payments" class="btn btn-outline-secondary btn-sm mb-2"><i class="ri-arrow-left-line me-1"></i>Kembali</NuxtLink>
            <h4 class="fw-semibold mb-1">Payment Batch #{{ batch.id }}</h4>
            <PayrollRunStatusBadge :status="String(batch.status)" />
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button v-if="canCreatePayment" class="btn btn-primary btn-sm" @click="process">Process</button>
            <button v-if="canCreatePayment && String(batch.status) === 'PARTIALLY_PAID'" class="btn btn-outline-warning btn-sm" @click="retry">Retry Failed</button>
            <a v-if="canExportBank" class="btn btn-outline-secondary btn-sm" :href="exportUrl" target="_blank" rel="noopener">Export Bank</a>
          </div>
        </div>
        <ListPageStatsCards :items="statItems" />
        <div v-if="String(batch.status) === 'PARTIALLY_PAID'" class="alert alert-warning">
          {{ paidCount }} Paid · {{ failedCount }} Failed. Retry hanya memproses item FAILED.
        </div>
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th class="d-none d-md-table-cell">Account</th>
                  <th class="text-end">Amount</th>
                  <th>Status</th>
                  <th class="d-none d-lg-table-cell">Failure</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td>{{ item.employeeSnapshot?.employee_name || item.pegawaiId }}</td>
                  <td class="d-none d-md-table-cell">{{ maskAccount(item.accountNumber || item.account_number) }}</td>
                  <td class="text-end">{{ money(item.amount) }}</td>
                  <td><PayrollRunStatusBadge :status="item.status" /></td>
                  <td class="d-none d-lg-table-cell">{{ item.failureMessage || item.failure_message || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PAYROLL_CONFIRM } from '~/constants/payroll'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Payment Batch', middleware: ['auth', 'check-permission'], alias: '/payroll/payments/:id', hidePageHeading: true })

const route = useRoute()
const store = usePayrollStore()
const { canCreatePayment, canExportBank } = usePayrollPermissions()
const { money, formatDate, maskAccount } = usePayrollStatus()
const { $api } = useNuxtApp()
const batch = computed(() => store.currentPayment)
const items = computed(() => batch.value?.items || [])
const paidCount = computed(() => items.value.filter((i) => i.status === 'PAID').length)
const failedCount = computed(() => items.value.filter((i) => i.status === 'FAILED').length)
const exportUrl = computed(() => $api.payrollPaymentExport(String(route.params.id)))
const statItems = computed<ListPageStatItem[]>(() => [
  { label: 'Items', value: batch.value?.totalItems ?? items.value.length, icon: 'ri-group-line', iconBgClass: 'bg-label-primary' },
  { label: 'Amount', value: money(batch.value?.totalAmount), icon: 'ri-money-dollar-circle-line', iconBgClass: 'bg-label-info' },
  { label: 'Paid', value: paidCount.value, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
  { label: 'Failed', value: failedCount.value, icon: 'ri-error-warning-line', iconBgClass: 'bg-label-danger', subtitle: formatDate(batch.value?.paymentDate) },
])

async function process() {
  await store.processPayment(String(route.params.id), PAYROLL_CONFIRM.processPayment)
}
async function retry() {
  await store.retryFailedPayment(String(route.params.id), `${PAYROLL_CONFIRM.retryFailed} (${failedCount.value} failed)`)
}

onMounted(() => store.fetchPayment(String(route.params.id)))
</script>
