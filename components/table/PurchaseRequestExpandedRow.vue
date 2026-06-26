<template>
  <div class="expanded-row-content bg-white">
    <div v-if="detailItems.length > 0">
      <h6 class="mb-3 text-secondary">
        <i class="ri-file-list-line me-2"></i>
        Item ({{ detailItems.length }})
      </h6>
      <div class="table-responsive">
        <table class="table table-sm table-striped table-hover">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Tipe</th>
              <th>Gudang</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in detailItems" :key="d.id || i">
              <td>{{ i + 1 }}</td>
              <td>{{ d.productName || d.product?.name || '-' }}</td>
              <td class="text-uppercase">{{ d.productType || d.product_type || '-' }}</td>
              <td>{{ d.warehouse?.name || d.warehouse?.code || '—' }}</td>
              <td>{{ Number(d.qty ?? d.quantity) || 0 }} {{ d.uom?.symbol || '' }}</td>
              <td>{{ formatRupiah(d.estimatedPrice ?? d.estimated_price) }}</td>
              <td class="fw-bold">{{ formatRupiah(d.subtotal) }}</td>
            </tr>
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td colspan="6" class="text-end fw-bold">Total</td>
              <td class="fw-bold">{{ formatRupiah(rowTotal) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div v-else class="text-muted small py-2">Tidak ada item</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPurchaseRequestItemsList } from '~/stores/purchase-request'

const props = defineProps<{ data: Record<string, unknown> }>()
const formatRupiah = useFormatRupiah()

const detailItems = computed(() => getPurchaseRequestItemsList(props.data as any))
const rowTotal = computed(() => detailItems.value.reduce((s, d) => s + (Number(d.subtotal) || 0), 0))
</script>
