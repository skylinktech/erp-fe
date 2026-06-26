<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Purchase Invoice' : 'Tambah Purchase Invoice' }}</h4>
          <p class="mb-0 text-muted">Kelola purchase invoice pada halaman terpisah.</p>
        </div>
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/purchasing/purchase-invoice')">
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
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#pi-tabs-info" role="tab" type="button">
                      <span class="ri-user-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Informasi Purchase Invoice</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#pi-tabs-items" role="tab" type="button">
                      <span class="ri-folder-user-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">List Product</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-4">
              <div id="pi-tabs-info" class="tab-pane fade active show" role="tabpanel">
                <div class="row g-4">
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.purchaseOrderId" :options="purchaseOrders || []" :get-option-label="getPurchaseOrderLabel" :reduce="option => option.id" placeholder="Pilih Purchase Order" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.vendorId" :options="vendors || []" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Vendor" :disabled="!!form.purchaseOrderId" />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans || []" :get-option-label="option => option.nmPerusahaan" :reduce="option => option.id" searchable clearable placeholder="Pilih Perusahaan" />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="option => option.nmCabang" :reduce="option => option.id" searchable clearable placeholder="Pilih Cabang" :disabled="!form.perusahaanId" />
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="form.paymentDate" class="form-control">
                      <label>Tanggal Pembayaran</label>
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
                    <CustomSelect2 v-model="form.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih Status" />
                  </div>
                  <div class="col-md-3">
                    <CustomSelect2 v-model="form.paymentMethod" :options="paymentMethodOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable :clearable="false" placeholder="Metode Pembayaran" />
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model="form.discountPercent" class="form-control" :readonly="!!form.purchaseOrderId">
                      <label>Discount (%)</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input type="number" v-model="form.taxPercent" class="form-control" :readonly="!!form.purchaseOrderId">
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
                      <input type="text" :value="formatRupiah(computedRemainingAmount)" class="form-control" readonly>
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

              <div id="pi-tabs-items" class="tab-pane fade" role="tabpanel">
                <div v-for="(item, index) in (form.purchaseInvoiceItems || [])" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.productId" :options="getProductOptions(item)" :get-option-label="option => option?.name || option?.label || 'Unknown Product'" searchable clearable :reduce="p => p.id" placeholder="Pilih Produk" @update:modelValue="onProductChange(index)" :disabled="!!form.purchaseOrderId" />
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.warehouseId" :options="getWarehouseOptions(item)" :get-option-label="option => option?.name || option?.label || 'Unknown Warehouse'" searchable clearable :reduce="w => w.id" placeholder="Pilih Gudang" @update:modelValue="updateStockInfo(index)" :disabled="!!form.purchaseOrderId" />
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" :readonly="!!form.purchaseOrderId">
                        <label>Jumlah</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.receivedQty" class="form-control">
                        <label>Received Qty</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="formatRupiah(item.price)" class="form-control" readonly>
                        <label>Harga</label>
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
                        <input type="text" v-model="item.description" class="form-control" :readonly="!!form.purchaseOrderId">
                        <label>Deskripsi</label>
                      </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                      <button class="btn btn-outline-danger w-100" @click.prevent="removePurchaseInvoiceItem(index)" :disabled="!!form.purchaseOrderId">Hapus</button>
                    </div>
                  </div>
                  <hr class="my-4">
                </div>

                <div class="mt-4" v-if="!form.purchaseOrderId">
                  <button class="btn btn-primary" @click.prevent="addPurchaseInvoiceItem()">Tambah Item</button>
                </div>
                <div class="d-flex justify-content-end mt-4">
                  <div class="text-end">
                    <div class="mb-2"><span class="fw-medium">Subtotal Items: {{ formatRupiah(purchaseInvoiceItemsTotal) }}</span></div>
                    <div class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/purchasing/purchase-invoice')">Tutup</button>
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
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { usePurchaseInvoiceStore } from '~/stores/purchase-invoice'
import { useVendorStore } from '~/stores/vendor'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
import { useWarehouseStore } from '~/stores/warehouse'

const route = useRoute()
const purchaseInvoiceStore = usePurchaseInvoiceStore()
const vendorStore = useVendorStore()
const perusahaanStore = usePerusahaanStore()
const cabangStore = useCabangStore()
const purchaseOrderStore = usePurchaseOrderStore()
const warehouseStore = useWarehouseStore()
const formatRupiah = useFormatRupiah()

const { form, isEditMode, saving } = storeToRefs(purchaseInvoiceStore)
const { vendors } = storeToRefs(vendorStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs } = storeToRefs(cabangStore)
const { purchaseOrders } = storeToRefs(purchaseOrderStore)
const { warehouses } = storeToRefs(warehouseStore)

const statusOptions = ref([
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
])

const paymentMethodOptions = ref([
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer Bank', value: 'transfer' },
  { label: 'QRIS', value: 'qris' },
  { label: 'Card', value: 'card' },
])

const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return []
  return cabangs.value.filter(cabang => cabang.perusahaanId === form.value.perusahaanId)
})

const purchaseInvoiceItemsTotal = computed(() => {
  if (!form.value.purchaseInvoiceItems || !Array.isArray(form.value.purchaseInvoiceItems)) return 0
  return Math.round(form.value.purchaseInvoiceItems.reduce((total, item) => total + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0))
})

