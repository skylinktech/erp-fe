<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Sales Return</h4>
            <p class="mb-6">
            List Sales Return yang terdaftar di sistem
            </p>
            <!-- salesReturn cards -->
            <div class="row g-6 mb-6">
                <!-- Static cards for display, can be made dynamic later -->
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Total Orders</h5>
                                <span class="badge bg-label-primary rounded-pill">Yearly</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">15</h1>
                                <i class="ri-arrow-up-s-line ri-24px text-success"></i>
                                <span class="fw-medium text-success">15.8%</span>
                            </div>
                            <p class="mb-0 mt-2">Analytics for last year</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Pending Orders</h5>
                                <span class="badge bg-label-warning rounded-pill">Weekly</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">5</h1>
                                <i class="ri-arrow-down-s-line ri-24px text-danger"></i>
                                <span class="fw-medium text-danger">8.2%</span>
                            </div>
                            <p class="mb-0 mt-2">Analytics for last week</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card h-100">
                        <div class="row h-100">
                            <div class="col-sm-5">
                                <div class="d-flex align-items-end h-100 justify-content-center">
                                    <img src="/img/illustrations/add-new-role-illustration.png" class="img-fluid" alt="Image" width="70">
                                </div>
                            </div>
                            <div class="col-sm-7">
                                <div class="card-body text-sm-end text-center ps-sm-0">
                                    <button v-if="userHasRole('superadmin') || userHasPermission('create_sales_return')" @click="salesReturnStore.openModal(null)" class="btn btn-primary mb-2 text-wrap add-new-role">
                                        Tambah Sales Return
                                    </button>
                                    <p class="mb-0 mt-1">Buat Sales Return baru</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total & Filter Sales Return</h4>
                    <p class="mb-0">Temukan semua akun administrator perusahaan Anda dan Sales Return terkait.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <CustomSelect2 v-model="filters.customerId" :options="customers" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                                </div>
                                <div class="col-md-4">
                                    <CustomSelect2 v-model="filters.perusahaanId" :options="perusahaans" :get-option-label="option => option.nmPerusahaan" :reduce="option => option.id" searchable clearable placeholder="Pilih Perusahaan" />
                                </div>
                                <div class="col-md-4">
                                    <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="option => option.label" :reduce="option => option.id" searchable clearable placeholder="Pilih Status" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <!-- salesReturn Table -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="btn-group me-2">
                                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="ri-upload-2-line me-1"></i> Export
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('csv')">CSV</a></li>
                                        <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('pdf')">PDF</a></li>
                                    </ul>
                                </div>
                                <div class="input-group">
                                    <span class="p-input-icon-left">
                                        <InputText
                                            v-model="globalFilterValue"
                                            placeholder="Cari Sales Return..."
                                            class="w-full md:w-20rem"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="salesReturns" 
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
                                    <Column field="noSr" header="No. SR" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.noSr || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="salesOrder.noSo" header="No. SO" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <span v-if="slotProps.data.salesOrder?.noSo && slotProps.data.salesOrder?.id">
                                                <a
                                                    :href="`/sales/sales-order-detail?id=${slotProps.data.salesOrder.id}`"
                                                    style="text-decoration: underline; color: #007bff;"
                                                >
                                                    {{ slotProps.data.salesOrder.noSo }}
                                                </a>
                                            </span>
                                            <span v-else>
                                                -
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="customer.name" header="Nama Customer" :sortable="true"></Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span >
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
                                    <Column field="salesOrder.up" header="Untuk Perhatian" :sortable="true"></Column>
                                    <Column field="returnDate" header="Tanggal" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.returnDate ? new Date(slotProps.data.returnDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true"></Column>
                                    <Column field="cabang.nmCabang" header="Cabang" :sortable="true"></Column>
                                    <Column field="attachment" header="Nama File" :sortable="true">
                                        <template #body="slotProps">
                                            <div v-if="slotProps.data.attachment">
                                                <a :href="getAttachmentUrl(slotProps.data.attachment)" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #007bff;">
                                                    {{ slotProps.data.attachment.split('/').pop() }}
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
                                                    <li v-if="userHasPermission('approve_sales_return') && slotProps.data.status == 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="salesReturnStore.approveSalesReturn(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('reject_sales_return') && slotProps.data.status == 'draft')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="salesReturnStore.rejectSalesReturn(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('edit_sales_return') && slotProps.data.status == 'draft')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="salesReturnStore.openModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('delete_sales_return')">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="salesReturnStore.deleteSalesReturn(slotProps.data.id)">
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
                    <!--/ salesReturn Table -->
                </div>
            </div>
            <!--/ salesReturn cards -->

            <Modal 
                id="SalesReturnModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="salesReturnStore.saveSalesReturn()">
                         <div class="row">
                            <div class="col">
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                            <span class="ri-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">Informasi Sales Return</span>
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
                        <div class="tab-content pt-6">
                            <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                <div class="row g-4">
                                    <div class="col-md-12">
                                        <div class="form-floating form-floating-outline">
                                            <input type="hidden" v-model="form.noSr" class="form-control" placeholder="No SR" >
                                        </div>
                                    </div>
                                     <div class="col-md-6">
                                        <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.salesOrderId" :options="salesOrders" :get-option-label="option => option.noSo" :reduce="option => option.id" searchable clearable placeholder="Pilih Sales Order"  :disabled="!form.customerId"/>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.up" class="form-control" placeholder="Untuk Perhatian" readonly>
                                            <label>Untuk Perhatian</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.returnDate" class="form-control" >
                                            <label>Tanggal Pengembalian</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans" :get-option-label="option => option.nmPerusahaan" :reduce="option => option.id" searchable clearable placeholder="Pilih Perusahaan"  readonly/>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="option => option.nmCabang" :reduce="option => option.id" searchable clearable placeholder="Pilih Cabang"  readonly/>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="file" @change="onFileChange" class="form-control">
                                            <label>Attachment</label>
                                            <a v-if="attachmentPreview" :href="attachmentPreview" target="_blank" class="d-block mt-1">Lihat Attachment</a>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(form.totalReturnAmount)" class="form-control" placeholder="Total">
                                            <label>Total Pengembalian</label>
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
                                <div v-for="(item, index) in form.salesReturnItems" :key="index" class="repeater-item mb-4">
                                    <div class="row g-3">
                                        <div class="col-6">
                                            <CustomSelect2 v-model="item.warehouseId" :options="warehouses"
                                            :get-option-label="option => option.label" searchable clearable :reduce="w => w.id" placeholder="Pilih Gudang"  readonly/>
                                        </div>
                                        <div class="col-md-6">
                                            <CustomSelect2 v-model="item.productId" :options="allAvailableProducts" :get-option-label="option => option.label" searchable clearable :reduce="p => p.id" placeholder="Pilih Produk" @update:modelValue="onProductChange(index)"  readonly/>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="number" v-model.number="item.quantity" class="form-control" placeholder="Qty" readonly>
                                                <label>Jumlah</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                                                <label>Harga</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="item.reason" class="form-control" placeholder="Alasan">
                                                <label>Alasan</label>
                                            </div>
                                        </div>
                                        <div class="col-md-9">
                                             <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item" readonly>
                                                <label>Deskripsi</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3 d-flex align-items-center">
                                            <button @click.prevent="salesReturnStore.removeItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                                        </div>
                                    </div>
                                    <hr class="my-4">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                             <button type="button" class="btn btn-outline-secondary" @click="salesReturnStore.closeModal()">Tutup</button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesReturnStore } from '~/stores/sales-return'
