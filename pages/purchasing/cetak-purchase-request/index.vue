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
  <div v-else-if="purchaseRequest" class="p-2 cetak-purchase-request-doc position-relative">
    <button
      type="button"
      class="btn btn-primary no-print cetak-purchase-request-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <div class="d-flex justify-content-between align-items-start mb-4 cetak-purchase-request-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-purchase-request-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-purchase-request-title-wrap text-end mt-3">
        <h1 class="cetak-purchase-request-title fw-bold mb-0">PURCHASE REQUEST</h1>
      </div>
    </div>

    <hr class="cetak-purchase-request-hr my-4">

    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>No. Purchase Request :</strong> {{ getPurchaseRequestNo(purchaseRequest) || '-' }}</p>
        <p class="mb-1"><strong>Tanggal Request :</strong> {{ formatDate(purchaseRequest.requestDate || purchaseRequest.request_date || purchaseRequest.createdAt) }}</p>
        <p class="mb-1"><strong>Pemohon :</strong> {{ purchaseRequest.requestedByUser?.fullName || purchaseRequest.requestedByUser?.full_name || purchaseRequest.createdByUser?.full_name || '-' }}</p>
        <p v-if="purchaseRequest.purpose" class="mb-1"><strong>Keperluan :</strong> {{ purchaseRequest.purpose }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Prioritas :</strong> {{ (purchaseRequest.priority || '-').toUpperCase() }}</p>
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel(purchaseRequest.status) }}</p>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-purchase-request-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Produk</th>
            <th class="text-start">Gudang</th>
            <th class="text-end" style="width: 60px;">Qty</th>
            <th class="text-end" style="width: 110px;">Harga</th>
            <th class="text-end" style="width: 120px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, idx) in tableRows" :key="d.id || idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-start">{{ itemLabel(d) }}</td>
            <td class="text-start">{{ d.warehouse?.name || d.warehouse?.code || '—' }}</td>
            <td class="text-end">{{ Number(d.qty ?? d.quantity) || 0 }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.estimatedPrice ?? d.estimated_price ?? d.unitPrice) || 0) }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
          </tr>
          <tr v-if="tableRows.length > 0" class="fw-bold cetak-purchase-request-grand-total">
            <td colspan="5" class="text-end">Grand Total</td>
            <td class="text-end">{{ formatRupiahNum(getPurchaseRequestTotal(purchaseRequest)) }}</td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="descriptionHtml" class="cetak-purchase-request-description mb-4">
      <div class="cetak-purchase-request-terms-header fw-bold text-white">Deskripsi</div>
      <div class="cetak-purchase-request-description-body prose" v-html="descriptionHtml"></div>
    </div>

    <div v-if="showSignatureSection" class="signature-section mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0 mb-3" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen Purchase Request ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (purchaseRequest.id ?? '')"
        document-type="purchase-requests"
        :document-id="purchaseRequest.id != null ? String(purchaseRequest.id) : ''"
        title="Verifikasi Digital Dokumen"
        :columns="4"
        :qr-size="96"
        :legacy-signature-token="purchaseRequest.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    Purchase Request tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { usePurchaseRequestStore, getPurchaseRequestNo, getPurchaseRequestTotal, getPurchaseRequestItemsList } from '~/stores/purchase-request'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const purchaseRequestStore = usePurchaseRequestStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { purchaseRequest, loading, error } = storeToRefs(purchaseRequestStore)

useRegisterCetakDraftStatus(() => purchaseRequest.value?.status)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  if (list && list.length > 0) return list[0]
  return null
})

const tableRows = computed(() => getPurchaseRequestItemsList(purchaseRequest.value))

const descriptionHtml = computed(() => {
  const desc = (purchaseRequest.value?.purpose ?? purchaseRequest.value?.notes ?? '') + ''
  return desc.trim() || ''
})

const showSignatureSection = computed(() => purchaseRequest.value?.status === 'approved')

const legacySignerName = computed(() => purchaseRequest.value?.approvedByUser?.fullName ?? purchaseRequest.value?.approvedByUser?.full_name ?? null)
const legacySignerTitle = computed(() => {
  const user = purchaseRequest.value?.approvedByUser
  return user?.roles?.[0]?.name ?? null
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

function statusLabel (s) {
  const map = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
  return s ? (map[s] || s) : '-'
}

function typeLabel (t) {
  const u = String(t || '').toUpperCase()
  if (u === 'PRODUCT') return 'Product'
  if (u === 'SERVICE') return 'Service'
  if (u === 'DID') return 'DID'
  return t || '—'
}

function itemLabel (d) {
  const sku = d?.product?.sku ? `${d.product.sku} — ` : ''
  return `${sku}${d?.productName || d?.product_name || d?.product?.name || '—'}`
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await purchaseRequestStore.getPurchaseRequestDetails(String(id))
      if (purchaseRequest.value) {
        setDetailTitle('Cetak Purchase Request - ' + getPurchaseRequestNo(purchaseRequest.value))
      }
    } catch (e) {
      console.error('Cetak Purchase Request load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-purchase-request-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-purchase-request-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-purchase-request-print-btn i {
  color: inherit !important;
}
.cetak-purchase-request-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-purchase-request-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-purchase-request-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-purchase-request-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-purchase-request-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-purchase-request-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
.cetak-purchase-request-terms-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-purchase-request-description-body {
  font-size: 12px;
  border: 1px solid #4275f6;
  border-top: none;
  padding: 12px;
  min-height: 60px;
}
.cetak-purchase-request-description-body.prose :deep(p) { margin-bottom: 0.5em; }
.cetak-purchase-request-description-body.prose :deep(ul), .cetak-purchase-request-description-body.prose :deep(ol) { padding-left: 1.25rem; margin-bottom: 0.5em; }
.cetak-purchase-request-description-body.prose :deep(li) { margin-bottom: 0.25em; }
</style>

<style>
@media print {
  .cetak-purchase-request-hr {
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
  .cetak-purchase-request-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    font-size: 12px;
  }
  .cetak-purchase-request-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-purchase-request-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-purchase-request-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-purchase-request-title {
    font-size: 1.35rem !important;
  }
  .cetak-purchase-request-table {
    border-collapse: collapse;
  }
  .cetak-purchase-request-table td,
  .cetak-purchase-request-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .cetak-purchase-request-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-purchase-request-grand-total td {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-purchase-request-terms-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
