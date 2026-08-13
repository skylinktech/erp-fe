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
          <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || saving"
              @select="goTo"
            />

            <div class="tab-content pt-4">
              <div id="si-tabs-info" data-step-id="si-tabs-info" role="tabpanel" :class="paneClass('si-tabs-info')">
                <div class="row g-4">
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.salesOrderId" :options="salesOrdersForSelect || []" :get-option-label="getSalesOrderLabel" :reduce="so => so.id" placeholder="Pilih Sales Order" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Customer</FormLabel>
                    <CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="c => c.name" :reduce="c => c.id" placeholder="Pilih Customer" searchable clearable :disabled="!!form.salesOrderId" />
                    <div v-if="uiErrors.customerId" class="invalid-feedback d-block">{{ uiErrors.customerId }}</div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Perusahaan</FormLabel>
                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans || []" :get-option-label="p => p.nmPerusahaan" :reduce="p => p.id" placeholder="Pilih Perusahaan" searchable clearable :disabled="!!form.salesOrderId" />
                    <div v-if="uiErrors.perusahaanId" class="invalid-feedback d-block">{{ uiErrors.perusahaanId }}</div>
                  </div>
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="c => c.nmCabang" :reduce="c => c.id" placeholder="Pilih Cabang" searchable clearable :disabled="!!form.salesOrderId || !form.perusahaanId" />
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input id="si-date" type="date" v-model="form.date" class="form-control" :class="{ 'is-invalid': uiErrors.date }" aria-required="true">
                      <label for="si-date">Tanggal Invoice <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.date" class="invalid-feedback d-block">{{ uiErrors.date }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input id="si-due-date" type="date" v-model="form.dueDate" class="form-control" :class="{ 'is-invalid': uiErrors.dueDate }" aria-required="true">
                      <label for="si-due-date">Jatuh Tempo Invoice <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.dueDate" class="invalid-feedback d-block">{{ uiErrors.dueDate }}</div>
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
                      <textarea id="si-description" v-model="form.description" class="form-control" :class="{ 'is-invalid': uiErrors.description }" placeholder="Deskripsi Invoice" aria-required="true"></textarea>
                      <label for="si-description">Deskripsi Invoice <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.description" class="invalid-feedback d-block">{{ uiErrors.description }}</div>
                  </div>
                </div>
              </div>

              <div id="si-tabs-items" data-step-id="si-tabs-items" role="tabpanel" :class="paneClass('si-tabs-items')">
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

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="saving"
              cancel-label="Tutup"
              @cancel="navigateTo('/sales/sales-invoice')"
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
const formRoot = ref(null)
const uiErrors = ref({})
const formSteps = [
  { id: 'si-tabs-info', label: 'Informasi Sales Invoice', icon: 'ri-information-line' },
  { id: 'si-tabs-items', label: 'List Product', icon: 'ri-box-3-line' },
]
function validateSalesInvoiceStep(step) {
  uiErrors.value = {}
  if (step.id !== 'si-tabs-info') return true
  if (!form.value?.customerId) uiErrors.value.customerId = 'Customer wajib dipilih.'
  if (!form.value?.perusahaanId) uiErrors.value.perusahaanId = 'Perusahaan wajib dipilih.'
  if (!form.value?.date) uiErrors.value.date = 'Tanggal Invoice wajib diisi.'
  if (!form.value?.dueDate) uiErrors.value.dueDate = 'Jatuh Tempo wajib diisi.'
  if (!String(form.value?.description || '').trim()) uiErrors.value.description = 'Deskripsi Invoice wajib diisi.'
  if (form.value?.date && form.value?.dueDate && String(form.value.dueDate) < String(form.value.date)) {
    uiErrors.value.dueDate = 'Jatuh Tempo tidak boleh lebih awal dari Tanggal Invoice.'
  }
  return Object.keys(uiErrors.value).length === 0
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
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateSalesInvoiceStep })
const SI_FIELD_TABS = {
  customerId: 'si-tabs-info',
  perusahaanId: 'si-tabs-info',
  date: 'si-tabs-info',
  dueDate: 'si-tabs-info',
  description: 'si-tabs-info',
  salesInvoiceItems: 'si-tabs-items',
  productId: 'si-tabs-items',
  quantity: 'si-tabs-items',
}
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

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await handleSubmit()
}

async function handleSubmit() {
  const ok = await salesInvoiceStore.saveSalesInvoice()
  if (ok) {
    navigateTo('/sales/sales-invoice')
    return
  }
  routeSaveFailure(salesInvoiceStore.validationErrors, uiErrors.value, SI_FIELD_TABS, goToId)
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
