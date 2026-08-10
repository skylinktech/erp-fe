<template>
    <div class="page-wrapper">
        <div class="content-wrapper">
            <!-- Loading Overlay -->
            <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Memuat data Customer Verification...</p>
                </div>
            </div>

            <!-- Content -->
            <div v-else class="container-xxl flex-grow-1 container-p-y">
                <h4 class="mb-1">Customer Verification</h4>
                <p class="mb-6">List customer verification yang terdaftar di sistem</p>

                <!-- Statistics Cards -->
                <div class="row g-6 mb-6">
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Total Customer Verification</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-primary">
                                            <i class="ri-file-check-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                                        <span class="text-muted">Customer Verification terdaftar</span>
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
                                        <h5 class="mb-1">{{ stats.draft || 0 }}</h5>
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
                                        <h5 class="mb-1">{{ stats.pending || 0 }}</h5>
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
                                    <p class="mb-0">Verified</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-success">
                                            <i class="ri-checkbox-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.verified || 0 }}</h5>
                                        <span class="text-muted">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Unverified</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-danger">
                                            <i class="ri-close-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.unverified || 0 }}</h5>
                                        <span class="text-muted">Unverified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-6">
                    <div class="col-12">
                        <CollapsibleFilterCard title="Filter Customer Verification" :has-active-filters="hasActiveFilters" @reset="resetFilters">
                            <FilterFieldsRow>
                                <FilterField>
                                    <label class="form-label">Filter Customer</label>
                                    <CustomSelect2
                                        v-model="filters.customerId"
                                        :options="customers"
                                        :get-option-label="c => c.name"
                                        :reduce="c => c.id"
                                        placeholder="Pilih Customer"
                                        searchable
                                        clearable
                                        :loading="customerStore.loading"
                                        loading-text="Memuat customer..."
                                    />
                                </FilterField>
                                <FilterField>
                                    <label class="form-label">Filter Status</label>
                                    <CustomSelect2
                                        v-model="filters.status"
                                        :options="statusOptions"
                                        :get-option-label="option => option.label"
                                        :reduce="option => option.value"
                                        placeholder="Pilih Status"
                                        searchable
                                        clearable
                                    />
                                </FilterField>
                                <FilterField>
                                    <label class="form-label">Filter Site Investment</label>
                                    <CustomSelect2
                                        v-model="filters.siteInvestmentId"
                                        :options="approvedSiteInvestments"
                                        :get-option-label="formatSiteInvestmentOptionLabel"
                                        :reduce="si => si.id"
                                        placeholder="Pilih Site Investment"
                                        searchable
                                        clearable
                                    />
                                </FilterField>
                            </FilterFieldsRow>
                        </CollapsibleFilterCard>
                    </div>

                    <!-- Table -->
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
                                        v-if="userHasRole('superadmin') || userHasPermission('create_customer_verif')"
                                        @click="customerVerifStore.openModal(null)"
                                        class="btn btn-primary"
                                    >
                                        <i class="ri-add-line me-1"></i>
                                        Tambah Customer Verification
                                    </button>
                                    <button @click="exportData('csv')" class="btn btn-outline-secondary" :disabled="loading">
                                        <i class="ri-download-line me-1"></i>
                                        Export
                                    </button>
                                    <span class="p-input-icon-left">
                                        <InputText
                                            v-model="globalFilterValue"
                                            placeholder="Cari Customer Verification..."
                                            class="w-full md:w-20rem"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable
                                    ref="myDataTableRef"
                                    :data="customerVerifs"
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
                                        <template #body="slotProps">
                                            {{ params.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>
                                    <Column field="noVerif" header="No. Verification" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <span class="fw-semibold">{{ slotProps.data.noVerif || '-' }}</span>
                                        </template>
                                    </Column>
                                    <Column field="siteInvestment.siNumber" header="Site Investment" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a
                                                v-if="slotProps.data.siteInvestment?.id"
                                                @click="navigateTo(`/sales/site-investment/detail/${slotProps.data.siteInvestment.id}`)"
                                                class="text-primary"
                                                style="cursor:pointer;text-decoration:underline"
                                                :title="'View detail'"
                                            >{{ slotProps.data.siteInvestment?.siNumber || slotProps.data.siteInvestment?.si_number || '-' }}</a>
                                            <span v-else>-</span>
                                        </template>
                                    </Column>
                                    <Column field="customerName" header="Customer Name" :sortable="true" class="text-nowrap fw-semibold"></Column>
                                    <Column field="customerEmail" header="Email" :sortable="true"></Column>
                                    <Column field="customerPhone" header="Phone" :sortable="true"></Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.status).class">
                                                {{ getStatusBadge(slotProps.data.status).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="createdAt" header="Tanggal Dibuat" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
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
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'>
                                                    <i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu dropdown-menu-end cv-actions-dropdown">
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_customer_verif')) && slotProps.data.status === 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="customerVerifStore.submitCustomerVerif(slotProps.data.id)">
                                                            <i class="ri-send-plane-line me-2"></i> Submit
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_customer_verif')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="customerVerifStore.verifyCustomerVerif(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Verify
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('reject_customer_verif')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="customerVerifStore.unverifyCustomerVerif(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Unverify
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('edit_customer_verif')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="customerVerifStore.openModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('delete_customer_verif')) && slotProps.data.status === 'draft'">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="customerVerifStore.deleteCustomerVerif(slotProps.data.id)">
                                                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                        </a>
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

                <!-- Modal -->
                <Modal
                    id="CustomerVerifModal"
                    :title="modalTitle"
                    :description="modalDescription"
                    :validation-errors-from-parent="validationErrors"
                    class="modal-xl"
                >
                    <template #default>
                        <form @submit.prevent="handleSubmit" novalidate>
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
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-docs" role="tab" aria-selected="false" type="button">
                                                <span class="ri-file-text-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Dokumen Verifikasi</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="tab-content pt-6">
                                <!-- Tab Informasi -->
                                <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                    <div class="row g-4">
                                        <div class="col-md-12">
                                            <label class="form-label text-muted mb-2">Pilih Site Investment (Status: Approved)</label>
                                            <CustomSelect2
                                                v-model="form.siteInvestmentId"
                                                :options="approvedSiteInvestments"
                                                :get-option-label="formatSiteInvestmentOptionLabel"
                                                :reduce="si => si.id"
                                                placeholder="Pilih Site Investment"
                                                searchable
                                                clearable
                                                :loading="loadingSiteInvestments"
                                                loading-text="Memuat Site Investment..."
                                                @update:modelValue="onSiteInvestmentChange"
                                            />
                                            <small class="text-muted d-block mt-1">Hanya Site Investment dengan status 'approved' yang dapat dipilih</small>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="form.customerName" class="form-control" placeholder="Nama Customer" required>
                                                <label>Nama Customer <span class="text-danger">*</span></label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="email" v-model="form.customerEmail" class="form-control" placeholder="Email Customer" required>
                                                <label>Email Customer <span class="text-danger">*</span></label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="form.customerPhone" class="form-control" placeholder="Phone Customer" required>
                                                <label>Phone Customer <span class="text-danger">*</span></label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="form.customerNpwp" class="form-control" placeholder="NPWP Customer" required>
                                                <label>NPWP Customer <span class="text-danger">*</span></label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="form.customerKtp" class="form-control" placeholder="KTP Customer">
                                                <label>KTP Customer <span class="text-muted small">(Opsional)</span></label>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-floating form-floating-outline">
                                                <textarea v-model="form.customerAddress" class="form-control" placeholder="Alamat Customer" rows="3" required></textarea>
                                                <label>Alamat Customer <span class="text-danger">*</span></label>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-floating form-floating-outline">
                                                <textarea v-model="form.notes" class="form-control" placeholder="Catatan" rows="3"></textarea>
                                                <label>Notes</label>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    type="file"
                                                    @change="onAttachmentChange"
                                                    class="form-control"
                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                                                >
                                                <label>Attachment (PDF, Excel, Word, Image)</label>
                                                <small class="text-muted d-block mt-1">Maks. 2MB. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv</small>
                                                <div v-if="form.attachmentPreview" class="mt-2">
                                                    <a :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer" class="d-block mb-1">Lihat Attachment</a>
                                                    <img v-if="isImageFile(form.attachment?.name || form.attachmentPreview)" :src="form.attachmentPreview" alt="Preview" class="attachment-preview" style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tab Dokumen Verifikasi -->
                                <div class="tab-pane fade" id="form-tabs-docs" role="tabpanel">
                                    <div class="row g-4">
                                        <div class="col-12">
                                            <h6 class="mb-3">Dokumen Verifikasi</h6>
                                            <p class="text-muted mb-4">Pilih dokumen yang telah diverifikasi untuk customer ini</p>
                                            
                                            <div v-for="(doc, index) in form.customerVerifDocs" :key="index" class="mb-3 repeater-item">
                                                <div class="card-body">
                                                    <div class="row g-3">
                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" v-model="doc.akta" :id="`akta-${index}`">
                                                                <label class="form-check-label" :for="`akta-${index}`">
                                                                    Akta
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" v-model="doc.npwp" :id="`npwp-${index}`">
                                                                <label class="form-check-label" :for="`npwp-${index}`">
                                                                    NPWP
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" v-model="doc.nib" :id="`nib-${index}`">
                                                                <label class="form-check-label" :for="`nib-${index}`">
                                                                    NIB
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" v-model="doc.ktp" :id="`ktp-${index}`">
                                                                <label class="form-check-label" :for="`ktp-${index}`">
                                                                    KTP
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" v-model="doc.suratKuasa" :id="`suratKuasa-${index}`">
                                                                <label class="form-check-label" :for="`suratKuasa-${index}`">
                                                                    Surat Kuasa
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" v-model="doc.skKemenhum" :id="`skKemenhum-${index}`">
                                                                <label class="form-check-label" :for="`skKemenhum-${index}`">
                                                                    SK Kemenhum
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6 d-flex justify-content-end">
                                                            <button v-if="form.customerVerifDocs.length > 1" @click.prevent="customerVerifStore.removeCustomerVerifDoc(index)" class="btn btn-outline-danger">Hapus</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button @click.prevent="customerVerifStore.addCustomerVerifDoc()" class="btn btn-primary">
                                                <i class="ri-add-line me-1"></i>
                                                Tambah Dokumen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer mt-6">
                                <button type="button" class="btn btn-outline-secondary" @click="customerVerifStore.closeModal()">Tutup</button>
                                <button type="submit" class="btn btn-primary ms-2" :disabled="saving">
                                    <span v-if="saving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </template>
                </Modal>
            </div>
        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomerVerifStore } from '~/stores/customer-verif'
import { useCustomerStore } from '~/stores/customer'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { formatSiteInvestmentOptionLabel } from '~/constants/labels/sales'

const { setListTitle } = useDynamicTitle()
const route = useRoute()
const router = useRouter()

const isInitialLoading = ref(true)
const customerVerifStore = useCustomerVerifStore()
const customerStore = useCustomerStore()
const permissionStore = usePermissionsStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const { customerVerifs, loading, saving, totalRecords, params, form, isEditMode, showModal, validationErrors, approvedSiteInvestments, stats } = storeToRefs(customerVerifStore)
const { customers } = storeToRefs(customerStore)
const { permissions } = storeToRefs(permissionStore)

const myDataTableRef = ref(null)
const filters = ref({
    status: null,
    siteInvestmentId: null,
    customerId: null,
    search: '',
})

const hasActiveFilters = computed(
  () => !!filters.value.customerId || !!filters.value.status || !!filters.value.siteInvestmentId
)

function resetFilters() {
  filters.value.customerId = null
  filters.value.status = null
  filters.value.siteInvestmentId = null
}
const globalFilterValue = ref('')
const loadingSiteInvestments = ref(false)

const tableControls = ref({
    rows: 10,
    search: ''
})

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => isEditMode.value ? 'Edit Customer Verification' : 'Tambah Customer Verification')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Customer Verification di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Customer Verification baru.')

const statusOptions = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Verified', value: 'verified' },
    { label: 'Unverified', value: 'unverified' },
])

