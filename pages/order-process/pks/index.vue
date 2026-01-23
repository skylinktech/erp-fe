<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">PKS</h4>
      <p class="mb-6">Daftar PKS yang terdaftar di sistem</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total PKS</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-file-list-3-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.totalPks || 0 }}</h5>
                  <span class="text-muted">PKS terdaftar</span>
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
                  <h5 class="mb-1">{{ statistics?.draftPks || 0 }}</h5>
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
                <p class="mb-0">Signed</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-info">
                    <i class="ri-file-check-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.signedPks || 0 }}</h5>
                  <span class="text-muted">Signed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Active</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.activePks || 0 }}</h5>
                  <span class="text-muted">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Filter PKS</h4>
          <p class="mb-0">Filter PKS berdasarkan Customer dan Status.</p>
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
                  v-if="userHasRole('superadmin') || userHasPermission('create_pks')"
                  @click="pksStore.openModal(null)"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Data
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari PKS..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="pksList"
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
                <Column field="noPks" header="No. PKS" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/order-process/pks/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.noPks || slotProps.data.no_pks }}</a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true" />
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">{{ getStatusBadge(slotProps.data.status).text }}</span>
                  </template>
                </Column>
                <Column field="contractStartDate" header="Contract Start" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractStartDate || slotProps.data.contract_start_date ? new Date(slotProps.data.contractStartDate || slotProps.data.contract_start_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column field="contractEndDate" header="Contract End" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractEndDate || slotProps.data.contract_end_date ? new Date(slotProps.data.contractEndDate || slotProps.data.contract_end_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column field="createdAt" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <div class="dropdown d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i></a>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="(userHasRole('superadmin') || userHasPermission('approve_pks')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="pksStore.submitPks(slotProps.data.id)"><i class="ri-file-check-line me-2"></i> Signed</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_pks')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="pksStore.fetchPksForEdit(slotProps.data.id)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('delete_pks')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="pksStore.deletePks(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/pks/detail/${slotProps.data.id}`)"><i class="ri-eye-line me-2"></i> Lihat Detail</a>
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

      <Modal :id="'PksModal'" :title="modalTitle" :description="modalDescription" :validation-errors-from-parent="validationErrors" dialog-class="modal-xl">
        <template #default>
          <form @submit.prevent="pksStore.savePks()" novalidate>
            <div class="row">
              <div class="col">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                      <span class="ri-information-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Informasi</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-subscriptions" role="tab" aria-selected="false" type="button">
                      <span class="ri-file-list-3-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Subscriptions</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-documents" role="tab" aria-selected="false" type="button">
                      <span class="ri-file-paper-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Documents</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-4">
              <!-- Tab Informasi -->
              <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label text-muted">Customer</label>
                    <CustomSelect2
                      v-model="form.customerId"
                      :options="customers || []"
                      :get-option-label="c => c.name"
                      :reduce="c => c.id"
                      placeholder="Pilih Customer"
                      searchable
                      clearable
                      @update:modelValue="onCustomerChange"
                    />
                  </div>
                  <div class="col-md-12">
                    <label class="form-label text-muted">Description</label>
                    <textarea v-model="form.description" class="form-control" rows="3" placeholder="Description"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Contract Start Date</label>
                    <input type="date" v-model="form.contractStartDate" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Contract End Date</label>
                    <input type="date" v-model="form.contractEndDate" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Signing Location</label>
                    <input type="text" v-model="form.signingLocation" class="form-control" placeholder="Signing Location" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Signing Date</label>
                    <input type="date" v-model="form.signingDate" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Customer PIC</label>
                    <input type="text" v-model="form.custPic" class="form-control" placeholder="Customer PIC" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Telkom PIC</label>
                    <input type="text" v-model="form.telkomPic" class="form-control" placeholder="Telkom PIC" />
                  </div>
                </div>
              </div>

              <!-- Tab Subscriptions -->
              <div class="tab-pane fade" id="form-tabs-subscriptions" role="tabpanel">
                <div class="alert alert-info mb-4">
                  <i class="ri-information-line me-2"></i>
                  <strong>Info:</strong> Pilih subscription yang sudah memiliki status 'signed'. Jika subscription belum signed, simpan akan gagal.
                </div>
                <div v-for="(pksSub, index) in form.pksSubscriptions" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-md-10">
                      <label class="form-label text-muted">Subscription {{ form.pksSubscriptions.length > 1 ? `#${index + 1}` : '' }}</label>
                      <CustomSelect2
                        v-model="pksSub.subscriptionId"
                        :options="subscriptionsSigned"
                        :get-option-label="s => s ? (s.noSubscription || s.no_subscription || '') + ' - ' + (s.customer?.name || s.customer_name || '') + ' (' + (s.status || '') + ')' : ''"
                        :reduce="s => s?.id"
                        placeholder="Pilih Subscription (status: signed)"
                        searchable
                        clearable
                        @update:modelValue="onSubscriptionChange(index)"
                      />
                      <small v-if="pksSub.subscriptionId" class="text-muted d-block mt-1">
                        Pastikan subscription memiliki status 'signed'
                      </small>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                      <button v-if="form.pksSubscriptions.length > 1" type="button" class="btn btn-outline-danger w-100" @click.prevent="pksStore.removeSubscription(index)">
                        <i class="ri-delete-bin-line me-1"></i> Hapus
                      </button>
                    </div>
                  </div>
                  <hr class="my-4" v-if="index < form.pksSubscriptions.length - 1">
                </div>
                <div class="mt-4">
                  <button type="button" class="btn btn-primary" @click.prevent="pksStore.addSubscription()">
                    <i class="ri-add-line me-1"></i> Tambah Subscription
                  </button>
                </div>
              </div>

              <!-- Tab Documents -->
              <div class="tab-pane fade" id="form-tabs-documents" role="tabpanel">
                <div v-for="(doc, index) in form.pksDocuments" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label text-muted">Document Type {{ form.pksDocuments.length > 1 ? `#${index + 1}` : '' }}</label>
                      <CustomSelect2
                        v-model="doc.docType"
                        :options="docTypeOptions"
                        :get-option-label="o => o.label"
                        :reduce="o => o.value"
                        placeholder="Pilih Document Type"
                        searchable
                        clearable
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Attachment</label>
                      <input
                        type="file"
                        @change="onDocumentChange($event, index)"
                        class="form-control"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                      >
                      <small class="text-muted d-block mt-1">Maks. 2MB. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv</small>
                      <div v-if="doc.attachmentPreview" class="mt-2">
                        <a :href="doc.attachmentPreview" target="_blank" rel="noopener noreferrer" class="d-block mb-1">Lihat Attachment</a>
                        <img v-if="isImageFile(doc.attachment?.name || doc.attachmentPreview)" :src="doc.attachmentPreview" alt="Preview" class="attachment-preview" style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;">
                      </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                      <button v-if="form.pksDocuments.length > 1" type="button" class="btn btn-outline-danger w-100" @click.prevent="pksStore.removeDocument(index)">
                        <i class="ri-delete-bin-line me-1"></i> Hapus
                      </button>
                    </div>
                  </div>
                  <hr class="my-4" v-if="index < form.pksDocuments.length - 1">
                </div>
                <div class="mt-4">
                  <button type="button" class="btn btn-primary" @click.prevent="pksStore.addDocument()">
                    <i class="ri-add-line me-1"></i> Tambah Document
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer mt-6">
              <button type="button" class="btn btn-outline-secondary" @click="pksStore.closeModal()">Tutup</button>
              <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Simpan
              </button>
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
import { usePksStore } from '~/stores/pks'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

const { setListTitle } = useDynamicTitle()
const pksStore = usePksStore()
const customerStore = useCustomerStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const { pksList, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, statistics } = storeToRefs(pksStore)
const { customers } = storeToRefs(customerStore)

const subscriptionsSigned = ref([])
const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ search: '', customerId: null, status: null })
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Signed', value: 'signed' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Terminated', value: 'terminated' },
]

