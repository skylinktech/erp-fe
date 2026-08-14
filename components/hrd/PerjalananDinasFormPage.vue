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
          <NuxtLink to="/hrd/perjalanan-dinas" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i> Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Form Pengajuan Perjalanan Dinas (SPPD)</h6>
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
                      <label class="form-label">Jenis Perjalanan <span class="text-danger">*</span></label>
                      <select v-model="store.form.jenis_perjalanan" class="form-select" required>
                        <option v-for="o in JENIS_PERJALANAN_OPTIONS" :key="o.value" :value="o.value">
                          {{ o.label }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Kendaraan <span class="text-danger">*</span></label>
                      <select v-model="store.form.kendaraan" class="form-select" required>
                        <option v-for="o in KENDARAAN_OPTIONS" :key="o.value" :value="o.value">
                          {{ o.label }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-3">
                      <label class="form-label">Kota Asal <span class="text-danger">*</span></label>
                      <input v-model="store.form.kota_asal" type="text" class="form-control" required maxlength="100" />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Kota Tujuan <span class="text-danger">*</span></label>
                      <input v-model="store.form.kota_tujuan" type="text" class="form-control" required maxlength="100" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Provinsi Tujuan</label>
                      <input v-model="store.form.provinsi_tujuan" type="text" class="form-control" maxlength="100" />
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label class="form-label">Tanggal Berangkat <span class="text-danger">*</span></label>
                      <input
                        v-model="store.form.tanggal_berangkat"
                        type="date"
                        class="form-control"
                        :min="minBerangkat"
                        required
                      />
                      <small v-if="isLuarKota" class="text-muted">
                        Minimal {{ MIN_LEAD_DAYS_LUAR_KOTA }} hari sebelum berangkat (luar kota)
                      </small>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Tanggal Kembali <span class="text-danger">*</span></label>
                      <input
                        v-model="store.form.tanggal_kembali"
                        type="date"
                        class="form-control"
                        :min="store.form.tanggal_berangkat || minBerangkat"
                        required
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Nama Kegiatan / Acara</label>
                    <input v-model="store.form.nama_kegiatan" type="text" class="form-control" maxlength="255" />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Keperluan / Maksud Perjalanan <span class="text-danger">*</span></label>
                    <textarea
                      v-model="store.form.keperluan"
                      class="form-control"
                      rows="3"
                      required
                      minlength="10"
                      maxlength="2000"
                      placeholder="Uraikan tujuan perjalanan dinas..."
                    ></textarea>
                  </div>

                  <div class="card bg-light mb-3">
                    <div class="card-body">
                      <h6 class="mb-3">Rincian Biaya</h6>
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label">Uang Harian / Hari</label>
                          <input
                            type="text"
                            inputmode="numeric"
                            class="form-control"
                            :value="uangHarianFormatted"
                            :placeholder="formatRupiahInput(defaultUangHarianSatuan(store.form.jenis_perjalanan))"
                            @input="onUangHarianInput"
                          />
                          <small class="text-muted">
                            Default PMK 72/2019: dalam kota {{ formatRupiah(UANG_HARIAN_DALAM_KOTA) }},
                            luar kota {{ formatRupiah(UANG_HARIAN_LUAR_KOTA) }}
                          </small>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Biaya Transport</label>
                          <input
                            type="text"
                            inputmode="numeric"
                            class="form-control"
                            placeholder="Rp 0"
                            :value="biayaTransportFormatted"
                            @input="onBiayaTransportInput"
                          />
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">Akomodasi</label>
                          <input
                            type="text"
                            inputmode="numeric"
                            class="form-control"
                            placeholder="Rp 0"
                            :value="biayaAkomodasiFormatted"
                            @input="onBiayaAkomodasiInput"
                          />
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">Representasi</label>
                          <input
                            type="text"
                            inputmode="numeric"
                            class="form-control"
                            placeholder="Rp 0"
                            :value="biayaRepresentasiFormatted"
                            @input="onBiayaRepresentasiInput"
                          />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Biaya Lainnya</label>
                          <input
                            type="text"
                            inputmode="numeric"
                            class="form-control"
                            placeholder="Rp 0"
                            :value="biayaLainnyaFormatted"
                            @input="onBiayaLainnyaInput"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="biayaPreview" class="alert alert-info py-2 mb-3">
                    <div class="row small">
                      <div class="col-md-6">
                        <strong>Lama perjalanan:</strong> {{ biayaPreview.lamaHari }} hari<br />
                        <strong>Uang harian:</strong> {{ formatRupiah(biayaPreview.uangHarianTotal) }}
                        ({{ formatRupiah(biayaPreview.uangHarianSatuan) }}/hari)
                      </div>
                      <div class="col-md-6">
                        <strong>Transport:</strong> {{ formatRupiah(biayaPreview.biayaTransport) }}<br />
                        <strong>Total estimasi:</strong> {{ formatRupiah(biayaPreview.totalBiaya) }}
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Lampiran (undangan / TOR / surat tugas)</label>
                    <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.webp" @change="onFileChange" />
                    <small class="text-muted">PDF atau gambar, maks. 5MB</small>
                    <div v-if="store.form.attachmentUrl && !store.form.attachment" class="mt-2">
                      <a :href="store.form.attachmentUrl" target="_blank" rel="noopener">Lihat lampiran saat ini</a>
                    </div>
                  </div>

                  <div v-if="!store.isEditMode" class="form-check mb-3">
                    <input id="autoSubmitPd" v-model="store.form.auto_submit" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="autoSubmitPd">
                      Langsung ajukan ke approval setelah simpan
                    </label>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <NuxtLink to="/hrd/perjalanan-dinas" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="store.saving">
                      {{ store.saving ? 'Menyimpan...' : store.isEditMode ? 'Perbarui' : 'Simpan' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card">
              <div class="card-body small text-muted">
                <h6 class="text-body mb-2">Ketentuan Perjalanan Dinas (Indonesia)</h6>
                <ul class="ps-3 mb-0">
                  <li>SPPD wajib diajukan sebelum keberangkatan</li>
                  <li>Luar kota: minimal {{ MIN_LEAD_DAYS_LUAR_KOTA }} hari sebelum berangkat</li>
                  <li>Uang harian mengacu PMK 72/2019 (Gol. III/B)</li>
                  <li>Dalam kota: {{ formatRupiah(UANG_HARIAN_DALAM_KOTA) }}/hari</li>
                  <li>Luar kota: {{ formatRupiah(UANG_HARIAN_LUAR_KOTA) }}/hari</li>
                  <li>Biaya transport, akomodasi, dan representasi diisi sesuai kebutuhan</li>
                  <li>Persetujuan: Atasan → HR → Finance via workflow</li>
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
import { usePerjalananDinasStore } from '~/stores/perjalanan-dinas'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  JENIS_LUAR_KOTA,
  JENIS_LUAR_NEGERI,
  JENIS_PERJALANAN_OPTIONS,
  KENDARAAN_OPTIONS,
  MIN_LEAD_DAYS_LUAR_KOTA,
  UANG_HARIAN_DALAM_KOTA,
  UANG_HARIAN_LUAR_KOTA,
  computeBiayaPreview,
  defaultUangHarianSatuan,
  formatRupiah,
  formatRupiahInput,
  minTanggalBerangkat,
  parseRupiahInput,
  parseRupiahInputNullable,
} from '~/constants/hrd/perjalananDinasForm'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const props = defineProps<{ editId?: string | null }>()
const store = usePerjalananDinasStore()
const { setDetailTitle } = useDynamicTitle()
const route = useRoute()
const initializing = ref(true)

const pageTitle = computed(() =>
  store.isEditMode ? 'Edit Pengajuan Perjalanan Dinas' : 'Ajukan Perjalanan Dinas'
)
const pageSubtitle = computed(() =>
  store.isEditMode
    ? 'Perbarui draft pengajuan SPPD'
    : 'Buat Surat Perintah Perjalanan Dinas (SPPD) baru'
)

const isLuarKota = computed(
  () =>
    store.form.jenis_perjalanan === JENIS_LUAR_KOTA ||
    store.form.jenis_perjalanan === JENIS_LUAR_NEGERI
)

const minBerangkat = computed(() => minTanggalBerangkat(store.form.jenis_perjalanan))

const biayaPreview = computed(() =>
  computeBiayaPreview({
    jenis_perjalanan: store.form.jenis_perjalanan,
    tanggal_berangkat: store.form.tanggal_berangkat,
    tanggal_kembali: store.form.tanggal_kembali,
    uang_harian_satuan: store.form.uang_harian_satuan ?? undefined,
    biaya_transport: store.form.biaya_transport,
    biaya_akomodasi: store.form.biaya_akomodasi,
    biaya_representasi: store.form.biaya_representasi,
    biaya_lainnya: store.form.biaya_lainnya,
  })
)

const uangHarianFormatted = computed(() => formatRupiahInput(store.form.uang_harian_satuan))
const biayaTransportFormatted = computed(() => formatRupiahInput(store.form.biaya_transport))
const biayaAkomodasiFormatted = computed(() => formatRupiahInput(store.form.biaya_akomodasi))
const biayaRepresentasiFormatted = computed(() => formatRupiahInput(store.form.biaya_representasi))
const biayaLainnyaFormatted = computed(() => formatRupiahInput(store.form.biaya_lainnya))

function onUangHarianInput(e: Event) {
  store.form.uang_harian_satuan = parseRupiahInputNullable((e.target as HTMLInputElement).value)
}

function onBiayaTransportInput(e: Event) {
  store.form.biaya_transport = parseRupiahInput((e.target as HTMLInputElement).value)
}

function onBiayaAkomodasiInput(e: Event) {
  store.form.biaya_akomodasi = parseRupiahInput((e.target as HTMLInputElement).value)
}

function onBiayaRepresentasiInput(e: Event) {
  store.form.biaya_representasi = parseRupiahInput((e.target as HTMLInputElement).value)
}

function onBiayaLainnyaInput(e: Event) {
  store.form.biaya_lainnya = parseRupiahInput((e.target as HTMLInputElement).value)
}

watch(
  () => store.form.jenis_perjalanan,
  () => {
    if (store.form.uang_harian_satuan == null) {
      store.form.uang_harian_satuan = defaultUangHarianSatuan(store.form.jenis_perjalanan) || null
    }
  }
)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  store.form.attachment = input.files?.[0] ?? null
}

async function handleSubmit() {
  const saved = await store.save()
  if (saved) void navigateTo('/hrd/perjalanan-dinas')
}

onMounted(async () => {
  const idParam =
    props.editId ??
    (route.params.id && UUID_RE.test(String(route.params.id)) ? String(route.params.id) : null)

  store.openCreate()

  if (idParam) {
    const row = await store.fetchOne(idParam)
    if (row) {
      store.openEdit(row)
      setDetailTitle('Edit SPPD', row.nomorSppd || row.id.slice(0, 8), false)
    }
  } else {
    store.form.uang_harian_satuan = defaultUangHarianSatuan(store.form.jenis_perjalanan) || null
    setDetailTitle('Ajukan Perjalanan Dinas', '', false)
  }
  initializing.value = false
})
</script>