const { isLoading: isDataLoading, error: dataError } = usePageData({
    pageName: 'Customer Verification',
    loaders: [
        () => permissionStore.fetchPermissions(),
        () => customerStore.fetchCustomers(),
        () => customerVerifStore.fetchApprovedSiteInvestments(),
        () => customerVerifStore.fetchStats(),
        () => customerVerifStore.fetchCustomerVerifs(),
    ],
    onSuccess: () => {
        setListTitle('Customer Verification', stats.value.total || 0)
    },
    waitAll: true
})

watch(isDataLoading, (value) => {
    isInitialLoading.value = value
})

let modalInstance = null

onMounted(() => {
    const modalElement = document.getElementById('CustomerVerifModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }

    tableControls.value.rows = Number(params.value.rows) || 10
    tableControls.value.search = globalFilterValue.value

    const editId = route.query.edit
    if (editId && typeof editId === 'string') {
        nextTick(() => customerVerifStore.openModal({ id: Number(editId) }))
    }
})

watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10
})

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue
})

watch(showModal, async (newValue) => {
    if (newValue) {
        loadingSiteInvestments.value = true
        await customerVerifStore.fetchApprovedSiteInvestments()

        // Keep currently linked SI selectable even if status changed after create
        const current = form.value?.siteInvestment
        if (current?.id) {
            const list = customerVerifStore.approvedSiteInvestments
            if (!list.some((s) => String(s.id) === String(current.id))) {
                customerVerifStore.approvedSiteInvestments = [current, ...list]
            }
        }

        loadingSiteInvestments.value = false

        nextTick(() => {
            const modalElement = document.getElementById('CustomerVerifModal')
            if (modalElement && !modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement)
            }
            modalInstance?.show()
        })
    } else {
        modalInstance?.hide()
        if (route.query.edit) {
            const q = { ...route.query }
            delete q.edit
            router.replace({ path: route.path, query: q })
        }
    }
})

