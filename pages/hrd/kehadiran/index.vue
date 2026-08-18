<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">Kelola kehadiran pegawai: ringkasan per periode, punch, jadwal kerja, dan koreksi.</p>

      <div class="row g-6 mb-6">
        <div v-for="card in statCards" :key="card.label" class="col-xl-3 col-lg-6 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">{{ card.label }}</p>
                <div class="avatar">
                  <span :class="['avatar-initial rounded', card.iconClass]"><i :class="card.icon"></i></span>
                </div>
              </div>
              <h5 class="mb-1">{{ card.value }}</h5>
              <span class="text-muted small">{{ card.subtitle }}</span>
            </div>
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs mb-4">
        <li v-for="tab in tabs" :key="tab.id" class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === tab.id }" type="button" @click="activeTab = tab.id">
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <CollapsibleFilterCard
        title="Filter Kehadiran"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div :class="hasSecondaryFilter ? 'col-md-6' : 'col-12'">
            <label class="form-label">Periode</label>
            <CustomSelect2
              v-model="store.selectedPeriodId"
              :options="periodFilterOptions"
              :get-option-label="(o: any) => o?.label ?? ''"
              :reduce="(o: any) => o?.value"
              searchable
              clearable
              placeholder="Pilih periode"
              @update:modelValue="onPeriodChange"
            />
          </div>
          <div v-if="activeTab === 'ringkasan'" class="col-md-6">
            <label class="form-label">Pengecualian</label>
            <CustomSelect2
              v-model="store.summaryParams.exception"
              :options="exceptionFilterOptions"
              :get-option-label="(o: any) => o?.label ?? ''"
              :reduce="(o: any) => o?.value"
              searchable
              clearable
              placeholder="Semua"
              @update:modelValue="onExceptionChange"
            />
          </div>
          <div v-else-if="activeTab === 'harian'" class="col-md-6">
            <label class="form-label">Status harian</label>
            <CustomSelect2
              v-model="store.dailyParams.attendanceState"
              :options="dailyStateFilterOptions"
              :get-option-label="(o: any) => o?.label ?? ''"
              :reduce="(o: any) => o?.value"
              searchable
              clearable
              placeholder="Semua"
              @update:modelValue="onDailyStateChange"
            />
          </div>
          <div
            class="d-flex justify-content-end mt-4"
            :class="hasSecondaryFilter ? 'col-md-6 offset-md-6' : 'col-12'"
          >
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
              <i class="ri-refresh-line me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div v-if="activeTab === 'ringkasan'" class="card">
        <ListPageTableHeader
          v-model:search="store.summaryParams.search"
          v-model:rows="store.summaryParams.rows"
          title="Ringkasan pegawai"
          @search="onSearchSummary"
        />
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            :value="store.summaries"
            :loading="store.loading"
            :lazy="true"
            :paginator="true"
            :rows="store.summaryParams.rows"
            :total-records="store.totalSummaries"
            :first="store.summaryParams.first"
            @page="onSummaryPage"
          >
            <Column field="pegawaiNama" header="Pegawai" />
            <Column field="presentDays" header="Hadir" />
            <Column field="absentDays" header="Absen" />
            <Column field="paidLeaveDays" header="Cuti dibayar" />
            <Column field="unpaidLeaveDays" header="Cuti tidak dibayar" />
            <Column field="lateCount" header="Terlambat" />
            <Column field="lateMinutes" header="Menit terlambat" />
            <Column field="approvedOvertimeMinutes" header="Lembur (mnt)" />
            <Column field="incompleteDays" header="Incomplete" />
          </MyDataTable>
        </div>
      </div>

      <div v-else-if="activeTab === 'harian'" class="card">
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            :value="store.dailyRows"
            :loading="store.loading"
            :lazy="true"
            :paginator="true"
            :rows="store.dailyParams.rows"
            :total-records="store.totalDaily"
            :first="store.dailyParams.first"
            @page="onDailyPage"
          >
            <Column field="attendanceDate" header="Tanggal">
              <template #body="{ data }">{{ formatDate(data.attendanceDate) }}</template>
            </Column>
            <Column field="pegawai.nmPegawai" header="Pegawai">
              <template #body="{ data }">{{ data.pegawai?.nmPegawai || data.pegawai?.nm_pegawai || '-' }}</template>
            </Column>
            <Column field="firstCheckInAt" header="Check In">
              <template #body="{ data }">{{ formatTime(data.firstCheckInAt) }}</template>
            </Column>
            <Column field="lastCheckOutAt" header="Check Out">
              <template #body="{ data }">{{ formatTime(data.lastCheckOutAt) }}</template>
            </Column>
            <Column field="scheduledMinutes" header="Scheduled (mnt)" />
            <Column field="workedMinutes" header="Worked (mnt)" />
            <Column field="attendanceState" header="Status">
              <template #body="{ data }">
                <span :class="getAttendanceStateBadge(data.attendanceState).class">
                  {{ getAttendanceStateBadge(data.attendanceState).text }}
                </span>
              </template>
            </Column>
            <Column field="lateMinutes" header="Terlambat" />
            <Column field="earlyLeaveMinutes" header="Pulang cepat" />
            <Column field="approvedOvertimeMinutes" header="Lembur" />
          </MyDataTable>
        </div>
      </div>

      <div v-else-if="activeTab === 'periode'" class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Periode kehadiran</h5>
          <button
            v-if="canManagePeriod"
            type="button"
            class="btn btn-primary btn-sm"
            @click="openPeriodModal"
          >
            Buat periode
          </button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Rentang</th>
                <th>Status</th>
                <th>Rev</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in store.periods" :key="p.id">
                <td>{{ p.code }}</td>
                <td>{{ p.name }}</td>
                <td>{{ formatDate(p.startDate) }} – {{ formatDate(p.endDate) }}</td>
                <td>
                  <span :class="getPeriodStatusBadge(p.status).class">{{ getPeriodStatusBadge(p.status).text }}</span>
                </td>
                <td>{{ p.revision }}</td>
                <td class="text-end">
                  <button
                    v-if="canManagePeriod && p.status !== 'FINALIZED' && p.status !== 'CALCULATING'"
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="store.periodAction(p.id, p.status === 'CALCULATED' ? 'recalculate' : 'calculate')"
                  >
                    {{ p.status === 'CALCULATED' ? 'Hitung ulang' : 'Hitung' }}
                  </button>
                  <button
                    v-if="canFinalize && p.status === 'CALCULATED'"
                    class="btn btn-sm btn-success me-1"
                    @click="store.periodAction(p.id, 'finalize')"
                  >
                    Finalize
                  </button>
                  <button
                    v-if="canReopen && p.status === 'FINALIZED'"
                    class="btn btn-sm btn-outline-warning"
                    @click="reopen(p.id)"
                  >
                    Reopen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="activeTab === 'jadwal'" class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Jadwal kerja</h5>
          <NuxtLink
            v-if="canManageSchedule"
            to="/hrd/kehadiran/form"
            class="btn btn-primary btn-sm"
          >
            Buat jadwal
          </NuxtLink>
        </div>
        <div class="card-body mt-5">
          <p v-if="!store.schedules.length" class="text-muted mb-0">
            Perusahaan belum memiliki Work Schedule. Buat jadwal default atau assign ke pegawai sebelum menekan Hitung.
          </p>
          <div v-for="s in store.schedules" :key="s.id" class="border rounded p-3 mb-3">
            <div class="fw-semibold">{{ s.code }} — {{ s.name }}</div>
            <div class="small text-muted">
              {{ s.timezone }} · grace terlambat {{ s.lateGraceMinutes }} mnt
              <span v-if="s.isDefault" class="badge bg-label-primary ms-2">Default</span>
            </div>
            <ul class="small mb-0 mt-2">
              <li v-for="d in s.days || []" :key="d.dayOfWeek">
                {{ weekdayLabel(d.dayOfWeek || d.day_of_week) }}:
                {{ d.isWorkingDay || d.is_working_day ? `${d.startTime || d.start_time}–${d.endTime || d.end_time}` : 'Libur' }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'import'" class="card">
        <div class="card-header"><h5 class="mb-0">Import punch</h5></div>
        <div class="card-body mt-5">
          <p class="text-muted">CSV/XLSX dengan kolom: nik_pegawai, timestamp, punch_type, external_id (opsional).</p>
          <input type="file" class="form-control" accept=".csv,.xlsx,.xls" @change="onImport" />
          <pre v-if="importResult" class="mt-3 small bg-lighter p-3">{{ JSON.stringify(importResult, null, 2) }}</pre>
        </div>
      </div>

      <div v-else-if="activeTab === 'adjustment'" class="card">
        <div class="card-header"><h5 class="mb-0">Adjustment</h5></div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pegawai</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Alasan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in store.adjustments" :key="a.id">
                <td>{{ formatDate(a.attendanceDate) }}</td>
                <td>{{ a.pegawai?.nmPegawai || a.pegawai?.nm_pegawai || a.pegawaiId }}</td>
                <td>{{ a.adjustmentType }}</td>
                <td>{{ a.status }}</td>
                <td>{{ a.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <Modal
    :model-value="showPeriodModal"
    id="KehadiranPeriodModal"
    title="Periode kehadiran"
    description="Buat periode cutoff kehadiran. Rentang tanggal tidak harus satu bulan kalender."
    :validation-errors-from-parent="periodValidationErrors"
    dialog-class="modal-lg"
    @close="closePeriodModal"
  >
    <form @submit.prevent="submitPeriod">
      <div class="row g-4">
        <div class="col-md-6">
          <label class="form-label" for="att-period-code">Kode <span class="text-danger">*</span></label>
          <input
            id="att-period-code"
            v-model="periodForm.code"
            type="text"
            class="form-control"
            placeholder="Contoh: ATT-2026-08"
            maxlength="50"
            required
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="att-period-name">Nama <span class="text-danger">*</span></label>
          <input
            id="att-period-name"
            v-model="periodForm.name"
            type="text"
            class="form-control"
            placeholder="Nama periode"
            maxlength="150"
            required
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="att-period-start">Tanggal mulai <span class="text-danger">*</span></label>
          <input
            id="att-period-start"
            v-model="periodForm.start_date"
            type="date"
            class="form-control"
            required
            @change="syncEndIfBeforeStart"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="att-period-end">Tanggal selesai <span class="text-danger">*</span></label>
          <input
            id="att-period-end"
            v-model="periodForm.end_date"
            type="date"
            class="form-control"
            :min="periodForm.start_date || undefined"
            required
          />
        </div>
        <div class="col-12">
          <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
          <CustomSelect2
            v-model="periodForm.perusahaan_id"
            :options="perusahaanOptions"
            :get-option-label="(o: any) => o?.nmPerusahaan || o?.nm_perusahaan || o?.name || ''"
            :reduce="(o: any) => o?.id"
            searchable
            placeholder="Pilih perusahaan"
          />
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-6">
        <button type="button" class="btn btn-outline-secondary" @click="closePeriodModal">
          Batal
        </button>
        <button type="submit" class="btn btn-primary" :disabled="savingPeriod">
          <span v-if="savingPeriod" class="spinner-border spinner-border-sm me-1" role="status"></span>
          Simpan
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import Column from 'primevue/column'
import { useKehadiranStore } from '~/stores/kehadiran'
import { usePermissions } from '~/composables/usePermissions'
import { apiFetch } from '~/utils/apiFetch'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import {
  ATTENDANCE_STATE_OPTIONS,
  ISO_WEEKDAYS,
  formatMinutesAsHours,
  getAttendanceStateBadge,
  getPeriodStatusBadge,
} from '~/constants/hrd/kehadiranForm'

definePageMeta({
  title: 'Kehadiran',
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_kehadiran', 'access_kehadiran', 'view_own_kehadiran'],
})

const store = useKehadiranStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const activeTab = ref('ringkasan')
const importResult = ref<any>(null)
const showPeriodModal = ref(false)
const savingPeriod = ref(false)
const periodValidationErrors = ref<string[]>([])
const perusahaanOptions = ref<any[]>([])
const periodForm = ref({
  code: '',
  name: '',
  start_date: '',
  end_date: '',
  perusahaan_id: null as number | null,
})
const tabs = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'harian', label: 'Kehadiran Harian' },
  { id: 'periode', label: 'Periode' },
  { id: 'jadwal', label: 'Jadwal Kerja' },
  { id: 'import', label: 'Import' },
  { id: 'adjustment', label: 'Adjustment' },
]

const canManagePeriod = computed(
  () => userHasRole('superadmin') || userHasPermission('manage_periode_kehadiran')
)
const canFinalize = computed(
  () => userHasRole('superadmin') || userHasPermission('finalize_kehadiran') || canManagePeriod.value
)
const canReopen = computed(() => userHasRole('superadmin') || userHasPermission('reopen_kehadiran'))
const canImport = computed(
  () => userHasRole('superadmin') || userHasPermission('import_kehadiran') || userHasPermission('edit_kehadiran')
)
const canManageSchedule = computed(
  () =>
    userHasRole('superadmin') ||
    userHasPermission('manage_jadwal_kehadiran') ||
    userHasPermission('edit_kehadiran')
)

const hasActiveFilters = computed(
  () => !!(store.summaryParams.exception || store.dailyParams.attendanceState)
)

const hasSecondaryFilter = computed(
  () => activeTab.value === 'ringkasan' || activeTab.value === 'harian'
)

const periodFilterOptions = computed(() =>
  (store.periods || []).map((p: any) => ({
    value: p.id,
    label: `${p.code} — ${p.name} (${p.status})`,
  }))
)

const exceptionFilterOptions = [
  { value: 'late', label: 'Terlambat' },
  { value: 'absent', label: 'Absen' },
  { value: 'incomplete', label: 'Tidak lengkap' },
  { value: 'unpaid', label: 'Cuti tidak dibayar' },
]

const dailyStateFilterOptions = ATTENDANCE_STATE_OPTIONS.map((s) => ({
  value: s.value,
  label: s.label,
}))

const statCards = computed(() => [
  { label: 'Pegawai', value: store.stats.totalEmployee, subtitle: 'Dalam periode', icon: 'ri-team-line', iconClass: 'bg-label-primary' },
  { label: 'Hadir', value: store.stats.present, subtitle: 'Hari hadir (agregat)', icon: 'ri-checkbox-circle-line', iconClass: 'bg-label-success' },
  { label: 'Absen', value: store.stats.absent, subtitle: 'Hari absen', icon: 'ri-close-circle-line', iconClass: 'bg-label-danger' },
  { label: 'Terlambat', value: store.stats.late, subtitle: 'Kejadian terlambat', icon: 'ri-time-line', iconClass: 'bg-label-warning' },
  { label: 'Cuti dibayar', value: store.stats.paidLeave, subtitle: 'Hari', icon: 'ri-calendar-check-line', iconClass: 'bg-label-info' },
  { label: 'Cuti tidak dibayar', value: store.stats.unpaidLeave, subtitle: 'Hari', icon: 'ri-calendar-close-line', iconClass: 'bg-label-secondary' },
  { label: 'Lembur', value: formatMinutesAsHours(store.stats.overtimeMinutes || Math.round((store.stats.overtimeHours || 0) * 60)), subtitle: 'Approved', icon: 'ri-timer-line', iconClass: 'bg-label-primary' },
  { label: 'Incomplete', value: store.stats.incomplete, subtitle: 'Punch tidak lengkap', icon: 'ri-error-warning-line', iconClass: 'bg-label-warning' },
])

function formatDate(v: any) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatTime(v: any) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v).slice(11, 16)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
function weekdayLabel(n: number) {
  return ISO_WEEKDAYS.find((d) => d.day_of_week === Number(n))?.label ?? String(n)
}

