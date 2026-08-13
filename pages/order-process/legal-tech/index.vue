<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">Legal-Tech Review</h4>
      <p class="mb-6">Verifikasi kelayakan pelanggan sebelum kontrak</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-file-list-3-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.total || 0 }}</h5>
                  <span class="text-muted">Legal-Tech Review terdaftar</span>
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
                  <h5 class="mb-1">{{ statistics?.draft || 0 }}</h5>
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
                  <h5 class="mb-1">{{ statistics?.pending || 0 }}</h5>
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
                  <h5 class="mb-1">{{ statistics?.approved || 0 }}</h5>
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
                  <h5 class="mb-1">{{ statistics?.rejected || 0 }}</h5>
                  <span class="text-muted">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter Legal-Tech Review" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Quotation</label>
                <CustomSelect2
                  v-model="filters.quotationId"
                  :options="quotationsForFilter"
                  :get-option-label="(o) => (o ? (o.noQuotation || o.no_quotation || '') + ' - ' + (o.customer?.name || '') : '')"
                  :reduce="(o) => o?.id"
                  searchable
                  clearable
                  placeholder="Pilih Quotation"
                />
              </FilterField>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2
                  v-model="filters.status"
                  :options="statusOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  clearable
                  placeholder="Pilih Status"
                />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(tableControls.rows)"
              :rows-options="rowsPerPageOptionsArray"
              :search="globalFilterValue"
              search-placeholder="Cari Legal-Tech Review..."
              :export-disabled="loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
              @export="exportData"
            >
              <template #add>
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_quotation')"
                  type="button"
                  class="btn btn-primary legal-add-button"
                  @click="ltStore.openModal()"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Data
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="reviews"
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
                <Column field="noLr" header="No. LR" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                        <a 
                            @click="navigateTo(`/order-process/legal-tech/detail/${slotProps.data.id}`)" 
                            style="cursor: pointer; color: #008fec; text-decoration: underline;"
                            title="View detail"
                            class="text-primary"
                        >
                            {{ slotProps.data.noLr || '-' }}
                        </a>
                    </template>
                </Column>
                <Column field="purchaseRequest.noPurchaseRequest" header="No. Purchase Request" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/purchasing/purchase-request/detail/${slotProps.data.purchaseRequest.id}`)" class="text-primary text-nowrap" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.purchaseRequest?.prNumber || slotProps.data.purchaseRequest?.pr_number || slotProps.data.purchaseRequest?.noPurchaseRequest || '-' }}</a>
                  </template>
                </Column>
                <Column field="quotation.noQuotation" header="No. Quotation" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/sales/quotation/detail/${slotProps.data.quotation.id}`)" class="text-primary text-nowrap" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.quotation?.noQuotation || slotProps.data.quotation?.no_quotation || '-' }}</a>
                  </template>
                </Column>
                <Column field="purchaseOrder.noPo" header="No. PO External" :sortable="false" class="text-nowrap">
                  <template #body="slotProps">
                    <span>{{ slotProps.data.purchaseOrder?.noPo || slotProps.data.purchaseOrder?.no_po || '-' }}</span>
                  </template>
                </Column>
                <Column field="quotation.customer.name" header="Customer" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">{{ slotProps.data.quotation?.customer?.name || '-' }}</template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span>
                  </template>
                </Column>
                <Column field="createdByUser.full_name" header="Dibuat Oleh" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">{{ slotProps.data.createdByUser?.full_name || slotProps.data.createdByUser?.fullName || '-' }}</template>
                </Column>
                <Column field="createdAt" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width: 9rem">
                  <template #body="slotProps">
                    <div class="dropdown d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i></a>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_legal-technical_review')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="ltStore.submitLeTechReview(slotProps.data.id)"><i class="ri-send-plane-line me-2"></i> Submit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('approve_legal-technical_review')) && slotProps.data.status === 'pending'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="ltStore.approveLeTechReview(slotProps.data.id)"><i class="ri-check-line me-2"></i> Approve</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('reject_legal-technical_review')) && slotProps.data.status === 'pending'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="ltStore.rejectLeTechReview(slotProps.data.id)"><i class="ri-close-line me-2"></i> Reject</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('show_legal-technical_review'))">
                          <a class="dropdown-item" href="javascript:void(0)" @click="ltStore.openModal(slotProps.data, true)"><i class="ri-eye-line me-2"></i> Lihat</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_legal-technical_review')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="ltStore.openModal(slotProps.data, false)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('delete_legal-technical_review')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="ltStore.deleteLeTechReview(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                        </li>
                      </ul>
                    </div>
                  </template>
                </Column>
                <template #expansion="slotProps">
                  <LeTechReviewExpandedRow :review="slotProps.data" />
                </template>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>

      <Modal :id="'LeTechReviewModal'" :title="modalTitle" :description="modalDescription" :validation-errors-from-parent="validationErrors" dialog-class="modal-lg">
        <template #default>
          <form @submit.prevent="ltStore.saveLeTechReview()">
            <div class="row g-4">
              <div class="col-12" v-if="isViewMode">
                <label class="form-label text-muted">No. LR</label>
                <input type="text" :value="form.noLr || '-'" class="form-control" disabled readonly />
              </div>
              <div class="col-6">
                <label class="form-label text-muted">Purchase Request</label>
                <CustomSelect2
                  v-model="form.purchaseRequestId"
                  :options="purchaseRequestsForSelect"
                  :get-option-label="(o) => (o ? (o.prNumber || o.pr_number || o.noPurchaseRequest || o.id) : '')"
                  :reduce="(o) => o?.id"
                  searchable
                  clearable
                  placeholder="Pilih Purchase Request"
                  :disabled="isEditMode || isViewMode"
                  @update:modelValue="onPurchaseRequestChange"
                />
              </div>
              <div class="col-6">
                <label class="form-label text-muted">Quotation <span class="text-danger" aria-hidden="true">*</span></label>
                <CustomSelect2
                  v-model="form.quotationId"
                  :options="quotationsForSelect"
                  :get-option-label="(o) => (o ? (o.noQuotation || o.no_quotation || '') + ' - ' + (o.customer?.name || '') : '')"
                  :reduce="(o) => o?.id"
                  searchable
                  clearable
                  placeholder="Pilih Quotation"
                  :disabled="isEditMode || isViewMode"
                />
              </div>
              <div class="col-12">
                <label class="form-label text-muted">Purchase Order (External)</label>
                <CustomSelect2
                  v-model="form.purchaseOrderId"
                  :options="externalPurchaseOrders"
                  :get-option-label="(o) => (o ? `${o.noPo || o.no_po || ''} - ${o.vendor?.name || '-'}` : '')"
                  :reduce="(o) => o?.id"
                  searchable
                  clearable
                  placeholder="Pilih Purchase Order External"
                  :disabled="isViewMode"
                />
              </div>
              <div class="col-12">
                <h6 class="text-muted mb-2">Compliance Checklist</h6>
                <div class="form-check mb-2" v-for="item in checklistItems" :key="item.key">
                  <input v-model="form[item.key]" class="form-check-input" type="checkbox" :id="'chk-' + item.key" :disabled="isViewMode" />
                  <label class="form-check-label" :for="'chk-' + item.key">{{ item.label }}</label>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label text-muted">Catatan</label>
                <textarea v-model="form.notes" class="form-control" rows="3" placeholder="Catatan tinjauan..." :disabled="isViewMode"></textarea>
              </div>
              <div class="col-12">
                <label class="form-label text-muted">Attachments (Multiple)</label>
                <input
                  v-if="!isViewMode"
                  type="file"
                  @change="onAttachmentsChange"
                  class="form-control"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  multiple
                >
                <small class="text-muted d-block mt-1">Maks. 2MB per file. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv. Bisa pilih beberapa file.</small>
                <div v-if="(form.attachmentPreviews && form.attachmentPreviews.length > 0) || (form.existingAttachments && form.existingAttachments.length > 0)" class="mt-3">
                  <div v-for="(preview, idx) in (form.attachmentPreviews || [])" :key="'new-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <i class="ri-file-line text-primary"></i>
                    <span class="flex-grow-1 small">{{ getFileNameFromPreview(preview) }}</span>
                    <button v-if="!isViewMode" type="button" @click="removeAttachment(idx, 'new')" class="btn btn-sm btn-text-danger p-0"><i class="ri-close-circle-line"></i></button>
                  </div>
                  <div v-for="(url, idx) in (form.existingAttachments || [])" :key="'existing-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <i class="ri-file-line text-success"></i>
                    <a :href="getAttachmentUrl(url)" target="_blank" rel="noopener noreferrer" class="flex-grow-1 small text-decoration-none">{{ getFileNameFromUrl(url) }}</a>
                    <button v-if="!isViewMode" type="button" @click="removeAttachment(idx, 'existing')" class="btn btn-sm btn-text-danger p-0"><i class="ri-close-circle-line"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="ltStore.closeModal()">Tutup</button>
              <button v-if="!isViewMode && (!isEditMode || form.status === 'draft')" type="submit" class="btn btn-primary" :disabled="saving">Simpan</button>
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
import { useLegalTechStore } from '~/stores/legal-tech'
import { usePermissions } from '~/composables/usePermissions'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import LeTechReviewExpandedRow from '~/components/table/LeTechReviewExpandedRow.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

