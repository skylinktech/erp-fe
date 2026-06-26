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
              <form @submit.prevent="handleSubmit" novalidate>
            <div v-if="validationErrors?.length" class="alert alert-warning mb-4">
              <ul class="mb-0 ps-3">
                <li v-for="(error, index) in validationErrors" :key="index">{{ JSON.stringify(error) }}</li>
              </ul>
            </div>
            <div class="row">
              <div class="col">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#si-tab-info" role="tab" type="button">
                      <span class="d-none d-sm-block">Informasi</span>
                      <span class="d-sm-none ri-information-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#si-tab-materials" role="tab" type="button">
                      <span class="d-none d-sm-block">Material/Product</span>
                      <span class="d-sm-none ri-box-3-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#si-tab-services" role="tab" type="button">
                      <span class="d-none d-sm-block">Services</span>
                      <span class="d-sm-none ri-service-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#si-tab-dids" role="tab" type="button">
                      <span class="d-none d-sm-block">DID</span>
                      <span class="d-sm-none ri-phone-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#si-tab-budgets" role="tab" type="button">
                      <span class="d-none d-sm-block">Budget</span>
                      <span class="d-sm-none ri-money-dollar-circle-line"></span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-4">
              <div id="si-tab-info" class="tab-pane fade show active" role="tabpanel">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nama Site Investment</label>
                    <input v-model="form.name" class="form-control" :class="{ 'is-invalid': uiErrors.name }" placeholder="Nama Site Investment">
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
                    <label class="form-label">Lokasi</label>
                    <input v-model="form.location" class="form-control" :class="{ 'is-invalid': uiErrors.location }" placeholder="Lokasi">
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
                    <label class="form-label">Estimasi Mulai</label>
                    <input type="date" v-model="form.estimatedStartDate" class="form-control">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Estimasi Selesai</label>
                    <input type="date" v-model="form.estimatedCompletionDate" class="form-control">
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

              <div id="si-tab-materials" class="tab-pane fade" role="tabpanel">
                <div v-if="uiErrors.siteInvestMaterials" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestMaterials }}
                </div>
                <div v-for="(item, index) in form.siteInvestMaterials" :key="'m-'+index" class="row g-2 mb-2">
                  <div class="col-md-6"><CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesProduct" :get-option-label="getMaterialLineLabel" :reduce="getMaterialLineId" placeholder="Pilih Material" @update:modelValue="onMaterialLineChange(index, $event)" /></div>
                  <div class="col-md-2"><input type="number" v-model.number="item.quantity" @input="calculateMaterialSubtotal(index)" class="form-control" min="0.01"></div>
                  <div class="col-md-2"><input :value="formatRupiah(item.price)" @input="updateMaterialPriceFromInput(index, $event)" class="form-control"></div>
                  <div class="col-md-1"><input :value="formatRupiah(item.subtotal)" class="form-control" readonly></div>
                  <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="siteInvestStore.removeMaterialItem(index)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="siteInvestStore.addMaterialItem()">Tambah Material</button>
              </div>

              <div id="si-tab-services" class="tab-pane fade" role="tabpanel">
                <div v-if="uiErrors.siteInvestServices" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestServices }}
                </div>
                <div v-for="(item, index) in form.siteInvestServices" :key="'s-'+index" class="row g-2 mb-2">
                  <div class="col-md-6"><CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesService" :get-option-label="getServiceLineLabel" :reduce="getServiceLineId" placeholder="Pilih Service" @update:modelValue="onServiceLineChange(index, $event)" /></div>
                  <div class="col-md-2"><input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" min="0.01"></div>
                  <div class="col-md-2"><input :value="formatRupiah(item.price)" @input="updateServicePriceFromInput(index, $event)" class="form-control"></div>
                  <div class="col-md-1"><input :value="formatRupiah(item.subtotal)" class="form-control" readonly></div>
                  <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="siteInvestStore.removeServiceItem(index)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="siteInvestStore.addServiceItem()">Tambah Service</button>
              </div>

              <div id="si-tab-dids" class="tab-pane fade" role="tabpanel">
                <div v-if="uiErrors.siteInvestDids" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestDids }}
                </div>
                <div class="mb-3">
                  <CustomSelect2 v-model="selectedDidPriceListId" :options="priceListOptionsDid" :get-option-label="getDidPriceListLabel" :reduce="getDidPriceListId" placeholder="Pilih Price List DID" @update:modelValue="onDidPriceListSelect" />
                </div>
                <div v-for="(item, index) in form.siteInvestDids" :key="'d-'+index" class="row g-2 mb-2">
                  <div class="col-md-6"><input :value="getDidLineLabel(item)" class="form-control" readonly></div>
                  <div class="col-md-2"><input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" min="1"></div>
                  <div class="col-md-2"><input :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(index, $event)" class="form-control"></div>
                  <div class="col-md-1"><input :value="formatRupiah(item.subtotal)" class="form-control" readonly></div>
                  <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="siteInvestStore.removeDidItem(index)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="siteInvestStore.addDidItem()">Tambah DID</button>
              </div>

              <div id="si-tab-budgets" class="tab-pane fade" role="tabpanel">
                <div v-if="uiErrors.siteInvestBudgets" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ uiErrors.siteInvestBudgets }}
                </div>
                <div v-for="(item, index) in (form.siteInvestBudgets || [])" :key="'b-'+index" class="row g-2 mb-2">
                  <div class="col-md-5"><CustomSelect2 v-model="item.budgetSourceId" :options="approvedBudgets || []" :get-option-label="getBudgetLabel" :reduce="getBudgetId" placeholder="Sumber Budget" /></div>
                  <div class="col-md-5"><CustomSelect2 v-model="item.budgetHolderId" :options="usersForBudget" :get-option-label="getUserLabel" :reduce="getUserId" placeholder="Budget Holder" /></div>
                  <div class="col-md-2"><button type="button" class="btn btn-outline-danger w-100" @click="removeBudgetItem(index)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="addBudgetItem()">Tambah Budget</button>
              </div>
            </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <NuxtLink to="/sales/site-investment" class="btn btn-outline-secondary">Batal</NuxtLink>
                  <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
                </div>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteInvestStore } from '~/stores/site-invest'
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import { useBudgetStore } from '~/stores/budget'
import CustomSelect2 from '~/components/CustomSelect2.vue'

