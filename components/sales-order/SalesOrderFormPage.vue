<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">{{ isEditMode ? 'Edit Sales Order' : 'Tambah Sales Order' }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="isEditMode ? 'Edit Sales Order' : 'Tambah Sales Order'" />
          <p class="mb-0 mt-3 text-muted">Kelola Sales Order pada halaman form terpisah.</p>
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
                    <FormLabel html-for="so-no-po">No. PO</FormLabel>
                    <input id="so-no-po" type="text" v-model="form.noPo" class="form-control" placeholder="No. PO">
                  </div>
                  <div v-if="!isRetailB2b" class="col-md-6">
                    <FormLabel>Quotation</FormLabel>
                    <CustomSelect2 v-model="form.quotationId" :options="quotations" :get-option-label="q => q.noQuotation" :reduce="q => q.id" placeholder="Pilih Quotation" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <FormLabel required>Customer</FormLabel>
                    <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="c => c.name" :reduce="c => c.id" placeholder="Pilih Customer" searchable clearable />
                    <div v-if="uiErrors.customerId" class="invalid-feedback d-block">{{ uiErrors.customerId }}</div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel required html-for="so-up">Untuk Perhatian</FormLabel>
                    <input id="so-up" type="text" v-model="form.up" class="form-control" :class="{ 'is-invalid': uiErrors.up }" placeholder="Untuk Perhatian" aria-required="true">
                    <div v-if="uiErrors.up" class="invalid-feedback d-block">{{ uiErrors.up }}</div>
                  </div>
                  <div class="col-md-3">
                    <FormLabel required html-for="so-date">Tanggal</FormLabel>
                    <input id="so-date" type="date" v-model="form.date" class="form-control" :class="{ 'is-invalid': uiErrors.date }" aria-required="true">
                    <div v-if="uiErrors.date" class="invalid-feedback d-block">{{ uiErrors.date }}</div>
                  </div>
                  <div class="col-md-3">
                    <FormLabel required html-for="so-due-date">Jatuh Tempo</FormLabel>
                    <input id="so-due-date" type="date" v-model="form.dueDate" class="form-control" :class="{ 'is-invalid': uiErrors.dueDate }" aria-required="true">
                    <div v-if="uiErrors.dueDate" class="invalid-feedback d-block">{{ uiErrors.dueDate }}</div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel html-for="so-term-of-payment">Term Of Payment</FormLabel>
                    <input id="so-term-of-payment" type="text" v-model="form.termOfPayment" class="form-control" placeholder="Term Of Payment">
                  </div>
                  <div class="col-md-6">
                    <ActiveCompanyField input-id="so-active-company" />
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
                    <FormLabel html-for="so-discount">Discount (%)</FormLabel>
                    <input id="so-discount" type="number" v-model.number="form.discountPercent" class="form-control" placeholder="0">
                  </div>
                  <div class="col-md-3">
                    <FormLabel html-for="so-tax">Tax (%)</FormLabel>
                    <input id="so-tax" type="number" v-model.number="form.taxPercent" class="form-control" placeholder="0">
                  </div>
                  <div class="col-md-6">
                    <FormLabel html-for="so-attachment">Attachment</FormLabel>
                    <input id="so-attachment" type="file" @change="onFileChange" class="form-control" accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg">
                    <div v-if="form.attachmentPreview" class="mt-2">
                      <a :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer">Lihat Attachment</a>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <FormLabel html-for="so-description">Deskripsi</FormLabel>
                    <textarea id="so-description" v-model="form.description" class="form-control" rows="3" placeholder="Deskripsi"></textarea>
                  </div>
                </div>
              </div>

              <div id="so-tabs-items" data-step-id="so-tabs-items" role="tabpanel" :class="paneClass('so-tabs-items')">
                <div v-if="uiErrors.salesOrderItems" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.salesOrderItems }}</div>
                <div v-if="isRetailB2b" class="row g-3 mb-4">
                  <div class="col-md-12">
                    <FormLabel required>Pricing</FormLabel>
                    <CustomSelect2
                      v-model="form.priceListId"
                      :options="retailPriceLists"
                      :get-option-label="priceListLabel"
                      :reduce="p => p.id"
                      placeholder="Pilih Pricing aktif..."
                      searchable
                      clearable
                      @update:modelValue="onPriceListChange"
                    />
                    <div v-if="uiErrors.priceListId" class="invalid-feedback d-block">{{ uiErrors.priceListId }}</div>
                    <small class="form-text text-muted">Pilih daftar harga terlebih dahulu. Beberapa Pricing aktif diperbolehkan.</small>
                  </div>
                </div>
                <div v-for="(item, index) in form.salesOrderItems" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-3">
                      <FormLabel :required="isRetailB2b">Gudang</FormLabel>
                      <CustomSelect2
                        v-model="item.warehouseId"
                        :options="warehouses"
                        :get-option-label="w => `${w.name} (${w.code})`"
                        :reduce="w => w.id"
                        :placeholder="isRetailB2b && !form.priceListId ? 'Pilih Pricing dulu...' : 'Pilih Gudang SO'"
                        :disabled="isRetailB2b && !form.priceListId"
                        searchable
                        clearable
                        @update:modelValue="() => onWarehouseChange(index)"
                      />
                    </div>
                    <div class="col-md-4">
                      <FormLabel>Produk</FormLabel>
                      <CustomSelect2
                        v-model="item.productId"
                        :options="productsForLine(item)"
                        :get-option-label="getProductLabel"
                        :reduce="p => p?.id"
                        :placeholder="productSelectPlaceholder(item)"
                        :disabled="isRetailB2b && (!form.priceListId || !item.warehouseId)"
                        searchable
                        clearable
                        @update:modelValue="() => onProductChange(index)"
                      />
                    </div>
                    <div class="col-md-2">
                      <FormLabel :html-for="`so-item-qty-${index}`">Qty</FormLabel>
                      <input :id="`so-item-qty-${index}`" type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" placeholder="Qty">
                    </div>
                    <div class="col-md-3">
                      <FormLabel :html-for="`so-item-price-${index}`">Harga Satuan</FormLabel>
                      <input
                        v-if="isRetailB2b"
                        :id="`so-item-price-${index}`"
                        type="text"
                        :value="formatRupiah(item.price)"
                        class="form-control"
                        readonly
                      >
                      <input
                        v-else
                        :id="`so-item-price-${index}`"
                        type="number"
                        v-model.number="item.price"
                        @input="onQuantityChange(index)"
                        class="form-control"
                        placeholder="Harga"
                      >
                      <small v-if="item.priceSource" class="form-text text-muted">{{ item.priceSource }}</small>
                      <div v-if="item.priceError" class="invalid-feedback d-block">{{ item.priceError }}</div>
                    </div>
                    <div class="col-md-3">
                      <FormLabel :html-for="`so-item-subtotal-${index}`">Subtotal</FormLabel>
                      <input :id="`so-item-subtotal-${index}`" type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly>
                    </div>
                    <div class="col-md-4">
                      <FormLabel :html-for="`so-item-desc-${index}`">Deskripsi</FormLabel>
                      <input :id="`so-item-desc-${index}`" type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item">
                    </div>
                    <div class="col-md-2">
                      <FormLabel :html-for="`so-item-stock-${index}`">Stock</FormLabel>
                      <input :id="`so-item-stock-${index}`" type="text" :value="getStockDisplay(item.stock)" class="form-control" readonly>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
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
import { useCabangStore } from '~/stores/cabang'
import { useQuotationStore } from '~/stores/quotation'
import { useWarehouseStore } from '~/stores/warehouse'
import { useStocksStore } from '~/stores/stocks'
import { useCompanyContextStore } from '~/stores/companyContext'
import { useActiveCompany } from '~/composables/useActiveCompany'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { routeSaveFailure } from '~/utils/apiError'
import { hasCapabilityCode } from '~/utils/businessFlowCapabilityRegistry'

