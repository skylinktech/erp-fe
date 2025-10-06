<template>
  <div class="expanded-row-content bg-white">
    <!-- Debug Info -->
    <div class="alert alert-info mb-3" v-if="!salesOrder?.salesOrderItems">
      <h6>Debug Info:</h6>
      <p><strong>Sales Order ID:</strong> {{ salesOrder?.id || 'N/A' }}</p>
      <p><strong>Sales Order Items:</strong> {{ salesOrder?.salesOrderItems || 'undefined' }}</p>
      <p><strong>Raw Data:</strong> {{ JSON.stringify(salesOrder, null, 2) }}</p>
    </div>
    
    <div v-if="salesOrder?.salesOrderItems && salesOrder.salesOrderItems.length > 0">
      <h6 class="mb-3 text-secondary">
        <i class="ri-shopping-cart-line me-2"></i>
        Detail Produk ({{ salesOrder.salesOrderItems.length }} item)
      </h6>
      
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Part Number</th>
              <th>Nama Produk</th>
              <th>Gudang</th>
              <th>Qty Order</th>
              <th>Qty Delivered</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesOrder.salesOrderItems" :key="item.id" class="align-middle">
              <td>{{ index + 1 }}</td>
              <td>
                <span class="badge bg-label-secondary">{{ item.product?.sku || '-' }}</span>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="fw-medium">{{ item.product?.name || '-' }}</span>
                  <small class="text-muted">{{ item.description || '-' }}</small>
                </div>
              </td>
              <td>
                <span class="badge bg-label-secondary">
                  {{ item.warehouse?.name || '-' }}
                </span>
              </td>
              <td>
                <span class="fw-medium">{{ Math.round(item.quantity) }}</span>
              </td>
              <td>
                <span class="fw-medium">{{ Math.round(item.deliveredQty || 0) }}</span>
              </td>
              <td>
                <span class="fw-medium">{{ formatRupiah(item.price) }}</span>
              </td>
              <td>
                <span class="fw-bold">{{ formatRupiah(item.subtotal) }}</span>
              </td>
              <td>
                <span :class="getDeliveryStatusBadge(item).class">
                  {{ getDeliveryStatusBadge(item).text }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-4">
      <div class="mb-3">
        <i class="ri-inbox-line ri-48px text-muted"></i>
      </div>
      <p class="text-muted mb-0">Tidak ada item produk untuk Sales Order ini</p>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useFormatRupiah } from '~/composables/formatRupiah'

// Props
const props = defineProps({
  salesOrder: {
    type: Object,
    required: true
  }
})

// Debug logging
watch(() => props.salesOrder, (newSalesOrder) => {
  
}, { immediate: true, deep: true })

// Composables
const formatRupiah = useFormatRupiah()

// Computed properties
const completedItems = computed(() => {
  if (!props.salesOrder?.salesOrderItems) return 0
  return props.salesOrder.salesOrderItems.filter(item => 
    item.deliveredQty >= item.quantity
  ).length
})

const partialItems = computed(() => {
  if (!props.salesOrder?.salesOrderItems) return 0
  return props.salesOrder.salesOrderItems.filter(item => 
    item.deliveredQty > 0 && item.deliveredQty < item.quantity
  ).length
})

const pendingItems = computed(() => {
  if (!props.salesOrder?.salesOrderItems) return 0
  return props.salesOrder.salesOrderItems.filter(item => 
    item.deliveredQty === 0
  ).length
})

const deliveryProgress = computed(() => {
  if (!props.salesOrder?.salesOrderItems || props.salesOrder.salesOrderItems.length === 0) return 0
  
  const totalOrdered = props.salesOrder.salesOrderItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalDelivered = props.salesOrder.salesOrderItems.reduce((sum, item) => sum + (item.deliveredQty || 0), 0)
  
  if (totalOrdered === 0) return 0
  return Math.round((totalDelivered / totalOrdered) * 100)
})

// Methods
const getDeliveryStatusBadge = (item) => {
  const deliveredQty = item.deliveredQty || 0
  const orderedQty = item.quantity
  
  if (deliveredQty === 0) {
    return { text: 'Pending', class: 'badge rounded-pill bg-label-secondary' }
  } else if (deliveredQty >= orderedQty) {
    return { text: 'Complete', class: 'badge rounded-pill bg-label-success' }
  } else {
    return { text: 'Partial', class: 'badge rounded-pill bg-label-warning' }
  }
}
</script>

<style scoped>
.expanded-row-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-left: 3px solid #d9d9d9;
  border-radius: 0 8px 8px 0;
}

.table th {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  font-size: 0.875rem;
  vertical-align: middle;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.progress {
  border-radius: 4px;
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.6s ease;
}

.badge {
  font-size: 0.75rem;
}
</style>
