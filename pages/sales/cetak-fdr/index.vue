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
  <div v-else-if="fdr" class="p-2 cetak-fdr-doc position-relative">
    <!-- Tombol Print: pojok kanan atas, disembunyikan saat cetak -->
    <button
      type="button"
      class="btn btn-primary no-print cetak-fdr-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>

    <!-- Header: Logo kiri, SKYLINK tengah, Judul kanan -->
    <div class="d-flex justify-content-between align-items-start mb-4 cetak-fdr-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-fdr-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-fdr-title-wrap text-end mt-3">
        <h1 class="cetak-fdr-title fw-bold mb-0">FDR</h1>
        <div class="text-muted small">Field Development Request</div>
      </div>
    </div>

    <hr class="cetak-fdr-hr my-4">

    <!-- Info: kiri & kanan -->
    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>No. FDR :</strong> {{ fdr.fdrNumber || '-' }}</p>
        <p class="mb-1"><strong>Tanggal FDR :</strong> {{ formatDate(fdr.fdrDate) }}</p>
        <p class="mb-1"><strong>Nama Project :</strong> {{ fdr.name || '-' }}</p>
        <p class="mb-1"><strong>Customer :</strong> {{ fdr.customer?.name || '-' }}</p>
        <p class="mb-1"><strong>PIC :</strong> {{ fdr.createdByUser?.fullName || '-' }}</p>
        <p class="mb-1"><strong>Lokasi :</strong> {{ fdr.location || '-' }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Priority :</strong> {{ priorityLabel }}</p>
        <p class="mb-1"><strong>Quantity :</strong> {{ fdr.quantity ?? '-' }}</p>
        <p class="mb-1"><strong>Est. Start :</strong> {{ formatDate(fdr.estimatedStartDate) }}</p>
        <p class="mb-1"><strong>Est. Completion :</strong> {{ formatDate(fdr.estimatedCompletionDate) }}</p>
        <p class="mb-1"><strong>Site :</strong> {{ fdr.site?.name || fdr.site?.code || '-' }}</p>
        <p class="mb-1"><strong>Skema :</strong> {{ fdr.businessScheme?.name || fdr.businessScheme?.code || '-' }}</p>
      </div>
    </div>

    <!-- Tabel: No, Item Description, Qty, Unit Price, Total -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-fdr-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Item Description</th>
            <th class="text-center" style="width: 60px;">Qty</th>
            <th class="text-end" style="width: 110px;">Unit Price</th>
            <th class="text-end" style="width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- Material (fdrItems) -->
          <template v-if="fdrItems.length > 0">
            <tr class="fw-bold bg-light cetak-fdr-section-row">
              <td colspan="5" class="text-start">Material</td>
            </tr>
            <tr v-for="(m, idx) in fdrItems" :key="'item-' + (m.id || idx)">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start">{{ itemName(m) }}</td>
              <td class="text-center">{{ m.quantity ?? 0 }}</td>
              <td class="text-end">{{ formatRupiahNum(m.price) }}</td>
              <td class="text-end">{{ formatRupiahNum(m.subtotal) }}</td>
            </tr>
          </template>

          <!-- Service (fdrServices) -->
          <template v-if="fdrServices.length > 0">
            <tr class="fw-bold bg-light cetak-fdr-section-row">
              <td colspan="5" class="text-start">Service</td>
            </tr>
            <tr v-for="(s, idx) in fdrServices" :key="'srv-' + (s.id || idx)">
              <td class="text-center">{{ fdrItems.length + idx + 1 }}</td>
              <td class="text-start">{{ itemName(s) }}</td>
              <td class="text-center">{{ s.quantity ?? 0 }}</td>
              <td class="text-end">{{ formatRupiahNum(s.price) }}</td>
              <td class="text-end">{{ formatRupiahNum(s.subtotal) }}</td>
            </tr>
          </template>

          <!-- DID - digroup per unique DID, 1 parent + services saat diexpand (cetak: services selalu tampil) -->
          <template v-if="groupedFdrDidsForCetak.length > 0">
            <tr class="fw-bold bg-light cetak-fdr-section-row">
              <td colspan="5" class="text-start">DID</td>
            </tr>
            <template v-for="(group, idx) in groupedFdrDidsForCetak" :key="'did-' + group.didKey">
              <!-- Parent row: 1 DID -->
              <tr>
                <td class="text-center">{{ fdrItems.length + fdrServices.length + idx + 1 }}</td>
                <td class="text-start fw-medium">{{ group.didName }}</td>
                <td class="text-center">{{ group.totalQty }}</td>
                <td class="text-end">{{ formatRupiahNum(group.totalQty ? group.totalSubtotal / group.totalQty : 0) }}</td>
                <td class="text-end">{{ formatRupiahNum(group.totalSubtotal) }}</td>
              </tr>
              <!-- Child rows: services milik DID tersebut + harga -->
              <tr
                v-for="(svc, si) in group.services"
                :key="'did-' + group.didKey + '-svc-' + si"
                class="cetak-fdr-did-child"
              >
                <td class="text-center"></td>
                <td class="text-start ps-4 text-muted small">
                  <span class="me-1">└</span>
                  {{ svc.servicePlan?.name || '—' }} ({{ didCategoryLabel(svc.category) }})
                </td>
                <td></td>
                <td class="text-end">{{ formatRupiahNum(svc.price) }}</td>
                <td></td>
              </tr>
            </template>
          </template>

          <!-- Subtotal & Grand Total -->
          <template v-if="hasTableItems">
            <tr v-if="fdr.materialSubtotal > 0" class="cetak-fdr-subtotal-row">
              <td colspan="4" class="text-end">Subtotal Material</td>
              <td class="text-end">{{ formatRupiahNum(fdr.materialSubtotal) }}</td>
            </tr>
            <tr v-if="fdr.serviceSubtotal > 0" class="cetak-fdr-subtotal-row">
              <td colspan="4" class="text-end">Subtotal Service</td>
              <td class="text-end">{{ formatRupiahNum(fdr.serviceSubtotal) }}</td>
            </tr>
            <tr v-if="fdr.didSubtotal > 0" class="cetak-fdr-subtotal-row">
              <td colspan="4" class="text-end">Subtotal DID</td>
              <td class="text-end">{{ formatRupiahNum(fdr.didSubtotal) }}</td>
            </tr>
            <tr class="fw-bold cetak-fdr-grand-total">
              <td colspan="4" class="text-end">Grand Total</td>
              <td class="text-end">{{ formatRupiahNum(fdr.grandTotal ?? fdr.total) }}</td>
            </tr>
          </template>

          <tr v-if="!hasTableItems">
            <td colspan="5" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Notes -->
    <div v-if="notesText" class="cetak-fdr-notes mb-4">
      <div class="cetak-fdr-terms-header fw-bold text-white">Notes</div>
      <div class="cetak-fdr-notes-body">{{ notesText }}</div>
    </div>

    <!-- Tanda tangan digital (TTD + QR) ketika FDR approved; sama seperti quotation -->
    <div v-if="showSignatureSection" class="signature-section mt-5">
      <p class="text-center mb-0" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen FDR ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (fdr.id ?? '')"
        document-type="fdrs"
        :document-id="fdr.id != null ? String(fdr.id) : ''"
        :columns="4"
        :qr-size="96"
        :compact="true"
        :show-approved-by-label="false"
        :legacy-signature-token="fdr.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>

    <!-- Footer halaman -->
    <div class="cetak-fdr-page-footer">
      <span class="cetak-fdr-footer-left">FDR ({{ fdr.fdrNumber || '-' }}) Skylink</span>
      <span class="cetak-fdr-footer-right">Halaman 1/1</span>
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    FDR tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useFdrStore } from '~/stores/fdr'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const fdrStore = useFdrStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()