const docTypeOptions = [
  { label: 'Main', value: 'main' },
  { label: 'Addendum', value: 'addendum' },
  { label: 'Amendment', value: 'amendment' },
]

const modalTitle = computed(() => (isEditMode.value ? 'Edit PKS' : 'Tambah Data'))
const modalDescription = computed(() => (isEditMode.value ? 'Ubah data PKS di bawah ini.' : 'Isi form untuk menambahkan PKS baru.'))

function getStatusBadge(status) {
  if (!status) return { text: '-', class: 'badge rounded-pill bg-label-light' }
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'signed': return { text: 'Signed', class: 'badge rounded-pill bg-label-info' }
    case 'active': return { text: 'Active', class: 'badge rounded-pill bg-label-success' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    case 'terminated': return { text: 'Terminated', class: 'badge rounded-pill bg-label-warning' }
    default: return { text: status, class: 'badge rounded-pill bg-label-light' }
  }
}

async function fetchSubscriptionsSigned() {
  const { $api } = useNuxtApp()
  try {
    const customerId = form.value?.customerId
    const qs = new URLSearchParams({ page: '1', rows: '500', status: 'signed' })
    if (customerId) qs.append('customerId', String(customerId))
    const r = await fetch(`${$api.subscription()}?${qs.toString()}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) {
      const j = await r.json()
      subscriptionsSigned.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching signed subscriptions:', e)
  }
}

function toYmd(d) {
  if (!d) return null
  try {
    return new Date(d).toISOString().split('T')[0]
  } catch (e) {
    return null
  }
}

async function onCustomerChange(customerId) {
  // Snapshot customer_name hanya untuk disimpan di DB (tidak ditampilkan di UI)
  if (!customerId) {
    form.value.customerName = ''
    subscriptionsSigned.value = []
    // reset subscription & contract dates
    form.value.pksSubscriptions = [{ subscriptionId: '' }]
    form.value.contractStartDate = null
    form.value.contractEndDate = null
    return
  }

  const customer = customers.value.find(c => c.id === customerId)
  if (customer) form.value.customerName = customer.name

  // Ambil subscription signed berdasarkan customer terpilih
  await fetchSubscriptionsSigned()

  // Autofill subscription pertama yang ditemukan
  const firstSub = (subscriptionsSigned.value || [])[0]
  form.value.pksSubscriptions = [{ subscriptionId: firstSub?.id || '' }]

  // Autofill contract dates dari subscription pertama (bisa override manual)
  if (firstSub) {
    const cs = firstSub.contractStartDate ?? firstSub.contract_start_date ?? firstSub.targetActiveDate ?? firstSub.target_active_date ?? null
    const ce = firstSub.contractEndDate ?? firstSub.contract_end_date ?? null
    form.value.contractStartDate = toYmd(cs)
    form.value.contractEndDate = toYmd(ce)
  } else {
    form.value.contractStartDate = null
    form.value.contractEndDate = null
  }
}

function onSubscriptionChange(index) {
  // Saat user memilih subscription (baris pertama), autofill contract dates
  if (index !== 0) return
  const subId = form.value?.pksSubscriptions?.[0]?.subscriptionId
  if (!subId) return
  const s = (subscriptionsSigned.value || []).find(x => (x?.id || x) === subId)
  if (!s) return
  const cs = s.contractStartDate ?? s.contract_start_date ?? s.targetActiveDate ?? s.target_active_date ?? null
  const ce = s.contractEndDate ?? s.contract_end_date ?? null
  form.value.contractStartDate = toYmd(cs)
  form.value.contractEndDate = toYmd(ce)
}

function onDocumentChange(event, index) {
  if (!form.value || !form.value.pksDocuments) return
  const file = event.target.files?.[0]
  if (file) {
    const toast = useToast()
    if (!file.size || file.size === 0) {
      toast.error({ title: 'Error', message: 'File attachment kosong atau tidak valid', color: 'red' })
      return
    }
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error({ title: 'Error', message: 'Ukuran file maksimal 2MB', color: 'red' })
      return
    }
    const ext = file.name?.split('.').pop()?.toLowerCase() || ''
    const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
    if (!allowed.includes(ext)) {
      toast.error({ title: 'Error', message: `Format tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red' })
      return
    }
    form.value.pksDocuments[index].attachment = file
    form.value.pksDocuments[index].attachmentPreview = URL.createObjectURL(file)
  } else {
    form.value.pksDocuments[index].attachment = null
    form.value.pksDocuments[index].attachmentPreview = null
  }
  event.target.value = ''
}

