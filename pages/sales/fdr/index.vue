<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3 text-muted">Memuat data FDR...</p>
        </div>
      </div>

      <div v-else class="container-xxl flex-grow-1">
        
        <p class="mb-6">List Form Design Request yang terdaftar di sistem</p>

        <!-- Statistics Cards -->
        <div class="row g-6 mb-6">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Total FDR</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-primary"><i class="ri-file-list-3-line"></i></span>
                  </div>
                </div>
                <div class="account-heading">
                  <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                  <span class="text-muted">FDR terdaftar</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Draft</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span>
                  </div>
                </div>
                <div class="account-heading">
                  <h5 class="mb-1">{{ stats.draft || 0 }}</h5>
                  <span class="text-muted">Draft</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Pending</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span>
                  </div>
                </div>
                <div class="account-heading">
                  <h5 class="mb-1">{{ stats.pending || 0 }}</h5>
                  <span class="text-muted">Pending</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Approved</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span>
                  </div>
                </div>
                <div class="account-heading">
                  <h5 class="mb-1">{{ stats.approved || 0 }}</h5>
                  <span class="text-muted">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-6">
          <div class="col-12">
            <CollapsibleFilterCard
              title="Filter FDR"
              description="Temukan semua Form Design Request perusahaan Anda"
              :has-active-filters="hasActiveFilters"
              @reset="resetFilters"
            >
              <FilterFieldsRow>
                <FilterField>
                  <label class="form-label">Filter Customer</label>
                  <CustomSelect2
                    v-model="filters.customerId"
                    :options="customers"
                    :get-option-label="getCustomerLabel"
                    :reduce="getCustomerId"
                    placeholder="Pilih Customer"
                    searchable
                    clearable
                  />
                </FilterField>
                <FilterField>
                  <label class="form-label">Filter Status</label>
                  <CustomSelect2
                    v-model="filters.status"
                    :options="statusOptions"
                    :get-option-label="getOptionLabel"
                    :reduce="getOptionValue"
                    placeholder="Pilih Status"
                    searchable
                    clearable
                  />
                </FilterField>
                <FilterField>
                  <label class="form-label">Filter Priority</label>
                  <CustomSelect2
                    v-model="filters.priority"
                    :options="priorityOptions"
                    :get-option-label="getOptionLabel"
                    :reduce="getOptionValue"
                    placeholder="Pilih Priority"
                    searchable
                    clearable
                  />
                </FilterField>
                <FilterField>
                  <label class="form-label">Tanggal Mulai</label>
                  <input type="date" v-model="filters.startDate" class="form-control" @change="onDateChange">
                </FilterField>
                <FilterField>
                  <label class="form-label">Tanggal Akhir</label>
                  <input type="date" v-model="filters.endDate" class="form-control" @change="onDateChange">
                </FilterField>
              </FilterFieldsRow>
            </CollapsibleFilterCard>
          </div>

          <!-- Table -->
          <div class="col-12">
            <div class="card">
              <ListPageTableHeader
                :rows="Number(tableControls.rows)"
                :rows-options="rowsPerPageOptionsArray"
                :search="globalFilterValue"
                search-placeholder="Cari FDR..."
                :export-disabled="loading"
                @update:rows="onToolbarRows"
                @update:search="(v) => { globalFilterValue = v }"
                @export="exportData"
              >
                <template #add>
                  <button
                      v-if="userHasRole('superadmin') || userHasPermission('create_fdr')"
                      type="button"
                      class="btn btn-primary fdr-add-button"
                      @click="navigateTo('/sales/fdr/form')"
                  >
                      <i class="ri-add-line me-1"></i>
                      Tambah
                  </button>
                </template>
              </ListPageTableHeader>
              <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable
                  ref="myDataTableRef"
                  :data="fdrs"
                  :rows="Number(params.rows)"
                  :loading="loading"
                  :totalRecords="totalRecords"
                  :first="params.first"
                  :lazy="true"
                  @page="onPage($event)"
                  @sort="onSort($event)"
                  responsiveLayout="scroll"
                  paginatorPosition="bottom"
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                >
                  <Column header="#" :sortable="false">
                    <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                  </Column>
                  <Column field="fdrNumber" header="FDR Number" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      <NuxtLink
                        :to="`/sales/fdr/detail/${slotProps.data.id}`"
                        class="text-primary text-decoration-underline"
                      >{{ slotProps.data.fdrNumber || '-' }}</NuxtLink>
                    </template>
                  </Column>
                  <Column field="name" header="Project Name" :sortable="true" class="text-nowrap"></Column>
                  <Column field="customer.name" header="Customer" :sortable="true" class="text-nowrap fw-semibold"></Column>
                  <Column field="location" header="Lokasi" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      <span :title="slotProps.data.location || ''">{{ truncateWords(slotProps.data.location, 4) }}</span>
                    </template>
                  </Column>
                  <Column field="businessScheme.name" header="Skema" :sortable="true" class="text-nowrap"></Column>
                  <Column field="priority" header="Priority" :sortable="true">
                    <template #body="slotProps">
                      <span :class="getPriorityBadgeClass(slotProps.data.priority)">{{ getPriorityBadgeText(slotProps.data.priority) }}</span>
                    </template>
                  </Column>
                  <Column field="status" header="Status" :sortable="true">
                    <template #body="slotProps">
                      <span :class="getStatusBadgeClass(slotProps.data)">{{ getStatusBadgeText(slotProps.data) }}</span>
                    </template>
                  </Column>
                  <Column field="grandTotal" header="Total" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">{{ formatRupiah(slotProps.data.grandTotal) }}</template>
                  </Column>
                  <Column field="fdrDate" header="Tanggal" :sortable="true">
                    <template #body="slotProps">{{ formatFdrDate(slotProps.data.fdrDate) }}</template>
                  </Column>
                  <Column field="attachment" header="Attachment" :sortable="false">
                    <template #body="slotProps">
                      <a v-if="slotProps.data.attachment" :href="getAttachmentUrl(slotProps.data.attachment)" target="_blank" rel="noopener noreferrer" download class="badge rounded-pill bg-label-primary" style="text-decoration: none;">
                        <i class="ri-attachment-2 me-1"></i> File
                      </a>
                      <span v-else class="text-muted">—</span>
                    </template>
                  </Column>
                  <Column header="Actions" :exportable="false" style="min-width:8rem">
                    <template #body="slotProps">
                      <div class="dropdown d-inline-block">
                        <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                          <i class="ri-more-2-fill"></i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li v-if="(userHasRole('superadmin') || userHasPermission('edit_fdr')) && slotProps.data.status === 'draft'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.submitFdr(slotProps.data.id)"><i class="ri-send-plane-line me-2"></i> Submit</a>
                          </li>
                          <li v-if="(userHasRole('superadmin') || userHasPermission('approve_fdr')) && slotProps.data.status === 'pending'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.approveFdr(slotProps.data.id)"><i class="ri-check-line me-2"></i> Approve</a>
                          </li>
                          <li v-if="(userHasRole('superadmin') || userHasPermission('approve_fdr')) && slotProps.data.status !== 'cancelled'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.cancelFdr(slotProps.data.id)"><i class="ri-close-circle-line me-2"></i> Cancel</a>
                          </li>
                          <li v-if="(userHasRole('superadmin') || userHasPermission('reject_fdr')) && slotProps.data.status === 'pending'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.rejectFdr(slotProps.data.id)"><i class="ri-close-line me-2"></i> Reject</a>
                          </li>
                          <li v-if="userHasRole('superadmin') || userHasPermission('edit_fdr')">
                            <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/sales/fdr/form/${slotProps.data.id}`)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                          </li>
                          <li v-if="userHasRole('superadmin') || userHasPermission('delete_fdr')">
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="fdrStore.deleteFdr(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                          </li>
                        </ul>
                      </div>
                    </template>
                  </Column>
                </MyDataTable>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { useImageUrl } from '~/composables/useImageUrl'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Column from 'primevue/column'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useDebounceFn } from '@vueuse/core'

const { setListTitle } = useDynamicTitle()
const route = useRoute()
const isInitialLoading = ref(true)
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()
const { getStatusBadge } = useApprovalStatus()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const { fdrs, loading, totalRecords, params, stats } = storeToRefs(fdrStore)
const { customers } = storeToRefs(customerStore)

const priceListLinesProduct = ref([])
const priceListLinesService = ref([])
const priceListLinesDid = ref([])
const selectedPriceListId = ref(null)
const priceListOptions = ref([])
const sites = ref([])
const businessSchemes = ref([])

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = ref([
  { label: 'Draft', value: 'draft' }, { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' }, { label: 'Cancelled', value: 'cancelled' },
])
const priorityOptions = ref([
  { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' },
])

const filters = ref({ customerId: null, status: null, priority: null, startDate: null, endDate: null })

const hasActiveFilters = computed(
  () =>
    !!filters.value.customerId ||
    !!filters.value.status ||
    !!filters.value.priority ||
    !!filters.value.startDate ||
    !!filters.value.endDate
)

function resetFilters() {
  filters.value.customerId = null
  filters.value.status = null
  filters.value.priority = null
  filters.value.startDate = null
  filters.value.endDate = null
}

const globalFilterValue = ref('')
const tableControls = ref({ rows: 10 })
const myDataTableRef = ref(null)

function formatFdrDate(v) {
  if (v == null || v === '') return '-'
  try {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return '-' }
}

function truncateWords(text, maxWords = 4) {
  const value = String(text || '').trim()
  if (!value) return '-'
  const words = value.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')} ...`
}