const route = useRoute()
const siteInvestStore = useSiteInvestStore()
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const budgetStore = useBudgetStore()
const formatRupiah = useFormatRupiah()
const toast = useToast()
const uiErrors = ref({})

const { loading, saving, form, isEditMode, validationErrors } = storeToRefs(siteInvestStore)
const { customers } = storeToRefs(customerStore)
const { budgets } = storeToRefs(budgetStore)

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
const usersForBudget = ref([])
const pegawaiOptions = ref([])
const priceListOptions = ref([])

const approvedBudgets = computed(() => (budgets.value || []).filter((b) => b.status === 'approved'))
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
  const seen = new Set()
  const options = []
  for (const line of priceListLinesDid.value || []) {
    const id = line.price_list_id ?? line.priceList?.id
    if (id != null && !seen.has(id)) {
      seen.add(id)
      options.push({ id, name: line.price_list?.name ?? line.priceList?.name ?? `Price List #${id}` })
    }
  }
  return options
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
const getDidPriceListLabel = (pl) => pl ? pl.name : '—'
const getDidPriceListId = (pl) => pl ? pl.id : null
const getBudgetLabel = (b) => b ? `${b.budgetCode || b.budget_code || ''} - ${b.budgetName || b.budget_name || ''}` : '—'
const getBudgetId = (b) => b ? b.id : null
const getUserLabel = (u) => u ? (u.fullName || u.email || '') : ''
const getUserId = (u) => u ? u.id : null
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
  if (typeof window === 'undefined') return
  const trigger = document.querySelector(`button[data-bs-target="#${tabId}"]`)
  if (!trigger || !window.bootstrap?.Tab) return
  const tab = new window.bootstrap.Tab(trigger)
  tab.show()
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
  if (errors.length > 0) {
    activateTab('si-tab-info')
    return errors
  }

  const materials = Array.isArray(form.value?.siteInvestMaterials) ? form.value.siteInvestMaterials : []
  const services = Array.isArray(form.value?.siteInvestServices) ? form.value.siteInvestServices : []
  const dids = Array.isArray(form.value?.siteInvestDids) ? form.value.siteInvestDids : []
  const budgets = Array.isArray(form.value?.siteInvestBudgets) ? form.value.siteInvestBudgets : []

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

  const budgetInvalid = budgets.some((item) => {
    const src = Number(item?.budgetSourceId || 0)
    const holder = Number(item?.budgetHolderId || 0)
    return (src > 0 && holder <= 0) || (holder > 0 && src <= 0)
  })
  if (budgetInvalid) {
    errors.push({ field: 'siteInvestBudgets', message: 'Budget Source dan Budget Holder harus diisi berpasangan' })
    uiErrors.value.siteInvestBudgets = 'Budget Source dan Budget Holder harus diisi berpasangan'
    activateTab('si-tab-budgets')
    return errors
  }

  if (materials.length === 0 && services.length === 0 && dids.length === 0 && budgets.length === 0) {
    errors.push({ field: 'items', message: 'Minimal isi satu item Material/Service/DID/Budget' })
    uiErrors.value.siteInvestMaterials = 'Minimal isi satu item Material/Service/DID/Budget'
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

function addBudgetItem() {
  if (!form.value.siteInvestBudgets) form.value.siteInvestBudgets = []
  form.value.siteInvestBudgets.push({ budgetSourceId: null, budgetHolderId: null })
}
function removeBudgetItem(index) { form.value.siteInvestBudgets?.splice(index, 1) }

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

const onMaterialLineChange = (index, lineId) => {
  const line = priceListLinesProduct.value.find((l) => l.id === lineId)
  const item = form.value?.siteInvestMaterials?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.subtotal = item.quantity * item.price
}
const onServiceLineChange = (index, lineId) => {
  const line = priceListLinesService.value.find((l) => String(l.id) === String(lineId))
  const item = form.value?.siteInvestServices?.[index]
  if (!line || !item) return
  item.price = getServiceLineEffectivePrice(line)
  item.quantity = Number(line.quantity) || 1
  item.subtotal = item.quantity * item.price
}

function getDidLineLabel(item) {
  if (!item?.priceListLineId) return '—'
  const line = priceListLinesDid.value.find((l) => l.id === item.priceListLineId)
  if (!line) return '—'
  return line.did ? `${line.did.code || ''} - ${line.did.name || ''}`.trim() : `Line #${line.id}`
}

function onDidPriceListSelect(priceListId) {
  if (!form.value) return
  if (!priceListId) { form.value.siteInvestDids = []; return }
  const lines = (priceListLinesDid.value || []).filter((l) => (l.price_list_id ?? l.priceList?.id) === priceListId)
  form.value.siteInvestDids = lines.map((line) => ({ priceListLineId: line.id, quantity: Number(line.quantity) || 1, price: Number(line.price) || 0, subtotal: (Number(line.quantity) || 1) * (Number(line.price) || 0), isPriceOverridden: false }))
}

async function onPriceListSelect(priceListId) {
  if (!form.value || !priceListId) return
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
  if (!res.ok) return
  const priceList = await res.json()
  const lines = priceList.lines || []
  const pt = (l) => l.priceableType ?? l.priceable_type
  form.value.siteInvestMaterials = lines.filter((l) => pt(l) === 'product').map((l) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false }))
  form.value.siteInvestServices = lines.filter((l) => pt(l) === 'service').map((l) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: getServiceLineEffectivePrice(l), subtotal: (toNum(l.quantity) || 1) * getServiceLineEffectivePrice(l), isPriceOverridden: false }))
  form.value.siteInvestDids = lines.filter((l) => pt(l) === 'did').map((l) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false }))
  selectedDidPriceListId.value = priceList.id
}

