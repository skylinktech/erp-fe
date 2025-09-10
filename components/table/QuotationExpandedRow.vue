<template>
  <div class="expanded-row-content bg-white">
    <div v-if="quotation?.quotationItems && quotation.quotationItems.length > 0">
      <h6 class="mb-3 text-secondary">
        <i class="ri-file-list-line me-2"></i>
        Detail Produk ({{ quotation.quotationItems.length }} item)
      </h6>
      
      <div class="table-responsive">
        <table class="table table-sm table-striped table-hover">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Part Number</th>
              <th>Nama Produk</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th>Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in quotation.quotationItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>
                <span class="badge bg-label-secondary">{{ item.product?.sku || '-' }}</span>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="fw-semibold">{{ item.product?.name || 'Produk tidak ditemukan' }}</span>
                  <small class="text-muted" v-if="item.product?.unit?.name">
                    Unit: {{ item.product.unit.name }}
                  </small>
                </div>
              </td>
              <td>
                <span class="fw-semibold">{{ item.quantity }}</span>
              </td>
              <td>
                <span class="fw-semibold">{{ formatRupiah(item.price) }}</span>
              </td>
              <td>
                <span class="fw-bold">{{ formatRupiah(item.subtotal) }}</span>
              </td>
              <td>
                <span v-if="item.description" class="text-muted">{{ item.description }}</span>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-4">
      <div class="mb-3">
        <i class="ri-file-list-line ri-48px text-muted"></i>
      </div>
      <p class="text-muted mb-2">Tidak ada item produk untuk Quotation ini</p>
    </div>
  </div>
</template>

<script setup>
import { useFormatRupiah } from '~/composables/formatRupiah'

// Props
const props = defineProps({
  quotation: {
    type: Object,
    required: true
  }
})

// Composables
const formatRupiah = useFormatRupiah()

// Methods
const calculateTotal = () => {
  if (!props.quotation?.quotationItems) return 0
  
  return props.quotation.quotationItems.reduce((total, item) => {
    return total + (Number(item.subtotal) || 0)
  }, 0)
}

const calculateDiscount = () => {
  const total = calculateTotal()
  const discountPercent = Number(props.quotation.discountPercent) || 0
  return total * (discountPercent / 100)
}

const calculateTax = () => {
  const total = calculateTotal()
  const discountPercent = Number(props.quotation.discountPercent) || 0
  const taxPercent = Number(props.quotation.taxPercent) || 0
  
  const discountAmount = total * (discountPercent / 100)
  const totalAfterDiscount = total - discountAmount
  return totalAfterDiscount * (taxPercent / 100)
}

const calculateGrandTotal = () => {
  const total = calculateTotal()
  const discountAmount = calculateDiscount()
  const taxAmount = calculateTax()
  
  return total - discountAmount + taxAmount
}

const getTotalQuantity = () => {
  if (!props.quotation?.quotationItems) return 0
  
  return props.quotation.quotationItems.reduce((total, item) => {
    return total + (Number(item.quantity) || 0)
  }, 0)
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
  color: #4a4a4a !important;
}

.text-success {
  color: #71dd37 !important;
}

.text-info {
  color: #03c3ec !important;
}

.text-secondary {
  color: #8592a3 !important;
}

.text-danger {
  color: #ff3e1d !important;
}
</style>