const route = useRoute()
const salesOrderStore = useSalesOrderStore()
const customerStore = useCustomerStore()
const cabangStore = useCabangStore()
const quotationStore = useQuotationStore()
const warehouseStore = useWarehouseStore()
const stockStore = useStocksStore()
const companyContextStore = useCompanyContextStore()
const formatRupiah = useFormatRupiah()
const {
  requireCompanyId,
  syncFormCompanyId,
  ensureBootstrapped,
  missingMessage: activeCompanyMissing,
} = useActiveCompany()
void ensureBootstrapped()

const { form, isEditMode, saving, customerProducts, retailPriceLists } = storeToRefs(salesOrderStore)
const formRoot = ref(null)
const uiErrors = ref({})
const isRetailB2b = computed(() =>
  hasCapabilityCode('RETAIL_B2B_SALES', companyContextStore.effectiveFlowCodes, companyContextStore.profileCode)
)
const formSteps = [
  { id: 'so-tabs-info', label: 'Informasi Sales Order', icon: 'ri-user-line' },
  { id: 'so-tabs-items', label: 'List Product', icon: 'ri-folder-user-line' },
]
function validateSalesOrderStep(step) {
  uiErrors.value = {}
  if (step.id === 'so-tabs-info') {
    try {
      form.value.perusahaanId = requireCompanyId()
    } catch {
      uiErrors.value.perusahaanId = activeCompanyMissing.value || 'Active Company wajib dipilih.'
    }
    if (!form.value?.customerId) uiErrors.value.customerId = 'Customer wajib dipilih.'
    if (!form.value?.perusahaanId) {
      uiErrors.value.perusahaanId = activeCompanyMissing.value || 'Active Company wajib dipilih.'
    }
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
    if (isRetailB2b.value && !form.value?.priceListId) {
      uiErrors.value.priceListId = 'Pricing wajib dipilih.'
      uiErrors.value.salesOrderItems = 'Pilih Pricing terlebih dahulu.'
      return false
    }
    const items = form.value?.salesOrderItems || []
    const validItems = items.filter((i) => i.productId && Number(i.quantity) > 0)
    if (validItems.length < 1) {
      const hasProductNoQty = items.some((i) => i.productId && !(Number(i.quantity) > 0))
      uiErrors.value.salesOrderItems = hasProductNoQty
        ? 'Quantity minimal 1.'
        : 'Minimal satu item harus ditambahkan.'
    }
    if (isRetailB2b.value) {
      const missingWarehouse = validItems.find((i) => !i.warehouseId)
      if (missingWarehouse) {
        uiErrors.value.salesOrderItems = 'Gudang wajib dipilih untuk setiap item.'
      }
      const missingPrice = validItems.find((i) => i.priceError || !(Number(i.price) > 0))
      if (missingPrice) {
        uiErrors.value.salesOrderItems = missingPrice.priceError || 'Harga resmi dari Pricing belum tersedia untuk salah satu item.'
      }
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
  priceListId: 'so-tabs-items',
  salesOrderItems: 'so-tabs-items',
  productId: 'so-tabs-items',
  quantity: 'so-tabs-items',
}
const { customers } = storeToRefs(customerStore)
const { cabangs } = storeToRefs(cabangStore)
const { quotations } = storeToRefs(quotationStore)
const { warehouses } = storeToRefs(warehouseStore)

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'QRIS', value: 'qris' },
  { label: 'Card', value: 'card' },
]

