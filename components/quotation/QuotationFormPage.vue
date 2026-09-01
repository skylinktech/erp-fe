<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-0">{{ pageTitle }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
          <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/sales/quotation" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-xl-8 col-12">
          <div class="card">
            <div class="card-body">
              <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
            <div v-if="validationErrors?.length" class="alert alert-warning mb-4">
              <ul class="mb-0 ps-3">
                <li v-for="(err, i) in validationErrors" :key="i">{{ err?.message || err }}</li>
              </ul>
            </div>

            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || saving"
              @select="goTo"
            />

            <div class="tab-content pt-4">
              <div class="tab-pane fade" id="quotation-tab-info" data-step-id="quotation-tab-info" role="tabpanel" :class="paneClass('quotation-tab-info')">
                <div class="row g-3">
                  <div class="col-md-3"><FormLabel required>Site Investment</FormLabel><CustomSelect2 v-model="form.siteInvestId" :options="siteInvests" :get-option-label="s => s ? `${s.siNumber || ''} - ${s.name || ''}` : ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Site Investment" @update:model-value="onSiteInvestChange" /><div v-if="uiErrors.siteInvestId" class="invalid-feedback d-block">{{ uiErrors.siteInvestId }}</div></div>
                  <div class="col-md-3"><FormLabel required>Customer</FormLabel><CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="c => c?.name || ''" :reduce="c => c?.id" searchable clearable placeholder="Pilih Customer" /><div v-if="uiErrors.customerId" class="invalid-feedback d-block">{{ uiErrors.customerId }}</div></div>
                  <div class="col-md-3"><FormLabel required>Site</FormLabel><CustomSelect2 v-model="form.siteId" :options="sites" :get-option-label="s => s ? `${s.code || ''} - ${s.name || ''}` : ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Site" /><div v-if="uiErrors.siteId" class="invalid-feedback d-block">{{ uiErrors.siteId }}</div></div>
                  <div class="col-md-3"><FormLabel required>Cost Center</FormLabel><CustomSelect2 v-model="form.costCenterId" :options="costCenters" :get-option-label="c => c ? `${c.code || ''} - ${c.name || ''}` : ''" :reduce="c => c?.id" searchable clearable placeholder="Pilih Cost Center" /><div v-if="uiErrors.costCenterId" class="invalid-feedback d-block">{{ uiErrors.costCenterId }}</div></div>
                  <div class="col-md-3"><FormLabel required html-for="quotation-up">UP</FormLabel><input id="quotation-up" v-model="form.up" class="form-control" :class="{ 'is-invalid': uiErrors.up }" type="text" aria-required="true" /><div v-if="uiErrors.up" class="invalid-feedback d-block">{{ uiErrors.up }}</div></div>
                  <div class="col-md-3"><FormLabel required html-for="quotation-date">Tanggal Quotation</FormLabel><input id="quotation-date" v-model="form.date" class="form-control" :class="{ 'is-invalid': uiErrors.date }" type="date" aria-required="true" /><div v-if="uiErrors.date" class="invalid-feedback d-block">{{ uiErrors.date }}</div></div>
                  <div class="col-md-3"><FormLabel required html-for="quotation-valid-until">Valid Until</FormLabel><input id="quotation-valid-until" v-model="form.validUntil" class="form-control" :class="{ 'is-invalid': uiErrors.validUntil }" type="date" aria-required="true" /><div v-if="uiErrors.validUntil" class="invalid-feedback d-block">{{ uiErrors.validUntil }}</div></div>
                  <div class="col-md-3"><label class="form-label">Terms of Payment</label><CustomSelect2 v-model="form.termsOfPayment" :options="termsOfPaymentOptions" :get-option-label="o => o.label" :reduce="o => o.value" /></div>
                  <div class="col-md-3"><label class="form-label">Discount (%)</label><input v-model.number="form.discountPercent" class="form-control" type="number" /></div>
                  <div class="col-md-3"><label class="form-label">PPN (%)</label><input v-model.number="form.taxPercent" class="form-control" type="number" /></div>
                  <div class="col-md-3">
                    <label class="form-label d-block">PPH</label>
                    <div class="form-check mt-2">
                      <input id="quotationHasPph" v-model="form.hasPph" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="quotationHasPph">Gunakan PPH</label>
                    </div>
                  </div>
                  <div v-if="form.hasPph" class="col-md-3"><label class="form-label">PPH (%)</label><input v-model.number="form.pphPercent" class="form-control" type="number" /></div>
                  <div class="col-12"><label class="form-label">Deskripsi</label><Editor v-model="form.description" editor-style="min-height: 180px" /></div>
                </div>
              </div>

              <!-- ── TAB PRODUK ── -->
              <div class="tab-pane fade" id="quotation-tab-product" data-step-id="quotation-tab-product" role="tabpanel" :class="paneClass('quotation-tab-product')">
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                    <span>Produk (SKU | Nama)</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                  </div>
                  <div v-for="(item, idx) in form.quotationItems" :key="'p-'+idx" class="repeater-table-row">
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">Produk</span>
                      <CustomSelect2 v-model="item.productId" :options="productSelectOptions" :get-option-label="p => `${p?.sku || ''} | ${p?.name || ''}`" :reduce="p => p?.id != null ? Number(p.id) : null" searchable clearable placeholder="Pilih Produk" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Qty</span>
                      <input v-model.number="item.quantity" type="number" min="1" class="form-control" placeholder="Qty" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">
                        Harga Satuan
                        <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                      </span>
                      <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                        <input type="text" :value="formatRupiah(item.price)" @input="updateItemPriceFromInput(idx, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga" />
                        <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleItemOverride(idx)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga standar' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                      </div>
                    </div>
                    <div class="repeater-cell repeater-cell-subtotal">
                      <span class="repeater-cell-label d-md-none">Subtotal</span>
                      <input :value="formatRupiah(lineSubtotal(item))" type="text" class="form-control repeater-subtotal" readonly disabled tabindex="-1" />
                      <button type="button" class="repeater-delete-btn" @click="quotationStore.removeItem(idx)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                    </div>
                    <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                      <i class="ri-information-line me-1 text-warning"></i>
                      <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)" />
                    </div>
                  </div>
                  <div v-if="!form.quotationItems?.length" class="repeater-empty">Belum ada item.</div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="quotationStore.addItem()"><i class="ri-add-line me-1"></i>Tambah Item</button>
              </div>

              <!-- ── TAB SERVICE ── -->
              <div class="tab-pane fade" id="quotation-tab-services" data-step-id="quotation-tab-services" role="tabpanel" :class="paneClass('quotation-tab-services')">
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-6">
                    <span>Service</span><span>Unit</span><span>Qty</span><span>Durasi (bln)</span><span>Harga Satuan</span><span>Subtotal</span>
                  </div>
                  <div v-for="(item, idx) in form.quotationServices" :key="'s-'+idx" class="repeater-table-row">
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">Service</span>
                      <CustomSelect2 v-model="item.serviceId" :options="serviceSelectOptions" :get-option-label="s => s?.name || s?.code || ''" :reduce="s => s?.id != null ? Number(s.id) : null" searchable clearable placeholder="Pilih Service" @update:modelValue="onQuotationServiceChange(idx, $event)" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Unit</span>
                      <CustomSelect2 v-model="item.unitId" :options="units" :get-option-label="u => u?.symbol || u?.name || ''" :reduce="u => u?.id" searchable clearable placeholder="Unit" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Qty</span>
                      <input v-model.number="item.quantity" type="number" min="1" class="form-control" placeholder="Qty" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Durasi (bulan)</span>
                      <input v-model.number="item.contractDurationMonths" type="number" min="1" step="1" class="form-control" placeholder="Bulan" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">
                        Harga Satuan
                        <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                      </span>
                      <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                        <input type="text" :value="formatRupiah(item.price)" @input="updateServicePriceFromInput(idx, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga" />
                        <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleServiceOverride(idx)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga standar' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                      </div>
                    </div>
                    <div class="repeater-cell repeater-cell-subtotal">
                      <span class="repeater-cell-label d-md-none">Subtotal</span>
                      <input :value="formatRupiah(serviceContractSubtotal(item))" type="text" class="form-control repeater-subtotal" readonly disabled tabindex="-1" />
                      <button type="button" class="repeater-delete-btn" @click="quotationStore.removeServiceItem(idx)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                    </div>
                    <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                      <i class="ri-information-line me-1 text-warning"></i>
                      <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)" />
                    </div>
                  </div>
                  <div v-if="!form.quotationServices?.length" class="repeater-empty">Belum ada item.</div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="quotationStore.addServiceItem()"><i class="ri-add-line me-1"></i>Tambah Service</button>
              </div>

              <!-- ── TAB DID ── -->
              <div class="tab-pane fade" id="quotation-tab-did" data-step-id="quotation-tab-did" role="tabpanel" :class="paneClass('quotation-tab-did')">
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                    <span>DID (Delivery / Installation)</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                  </div>
                  <div v-for="(item, idx) in form.quotationDids" :key="'d-'+idx" class="repeater-table-row">
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">DID</span>
                      <CustomSelect2 v-model="item.priceListLineId" :options="didPriceListLines" :get-option-label="line => line ? ((line.did?.code || '') + ' - ' + (line.did?.name || line.priceList?.name || `Line #${line.id}`)) : ''" :reduce="line => line?.id" searchable clearable placeholder="Pilih DID" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Qty</span>
                      <input v-model.number="item.quantity" type="number" min="1" class="form-control" placeholder="Qty" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">
                        Harga Satuan
                        <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                      </span>
                      <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                        <input type="text" :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(idx, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga" />
                        <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleDidOverride(idx)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga standar' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                      </div>
                    </div>
                    <div class="repeater-cell repeater-cell-subtotal">
                      <span class="repeater-cell-label d-md-none">Subtotal</span>
                      <input :value="formatRupiah(lineSubtotal(item))" type="text" class="form-control repeater-subtotal" readonly disabled tabindex="-1" />
                      <button type="button" class="repeater-delete-btn" @click="quotationStore.removeDidItem(idx)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                    </div>
                    <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                      <i class="ri-information-line me-1 text-warning"></i>
                      <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)" />
                    </div>
                  </div>
                  <div v-if="!form.quotationDids?.length" class="repeater-empty">Belum ada item.</div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="quotationStore.addDidItem(true)"><i class="ri-add-line me-1"></i>Tambah DID</button>
              </div>
            </div>

                <TabbedFormActions
                  :is-first-step="isFirstStep"
                  :is-last-step="isLastStep"
                  :loading="navigating"
                  :saving="saving"
                  cancel-href="/sales/quotation"
                  @next="next"
                  @previous="previous"
                />
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-12">
          <div class="card">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0 d-flex align-items-center">
                <i class="ri-menu-2-line me-2 text-primary"></i>
                Modul Sales
              </h5>
            </div>
            <div class="card-body px-5 pt-0 pb-5">
              <div class="list-group list-group-flush">
                <NuxtLink
                  v-for="item in moduleNavItems"
                  :key="item.to"
                  :to="item.to"
                  class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3"
                  :class="{ active: isModuleNavActive(item.to) }"
                >
                  <span class="d-flex align-items-center gap-2">
                    <i :class="item.icon" class="text-primary"></i>
                    {{ item.label }}
                  </span>
                  <i class="ri-arrow-right-s-line text-muted"></i>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<style scoped>
