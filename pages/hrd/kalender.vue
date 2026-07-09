<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 class="mb-1">Kalender HR</h4>
          <p class="mb-0 text-muted">
            Kelola libur nasional, event perusahaan, dan cuti bersama. Klik tanggal untuk menambah, klik event untuk mengedit.
          </p>
        </div>
        <button
          v-if="canCreate"
          type="button"
          class="btn btn-primary"
          @click="openCreateToday"
        >
          <i class="ri-add-line me-1"></i>
          Tambah Event
        </button>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <span class="avatar avatar-md">
                <span class="avatar-initial rounded bg-label-danger">
                  <i class="ri-flag-line"></i>
                </span>
              </span>
              <div>
                <h5 class="mb-0">{{ stats.liburNasional }}</h5>
                <small class="text-muted">Libur nasional (bulan ini)</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <span class="avatar avatar-md">
                <span class="avatar-initial rounded bg-label-primary">
                  <i class="ri-calendar-event-line"></i>
                </span>
              </span>
              <div>
                <h5 class="mb-0">{{ stats.eventPerusahaan }}</h5>
                <small class="text-muted">Event perusahaan (bulan ini)</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <span class="avatar avatar-md">
                <span class="avatar-initial rounded bg-label-warning">
                  <i class="ri-team-line"></i>
                </span>
              </span>
              <div>
                <h5 class="mb-0">{{ stats.cutiBersama }}</h5>
                <small class="text-muted">Cuti bersama (bulan ini)</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <p class="mb-2 small fw-medium">Legenda</p>
              <div class="d-flex flex-column gap-2 small">
                <span class="d-inline-flex align-items-center gap-1">
                  <span class="legend-dot bg-danger"></span> Libur Nasional
                </span>
                <span class="d-inline-flex align-items-center gap-1">
                  <span class="legend-dot bg-primary"></span> Event Perusahaan
                </span>
                <span class="d-inline-flex align-items-center gap-1">
                  <span class="legend-dot bg-warning"></span> Cuti Bersama
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body position-relative">
          <div v-if="store.loading" class="calendar-loading-overlay">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Memuat...</span>
            </div>
          </div>
          <ClientOnly>
            <HrCalendarView
              :events="store.events"
              :loading="store.loading"
              @date-click="onDateClick"
              @event-click="onEventClick"
              @dates-change="onDatesChange"
            />
            <template #fallback>
              <div class="text-center py-5 text-muted">Memuat kalender…</div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>

    <Modal
      id="HrKalenderModal"
      :title="modalTitle"
      :description="modalDescription"
      :validation-errors-from-parent="store.validationErrors"
      dialog-class="modal-lg"
    >
      <form @submit.prevent="handleSave">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="form-floating form-floating-outline">
              <input
                id="hr-kal-nama"
                v-model="store.form.nama"
                type="text"
                class="form-control"
                placeholder="Nama event / libur"
                required
                maxlength="255"
              />
              <label for="hr-kal-nama">Nama</label>
            </div>
          </div>
          <div class="col-md-6">
            <select
              v-model="store.form.tipe"
              class="form-select"
              @change="onTipeChange"
            >
              <option
                v-for="opt in HR_CALENDAR_TIPE_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Tanggal Mulai</label>
            <input
              v-model="store.form.tanggal_mulai"
              type="date"
              class="form-control"
              required
              @change="syncEndIfEmpty"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Tanggal Selesai</label>
            <input
              v-model="store.form.tanggal_selesai"
              type="date"
              class="form-control"
              :min="store.form.tanggal_mulai"
            />
            <small class="text-muted">Kosongkan jika hanya 1 hari.</small>
          </div>
          <div class="col-12">
            <label class="form-label">Deskripsi</label>
            <textarea
              v-model="store.form.deskripsi"
              class="form-control"
              rows="3"
              maxlength="1000"
              placeholder="Keterangan opsional…"
            ></textarea>
          </div>
          <div class="col-12" v-if="store.form.tipe === HR_CALENDAR_TIPE_CUTI_BERSAMA">
            <div class="alert alert-warning mb-0 small">
              <i class="ri-error-warning-line me-1"></i>
              <strong>Cuti Bersama</strong> akan memotong saldo
              <strong>Cuti Tahunan (CT)</strong> seluruh pegawai aktif pada rentang tanggal ini
              ({{ cutiBersamaPreviewDays }} hari).
              Pastikan jatah cuti tahunan pegawai mencukupi.
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Warna (opsional)</label>
            <input
              v-model="store.form.warna"
              type="color"
              class="form-control form-control-color w-100"
            />
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <p class="small text-muted mb-2">
              Rentang:
              <strong>{{
                formatHrCalendarRange(store.form.tanggal_mulai, store.form.tanggal_selesai || store.form.tanggal_mulai)
              }}</strong>
            </p>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-6">
          <div>
            <button
              v-if="store.isEditMode && canDelete && store.form.id"
              type="button"
              class="btn btn-outline-danger"
              :disabled="store.saving"
              @click="handleDelete"
            >
              <i class="ri-delete-bin-7-line me-1"></i>
              Hapus
            </button>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="store.closeModal()">
              Tutup
            </button>
            <button
              v-if="canSave"
              type="submit"
              class="btn btn-primary"
              :disabled="store.saving"
            >
              <span
                v-if="store.saving"
                class="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              {{ store.isEditMode ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </form>
    </Modal>

    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '~/components/modal/Modal.vue'
