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
  <div v-else-if="paymentRequest" class="p-2 cetak-payment-request-doc position-relative">
    <button
      type="button"
      class="btn btn-primary no-print cetak-payment-request-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <div class="d-flex justify-content-between align-items-center mb-4 cetak-payment-request-header">
      <div class="d-flex align-items-center gap-2 logo-section">
        <img
          v-if="perusahaan"
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-payment-request-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
        <h2 class="app-brand-logo demo fw-bold mb-0">SKYLINK</h2>
      </div>
      <div class="cetak-payment-request-title-wrap text-end">
        <h1 class="cetak-payment-request-title fw-bold mb-0">PAYMENT REQUEST</h1>
        <p class="mb-0" style="font-size: 14px;">NO. PRQ: {{ getPaymentRequestNo(paymentRequest) || '-' }}</p>
      </div>
    </div>

    <hr class="cetak-payment-request-hr my-4">

    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>Tanggal :</strong> {{ formatDate(paymentRequest.requestDate || paymentRequest.request_date || paymentRequest.createdAt) }}</p>
        <p class="mb-1"><strong>Jatuh Tempo :</strong> {{ formatDate(paymentRequest.dueDate || paymentRequest.due_date) }}</p>
        <p class="mb-1"><strong>Pemohon :</strong> {{ requesterName }}</p>
        <p class="mb-1"><strong>Departemen :</strong> {{ departmentName }}</p>
        <p class="mb-1"><strong>Sumber :</strong> {{ sourceLabel }}</p>
        <p class="mb-1"><strong>No. Dokumen Sumber :</strong> {{ paymentRequest.sourceNumber || paymentRequest.source_number || '-' }}</p>
        <p v-if="paymentRequest.purpose" class="mb-1"><strong>Keperluan :</strong> {{ paymentRequest.purpose }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Prioritas :</strong> {{ (paymentRequest.priority || '-').toUpperCase() }}</p>
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel(paymentRequest.status) }}</p>
        <p class="mb-1"><strong>Mata Uang :</strong> {{ paymentRequest.currency || 'IDR' }}</p>
        <p class="mb-1"><strong>Total :</strong> {{ formatRupiahNum(getPaymentRequestTotal(paymentRequest)) }}</p>
      </div>
    </div>

    <div class="cetak-payment-request-section-header">Informasi Penerima</div>
    <div class="table-responsive mb-4">
      <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
        <tbody>
          <tr>
            <td style="width: 28%;" class="fw-medium">Nama Penerima</td>
            <td>{{ paymentRequest.payeeName || paymentRequest.payee_name || paymentRequest.vendor?.name || '—' }}</td>
            <td style="width: 28%;" class="fw-medium">Bank</td>
            <td>{{ paymentRequest.bankName || paymentRequest.bank_name || '—' }}</td>
          </tr>
          <tr>
            <td class="fw-medium">No. Rekening</td>
            <td>{{ paymentRequest.bankAccountNumber || paymentRequest.bank_account_number || '—' }}</td>
            <td class="fw-medium">Atas Nama</td>
            <td>{{ paymentRequest.bankAccountName || paymentRequest.bank_account_name || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cetak-payment-request-section-header">Rincian Pengajuan</div>
    <div class="table-responsive mb-4">
      <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Deskripsi</th>
            <th class="text-end" style="width: 70px;">Qty</th>
            <th class="text-end" style="width: 120px;">Nominal</th>
            <th class="text-end" style="width: 130px;">Subtotal</th>
            <th class="text-start">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, idx) in sourceRows" :key="`src-${idx}`">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-start">{{ d.description || '—' }}</td>
            <td class="text-end">{{ Number(d.qty) || 0 }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.unitAmount ?? d.unit_amount) || 0) }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
            <td class="text-start">{{ d.remarks || '—' }}</td>
          </tr>
          <tr v-if="sourceRows.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="otherRows.length">
      <div class="cetak-payment-request-section-header">Biaya Lainnya</div>
      <div class="table-responsive mb-4">
        <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
          <thead class="table-dark table-head-white">
            <tr>
              <th class="text-center" style="width: 40px;">No</th>
              <th class="text-start">Deskripsi</th>
              <th class="text-end" style="width: 70px;">Qty</th>
              <th class="text-end" style="width: 120px;">Nominal</th>
              <th class="text-end" style="width: 130px;">Subtotal</th>
              <th class="text-start">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, idx) in otherRows" :key="`oth-${idx}`">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start">{{ d.description || '—' }}</td>
              <td class="text-end">{{ Number(d.qty) || 0 }}</td>
              <td class="text-end">{{ formatRupiahNum(Number(d.unitAmount ?? d.unit_amount) || 0) }}</td>
              <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
              <td class="text-start">{{ d.remarks || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-if="sourceRows.length > 0 || otherRows.length > 0" class="d-flex justify-content-end mb-4">
      <div style="min-width: 280px; font-size: 12px;">
        <div class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">Subtotal sumber</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(sourceSubtotal) }}</span>
        </div>
        <div v-if="otherSubtotal > 0" class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">Biaya lainnya</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(otherSubtotal) }}</span>
        </div>
        <div class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">
            Diskon
            <span v-if="discountPercent > 0">({{ discountPercent }}%)</span>
          </span>
          <span class="px-2">:</span>
          <span v-if="discountPercent > 0" class="fw-semibold text-end flex-grow-1">-{{ formatRupiahNum(discountAmount) }}</span>
          <span v-else class="fw-semibold text-end flex-grow-1">-</span>
        </div>
        <div class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">DPP</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(dppAmount) }}</span>
        </div>
        <template v-if="taxRows.length">
          <div
            v-for="(tax, tIdx) in taxRows"
            :key="tax.id || `tax-${tIdx}`"
            class="mb-2 d-flex"
          >
            <span class="fw-medium" style="min-width: 110px;">
              {{ tax.taxCode }}
              <span v-if="tax.calculationType === 'PERCENTAGE'">({{ Number(tax.rate) }}%)</span>
            </span>
            <span class="px-2">:</span>
            <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(tax.amount) }}</span>
          </div>
        </template>
        <div v-else class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">
            Pajak / PPN
            <span v-if="taxPercent > 0">({{ taxPercent }}%)</span>
          </span>
          <span class="px-2">:</span>
          <span v-if="taxPercent > 0" class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(taxAmount) }}</span>
          <span v-else class="fw-semibold text-end flex-grow-1">-</span>
        </div>
        <div class="fw-bold border-top border-dark pt-2 d-flex">
          <span style="min-width: 110px;">Grand Total</span>
          <span class="px-2">:</span>
          <span class="text-end flex-grow-1">{{ formatRupiahNum(getPaymentRequestTotal(paymentRequest)) }}</span>
        </div>
      </div>
    </div>

    <div v-if="notesText" class="cetak-payment-request-description mb-4">
      <div class="cetak-payment-request-terms-header fw-bold text-white">Catatan</div>
      <div class="cetak-payment-request-description-body" style="white-space: pre-wrap;">{{ notesText }}</div>
    </div>

    <div
      v-if="paymentRequest.status === 'rejected' && (paymentRequest.rejectionReason || paymentRequest.rejectReason)"
      class="alert alert-danger py-2 mb-4"
      style="font-size: 12px"
    >
      <strong>Alasan Penolakan:</strong> {{ paymentRequest.rejectionReason || paymentRequest.rejectReason }}
    </div>

    <div v-if="showSignatureSection" class="signature-section mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen Payment Request ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (paymentRequest.id ?? '')"
        document-type="payment-requests"
        :document-id="paymentRequest.id != null ? String(paymentRequest.id) : ''"
        :columns="4"
        :qr-size="96"
        :show-header="false"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>

    <div class="cetak-payment-request-page-footer">
      <span>{{ getPaymentRequestNo(paymentRequest) || 'PRQ' }} — Skylink</span>
      <span>{{ printedAt }}</span>
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    Payment Request tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
})
import { onMounted, computed } from 'vue'
import {
  usePaymentRequestStore,
  getPaymentRequestNo,
  getPaymentRequestTotal,
  getPaymentRequestSourceSubtotal,
  getPaymentRequestOtherSubtotal,
  getPaymentRequestDiscountAmount,
  getPaymentRequestTaxAmount,
  getPaymentRequestTaxes,
  getPaymentRequestSourceItems,
  getPaymentRequestOtherCharges,
  getSourceTypeLabel,
} from '~/stores/payment-request'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const paymentRequestStore = usePaymentRequestStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { paymentRequest, loading, error } = storeToRefs(paymentRequestStore)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  if (list && list.length > 0) return list[0]
  return null
})