import { useCustomerStore } from '~/stores/customer'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'

import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import 'vue-select/dist/vue-select.css'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const config = useRuntimeConfig();
const router = useRouter();

// Store
const myDataTableRef        = ref(null)
const salesReturnStore       = useSalesReturnStore()
const customerStore         = useCustomerStore()
const perusahaanStore       = usePerusahaanStore()
const warehouseStore        = useWarehouseStore()
const cabangStore           = useCabangStore()
const productStore          = useProductStore()

const userStore             = useUserStore()
const formatRupiah          = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions();
const permissionStore       = usePermissionsStore()

const { salesReturns, salesOrders, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, allAvailableProducts } = storeToRefs(salesReturnStore)
const { customers }   = storeToRefs(customerStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs }     = storeToRefs(cabangStore)
const { warehouses }  = storeToRefs(warehouseStore)
const { products }    = storeToRefs(productStore)
const { user }        = storeToRefs(userStore)
const { permissions } = storeToRefs(permissionStore)

// State
const filters = ref({
  customerId: null,
  perusahaanId: null,
  status: null,
  search: '',
});
const globalFilterValue = ref('');
const attachmentPreview = ref(null);

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Sales Return' : 'Tambah Sales Return');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Sales Return di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Sales Return baru.');

const getAttachmentUrl = (attachmentPath) => {
    if (!attachmentPath || typeof attachmentPath !== 'string') return null;
    if (attachmentPath.startsWith('http')) return attachmentPath;
    const baseUrl = (config.public.apiBase || '').replace('/api', '');
    return `${baseUrl}/${attachmentPath}`;
};

