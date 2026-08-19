<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <div v-if="loading && !run" class="d-flex justify-content-center align-items-center" style="min-height: 320px;">
          <div class="text-center">
            <div class="spinner-border text-primary"></div>
            <p class="mt-3 text-muted">Memuat Payroll Run...</p>
          </div>
        </div>
        <div v-else-if="!run" class="alert alert-danger">Payroll Run tidak ditemukan. <NuxtLink to="/payroll/runs">Kembali</NuxtLink></div>
        <template v-else>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <NuxtLink to="/payroll/runs" class="btn btn-outline-secondary btn-sm mb-2">
                <i class="ri-arrow-left-line me-1"></i>Kembali
              </NuxtLink>
              <h4 class="mb-1 fw-semibold">Payroll Run {{ runLabel(run) }}</h4>
              <PageBreadcrumb :current-label="runLabel(run)" />
              <div class="d-flex flex-wrap gap-2 mt-2">
                <PayrollRunStatusBadge :status="String(run.status)" />
                <span class="badge bg-label-secondary">{{ runTypeLabel(run.runType) }}</span>
                <span class="text-muted">{{ run.period?.name }}</span>
              </div>
            </div>
            <PayrollRunActions layout="buttons" :run="run" :busy="store.loading" :exclude="['view']" @action="onAction" />
          </div>

          <PayrollRunSummaryCards :run="run" :loading="false" />

          <ul class="nav nav-tabs mb-4 flex-nowrap overflow-auto" role="tablist">
            <li v-for="tab in tabs" :key="tab.id" class="nav-item">
              <button type="button" class="nav-link" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
                {{ tab.label }}
                <span v-if="tab.badge != null" class="badge bg-label-danger ms-1">{{ tab.badge }}</span>
              </button>
            </li>
          </ul>

          <div v-show="activeTab === 'overview'" class="card">
            <div class="card-body py-3">
              <div class="row g-3">
                <div class="col-md-4"><label class="form-label text-muted">Run Number</label><p class="mb-0">{{ runLabel(run) }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Periode</label><p class="mb-0">{{ run.period?.name }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Revision</label><p class="mb-0">{{ run.revision }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Attendance Period</label><p class="mb-0">{{ run.attendancePeriodId || '—' }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Attendance Revision</label><p class="mb-0">{{ run.attendanceRevision ?? '—' }} <span v-if="run.attendanceRevisionOutdated" class="badge bg-label-warning">OUTDATED</span></p></div>
                <div class="col-md-4"><label class="form-label text-muted">Calculation Version</label><p class="mb-0">{{ run.calculationVersion || '—' }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Tax Rule</label><p class="mb-0">{{ run.taxRuleVersion || '—' }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">BPJS Rule</label><p class="mb-0">{{ run.bpjsRuleVersion || '—' }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Calculated At</label><p class="mb-0">{{ formatDateTime(run.calculatedAt) }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Submitted At</label><p class="mb-0">{{ formatDateTime(run.submittedAt) }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Approved At</label><p class="mb-0">{{ formatDateTime(run.approvedAt) }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Posted At</label><p class="mb-0">{{ formatDateTime(run.postedAt) }}</p></div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'employees'" class="card">
            <div class="card-header">
              <div class="row g-3 py-3">
                <div class="col-md-4"><InputText v-model="empSearch" placeholder="Cari nama..." class="w-100" /></div>
                <div class="col-md-4">
                  <select v-model="empException" class="form-select" aria-label="Filter exception">
                    <option value="">Semua</option>
                    <option value="blocked">Blocked</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select v-model="empPayment" class="form-select" aria-label="Filter payment status">
                    <option value="">Semua payment</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                v-model:filters="empColumnFilters"
                :data="store.employees"
                :rows="empRows"
                :loading="store.loading"
                :totalRecords="store.employeeTotal"
                :first="store.employeeParams.first"
                :lazy="true"
                filterDisplay="row"
                tableStyle="min-width: 100%"
                @page="onEmpPage"
              >
                <Column field="employeeName" header="Employee" :showFilterMenu="false">
                  <template #body="{ data }">
                    <a class="text-primary" style="cursor:pointer;text-decoration:underline" @click="navigateTo(`/payroll/runs/${run.id}/employees/${data.id}`)">
                      {{ employeeName(data) }}
                    </a>
                  </template>
                  <template #filter>
                    <InputText v-model="empSearch" placeholder="Cari nama..." class="p-column-filter w-100" />
                  </template>
                </Column>
                <Column header="Dept" class="d-none d-md-table-cell">
                  <template #body="{ data }">{{ data.employeeSnapshot?.department || '—' }}</template>
                </Column>
                <Column header="Gross" class="d-none d-xl-table-cell text-end">
                  <template #body="{ data }">{{ canViewDetail ? money(data.grossAmount) : '—' }}</template>
                </Column>
                <Column header="Deduction" class="d-none d-xl-table-cell text-end">
                  <template #body="{ data }">{{ canViewDetail ? money(data.employeeDeductionAmount) : '—' }}</template>
                </Column>
                <Column header="PPh21" class="d-none d-lg-table-cell text-end">
                  <template #body="{ data }">{{ canViewDetail ? money(data.taxAmount) : '—' }}</template>
                </Column>
                <Column header="Net" class="text-end">
                  <template #body="{ data }">{{ canViewDetail ? money(data.netPayAmount) : '—' }}</template>
                </Column>
                <Column field="exception" header="Exception" :showFilterMenu="false">
                  <template #body="{ data }">
                    <PayrollExceptionBadge v-if="worstIssue(data)" :severity="worstIssue(data)" />
                    <span v-else>—</span>
                  </template>
                  <template #filter>
                    <select v-model="empException" class="form-select form-select-sm" aria-label="Filter exception">
                      <option value="">Semua</option>
                      <option value="blocked">Blocked</option>
                      <option value="warning">Warning</option>
                    </select>
                  </template>
                </Column>
                <Column field="payment" header="Payment" class="d-none d-md-table-cell" :showFilterMenu="false">
                  <template #body="{ data }"><PayrollRunStatusBadge :status="data.paymentStatus" /></template>
                  <template #filter>
                    <select v-model="empPayment" class="form-select form-select-sm" aria-label="Filter payment status">
                      <option value="">Semua payment</option>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </template>
                </Column>
              </MyDataTable>
            </div>
          </div>

          <div v-show="activeTab === 'exceptions'" class="card">
            <div class="card-body">
              <div class="row g-3 mb-4">
                <div class="col-md-6"><div class="card"><div class="card-body"><small>Blocking</small><h5 class="mb-0 text-danger">{{ run.blockedCount || 0 }}</h5></div></div></div>
                <div class="col-md-6"><div class="card"><div class="card-body"><small>Warning</small><h5 class="mb-0 text-warning">{{ run.warningCount || 0 }}</h5></div></div></div>
              </div>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Code</th>
                      <th>Severity</th>
                      <th>Message</th>
                      <th class="d-none d-lg-table-cell">Recommended</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in exceptionRows" :key="row.key">
                      <td>{{ row.name }}</td>
                      <td>{{ row.code }}</td>
                      <td><PayrollExceptionBadge :severity="row.severity" /></td>
                      <td>{{ row.message }}</td>
                      <td class="d-none d-lg-table-cell">{{ row.recommended || '—' }}</td>
                    </tr>
                    <tr v-if="!exceptionRows.length"><td colspan="5" class="text-muted">Tidak ada exception.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'approval'" class="row">
            <div class="col-xl-8">
              <div class="card mb-4">
                <div class="card-body">
                  <p class="mb-0">Approval memakai workflow dokumen yang sama dengan modul lain. Hanya approver saat ini yang dapat Approve/Reject.</p>
                </div>
              </div>
            </div>
            <div class="col-xl-4">
              <ApprovalCard
                :status-text="statusBadge(String(run.status)).text"
                :current-step="run.currentApprovalStep"
                :current-approvers="run.currentApprovers"
                :approval-logs="run.approvalLogs"
              />
            </div>
          </div>

          <div v-show="activeTab === 'accounting'" class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4"><label class="form-label text-muted">Posting Status</label><p class="mb-0">{{ run.accountingStatus || '—' }}</p></div>
                <div class="col-md-4"><label class="form-label text-muted">Journal</label><p class="mb-0"><NuxtLink v-if="run.journalId" :to="`/finance/journals/detail/${run.journalId}`">#{{ run.journalId }}</NuxtLink><span v-else>—</span></p></div>
                <div class="col-md-4"><label class="form-label text-muted">Posted At</label><p class="mb-0">{{ formatDateTime(run.postedAt) }}</p></div>
              </div>
              <p class="text-muted mt-3 mb-0">Jika mapping akun belum ada, posting akan menampilkan error backend (mis. salary_payable mapping belum dikonfigurasi). Mapping dikelola di Finance, bukan Payroll.</p>
            </div>
          </div>

          <div v-show="activeTab === 'payment'" class="card">
            <div class="card-body">
              <NuxtLink :to="`/payroll/payments?run_id=${run.id}`" class="btn btn-outline-primary btn-sm">Buka Payment</NuxtLink>
            </div>
          </div>

          <div v-show="activeTab === 'audit'" class="card">
            <div class="card-body text-muted">Audit trail lifecycle tercatat di activity log backend. Riwayat approval tampil di tab Approval.</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { PAYROLL_CONFIRM } from '~/constants/payroll'
import Swal from 'sweetalert2'
import type { PayrollRunActionKey } from '~/composables/usePayrollRunActions'

definePageMeta({
  title: 'Payroll Run Detail',
  middleware: ['auth', 'check-permission'],
  alias: '/payroll/runs/:id',
  hidePageHeading: true,
})

const route = useRoute()
const store = usePayrollStore()
const { canViewDetail } = usePayrollPermissions()
const { money, runTypeLabel, runLabel, formatDateTime, employeeName, statusBadge } = usePayrollStatus()
const loading = ref(true)
const activeTab = ref('overview')
const empSearch = ref('')
const empException = ref('')
const empPayment = ref('')
const empRows = 20
const employeesLoaded = ref(false)
const empColumnFilters = ref({
  employeeName: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  exception: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  payment: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
})

const run = computed(() => store.currentRun)
const tabs = computed(() => [
  { id: 'overview', label: 'Overview' },
  { id: 'employees', label: 'Employees' },
  { id: 'exceptions', label: 'Exceptions', badge: run.value?.blockedCount || null },
  { id: 'approval', label: 'Approval' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'payment', label: 'Payment' },
  { id: 'audit', label: 'Audit' },
])

const exceptionRows = computed(() => {
  const rows: Array<{ key: string; name: string; code: string; severity: string; message: string; recommended?: string }> = []
  for (const emp of store.exceptionEmployees) {
    for (const issue of emp.issues || []) {
      rows.push({
        key: `${emp.id}-${issue.code}`,
        name: employeeName(emp),
        code: issue.code,
        severity: issue.severity,
        message: issue.message,
        recommended: issue.recommendedAction,
      })
    }
  }
  return rows
})

async function loadEmployees() {
  if (!run.value) return
  await store.fetchEmployees(run.value.id, {
    page: store.employeeParams.page,
    per_page: empRows,
    search: empSearch.value,
    exception: empException.value,
    payment_status: empPayment.value,
  })
  employeesLoaded.value = true
}

watch(activeTab, async (tab) => {
  if (tab === 'employees' && !employeesLoaded.value) await loadEmployees()
  if (tab === 'exceptions' && run.value) await store.fetchExceptionEmployees(run.value.id)
})

const debouncedEmpSearch = useDebounceFn(() => {
  store.employeeParams.page = 1
  loadEmployees()
}, 500)
watch(empSearch, debouncedEmpSearch)
watch(empException, () => {
  store.employeeParams.page = 1
  loadEmployees()
})
watch(empPayment, () => {
  store.employeeParams.page = 1
  loadEmployees()
})

function onEmpPage(e: { page?: number }) {
  store.employeeParams.page = (e.page ?? 0) + 1
  loadEmployees()
}

function worstIssue(row: { issues?: Array<{ severity?: string }> | null }) {
  const issues = row.issues || []
  if (issues.some((i) => i.severity === 'BLOCKING_ERROR')) return 'BLOCKING_ERROR'
  if (issues.some((i) => i.severity === 'WARNING')) return 'WARNING'
  return ''
}

async function onAction(key: PayrollRunActionKey) {
  if (!run.value) return
  if (key === 'payment') return navigateTo(`/payroll/payments?run_id=${run.value.id}`)
  if (key === 'reject') {
    const { value, isConfirmed } = await Swal.fire({
      title: 'Tolak Payroll',
      input: 'textarea',
      inputLabel: 'Catatan',
      showCancelButton: true,
      confirmButtonText: 'Tolak',
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
    })
    if (!isConfirmed) return
    await store.runAction(run.value.id, 'reject', { remarks: value })
  } else if (key === 'calculate' || key === 'recalculate' || key === 'submit' || key === 'approve' || key === 'post') {
    await store.runAction(run.value.id, key, { confirm: PAYROLL_CONFIRM[key] })
  }
  await store.fetchRun(String(route.params.id))
  employeesLoaded.value = false
}

onMounted(async () => {
  loading.value = true
  await store.fetchRun(String(route.params.id))
  loading.value = false
})
</script>
