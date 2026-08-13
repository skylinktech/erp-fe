<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div v-if="!formReady && loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <NuxtLink to="/purchasing/purchase-request" class="text-muted small text-decoration-none">
                Purchase Request
              </NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/purchasing/purchase-request" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card pr-form-card shadow-sm border-0">
              <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 border-0 bg-transparent">
                <h5 class="card-title mb-0">Form Purchase Request</h5>
                <span class="text-muted small">Informasi header &amp; daftar item</span>
              </div>
              <div class="card-body pt-0">
                <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
                  <TabbedFormNav
                    :steps="visibleSteps"
                    :current-index="currentIndex"
                    :disabled="navigating || saving"
                    nav-class="mb-0"
                    @select="goTo"
                  />

                  <div class="tab-content pt-4">
                    <div id="pr-tab-info" data-step-id="pr-tab-info" :class="paneClass('pr-tab-info')">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Request</label>
                        <div class="col-sm-9">
                          <input v-model="form.requestDate" type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Dibutuhkan</label>
                        <div class="col-sm-9">
                          <input v-model="form.neededDate" type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Prioritas</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.priority" :options="priorityOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Prioritas" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Mata Uang</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.currency" :options="currencyOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Departemen</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.departmentId" :options="departemens" :get-option-label="(d) => d?.nm_departemen || d?.nmDepartemen || ''" :reduce="(d) => d?.id" searchable clearable placeholder="Pilih departemen" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Budget</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.budgetId" :options="budgets" :get-option-label="budgetLabel" :reduce="(b) => b?.id" searchable clearable placeholder="Pilih budget" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Gudang (default)</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.warehouseId" :options="warehouses" :get-option-label="warehouseLabel" :reduce="(w) => w?.id" searchable clearable placeholder="Gudang utama PR" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Keperluan / Tujuan</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.purpose" class="form-control" rows="2" placeholder="Contoh: Permintaan ATK ruang HRD Q2"></textarea>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Catatan</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Catatan tambahan"></textarea>
                        </div>
                      </div>
                    </div>

                    <div id="pr-tab-items" data-step-id="pr-tab-items" :class="paneClass('pr-tab-items')">
                      <div v-if="uiErrors.purchaseRequestItems || uiErrors.productName || uiErrors.quantity" class="alert alert-danger py-2 mb-3">
                        <i class="ri-error-warning-line me-1"></i>{{ uiErrors.purchaseRequestItems || uiErrors.productName || uiErrors.quantity }}
                      </div>
                      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                        <p class="mb-0 text-muted small flex-grow-1" style="min-width: 0">
                          Isi nama barang/jasa, qty, satuan, dan harga estimasi. Untuk tipe <strong>Barang</strong> dengan produk katalog, stok dicek per gudang.
                        </p>
                        <button
                          type="button"
                          class="btn btn-primary btn-sm text-nowrap flex-shrink-0"
                          @click="purchaseRequestStore.addItem()"
                        >
                          <i class="ri-add-line me-1"></i>Tambah Item
                        </button>
                      </div>

                      <StockAvailabilityAlert
                        v-if="showStockAlert"
                        class="mb-4"
                        :result="stockResult"
                        :loading="stockLoading"
                        :error="stockError"
                        :show-create-po-button="showCreatePoButton"
                        :purchase-request-id="purchaseRequestId"
                        :notify-on-sufficient="false"
                      />

                      <PrFormStockSummary
                        v-if="hasProductCatalogItems"
                        :items="form.purchaseRequestItems"
                        :default-warehouse-id="form.warehouseId"
                        :stock-map="stockMap"
                        :products="products"
                        :warehouses="warehouses"
                      />

                      <div v-if="!form.purchaseRequestItems.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-inbox-line fs-3 d-block mb-2"></i>
                        Belum ada item. Klik <strong>Tambah Item</strong> untuk menambah baris.
                      </div>

                      <div
                        v-for="(row, idx) in form.purchaseRequestItems"
                        :key="idx"
                        class="pr-item-block border rounded mb-3"
                      >
                        <div class="pr-item-block__head d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                          <span class="d-flex align-items-center gap-2 flex-wrap">
                            <span class="fw-medium text-primary">Item #{{ idx + 1 }}</span>
                            <span
                              v-if="row.productType === 'product' && row.productId"
                              :class="['badge', itemStockBadgeClass(idx)]"
                            >
                              {{ itemStockBadgeText(idx) }}
                            </span>
                          </span>
                          <button
                            type="button"
                            class="btn btn-sm btn-icon btn-text-danger"
                            title="Hapus item"
                            @click="purchaseRequestStore.removeDetail(idx)"
                          >
                            <i class="ri-delete-bin-7-line"></i>
                          </button>
                        </div>
                        <div class="p-3">
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Tipe</label>
                            <div class="col-sm-9">
                              <CustomSelect2 v-model="row.productType" :options="productTypeOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Produk katalog</label>
                            <div class="col-sm-9">
                              <CustomSelect2 v-model="row.productId" :options="products" :get-option-label="productLabel" :reduce="(p) => p?.id" searchable clearable placeholder="Opsional — pilih dari master produk" @update:modelValue="(id) => onProductSelect(idx, id)" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <FormLabel required label-class="col-sm-3 col-form-label">Nama barang/jasa</FormLabel>
                            <div class="col-sm-9">
                              <input v-model="row.productName" type="text" class="form-control" placeholder="Nama barang atau jasa" aria-required="true" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Gudang</label>
                            <div class="col-sm-9">
                              <CustomSelect2
                                v-model="row.warehouseId"
                                :options="warehouses"
                                :get-option-label="warehouseLabel"
                                :reduce="(w) => w?.id"
                                searchable
                                clearable
                                placeholder="Opsional — kosongkan untuk pakai gudang default PR"
                              />
                            </div>
                          </div>

                          <div v-if="row.productType === 'product'" class="row mb-3">
                            <div class="col-sm-9 offset-sm-3">
                              <PrItemStockInfo
                                :product-type="row.productType"
                                :product-id="row.productId"
                                :warehouse-id="row.warehouseId"
                                :default-warehouse-id="form.warehouseId"
                                :qty="row.qty"
                                :stock-map="stockMap"
                                :warehouses="warehouses"
                              />
                            </div>
                          </div>

                          <div class="row mb-3">
                            <FormLabel required label-class="col-sm-3 col-form-label">Qty</FormLabel>
                            <div class="col-sm-9 col-md-4">
                              <input v-model.number="row.qty" type="number" min="0.01" step="0.01" class="form-control" aria-required="true" @input="purchaseRequestStore.onQtyOrPriceChange(idx)" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Satuan</label>
                            <div class="col-sm-9 col-md-6">
                              <CustomSelect2 v-model="row.uomId" :options="units" :get-option-label="unitLabel" :reduce="(u) => u?.id" searchable clearable placeholder="Pilih satuan" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Harga estimasi</label>
                            <div class="col-sm-9 col-md-6">
                              <input type="text" class="form-control" :value="formatRupiah(row.estimatedPrice)" placeholder="0" @input="onPriceInput(idx, $event)" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Subtotal</label>
                            <div class="col-sm-9 col-md-6">
                              <input type="text" class="form-control bg-lighter" :value="formatRupiah(row.subtotal)" readonly tabindex="-1" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Spesifikasi</label>
                            <div class="col-sm-9">
                              <input v-model="row.specification" type="text" class="form-control" placeholder="Merk, model, atau detail teknis" />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Tgl dibutuhkan</label>
                            <div class="col-sm-9 col-md-6">
                              <input v-model="row.neededDate" type="date" class="form-control" />
                            </div>
                          </div>
                          <div class="row mb-0">
                            <label class="col-sm-3 col-form-label">Catatan item</label>
                            <div class="col-sm-9">
                              <input v-model="row.remarks" type="text" class="form-control" placeholder="Catatan untuk baris ini" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-if="form.purchaseRequestItems.length" class="d-flex justify-content-end pt-3 mt-2 border-top">
                        <span class="fw-semibold text-primary fs-5">Total estimasi: {{ formatRupiah(grandTotal) }}</span>
                      </div>
                    </div>
                  </div>

                  <TabbedFormActions
                    :is-first-step="isFirstStep"
                    :is-last-step="isLastStep"
                    :loading="navigating"
                    :saving="saving"
                    cancel-href="/purchasing/purchase-request"
                    @next="next"
                    @previous="previous"
                  />
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-12">
            <FormPageSidebar
              summary-title="Ringkasan PR"
              summary-icon="ri-file-list-3-line"
              :summary-rows="summaryRows"
              nav-title="Modul Purchasing"
              :nav-items="PURCHASING_MODULE_NAV"
            >
              <template #append>
                <div v-if="stockSidebarSummary" class="card border-0 shadow-sm mb-4">
                  <div class="card-body small">
                    <strong class="d-flex align-items-center gap-1 mb-2">
                      <i class="ri-stack-line text-primary"></i>
                      Status stok
                    </strong>
                    <dl class="row mb-0">
                      <dt class="col-6 text-muted">Item barang</dt>
                      <dd class="col-6 mb-2">{{ stockSidebarSummary.total }}</dd>
                      <dt class="col-6 text-muted">Stok cukup</dt>
                      <dd class="col-6 mb-2 text-success">{{ stockSidebarSummary.sufficient }}</dd>
                      <dt class="col-6 text-muted">Stok kurang/kosong</dt>
                      <dd class="col-6 mb-2 text-danger">{{ stockSidebarSummary.shortage }}</dd>
                      <dt class="col-6 text-muted">Belum dicek</dt>
                      <dd class="col-6 mb-0">{{ stockSidebarSummary.pending }}</dd>
                    </dl>
                    <button
                      v-if="showCreatePoButton && purchaseRequestId"
                      type="button"
                      class="btn btn-primary btn-sm w-100 mt-3"
                      @click="navigateTo({ path: '/purchasing/purchase-order/form', query: { fromPurchaseRequestId: purchaseRequestId } })"
                    >
                      <i class="ri-shopping-cart-line me-1"></i>Tambah PO
                    </button>
                  </div>
                </div>
                <div class="card border-0 bg-label-primary">
                  <div class="card-body small">
                    <strong class="d-flex align-items-center gap-1 mb-2">
                      <i class="ri-lightbulb-line"></i>
                      Tips
                    </strong>
                    <ul class="mb-0 ps-3">
                      <li>Pilih <strong>Budget</strong> yang sesuai cost center departemen.</li>
                      <li>Setelah disimpan sebagai draft, submit PR untuk proses approval.</li>
                      <li>Item bertipe <strong>Barang</strong> + produk katalog menampilkan stok real-time per gudang.</li>
                    </ul>
                  </div>
                </div>
              </template>
            </FormPageSidebar>
          </div>
        </div>
      </template>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePurchaseRequestStore } from '~/stores/purchase-request'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { routeSaveFailure } from '~/utils/apiError'
