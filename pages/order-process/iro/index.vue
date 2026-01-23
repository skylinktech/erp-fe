<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">IRO (Internal Request Order)</h4>
      <p class="mb-6">Daftar IRO yang terdaftar di sistem</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total IRO</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-file-list-3-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.totalIros || 0 }}</h5>
                  <span class="text-muted">IRO terdaftar</span>
                </div>
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
                  <span class="avatar-initial rounded bg-label-secondary">
                    <i class="ri-draft-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.draftIros || 0 }}</h5>
                  <span class="text-muted">Draft</span>
                </div>
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
                  <span class="avatar-initial rounded bg-label-warning">
                    <i class="ri-time-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.pendingIros || 0 }}</h5>
                  <span class="text-muted">Pending</span>
                </div>
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
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.approvedIros || 0 }}</h5>
                  <span class="text-muted">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Rejected</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-danger">
                    <i class="ri-close-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.rejectedIros || 0 }}</h5>
                  <span class="text-muted">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Filter IRO</h4>
          <p class="mb-0">Filter IRO berdasarkan Customer dan Status.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <CustomSelect2 v-model="filters.customerId" :options="customers || []" :get-option-label="o => o?.name ?? ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Customer" />
                </div>
                <div class="col-md-6 mb-2">
                  <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih Status" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="tableControls.rows"
                  :options="rowsPerPageOptionsArray"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem;"
                />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_quotation')"
                  @click="iroStore.openModal()"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Data
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari IRO..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="iros"
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
                :expandedRows="expandedRows"
                @row-toggle="onRowToggle"
              >
                <Column :expander="true" headerStyle="width: 3rem" />
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="noIro" header="No. IRO" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/order-process/iro/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.noIro || slotProps.data.no_iro }}</a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">{{ slotProps.data.customer?.name || '-' }}</template>
                </Column>
                <Column field="quotation.noQuotation" header="Quotation" :sortable="true">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/sales/quotation/detail/${slotProps.data.quotation.id}`)" class="text-primary text-nowrap" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.quotation?.noQuotation || slotProps.data.quotation?.no_quotation || '-' }}</a>
                  </template>
                </Column>
                <Column field="siteInvest.siNumber" header="SI" :sortable="true">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/sales/site-investment/detail/${slotProps.data.siteInvest.id}`)" class="text-primary text-nowrap" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.siteInvest?.siNumber || slotProps.data.siteInvest?.si_number || '-' }}</a>
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">{{ getStatusBadge(slotProps.data.status).text }}</span>
                  </template>
                </Column>
                <Column field="grandTotal" header="Grand Total" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">{{ formatRupiah(slotProps.data.grandTotal) }}</template>
                </Column>
                <Column field="createdAt" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <div class="dropdown d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i></a>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_iro')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="iroStore.submitIro(slotProps.data.id)"><i class="ri-send-plane-line me-2"></i> Submit IRO</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('approve_iro')) && slotProps.data.status === 'pending'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="iroStore.approveIro(slotProps.data.id)"><i class="ri-check-line me-2"></i> Approve</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('reject_iro')) && slotProps.data.status === 'pending'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="iroStore.rejectIro(slotProps.data.id)"><i class="ri-close-line me-2"></i> Reject</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/iro/detail/${slotProps.data.id}`)"><i class="ri-eye-line me-2"></i> Lihat Detail</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_iro')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="iroStore.fetchIroForEdit(slotProps.data.id)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('delete_iro')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="iroStore.deleteIro(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                        </li>
                      </ul>
                    </div>
                  </template>
                </Column>
                <template #expansion="slotProps">
                  <IroExpandedRow :iro="slotProps.data" />
                </template>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>

      <Modal :id="'IroModal'" :title="modalTitle" :description="modalDescription" :validation-errors-from-parent="validationErrors" dialog-class="modal-xl">
        <template #default>
          <form @submit.prevent="iroStore.saveIro()">
            <div class="row g-4">
              <div class="col-12">
                <div class="alert alert-info py-2 mb-0">
                  <i class="ri-information-line me-2"></i>
                  Hanya Quotation yang telah approved yang dapat dipilih.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Quotation (approved)</label>
                <CustomSelect2 v-model="form.quotationId" :options="quotationsApproved" :get-option-label="o => o ? (o.noQuotation || '') + ' - ' + (o.customer?.name || '') : ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Quotation" @update:modelValue="onQuotationChange" />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Site Investment</label>
                <CustomSelect2 v-model="form.siteInvestId" :options="siteInvests" :get-option-label="o => o ? (o.siNumber || '') + ' - ' + (o.name || '') : ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Site Investment" @update:modelValue="onSiteInvestChange" />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Customer</label>
                <CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="o => o?.name ?? ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Customer" />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Terms of Payment</label>
                <CustomSelect2 v-model="form.termsOfPayment" :options="termsOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih" />
              </div>
              <div v-if="(form.iroDetails || []).length > 0" class="col-12 pt-2">
                <hr class="my-2" />
                <p class="text-muted small mb-2">
                  {{ countProduct }} product, {{ countService }} service, {{ countDid }} DID (autofill)
                </p>
                <div class="d-flex justify-content-end gap-4 flex-wrap">
                  <span class="fw-bold">Material: {{ formatRupiah(computedMaterial) }}</span>
                  <span class="fw-bold">Service: {{ formatRupiah(computedService) }}</span>
                  <span class="fw-bold">DID: {{ formatRupiah(computedDid) }}</span>
                  <span class="fw-bold text-primary">Grand Total: {{ formatRupiah(computedGrand) }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="iroStore.closeModal()">Tutup</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">Simpan</button>
            </div>
          </form>
        </template>
      </Modal>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useIroStore } from '~/stores/iro'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import IroExpandedRow from '~/components/table/IroExpandedRow.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()
