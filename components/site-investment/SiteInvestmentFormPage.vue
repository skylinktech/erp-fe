<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <NuxtLink to="/sales/site-investment" class="text-muted small text-decoration-none">Site Investment</NuxtLink>
            <span class="text-muted small">/</span>
            <span class="text-muted small">{{ pageTitle }}</span>
          </div>
          <h4 class="mb-1">{{ pageTitle }}</h4>
          <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/sales/site-investment" class="btn btn-outline-secondary btn-sm">
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
                <li v-for="(error, index) in validationErrors" :key="index">{{ error?.message || error }}</li>
              </ul>
            </div>
            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || saving"
              @select="goTo"
            />

            <div class="tab-content pt-4">
              <div id="si-tab-info" data-step-id="si-tab-info" class="tab-pane fade" role="tabpanel" :class="paneClass('si-tab-info')">
                <div class="row g-3">
                  <div class="col-md-6">
                    <FormLabel required html-for="si-name">Nama Site Investment</FormLabel>
                    <input id="si-name" v-model="form.name" class="form-control" :class="{ 'is-invalid': uiErrors.name }" placeholder="Nama Site Investment" aria-required="true">
                    <div v-if="uiErrors.name" class="invalid-feedback d-block">{{ uiErrors.name }}</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Customer</label>
                    <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="getCustomerLabel" :reduce="getCustomerId" placeholder="Pilih Customer" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Site</label>
                    <CustomSelect2 v-model="form.siteId" :options="sites" :get-option-label="getSiteLabel" :reduce="getSiteId" placeholder="Pilih Site" searchable clearable @update:modelValue="onSiteChange" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Business Scheme</label>
                    <CustomSelect2 v-model="form.businessSchemeId" :options="businessSchemes" :get-option-label="getBranchLabel" :reduce="getBranchId" placeholder="Pilih Business Scheme" searchable clearable />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Isi dari FDR</label>
                    <CustomSelect2 v-model="form.fdrId" :options="fdrsForSelect" :get-option-label="getFdrLabel" :reduce="getFdrId" placeholder="Isi dari FDR" searchable clearable @update:modelValue="onFdrSelect" />
                    <small class="text-muted">Pilih FDR untuk autofill informasi project, material, service, dan DID.</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Isi dari Price List</label>
                    <CustomSelect2 v-model="selectedPriceListId" :options="priceListOptions" :get-option-label="getPriceListLabel" :reduce="getPriceListId" placeholder="Isi dari Price List" searchable clearable @update:modelValue="onPriceListSelect" />
                    <small class="text-muted">Pilih Price List untuk autofill material, service, dan DID.</small>
                  </div>
                  <div class="col-md-4">
                    <FormLabel required html-for="si-location">Lokasi</FormLabel>
                    <input id="si-location" v-model="form.location" class="form-control" :class="{ 'is-invalid': uiErrors.location }" placeholder="Lokasi" aria-required="true">
                    <div v-if="uiErrors.location" class="invalid-feedback d-block">{{ uiErrors.location }}</div>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Priority</label>
                    <CustomSelect2 v-model="form.priority" :options="priorityOptions" :get-option-label="getOptionLabel" :reduce="getOptionValue" placeholder="Priority" clearable />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Tanggal SI</label>
                    <input type="date" v-model="form.siDate" class="form-control">
                  </div>
                  <div class="col-md-3">
                    <FormLabel html-for="si-est-start">Estimasi Mulai</FormLabel>
                    <input id="si-est-start" type="date" v-model="form.estimatedStartDate" class="form-control">
                  </div>
                  <div class="col-md-3">
                    <FormLabel html-for="si-est-end">Estimasi Selesai</FormLabel>
                    <input id="si-est-end" type="date" v-model="form.estimatedCompletionDate" class="form-control" :class="{ 'is-invalid': uiErrors.estimatedCompletionDate }">
                    <div v-if="uiErrors.estimatedCompletionDate" class="invalid-feedback d-block">{{ uiErrors.estimatedCompletionDate }}</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Latitude</label>
                    <input v-model="form.lat" class="form-control" placeholder="Latitude">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Longitude</label>
                    <input v-model="form.long" class="form-control" placeholder="Longitude">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Marketing Fee</label>
                    <input :value="formatRupiah(form.marketingFee)" @input="onMarketingFeeInput" class="form-control" placeholder="Marketing Fee">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Prepared By</label>
                    <CustomSelect2 v-model="form.preparedByIds" :options="pegawaiOptions" :get-option-label="getPegawaiLabel" :reduce="getPegawaiId" placeholder="Prepared By" searchable clearable multiple />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Attachment</label>
                    <input type="file" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv" @change="onAttachmentChange">
                  </div>
                  <div class="col-md-12">
                    <label class="form-label">Notes</label>
                    <textarea v-model="form.notes" class="form-control" placeholder="Notes"></textarea>
                  </div>

                  <div class="col-12 mt-4">
                    <div class="investment-summary-card">
                      <h6 class="investment-summary-title">
                        <i class="ri-pie-chart-2-line me-2"></i>
                        Ringkasan Total Investasi
                      </h6>
                      <div class="investment-summary-body">
                        <div class="investment-summary-row">
                          <span class="investment-summary-label">Managed Service</span>
                          <span class="investment-summary-value">{{ formatRupiah(serviceSubtotal) }}</span>
                        </div>
                        <div class="investment-summary-row">
                          <span class="investment-summary-label">Material</span>
                          <span class="investment-summary-value">{{ formatRupiah(materialSubtotal) }}</span>
                        </div>
                        <div class="investment-summary-row">
                          <span class="investment-summary-label">DID (Delivery/Installation)</span>
                          <span class="investment-summary-value">{{ formatRupiah(didSubtotal) }}</span>
                        </div>

                        <div class="investment-summary-divider"></div>

                        <div class="investment-summary-row investment-summary-row-total">
                          <span class="investment-summary-label">Total Investasi</span>
                          <span class="investment-summary-value">{{ formatRupiah(totalInvestment) }}</span>
                        </div>
                        <div class="investment-summary-row">
                          <span class="investment-summary-label">Marketing Fee</span>
                          <span class="investment-summary-value">{{ formatRupiah(marketingFeeAmount) }}</span>
                        </div>

                        <div class="investment-summary-divider"></div>

                        <div class="investment-summary-row investment-summary-row-grand">
                          <span class="investment-summary-label">Grand Total</span>
                          <span class="investment-summary-value">{{ formatRupiah(grandTotal) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ── TAB MATERIAL ── -->
              <div id="si-tab-materials" data-step-id="si-tab-materials" class="tab-pane fade" role="tabpanel" :class="paneClass('si-tab-materials')">
                <div v-if="uiErrors.siteInvestMaterials" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestMaterials }}</div>
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                    <span>Product / Material</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                  </div>
                  <div v-for="(item, index) in form.siteInvestMaterials" :key="'m-'+index" class="repeater-table-row">
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">Product / Material</span>
                      <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesProduct" :get-option-label="getMaterialLineLabel" :reduce="getMaterialLineId" placeholder="Pilih Material" @update:modelValue="onMaterialLineChange(index, $event)" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Qty</span>
                      <input type="number" v-model.number="item.quantity" @input="calculateMaterialSubtotal(index)" class="form-control" min="0.01" placeholder="Qty">
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">
                        Harga Satuan
                        <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                      </span>
                      <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                        <input :value="formatRupiah(item.price)" @input="updateMaterialPriceFromInput(index, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga">
                        <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleMaterialOverride(index)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga price list' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                      </div>
                    </div>
                    <div class="repeater-cell repeater-cell-subtotal">
                      <span class="repeater-cell-label d-md-none">Subtotal</span>
                      <input :value="formatRupiah(lineSubtotal(item))" class="form-control repeater-subtotal" readonly disabled tabindex="-1">
                      <button type="button" class="repeater-delete-btn" @click="siteInvestStore.removeMaterialItem(index)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                    </div>
                    <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                      <i class="ri-information-line me-1 text-warning"></i>
                      <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)">
                    </div>
                  </div>
                  <div v-if="!form.siteInvestMaterials?.length" class="repeater-empty">Belum ada item.</div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="siteInvestStore.addMaterialItem()"><i class="ri-add-line me-1"></i>Tambah Material</button>
              </div>

              <!-- ── TAB SERVICE ── -->
              <div id="si-tab-services" data-step-id="si-tab-services" class="tab-pane fade" role="tabpanel" :class="paneClass('si-tab-services')">
                <div v-if="uiErrors.siteInvestServices" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestServices }}</div>
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                    <span>Service</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                  </div>
                  <div v-for="(item, index) in form.siteInvestServices" :key="'s-'+index" class="repeater-table-row">
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">Service</span>
                      <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesService" :get-option-label="getServiceLineLabel" :reduce="getServiceLineId" placeholder="Pilih Service" @update:modelValue="onServiceLineChange(index, $event)" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Qty</span>
                      <input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" min="0.01" placeholder="Qty">
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">
                        Harga Satuan
                        <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                      </span>
                      <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                        <input :value="formatRupiah(item.price)" @input="updateServicePriceFromInput(index, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga">
                        <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleServiceOverride(index)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga price list' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                      </div>
                    </div>
                    <div class="repeater-cell repeater-cell-subtotal">
                      <span class="repeater-cell-label d-md-none">Subtotal</span>
                      <input :value="formatRupiah(lineSubtotal(item))" class="form-control repeater-subtotal" readonly disabled tabindex="-1">
                      <button type="button" class="repeater-delete-btn" @click="siteInvestStore.removeServiceItem(index)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                    </div>
                    <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                      <i class="ri-information-line me-1 text-warning"></i>
                      <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)">
                    </div>
                  </div>
                  <div v-if="!form.siteInvestServices?.length" class="repeater-empty">Belum ada item.</div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="siteInvestStore.addServiceItem()"><i class="ri-add-line me-1"></i>Tambah Service</button>
              </div>

              <!-- ── TAB DID ── -->
              <div id="si-tab-dids" data-step-id="si-tab-dids" class="tab-pane fade" role="tabpanel" :class="paneClass('si-tab-dids')">
                <div v-if="uiErrors.siteInvestDids" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestDids }}</div>
                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small text-uppercase">Filter Price List DID</label>
                  <CustomSelect2 v-model="selectedDidPriceListId" :options="priceListOptionsDid" :get-option-label="getDidPriceListLabel" :reduce="getDidPriceListId" placeholder="Pilih Price List DID (opsional)" @update:modelValue="onDidPriceListSelect" />
                </div>
                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                    <span>DID</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                  </div>
                  <div v-for="(item, index) in form.siteInvestDids" :key="'d-'+index" class="repeater-table-row">
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">DID</span>
                      <CustomSelect2 v-model="item.priceListLineId" :options="didLineSelectOptions" :get-option-label="getDidLineLabel" :reduce="getDidLineId" placeholder="Pilih DID" searchable clearable @update:modelValue="onDidLineChange(index, $event)" />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Qty</span>
                      <input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" min="1" placeholder="Qty">
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">
                        Harga Satuan
                        <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                      </span>
                      <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                        <input :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(index, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga">
                        <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleDidOverride(index)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga price list' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                      </div>
                    </div>
                    <div class="repeater-cell repeater-cell-subtotal">
                      <span class="repeater-cell-label d-md-none">Subtotal</span>
                      <input :value="formatRupiah(lineSubtotal(item))" class="form-control repeater-subtotal" readonly disabled tabindex="-1">
                      <button type="button" class="repeater-delete-btn" @click="siteInvestStore.removeDidItem(index)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                    </div>
                    <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                      <i class="ri-information-line me-1 text-warning"></i>
                      <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)">
                    </div>
                  </div>
                  <div v-if="!form.siteInvestDids?.length" class="repeater-empty">Belum ada item.</div>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="siteInvestStore.addDidItem()"><i class="ri-add-line me-1"></i>Tambah DID</button>
              </div>

            </div>

                <TabbedFormActions
                  :is-first-step="isFirstStep"
                  :is-last-step="isLastStep"
                  :loading="navigating"
                  :saving="saving"
                  cancel-href="/sales/site-investment"
                  @next="next"
                  @previous="previous"
                />
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-12">
          <div class="card shadow-sm border-0">
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

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteInvestStore } from '~/stores/site-invest'
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import {
  getLinePriceListId,
  getDidLineLabel,
  mergePriceListLine,
  filterLinesByPriceListId,
} from '~/utils/priceListLines'
import { lineSubtotal } from '~/utils/lineSubtotal'
import { firstErrorTab } from '~/utils/apiError'

