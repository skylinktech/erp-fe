<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Sales Return' : 'Tambah Sales Return' }}</h4>
          <p class="mb-0 text-muted">Kelola data sales return pada halaman terpisah.</p>
        </div>
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/sales-return')">Kembali</button>
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
              <div id="form-tabs-info-page" data-step-id="form-tabs-info-page" role="tabpanel" :class="paneClass('form-tabs-info-page')">
                <div class="row g-4">
                  <div class="col-md-6">
                    <FormLabel required>Customer</FormLabel>
                    <CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                    <div v-if="uiErrors.customerId" class="invalid-feedback d-block">{{ uiErrors.customerId }}</div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Sales Order</FormLabel>
                    <CustomSelect2 v-model="form.salesOrderId" :options="salesOrders || []" :get-option-label="option => option.noSo" :reduce="option => option.id" searchable clearable placeholder="Pilih Sales Order" :disabled="!form.customerId" />
                    <div v-if="uiErrors.salesOrderId" class="invalid-feedback d-block">{{ uiErrors.salesOrderId }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" v-model="form.up" class="form-control" placeholder="Untuk Perhatian" readonly>
                      <label>Untuk Perhatian</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input id="sr-return-date" type="date" v-model="form.returnDate" class="form-control" :class="{ 'is-invalid': uiErrors.returnDate }" aria-required="true">
                      <label for="sr-return-date">Tanggal Pengembalian <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.returnDate" class="invalid-feedback d-block">{{ uiErrors.returnDate }}</div>
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans || []" :get-option-label="option => option.nmPerusahaan" :reduce="option => option.id" searchable clearable placeholder="Pilih Perusahaan" readonly />
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="option => option.nmCabang" :reduce="option => option.id" searchable clearable placeholder="Pilih Cabang" readonly />
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="file" @change="onFileChange" class="form-control">
                      <label>Attachment</label>
                      <a v-if="attachmentPreview" :href="attachmentPreview" target="_blank" class="d-block mt-1">Lihat Attachment</a>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input type="text" :value="formatRupiah(form.totalReturnAmount)" class="form-control">
                      <label>Total Pengembalian</label>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-floating form-floating-outline">
                      <textarea v-model="form.description" class="form-control" placeholder="Deskripsi"></textarea>
                      <label>Deskripsi</label>
                    </div>
                  </div>
                </div>
              </div>

              <div id="form-tabs-items-page" data-step-id="form-tabs-items-page" role="tabpanel" :class="paneClass('form-tabs-items-page')">
                <div v-if="uiErrors.salesReturnItems" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.salesReturnItems }}</div>
                <div v-for="(item, index) in form.salesReturnItems" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-6">
                      <CustomSelect2 v-model="item.warehouseId" :options="warehouses || []" :get-option-label="option => option.name" searchable clearable :reduce="w => w.id" placeholder="Pilih Gudang" readonly />
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.productId" :options="allAvailableProducts || []" :get-option-label="option => option.name" searchable clearable :reduce="p => p.id" placeholder="Pilih Produk" @update:modelValue="onProductChange(index)" readonly />
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.quantity" class="form-control" placeholder="Qty" readonly>
                        <label>Jumlah</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                        <label>Harga</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="item.reason" class="form-control" placeholder="Alasan">
                        <label>Alasan</label>
                      </div>
                    </div>
                    <div class="col-md-9">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item" readonly>
                        <label>Deskripsi</label>
                      </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                      <button @click.prevent="salesReturnStore.removeItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                    </div>
                  </div>
                  <hr class="my-4">
                </div>
              </div>
            </div>

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="saving"
              cancel-label="Tutup"
              @cancel="navigateTo('/sales/sales-return')"
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
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { routeSaveFailure } from '~/utils/apiError'
import { useSalesReturnStore } from '~/stores/sales-return'
import { useCustomerStore } from '~/stores/customer'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'

const route = useRoute()
const config = useRuntimeConfig()
const salesReturnStore = useSalesReturnStore()
const customerStore = useCustomerStore()
const perusahaanStore = usePerusahaanStore()
const cabangStore = useCabangStore()
const productStore = useProductStore()
const warehouseStore = useWarehouseStore()
const formatRupiah = useFormatRupiah()
const attachmentPreview = ref(null)

