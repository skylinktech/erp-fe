<template>
  <div class="expanded-row-content bg-white">
    <div v-if="purchaseOrder?.purchaseOrderItems && purchaseOrder.purchaseOrderItems.length > 0">
      <h6 class="mb-3 text-secondary">
        <i class="ri-shopping-cart-line me-2"></i>
        Detail Produk ({{ purchaseOrder.purchaseOrderItems.length }} item)
      </h6>
      
      <div class="table-responsive">
        <table class="table table-sm table-striped table-hover">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>SKU</th>
              <th>Nama Produk</th>
              <th>Gudang</th>
              <th>Qty Order</th>
              <th>Qty Received</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in purchaseOrder.purchaseOrderItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>
                <span class="badge bg-label-info">{{ item.product?.sku || '-' }}</span>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="fw-semibold">{{ item.product?.name || 'Produk tidak ditemukan' }}</span>
                  <small class="text-muted" v-if="item.description">{{ item.description }}</small>
                </div>
              </td>
              <td>
                <span v-if="item.warehouse" class="badge bg-label-secondary">
                  {{ item.warehouse.name }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span class="fw-semibold">{{ item.quantity }}</span>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <span class="fw-semibold me-2">{{ item.receivedQty || 0 }}</span>
                  <span v-if="item.statusPartial" class="badge bg-label-warning">
                    <i class="ri-time-line me-1"></i>Partial
                  </span>
                  <span v-else-if="Number(item.receivedQty || 0) >= item.quantity" class="badge bg-label-success">
                    <i class="ri-check-line me-1"></i>Complete
                  </span>
                  <span v-else class="badge bg-label-secondary">
                    <i class="ri-clock-line me-1"></i>Pending
                  </span>
                </div>
              </td>
              <td>
                <span class="fw-semibold">{{ formatRupiah(item.price) }}</span>
              </td>
              <td>
                <span class="fw-bold text-primary">{{ formatRupiah(item.subtotal) }}</span>
              </td>
              <td>
                <div class="d-flex flex-column gap-1">
                  <span :class="getItemStatusBadge(item).class">
                    {{ getItemStatusBadge(item).text }}
                  </span>
                  <small class="text-muted">
                    {{ getProgressPercentage(item) }}% received
                  </small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-4">
      <div class="mb-3">
        <i class="ri-shopping-cart-line ri-48px text-muted"></i>
      </div>
      <p class="text-muted mb-2">Tidak ada item produk untuk Purchase Order ini</p>
    </div>
  </div>
</template>

<script setup>
import { useFormatRupiah } from '~/composables/formatRupiah'

// Props
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: true
  }
})

// Composables
const formatRupiah = useFormatRupiah()

// Methods
const getItemStatusBadge = (item) => {
  const receivedQty = Number(item.receivedQty || 0)
  const orderedQty = Number(item.quantity || 0)
  
  if (receivedQty === 0) {
    return { text: 'Pending', class: 'badge bg-label-secondary' }
  } else if (receivedQty >= orderedQty) {
    return { text: 'Complete', class: 'badge bg-label-success' }
  } else {
    return { text: 'Partial', class: 'badge bg-label-warning' }
  }
}

const getProgressPercentage = (item) => {
  const receivedQty = Number(item.receivedQty || 0)
  const orderedQty = Number(item.quantity || 0)
  
  if (orderedQty === 0) return 0
  return Math.round((receivedQty / orderedQty) * 100)
}

const calculateTotal = () => {
  if (!props.purchaseOrder?.purchaseOrderItems) return 0
  
  return props.purchaseOrder.purchaseOrderItems.reduce((total, item) => {
    return total + (Number(item.subtotal) || 0)
  }, 0)
}

const getCompletedItems = () => {
  if (!props.purchaseOrder?.purchaseOrderItems) return 0
  
  return props.purchaseOrder.purchaseOrderItems.filter(item => {
    const receivedQty = Number(item.receivedQty || 0)
    const orderedQty = Number(item.quantity || 0)
    return receivedQty >= orderedQty
  }).length
}

const getPartialItems = () => {
  if (!props.purchaseOrder?.purchaseOrderItems) return 0
  
  return props.purchaseOrder.purchaseOrderItems.filter(item => {
    const receivedQty = Number(item.receivedQty || 0)
    const orderedQty = Number(item.quantity || 0)
    return receivedQty > 0 && receivedQty < orderedQty
  }).length
}

const getPendingItems = () => {
  if (!props.purchaseOrder?.purchaseOrderItems) return 0
  
  return props.purchaseOrder.purchaseOrderItems.filter(item => {
    const receivedQty = Number(item.receivedQty || 0)
    return receivedQty === 0
  }).length
}
</script>

<style scoped>
.expanded-row-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-left: 3px solid #d9d9d9;
  margin-left: 1rem;
}

.table th {
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  font-size: 0.875rem;
  vertical-align: middle;
}

.table tfoot td {
  border-top: 2px solid #dee2e6;
  font-weight: 600;
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.badge {
  font-size: 0.75rem;
}

.text-primary {
  color: #696cff !important;
}

.text-success {
  color: #71dd37 !important;
}

.text-warning {
  color: #ffab00 !important;
}

.text-secondary {
  color: #8592a3 !important;
}
</style>
