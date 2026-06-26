<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <NuxtLink to="/sales/fdr" class="text-muted small text-decoration-none">FDR</NuxtLink>
            <span class="text-muted small">/</span>
            <span class="text-muted small">{{ pageTitle }}</span>
          </div>
          <h4 class="mb-0">{{ pageTitle }}</h4>
          <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/sales/fdr" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-xl-8 col-12">
          <div class="card">
            <div class="card-body">
              <form @submit.prevent="onSubmit">
                <div v-if="validationErrors?.length" class="alert alert-warning mb-4">
                  <ul class="mb-0 ps-3">
                    <li v-for="(err, i) in validationErrors" :key="i">{{ err?.message || JSON.stringify(err) }}</li>
                  </ul>
                </div>

                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#fdr-tab-info" type="button">
                      <span class="d-none d-sm-block">Informasi</span>
                      <span class="d-sm-none ri-information-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#fdr-tab-materials" type="button">
                      <span class="d-none d-sm-block">Material/Product</span>
                      <span class="d-sm-none ri-box-3-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#fdr-tab-services" type="button">
                      <span class="d-none d-sm-block">Services</span>
                      <span class="d-sm-none ri-service-line"></span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#fdr-tab-dids" type="button">
                      <span class="d-none d-sm-block">DID</span>
                      <span class="d-sm-none ri-phone-line"></span>
                    </button>
                  </li>
                </ul>

                <div class="tab-content pt-4">
                  <div id="fdr-tab-info" class="tab-pane fade show active">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Nama Project</label>
                        <input v-model="form.name" class="form-control" :class="{ 'is-invalid': uiErrors.name }" placeholder="Nama">
                        <div v-if="uiErrors.name" class="invalid-feedback d-block">{{ uiErrors.name }}</div>
                      </div>
                      <div class="col-md-6"><label class="form-label">Customer</label><CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="getCustomerLabel" :reduce="getCustomerId" searchable clearable placeholder="Pilih Customer" /></div>
                      <div class="col-md-6"><label class="form-label">Site</label><CustomSelect2 v-model="form.siteId" :options="sites" :get-option-label="getSiteLabel" :reduce="getSiteId" searchable clearable placeholder="Pilih Site" @update:modelValue="onSiteChange" /></div>
                      <div class="col-md-6"><label class="form-label">Business Scheme</label><CustomSelect2 v-model="form.businessSchemeId" :options="businessSchemes" :get-option-label="getBranchLabel" :reduce="getBranchId" searchable clearable placeholder="Pilih Business Scheme" /></div>
                      <div class="col-md-12">
                        <label class="form-label">Isi dari Price List</label>
                        <CustomSelect2 v-model="selectedPriceListId" :options="priceListOptions" :get-option-label="getPriceListLabel" :reduce="getPriceListId" searchable clearable placeholder="Pilih Price List" @update:modelValue="onPriceListSelect" />
                        <small class="text-muted">Autofill material, service, dan DID dari Price List.</small>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Lokasi</label>
                        <input v-model="form.location" class="form-control" :class="{ 'is-invalid': uiErrors.location }" placeholder="Lokasi">
                        <div v-if="uiErrors.location" class="invalid-feedback d-block">{{ uiErrors.location }}</div>
                      </div>
                      <div class="col-md-4"><label class="form-label">Priority</label><CustomSelect2 v-model="form.priority" :options="priorityOptions" :get-option-label="getOptionLabel" :reduce="getOptionValue" clearable /></div>
                      <div class="col-md-4"><label class="form-label">Quantity</label><input type="number" v-model.number="form.quantity" class="form-control" min="1"></div>
                      <div class="col-md-4"><label class="form-label">Tanggal FDR</label><input type="date" v-model="form.fdrDate" class="form-control"></div>
                      <div class="col-md-4"><label class="form-label">Estimasi Mulai</label><input type="date" v-model="form.estimatedStartDate" class="form-control"></div>
                      <div class="col-md-4"><label class="form-label">Estimasi Selesai</label><input type="date" v-model="form.estimatedCompletionDate" class="form-control"></div>
                      <div class="col-md-12"><div class="form-check form-switch"><input id="pocNeededForm" class="form-check-input" type="checkbox" v-model="form.pocNeeded"><label class="form-check-label" for="pocNeededForm">POC Needed</label></div></div>
                      <div class="col-md-12"><label class="form-label">Notes</label><textarea v-model="form.notes" class="form-control" rows="3"></textarea></div>
                      <div class="col-md-12"><label class="form-label">Attachment</label><input type="file" @change="onAttachmentChange" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"></div>
                    </div>
                  </div>

                  <div id="fdr-tab-materials" class="tab-pane fade">
                    <div v-if="uiErrors.fdrItems" class="alert alert-danger py-2 mb-3">
                      <i class="ri-error-warning-line me-1"></i>{{ uiErrors.fdrItems }}
                    </div>
                    <div v-for="(item, index) in form.fdrItems" :key="'m'+index" class="row g-2 mb-2">
                      <div class="col-md-6"><CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesProduct" :get-option-label="getMaterialLineLabel" :reduce="getMaterialLineId" searchable clearable placeholder="Pilih Product" @update:modelValue="onItemLineChange(index, $event)" /></div>
                      <div class="col-md-2"><input type="number" v-model.number="item.quantity" @input="calculateItemSubtotal(index)" class="form-control" min="0.01" step="0.01"></div>
                      <div class="col-md-2"><input type="text" :value="formatRupiah(item.price)" @input="updateItemPriceFromInput(index, $event)" class="form-control"></div>
                      <div class="col-md-1"><input type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly></div>
                      <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="fdrStore.removeItem(index)">Hapus</button></div>
                    </div>
                    <button type="button" class="btn btn-primary w-100 mt-2" @click="fdrStore.addItem()">Tambah Material</button>
                  </div>

                  <div id="fdr-tab-services" class="tab-pane fade">
                    <div v-if="uiErrors.fdrServices" class="alert alert-danger py-2 mb-3">
                      <i class="ri-error-warning-line me-1"></i>{{ uiErrors.fdrServices }}
                    </div>
                    <div v-for="(item, index) in form.fdrServices" :key="'s'+index" class="row g-2 mb-2">
                      <div class="col-md-6"><CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesService" :get-option-label="getServiceLineLabel" :reduce="getServiceLineId" searchable clearable placeholder="Pilih Service" @update:modelValue="onServiceLineChange(index, $event)" /></div>
                      <div class="col-md-2"><input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" min="0.01" step="0.01"></div>
                      <div class="col-md-2"><input type="text" :value="formatRupiah(item.price)" @input="updateServicePriceFromInput(index, $event)" class="form-control"></div>
                      <div class="col-md-1"><input type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly></div>
                      <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="fdrStore.removeService(index)">Hapus</button></div>
                    </div>
                    <button type="button" class="btn btn-primary w-100 mt-2" @click="fdrStore.addService()">Tambah Service</button>
                  </div>

                  <div id="fdr-tab-dids" class="tab-pane fade">
                    <div v-if="uiErrors.fdrDids" class="alert alert-danger py-2 mb-3">
                      <i class="ri-error-warning-line me-1"></i>{{ uiErrors.fdrDids }}
                    </div>
                    <div v-for="(item, index) in form.fdrDids" :key="'d'+index" class="row g-2 mb-2">
                      <div class="col-md-6"><CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesDid" :get-option-label="getDidLineLabel" :reduce="getDidLineId" searchable clearable placeholder="Pilih DID" @update:modelValue="onDidLineChange(index, $event)" /></div>
                      <div class="col-md-2"><input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" min="1"></div>
                      <div class="col-md-2"><input type="text" :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(index, $event)" class="form-control"></div>
                      <div class="col-md-1"><input type="text" :value="formatRupiah(item.subtotal || (item.quantity || 1) * (item.price || 0))" class="form-control" readonly></div>
                      <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="fdrStore.removeDid(index)">Hapus</button></div>
                    </div>
                    <button type="button" class="btn btn-primary w-100 mt-2" @click="fdrStore.addDid()">Tambah DID</button>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <NuxtLink to="/sales/fdr" class="btn btn-outline-secondary">Batal</NuxtLink>
                  <button type="submit" class="btn btn-primary" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0 d-flex align-items-center"><i class="ri-menu-2-line me-2 text-primary"></i>Modul Sales</h5>
            </div>
            <div class="card-body px-5 pt-0 pb-5">
              <div class="list-group list-group-flush">
                <NuxtLink v-for="item in moduleNavItems" :key="item.to" :to="item.to" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3" :class="{ active: isModuleNavActive(item.to) }">
                  <span class="d-flex align-items-center gap-2"><i :class="item.icon" class="text-primary"></i>{{ item.label }}</span>
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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import CustomSelect2 from '~/components/CustomSelect2.vue'

