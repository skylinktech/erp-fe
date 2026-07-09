<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div v-if="!formReady && loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <NuxtLink to="/purchasing/purchase-order" class="text-muted small text-decoration-none">
                Purchase Order
              </NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/purchasing/purchase-order" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <StockAvailabilityAlert
          v-if="fromPurchaseRequestId"
          class="mb-4"
          :result="prStockResult"
          :loading="prStockLoading"
          :error="prStockError"
          :show-create-po-button="false"
          :purchase-request-id="fromPurchaseRequestId"
          :notify-on-sufficient="!isEditMode"
        />

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card po-form-card shadow-sm border-0">
              <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 border-0 bg-transparent">
                <h5 class="card-title mb-0">Form Purchase Order</h5>
                <span class="text-muted small">Informasi header &amp; daftar produk</span>
              </div>
              <div class="card-body pt-0">
                <form @submit.prevent="handleSubmit">
                  <ul class="nav nav-tabs mb-0" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#po-tab-info">
                        <i class="ri-information-line me-1"></i>Informasi
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#po-tab-items">
                        <i class="ri-shopping-cart-line me-1"></i>
                        Item
                        <span v-if="itemCount" class="badge bg-primary ms-1">{{ itemCount }}</span>
                      </button>
                    </li>
                  </ul>

                  <div class="tab-content pt-4">
                    <div id="po-tab-info" class="tab-pane fade show active">
                      <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label mb-0">Tipe PO</label>
                        <div class="col-sm-9">
                          <div class="po-type-options d-flex flex-wrap align-items-center gap-4">
                            <label class="po-type-option" for="po-type-internal">
                              <input
                                id="po-type-internal"
                                class="form-check-input"
                                type="radio"
                                name="poType"
                                value="internal"
                                :checked="form.poType === 'internal'"
                                @change="handlePoTypeChange('internal')"
                              />
                              <span>Internal</span>
                            </label>
                            <label class="po-type-option" for="po-type-external">
                              <input
                                id="po-type-external"
                                class="form-check-input"
                                type="radio"
                                name="poType"
                                value="external"
                                :checked="form.poType === 'external'"
                                @change="handlePoTypeChange('external')"
                              />
                              <span>External</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div v-if="isExternalPO" class="row mb-3">
                        <label class="col-sm-3 col-form-label">Nama Perusahaan External</label>
                        <div class="col-sm-9">
                          <input v-model="form.extNamaPerusahaan" type="text" class="form-control" placeholder="Nama perusahaan pihak ketiga" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Vendor</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.vendorId"
                            :options="vendors"
                            :get-option-label="vendorLabel"
                            :reduce="(v) => v?.id"
                            searchable
                            clearable
                            placeholder="Pilih vendor"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Untuk Perhatian</label>
                        <div class="col-sm-9">
                          <input v-model="form.up" type="text" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal PO</label>
                        <div class="col-sm-9 col-md-6">
                          <input v-model="form.date" type="date" class="form-control" required />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Jatuh Tempo</label>
                        <div class="col-sm-9 col-md-6">
                          <input v-model="form.dueDate" type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Term Of Payment</label>
                        <div class="col-sm-9">
                          <input v-model="form.termOfPayment" type="text" class="form-control" />
                        </div>
                      </div>
                      <div v-if="!isExternalPO" class="row mb-3">
                        <label class="col-sm-3 col-form-label">Perusahaan</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.perusahaanId"
                            :options="perusahaans"
                            :get-option-label="perusahaanLabel"
                            :reduce="(p) => p?.id"
                            searchable
                            clearable
                            placeholder="Pilih perusahaan"
                          />
                        </div>
                      </div>
                      <div v-if="!isExternalPO" class="row mb-3">
                        <label class="col-sm-3 col-form-label">Cabang</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.cabangId"
                            :options="filteredCabangs"
                            :get-option-label="cabangLabel"
                            :reduce="(c) => c?.id"
                            searchable
                            clearable
                            placeholder="Pilih cabang"
                            :disabled="!form.perusahaanId"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Discount (%)</label>
                        <div class="col-sm-9 col-md-4">
                          <input v-model.number="form.discountPercent" type="number" min="0" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tax (%)</label>
                        <div class="col-sm-9 col-md-4">
                          <input v-model.number="form.taxPercent" type="number" min="0" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Attachment</label>
                        <div class="col-sm-9">
                          <input
                            type="file"
                            class="form-control"
                            accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp,.svg"
                            @change="onFileChange"
                          />
                          <div v-if="form.attachmentPreview" class="mt-2">
                            <a :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer">Lihat attachment</a>
                            <img
                              v-if="isImageFile(form.attachmentPreview)"
                              :src="form.attachmentPreview"
                              alt="Preview"
                              class="d-block mt-2 rounded border"
                              style="height: 60px; max-width: 120px; object-fit: contain"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">TTD Digital</label>
                        <div class="col-sm-9">
                          <div class="form-check form-switch mt-1">
                            <input id="poTtdDigital" v-model="form.ttdDigital" class="form-check-input" type="checkbox" />
                            <label class="form-check-label" for="poTtdDigital">Aktifkan tanda tangan digital</label>
                          </div>
                        </div>
                      </div>
                      <div class="row mb-0">
                        <label class="col-sm-3 col-form-label">Deskripsi</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.description" class="form-control" rows="2"></textarea>
                        </div>
                      </div>
                    </div>

                    <div id="po-tab-items" class="tab-pane fade">
                      <div class="d-flex justify-content-between align-items-center mb-4">
                        <p class="mb-0 text-muted small">Tambah produk, qty, dan harga per baris.</p>
                        <button type="button" class="btn btn-sm btn-primary" @click="purchaseOrderStore.addItem()">
                          <i class="ri-add-line me-1"></i>Tambah Item
                        </button>
                      </div>

                      <div v-if="!form.purchaseOrderItems?.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-inbox-line fs-3 d-block mb-2"></i>
                        Belum ada item. Klik <strong>Tambah Item</strong> untuk menambah baris.
                      </div>

                      <div
                        v-for="(row, idx) in form.purchaseOrderItems"
                        :key="idx"
                        class="po-item-block border rounded mb-3"
                      >
                        <div class="po-item-block__head d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                          <span class="fw-medium text-primary">Item #{{ idx + 1 }}</span>
                          <button
                            type="button"
                            class="btn btn-sm btn-icon btn-text-danger"
                            title="Hapus item"
                            @click="purchaseOrderStore.removeItem(idx)"
                          >
                            <i class="ri-delete-bin-7-line"></i>
                          </button>
                        </div>
                        <div class="p-3">
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
                                placeholder="Opsional"
                                @update:modelValue="() => onWarehouseChange(idx)"
                              />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Produk</label>
                            <div class="col-sm-9">
                              <CustomSelect2
                                v-model="row.productId"
                                :options="productsForRow(row.warehouseId)"
                                :get-option-label="productLabel"
                                :reduce="(p) => p?.id"
                                searchable
                                clearable
                                placeholder="Pilih produk"
                                @update:modelValue="() => onProductChange(idx)"
                              />
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Qty</label>
                            <div class="col-sm-9 col-md-4">
                              <input
                                v-model.number="row.quantity"
                                type="number"
                                min="0.01"
                                step="0.01"
                                class="form-control"
                                @input="onQuantityChange(idx)"
                              />
                              <div
                                v-if="row.productId && row.warehouseId"
                                class="form-text"
                                :class="lineStockHint(idx).class"
                              >
                                <i :class="lineStockHint(idx).icon" class="me-1"></i>{{ lineStockHint(idx).text }}
                              </div>
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">Harga</label>
                            <div class="col-sm-9 col-md-6">
                              <input
                                type="text"
                                class="form-control"
                                :value="formatRupiah(row.price)"
                                placeholder="0"
                                @input="onPriceInput(idx, $event)"
                              />
                            </div>
                          </div>
                          <div class="row mb-0">
                            <label class="col-sm-3 col-form-label">Subtotal</label>
                            <div class="col-sm-9 col-md-6">
                              <input type="text" class="form-control bg-lighter" :value="formatRupiah(row.subtotal)" readonly tabindex="-1" />
                            </div>
                          </div>
                          <div class="row mt-3 mb-0">
                            <label class="col-sm-3 col-form-label">Deskripsi item</label>
                            <div class="col-sm-9">
                              <input v-model="row.description" type="text" class="form-control" placeholder="Catatan baris" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-if="form.purchaseOrderItems?.length" class="d-flex justify-content-end pt-3 mt-2 border-top">
                        <span class="fw-semibold text-primary fs-5">Grand total: {{ formatRupiah(grandTotal) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
                    <NuxtLink to="/purchasing/purchase-order" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-12">
            <FormPageSidebar
              summary-title="Ringkasan PO"
              summary-icon="ri-shopping-cart-line"
              :summary-rows="summaryRows"
              nav-title="Modul Purchasing"
              :nav-items="PURCHASING_MODULE_NAV"
            >
              <template #append>
                <div class="card border-0 bg-label-primary">
                  <div class="card-body small">
                    <strong class="d-flex align-items-center gap-1 mb-2">
                      <i class="ri-lightbulb-line"></i>
                      Tips
                    </strong>
                    <ul class="mb-0 ps-3">
                      <li><strong>Internal</strong>: pilih perusahaan &amp; cabang grup.</li>
                      <li><strong>External</strong>: isi nama perusahaan pihak ketiga.</li>
                      <li>Harga otomatis terisi dari harga beli katalog, dapat disesuaikan manual.</li>
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
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
import { useImageUrl } from '~/composables/useImageUrl'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormPageSidebar from '~/components/form/FormPageSidebar.vue'
import StockAvailabilityAlert from '~/components/purchasing/StockAvailabilityAlert.vue'
import { PURCHASING_MODULE_NAV } from '~/constants/purchasing/formNav'
import { usePurchaseRequestStockAvailability } from '~/composables/usePurchaseRequestStockAvailability'
import { buildStockMap, evaluateLineStock, getAvailableQty } from '~/utils/purchasing/stockAvailability'
import { getPurchaseRequestItemsList } from '~/stores/purchase-request'
import type { FormPageSummaryRow } from '~/types/form-page'

const route = useRoute()
const purchaseOrderStore = usePurchaseOrderStore()
const { isImageFile } = useImageUrl()
const formatRupiah = useFormatRupiah()

const { form, isEditMode, loading, saving } = storeToRefs(purchaseOrderStore)

const formReady = ref(false)
const vendors = ref<any[]>([])
const perusahaans = ref<any[]>([])
const cabangs = ref<any[]>([])
const warehouses = ref<any[]>([])
const products = ref<any[]>([])
const stockMap = ref<Map<string, number>>(new Map())

const fromPurchaseRequestId = computed(() => {
  const q = route.query.fromPurchaseRequestId
  return q ? String(q) : null
})

const { result: prStockResult, loading: prStockLoading, error: prStockError } =
  usePurchaseRequestStockAvailability(fromPurchaseRequestId, {
    enabled: computed(() => !!fromPurchaseRequestId.value && formReady.value),
  })

const pageTitle = computed(() => (isEditMode.value ? 'Edit Purchase Order' : 'Tambah Purchase Order'))
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Perbarui data purchase order dan item produk.'
    : 'Buat purchase order baru ke vendor.'
)

const itemCount = computed(() => form.value?.purchaseOrderItems?.length ?? 0)
const isExternalPO = computed(() => form.value?.poType === 'external')

const filteredCabangs = computed(() => {
  if (!form.value?.perusahaanId) return []
  return cabangs.value.filter((c) => c && Number(c.perusahaanId) === Number(form.value.perusahaanId))
})

const grandTotal = computed(() => {
  const items = form.value?.purchaseOrderItems ?? []
  const totalItems = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
  const discountAmount = totalItems * ((Number(form.value.discountPercent) || 0) / 100)
  const totalAfterDiscount = totalItems - discountAmount
  const taxAmount = totalAfterDiscount * ((Number(form.value.taxPercent) || 0) / 100)
  return totalAfterDiscount + taxAmount
})

function vendorLabel(v: any) {
  return v?.name || ''
}
function perusahaanLabel(p: any) {
  return p?.nmPerusahaan || p?.nm_perusahaan || ''
}
function cabangLabel(c: any) {
  return c?.nmCabang || c?.nm_cabang || ''
}
function warehouseLabel(w: any) {
  if (!w) return ''
  return `${w.name || ''}${w.code ? ` (${w.code})` : ''}`
}
function productLabel(p: any) {
  if (!p) return ''
  const sku = p.sku ? `${p.sku} — ` : ''
  return `${sku}${p.name || ''}`
}

function formatDateId(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function findVendorName(id: number | null | undefined): string {
  if (!id) return '—'
  const v = vendors.value.find((x) => Number(x.id) === Number(id))
  return v ? vendorLabel(v) : '—'
}

function findPerusahaanName(id: number | null | undefined): string {
  if (!id) return '—'
  const p = perusahaans.value.find((x) => Number(x.id) === Number(id))
  return p ? perusahaanLabel(p) : '—'
}

const summaryRows = computed<FormPageSummaryRow[]>(() => {
  const f = form.value
  const poTypeLabel = f.poType === 'external' ? 'External' : 'Internal'
  return [
    { label: 'Mode', value: isEditMode.value ? 'Edit' : 'Baru' },
    { label: 'Tipe PO', value: poTypeLabel },
    { label: 'Vendor', value: findVendorName(f.vendorId) },
    { label: 'Perusahaan', value: isExternalPO.value ? (f.extNamaPerusahaan || '—') : findPerusahaanName(f.perusahaanId) },
    { label: 'Tgl PO', value: formatDateId(f.date) },
    { label: 'Jatuh tempo', value: formatDateId(f.dueDate) },
    { label: 'Jumlah item', value: String(itemCount.value) },
    { label: 'Grand total', value: formatRupiah(grandTotal.value) },
  ]
})

function productsForRow(warehouseId?: number | null) {
  const list = products.value || []
  if (!warehouseId) return list
  return list.filter((p) => {
    const stocks = p.stocks || []
    if (!stocks.length) return true
    return stocks.some((s: any) => Number(s.warehouseId) === Number(warehouseId) && Number(s.quantity) > 0)
  })
}

function handlePoTypeChange(poType: 'internal' | 'external') {
  form.value.poType = poType
  if (poType === 'external') {
    form.value.perusahaanId = null
    form.value.cabangId = null
  } else {
    form.value.extNamaPerusahaan = ''
  }
}

function calculateSubtotal(index: number) {
  const item = form.value.purchaseOrderItems[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

function onProductChange(index: number) {
  const item = form.value.purchaseOrderItems[index]
  const selected = products.value.find((p) => p.id === item.productId)
  if (!selected) return
  item.price =
    Number(selected.priceBuy ?? selected.price_buy ?? selected.priceSell ?? 0) || 0
  calculateSubtotal(index)
}

function onQuantityChange(index: number) {
  calculateSubtotal(index)
}

function onPriceInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const item = form.value.purchaseOrderItems[index]
  if (!item) return
  item.price = Number(raw) || 0
  calculateSubtotal(index)
}

function lineStockHint(index: number): { text: string; class: string; icon: string } {
  const row = form.value.purchaseOrderItems?.[index]
  if (!row?.productId || !row?.warehouseId) {
    return { text: '', class: '', icon: '' }
  }
  const available = getAvailableQty(stockMap.value, row.productId, row.warehouseId)
  const requested = Number(row.quantity) || 0
  const status = evaluateLineStock(requested, available)
  if (status === 'sufficient') {
    return {
      text: `Stok tersedia: ${Math.floor(available)} (diminta ${Math.floor(requested)})`,
      class: 'text-success',
      icon: 'ri-checkbox-circle-line',
    }
  }
  if (status === 'insufficient') {
    return {
      text: `Stok tidak mencukupi — tersedia ${Math.floor(available)}, diminta ${Math.floor(requested)}`,
      class: 'text-warning',
      icon: 'ri-alert-line',
    }
  }
  return {
    text: 'Stok kosong di gudang ini',
    class: 'text-danger',
    icon: 'ri-error-warning-line',
  }
}

function onWarehouseChange(index: number) {
  const item = form.value.purchaseOrderItems[index]
  if (!item?.warehouseId || !item.productId) return
  const stillValid = productsForRow(item.warehouseId).some((p) => p.id === item.productId)
  if (!stillValid) {
    item.productId = null
    item.price = 0
    calculateSubtotal(index)
  }
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) {
    form.value.attachment = null
    form.value.attachmentPreview = null
    return
  }
  form.value.attachment = file
  form.value.attachmentPreview = URL.createObjectURL(file)
}

async function loadCabangs(perusahaanId?: number | null) {
  if (!perusahaanId) {
    cabangs.value = []
    return
  }
  const { $api } = useNuxtApp()
  try {
    const response = await fetch(`${$api.dataCabang()}?perusahaanId=${perusahaanId}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (response.ok) {
      const json = await response.json()
      cabangs.value = Array.isArray(json) ? json : (json.data ?? [])
    }
  } catch {
    cabangs.value = []
  }
}

async function loadStockMap() {
  const { $api } = useNuxtApp()
  try {
    const response = await fetch(`${$api.dataStock()}`, {
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

async function prefillFromPurchaseRequest(prId: string) {
  const { $api } = useNuxtApp()
  const response = await fetch($api.getPurchaseRequestDetails(prId), {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (!response.ok) return

  const json = await response.json()
  const pr = json.data ?? json
  const items = getPurchaseRequestItemsList(pr).filter(
    (d) => (d.productType === 'product' || d.productId) && d.productId
  )
  if (!items.length) return

  purchaseOrderStore.openModal(null)
  purchaseOrderStore.showModal = false
  form.value.description =
    form.value.description ||
    `PO dari PR ${pr.prNumber || pr.pr_number || pr.id}`

  form.value.purchaseOrderItems = items.map((d) => {
    const product = products.value.find((p) => Number(p.id) === Number(d.productId))
    const price =
      Number(product?.priceBuy ?? product?.price_buy ?? product?.priceSell ?? d.estimatedPrice) || 0
    const qty = Number(d.qty ?? d.quantity) || 1
    return {
      productId: d.productId,
      warehouseId: d.warehouseId ?? pr.warehouseId ?? null,
      quantity: qty,
      price,
      description: d.remarks || d.productName || '',
      subtotal: qty * price,
    }
  })
}

async function loadMasterData() {
  const { $api } = useNuxtApp()
  const headers = { Accept: 'application/json' }
  const opts = { headers, credentials: 'include' as const }

  const [vendorRes, perusahaanRes, warehouseRes, productRes] = await Promise.all([
    fetch($api.dataVendor(), opts),
    fetch($api.dataPerusahaan(), opts),
    fetch($api.dataWarehouse(), opts),
    fetch($api.dataProduct(), opts),
    loadStockMap(),
  ])

  if (vendorRes.ok) {
    const j = await vendorRes.json()
    vendors.value = Array.isArray(j) ? j : (j.data ?? [])
  }
  if (perusahaanRes.ok) {
    const j = await perusahaanRes.json()
    perusahaans.value = Array.isArray(j) ? j : (j.data ?? [])
  }
  if (warehouseRes.ok) {
    const j = await warehouseRes.json()
    warehouses.value = Array.isArray(j) ? j : (j.data ?? [])
  }
  if (productRes.ok) {
    const j = await productRes.json()
    products.value = Array.isArray(j) ? j : (j.data ?? [])
  }
}

async function handleSubmit() {
  const ok = await purchaseOrderStore.savePurchaseOrder()
  if (ok) navigateTo('/purchasing/purchase-order')
}

onMounted(async () => {
  formReady.value = false
  purchaseOrderStore.loading = false
  purchaseOrderStore.saving = false

  try {
    await loadMasterData()

    const id = route.params.id ? String(route.params.id) : null
    if (id) {
      await purchaseOrderStore.fetchPurchaseOrderForEdit(id)
      purchaseOrderStore.showModal = false
      if (form.value?.perusahaanId) {
        await loadCabangs(form.value.perusahaanId)
      }
    } else if (fromPurchaseRequestId.value) {
      await prefillFromPurchaseRequest(fromPurchaseRequestId.value)
      if (form.value?.perusahaanId) {
        await loadCabangs(form.value.perusahaanId)
      }
    } else {
      purchaseOrderStore.openModal(null)
      purchaseOrderStore.showModal = false
    }
  } finally {
    purchaseOrderStore.loading = false
    formReady.value = true
  }
})

watch(
  () => form.value?.perusahaanId,
  async (newPerusahaanId, oldPerusahaanId) => {
    if (newPerusahaanId === oldPerusahaanId) return
    form.value.cabangId = null
    await loadCabangs(newPerusahaanId)
  }
)
</script>

<style scoped>
.po-form-card {
  border: 1px solid var(--bs-border-color, #e4e6ef);
}

.po-item-block {
  background: var(--bs-body-bg, #fff);
  border-color: var(--bs-border-color, #e4e6ef) !important;
}

.po-item-block__head {
  background: rgba(var(--bs-primary-rgb, 105, 108, 255), 0.04);
}

.po-item-block .col-form-label {
  font-weight: 500;
  color: var(--bs-heading-color, #566a7f);
}

.bg-lighter {
  background-color: rgba(var(--bs-body-color-rgb, 67, 89, 113), 0.06);
}

.po-type-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  cursor: pointer;
  font-weight: 400;
  line-height: 1.5;
}

.po-type-option .form-check-input {
  float: none;
  margin: 0;
  flex-shrink: 0;
}
</style>
