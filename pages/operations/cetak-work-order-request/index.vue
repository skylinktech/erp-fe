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

  <div v-else-if="workOrderRequest" class="p-2 cetak-wor-doc cetak-wor-doc-with-print position-relative">
    <button
      type="button"
      class="btn btn-primary no-print cetak-wor-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <!-- Header: Logo kiri, Judul kanan -->
    <div class="d-flex justify-content-between align-items-start mb-4 cetak-wor-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-wor-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-wor-title-wrap text-end mt-3">
        <h1 class="cetak-wor-title fw-bold mb-0">WORK ORDER REQUEST</h1>
      </div>
    </div>

    <hr class="cetak-wor-hr my-4">

    <!-- Header info kiri & kanan -->
    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>PROJECT / SITE :</strong> {{ workOrderRequest.siteName || workOrderRequest.site_name || '—' }}</p>
        <p class="mb-1"><strong>CLIENT :</strong> {{ clientName }}</p>
        <p class="mb-1"><strong>PEMOHON :</strong> {{ requesterName }}</p>
        <p class="mb-1"><strong>STATUS :</strong> {{ statusLabel(workOrderRequest.status, workOrderRequest) }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>NO. WOR :</strong> {{ getWorkOrderRequestNo(workOrderRequest) || '—' }}</p>
        <p class="mb-1"><strong>TANGGAL REQUEST :</strong> {{ workOrderRequest.requestDate || workOrderRequest.request_date || '—' }}</p>
        <p class="mb-1"><strong>JENIS PEKERJAAN :</strong> {{ jobTypeLabel(workOrderRequest.jobType ?? workOrderRequest.job_type) }}</p>
        <p class="mb-1"><strong>URGENCY :</strong> {{ urgencyFullLabel(workOrderRequest.urgencyLevel ?? workOrderRequest.urgency_level) }}</p>
      </div>
    </div>

    <!-- Tabel utama -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-wor-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-start" style="width: 28%;">FIELD</th>
            <th class="text-start">KETERANGAN</th>
          </tr>
        </thead>
        <tbody>
          <tr class="fw-bold bg-light">
            <td colspan="2" class="text-start">INFORMASI SITE</td>
          </tr>
          <tr v-if="siNumber">
            <td class="text-start">Site Investment (SI)</td>
            <td class="text-start"><strong>{{ siNumber }}</strong> — {{ siName }}</td>
          </tr>
          <tr>
            <td class="text-start">Lokasi</td>
            <td class="text-start">{{ workOrderRequest.location || '—' }}</td>
          </tr>
          <tr>
            <td class="text-start">PIC Lokasi</td>
            <td class="text-start">{{ workOrderRequest.picName || workOrderRequest.pic_name || '—' }}</td>
          </tr>
          <tr>
            <td class="text-start">No. HP PIC</td>
            <td class="text-start">{{ workOrderRequest.picPhone || workOrderRequest.pic_phone || '—' }}</td>
          </tr>

          <tr class="fw-bold bg-light">
            <td colspan="2" class="text-start">DETAIL PEKERJAAN</td>
          </tr>
          <tr>
            <td class="text-start">Target Pelaksanaan</td>
            <td class="text-start">{{ workOrderRequest.targetDate || workOrderRequest.target_date || '—' }}</td>
          </tr>
          <tr>
            <td class="text-start">Estimasi Durasi</td>
            <td class="text-start">{{ workOrderRequest.estimatedDuration || workOrderRequest.estimated_duration || '—' }}</td>
          </tr>
          <tr>
            <td class="text-start">Deskripsi Pekerjaan</td>
            <td class="text-start">{{ workOrderRequest.jobDescription || workOrderRequest.job_description || '—' }}</td>
          </tr>
          <tr>
            <td class="text-start">Indikasi Gangguan</td>
            <td class="text-start">{{ workOrderRequest.faultIndication || workOrderRequest.fault_indication || '—' }}</td>
          </tr>
          <tr>
            <td class="text-start">Catatan</td>
            <td class="text-start">{{ workOrderRequest.notes || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer: LEMBAR PENGESAHAN -->
    <div v-if="showSignatureSection" class="cetak-wor-footer mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0" style="font-size: 12px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen Work Order Request ini telah diajukan dan ditandatangani secara digital sesuai alur persetujuan yang berlaku.
      </p>

      <div class="signature-section mt-4">
        <MultiSignatureDisplay
          document-type="work-order-requests"
          :document-id="String(workOrderRequest.id)"
          title="Verifikasi Digital Dokumen"
          :columns="4"
          :qr-size="96"
          :compact="true"
          :legacy-signer-name="legacySignerName"
          :legacy-signer-title="legacySignerTitle"
        />
      </div>
    </div>

    <div class="cetak-wor-page-footer">
      <span class="cetak-wor-footer-left">
        Work Order Request ({{ getWorkOrderRequestNo(workOrderRequest) || '—' }}) Skylink
      </span>
      <span class="cetak-wor-footer-right">Halaman 1/1</span>
    </div>
  </div>

  <div v-else class="alert alert-danger m-6" role="alert">
    Work Order Request tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
  title: 'Cetak Work Order Request',
})

import { onMounted, computed } from 'vue'
import {
  useWorkOrderRequestStore,
  getWorkOrderRequestNo,
  JOB_TYPE_LABELS,
  URGENCY_LABELS,
} from '~/stores/work-order-request'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const store = useWorkOrderRequestStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { workOrderRequest, loading, error } = storeToRefs(store)

useRegisterCetakDraftStatus(() => workOrderRequest.value?.status)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  return list && list.length > 0 ? list[0] : null
})