const route = useRoute()
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const formatRupiah = useFormatRupiah()
const toast = useToast()
const uiErrors = ref<Record<string, string>>({})
const { form, saving, validationErrors } = storeToRefs(fdrStore)
const { customers } = storeToRefs(customerStore)

const fdrId = computed(() => route.params.id ? String(route.params.id) : null)
const pageTitle = computed(() => (fdrId.value ? 'Edit FDR' : 'Tambah FDR'))
const pageSubtitle = computed(() => (fdrId.value ? 'Perbarui data FDR.' : 'Isi form untuk membuat FDR baru.'))
const moduleNavItems = computed(() => [
  { label: 'FDR', to: '/sales/fdr', icon: 'ri-file-list-3-line' },
  { label: 'Quotation', to: '/sales/quotation', icon: 'ri-file-list-3-line' },
  { label: 'Sales Order', to: '/sales/sales-order', icon: 'ri-shopping-bag-3-line' },
])
const priorityOptions = ref([{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }])
const sites = ref<any[]>([])
const businessSchemes = ref<any[]>([])
const selectedPriceListId = ref<number | null>(null)
const priceListOptions = ref<any[]>([])
const priceListLinesProduct = ref<any[]>([])
const priceListLinesService = ref<any[]>([])
const priceListLinesDid = ref<any[]>([])