function getCustomerLabel(c) { return c ? c.name : '' }
function getCustomerId(c) { return c ? c.id : null }
function getOptionLabel(o) { return o ? o.label : '' }
function getOptionValue(o) { return o ? o.value : null }
function getSiteLabel(s) { return s ? `${s.code || ''} - ${s.name || ''}` : '' }
function getSiteId(s) { return s ? s.id : null }
function getBranchLabel(b) { return b ? `${b.code || ''} - ${b.name || ''}` : '' }
function getBranchId(b) { return b ? b.id : null }
function getPriceListLabel(pl) { return pl ? (pl.name || '') + (pl.type ? ` (${pl.type})` : '') || '—' : '—' }
function getPriceListId(pl) { return pl ? pl.id : null }
function toNum(v) { return (v !== null && v !== undefined && v !== '') ? Number(v) : 0 }
function getServiceLineEffectivePriceFromLine(line) {
  if (!line) return 0
  const base = toNum(line.price) || 0
  const tk = toNum(line.terminalKitCount ?? line.terminal_kit_count) || 0
  const qp = toNum(line.quotaPriority ?? line.quota_priority) || 0
  const nsl = toNum(line.newServiceLine ?? line.new_service_line) || 0
  const ad = toNum(line.additionalData ?? line.additional_data) || 0
  return base + tk + qp + nsl + ad
}
function getMaterialLineLabel(l) { return l ? (l.product ? `${l.product.name} (${l.product.sku || ''})` : `Line #${l.id}`) || '—' : '—' }
function getMaterialLineId(l) { return l ? l.id : null }
function getServiceLineLabel(l) { return l ? (l.service ? l.service.name : `Line #${l.id}`) || '—' : '—' }
function getServiceLineId(l) { return l ? l.id : null }
function getDidLineLabel(l) { return l ? (l.did ? `${l.did.code} - ${l.did.name}` : `Line #${l.id}`) || '—' : '—' }
function getDidLineId(l) { return l ? l.id : null }