const { setListTitle } = useDynamicTitle()
const ltStore = useLegalTechStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getStatusBadge } = useApprovalStatus()
const { getAttachmentUrl } = useImageUrl()

const { reviews, loading, saving, totalRecords, params, form, isEditMode, isViewMode, showModal, validationErrors, statistics } = storeToRefs(ltStore)

const quotationsForSelect = ref([])
const quotationsForFilter = ref([])
const purchaseRequestsForSelect = ref([])
const externalPurchaseOrders = ref([])
const expandedRows = ref({})
const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ quotationId: null, status: null })

const hasActiveFilters = computed(
  () => !!filters.value.quotationId || !!filters.value.status
)

function resetFilters() {
  filters.value.quotationId = null
  filters.value.status = null
}
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const checklistItems = [
  { key: 'legalDocMatch', label: 'Legal Document Match (NIB / NPWP / Akta)' },
  { key: 'installVerif', label: 'Installation Address Verified' },
  { key: 'serviceEligi', label: 'Service Eligibility (Coverage / Satellite Visibility)' },
  { key: 'deviceAvailConf', label: 'Device Availability Confirmed' },
  { key: 'slaTermsRev', label: 'SLA / Terms Reviewed' },
  { key: 'contractTermValid', label: 'Contract Term Validated' },
]