async function onFdrSelect(fdrId) {
  if (!fdrId || !form.value) return
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
  form.value.siteInvestMaterials = (fdr.fdrItems ?? fdr.fdr_items ?? []).map((i) => ({ priceListLineId: i.priceListLineId ?? i.price_list_line_id ?? 0, quantity: Number(i.quantity) || 1, price: Number(i.price) || 0, subtotal: Number(i.subtotal) || 0, isPriceOverridden: false }))
  form.value.siteInvestServices = (fdr.fdrServices ?? fdr.fdr_services ?? []).map((s) => ({ priceListLineId: s.priceListLineId ?? s.price_list_line_id ?? 0, quantity: Number(s.quantity) || 1, price: Number(s.price) || 0, subtotal: Number(s.subtotal) || 0, isPriceOverridden: false }))
  form.value.siteInvestDids = (fdr.fdrDids ?? fdr.fdr_dids ?? []).map((d) => ({ priceListLineId: d.priceListLineId ?? d.price_list_line_id ?? 0, quantity: Number(d.quantity) || 1, price: Number(d.price) || 0, subtotal: Number(d.subtotal) || 0, isPriceOverridden: false }))
}

async function fetchMasters() {
  const { $api } = useNuxtApp()
  const [fdrRes, priceListRes, siteRes, bsRes, usersRes, preparedByRes] = await Promise.all([
    fetch(`${$api.fdr()}?page=1&rows=500&includeItems=false`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.priceList()}?page=1&rows=500&isActive=true`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.sites()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.businessSchemes()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.users()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch($api.siteInvestmentPreparedByOptions(), { headers: { Accept: 'application/json' }, credentials: 'include' }),
  ])
  if (fdrRes.ok) fdrsForSelect.value = (await fdrRes.json()).data || []
  if (priceListRes.ok) priceListOptions.value = (await priceListRes.json()).data || []
  if (siteRes.ok) sites.value = (await siteRes.json()).data || []
  if (bsRes.ok) businessSchemes.value = (await bsRes.json()).data || []
  if (usersRes.ok) usersForBudget.value = (await usersRes.json()).data || []
  if (preparedByRes.ok) {
    const j = await preparedByRes.json()
    pegawaiOptions.value = mapPegawaiToOptions(j.data ?? j)
  }
  await Promise.all([customerStore.fetchCustomers(), budgetStore.fetchBudgets(true)])
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
  if (!Array.isArray(form.value.siteInvestBudgets) || form.value.siteInvestBudgets.length === 0) addBudgetItem()
  if (route.query.fromFdr && typeof route.query.fromFdr === 'string') await onFdrSelect(route.query.fromFdr)
}

async function handleSubmit() {
  const preErrors = validateBeforeSubmit()
  if (preErrors.length > 0) {
    siteInvestStore.validationErrors = preErrors
    toast.error({
      title: 'Validasi',
      message: preErrors[0]?.message || 'Lengkapi data yang wajib diisi',
      color: 'red',
      position: 'topRight',
      layout: 2,
    })
    return
  }

  form.value.marketingFee = parseRupiahToNumber(form.value.marketingFee) || 0
  await siteInvestStore.saveSiteInvest({ navigateToList: true })
}

onMounted(async () => {
  await initForm()
  await nextTick()
})
</script>

<style scoped>
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
