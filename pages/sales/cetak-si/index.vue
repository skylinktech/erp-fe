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
  <div v-else-if="siteInvest" class="p-6 cetak-si-doc">
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
            <th class="text-end" style="width: 110px;">INCOME</th>
            <th class="text-end" style="width: 110px;">EXPENSES</th>
          </tr>
        </thead>
        <tbody>
          <!-- SERVICEPLAN [MRC] -->
          <template v-if="siteInvest.siteInvestServices && siteInvest.siteInvestServices.length > 0">
            <tr class="fw-bold bg-light">
              <td colspan="7" class="text-start">SERVICEPLAN [MRC]</td>
            </tr>
            <tr v-for="(item, index) in siteInvest.siteInvestServices" :key="'svc-' + (item.id || index)">
              <td class="text-start">{{ item.priceListLine?.service?.name || item.priceListLine?.service?.code || '-' }}</td>
              <td class="text-center">1</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-center">1</td>
              <td class="text-end">{{ formatRupiahNum(item.price || 0) }}</td>
              <td class="text-end">{{ formatRupiahNum(item.subtotal || 0) }}</td>
              <td class="text-end">-</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="5" class="text-end">TOTAL</td>
              <td class="text-end">{{ formatRupiahNum(serviceSubtotal) }}</td>
              <td class="text-end">-</td>
            </tr>
          </template>

          <!-- HARDWARE [OTC] -->
          <template v-if="siteInvest.siteInvestMaterials && siteInvest.siteInvestMaterials.length > 0">
            <tr class="fw-bold bg-light">
              <td colspan="7" class="text-start">HARDWARE [OTC]</td>
            </tr>
            <tr v-for="(item, index) in siteInvest.siteInvestMaterials" :key="'mat-' + (item.id || index)">
              <td class="text-start">{{ item.priceListLine?.product?.name || item.priceListLine?.product?.sku || '-' }}</td>
              <td class="text-center">1</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-center">1</td>
              <td class="text-end">{{ formatRupiahNum(item.price || 0) }}</td>
              <td class="text-end">{{ formatRupiahNum(item.subtotal || 0) }}</td>
              <td class="text-end">-</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="5" class="text-end">TOTAL</td>
              <td class="text-end">{{ formatRupiahNum(materialSubtotal) }}</td>
              <td class="text-end">-</td>
            </tr>
          </template>

          <!-- DID [MRC/OTC] -->
          <template v-if="siteInvest.siteInvestDids && siteInvest.siteInvestDids.length > 0">
            <tr class="fw-bold bg-light">
              <td colspan="7" class="text-start">Delivery & Installation (OTC)</td>
            </tr>
            <tr v-for="(item, index) in siteInvest.siteInvestDids" :key="'did-' + (item.id || index)">
              <td class="text-start">{{ item.priceListLine?.did?.name || item.priceListLine?.did?.code || '-' }}</td>
              <td class="text-center">1</td>
              <td class="text-center">{{ Number(item.quantity) }}</td>
              <td class="text-center">1</td>
              <td class="text-end">{{ formatRupiahNum(item.price || 0) }}</td>
              <td class="text-end">{{ formatRupiahNum(item.subtotal || 0) }}</td>
              <td class="text-end">-</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="5" class="text-end">TOTAL</td>
              <td class="text-end">{{ formatRupiahNum(didSubtotal) }}</td>
              <td class="text-end">-</td>
            </tr>
          </template>

          <!-- Kosong -->
          <tr v-if="!hasAnyItems">
            <td colspan="7" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary: GRAND TOTAL, INCOME LESS EXPENSES, PCT MARGIN -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-si-summary m-0" style="font-size: 12px;">
        <tbody>
          <tr class="table-light fw-bold">
            <td class="text-start" style="width: 50%;">GRAND TOTAL</td>
            <td class="text-end" style="width: 25%;">{{ formatRupiahNum(grandTotalIncome) }}</td>
            <td class="text-end" style="width: 25%;">{{ formatRupiahNum(grandTotalExpenses) }}</td>
          </tr>
          <tr>
            <td class="text-start fw-medium">INCOME LESS EXPENSES</td>
            <td colspan="2" class="text-end">{{ formatRupiahNum(incomeLessExpenses) }}</td>
          </tr>
          <tr>
            <td class="text-start fw-medium">PCT MARGIN</td>
            <td colspan="2" class="text-end">{{ pctMarginDisplay }}</td>
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
  const list = siteInvest.value?.siteInvestServices
  if (!list || list.length === 0) return '-'
  const first = list[0]
  return first?.priceListLine?.service?.name || first?.priceListLine?.service?.code || '-'
})

const totalUnitDisplay = computed(() => {
  const si = siteInvest.value
  if (!si) return '1'
  let qty = 0
  ;(si.siteInvestServices || []).forEach((i) => { qty += Number(i.quantity) || 0 })
  ;(si.siteInvestMaterials || []).forEach((i) => { qty += Number(i.quantity) || 0 })
  ;(si.siteInvestDids || []).forEach((i) => { qty += Number(i.quantity) || 0 })
  return qty > 0 ? String(qty) : '1'
})

const durationDisplay = computed(() => {
  const si = siteInvest.value
  if (!si?.siteInvestServices?.length) return '1'
  const first = si.siteInvestServices[0]?.priceListLine?.billingCycle
  if (first) return String(first)
  return '1'
})

const serviceSubtotal = computed(() => Number(siteInvest.value?.serviceSubtotal) || 0)
const materialSubtotal = computed(() => Number(siteInvest.value?.materialSubtotal) || 0)
const didSubtotal = computed(() => Number(siteInvest.value?.didSubtotal) || 0)

const hasAnyItems = computed(() => {
  const si = siteInvest.value
  const m = si?.siteInvestMaterials?.length || 0
  const s = si?.siteInvestServices?.length || 0
  const d = si?.siteInvestDids?.length || 0
  return m + s + d > 0
})

const grandTotalIncome = computed(() => Number(siteInvest.value?.total) || 0)
const grandTotalExpenses = computed(() => 0)

const incomeLessExpenses = computed(() => {
  const income = grandTotalIncome.value
  const expenses = grandTotalExpenses.value
  return Math.max(0, income - expenses)
})

const pctMarginDisplay = computed(() => {
  const income = grandTotalIncome.value
  if (!income || income <= 0) return '-'
  const less = incomeLessExpenses.value
  const pct = Math.round((less / income) * 100)
  return pct + '%'
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
.cetak-si-header {
  min-height: 60px;
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
}
.table-head-white {
  color: #fff;
}
.cetak-si-summary tbody td {
  vertical-align: middle;
}
</style>

<style>
@media print {
  /* Gunakan pt agar garis tampil di print (1px sering hilang saat cetak) */
  .cetak-si-hr {
    border: none !important;
    border-top: 1pt solid #000 !important;
    height: 0 !important;
    margin: 1rem 0 !important;
    padding: 0 !important;
  }
  .no-print {
    display: none !important;
  }
  .alert {
    display: none !important;
  }
  .cetak-si-doc {
    font-size: 12px;
  }
  .cetak-si-header {
    display: flex !important;
    justify-content: space-between !important;
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
    border: 1pt solid #333 !important;
    padding: 6px 8px !important;
  }
  .table-dark.table-head-white th {
    background-color: #2c3e50 !important;
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
}
</style>
