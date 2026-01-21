<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">List IRO (Internal Request Order)</h4>
      <p class="mb-6">Daftar IRO yang terdaftar di sistem</p>

      <div class="row g-6 mb-6">
        <div class="col-xl-4 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-1">Total IRO</h5>
                <span class="badge bg-label-primary rounded-pill">Total</span>
              </div>
              <div class="d-flex align-items-center">
                <h1 class="mb-0 display-4">{{ statistics?.totalIros || 0 }}</h1>
                <i class="ri-file-list-3-line ri-24px text-primary ms-2"></i>
              </div>
              <p class="mb-0 mt-2">Total semua IRO dalam sistem</p>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-1">IRO Approved</h5>
                <span class="badge bg-label-success rounded-pill">Approved</span>
              </div>
              <div class="d-flex align-items-center">
                <h1 class="mb-0 display-4">{{ statistics?.approvedIros || 0 }}</h1>
                <i class="ri-check-line ri-24px text-success ms-2"></i>
              </div>
              <p class="mb-0 mt-2">Total IRO yang sudah disetujui</p>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-lg-6 col-md-6">
          <div class="card h-100">
            <div class="row h-100">
              <div class="col-sm-5 d-flex align-items-end justify-content-center">
                <img src="/img/illustrations/add-new-role-illustration.png" class="img-fluid" alt="" width="70">
              </div>
              <div class="col-sm-7">
                <div class="card-body text-sm-end text-center ps-sm-0">
                  <button v-if="userHasRole('superadmin') || userHasPermission('create_quotation')" @click="iroStore.openModal()" class="btn btn-primary mb-2 text-wrap">Tambah IRO</button>
                  <p class="mb-0 mt-1">Buat IRO baru</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Daftar IRO</h4>
          <p class="mb-0">Kelola IRO (Installation Request Order) berdasarkan Quotation yang disetujui.</p>
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
            <div class="card-header">
              <TableControls
                v-model="tableControls"
                :rows-per-page-options="rowsPerPageOptionsArray"
                search-placeholder="Cari IRO..."
                @rows-change="handleRowsChange"
                @search="handleSearch"
              />
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
                <Column field="customer.name" header="Customer" :sortable="true" />
                <Column field="quotation.noQuotation" header="Quotation" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.quotation?.noQuotation || '-' }}</template>
                </Column>
                <Column field="siteInvest.siNumber" header="SI" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.siteInvest?.siNumber || '-' }}</template>
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
                  <strong>1 baris = 1 tipe</strong> (hanya product_id, atau service_id+service_plan_id, atau did_id yang terisi). <strong>PRODUCT</strong> &amp; <strong>SERVICE</strong> dari Quotation; <strong>DID</strong> dari Site Investment.
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
import TableControls from '~/components/table/TableControls.vue'
import IroExpandedRow from '~/components/table/IroExpandedRow.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
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

const modalTitle = computed(() => (isEditMode.value ? 'Edit IRO' : 'Tambah IRO'))
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
const handleRowsChange = (v) => { params.value.rows = Number(v) || 10; params.value.first = 0; iroStore.fetchIros() }
const handleSearch = (v) => { params.value.first = 0; iroStore.setSearch(v) }
const onSort = (e) => { if (e) iroStore.setSort(e) }
const onRowToggle = (e) => { expandedRows.value = e.data }

const debouncedSearch = useDebounceFn(() => iroStore.setSearch(tableControls.value?.search ?? ''), 500)
watch(() => tableControls.value?.search, (v) => { if (v !== undefined) debouncedSearch() })
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
