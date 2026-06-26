<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Sales Order' : 'Tambah Sales Order' }}</h4>
          <p class="mb-0 text-muted">Kelola Sales Order pada halaman form terpisah.</p>
        </div>
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/sales-order')">
          <i class="ri-arrow-left-line me-1"></i>Kembali
        </button>
      </div>

      <div class="card">
        <div class="card-body">
          <form @submit.prevent="handleSubmit" novalidate>
            <div class="row">
              <div class="col">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#so-tabs-info" role="tab" type="button">
                      <span class="ri-user-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Informasi Sales Order</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#so-tabs-items" role="tab" type="button">
                      <span class="ri-folder-user-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">List Product</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-4">
              <div id="so-tabs-info" class="tab-pane fade active show" role="tabpanel">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.noPo" class="form-control" placeholder="No. PO">
                      <label>No. PO</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.quotationId" :options="quotations" :get-option-label="q => q.noQuotation" :reduce="q => q.id" placeholder="Pilih Quotation" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="c => c.name" :reduce="c => c.id" placeholder="Pilih Customer" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.up" class="form-control" placeholder="Untuk Perhatian">
                      <label>Untuk Perhatian</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="form.date" class="form-control">
                      <label>Tanggal</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="form.dueDate" class="form-control">
                      <label>Jatuh Tempo</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.termOfPayment" class="form-control" placeholder="Term Of Payment">
                      <label>Term Of Payment</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans" :get-option-label="p => p.nmPerusahaan" :reduce="p => p.id" placeholder="Pilih Perusahaan" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="c => c.nmCabang" :reduce="c => c.id" placeholder="Pilih Cabang" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.paymentMethod" :options="paymentMethodOptions" :get-option-label="o => o.label" :reduce="o => o.value" placeholder="Pilih Metode Pembayaran" searchable clearable />
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model.number="form.discountPercent" class="form-control" placeholder="Discount (%)">
                      <label>Discount (%)</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model.number="form.taxPercent" class="form-control" placeholder="Tax (%)">
                      <label>Tax (%)</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="file" @change="onFileChange" class="form-control" accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg">
                      <label>Attachment</label>
                    </div>
                    <div v-if="form.attachmentPreview" class="mt-2">
                      <a :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer">Lihat Attachment</a>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <textarea v-model="form.description" class="form-control" placeholder="Deskripsi"></textarea>
                      <label>Deskripsi</label>
                    </div>
                  </div>
                </div>
              </div>

              <div id="so-tabs-items" class="tab-pane fade" role="tabpanel">
                <div v-for="(item, index) in form.salesOrderItems" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-12">
                      <CustomSelect2 v-model="item.warehouseId" :options="warehouses" :get-option-label="w => `${w.name} (${w.code})`" :reduce="w => w.id" placeholder="Pilih Gudang SO" searchable clearable @update:modelValue="() => { if (item.productId) updateStockInfo(index) }" />
                    </div>
                    <div class="col-md-4">
                      <CustomSelect2 v-model="item.productId" :options="filteredCustomerProducts" :get-option-label="getProductLabel" :reduce="p => p?.id" placeholder="Cari produk..." searchable clearable @update:modelValue="() => onProductChange(index)" />
                    </div>
                    <div class="col-md-2">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" placeholder="Qty">
                        <label>Qty</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="formatRupiah(item.price)" class="form-control" readonly>
                        <label>Harga Satuan</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly>
                        <label>Subtotal</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item">
                        <label>Deskripsi</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="getStockDisplay(item.stock)" class="form-control" readonly>
                        <label>Stock</label>
                      </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                      <button class="btn btn-outline-danger w-100" @click.prevent="salesOrderStore.removeItem(index)">Hapus</button>
                    </div>
                  </div>
                  <hr class="my-4">
                </div>
                <div class="mt-4">
                  <button class="btn btn-primary btn-sm w-100" @click.prevent="salesOrderStore.addItem()">Tambah Item</button>
                </div>
                <div class="d-flex justify-content-end mt-4">
                  <span class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/sales-order')">Tutup</button>
              <button type="submit" class="btn btn-primary ms-2" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesOrderStore } from '~/stores/sales-order'
