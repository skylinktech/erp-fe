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
  <div v-else-if="quotation" class="p-2 cetak-qo-doc position-relative">
    <!-- Tombol Print: pojok kanan atas, disembunyikan saat cetak -->
    <button
      type="button"
      class="btn btn-primary no-print cetak-qo-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <!-- Header: Logo kiri, SKYLINK tengah, Judul kanan (sama seperti cetak SI) -->
    <div class="d-flex justify-content-between align-items-start mb-4 cetak-qo-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-qo-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-qo-title-wrap text-end mt-3">
        <h1 class="cetak-qo-title fw-bold mb-0">QUOTATION</h1>
      </div>
    </div>

    <hr class="cetak-qo-hr my-4">

    <!-- Info: kiri & kanan -->
    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>No. Quotation :</strong> {{ quotation.noQuotation || '-' }}</p>
        <p class="mb-1"><strong>Tanggal :</strong> {{ formatDate(quotation.date) }}</p>
        <p class="mb-1"><strong>Customer :</strong> {{ quotation.customer?.name || '-' }}</p>
        <p class="mb-1"><strong>PIC :</strong> {{ quotation.up || quotation.createdByUser?.fullName || '-' }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Valid Until :</strong> {{ formatDate(quotation.validUntil) }}</p>
        <p class="mb-1"><strong>Terms of Payment :</strong> {{ quotation.termsOfPayment || '-' }}</p>
        <p class="mb-1"><strong>Site :</strong> {{ quotation.site?.name || quotation.site?.code || '-' }}</p>
      </div>
    </div>

    <!-- Tabel: No, Item Description, Qty, Unit of Day, Unit Price, Total -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-qo-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Item Description</th>
            <th class="text-center" style="width: 50px;">Qty</th>
            <th class="text-center" style="width: 70px;">Unit of Day</th>
            <th class="text-end" style="width: 110px;">Unit Price</th>
            <th class="text-end" style="width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- One Time Charge (OTC) -->
          <template v-if="otcItems.length > 0">
            <tr class="fw-bold bg-light cetak-qo-section-row">
              <td colspan="6" class="text-start">One Time Charge (OTC)</td>
            </tr>
            <tr v-for="(m, idx) in otcItems" :key="'otc-' + (m.id || idx)">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start">{{ m.product?.name || m.product?.sku || '—' }}</td>
              <td class="text-center">{{ m.quantity ?? 0 }}</td>
              <td class="text-center">1</td>
              <td class="text-end">{{ formatRupiahNum(otcUnitPrice(m)) }}</td>
              <td class="text-end">{{ formatRupiahNum(otcAmount(m)) }}</td>
            </tr>
          </template>

          <!-- Monthly Recurring Charge (MRC) - satu section saja, tidak dipisah -->
          <template v-if="mrcItems.length > 0">
            <tr class="fw-bold bg-light cetak-qo-section-row">
              <td colspan="6" class="text-start">Monthly Recurring Charge (MRC)</td>
            </tr>
            <tr v-for="(m, idx) in mrcItems" :key="'mrc-' + (m.id || idx)">
              <td class="text-center">{{ otcItems.length + idx + 1 }}</td>
              <td class="text-start">{{ mrcItemDescription(m) }}</td>
              <td class="text-center">{{ m.quantity ?? 0 }}</td>
              <td class="text-center">{{ mrcUnitOfDay(m) }}</td>
              <td class="text-end">{{ formatRupiahNum(mrcDisplayUnitPrice(m)) }}</td>
              <td class="text-end">{{ formatRupiahNum(mrcTotal(m)) }}</td>
            </tr>
          </template>

          <!-- Subtotal item (sebelum PPN/PPH) -->
          <tr v-if="hasTableItems" class="fw-medium">
            <td colspan="5" class="text-end">Subtotal Item</td>
            <td class="text-end">{{ formatRupiahNum(itemsSubtotal) }}</td>
          </tr>

          <tr v-if="!otcItems.length && !mrcItems.length">
            <td colspan="6" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Ringkasan finansial: Subtotal, Diskon, PPN, PPH, Grand Total -->
    <div v-if="quotation && totals.subtotal > 0" class="cetak-qo-summary mb-4">
      <table class="table table-sm table-borderless cetak-qo-summary-table m-0 ms-auto" style="font-size: 12px; max-width: 360px;">
        <tbody>
          <tr>
            <td class="text-end text-muted">Subtotal</td>
            <td class="text-end fw-medium" style="width: 140px;">{{ formatRupiahNum(totals.subtotal) }}</td>
          </tr>
          <tr v-if="totals.discountPercent > 0 || totals.discountAmount > 0">
            <td class="text-end text-muted">Diskon ({{ totals.discountPercent }}%)</td>
            <td class="text-end fw-medium">-{{ formatRupiahNum(totals.discountAmount) }}</td>
          </tr>
          <tr v-if="totals.discountPercent > 0 || totals.discountAmount > 0">
            <td class="text-end text-muted">Setelah Diskon</td>
            <td class="text-end fw-medium">{{ formatRupiahNum(totals.afterDiscount) }}</td>
          </tr>
          <tr v-if="totals.ppnPercent > 0 || totals.ppnAmount > 0">
            <td class="text-end text-muted">PPN ({{ totals.ppnPercent }}%)</td>
            <td class="text-end fw-medium">{{ formatRupiahNum(totals.ppnAmount) }}</td>
          </tr>
          <tr v-if="totals.hasPph">
            <td class="text-end text-muted">PPH ({{ totals.pphPercent }}%)</td>
            <td class="text-end fw-medium">-{{ formatRupiahNum(totals.pphAmount) }}</td>
          </tr>
          <tr class="cetak-qo-summary-grand">
            <td class="text-end fw-bold">Grand Total</td>
            <td class="text-end fw-bold">{{ formatRupiahNum(totals.grandTotal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Description (dari field Deskripsi quotation; menggantikan Terms and Conditions) -->
    <div v-if="descriptionHtml" class="cetak-qo-description mb-4">
      <div class="cetak-qo-terms-header fw-bold text-white">Terms and Conditions</div>
      <div class="cetak-qo-description-body prose" v-html="descriptionHtml"></div>
    </div>

    <!-- Tanda tangan digital (TTD + QR) ketika quotation approved; tanpa label "Approved by" -->
    <div v-if="showSignatureSection" class="signature-section mt-5">
      <p class="text-center mb-0" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen Quotation ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (quotation.id ?? '')"
        document-type="quotations"
        :document-id="quotation.id != null ? String(quotation.id) : ''"
        :columns="4"
        :qr-size="96"
        :compact="true"
        :show-approved-by-label="false"
        :legacy-signature-token="quotation.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>

    <!-- Footer halaman: kiri = Quotation (no_quotation) Skylink, kanan = Halaman 1/1 -->
    <div class="cetak-qo-page-footer">
      <span class="cetak-qo-footer-left">Quotation ({{ quotation.noQuotation || quotation.no_quotation || '-' }}) Skylink</span>
      <span class="cetak-qo-footer-right">Halaman 1/1</span>
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    Quotation tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useQuotationStore } from '~/stores/quotation'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'
import { computeQuotationTotals } from '~/utils/quotationTotals'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const quotationStore = useQuotationStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()
const formatRupiah = useFormatRupiah()

const { quotation, loading, error } = storeToRefs(quotationStore)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  if (list && list.length > 0) return list[0]
  return quotation.value?.perusahaan || null
})

// Tampilkan section TTD digital ketika quotation approved (tanpa label "Approved by")
const showSignatureSection = computed(() => quotation.value?.status === 'approved')
const legacySignerName = computed(() => quotation.value?.approvedByUser?.fullName || null)
const legacySignerTitle = computed(() => {
  const user = quotation.value?.approvedByUser
  return user?.roles?.[0]?.name || null
})

function formatRupiahNum (val) {
  if (val === null || val === undefined || val === '') return '-'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '-'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n))
}

