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
  <div v-else-if="materialRequest" class="p-2 cetak-material-request-doc position-relative">
    <button
      type="button"
      class="btn btn-primary no-print cetak-material-request-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <div class="d-flex justify-content-between align-items-start mb-4 cetak-material-request-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-material-request-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-material-request-title-wrap text-end mt-3">
        <h1 class="cetak-material-request-title fw-bold mb-0">MATERIAL REQUEST FORM</h1>
      </div>
    </div>

    <hr class="cetak-material-request-hr my-4">

    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>No. Material Request :</strong> {{ getMaterialRequestNo(materialRequest) || '-' }}</p>
        <p class="mb-1"><strong>Tanggal Request :</strong> {{ formatDate(materialRequest.requestDate || materialRequest.request_date || materialRequest.createdAt) }}</p>
        <p class="mb-1"><strong>Pemohon :</strong> {{ materialRequest.requestedByUser?.fullName || materialRequest.requestedByUser?.full_name || materialRequest.createdByUser?.full_name || '-' }}</p>
        <p class="mb-1"><strong>Site Investment :</strong> {{ siteInvestmentLabel }}</p>
        <p class="mb-1"><strong>Proyek :</strong> {{ projectLabel }}</p>
        <p v-if="materialRequest.purpose" class="mb-1"><strong>Keperluan :</strong> {{ materialRequest.purpose }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Prioritas :</strong> {{ (materialRequest.priority || '-').toUpperCase() }}</p>
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel(materialRequest.status) }}</p>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-material-request-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Material</th>
            <th class="text-start">Spesifikasi</th>
            <th class="text-end" style="width: 60px;">Qty</th>
            <th class="text-start" style="width: 70px;">Satuan</th>
            <th class="text-end" style="width: 110px;">Harga</th>
            <th class="text-end" style="width: 120px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, idx) in tableRows" :key="d.id || idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-start">{{ itemLabel(d) }}</td>
            <td class="text-start">{{ d.specification || '—' }}</td>
            <td class="text-end">{{ Number(d.qty ?? d.quantity) || 0 }}</td>
            <td class="text-start">{{ d.uom?.symbol || d.uom?.name || '—' }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.estimatedPrice ?? d.estimated_price ?? d.unitPrice) || 0) }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
          </tr>
          <tr v-if="tableRows.length > 0" class="fw-bold cetak-material-request-grand-total">
            <td colspan="6" class="text-end">Grand Total</td>
            <td class="text-end">{{ formatRupiahNum(getMaterialRequestTotal(materialRequest)) }}</td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td colspan="7" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="descriptionHtml" class="cetak-material-request-description mb-4">
      <div class="cetak-material-request-terms-header fw-bold text-white">Deskripsi</div>
      <div class="cetak-material-request-description-body prose" v-html="descriptionHtml"></div>
    </div>

    <div v-if="showSignatureSection" class="signature-section mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0 mb-3" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen Material Request Form ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (materialRequest.id ?? '')"
        document-type="material-requests"
        :document-id="materialRequest.id != null ? String(materialRequest.id) : ''"
        title="Verifikasi Digital Dokumen"
        :columns="4"
        :qr-size="96"
        :legacy-signature-token="materialRequest.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    Material Request tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useMaterialRequestStore, getMaterialRequestNo, getMaterialRequestTotal, getMaterialRequestItemsList } from '~/stores/material-request'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const materialRequestStore = useMaterialRequestStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { materialRequest, loading, error } = storeToRefs(materialRequestStore)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  if (list && list.length > 0) return list[0]
  return null
})

const tableRows = computed(() => getMaterialRequestItemsList(materialRequest.value))

const siteInvestmentLabel = computed(() => {
  const si = materialRequest.value?.siteInvestment
  if (!si) return '—'
  return si.siNumber || si.si_number || '—'
})

const projectLabel = computed(() => {
  const si = materialRequest.value?.siteInvestment
  if (!si) return '—'
  const name = si.name || si.projectName || si.project_name || ''
  const customer = si.customer?.name || ''
  return [name, customer ? `(${customer})` : ''].filter(Boolean).join(' ') || '—'
})

const descriptionHtml = computed(() => {
  const desc = (materialRequest.value?.purpose ?? materialRequest.value?.notes ?? '') + ''
  return desc.trim() || ''
})

const showSignatureSection = computed(() => materialRequest.value?.status === 'approved')

const legacySignerName = computed(() => materialRequest.value?.approvedByUser?.fullName ?? materialRequest.value?.approvedByUser?.full_name ?? null)
const legacySignerTitle = computed(() => {
  const user = materialRequest.value?.approvedByUser
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

function itemLabel (d) {
  return d?.productName || d?.product_name || d?.product?.name || '—'
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await materialRequestStore.getMaterialRequestDetails(String(id))
      if (materialRequest.value) {
        setDetailTitle('Cetak Material Request - ' + getMaterialRequestNo(materialRequest.value))
      }
    } catch (e) {
      console.error('Cetak Material Request load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-material-request-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-material-request-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-material-request-print-btn i {
  color: inherit !important;
}
.cetak-material-request-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-material-request-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-material-request-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-material-request-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-material-request-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-material-request-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
.cetak-material-request-terms-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-material-request-description-body {
  font-size: 12px;
  border: 1px solid #4275f6;
  border-top: none;
  padding: 12px;
  min-height: 60px;
}
.cetak-material-request-description-body.prose :deep(p) { margin-bottom: 0.5em; }
.cetak-material-request-description-body.prose :deep(ul), .cetak-material-request-description-body.prose :deep(ol) { padding-left: 1.25rem; margin-bottom: 0.5em; }
.cetak-material-request-description-body.prose :deep(li) { margin-bottom: 0.25em; }
</style>

<style>
@media print {
  .cetak-material-request-hr {
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
  .cetak-material-request-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    font-size: 12px;
  }
  .cetak-material-request-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-material-request-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-material-request-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-material-request-title {
    font-size: 1.35rem !important;
  }
  .cetak-material-request-table {
    border-collapse: collapse;
  }
  .cetak-material-request-table td,
  .cetak-material-request-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .cetak-material-request-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-material-request-grand-total td {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-material-request-terms-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