const debouncedSearch = useDebounceFn(() => {
    customerVerifStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters
    customerVerifStore.setFilters(restFilters)
}, { deep: true })

const onPage = (event) => {
    if (event) {
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        }
        customerVerifStore.setPagination(validEvent)
    }
}

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    customerVerifStore.fetchCustomerVerifs()
}

const handleSearch = (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    customerVerifStore.fetchCustomerVerifs()
}

const onSort = (event) => {
    if (event) {
        customerVerifStore.setSort(event)
    }
}

const exportData = async (format) => {
    const toast = useToast()
    if (format === 'csv') {
        myDataTableRef.value.exportCSV()
    } else {
        toast.info({
            title: 'Info',
            message: 'Export PDF akan segera tersedia',
            color: 'blue'
        })
    }
}

function onAttachmentChange(e) {
    if (!form.value) return
    const file = e.target.files?.[0]
    if (file) {
        if (!file.size || file.size === 0) {
            useToast().error({ title: 'Error', message: 'File attachment kosong atau tidak valid', color: 'red' })
            return
        }
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            useToast().error({ title: 'Error', message: 'Ukuran file maksimal 2MB', color: 'red' })
            return
        }
        const ext = file.name?.split('.').pop()?.toLowerCase() || ''
        const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
        if (!allowed.includes(ext)) {
            useToast().error({ title: 'Error', message: `Format tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red' })
            return
        }
        form.value.attachment = file
        form.value.attachmentPreview = URL.createObjectURL(file)
    } else {
        form.value.attachment = null
        form.value.attachmentPreview = null
    }
    e.target.value = ''
}

const handleSubmit = () => {
    customerVerifStore.saveCustomerVerif()
}

const onSiteInvestmentChange = async (siteInvestmentId) => {
    await customerVerifStore.onSiteInvestmentChange(siteInvestmentId)
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
        case 'pending': return { text: 'Pending', class: 'badge rounded-pill bg-label-warning' }
        case 'verified': return { text: 'Verified', class: 'badge rounded-pill bg-label-success' }
        case 'unverified': return { text: 'Unverified', class: 'badge rounded-pill bg-label-danger' }
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
    }
}

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'check-permission'],
    title: 'Customer Verification',
    description: 'Customer Verification Management',
    keywords: 'Customer Verification, Order Process, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
/* Dropdown Actions table: tampil di atas agar tidak tertutup overflow */
:deep(.cv-actions-dropdown) {
    z-index: 1100 !important;
}

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

@media (max-width: 768px) {
    .card-body {
        padding: 16px;
    }

    .form-label {
        font-size: 13px;
        margin-bottom: 6px;
    }
}

@media (max-width: 576px) {
    .card-body {
        padding: 12px;
    }
}
</style>