function onPrint () {
  window.print()
}

function formatDate (val) {
  if (!val) return '-'
  const d = typeof val === 'string' ? new Date(val) : val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Description dari quotation (HTML dari rich text editor); ditampilkan menggantikan Terms and Conditions
const descriptionHtml = computed(() => {
  const q = quotation.value
  const desc = (q?.description ?? '') + ''
  const trimmed = desc.trim()
  return trimmed || ''
})

// Billing type dari product
function getBillingType (item) {
  return (item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time') + ''
}

const otcItems = computed(() => {
  const list = quotation.value?.quotationItems ?? quotation.value?.quotation_items ?? []
  return list.filter((i) => getBillingType(i) !== 'recurring')
})

const mrcItems = computed(() => {
  const productList = quotation.value?.quotationItems ?? quotation.value?.quotation_items ?? []
  const serviceList = quotation.value?.quotationServices ?? quotation.value?.quotation_services ?? []
  const productRecurring = productList.filter((i) => getBillingType(i) === 'recurring')
  const serviceRecurring = serviceList.filter((s) => {
    const bt = (s?.billingType ?? s?.billing_type ?? s?.service?.billing_type ?? s?.service?.billingType ?? '') + ''
    return bt.toLowerCase() === 'recurring'
  })
  return [...productRecurring, ...serviceRecurring]
})

function otcAmount (m) {
  const sub = m.subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    if (!Number.isNaN(n)) return n
  }
  return (Number(m.quantity) || 0) * (Number(m.price) || 0)
}

function otcUnitPrice (m) {
  const sub = m.subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    const qty = Number(m.quantity) || 1
    if (!Number.isNaN(n) && qty > 0) return n / qty
  }
  return Number(m.price) || 0
}

