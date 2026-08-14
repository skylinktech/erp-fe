<template>
<div class="page-wrapper">
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">
            List stock transfer yang terdaftar di sistem
            </p>
                        <div class="row g-6 mb-6">
                <div v-if="stats.total !== undefined" class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary"><i class="ri-exchange-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.total }}</h5>
                                <span class="text-muted">Stock transfer</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.draft !== undefined" class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Draft</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.draft }}</h5>
                                <span class="text-muted">Draft</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.approved !== undefined" class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Approved</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.approved }}</h5>
                                <span class="text-muted">Approved</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.rejected !== undefined" class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Rejected</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-danger"><i class="ri-close-circle-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.rejected }}</h5>
                                <span class="text-muted">Rejected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Data Stock Transfer</h4>
                    <p class="mb-0">Kelola perpindahan stok antar gudang.</p>
                </div>
                <div class="col-12">
                                        <div class="card">
                        <ListPageTableHeader
                            :rows="Number(tableControls.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari Stock Transfer..."
                            :export-disabled="loading"
                            :export-items="[
                                { value: 'excel', label: 'Excel' },
                                { value: 'pdf', label: 'PDF' },
                            ]"
                            @update:rows="onStockTransferToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                            @export="exportData"
                        >
                            <template #add>
                                <button
                                    v-if="userHasRole('superadmin') || userHasPermission('create_stock_transfer')"
                                    type="button"
                                    class="btn btn-primary"
                                    @click="stockTransferStore.openModal()"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Stock Transfer
                                </button>
                            </template>
                        </ListPageTableHeader>
