<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Sales Order' : 'Tambah Sales Order' }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="isEditMode ? 'Edit Sales Order' : 'Tambah Sales Order'" />
          <p class="mb-0 text-muted">Kelola Sales Order pada halaman form terpisah.</p>
        </div>
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/sales-order')">
          <i class="ri-arrow-left-line me-1"></i>Kembali
        </button>
      </div>

      <div class="card">
        <div class="card-body">
          <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || saving"
              @select="goTo"
            />

            <div class="tab-content pt-4">
              <div id="so-tabs-info" data-step-id="so-tabs-info" role="tabpanel" :class="paneClass('so-tabs-info')">
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
                    <FormLabel required>Customer</FormLabel>
                    <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="c => c.name" :reduce="c => c.id" placeholder="Pilih Customer" searchable clearable />
                    <div v-if="uiErrors.customerId" class="invalid-feedback d-block">{{ uiErrors.customerId }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input id="so-up" type="text" v-model="form.up" class="form-control" :class="{ 'is-invalid': uiErrors.up }" placeholder="Untuk Perhatian" aria-required="true">
                      <label for="so-up">Untuk Perhatian <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.up" class="invalid-feedback d-block">{{ uiErrors.up }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input id="so-date" type="date" v-model="form.date" class="form-control" :class="{ 'is-invalid': uiErrors.date }" aria-required="true">
                      <label for="so-date">Tanggal <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.date" class="invalid-feedback d-block">{{ uiErrors.date }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input id="so-due-date" type="date" v-model="form.dueDate" class="form-control" :class="{ 'is-invalid': uiErrors.dueDate }" aria-required="true">
                      <label for="so-due-date">Jatuh Tempo <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.dueDate" class="invalid-feedback d-block">{{ uiErrors.dueDate }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.termOfPayment" class="form-control" placeholder="Term Of Payment">
                      <label>Term Of Payment</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Perusahaan</FormLabel>
                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans" :get-option-label="p => p.nmPerusahaan" :reduce="p => p.id" placeholder="Pilih Perusahaan" searchable clearable />
                    <div v-if="uiErrors.perusahaanId" class="invalid-feedback d-block">{{ uiErrors.perusahaanId }}</div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Cabang</FormLabel>
                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="c => c.nmCabang" :reduce="c => c.id" placeholder="Pilih Cabang" searchable clearable />
                    <div v-if="uiErrors.cabangId" class="invalid-feedback d-block">{{ uiErrors.cabangId }}</div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Metode Pembayaran</FormLabel>
                    <CustomSelect2 v-model="form.paymentMethod" :options="paymentMethodOptions" :get-option-label="o => o.label" :reduce="o => o.value" placeholder="Pilih Metode Pembayaran" searchable clearable />
                    <div v-if="uiErrors.paymentMethod" class="invalid-feedback d-block">{{ uiErrors.paymentMethod }}</div>
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

              <div id="so-tabs-items" data-step-id="so-tabs-items" role="tabpanel" :class="paneClass('so-tabs-items')">
                <div v-if="uiErrors.salesOrderItems" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.salesOrderItems }}</div>
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

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="saving"
              cancel-label="Tutup"
              @cancel="navigateTo('/sales/sales-order')"
              @next="next"
              @previous="previous"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesOrderStore } from '~/stores/sales-order'
import { useCustomerStore } from '~/stores/customer'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useQuotationStore } from '~/stores/quotation'
import { useWarehouseStore } from '~/stores/warehouse'
import { useStocksStore } from '~/stores/stocks'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { routeSaveFailure } from '~/utils/apiError'

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
const formRoot = ref(null)
const uiErrors = ref({})
const formSteps = [
  { id: 'so-tabs-info', label: 'Informasi Sales Order', icon: 'ri-user-line' },
  { id: 'so-tabs-items', label: 'List Product', icon: 'ri-folder-user-line' },
]
function validateSalesOrderStep(step) {
  uiErrors.value = {}
  if (step.id === 'so-tabs-info') {
    if (!form.value?.customerId) uiErrors.value.customerId = 'Customer wajib dipilih.'
    if (!form.value?.perusahaanId) uiErrors.value.perusahaanId = 'Perusahaan wajib dipilih.'
    if (!form.value?.cabangId) uiErrors.value.cabangId = 'Cabang wajib dipilih.'
    if (!String(form.value?.up || '').trim()) uiErrors.value.up = 'Untuk Perhatian wajib diisi.'
    if (!form.value?.date) uiErrors.value.date = 'Tanggal wajib diisi.'
    if (!form.value?.dueDate) uiErrors.value.dueDate = 'Jatuh Tempo wajib diisi.'
    if (!form.value?.paymentMethod) uiErrors.value.paymentMethod = 'Metode Pembayaran wajib dipilih.'
    if (form.value?.date && form.value?.dueDate && String(form.value.dueDate) < String(form.value.date)) {
      uiErrors.value.dueDate = 'Jatuh Tempo tidak boleh lebih awal dari Tanggal Sales Order.'
    }
    return Object.keys(uiErrors.value).length === 0
  }
  if (step.id === 'so-tabs-items') {
    const items = form.value?.salesOrderItems || []
    const validItems = items.filter((i) => i.productId && Number(i.quantity) > 0)
    if (validItems.length < 1) {
      const hasProductNoQty = items.some((i) => i.productId && !(Number(i.quantity) > 0))
      uiErrors.value.salesOrderItems = hasProductNoQty
        ? 'Quantity minimal 1.'
        : 'Minimal satu item harus ditambahkan.'
    }
    return Object.keys(uiErrors.value).length === 0
  }
  return true
}
const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  goToId,
  paneClass,
  validateAll,
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateSalesOrderStep })
const SO_FIELD_TABS = {
  customerId: 'so-tabs-info',
  perusahaanId: 'so-tabs-info',
  cabangId: 'so-tabs-info',
  date: 'so-tabs-info',
  salesOrderItems: 'so-tabs-items',
  productId: 'so-tabs-items',
  quantity: 'so-tabs-items',
}
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

const onFormSubmit = async () => {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await handleSubmit()
}

const handleSubmit = async () => {
  const ok = await salesOrderStore.saveSalesOrder()
  if (ok) {
    navigateTo('/sales/sales-order')
    return
  }
  routeSaveFailure(salesOrderStore.validationErrors, uiErrors.value, SO_FIELD_TABS, goToId)
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
