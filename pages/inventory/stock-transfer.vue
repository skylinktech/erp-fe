<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Stock Transfer</h4>
            <p class="mb-6">
            List stock transfer yang terdaftar di sistem
            </p>
            <!-- Stock Transfer cards -->
            <div class="row g-6 mb-6">
                <CardBox
                    v-if="stats.total !== undefined"
                    title="Total Stock Transfer"
                    :total="stats.total + ' Stock Transfer'"
                />
                <CardBox
                    v-if="stats.draft !== undefined"
                    title="Total Stock Transfer Draft"
                    :total="stats.draft + ' Stock Transfer'"
                />
                <CardBox
                    v-if="stats.approved !== undefined"
                    title="Total Stock Transfer Approved"
                    :total="stats.approved + ' Stock Transfer'"
                />
                <CardBox
                    v-if="stats.rejected !== undefined"
                    title="Total Stock Transfer Rejected"
                    :total="stats.rejected + ' Stock Transfer'"
                />
                <CardBox
                    v-if="userHasRole('superadmin') || userHasPermission('create_stock_transfer')"
                    :isAddButtonCard="true"
                    image-src="/img/illustrations/add-new-role-illustration.png"
                    image-alt="Tambah Stock Transfer"
                    button-text="Tambah Stock Transfer"
                    modal-target="#Modal" 
                    @button-click="stockTransferStore.openModal()"
                />
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total Stock Transfer</h4>
                    <p class="mb-0">Find all of your company's administrator accounts and their associate Stock Transfer.</p>
                </div>
                <div class="col-12">
                    <!-- stock transfer Table -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="stockTransferStore.handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
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
                                            placeholder="Cari Stock Transfer..."
                                            class="w-full md:w-20rem"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
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
                                <Column field="status" header="Status" :sortable="true">
                                    <template #body="slotProps">
                                        <span >
                                            {{ getStatusBadge(slotProps.data.status).text }}
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
                                <div class="form-floating form-floating-outline">
                                    <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans"
                                        :get-option-label="option => option.nmPerusahaan"
                                        :reduce="option => option.id" searchable clearable
                                        placeholder="-- Pilih Perusahaan --"
                                        class="perusahaan-select"
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs"
                                        :get-option-label="option => option.nmCabang"
                                        :reduce="option => option.id" searchable clearable 
                                        placeholder="-- Pilih Cabang --"
                                        class="cabang-select"
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <CustomSelect2 v-model="form.fromWarehouseId" :options="warehouses"
                                        :get-option-label="option => option.name"
                                        :reduce="option => option.id" searchable clearable 
                                        placeholder="-- Pilih Gudang Asal --"
                                        class="warehouse-select"
                                    />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <CustomSelect2 v-model="form.toWarehouseId" :options="warehouses"
                                        :get-option-label="option => option.name"
                                        :reduce="option => option.id" searchable clearable 
                                        placeholder="-- Pilih Gudang Tujuan --"
                                        class="warehouse-select"
                                    />
                                </div>
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
                                    <label for="name">Tanggal</label>
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
                                    <label for="penerima">Nama Penerima</label>
                                </div>
                            </div>
                            <div class="col-md-12">
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
                            <hr class="mt-7 w-70 justify-content-center" />
                            <div v-for="(item, index) in form.stockTransferItems" :key="index" class="repeater-item">
                                <div class="row">
                                    <div class="mb-4 col-lg-4 col-xl-4 col-12 mb-0">
                                        <div class="form-floating form-floating-outline stock-transfer-item-select">
                                            <CustomSelect2 v-model="item.stock" :options="productsInWarehouse"
                                                :get-option-label="option => `${option.product?.sku || ''} | ${option.product?.name || ''}`" searchable clearable
                                                placeholder="-- Pilih Produk --"
                                                :filter-by="(option, label, search) => {
                                                    const product = option.product;
                                                    const searchLower = search.toLowerCase();
                                                    return (product?.name && product.name.toLowerCase().includes(searchLower)) || 
                                                           (product?.sku && product.sku.toLowerCase().includes(searchLower));
                                                }"
                                            />
                                        </div>
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
                                            <label>Jumlah</label>
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
         <!-- / Content -->
 
         <div class="content-backdrop fade"></div>
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
import CardBox from '~/components/cards/Cards.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Swal from 'sweetalert2'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import 'vue-select/dist/vue-select.css'
import { useRouter } from 'vue-router'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

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
const { stockTransfers, totalRecords, stats, params, form, isEditMode, showModal, validationErrors, productsInWarehouse } = storeToRefs(stockTransferStore)
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

const modalTitle = computed(() => isEditMode.value ? 'Edit Stock Transfer' : 'Tambah Stock Transfer');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Stock Transfer di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan Stock Transfer baru.');

// Fungsi untuk menangani event close dari modal
watch(showModal, (newValue) => {
    const modalEl = document.getElementById('Modal');
    if (modalEl && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        if (newValue) {
            modalInstance.show();
        } else {
            modalInstance.hide();
        }
    }
});

let searchDebounceTimer = null;
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
    if (newWarehouseId) {
        stockTransferStore.fetchProductsByWarehouse(newWarehouseId);
        if (oldWarehouseId && newWarehouseId !== oldWarehouseId) {
            form.value.stockTransferItems = [];
            stockTransferStore.addItem();
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
        const errorData = error;
        if (errorData.errors) {
            stockTransferStore.validationErrors = Array.isArray(errorData.errors)
                ? errorData.errors
                : Object.values(errorData.errors).flat();
            toast.fire('Gagal', 'Terdapat kesalahan validasi data.', 'error');
        } else if(errorData.status === 422) {
            stockTransferStore.validationErrors = errorData.errors;
        } else {
            errorData.errors
        }
    }
};

const approveStockTransfer = async (id) => {
    try {
        await stockTransferStore.approveStockTransfer(id);
        await stockTransferStore.fetchStockTransfersPaginated();
    } catch (error) {
        let errorMessage = 'Gagal menyetujui Stock Transfer';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        // Coba parsing error jika itu adalah string JSON
        try {
            const parsedError = JSON.parse(errorMessage);
            if (parsedError.errors) {
                 stockTransferStore.validationErrors = Array.isArray(parsedError.errors)
                    ? parsedError.errors
                    : Object.values(parsedError.errors).flat();
                return toast.fire('Gagal', 'Terdapat kesalahan validasi data.', 'error');
            }
             errorMessage = parsedError.message || errorMessage;
        } catch (e) {
            // Biarkan errorMessage seperti apa adanya jika bukan JSON
        }
        
        await toast.fire('Error', errorMessage, 'error');
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
        confirmButtonColor: '#666CFF',
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