const formPerusahaanId = computed({
  get: () => form.value?.perusahaanId ?? null,
  set: (value) => {
    if (form.value) form.value.perusahaanId = value
  },
})
syncFormCompanyId(formPerusahaanId)

const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return []
  return cabangs.value.filter(c => c.perusahaanId === form.value.perusahaanId)
})

const filteredCustomerProducts = computed(() => {
  if (!customerProducts.value || !Array.isArray(customerProducts.value)) return []
  return customerProducts.value
})

function productsForLine(item) {
  if (!isRetailB2b.value) return filteredCustomerProducts.value
  if (!form.value?.priceListId || !item?.warehouseId) return []
  return salesOrderStore.sellableProductsForWarehouse(item.warehouseId, form.value.priceListId)
}

function productSelectPlaceholder(item) {
  if (isRetailB2b.value && !form.value?.priceListId) return 'Pilih Pricing dulu...'
  if (isRetailB2b.value && !item?.warehouseId) return 'Pilih gudang dulu...'
  if (isRetailB2b.value && !productsForLine(item).length) return 'Tidak ada produk di Pricing + gudang'
  return 'Cari produk...'
}

function priceListLabel(option) {
  if (!option) return ''
  const range = option.validTo
    ? `${option.validFrom || ''} – ${option.validTo}`
    : `dari ${option.validFrom || ''}`
  return `${option.code} (${range})`
}

