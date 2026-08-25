<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">
            List stock in yang terdaftar di sistem
            </p>
                        <div class="row g-6 mb-6">
                <div v-if="stats.total !== undefined" class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Stock In</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary"><i class="ri-inbox-archive-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.total }}</h5>
                                <span class="text-muted">Stock in terdaftar</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.draft !== undefined" class="col-xl-4 col-lg-6 col-md-6">
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
                                <span class="text-muted">Stock in draft</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.posted !== undefined" class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Posted</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.posted }}</h5>
                                <span class="text-muted">Stock in posted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Data Stock In</h4>
                    <p class="mb-0">Kelola penerimaan stok dan posting transaksi stock in.</p>
                </div>
                <div class="col-12">
                                        <div class="card">
                        <ListPageTableHeader
                            :rows="Number(tableControls.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari Stock In..."
                            :export-disabled="loading"
                            :export-items="[
                                { value: 'csv', label: 'CSV (dengan Detail Item)' },
                                { value: 'excel', label: 'Excel' },
                                { value: 'pdf', label: 'PDF' },
                            ]"
                            @update:rows="onStockInToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                            @export="exportData"
                        >
                            <template #toolbar-extra>
                                <button
                                    class="btn btn-dark btn-sm"
                                    type="button"
                                    @click="postAllSelectedStockIn"
                                    :disabled="!Array.isArray(selectedStockIns) || selectedStockIns.length === 0"
                                    title="Post semua stock in yang dipilih"
                                >
                                    <i class="ri-upload-2-line me-1"></i> Post All ({{ Array.isArray(selectedStockIns) ? selectedStockIns.length : 0 }})
                                </button>
                            </template>
                        </ListPageTableHeader>
<div class="card-datatable table-responsive py-3 px-3">
                                                <MyDataTable 
                            ref="myDataTableRef"
                            :data="stockIns" 
                            :rows="params.rows" 
                            :loading="loading"
                            :totalRecords="totalRecords"
                            :first="params.first"
                            :lazy="true"
                            dataKey="id"
                            @page="stockInStore.setPagination($event)"
                            @sort="stockInStore.setSort($event)"
                            responsiveLayout="scroll" 
                            paginatorPosition="bottom"
                            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                            <Column headerStyle="width: 3rem" :exportable="false">
                                <template #header>
                                    <input 
                                        type="checkbox" 
                                        class="form-check-input"
                                        :checked="isAllSelected"
                                        @change="handleSelectAllChange"
                                        :indeterminate="isIndeterminate"
                                        :disabled="isHeaderCheckboxDisabled"
                                        
                                    />
                                </template>
                                <template #body="slotProps">
                                    <input 
                                        type="checkbox" 
                                        class="form-check-input"
                                        :key="`checkbox-${slotProps.data.id}-${forceUpdate}`"
                                        :checked="isRowSelected(slotProps.data.id)"
                                        @change="(event) => handleCheckboxChange(slotProps.data, event.target.checked)"
                                        :disabled="slotProps.data.status === 'posted'"
                                        
                                    />
                                </template>
                            </Column>
                                <Column header="No." :sortable="false" style="width: 60px;">
                                    <template #body="slotProps">
                                        {{
                                            Number.isFinite(params.first) && Number.isFinite(params.rows)
                                            ? ((params.first / params.rows) + slotProps.index + 1)
                                            : (slotProps.index + 1)
                                        }}
                                    </template>
                                </Column>
                                <Column field="noSi" header="No. Stock In" :sortable="true">
                                    <template #body="slotProps">
                                        <span class="badge bg-primary">
                                            {{ slotProps.data.noSi }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="date" header="Tanggal" :sortable="true" style="width:10%">
                                    <template #body="slotProps">
                                        {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString() : '-' }}
                                    </template>
                                </Column>
                                <Column field="purchaseOrder.noPo" header="No. PO" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        <a 
                                            :href="`/purchasing/purchase-order-detail?id=${slotProps.data.purchaseOrder?.id}`" 
                                            class="text-primary text-decoration-underline"
                                            title="Lihat Detail PO"
                                            v-if="slotProps.data.purchaseOrder && slotProps.data.purchaseOrder.noPo"
                                        >
                                            {{ slotProps.data.purchaseOrder.noPo }}
                                        </a>
                                        <span v-else>-</span>
                                    </template>
                                </Column>
                                <Column field="status" header="Status" :sortable="true">
                                    <template #body="slotProps">
                                        <span :class="getStatusBadge(slotProps.data.status).class">
                                            {{ getStatusBadge(slotProps.data.status).text }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="warehouse.name" header="Gudang" :sortable="true"></Column>
                                <Column field="postedByUser.fullName" header="Pengirim" :sortable="true"></Column>
                                <Column field="postedAt" header="Dipost pada" :sortable="true" v-if="userHasRole('superadmin')">
                                    <template #body="slotProps">
                                        {{ slotProps.data.postedAt ? new Date(slotProps.data.postedAt).toLocaleString('id-ID') : '-' }}
                                    </template>
                                </Column>
                                <Column field="purchaseOrder.receivedByUser.fullName" header="Penerima" :sortable="true"></Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li v-if="userHasRole('superadmin') || (userHasPermission('approve_stock_in') && slotProps.data.status == 'draft')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="postStockIn(slotProps.data.id)">
                                                        <i class="ri-upload-2-line me-2"></i> Post
                                                    </a>
                                                </li>
                                                <li v-if="canEditSerial(slotProps.data)">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="editSerials(slotProps.data.id)">
                                                        <i class="ri-barcode-box-line me-2"></i> Edit Serial
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || userHasPermission('show_stock_in')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="viewStockInDetails(slotProps.data.id)">
                                                        <i class="ri-eye-line me-2"></i> Lihat Detail
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('delete_stock_in')) && slotProps.data.status == 'draft'">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="deleteStockIn(slotProps.data.id)">
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
                    <!--/ stock in Table -->
                </div>
            </div>
            <!--/ stock in cards -->
        </div>
         <!-- / Content -->
 
         <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed, nextTick, triggerRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user'
