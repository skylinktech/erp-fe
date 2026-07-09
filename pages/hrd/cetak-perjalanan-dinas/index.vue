<template>
  <div v-if="loading" class="text-center p-6">
    <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" fill="transparent" />
    <div class="mt-3 text-muted">Memuat data...</div>
  </div>
  <div v-else-if="error" class="alert alert-danger m-6">{{ error }}</div>
  <div v-else-if="sppd" class="p-2 cetak-pd-doc position-relative">
    <button type="button" class="btn btn-primary no-print cetak-pd-print-btn" @click="onPrint">
      <i class="ri-printer-line me-1"></i> Print
    </button>

    <div class="cetak-pd-header">
      <div class="cetak-pd-header-left">
        <div v-if="perusahaan" class="cetak-pd-logo-wrap">
          <img
            :src="getCompanyLogo(perusahaan.logoPerusahaan ?? perusahaan.logo_perusahaan)"
            alt="Logo Perusahaan"
            class="cetak-pd-logo"
            @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          />
        </div>
        <div class="cetak-pd-brand-block">
          <h2 class="cetak-pd-brand mb-0">SKYLINK</h2>
          <p v-if="companyName" class="cetak-pd-company-name mb-0">{{ companyName }}</p>
        </div>
      </div>
      <div class="cetak-pd-header-right">
        <h1 class="cetak-pd-title fw-bold mb-0">SURAT PERINTAH PERJALANAN DINAS</h1>
        <p class="cetak-pd-subtitle mb-0">(SPPD)</p>
      </div>
    </div>

    <hr class="cetak-pd-hr my-4" />

    <div class="d-flex justify-content-between mb-3" style="font-size: 12px">
      <div>
        <p class="mb-1"><strong>No. SPPD :</strong> {{ sppd.nomorSppd ?? sppd.nomor_sppd }}</p>
        <p class="mb-1"><strong>Nama Pegawai :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>Yang Mengajukan :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>NIK :</strong> {{ pegawaiNik }}</p>
        <p class="mb-1"><strong>Jabatan :</strong> {{ pegawaiJabatan }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel }}</p>
        <p class="mb-1"><strong>Jenis :</strong> {{ jenisLabel }}</p>
        <p v-if="sppd.submittedAt" class="mb-1"><strong>Diajukan :</strong> {{ formatDateTime(sppd.submittedAt) }}</p>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-pd-table m-0" style="font-size: 12px">
        <thead>
          <tr>
            <th class="cetak-pd-th text-center" style="width: 36px">No</th>
            <th class="cetak-pd-th">Keterangan</th>
            <th class="cetak-pd-th">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="text-center">1</td><td>Rute perjalanan</td><td>{{ kotaAsal }} → {{ kotaTujuan }}{{ provinsiTujuan ? `, ${provinsiTujuan}` : '' }}</td></tr>
          <tr><td class="text-center">2</td><td>Tanggal berangkat / kembali</td><td>{{ formatDate(tanggalBerangkat) }} – {{ formatDate(tanggalKembali) }} ({{ lamaHari }} hari)</td></tr>
          <tr><td class="text-center">3</td><td>Kendaraan</td><td>{{ kendaraanLabel }}</td></tr>
          <tr><td class="text-center">4</td><td>Nama kegiatan</td><td>{{ sppd.namaKegiatan ?? sppd.nama_kegiatan ?? '-' }}</td></tr>
          <tr><td class="text-center">5</td><td>Keperluan / maksud</td><td style="white-space: pre-wrap">{{ sppd.keperluan }}</td></tr>
          <tr>
            <td class="text-center">6</td><td>Lampiran</td>
            <td>
              <a v-if="sppd.attachment" :href="sppd.attachment" target="_blank" class="no-print">Lihat</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-4">
      <div class="cetak-pd-section-header">Rincian Biaya Perjalanan Dinas</div>
      <table class="table table-bordered cetak-pd-table cetak-pd-biaya-table m-0" style="font-size: 11px">
        <thead>
          <tr>
            <th class="cetak-pd-th">Komponen</th>
            <th class="cetak-pd-th text-end" style="width: 180px">Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Uang harian ({{ formatRupiah(uangHarianSatuan) }}/hari × {{ lamaHari }} hari)</td>
            <td class="text-end">{{ formatRupiah(uangHarianTotal) }}</td>
          </tr>
          <tr><td>Biaya transport</td><td class="text-end">{{ formatRupiah(biayaTransport) }}</td></tr>
          <tr><td>Biaya akomodasi</td><td class="text-end">{{ formatRupiah(biayaAkomodasi) }}</td></tr>
          <tr><td>Biaya representasi</td><td class="text-end">{{ formatRupiah(biayaRepresentasi) }}</td></tr>
          <tr><td>Biaya lainnya</td><td class="text-end">{{ formatRupiah(biayaLainnya) }}</td></tr>
          <tr class="fw-bold">
            <td>Total</td>
            <td class="text-end">{{ formatRupiah(totalBiaya) }}</td>
          </tr>
        </tbody>
      </table>
      <p class="small text-muted mt-2 mb-0">
        * Uang harian mengacu PMK 72/2019 (Gol. III/B) untuk perusahaan swasta.
      </p>
    </div>

    <HrdCetakSignatureBlock
      document-type="perjalanan-dinas"
      :document-id="sppd.id"
      :pegawai-name="pegawaiName"
      :pegawai-jabatan="pegawaiJabatan"
      :submitted="isSubmitted"
      :is-approved="isApproved"
      :approval-logs="approvalRows"
    />

    <div class="cetak-pd-page-footer">
      <span>SPPD ({{ sppd.nomorSppd ?? sppd.nomor_sppd }}) — Skylink</span>
      <span>{{ printedAt }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import { apiFetch } from '~/utils/apiFetch'
import HrdCetakSignatureBlock from '~/components/hrd/HrdCetakSignatureBlock.vue'
import {
  STATUS_PD_APPROVED,
  STATUS_PD_MENUNGGU,
  formatRupiah,
  getJenisPerjalananLabel,
  getKendaraanLabel,
  getStatusPdBadge,
} from '~/constants/hrd/perjalananDinasForm'

definePageMeta({ layout: 'cetak', middleware: ['auth', 'check-permission'] })

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const sppd = ref<Record<string, any> | null>(null)
const perusahaan = ref<Record<string, any> | null>(null)

const companyName = computed(
  () => perusahaan.value?.nmPerusahaan ?? perusahaan.value?.nm_perusahaan ?? ''
)

const pegawaiName = computed(() => sppd.value?.pegawai?.nmPegawai ?? sppd.value?.pegawai?.nm_pegawai ?? '-')
const pegawaiNik = computed(() => sppd.value?.pegawai?.nikPegawai ?? sppd.value?.pegawai?.nik_pegawai ?? '-')
const pegawaiJabatan = computed(() => {
  const h = sppd.value?.pegawai?.pegawaiHistory ?? sppd.value?.pegawai?.PegawaiHistory ?? []
  const first = Array.isArray(h) && h.length ? h[0] : null
  return first?.jabatan?.nmJabatan ?? first?.jabatan?.nm_jabatan ?? '-'
})
const statusLabel = computed(() => getStatusPdBadge(sppd.value?.status).text)
const jenisLabel = computed(() => getJenisPerjalananLabel(sppd.value?.jenisPerjalanan ?? sppd.value?.jenis_perjalanan))
const kendaraanLabel = computed(() => getKendaraanLabel(sppd.value?.kendaraan))
const isSubmitted = computed(() => {
  const s = Number(sppd.value?.status)
  return s === STATUS_PD_MENUNGGU || s === STATUS_PD_APPROVED
})
const isApproved = computed(() => Number(sppd.value?.status) === STATUS_PD_APPROVED)

const kotaAsal = computed(() => sppd.value?.kotaAsal ?? sppd.value?.kota_asal ?? '-')
const kotaTujuan = computed(() => sppd.value?.kotaTujuan ?? sppd.value?.kota_tujuan ?? '-')
const provinsiTujuan = computed(() => sppd.value?.provinsiTujuan ?? sppd.value?.provinsi_tujuan)
const tanggalBerangkat = computed(() => sppd.value?.tanggalBerangkat ?? sppd.value?.tanggal_berangkat)
const tanggalKembali = computed(() => sppd.value?.tanggalKembali ?? sppd.value?.tanggal_kembali)
const lamaHari = computed(() => sppd.value?.lamaHari ?? sppd.value?.lama_hari ?? '-')
const uangHarianSatuan = computed(() => sppd.value?.uangHarianSatuan ?? sppd.value?.uang_harian_satuan ?? 0)
const uangHarianTotal = computed(() => sppd.value?.uangHarianTotal ?? sppd.value?.uang_harian_total ?? 0)
const biayaTransport = computed(() => sppd.value?.biayaTransport ?? sppd.value?.biaya_transport ?? 0)
const biayaAkomodasi = computed(() => sppd.value?.biayaAkomodasi ?? sppd.value?.biaya_akomodasi ?? 0)
const biayaRepresentasi = computed(() => sppd.value?.biayaRepresentasi ?? sppd.value?.biaya_representasi ?? 0)
const biayaLainnya = computed(() => sppd.value?.biayaLainnya ?? sppd.value?.biaya_lainnya ?? 0)
const totalBiaya = computed(() => sppd.value?.totalBiaya ?? sppd.value?.total_biaya ?? 0)

const approvalRows = computed(() => {
  const logs = sppd.value?.approvalLogs ?? sppd.value?.approval_logs ?? []
  return Array.isArray(logs) ? logs : []
})
const printedAt = computed(() => new Date().toLocaleString('id-ID'))

function onPrint() {
  window.print()
}
function formatDate(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatDateTime(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleString('id-ID')
}

onMounted(async () => {
  const id = route.query.id
  if (!id || typeof id !== 'string') {
    error.value = 'Parameter id wajib.'
    loading.value = false
    return
  }
  const { $api } = useNuxtApp()
  try {
    const res = await apiFetch<{
      data: {
        perjalananDinas: Record<string, any>
        perusahaan: Record<string, any> | null
      }
    }>($api.perjalananDinasCetak(id), { credentials: 'include' })
    sppd.value = res.data?.perjalananDinas ?? null
    perusahaan.value = res.data?.perusahaan ?? null
    if (sppd.value) {
      setDetailTitle('Cetak SPPD', sppd.value.nomorSppd ?? sppd.value.nomor_sppd ?? '', false)
    } else {
      error.value = 'Data tidak ditemukan.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat cetak.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.cetak-pd-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
}

.cetak-pd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  min-height: 72px;
}

.cetak-pd-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.cetak-pd-logo-wrap {
  flex-shrink: 0;
}

.cetak-pd-logo {
  display: block;
  height: 56px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.cetak-pd-brand {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.cetak-pd-company-name {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.cetak-pd-header-right {
  text-align: right;
  flex-shrink: 0;
  max-width: 48%;
}

.cetak-pd-title {
  font-size: 1.05rem;
  line-height: 1.35;
  letter-spacing: 0.01em;
}

.cetak-pd-subtitle {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.cetak-pd-hr {
  border: none;
  border-top: 1px solid #4275f6;
  opacity: 1;
}

.cetak-pd-section-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
}

.cetak-pd-th {
  background-color: #4275f6 !important;
  color: #fff !important;
  font-weight: 600;
  border-color: #4275f6 !important;
}

.cetak-pd-table thead th {
  background-color: #4275f6 !important;
  color: #fff !important;
}

.cetak-pd-page-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 0.5rem;
  font-size: 10px;
  border-top: 1px solid #ccc;
}
</style>

<style>
@media print {
  .no-print {
    display: none !important;
  }

  .cetak-pd-doc {
    padding: 0.5rem !important;
    font-size: 12px;
  }

  .cetak-pd-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 0.75rem !important;
    page-break-inside: avoid;
  }

  .cetak-pd-logo {
    height: 52px !important;
    max-width: 110px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cetak-pd-title {
    font-size: 1rem !important;
  }

  .cetak-pd-hr {
    border: none !important;
    border-top: 1pt solid #4275f6 !important;
    margin: 0.5rem 0 !important;
  }

  .cetak-pd-table {
    border-collapse: collapse;
  }

  .cetak-pd-table td,
  .cetak-pd-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }

  .cetak-pd-section-header,
  .cetak-pd-th,
  .cetak-pd-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