const statusOptions = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
]);

let modalInstance = null;
onMounted(() => {
    salesReturnStore.fetchSalesReturns();
    customerStore.fetchCustomers();
    perusahaanStore.fetchPerusahaans();
    cabangStore.fetchCabangs();
    productStore.fetchProducts();
    warehouseStore.fetchWarehouses();
    permissionStore.fetchPermissions();
    userStore.loadUser();

    const modalElement = document.getElementById('SalesReturnModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Sales Return', salesReturns.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
        if (isEditMode.value) {
            if (form.value.attachment_url) {
                attachmentPreview.value = form.value.attachment_url
            } else if (form.value.attachment) {
                attachmentPreview.value = getAttachmentUrl(form.value.attachment)
            } else {
                attachmentPreview.value = null
            }

        } else {
            attachmentPreview.value = null
        }
    } else {
        modalInstance?.hide()
    }
})

watch(() => form.value.perusahaanId, (newPerusahaanId, oldPerusahaanId) => {
    if (oldPerusahaanId && newPerusahaanId !== oldPerusahaanId && !isEditMode.value) {
        form.value.cabangId = null;
    }
});

watch(() => form.value.customerId, (newCustomerId, oldCustomerId) => {
  if (newCustomerId && newCustomerId !== oldCustomerId) {
    salesReturnStore.fetchSalesOrdersByCustomer(newCustomerId);
    form.value.salesOrderId = null;
    form.value.salesReturnItems = [];
    salesReturnStore.addItem();
  } else if (!newCustomerId) {
    salesReturnStore.salesOrders = [];
    form.value.salesOrderId = null;
    form.value.salesReturnItems = [];
    salesReturnStore.addItem();
  }
});

watch(() => form.value.salesOrderId, (newSalesOrderId) => {
    if (newSalesOrderId) {
        salesReturnStore.populateFormFromSalesOrder(newSalesOrderId);
    }
});

watch(() => salesReturnStore.allAvailableProducts, (newProducts) => {
  if (form.value.salesReturnItems && newProducts) {
    form.value.salesReturnItems.forEach(item => {
      const productExists = newProducts.some(p => p.id === item.productId);
      if (!productExists) {
        item.productId = null;
        item.price = 0;
        item.quantity = 1;
        item.subtotal = 0;
      }
    });
  }
}, { deep: true });

const filteredCabangs = computed(() => {
    if (!form.value.perusahaanId || !cabangs.value) return [];
    return cabangs.value.filter(c => c.perusahaanId === form.value.perusahaanId);
});

watch(globalFilterValue, useDebounceFn((newValue) => {
    filters.value.search = newValue;
}, 500));

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters;
    salesReturnStore.setFilters(restFilters);
}, { deep: true });

const onPage = (event) => {
    if (event) {
        salesReturnStore.setPagination(event);
    }
};

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    salesReturnStore.fetchSalesReturns();
};

const onSort = (event) => {
    if (event) {
        salesReturnStore.setSort(event);
    }
};