const materialSubtotal = computed(() => (form.value?.fdrItems ?? []).reduce((s, i) => s + (Number(i.subtotal) || 0), 0))
const serviceSubtotal = computed(() => (form.value?.fdrServices ?? []).reduce((s, i) => s + (Number(i.subtotal) || 0), 0))
const didSubtotal = computed(() => (form.value?.fdrDids ?? []).reduce((s, i) => s + ((Number(i.quantity) || 1) * (Number(i.price) || 0)), 0))
const totalInvestment = computed(() => materialSubtotal.value + serviceSubtotal.value + didSubtotal.value)

const parseRupiahToNumber = (s) => !s ? 0 : Number(String(s).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0

async function onItemLineChange(index, lineId) {
  const line = priceListLinesProduct.value.find(l => l.id === lineId)
  if (!line || !form.value?.fdrItems?.[index]) return
  const item = form.value.fdrItems[index]
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

function calculateItemSubtotal(index) {
  const item = form.value?.fdrItems?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

function updateItemPriceFromInput(index, e) {
  const v = parseRupiahToNumber(e.target?.value || '')
  if (form.value.fdrItems?.[index]) { form.value.fdrItems[index].price = v; calculateItemSubtotal(index) }
}

function getServiceLineUnitPrice(line) {
  if (!line) return 0
  const base = Number(line.price) || 0
  const tk = Number(line.terminal_kit_count ?? line.terminalKitCount) || 0
  const qp = Number(line.quota_priority ?? line.quotaPriority) || 0
  const nsl = Number(line.new_service_line ?? line.newServiceLine) || 0
  const ad = Number(line.additional_data ?? line.additionalData) || 0
  return base + tk + qp + nsl + ad
}

async function onServiceLineChange(index, lineId) {
  const line = priceListLinesService.value.find(l => l.id === lineId)
  if (!line || !form.value?.fdrServices?.[index]) return
  const item = form.value.fdrServices[index]
  item.price = getServiceLineUnitPrice(line)
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

function calculateServiceSubtotal(index) {
  const item = form.value?.fdrServices?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

function updateServicePriceFromInput(index, e) {
  const v = parseRupiahToNumber(e.target?.value || '')
  if (form.value.fdrServices?.[index]) { form.value.fdrServices[index].price = v; calculateServiceSubtotal(index) }
}

async function onDidLineChange(index, lineId) {
  const line = priceListLinesDid.value.find(l => l.id === lineId)
  if (!line || !form.value?.fdrDids?.[index]) return
  const item = form.value.fdrDids[index]
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

function calculateDidSubtotal(index) {
  const item = form.value?.fdrDids?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 1) * (Number(item.price) || 0)
}

function updateDidPriceFromInput(index, e) {
  const v = parseRupiahToNumber(e.target?.value || '')
  if (form.value.fdrDids?.[index]) { form.value.fdrDids[index].price = v; calculateDidSubtotal(index) }
}

function onSiteChange(siteId) {
  const s = sites.value.find(x => x.id === siteId)
  if (s && form.value) { form.value.location = s.address || '' }
}

function onAttachmentChange(e) {
  const file = e.target.files?.[0]
  if (!form.value) return
  if (file) {
    if (file.size > 2 * 1024 * 1024) { useToast().error({ title: 'Error', message: 'Maks. 2MB', color: 'red' }); return }
    form.value.attachment = file
    form.value.attachmentPreview = URL.createObjectURL(file)
  } else { form.value.attachment = null; form.value.attachmentPreview = null }
  e.target.value = ''
}

const fetchPriceListLines = async () => {
  const [p, s, d] = await Promise.all([fdrStore.fetchPriceListLines('product'), fdrStore.fetchPriceListLines('service'), fdrStore.fetchPriceListLines('did')])
  priceListLinesProduct.value = p
  priceListLinesService.value = s
  priceListLinesDid.value = d
}

const fetchPriceListsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.priceList()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); priceListOptions.value = j.data || [] }
    else priceListOptions.value = []
  } catch (e) {
    console.error('Error fetching price lists for FDR:', e)
    priceListOptions.value = []
  }
}

async function onPriceListSelect(priceListId) {
  if (!form.value || !priceListId) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const priceList = await res.json()
    const lines = priceList.lines || []
    const pt = (l) => l.priceableType ?? l.priceable_type

    const productLines = lines.filter((l) => pt(l) === 'product')
    form.value.fdrItems = productLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = toNum(l.price) || 0
      return { priceListLineId: l.id, quantity: q, price: p, subtotal: toNum(l.subtotal) || q * p, isPriceOverridden: false }
    })

    const serviceLines = lines.filter((l) => pt(l) === 'service')
    const svcField = (l, key) => l[key] ?? l[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
    form.value.fdrServices = serviceLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = getServiceLineEffectivePriceFromLine(l)
      return {
        priceListLineId: l.id,
        quantity: q,
        price: p,
        subtotal: q * p,
        isPriceOverridden: false,
        terminalKitCount: svcField(l, 'terminalKitCount') != null ? Number(svcField(l, 'terminalKitCount')) : null,
        quotaPriority: svcField(l, 'quotaPriority') != null ? Number(svcField(l, 'quotaPriority')) : null,
        newServiceLine: svcField(l, 'newServiceLine') != null ? Number(svcField(l, 'newServiceLine')) : null,
        additionalData: svcField(l, 'additionalData') != null ? Number(svcField(l, 'additionalData')) : null,
      }
    })

    const didLines = lines.filter((l) => pt(l) === 'did')
    form.value.fdrDids = didLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = toNum(l.price) || 0
      return { priceListLineId: l.id, quantity: q, price: p, subtotal: toNum(l.subtotal) || q * p, isPriceOverridden: false }
    })

    const addIfMissing = (arr, item) => { if (item && !arr.find((x) => x.id === item.id)) arr.push(item) }
    productLines.forEach((l) => addIfMissing(priceListLinesProduct.value, l))
    serviceLines.forEach((l) => addIfMissing(priceListLinesService.value, l))
    didLines.forEach((l) => addIfMissing(priceListLinesDid.value, l))

    if (form.value.fdrItems.length === 0) fdrStore.addItem()
    if (form.value.fdrServices.length === 0) fdrStore.addService()
    if (form.value.fdrDids.length === 0) fdrStore.addDid()
  } catch (e) {
    console.error('Error filling FDR from price list:', e)
  }
}