function onPeriodChange() {
  void store.fetchStats()
  void store.fetchSummaries()
  void store.fetchDaily()
  void store.fetchAdjustments()
}
function onExceptionChange() {
  void store.fetchSummaries()
}
function onDailyStateChange() {
  void store.fetchDaily()
}
function resetFilters() {
  store.summaryParams.exception = null
  store.dailyParams.attendanceState = null
  onPeriodChange()
}
function onSearchSummary() {
  store.summaryParams.page = 1
  store.summaryParams.first = 0
  store.fetchSummaries()
}
function onSummaryPage(e: any) {
  store.summaryParams.first = e.first
  store.summaryParams.rows = e.rows
  store.summaryParams.page = Math.floor(e.first / e.rows) + 1
  store.fetchSummaries()
}
function onDailyPage(e: any) {
  store.dailyParams.first = e.first
  store.dailyParams.rows = e.rows
  store.dailyParams.page = Math.floor(e.first / e.rows) + 1
  store.fetchDaily()
}

function emptyPeriodForm() {
  return {
    code: '',
    name: '',
    start_date: '',
    end_date: '',
    perusahaan_id: null as number | null,
  }
}

function syncEndIfBeforeStart() {
  if (
    periodForm.value.start_date &&
    periodForm.value.end_date &&
    periodForm.value.end_date < periodForm.value.start_date
  ) {
    periodForm.value.end_date = periodForm.value.start_date
  }
}