<div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="stockTransfers" 
                            :rows="Number(params.rows)" 
                            :loading="loading"
                            :totalRecords="totalRecords"
                            :first="params.first"
                            :lazy="true"
                            @page="stockTransferStore.setPagination"
                            responsiveLayout="scroll" 
                            paginatorPosition="bottom"
                            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                                <Column header="#" :sortable="false">
                                    <template #body="slotProps">
                                        {{
                                            Number.isFinite(params.page) && Number.isFinite(params.rows)
                                            ? ((params.page - 1) * params.rows + slotProps.index + 1)
                                            : (slotProps.index + 1)
                                        }}
                                    </template>
                                </Column>
                                <Column field="noTransfer" header="No. Stock Transfer" :sortable="true">
                                    <template #body="slotProps">
                                        <span class="badge bg-primary">
                                            {{ slotProps.data.noTransfer }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="status" header="Status" :sortable="true">
                                    <template #body="slotProps">
                                        <span :class="getStatusBadge(slotProps.data.status).class">
                                            {{ getStatusBadge(slotProps.data.status).text }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="date" header="Tanggal" :sortable="true" style="width:10%">
                                    <template #body="slotProps">
                                        {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString() : '-' }}
                                    </template>
                                </Column>
                                <Column field="perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        {{ slotProps.data.perusahaan?.nmPerusahaan || '-' }}
                                    </template>
                                </Column>
                                <Column field="cabang.nmCabang" header="Cabang" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        {{ slotProps.data.cabang?.nmCabang || '-' }}
                                    </template>
                                </Column>
                                <Column field="fromWarehouse.name" header="Gudang Asal" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        {{ slotProps.data.fromWarehouse?.name || '-' }}
                                    </template>
                                </Column>
                                <Column field="toWarehouse.name" header="Gudang Tujuan" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        {{ slotProps.data.toWarehouse?.name || '-' }}
                                    </template>
                                </Column>
                                <Column field="transferByUser.fullName" header="Dibuat Oleh" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.transferByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li v-if="userHasRole('superadmin') || (userHasPermission('approve_stock_transfer') && slotProps.data.status == 'draft')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="approveStockTransfer(slotProps.data.id)">
                                                        <i class="ri-check-line me-2"></i> Approve
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || (userHasPermission('view_stock_transfer') && slotProps.data.status == 'approved')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="viewStockTransferDetails(slotProps.data.id)">
                                                        <i class="ri-eye-line me-2"></i> Lihat Detail
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || (userHasPermission('edit_stock_transfer') && slotProps.data.status == 'draft')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="stockTransferStore.openModal(slotProps.data)">
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || (userHasPermission('delete_stock_transfer') && slotProps.data.status == 'draft')">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="deleteStockTransfer(slotProps.data.id)">
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
                    <!--/ Stock Transfer Table -->
                </div>
            </div>
            <!--/ Stock Transfer cards -->

            <!-- Placeholder untuk Stock TransferModal component -->
            <Modal
                :model-value="showModal"
                @close="stockTransferStore.closeModal" 
                id="Modal"
                :isEditMode="isEditMode"
                :validationErrorsFromParent="validationErrors"
                :title="modalTitle" 
                :description="modalDescription"
                :selectedStockTransfer="selectedStockTransfer"
            >
                <template #default>
                    <form @submit.prevent="handleSaveStockTransfer">
                        <div class="row g-6">
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="hidden" 
                                        class="form-control" 
                                        id="name" 
                                        v-model="form.noTransfer" 
                                        placeholder="Masukkan No. Stock Transfer"
                                    >
                                </div>
                            </div>
                            <div class="col-md-6">
                                <FormLabel required>Perusahaan</FormLabel>
                                <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans"
                                    :get-option-label="option => option.nmPerusahaan"
                                    :reduce="option => option.id" searchable clearable
                                    placeholder="-- Pilih Perusahaan --"
                                    class="perusahaan-select"
                                />
                            </div>
                            <div class="col-md-6">
                                <FormLabel required>Cabang</FormLabel>
                                <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs"
                                    :get-option-label="option => option.nmCabang"
                                    :reduce="option => option.id" searchable clearable 
                                    placeholder="-- Pilih Cabang --"
                                    class="cabang-select"
                                />
                            </div>
                            <div class="col-md-6">
                                <FormLabel required>Gudang Asal</FormLabel>
                                <CustomSelect2 v-model="form.fromWarehouseId" :options="warehouses"
                                    :get-option-label="option => option.name"
                                    :reduce="option => option.id" searchable clearable 
                                    placeholder="-- Pilih Gudang Asal --"
                                    class="warehouse-select"
                                />
                            </div>
                            <div class="col-md-6">
                                <FormLabel required>Gudang Tujuan</FormLabel>
                                <CustomSelect2 v-model="form.toWarehouseId" :options="warehouses"
                                    :get-option-label="option => option.name"
                                    :reduce="option => option.id" searchable clearable 
                                    placeholder="-- Pilih Gudang Tujuan --"
                                    class="warehouse-select"
                                />
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="date" 
                                        class="form-control" 
                                        id="date" 
                                        v-model="form.date" 
                                        placeholder="Masukkan tanggal"
                                        
                                    >
                                    <label for="name">Tanggal <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="penerima" 
                                        v-model="form.penerima" 
                                        placeholder="Masukkan Nama Penerima"
                                    >
                                    <label for="penerima">Nama Penerima <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="description" 
                                        v-model="form.description" 
                                        placeholder="Masukkan deskripsi"
                                        
                                    >
                                    <label for="description">Deskripsi</label>
                                </div>
                            </div>
                            <div class="col-md-6 d-flex align-items-center">
                                <div class="form-check form-switch mt-3">
                                    <input class="form-check-input" type="checkbox" id="stTtdDigitalCheckbox" v-model="form.ttdDigital">
                                    <label class="form-check-label" for="stTtdDigitalCheckbox">TTD Digital</label>
                                </div>
                            </div>
                            <hr class="mt-7 w-70 justify-content-center" />
                            <div v-for="(item, index) in form.stockTransferItems" :key="index" class="repeater-item">
                                <div class="row">
                                    <div class="mb-4 col-lg-4 col-xl-4 col-12 mb-0">
                                        <FormLabel required>Produk</FormLabel>
                                        <CustomSelect2 v-model="item.stock" :options="productsInWarehouse"
                                            :get-option-label="option => {
                                                if (!option) return '';
                                                const sku = option.product?.sku || '';
                                                const name = option.product?.name || '';
                                                return `${sku} | ${name}`;
                                            }" 
                                            searchable clearable
                                            placeholder="-- Pilih Produk --"
                                            class="stock-transfer-item-select"
                                            :filter-by="(option, label, search) => {
                                                if (!option || !option.product) return false;
                                                const product = option.product;
                                                const searchLower = search.toLowerCase();
                                                return (product?.name && product.name.toLowerCase().includes(searchLower)) || 
                                                       (product?.sku && product.sku.toLowerCase().includes(searchLower));
                                            }"
                                        />
                                    </div>
                                    <div class="mb-4 col-lg-2 col-xl-2 col-2 mb-0">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="item.stock ? Math.floor(item.stock.quantity) : ''" class="form-control" placeholder="Stock" readonly>
                                            <label>Stock</label>
                                        </div>
                                    </div>
                                    <div class="mb-3 col-lg-4 col-xl-3 col-12 mb-0">
                                        <div class="form-floating form-floating-outline">
                                            <input
                                                type="text"
                                                class="form-control"
                                                placeholder="Jumlah"
                                                :value="item.quantity"
                                                @input="e => {
                                                    const angka = e.target.value.replace(/[^0-9]/g, '');
                                                    item.quantity = angka;
                                                }"
                                            />
                                            <label>Jumlah <span class="text-danger" aria-hidden="true">*</span></label>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-xl-3 col-12 mt-1">
                                        <button @click.prevent="stockTransferStore.removeItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-0 mb-6">
                                <button class="btn btn-sm btn-primary w-100" @click.prevent="stockTransferStore.addItem()">
                                    <i class="ri-add-line me-1"></i>
                                    <span class="align-middle">Tambah Item</span>
                                </button>
                            </div> 
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn btn-outline-secondary me-2" @click="stockTransferStore.closeModal()">
                                    Tutup
                                </button>
                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                >
                                    {{ isEditMode ? 'Update' : 'Simpan' }}
                                </button>
                            </div>
                        </div>
                    </form>
                </template>
            </Modal>
        </div>
        <div class="content-backdrop fade"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user'