import FormPageSidebar from '~/components/form/FormPageSidebar.vue'
import StockAvailabilityAlert from '~/components/purchasing/StockAvailabilityAlert.vue'
import PrItemStockInfo from '~/components/purchase-request/PrItemStockInfo.vue'
import PrFormStockSummary from '~/components/purchase-request/PrFormStockSummary.vue'
import { PURCHASING_MODULE_NAV } from '~/constants/purchasing/formNav'
import { usePurchaseRequestStockAvailability } from '~/composables/usePurchaseRequestStockAvailability'
import { usePurchaseRequestFormStockAvailability } from '~/composables/usePurchaseRequestFormStockAvailability'
import { buildStockMap, getStockInfoForLine, stockLineBadgeClass, stockLineBadgeLabel } from '~/utils/purchasing/stockAvailability'
import { usePermissions } from '~/composables/usePermissions'
import type { FormPageSummaryRow } from '~/types/form-page'

const route = useRoute()
const purchaseRequestStore = usePurchaseRequestStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()

const { form, isEditMode, loading, saving } = storeToRefs(purchaseRequestStore)
const formRoot = ref<HTMLFormElement | null>(null)
const uiErrors = ref<Record<string, string>>({})
const formSteps = [
  { id: 'pr-tab-info', label: 'Informasi', icon: 'ri-information-line' },
  { id: 'pr-tab-items', label: 'Item', icon: 'ri-box-3-line' },
]
function validatePurchaseRequestStep(step: { id: string }): boolean {
  uiErrors.value = {}
  if (step.id !== 'pr-tab-items') return true
  const items = form.value?.purchaseRequestItems || []
  const validItems = items.filter((i) => String(i.productName || '').trim() && Number(i.qty) > 0)
  if (validItems.length < 1) {
    const hasNameNoQty = items.some((i) => String(i.productName || '').trim() && !(Number(i.qty) > 0))
    const hasQtyNoName = items.some((i) => Number(i.qty) > 0 && !String(i.productName || '').trim())
    if (hasNameNoQty) uiErrors.value.quantity = 'Quantity minimal 1.'
    else if (hasQtyNoName) uiErrors.value.productName = 'Nama barang/jasa wajib diisi.'
    else uiErrors.value.purchaseRequestItems = 'Minimal satu item harus ditambahkan.'
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
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validatePurchaseRequestStep })
const PR_FIELD_TABS: Record<string, string> = {
  departmentId: 'pr-tab-info',
  neededDate: 'pr-tab-info',
  purchaseRequestItems: 'pr-tab-items',
  productName: 'pr-tab-items',
  quantity: 'pr-tab-items',
}
const formReady = ref(false)
const stockMap = ref<Map<string, number>>(new Map())
const products = ref<any[]>([])
const warehouses = ref<any[]>([])
const departemens = ref<any[]>([])
const budgets = ref<any[]>([])
const units = ref<any[]>([])

