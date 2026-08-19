<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <NuxtLink to="/payroll/runs" class="btn btn-outline-secondary btn-sm mb-2">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
          <h4 class="mb-1 fw-semibold">Buat Payroll Run</h4>
          <PageBreadcrumb current-label="Buat Payroll Run" />
        </div>
        <PayrollRunStatusBadge v-if="run" :status="String(run.status)" />
      </div>

      <div class="card">
        <div class="card-header">
          <TabbedFormNav :steps="visibleSteps" :current-index="currentIndex" @select="goTo" />
        </div>
        <form class="card-body" @submit.prevent="onSubmit">
          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

          <div v-show="isCurrent('setup')" data-step-id="setup">
            <div class="row g-4 py-3">
              <div class="col-md-6">
                <label class="form-label">Payroll Period <span class="text-danger">*</span></label>
                <CustomSelect2
                  v-model="form.payroll_period_id"
                  :options="periodOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  placeholder="Pilih periode"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Run Type <span class="text-danger">*</span></label>
                <CustomSelect2
                  v-model="form.run_type"
                  :options="PAYROLL_RUN_TYPE_OPTIONS"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  placeholder="Tipe run"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Perusahaan</label>
                <p class="mb-0">{{ selectedPeriod?.perusahaanId ? `ID ${selectedPeriod.perusahaanId}` : 'Mengikuti periode' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label">Payment Date</label>
                <p class="mb-0">{{ formatDate(selectedPeriod?.paymentDate) }}</p>
              </div>
              <div class="col-12">
                <label class="form-label">Catatan</label>
                <textarea v-model="form.notes" class="form-control" rows="2" maxlength="500" />
              </div>
            </div>
          </div>

          <div v-show="isCurrent('attendance')" data-step-id="attendance">
            <div v-if="attendanceLoading" class="text-center py-5"><div class="spinner-border text-primary" /></div>
            <div v-else-if="!attendance" class="alert alert-warning">
              Attendance Period belum terhubung ke Payroll Period ini. Kalkulasi REGULAR membutuhkan Attendance yang FINALIZED.
            </div>
            <div v-else class="row g-3 py-3">
              <div class="col-md-6"><label class="form-label text-muted">Attendance Period</label><p class="mb-0">{{ attendance.name || attendance.code || attendance.id }}</p></div>
              <div class="col-md-6"><label class="form-label text-muted">Status</label><p class="mb-0"><PayrollRunStatusBadge :status="String(attendance.status || '').toUpperCase()" /></p></div>
              <div class="col-md-6"><label class="form-label text-muted">Revision</label><p class="mb-0">{{ attendance.revision ?? '—' }}</p></div>
              <div class="col-md-6"><label class="form-label text-muted">Finalized At</label><p class="mb-0">{{ formatDateTime(attendance.finalizedAt || attendance.finalized_at) }}</p></div>
              <div v-if="!attendanceReady" class="col-12">
                <div class="alert alert-danger mb-0">Payroll calculation cannot continue. Attendance Period belum FINALIZED.</div>
              </div>
            </div>
          </div>

          <div v-show="isCurrent('employees')" data-step-id="employees">
            <p class="text-muted py-3">Validasi employee muncul setelah kalkulasi. Lanjutkan ke langkah Calculate.</p>
            <div v-if="calcSummary" class="row g-3 py-3">
              <div class="col-6 col-md-3"><div class="card"><div class="card-body"><small>Eligible</small><h5 class="mb-0">{{ calcSummary.totalEmployees }}</h5></div></div></div>
              <div class="col-6 col-md-3"><div class="card"><div class="card-body"><small>Ready</small><h5 class="mb-0">{{ calcSummary.calculated }}</h5></div></div></div>
              <div class="col-6 col-md-3"><div class="card"><div class="card-body"><small>Blocked</small><h5 class="mb-0 text-danger">{{ calcSummary.blocked }}</h5></div></div></div>
              <div class="col-6 col-md-3"><div class="card"><div class="card-body"><small>Warnings</small><h5 class="mb-0 text-warning">{{ calcSummary.warnings }}</h5></div></div></div>
            </div>
            <p v-else class="mb-0 py-3">Belum dihitung.</p>
          </div>

          <div v-show="isCurrent('calculate')" data-step-id="calculate">
            <p class="py-3">Hitung payroll dari source data backend. Frontend tidak menghitung gaji.</p>
            <button class="btn btn-primary" :disabled="busy || !run" @click="doCalculate">
              <span v-if="busy" class="spinner-border spinner-border-sm me-1" />
              Calculate Payroll
            </button>
            <p v-if="calcSummary" class="mt-3 mb-0 py-3 text-success">Selesai. {{ calcSummary.calculated }} employee calculated, {{ calcSummary.blocked }} blocked.</p>
          </div>

          <div v-show="isCurrent('review')" data-step-id="review" class="py-3">
            <PayrollRunSummaryCards :run="run" :loading="store.loading" />
            <div class="table-responsive py-3">
              <table class="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th class="d-none d-md-table-cell">Dept</th>
                    <th class="d-none d-lg-table-cell text-end">Gross</th>
                    <th class="text-end">Net</th>
                    <th>Exception</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in store.employees" :key="e.id">
                    <td>{{ employeeName(e) }}</td>
                    <td class="d-none d-md-table-cell">{{ e.employeeSnapshot?.department || '—' }}</td>
                    <td class="d-none d-lg-table-cell text-end">{{ money(e.grossAmount) }}</td>
                    <td class="text-end">{{ money(e.netPayAmount) }}</td>
                    <td>
                      <PayrollExceptionBadge v-if="worstIssue(e)" :severity="worstIssue(e)" />
                      <span v-else class="text-muted">—</span>
                    </td>
                  </tr>
                  <tr v-if="!store.employees.length">
                    <td colspan="5" class="text-muted">Belum ada hasil kalkulasi.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-show="isCurrent('submit')" data-step-id="submit">
            <dl class="row mb-0 py-3">
              <dt class="col-sm-4">Periode</dt><dd class="col-sm-8">{{ run?.period?.name || selectedPeriod?.name }}</dd>
              <dt class="col-sm-4">Run</dt><dd class="col-sm-8">{{ runLabel(run) }}</dd>
              <dt class="col-sm-4">Employees</dt><dd class="col-sm-8">{{ run?.employeeCount }}</dd>
              <dt class="col-sm-4">Gross</dt><dd class="col-sm-8">{{ money(run?.grossTotal) }}</dd>
              <dt class="col-sm-4">Net</dt><dd class="col-sm-8">{{ money(run?.netTotal) }}</dd>
              <dt class="col-sm-4">Exceptions</dt><dd class="col-sm-8">{{ run?.blockedCount }}</dd>
              <dt class="col-sm-4">Attendance revision</dt><dd class="col-sm-8">{{ run?.attendanceRevision ?? '—' }}</dd>
            </dl>
            <div v-if="(run?.blockedCount || 0) > 0" class="alert alert-danger mt-3">
              Tidak dapat submit: masih ada employee blocked. Periksa tab Exceptions pada detail run untuk melihat penyebabnya (mis. compensation belum ACTIVE).
            </div>
          </div>

          <TabbedFormActions
            :is-first-step="isFirstStep"
            :is-last-step="isLastStep"
            :loading="busy"
            :saving="busy"
            :submit-disabled="Boolean((run?.blockedCount || 0) > 0)"
            cancel-href="/payroll/runs"
            submit-label="Submit Payroll"
            @previous="previous()"
            @next="onNext"
          />
        </form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import { PAYROLL_CONFIRM, PAYROLL_RUN_TYPE_OPTIONS } from '~/constants/payroll'
import { apiFetch } from '~/utils/apiFetch'
import { toastApiError } from '~/utils/apiError'
import type { PayrollRunSummary } from '~/types/payroll'

definePageMeta({
  title: 'Buat Payroll Run',
  middleware: ['auth', 'check-permission'],
  alias: '/payroll/runs/create',
  hidePageHeading: true,
})

const store = usePayrollStore()
const { money, formatDate, formatDateTime, employeeName, runLabel } = usePayrollStatus()
const { $api } = useNuxtApp()
const busy = ref(false)
const errorMessage = ref('')
const run = ref<PayrollRunSummary | null>(null)
const attendance = ref<Record<string, any> | null>(null)
const attendanceLoading = ref(false)
const calcSummary = ref<{ totalEmployees: number; calculated: number; blocked: number; warnings: number } | null>(null)
const form = reactive({ payroll_period_id: null as string | null, run_type: 'REGULAR', notes: '' })

const steps = [
  { id: 'setup', label: 'Setup', icon: 'ri-settings-3-line' },
  { id: 'attendance', label: 'Attendance', icon: 'ri-calendar-check-line' },
  { id: 'employees', label: 'Employees', icon: 'ri-team-line' },
  { id: 'calculate', label: 'Calculate', icon: 'ri-calculator-line' },
  { id: 'review', label: 'Review', icon: 'ri-file-list-3-line' },
  { id: 'submit', label: 'Submit', icon: 'ri-send-plane-line' },
]
const nav = useTabbedFormNavigation({
  steps,
  validateStep: async (step) => {
    errorMessage.value = ''
    if (step.id === 'setup') {
      if (!form.payroll_period_id) {
        errorMessage.value = 'Payroll Period wajib dipilih.'
        return false
      }
      if (!run.value) {
        try {
          busy.value = true
          run.value = await store.createRun({ payroll_period_id: form.payroll_period_id, run_type: form.run_type })
        } catch (e: any) {
          errorMessage.value = e?.message || 'Payroll Run gagal dibuat.'
          return false
        } finally {
          busy.value = false
        }
      }
    }
    if (step.id === 'attendance' && form.run_type === 'REGULAR' && !attendanceReady.value) {
      errorMessage.value = 'Attendance Period belum finalized.'
      return false
    }
    return true
  },
})
const { currentIndex, visibleSteps, isCurrent, isFirstStep, isLastStep, next, previous, goTo } = nav

const periodOptions = computed(() => store.periods.map((p) => ({ label: `${p.name || p.code} (${p.periodMonth}/${p.periodYear})`, value: p.id })))
const selectedPeriod = computed(() => store.periods.find((p) => p.id === form.payroll_period_id) || null)
const attendanceReady = computed(() => String(attendance.value?.status || '').toUpperCase() === 'FINALIZED')

watch(
  () => selectedPeriod.value?.attendancePeriodId,
  async (id) => {
    attendance.value = null
    if (!id) return
    attendanceLoading.value = true
    try {
      const res = await apiFetch<{ data: any }>($api.kehadiranPeriodShow(id), { credentials: 'include' })
      attendance.value = res.data
    } catch (error) {
      toastApiError(error, 'Attendance Period gagal dimuat.')
    } finally {
      attendanceLoading.value = false
    }
  }
)

async function onNext() {
  await next()
}

async function doCalculate() {
  if (!run.value) return
  busy.value = true
  errorMessage.value = ''
  try {
    const data = await store.runAction(run.value.id, 'calculate', { confirm: PAYROLL_CONFIRM.calculate })
    if (!data) return
    const payload = data as { run?: PayrollRunSummary; summary?: any }
    if (payload?.run) run.value = payload.run
    calcSummary.value = payload?.summary || null
    await store.fetchEmployees(run.value.id, { per_page: 20 })
    await store.fetchRun(run.value.id)
    if (store.currentRun) run.value = store.currentRun
  } finally {
    busy.value = false
  }
}

async function onSubmit() {
  if (!run.value) return
  const data = await store.runAction(run.value.id, 'submit', { confirm: PAYROLL_CONFIRM.submit })
  if (data) await navigateTo(`/payroll/runs/${run.value.id}`)
}

onMounted(async () => {
  await store.fetchPeriods()
})

function worstIssue(row: { issues?: Array<{ severity?: string }> | null }) {
  const issues = row.issues || []
  if (issues.some((i) => i.severity === 'BLOCKING_ERROR')) return 'BLOCKING_ERROR'
  if (issues.some((i) => i.severity === 'WARNING')) return 'WARNING'
  return ''
}
</script>