import { useStockTransferStore } from '~/stores/stock-transfer'
import { useWarehouseStore } from '~/stores/warehouse'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Swal from 'sweetalert2'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import 'vue-select/dist/vue-select.css'
import { useRouter } from 'vue-router'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const { $api } = useNuxtApp()

const myDataTableRef        = ref(null)
const userStore             = useUserStore()
const stockTransferStore    = useStockTransferStore()
const warehouseStore        = useWarehouseStore()
const permissionStore       = usePermissionsStore()
const perusahaanStore       = usePerusahaanStore()
const cabangStore           = useCabangStore()
const { userHasPermission, userHasRole } = usePermissions();
const { stockTransfers, totalRecords, stats, params, form, isEditMode, showModal, validationErrors, productsInWarehouse, isLoadingEditData } = storeToRefs(stockTransferStore)
const { warehouseList: warehouses } = storeToRefs(warehouseStore)
const { perusahaans }       = storeToRefs(perusahaanStore)
const { cabangs }           = storeToRefs(cabangStore)
const selectedStockTransfer = ref(null);
const loading               = ref(false);
const globalFilterValue     = ref('');
const router                = useRouter()

const status       = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Approved', value: 'approved' },
]);

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

const tableControls = ref({
    rows: 10,
    search: '',
});

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    stockTransferStore.handleRowsChange();
};

const onStockTransferToolbarRows = (value) => {
    tableControls.value.rows = Number(value) || 10;
    handleRowsChange(value);
};

const modalTitle = computed(() => isEditMode.value ? 'Edit Stock Transfer' : 'Tambah Stock Transfer');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Stock Transfer di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan Stock Transfer baru.');

let searchDebounceTimer = null;
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(globalFilterValue, (newValue) => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
        stockTransferStore.setSearch(newValue);
    }, 500);
});

onBeforeUnmount(() => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
});

watch(() => form.value.perusahaanId, (newPerusahaanId) => {
    if (newPerusahaanId) {
        if(!isEditMode.value) {
            form.value.cabangId = null;
        }
    }
});

const filteredCabangs = computed(() => {
    if (!form.value.perusahaanId || !cabangs.value) return [];
    return cabangs.value.filter(c => c.perusahaanId === form.value.perusahaanId);
});

