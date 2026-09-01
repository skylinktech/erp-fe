<template>
  <CetakDocument
    type="SITE_INVESTMENT"
    :document-number="siteInvest?.siNumber || siteInvest?.si_number || ''"
    :status="siteInvest?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !siteInvest"
  >
    <template v-if="siteInvest">
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
        <p class="mb-1"><strong>BILLING FREQUENCY :</strong> {{ billingFrequencyDisplay }}</p>
        <p class="mb-1"><strong>PRICE BASIS :</strong> {{ pricingPeriodDisplay }}</p>
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
              <td class="text-center">{{ formatContractDurationMonths(resolveLineDurationMonths(item)) }}</td>
              <td class="text-end">{{ formatRupiahNum(getServicePrice(item)) }}</td>
              <td class="text-end">{{ itemPriceBuyDisplay(item) }}</td>
              <td class="text-end">{{ formatRupiahNum(getServiceContractIncome(item)) }}</td>
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
            <td colspan="5" class="text-start fw-medium">PCT MARGIN / PROFITABILITY</td>
            <td colspan="3" class="text-end">{{ pctMarginDisplay }}</td>
          </tr>
          <tr v-if="feasibility?.profitabilityStatus === 'BELOW_THRESHOLD'">
            <td colspan="8" class="text-start text-danger fw-medium">
              STATUS: BELOW MINIMUM TARGET ({{ feasibility.profitabilityThresholdPercent }}%)
            </td>
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

      <CetakSignature
        v-if="showSignatureSection"
        document-type="site-investments"
        :document-id="siteInvest.id"
        :columns="4"
        :qr-size="96"
        :compact="true"
        :legacy-signature-token="siteInvest.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>

    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useSiteInvestStore } from '~/stores/site-invest'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  formatContractDurationMonths,
  resolveLineDurationMonths,
  resolveDocumentDurationMonths,
  billingFrequencyLabel,
  pricingPeriodLabel,
} from '~/utils/commercialTerms'

const { setDetailTitle } = useDynamicTitle()

const siteInvestStore = useSiteInvestStore()
const route = useRoute()

const { siteInvest, loading, error } = storeToRefs(siteInvestStore)

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

// Duration: explicit snapshotted contractDurationMonths only — never qty / billingCycle regex
const durationDisplay = computed(() => {
  const si = siteInvest.value
  const list = (si?.siteInvestServices ?? si?.site_invest_services) || []
  return formatContractDurationMonths(resolveDocumentDurationMonths(list))
})

const billingFrequencyDisplay = computed(() => {
  const si = siteInvest.value
  const list = (si?.siteInvestServices ?? si?.site_invest_services) || []
  if (!list.length) return '-'
  const first = list[0]
  return billingFrequencyLabel(
    first?.billingFrequency ?? first?.billing_frequency ?? first?.priceListLine?.billingCycle
  )
})

