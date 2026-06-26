<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Sales Invoice' : 'Tambah Sales Invoice' }}</h4>
          <p class="mb-0 text-muted">Kelola sales invoice pada halaman terpisah.</p>
        </div>
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/sales-invoice')">
          <i class="ri-arrow-left-line me-1"></i>Kembali
        </button>
      </div>

      <div class="card">
        <div class="card-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#si-tabs-info" role="tab" type="button">
                      <span class="d-none d-sm-block">Informasi Sales Invoice</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#si-tabs-items" role="tab" type="button">
                      <span class="d-none d-sm-block">List Product</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-4">
              <div id="si-tabs-info" class="tab-pane fade active show" role="tabpanel">
                <div class="row g-4">
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.salesOrderId" :options="salesOrdersForSelect || []" :get-option-label="getSalesOrderLabel" :reduce="so => so.id" placeholder="Pilih Sales Order" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="c => c.name" :reduce="c => c.id" placeholder="Pilih Customer" searchable clearable :disabled="!!form.salesOrderId" />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans || []" :get-option-label="p => p.nmPerusahaan" :reduce="p => p.id" placeholder="Pilih Perusahaan" searchable clearable :disabled="!!form.salesOrderId" />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="c => c.nmCabang" :reduce="c => c.id" placeholder="Pilih Cabang" searchable clearable :disabled="!!form.salesOrderId || !form.perusahaanId" />
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="form.date" class="form-control">
                      <label>Tanggal Invoice</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="form.dueDate" class="form-control">
                      <label>Jatuh Tempo Invoice</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.up" class="form-control" placeholder="UP">
                      <label>UP</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.email" class="form-control" placeholder="Email">
                      <label>Email Penagihan</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <CustomSelect2 v-model="form.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" placeholder="Pilih Status" searchable clearable />
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model.number="form.discountPercent" class="form-control" :readonly="!!form.salesOrderId">
                      <label>Discount (%)</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model.number="form.taxPercent" class="form-control" :readonly="!!form.salesOrderId">
                      <label>Tax (%)</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="text" :value="formatRupiah(form.total)" class="form-control" readonly>
                      <label>Total</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="text" :value="formatRupiah(form.dpp)" class="form-control" readonly>
                      <label>DPP</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model.number="form.paidAmount" class="form-control">
                      <label>Paid Amount</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" :value="formatRupiah(form.remainingAmount)" class="form-control" readonly>
                      <label>Sisa Pembayaran</label>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-floating form-floating-outline">
                      <textarea v-model="form.description" class="form-control" placeholder="Deskripsi Invoice"></textarea>
                      <label>Deskripsi Invoice</label>
                    </div>
                  </div>
                </div>
              </div>

              <div id="si-tabs-items" class="tab-pane fade" role="tabpanel">
                <div v-for="(item, index) in (form.salesInvoiceItems || [])" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.productId" :options="customerProducts || []" :get-option-label="p => p && p.name ? `${p.name} (${p.unit?.name || 'No Unit'})` : ''" :reduce="p => p?.id" placeholder="Pilih Produk" searchable clearable @update:modelValue="onProductChange(index)" />
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.warehouseId" :options="warehouses || []" :get-option-label="w => `${w.name} (${w.code})`" :reduce="w => w.id" placeholder="Pilih Gudang" searchable clearable />
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control">
                        <label>Jumlah</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.deliveredQty" class="form-control">
                        <label>Delivered Qty</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="formatRupiah(item.price)" class="form-control" readonly>
                        <label>Harga Jual</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly>
                        <label>Subtotal</label>
                      </div>
                    </div>
                    <div class="col-md-9">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi">
                        <label>Deskripsi</label>
                      </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                      <button class="btn btn-outline-danger w-100" @click.prevent="removeSalesInvoiceItem(index)">Hapus</button>
                    </div>
                  </div>
                  <hr class="my-4">
                </div>

                <div class="mt-4">
                  <button class="btn btn-primary" @click.prevent="addSalesInvoiceItem">Tambah Item</button>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/sales-invoice')">Tutup</button>
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
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useSalesInvoiceStore } from '~/stores/sales-invoice'
import { useCustomerStore } from '~/stores/customer'
import { useSalesOrderStore } from '~/stores/sales-order'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useWarehouseStore } from '~/stores/warehouse'