const route = useRoute()
const siteInvestStore = useSiteInvestStore()
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const formatRupiah = useFormatRupiah()
const toast = useToast()
const uiErrors = ref({})
const SI_FIELD_TABS = {
  name: 'si-tab-info',
  location: 'si-tab-info',
  siteInvestMaterials: 'si-tab-materials',
  siteInvestServices: 'si-tab-services',
  siteInvestDids: 'si-tab-dids',
}

const { loading, saving, form, isEditMode, validationErrors } = storeToRefs(siteInvestStore)
const formRoot = ref(null)
const formSteps = [
  { id: 'si-tab-info', label: 'Informasi', icon: 'ri-information-line' },
  { id: 'si-tab-materials', label: 'Material/Product', icon: 'ri-box-3-line' },
  { id: 'si-tab-services', label: 'Services', icon: 'ri-service-line' },
  { id: 'si-tab-dids', label: 'DID', icon: 'ri-phone-line' },
]
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
} = useTabbedFormNavigation({
  steps: formSteps,
  formRoot,
  validateStep: validateSiteInvestStep,
})
const { customers } = storeToRefs(customerStore)

const quotationId = computed(() => route.params.id ? String(route.params.id) : null)
const pageTitle = computed(() => (quotationId.value ? 'Edit Site Investment' : 'Tambah Site Investment'))
const pageSubtitle = computed(() => (quotationId.value ? 'Ubah data Site Investment' : 'Buat data Site Investment baru'))
const moduleNavItems = computed(() => [
  { label: 'Quotation', to: '/sales/quotation', icon: 'ri-file-list-3-line' },
  { label: 'Site Investment', to: '/sales/site-investment', icon: 'ri-building-line' },
  { label: 'Sales Order', to: '/sales/sales-order', icon: 'ri-shopping-bag-3-line' },
  { label: 'Sales Invoice', to: '/sales/sales-invoice', icon: 'ri-receipt-line' },
])