const getCustomerLabel = (c: any) => c ? c.name : ''
const getCustomerId = (c: any) => c ? c.id : null
const getOptionLabel = (o: any) => o ? o.label : ''
const getOptionValue = (o: any) => o ? o.value : null
const getSiteLabel = (s: any) => s ? `${s.code || ''} - ${s.name || ''}` : ''
const getSiteId = (s: any) => s ? s.id : null
const getBranchLabel = (b: any) => b ? `${b.code || ''} - ${b.name || ''}` : ''
const getBranchId = (b: any) => b ? b.id : null
const getPriceListLabel = (pl: any) => pl ? `${pl.name || ''}${pl.type ? ` (${pl.type})` : ''}` : '—'
const getPriceListId = (pl: any) => pl ? pl.id : null
const getMaterialLineLabel = (l: any) => l ? (l.product ? `${l.product.name} (${l.product.sku || ''})` : `Line #${l.id}`) : '—'
const getMaterialLineId = (l: any) => l ? l.id : null
const getServiceLineLabel = (l: any) => l ? (l.service ? l.service.name : `Line #${l.id}`) : '—'
const getServiceLineId = (l: any) => l ? l.id : null
const getDidLineLabel = (l: any) => l ? (l.did ? `${l.did.code} - ${l.did.name}` : `Line #${l.id}`) : '—'
const getDidLineId = (l: any) => l ? l.id : null