const modalTitle = computed(() => {
  if (isViewMode.value) return 'Lihat Legal-Tech Review'
  return isEditMode.value ? 'Edit Legal-Tech Review' : 'Tambah Data'
})
const modalDescription = computed(() => {
  if (isViewMode.value) return 'Lihat detail Legal-Tech Review di bawah ini (read-only).'
  return isEditMode.value ? 'Ubah data review di bawah ini.' : 'Isi form untuk menambah Legal-Tech Review baru.'
})

const onPage = (e) => { if (e) ltStore.setPagination(e) }
const handleRowsChange = (v) => { 
  const rowsValue = Number(v) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  ltStore.fetchLeTechReviews()
}
const onToolbarRows = (v) => {
  tableControls.value.rows = Number(v) || 10
  handleRowsChange(v)
}

function exportData(format) {
  const toast = useToast()
  if (format === 'excel' || format === 'pdf') {
    toast.info({
      title: 'Info',
      message: `Export ${format === 'excel' ? 'Excel' : 'PDF'} akan tersedia pada rilis berikutnya.`,
      color: 'blue',
      position: 'bottomRight',
      layout: 2,
    })
  }
}
const handleSearch = (v) => { 
  globalFilterValue.value = v
  params.value.first = 0
  ltStore.fetchLeTechReviews()
}
const debouncedSearch = useDebounceFn(() => {
  ltStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)
const onSort = (e) => { if (e) ltStore.setSort(e) }
const onRowToggle = (e) => { expandedRows.value = e.data }

/** Fetch quotations once - filter approved for select, use full list for filter (avoids 2x API calls) */
async function fetchQuotations() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.quotation()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) {
      const j = await r.json()
      const all = j.data || []
      quotationsForFilter.value = all
      quotationsForSelect.value = all.filter((q) => q.status === 'approved')
    }
  } catch (e) {
    console.error('fetchQuotations:', e)
  }
}

async function fetchPurchaseRequestsForSelect() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.purchaseRequest()}?page=1&rows=500&status=approved`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) {
      const j = await r.json()
      purchaseRequestsForSelect.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching Purchase Requests:', e)
  }
}

async function fetchExternalPurchaseOrders() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.leTechReviewExternalPurchaseOrders()}?rows=500`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const j = await r.json()
      externalPurchaseOrders.value = Array.isArray(j.data) ? j.data : []
    }
  } catch (e) {
    console.error('fetchExternalPurchaseOrders:', e)
  }
}