const purchaseRequestId = computed(() => (route.params.id ? String(route.params.id) : null))
const useApiStockCheck = computed(
  () => formReady.value && isEditMode.value && form.value?.status === 'approved' && !!purchaseRequestId.value
)

const apiStockAvailability = usePurchaseRequestStockAvailability(purchaseRequestId, {
  enabled: useApiStockCheck,
})

const localStockAvailability = usePurchaseRequestFormStockAvailability(
  form,
  stockMap,
  products,
  warehouses,
  { enabled: computed(() => formReady.value && !useApiStockCheck.value) }
)

const stockResult = computed(() =>
  useApiStockCheck.value ? apiStockAvailability.result.value : localStockAvailability.result.value
)
const stockLoading = computed(() =>
  useApiStockCheck.value ? apiStockAvailability.loading.value : false
)
const stockError = computed(() =>
  useApiStockCheck.value ? apiStockAvailability.error.value : null
)

const showStockAlert = computed(() => {
  if (!formReady.value) return false
  if (useApiStockCheck.value) {
    return !!apiStockAvailability.result.value?.hasStockableItems
  }
  return hasProductCatalogItems.value
})

const showCreatePoButton = computed(
  () =>
    (userHasRole('superadmin') || userHasPermission('create_purchase_order')) &&
    form.value?.status === 'approved' &&
    !!stockResult.value?.hasShortage
)