import { useStockStore } from '~/stores/stockin'
import { useWarehouseStore } from '~/stores/warehouse'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Swal from 'sweetalert2'
import 'vue-select/dist/vue-select.css'
import { useRouter } from 'vue-router'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { toastApiError } from '~/utils/apiError'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()
const toast = useToast()

const { $api } = useNuxtApp()

const myDataTableRef            = ref(null)
const userStore                 = useUserStore()
const permissionStore           = usePermissionsStore()
const stockInStore              = useStockStore()
const warehouseStore            = useWarehouseStore()
const { stockIns, totalRecords, stats, params } = storeToRefs(stockInStore)
const { warehouse: warehouses } = storeToRefs(warehouseStore)
const loading                   = ref(false);
const globalFilterValue         = ref('');
const router                    = useRouter()
const selectedStockIns          = ref([])
const forceUpdate               = ref(0)

const { userHasPermission, userHasRole } = usePermissions();

const status       = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Posted', value: 'posted' },
]);

function isDeviceProduct(product) {
    return !!(product?.isDevice ?? product?.is_device)
}

function trackingPolicyOf(product) {
    return product?.trackingPolicy || product?.tracking_policy || (isDeviceProduct(product) ? 'UNIT_SERIAL' : 'NONE')
}

function hasDeviceLines(row) {
    const details = row?.stockInDetails || row?.stock_in_details || []
    return details.some((d) => trackingPolicyOf(d.product) !== 'NONE')
}

function canEditSerial(row) {
    if (!row || row.status !== 'draft') return false
    const canCapture =
        userHasRole('superadmin') ||
        userHasRole('admin') ||
        userHasPermission('capture_equipment_serial') ||
        userHasPermission('approve_stock_in') ||
        userHasPermission('edit_stock_in')
    return canCapture && hasDeviceLines(row)
}

function editSerials(stockInId) {
    router.push({
        path: '/inventory/stock-in-detail',
        query: { id: stockInId, focus: 'serials' },
    })
}

// Method untuk selection change
const onSelectionChange = (event) => {
    selectedStockIns.value = event.value;
};

// Method untuk menentukan apakah row bisa di-select
const isSelectable = (rowData) => {
    return rowData.status === 'draft';
};

// Method untuk handle checkbox change
const handleCheckboxChange = (item, checked) => {
    // Hanya proses jika status draft
    if (item.status !== 'draft') {
        return;
    }
    
    if (checked) {
        // Tambahkan ke selection jika belum ada
        if (!selectedStockIns.value.some(selected => selected.id === item.id)) {
            selectedStockIns.value.push(item);
        }
    } else {
        // Hapus dari selection
        selectedStockIns.value = selectedStockIns.value.filter(selected => selected.id !== item.id);
    }
};