const { fdr, loading, error } = storeToRefs(fdrStore)

useRegisterCetakDraftStatus(() => fdr.value?.status)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  if (list && list.length > 0) return list[0]
  return null
})

const priorityLabel = computed(() => {
  const p = fdr.value?.priority
  const map = { low: 'Low', medium: 'Medium', high: 'High' }
  return p ? (map[p] || p) : '-'
})

const showSignatureSection = computed(() => fdr.value?.status === 'approved')
const legacySignerName = computed(() => fdr.value?.approvedByUser?.fullName || null)
const legacySignerTitle = computed(() => {
  const user = fdr.value?.approvedByUser
  return user?.roles?.[0]?.name || null
})

const fdrItems = computed(() => fdr.value?.fdrItems ?? fdr.value?.fdr_items ?? [])
const fdrServices = computed(() => fdr.value?.fdrServices ?? fdr.value?.fdr_services ?? [])
const fdrDids = computed(() => fdr.value?.fdrDids ?? fdr.value?.fdr_dids ?? [])

/** Group fdrDids by did.id - 1 tampilan per unique DID; harga service dari price_list_lines.price (items[i]) */
const groupedFdrDidsForCetak = computed(() => {
  const items = fdrDids.value
  const map = new Map()
  for (const d of items) {
    const pl = d?.priceListLine ?? d?.price_list_line
    const did = pl?.did
    const didId = did?.id ?? `_${d.id ?? Math.random()}`
    const didName = did?.name || did?.code || '—'
    const services = did?.services ?? did?.did_services ?? []
    const svcList = Array.isArray(services) ? services : []
    if (map.has(didId)) {
      const g = map.get(didId)
      g.items.push(d)
      g.totalQty += Number(d.quantity ?? 1)
      g.totalSubtotal += Number(d.subtotal ?? 0)
    } else {
      map.set(didId, {
        didKey: didId,
        didName,
        services: svcList,
        items: [d],
        totalQty: Number(d.quantity ?? 1),
        totalSubtotal: Number(d.subtotal ?? 0),
      })
    }
  }
  // Merge: service[i] pakai price dari items[i] (price_list_lines.price)
  return Array.from(map.values()).map((g) => {
    const servicesWithPrice = (g.services || []).map((svc, i) => {
      const it = g.items?.[i]
      const price = it?.price ?? it?.priceListLine?.price ?? it?.price_list_line?.price ?? (svc?.price ?? 0)
      return { ...svc, price: Number(price) || 0 }
    })
    return { ...g, services: servicesWithPrice }
  })
})