async function onPurchaseRequestChange(purchaseRequestId) {
  if (!purchaseRequestId) return
  if (purchaseRequestsForSelect.value.some((i) => i.id === purchaseRequestId)) return
  try {
    const { $api } = useNuxtApp()
    const r = await fetch($api.purchaseRequestShow(purchaseRequestId), { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) {
      const j = await r.json()
      purchaseRequestsForSelect.value.push(j.data || j)
    }
  } catch (e) {
    console.error('Error fetching Purchase Request detail:', e)
  }
}

function onAttachmentsChange(e) {
  if (!form.value) return
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  const toast = useToast()
  const maxSize = 2 * 1024 * 1024
  const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
  const validFiles = []
  const previews = []

  for (const file of files) {
    if (!file.size || file.size === 0) {
      toast.error({ title: 'Error', message: `File ${file.name} kosong atau tidak valid`, color: 'red', position: 'bottomRight', layout: 2 })
      continue
    }
    if (file.size > maxSize) {
      toast.error({ title: 'Error', message: `File ${file.name} terlalu besar (maksimal 2MB)`, color: 'red', position: 'bottomRight', layout: 2 })
      continue
    }
    const ext = file.name?.split('.').pop()?.toLowerCase() || ''
    if (!allowed.includes(ext)) {
      toast.error({ title: 'Error', message: `Format ${file.name} tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red', position: 'bottomRight', layout: 2 })
      continue
    }
    validFiles.push(file)
    previews.push(URL.createObjectURL(file))
  }

  if (validFiles.length > 0) {
    if (!form.value.attachments) form.value.attachments = []
    if (!form.value.attachmentPreviews) form.value.attachmentPreviews = []
    form.value.attachments.push(...validFiles)
    form.value.attachmentPreviews.push(...previews)
  }
  e.target.value = ''
}

function removeAttachment(index, type) {
  if (!form.value) return
  if (type === 'new') {
    if (form.value.attachmentPreviews?.[index]) {
      const url = form.value.attachmentPreviews[index]
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    form.value.attachmentPreviews?.splice(index, 1)
    form.value.attachments?.splice(index, 1)
  } else {
    form.value.existingAttachments?.splice(index, 1)
  }
}

function getFileNameFromPreview(preview) {
  if (preview.startsWith('blob:')) {
    const file = form.value?.attachments?.find((_, i) => form.value?.attachmentPreviews?.[i] === preview)
    return file?.name || 'File'
  }
  return 'File'
}

function getFileNameFromUrl(url) {
  if (!url) return 'File'
  const parts = url.split('/')
  const fileName = parts[parts.length - 1]
  return fileName || 'File'
}

watch(filters, (f) => { ltStore.setFilters({ quotationId: f.quotationId, status: f.status }) }, { deep: true })

let modalInstance = null
onMounted(() => {
  ltStore.fetchLeTechReviews()
  ltStore.fetchStatistics()
  fetchQuotations()
  fetchPurchaseRequestsForSelect()
  fetchExternalPurchaseOrders()
  setListTitle('Legal-Tech Review', reviews.value?.length ?? 0)
  tableControls.value.rows = Number(params.value.rows) || 10
  globalFilterValue.value = params.value.search || ''
  const el = document.getElementById('LeTechReviewModal')
  if (el) modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(el) : null
})

watch(showModal, (v) => {
  if (v) {
    modalInstance?.show()
    nextTick(() => {
      if (isEditMode.value && form.value?.quotationId && !quotationsForSelect.value.some((q) => (q.id || q) === (form.value.quotationId || form.value.quotation_id))) {
        const q = { id: form.value.quotationId, noQuotation: '-', customer: { id: 0, name: '-' } }
        quotationsForSelect.value = [q, ...quotationsForSelect.value]
      }
      if (isEditMode.value && form.value?.purchaseRequestId && !purchaseRequestsForSelect.value.some((i) => (i.id || i) === (form.value.purchaseRequestId || form.value.purchase_request_id))) {
        const i = { id: form.value.purchaseRequestId, noPurchaseRequest: '-', customer: { id: 0, name: '-' } }
        purchaseRequestsForSelect.value = [i, ...purchaseRequestsForSelect.value]
      }
    })
  } else modalInstance?.hide()
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Legal-Tech Review',
})
</script>

<style scoped>
.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.legal-add-button {
  flex: 0 0 auto;
  white-space: nowrap;
}
</style>