const siData = computed(() =>
  workOrderRequest.value?.siteInvestment ?? workOrderRequest.value?.site_investment ?? null
)

const siNumber = computed(() => siData.value?.siNumber || siData.value?.si_number || '')
const siName = computed(() => siData.value?.name || '—')

const clientName = computed(() =>
  workOrderRequest.value?.client?.name
  || siData.value?.customer?.name
  || '—'
)

const requesterName = computed(() =>
  workOrderRequest.value?.requestedByUser?.fullName
  || workOrderRequest.value?.requestedByUser?.full_name
  || workOrderRequest.value?.createdByUser?.fullName
  || workOrderRequest.value?.createdByUser?.full_name
  || '—'
)

const showSignatureSection = computed(() => {
  const status = workOrderRequest.value?.status
  return status === 'pending' || status === 'approved' || status === 'completed'
})

const legacySignerName = computed(() =>
  workOrderRequest.value?.approvedByUser?.fullName
  || workOrderRequest.value?.approvedByUser?.full_name
  || null
)

const legacySignerTitle = computed(() => {
  const user = workOrderRequest.value?.approvedByUser
  return user?.roles?.[0]?.name || null
})

function onPrint() {
  window.print()
}

function jobTypeLabel(type) {
  return JOB_TYPE_LABELS[type] ?? (type ? String(type).toUpperCase() : '—')
}

function urgencyFullLabel(level) {
  return URGENCY_LABELS[level] ?? level ?? '—'
}

function statusLabel(status, wor) {
  if (status === 'approved' && wor?.approvedByUser?.fullName) {
    return 'Approved by ' + wor.approvedByUser.fullName
  }
  if (status === 'approved' && wor?.approvedByUser?.full_name) {
    return 'Approved by ' + wor.approvedByUser.full_name
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

onMounted(async () => {
  const id = route.query.id
  if (!id) return

  try {
    await perusahaanStore.fetchPerusahaans?.()
    await store.getWorkOrderRequestDetails(String(id))
    if (workOrderRequest.value) {
      setDetailTitle('Cetak Work Order Request - ' + getWorkOrderRequestNo(workOrderRequest.value))
    }
  } catch (e) {
    console.error('Cetak WOR load error:', e)
  }
})
</script>

<style scoped>
.cetak-wor-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-wor-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-wor-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-wor-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-wor-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-wor-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-wor-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-wor-page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0.5rem 0;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #e0e0e0;
}
.cetak-wor-footer-left { text-align: left; }
.cetak-wor-footer-right { text-align: right; }
</style>

<style>
@media print {
  .cetak-wor-hr {
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
  .cetak-wor-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    padding-bottom: 2.5rem !important;
    font-size: 12px;
  }
  .cetak-wor-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-wor-footer {
    margin-top: 0.75rem !important;
    padding-top: 0.25rem !important;
  }
  .cetak-wor-footer h2 {
    margin-bottom: 0.35rem !important;
    margin-top: 0 !important;
    font-size: 14px !important;
  }
  .cetak-wor-footer p {
    margin-bottom: 0.2rem !important;
    line-height: 1.45 !important;
  }
  .cetak-wor-footer .signature-section {
    margin-top: 0.4rem !important;
  }
  .cetak-wor-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-wor-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-wor-title-wrap {
    text-align: right !important;
  }
  .cetak-wor-title {
    font-size: 1.35rem !important;
  }
  .cetak-wor-table {
    border-collapse: collapse;
  }
  .cetak-wor-table td,
  .cetak-wor-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .table-dark.table-head-white th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-light {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-wor-page-footer {
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