const exportData = (format) => {
    if (format === 'excel') {
        const toast = useToast();
        
        // Cek apakah ada filter yang diterapkan
        const hasFilters = filters.value.customerId || filters.value.status || filters.value.search;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export Excel...' 
                : 'Sedang mempersiapkan semua data untuk export Excel...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export Excel
        salesReturnStore.fetchAllSalesReturnsForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export Excel khusus untuk Sales Return
                    return exportSalesReturnExcel(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `Excel berhasil dibuat dengan ${allData.length} data Sales Return${hasFilters ? ' sesuai filter' : ''}`,
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
        const hasFilters = filters.value.customerId || filters.value.status || filters.value.search;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export PDF...' 
                : 'Sedang mempersiapkan semua data untuk export PDF...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export PDF
        salesReturnStore.fetchAllSalesReturnsForExport()
        .then((allData) => {
            if (allData && allData.length > 0) {
                // Gunakan fungsi export PDF khusus untuk Sales Return
                return exportSalesReturnPDF(allData)
                    .then(() => {
                        toast.success({
                            title: 'Success',
                            message: `PDF berhasil dibuat dengan ${allData.length} data Sales Return${hasFilters ? ' sesuai filter' : ''}`,
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
  const file = e.target.files[0];
  if (file) {
    form.value.attachment = file;
    attachmentPreview.value = URL.createObjectURL(file);
  } else {
    form.value.attachment = null;
    attachmentPreview.value = null;
  }
}

const onProductChange = (index) => {
  const selectedProductId = form.value.salesReturnItems[index].productId;
  const selectedProduct = allAvailableProducts.value.find(p => p.id === selectedProductId);

  if (selectedProduct) {
    const item = form.value.salesReturnItems[index];
    item.price = Number(selectedProduct.priceSell) || 0;
  }
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' };
        case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-primary' };
        case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' };
        case 'returned': return { text: 'Returned', class: 'badge rounded-pill bg-label-info' };
    }
};

const getPaymentMethodBadge = (paymentMethod) => {
    switch (paymentMethod) {
        case 'cash': return { text: 'Cash', class: 'badge rounded-pill bg-label-success' };
        case 'transfer': return { text: 'Transfer', class: 'badge rounded-pill bg-label-primary' };
        case 'qris': return { text: 'QRIS', class: 'badge rounded-pill bg-label-danger' };
        case 'card': return { text: 'Card', class: 'badge rounded-pill bg-label-secondary' };
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' };
    }
};

// Fungsi export PDF khusus untuk Sales Return
const exportSalesReturnPDF = async (dataToExport) => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]);

    // Definisikan kolom yang akan diexport
    const columnDefinitions = [
        { field: 'noSr', header: 'No. SR' },
        { field: 'salesOrder.noSo', header: 'No. SO' },
        { field: 'customer.name', header: 'Nama Customer' },
        { field: 'status', header: 'Status' },
        { field: 'returnDate', header: 'Tanggal' },
        { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
        { field: 'cabang.nmCabang', header: 'Cabang' },
        { field: 'totalReturnAmount', header: 'Total' }
    ];

    const head = [columnDefinitions.map(col => col.header)];

    if (!dataToExport || dataToExport.length === 0) {
        console.warn('Tidak ada data untuk diexport');
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan Sales Returns', 14, 15);
        doc.setFontSize(12);
        doc.text('Tidak ada data yang tersedia untuk export', 14, 50);
        doc.save('sales-returns-empty.pdf');
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
        if (col.field === 'returnDate') {
            if (value && value !== '-') {
                value = new Date(value).toLocaleDateString('id-ID');
            }
        } else if (col.field === 'totalReturnAmount') {
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
        } else if (col.field === 'status') {
            if (value === 'draft') value = 'Draft';
            else if (value === 'approved') value = 'Approved';
            else if (value === 'rejected') value = 'Rejected';
            else if (value === 'returned') value = 'Returned';
        }

        return String(value);
    }));

    // Definisikan lebar kolom
    const columnStyles = {
        0: { cellWidth: 34 }, // No. SR
        1: { cellWidth: 34 }, // No. SO
        2: { cellWidth: 37 }, // Nama Customer
        3: { cellWidth: 34 }, // Status
        4: { cellWidth: 34 }, // Tanggal
        5: { cellWidth: 34 }, // Perusahaan
        6: { cellWidth: 34 }, // Cabang
        7: { cellWidth: 34 }  // Total
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
        const totalValue = parseFloat(row.totalReturnAmount) || 0;
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
    doc.text('Laporan Sales Returns', 14, 15);

    // Timestamp dan jumlah data
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 25);
    doc.text(`Total Data: ${dataToExport.length}`, 14, 32);

    // Info filter
    const filterInfo = [];
    if (filters.value.customerId) {
        const customer = customers.value?.find(c => c.id === filters.value.customerId);
        if (customer) {
            filterInfo.push(`Customer: ${customer.name}`);
        }
    }
    if (filters.value.perusahaanId) {
        const perusahaan = perusahaans.value?.find(p => p.id === filters.value.perusahaanId);
        if (perusahaan) {
            filterInfo.push(`Perusahaan: ${perusahaan.nmPerusahaan}`);
        }
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
            if (data.column.index === columnDefinitions.findIndex(col => col.field === 'totalReturnAmount')) {
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
    doc.text(`Total Sales Returns: ${dataToExport.length}`, 10, finalY + 30);

    // Pastikan pembagian tidak menghasilkan NaN atau Infinity
    let rataRata = 0;
    if (dataToExport.length > 0) {
        rataRata = grandTotal / dataToExport.length;
    }
    doc.text(
        `Rata-rata per Return: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(rataRata)}`,
        10,
        finalY + 37
    );

    doc.save('sales-returns.pdf');
};

// Fungsi export Excel khusus untuk Sales Return
const exportSalesReturnExcel = (dataToExport) => {
    return Promise.all([
        import('xlsx')
    ]).then(([XLSX]) => {
        // Definisikan kolom yang akan diexport
        const columnDefinitions = [
            { field: 'noSr', header: 'No. SR' },
            { field: 'noSo', header: 'No. SO' },
            { field: 'customer.name', header: 'Nama Customer' },
            { field: 'status', header: 'Status' },
            { field: 'returnDate', header: 'Tanggal Return' },
            { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
            { field: 'cabang.nmCabang', header: 'Cabang' },
            { field: 'totalReturnAmount', header: 'Total' }
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
            const totalValue = parseFloat(row.totalReturnAmount) || 0;
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
        excelData.push(['Laporan Sales Returns']);
        excelData.push([`Dibuat pada: ${new Date().toLocaleString('id-ID')}`]);
        excelData.push([`Total Data: ${dataToExport.length}`]);

        // Info filter
        const filterInfo = [];
        if (filters.value.customerId) {
            const customer = customers.value?.find(c => c.id === filters.value.customerId);
            if (customer) {
                filterInfo.push(`Customer: ${customer.name}`);
            }
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
                if (col.field === 'returnDate') {
                    if (value && value !== '-') {
                        value = new Date(value).toLocaleDateString('id-ID');
                    }
                } else if (col.field === 'totalReturnAmount') {
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
                } else if (col.field === 'status') {
                    if (value === 'draft') value = 'Draft';
                    else if (value === 'approved') value = 'Approved';
                    else if (value === 'rejected') value = 'Rejected';
                    else if (value === 'returned') value = 'Returned';
                }

                return String(value);
            });
            excelData.push(rowData);
        });

        // Baris kosong
        excelData.push([]);

        // Summary
        excelData.push(['Grand Total:', formattedGrandTotal]);
        excelData.push(['Total Sales Returns:', dataToExport.length]);

        // Pastikan pembagian tidak menghasilkan NaN atau Infinity
        let rataRata = 0;
        if (dataToExport.length > 0) {
            rataRata = grandTotal / dataToExport.length;
        }
        excelData.push([
            'Rata-rata per Return:', 
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
            { wch: 20 }, // No. SR
            { wch: 20 }, // No. SO
            { wch: 25 }, // Nama Customer
            { wch: 15 }, // Status
            { wch: 20 }, // Tanggal Return
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

        XLSX.utils.book_append_sheet(wb, ws, 'Sales Returns');
        XLSX.writeFile(wb, 'sales-returns.xlsx');
    });
};

</script>

<style scoped>
<style scoped>

/* Responsive adjustments */
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