const priceListLinesProduct = ref([])
const priceListLinesService = ref([])
const priceListLinesDid = ref([])
const fdrsForSelect = ref([])
const selectedPriceListId = ref(null)
const selectedDidPriceListId = ref(null)
const sites = ref([])
const businessSchemes = ref([])
const pegawaiOptions = ref([])
const priceListOptions = ref([])

const materialSubtotal = computed(() => {
  if (!form.value?.siteInvestMaterials) return 0
  return form.value.siteInvestMaterials.reduce((sum, item) => sum + (Number(item?.subtotal) || 0), 0)
})
const serviceSubtotal = computed(() => {
  if (!form.value?.siteInvestServices) return 0
  return form.value.siteInvestServices.reduce((sum, item) => sum + (Number(item?.subtotal) || 0), 0)
})
const didSubtotal = computed(() => {
  if (!form.value?.siteInvestDids) return 0
  return form.value.siteInvestDids.reduce((sum, item) => sum + (Number(item?.subtotal) || 0), 0)
})
const totalInvestment = computed(() => materialSubtotal.value + serviceSubtotal.value + didSubtotal.value)
const marketingFeeAmount = computed(() => Number(form.value?.marketingFee ?? form.value?.marketing_fee ?? 0) || 0)
const grandTotal = computed(() => totalInvestment.value + marketingFeeAmount.value)

const priceListOptionsDid = computed(() => {
  const seen = new Map()
  const add = (id, name) => {
    const n = Number(id)
    if (!n) return
    if (!seen.has(n)) seen.set(n, name || `Price List #${n}`)
  }
  for (const line of priceListLinesDid.value || []) {
    add(getLinePriceListId(line), line.price_list?.name ?? line.priceList?.name)
  }
  for (const pl of priceListOptions.value || []) {
    add(pl.id, pl.name)
  }
  const selectedId = Number(selectedDidPriceListId.value ?? selectedPriceListId.value)
  if (selectedId) add(selectedId, null)
  return [...seen.entries()].map(([id, name]) => ({ id, name }))
})
const didLineSelectOptions = computed(() => {
  const plId = Number(selectedDidPriceListId.value ?? selectedPriceListId.value)
  return filterLinesByPriceListId(priceListLinesDid.value || [], plId || null)
})