const sourceRows = computed(() => getPaymentRequestSourceItems(paymentRequest.value))
const otherRows = computed(() => getPaymentRequestOtherCharges(paymentRequest.value))

const sourceSubtotal = computed(() => getPaymentRequestSourceSubtotal(paymentRequest.value))
const otherSubtotal = computed(() => getPaymentRequestOtherSubtotal(paymentRequest.value))
const discountAmount = computed(() => getPaymentRequestDiscountAmount(paymentRequest.value))
const taxAmount = computed(() => getPaymentRequestTaxAmount(paymentRequest.value))
const taxRows = computed(() => getPaymentRequestTaxes(paymentRequest.value))
const discountPercent = computed(() =>
  Number(paymentRequest.value?.discountPercent ?? paymentRequest.value?.discount_percent ?? 0)
)
const taxPercent = computed(() =>
  Number(paymentRequest.value?.taxPercent ?? paymentRequest.value?.tax_percent ?? 0)
)
const dppAmount = computed(() => {
  const stored = Number(paymentRequest.value?.dpp ?? 0)
  if (stored > 0) return stored
  return Math.max(0, sourceSubtotal.value - discountAmount.value) + otherSubtotal.value
})

const requesterName = computed(
  () =>
    paymentRequest.value?.requestedByUser?.fullName ||
    paymentRequest.value?.requestedByUser?.full_name ||
    paymentRequest.value?.createdByUser?.full_name ||
    '-'
)