async function loadPerusahaanOptions() {
  if (perusahaanOptions.value.length) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.dataPerusahaan(), { credentials: 'include' }).then((r) =>
      r.ok ? r.json() : null
    )
    const list = res?.data ?? res ?? []
    perusahaanOptions.value = Array.isArray(list) ? list : []
  } catch {
    perusahaanOptions.value = []
  }
}

async function openPeriodModal() {
  periodForm.value = emptyPeriodForm()
  periodValidationErrors.value = []
  await loadPerusahaanOptions()
  showPeriodModal.value = true
}

function closePeriodModal() {
  showPeriodModal.value = false
  savingPeriod.value = false
  periodValidationErrors.value = []
}

async function submitPeriod() {
  const toast = useToast()
  periodValidationErrors.value = []
  const { code, name, start_date, end_date, perusahaan_id } = periodForm.value
  if (!code.trim() || !name.trim() || !start_date || !end_date || !perusahaan_id) {
    periodValidationErrors.value = ['Semua field bertanda * wajib diisi.']
    return
  }
  if (end_date < start_date) {
    periodValidationErrors.value = ['Tanggal selesai tidak boleh sebelum tanggal mulai.']
    return
  }

  savingPeriod.value = true
  try {
    const { $api } = useNuxtApp()
    await apiFetch($api.kehadiranPeriodStore(), {
      method: 'POST',
      credentials: 'include',
      body: {
        code: code.trim(),
        name: name.trim(),
        start_date,
        end_date,
        perusahaan_id,
      },
    })
    toast.success({ title: 'Berhasil', message: 'Attendance period dibuat', color: 'green' })
    closePeriodModal()
    await store.fetchPeriods()
  } catch (e) {
    const normalized = normalizeApiError(e, 'Gagal membuat periode kehadiran')
    const fieldMessages = normalized.fieldErrorList?.map((x) => x.message).filter(Boolean) ?? []
    periodValidationErrors.value = fieldMessages.length ? fieldMessages : [normalized.message]
    toastNormalizedError(normalized)
  } finally {
    savingPeriod.value = false
  }
}

async function reopen(id: number) {
  const { value: reason } = await Swal.fire({
    title: 'Buka kembali periode?',
    input: 'textarea',
    inputPlaceholder: 'Alasan wajib',
    showCancelButton: true,
    inputValidator: (v) => (!v || v.trim().length < 3 ? 'Alasan wajib diisi' : null),
  })
  if (reason) await store.reopenPeriod(id, reason)
}

async function onImport(e: Event) {
  if (!canImport.value) return
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importResult.value = await store.importFile(file)
}

onMounted(async () => {
  setListTitle('Kehadiran', 0)
  const tabFromQuery = String(useRoute().query.tab || '')
  if (tabs.some((t) => t.id === tabFromQuery)) activeTab.value = tabFromQuery
  await store.fetchPeriods()
  await store.fetchSchedules()
  onPeriodChange()
})
</script>