const fetchSites = async () => {
  const { $api } = useNuxtApp()
  const r = await fetch(`${$api.sites()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
  if (r.ok) { const j = await r.json(); sites.value = j.data || [] }
}

const fetchBusinessSchemes = async () => {
  const { $api } = useNuxtApp()
  const r = await fetch(`${$api.businessSchemes()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
  if (r.ok) { const j = await r.json(); businessSchemes.value = j.data || [] }
}

const handleSubmit = () => {
  fdrStore.saveFdr()
}

function getPriorityBadge(p) {
  switch (p) { case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }; case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }; case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }; default: return { text: '-', class: 'badge rounded-pill bg-label-light' } }
}
function getPriorityBadgeClass(p) { return getPriorityBadge(p).class }
function getPriorityBadgeText(p) { return getPriorityBadge(p).text }
function getStatusBadgeClass(d) { return getStatusBadge(d).class }
function getStatusBadgeText(d) { return getStatusBadge(d).text }
const onDateChange = () => fdrStore.setFilters(filters.value)

const { isLoading: isDataLoading } = usePageData({
  pageName: 'FDR',
  loaders: [
    () => customerStore.fetchCustomers(),
    () => fetchSites(),
    () => fetchBusinessSchemes(),
    () => fdrStore.fetchFdrs(),
    () => fdrStore.fetchStats(),
  ],
  onSuccess: () => setListTitle('FDR', stats.value.total || 0),
  waitAll: true,
})