const hasProductCatalogItems = computed(() =>
  (form.value?.purchaseRequestItems ?? []).some(
    (row) => row.productType === 'product' && row.productId
  )
)

const stockSidebarSummary = computed(() => {
  if (!hasProductCatalogItems.value) return null
  let sufficient = 0
  let shortage = 0
  let pending = 0
  for (const row of form.value.purchaseRequestItems ?? []) {
    if (row.productType !== 'product' || !row.productId) continue
    const whId = row.warehouseId ?? form.value.warehouseId ?? null
    const info = getStockInfoForLine(stockMap.value, row.productId, whId, row.qty ?? 0)
    if (info.status === 'pending') pending++
    else if (info.status === 'sufficient') sufficient++
    else shortage++
  }
  return {
    total: sufficient + shortage + pending,
    sufficient,
    shortage,
    pending,
  }
})

const grandTotal = computed(() => purchaseRequestStore.formGrandTotal)
const itemCount = computed(() => form.value?.purchaseRequestItems?.length ?? 0)

const pageTitle = computed(() => (isEditMode.value ? 'Edit Purchase Request' : 'Tambah Purchase Request'))
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Perbarui permintaan barang internal.'
    : 'Buat permintaan barang/jasa baru dengan relasi budget dan gudang.'
)

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]
const currencyOptions = [
  { label: 'IDR', value: 'IDR' },
  { label: 'USD', value: 'USD' },
]
const productTypeOptions = [
  { label: 'Barang', value: 'product' },
  { label: 'Jasa', value: 'service' },
]