const pricingPeriodDisplay = computed(() => {
  const si = siteInvest.value
  const list = (si?.siteInvestServices ?? si?.site_invest_services) || []
  if (!list.length) return '-'
  const first = list[0]
  return pricingPeriodLabel(first?.pricingPeriod ?? first?.pricing_period)
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

const feasibility = computed(() => {
  const si = siteInvest.value
  return si?.feasibilitySummary ?? si?.feasibility_summary ?? si?.commercialSummary ?? si?.commercial_summary ?? null
})

const serviceSubtotalDisplay = computed(() => {
  const f = feasibility.value
  if (f?.serviceContractAmount != null) return Number(f.serviceContractAmount) || 0
  if (f?.income?.contractAmount != null && Array.isArray(f?.lines?.services)) {
    return (f.lines.services || []).reduce((s, l) => s + (Number(l.contractAmount) || 0), 0)
  }
  const si = siteInvest.value
  return fromApiNum(si, 'serviceSubtotal', 'service_subtotal')
})
const materialSubtotal = computed(() => {
  const f = feasibility.value
  if (f?.materialContractAmount != null) return Number(f.materialContractAmount) || 0
  const si = siteInvest.value
  return fromApiNum(si, 'materialSubtotal', 'material_subtotal')
})
const didSubtotal = computed(() => {
  const f = feasibility.value
  if (f?.didContractAmount != null) return Number(f.didContractAmount) || 0
  const si = siteInvest.value
  return fromApiNum(si, 'didSubtotal', 'did_subtotal')
})

/** Harga satuan service: murni dari API (tidak hitung ulang) */
function getServicePrice (item) {
  if (!item) return 0
  const n = Number(item.price)
  return Number.isNaN(n) ? 0 : n
}

/** Subtotal service per baris: prefer contractAmount from API feasibility */
function getServiceSubtotal (item) {
  if (!item) return 0
  if (item.contractAmount != null && item.contractAmount !== '') {
    const n = Number(item.contractAmount)
    if (!Number.isNaN(n)) return n
  }
  const st = item.subtotal
  if (st !== undefined && st !== null && st !== '') {
    const n = Number(st)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(item.quantity) || 1
  const price = getServicePrice(item)
  return qty * price
}

function getServiceContractIncome (item) {
  if (!item) return 0
  if (item.contractAmount != null && item.contractAmount !== '') {
    const n = Number(item.contractAmount)
    if (!Number.isNaN(n)) return n
  }
  // Recurring: period × duration when snapshot known
  const period = (() => {
    const st = item.subtotal
    if (st !== undefined && st !== null && st !== '') {
      const n = Number(st)
      if (!Number.isNaN(n)) return n
    }
    return (Number(item.quantity) || 1) * getServicePrice(item)
  })()
  const dur = Number(item.contractDurationMonths ?? item.contract_duration_months)
  if (Number.isFinite(dur) && dur > 0) return period * dur
  return period
}

/** Subtotal per item material/DID: dari API (subtotal); fallback qty×price jika tidak ada */
function getItemSubtotal (item) {
  if (!item) return 0
  if (item.contractAmount != null && item.contractAmount !== '') {
    const n = Number(item.contractAmount)
    if (!Number.isNaN(n)) return n
  }
  const st = item.subtotal
  if (st !== undefined && st !== null && st !== '') {
    const n = Number(st)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(item.quantity) || 1
  const price = Number(item.price) || 0
  return qty * price
}

/** Prefer costContractAmount from API */
function getItemExpense (item) {
  if (!item) return null
  if (item.costContractAmount != null && item.costContractAmount !== '') {
    return Number(item.costContractAmount)
  }
  if (item.expense != null && item.expense !== '') return Number(item.expense)
  const pl = item.priceListLine ?? item.price_list_line
  const unitCost = pl?.priceBuy ?? pl?.price_buy ?? null
  if (unitCost == null) return null
  const qty = Math.max(1, Number(item.quantity ?? item.qty ?? 1) || 1)
  const periodCost = Number(unitCost) * qty
  const dur = Number(item.contractDurationMonths ?? item.contract_duration_months)
  const isService = !!(pl?.service || item.priceListLine?.service)
  if (isService && Number.isFinite(dur) && dur > 0) return periodCost * dur
  return periodCost
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

const grandTotalIncome = computed(() => {
  const f = feasibility.value
  if (f?.income?.contractAmount != null) return Number(f.income.contractAmount) || 0
  return serviceSubtotalDisplay.value + materialSubtotal.value + didSubtotal.value
})
const grandTotalExpenses = computed(() => {
  const f = feasibility.value
  if (f?.expenses?.contractAmount != null) return Number(f.expenses.contractAmount) || 0
  return serviceExpenseSubtotal.value + materialExpenseSubtotal.value + didExpenseSubtotal.value
})

const incomeLessExpenses = computed(() => {
  const f = feasibility.value
  if (f?.projectProfit != null) return Number(f.projectProfit) || 0
  return grandTotalIncome.value - grandTotalExpenses.value
})

const pctMarginDisplay = computed(() => {
  const f = feasibility.value
  if (f?.profitabilityPercent != null) {
    return Number(f.profitabilityPercent).toFixed(2) + '%'
  }
  const income = grandTotalIncome.value
  if (!income || income <= 0) return '-'
  const less = incomeLessExpenses.value
  const pct = (less / income) * 100
  if (!Number.isFinite(pct)) return '-'
  return pct.toFixed(2) + '%'
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
.cetak-si-table thead th,
.cetak-si-summary thead th {
  white-space: nowrap;
  background-color: var(--print-table-header, #3b4056);
  color: #fff;
}
.cetak-si-grand-total td {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
}
</style>
