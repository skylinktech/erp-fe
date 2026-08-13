<template>
  <CetakDocument
    type="QUOTATION"
    :document-number="quotation?.noQuotation || quotation?.no_quotation || ''"
    :status="quotation?.status"
    :company="quotation?.perusahaan"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !quotation"
  >
    <template v-if="quotation">
      <CetakInfoGrid
        :left="[
          { label: 'No. Quotation', value: quotation.noQuotation || '—' },
          { label: 'Tanggal', value: formatDate(quotation.date) },
          { label: 'Customer', value: quotation.customer?.name || '—' },
          { label: 'PIC', value: quotation.up || quotation.createdByUser?.fullName || '—' },
        ]"
        :right="[
          { label: 'Valid Until', value: formatDate(quotation.validUntil) },
          { label: 'Terms of Payment', value: quotation.termsOfPayment || '—' },
          { label: 'Site', value: quotation.site?.name || quotation.site?.code || '—' },
        ]"
      />

      <CetakTable>
        <template #head>
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Item Description</th>
            <th class="text-center" style="width: 50px;">Qty</th>
            <th class="text-center" style="width: 70px;">Unit of Day</th>
            <th class="text-end" style="width: 110px;">Unit Price</th>
            <th class="text-end" style="width: 120px;">Total</th>
          </tr>
        </template>

        <template v-if="otcItems.length > 0">
          <tr class="cetak-table__section">
            <td colspan="6" class="text-start">One Time Charge (OTC)</td>
          </tr>
          <tr v-for="(m, idx) in otcItems" :key="'otc-' + (m.id || idx)">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="cetak-desc">{{ m.product?.name || m.product?.sku || '—' }}</td>
            <td class="text-center">{{ m.quantity ?? 0 }}</td>
            <td class="text-center">1</td>
            <td class="cetak-num">{{ formatRupiahNum(otcUnitPrice(m)) }}</td>
            <td class="cetak-num">{{ formatRupiahNum(otcAmount(m)) }}</td>
          </tr>
        </template>

        <template v-if="mrcItems.length > 0">
          <tr class="cetak-table__section">
            <td colspan="6" class="text-start">Monthly Recurring Charge (MRC)</td>
          </tr>
          <tr v-for="(m, idx) in mrcItems" :key="'mrc-' + (m.id || idx)">
            <td class="text-center">{{ otcItems.length + idx + 1 }}</td>
            <td class="cetak-desc">{{ mrcItemDescription(m) }}</td>
            <td class="text-center">{{ m.quantity ?? 0 }}</td>
            <td class="text-center">{{ mrcUnitOfDay(m) }}</td>
            <td class="cetak-num">{{ formatRupiahNum(mrcDisplayUnitPrice(m)) }}</td>
            <td class="cetak-num">{{ formatRupiahNum(mrcTotal(m)) }}</td>
          </tr>
        </template>

        <tr v-if="hasTableItems" class="fw-medium">
          <td colspan="5" class="text-end">Subtotal Item</td>
          <td class="cetak-num">{{ formatRupiahNum(itemsSubtotal) }}</td>
        </tr>
        <tr v-if="!otcItems.length && !mrcItems.length">
          <td colspan="6" class="text-center py-4 text-muted">Tidak ada item</td>
        </tr>
      </CetakTable>

      <div v-if="quotation && totals.subtotal > 0" class="cetak-qo-summary mb-4">
        <table class="table table-sm table-borderless m-0 ms-auto" style="font-size: 12px; max-width: 360px;">
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

      <CetakNotes title="Terms and Conditions" :html="descriptionHtml" />

      <CetakSignature
        :show="showSignatureSection"
        caption="Dokumen Quotation ini telah disetujui dan ditandatangani secara digital."
        document-type="quotations"
        :document-id="quotation.id != null ? String(quotation.id) : ''"
        :legacy-signature-token="quotation.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useQuotationStore } from '~/stores/quotation'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { computeQuotationTotals } from '~/utils/quotationTotals'

const { setDetailTitle } = useDynamicTitle()
const quotationStore = useQuotationStore()
const route = useRoute()
const { quotation, loading, error } = storeToRefs(quotationStore)

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

function formatDate (val) {
  if (!val) return '-'
  const d = typeof val === 'string' ? new Date(val) : val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const descriptionHtml = computed(() => {
  const q = quotation.value
  const desc = (q?.description ?? '') + ''
  return desc.trim() || ''
})

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
.cetak-qo-summary-grand td {
  border-top: 2px solid var(--print-table-header, #3b4056);
  padding-top: 8px !important;
  color: var(--print-table-header, #3b4056);
  font-size: 13px;
}
</style>