const getCustomerLabel = (c) => c ? c.name : ''
const getCustomerId = (c) => c ? c.id : null
const getSiteLabel = (s) => s ? `${s.code || ''} - ${s.name || ''}` : ''
const getSiteId = (s) => s ? s.id : null
const getBranchLabel = (b) => b ? `${b.code || ''} - ${b.name || ''}` : ''
const getBranchId = (b) => b ? (b.id ?? b) : null
const getFdrLabel = (f) => f ? `${f.fdrNumber || ''} - ${f.name || ''}` : ''
const getFdrId = (f) => f ? f.id : null
const getOptionLabel = (o) => o ? o.label : ''
const getOptionValue = (o) => o ? o.value : null
const getPriceListLabel = (pl) => pl ? `${pl.name || ''}${pl.type ? ` (${pl.type})` : ''}`.trim() || '—' : '—'
const getPriceListId = (pl) => pl ? pl.id : null
const getMaterialLineLabel = (line) => line?.product ? `${line.product.name} (${line.product.sku || ''})` : `Line #${line?.id || '—'}`
const getMaterialLineId = (line) => line ? line.id : null
const getServiceLineLabel = (line) => line?.service?.name || `Line #${line?.id || '—'}`
const getServiceLineId = (line) => line ? line.id : null
const getDidLineId = (line) => line ? line.id : null
const getDidPriceListLabel = (pl) => pl ? pl.name : '—'
const getDidPriceListId = (pl) => pl ? pl.id : null
const getPegawaiLabel = (p) => p ? (p.nm_pegawai || p.nmPegawai || '') : ''
const getPegawaiId = (p) => {
  const id = p?.id_pegawai ?? p?.idPegawai ?? null
  return id != null ? Number(id) : null
}

function mapPegawaiToOptions(raw) {
  const list = Array.isArray(raw) ? raw : []
  return list
    .map((p) => ({
      id_pegawai: Number(p.id_pegawai ?? p.idPegawai ?? p.id),
      nm_pegawai: p.nm_pegawai ?? p.nmPegawai ?? '',
    }))
    .filter((p) => Number.isFinite(p.id_pegawai) && p.id_pegawai > 0)
}

const priorityOptions = ref([{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }])

function isModuleNavActive(to) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

function activateTab(tabId) {
  void goToId(tabId, { skipValidation: true })
}

function validateSiteInvestStep(step) {
  if (step.id === 'si-tab-info') {
    uiErrors.value = {}
    if (!String(form.value?.name || '').trim()) {
      uiErrors.value.name = 'Nama Site Investment wajib diisi'
    }
    if (!String(form.value?.location || '').trim()) {
      uiErrors.value.location = 'Lokasi wajib diisi'
    }
    const start = String(form.value?.estimatedStartDate || '')
    const end = String(form.value?.estimatedCompletionDate || '')
    if (start && end && end < start) {
      uiErrors.value.estimatedCompletionDate = 'Estimasi Selesai tidak boleh lebih awal dari Estimasi Mulai.'
    }
    return !uiErrors.value.name && !uiErrors.value.location && !uiErrors.value.estimatedCompletionDate
  }
  if (step.id === 'si-tab-materials') {
    const materials = Array.isArray(form.value?.siteInvestMaterials) ? form.value.siteInvestMaterials : []
    const materialInvalid = materials.some((item) => (Number(item?.quantity) || 0) > 0 && Number(item?.priceListLineId || 0) <= 0)
    if (materialInvalid) {
      uiErrors.value = { ...uiErrors.value, siteInvestMaterials: 'Material dengan quantity > 0 wajib memilih price list line' }
      return false
    }
    return true
  }
  if (step.id === 'si-tab-services') {
    const services = Array.isArray(form.value?.siteInvestServices) ? form.value.siteInvestServices : []
    const serviceInvalid = services.some((item) => (Number(item?.quantity) || 0) > 0 && Number(item?.priceListLineId || 0) <= 0)
    if (serviceInvalid) {
      uiErrors.value = { ...uiErrors.value, siteInvestServices: 'Service dengan quantity > 0 wajib memilih price list line' }
      return false
    }
    return true
  }
  if (step.id === 'si-tab-dids') {
    const dids = Array.isArray(form.value?.siteInvestDids) ? form.value.siteInvestDids : []
    const didInvalid = dids.some((item) => (Number(item?.quantity) || 0) > 0 && Number(item?.priceListLineId || 0) <= 0)
    if (didInvalid) {
      uiErrors.value = { ...uiErrors.value, siteInvestDids: 'DID dengan quantity > 0 wajib memilih price list line' }
      return false
    }
    return true
  }
  return true
}

