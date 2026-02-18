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
  <div v-else-if="siteInvest" class="p-2 cetak-si-doc cetak-si-doc-with-print position-relative">
    <!-- Tombol Print: pojok kiri atas, disembunyikan saat cetak -->
    <button
      type="button"
      class="btn btn-primary no-print cetak-si-print-btn"
      aria-label="Print"
      @click="onPrint"
    >
      <i class="ri-printer-line me-1"></i>
      Print
    </button>
    <!-- Header: Logo kiri, Judul kanan -->
    <div class="d-flex justify-content-between align-items-start mb-4 cetak-si-header">
      <div v-if="perusahaan" class="logo-section">
        <img
          :src="getCompanyLogo(perusahaan.logoPerusahaan)"
          alt="Logo Perusahaan"
          class="cetak-si-logo"
          @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          style="height: 90px; max-width: 200px; object-fit: contain;"
        >
      </div>
      <div class="mx-2 text-center align-self-center">
        <h2 class="app-brand-logo demo fw-bold mt-3">SKYLINK</h2>
      </div>
      <div class="cetak-si-title-wrap text-end mt-3">
        <h1 class="cetak-si-title fw-bold mb-0">SITE INVESTMENT</h1>
      </div>
    </div>

    <hr class="cetak-si-hr my-4">

    <!-- Header: info kiri & kanan -->
    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>PROJECT :</strong> {{ siteInvest.name || '-' }}</p>
        <p class="mb-1"><strong>CLIENT :</strong> {{ siteInvest.customer?.name || '-' }}</p>
        <p class="mb-1"><strong>COMMERCIAL PIC :</strong> {{ siteInvest.createdByUser?.fullName || '-' }}</p>
        <p class="mb-1"><strong>STATUS :</strong> {{ statusLabel(siteInvest.status, siteInvest) }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>SCHEME :</strong> {{ siteInvest.businessScheme?.name || siteInvest.businessScheme?.code || '-' }}</p>
        <p class="mb-1"><strong>SERVICE PLANS :</strong> {{ firstServicePlanName }}</p>
        <p class="mb-1"><strong>NUMBER OF UNIT :</strong> {{ totalUnitDisplay }}</p>
        <p class="mb-1"><strong>DURATION [MONTH] :</strong> {{ durationDisplay }}</p>
      </div>
    </div>

    <!-- Tabel utama: DESCRIPTION, LOC, QTY, DUR, RATE, INCOME, EXPENSES -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-si-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-start">DESCRIPTION</th>
            <th class="text-center" style="width: 50px;">LOC</th>
            <th class="text-center" style="width: 50px;">QTY</th>
            <th class="text-center" style="width: 50px;">DUR</th>
            <th class="text-end" style="width: 100px;">RATE</th>
            <th class="text-end" style="width: 100px;">HARGA BELI</th>
            <th class="text-end" style="width: 110px;">INCOME</th>
            <th class="text-end" style="width: 110px;">EXPENSES</th>
          </tr>
        </thead>
        <tbody>
          <!-- SERVICEPLAN [MRC] -->
          <template v-if="siteInvestServicesList.length > 0">
            <tr class="fw-bold bg-light">
              <td colspan="8" class="text-start">SERVICEPLAN [MRC]</td>
            </tr>
            <tr v-for="(item, index) in siteInvestServicesList" :key="'svc-' + (item.id || index)">
              <td class="text-start">{{ item.priceListLine?.service?.name || item.priceListLine?.service?.code || '-' }}</td>
              <td class="text-center">1</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-end">{{ formatRupiahNum(getServicePrice(item)) }}</td>
              <td class="text-end">{{ itemPriceBuyDisplay(item) }}</td>
              <td class="text-end">{{ formatRupiahNum(getServiceSubtotal(item)) }}</td>
              <td class="text-end">{{ itemExpenseDisplay(item) }}</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="5" class="text-end">TOTAL</td>
              <td class="text-end">-</td>
              <td class="text-end">{{ formatRupiahNum(serviceSubtotalDisplay) }}</td>
              <td class="text-end">{{ formatRupiahNum(serviceExpenseSubtotal) }}</td>
            </tr>
          </template>

          <!-- HARDWARE [OTC] -->
          <template v-if="siteInvestMaterialsList.length > 0">
            <tr class="fw-bold bg-light">
              <td colspan="8" class="text-start">HARDWARE [OTC]</td>
            </tr>
            <tr v-for="(item, index) in siteInvestMaterialsList" :key="'mat-' + (item.id || index)">
              <td class="text-start">{{ item.priceListLine?.product?.name || item.priceListLine?.product?.sku || '-' }}</td>
              <td class="text-center">1</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-center">1</td>
              <td class="text-end">{{ formatRupiahNum(item.price || 0) }}</td>
              <td class="text-end">{{ itemPriceBuyDisplay(item) }}</td>
              <td class="text-end">{{ formatRupiahNum(getItemSubtotal(item)) }}</td>
              <td class="text-end">{{ itemExpenseDisplay(item) }}</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="5" class="text-end">TOTAL</td>
              <td class="text-end">-</td>
              <td class="text-end">{{ formatRupiahNum(materialSubtotal) }}</td>
              <td class="text-end">{{ formatRupiahNum(materialExpenseSubtotal) }}</td>
            </tr>
          </template>

          <!-- DID [MRC/OTC] -->
          <template v-if="siteInvestDidsList.length > 0">
            <tr class="fw-bold bg-light">
              <td colspan="8" class="text-start">Delivery & Installation (OTC)</td>
            </tr>
            <tr v-for="(item, index) in siteInvestDidsList" :key="'did-' + (item.id || index)">
              <td class="text-start">{{ item.priceListLine?.did?.name || item.priceListLine?.did?.code || '-' }}</td>
              <td class="text-center">1</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-center">1</td>
              <td class="text-end">{{ formatRupiahNum(item.price || 0) }}</td>
              <td class="text-end">{{ itemPriceBuyDisplay(item) }}</td>
              <td class="text-end">{{ formatRupiahNum(getItemSubtotal(item)) }}</td>
              <td class="text-end">{{ itemExpenseDisplay(item) }}</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="5" class="text-end">TOTAL</td>
              <td class="text-end">-</td>
              <td class="text-end">{{ formatRupiahNum(didSubtotal) }}</td>
              <td class="text-end">{{ formatRupiahNum(didExpenseSubtotal) }}</td>
            </tr>
          </template>

          <!-- Kosong -->
          <tr v-if="!hasAnyItems">
            <td colspan="8" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary: GRAND TOTAL, INCOME LESS EXPENSES, PCT MARGIN (kolom sejajar dengan tabel utama: INCOME & EXPENSES) -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-si-summary m-0" style="font-size: 12px;">
        <colgroup>
          <col>
          <col style="width: 50px;">
          <col style="width: 50px;">
          <col style="width: 50px;">
          <col style="width: 100px;">
          <col style="width: 100px;">
          <col style="width: 110px;">
          <col style="width: 110px;">
        </colgroup>
        <tbody>
          <tr class="cetak-si-grand-total fw-bold">
            <td colspan="5" class="text-start">GRAND TOTAL</td>
            <td class="text-end">-</td>
            <td class="text-end">{{ formatRupiahNum(grandTotalIncome) }}</td>
            <td class="text-end">{{ formatRupiahNum(grandTotalExpenses) }}</td>
          </tr>
          <tr>
            <td colspan="5" class="text-start fw-medium">INCOME LESS EXPENSES</td>
            <td colspan="3" class="text-end">{{ formatRupiahNum(incomeLessExpenses) }}</td>
          </tr>
          <tr>
            <td colspan="5" class="text-start fw-medium">PCT MARGIN</td>
            <td colspan="3" class="text-end">{{ pctMarginDisplay }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer: LEMBAR PENGESAHAN -->
    <div class="cetak-si-footer mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px;">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0" style="font-size: 12px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">
        Dokumen perhitungan Site Investment (SI) ini telah disusun berdasarkan data aktual dan asumsi keuangan yang berlaku pada saat penyusunan. Dokumen ini digunakan sebagai dasar evaluasi kelayakan serta pengambilan keputusan manajerial terkait pelaksanaan project.
      </p>

      <!-- Tanda tangan digital: multi-signature atau legacy single QR -->
      <div v-if="showSignatureSection" class="signature-section mt-4">
        <MultiSignatureDisplay
          document-type="site-investments"
          :document-id="siteInvest.id"
          title="Verifikasi Digital Dokumen"
          :columns="4"
          :qr-size="96"
          :legacy-signature-token="siteInvest.signatureToken || undefined"
          :legacy-signer-name="legacySignerName"
          :legacy-signer-title="legacySignerTitle"
        />
      </div>
    </div>
  </div>
  <div v-else class="alert alert-danger m-6" role="alert">
    Site Investment tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useSiteInvestStore } from '~/stores/site-invest'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const siteInvestStore = useSiteInvestStore()
const perusahaanStore = usePerusahaanStore()
const route = useRoute()
const formatRupiah = useFormatRupiah()

const { siteInvest, loading, error } = storeToRefs(siteInvestStore)

const perusahaan = computed(() => {
  const list = perusahaanStore.perusahaans
  return list && list.length > 0 ? list[0] : null
})

// Nomor dengan pemisah ribuan (untuk tabel)
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

function statusLabel (s, si) {
  if (s === 'approved' && si?.approvedByUser?.fullName) {
    return 'Approved by ' + si.approvedByUser.fullName
  }
  if (s === 'approved') {
    return 'Approved'
  }
  const map = {
    draft: 'Draft',
    pending: 'Pending',
    rejected: 'Rejected',
    expired: 'Expired',
    cancelled: 'Cancelled',
  }
  return s ? (map[s] || s) : '-'
}

const firstServicePlanName = computed(() => {
  const si = siteInvest.value
  const list = (si?.siteInvestServices ?? si?.site_invest_services) || []
  if (list.length === 0) return '-'
  const first = list[0]
  return first?.priceListLine?.service?.name || first?.priceListLine?.service?.code || '-'
})

// Number of Unit: jumlah product (item material/hardware) yang disimpan
const totalUnitDisplay = computed(() => {
  const si = siteInvest.value
  if (!si) return '0'
  const mat = (si.siteInvestMaterials ?? si.site_invest_materials) || []
  return String(mat.length)
})

// Duration: tampilkan angka saja (nilai numerik dari billing cycle, atau qty service jika tidak ada angka)
const durationDisplay = computed(() => {
  const si = siteInvest.value
  const list = (si?.siteInvestServices ?? si?.site_invest_services) || []
  if (!list.length) return '1'
  const billingCycle = list[0]?.priceListLine?.billingCycle
  if (billingCycle != null && billingCycle !== '') {
    const str = String(billingCycle)
    const numMatch = str.match(/\d+/)
    if (numMatch) return numMatch[0]
  }
  // Fallback: qty service (baris pertama)
  const qty = Number(list[0]?.quantity)
  return !Number.isNaN(qty) && qty > 0 ? String(qty) : '1'
})

/** Nilai numerik dari API dengan dukungan snake_case (selaras halaman detail) */
function fromApiNum (si, ...keys) {
  if (!si) return 0
  for (const k of keys) {
    const v = si[k]
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return 0
}

/** Subtotal section dari API; tidak hitung ulang */
const serviceSubtotalDisplay = computed(() => {
  const si = siteInvest.value
  return fromApiNum(si, 'serviceSubtotal', 'service_subtotal')
})
const materialSubtotal = computed(() => {
  const si = siteInvest.value
  return fromApiNum(si, 'materialSubtotal', 'material_subtotal')
})
const didSubtotal = computed(() => {
  const si = siteInvest.value
  return fromApiNum(si, 'didSubtotal', 'did_subtotal')
})

/** Harga satuan service: murni dari API (tidak hitung ulang) */
function getServicePrice (item) {
  if (!item) return 0
  const n = Number(item.price)
  return Number.isNaN(n) ? 0 : n
}

/** Subtotal service per baris: murni dari API; fallback qty×price hanya jika subtotal tidak ada */
function getServiceSubtotal (item) {
  if (!item) return 0
  const st = item.subtotal
  if (st !== undefined && st !== null && st !== '') {
    const n = Number(st)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(item.quantity) || 1
  const price = getServicePrice(item)
  return qty * price
}

/** Subtotal per item material/DID: dari API (subtotal); fallback qty×price jika tidak ada */
function getItemSubtotal (item) {
  if (!item) return 0
  const st = item.subtotal
  if (st !== undefined && st !== null && st !== '') {
    const n = Number(st)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(item.quantity) || 1
  const price = Number(item.price) || 0
  return qty * price
}

/** Nilai expense: ambil langsung dari table (item.expense). Fallback hitung dari price_buy × quantity hanya untuk data lama yang belum punya expense. */
function getItemExpense (item) {
  if (!item) return null
  if (item.expense != null && item.expense !== '') return Number(item.expense)
  const pl = item.priceListLine ?? item.price_list_line
  const unitCost = pl?.priceBuy ?? pl?.price_buy ?? null
  if (unitCost == null) return null
  const qty = Math.max(1, Number(item.quantity ?? item.qty ?? 1) || 1)
  return Number(unitCost) * qty
}

function itemExpenseDisplay (item) {
  const val = getItemExpense(item)
  if (val == null) return '-'
  return formatRupiahNum(val)
}

/** Harga beli satuan (unit) dari price list line */
function getItemPriceBuy (item) {
  if (!item) return null
  const pl = item.priceListLine ?? item.price_list_line
  const v = pl?.priceBuy ?? pl?.price_buy
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

function itemPriceBuyDisplay (item) {
  const val = getItemPriceBuy(item)
  if (val == null) return '-'
  return formatRupiahNum(val)
}

/** Daftar item dari API dengan dukungan snake_case (selaras halaman detail) */
const siteInvestServicesList = computed(() => {
  const si = siteInvest.value
  return (si?.siteInvestServices ?? si?.site_invest_services) || []
})
const siteInvestMaterialsList = computed(() => {
  const si = siteInvest.value
  return (si?.siteInvestMaterials ?? si?.site_invest_materials) || []
})
const siteInvestDidsList = computed(() => {
  const si = siteInvest.value
  return (si?.siteInvestDids ?? si?.site_invest_dids) || []
})

const serviceExpenseSubtotal = computed(() => {
  const list = siteInvestServicesList.value
  return list.reduce((sum, item) => {
    const e = getItemExpense(item)
    return sum + (e != null ? e : 0)
  }, 0)
})

const materialExpenseSubtotal = computed(() => {
  const list = siteInvestMaterialsList.value
  return list.reduce((sum, item) => {
    const e = getItemExpense(item)
    return sum + (e != null ? e : 0)
  }, 0)
})

const didExpenseSubtotal = computed(() => {
  const list = siteInvestDidsList.value
  return list.reduce((sum, item) => {
    const e = getItemExpense(item)
    return sum + (e != null ? e : 0)
  }, 0)
})

const hasAnyItems = computed(() => {
  const m = siteInvestMaterialsList.value.length
  const s = siteInvestServicesList.value.length
  const d = siteInvestDidsList.value.length
  return m + s + d > 0
})

// Grand total income = jumlah total INCOME yang ditampilkan per section (selaras dengan tabel)
const grandTotalIncome = computed(() => {
  const serviceIncome = serviceSubtotalDisplay.value
  const matIncome = materialSubtotal.value
  const didInc = didSubtotal.value
  return serviceIncome + matIncome + didInc
})
// Grand total expenses = jumlah expense per section (price_buy × qty)
const grandTotalExpenses = computed(() => serviceExpenseSubtotal.value + materialExpenseSubtotal.value + didExpenseSubtotal.value)

const incomeLessExpenses = computed(() => {
  const income = grandTotalIncome.value
  const expenses = grandTotalExpenses.value
  return income - expenses
})

const pctMarginDisplay = computed(() => {
  const income = grandTotalIncome.value
  if (!income || income <= 0) return '-'
  const less = incomeLessExpenses.value
  const pct = Math.round((less / income) * 100)
  return pct + '%'
})

// Tampilkan section tanda tangan jika dokumen approved atau ada prepared_by (TTD otomatis tanpa approval)
const showSignatureSection = computed(() => {
  const si = siteInvest.value
  if (!si) return false
  if (si.status === 'approved') return true
  const preparedBy = si.preparedBy ?? si.prepared_by
  return Array.isArray(preparedBy) && preparedBy.length > 0
})

// Untuk legacy single QR: nama dan jabatan/role penandatangan (dari approvedByUser)
const legacySignerName = computed(() => {
  return siteInvest.value?.approvedByUser?.fullName || null
})
const legacySignerTitle = computed(() => {
  const user = siteInvest.value?.approvedByUser
  if (!user) return null
  const role = user.roles?.[0]?.name
  return role || null
})

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await perusahaanStore.fetchPerusahaans()
      await siteInvestStore.getSiteInvestDetails(String(id))
      if (siteInvest.value) {
        setDetailTitle('Cetak Site Investment - ' + siteInvest.value.siNumber)
      }
    } catch (e) {
      console.error('Cetak SI load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-si-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #fff !important;
}
.cetak-si-print-btn:hover {
  color: #adb5bd !important;
}
.cetak-si-print-btn i {
  color: inherit !important;
}
.cetak-si-header {
  min-height: 60px;
  margin-top: 40px;
}
.logo-section {
  flex-shrink: 0;
}
.cetak-si-logo {
  height: 60px;
  max-width: 200px;
  object-fit: contain;
}
.cetak-si-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.cetak-si-title {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}
.cetak-si-table thead th {
  white-space: nowrap;
  background-color: #4275f6;
}
.table-head-white {
  color: #fff;
}
.cetak-si-summary tbody td {
  vertical-align: middle;
}
/* Hanya baris GRAND TOTAL: background ungu dan font putih */
.cetak-si-grand-total td {
  background-color: #4275f6;
  color: #fff !important;
}
</style>

<style>
@media print {
  /* Gunakan pt agar garis tampil di print (1px sering hilang saat cetak) */
  .cetak-si-hr {
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
  .cetak-si-doc {
    padding: 0.5rem !important;
    padding-top: 0.25rem !important;
    font-size: 12px;
  }
  /* Rapatkan margin antar section agar TTD digital muat di halaman pertama */
  .cetak-si-doc .mb-4 {
    margin-bottom: 0.5rem !important;
  }
  .cetak-si-footer {
    margin-top: 0.75rem !important;
    padding-top: 0.25rem !important;
  }
  .cetak-si-footer h2 {
    margin-bottom: 0.35rem !important;
    margin-top: 0 !important;
    font-size: 14px !important;
  }
  .cetak-si-footer p {
    margin-bottom: 0.2rem !important;
    line-height: 1.45 !important;
  }
  .cetak-si-footer .signature-section {
    margin-top: 0.4rem !important;
  }
  .cetak-si-header {
    display: flex !important;
    justify-content: space-between !important;
    margin: 0 !important;
  }
  .cetak-si-logo {
    height: 60px !important;
    max-width: 200px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-si-title-wrap {
    text-align: right !important;
  }
  .cetak-si-title {
    font-size: 1.35rem !important;
  }
  .cetak-si-table,
  .cetak-si-summary {
    border-collapse: collapse;
  }
  .cetak-si-table td,
  .cetak-si-table th,
  .cetak-si-summary td,
  .cetak-si-summary th {
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
  .table-light td {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-si-grand-total td {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