const hasTableItems = computed(
  () => fdrItems.value.length + fdrServices.value.length + groupedFdrDidsForCetak.value.length > 0
)

const notesText = computed(() => {
  const n = fdr.value?.notes
  return n && String(n).trim() ? String(n).trim() : ''
})

function itemName(item) {
  const pl = item?.priceListLine ?? item?.price_list_line
  if (pl?.product) return pl.product.name || pl.product.sku || '—'
  if (pl?.service) return pl.service.name || pl.service.code || '—'
  if (pl?.did) return pl.did.name || pl.did.code || '—'
  return '—'
}

function didCategoryLabel(category) {
  const map = { delivery: 'Delivery', dismantle: 'Dismantle', installation: 'Installation', survey: 'Survey' }
  return map[(category || '').toLowerCase()] || category || '—'
}

function formatRupiahNum(val) {
  if (val === null || val === undefined || val === '') return '-'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '-'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n))
}

function onPrint() {
  window.print()
}

function formatDate(val) {
  if (!val) return '-'
  const d = typeof val === 'string' ? new Date(val) : val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await fdrStore.getFdrDetails(String(id))
      if (fdr.value) {
        setDetailTitle('Cetak FDR - ' + fdr.value.fdrNumber)
      }
    } catch (e) {
      console.error('Cetak FDR load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-fdr-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-fdr-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-fdr-print-btn i {
  color: inherit !important;
}
.cetak-fdr-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-fdr-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-fdr-title-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}
.cetak-fdr-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-fdr-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-fdr-section-row td {
  background-color: #f8f9fa;
}
.cetak-fdr-did-child td {
  background-color: #fafbfc;
  font-size: 11px;
}
.cetak-fdr-subtotal-row td {
  background-color: #f8f9fa;
}
.cetak-fdr-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
.cetak-fdr-terms-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-fdr-terms-header.text-white {
  color: #fff !important;
}
.cetak-fdr-notes-body {
  font-size: 12px;
  border: 1px solid #4275f6;
  border-top: none;
  padding: 12px;
  min-height: 40px;
  white-space: pre-wrap;
}

.cetak-fdr-page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0.5rem 0;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #e0e0e0;
}
.cetak-fdr-footer-left { text-align: left; }
.cetak-fdr-footer-right { text-align: right; }
</style>

<style>
@media print {
  .cetak-fdr-hr {
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
  .cetak-fdr-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    padding-bottom: 2.5rem !important;
    font-size: 12px;
  }
  .cetak-fdr-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-fdr-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-fdr-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-fdr-title-wrap {
    text-align: right !important;
  }
  .cetak-fdr-title {
    font-size: 1.35rem !important;
  }
  .cetak-fdr-table {
    border-collapse: collapse;
  }
  .cetak-fdr-table td,
  .cetak-fdr-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }
  .cetak-fdr-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-fdr-section-row td,
  .cetak-fdr-subtotal-row td,
  .cetak-fdr-did-child td,
  .bg-light {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-fdr-grand-total td {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-fdr-terms-header {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-fdr-terms-header.text-white {
    color: #fff !important;
  }
  .cetak-fdr-page-footer {
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