/* ── Repeater table container ── */
.repeater-table {
  border: 1px solid #dee2e6;
  border-radius: 10px;
}
.repeater-table-head {
  background: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
  border-radius: 10px 10px 0 0;
  padding: 8px 16px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6c757d;
  gap: 12px;
  align-items: center;
}
.repeater-table-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-end;
  transition: background 0.12s;
}
.repeater-table-row:last-child { border-bottom: none; }
.repeater-table-row:hover { background: #fafbfc; }
.repeater-cell {
  display: flex;
  flex-direction: column;
  flex: 1 1 120px;
  min-width: 0;
}
.repeater-cell-main { flex: 3 1 240px; }
.repeater-cell-subtotal {
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
}
.repeater-cell-subtotal .form-control { flex: 1 1 0; min-width: 0; }
.repeater-cell-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 4px;
  display: block;
}
.repeater-cols-4 { grid-template-columns: 3fr 1fr 1.5fr 1.8fr; }
.repeater-cols-5 { grid-template-columns: 2.5fr 1fr 1fr 1.5fr 1.8fr; }
.repeater-cols-6 { grid-template-columns: 2fr 0.8fr 0.7fr 0.9fr 1.3fr 1.5fr; }
.repeater-subtotal {
  background: #e9ecef !important;
  color: #495057 !important;
  font-weight: 600;
  cursor: default;
}
.repeater-delete-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #f1aeb5;
  border-radius: 6px;
  color: #f13636;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1;
}
.repeater-delete-btn:hover {
  background: #f13636;
  color: #fff;
  border-color: #f13636;
}
.repeater-empty {
  padding: 20px 16px;
  text-align: center;
  color: #adb5bd;
  font-size: 0.875rem;
}

