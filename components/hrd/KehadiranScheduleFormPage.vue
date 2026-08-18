<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-0">{{ pageTitle }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
          <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/hrd/kehadiran?tab=jadwal" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div class="card">
        <div class="card-body">
          <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
            <div v-if="validationErrors.length" class="alert alert-warning mb-4">
              <ul class="mb-0 ps-3">
                <li v-for="(msg, i) in validationErrors" :key="i">{{ msg }}</li>
              </ul>
            </div>

            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || saving"
              @select="goTo"
            />

            <div class="tab-content pt-4">
              <div
                id="jadwal-tab-info"
                data-step-id="jadwal-tab-info"
                :class="paneClass('jadwal-tab-info')"
              >
                <div class="row g-4">
                  <div class="col-md-4">
                    <FormLabel required html-for="att-sch-code">Kode</FormLabel>
                    <input
                      id="att-sch-code"
                      v-model="form.code"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': fieldErrors.code }"
                      placeholder="Contoh: REG-5H"
                      maxlength="50"
                    />
                    <div v-if="fieldErrors.code" class="invalid-feedback d-block">{{ fieldErrors.code }}</div>
                  </div>
                  <div class="col-md-8">
                    <FormLabel required html-for="att-sch-name">Nama</FormLabel>
                    <input
                      id="att-sch-name"
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': fieldErrors.name }"
                      placeholder="Nama jadwal"
                      maxlength="150"
                    />
                    <div v-if="fieldErrors.name" class="invalid-feedback d-block">{{ fieldErrors.name }}</div>
                  </div>
                  <div class="col-12">
                    <FormLabel required>Perusahaan</FormLabel>
                    <CustomSelect2
                      v-model="form.perusahaan_id"
                      :options="perusahaanOptions"
                      :get-option-label="perusahaanLabel"
                      :reduce="(o: any) => o?.id"
                      searchable
                      placeholder="Pilih perusahaan"
                      :is-invalid="!!fieldErrors.perusahaan_id"
                    />
                    <div v-if="fieldErrors.perusahaan_id" class="invalid-feedback d-block">
                      {{ fieldErrors.perusahaan_id }}
                    </div>
                  </div>
                  <div class="col-md-4">
                    <FormLabel html-for="att-sch-tz">Timezone</FormLabel>
                    <input id="att-sch-tz" v-model="form.timezone" type="text" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <FormLabel html-for="att-sch-late">Grace terlambat (mnt)</FormLabel>
                    <input
                      id="att-sch-late"
                      v-model.number="form.late_grace_minutes"
                      type="number"
                      min="0"
                      max="240"
                      class="form-control"
                    />
                  </div>
                  <div class="col-md-4">
                    <FormLabel html-for="att-sch-early">Grace pulang cepat (mnt)</FormLabel>
                    <input
                      id="att-sch-early"
                      v-model.number="form.early_leave_grace_minutes"
                      type="number"
                      min="0"
                      max="240"
                      class="form-control"
                    />
                  </div>
                  <div class="col-12">
                    <div class="form-check form-switch">
                      <input
                        id="att-sch-default"
                        v-model="form.is_default"
                        class="form-check-input"
                        type="checkbox"
                      />
                      <label class="form-check-label" for="att-sch-default">
                        Jadikan default perusahaan
                      </label>
                    </div>
                    <small class="text-muted">
                      Default dipakai untuk pegawai yang belum punya assignment pribadi.
                    </small>
                  </div>
                </div>

                <h6 class="mt-6 mb-3">Jam kerja per hari</h6>
                <div v-if="fieldErrors.days" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ fieldErrors.days }}
                </div>
                <div class="table-responsive">
                  <table class="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Hari</th>
                        <th>Hari kerja</th>
                        <th>Mulai</th>
                        <th>Selesai</th>
                        <th>Istirahat (mnt)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="day in form.days" :key="day.day_of_week">
                        <td class="fw-medium">{{ weekdayLabel(day.day_of_week) }}</td>
                        <td>
                          <div class="form-check mb-0">
                            <input
                              :id="`att-sch-work-${day.day_of_week}`"
                              v-model="day.is_working_day"
                              class="form-check-input"
                              type="checkbox"
                              @change="onWorkingDayToggle(day)"
                            />
                          </div>
                        </td>
                        <td>
                          <input
                            v-model="day.start_time"
                            type="time"
                            class="form-control form-control-sm"
                            :disabled="!day.is_working_day"
                          />
                        </td>
                        <td>
                          <input
                            v-model="day.end_time"
                            type="time"
                            class="form-control form-control-sm"
                            :disabled="!day.is_working_day"
                          />
                        </td>
                        <td>
                          <input
                            v-model.number="day.break_minutes"
                            type="number"
                            min="0"
                            max="720"
                            class="form-control form-control-sm"
                            :disabled="!day.is_working_day"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                id="jadwal-tab-pegawai"
                data-step-id="jadwal-tab-pegawai"
                :class="paneClass('jadwal-tab-pegawai')"
              >
                <div v-if="fieldErrors.assignments" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ fieldErrors.assignments }}
                </div>
                <p class="text-muted small mb-3">
                  Tambah baris untuk memilih banyak pegawai. Kosongkan jika hanya memakai jadwal default
                  perusahaan.
                </p>
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-assign">
                    <span>Pegawai</span>
                    <span>Berlaku dari</span>
                    <span>Berlaku sampai</span>
                  </div>
                  <div
                    v-for="(row, index) in form.assignments"
                    :key="`asg-${index}`"
                    class="repeater-table-row"
                  >
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">Pegawai</span>
                      <CustomSelect2
                        v-model="row.pegawai_id"
                        :options="pegawaiOptionsForRow(index)"
                        :get-option-label="(o: any) => o?.label ?? ''"
                        :reduce="(o: any) => o?.id"
                        searchable
                        clearable
                        placeholder="Pilih pegawai"
                      />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Berlaku dari</span>
                      <input v-model="row.effective_from" type="date" class="form-control" />
                    </div>
                    <div class="repeater-cell repeater-cell-end">
                      <span class="repeater-cell-label d-md-none">Berlaku sampai</span>
                      <input
                        v-model="row.effective_to"
                        type="date"
                        class="form-control"
                        :min="row.effective_from || undefined"
                      />
                      <button
                        type="button"
                        class="repeater-delete-btn"
                        title="Hapus"
                        @click="removeAssignment(index)"
                      >
                        <i class="ri-delete-bin-6-line"></i>
                      </button>
                    </div>
                  </div>
                  <div v-if="!form.assignments.length" class="repeater-empty">
                    Belum ada pegawai. Klik tombol di bawah untuk menambahkan.
                  </div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="addAssignment">
                  <i class="ri-add-line me-1"></i>Tambah Pegawai
                </button>
              </div>
            </div>

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="saving"
              cancel-href="/hrd/kehadiran?tab=jadwal"
              previous-label="Previous"
              next-label="Next"
              submit-label="Save"
              @next="next"
              @previous="previous"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import { useTabbedFormNavigation, type TabbedFormStep } from '~/composables/useTabbedFormNavigation'
