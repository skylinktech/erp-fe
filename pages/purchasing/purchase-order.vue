<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Purchase Order</h4>
            <p class="mb-6">
            List purchaseOrder yang terdaftar di sistem
            </p>
            <!-- purchaseOrder cards -->
            <div class="row g-6 mb-6">
                <!-- Cards untuk Statistik Pegawai -->
                <CardBox
                    title="Total Purchase Order"
                    :total="(stats.total || 0) + ' Purchase Order'"
                />
                <CardBox
                    title="Purchase Order Approved"
                    :total="(stats.approved || 0) + ' Purchase Order'"
                />
                <CardBox
                    title="Purchase Order Rejected"
                    :total="(stats.rejected || 0) + ' Purchase Order'"
                />
                <CardBox
                    title="Purchase Order Received"
                    :total="(stats.received || 0) + ' Purchase Order'"
                />
                <CardBox
                    title="Purchase Order Draft"
                    :total="(stats.draft || 0) + ' Purchase Order'"
                />
                <CardBox
                    v-if="userHasRole('superadmin') || userHasPermission('create_purchase_order')"
                    :isAddButtonCard="true"
                    image-src="/img/illustrations/add-new-role-illustration.png"
                    image-alt="Tambah Purchase Order"
                    button-text="Tambah Purchase Order"
                    @button-click="purchaseOrderStore.openModal()"
                />
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Filter & Daftar Purchase Order</h4>
                    <p class="mb-0">Cari dan kelola semua purchase order perusahaan Anda beserta detailnya.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <v-select v-model="filters.vendorId" :options="vendors || []" :get-option-label="v => v.name" :reduce="v => v.id" placeholder="Pilih Vendor" class="v-select-style"/>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <v-select v-model="filters.poType" :options="poTypeOptions" :get-option-label="option => option.label" :reduce="option => option.value" placeholder="Pilih Tipe PO" class="v-select-style"/>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <v-select v-model="filters.status" :options="statusOptions" :get-option-label="option => option.label" :reduce="option => option.value" placeholder="Pilih Status" class="v-select-style"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <!-- purchaseOrder Table -->
                    <div class="card">
                        <div class="card-header">
                            <TableControls
                                v-model="tableControls"
                                :rows-per-page-options="rowsPerPageOptionsArray"
                                search-placeholder="Cari Sales Order..."
                                @rows-change="handleRowsChange"
                                @search="handleSearch"
                                @export="exportData"
                            />
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="purchaseOrders" 
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
                                        <template #body="slotProps">
                                            {{ params.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>
                                    <Column field="noPo" header="No. PO" :sortable="true">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/purchasing/purchase-order-detail?id=${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                            >
                                                {{ slotProps.data.noPo }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="vendor.name" header="Nama Vendor" :sortable="true"></Column>
                                    <Column field="poType" header="Tipe PO" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getPoTypeBadge(slotProps.data.poType).class">
                                                {{ getPoTypeBadge(slotProps.data.poType).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="status" header="Status PO" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.status).class">
                                                {{ getStatusBadge(slotProps.data.status).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="createdByUser.fullName" header="Dibuat Oleh" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.createdByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="approvedByUser.fullName" header="Approved By" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.approvedByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="up" header="Untuk Perhatian" :sortable="true"></Column>
                                    <Column field="date" header="Tanggal PO" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="dueDate" header="Jatuh Tempo" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.dueDate ? new Date(slotProps.data.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.perusahaan?.nmPerusahaan || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="cabang.nmCabang" header="Cabang" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.cabang?.nmCabang || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="attachment" header="Attachment" :sortable="true">
                                        <template #body="slotProps">
                                            <div v-if="slotProps.data.attachment">
                                                <a 
                                                    :href="getAttachmentUrl(slotProps.data.attachment)" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    download
                                                    class="badge rounded-pill bg-label-primary"
                                                    style="text-decoration: none;"
                                                >
                                                    <i class="ri-file-line me-2"></i>
                                                    Download File
                                                </a>
                                            </div>
                                            <div v-else>
                                                <span class="text-muted">Tidak ada file</span>
                                            </div>
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasPermission('approve_purchase_order') && slotProps.data.status == 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseOrderStore.approvePurchaseOrder(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('reject_purchase_order') && slotProps.data.status == 'draft')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseOrderStore.rejectPurchaseOrder(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('view_purchase_order'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="viewPurchaseOrderDetails(slotProps.data.id)">
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('edit_purchase_order') && slotProps.data.status == 'draft')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseOrderStore.fetchPurchaseOrderForEdit(slotProps.data.id)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('delete_purchase_order') && (slotProps.data.status == 'draft'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="purchaseOrderStore.deletePurchaseOrder(slotProps.data.id)">
                                                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </Column>
                                    
                                    <!-- Expanded Row Template -->
                                    <template #expansion="slotProps">
                                        <PurchaseOrderExpandedRow :purchaseOrder="slotProps.data" />
                                    </template>
                            </MyDataTable>
                        </div>
                    </div>
                    <!--/ purchaseOrder Table -->
                </div>
            </div>
            <!--/ purchaseOrder cards -->

            <Modal 
                id="PurchaseOrderModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="purchaseOrderStore.savePurchaseOrder()">
                         <div class="row">
                            <div class="col">
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                            <span class="ri-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">Informasi Purchase Order</span>
                                        </button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-items" role="tab" aria-selected="false" type="button">
                                            <span class="ri-folder-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">List Product</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="tab-content pt-4">
                            <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                <div class="row g-4">
                                    <div class="col-md-12">
                                        <div class="form-floating form-floating-outline">
                                            <input type="hidden" v-model="form.noPo" class="form-control" placeholder="No PO" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Tipe Purchase Order</label>
                                        <div class="d-flex gap-5">
                                            <div class="form-check">
                                                <input 
                                                    class="form-check-input" 
                                                    type="checkbox" 
                                                    id="poType_internal" 
                                                    :checked="form.poType === 'internal'"
                                                    @change="handlePoTypeChange('internal')"
                                                >
                                                <label class="form-check-label" for="poType_internal">
                                                    Internal
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input 
                                                    class="form-check-input" 
                                                    type="checkbox" 
                                                    id="poType_external" 
                                                    :checked="form.poType === 'external'"
                                                    @change="handlePoTypeChange('external')"
                                                >
                                                <label class="form-check-label" for="poType_external">
                                                    External
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-4">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="text" 
                                                v-model="form.extNamaPerusahaan" 
                                                class="form-control" 
                                                placeholder="Nama Perusahaan External"
                                                :disabled="!isExternalPO"
                                            >
                                            <label>Nama Perusahaan External</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <v-select 
                                            v-model="form.vendorId" 
                                            :options="vendors || []" 
                                            :get-option-label="v => v.name" 
                                            :reduce="v => v.id" 
                                            placeholder="Pilih Vendor" 
                                            class="v-select-style"
                                            :loading="vendorStore.loading"
                                        />
                                        <small class="text-muted">Vendor tersedia: {{ vendors?.length || 0 }}</small>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.up" class="form-control" placeholder="Untuk Perhatian" required>
                                            <label>Untuk Perhatian</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.date" class="form-control" required>
                                            <label>Tanggal PO</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.dueDate" class="form-control" required>
                                            <label>Jatuh Tempo</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.termOfPayment" class="form-control" required>
                                            <label>Term Of Payment</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <v-select 
                                            v-model="form.perusahaanId" 
                                            :options="perusahaans || []" 
                                            :get-option-label="p => p.nmPerusahaan" 
                                            :reduce="p => p.id" 
                                            placeholder="Pilih Perusahaan" 
                                            class="v-select-style"
                                            :disabled="isExternalPO"
                                            :loading="perusahaanStore.loading"
                                        />
                                        <small class="text-muted">Perusahaan tersedia: {{ perusahaans?.length || 0 }}</small>
                                    </div>
                                    <div class="col-md-6">
                                        <v-select 
                                            v-model="form.cabangId" 
                                            :options="filteredCabangs" 
                                            :get-option-label="c => c.nmCabang" 
                                            :reduce="c => c.id" 
                                            placeholder="Pilih Cabang" 
                                            class="v-select-style"
                                            :disabled="isExternalPO"
                                            :loading="cabangStore.loading"
                                        />
                                        <small class="text-muted">Cabang tersedia: {{ filteredCabangs?.length || 0 }}</small>
                                    </div>

                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="number" v-model="form.discountPercent" class="form-control" placeholder="Discount (%)">
                                            <label>Discount (%)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="number" v-model="form.taxPercent" class="form-control" placeholder="Tax (%)">
                                            <label>Tax (%)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="file" 
                                                @change="onFileChange" 
                                                class="form-control"
                                                accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp,.svg"
                                            >
                                            <label>Attachment (PDF, Excel, Image)</label>
                                            <small class="text-muted">Ukuran maksimal 2MB</small>
                                            
                                            <div v-if="form.attachmentPreview" class="mt-2">
                                                <div class="d-flex align-items-center mb-2">
                                                    <i :class="getFileIcon(form.attachmentPreview)" style="font-size: 1.2rem; margin-right: 0.5rem;"></i>
                                                    <a :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer" class="d-block">Lihat Attachment</a>
                                                </div>
                                                <div v-if="isImageFile(form.attachmentPreview)" class="mt-2">
                                                    <img 
                                                        :src="form.attachmentPreview" 
                                                        alt="Attachment Preview" 
                                                        class="attachment-preview"
                                                        style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-floating form-floating-outline">
                                            <textarea v-model="form.description" class="form-control" placeholder="Deskripsi"></textarea>
                                            <label>Deskripsi</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">
                                <div v-for="(item, index) in form.purchaseOrderItems" :key="index" class="repeater-item mb-4">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <v-select 
                                                v-model="item.warehouseId" 
                                                :options="warehouses || []" 
                                                :get-option-label="w => `${w.name} (${w.code})`" 
                                                :reduce="w => w.id" 
                                                placeholder="Pilih Gudang (Opsional)" 
                                                class="v-select-style"
                                                :loading="warehouseStore.loading"
                                                @update:modelValue="onWarehouseChange(index)"
                                                :clearable="true"
                                            />
                                        </div>
                                        <div class="col-md-4">
                                            <v-select 
                                                v-model="item.productId" 
                                                :options="getProductsByWarehouse(item.warehouseId)" 
                                                :get-option-label="product => `${product.sku} | ${product.name}`"
                                                :reduce="p => p.id" 
                                                placeholder="Cari berdasarkan SKU atau nama produk..." 
                                                @update:modelValue="onProductChange(index)" 
                                                class="v-select-style"
                                                :loading="productStore.loading"
                                                :searchable="true"
                                                :clearable="true"
                                                :close-on-select="true"
                                                :preserve-search="false"
                                                :filter-by="(option, label, search) => {
                                                    const product = option;
                                                    const searchLower = search.toLowerCase();
                                                    return product.name.toLowerCase().includes(searchLower) || 
                                                    product.sku.toLowerCase().includes(searchLower);
                                                }"
                                            >
                                                <template #option="option">
                                                    <div class="d-flex justify-content-between align-items-center w-100">
                                                        <div>
                                                            <div class="fw-bold">{{ option.sku }} | {{ option.name }}</div>
                                                            <small class="text-muted">{{ option.unit?.name || 'No Unit' }} - {{ formatRupiah(option.priceBuy) }}</small>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template #selected-option="option">
                                                    <div class="d-flex align-items-center">
                                                        <span class="fw-bold">{{ option.sku }} | {{ option.name }}</span>
                                                    </div>
                                                </template>
                                                <template #no-options>
                                                    <div class="text-center p-3">
                                                        <div class="text-muted">
                                                            <i class="ri-search-line me-2"></i>
                                                            Tidak ada produk ditemukan
                                                        </div>
                                                    </div>
                                                </template>
                                            </v-select>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-floating form-floating-outline">
                                                <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" placeholder="Qty">
                                                <label>Jumlah</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                                                <label>Harga</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                                                <label>Subtotal</label>
                                            </div>
                                        </div>
                                        <div class="col-md-9">
                                             <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item">
                                                <label>Deskripsi</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3 d-flex align-items-center">
                                            <button @click.prevent="purchaseOrderStore.removeItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                                        </div>
                                    </div>
                                    <hr class="my-4">
                                </div>
                                <div class="mt-4 col-12">
                                    <button @click.prevent="purchaseOrderStore.addItem()" class="btn btn-primary col-12 btn-sm">Tambah Item</button>
                                </div>
                                <div class="d-flex justify-content-end mt-6">
                                    <span class="fw-bold fs-7">Grand Total: {{ formatRupiah(grandTotal) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                             <button type="button" class="btn btn-outline-secondary" @click="purchaseOrderStore.closeModal()">Tutup</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
import { useVendorStore } from '~/stores/vendor'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import 'vue-select/dist/vue-select.css'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import Swal from 'sweetalert2'

// Components
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import TableControls from '~/components/table/TableControls.vue'
import PurchaseOrderExpandedRow from '~/components/table/PurchaseOrderExpandedRow.vue'
import vSelect from 'vue-select'
import Dropdown from 'primevue/dropdown'
import CardBox from '~/components/cards/Cards.vue'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()
const { getAttachmentUrl, getFileIcon, isImageFile, isPdfFile, isExcelFile } = useImageUrl()

const config = useRuntimeConfig();
const router = useRouter();

// Store
const myDataTableRef        = ref(null)
const purchaseOrderStore    = usePurchaseOrderStore()
const vendorStore           = useVendorStore()
const perusahaanStore       = usePerusahaanStore()
const warehouseStore        = useWarehouseStore()
const cabangStore           = useCabangStore()
const productStore          = useProductStore()
const userStore             = useUserStore()
const formatRupiah          = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions();
const permissionStore       = usePermissionsStore()

const { purchaseOrders, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, stats } = storeToRefs(purchaseOrderStore)
const { vendors }     = storeToRefs(vendorStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs }     = storeToRefs(cabangStore)
const { warehouses }  = storeToRefs(warehouseStore)
const { products, allProducts }    = storeToRefs(productStore)
const { user }        = storeToRefs(userStore)
const { permissions } = storeToRefs(permissionStore)

// State
const globalFilterValue = ref('');
const tableControls = ref({
    rows: 10,
    search: '',
});
const filters = ref({
    search: '',
    vendorId: null,
    poType: null,
    status: null,
});
const expandedRows = ref({});

// State untuk produk berdasarkan warehouse (tidak lagi digunakan, semua produk selalu tersedia)
// const productsByWarehouse = ref(new Map());

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Purchase Order' : 'Tambah Purchase Order');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data purchaseOrder di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan purchaseOrder baru.');

const grandTotal = computed(() => {
  if (!form.value || !form.value.purchaseOrderItems) return 0;

  const totalItems = (form.value.purchaseOrderItems || []).reduce((total, item) => {
    return total + (Number(item.subtotal) || 0);
  }, 0);

  const discountPercent = Number(form.value.discountPercent) || 0;
  const taxPercent = Number(form.value.taxPercent) || 0;

  const discountAmount = totalItems * (discountPercent / 100);
  const totalAfterDiscount = totalItems - discountAmount;
  const taxAmount = totalAfterDiscount * (taxPercent / 100);

  return totalAfterDiscount + taxAmount;
});

const poTypeOptions = ref([
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
]);

const statusOptions = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Approved', value: 'approved' },
    { label: 'Received', value: 'received' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Partial', value: 'partial' },
]);

let modalInstance = null;
onMounted(async () => {
    
    // Load data menggunakan method store yang standar
    try {
        // ✅ FIXED: Gunakan fetchAllProducts untuk memuat semua produk tanpa pagination
        await Promise.all([
            vendorStore.fetchVendors(),
            perusahaanStore.fetchPerusahaans(),
            productStore.fetchAllProducts(), // Load semua produk tanpa pagination
            warehouseStore.fetchWarehouses(),
            userStore.loadUser(),
            permissionStore.fetchPermissions()
        ]);
        
        // Load purchase orders and stats after other data is ready
        await Promise.all([
            purchaseOrderStore.fetchPurchaseOrders(),
            purchaseOrderStore.fetchStats()
        ]);
        
        // Set title after data is loaded
        setListTitle('Purchase Order', stats.value.total || 0)
        
        // Untuk cabang, kita akan load setelah perusahaan dipilih
    } catch (error) {
        console.error('Error loading data:', error);
    }
    
    const modalElement = document.getElementById('PurchaseOrderModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }

    // Initialize table controls
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;
});

// Watch untuk sinkronisasi table controls
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue;
});

watch(showModal, (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('PurchaseOrderModal')
            if (modalElement && !modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement)
            }
            modalInstance?.show()
        })
        
        // ✅ FIXED: Pastikan semua produk sudah dimuat (non-blocking)
        if (!allProducts.value || allProducts.value.length === 0) {
            // Jangan await di sini, biarkan berjalan di background
            productStore.fetchAllProducts().catch(error => {
                console.error('Error loading all products:', error);
            });
        }
        
        if (isEditMode.value && form.value?.attachment_url) {
            form.value.attachmentPreview = form.value.attachment_url
        } else if (isEditMode.value && form.value?.attachment) {
            form.value.attachmentPreview = getAttachmentUrl(form.value.attachment)
        } else {
            form.value.attachmentPreview = null
        }
    } else {
        modalInstance?.hide()
    }
})

watch(allProducts, (newProducts) => {
    if (newProducts && newProducts.length > 0) {
        console.log(`📦 Loaded ${newProducts.length} products for purchase order form`);
    } else {
        console.log('📦 No products loaded yet');
    }
})

watch(vendors, (newVendors) => {
    if (newVendors && newVendors.length > 0) {
    }
})

watch(perusahaans, (newPerusahaans) => {
    if (newPerusahaans && newPerusahaans.length > 0) {
    }
})

watch(warehouses, (newWarehouses) => {
    if (newWarehouses && newWarehouses.length > 0) {
    }
})

watch(filters, (newFilters) => {
    if (!newFilters) return;
    const { page, rows, ...restFilters } = newFilters;
    purchaseOrderStore.setFilters(restFilters);
}, { deep: true });

watch(() => form.value?.purchaseOrderItems, (newItems) => {
    if (newItems && newItems.length > 0) {
    }
}, { deep: true })

watch(() => form.value?.perusahaanId, async (newPerusahaanId) => {
    if (newPerusahaanId && form.value) {
        if(!isEditMode.value) {
            form.value.cabangId = null;
        }
        
        // Load cabang berdasarkan perusahaan yang dipilih
        try {
            const { $api } = useNuxtApp();
            const token = localStorage.getItem('token');
            const response = await fetch(`${$api.dataCabang()}?perusahaanId=${newPerusahaanId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const cabangData = await response.json();
                cabangStore.cabangs = cabangData;
            }
        } catch (error) {
            console.error('Error loading cabang:', error);
        }
    }
});

const filteredCabangs = computed(() => {
    if (!form.value?.perusahaanId || !cabangs.value) return [];
    const filtered = (cabangs.value || []).filter(c => c.perusahaanId === form.value.perusahaanId);
    return filtered;
});

const isExternalPO = computed(() => {
    return form.value?.poType === 'external';
});

const filteredProducts = computed(() => {
    if (!allProducts.value || !Array.isArray(allProducts.value)) {
        return [];
    }
    
    // ✅ FIXED: Gunakan allProducts untuk menampilkan semua produk tanpa limitasi
    return allProducts.value.map(product => ({
        ...product,
        displayName: `${product.sku || ''} | ${product.name || ''}`
    }));
});

const getProductsByWarehouse = (warehouseId) => {
    // Selalu tampilkan SEMUA produk yang tersedia, terlepas dari warehouse yang dipilih
    const allProductsList = (allProducts.value || []).map(product => ({
        ...product,
        displayName: `${product.sku || ''} | ${product.name || ''}`
    }));
    
    return allProductsList;
};

const debouncedSearch = useDebounceFn(() => {
    if (globalFilterValue.value !== undefined) {
        purchaseOrderStore.setSearch(globalFilterValue.value)
    }
}, 500)
watch(globalFilterValue, (newValue) => {
    if (newValue !== undefined) {
        debouncedSearch();
    }
});

const onPage = (event) => {
    if (event) {
        // Ensure the event has valid values
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        };
        purchaseOrderStore.setPagination(validEvent);
    }
};
const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    purchaseOrderStore.fetchPurchaseOrders();
};

const handleSearch = (value) => {
    globalFilterValue.value = value;
    params.value.first = 0;
    purchaseOrderStore.fetchPurchaseOrders();
};

const onSort = (event) => {
    if (event) {
        purchaseOrderStore.setSort(event);
    }
};

const exportData = (format) => {
    if (format === 'excel') {
        const toast = useToast();
        
        // Cek apakah ada filter yang diterapkan
        const hasFilters = filters.value.vendorId || filters.value.poType || filters.value.status || filters.value.search;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export Excel...' 
                : 'Sedang mempersiapkan semua data untuk export Excel...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export Excel
        purchaseOrderStore.fetchAllPurchaseOrdersForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export Excel khusus untuk Purchase Order
                    return exportPurchaseOrderExcel(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `Excel berhasil dibuat dengan ${allData.length} data Purchase Order${hasFilters ? ' sesuai filter' : ''}`,
                                color: 'green',
                                position: 'topRight',
                                layout: 2
                            });
                        });
                } else {
                    toast.warning({
                        title: 'Warning',
                        message: 'Tidak ada data untuk diexport',
                        color: 'orange',
                        position: 'topRight',
                        layout: 2
                    });
                }
            })
            .catch((error) => {
                console.error('Error exporting Excel:', error);
                toast.error({
                    title: 'Error',
                    message: 'Gagal membuat Excel',
                    color: 'red',
                    position: 'topRight',
                    layout: 2
                });
            });
    } else if (format === 'pdf') {
        const toast = useToast();
        
        // Cek apakah ada filter yang diterapkan
        const hasFilters = filters.value.vendorId || filters.value.poType || filters.value.status || filters.value.search;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export PDF...' 
                : 'Sedang mempersiapkan semua data untuk export PDF...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export PDF
        purchaseOrderStore.fetchAllPurchaseOrdersForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export PDF khusus untuk Purchase Order
                    return exportPurchaseOrderPDF(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `PDF berhasil dibuat dengan ${allData.length} data Purchase Order${hasFilters ? ' sesuai filter' : ''}`,
                                color: 'green',
                                position: 'topRight',
                                layout: 2
                            });
                        });
                } else {
                    toast.warning({
                        title: 'Warning',
                        message: 'Tidak ada data untuk diexport',
                        color: 'orange',
                        position: 'topRight',
                        layout: 2
                    });
                }
            })
            .catch((error) => {
                console.error('Error exporting PDF:', error);
                toast.error({
                    title: 'Error',
                    message: 'Gagal membuat PDF',
                    color: 'red',
                    position: 'topRight',
                    layout: 2
                });
            });
    }
};

function onFileChange(e) {
  if (!form.value) return;
  
  const file = e.target.files[0];
  if (file) {
    if (!file.size || file.size === 0) {
      const toast = useToast()
      toast.error({
        title: 'Error',
        message: 'File attachment kosong atau tidak valid',
        color: 'red',
        position: 'topRight',
        layout: 2
      })
      return;
    }

    const fileType = file.type || '';
    const fileExtension = file.name?.split('.').pop()?.toLowerCase() || '';

    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    const allowedExtensions = ['pdf', 'xlsx', 'xls', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

    const isValidMimeType = allowedMimeTypes.includes(fileType);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidMimeType && !isValidExtension) {
      const toast = useToast()
      toast.error({
        title: 'Error',
        message: `File harus berupa PDF, Excel, atau gambar. Detected: MIME=${fileType}, Ext=${fileExtension}`,
        color: 'red',
        position: 'topRight',
        layout: 2
      })
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const toast = useToast()
      toast.error({
        title: 'Error',
        message: 'Ukuran file terlalu besar (maksimal 10MB)',
        color: 'red',
        position: 'topRight',
        layout: 2
      })
      return;
    }

    form.value.attachment = file;
    form.value.attachmentPreview = URL.createObjectURL(file);
  } else {
    form.value.attachment = null;
    form.value.attachmentPreview = null;
  }
}

const onProductChange = (index) => {
  if (!form.value || !form.value.purchaseOrderItems) return;
  
  const selectedProductId = form.value.purchaseOrderItems[index].productId;
  
  // ✅ FIXED: Gunakan allProducts untuk mencari produk yang dipilih
  const selectedProduct = (allProducts.value || []).find(p => p.id === selectedProductId);

  if (selectedProduct) {
    const item = form.value.purchaseOrderItems[index];
    item.price = Number(selectedProduct.priceBuy) || 0;
    calculateSubtotal(index);
  }
};

const onQuantityChange = (index) => {
  if (!form.value || !form.value.purchaseOrderItems) return;
  calculateSubtotal(index);
};

const calculateSubtotal = (index) => {
  if (!form.value || !form.value.purchaseOrderItems) return;
  
  const item = form.value.purchaseOrderItems[index];
  if (!item) return;
  
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;
  
  item.subtotal = quantity * price;
};

const onWarehouseChange = async (index) => {
    if (!form.value || !form.value.purchaseOrderItems) return;
    const item = form.value.purchaseOrderItems[index];
    
    // Warehouse dipilih hanya untuk informasi, tidak mempengaruhi daftar produk
    // Semua produk tetap tersedia untuk dipilih
    console.log(`Warehouse ${item.warehouseId} dipilih untuk item ${index}, tetapi semua produk tetap tersedia`);
    
    // Force re-render untuk memastikan UI terupdate
    await nextTick();
};

const viewPurchaseOrderDetails = (purchaseOrderId) => {
    if (!purchaseOrderId) return;
    router.push({ path: `/purchasing/purchase-order-detail`, query: { id: purchaseOrderId } });
};

const getStatusBadge = (status) => {
    if (!status) return { text: '-', class: 'badge rounded-pill bg-label-light' };
    
    switch (status) {
        case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' };
        case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-primary' };
        case 'received': return { text: 'Received', class: 'badge rounded-pill bg-label-success' };
        case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' };
        case 'partial': return { text: 'Partial', class: 'badge rounded-pill bg-label-warning' };
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' };
    }
};

const getPoTypeBadge = (poType) => {
    if (!poType) return { text: '-', class: 'badge rounded-pill bg-label-light' };
    
    switch (poType) {
        case 'internal': return { text: 'Internal', class: 'badge rounded-pill bg-label-info' };
        case 'external': return { text: 'External', class: 'badge rounded-pill bg-label-dark' };
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' };
    }
};

const handlePoTypeChange = (selectedType) => {
    if (!form.value) return;
    
    if (form.value.poType === selectedType) {
        return;
    }
    
    form.value.poType = selectedType;
    
    if (selectedType === 'internal') {
        // Reset external fields
        form.value.extNamaPerusahaan = '';
    } else if (selectedType === 'external') {
        // Reset internal fields
        form.value.perusahaanId = null;
        form.value.cabangId = null;
    }
};

// Fungsi export PDF khusus untuk Purchase Order
const exportPurchaseOrderPDF = async (dataToExport) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    // Definisikan kolom yang akan diexport
    const columnDefinitions = [
        { field: 'noPo', header: 'No. PO' },
        { field: 'vendor.name', header: 'Nama Vendor' },
        { field: 'poType', header: 'Tipe' },
        { field: 'status', header: 'Status' },
        { field: 'date', header: 'Tanggal' },
        { field: 'dueDate', header: 'Jatuh Tempo' },
        { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
        { field: 'cabang.nmCabang', header: 'Cabang' },
        { field: 'total', header: 'Total' }
    ];

    const head = [columnDefinitions.map(col => col.header)];

    if (!dataToExport || dataToExport.length === 0) {
        console.warn('Tidak ada data untuk diexport');
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan Purchase Orders', 14, 15);
        doc.setFontSize(12);
        doc.text('Tidak ada data yang tersedia untuk export', 14, 50);
        doc.save('purchase-orders-empty.pdf');
        return;
    }

    const body = dataToExport.map(row => columnDefinitions.map(col => {
        let value = '';
        
        if (col.field.includes('.')) {
            const fields = col.field.split('.');
            let currentValue = row;
            for (const field of fields) {
                currentValue = currentValue?.[field];
            }
            value = currentValue || '-';
        } else {
            value = row[col.field] || '-';
        }

        // Format khusus untuk field tertentu
        if (col.field === 'date' || col.field === 'dueDate') {
            if (value && value !== '-') {
                value = new Date(value).toLocaleDateString('id-ID');
            }
        } else if (col.field === 'total') {
            if (value && value !== '-') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    value = new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(numValue);
                }
            }
        } else if (col.field === 'poType') {
            if (value === 'internal') value = 'Internal';
            else if (value === 'external') value = 'External';
        } else if (col.field === 'status') {
            if (value === 'draft') value = 'Draft';
            else if (value === 'approved') value = 'Approved';
            else if (value === 'received') value = 'Received';
            else if (value === 'rejected') value = 'Rejected';
            else if (value === 'partial') value = 'Partial';
        }

        return String(value);
    }));

    // Definisikan lebar kolom
    const columnStyles = {
        0: { cellWidth: 30 }, // No. PO
        1: { cellWidth: 32 }, // Nama Vendor
        2: { cellWidth: 30 }, // Tipe PO
        3: { cellWidth: 30 }, // Status PO
        4: { cellWidth: 30 }, // Tanggal PO
        5: { cellWidth: 30 }, // Jatuh Tempo
        6: { cellWidth: 30 }, // Perusahaan
        7: { cellWidth: 30 }, // Cabang
        8: { cellWidth: 30 }  // Total
    };

    // Ambil info perusahaan dari user atau data yang tersedia
    const userData = userStore.user;
    let companyInfo = {
        name: 'PT. ANDARA PRIMA UTAMA',
        address: 'Jl. Kelapa Dua No.21 RT.008 RW.003 Kec. Cilincing Kel. Cilincing - Jakarta Utara',
        email: 'andaraprimautama@gmail.com',
        phone: '+62 812-7522-9704',
        logo: null
    };

    // Coba ambil dari user data jika tersedia
    if (userData?.perusahaan) {
        companyInfo.name = userData.perusahaan.nmPerusahaan || companyInfo.name;
        companyInfo.address = userData.perusahaan.alamatPerusahaan || companyInfo.address;
        companyInfo.email = userData.perusahaan.emailPerusahaan || companyInfo.email;
        companyInfo.phone = userData.perusahaan.tlpPerusahaan || companyInfo.phone;
    }

    // Hitung grand total
    let grandTotal = 0;
    dataToExport.forEach(row => {
        const totalValue = parseFloat(row.total) || 0;
        grandTotal += totalValue;
    });

    // Format grand total
    const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(grandTotal);

    // Buat PDF
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Gunakan font yang tersedia di jsPDF
    const fontFamily = 'helvetica';

    // Logo perusahaan (jika ada)
    if (companyInfo.logo) {
        try {
            doc.addImage(companyInfo.logo, 'PNG', pageWidth - 60, 10, 50, 20);
        } catch (e) {
            void e;
        }
    }

    // Info perusahaan di kanan atas
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    if (companyInfo.name) doc.text(String(companyInfo.name), pageWidth - 10, 15, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont(fontFamily, 'normal');
    if (companyInfo.address) doc.text(String(companyInfo.address), pageWidth - 10, 22, { align: 'right' });
    if (companyInfo.email) doc.text(`Email: ${String(companyInfo.email)}`, pageWidth - 10, 28, { align: 'right' });
    if (companyInfo.phone) doc.text(`Telp: ${String(companyInfo.phone)}`, pageWidth - 10, 34, { align: 'right' });

    // Judul di kiri atas
    doc.setFontSize(16);
    doc.setFont(fontFamily, 'bold');
    doc.text('Laporan Purchase Orders', 14, 15);

    // Timestamp dan jumlah data
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 25);
    doc.text(`Total Data: ${dataToExport.length}`, 14, 32);

    // Info filter
    const filterInfo = [];
    if (filters.value.vendorId) {
        const vendor = vendors.value?.find(v => v.id === filters.value.vendorId);
        if (vendor) {
            filterInfo.push(`Vendor: ${vendor.name}`);
        }
    }
    if (filters.value.poType) {
        const poTypeLabel = filters.value.poType === 'internal' ? 'Internal' : 'External';
        filterInfo.push(`Tipe PO: ${poTypeLabel}`);
    }
    if (filters.value.status) {
        const statusLabel = filters.value.status.charAt(0).toUpperCase() + filters.value.status.slice(1);
        filterInfo.push(`Status: ${statusLabel}`);
    }
    if (filters.value.search) {
        filterInfo.push(`Pencarian: ${filters.value.search}`);
    }

    // Tampilkan filter info
    if (filterInfo.length > 0) {
        doc.setFontSize(8);
        doc.setFont(fontFamily, 'italic');
        filterInfo.forEach((info, index) => {
            doc.text(info, 14, 40 + (index * 6));
        });
    }

    // Buat tabel
    autoTable(doc, {
        head: head,
        body: body,
        startY: filterInfo.length > 0 ? 50 + (filterInfo.length * 6) : 45,
        styles: {
            font: fontFamily,
            fontSize: 7,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left',
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
        tableWidth: 'auto',
        columnStyles: columnStyles,
        didDrawPage: function (data) {
            // Tambahkan nomor halaman
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setFont(fontFamily, 'normal');
            doc.text(`Halaman ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
        didParseCell: function (data) {
            // Highlight kolom total
            if (data.column.index === columnDefinitions.findIndex(col => col.field === 'total')) {
                if (data.section === 'head') {
                    data.cell.styles.textColor = [255, 255, 255];
                } else {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [200, 255, 200];
                }
            }
        },
    });

    // Grand total setelah tabel
    const finalY = doc.lastAutoTable.finalY || 200;

    // Garis pemisah
    doc.setDrawColor(200, 200, 200);
    doc.line(10, finalY + 5, doc.internal.pageSize.width - 10, finalY + 5);

    // Grand total
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    doc.text('Grand Total:', 10, finalY + 20);
    doc.text(String(formattedGrandTotal), doc.internal.pageSize.width - 10, finalY + 20, { align: 'right' });

    // Info ringkasan
    doc.setFontSize(8);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Total Purchase Orders: ${dataToExport.length}`, 10, finalY + 30);

    // Pastikan pembagian tidak menghasilkan NaN atau Infinity
    let rataRata = 0;
    if (dataToExport.length > 0) {
        rataRata = grandTotal / dataToExport.length;
    }
    doc.text(
        `Rata-rata per Order: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(rataRata)}`,
        10,
        finalY + 37
    );

    doc.save('purchase-orders.pdf');
};

// Fungsi export Excel khusus untuk Purchase Order
const exportPurchaseOrderExcel = (dataToExport) => {
    return Promise.all([
        import('xlsx')
    ]).then(([XLSX]) => {
        // Definisikan kolom yang akan diexport
        const columnDefinitions = [
            { field: 'noPo', header: 'No. PO' },
            { field: 'vendor.name', header: 'Nama Vendor' },
            { field: 'poType', header: 'Tipe PO' },
            { field: 'status', header: 'Status PO' },
            { field: 'date', header: 'Tanggal PO' },
            { field: 'dueDate', header: 'Jatuh Tempo' },
            { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
            { field: 'cabang.nmCabang', header: 'Cabang' },
            { field: 'total', header: 'Total' }
        ];

        if (!dataToExport || dataToExport.length === 0) {
            console.warn('Tidak ada data untuk diexport');
            return;
        }

        // Ambil info perusahaan dari user atau data yang tersedia
        const userData = userStore.user;
        let companyInfo = {
            name: 'PT. ANDARA PRIMA UTAMA',
            address: 'Jl. Kelapa Dua No.21 RT.008 RW.003 Kec. Cilincing Kel. Cilincing - Jakarta Utara',
            email: 'andaraprimautama@gmail.com',
            phone: '+62 812-7522-9704'
        };

        // Coba ambil dari user data jika tersedia
        if (userData?.perusahaan) {
            companyInfo.name = userData.perusahaan.nmPerusahaan || companyInfo.name;
            companyInfo.address = userData.perusahaan.alamatPerusahaan || companyInfo.address;
            companyInfo.email = userData.perusahaan.emailPerusahaan || companyInfo.email;
            companyInfo.phone = userData.perusahaan.tlpPerusahaan || companyInfo.phone;
        }

        // Hitung grand total
        let grandTotal = 0;
        dataToExport.forEach(row => {
            const totalValue = parseFloat(row.total) || 0;
            grandTotal += totalValue;
        });

        // Format grand total
        const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(grandTotal);

        // Buat data untuk Excel
        const excelData = [];

        // Header perusahaan
        excelData.push([companyInfo.name]);
        excelData.push([companyInfo.address]);
        excelData.push([`Email: ${companyInfo.email}`]);
        excelData.push([`Telp: ${companyInfo.phone}`]);
        excelData.push([]); // Baris kosong

        // Judul laporan
        excelData.push(['Laporan Purchase Orders']);
        excelData.push([`Dibuat pada: ${new Date().toLocaleString('id-ID')}`]);
        excelData.push([`Total Data: ${dataToExport.length}`]);

        // Info filter
        const filterInfo = [];
        if (filters.value.vendorId) {
            const vendor = vendors.value?.find(v => v.id === filters.value.vendorId);
            if (vendor) {
                filterInfo.push(`Vendor: ${vendor.name}`);
            }
        }
        if (filters.value.poType) {
            const poTypeLabel = filters.value.poType === 'internal' ? 'Internal' : 'External';
            filterInfo.push(`Tipe PO: ${poTypeLabel}`);
        }
        if (filters.value.status) {
            const statusLabel = filters.value.status.charAt(0).toUpperCase() + filters.value.status.slice(1);
            filterInfo.push(`Status: ${statusLabel}`);
        }
        if (filters.value.search) {
            filterInfo.push(`Pencarian: ${filters.value.search}`);
        }

        // Tampilkan filter info
        if (filterInfo.length > 0) {
            filterInfo.forEach((info) => {
                excelData.push([info]);
            });
        }

        excelData.push([]); // Baris kosong

        // Header tabel
        excelData.push(columnDefinitions.map(col => col.header));

        // Data tabel
        dataToExport.forEach(row => {
            const rowData = columnDefinitions.map(col => {
                let value = '';
                
                if (col.field.includes('.')) {
                    const fields = col.field.split('.');
                    let currentValue = row;
                    for (const field of fields) {
                        currentValue = currentValue?.[field];
                    }
                    value = currentValue || '-';
                } else {
                    value = row[col.field] || '-';
                }

                // Format khusus untuk field tertentu
                if (col.field === 'date' || col.field === 'dueDate') {
                    if (value && value !== '-') {
                        value = new Date(value).toLocaleDateString('id-ID');
                    }
                } else if (col.field === 'total') {
                    if (value && value !== '-') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            value = new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(numValue);
                        }
                    }
                } else if (col.field === 'poType') {
                    if (value === 'internal') value = 'Internal';
                    else if (value === 'external') value = 'External';
                } else if (col.field === 'status') {
                    if (value === 'draft') value = 'Draft';
                    else if (value === 'approved') value = 'Approved';
                    else if (value === 'received') value = 'Received';
                    else if (value === 'rejected') value = 'Rejected';
                    else if (value === 'partial') value = 'Partial';
                }

                return String(value);
            });
            excelData.push(rowData);
        });

        // Baris kosong
        excelData.push([]);

        // Summary
        excelData.push(['Grand Total:', formattedGrandTotal]);
        excelData.push(['Total Purchase Orders:', dataToExport.length]);

        // Pastikan pembagian tidak menghasilkan NaN atau Infinity
        let rataRata = 0;
        if (dataToExport.length > 0) {
            rataRata = grandTotal / dataToExport.length;
        }
        excelData.push([
            'Rata-rata per Order:', 
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(rataRata)
        ]);

        // Buat workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 20 }, // No. PO
            { wch: 25 }, // Nama Vendor
            { wch: 15 }, // Tipe PO
            { wch: 15 }, // Status PO
            { wch: 15 }, // Tanggal PO
            { wch: 15 }, // Jatuh Tempo
            { wch: 25 }, // Perusahaan
            { wch: 20 }, // Cabang
            { wch: 20 }  // Total
        ];
        ws['!cols'] = colWidths;

        // Style untuk header perusahaan
        const headerRow = 0;
        if (ws[`A${headerRow + 1}`]) {
            ws[`A${headerRow + 1}`].s = { font: { bold: true, size: 14 } };
        }

        // Style untuk judul laporan
        const titleRow = 5;
        if (ws[`A${titleRow + 1}`]) {
            ws[`A${titleRow + 1}`].s = { font: { bold: true, size: 12 } };
        }

        // Style untuk header tabel
        const tableHeaderRow = titleRow + 3 + filterInfo.length + 1;
        columnDefinitions.forEach((_, index) => {
            const cellRef = XLSX.utils.encode_cell({ r: tableHeaderRow, c: index });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "2980B9" } },
                    alignment: { horizontal: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };
            }
        });

        // Tambahkan border pada semua data tabel
        for (let row = tableHeaderRow + 1; row < tableHeaderRow + 1 + dataToExport.length; row++) {
            for (let col = 0; col < columnDefinitions.length; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (ws[cellRef]) {
                    if (!ws[cellRef].s) ws[cellRef].s = {};
                    ws[cellRef].s.border = {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    };
                }
            }
        }

        // Style untuk summary
        const summaryStartRow = tableHeaderRow + dataToExport.length + 2;
        if (ws[`A${summaryStartRow + 1}`]) {
            ws[`A${summaryStartRow + 1}`].s = { font: { bold: true } };
        }
        if (ws[`A${summaryStartRow + 2}`]) {
            ws[`A${summaryStartRow + 2}`].s = { font: { bold: true } };
        }
        if (ws[`A${summaryStartRow + 3}`]) {
            ws[`A${summaryStartRow + 3}`].s = { font: { bold: true } };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Purchase Orders');
        XLSX.writeFile(wb, 'purchase-orders.xlsx');
    });
};

// Row expansion methods
const onRowToggle = (event) => {
    expandedRows.value = event.data;
};

</script>

<style scoped>
    .v-select-style {
        height: 48px !important;
        border-radius: 7px;
    }
    
    .attachment-preview {
        transition: all 0.3s ease;
    }

    .attachment-preview:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    /* ✅ NEW: Styling untuk validasi */
    .is-invalid {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
    }

    /* ✅ NEW: Styling untuk v-select yang konsisten dengan customer */
    :deep(.v-select-style .vs__dropdown-toggle) {
        height: 48px !important;
        border-radius: 7px;
    }

    :deep(.v-select-style .vs__search) {
        padding: 8px 12px !important;
        font-size: 14px !important;
        border: none !important;
        outline: none !important;
        background: transparent !important;
        width: 100% !important;
        min-width: 0 !important;
    }

    :deep(.v-select-style .vs__dropdown-menu) {
        max-height: 300px !important;
        overflow-y: auto !important;
        border-radius: 7px !important;
    }

    :deep(.v-select-style .vs__dropdown-option--highlight) {
        background-color: #696cff !important;
        color: white !important;
    }

    :deep(.v-select-style .vs__dropdown-option) {
        padding: 12px 16px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        border-bottom: 1px solid #f0f0f0 !important;
        white-space: normal !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        min-height: auto !important;
        height: auto !important;
    }

    :deep(.v-select-style .vs__dropdown-option:last-child) {
        border-bottom: none !important;
    }

    :deep(.v-select-style .vs__dropdown-option:hover) {
        background-color: #f8f9fa !important;
        color: #333 !important;
    }

    :deep(.v-select-style .vs__dropdown-option--highlight:hover) {
        background-color: #696cff !important;
        color: white !important;
    }

    /* ✅ NEW: Memastikan highlight menutupi seluruh area option */
    :deep(.v-select-style .vs__dropdown-option--highlight) {
        background-color: #696cff !important;
        color: white !important;
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }

    /* ✅ NEW: Styling untuk content di dalam option agar highlight sempurna */
    :deep(.v-select-style .vs__dropdown-option .d-flex) {
        width: 100% !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: space-between !important;
    }

    :deep(.v-select-style .vs__dropdown-option .fw-bold) {
        word-break: break-word !important;
        hyphens: auto !important;
        line-height: 1.3 !important;
    }

    :deep(.v-select-style .vs__dropdown-option small) {
        word-break: break-word !important;
        hyphens: auto !important;
        line-height: 1.2 !important;
        margin-top: 2px !important;
    }

    /* ✅ NEW: Responsive styling untuk text truncation di tablet dan mobile */
    @media (max-width: 768px) {
        :deep(.v-select-style .vs__selected) {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
        }

        :deep(.v-select-style .vs__placeholder) {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
        }

        :deep(.v-select-style .vs__selected-options) {
            overflow: hidden !important;
        }
    }

    @media (max-width: 576px) {
        :deep(.v-select-style .vs__selected) {
            font-size: 14px !important;
            padding: 2px 4px !important;
        }

        :deep(.v-select-style .vs__placeholder) {
            font-size: 14px !important;
        }
    }

    .is-invalid .vs__dropdown-toggle {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
    }

    /* ✅ NEW: Styling untuk disabled state */
    .v-select-style:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .v-select-style:disabled .vs__dropdown-toggle {
        background-color: #e9ecef;
        cursor: not-allowed;
    }

    :deep(.v-select-style .vs__dropdown-toggle),
    :deep(.perusahaan .vs__dropdown-toggle),
    :deep(.warehouse-select .vs__dropdown-toggle),
    :deep(.status .vs__dropdown-toggle),
    :deep(.vendor .vs__dropdown-toggle),
    :deep(.product-select .vs__dropdown-toggle),
    :deep(.cabang .vs__dropdown-toggle) {
        height: 48px !important;
        border-radius: 7px;
    }

    /* ✅ NEW: Styling untuk search input yang lebih responsif */
    :deep(.v-select-style .vs__search) {
        padding: 8px 12px !important;
        font-size: 14px !important;
        border: none !important;
        outline: none !important;
        background: transparent !important;
        width: 100% !important;
        min-width: 0 !important;
    }

    /* ✅ NEW: Memastikan dropdown muncul dengan benar */
    :deep(.v-select-style .vs__dropdown-menu) {
        max-height: 300px !important;
        overflow-y: auto !important;
    }

    /* ✅ NEW: Styling untuk option yang dipilih */
    :deep(.v-select-style .vs__dropdown-option--highlight) {
        background-color: #696cff !important;
        color: white !important;
    }
</style>