/* ── Price override / lock ── */
.price-input-wrapper {
  display: flex;
  align-items: stretch;
  gap: 4px;
}
.price-input-wrapper .price-field { flex: 1; min-width: 0; }
.btn-price-lock {
  flex-shrink: 0;
  width: 34px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
  color: #adb5bd;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;
  font-size: 0.85rem;
}
.btn-price-lock:hover { border-color: #6c757d; color: #495057; background: #e9ecef; }
.btn-price-lock.is-overridden { border-color: #fd7e14; color: #fd7e14; background: #fff3e0; }
.btn-price-lock.is-overridden:hover { background: #fd7e14; color: #fff; border-color: #fd7e14; }
.price-input-wrapper.price-override-active .price-field {
  border-color: #fd7e14 !important;
  box-shadow: 0 0 0 0.15rem rgba(255, 186, 47, 0.15) !important;
}
.price-field:not(.price-overridden) { background: #f8f9fa !important; color: #6c757d !important; cursor: default; }
.badge-custom { font-size: 0.6rem; vertical-align: middle; }

/* ── Full-width reason row ── */
.repeater-cell-reason {
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0 2px;
  border-top: 1px dashed #ffe69c;
  margin-top: 4px;
}
.repeater-cell-reason .ri-information-line { flex-shrink: 0; font-size: 0.9rem; }
.price-reason-input {
  flex: 1;
  font-size: 0.78rem;
  border-color: var(--bs-warning) !important;
  background: #fffef5 !important;
  color: #856404;
}
.price-reason-input::placeholder { color: #c8a800; }
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuotationStore } from '~/stores/quotation'
import { useCustomerStore } from '~/stores/customer'
import { useServiceStore } from '~/stores/service'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { parseRupiahToNumber } from '~/composables/formatRupiah'
import { lineSubtotal } from '~/utils/lineSubtotal'
import { serviceContractSubtotal } from '~/utils/commercialPricing'
import { firstErrorTab } from '~/utils/apiError'

const route = useRoute()
const formatRupiah = useFormatRupiah()
const quotationStore = useQuotationStore()
const customerStore = useCustomerStore()
const serviceStore = useServiceStore()
const { form, saving, validationErrors, customerProducts } = storeToRefs(quotationStore)
const formRoot = ref<HTMLFormElement | null>(null)
const uiErrors = ref<Record<string, string>>({})
const QUOTATION_FIELD_TABS: Record<string, string> = {
  siteInvestId: 'quotation-tab-info',
  customerId: 'quotation-tab-info',
  siteId: 'quotation-tab-info',
  costCenterId: 'quotation-tab-info',
  up: 'quotation-tab-info',
  date: 'quotation-tab-info',
  validUntil: 'quotation-tab-info',
  quotationItems: 'quotation-tab-product',
  quotationServices: 'quotation-tab-services',
  quotationDids: 'quotation-tab-did',
}
const formSteps = [
  { id: 'quotation-tab-info', label: 'Informasi', icon: 'ri-information-line' },
  { id: 'quotation-tab-product', label: 'Products', icon: 'ri-box-3-line' },
  { id: 'quotation-tab-services', label: 'Services', icon: 'ri-service-line' },
  { id: 'quotation-tab-did', label: 'DID', icon: 'ri-phone-line' },
]
function validateQuotationStep(step: { id: string }): boolean {
  uiErrors.value = {}
  if (step.id !== 'quotation-tab-info') return true
  if (!form.value?.siteInvestId) uiErrors.value.siteInvestId = 'Site Investment wajib dipilih.'
  if (!form.value?.customerId) uiErrors.value.customerId = 'Customer wajib dipilih.'
  if (!form.value?.siteId) uiErrors.value.siteId = 'Site wajib dipilih.'
  if (!form.value?.costCenterId) uiErrors.value.costCenterId = 'Cost Center wajib dipilih.'
  if (!String(form.value?.up || '').trim()) uiErrors.value.up = 'UP wajib diisi.'
  if (!form.value?.date) uiErrors.value.date = 'Tanggal Quotation wajib diisi.'
  if (!form.value?.validUntil) uiErrors.value.validUntil = 'Valid Until wajib diisi.'
  if (form.value?.date && form.value?.validUntil && String(form.value.validUntil) < String(form.value.date)) {
    uiErrors.value.validUntil = 'Valid Until tidak boleh lebih awal dari Tanggal Quotation.'
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
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateQuotationStep })
const { customers } = storeToRefs(customerStore)
const { services } = storeToRefs(serviceStore)

/** Merge master services with SI-prefilled service snapshots so selected labels always resolve */
const serviceSelectOptions = computed(() => {
  const byId = new Map<number, any>()
  const isFakeName = (n: unknown) => typeof n === 'string' && /^Service #\d+$/i.test(n)
  for (const s of services.value || []) {
    const id = Number(s?.id)
    if (!id) continue
    if (isFakeName(s?.name)) continue
    byId.set(id, s)
  }
  for (const item of form.value?.quotationServices || []) {
    const id = Number(item?.serviceId ?? item?.service?.id)
    if (!id) continue
    const snapshot = item.service
    const snapName = (snapshot?.name || '').trim()
    if (snapName && !isFakeName(snapName)) {
      byId.set(id, { ...(byId.get(id) || {}), ...snapshot, id, name: snapName })
    }
  }
  return Array.from(byId.values())
})

const productSelectOptions = computed(() => {
  const map = new Map<number, any>()
  for (const p of customerProducts.value || []) {
    const id = Number(p?.id)
    if (id) map.set(id, p)
  }
  for (const item of form.value?.quotationItems || []) {
    const id = Number(item?.productId)
    if (!id || map.has(id)) continue
    const p = item.product
    if (p?.id || p?.name || p?.sku) {
      map.set(id, {
        id,
        sku: p.sku ?? '',
        name: p.name ?? '',
        noInterchange: p.noInterchange ?? '',
      })
    }
  }
  return [...map.values()]
})
const siteInvests = ref<any[]>([])
const sites = ref<any[]>([])
const costCenters = ref<any[]>([])
const units = ref<any[]>([])
const didPriceListLines = ref<any[]>([])
const skipSiteInvestPrefill = ref(true)
let siteInvestPrefillRequest = 0

const quotationId = computed(() => {
  const raw = route.params.id
  if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : undefined
  return raw ? String(raw) : undefined
})
const pageTitle = computed(() => (quotationId.value ? 'Edit Quotation' : 'Tambah Quotation'))
const pageSubtitle = computed(() => (quotationId.value ? 'Perbarui data quotation.' : 'Isi form untuk membuat quotation baru.'))
const termsOfPaymentOptions = [{ label: 'Postpaid', value: 'postpaid' }, { label: 'Prepaid', value: 'prepaid' }, { label: 'Down Payment', value: 'down_payment' }]
const moduleNavItems = computed(() => [
  { label: 'Quotation', to: '/sales/quotation', icon: 'ri-file-list-3-line' },
  { label: 'Site Investment', to: '/sales/site-investment', icon: 'ri-building-line' },
  { label: 'Sales Order', to: '/sales/sales-order', icon: 'ri-shopping-bag-3-line' },
  { label: 'Sales Invoice', to: '/sales/sales-invoice', icon: 'ri-receipt-line' },
])

function isModuleNavActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

function updateItemPriceFromInput(idx: number, e: Event) {
  const item = form.value?.quotationItems?.[idx]
  if (!item) return
  item.price = parseRupiahToNumber((e.target as HTMLInputElement)?.value)
}

function updateServicePriceFromInput(idx: number, e: Event) {
  const item = form.value?.quotationServices?.[idx]
  if (!item) return
  item.price = parseRupiahToNumber((e.target as HTMLInputElement)?.value)
}

function updateDidPriceFromInput(idx: number, e: Event) {
  const item = form.value?.quotationDids?.[idx]
  if (!item) return
  item.price = parseRupiahToNumber((e.target as HTMLInputElement)?.value)
}

function toggleItemOverride(idx: number) {
  const item = form.value?.quotationItems?.[idx]
  if (!item) return
  item.isPriceOverridden = !item.isPriceOverridden
  if (!item.isPriceOverridden) item.priceReason = ''
}

function toggleServiceOverride(idx: number) {
  const item = form.value?.quotationServices?.[idx]
  if (!item) return
  item.isPriceOverridden = !item.isPriceOverridden
  if (!item.isPriceOverridden) item.priceReason = ''
}

/** Prefill contractDurationMonths from ServicePlan.contractMonth; never overwrite user edit. */
function onQuotationServiceChange(idx: number, serviceId: unknown) {
  const item = form.value?.quotationServices?.[idx]
  if (!item) return
  const svc = (serviceSelectOptions.value || []).find((s: any) => Number(s?.id) === Number(serviceId))
  if (!svc) return
  item.servicePlanId = svc.servicePlanId ?? svc.service_plan_id ?? svc.servicePlan?.id ?? null
  if (item.contractDurationMonths == null || item.contractDurationMonths === '') {
    const planMonth =
      svc.servicePlan?.contractMonth ??
      svc.service_plan?.contract_month ??
      svc.contractMonth ??
      null
    const n = Number(planMonth)
    item.contractDurationMonths = Number.isFinite(n) && n > 0 ? Math.trunc(n) : null
  }
}

function toggleDidOverride(idx: number) {
  const item = form.value?.quotationDids?.[idx]
  if (!item) return
  item.isPriceOverridden = !item.isPriceOverridden
  if (!item.isPriceOverridden) item.priceReason = ''
}

async function loadMasters() {
  const { $api } = useNuxtApp()
  const [siRes, siteRes, ccRes, unitRes] = await Promise.all([
    fetch(`${$api.siteInvestment()}?page=1&rows=500&status=approved`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch(`${$api.sites()}?page=1&rows=500`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch(`${$api.costCenters()}?page=1&rows=500`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch($api.unit(), { credentials: 'include', headers: { Accept: 'application/json' } }),
  ])
  siteInvests.value = siRes.ok ? ((await siRes.json()).data || []) : []
  sites.value = siteRes.ok ? ((await siteRes.json()).data || []) : []
  costCenters.value = ccRes.ok ? ((await ccRes.json()).data || []) : []
  units.value = unitRes.ok ? ((await unitRes.json()).data || []) : []
  const didRes = await fetch($api.siteInvestmentPriceListLines('did'), { credentials: 'include', headers: { Accept: 'application/json' } })
  if (didRes.ok) {
    const didJson = await didRes.json()
    didPriceListLines.value = Array.isArray(didJson) ? didJson : (didJson.data || [])
  } else didPriceListLines.value = []
}

async function onSiteInvestChange(siteInvestId: string | null) {
  if (skipSiteInvestPrefill.value) return

  if (!siteInvestId) return

  const requestId = ++siteInvestPrefillRequest
  const prefill = await quotationStore.applySiteInvestmentPrefill(siteInvestId)
  if (requestId !== siteInvestPrefillRequest || !prefill) return

  mergePrefillMasterOptions(prefill)
}

function mergePrefillMasterOptions(prefill: any) {
  if (prefill?.customer?.id) {
    const exists = (customers.value || []).some((c: any) => c.id === prefill.customer.id)
    if (!exists) {
      customerStore.customers = [...(customers.value || []), prefill.customer]
    }
  }
  if (prefill?.site?.id) {
    const exists = sites.value.some((s: any) => s.id === prefill.site.id)
    if (!exists) sites.value = [...sites.value, prefill.site]
  }
  if (prefill?.costCenter?.id) {
    const exists = costCenters.value.some((c: any) => c.id === prefill.costCenter.id)
    if (!exists) costCenters.value = [...costCenters.value, prefill.costCenter]
  }
  // Ensure service dropdown options include SI-prefilled services (paginated master may miss them)
  void quotationStore.ensurePrefillServiceLabels()
}

async function loadForm() {
  quotationStore.closeModal()
  skipSiteInvestPrefill.value = true
  await Promise.all([customerStore.fetchCustomers(), serviceStore.fetchServicesForSelect(), loadMasters()])
  if (quotationId.value) {
    await quotationStore.fetchQuotationForEdit(quotationId.value)
    quotationStore.showModal = false
  } else {
    quotationStore.openModal(null)
    quotationStore.showModal = false
  }

  // Keep DID tab consistent with Products/Services: always show one row by default.
  if (!Array.isArray(form.value?.quotationDids) || form.value.quotationDids.length === 0) {
    quotationStore.addDidItem(true)
  }

  skipSiteInvestPrefill.value = false
}

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await onSubmit()
}

async function onSubmit() {
  const saved = await quotationStore.saveQuotation({ navigateToList: true })
  if (!saved) {
    const list = Array.isArray(quotationStore.validationErrors) ? quotationStore.validationErrors : []
    for (const item of list as any[]) {
      if (item?.field && item?.message) uiErrors.value[item.field] = item.message
    }
    const tab = firstErrorTab(list as any, QUOTATION_FIELD_TABS)
    if (tab) void goToId(tab, { skipValidation: true })
  }
}

watch(() => form.value?.customerId, async (customerId) => {
  if (customerId) await quotationStore.fetchProductsForCustomer(customerId, { merge: true })
}, { immediate: true })

watch(() => form.value?.hasPph, (enabled) => {
  if (!enabled && form.value) {
    form.value.pphPercent = 0
  }
})

onMounted(loadForm)
</script>