async function refreshOrderProducts(warehouseId = null) {
  await salesOrderStore.loadOrderProducts({
    retailB2b: isRetailB2b.value,
    customerId: form.value?.customerId,
    warehouseId,
    priceListId: form.value?.priceListId,
    pricingDate: form.value?.date,
  })
}

function clearLineProduct(item) {
  if (!item) return
  item.productId = null
  item.price = 0
  item.subtotal = 0
  item.priceError = ''
  item.priceSource = ''
  item.stock = null
  item.unitId = null
}

async function onPriceListChange() {
  if (!isRetailB2b.value) return
  salesOrderStore.clearSellableProductCache()
  for (const item of form.value?.salesOrderItems || []) {
    clearLineProduct(item)
  }
  uiErrors.value.priceListId = ''
  const warehouseIds = [...new Set(
    (form.value?.salesOrderItems || [])
      .map((i) => i.warehouseId)
      .filter((id) => id != null && Number(id) > 0)
      .map(Number)
  )]
  await Promise.all(warehouseIds.map((warehouseId) => refreshOrderProducts(warehouseId)))
}

async function onWarehouseChange(index) {
  const item = form.value.salesOrderItems[index]
  if (!item) return
  if (isRetailB2b.value) {
    if (!form.value?.priceListId) {
      clearLineProduct(item)
      return
    }
    const previousProductId = item.productId
    await refreshOrderProducts(item.warehouseId)
    const available = productsForLine(item)
    const stillAvailable = available.some((p) => Number(p.id) === Number(previousProductId))
    if (previousProductId && !stillAvailable) {
      clearLineProduct(item)
    } else if (item.productId) {
      applyPriceFromSelectedProduct(index)
    }
    return
  }
  if (item.productId) updateStockInfo(index)
}

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
  const stockHint = option.availableQty != null ? ` · stok ${Math.floor(option.availableQty)}` : ''
  return partNumber ? `${name} | ${partNumber}${stockHint}` : `${name}${stockHint}`
}