function validateBeforeSubmit() {
  const errors = []
  uiErrors.value = {}

  if (!String(form.value?.name || '').trim()) {
    errors.push({ field: 'name', message: 'Nama Site Investment wajib diisi' })
    uiErrors.value.name = 'Nama Site Investment wajib diisi'
  }
  if (!String(form.value?.location || '').trim()) {
    errors.push({ field: 'location', message: 'Lokasi wajib diisi' })
    uiErrors.value.location = 'Lokasi wajib diisi'
  }
  const start = String(form.value?.estimatedStartDate || '')
  const end = String(form.value?.estimatedCompletionDate || '')
  if (start && end && end < start) {
    errors.push({ field: 'estimatedCompletionDate', message: 'Estimasi Selesai tidak boleh lebih awal dari Estimasi Mulai.' })
    uiErrors.value.estimatedCompletionDate = 'Estimasi Selesai tidak boleh lebih awal dari Estimasi Mulai.'
  }
  if (errors.length > 0) {
    activateTab('si-tab-info')
    return errors
  }

  const materials = Array.isArray(form.value?.siteInvestMaterials) ? form.value.siteInvestMaterials : []
  const services = Array.isArray(form.value?.siteInvestServices) ? form.value.siteInvestServices : []
  const dids = Array.isArray(form.value?.siteInvestDids) ? form.value.siteInvestDids : []
  const materialInvalid = materials.some((item) => (Number(item?.quantity) || 0) > 0 && Number(item?.priceListLineId || 0) <= 0)
  if (materialInvalid) {
    errors.push({ field: 'siteInvestMaterials', message: 'Material dengan quantity > 0 wajib memilih price list line' })
    uiErrors.value.siteInvestMaterials = 'Material dengan quantity > 0 wajib memilih price list line'
    activateTab('si-tab-materials')
    return errors
  }

  const serviceInvalid = services.some((item) => (Number(item?.quantity) || 0) > 0 && Number(item?.priceListLineId || 0) <= 0)
  if (serviceInvalid) {
    errors.push({ field: 'siteInvestServices', message: 'Service dengan quantity > 0 wajib memilih price list line' })
    uiErrors.value.siteInvestServices = 'Service dengan quantity > 0 wajib memilih price list line'
    activateTab('si-tab-services')
    return errors
  }

  const didInvalid = dids.some((item) => (Number(item?.quantity) || 0) > 0 && Number(item?.priceListLineId || 0) <= 0)
  if (didInvalid) {
    errors.push({ field: 'siteInvestDids', message: 'DID dengan quantity > 0 wajib memilih price list line' })
    uiErrors.value.siteInvestDids = 'DID dengan quantity > 0 wajib memilih price list line'
    activateTab('si-tab-dids')
    return errors
  }

  if (materials.length === 0 && services.length === 0 && dids.length === 0) {
    errors.push({ field: 'items', message: 'Minimal isi satu item Material/Service/DID' })
    uiErrors.value.siteInvestMaterials = 'Minimal isi satu item Material/Service/DID'
    activateTab('si-tab-materials')
    return errors
  }

  return errors
}

const toNum = (v) => (v !== null && v !== undefined && v !== '') ? Number(v) : 0
const parseRupiahToNumber = (rupiahString) => Number(String(rupiahString || '').replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
const serviceLineField = (line, snakeKey) => line ? (line[snakeKey] ?? line[snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] ?? null) : null
const getServiceLineEffectivePrice = (line) => Number(line?.price || 0) + Number(serviceLineField(line, 'terminal_kit_count') || 0) + Number(serviceLineField(line, 'quota_priority') || 0) + Number(serviceLineField(line, 'new_service_line') || 0) + Number(serviceLineField(line, 'additional_data') || 0)

function onMarketingFeeInput(event) {
  form.value.marketingFee = parseRupiahToNumber(event.target?.value || '')
}

function onAttachmentChange(e) {
  const file = e.target.files?.[0]
  form.value.attachment = file || null
  e.target.value = ''
}


function onSiteChange(siteId) {
  const s = sites.value.find((x) => x.id === siteId)
  if (!s || !form.value) return
  form.value.location = s.address || ''
  form.value.lat = s.latitude != null ? String(s.latitude) : ''
  form.value.long = s.longitude != null ? String(s.longitude) : ''
}

const calculateMaterialSubtotal = (index) => {
  const item = form.value?.siteInvestMaterials?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}
const calculateServiceSubtotal = (index) => {
  const item = form.value?.siteInvestServices?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}
const calculateDidSubtotal = (index) => {
  const item = form.value?.siteInvestDids?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 1) * (Number(item.price) || 0)
}

const updateMaterialPriceFromInput = (index, event) => { form.value.siteInvestMaterials[index].price = Math.round(parseRupiahToNumber(event.target?.value || '')); calculateMaterialSubtotal(index) }
const updateServicePriceFromInput = (index, event) => { form.value.siteInvestServices[index].price = Math.round(parseRupiahToNumber(event.target?.value || '')); calculateServiceSubtotal(index) }
const updateDidPriceFromInput = (index, event) => { form.value.siteInvestDids[index].price = Math.round(parseRupiahToNumber(event.target?.value || '')); calculateDidSubtotal(index) }

function toggleMaterialOverride(index) {
  const item = form.value?.siteInvestMaterials?.[index]
  if (!item) return
  if (item.isPriceOverridden) {
    const line = priceListLinesProduct.value.find((l) => Number(l.id) === Number(item.priceListLineId))
    if (line) item.price = Number(line.price) || 0
    item.isPriceOverridden = false
    item.priceReason = ''
    calculateMaterialSubtotal(index)
  } else {
    item.isPriceOverridden = true
  }
}
function toggleServiceOverride(index) {
  const item = form.value?.siteInvestServices?.[index]
  if (!item) return
  if (item.isPriceOverridden) {
    const line = priceListLinesService.value.find((l) => Number(l.id) === Number(item.priceListLineId))
    if (line) item.price = getServiceLineEffectivePrice(line)
    item.isPriceOverridden = false
    item.priceReason = ''
    calculateServiceSubtotal(index)
  } else {
    item.isPriceOverridden = true
  }
}
function toggleDidOverride(index) {
  const item = form.value?.siteInvestDids?.[index]
  if (!item) return
  if (item.isPriceOverridden) {
    const line = priceListLinesDid.value.find((l) => Number(l.id) === Number(item.priceListLineId))
    if (line) item.price = Number(line.price) || 0
    item.isPriceOverridden = false
    item.priceReason = ''
    calculateDidSubtotal(index)
  } else {
    item.isPriceOverridden = true
  }
}