function getServiceEffectivePrice (s) {
  const base = Number(s?.price) || 0
  const tk = Number(s?.terminalKitCount ?? s?.terminal_kit_count) || 0
  const qp = Number(s?.quotaPriority ?? s?.quota_priority) || 0
  const nsl = Number(s?.newServiceLine ?? s?.new_service_line) || 0
  const ad = Number(s?.additionalData ?? s?.additional_data) || 0
  return base + tk + qp + nsl + ad
}

function mrcDisplayUnitPrice (m) {
  const sub = m.subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    const qty = Number(m.quantity) || 1
    if (!Number.isNaN(n) && qty > 0) return n / qty
  }
  if (m.service != null || m.serviceId != null || m.service_id != null) return getServiceEffectivePrice(m)
  return Number(m.price) || 0
}

function mrcTotal (m) {
  const sub = m.subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(m.quantity) || 0
  const unitPrice = (m.service != null || m.serviceId != null || m.service_id != null) ? getServiceEffectivePrice(m) : (Number(m.price) || 0)
  return qty * unitPrice
}

function mrcItemDescription (m) {
  if (m.service) return m.service.name || m.service.code || '—'
  if (m.product) return m.product.name || m.product.sku || '—'
  return m.description || '—'
}

function mrcUnitOfDay (m) {
  return m.quantity ?? 1
}

const itemsSubtotal = computed(() => {
  const otc = otcItems.value.reduce((s, m) => s + otcAmount(m), 0)
  const mrc = mrcItems.value.reduce((s, m) => s + mrcTotal(m), 0)
  return otc + mrc
})

const totals = computed(() => computeQuotationTotals(quotation.value))

const hasTableItems = computed(() => otcItems.value.length + mrcItems.value.length > 0)

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await quotationStore.getQuotationDetails(String(id))
      if (quotation.value) {
        setDetailTitle('Cetak Quotation - ' + quotation.value.noQuotation)
      }
    } catch (e) {
      console.error('Cetak Quotation load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-qo-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-qo-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-qo-print-btn i {
  color: inherit !important;
}
.cetak-qo-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-qo-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-qo-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-qo-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-qo-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-qo-section-row td {
  background-color: #f8f9fa;
}
.cetak-qo-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
.cetak-qo-summary-table td {
  padding: 4px 8px;
  vertical-align: middle;
}
.cetak-qo-summary-grand td {
  border-top: 2px solid #4275f6;
  padding-top: 8px !important;
  color: #4275f6;
  font-size: 13px;
}
.cetak-qo-terms-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-qo-terms-header.text-white {
  color: #fff !important;
}
.cetak-qo-description-body {
  font-size: 12px;
  border: 1px solid #4275f6;
  border-top: none;
  padding: 12px;
  min-height: 60px;
}
.cetak-qo-description-body.prose :deep(p) { margin-bottom: 0.5em; }
.cetak-qo-description-body.prose :deep(ul), .cetak-qo-description-body.prose :deep(ol) { padding-left: 1.25rem; margin-bottom: 0.5em; }
.cetak-qo-description-body.prose :deep(li) { margin-bottom: 0.25em; }

/* Footer halaman: kiri dan kanan bawah */
.cetak-qo-page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0.5rem 0;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #e0e0e0;
}
.cetak-qo-footer-left { text-align: left; }
.cetak-qo-footer-right { text-align: right; }
</style>

<style>
@media print {
  .cetak-qo-hr {
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
  .cetak-qo-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    padding-bottom: 2.5rem !important;
    font-size: 12px;
  }
  .cetak-qo-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-qo-footer {
    margin-top: 0.5rem !important;
  }
  .cetak-qo-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-qo-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-qo-title-wrap {
    text-align: right !important;
  }
  .cetak-qo-title {
    font-size: 1.35rem !important;
  }
  .cetak-qo-table {
    border-collapse: collapse;
  }
  .cetak-qo-table td,
  .cetak-qo-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .cetak-qo-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-qo-section-row td,
  .bg-light {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-qo-grand-total td {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-qo-summary-grand td {
    border-top: 1pt solid #4275f6 !important;
    color: #4275f6 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-qo-terms-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-qo-terms-header.text-white {
    color: #fff !important;
  }
  .cetak-qo-page-footer {
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