const iroStore = useIroStore()
const customerStore = useCustomerStore()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()

const { iros, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, statistics } = storeToRefs(iroStore)
const { customers } = storeToRefs(customerStore)

const siteInvests = ref([])
const quotationsApproved = ref([])
const expandedRows = ref({})
const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ search: '', customerId: null, status: null })
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]
const termsOptions = [
  { label: 'Postpaid', value: 'postpaid' },
  { label: 'Prepaid', value: 'prepaid' },
  { label: 'Down Payment', value: 'down_payment' },
]

const modalTitle = computed(() => (isEditMode.value ? 'Edit IRO' : 'Tambah Data'))
const modalDescription = computed(() => (isEditMode.value ? 'Ubah data IRO di bawah ini.' : 'Isi form untuk menambahkan IRO baru.'))

const countProduct = computed(() => (form.value?.iroDetails || []).filter((d) => String(d.itemType || '').toUpperCase() === 'PRODUCT').length)
const countService = computed(() => (form.value?.iroDetails || []).filter((d) => String(d.itemType || '').toUpperCase() === 'SERVICE').length)
const countDid = computed(() => (form.value?.iroDetails || []).filter((d) => String(d.itemType || '').toUpperCase() === 'DID').length)
const computedMaterial = computed(() =>
  (form.value?.iroDetails || []).filter((d) => String(d.itemType || '').toUpperCase() === 'PRODUCT').reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
)
const computedService = computed(() =>
  (form.value?.iroDetails || []).filter((d) => String(d.itemType || '').toUpperCase() === 'SERVICE').reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
)
const computedDid = computed(() =>
  (form.value?.iroDetails || []).filter((d) => String(d.itemType || '').toUpperCase() === 'DID').reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
)
const computedGrand = computed(() => {
  const items = form.value?.iroDetails || []
  return items.reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
})

async function fetchSiteInvests() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.siteInvestment()}?page=1&rows=500&status=approved`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); siteInvests.value = j.data || [] }
  } catch (e) { console.error(e) }
}
async function fetchQuotationsApproved() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.quotation()}?page=1&rows=500&status=approved&includeItems=true`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); quotationsApproved.value = j.data || [] }
  } catch (e) { console.error(e) }
}

