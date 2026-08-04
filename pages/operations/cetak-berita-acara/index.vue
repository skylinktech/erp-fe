<template>
  <div v-if="loading" class="text-center p-6">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="4"
      fill="transparent"
      animationDuration="1s"
    />
    <div class="mt-3 text-muted">Memuat data...</div>
  </div>

  <div v-else-if="error" class="alert alert-danger m-6">{{ error.message }}</div>

  <div v-else-if="beritaAcara" class="p-2 cetak-ba-doc cetak-ba-doc-with-print position-relative">
    <button
      type="button"
      class="btn btn-primary no-print cetak-ba-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <!-- Header: Logo kiri, SKYLINK tengah, Judul kanan -->
    <div class="d-flex justify-content-between align-items-start mb-4 cetak-ba-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-ba-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-ba-title-wrap text-end mt-3">
        <h1 class="cetak-ba-title fw-bold mb-0">BERITA ACARA PERFORMANSI</h1>
      </div>
    </div>

    <hr class="cetak-ba-hr my-4">

    <!-- Header info kiri & kanan -->
    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>CUSTOMER :</strong> {{ customerName }}</p>
        <p class="mb-1"><strong>PARTNER :</strong> {{ partnerName }}</p>
        <p class="mb-1"><strong>NO. KONTRAK :</strong> {{ contractNo }}</p>
        <p class="mb-1"><strong>PEMOHON :</strong> {{ requesterName }}</p>
        <p class="mb-1"><strong>STATUS :</strong> {{ statusLabel(beritaAcara.status, beritaAcara) }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>NO. BA :</strong> {{ getBeritaAcaraNo(beritaAcara) || '—' }}</p>
        <p class="mb-1"><strong>TANGGAL BA :</strong> {{ documentDateLabel }}</p>
        <p class="mb-1"><strong>PERIODE :</strong> {{ periodLabel }}</p>
        <p class="mb-1"><strong>HARI :</strong> {{ dayName }}</p>
      </div>
    </div>

    <p class="cetak-ba-narrative mb-4">
      Pada hari ini <strong>{{ dayName }}</strong> tanggal <strong>{{ documentDay }}</strong>
      bulan <strong>{{ documentMonthName }}</strong> tahun <strong>{{ documentYear }}</strong>,
      yang bertanda tangan dibawah ini, menerangkan bahwa antara
      <strong>{{ customerName }}</strong> dengan <strong>{{ partnerName }}</strong>
      berdasarkan perjanjian kerjasama NOMOR :
      <strong>{{ contractNo }}</strong>
      Availability link koneksi pada periode
      <strong>{{ periodLabel }}</strong>
      adalah sebagai berikut :
    </p>

    <!-- Tabel performansi -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-ba-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">PID</th>
            <th class="text-start">Lokasi</th>
            <th class="text-center">Bandwith (Kbps)</th>
            <th class="text-center">Uptime Status</th>
            <th class="text-center">Average Ping Time (msec)</th>
            <th class="text-start">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="item.id || idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-start">{{ item.pid || '—' }}</td>
            <td class="text-start">{{ item.lokasi || '—' }}</td>
            <td class="text-center">{{ item.bandwidth || '—' }}</td>
            <td class="text-center">{{ item.uptimeStatus || item.uptime_status || '—' }}</td>
            <td class="text-center">{{ item.averagePing ?? item.average_ping ?? '—' }}</td>
            <td class="text-start">{{ item.keterangan || '—' }}</td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="7" class="text-center py-4 text-muted">Tidak ada data performansi</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="notes" class="cetak-ba-note mb-4">
      <div class="cetak-ba-note-header fw-bold text-white">Note</div>
      <div class="cetak-ba-note-body">{{ notes }}</div>
    </div>

    <!-- Footer: LEMBAR PENGESAHAN -->
    <div v-if="showSignatureSection" class="cetak-ba-footer mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0" style="font-size: 12px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen Berita Acara Performansi ini telah diajukan dan ditandatangani secara digital sesuai alur persetujuan yang berlaku.
      </p>

      <div class="signature-section mt-4">
        <MultiSignatureDisplay
          document-type="berita-acara"
          :document-id="String(beritaAcara.id)"
          title="Verifikasi Digital Dokumen"
          :columns="4"
          :qr-size="96"
          :compact="true"
          :legacy-signer-name="legacySignerName"
          :legacy-signer-title="legacySignerTitle"
        />
      </div>
    </div>

    <div class="cetak-ba-page-footer">
      <span class="cetak-ba-footer-left">
        Berita Acara Performansi ({{ getBeritaAcaraNo(beritaAcara) || '—' }}) Skylink
      </span>
      <span class="cetak-ba-footer-right">Halaman 1/1</span>
    </div>
  </div>

  <div v-else class="alert alert-danger m-6" role="alert">
    Berita Acara tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
  title: 'Cetak Berita Acara',
})

import { onMounted, computed } from 'vue'
import {
  useBeritaAcaraStore,
  getBeritaAcaraNo,
} from '~/stores/berita-acara'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
]
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function parseDateOnly(raw) {
  if (!raw) return null
  const s = String(raw).slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDateShort(raw) {
  const d = parseDateOnly(raw)
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const store = useBeritaAcaraStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { beritaAcara, loading, error } = storeToRefs(store)

useRegisterCetakDraftStatus(() => beritaAcara.value?.status)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  return list && list.length > 0 ? list[0] : null
})

const customerName = computed(() => beritaAcara.value?.customer?.name || '—')