// Computed properties untuk checkbox selection
const draftStockIns = computed(() => {
    if (!stockIns.value || !Array.isArray(stockIns.value)) return [];
    return stockIns.value.filter(stock => stock && stock.status === 'draft');
});

const isAllSelected = computed(() => {
    const selected = selectedStockIns.value;
    const draft = draftStockIns.value;
    
    if (!Array.isArray(selected) || !Array.isArray(draft) || draft.length === 0) {
        return false;
    }
    
    return selected.length === draft.length;
});

const isIndeterminate = computed(() => {
    const selected = selectedStockIns.value;
    const draft = draftStockIns.value;
    
    if (!Array.isArray(selected) || !Array.isArray(draft) || draft.length === 0) {
        return false;
    }
    
    return selected.length > 0 && selected.length < draft.length;
});

// Computed property untuk disable checkbox header
const isHeaderCheckboxDisabled = computed(() => {
    if (!stockIns.value || !Array.isArray(stockIns.value)) return true;
    
    // Disable jika semua data berstatus 'posted'
    return stockIns.value.length > 0 && stockIns.value.every(stock => stock.status === 'posted');
});

// Method untuk check apakah row tertentu ter-select
const isRowSelected = (rowId) => {
    // Gunakan forceUpdate untuk memastikan reactivity
    forceUpdate.value;
    return selectedStockIns.value.some(item => item.id === rowId);
};

// Method untuk handle select all change
const handleSelectAllChange = (checked) => {
    if (checked) {
        // Pilih semua stock in yang berstatus draft
        selectedStockIns.value = [...draftStockIns.value];
    } else {
        // Clear semua selection dengan cara yang memastikan reactivity
        selectedStockIns.value = [];
    }
    
    // Force re-render dengan multiple approach
    forceUpdate.value++;
    
    // Double force dengan nextTick dan triggerRef
    nextTick(() => {
        forceUpdate.value++;
        // Trigger reactivity update dengan mengubah array reference
        selectedStockIns.value = [...selectedStockIns.value];
        // Force reactivity dengan triggerRef
        triggerRef(selectedStockIns);
    });
};

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

// Table controls state
const tableControls = ref({
    rows: 10,
    search: '',
});

let searchDebounceTimer = null;

// Handler untuk rows change
const onStockInToolbarRows = (value) => {
    tableControls.value.rows = Number(value) || 10;
    handleRowsChange(value);
};

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    stockInStore.handleRowsChange();
};

// Handler untuk search
const handleSearch = (value) => {
    globalFilterValue.value = value;
    tableControls.value.search = value;
    params.value.first = 0;
    
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
        stockInStore.setSearch(value);
    }, 500);
};

// Watch untuk sinkronisasi table controls dengan params
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(() => params.value.search, (newValue) => {
    if (newValue !== globalFilterValue.value) {
        globalFilterValue.value = newValue;
        tableControls.value.search = newValue;
    }
});

watch(globalFilterValue, (newValue) => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
        stockInStore.setSearch(newValue);
    }, 500);
});

onBeforeUnmount(() => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
});

const postStockIn = async (id) => {
    try {
        await stockInStore.postStockIn(id);
        await stockInStore.fetchStockInsPaginated();
        selectedStockIns.value = [];
        forceUpdate.value++;
        toast.success({
            title: 'Berhasil',
            message: 'Stock In berhasil diposting.',
            color: 'green',
            position: 'bottomRight',
        });
    } catch (error) {
        toastApiError(error, 'Gagal memposting stock in');
    }
};

