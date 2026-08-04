<template>
  <div v-if="loading" class="text-center p-6">
    <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" fill="transparent" />
    <div class="mt-3 text-muted">Memuat data...</div>
  </div>
  <div v-else-if="error" class="alert alert-danger m-6">{{ error }}</div>
  <div v-else-if="lembur" class="p-2 cetak-lembur-doc position-relative">
    <button type="button" class="btn btn-primary no-print cetak-lembur-print-btn" @click="onPrint">
      <i class="ri-printer-line me-1"></i> Print
    </button>

    <div class="cetak-lembur-header">
      <div class="cetak-lembur-header-left">
        <div v-if="perusahaan" class="cetak-lembur-logo-wrap">
          <img
            :src="getCompanyLogo(perusahaan.logoPerusahaan ?? perusahaan.logo_perusahaan)"
            alt="Logo Perusahaan"
            class="cetak-lembur-logo"
            @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          />
        </div>
        <div class="cetak-lembur-brand-block">
          <h2 class="cetak-lembur-brand mb-0">SKYLINK</h2>
          <p v-if="companyName" class="cetak-lembur-company-name mb-0">{{ companyName }}</p>
        </div>
      </div>
      <div class="cetak-lembur-header-right">
        <h1 class="cetak-lembur-title fw-bold mb-0">SURAT PERINTAH KERJA LEMBUR</h1>
        <p class="cetak-lembur-subtitle mb-0">(SPKL)</p>
      </div>
    </div>

    <hr class="cetak-lembur-hr my-4" />

    <div class="d-flex justify-content-between mb-3" style="font-size: 12px">
      <div>
        <p class="mb-1"><strong>No. Pengajuan :</strong> #{{ lembur.id }}</p>
        <p class="mb-1"><strong>Nama Pegawai :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>Yang Mengajukan :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>NIK :</strong> {{ pegawaiNik }}</p>
        <p class="mb-1"><strong>Jabatan :</strong> {{ pegawaiJabatan }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel }}</p>
        <p class="mb-1"><strong>Tanggal Lembur :</strong> {{ formatDate(lembur.tanggal) }}</p>
        <p v-if="lembur.submittedAt" class="mb-1"><strong>Diajukan :</strong> {{ formatDateTime(lembur.submittedAt) }}</p>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-lembur-table m-0" style="font-size: 12px">
        <thead>
          <tr>
            <th class="cetak-lembur-th text-center" style="width: 36px">No</th>
            <th class="cetak-lembur-th">Keterangan</th>
            <th class="cetak-lembur-th">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="text-center">1</td><td>Tipe hari</td><td>{{ getTipeHariLabel(lembur.tipeHari ?? lembur.tipe_hari) }}</td></tr>
          <tr><td class="text-center">2</td><td>Jam lembur</td><td>{{ jamLabel }}</td></tr>
          <tr><td class="text-center">3</td><td>Istirahat</td><td>{{ lembur.istirahatMenit ?? lembur.istirahat_menit ?? 0 }} menit</td></tr>
          <tr><td class="text-center">4</td><td>Durasi lembur</td><td>{{ formatDurasiJam(lembur.durasiJam ?? lembur.durasi_jam) }}</td></tr>
          <tr><td class="text-center">5</td><td>Pekerjaan</td><td style="white-space: pre-wrap">{{ lembur.pekerjaan }}</td></tr>
          <tr><td class="text-center">6</td><td>Alasan / dasar</td><td style="white-space: pre-wrap">{{ lembur.alasan }}</td></tr>
          <tr>
            <td class="text-center">7</td><td>Lampiran</td>
            <td>
              <a v-if="lembur.attachment" :href="lembur.attachment" target="_blank" class="no-print">Lihat</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="multiplierBreakdown.length" class="mb-4">
      <div class="cetak-lembur-section-header">Indeks Upah Lembur (PP 35/2021)</div>
      <table class="table table-bordered cetak-lembur-table m-0" style="font-size: 11px">
        <thead>
          <tr>
            <th class="cetak-lembur-th text-center" style="width: 50px">Jam ke-</th>
            <th class="cetak-lembur-th text-center" style="width: 80px">Multiplier</th>
            <th class="cetak-lembur-th">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in multiplierBreakdown" :key="row.jam_ke">
            <td class="text-center">{{ row.jam_ke }}</td>
            <td class="text-center">{{ row.multiplier }}×</td>
            <td>{{ row.keterangan }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <HrdCetakSignatureBlock
      document-type="lembur"
      :document-id="lembur.id"
      :pegawai-name="pegawaiName"
      :pegawai-jabatan="pegawaiJabatan"
      :submitted="isSubmitted"
      :is-approved="isApproved"
      :approval-logs="approvalRows"
    />

    <div class="cetak-lembur-page-footer">
      <span>SPKL (#{{ lembur.id }}) — Skylink</span>
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
  STATUS_LEMBUR_APPROVED,
  STATUS_LEMBUR_MENUNGGU,
  formatDurasiJam,
  getStatusLemburBadge,
  getTipeHariLabel,
} from '~/constants/hrd/lemburForm'

definePageMeta({ layout: 'cetak', middleware: ['auth', 'check-permission'] })

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const lembur = ref<Record<string, any> | null>(null)
const perusahaan = ref<Record<string, any> | null>(null)
const multiplierBreakdown = ref<Array<{ jam_ke: number; multiplier: number; keterangan: string }>>([])

useRegisterCetakDraftStatus(() => lembur.value?.status)

const companyName = computed(
  () => perusahaan.value?.nmPerusahaan ?? perusahaan.value?.nm_perusahaan ?? ''
)

const pegawaiName = computed(() => lembur.value?.pegawai?.nmPegawai ?? lembur.value?.pegawai?.nm_pegawai ?? '-')
const pegawaiNik = computed(() => lembur.value?.pegawai?.nikPegawai ?? lembur.value?.pegawai?.nik_pegawai ?? '-')
const pegawaiJabatan = computed(() => {
  const h = lembur.value?.pegawai?.pegawaiHistory ?? lembur.value?.pegawai?.PegawaiHistory ?? []
  const first = Array.isArray(h) && h.length ? h[0] : null
  return first?.jabatan?.nmJabatan ?? first?.jabatan?.nm_jabatan ?? '-'
})
const statusLabel = computed(() => getStatusLemburBadge(lembur.value?.status).text)
const isSubmitted = computed(() => {
  const s = Number(lembur.value?.status)
  return s === STATUS_LEMBUR_MENUNGGU || s === STATUS_LEMBUR_APPROVED
})
const isApproved = computed(() => Number(lembur.value?.status) === STATUS_LEMBUR_APPROVED)
const jamLabel = computed(() => {
  const a = (lembur.value?.jamMulai ?? lembur.value?.jam_mulai ?? '').toString().slice(0, 5)
  const b = (lembur.value?.jamSelesai ?? lembur.value?.jam_selesai ?? '').toString().slice(0, 5)
  return `${a} – ${b}`
})
const approvalRows = computed(() => {
  const logs = lembur.value?.approvalLogs ?? lembur.value?.approval_logs ?? []
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
  if (!id) {
    error.value = 'Parameter id wajib.'
    loading.value = false
    return
  }
  const { $api } = useNuxtApp()
  try {
    const res = await apiFetch<{
      data: {
        lembur: Record<string, any>
        perusahaan: Record<string, any> | null
        multiplierBreakdown: Array<{ jam_ke: number; multiplier: number; keterangan: string }>
      }
    }>($api.lemburCetak(id), { credentials: 'include' })
    lembur.value = res.data?.lembur ?? null
    perusahaan.value = res.data?.perusahaan ?? null
    multiplierBreakdown.value = res.data?.multiplierBreakdown ?? []
    if (lembur.value) {
      setDetailTitle('Cetak Lembur SPKL', `#${lembur.value.id}`, false)
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
.cetak-lembur-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
}

.cetak-lembur-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  min-height: 72px;
}

.cetak-lembur-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.cetak-lembur-logo-wrap {
  flex-shrink: 0;
}

.cetak-lembur-logo {
  display: block;
  height: 56px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.cetak-lembur-brand {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.cetak-lembur-company-name {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.cetak-lembur-header-right {
  text-align: right;
  flex-shrink: 0;
  max-width: 48%;
}

.cetak-lembur-title {
  font-size: 1.05rem;
  line-height: 1.35;
  letter-spacing: 0.01em;
}

.cetak-lembur-subtitle {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.cetak-lembur-hr {
  border: none;
  border-top: 1px solid #4275f6;
  opacity: 1;
}

.cetak-lembur-section-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
}

.cetak-lembur-th {
  background-color: #4275f6 !important;
  color: #fff !important;
  font-weight: 600;
  border-color: #4275f6 !important;
}

.cetak-lembur-table thead th {
  background-color: #4275f6 !important;
  color: #fff !important;
}

.cetak-lembur-page-footer {
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

  .cetak-lembur-doc {
    padding: 0.5rem !important;
    font-size: 12px;
  }

  .cetak-lembur-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 0.75rem !important;
    page-break-inside: avoid;
  }

  .cetak-lembur-logo {
    height: 52px !important;
    max-width: 110px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cetak-lembur-title {
    font-size: 1rem !important;
  }

  .cetak-lembur-hr {
    border: none !important;
    border-top: 1pt solid #4275f6 !important;
    margin: 0.5rem 0 !important;
  }

  .cetak-lembur-table {
    border-collapse: collapse;
  }

  .cetak-lembur-table td,
  .cetak-lembur-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }

  .cetak-lembur-section-header,
  .cetak-lembur-th,
  .cetak-lembur-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