async function onQuotationChange(quotationId) {
  if (!form.value) return
  if (!quotationId) {
    form.value.siteInvestId = null
    form.value.customerId = null
    iroStore.setIroDetailsFromQuotation(null, null)
    return
  }
  if (isEditMode.value) {
    const q = quotationsApproved.value.find((x) => x.id === quotationId)
    if (q) {
      form.value.siteInvestId = q.siteInvestId ?? q.site_invest_id ?? q.siteInvest?.id ?? null
      form.value.customerId = q.customerId ?? q.customer_id ?? q.customer?.id ?? null
    }
    return
  }
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.quotation()}/${quotationId}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (!r.ok) return
    const j = await r.json()
    const q = j.data || j
    const siteInvestId = q.siteInvestId ?? q.site_invest_id ?? q.siteInvest?.id ?? null
    form.value.siteInvestId = siteInvestId
    form.value.customerId = q.customerId ?? q.customer_id ?? q.customer?.id ?? null
    let siteInvestDids = null
    if (siteInvestId) {
      try {
        const rSi = await fetch(`${$api.siteInvestment()}/${siteInvestId}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (rSi.ok) {
          const jSi = await rSi.json()
          const si = jSi.data || jSi
          siteInvestDids = si.siteInvestDids ?? si.site_invest_dids ?? []
        }
      } catch (e) { console.error('fetch site_invest for DID', e) }
    }
    iroStore.setIroDetailsFromQuotation(q, siteInvestDids)
  } catch (e) {
    console.error('fetch quotation for IRO autofill', e)
  }
}

async function onSiteInvestChange(siteInvestId) {
  if (!form.value) return
  if (!siteInvestId) {
    iroStore.applyDidRows(null)
    return
  }
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.siteInvestment()}/${siteInvestId}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (!r.ok) return
    const j = await r.json()
    const si = j.data || j
    const siteInvestDids = si.siteInvestDids ?? si.site_invest_dids ?? []
    iroStore.applyDidRows(siteInvestDids)
  } catch (e) { console.error('fetch site_invest for DID on change', e) }
}

function getStatusBadge(status) {
  if (!status) return { text: '-', class: 'badge rounded-pill bg-label-light' }
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'pending': return { text: 'Pending', class: 'badge rounded-pill bg-label-warning' }
    case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-success' }
    case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' }
    default: return { text: status, class: 'badge rounded-pill bg-label-light' }
  }
}

const onPage = (e) => { if (e) iroStore.setPagination(e) }
const handleRowsChange = (v) => { 
  const rowsValue = Number(v) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  iroStore.fetchIros()
}
const handleSearch = (v) => { 
  globalFilterValue.value = v
  params.value.first = 0
  iroStore.fetchIros()
}
const onSort = (e) => { if (e) iroStore.setSort(e) }
const onRowToggle = (e) => { expandedRows.value = e.data }

const debouncedSearch = useDebounceFn(() => {
  iroStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => { iroStore.setFilters({ customerId: f.customerId, status: f.status, search: f.search }) }, { deep: true })

let modalInstance = null
const route = useRoute()
onMounted(() => {
  iroStore.fetchIros()
  iroStore.fetchStatistics()
  customerStore.fetchCustomers()
  fetchSiteInvests()
  fetchQuotationsApproved()
  setListTitle('IRO', iros.value?.length ?? 0)
  tableControls.value.rows = Number(params.value.rows) || 10
  globalFilterValue.value = params.value.search || ''
  const el = document.getElementById('IroModal')
  if (el) modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(el) : null
    const editId = Array.isArray(route.query?.edit) ? route.query.edit[0] : route.query?.edit
    if (editId) iroStore.fetchIroForEdit(String(editId))
})

watch(showModal, (v) => {
  if (v) {
    modalInstance?.show()
    nextTick(() => {
      if (isEditMode.value && form.value?.quotationId && !quotationsApproved.value.some((q) => (q.id || q) === (form.value.quotationId || form.value.quotation_id))) {
        const q = { id: form.value.quotationId, noQuotation: '-', customer: { id: form.value.customerId, name: '-' } }
        quotationsApproved.value = [q, ...quotationsApproved.value]
      }
    })
  } else modalInstance?.hide()
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'IRO',
})
</script>

<style scoped>
.repeater-item { background: #f8f9fa; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef; }
</style>