function isModuleNavActive(to: string) { return route.path === to || route.path.startsWith(`${to}/`) }
function toNum(v: any) { return (v !== null && v !== undefined && v !== '') ? Number(v) : 0 }
function parseRupiahToNumber(s: any) { return !s ? 0 : Number(String(s).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0 }
function activateTab(tabId: string) {
  if (typeof window === 'undefined') return
  const trigger = document.querySelector(`button[data-bs-target="#${tabId}"]`)
  if (!trigger || !(window as any).bootstrap?.Tab) return
  new (window as any).bootstrap.Tab(trigger).show()
}
function getServiceLineEffectivePriceFromLine(line: any) {
  const base = toNum(line?.price) || 0
  const tk = toNum(line?.terminalKitCount ?? line?.terminal_kit_count) || 0
  const qp = toNum(line?.quotaPriority ?? line?.quota_priority) || 0
  const nsl = toNum(line?.newServiceLine ?? line?.new_service_line) || 0
  const ad = toNum(line?.additionalData ?? line?.additional_data) || 0
  return base + tk + qp + nsl + ad
}

function onSiteChange(siteId: number) {
  const s = sites.value.find((x) => x.id === siteId)
  if (s && form.value) form.value.location = s.address || ''
}
function calculateItemSubtotal(index: number) {
  const item = form.value?.fdrItems?.[index]; if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}
function calculateServiceSubtotal(index: number) {
  const item = form.value?.fdrServices?.[index]; if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}
function calculateDidSubtotal(index: number) {
  const item = form.value?.fdrDids?.[index]; if (!item) return
  item.subtotal = (Number(item.quantity) || 1) * (Number(item.price) || 0)
}
function updateItemPriceFromInput(index: number, e: any) { if (!form.value?.fdrItems?.[index]) return; form.value.fdrItems[index].price = parseRupiahToNumber(e.target?.value); calculateItemSubtotal(index) }
function updateServicePriceFromInput(index: number, e: any) { if (!form.value?.fdrServices?.[index]) return; form.value.fdrServices[index].price = parseRupiahToNumber(e.target?.value); calculateServiceSubtotal(index) }
function updateDidPriceFromInput(index: number, e: any) { if (!form.value?.fdrDids?.[index]) return; form.value.fdrDids[index].price = parseRupiahToNumber(e.target?.value); calculateDidSubtotal(index) }

function onAttachmentChange(e: any) {
  const file = e.target.files?.[0]
  if (!form.value) return
  form.value.attachment = file || null
  form.value.attachmentPreview = file ? URL.createObjectURL(file) : null
  e.target.value = ''
}

async function onItemLineChange(index: number, lineId: number) {
  const line = priceListLinesProduct.value.find((l) => l.id === lineId)
  const item = form.value?.fdrItems?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}
async function onServiceLineChange(index: number, lineId: number) {
  const line = priceListLinesService.value.find((l) => l.id === lineId)
  const item = form.value?.fdrServices?.[index]
  if (!line || !item) return
  item.price = getServiceLineEffectivePriceFromLine(line)
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}
async function onDidLineChange(index: number, lineId: number) {
  const line = priceListLinesDid.value.find((l) => l.id === lineId)
  const item = form.value?.fdrDids?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

async function onPriceListSelect(priceListId: number | null) {
  if (!priceListId || !form.value) return
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
  if (!res.ok) return
  const priceList = await res.json()
  const lines = priceList.lines || []
  const pt = (l: any) => l.priceableType ?? l.priceable_type
  form.value.fdrItems = lines.filter((l: any) => pt(l) === 'product').map((l: any) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false }))
  form.value.fdrServices = lines.filter((l: any) => pt(l) === 'service').map((l: any) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: getServiceLineEffectivePriceFromLine(l), subtotal: (toNum(l.quantity) || 1) * getServiceLineEffectivePriceFromLine(l), isPriceOverridden: false }))
  form.value.fdrDids = lines.filter((l: any) => pt(l) === 'did').map((l: any) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false }))
  if (!form.value.fdrItems.length) fdrStore.addItem()
  if (!form.value.fdrServices.length) fdrStore.addService()
  if (!form.value.fdrDids.length) fdrStore.addDid()
}