import { useKehadiranStore } from '~/stores/kehadiran'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import {
  ISO_WEEKDAYS,
  defaultWorkScheduleDays,
  emptyScheduleAssignmentRow,
  type ScheduleAssignmentRow,
  type WorkScheduleDayForm,
} from '~/constants/hrd/kehadiranForm'

const store = useKehadiranStore()
const { setDetailTitle } = useDynamicTitle()
const formRoot = ref<HTMLElement | null>(null)
const saving = ref(false)
const validationErrors = ref<string[]>([])
const fieldErrors = ref<Record<string, string>>({})
const perusahaanOptions = ref<any[]>([])
const pegawaiOptions = ref<{ id: number; label: string }[]>([])

const form = ref({
  code: '',
  name: '',
  perusahaan_id: null as number | null,
  timezone: 'Asia/Jakarta',
  late_grace_minutes: 0,
  early_leave_grace_minutes: 0,
  is_default: true,
  days: defaultWorkScheduleDays(),
  assignments: [emptyScheduleAssignmentRow()] as ScheduleAssignmentRow[],
})

const filledAssignmentCount = computed(
  () => form.value.assignments.filter((row) => row.pegawai_id).length
)

const formSteps = computed<TabbedFormStep[]>(() => [
  { id: 'jadwal-tab-info', label: 'Informasi Jadwal', icon: 'ri-time-line' },
  {
    id: 'jadwal-tab-pegawai',
    label: 'Pegawai',
    icon: 'ri-team-line',
    badge: filledAssignmentCount.value || null,
  },
])