const onMaterialLineChange = (index, lineId) => {
  const line = priceListLinesProduct.value.find((l) => l.id === lineId)
  const item = form.value?.siteInvestMaterials?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.priceReason = ''
  item.subtotal = item.quantity * item.price
}
const onServiceLineChange = (index, lineId) => {
  const line = priceListLinesService.value.find((l) => String(l.id) === String(lineId))
  const item = form.value?.siteInvestServices?.[index]
  if (!line || !item) return
  item.price = getServiceLineEffectivePrice(line)
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.priceReason = ''
  item.subtotal = item.quantity * item.price
}
const onDidLineChange = (index, lineId) => {
  const line = priceListLinesDid.value.find((l) => Number(l.id) === Number(lineId))
  const item = form.value?.siteInvestDids?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.priceReason = ''
  item.subtotal = item.quantity * item.price
}

function mergePriceListLineLocal(cache, fullLine, fallbackPriceListId, fallbackPriceListName) {
  mergePriceListLine(cache, fullLine, fallbackPriceListId, fallbackPriceListName)
}

async function enrichPriceListLinesFromPriceList(priceListId) {
  const id = Number(priceListId)
  if (!id) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceListShow(id)}?includeLines=true`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return
    const priceList = await res.json()
    const lines = priceList.lines || []
    const pt = (l) => l.priceableType ?? l.priceable_type
    lines.filter((l) => pt(l) === 'product').forEach((l) => mergePriceListLineLocal(priceListLinesProduct.value, l, id, priceList.name))
    lines.filter((l) => pt(l) === 'service').forEach((l) => mergePriceListLineLocal(priceListLinesService.value, l, id, priceList.name))
    lines.filter((l) => pt(l) === 'did').forEach((l) => mergePriceListLineLocal(priceListLinesDid.value, l, id, priceList.name))
  } catch (e) {
    console.error('Error enriching price list lines:', e)
  }
}

async function ensureDidLinesForSelectedPriceList() {
  const plId = Number(selectedDidPriceListId.value ?? selectedPriceListId.value)
  if (!plId) return
  const hasLines = filterLinesByPriceListId(priceListLinesDid.value || [], plId).length > 0
  if (!hasLines) await enrichPriceListLinesFromPriceList(plId)
}

function mergeFdrPriceListLinesIntoCache(fdr) {
  const rows = [
    ...(fdr?.fdrItems ?? fdr?.fdr_items ?? []),
    ...(fdr?.fdrServices ?? fdr?.fdr_services ?? []),
    ...(fdr?.fdrDids ?? fdr?.fdr_dids ?? []),
  ]
  for (const row of rows) {
    const plLine = row?.priceListLine ?? row?.price_list_line
    if (!plLine?.id) continue
    const type = plLine.priceableType ?? plLine.priceable_type
    const plId = getLinePriceListId(plLine)
    if (type === 'product') mergePriceListLineLocal(priceListLinesProduct.value, plLine, plId)
    else if (type === 'service') mergePriceListLineLocal(priceListLinesService.value, plLine, plId)
    else if (type === 'did') mergePriceListLineLocal(priceListLinesDid.value, plLine, plId)
  }
}

function mergeSiteInvestFormLinesIntoCache() {
  const mergeRows = (rows, cache) => {
    for (const row of rows || []) {
      const plLine = row?.priceListLine ?? row?.price_list_line
      if (plLine?.id) mergePriceListLineLocal(cache, plLine, getLinePriceListId(plLine))
    }
  }
  mergeRows(form.value?.siteInvestMaterials, priceListLinesProduct.value)
  mergeRows(form.value?.siteInvestServices, priceListLinesService.value)
  mergeRows(form.value?.siteInvestDids, priceListLinesDid.value)
}

function findPriceListLineById(lineId) {
  const id = Number(lineId)
  if (!id) return null
  return [...priceListLinesProduct.value, ...priceListLinesService.value, ...priceListLinesDid.value]
    .find((l) => Number(l.id) === id) ?? null
}

function getPriceListMetaFromLine(plLine) {
  if (!plLine) return { id: null, name: null }
  const id = plLine.priceListId ?? plLine.price_list_id ?? plLine.priceList?.id ?? plLine.price_list?.id ?? null
  const name = plLine.priceList?.name ?? plLine.price_list?.name ?? null
  return { id: id != null ? Number(id) : null, name }
}

function resolvePriceListIdFromRows(rows) {
  const counts = new Map()
  let fallbackName = null

  for (const row of rows || []) {
    const plLine = row?.priceListLine ?? row?.price_list_line
    let { id, name } = getPriceListMetaFromLine(plLine)

    if (!id) {
      const lineId = Number(row?.priceListLineId ?? row?.price_list_line_id)
      const cached = findPriceListLineById(lineId)
      if (cached) {
        id = getLinePriceListId(cached)
        name = cached.price_list?.name ?? cached.priceList?.name ?? name
      }
    }

    if (id) {
      counts.set(id, (counts.get(id) || 0) + 1)
      if (!fallbackName && name) fallbackName = name
    }
  }

  let bestId = null
  let max = 0
  for (const [id, count] of counts) {
    if (count > max) {
      max = count
      bestId = id
    }
  }

  return { id: bestId, name: fallbackName }
}

function ensurePriceListOption(priceListId, name) {
  const id = Number(priceListId)
  if (!id) return
  const exists = priceListOptions.value.some((pl) => Number(pl.id) === id)
  if (!exists) {
    priceListOptions.value = [...priceListOptions.value, { id, name: name || `Price List #${id}` }]
  }
}

