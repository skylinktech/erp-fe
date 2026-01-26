<template>
    <div class="page-wrapper">
        <div class="content-wrapper">
            <!-- Loading Overlay -->
            <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Memuat data Purchase Request...</p>
                </div>
            </div>

            <!-- Content -->
            <div v-else class="container-xxl flex-grow-1 container-p-y">
                <h4 class="mb-1">Purchase Request</h4>
                <p class="mb-6">List Purchase Request yang terdaftar di sistem</p>

                <!-- Statistics Cards -->
                <div class="row g-6 mb-6">
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Total Purchase Request</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-primary">
                                            <i class="ri-file-list-3-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                                        <span class="text-muted">Purchase Request terdaftar</span>
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
                                    <p class="mb-0">Approved</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-success">
                                            <i class="ri-checkbox-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.approved || 0 }}</h5>
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
                                        <h5 class="mb-1">{{ stats.rejected || 0 }}</h5>
                                        <span class="text-muted">Rejected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Received</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-info">
                                            <i class="ri-checkbox-multiple-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.received || 0 }}</h5>
                                        <span class="text-muted">Received</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-6">
                    <div class="col-12">
                        <h4 class="mt-6 mb-1">Filter Purchase Request</h4>
                        <p class="mb-0">Temukan semua Purchase Request perusahaan Anda</p>
                    </div>
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter MGRF</label>
                                        <CustomSelect2
                                            v-model="filters.mgrfId"
                                            :options="mgrfs"
                                            :get-option-label="mgrf => mgrf.noMgrf || `MGRF #${mgrf.id}`"
                                            :reduce="mgrf => mgrf.id"
                                            placeholder="Pilih MGRF"
                                            searchable
                                            clearable
                                            :loading="mgrfStore.loading"
                                            loading-text="Memuat MGRF..."
                                        />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Vendor</label>
                                        <CustomSelect2
                                            v-model="filters.vendorId"
                                            :options="vendors"
                                            :get-option-label="vendor => vendor.name || `Vendor #${vendor.id}`"
                                            :reduce="vendor => vendor.id"
                                            placeholder="Pilih Vendor"
                                            searchable
                                            clearable
                                        />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Status</label>
                                        <CustomSelect2
                                            v-model="filters.status"
                                            :options="statusOptions"
                                            :get-option-label="option => option.label"
                                            :reduce="option => option.value"
                                            placeholder="Pilih Status"
                                            searchable
                                            clearable
                                        />
                                    </div>
                                </div>
                                <div class="row mt-3">
                                    <div class="col-md-4 mb-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="filters.startDate" class="form-control" placeholder="Tanggal Mulai" @change="onDateChange">
                                            <label>Tanggal Mulai</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="filters.endDate" class="form-control" placeholder="Tanggal Akhir" @change="onDateChange">
                                            <label>Tanggal Akhir</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3 reset-filter-button">
                                        <button @click="clearFilters" class="btn btn-outline-secondary me-2">
                                            <i class="ri-refresh-line me-1"></i> Reset Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                        v-if="userHasRole('superadmin') || userHasPermission('create_purchase_request')"
                                        @click="purchaseRequestStore.openModal(null)"
                                        class="btn btn-primary"
                                    >
                                        <i class="ri-add-line me-1"></i>
                                        Tambah Purchase Request
                                    </button>
                                    <button @click="exportData('csv')" class="btn btn-outline-secondary" :disabled="loading">
                                        <i class="ri-download-line me-1"></i>
                                        Export
                                    </button>
                                    <span class="p-input-icon-left">
                                        <InputText
                                            v-model="globalFilterValue"
                                            placeholder="Cari Purchase Request..."
                                            class="w-full md:w-20rem"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable
                                    ref="myDataTableRef"
                                    :data="purchaseRequests"
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
                                    <Column field="noPr" header="No. PR" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/purchasing/purchase-request/detail/${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                title="View detail"
                                                class="text-primary"
                                            >
                                                {{ slotProps.data.noPr || '-' }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="mgrf.noMgrf" header="MGRF" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/purchasing/mgrf/detail/${slotProps.data.mgrf?.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                title="View detail"
                                                class="text-primary"
                                            >
                                                {{ slotProps.data.mgrf?.noMgrf || '-' }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="vendor.name" header="Vendor" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ slotProps.data.vendor?.name || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.status).class">
                                                {{ getStatusBadge(slotProps.data.status).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="description" header="Deskripsi" :sortable="true"></Column>
                                    <Column field="total" header="Total" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatRupiah(slotProps.data.total || 0) }}
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
                                                <ul class="dropdown-menu dropdown-menu-end purchase-request-actions-dropdown">
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_purchase_request')) && slotProps.data.status === 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseRequestStore.submitPurchaseRequest(slotProps.data.id)">
                                                            <i class="ri-send-plane-line me-2"></i> Submit Purchase Request
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_purchase_request')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseRequestStore.approvePurchaseRequest(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('reject_purchase_request')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseRequestStore.rejectPurchaseRequest(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('edit_purchase_request')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseRequestStore.openModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('delete_purchase_request')) && slotProps.data.status === 'draft'">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="purchaseRequestStore.deletePurchaseRequest(slotProps.data.id)">
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
                    id="PurchaseRequestModal"
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
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-items" role="tab" aria-selected="false" type="button">
                                                <span class="ri-box-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Items</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="tab-content pt-6">
                                <!-- Tab Info -->
                                <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <label class="form-label text-muted mb-2">MGRF</label>
                                            <CustomSelect2
                                                v-model="form.mgrfId"
                                                :options="mgrfs"
                                                :get-option-label="mgrf => mgrf.noMgrf || `MGRF #${mgrf.id}`"
                                                :reduce="mgrf => mgrf.id"
                                                placeholder="Pilih MGRF"
                                                searchable
                                                clearable
                                                :disabled="isEditMode"
                                                @update:modelValue="onMgrfChange"
                                            />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted mb-2">Vendor</label>
                                            <CustomSelect2
                                                v-model="form.vendorId"
                                                :options="vendors"
                                                :get-option-label="vendor => vendor.name || `Vendor #${vendor.id}`"
                                                :reduce="vendor => vendor.id"
                                                placeholder="Pilih Vendor"
                                                searchable
                                                clearable
                                            />
                                        </div>
                                        <div class="col-md-12">
                                            <div class="form-floating form-floating-outline">
                                                <textarea v-model="form.description" class="form-control" placeholder="Deskripsi" rows="3"></textarea>
                                                <label>Deskripsi</label>
                                            </div>
                                        </div>
                                        <div class="col-md-12">
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

                                <!-- Tab Items -->
                                <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">
                                    <!-- Checkbox untuk enable additional items -->
                                    <div class="mb-4" v-if="form.purchaseRequestItems && form.purchaseRequestItems.length > 0 && form.mgrfId">
                                        <div class="form-check">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                :id="'enable-additional'" 
                                                v-model="purchaseRequestStore.enableAdditional"
                                            >
                                            <label class="form-check-label" for="enable-additional">
                                                Item Tambahan (Additional)
                                            </label>
                                        </div>
                                        <small class="text-muted d-block mt-1">Centang untuk menambahkan item tambahan di luar item dari MGRF</small>
                                    </div>
                                    
                                    <div v-for="(item, index) in form.purchaseRequestItems" :key="index" class="repeater-item mb-4">
                                        <!-- Badge untuk menandai item additional -->
                                        <div v-if="item.additional" class="mb-2">
                                            <span class="badge bg-label-warning">
                                                <i class="ri-add-line me-1"></i> Item Tambahan
                                            </span>
                                        </div>
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Product</label>
                                                <CustomSelect2
                                                    v-model="item.productId"
                                                    :options="products"
                                                    :get-option-label="p => `${p.name} (${p.sku})`"
                                                    :reduce="p => p.id"
                                                    placeholder="Pilih Product"
                                                    searchable
                                                    clearable
                                                    @update:modelValue="onProductChange(index)"
                                                />
                                            </div>
                                            <div class="col-md-3">
                                                <label class="form-label text-muted mb-2">Warehouse</label>
                                                <CustomSelect2
                                                    v-model="item.warehouseId"
                                                    :options="warehouses"
                                                    :get-option-label="w => w.name"
                                                    :reduce="w => w.id"
                                                    placeholder="Pilih Warehouse"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-2">
                                                <label class="form-label text-muted mb-2">Unit</label>
                                                <CustomSelect2
                                                    v-model="item.unitId"
                                                    :options="units"
                                                    :get-option-label="u => u.symbol"
                                                    :reduce="u => u.id"
                                                    placeholder="Unit"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-1">
                                                <label class="form-label text-muted mb-2">Quantity</label>
                                                <input type="number" v-model.number="item.quantity" @input="calculateSubtotal(index)" class="form-control" placeholder="Qty" min="1">
                                            </div>
                                            <div class="col-md-2">
                                                <label class="form-label text-muted mb-2">Harga</label>
                                                <input type="number" v-model.number="item.price" @input="calculateSubtotal(index)" class="form-control" placeholder="Harga" min="0" step="0.01">
                                            </div>
                                            <div class="col-md-12">
                                                <label class="form-label text-muted mb-2">Deskripsi Item</label>
                                                <textarea v-model="item.description" class="form-control" placeholder="Deskripsi Item" rows="2"></textarea>
                                            </div>
                                            <div class="col-md-12 d-flex justify-content-end">
                                                <button @click.prevent="purchaseRequestStore.removeItem(index)" class="btn btn-outline-danger">Hapus</button>
                                            </div>
                                        </div>
                                        <hr class="my-4">
                                    </div>
                                    <div class="mt-4" v-if="purchaseRequestStore.enableAdditional">
                                        <button @click.prevent="purchaseRequestStore.addItem(true)" class="btn btn-primary">
                                            <i class="ri-add-line me-1"></i> Tambah Item Tambahan
                                        </button>
                                    </div>
                                    <div class="d-flex justify-content-end mt-4">
                                        <span class="fw-bold fs-5">Total: {{ formatRupiah(totalAmount) }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer mt-6">
                                <button type="button" class="btn btn-outline-secondary" @click="purchaseRequestStore.closeModal()">Tutup</button>
                                <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
import { usePurchaseRequestStore } from '~/stores/purchase-request'
import { useMgrfStore } from '~/stores/mgrf'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'
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

const { setListTitle } = useDynamicTitle()
const route = useRoute()
const router = useRouter()

const isInitialLoading = ref(true)
const purchaseRequestStore = usePurchaseRequestStore()
const mgrfStore = useMgrfStore()
const productStore = useProductStore()
const warehouseStore = useWarehouseStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const { purchaseRequests, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, stats, enableAdditional } = storeToRefs(purchaseRequestStore)
const { products } = storeToRefs(productStore)
const { warehouses } = storeToRefs(warehouseStore)
const { permissions } = storeToRefs(permissionStore)

const mgrfs = ref([])
const vendors = ref([])
const units = ref([])

const myDataTableRef = ref(null)
const filters = ref({
    mgrfId: null,
    vendorId: null,
    status: null,
    startDate: null,
    endDate: null,
    search: '',
})
const globalFilterValue = ref('')

const tableControls = ref({
    rows: 10,
    search: ''
})

const fetchMgrfsForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.mgrf()}?page=1&rows=500&status=approved`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (res.ok) {
            const j = await res.json()
            mgrfs.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching MGRFs for select:', e)
    }
}

const fetchVendorsForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch($api.vendor(), {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (res.ok) {
            const j = await res.json()
            vendors.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching vendors for select:', e)
    }
}

const fetchUnitsForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch($api.unit(), {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (res.ok) {
            const j = await res.json()
            units.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching units for select:', e)
    }
}

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => isEditMode.value ? 'Edit Purchase Request' : 'Tambah Purchase Request')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Purchase Request di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Purchase Request baru.')

const statusOptions = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Received', value: 'received' },
])

const totalAmount = computed(() => {
    if (!form.value || !form.value.purchaseRequestItems) return 0
    return form.value.purchaseRequestItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const { isLoading: isDataLoading, error: dataError } = usePageData({
    pageName: 'Purchase Request',
    loaders: [
        () => productStore.fetchProducts(),
        () => warehouseStore.fetchWarehouses(),
        () => permissionStore.fetchPermissions(),
        () => fetchMgrfsForSelect(),
        () => fetchVendorsForSelect(),
        () => fetchUnitsForSelect(),
        () => purchaseRequestStore.fetchPurchaseRequests(),
        () => purchaseRequestStore.fetchStats(),
    ],
    onSuccess: () => {
        setListTitle('Purchase Request', stats.value.total || 0)
    },
    waitAll: true
})

watch(isDataLoading, (value) => {
    isInitialLoading.value = value
})

let modalInstance = null

onMounted(() => {
    const modalElement = document.getElementById('PurchaseRequestModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }

    tableControls.value.rows = Number(params.value.rows) || 10
    tableControls.value.search = globalFilterValue.value

    const editId = route.query.edit
    if (editId && typeof editId === 'string') {
        nextTick(() => purchaseRequestStore.openModal({ id: editId }))
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
        nextTick(() => {
            const modalElement = document.getElementById('PurchaseRequestModal')
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
    purchaseRequestStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters
    purchaseRequestStore.setFilters(restFilters)
}, { deep: true })

const onPage = (event) => {
    if (event) {
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        }
        purchaseRequestStore.setPagination(validEvent)
    }
}

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    purchaseRequestStore.fetchPurchaseRequests()
}

const handleSearch = (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    purchaseRequestStore.fetchPurchaseRequests()
}

const onSort = (event) => {
    if (event) {
        purchaseRequestStore.setSort(event)
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
    // Validasi sebelum submit
    if (!form.value.purchaseRequestItems || form.value.purchaseRequestItems.length === 0) {
        useToast().error({
            title: 'Error',
            message: 'Minimal harus ada 1 item',
            color: 'red'
        })
        return
    }
    
    // Validasi setiap item - pastikan semua field required terisi
    const invalidItems = form.value.purchaseRequestItems.filter((item, index) => {
        return !item.productId || !item.warehouseId || !item.unitId || !item.quantity || item.quantity <= 0
    })
    
    if (invalidItems.length > 0) {
        useToast().error({
            title: 'Error',
            message: 'Semua item harus memiliki Product, Warehouse, Unit, dan Quantity yang valid',
            color: 'red'
        })
        return
    }
    
    // Pastikan semua item memiliki subtotal yang benar
    form.value.purchaseRequestItems.forEach((item) => {
        if (!item.subtotal || item.subtotal === 0) {
            item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
        }
    })
    
    // Set total dari totalAmount
    form.value.total = totalAmount.value
    
    purchaseRequestStore.savePurchaseRequest()
}

const onMgrfChange = async (mgrfId) => {
    if (!mgrfId || isEditMode.value) return
    
    const toast = useToast()
    const { $api } = useNuxtApp()
    
    try {
        // Fetch MGRF details dengan includeItems
        const response = await fetch(`${$api.mgrf()}/${mgrfId}?includeItems=true`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data MGRF')
        }
        
        const result = await response.json()
        const mgrfData = result.data
        
        if (!mgrfData || !mgrfData.mgrfItems) {
            return
        }
        
        if (mgrfData.mgrfItems.length === 0) {
            toast.info({
                title: 'Info',
                message: 'MGRF yang dipilih tidak memiliki item',
                color: 'blue'
            })
            return
        }
        
        // Map ke format purchaseRequestItems
        const mappedItems = mgrfData.mgrfItems.map((item) => {
            return {
                productId: item.productId,
                warehouseId: item.warehouseId || null,
                unitId: item.unitId || null,
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
                subtotal: Number(item.subtotal) || (Number(item.quantity) || 1) * (Number(item.price) || 0),
                additional: false,
                description: item.description || ''
            }
        })
        
        // Clear existing items dan set new items
        form.value.purchaseRequestItems = mappedItems
        
        toast.success({
            title: 'Success',
            message: `${mappedItems.length} item berhasil dimuat dari MGRF`,
            color: 'green',
            position: 'topRight',
            layout: 2,
        })
      } catch (error) {
          console.error('Error loading MGRF details:', error)
          const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data MGRF'
          toast.error({
              title: 'Error',
              message: errorMessage,
              color: 'red',
              position: 'topRight',
              layout: 2,
          })
      }
}

const onProductChange = (index) => {
    const item = form.value.purchaseRequestItems[index]
    const selectedProduct = products.value.find(p => p.id === item.productId)
    if (selectedProduct) {
        item.price = Number(selectedProduct.priceSell) || 0
        // Set unitId jika belum ada
        if (!item.unitId && selectedProduct.unitId) {
            item.unitId = selectedProduct.unitId
        }
        calculateSubtotal(index)
    }
}

const calculateSubtotal = (index) => {
    const item = form.value.purchaseRequestItems[index]
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    item.subtotal = quantity * price
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
        case 'pending': return { text: 'Pending', class: 'badge rounded-pill bg-label-warning' }
        case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-success' }
        case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' }
        case 'received': return { text: 'Received', class: 'badge rounded-pill bg-label-info' }
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
    }
}

const clearFilters = () => {
    filters.value.mgrfId = null
    filters.value.vendorId = null
    filters.value.status = null
    filters.value.startDate = null
    filters.value.endDate = null
    purchaseRequestStore.setFilters(filters.value)
}

const onDateChange = () => {
    purchaseRequestStore.setFilters(filters.value)
}

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'check-permission'],
    title: 'Purchase Request',
    description: 'Purchase Request Management',
    keywords: 'Purchase Request, Purchasing, Kainnova Digital Solutions',
    author: 'Kainnova Digital Solutions',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
/* Dropdown Actions table: tampil di atas agar tidak tertutup overflow */
:deep(.purchase-request-actions-dropdown) {
    z-index: 1100 !important;
}

.repeater-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease-in-out;
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