watch(isDataLoading, (v) => { isInitialLoading.value = v })

onMounted(() => {
  tableControls.value.rows = Number(params.value.rows) || 10
  const editId = route.query.edit
  if (editId && typeof editId === 'string') nextTick(() => navigateTo(`/sales/fdr/form/${editId}`))
})

watch(() => params.value.rows, (v) => { tableControls.value.rows = Number(v) || 10 })
watch(globalFilterValue, useDebounceFn(() => fdrStore.setSearch(globalFilterValue.value), 500))
watch(filters, (f) => { fdrStore.setFilters({ ...f, search: params.value.search || globalFilterValue.value }) }, { deep: true })

const onPage = (e) => { if (e) fdrStore.setPagination({ first: Number(e.first) || 0, rows: Number(e.rows) || 10, page: Number(e.page) || 0 }) }
const handleRowsChange = (v) => { params.value.rows = Number(v) || 10; params.value.first = 0; fdrStore.fetchFdrs() }
const onToolbarRows = (v) => { tableControls.value.rows = Number(v) || 10; handleRowsChange(v) }

async function exportData(format) {
  const toast = useToast()
  if (format === 'excel') {
    try {
      toast.info({ title: 'Info', message: 'Mempersiapkan export Excel...', color: 'blue' })
      const allData = await fdrStore.fetchAllFdrsForExport()
      if (!allData?.length) {
        toast.warning({ title: 'Warning', message: 'Tidak ada data untuk diexport', color: 'orange', position: 'bottomRight', layout: 2 })
        return
      }
      const XLSX = await import('xlsx').then((m) => m.default || m)
      const headers = ['FDR Number', 'Project Name', 'Customer', 'Lokasi', 'Skema', 'Priority', 'Status', 'Total', 'Tanggal']
      const rows = allData.map((r) => [
        r.fdrNumber || '-',
        r.name || '-',
        r.customer?.name || '-',
        r.location || '-',
        r.businessScheme?.name || '-',
        r.priority || '-',
        r.status || '-',
        r.grandTotal != null ? Number(r.grandTotal) : '-',
        r.fdrDate ? new Date(r.fdrDate).toLocaleDateString('id-ID') : '-',
      ])
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      ws['!cols'] = headers.map(() => ({ wch: 16 }))
      XLSX.utils.book_append_sheet(wb, ws, 'FDR')
      XLSX.writeFile(wb, 'fdr.xlsx')
      toast.success({ title: 'Success', message: `Excel berisi ${allData.length} baris`, color: 'green', position: 'bottomRight', layout: 2 })
    } catch (e) {
      console.error(e)
      toast.error({ title: 'Error', message: 'Gagal export Excel', color: 'red', position: 'bottomRight', layout: 2 })
    }
    return
  }
  if (format === 'pdf') {
    try {
      toast.info({ title: 'Info', message: 'Mempersiapkan export PDF...', color: 'blue' })
      const allData = await fdrStore.fetchAllFdrsForExport()
      if (!allData?.length) {
        toast.warning({ title: 'Warning', message: 'Tidak ada data untuk diexport', color: 'orange', position: 'bottomRight', layout: 2 })
        return
      }
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF('landscape')
      doc.setFontSize(14)
      doc.text('Laporan FDR', 14, 16)
      const body = allData.map((r) => [
        r.fdrNumber || '-',
        r.name || '-',
        r.customer?.name || '-',
        r.status || '-',
        r.fdrDate ? new Date(r.fdrDate).toLocaleDateString('id-ID') : '-',
      ])
      autoTable(doc, {
        head: [['FDR Number', 'Nama Proyek', 'Customer', 'Status', 'Tanggal']],
        body,
        startY: 22,
        styles: { fontSize: 8 },
      })
      doc.save('fdr.pdf')
      toast.success({ title: 'Success', message: `PDF berisi ${allData.length} baris`, color: 'green', position: 'bottomRight', layout: 2 })
    } catch (e) {
      console.error(e)
      toast.error({ title: 'Error', message: 'Gagal export PDF', color: 'red', position: 'bottomRight', layout: 2 })
    }
  }
}
const onSort = (e) => { if (e) fdrStore.setSort(e) }

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'FDR',
})
</script>

<style scoped>
.repeater-item { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e9ecef; }
.investment-summary-card { background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%); border: 1px solid #e0e7ff; border-radius: 12px; overflow: hidden; }
.investment-summary-title { margin: 0; padding: 14px 18px; font-size: 0.95rem; font-weight: 600; color: #4f46e5; background: rgba(99, 102, 241, 0.08); border-bottom: 1px solid #e0e7ff; }
.investment-summary-body { padding: 16px 18px 18px; }
.investment-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 0.9rem; }
.investment-summary-label { color: #64748b; font-weight: 500; }
.investment-summary-value { font-weight: 600; color: #1e293b; font-variant-numeric: tabular-nums; text-align: right; }
.investment-summary-divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e7ff, transparent); margin: 10px 0; }
.investment-summary-row-total .investment-summary-value { font-weight: 700; color: #4f46e5; }
.investment-summary-row-grand { padding-top: 12px; margin-top: 2px; }
.investment-summary-row-grand .investment-summary-label { font-size: 1rem; font-weight: 700; color: #334155; }
.investment-summary-row-grand .investment-summary-value { font-size: 1.15rem; font-weight: 800; color: #4f46e5; }
</style>