import HrCalendarView from '~/components/hrd/HrCalendarView.vue'
import { useHrCalendarStore } from '~/stores/hr-calendar'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  HR_CALENDAR_TIPE_CUTI_BERSAMA,
  HR_CALENDAR_TIPE_EVENT,
  HR_CALENDAR_TIPE_LIBUR_NASIONAL,
  HR_CALENDAR_TIPE_OPTIONS,
  computeHrCalendarInclusiveDays,
  formatHrCalendarRange,
  getHrCalendarColor,
  type HrCalendarFullCalendarEvent,
} from '~/constants/hrd/hrCalendar'

const store = useHrCalendarStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const { showModal } = storeToRefs(store)

const canCreate = computed(
  () => userHasRole('superadmin') || userHasPermission('create_kalender')
)
const canEdit = computed(
  () => userHasRole('superadmin') || userHasPermission('edit_kalender')
)
const canDelete = computed(
  () => userHasRole('superadmin') || userHasPermission('delete_kalender')
)
const canSave = computed(() => (store.isEditMode ? canEdit.value : canCreate.value))

const modalTitle = computed(() =>
  store.isEditMode ? 'Edit Event Kalender' : 'Tambah Event Kalender'
)
const modalDescription = computed(() =>
  store.isEditMode
    ? 'Perbarui detail libur nasional, event perusahaan, atau cuti bersama.'
    : 'Isi detail untuk tanggal yang dipilih. Cuti bersama otomatis memotong saldo cuti tahunan pegawai.'
)

const stats = computed(() => {
  let liburNasional = 0
  let eventPerusahaan = 0
  let cutiBersama = 0
  for (const ev of store.events) {
    if (ev.extendedProps.tipe === HR_CALENDAR_TIPE_LIBUR_NASIONAL) liburNasional++
    else if (ev.extendedProps.tipe === HR_CALENDAR_TIPE_EVENT) eventPerusahaan++
    else if (ev.extendedProps.tipe === HR_CALENDAR_TIPE_CUTI_BERSAMA) cutiBersama++
  }
  return { liburNasional, eventPerusahaan, cutiBersama }
})

const cutiBersamaPreviewDays = computed(() =>
  computeHrCalendarInclusiveDays(
    store.form.tanggal_mulai,
    store.form.tanggal_selesai || store.form.tanggal_mulai
  )
)

let modalInstance: bootstrap.Modal | null = null
const datesInitialized = ref(false)

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function openCreateToday() {
  store.openModalForDate(todayIso(), HR_CALENDAR_TIPE_EVENT)
}

function onDateClick(dateStr: string) {
  if (!canCreate.value) {
    useToast().info({
      title: 'Info',
      message: 'Anda tidak memiliki izin untuk menambah event kalender.',
      color: 'blue',
    })
    return
  }
  store.openModalForDate(dateStr, HR_CALENDAR_TIPE_LIBUR_NASIONAL)
}

function onEventClick(event: HrCalendarFullCalendarEvent) {
  if (!canEdit.value) {
    useToast().info({
      title: 'Info',
      message: 'Anda tidak memiliki izin untuk mengedit event kalender.',
      color: 'blue',
    })
    return
  }
  store.openModalForEvent(event)
}

function onDatesChange(range: { start: string; end: string }) {
  void store.fetchCalendarEvents(range.start, range.end)
  datesInitialized.value = true
}

function syncEndIfEmpty() {
  if (!store.form.tanggal_selesai) {
    store.form.tanggal_selesai = store.form.tanggal_mulai
  }
}

function onTipeChange() {
  if (!store.form.warna || store.form.warna === getHrCalendarColor(HR_CALENDAR_TIPE_LIBUR_NASIONAL) || store.form.warna === getHrCalendarColor(HR_CALENDAR_TIPE_EVENT)) {
    store.form.warna = getHrCalendarColor(store.form.tipe)
  }
}

async function handleSave() {
  if (!canSave.value) return
  if (
    store.form.tanggal_selesai &&
    store.form.tanggal_mulai &&
    store.form.tanggal_selesai < store.form.tanggal_mulai
  ) {
    store.validationErrors = ['Tanggal selesai tidak boleh sebelum tanggal mulai']
    return
  }
  await store.saveEvent()
}

async function handleDelete() {
  if (!store.form.id || !canDelete.value) return
  await store.deleteEvent(store.form.id)
}

onMounted(() => {
  setListTitle('Kalender HR')
  const modalElement = document.getElementById('HrKalenderModal')
  if (modalElement) {
    modalInstance = new bootstrap.Modal(modalElement)
  }
})

watch(showModal, (open) => {
  if (open) modalInstance?.show()
  else modalInstance?.hide()
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Kalender HR',
  description: 'HR Calendar — libur nasional & event',
})
</script>

<style scoped>
.calendar-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 0.375rem;
  /* Jangan blok klik tanggal saat fetch bulan berikutnya */
  pointer-events: none;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
</style>