watch(() => form.value.fromWarehouseId, (newWarehouseId, oldWarehouseId) => {
    // Skip watcher jika sedang loading edit data (untuk prevent double fetch)
    if (isLoadingEditData.value) {
        return;
    }
    
    if (newWarehouseId) {
        // Jika warehouse berubah dari yang lama (user ganti warehouse)
        // oldWarehouseId harus bukan null dan bukan undefined, dan harus beda dengan yang baru
        if (oldWarehouseId != null && newWarehouseId !== oldWarehouseId) {
            stockTransferStore.fetchProductsByWarehouse(newWarehouseId);
            form.value.stockTransferItems = [];
            stockTransferStore.addItem();
        } 
        // Jika warehouse baru dipilih pertama kali (create mode saja)
        // oldWarehouseId adalah null atau undefined
        else if (oldWarehouseId == null && !isEditMode.value) {
            stockTransferStore.fetchProductsByWarehouse(newWarehouseId);
        }
    } else {
        stockTransferStore.productsInWarehouse = [];
        if (form.value.stockTransferItems) {
            form.value.stockTransferItems = [];
            stockTransferStore.addItem();
        }
    }
}, { immediate: false });

const handleSaveStockTransfer = async () => {
    if (!form.value.date) {
        return toast.fire('Validasi', 'Tanggal wajib diisi.', 'warning');
    }

    try {
        await stockTransferStore.saveStockTransfer();
        await stockTransferStore.fetchStockTransfersPaginated();
        stockTransferStore.closeModal();
        toast.fire(
            'Berhasil!',
            `Stock Transfer berhasil ${isEditMode.value ? 'diperbarui' : 'dibuat'}.`,
            'success'
        );
    } catch (error) {
        const err = normalizeApiError(error, 'Stock Transfer gagal disimpan.')
        stockTransferStore.validationErrors = err.fieldErrorList
        toastNormalizedError(err)
    }
};

const approveStockTransfer = async (id) => {
    try {
        await stockTransferStore.approveStockTransfer(id);
        await stockTransferStore.fetchStockTransfersPaginated();
    } catch (error) {
        const err = normalizeApiError(error, 'Stock Transfer gagal disetujui.')
        toastNormalizedError(err)
    }
};

// Fungsi untuk menangani event load lazy data dari jabatan
const loadLazyData = async () => {
    try {
        await stockTransferStore.fetchStockTransfersPaginated();
    } catch (error) {
        const error_message = error.message;
        toast.fire('Error', `Tidak dapat memuat data Stock Transfer: ${error_message}`, 'error');
    }
};

onMounted(async () => {
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;

    permissionStore.fetchPermissions();
    userStore.loadUser();
    loadLazyData();
    stockTransferStore.fetchStats();
    setListTitle('Stock Transfer', stockTransfers.value.length)
    // Gunakan endpoint data baru untuk load data
    try {
        const [perusahaanData, cabangData, warehouseData] = await Promise.all([
            stockTransferStore.fetchPerusahaanData(),
            stockTransferStore.fetchCabangData(),
            stockTransferStore.fetchWarehouseData()
        ]);
        
        // Assign data ke store yang sesuai
        perusahaanStore.perusahaans = perusahaanData;
        cabangStore.cabangs = cabangData;
        warehouseStore.warehouseList = warehouseData;
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback ke method lama jika endpoint data baru gagal
        warehouseStore.fetchAllWarehouses();
        perusahaanStore.fetchPerusahaans();
        cabangStore.fetchCabangs();
    }
});

const exportData = (format) => {
    if (format === 'excel') {
        const toast = useToast();
        
        // Cek apakah ada filter yang diterapkan
        const hasFilters = globalFilterValue.value;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export Excel...' 
                : 'Sedang mempersiapkan semua data untuk export Excel...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export Excel
        stockTransferStore.fetchAllStockTransfersForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export Excel khusus untuk Stock Transfer
                    return exportStockTransferExcel(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `Excel berhasil dibuat dengan ${allData.length} data Stock Transfer${hasFilters ? ' sesuai filter' : ''}`,
                                color: 'green',
                                position: 'bottomRight',
                                layout: 2
                            });
                        });
                } else {
                    toast.warning({
                        title: 'Warning',
                        message: 'Tidak ada data untuk diexport',
                        color: 'orange',
                        position: 'bottomRight',
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
                    position: 'bottomRight',
                    layout: 2
                });
            });
    } else if (format === 'pdf') {
        const toast = useToast();
        
        // Ambil semua data yang sesuai dengan filter untuk export PDF
        stockTransferStore.fetchAllStockTransfersForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export PDF khusus untuk Stock Transfer
                    return exportStockTransferPDF(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `PDF berhasil dibuat dengan ${allData.length} data Stock Transfer`,
                                color: 'green',
                                position: 'bottomRight',
                                layout: 2
                            });
                        });
                } else {
                    toast.warning({
                        title: 'Warning',
                        message: 'Tidak ada data untuk diexport',
                        color: 'orange',
                        position: 'bottomRight',
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
                    position: 'bottomRight',
                    layout: 2
                });
            });
    }
};