const onPage = (e) => { if (e) pksStore.setPagination(e) }
const handleRowsChange = (v) => {
  const rowsValue = Number(v) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  pksStore.fetchPks()
}
const onSort = (e) => { if (e) pksStore.setSort(e) }

const debouncedSearch = useDebounceFn(() => {
  pksStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => { pksStore.setFilters({ customerId: f.customerId, status: f.status, search: f.search }) }, { deep: true })

let modalInstance = null
const route = useRoute()
onMounted(() => {
  pksStore.fetchPks()
  pksStore.fetchStatistics()
  customerStore.fetchCustomers()
  fetchSubscriptionsSigned()
  setListTitle('PKS', pksList.value?.length ?? 0)
  tableControls.value.rows = Number(params.value.rows) || 10
  globalFilterValue.value = params.value.search || ''
  const el = document.getElementById('PksModal')
  if (el) modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(el) : null
  const editId = Array.isArray(route.query?.edit) ? route.query.edit[0] : route.query?.edit
  if (editId) pksStore.fetchPksForEdit(String(editId))
})

watch(showModal, (v) => {
  if (v) {
    modalInstance?.show()
    nextTick(() => {
      // Pastikan subscription signed ter-load
      fetchSubscriptionsSigned()
      // Jika belum ada subscription, tambahkan satu
      if (!form.value.pksSubscriptions || form.value.pksSubscriptions.length === 0) {
        pksStore.addSubscription()
      }
      // Jika belum ada document, tambahkan satu
      if (!form.value.pksDocuments || form.value.pksDocuments.length === 0) {
        pksStore.addDocument()
      }
    })
  } else {
    modalInstance?.hide()
    // Clean up blob URLs when modal closes
    if (form.value.pksDocuments) {
      for (const doc of form.value.pksDocuments) {
        if (doc.attachmentPreview && doc.attachmentPreview.startsWith('blob:')) {
          URL.revokeObjectURL(doc.attachmentPreview)
        }
      }
    }
  }
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'PKS',
})
</script>

<style scoped>
.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.attachment-preview {
  display: block;
  cursor: pointer;
}
</style>