const { form, isEditMode, salesOrders, allAvailableProducts, saving } = storeToRefs(salesReturnStore)
const formRoot = ref(null)
const uiErrors = ref({})
const formSteps = [
  { id: 'form-tabs-info-page', label: 'Informasi Sales Return', icon: 'ri-information-line' },
  { id: 'form-tabs-items-page', label: 'List Product', icon: 'ri-box-3-line' },
]
function validateSalesReturnStep(step) {
  uiErrors.value = {}
  if (step.id === 'form-tabs-info-page') {
    if (!form.value?.customerId) uiErrors.value.customerId = 'Customer wajib dipilih.'
    if (!form.value?.salesOrderId) uiErrors.value.salesOrderId = 'Sales Order wajib dipilih.'
    if (!form.value?.returnDate) uiErrors.value.returnDate = 'Tanggal Pengembalian wajib diisi.'
    return Object.keys(uiErrors.value).length === 0
  }
  if (step.id === 'form-tabs-items-page') {
    const items = form.value?.salesReturnItems || []
    const validItems = items.filter((i) => i.productId)
    if (validItems.length < 1) {
      uiErrors.value.salesReturnItems = 'Minimal satu item harus ditambahkan.'
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
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateSalesReturnStep })
const SR_FIELD_TABS = {
  customerId: 'form-tabs-info-page',
  salesOrderId: 'form-tabs-info-page',
  returnDate: 'form-tabs-info-page',
  salesReturnItems: 'form-tabs-items-page',
  productId: 'form-tabs-items-page',
  quantity: 'form-tabs-items-page',
}
const { customers } = storeToRefs(customerStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs } = storeToRefs(cabangStore)
const { warehouses } = storeToRefs(warehouseStore)

const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return []
  return cabangs.value.filter(c => c.perusahaanId === form.value.perusahaanId)
})

const getAttachmentUrl = (attachmentPath) => {
  if (!attachmentPath || typeof attachmentPath !== 'string') return null
  if (attachmentPath.startsWith('http')) return attachmentPath
  const baseUrl = (config.public.apiBase || '').replace('/api', '')
  return `${baseUrl}/${attachmentPath}`
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    form.value.attachment = file
    attachmentPreview.value = URL.createObjectURL(file)
  } else {
    form.value.attachment = null
    attachmentPreview.value = null
  }
}

const onProductChange = (index) => {
  const selectedProductId = form.value.salesReturnItems[index].productId
  const selectedProduct = allAvailableProducts.value.find(p => p.id === selectedProductId)
  if (selectedProduct) {
    const item = form.value.salesReturnItems[index]
    item.price = Number(selectedProduct.priceSell) || 0
  }
}

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await handleSubmit()
}

async function handleSubmit() {
  const ok = await salesReturnStore.saveSalesReturn()
  if (ok) {
    navigateTo('/sales/sales-return')
    return
  }
  routeSaveFailure(salesReturnStore.validationErrors, uiErrors.value, SR_FIELD_TABS, goToId)
}

watch(() => form.value.customerId, (newCustomerId, oldCustomerId) => {
  if (newCustomerId && newCustomerId !== oldCustomerId) {
    salesReturnStore.fetchSalesOrdersByCustomer(newCustomerId)
    form.value.salesOrderId = null
    form.value.salesReturnItems = []
    salesReturnStore.addItem()
  } else if (!newCustomerId) {
    salesReturnStore.salesOrders = []
    form.value.salesOrderId = null
    form.value.salesReturnItems = []
    salesReturnStore.addItem()
  }
})

watch(() => form.value.salesOrderId, (newSalesOrderId) => {
  if (newSalesOrderId) {
    salesReturnStore.populateFormFromSalesOrder(newSalesOrderId)
  }
})

onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    perusahaanStore.fetchPerusahaans(),
    cabangStore.fetchCabangs(),
    productStore.fetchProducts(),
    warehouseStore.fetchWarehouses(),
  ])

  const id = route.params.id ? String(route.params.id) : null
  if (id) {
      await salesReturnStore.openModal({ id })
    salesReturnStore.showModal = false
    if (form.value.attachment) attachmentPreview.value = getAttachmentUrl(form.value.attachment)
  } else {
    await salesReturnStore.openModal(null)
    salesReturnStore.showModal = false
  }
})
</script>