// View Stock Transfer Details
const viewStockTransferDetails = (stockTransferId) => {
    router.push({ path: `/inventory/stock-transfer-detail`, query: { id: stockTransferId } });
};

const deleteStockTransfer = async (id) => {
    if (!id) return;

    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Tindakan ini tidak bisa dibatalkan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#008fec',
        cancelButtonColor: '#A7A9B3',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await stockTransferStore.deleteStockTransfer(id);
            loadLazyData(); // Muat ulang data
            await toast.fire({
                title: 'Berhasil!',
                text: 'Stock Transfer berhasil dihapus.',
                icon: 'success'
            });

        } catch (error) {
            await toast.fire({
                title: 'Error',
                text: error.message,
                icon: 'error'
            });
        }
    }
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft':
            return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' };
        case 'approved':
            return { text: 'Approved', class: 'badge rounded-pill bg-label-success' };
    }
};

// Fungsi export PDF khusus untuk Stock Transfer
const exportStockTransferPDF = (dataToExport) => {
    return Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, { default: autoTable }]) => {

    // Definisikan kolom yang akan diexport
    const columnDefinitions = [
        { field: 'noTransfer', header: 'No. Transfer' },
        { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
        { field: 'penerima', header: 'Penerima' },
        { field: 'cabang.nmCabang', header: 'Cabang' },
        { field: 'date', header: 'Tanggal' },
        { field: 'fromWarehouse.name', header: 'Dari Gudang' },
        { field: 'toWarehouse.name', header: 'Ke Gudang' },
        { field: 'status', header: 'Status' }
    ];

    const head = [columnDefinitions.map(col => col.header)];

    if (!dataToExport || dataToExport.length === 0) {
        console.warn('Tidak ada data untuk diexport');
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan Stock Transfers', 14, 15);
        doc.setFontSize(12);
        doc.text('Tidak ada data yang tersedia untuk export', 14, 50);
        doc.save('stock-transfers-empty.pdf');
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
        if (col.field === 'date') {
            if (value && value !== '-') {
                value = new Date(value).toLocaleDateString('id-ID');
            }
        } else if (col.field === 'status') {
            if (value === 'draft') value = 'Draft';
            else if (value === 'approved') value = 'Approved';
            else if (value === 'rejected') value = 'Rejected';
        }

        return String(value);
    }));

    // Definisikan lebar kolom
    const columnStyles = {
        0: { cellWidth: 34 }, // No. Transfer
        1: { cellWidth: 36 }, // Perusahaan
        2: { cellWidth: 34 }, // Penerima
        3: { cellWidth: 34 }, // Cabang
        4: { cellWidth: 34 }, // Tanggal
        5: { cellWidth: 34 }, // Dari Gudang
        6: { cellWidth: 34 }, // Ke Gudang
        7: { cellWidth: 34 }  // Status
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
    doc.text('Laporan Stock Transfers', 14, 15);

    // Timestamp dan jumlah data
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 25);
    doc.text(`Total Data: ${dataToExport.length}`, 14, 32);

    // Info filter (untuk stock transfer tidak ada filter khusus, hanya search)
    const filterInfo = [];
    if (globalFilterValue.value) {
        filterInfo.push(`Pencarian: ${globalFilterValue.value}`);
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
    });

    // Info ringkasan setelah tabel
    const finalY = doc.lastAutoTable.finalY || 200;

    // Garis pemisah
    doc.setDrawColor(200, 200, 200);
    doc.line(10, finalY + 5, doc.internal.pageSize.width - 10, finalY + 5);

    // Info ringkasan
    doc.setFontSize(8);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Total Stock Transfers: ${dataToExport.length}`, 10, finalY + 20);

    // Hitung statistik status
    const statusCounts = dataToExport.reduce((acc, row) => {
        const status = row.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    let yPos = finalY + 30;
    Object.entries(statusCounts).forEach(([status, count]) => {
        const statusLabel = status === 'draft' ? 'Draft' : 
        status === 'approved' ? 'Approved' : 
        status === 'rejected' ? 'Rejected' : status;
        doc.text(`${statusLabel}: ${count}`, 10, yPos);
        yPos += 8;
    });

    doc.save('stock-transfers.pdf');
    });
};

// Fungsi export Excel khusus untuk Stock Transfer
const exportStockTransferExcel = (dataToExport) => {
    return Promise.all([
        import('xlsx')
    ]).then(([XLSX]) => {
        // Definisikan kolom yang akan diexport
        const columnDefinitions = [
            { field: 'noTransfer', header: 'No. Transfer' },
            { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
            { field: 'penerima', header: 'Penerima' },
            { field: 'cabang.nmCabang', header: 'Cabang' },
            { field: 'date', header: 'Tanggal' },
            { field: 'fromWarehouse.name', header: 'Dari Gudang' },
            { field: 'toWarehouse.name', header: 'Ke Gudang' },
            { field: 'status', header: 'Status' }
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

        // Buat data untuk Excel
        const excelData = [];

        // Header perusahaan
        excelData.push([companyInfo.name]);
        excelData.push([companyInfo.address]);
        excelData.push([`Email: ${companyInfo.email}`]);
        excelData.push([`Telp: ${companyInfo.phone}`]);
        excelData.push([]); // Baris kosong

        // Judul laporan
        excelData.push(['Laporan Stock Transfers']);
        excelData.push([`Dibuat pada: ${new Date().toLocaleString('id-ID')}`]);
        excelData.push([`Total Data: ${dataToExport.length}`]);

        // Info filter (untuk stock transfer tidak ada filter khusus, hanya search)
        const filterInfo = [];
        if (globalFilterValue.value) {
            filterInfo.push(`Pencarian: ${globalFilterValue.value}`);
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
                if (col.field === 'date') {
                    if (value && value !== '-') {
                        value = new Date(value).toLocaleDateString('id-ID');
                    }
                } else if (col.field === 'status') {
                    if (value === 'draft') value = 'Draft';
                    else if (value === 'approved') value = 'Approved';
                    else if (value === 'rejected') value = 'Rejected';
                }

                return String(value);
            });
            excelData.push(rowData);
        });

        // Baris kosong
        excelData.push([]);

        // Summary
        excelData.push(['Total Stock Transfers:', dataToExport.length]);

        // Hitung status counts
        const statusCounts = {};
        dataToExport.forEach(row => {
            const status = row.status || 'unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Tampilkan status summary
        Object.entries(statusCounts).forEach(([status, count]) => {
            const statusLabel = status === 'draft' ? 'Draft' : 
                               status === 'approved' ? 'Approved' : 
                               status === 'rejected' ? 'Rejected' : status;
            excelData.push([`${statusLabel}:`, count]);
        });

        // Buat workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 20 }, // No. Transfer
            { wch: 25 }, // Perusahaan
            { wch: 20 }, // Penerima
            { wch: 20 }, // Cabang
            { wch: 15 }, // Tanggal
            { wch: 20 }, // Dari Gudang
            { wch: 20 }, // Ke Gudang
            { wch: 15 }  // Status
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

        // Style untuk status counts
        Object.keys(statusCounts).forEach((_, index) => {
            const statusRow = summaryStartRow + 1 + index;
            if (ws[`A${statusRow + 1}`]) {
                ws[`A${statusRow + 1}`].s = { font: { bold: true } };
            }
        });

        XLSX.utils.book_append_sheet(wb, ws, 'Stock Transfers');
        XLSX.writeFile(wb, 'stock-transfers.xlsx');
    });
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Stock Transfer',
  description: 'Stock Transfer Management',
  keywords: 'Stock Transfer, Inventory, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
</script>

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