function applyPriceListSelection(priceListId, priceListName) {
  const id = Number(priceListId)
  if (!id) {
    selectedPriceListId.value = null
    selectedDidPriceListId.value = null
    return
  }
  const name = priceListName
    ?? priceListOptions.value.find((pl) => Number(pl.id) === id)?.name
    ?? undefined
  ensurePriceListOption(id, name)
  selectedPriceListId.value = id
  selectedDidPriceListId.value = id
}

function syncPriceListSelectionFromForm() {
  const rows = [
    ...(form.value?.siteInvestMaterials || []),
    ...(form.value?.siteInvestServices || []),
    ...(form.value?.siteInvestDids || []),
  ]
  const { id, name } = resolvePriceListIdFromRows(rows)
  if (id) applyPriceListSelection(id, name)
}

function syncPriceListSelectionFromFdr(fdr) {
  const rows = [
    ...(fdr?.fdrItems ?? fdr?.fdr_items ?? []),
    ...(fdr?.fdrServices ?? fdr?.fdr_services ?? []),
    ...(fdr?.fdrDids ?? fdr?.fdr_dids ?? []),
  ]
  const { id, name } = resolvePriceListIdFromRows(rows)
  if (id) applyPriceListSelection(id, name)
}

async function onDidPriceListSelect(priceListId) {
  if (!form.value) return
  if (!priceListId) { form.value.siteInvestDids = []; return }
  const plId = Number(priceListId)
  await ensureDidLinesForSelectedPriceList()
  const lines = filterLinesByPriceListId(priceListLinesDid.value || [], plId)
  form.value.siteInvestDids = lines.map((line) => ({ priceListLineId: line.id, quantity: Number(line.quantity) || 1, price: Number(line.price) || 0, subtotal: (Number(line.quantity) || 1) * (Number(line.price) || 0), isPriceOverridden: false, priceReason: '' }))
  if (!form.value.siteInvestDids.length) siteInvestStore.addDidItem()
}

async function onPriceListSelect(priceListId) {
  if (!form.value || !priceListId) return
  const plId = Number(priceListId)
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.priceListShow(plId)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
  if (!res.ok) return
  const priceList = await res.json()
  const lines = priceList.lines || []
  const pt = (l) => l.priceableType ?? l.priceable_type
  form.value.siteInvestMaterials = lines.filter((l) => pt(l) === 'product').map((l) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false, priceReason: '' }))
  form.value.siteInvestServices = lines.filter((l) => pt(l) === 'service').map((l) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: getServiceLineEffectivePrice(l), subtotal: (toNum(l.quantity) || 1) * getServiceLineEffectivePrice(l), isPriceOverridden: false, priceReason: '' }))
  form.value.siteInvestDids = lines.filter((l) => pt(l) === 'did').map((l) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false, priceReason: '' }))
  selectedDidPriceListId.value = plId
  lines.filter((l) => pt(l) === 'product').forEach((l) => mergePriceListLineLocal(priceListLinesProduct.value, l, plId, priceList.name))
  lines.filter((l) => pt(l) === 'service').forEach((l) => mergePriceListLineLocal(priceListLinesService.value, l, plId, priceList.name))
  lines.filter((l) => pt(l) === 'did').forEach((l) => mergePriceListLineLocal(priceListLinesDid.value, l, plId, priceList.name))
  if (!form.value.siteInvestDids.length) siteInvestStore.addDidItem()
}

async function onFdrSelect(fdrId) {
  if (!form.value) return
  if (!fdrId) {
    applyPriceListSelection(null)
    return
  }
  await fdrStore.getFdrDetails(fdrId)
  const fdr = fdrStore.fdr
  if (!fdr) return
  form.value.fdrId = fdr.id
  form.value.name = fdr.name || form.value.name
  form.value.customerId = fdr.customerId ?? fdr.customer_id ?? null
  form.value.siteId = fdr.siteId ?? fdr.site_id ?? null
  form.value.businessSchemeId = fdr.businessSchemeId ?? fdr.business_scheme_id ?? null
  form.value.priority = fdr.priority || 'medium'
  form.value.location = fdr.location || form.value.location
  form.value.siteInvestMaterials = (fdr.fdrItems ?? fdr.fdr_items ?? []).map((i) => ({ priceListLineId: i.priceListLineId ?? i.price_list_line_id ?? 0, quantity: Number(i.quantity) || 1, price: Number(i.price) || 0, subtotal: Number(i.subtotal) || 0, isPriceOverridden: false, priceReason: '' }))
  form.value.siteInvestServices = (fdr.fdrServices ?? fdr.fdr_services ?? []).map((s) => ({ priceListLineId: s.priceListLineId ?? s.price_list_line_id ?? 0, quantity: Number(s.quantity) || 1, price: Number(s.price) || 0, subtotal: Number(s.subtotal) || 0, isPriceOverridden: false, priceReason: '' }))
  form.value.siteInvestDids = (fdr.fdrDids ?? fdr.fdr_dids ?? []).map((d) => ({ priceListLineId: d.priceListLineId ?? d.price_list_line_id ?? 0, quantity: Number(d.quantity) || 1, price: Number(d.price) || 0, subtotal: Number(d.subtotal) || 0, isPriceOverridden: false, priceReason: '' }))
  syncPriceListSelectionFromFdr(fdr)
  mergeFdrPriceListLinesIntoCache(fdr)
  const plId = selectedPriceListId.value
  if (plId) await enrichPriceListLinesFromPriceList(plId)
  if (!form.value.siteInvestDids.length) siteInvestStore.addDidItem()
}

