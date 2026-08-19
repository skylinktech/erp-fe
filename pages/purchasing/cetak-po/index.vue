<template>
  <div :key="routeKey">
    <CetakDocument
      type="PURCHASE_ORDER"
      :document-number="purchaseOrder?.noPo || ''"
      :status="purchaseOrder?.status"
      :company="purchaseOrder?.perusahaan"
      :header-meta="headerMeta"
      :loading="loading"
      :error="error"
      :not-found="!loading && !error && !purchaseOrder"
      :auto-print="autoPrint"
    >
      <template v-if="purchaseOrder">
        <div class="vendor-info-section mb-6">
          <div class="row">
            <div class="col-6">
              <table class="table table-borderless vendor-info-table" style="font-size: 12px;">
                <tr>
                  <td class="text-start" style="font-size: 12px; white-space: nowrap; width: 80px;">Vendor</td>
                  <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                  <td class="text-start" style="font-size: 12px;">{{ purchaseOrder.vendor?.name || purchaseOrder.salesOrder?.vendor?.name || '-' }}</td>
                </tr>
                <tr>
                  <td class="text-start" style="font-size: 12px; white-space: nowrap; vertical-align: top;">NPWP</td>
                  <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                  <td class="text-start" style="font-size: 12px;">{{ purchaseOrder.vendor?.npwp || purchaseOrder.salesOrder?.vendor?.npwp || '-' }}</td>
                </tr>
              </table>
            </div>
            <div class="col-6">
              <table class="table table-borderless vendor-info-table" style="font-size: 12px;">
                <tr>
                  <td class="text-start" style="font-size: 12px; vertical-align: top; white-space: nowrap; width: 80px;">Alamat</td>
                  <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                  <td class="text-start" style="font-size: 12px; white-space: pre-line;">{{ purchaseOrder.vendor?.address || purchaseOrder.salesOrder?.vendor?.address || '-' }}</td>
                </tr>
                <tr>
                  <td class="text-start" style="font-size: 12px; white-space: nowrap;">Attention</td>
                  <td style="font-size: 12px; width: 10px;">:</td>
                  <td class="text-start" style="font-size: 12px;">{{ purchaseOrder.up || '-' }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <CetakTable>
          <template #head>
            <tr>
              <th class="text-center" style="width: 40px;">No</th>
              <th class="text-start">Part Number</th>
              <th class="text-start">Produk</th>
              <th class="text-start">Deskripsi</th>
              <th class="text-end" style="width: 60px;">Qty</th>
              <th class="text-end" style="width: 110px;">Price</th>
              <th class="text-end" style="width: 120px;">Total</th>
            </tr>
          </template>
          <tr v-for="(item, index) in tableRows" :key="item.id || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="cetak-desc">{{ item.product?.sku || '-' }}</td>
            <td class="cetak-desc">{{ item.product?.name || '-' }}</td>
            <td class="cetak-desc">{{ item.description || '-' }}</td>
            <td class="cetak-num">{{ Number(item.quantity) || 0 }}</td>
            <td class="cetak-num">{{ formatRupiah(item.price || 0) }}</td>
            <td class="cetak-num">{{ formatRupiah(item.subtotal || 0) }}</td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td colspan="7" class="text-center py-4 text-muted">Tidak ada item untuk ditampilkan</td>
          </tr>
        </CetakTable>

        <CetakNotes class="mb-4" title="Catatan" :text="purchaseOrder.description || ''" />

        <div class="cetak-po-summary mb-4">
          <table class="table table-sm table-borderless summary-table m-0 ms-auto" style="font-size: 12px; max-width: 360px;">
            <tbody>
              <tr>
                <td class="text-end text-muted">Subtotal</td>
                <td class="text-end fw-medium" style="width: 140px;">{{ formatRupiah(calculateSubtotal()) }}</td>
              </tr>
              <tr>
                <td class="text-end text-muted">DPP</td>
                <td class="text-end fw-medium">{{ formatRupiah(Number(purchaseOrder.dpp) || 0) }}</td>
              </tr>
              <tr>
                <td class="text-end text-muted">
                  Discount
                  <span v-if="Number(purchaseOrder.discountPercent) > 0">({{ Number(purchaseOrder.discountPercent) }}%)</span>
                </td>
                <td class="text-end fw-medium">
                  <span v-if="Number(purchaseOrder.discountPercent) > 0">-{{ formatRupiah(calculateDiscount()) }}</span>
                  <span v-else>-</span>
                </td>
              </tr>
              <tr>
                <td class="text-end text-muted">
                  Tax
                  <span v-if="Number(purchaseOrder.taxPercent) > 0">({{ Number(purchaseOrder.taxPercent) }}%)</span>
                </td>
                <td class="text-end fw-medium">
                  <span v-if="Number(purchaseOrder.taxPercent) > 0">{{ formatRupiah(calculateTax()) }}</span>
                  <span v-else>-</span>
                </td>
              </tr>
              <tr class="cetak-po-summary-grand">
                <td class="text-end fw-bold">Total</td>
                <td class="text-end fw-bold">{{ formatRupiah(calculateGrandTotal()) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CetakSignature
          :show="showSignatureSection"
          heading="LEMBAR PENGESAHAN"
          caption="Dokumen Purchase Order ini telah disetujui dan ditandatangani secara digital sesuai alur persetujuan yang berlaku."
          document-type="purchase-orders"
          :document-id="purchaseOrder.id != null ? String(purchaseOrder.id) : ''"
          :columns="4"
          :qr-size="96"
          :show-header="false"
          :compact="true"
          :legacy-signature-token="purchaseOrder.signatureToken || undefined"
          :legacy-signer-name="legacySignerName"
          :legacy-signer-title="legacySignerTitle"
        />
      </template>
    </CetakDocument>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})

import { onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setDetailTitle } = useDynamicTitle()

const purchaseOrderStore = usePurchaseOrderStore()
const route = useRoute()
const formatRupiah = useFormatRupiah()
const toast = useToast()

const { purchaseOrder, loading, error } = storeToRefs(purchaseOrderStore)

const autoPrint = computed(() => route.query.print === 'true' || route.query.print === true)

const headerMeta = computed(() => {
  if (!purchaseOrder.value) return []
  return [
    { label: 'No. PO', value: purchaseOrder.value.noPo || '—' },
    { label: 'Tanggal', value: purchaseOrder.value.date ? new Date(purchaseOrder.value.date).toLocaleDateString('id-ID') : '—' },
    { label: 'Term Of Payment', value: purchaseOrder.value.termOfPayment || '30 Hari' },
  ]
})

const routeKey = computed(() => `purchase-order-${route.query.id || 'new'}`)

const tableRows = computed(() => {
  const po = purchaseOrder.value
  if (!po) return []
  if (Array.isArray(po.purchaseOrderItems) && po.purchaseOrderItems.length > 0) {
    return po.purchaseOrderItems
  }
  if (Array.isArray(po.salesOrder?.salesOrderItems) && po.salesOrder.salesOrderItems.length > 0) {
    return po.salesOrder.salesOrderItems
  }
  return []
})

const showSignatureSection = computed(() => {
  const status = purchaseOrder.value?.status
  return ['submitted', 'approved', 'partial', 'received'].includes(status)
})

const legacySignerName = computed(
  () =>
    purchaseOrder.value?.approvedByUser?.fullName ||
    purchaseOrder.value?.approvedByUser?.full_name ||
    null
)

const legacySignerTitle = computed(
  () => purchaseOrder.value?.approvedByUser?.roles?.[0]?.name || null
)

const fetchData = async () => {
  const purchaseOrderId = route.query.id
  if (!purchaseOrderId) {
    purchaseOrderStore.error = { message: 'ID Purchase Order tidak ditemukan' }
    return
  }

  purchaseOrderStore.purchaseOrder = null
  purchaseOrderStore.error = null

  try {
    await purchaseOrderStore.getPurchaseOrderDetails(purchaseOrderId)
    if (purchaseOrder.value) {
      setDetailTitle('Purchase Order', purchaseOrder.value.noPo)
    }
  } catch (e) {
    console.error('Error fetching purchase order:', e)
    toast.error({
      title: 'Gagal!',
      icon: 'ri-close-line',
      message: e.message || 'Gagal memuat detail purchase order.',
      timeout: 3000,
      position: 'bottomRight',
      layout: 2,
    })
  }
}

const calculateSubtotal = () => {
  return tableRows.value.reduce((total, item) => total + (Number(item.subtotal) || 0), 0)
}

const calculateDiscount = () => {
  if (!purchaseOrder.value?.discountPercent) return 0
  return calculateSubtotal() * (Number(purchaseOrder.value.discountPercent) / 100)
}

const calculateTax = () => {
  if (!purchaseOrder.value?.taxPercent) return 0
  const afterDiscount = calculateSubtotal() - calculateDiscount()
  return afterDiscount * (Number(purchaseOrder.value.taxPercent) / 100)
}

const calculateGrandTotal = () => {
  const stored = Number(purchaseOrder.value?.total)
  if (Number.isFinite(stored) && stored > 0) return stored
  return calculateSubtotal() - calculateDiscount() + calculateTax()
}

watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) fetchData()
  }
)

onMounted(() => {
  fetchData()
})

onBeforeUnmount(() => {
  purchaseOrderStore.purchaseOrder = null
  purchaseOrderStore.error = null
})
</script>

<style scoped>
:deep(.cetak-header__meta-table) {
  margin-left: auto;
}

:deep(.cetak-header__meta-table td) {
  text-align: right !important;
  white-space: nowrap;
}

.cetak-po-summary {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.cetak-po-summary-grand td {
  border-top: 1px solid #212529;
  padding-top: 0.5rem;
}

@media print {
  :deep(.cetak-header__meta-table td) {
    text-align: right !important;
  }

  .cetak-po-summary {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .cetak-po-summary .summary-table {
    margin-left: auto !important;
  }
}
</style>