import { useCustomerStore } from '~/stores/customer'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useQuotationStore } from '~/stores/quotation'
import { useWarehouseStore } from '~/stores/warehouse'
import { useStocksStore } from '~/stores/stocks'
import CustomSelect2 from '~/components/CustomSelect2.vue'

const route = useRoute()
const salesOrderStore = useSalesOrderStore()
const customerStore = useCustomerStore()
const perusahaanStore = usePerusahaanStore()
const cabangStore = useCabangStore()
const quotationStore = useQuotationStore()
const warehouseStore = useWarehouseStore()
const stockStore = useStocksStore()
const formatRupiah = useFormatRupiah()

const { form, isEditMode, saving, customerProducts } = storeToRefs(salesOrderStore)
const { customers } = storeToRefs(customerStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs } = storeToRefs(cabangStore)
const { quotations } = storeToRefs(quotationStore)
const { warehouses } = storeToRefs(warehouseStore)

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'QRIS', value: 'qris' },
  { label: 'Card', value: 'card' },
]

const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return []
  return cabangs.value.filter(c => c.perusahaanId === form.value.perusahaanId)
})

const filteredCustomerProducts = computed(() => {
  if (!customerProducts.value || !Array.isArray(customerProducts.value)) return []
  return customerProducts.value
})

const grandTotal = computed(() => {
  if (!form.value?.salesOrderItems) return 0
  const totalItems = form.value.salesOrderItems.reduce((total, item) => total + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0)
  const discountAmount = totalItems * ((Number(form.value.discountPercent) || 0) / 100)
  const totalAfterDiscount = totalItems - discountAmount
  const taxAmount = totalAfterDiscount * ((Number(form.value.taxPercent) || 0) / 100)
  return totalAfterDiscount + taxAmount
})

const getProductLabel = (option) => {
  if (!option) return 'No Product'
  const name = option.name || 'No Name'
  const partNumber = option.sku || option.noInterchange || ''
  return partNumber ? `${name} | ${partNumber}` : name
}

const calculateSubtotal = (index) => {
  const item = form.value.salesOrderItems[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

const onProductChange = (index) => {
  const item = form.value.salesOrderItems[index]
  const selected = customerProducts.value.find(p => p.id === item.productId)
  if (!selected) return
  item.price = Number(selected.priceSell) || 0
  calculateSubtotal(index)
  if (item.warehouseId) updateStockInfo(index)
}

const onQuantityChange = (index) => {
  calculateSubtotal(index)
}

const getStockDisplay = (stock) => {
  if (!stock || stock.quantity === undefined || stock.quantity === null) return 'Loading...'
  return Math.floor(stock.quantity)
}

const updateStockInfo = async (index) => {
  const item = form.value.salesOrderItems[index]
  if (!item?.productId || !item?.warehouseId) return
  const response = await stockStore.fetchStocksPaginated({ productId: item.productId, warehouseId: item.warehouseId })
  if (response?.data?.length) {
    const match = response.data.find(s => s.productId === item.productId && s.warehouseId === item.warehouseId)
    item.stock = match || { quantity: 0 }
  } else {
    item.stock = { quantity: 0 }
  }
}

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) {
    form.value.attachment = null
    form.value.attachmentPreview = null
    return
  }
  form.value.attachment = file
  form.value.attachmentPreview = URL.createObjectURL(file)
}

const handleSubmit = async () => {
  await salesOrderStore.saveSalesOrder()
  if (!salesOrderStore.validationErrors?.length) {
    navigateTo('/sales/sales-order')
  }
}

watch(() => form.value.customerId, (newCustomerId) => {
  if (newCustomerId) salesOrderStore.fetchProductsForCustomer(newCustomerId)
})

onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    perusahaanStore.fetchPerusahaans(),
    cabangStore.fetchCabangs(),
    quotationStore.fetchQuotations(),
    warehouseStore.fetchWarehouses(),
    salesOrderStore.fetchSalesOrders(true),
  ])

  const id = route.params.id ? String(route.params.id) : null
  if (id) {
      await salesOrderStore.openModal({ id }, 'admin')
    salesOrderStore.showModal = false
  } else {
    await salesOrderStore.openModal(null, 'admin')
    salesOrderStore.showModal = false
  }
})
</script>
