<template>
  <CetakDocument
    type="PURCHASE_REQUEST"
    :document-number="purchaseRequest ? getPurchaseRequestNo(purchaseRequest) : ''"
    :status="purchaseRequest?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !purchaseRequest"
  >
    <template v-if="purchaseRequest">
      <CetakInfoGrid
        :left="infoLeft"
        :right="[
          { label: 'Prioritas', value: (purchaseRequest.priority || '—').toUpperCase() },
          { label: 'Status', value: statusLabel(purchaseRequest.status) },
        ]"
      />

      <CetakTable>
        <template #head>
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Produk</th>
            <th class="text-start">Gudang</th>
            <th class="text-end" style="width: 60px;">Qty</th>
            <th class="text-end" style="width: 110px;">Harga</th>
            <th class="text-end" style="width: 120px;">Subtotal</th>
          </tr>
        </template>
        <tr v-for="(d, idx) in tableRows" :key="d.id || idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="cetak-desc">{{ itemLabel(d) }}</td>
          <td class="cetak-desc">{{ d.warehouse?.name || d.warehouse?.code || '—' }}</td>
          <td class="cetak-num">{{ Number(d.qty ?? d.quantity) || 0 }}</td>
          <td class="cetak-num">{{ formatRupiahNum(Number(d.estimatedPrice ?? d.estimated_price ?? d.unitPrice) || 0) }}</td>
          <td class="cetak-num">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
        </tr>
        <tr v-if="tableRows.length > 0" class="cetak-table__total">
          <td colspan="5" class="text-end">Grand Total</td>
          <td class="cetak-num">{{ formatRupiahNum(getPurchaseRequestTotal(purchaseRequest)) }}</td>
        </tr>
        <tr v-if="tableRows.length === 0">
          <td colspan="6" class="text-center py-4 text-muted">Tidak ada item</td>
        </tr>
      </CetakTable>

      <CetakNotes title="Deskripsi" :html="descriptionHtml" />

      <CetakSignature
        :show="showSignatureSection"
        heading="LEMBAR PENGESAHAN"
        caption="Dokumen Purchase Request ini telah disetujui dan ditandatangani secara digital."
        document-type="purchase-requests"
        :document-id="purchaseRequest.id != null ? String(purchaseRequest.id) : ''"
        :legacy-signature-token="purchaseRequest.signatureToken || undefined"
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
import { usePurchaseRequestStore, getPurchaseRequestNo, getPurchaseRequestTotal, getPurchaseRequestItemsList } from '~/stores/purchase-request'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setDetailTitle } = useDynamicTitle()
const purchaseRequestStore = usePurchaseRequestStore()
const route = useRoute()
const { purchaseRequest, loading, error } = storeToRefs(purchaseRequestStore)

const tableRows = computed(() => getPurchaseRequestItemsList(purchaseRequest.value))

const descriptionHtml = computed(() => {
  const desc = (purchaseRequest.value?.purpose ?? purchaseRequest.value?.notes ?? '') + ''
  return desc.trim() || ''
})

const showSignatureSection = computed(() => purchaseRequest.value?.status === 'approved')
const legacySignerName = computed(() => purchaseRequest.value?.approvedByUser?.fullName || purchaseRequest.value?.approvedByUser?.full_name || null)
const legacySignerTitle = computed(() => purchaseRequest.value?.approvedByUser?.roles?.[0]?.name || null)

const infoLeft = computed(() => {
  const pr = purchaseRequest.value
  if (!pr) return []
  const items = [
    { label: 'No. Purchase Request', value: getPurchaseRequestNo(pr) || '—' },
    { label: 'Tanggal Request', value: formatDate(pr.requestDate || pr.request_date || pr.createdAt) },
    { label: 'Pemohon', value: pr.requestedByUser?.fullName || pr.requestedByUser?.full_name || pr.createdByUser?.full_name || '—' },
  ]
  if (pr.purpose) items.push({ label: 'Keperluan', value: pr.purpose })
  return items
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

function statusLabel (s) {
  const map = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
  return s ? (map[s] || s) : '-'
}

function itemLabel (d) {
  const sku = d?.product?.sku ? `${d.product.sku} — ` : ''
  return `${sku}${d?.productName || d?.product_name || d?.product?.name || '—'}`
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
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