const departmentName = computed(
  () =>
    paymentRequest.value?.department?.nm_departemen ||
    paymentRequest.value?.department?.nmDepartemen ||
    '-'
)

const sourceLabel = computed(() =>
  getSourceTypeLabel(paymentRequest.value?.sourceType || paymentRequest.value?.source_type)
)

const notesText = computed(() => {
  const notes = (paymentRequest.value?.notes ?? '') + ''
  return notes.trim() || ''
})

const showSignatureSection = computed(
  () => paymentRequest.value?.status === 'approved' || paymentRequest.value?.status === 'completed'
)

const legacySignerName = computed(
  () =>
    paymentRequest.value?.approvedByUser?.fullName ??
    paymentRequest.value?.approvedByUser?.full_name ??
    null
)
const legacySignerTitle = computed(() => {
  const user = paymentRequest.value?.approvedByUser
  return user?.roles?.[0]?.name ?? null
})

const printedAt = computed(() => new Date().toLocaleString('id-ID'))

function formatRupiahNum(val) {
  if (val === null || val === undefined || val === '') return '-'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '-'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
    Math.round(n)
  )
}

function onPrint() {
  window.print()
}

function formatDate(val) {
  if (!val) return '-'
  try {
    const raw = String(val)
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`

    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch {
    return String(val)
  }
}

function statusLabel(s) {
  const map = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return s ? map[s] || s : '-'
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await paymentRequestStore.getPaymentRequestDetails(String(id))
      if (paymentRequest.value) {
        setDetailTitle('Cetak Payment Request - ' + getPaymentRequestNo(paymentRequest.value))
      }
    } catch (e) {
      console.error('Cetak Payment Request load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-payment-request-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-payment-request-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-payment-request-print-btn i {
  color: inherit !important;
}
.cetak-payment-request-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-payment-request-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-payment-request-title-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}
.cetak-payment-request-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-payment-request-section-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 0;
}
.cetak-payment-request-table {
  border-color: transparent;
}
.cetak-payment-request-table td,
.cetak-payment-request-table th {
  border: none !important;
}
.cetak-payment-request-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
  border: none !important;
  color: #fff;
}
.cetak-payment-request-table tbody tr:nth-child(odd) > * {
  background-color: #f5f5f5 !important;
  --bs-table-bg-type: #f5f5f5;
  box-shadow: none !important;
}
.cetak-payment-request-table tbody tr:nth-child(even) > * {
  background-color: #fff !important;
  --bs-table-bg-type: #fff;
  box-shadow: none !important;
}
.table-head-white {
  color: #fff;
}
.cetak-payment-request-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
.cetak-payment-request-terms-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-payment-request-description-body {
  font-size: 12px;
  border: none;
  padding: 12px;
  min-height: 60px;
}
.cetak-payment-request-page-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f5f5f5;
  font-size: 11px;
  color: #6c757d;
}
</style>

<style>
@media print {
  .cetak-payment-request-hr {
    border: none !important;
    border-top: 1pt solid #4275f6 !important;
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
  .cetak-payment-request-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    font-size: 12px;
  }
  .cetak-payment-request-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-payment-request-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-payment-request-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-payment-request-title {
    font-size: 1.35rem !important;
  }
  .cetak-payment-request-table {
    border-collapse: collapse;
  }
  .cetak-payment-request-table td,
  .cetak-payment-request-table th {
    border: none !important;
    padding: 6px 8px !important;
  }
  .cetak-payment-request-table thead th {
    border: none !important;
  }
  .cetak-payment-request-table tbody tr:nth-child(odd) > * {
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-payment-request-table tbody tr:nth-child(even) > * {
    background-color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-payment-request-description-body {
    border: none !important;
  }
  .cetak-payment-request-table thead th,
  .cetak-payment-request-section-header,
  .cetak-payment-request-grand-total td,
  .cetak-payment-request-terms-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