const budgetStatusLabel: Record<string, string> = {
  draft: 'Draft',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  received: 'Diterima',
}

function productLabel(p: any) {
  if (!p) return ''
  const sku = p.sku ? `${p.sku} — ` : ''
  return `${sku}${p.name || ''}`
}
function warehouseLabel(w: any) {
  if (!w) return ''
  return `${w.name || ''}${w.code ? ` (${w.code})` : ''}`
}
function budgetLabel(b: any) {
  if (!b) return ''
  const code = b.budgetCode ?? b.budget_code ?? ''
  const name = b.budgetName ?? b.budget_name ?? ''
  const status = b.status ? budgetStatusLabel[b.status] ?? b.status : ''
  const main = code ? `${code} — ${name}` : name
  return status ? `${main} · ${status}` : main
}
function unitLabel(u: any) {
  if (!u) return ''
  return u.symbol ? `${u.name} (${u.symbol})` : u.name || ''
}

function formatDateId(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function findDepartemenName(id: number | null | undefined): string {
  if (!id) return '—'
  const d = departemens.value.find((x) => Number(x.id) === Number(id))
  return d?.nm_departemen || d?.nmDepartemen || '—'
}

function findBudgetName(id: number | null | undefined): string {
  if (!id) return '—'
  const b = budgets.value.find((x) => Number(x.id) === Number(id))
  return b ? budgetLabel(b) : '—'
}

function findWarehouseName(id: number | null | undefined): string {
  if (!id) return '—'
  const w = warehouses.value.find((x) => Number(x.id) === Number(id))
  return w ? warehouseLabel(w) : '—'
}

const summaryRows = computed<FormPageSummaryRow[]>(() => {
  const f = form.value
  const priority = priorityOptions.find((p) => p.value === f.priority)?.label ?? f.priority ?? '—'
  return [
    { label: 'Mode', value: isEditMode.value ? 'Edit' : 'Baru' },
    { label: 'Tgl request', value: formatDateId(f.requestDate) },
    { label: 'Dibutuhkan', value: formatDateId(f.neededDate) },
    { label: 'Prioritas', value: priority },
    { label: 'Departemen', value: findDepartemenName(f.departmentId) },
    { label: 'Budget', value: findBudgetName(f.budgetId) },
    { label: 'Gudang', value: findWarehouseName(f.warehouseId) },
    { label: 'Mata uang', value: f.currency || 'IDR' },
    { label: 'Jumlah item', value: String(itemCount.value) },
    { label: 'Total estimasi', value: formatRupiah(grandTotal.value) },
  ]
})

function onProductSelect(index: number, productId: number | null) {
  const product = products.value.find((p) => p.id === productId)
  purchaseRequestStore.onProductChange(index, product ?? null)
}

function onPriceInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const row = form.value.purchaseRequestItems[index]
  if (row) {
    row.estimatedPrice = Number(raw) || 0
    purchaseRequestStore.onQtyOrPriceChange(index)
  }
}