const route = useRoute()
const salesInvoiceStore = useSalesInvoiceStore()
const customerStore = useCustomerStore()
const salesOrderStore = useSalesOrderStore()
const perusahaanStore = usePerusahaanStore()
const cabangStore = useCabangStore()
const warehouseStore = useWarehouseStore()
const formatRupiah = useFormatRupiah()

const { form, isEditMode, saving } = storeToRefs(salesInvoiceStore)
const { customers } = storeToRefs(customerStore)
const { salesOrdersForSelect, customerProducts } = storeToRefs(salesOrderStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs } = storeToRefs(cabangStore)
const { warehouses } = storeToRefs(warehouseStore)

const statusOptions = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
]

const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return []
  return cabangs.value.filter((c) => Number(c.perusahaanId) === Number(form.value.perusahaanId))
})

const salesInvoiceItemsTotal = computed(() => {
  if (!Array.isArray(form.value.salesInvoiceItems)) return 0
  return Math.round(form.value.salesInvoiceItems.reduce((total, item) => total + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0))
})

function getSalesOrderLabel(option) {
  return option?.noSo ? `${option.noSo} - ${option?.customer?.name || '-'}` : 'No SO'
}

function onProductChange(index) {
  const item = form.value.salesInvoiceItems[index]
  if (!item) return
  const selected = (customerProducts.value || []).find((p) => p.id === item.productId)
  if (selected) item.price = Number(selected.priceSell) || 0
  item.subtotal = Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0))
}

function onQuantityChange(index) {
  const item = form.value.salesInvoiceItems[index]
  if (!item) return
  item.subtotal = Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0))
}

function addSalesInvoiceItem() {
  if (!Array.isArray(form.value.salesInvoiceItems)) form.value.salesInvoiceItems = []
  form.value.salesInvoiceItems.push({
    productId: null,
    warehouseId: null,
    quantity: 1,
    deliveredQty: 0,
    price: 0,
    subtotal: 0,
    description: '',
    statusPartial: false,
  })
}

function removeSalesInvoiceItem(index) {
  form.value.salesInvoiceItems.splice(index, 1)
}

async function handleSubmit() {
  const ok = await salesInvoiceStore.saveSalesInvoice()
  if (ok) navigateTo('/sales/sales-invoice')
}

watch(salesInvoiceItemsTotal, (newSubtotal) => {
  if (!form.value.salesOrderId) form.value.total = Math.round(newSubtotal)
  form.value.dpp = Number(form.value.perusahaanId) === 3 ? 0 : Math.round(newSubtotal * 11 / 12)
})

watch(() => form.value.salesOrderId, async (newSalesOrderId, oldSalesOrderId) => {
  if (!newSalesOrderId || newSalesOrderId === oldSalesOrderId) return
  const selectedSalesOrder = salesOrdersForSelect.value?.find((so) => so.id === newSalesOrderId)
  if (!selectedSalesOrder) return

  form.value.customerId = selectedSalesOrder.customerId || selectedSalesOrder.customer?.id
  form.value.perusahaanId = selectedSalesOrder.perusahaanId || null
  form.value.cabangId = selectedSalesOrder.cabangId || null
  form.value.discountPercent = Number(selectedSalesOrder.discountPercent) || 0
  form.value.taxPercent = Number(selectedSalesOrder.taxPercent) || 0
  form.value.total = Math.round(Number(selectedSalesOrder.total)) || 0
  form.value.status = form.value.status || 'unpaid'

  await salesOrderStore.getSalesOrderDetails(newSalesOrderId)
  const details = salesOrderStore.salesOrder
  form.value.salesInvoiceItems = (details?.salesOrderItems || []).map((soItem) => ({
    productId: soItem.productId,
    warehouseId: soItem.warehouseId || null,
    quantity: Math.floor(Number(soItem.quantity)) || 0,
    deliveredQty: Math.floor(Number(soItem.deliveredQty || soItem.quantity)) || 0,
    price: Number(soItem.price) || 0,
    subtotal: Math.round(Number(soItem.subtotal)) || 0,
    description: soItem.description || '',
    statusPartial: false,
  }))
})

onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    salesOrderStore.fetchSalesOrders(),
    perusahaanStore.fetchPerusahaans(),
    cabangStore.fetchCabangs(),
    warehouseStore.fetchWarehouses(),
  ])

  const id = route.params.id ? String(route.params.id) : null
  if (id) {
      await salesInvoiceStore.openModal({ id })
    salesInvoiceStore.showModal = false
  } else {
    await salesInvoiceStore.openModal(null)
    salesInvoiceStore.showModal = false
  }
})
</script>
