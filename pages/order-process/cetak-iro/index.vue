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
  <div v-else-if="iro" class="p-2 cetak-iro-doc position-relative">
    <button
      type="button"
      class="btn btn-primary no-print cetak-iro-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <div class="d-flex justify-content-between align-items-start mb-4 cetak-iro-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-iro-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-iro-title-wrap text-end mt-3">
        <h1 class="cetak-iro-title fw-bold mb-0">INTERNAL REQUEST ORDER (IRO)</h1>
      </div>
    </div>

    <hr class="cetak-iro-hr my-4">

    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>No. IRO :</strong> {{ iro.noIro || iro.no_iro || '-' }}</p>
        <p class="mb-1"><strong>Tanggal :</strong> {{ formatDate(iro.createdAt) }}</p>
        <p class="mb-1"><strong>Customer :</strong> {{ iro.customer?.name || '-' }}</p>
        <p class="mb-1"><strong>Quotation :</strong> {{ iro.quotation?.noQuotation || iro.quotation?.no_quotation || '-' }}</p>
        <p class="mb-1"><strong>Site Investment :</strong> {{ iro.siteInvest?.siNumber || iro.siteInvest?.si_number || iro.siteInvest?.name || '-' }}</p>
        <p class="mb-1"><strong>Dibuat oleh :</strong> {{ iro.createdByUser?.fullName || iro.createdByUser?.full_name || '-' }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Terms of Payment :</strong> {{ iro.termsOfPayment || iro.terms_of_payment || '-' }}</p>
        <p class="mb-1"><strong>Jenis IRO :</strong> {{ (iro.jenisIro || iro.jenis_iro || '-').toUpperCase() }}</p>
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel(iro.status) }}</p>
        <p v-if="iro.up" class="mb-1"><strong>Untuk Perhatian (UP) :</strong> {{ iro.up }}</p>
        <p class="mb-1"><strong>Lampiran :</strong> SI {{ iro.si ? 'Ya' : 'Tidak' }}, Subs Form {{ (iro.subsForm ?? iro['subs_form']) ? 'Ya' : 'Tidak' }}, PKS {{ iro.pks ? 'Ya' : 'Tidak' }}, Others {{ iro.others ? 'Ya' : 'Tidak' }}</p>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-iro-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Tipe</th>
            <th class="text-start">Item</th>
            <th class="text-center" style="width: 70px;">Min. Period</th>
            <th class="text-end" style="width: 60px;">Qty</th>
            <th class="text-end" style="width: 110px;">Harga</th>
            <th class="text-end" style="width: 120px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, idx) in tableRows" :key="d.id || idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-start">{{ typeLabel(d.itemType) }}</td>
            <td class="text-start">{{ itemLabel(d) }}</td>
            <td class="text-center">{{ (d.itemType || '').toUpperCase() === 'SERVICE' ? (d.minimumPeriod ?? d.minimum_period ?? '12') + ' bln' : '—' }}</td>
            <td class="text-end">{{ Number(d.quantity) || 0 }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.price) || 0) }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
          </tr>
          <tr v-if="tableRows.length > 0" class="fw-bold cetak-iro-grand-total">
            <td colspan="6" class="text-end">Grand Total</td>
            <td class="text-end">{{ formatRupiahNum(iro.grandTotal ?? 0) }}</td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td colspan="7" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="iro.materialSubtotal != null || iro.didSubtotal != null" class="mb-4" style="font-size: 12px;">
      <div class="d-flex justify-content-end gap-4 flex-wrap">
        <span><strong>Material :</strong> {{ formatRupiahNum(iro.materialSubtotal ?? 0) }}</span>
        <span><strong>Service :</strong> {{ formatRupiahNum(serviceSubtotalDisplay) }}</span>
        <span><strong>DID :</strong> {{ formatRupiahNum(iro.didSubtotal ?? 0) }}</span>
      </div>
    </div>

    <div v-if="descriptionHtml" class="cetak-iro-description mb-4">
      <div class="cetak-iro-terms-header fw-bold text-white">Deskripsi</div>
      <div class="cetak-iro-description-body prose" v-html="descriptionHtml"></div>
    </div>

    <div v-if="showSignatureSection" class="signature-section mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0 mb-3" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen IRO ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (iro.id ?? '')"
        document-type="iros"
        :document-id="iro.id != null ? String(iro.id) : ''"
        title="Verifikasi Digital Dokumen"
        :columns="4"
        :qr-size="96"
        :legacy-signature-token="iro.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    IRO tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useIroStore } from '~/stores/iro'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const iroStore = useIroStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { iro, loading, error } = storeToRefs(iroStore)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  if (list && list.length > 0) return list[0]
  return null
})

const tableRows = computed(() => {
  const list = iro.value?.iroDetails ?? iro.value?.iro_details ?? []
  return list
})

const serviceSubtotalDisplay = computed(() => {
  const g = Number(iro.value?.grandTotal) || 0
  const m = Number(iro.value?.materialSubtotal) || 0
  const d = Number(iro.value?.didSubtotal) || 0
  return Math.max(0, g - m - d)
})

const descriptionHtml = computed(() => {
  const desc = (iro.value?.description ?? '') + ''
  return desc.trim() || ''
})

const showSignatureSection = computed(() => iro.value?.status === 'approved')

const legacySignerName = computed(() => iro.value?.approvedByUser?.fullName ?? iro.value?.approvedByUser?.full_name ?? null)
const legacySignerTitle = computed(() => {
  const user = iro.value?.approvedByUser
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
  const t = String(d?.itemType || '').toUpperCase()
  if (t === 'PRODUCT') return d?.product?.name || d?.product?.sku || '—'
  if (t === 'SERVICE') return d?.service?.name || d?.service?.code || '—'
  if (t === 'DID') return d?.did?.code || d?.did?.name || '—'
  return '—'
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await iroStore.getIroDetails(String(id))
      if (iro.value) {
        setDetailTitle('Cetak IRO - ' + (iro.value.noIro || iro.value.no_iro))
      }
    } catch (e) {
      console.error('Cetak IRO load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-iro-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-iro-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-iro-print-btn i {
  color: inherit !important;
}
.cetak-iro-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-iro-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-iro-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-iro-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-iro-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-iro-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
.cetak-iro-terms-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-iro-description-body {
  font-size: 12px;
  border: 1px solid #4275f6;
  border-top: none;
  padding: 12px;
  min-height: 60px;
}
.cetak-iro-description-body.prose :deep(p) { margin-bottom: 0.5em; }
.cetak-iro-description-body.prose :deep(ul), .cetak-iro-description-body.prose :deep(ol) { padding-left: 1.25rem; margin-bottom: 0.5em; }
.cetak-iro-description-body.prose :deep(li) { margin-bottom: 0.25em; }
</style>

<style>
@media print {
  .cetak-iro-hr {
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
  .cetak-iro-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    font-size: 12px;
  }
  .cetak-iro-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-iro-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-iro-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-iro-title {
    font-size: 1.35rem !important;
  }
  .cetak-iro-table {
    border-collapse: collapse;
  }
  .cetak-iro-table td,
  .cetak-iro-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .cetak-iro-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-iro-grand-total td {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-iro-terms-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
