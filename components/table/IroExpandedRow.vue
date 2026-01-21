<template>
  <div class="expanded-row-content bg-white">
    <div v-if="iro?.iroDetails && iro.iroDetails.length > 0">
      <h6 class="mb-3 text-secondary">
        <i class="ri-file-list-line me-2"></i>
        Detail Item ({{ iro.iroDetails.length }})
      </h6>
      <div class="table-responsive">
        <table class="table table-sm table-striped table-hover">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Tipe</th>
              <th>Service</th>
              <th>Service Plan</th>
              <th>Product / DID</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in iro.iroDetails" :key="d.id || i">
              <td>{{ i + 1 }}</td>
              <td><span :class="getItemTypeBadge(d.itemType).class">{{ getItemTypeBadge(d.itemType).text }}</span></td>
              <td>{{ d.service?.name || d.service?.code || '-' }}</td>
              <td>{{ d.servicePlan?.name || '-' }}</td>
              <td>
                <template v-if="d.itemType === 'PRODUCT'">{{ d.product?.name || d.product?.sku || '-' }}</template>
                <template v-else-if="d.itemType === 'DID'">{{ d.did?.code || d.did?.name || '-' }}</template>
                <template v-else>-</template>
              </td>
              <td>{{ Number(d.quantity) || 0 }}</td>
              <td>{{ formatRupiah(d.price) }}</td>
              <td class="fw-bold">{{ formatRupiah(d.subtotal) }}</td>
            </tr>
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td colspan="5" class="text-end">Material (PRODUCT)</td>
              <td colspan="3" class="text-end fw-bold">{{ formatRupiah(iro.materialSubtotal ?? 0) }}</td>
            </tr>
            <tr>
              <td colspan="5" class="text-end">DID</td>
              <td colspan="3" class="text-end fw-bold">{{ formatRupiah(iro.didSubtotal ?? 0) }}</td>
            </tr>
            <tr>
              <td colspan="5" class="text-end">Grand Total</td>
              <td colspan="3" class="text-end fw-bold text-primary">{{ formatRupiah(iro.grandTotal ?? 0) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-4">
      <i class="ri-file-list-line ri-48px text-muted"></i>
      <p class="text-muted mb-0 mt-2">Tidak ada item untuk IRO ini</p>
    </div>
  </div>
</template>

<script setup>
import { useFormatRupiah } from '~/composables/formatRupiah'

const props = defineProps({
  iro: { type: Object, required: true }
})

const formatRupiah = useFormatRupiah()

function getItemTypeBadge (t) {
  const s = String(t || '').toUpperCase()
  if (s === 'PRODUCT') return { text: 'Product', class: 'badge bg-label-info' }
  if (s === 'SERVICE') return { text: 'Service', class: 'badge bg-label-primary' }
  if (s === 'DID') return { text: 'DID', class: 'badge bg-label-success' }
  return { text: s || '-', class: 'badge bg-label-secondary' }
}
</script>

<style scoped>
.expanded-row-content { padding: 1.5rem; background-color: #f8f9fa; border-left: 3px solid #d9d9d9; margin-left: 1rem; }
.table th { font-size: 0.875rem; font-weight: 600; }
.table td { font-size: 0.875rem; vertical-align: middle; }
.table tfoot td { border-top: 2px solid #dee2e6; font-weight: 600; }
</style>