const postAllSelectedStockIn = async () => {
    // Validasi sudah dilakukan di button disabled, tidak perlu warning lagi
    if (!Array.isArray(selectedStockIns.value) || selectedStockIns.value.length === 0) {
        return;
    }

    const result = await Swal.fire({
        title: 'Konfirmasi Post All',
        text: `Apakah Anda yakin ingin memposting ${selectedStockIns.value.length} stock in yang dipilih?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Post All!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            loading.value = true;
            
            const result = await stockInStore.postAllSelectedStockIn(selectedStockIns.value.map(item => item.id));
            
            // Validasi response
            if (!result) {
                throw new Error('Response kosong dari server');
            }
            
            // Tampilkan hasil
            let message = result.message || 'Stock in berhasil diposting';
            
            // Handle failed results jika ada
            if (result.results && result.results.failed && Array.isArray(result.results.failed)) {
                if (result.results.failed.length > 0) {
                    message += '\n\nGagal:';
                    result.results.failed.forEach(item => {
                        const reason = item.reason || item.message || 'Gagal diposting';
                        message += `\n- ${item.noSi || item.id}: ${reason}`;
                    });
                }
            }
            
            await Swal.fire({
                title: 'Hasil Post All',
                text: message,
                icon: (result.results && result.results.failed && result.results.failed.length > 0) ? 'warning' : 'success',
                confirmButtonText: 'OK'
            });
            
            // Clear selection setelah berhasil
            selectedStockIns.value = [];
            forceUpdate.value++;
            
            // Refresh data
            await stockInStore.fetchStockInsPaginated();
            
        } catch (error) {
            console.error('Error in postAllSelectedStockIn:', error);
            toastApiError(error, 'Gagal memposting stock in');
        } finally {
            loading.value = false;
        }
    }
};

// Fungsi untuk menangani event load lazy data dari jabatan
const loadLazyData = async () => {
    try {
        await stockInStore.fetchStockInsPaginated();
        // Clear selection setelah data berubah
        selectedStockIns.value = [];
        forceUpdate.value++;
    } catch (error) {
        toastApiError(error, 'Tidak dapat memuat data stock in');
        // Clear selection jika terjadi error
        selectedStockIns.value = [];
        forceUpdate.value++;
    }
};

onMounted(() => {
    // Initialize table controls
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;
    
    loadLazyData();
    stockInStore.fetchStats();
    warehouseStore.fetchWarehouses();
    permissionStore.fetchPermissions()
    userStore.loadUser()
    setListTitle('Stock In', stockIns.value.length)
});

// Clear selection saat data berubah (hanya jika data benar-benar berubah, bukan karena pagination/sort)
watch(stockIns, (newStockIns, oldStockIns) => {
    try {
        // Hanya clear selection jika data benar-benar berubah (bukan karena pagination/sort)
        if (oldStockIns && Array.isArray(oldStockIns) && oldStockIns.length > 0) {
            // Cek apakah ini perubahan data yang sebenarnya atau hanya pagination/sort
            const isDataChange = newStockIns.some((stock, index) => {
                const oldStock = oldStockIns[index];
                return !oldStock || stock.id !== oldStock.id || stock.status !== oldStock.status;
            });
            
            if (isDataChange) {
                selectedStockIns.value = [];
                forceUpdate.value++;
            }
        }
    } catch (error) {
        console.error('Error in stockIns watcher:', error);
        // Clear selection jika terjadi error
        selectedStockIns.value = [];
        forceUpdate.value++;
    }
});

const exportData = (format) => {
    if (format === 'csv' || format === 'excel') {
        // Excel dari TableControls akan di-handle sebagai CSV
        exportStockInWithDetails();
    } else if (format === 'pdf') {
        myDataTableRef.value.exportPDF();
    } else {
        // Format tidak didukung
        const toast = useToast();
        toast.warning({
            title: 'Warning',
            message: 'Format export tidak didukung',
            color: 'orange'
        });
    }
};

// Fungsi export dengan detail item menggunakan CSV
const exportStockInWithDetails = async () => {
    try {
        loading.value = true;
        
        // Ambil data stock in dengan detail
        const stockInData = await stockInStore.exportStockInWithDetails();
        
        if (!stockInData || stockInData.length === 0) {
            toast.warning({
                title: 'Warning',
                message: 'Tidak ada data untuk diexport',
                color: 'orange',
                position: 'bottomRight',
            });
            return;
        }

        // Siapkan data untuk export dengan format yang lebih sederhana
        const exportData = [];
        
        // Ambil nama perusahaan dari user store atau default
        const userData = userStore.user;
        const nmPerusahaan = userData?.perusahaan?.name || userData?.cabang?.perusahaan?.name || userData?.perusahaan?.nmPerusahaan || userData?.cabang?.perusahaan?.nmPerusahaan || 'Perusahaan';
        
        // Tambahkan title
        exportData.push([`Rekapitulasi data Stock In ${nmPerusahaan}`]);
        exportData.push([]); // Baris kosong
        
        // Tambahkan header utama
        exportData.push(['No. Stock In', 'Tanggal', 'Gudang', 'Status', 'No. PO', 'Penerima', 'Produk', 'Deskripsi', 'Quantity']);
        exportData.push(['-'.repeat(10), '-'.repeat(10), '-'.repeat(10), '-'.repeat(10), '-'.repeat(10), '-'.repeat(10), '-'.repeat(10), '-'.repeat(10), '-'.repeat(10)]); // Garis pemisah header
        
        // Tambahkan data dengan detail item
        stockInData.forEach((stockIn) => {
            if (stockIn.stockInDetails && stockIn.stockInDetails.length > 0) {
                stockIn.stockInDetails.forEach(detail => {
                    exportData.push([
                        stockIn.noSi || '-',
                        stockIn.date ? new Date(stockIn.date).toLocaleDateString() : '-',
                        stockIn.warehouse?.name || '-',
                        stockIn.status || '-',
                        stockIn.purchaseOrder?.noPo || '-',
                        stockIn.purchaseOrder?.receivedByUser?.fullName || stockIn.postedByUser?.fullName || '-',
                        detail.product?.name || '-',
                        detail.description || '-',
                        detail.quantity || 0
                    ]);
                });
            } else {
                // Jika tidak ada detail item, tetap tampilkan header stock in
                exportData.push([
                    stockIn.noSi || '-',
                    stockIn.date ? new Date(stockIn.date).toLocaleDateString() : '-',
                    stockIn.warehouse?.name || '-',
                    stockIn.status || '-',
                    stockIn.purchaseOrder?.noPo || '-',
                    stockIn.purchaseOrder?.receivedByUser?.fullName || stockIn.postedByUser?.fullName || '-',
                    '-',
                    'Tidak ada detail item',
                    '-'
                ]);
            }
        });
        
        // Tambahkan informasi tambahan
        exportData.push([]); // Baris kosong
        exportData.push(['='.repeat(100)]); // Garis pemisah
        exportData.push([`Total Data: ${stockInData.length} Stock In`]);
        exportData.push([`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`]);
        exportData.push([`Waktu Export: ${new Date().toLocaleTimeString('id-ID')}`]);
        
        // Buat file CSV dengan border dan styling
        let csvContent = '';
        
        // Tambahkan BOM untuk UTF-8
        csvContent += '\uFEFF';
        
        // Proses setiap baris dengan border
        exportData.forEach((row, index) => {
            if (index === 0) {
                // Title - center align dengan border
                csvContent += `"${row[0]}"\n`;
            } else if (row.length === 0) {
                // Baris kosong
                csvContent += '\n';
            } else if (index === 2) {
                // Header - dengan border dan styling
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            } else if (index === 3) {
                // Garis pemisah header
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            } else if (row.length === 1) {
                // Informasi tambahan atau garis pemisah (single cell)
                if (row[0].includes('=')) {
                    // Garis pemisah
                    csvContent += `"${row[0]}"\n`;
                } else {
                    // Informasi tambahan
                    csvContent += `"${row[0]}"\n`;
                }
            } else {
                // Data rows - dengan border
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            }
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `stock-in-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success({
            title: 'Berhasil',
            message: 'Export CSV dengan detail item berhasil!',
            color: 'green',
            position: 'bottomRight',
        });
        
    } catch (error) {
        toastApiError(error, 'Gagal export CSV');
    } finally {
        loading.value = false;
    }
};

// View Stock In Details
const viewStockInDetails = (stockInId) => {
    router.push({ path: `/inventory/stock-in-detail`, query: { id: stockInId } });
};

const deleteStockIn = async (id) => {
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
            await stockInStore.deleteStockIn(id);
            loadLazyData(); // Muat ulang data
            selectedStockIns.value = [];
            forceUpdate.value++;
            toast.success({
                title: 'Berhasil',
                message: 'Stock In berhasil dihapus.',
                color: 'green',
                position: 'bottomRight',
            });

        } catch (error) {
            toastApiError(error, 'Gagal menghapus stock in');
        }
    }
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft':
            return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' };
        case 'posted':
            return { text: 'Posted', class: 'badge rounded-pill bg-label-success' };
    }
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Stock In',
  description: 'Stock In Management',
  keywords: 'Stock In, Inventory, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
  alias: ['/inventory/barang-masuk'],
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
