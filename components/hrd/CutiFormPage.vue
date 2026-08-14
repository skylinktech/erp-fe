<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="initializing" class="d-flex justify-content-center align-items-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/hrd/cuti" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i> Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <!-- Form column -->
          <div class="col-lg-8 col-12">
            <div class="card">
              <div class="card-header d-flex align-items-center gap-2">
                <i class="ri-edit-2-line"></i>
                <h6 class="mb-0">Form Pengajuan</h6>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleSubmit" novalidate>
                  <div v-if="store.validationErrors?.length" class="alert alert-warning mb-4">
                    <ul class="mb-0 ps-3">
                      <li v-for="(err, i) in store.validationErrors" :key="i">{{ err }}</li>
                    </ul>
                  </div>

                  <!-- Tipe cuti -->
                  <div class="row mb-3">
                    <div class="col-md-12">
                      <label class="form-label">Tipe Cuti <span class="text-danger">*</span></label>
                      <select
                        v-model.number="store.form.cuti_type_id"
                        class="form-select"
                        required
                      >
                        <option :value="null" disabled>— Pilih tipe —</option>
                        <option v-for="t in activeCutiTypes" :key="t.id" :value="t.id">
                          {{ t.nmTipeCuti }} ({{ t.kodeCuti }})
                        </option>
                      </select>
                      <small v-if="selectedType" class="form-text text-muted">
                        {{ selectedType.deskripsi || '—' }}
                      </small>
                    </div>

                    <div class="col-md-6 d-flex align-items-end">
                      <div v-if="isIzinSelected" class="form-check form-switch mt-2">
                        <input
                          id="izinPerJam"
                          v-model="store.form.is_per_jam"
                          class="form-check-input"
                          type="checkbox"
                        />
                        <label class="form-check-label" for="izinPerJam">
                          Izin <strong>per jam</strong>
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Tanggal -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label class="form-label">
                        Tanggal Mulai <span class="text-danger">*</span>
                      </label>
                      <input
                        v-model="store.form.tanggalMulai"
                        type="date"
                        class="form-control"
                        :min="minTanggalMulai"
                        required
                        @change="syncTanggalSelesaiIfPerJam"
                      />
                      <small v-if="leadTimeHint" class="form-text text-muted">
                        <i class="ri-information-line"></i> {{ leadTimeHint }}
                      </small>
                      <small v-if="leadTimeError" class="form-text text-danger">
                        <i class="ri-error-warning-line"></i> {{ leadTimeError }}
                      </small>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">
                        Tanggal Selesai <span class="text-danger">*</span>
                      </label>
                      <input
                        v-model="store.form.tanggalSelesai"
                        type="date"
                        class="form-control"
                        :min="store.form.tanggalMulai || minTanggalMulai"
                        :disabled="store.form.is_per_jam"
                        required
                      />
                      <small v-if="store.form.is_per_jam" class="form-text text-muted">
                        Izin per jam berlaku di tanggal yang sama
                      </small>
                    </div>
                  </div>

                  <!-- Jam (jika per jam) -->
                  <div v-if="store.form.is_per_jam" class="row mb-3">
                    <div class="col-md-6">
                      <label class="form-label">
                        Jam Mulai <span class="text-danger">*</span>
                      </label>
                      <input
                        v-model="store.form.jam_mulai"
                        type="time"
                        class="form-control"
                        required
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">
                        Jam Selesai <span class="text-danger">*</span>
                      </label>
                      <input
                        v-model="store.form.jam_selesai"
                        type="time"
                        class="form-control"
                        required
                      />
                    </div>
                  </div>

                  <!-- Alasan -->
                  <div class="mb-3">
                    <label class="form-label">
                      Alasan <span class="text-danger">*</span>
                    </label>
                    <textarea
                      v-model="store.form.alasan"
                      class="form-control"
                      rows="3"
                      maxlength="500"
                      required
                      placeholder="Jelaskan alasan pengajuan…"
                    ></textarea>
                  </div>

                  <!-- Attachment -->
                  <div class="mb-3">
                    <label class="form-label">
                      Lampiran
                      <span v-if="requiresDoctorNote" class="text-danger"
                        >* (Surat dokter wajib)</span
                      >
                    </label>
                    <input
                      type="file"
                      class="form-control"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      @change="onFileChange"
                    />
                    <div v-if="store.form.attachmentUrl" class="form-text mt-2">
                      <a :href="getAttachmentUrl(store.form.attachmentUrl)" target="_blank" rel="noopener">
                        <i class="ri-attachment-2 me-1"></i>Lampiran sebelumnya
                      </a>
                    </div>
                    <small class="form-text text-muted">
                      Format: PDF / JPG / PNG / WEBP. Maks 5MB.
                    </small>
                  </div>

                  <!-- Auto submit (create only) -->
                  <div v-if="!store.isEditMode" class="form-check form-switch mb-4">
                    <input
                      id="autoSubmit"
                      v-model="store.form.auto_submit"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label class="form-check-label" for="autoSubmit">
                      Langsung kirim ke approval setelah disimpan
                    </label>
                  </div>

                  <!-- Actions -->
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <NuxtLink to="/hrd/cuti" class="btn btn-outline-secondary">
                      Batal
                    </NuxtLink>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="store.saving || !!leadTimeError"
                    >
                      <span
                        v-if="store.saving"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      {{ store.isEditMode ? 'Simpan Perubahan' : 'Simpan' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Info column -->
          <div class="col-lg-4 col-12">
            <div class="card mb-4">
              <div class="card-header d-flex align-items-center gap-2">
                <i class="ri-information-line"></i>
                <h6 class="mb-0">Ringkasan Pengajuan</h6>
              </div>
              <div class="card-body small">
                <dl class="row mb-0">
                  <dt class="col-5 text-muted">Tipe</dt>
                  <dd class="col-7">{{ selectedType?.nmTipeCuti || '-' }}</dd>

                  <dt class="col-5 text-muted">Durasi</dt>
                  <dd class="col-7">{{ summaryDurasi }}</dd>

                  <dt class="col-5 text-muted">Rentang</dt>
                  <dd class="col-7">{{ summaryRange }}</dd>

                  <dt v-if="selectedType?.jatahCuti" class="col-5 text-muted">Jatah Tipe</dt>
                  <dd v-if="selectedType?.jatahCuti" class="col-7">
                    {{ selectedType.jatahCuti }} hari / tahun
                  </dd>

                  <template v-if="isCutiTahunanSelected && ctBalanceSummary">
                    <dt class="col-5 text-muted">Sisa Cuti Tahunan</dt>
                    <dd class="col-7">
                      <strong>{{ ctBalanceSummary.sisa }}</strong> hari
                      <span v-if="store.balancesLoading" class="text-muted"> (memuat…)</span>
                    </dd>
                    <dt v-if="ctBalanceSummary.cutiBersama > 0" class="col-5 text-muted">Cuti Bersama</dt>
                    <dd v-if="ctBalanceSummary.cutiBersama > 0" class="col-7">
                      -{{ ctBalanceSummary.cutiBersama }} hari
                    </dd>
                  </template>
                </dl>
              </div>
            </div>

            <div v-if="isCutiTahunanSelected && ctBalanceSummary" class="card border-info mb-4">
              <div class="card-body small">
                <strong class="text-info">
                  <i class="ri-information-line me-1"></i>Saldo Cuti Tahunan
                </strong>
                <p class="mb-0 mt-2">
                  Jatah {{ ctBalanceSummary.jatah }} hari/tahun.
                  <span v-if="ctBalanceSummary.cutiBersama > 0">
                    Sudah dipotong cuti bersama {{ ctBalanceSummary.cutiBersama }} hari.
                  </span>
                  Sisa yang dapat diajukan: <strong>{{ ctBalanceSummary.sisa }} hari</strong>.
                </p>
              </div>
            </div>

            <div v-if="isSakitSelected" class="card border-warning">
              <div class="card-body small">
                <strong class="text-warning">
                  <i class="ri-error-warning-line me-1"></i>Catatan untuk Cuti Sakit:
                </strong>
                <ul class="mb-0 ps-3 mt-2">
                  <li>Boleh diajukan backdated maksimum 7 hari terakhir.</li>
                  <li>Cuti sakit 1–2 hari: lampiran opsional.</li>
                  <li>Cuti sakit lebih dari 2 hari: wajib lampirkan surat dokter / keterangan sakit.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, navigateTo } from '#app'
import { useCutiStore, type CutiTypeRow } from '~/stores/cuti'
import {
  KODE_CUTI_IZIN,
  KODE_CUTI_SAKIT,
  KODE_CUTI_TAHUNAN,
  MAX_BACKDATE_SAKIT_DAYS,
  MIN_LEAD_TIME_DAYS_CUTI,
  formatDurasiCuti,
  formatRangeTanggal,
  minTanggalMulaiByKode,
  computeKonsumsiSaldo,
  requiresSakitDoctorNote,
} from '~/constants/hrd/cutiForm'

const route = useRoute()
const router = useRouter()
const store = useCutiStore()
const { getAttachmentUrl } = useImageUrl()

const initializing = ref(true)

const cutiIdParam = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

const pageTitle = computed(() =>
  store.isEditMode ? 'Edit Pengajuan Cuti' : 'Pengajuan Cuti / Izin / Sakit'
)
const pageSubtitle = computed(() =>
  store.isEditMode
    ? 'Ubah detail pengajuan yang masih berstatus draft / ditolak.'
    : 'Isi formulir di bawah untuk mengajukan cuti, izin, atau sakit.'
)

const activeCutiTypes = computed(() => store.cutiTypes.filter((t) => t.isActive))
const selectedType = computed<CutiTypeRow | null>(
  () => activeCutiTypes.value.find((t) => t.id === store.form.cuti_type_id) || null
)
const isIzinSelected = computed(() => selectedType.value?.kodeCuti === KODE_CUTI_IZIN)
const isSakitSelected = computed(() => selectedType.value?.kodeCuti === KODE_CUTI_SAKIT)
const isCutiTahunanSelected = computed(() => selectedType.value?.kodeCuti === KODE_CUTI_TAHUNAN)

const ctBalanceSummary = computed(() => {
  const row = store.balances.find((b) => b.cuti_type.kodeCuti === KODE_CUTI_TAHUNAN)
  if (!row) return null
  return {
    jatah: row.cuti_type.jatahCuti,
    sisa: row.balance.sisa_jatah_cuti,
    cutiBersama: row.cuti_bersama_total ?? 0,
  }
})

async function refreshBalanceForForm() {
  const tahun = store.form.tanggalMulai
    ? new Date(store.form.tanggalMulai).getFullYear()
    : new Date().getFullYear()

  if (store.form.pegawai_id) {
    await store.fetchBalances(store.form.pegawai_id, tahun)
  } else {
    await store.fetchMyBalances(tahun)
  }
}

watch(
  () => [store.form.cuti_type_id, store.form.tanggalMulai, store.form.pegawai_id] as const,
  () => {
    if (isCutiTahunanSelected.value) {
      void refreshBalanceForForm()
    }
  }
)

/**
 * Minimum tanggal untuk input `<input type="date">` start.
 * Sinkron dengan rule backend di `CutiService.assertTanggalMulaiValid`:
 *   - Sakit: today - MAX_BACKDATE_SAKIT_DAYS
 *   - Izin:  today
 *   - Lain:  today + MIN_LEAD_TIME_DAYS_CUTI (lead time)
 */
const minTanggalMulai = computed(() =>
  minTanggalMulaiByKode(selectedType.value?.kodeCuti)
)

/** Pesan helper di bawah field tanggal mulai untuk transparansi aturan. */
const leadTimeHint = computed(() => {
  if (!selectedType.value) return ''
  if (isSakitSelected.value) {
    return `Cuti Sakit boleh diajukan untuk tanggal hingga ${MAX_BACKDATE_SAKIT_DAYS} hari ke belakang.`
  }
  if (isIzinSelected.value) {
    return 'Izin boleh diajukan untuk hari ini atau ke depan.'
  }
  return `${selectedType.value.nmTipeCuti} wajib diajukan minimal ${MIN_LEAD_TIME_DAYS_CUTI} hari sebelum tanggal mulai (paling cepat: ${formatTanggalDisplay(minTanggalMulai.value)}).`
})

/** Validasi real-time: tampilkan error kalau user override input ke tanggal invalid. */
const leadTimeError = computed(() => {
  if (!store.form.tanggalMulai || !selectedType.value) return ''
  if (store.form.tanggalMulai < minTanggalMulai.value) {
    if (isSakitSelected.value) {
      return `Tanggal terlalu jauh ke belakang. Maksimum ${MAX_BACKDATE_SAKIT_DAYS} hari yang lalu.`
    }
    if (isIzinSelected.value) {
      return 'Tanggal tidak boleh kurang dari hari ini.'
    }
    return `Pengajuan ${selectedType.value.nmTipeCuti} minimal ${MIN_LEAD_TIME_DAYS_CUTI} hari sebelum tanggal mulai.`
  }
  return ''
})

function formatTanggalDisplay(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const summaryDurasi = computed(() => {
  return formatDurasiCuti({
    is_per_jam: store.form.is_per_jam,
    jam_mulai: store.form.jam_mulai,
    jam_selesai: store.form.jam_selesai,
    durasi_jam: durasiJamComputed.value,
    lama_cuti: lamaHariComputed.value,
  })
})

const summaryRange = computed(() =>
  store.form.tanggalMulai && store.form.tanggalSelesai
    ? formatRangeTanggal(store.form.tanggalMulai, store.form.tanggalSelesai)
    : '-'
)

const durasiJamComputed = computed(() => {
  if (!store.form.is_per_jam || !store.form.jam_mulai || !store.form.jam_selesai) return 0
  const [hs, ms] = store.form.jam_mulai.split(':').map(Number)
  const [he, me] = store.form.jam_selesai.split(':').map(Number)
  const start = hs * 60 + ms
  const end = he * 60 + me
  if (end <= start) return 0
  return +((end - start) / 60).toFixed(2)
})

const lamaHariComputed = computed(() =>
  computeKonsumsiSaldo({
    is_per_jam: store.form.is_per_jam,
    tanggalMulai: store.form.tanggalMulai,
    tanggalSelesai: store.form.tanggalSelesai,
  })
)

const requiresDoctorNote = computed(
  () => isSakitSelected.value && requiresSakitDoctorNote(lamaHariComputed.value)
)

function syncTanggalSelesaiIfPerJam() {
  if (store.form.is_per_jam && store.form.tanggalMulai) {
    store.form.tanggalSelesai = store.form.tanggalMulai
  }
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  store.form.attachment = f || null
}

async function handleSubmit() {
  // Validasi cepat sebelum hit API
  if (!store.form.cuti_type_id) return alertErr('Tipe cuti wajib dipilih')
  if (!store.form.tanggalMulai || !store.form.tanggalSelesai)
    return alertErr('Tanggal mulai & selesai wajib diisi')
  if (!store.form.alasan?.trim() || store.form.alasan.trim().length < 3)
    return alertErr('Alasan minimal 3 karakter')
  if (store.form.is_per_jam && (!store.form.jam_mulai || !store.form.jam_selesai))
    return alertErr('Jam mulai & selesai wajib diisi untuk izin per jam')

  syncTanggalSelesaiIfPerJam()

  if (requiresDoctorNote.value) {
    const hasFile = store.form.attachment instanceof File
    const hasExisting = !!store.form.attachmentUrl
    if (!hasFile && !hasExisting) {
      return alertErr('Cuti sakit lebih dari 2 hari wajib melampirkan surat dokter')
    }
  }

  const saved = await store.save()
  if (saved) await navigateTo('/hrd/cuti')
}

function alertErr(msg: string) {
  useToast().error({ title: 'Form belum lengkap', message: msg, color: 'red' })
}

onMounted(async () => {
  if (!store.cutiTypes.length) await store.fetchCutiTypes()

  if (cutiIdParam.value) {
    // Edit mode — fetch single record dulu via list filter
    try {
      const { $api } = useNuxtApp()
      const res = await fetch(`${$api.cutiShow(cutiIdParam.value)}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data?.data) {
        store.openEdit(data.data)
        if (data.data.cutiType?.kodeCuti === KODE_CUTI_TAHUNAN || data.data.cutiTypeId) {
          const ctType = store.cutiTypes.find(
            (t) => t.id === data.data.cutiTypeId && t.kodeCuti === KODE_CUTI_TAHUNAN
          )
          if (ctType) await refreshBalanceForForm()
        }
      } else {
        useToast().error({
          title: 'Error',
          message: data?.message || 'Pengajuan cuti tidak ditemukan',
          color: 'red',
        })
        await router.push('/hrd/cuti')
      }
    } catch (e: any) {
      useToast().error({
        title: 'Error',
        message: e.message || 'Gagal memuat data cuti',
        color: 'red',
      })
      await router.push('/hrd/cuti')
    }
  } else {
    store.openCreate()
  }

  if (store.form.cuti_type_id) {
    const selected = store.cutiTypes.find((t) => t.id === store.form.cuti_type_id)
    if (selected?.kodeCuti === KODE_CUTI_TAHUNAN) {
      await refreshBalanceForForm()
    }
  }

  initializing.value = false
})
</script>
