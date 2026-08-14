<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="initializing" class="d-flex justify-content-center py-10">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <template v-else>
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/hrd/lembur" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i> Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Form Pengajuan Lembur (SPKL)</h6>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleSubmit">
                  <div v-if="store.validationErrors?.length" class="alert alert-warning">
                    <ul class="mb-0 ps-3">
                      <li v-for="(err, i) in store.validationErrors" :key="i">{{ err }}</li>
                    </ul>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label class="form-label">Tanggal Lembur <span class="text-danger">*</span></label>
                      <input v-model="store.form.tanggal" type="date" class="form-control" :max="todayIso" :min="minDateIso" required @change="refreshSummary" />
                      <small class="text-muted">Maks. backdate {{ MAX_BACKDATE_LEMBUR_DAYS }} hari (PP 35/2021)</small>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Tipe Hari <span class="text-danger">*</span></label>
                      <select v-model="store.form.tipe_hari" class="form-select" required>
                        <option v-for="o in TIPE_HARI_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-4">
                      <label class="form-label">Jam Mulai <span class="text-danger">*</span></label>
                      <input v-model="store.form.jam_mulai" type="time" class="form-control" required />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Jam Selesai <span class="text-danger">*</span></label>
                      <input v-model="store.form.jam_selesai" type="time" class="form-control" required />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Istirahat (menit)</label>
                      <input v-model.number="store.form.istirahat_menit" type="number" min="0" max="480" class="form-control" />
                    </div>
                  </div>

                  <div v-if="durasiPreview != null" class="alert alert-info py-2 mb-3">
                    <strong>Durasi lembur:</strong> {{ formatDurasiJam(durasiPreview) }}
                    <span v-if="durasiPreview > MAX_LEMBUR_JAM_HARI" class="text-danger ms-2">
                      (melebihi batas {{ MAX_LEMBUR_JAM_HARI }} jam/hari)
                    </span>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Pekerjaan / Tugas yang Dilakukan <span class="text-danger">*</span></label>
                    <textarea v-model="store.form.pekerjaan" class="form-control" rows="2" required maxlength="500" placeholder="Uraian pekerjaan lembur..."></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Alasan / Dasar Lembur <span class="text-danger">*</span></label>
                    <textarea v-model="store.form.alasan" class="form-control" rows="2" required maxlength="500" placeholder="Alasan kebutuhan lembur..."></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Lampiran (SPKL / surat perintah)</label>
                    <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.webp" @change="onFileChange" />
                    <small class="text-muted">PDF atau gambar, maks. 5MB</small>
                    <div v-if="store.form.attachmentUrl && !store.form.attachment" class="mt-2">
                      <a :href="getAttachmentUrl(store.form.attachmentUrl)" target="_blank" rel="noopener">Lihat lampiran saat ini</a>
                    </div>
                  </div>

                  <div v-if="!store.isEditMode" class="form-check mb-3">
                    <input id="autoSubmit" v-model="store.form.auto_submit" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="autoSubmit">Langsung ajukan ke approval setelah simpan</label>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <NuxtLink to="/hrd/lembur" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="store.saving">
                      {{ store.saving ? 'Menyimpan...' : store.isEditMode ? 'Perbarui' : 'Simpan' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card mb-4">
              <div class="card-body">
                <h6 class="mb-3">Kuota Lembur Minggu Ini</h6>
                <div v-if="store.weeklySummaryLoading" class="text-muted small">Memuat...</div>
                <template v-else-if="store.weeklySummary">
                  <p class="mb-1 small"><strong>Periode:</strong> {{ store.weeklySummary.minggu_mulai }} s/d {{ store.weeklySummary.minggu_selesai }}</p>
                  <p class="mb-1 small"><strong>Terpakai:</strong> {{ formatDurasiJam(store.weeklySummary.total_jam_minggu) }}</p>
                  <p class="mb-0 small"><strong>Sisa kuota:</strong> {{ formatDurasiJam(store.weeklySummary.sisa_kuota_minggu) }}</p>
                  <div class="progress mt-2" style="height: 8px">
                    <div
                      class="progress-bar"
                      :class="weeklyPct > 90 ? 'bg-danger' : 'bg-primary'"
                      :style="{ width: `${weeklyPct}%` }"
                    ></div>
                  </div>
                </template>
              </div>
            </div>

            <div class="card">
              <div class="card-body small text-muted">
                <h6 class="text-body mb-2">Ketentuan Indonesia (PP 35/2021)</h6>
                <ul class="ps-3 mb-0">
                  <li>Maks. {{ MAX_LEMBUR_JAM_HARI }} jam/hari</li>
                  <li>Maks. {{ MAX_LEMBUR_JAM_MINGGU }} jam/minggu</li>
                  <li>Hari kerja: jam 1 = 1.5×, jam 2+ = 2× upah/jam</li>
                  <li>Hari libur: jam 1–8 = 2×, jam 9 = 3×, jam 10–11 = 4×</li>
                  <li>Wajib persetujuan atasan & HR via workflow</li>
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
import { useRoute, navigateTo } from '#app'
import { useLemburStore } from '~/stores/lembur'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  MAX_BACKDATE_LEMBUR_DAYS,
  MAX_LEMBUR_JAM_HARI,
  TIPE_HARI_OPTIONS,
  computeDurasiPreview,
  formatDurasiJam,
} from '~/constants/hrd/lemburForm'

const props = defineProps<{ editId?: number | null }>()
const store = useLemburStore()
const { getAttachmentUrl } = useImageUrl()
const { setDetailTitle } = useDynamicTitle()
const route = useRoute()
const initializing = ref(true)

const todayIso = new Date().toISOString().slice(0, 10)
const minDateIso = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() - MAX_BACKDATE_LEMBUR_DAYS)
  return d.toISOString().slice(0, 10)
})

const pageTitle = computed(() => (store.isEditMode ? 'Edit Pengajuan Lembur' : 'Ajukan Lembur'))
const pageSubtitle = computed(() =>
  store.isEditMode ? 'Perbarui draft pengajuan lembur' : 'Buat Surat Perintah Kerja Lembur (SPKL) baru'
)

const durasiPreview = computed(() =>
  computeDurasiPreview(store.form.jam_mulai, store.form.jam_selesai, store.form.istirahat_menit)
)

const weeklyPct = computed(() => {
  const s = store.weeklySummary
  if (!s || !s.max_jam_minggu) return 0
  return Math.min(100, (s.total_jam_minggu / s.max_jam_minggu) * 100)
})

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  store.form.attachment = input.files?.[0] ?? null
}

function refreshSummary() {
  void store.fetchWeeklySummary(store.form.tanggal || undefined)
}

watch(
  () => store.form.tanggal,
  (v) => {
    if (v) refreshSummary()
  }
)

async function handleSubmit() {
  const saved = await store.save()
  if (saved) void navigateTo('/hrd/lembur')
}

onMounted(async () => {
  const idParam = props.editId ?? (route.params.id ? Number(route.params.id) : null)
  store.openCreate()
  await store.fetchWeeklySummary()

  if (idParam && !Number.isNaN(idParam)) {
    const row = await store.fetchOne(idParam)
    if (row) {
      store.openEdit(row)
      setDetailTitle('Edit Lembur', `#${row.id}`, false)
    }
  } else {
    setDetailTitle('Ajukan Lembur', '', false)
  }
  initializing.value = false
})
</script>