const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  paneClass,
  validateAll,
} = useTabbedFormNavigation({
  steps: formSteps,
  formRoot,
  validateStep: validateScheduleStep,
})

const pageTitle = 'Tambah Jadwal Kerja'
const pageSubtitle = 'Buat work schedule lalu assign ke satu atau lebih pegawai.'

function weekdayLabel(n: number) {
  return ISO_WEEKDAYS.find((d) => d.day_of_week === Number(n))?.label ?? String(n)
}

function perusahaanLabel(o: any) {
  return o?.nmPerusahaan || o?.nm_perusahaan || o?.name || ''
}

function onWorkingDayToggle(day: WorkScheduleDayForm) {
  if (day.is_working_day) {
    if (!day.start_time) day.start_time = '08:00'
    if (!day.end_time) day.end_time = '17:00'
    if (!day.break_minutes) day.break_minutes = 60
    return
  }
  day.start_time = ''
  day.end_time = ''
  day.break_minutes = 0
}

function addAssignment() {
  form.value.assignments.push(emptyScheduleAssignmentRow())
}

function removeAssignment(index: number) {
  form.value.assignments.splice(index, 1)
}

function pegawaiOptionsForRow(index: number) {
  const taken = new Set(
    form.value.assignments
      .map((row, i) => (i === index ? null : row.pegawai_id))
      .filter((id): id is number => id != null)
  )
  return pegawaiOptions.value.filter((o) => !taken.has(o.id))
}

function clearErrors() {
  validationErrors.value = []
  fieldErrors.value = {}
}

function fail(field: string, message: string) {
  fieldErrors.value[field] = message
  if (!validationErrors.value.includes(message)) validationErrors.value.push(message)
  return false
}

function validateInfoTab() {
  let ok = true
  if (!form.value.code.trim()) {
    fail('code', 'Kode wajib diisi.')
    ok = false
  }
  if (!form.value.name.trim()) {
    fail('name', 'Nama wajib diisi.')
    ok = false
  }
  if (!form.value.perusahaan_id) {
    fail('perusahaan_id', 'Perusahaan wajib dipilih.')
    ok = false
  }
  for (const day of form.value.days) {
    if (day.is_working_day && (!day.start_time || !day.end_time)) {
      fail('days', `Hari ${weekdayLabel(day.day_of_week)} wajib memiliki jam mulai dan jam selesai.`)
      ok = false
      break
    }
  }
  return ok
}

function validatePegawaiTab() {
  const filled = form.value.assignments.filter((row) => row.pegawai_id)
  if (!form.value.is_default && !filled.length) {
    return fail(
      'assignments',
      'Pilih minimal satu pegawai, atau centang jadwal sebagai default perusahaan.'
    )
  }
  for (const row of filled) {
    if (!row.effective_from) {
      return fail('assignments', 'Setiap pegawai yang dipilih wajib memiliki tanggal berlaku dari.')
    }
    if (row.effective_to && row.effective_to < row.effective_from) {
      return fail('assignments', 'Tanggal berlaku sampai tidak boleh sebelum tanggal berlaku dari.')
    }
  }
  return true
}

function validateScheduleStep(step: TabbedFormStep) {
  clearErrors()
  if (step.id === 'jadwal-tab-info') return validateInfoTab()
  if (step.id === 'jadwal-tab-pegawai') return validatePegawaiTab()
  return true
}

