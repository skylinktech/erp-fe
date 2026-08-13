<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Surat Jalan' : 'Tambah Surat Jalan' }}</h4>
          <p class="mb-0 text-muted">Kelola surat jalan pada halaman terpisah.</p>
        </div>
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/surat-jalan')">Kembali</button>
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
              <div id="sj-form-tabs-info" data-step-id="sj-form-tabs-info" role="tabpanel" :class="paneClass('sj-form-tabs-info')">
                <div class="row g-4">
                  <div class="col-md-6">
                    <CustomSelect2 v-model="form.salesOrderId" :options="filteredSalesOrders" :get-option-label="getSalesOrderLabel" :reduce="option => option.id" placeholder="Pilih Sales Order" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Customer</FormLabel>
                    <CustomSelect2 v-model="form.customerId" :options="customersOptions" :get-option-label="getCustomerLabel" :reduce="option => option?.id" placeholder="Pilih Customer" searchable clearable :disabled="!!form.salesOrderId" />
                    <div v-if="uiErrors.customerId" class="invalid-feedback d-block">{{ uiErrors.customerId }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input id="sj-date" type="date" v-model="form.date" class="form-control" :class="{ 'is-invalid': uiErrors.date }" aria-required="true">
                      <label for="sj-date">Tanggal Surat Jalan <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.date" class="invalid-feedback d-block">{{ uiErrors.date }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating form-floating-outline">
                      <input id="sj-pic" type="text" v-model="form.picName" class="form-control" :class="{ 'is-invalid': uiErrors.picName }" placeholder="Nama PIC" aria-required="true">
                      <label for="sj-pic">Nama PIC <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.picName" class="invalid-feedback d-block">{{ uiErrors.picName }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <input id="sj-penerima" type="text" v-model="form.penerima" class="form-control" :class="{ 'is-invalid': uiErrors.penerima }" placeholder="Nama Penerima" aria-required="true">
                      <label for="sj-penerima">Nama Penerima <span class="text-danger" aria-hidden="true">*</span></label>
                    </div>
                    <div v-if="uiErrors.penerima" class="invalid-feedback d-block">{{ uiErrors.penerima }}</div>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <div class="form-check form-switch mt-3">
                      <input class="form-check-input" type="checkbox" id="sjTtdDigitalCheckboxPage" v-model="form.ttdDigital">
                      <label class="form-check-label" for="sjTtdDigitalCheckboxPage">TTD Digital</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check form-switch mt-3 d-flex align-items-center">
                      <input class="form-check-input me-2" type="checkbox" v-model="alamatSamaDenganCustomer">
                      <label class="form-check-label mb-0">Sama dengan alamat customer?</label>
                    </div>
                  </div>
                  <div class="col-md-6" v-if="!alamatSamaDenganCustomer">
                    <div class="form-floating form-floating-outline">
                      <textarea v-model="form.alamatPengiriman" class="form-control" placeholder="Alamat Pengiriman"></textarea>
                      <label>Alamat Pengiriman</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                      <textarea v-model="form.description" class="form-control" placeholder="Deskripsi Surat Jalan"></textarea>
                      <label>Deskripsi Surat Jalan</label>
                    </div>
                  </div>
                </div>
              </div>

              <div id="sj-form-tabs-items" data-step-id="sj-form-tabs-items" role="tabpanel" :class="paneClass('sj-form-tabs-items')">
                <div v-for="(item, index) in (form.suratJalanItems || [])" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.productId" :options="customerProducts || []" :get-option-label="getProductLabel" :reduce="p => p.id" placeholder="Pilih Produk" searchable clearable @update:modelValue="onProductChange(index)" />
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="item.warehouseId" :options="warehouses || []" :get-option-label="option => option?.name || 'No Name'" :reduce="w => w.id" placeholder="Pilih Gudang" searchable clearable @update:modelValue="updateStockInfo(index)" />
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="item.quantity" class="form-control" min="0">
                        <label>Jumlah</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" :value="getStockDisplay(item?.stock)" class="form-control" readonly>
                        <label>Stock</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item">
                        <label>Deskripsi</label>
                      </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                      <button @click.prevent="removeSuratJalanItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                    </div>
                  </div>
                  <hr class="my-4">
                </div>
                <div class="mt-4">
                  <button @click.prevent="addSuratJalanItem()" class="btn btn-primary btn-sm w-100">Tambah Item</button>
                </div>
              </div>
            </div>

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="saving"
              cancel-label="Tutup"
              @cancel="navigateTo('/sales/surat-jalan')"
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
import { useSuratJalanStore } from '~/stores/surat-jalan'
import { useCustomerStore } from '~/stores/customer'
import { useWarehouseStore } from '~/stores/warehouse'
import { useSalesOrderStore } from '~/stores/sales-order'
import { useStocksStore } from '~/stores/stocks'

const route = useRoute()
const suratJalanStore = useSuratJalanStore()
const customerStore = useCustomerStore()
const warehouseStore = useWarehouseStore()
const salesOrderStore = useSalesOrderStore()
const stocksStore = useStocksStore()

const { form, isEditMode, saving } = storeToRefs(suratJalanStore)
const formRoot = ref(null)
const uiErrors = ref({})
const formSteps = [
  { id: 'sj-form-tabs-info', label: 'Informasi Surat Jalan', icon: 'ri-information-line' },
  { id: 'sj-form-tabs-items', label: 'List Produk', icon: 'ri-box-3-line' },
]
function validateSuratJalanStep(step) {
  uiErrors.value = {}
  if (step.id !== 'sj-form-tabs-info') return true
  if (!form.value?.customerId) uiErrors.value.customerId = 'Customer wajib dipilih.'
  if (!form.value?.date) uiErrors.value.date = 'Tanggal Surat Jalan wajib diisi.'
  if (!String(form.value?.picName || '').trim()) uiErrors.value.picName = 'Nama PIC wajib diisi.'
  if (!String(form.value?.penerima || '').trim()) uiErrors.value.penerima = 'Nama Penerima wajib diisi.'
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
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateSuratJalanStep })
const SJ_FIELD_TABS = {
  customerId: 'sj-form-tabs-info',
  date: 'sj-form-tabs-info',
  picName: 'sj-form-tabs-info',
  penerima: 'sj-form-tabs-info',
  suratJalanItems: 'sj-form-tabs-items',
  productId: 'sj-form-tabs-items',
  quantity: 'sj-form-tabs-items',
}
const { customers } = storeToRefs(customerStore)
const { salesOrders, customerProducts } = storeToRefs(salesOrderStore)
const { warehouses } = storeToRefs(warehouseStore)