const partnerName = computed(() =>
  beritaAcara.value?.partnerName
  || beritaAcara.value?.partner_name
  || 'SKYLINK'
)

const contractNo = computed(() =>
  beritaAcara.value?.contractNo
  || beritaAcara.value?.contract_no
  || '—'
)

const notes = computed(() => (beritaAcara.value?.notes || '').trim())

const items = computed(() => beritaAcara.value?.items || [])

const requesterName = computed(() =>
  beritaAcara.value?.requestedByUser?.fullName
  || beritaAcara.value?.requestedByUser?.full_name
  || beritaAcara.value?.createdByUser?.fullName
  || beritaAcara.value?.createdByUser?.full_name
  || '—'
)

const documentDate = computed(() =>
  parseDateOnly(beritaAcara.value?.documentDate || beritaAcara.value?.document_date)
)

const documentDateLabel = computed(() =>
  formatDateShort(beritaAcara.value?.documentDate || beritaAcara.value?.document_date)
)

const dayName = computed(() => {
  if (!documentDate.value) return '—'
  return DAY_NAMES[documentDate.value.getDay()] ?? '—'
})

const documentDay = computed(() => {
  if (!documentDate.value) return '—'
  return String(documentDate.value.getDate()).padStart(2, '0')
})

const documentMonthName = computed(() => {
  if (!documentDate.value) return '—'
  return MONTH_NAMES[documentDate.value.getMonth()] || '—'
})

const documentYear = computed(() => {
  if (!documentDate.value) return '—'
  return String(documentDate.value.getFullYear())
})

function formatPeriodPart(raw) {
  const d = parseDateOnly(raw)
  if (!d) return raw ? String(raw) : null
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

const periodLabel = computed(() => {
  const start = formatPeriodPart(beritaAcara.value?.periodStart || beritaAcara.value?.period_start)
  const end = formatPeriodPart(beritaAcara.value?.periodEnd || beritaAcara.value?.period_end)
  if (!start || !end) return '—'
  return `${start} - ${end}`
})

const showSignatureSection = computed(() => {
  const status = beritaAcara.value?.status
  return status === 'pending' || status === 'approved' || status === 'completed'
})

const legacySignerName = computed(() =>
  beritaAcara.value?.approvedByUser?.fullName
  || beritaAcara.value?.approvedByUser?.full_name
  || null
)

const legacySignerTitle = computed(() => {
  const user = beritaAcara.value?.approvedByUser
  return user?.roles?.[0]?.name || null
})

function statusLabel(status, row) {
  if (status === 'approved' && row?.approvedByUser?.fullName) {
    return 'Approved by ' + row.approvedByUser.fullName
  }
  if (status === 'approved' && row?.approvedByUser?.full_name) {
    return 'Approved by ' + row.approvedByUser.full_name
  }
  const map = {
    draft: 'Draft',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  }
  return status ? (map[status] || status) : '—'
}

function onPrint() {
  window.print()
}

onMounted(async () => {
  const id = route.query.id
  if (!id) return

  try {
    await perusahaanStore.fetchPerusahaans?.()
    await store.getBeritaAcaraDetails(String(id))
    if (beritaAcara.value) {
      setDetailTitle('Cetak Berita Acara - ' + getBeritaAcaraNo(beritaAcara.value))
    }
  } catch (e) {
    console.error('Cetak Berita Acara load error:', e)
  }
})
</script>

<style scoped>
.cetak-ba-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-ba-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-ba-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-ba-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-ba-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-ba-title {
  font-size: 1.35rem;
  letter-spacing: 0.02em;
}
.cetak-ba-narrative {
  font-size: 12px;
  line-height: 1.7;
  text-align: justify;
  margin: 0;
}
.cetak-ba-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-ba-note-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-ba-note-body {
  font-size: 12px;
  border: 1px solid #4275f6;
  border-top: none;
  padding: 12px;
  min-height: 40px;
  white-space: pre-line;
}
.cetak-ba-page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0.5rem 0;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #e0e0e0;
}
.cetak-ba-footer-left { text-align: left; }
.cetak-ba-footer-right { text-align: right; }
</style>

<style>
@media print {
  .cetak-ba-hr {
    border: none !important;
    border-top: 1pt solid #000 !important;
    height: 0 !important;
    margin: 0.4rem 0 !important;
    padding: 0 !important;
  }
  .no-print {
    display: none !important;
  }
  .alert {
    display: none !important;
  }
  .cetak-ba-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    padding-bottom: 2.5rem !important;
    font-size: 12px;
  }
  .cetak-ba-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-ba-footer {
    margin-top: 0.75rem !important;
    padding-top: 0.25rem !important;
  }
  .cetak-ba-footer h2 {
    margin-bottom: 0.35rem !important;
    margin-top: 0 !important;
    font-size: 14px !important;
  }
  .cetak-ba-footer p {
    margin-bottom: 0.2rem !important;
    line-height: 1.45 !important;
  }
  .cetak-ba-footer .signature-section {
    margin-top: 0.4rem !important;
  }
  .cetak-ba-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-ba-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-ba-title-wrap {
    text-align: right !important;
  }
  .cetak-ba-title {
    font-size: 1.2rem !important;
  }
  .cetak-ba-table {
    border-collapse: collapse;
  }
  .cetak-ba-table td,
  .cetak-ba-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .table-dark.table-head-white th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-ba-note-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-ba-note-body {
    border-color: #4275f6 !important;
  }
  .cetak-ba-page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0.35rem 1rem;
    font-size: 10px;
    color: #333;
    border-top: 1pt solid #999;
    background: #fff;
  }
}
</style>