function itemStockInfo(index: number) {
  const row = form.value.purchaseRequestItems?.[index]
  if (!row || row.productType !== 'product' || !row.productId) {
    return { status: 'pending' as const }
  }
  const whId = row.warehouseId ?? form.value.warehouseId ?? null
  return getStockInfoForLine(stockMap.value, row.productId, whId, row.qty ?? 0)
}

function itemStockBadgeClass(index: number) {
  const info = itemStockInfo(index)
  if (info.status === 'pending') return 'bg-label-secondary'
  return stockLineBadgeClass(info.status)
}

function itemStockBadgeText(index: number) {
  return stockLineBadgeLabel(itemStockInfo(index).status)
}

async function loadStockMap() {
  const { $api } = useNuxtApp()
  try {
    const response = await fetch($api.dataStock(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (response.ok) {
      const j = await response.json()
      const rows = Array.isArray(j) ? j : (j.data ?? [])
      stockMap.value = buildStockMap(rows)
    }
  } catch {
    stockMap.value = new Map()
  }
}

async function loadMasterData() {
  const { $api } = useNuxtApp()
  const headers = { Accept: 'application/json' }
  const [prodRes, whRes, depRes, budRes, unitRes] = await Promise.all([
    fetch($api.dataProduct('internal'), { headers, credentials: 'include' }),
    fetch($api.dataWarehouse(), { headers, credentials: 'include' }),
    fetch($api.dataDepartemen(), { headers, credentials: 'include' }),
    fetch($api.dataBudget(), { headers, credentials: 'include' }),
    fetch(`${$api.unit()}?rows=200`, { headers, credentials: 'include' }),
    loadStockMap(),
  ])
  if (prodRes.ok) {
    const j = await prodRes.json()
    products.value = Array.isArray(j) ? j : (j.data ?? [])
  }
  if (whRes.ok) {
    const j = await whRes.json()
    warehouses.value = Array.isArray(j) ? j : (j.data ?? [])
  }
  if (depRes.ok) {
    const j = await depRes.json()
    departemens.value = Array.isArray(j) ? j : (j.data ?? j)
  }
  if (budRes.ok) {
    const j = await budRes.json()
    budgets.value = Array.isArray(j) ? j : (j.data ?? [])
  }
  if (unitRes.ok) {
    const j = await unitRes.json()
    units.value = j.data ?? (Array.isArray(j) ? j : [])
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
  const ok = await purchaseRequestStore.savePurchaseRequest()
  if (ok) {
    navigateTo('/purchasing/purchase-request')
    return
  }
  routeSaveFailure(purchaseRequestStore.validationErrors, uiErrors.value, PR_FIELD_TABS, goToId)
}

onMounted(async () => {
  formReady.value = false
  purchaseRequestStore.loading = false
  purchaseRequestStore.saving = false
  try {
    await loadMasterData()
    const id = route.params.id ? String(route.params.id) : null
    if (id) {
      await purchaseRequestStore.fetchPurchaseRequestForEdit(id)
      purchaseRequestStore.showModal = false
    } else {
      purchaseRequestStore.openModal(null)
      purchaseRequestStore.showModal = false
      purchaseRequestStore.addItem()
    }
  } finally {
    purchaseRequestStore.loading = false
    formReady.value = true
  }
})
</script>

<style scoped>
.pr-form-card {
  border: 1px solid var(--bs-border-color, #e4e6ef);
}

.pr-item-block {
  background: var(--bs-body-bg, #fff);
  border-color: var(--bs-border-color, #e4e6ef) !important;
}

.pr-item-block__head {
  background: rgba(var(--bs-primary-rgb, 105, 108, 255), 0.04);
}

.pr-item-block .col-form-label {
  font-weight: 500;
  color: var(--bs-heading-color, #566a7f);
}

.bg-lighter {
  background-color: rgba(var(--bs-body-color-rgb, 67, 89, 113), 0.06);
}
</style>