async function loadOptions() {
  const { $api } = useNuxtApp()
  try {
    const [perusahaanRes, pegawaiRes] = await Promise.all([
      fetch($api.dataPerusahaan(), { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
      fetch($api.dataPegawai(), { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
    ])
    const perusahaanList = perusahaanRes?.data ?? perusahaanRes ?? []
    perusahaanOptions.value = Array.isArray(perusahaanList) ? perusahaanList : []
    const pegawaiList = pegawaiRes?.data ?? pegawaiRes ?? []
    pegawaiOptions.value = (Array.isArray(pegawaiList) ? pegawaiList : []).map((p: any) => ({
      id: Number(p.id_pegawai ?? p.idPegawai ?? p.id),
      label: `${p.nm_pegawai ?? p.nmPegawai ?? '-'} (${p.nik_pegawai ?? p.nikPegawai ?? p.id_pegawai ?? p.idPegawai ?? ''})`,
    }))
  } catch {
    perusahaanOptions.value = []
    pegawaiOptions.value = []
  }
}

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await save()
}

async function save() {
  const toast = useToast()
  saving.value = true
  clearErrors()
  try {
    const created = await store.createSchedule({
      perusahaan_id: form.value.perusahaan_id,
      code: form.value.code.trim(),
      name: form.value.name.trim(),
      timezone: form.value.timezone.trim() || 'Asia/Jakarta',
      late_grace_minutes: Number(form.value.late_grace_minutes) || 0,
      early_leave_grace_minutes: Number(form.value.early_leave_grace_minutes) || 0,
      is_default: form.value.is_default,
      is_active: true,
      days: form.value.days.map((d) => ({
        day_of_week: d.day_of_week,
        is_working_day: d.is_working_day,
        start_time: d.is_working_day ? d.start_time : null,
        end_time: d.is_working_day ? d.end_time : null,
        break_minutes: d.is_working_day ? Number(d.break_minutes) || 0 : 0,
      })),
    })

    const scheduleId = Number(created?.id)
    const filled = form.value.assignments.filter((row) => row.pegawai_id)
    const failed: string[] = []
    if (scheduleId && filled.length) {
      for (const row of filled) {
        try {
          await store.createScheduleAssignment({
            pegawai_id: Number(row.pegawai_id),
            schedule_id: scheduleId,
            effective_from: row.effective_from,
            effective_to: row.effective_to || null,
          })
        } catch (e) {
          const err = normalizeApiError(e, 'Assignment gagal')
          const label =
            pegawaiOptions.value.find((o) => o.id === row.pegawai_id)?.label || String(row.pegawai_id)
          failed.push(`${label}: ${err.message}`)
        }
      }
    }

    if (failed.length) {
      validationErrors.value = ['Jadwal dibuat, tetapi sebagian assignment gagal.', ...failed]
      toast.success({
        title: 'Sebagian berhasil',
        message: 'Jadwal tersimpan. Periksa assignment yang gagal.',
        color: 'green',
      })
      return
    }

    toast.success({ title: 'Berhasil', message: 'Jadwal kerja dibuat', color: 'green' })
    await navigateTo('/hrd/kehadiran?tab=jadwal')
  } catch (e) {
    const normalized = normalizeApiError(e, 'Gagal membuat jadwal kerja')
    const fieldMessages = normalized.fieldErrorList?.map((x) => x.message).filter(Boolean) ?? []
    validationErrors.value = fieldMessages.length ? fieldMessages : [normalized.message]
    toastNormalizedError(normalized)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  setDetailTitle('Jadwal Kerja', 'Baru', false)
  await loadOptions()
})
</script>

<style scoped>
.repeater-table {
  border: 1px solid #dee2e6;
  border-radius: 10px;
}
.repeater-table-head {
  background: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
  border-radius: 10px 10px 0 0;
  padding: 8px 16px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6c757d;
  gap: 12px;
  align-items: center;
}
.repeater-table-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-end;
}
.repeater-table-row:last-child {
  border-bottom: none;
}
.repeater-cell {
  display: flex;
  flex-direction: column;
  flex: 1 1 140px;
  min-width: 0;
}
.repeater-cell-main {
  flex: 3 1 240px;
}
.repeater-cell-end {
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
}
.repeater-cell-end .form-control {
  flex: 1 1 0;
  min-width: 0;
}
.repeater-cell-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 4px;
}
.repeater-cols-assign {
  grid-template-columns: 3fr 1.2fr 1.6fr;
}
.repeater-delete-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #f1aeb5;
  border-radius: 6px;
  color: #f13636;
  cursor: pointer;
}
.repeater-delete-btn:hover {
  background: #f13636;
  color: #fff;
  border-color: #f13636;
}
.repeater-empty {
  padding: 20px 16px;
  text-align: center;
  color: #adb5bd;
  font-size: 0.875rem;
}
</style>