async function loadMasters() {
  const { $api } = useNuxtApp()
  const [siteRes, bsRes, plRes, p, s, d] = await Promise.all([
    fetch(`${$api.sites()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.businessSchemes()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.priceList()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fdrStore.fetchPriceListLines('product'),
    fdrStore.fetchPriceListLines('service'),
    fdrStore.fetchPriceListLines('did'),
  ])
  sites.value = siteRes.ok ? ((await siteRes.json()).data || []) : []
  businessSchemes.value = bsRes.ok ? ((await bsRes.json()).data || []) : []
  priceListOptions.value = plRes.ok ? ((await plRes.json()).data || []) : []
  priceListLinesProduct.value = p; priceListLinesService.value = s; priceListLinesDid.value = d
}

async function initForm() {
  fdrStore.closeModal()
  await Promise.all([customerStore.fetchCustomers(), loadMasters()])
  if (fdrId.value) {
    await fdrStore.openModal({ id: fdrId.value })
    fdrStore.showModal = false
  } else {
    await fdrStore.openModal(null)
    fdrStore.showModal = false
  }
}

async function onSubmit() {
  uiErrors.value = {}
  const errors: Array<{ field: string; message: string; tab: string }> = []
  if (!String(form.value?.name || '').trim()) {
    errors.push({ field: 'name', message: 'Nama Project wajib diisi', tab: 'fdr-tab-info' })
    uiErrors.value.name = 'Nama Project wajib diisi'
  }
  if (!String(form.value?.location || '').trim()) {
    errors.push({ field: 'location', message: 'Lokasi wajib diisi', tab: 'fdr-tab-info' })
    uiErrors.value.location = 'Lokasi wajib diisi'
  }
  const items = Array.isArray(form.value?.fdrItems) ? form.value.fdrItems : []
  const services = Array.isArray(form.value?.fdrServices) ? form.value.fdrServices : []
  const dids = Array.isArray(form.value?.fdrDids) ? form.value.fdrDids : []
  const itemInvalid = items.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
  const serviceInvalid = services.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
  const didInvalid = dids.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
  if (itemInvalid) { errors.push({ field: 'fdrItems', message: 'Material dengan quantity > 0 wajib memilih price list line', tab: 'fdr-tab-materials' }); uiErrors.value.fdrItems = 'Material dengan quantity > 0 wajib memilih price list line' }
  if (serviceInvalid) { errors.push({ field: 'fdrServices', message: 'Service dengan quantity > 0 wajib memilih price list line', tab: 'fdr-tab-services' }); uiErrors.value.fdrServices = 'Service dengan quantity > 0 wajib memilih price list line' }
  if (didInvalid) { errors.push({ field: 'fdrDids', message: 'DID dengan quantity > 0 wajib memilih price list line', tab: 'fdr-tab-dids' }); uiErrors.value.fdrDids = 'DID dengan quantity > 0 wajib memilih price list line' }
  if (!items.length && !services.length && !dids.length) {
    errors.push({ field: 'fdrItems', message: 'Minimal isi satu item Material/Service/DID', tab: 'fdr-tab-materials' })
    uiErrors.value.fdrItems = 'Minimal isi satu item Material/Service/DID'
  }
  if (errors.length > 0) {
    fdrStore.validationErrors = errors.map((e) => ({ [e.field]: [e.message] }))
    activateTab(errors[0].tab)
    toast.error({ title: 'Validasi', message: errors[0].message, color: 'red', position: 'topRight', layout: 2 })
    return
  }
  await fdrStore.saveFdr({ navigateToList: true })
}

onMounted(initForm)
</script>
