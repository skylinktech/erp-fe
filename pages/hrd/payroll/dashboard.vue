<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Ringkasan operasional payroll. Angka dashboard mengikuti agregasi server (company scope). Selector periode memfilter run terbaru.</p>

      <div class="card mb-6">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-6 col-xl-4">
              <label class="form-label">Periode Payroll</label>
              <CustomSelect2
                v-model="periodId"
                :options="periodOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Semua periode"
              />
            </div>
          </div>
        </div>
      </div>

      <ListPageStatsCards :items="statItems" :loading="store.loading && !store.dashboard" />

      <div class="row g-6 mb-6">
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header"><h5 class="mb-0">Status &amp; Exception</h5></div>
            <div class="card-body py-3">
              <p class="mb-2">Open runs: <strong>{{ dashboard.currentStatus?.open_runs ?? dashboard.openRuns ?? '—' }}</strong></p>
              <p class="mb-2">Pending approval: <strong>{{ dashboard.pendingApproval ?? 0 }}</strong></p>
              <p class="mb-0">Exceptions: <strong>{{ dashboard.exceptions ?? 0 }}</strong></p>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Payroll Run terbaru</h5>
              <NuxtLink to="/payroll/runs" class="btn btn-sm btn-outline-primary">Lihat semua</NuxtLink>
            </div>
            <div class="card-body py-3">
              <div v-if="!recentRuns.length" class="text-muted">Belum ada Payroll Run.</div>
              <div v-else class="table-responsive">
                <table class="table mb-0">
                  <thead>
                    <tr>
                      <th>Run</th>
                      <th class="d-none d-md-table-cell">Tipe</th>
                      <th>Status</th>
                      <th class="text-end">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in recentRuns" :key="r.id">
                      <td>
                        <NuxtLink :to="`/payroll/runs/${r.id}`">{{ runLabel(r) }}</NuxtLink>
                      </td>
                      <td class="d-none d-md-table-cell">{{ runTypeLabel(r.runType) }}</td>
                      <td><PayrollRunStatusBadge :status="String(r.status)" /></td>
                      <td class="text-end">{{ money(r.netTotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import CustomSelect2 from '~/components/CustomSelect2.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({
  title: 'Payroll Dashboard',
  middleware: ['auth', 'check-permission'],
  alias: ['/payroll/dashboard', '/payroll'],
})

const store = usePayrollStore()
const { money, runTypeLabel, runLabel } = usePayrollStatus()
const periodId = ref<string | null>(null)

const periodOptions = computed(() =>
  store.periods.map((p) => ({ label: p.name || p.code || `#${p.id}`, value: p.id }))
)
const dashboard = computed(() => (store.dashboard || {}) as Record<string, any>)
const recentRuns = computed(() => store.runs.slice(0, 8))

const statItems = computed<ListPageStatItem[]>(() => {
  const d = dashboard.value
  return [
    { label: 'Headcount', value: d.payrollHeadcount ?? d.currentStatus?.headcount ?? 0, icon: 'ri-team-line', iconBgClass: 'bg-label-primary' },
    { label: 'Gross Payroll', value: money(d.grossPayroll ?? d.currentStatus?.gross), icon: 'ri-money-dollar-circle-line', iconBgClass: 'bg-label-info' },
    { label: 'Net Payroll', value: money(d.netPayroll ?? d.currentStatus?.net), icon: 'ri-wallet-3-line', iconBgClass: 'bg-label-success' },
    { label: 'PPh 21', value: money(d.pph21), icon: 'ri-percent-line', iconBgClass: 'bg-label-warning' },
    { label: 'BPJS Karyawan', value: money(d.bpjsEmployee), icon: 'ri-heart-pulse-line', iconBgClass: 'bg-label-danger' },
    { label: 'BPJS Perusahaan', value: money(d.bpjsEmployer), icon: 'ri-building-line', iconBgClass: 'bg-label-secondary' },
    { label: 'Employer Cost', value: money(d.employerCost ?? d.currentStatus?.employer_cost), icon: 'ri-funds-line', iconBgClass: 'bg-label-info' },
    { label: 'Exceptions', value: d.exceptions ?? d.currentStatus?.exceptions ?? 0, icon: 'ri-error-warning-line', iconBgClass: 'bg-label-danger' },
  ]
})

watch(periodId, () => {
  store.fetchDashboard()
  store.fetchRuns({ per_page: 8, period_id: periodId.value })
})

onMounted(async () => {
  await store.fetchPeriods()
  await Promise.all([store.fetchDashboard(), store.fetchRuns({ per_page: 8 })])
})
</script>