const discountAmount = computed(() => Math.round((Number(form.value.total) || 0) * ((Number(form.value.discountPercent) || 0) / 100)))
const taxAmount = computed(() => {
  const totalAfterDiscount = (Number(form.value.total) || 0) - discountAmount.value
  return Math.round(totalAfterDiscount * ((Number(form.value.taxPercent) || 0) / 100))
})

const grandTotal = computed(() => {
  if (form.value.purchaseOrderId) return Math.round(Number(form.value.total) || 0)
  return Math.round((Number(form.value.total) || 0) - discountAmount.value + taxAmount.value)
})
const computedRemainingAmount = computed(() => grandTotal.value - (Number(form.value.paidAmount) || 0))

function getPurchaseOrderLabel(option) {
  return option?.noPo ? `${option.noPo} - ${option?.vendor?.name || '-'}` : 'No PO Number'
}

function getProductOptions(item) {
  if (item?.product) return [{ ...item.product, id: item.productId }]
  return []
}

function getWarehouseOptions(item) {
  if (item?.warehouse) return [{ ...item.warehouse, id: item.warehouseId }]
  return warehouses.value || []
}

function onProductChange(index) {
  const item = form.value.purchaseInvoiceItems[index]
  if (!item) return
  if (item.product?.priceSell) item.price = Number(item.product.priceSell) || 0
  item.subtotal = Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0))
}

function onQuantityChange(index) {
  const item = form.value.purchaseInvoiceItems[index]
  if (!item) return
  item.subtotal = Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0))
}

function updateStockInfo() {}

function addPurchaseInvoiceItem() {
  if (!form.value.purchaseInvoiceItems) form.value.purchaseInvoiceItems = []
  form.value.purchaseInvoiceItems.push({
    productId: null,
    warehouseId: null,
    quantity: 1,
    receivedQty: 0,
    price: 0,
    subtotal: 0,
    description: '',
    isReturned: false,
  })
}

function removePurchaseInvoiceItem(index) {
  form.value.purchaseInvoiceItems.splice(index, 1)
}

async function handleSubmit() {
  const ok = await purchaseInvoiceStore.savePurchaseInvoice()
  if (ok) navigateTo('/purchasing/purchase-invoice')
}

watch(purchaseInvoiceItemsTotal, (newSubtotal) => {
  if (!form.value.purchaseOrderId) form.value.total = Math.round(newSubtotal)
  form.value.dpp = Math.round(Number(newSubtotal) * 11 / 12)
})

watch(() => form.value.purchaseOrderId, async (newPurchaseOrderId, oldPurchaseOrderId) => {
  if (!newPurchaseOrderId || newPurchaseOrderId === oldPurchaseOrderId) return
  const selectedPurchaseOrder = purchaseOrders.value?.find(so => so.id === newPurchaseOrderId)
  if (!selectedPurchaseOrder) return

  form.value.vendorId = selectedPurchaseOrder.vendorId || selectedPurchaseOrder.vendor?.id
  form.value.discountPercent = selectedPurchaseOrder.discountPercent || 0
  form.value.taxPercent = selectedPurchaseOrder.taxPercent || 0
  form.value.total = Math.round(Number(selectedPurchaseOrder.total)) || 0
  if (selectedPurchaseOrder.perusahaanId) form.value.perusahaanId = selectedPurchaseOrder.perusahaanId
  if (selectedPurchaseOrder.cabangId) form.value.cabangId = selectedPurchaseOrder.cabangId
  if (!form.value.status) form.value.status = 'unpaid'
  if (!form.value.paymentDate) form.value.paymentDate = new Date().toISOString().split('T')[0]

  if (!isEditMode.value) {
    await purchaseOrderStore.getPurchaseOrderDetails(newPurchaseOrderId)
    const detailedPO = purchaseOrderStore.purchaseOrder
    form.value.purchaseInvoiceItems = (detailedPO?.purchaseOrderItems || []).map((poItem) => ({
      productId: poItem.productId,
      warehouseId: poItem.warehouseId,
      quantity: Math.floor(Number(poItem.quantity)) || 0,
      price: Number(poItem.price) || 0,
      subtotal: Math.round(Number(poItem.subtotal)) || 0,
      description: poItem.description || '',
      receivedQty: Math.floor(Number(poItem.receivedQty || poItem.quantity)) || 0,
      isReturned: false,
      product: poItem.product || null,
      warehouse: poItem.warehouse || null,
      purchaseOrderItemId: poItem.id,
    }))
  }
})

onMounted(async () => {
  await Promise.all([
    vendorStore.fetchVendors(),
    perusahaanStore.fetchPerusahaans(),
    cabangStore.fetchCabangs(),
    purchaseOrderStore.fetchPurchaseOrders(),
    warehouseStore.fetchWarehouses(),
  ])

  const id = route.params.id ? String(route.params.id) : null
  if (id) {
      await purchaseInvoiceStore.openModal({ id })
    purchaseInvoiceStore.showModal = false
  } else {
    await purchaseInvoiceStore.openModal(null)
    purchaseInvoiceStore.showModal = false
  }
})
</script>