const alamatSamaDenganCustomer = ref(false)

const customersOptions = computed(() => (customers.value || []).map(option => ({
  id: option.id,
  name: option.name || 'No Name',
  email: option.email || '',
  phone: option.phone || '',
  ...option,
})))

const filteredSalesOrders = computed(() => (salesOrders.value || []).filter(so => ['approved', 'partial', 'delivered'].includes(so.status)))

const getSalesOrderLabel = (option) => option?.noSo ? `${option.noSo} - ${option.customer?.name || '-'}` : 'No SO'
const getCustomerLabel = (option) => option?.name || 'No Name'
const getProductLabel = (option) => option?.name || 'No Name'
const getStockDisplay = (stock) => typeof stock?.quantity === 'number' ? String(stock.quantity) : '-'

const addSuratJalanItem = () => {
  if (!Array.isArray(form.value.suratJalanItems)) form.value.suratJalanItems = []
  form.value.suratJalanItems.push({
    productId: null,
    warehouseId: null,
    quantity: 1,
    description: '',
    stock: { quantity: 0 },
  })
}

const removeSuratJalanItem = (index) => {
  form.value.suratJalanItems.splice(index, 1)
}

const onProductChange = (index) => {
  const item = form.value.suratJalanItems[index]
  if (!item) return
  const selectedProduct = (customerProducts.value || []).find((p) => p.id === item.productId)
  if (selectedProduct && !item.description) item.description = selectedProduct.description || ''
}

const updateStockInfo = async (index) => {
  const item = form.value.suratJalanItems[index]
  if (!item?.productId || !item?.warehouseId) return
  const res = await stocksStore.fetchStocksPaginated({
    productId: Number(item.productId),
    warehouseId: Number(item.warehouseId),
  })
  const qty = res?.data?.[0]?.quantity
  if (!item.stock) item.stock = { quantity: 0 }
  item.stock.quantity = Number(qty) || 0
}

watch(() => form.value.salesOrderId, async (newSalesOrderId, oldSalesOrderId) => {
  if (!newSalesOrderId || newSalesOrderId === oldSalesOrderId) return
  const selectedSalesOrder = filteredSalesOrders.value.find((so) => so.id === newSalesOrderId)
  if (!selectedSalesOrder) return

  form.value.customerId = selectedSalesOrder.customerId || selectedSalesOrder.customer?.id
  if (!form.value.date && selectedSalesOrder.date) form.value.date = new Date(selectedSalesOrder.date).toISOString().split('T')[0]

  if (!isEditMode.value) {
    await salesOrderStore.getSalesOrderDetails(newSalesOrderId)
    const detailed = salesOrderStore.salesOrder
    const items = (detailed?.salesOrderItems || []).filter((soItem) => soItem.statusPartial === true || detailed?.status === 'delivered')
    form.value.suratJalanItems = items.map((soItem) => ({
      productId: soItem.productId,
      warehouseId: soItem.warehouseId,
      quantity: Math.floor(Number(soItem.quantity)) || 0,
      description: soItem.description || '',
      product: soItem.product || null,
      warehouse: soItem.warehouse || null,
      salesOrderItemId: soItem.id,
      stock: { quantity: 0 },
    }))
  }
})

watch(() => form.value.customerId, async (newCustomerId, oldCustomerId) => {
  if (newCustomerId && newCustomerId !== oldCustomerId) {
    await salesOrderStore.fetchSalesOrdersByCustomer(newCustomerId)
  }
})

const onFormSubmit = async () => {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await handleSubmit()
}

const handleSubmit = async () => {
  const ok = await suratJalanStore.saveSuratJalan()
  if (ok) {
    navigateTo('/sales/surat-jalan')
    return
  }
  routeSaveFailure(suratJalanStore.validationErrors, uiErrors.value, SJ_FIELD_TABS, goToId)
}

onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    salesOrderStore.fetchSalesOrders(),
    warehouseStore.fetchWarehouses(),
  ])

  const id = route.params.id ? String(route.params.id) : null
  if (id) {
      await suratJalanStore.openModal({ id })
    suratJalanStore.showModal = false
  } else {
    await suratJalanStore.openModal(null)
    suratJalanStore.showModal = false
  }
})
</script>