const calculateSubtotal = (index) => {
  const item = form.value.salesOrderItems[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

function applyPriceFromSelectedProduct(index) {
  const item = form.value.salesOrderItems[index]
  const selected = productsForLine(item).find(p => p.id === item.productId)
  if (!selected) return
  item.unitId = selected.unitId || selected.unit_id || null
  const official = Number(selected.officialUnitPrice ?? selected.priceSell) || 0
  if (!(official > 0)) {
    item.price = 0
    item.priceError = 'Produk tidak memiliki harga pada Pricing terpilih.'
    item.priceSource = ''
  } else {
    item.price = official
    item.priceError = ''
    item.priceSource = selected.priceListCode
      ? `Harga resmi ${selected.priceListCode}`
      : 'Harga resmi RETAIL'
  }
  item.stock = { quantity: Number(selected.availableQty) || 0 }
  calculateSubtotal(index)
}

const onProductChange = async (index) => {
  const item = form.value.salesOrderItems[index]
  const pool = productsForLine(item)
  const selected = pool.find(p => p.id === item.productId)
  if (!selected) return
  item.unitId = selected.unitId || selected.unit_id || null
  item.priceError = ''
  item.priceSource = ''
  if (isRetailB2b.value) {
    applyPriceFromSelectedProduct(index)
    return
  }
  item.price = Number(selected.priceSell) || 0
  calculateSubtotal(index)
  if (item.warehouseId) updateStockInfo(index)
}

async function repriceRetailB2bItems() {
  if (!isRetailB2b.value || !form.value?.priceListId || !form.value?.salesOrderItems?.length) return
  const items = form.value.salesOrderItems.filter((item) => item.productId)
  if (!items.length) return
  // Prefer prices already loaded with sellable catalog (no extra request).
  for (const item of items) {
    const selected = productsForLine(item).find(p => Number(p.id) === Number(item.productId))
    if (selected && Number(selected.officialUnitPrice ?? selected.priceSell) > 0) {
      item.unitId = selected.unitId || item.unitId
      item.price = Number(selected.officialUnitPrice ?? selected.priceSell)
      item.priceError = ''
      item.priceSource = selected.priceListCode
        ? `Harga resmi ${selected.priceListCode}`
        : 'Harga resmi RETAIL'
      item.stock = { quantity: Number(selected.availableQty) || 0 }
      item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
      continue
    }
    item.price = 0
    item.priceError = 'Produk tidak ada pada Pricing terpilih atau stok gudang habis.'
    item.priceSource = ''
    item.subtotal = 0
  }
}

const onQuantityChange = (index) => {
  calculateSubtotal(index)
}

const getStockDisplay = (stock) => {
  if (!stock || stock.quantity === undefined || stock.quantity === null) return '—'
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
  try {
    form.value.perusahaanId = requireCompanyId()
  } catch {
    uiErrors.value.perusahaanId = activeCompanyMissing.value || 'Active Company wajib dipilih.'
    goToId('so-tabs-info')
    return
  }
  if (isRetailB2b.value) {
    form.value.quotationId = null
  }
  const ok = await salesOrderStore.saveSalesOrder()
  if (ok) {
    navigateTo('/sales/sales-order')
    return
  }
  routeSaveFailure(salesOrderStore.validationErrors, uiErrors.value, SO_FIELD_TABS, goToId)
}

watch(() => form.value.customerId, async (newCustomerId) => {
  if (isRetailB2b.value) return
  if (newCustomerId) await salesOrderStore.fetchProductsForCustomer(newCustomerId)
})

watch(isRetailB2b, async (isRetail) => {
  if (isRetail && form.value) form.value.quotationId = null
  if (isRetail) {
    await salesOrderStore.fetchRetailPriceListOptions({ pricingDate: form.value?.date })
    const warehouseId = form.value?.salesOrderItems?.[0]?.warehouseId ?? null
    if (form.value?.priceListId && warehouseId) {
      await refreshOrderProducts(warehouseId)
    }
  } else if (form.value?.customerId) {
    await salesOrderStore.fetchProductsForCustomer(form.value.customerId)
  }
}, { immediate: true })

watch(
  () => [form.value?.date, companyContextStore.companyId],
  async () => {
    if (!isRetailB2b.value) return
    await salesOrderStore.fetchRetailPriceListOptions({ pricingDate: form.value?.date })
    const stillValid = retailPriceLists.value.some((p) => Number(p.id) === Number(form.value?.priceListId))
    if (form.value?.priceListId && !stillValid) {
      form.value.priceListId = null
      salesOrderStore.clearSellableProductCache()
      for (const item of form.value?.salesOrderItems || []) clearLineProduct(item)
      return
    }
    salesOrderStore.clearSellableProductCache()
    const warehouseIds = [...new Set(
      (form.value?.salesOrderItems || [])
        .map((i) => i.warehouseId)
        .filter((id) => id != null && Number(id) > 0)
        .map(Number)
    )]
    await Promise.all(warehouseIds.map((warehouseId) => refreshOrderProducts(warehouseId)))
    repriceRetailB2bItems()
  }
)

onMounted(async () => {
  await ensureBootstrapped()
  const bootstraps = [
    customerStore.fetchCustomers(),
    cabangStore.fetchCabangs(),
    warehouseStore.fetchWarehouses(),
    salesOrderStore.fetchSalesOrders(true),
  ]
  if (!isRetailB2b.value) {
    bootstraps.push(quotationStore.fetchQuotations())
  } else {
    bootstraps.push(salesOrderStore.fetchRetailPriceListOptions({ pricingDate: form.value?.date }))
  }
  await Promise.all(bootstraps)

  const id = route.params.id ? String(route.params.id) : null
  if (id) {
    await salesOrderStore.openModal({ id }, 'admin')
    salesOrderStore.showModal = false
  } else {
    await salesOrderStore.openModal(null, 'admin')
    salesOrderStore.showModal = false
  }
  try {
    form.value.perusahaanId = requireCompanyId()
  } catch {
    form.value.perusahaanId = null
  }
  if (isRetailB2b.value) {
    form.value.quotationId = null
    await salesOrderStore.fetchRetailPriceListOptions({ pricingDate: form.value?.date })
    const warehouseIds = [...new Set(
      (form.value?.salesOrderItems || [])
        .map((i) => i.warehouseId)
        .filter((wid) => wid != null && Number(wid) > 0)
        .map(Number)
    )]
    if (form.value?.priceListId) {
      await Promise.all(warehouseIds.map((warehouseId) => refreshOrderProducts(warehouseId)))
      repriceRetailB2bItems()
    }
  }
})
</script>