async function fetchMasters() {
  const { $api } = useNuxtApp()
  const [fdrRes, priceListRes, siteRes, bsRes, preparedByRes] = await Promise.all([
    fetch(`${$api.fdr()}?page=1&rows=500&includeItems=false`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.priceList()}?page=1&rows=500&isActive=true`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.sites()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.businessSchemes()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch($api.siteInvestmentPreparedByOptions(), { headers: { Accept: 'application/json' }, credentials: 'include' }),
  ])
  if (fdrRes.ok) fdrsForSelect.value = (await fdrRes.json()).data || []
  if (priceListRes.ok) priceListOptions.value = (await priceListRes.json()).data || []
  if (siteRes.ok) sites.value = (await siteRes.json()).data || []
  if (bsRes.ok) businessSchemes.value = (await bsRes.json()).data || []
  if (preparedByRes.ok) {
    const j = await preparedByRes.json()
    pegawaiOptions.value = mapPegawaiToOptions(j.data ?? j)
  }
  await customerStore.fetchCustomers()
  const [productLines, serviceLines, didLines] = await Promise.all([
    siteInvestStore.fetchPriceListLines('product'),
    siteInvestStore.fetchPriceListLines('service'),
    siteInvestStore.fetchPriceListLines('did'),
  ])
  priceListLinesProduct.value = productLines
  priceListLinesService.value = serviceLines
  priceListLinesDid.value = didLines
}

async function initForm() {
  siteInvestStore.closeModal()
  await fetchMasters()
  if (quotationId.value) {
    await siteInvestStore.openModal({ id: quotationId.value })
    siteInvestStore.showModal = false
  } else {
    siteInvestStore.openModal(null)
    siteInvestStore.showModal = false
  }
  if (!Array.isArray(form.value.siteInvestMaterials) || form.value.siteInvestMaterials.length === 0) siteInvestStore.addMaterialItem()
  if (!Array.isArray(form.value.siteInvestServices) || form.value.siteInvestServices.length === 0) siteInvestStore.addServiceItem()
  if (!Array.isArray(form.value.siteInvestDids) || form.value.siteInvestDids.length === 0) siteInvestStore.addDidItem()
  mergeSiteInvestFormLinesIntoCache()
  if (route.query.fromFdr && typeof route.query.fromFdr === 'string') await onFdrSelect(route.query.fromFdr)
  else {
    syncPriceListSelectionFromForm()
    const plId = selectedPriceListId.value
    if (plId) await enrichPriceListLinesFromPriceList(plId)
  }
  await ensureDidLinesForSelectedPriceList()
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
  const preErrors = validateBeforeSubmit()
  if (preErrors.length > 0) {
    siteInvestStore.validationErrors = preErrors
    toast.error({
      title: 'Validasi',
      message: preErrors[0]?.message || 'Lengkapi data yang wajib diisi',
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }

  form.value.marketingFee = parseRupiahToNumber(form.value.marketingFee) || 0
  const saved = await siteInvestStore.saveSiteInvest({ navigateToList: true })
  if (!saved) {
    const list = Array.isArray(siteInvestStore.validationErrors) ? siteInvestStore.validationErrors : []
    for (const item of list) {
      if (item?.field && item?.message) uiErrors.value[item.field] = item.message
    }
    const tab = firstErrorTab(list, SI_FIELD_TABS)
    if (tab) activateTab(tab)
  }
}

onMounted(async () => {
  await initForm()
  await nextTick()
})

watch([selectedDidPriceListId, selectedPriceListId], async () => {
  await ensureDidLinesForSelectedPriceList()
})
</script>

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
.repeater-cols-4 {
  grid-template-columns: 3fr 1fr 1.5fr 1.8fr;
}
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
  color: #dc3545;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1;
}
.repeater-delete-btn:hover {
  background: #dc3545;
  color: #fff;
  border-color: #dc3545;
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
  box-shadow: 0 0 0 0.15rem rgba(253, 126, 20, 0.15) !important;
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
  border-color: #ffc107 !important;
  background: #fffef5 !important;
  color: #856404;
}
.price-reason-input::placeholder { color: #c8a800; }

.investment-summary-card {
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.06);
}

.investment-summary-title {
  margin: 0;
  padding: 14px 18px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid #e0e7ff;
}

.investment-summary-body {
  padding: 16px 18px 18px;
}

.investment-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;
}

.investment-summary-label {
  color: #64748b;
  font-weight: 500;
}

.investment-summary-value {
  font-weight: 600;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.investment-summary-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e7ff, transparent);
  margin: 10px 0;
}

.investment-summary-row-total .investment-summary-value {
  font-weight: 700;
  color: #4f46e5;
}

.investment-summary-row-grand {
  padding-top: 12px;
  margin-top: 2px;
}

.investment-summary-row-grand .investment-summary-label {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.investment-summary-row-grand .investment-summary-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #4f46e5;
}
</style>
