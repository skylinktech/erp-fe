<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Stock</h4>
            <p class="mb-6">
            List stock yang terdaftar di sistem
            </p>
            <!-- stock in cards -->
            <div class="row g-6 mb-6">
                <div class="col-6" v-if="loading && stats.total === undefined">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="skeleton-loader me-3" style="width: 40px; height: 40px; border-radius: 8px;"></div>
                                <div class="flex-grow-1">
                                    <div class="skeleton-loader mb-2" style="width: 60%; height: 16px;"></div>
                                    <div class="skeleton-loader" style="width: 40%; height: 20px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CardBox
                    v-else-if="stats.total !== undefined"
                    title="Total Stock"
                    :total="stats.total + ' Stock'"
                    columnClass="col-6"
                />
                
                <div class="col-6" v-if="loading && stats.perWarehouse.length === 0">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="skeleton-loader me-3" style="width: 40px; height: 40px; border-radius: 8px;"></div>
                                <div class="flex-grow-1">
                                    <div class="skeleton-loader mb-2" style="width: 70%; height: 16px;"></div>
                                    <div class="skeleton-loader" style="width: 50%; height: 20px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CardBox
                    v-else-if="stats.perWarehouse.length > 0"
                    title="Total Stock Per Gudang"
                    :total="stats.perWarehouse.length + ' Gudang'"
                    columnClass="col-6"
                />
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total Stock</h4>
                    <p class="mb-0">Find all of your company's administrator accounts and their associate Stock.</p>
                </div>
                <div class="col-12">
                    <!-- stock in Table -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="stocksStore.handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="btn-group me-2" v-if="userHasRole('superadmin')">
                                    <button class="btn btn-primary" type="button" @click="stocksStore.openModal()">
                                        <i class="ri-add-line me-1"></i> Tambah
                                    </button>
                                </div>
                                <div class="btn-group me-2">
                                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="ri-upload-2-line me-1"></i> Export
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('csv')">CSV</a></li>
                                        <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('excel')">Excel</a></li>
                                        <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('pdf')">PDF</a></li>
                                    </ul>
                                </div>
                                <div class="input-group">
                                    <span class="p-input-icon-left">
                                        <InputText
                                            v-model="globalFilterValue"
                                            placeholder="Cari Stock In..."
                                            class="w-full md:w-20rem"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="stocks" 
                            :rows="Number(params.rows)" 
                            :loading="loading"
                            :totalRecords="totalRecords"
                            :first="params.first"
                            :lazy="true"
                            @page="stocksStore.setPagination($event)"
                            @sort="stocksStore.setSort($event)"
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
                                <Column field="image" header="Gambar" :sortable="true">
                                    <template #body="slotProps">
                                        <div v-if="slotProps.data.product.image">
                                            <img 
                                                :src="getProductImage(slotProps.data.product.image)" 
                                                alt="Gambar Produk" 
                                                style="height: 40px; max-width: 80px; object-fit: contain; cursor: pointer;" 
                                                @error="(e) => handleImageError(e, '/img/default-product-image.png')"
                                                @click="openImageInNewTab(slotProps.data.product.image)"
                                                title="Klik untuk melihat gambar lengkap"
                                            />
                                        </div>
                                        <div v-else>
                                            <img 
                                                src="/img/default-product-image.png" 
                                                alt="Default Image" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="product.sku" header="Part Number" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.product.sku }}
                                    </template>
                                </Column>
                                <Column field="product.name" header="Nama Produk" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.product.name }}
                                    </template>
                                </Column>
                                <Column field="warehouse.code" header="Kode Gudang" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        <span class="badge bg-secondary">
                                            {{ slotProps.data.warehouse.code }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="warehouse.name" header="Nama Gudang" :sortable="true" class="text-nowrap" v-if="userHasRole('superadmin') || userHasRole('admin') || userHasRole('admin gudang')">
                                    <template #body="slotProps">
                                        <span class="badge bg-primary">
                                            {{ slotProps.data.warehouse.name }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="quantity" header="Jumlah" :sortable="true" class="text-nowrap">
                                    <template #body="slotProps">
                                        {{ Math.floor(slotProps.data.quantity) }}
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem" v-if="userHasRole('superadmin')">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="stocksStore.openModal(slotProps.data)">
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                </li>
                                                <li>
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="deleteStock(slotProps.data.id)">
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

    <!-- Modal Tambah/Edit Stock -->
    <Modal 
        id="StockModal"
        :title="isEditMode ? 'Edit Stock' : 'Tambah Stock'" 
        :description="isEditMode ? 'Perbarui data stock.' : 'Isi form untuk menambahkan stock.'"
        :validationErrorsFromParent="validationErrors"
    >
        <template #default>
            <form @submit.prevent="stocksStore.saveStock()">
                <div class="row g-4">
                    <div class="col-md-6">
                        <label class="form-label">Produk</label>
                        <CustomSelect2 
                            v-model="form.productId" 
                            :options="allProducts"
                            :get-option-label="o => `${o.sku} - ${o.name}`"
                            :reduce="o => o.id"
                            searchable clearable
                            placeholder="-- Pilih Produk --"
                        />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Gudang</label>
                        <CustomSelect2 
                            v-model="form.warehouseId" 
                            :options="warehouseList"
                            :get-option-label="o => `${o.code} - ${o.name}`"
                            :reduce="o => o.id"
                            searchable clearable
                            placeholder="-- Pilih Gudang --"
                        />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Jumlah</label>
                        <input type="number" class="form-control" v-model="form.quantity" min="0" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Deskripsi</label>
                        <input type="text" class="form-control" v-model="form.description" placeholder="Opsional" />
                    </div>
                </div>
                <div class="modal-footer mt-6">
                    <button type="button" class="btn btn-outline-secondary" @click="stocksStore.closeModal()">Tutup</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Simpan
                    </button>
                </div>
            </form>
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user'
import { useStocksStore } from '~/stores/stocks'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'
import CardBox from '~/components/cards/Cards.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import Swal from 'sweetalert2'
import Modal from '~/components/modal/Modal.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()
const { getProductImage, handleImageError } = useImageUrl()
const toast = useToast()

const { $api } = useNuxtApp()

const myDataTableRef  = ref(null)
const userStore       = useUserStore()
const stocksStore     = useStocksStore()
const productStore    = useProductStore()
const warehouseStore  = useWarehouseStore()
const permissionStore = usePermissionsStore()
const { stocks, totalRecords, stats, params, loading, form, isEditMode, showModal, validationErrors } = storeToRefs(stocksStore)
const { allProducts }   = storeToRefs(productStore)
const { warehouseList } = storeToRefs(warehouseStore)
const globalFilterValue = ref('');

const { userHasPermission, userHasRole } = usePermissions();

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

let searchDebounceTimer = null;
watch(globalFilterValue, (newValue) => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
        stocksStore.setSearch(newValue);
    }, 500);
});

onBeforeUnmount(() => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
});

// Fungsi untuk menangani event load lazy data dari jabatan
const loadLazyData = async () => {
    try {
        await stocksStore.fetchStocksPaginated();
    } catch (error) {
        const error_message = error.message;
        toast.error(`Tidak dapat memuat data stock: ${error_message}`);
    }
};

onMounted(async () => {
    loadLazyData();
    stocksStore.fetchStats();
    permissionStore.fetchPermissions()
    userStore.loadUser()
    setListTitle('Stock', stocks.value.length)
    // Muat opsi produk & gudang untuk select
    await Promise.all([
        productStore.fetchAllProducts(),
        warehouseStore.fetchAllWarehouses(),
    ])
});

// Modal bootstrap instance
let modalInstance = null
onMounted(() => {
    const modalElement = document.getElementById('StockModal')
    if (modalElement) {
        // @ts-ignore
        modalInstance = new bootstrap.Modal(modalElement)
    }
})

watch(showModal, (newVal) => {
    if (newVal) modalInstance?.show(); else modalInstance?.hide();
})

const exportData = async (format) => {
    try {
        if (format === 'excel') {
            const toast = useToast();
            
            // Cek apakah ada filter yang diterapkan
            const hasFilters = params.value.productId || params.value.warehouseId || params.value.search;
            
            toast.info({
                title: 'Info',
                message: hasFilters 
                    ? 'Sedang mempersiapkan data sesuai filter untuk export Excel...' 
                    : 'Sedang mempersiapkan semua data untuk export Excel...',
                color: 'blue'
            });
            
            // Ambil semua data yang sesuai dengan filter untuk export Excel
            stocksStore.fetchStocksForExport()
                .then((result) => {
                    if (result && result.data && result.data.length > 0) {
                        // Gunakan fungsi export Excel khusus untuk Stock
                        return exportStockExcel(result.data)
                            .then(() => {
                                toast.success({
                                    title: 'Success',
                                    message: `Excel berhasil dibuat dengan ${result.data.length} data Stock${hasFilters ? ' sesuai filter' : ''}`,
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
            const hasFilters = params.value.productId || params.value.warehouseId || params.value.search;
            
            toast.info({
                title: 'Info',
                message: hasFilters 
                    ? 'Sedang mempersiapkan data sesuai filter untuk export PDF...' 
                    : 'Sedang mempersiapkan semua data untuk export PDF...',
                color: 'blue'
            });
            
            // Ambil semua data yang sesuai dengan filter untuk export PDF
            const result = await stocksStore.fetchStocksForExport();
            
            if (result && result.data && result.data.length > 0) {
                // Gunakan fungsi export PDF khusus untuk Stock
                await exportStockPDF(result.data);
                toast.success({
                    title: 'Success',
                    message: `PDF berhasil dibuat dengan ${result.data.length} data Stock${hasFilters ? ' sesuai filter' : ''}`,
                    color: 'green'
                });
            } else {
                toast.warning({
                    title: 'Warning',
                    message: 'Tidak ada data untuk diexport',
                    color: 'orange'
                });
            }
        } else if (format === 'csv') {
            // Implementasi export CSV jika diperlukan
            const toast = useToast();
            toast.info({
                title: 'Info',
                message: 'Fitur export CSV akan segera tersedia',
                color: 'blue'
            });
        }
    } catch (error) {
        console.error('Export error:', error);
        const toast = useToast();
        toast.error('Gagal melakukan export data');
    }
};

// View Stock In Details
const viewStockInDetails = (stockInId) => {
    const url = `${$api.getStockInDetails(stockInId)}`;
    window.open(url, '__blank');
};

// Buka gambar produk di tab baru (mengikuti pendekatan di halaman product)
const openImageInNewTab = (imagePath) => {
    if (!imagePath) return;
    const fullUrl = getProductImage(imagePath);
    try {
        window.open(fullUrl, '_blank', 'noopener');
    } catch (e) {
        console.error('Gagal membuka gambar di tab baru:', e);
    }
};

const deleteStock = async (id) => {
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
            await stocksStore.deleteStock(id);
            loadLazyData(); // Muat ulang data
            toast.success({
                title: 'Success',
                message: 'Stock berhasil dihapus.',
                color: 'green',
                position: 'topRight',
            });

        } catch (error) {
            toast.error({
                title: 'Error',
                message: error.message,
                color: 'red',
                position: 'topRight',
            });
        }
    }
};

// Fungsi export PDF khusus untuk Stock
const exportStockPDF = async (dataToExport) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    // Definisikan kolom yang akan diexport
    const columnDefinitions = [
        { field: 'product.sku', header: 'Part Number' },
        { field: 'product.name', header: 'Nama Produk' },
        { field: 'product.unit.name', header: 'Satuan' },
        { field: 'warehouse.code', header: 'Kode Gudang' },
        { field: 'warehouse.name', header: 'Nama Gudang' },
        { field: 'quantity', header: 'Quantity' }
    ];

    const head = [columnDefinitions.map(col => col.header)];

    if (!dataToExport || dataToExport.length === 0) {
        console.warn('Tidak ada data untuk diexport');
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan Stock', 14, 15);
        doc.setFontSize(12);
        doc.text('Tidak ada data yang tersedia untuk export', 14, 50);
        doc.save('stock-empty.pdf');
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

        // Format khusus untuk quantity
        if (col.field === 'quantity') {
            if (value && value !== '-') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    value = Math.floor(numValue);
                }
            }
        }

        return String(value);
    }));

    // Definisikan lebar kolom
    const columnStyles = {
        0: { cellWidth: 30 }, // Part Number
        1: { cellWidth: 50 }, // Nama Produk
        2: { cellWidth: 20 }, // Satuan
        3: { cellWidth: 25 }, // Kode Gudang
        4: { cellWidth: 40 }, // Nama Gudang
        5: { cellWidth: 20 }  // Quantity
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
    doc.text('Laporan Stock', 14, 15);

    // Timestamp dan jumlah data
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 25);
    doc.text(`Total Data: ${dataToExport.length}`, 14, 32);

    // Info filter
    const filterInfo = [];
    if (params.value.productId) {
        const product = allProducts.value?.find(p => p.id === params.value.productId);
        if (product) {
            filterInfo.push(`Produk: ${product.name}`);
        }
    }
    if (params.value.warehouseId) {
        const warehouse = warehouseList.value?.find(w => w.id === params.value.warehouseId);
        if (warehouse) {
            filterInfo.push(`Gudang: ${warehouse.name}`);
        }
    }
    if (params.value.search) {
        filterInfo.push(`Pencarian: ${params.value.search}`);
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
    doc.text(`Total Stock: ${dataToExport.length}`, 10, finalY + 20);

    // Hitung total quantity
    let totalQuantity = 0;
    dataToExport.forEach(row => {
        const quantity = Number(row.quantity) || 0;
        totalQuantity += quantity;
    });
    doc.text(`Total Quantity: ${Math.floor(totalQuantity)}`, 10, finalY + 30);

    doc.save('stock.pdf');
};

// Fungsi export Excel khusus untuk Stock
const exportStockExcel = (dataToExport) => {
    return Promise.all([
        import('xlsx')
    ]).then(([XLSX]) => {
        // Definisikan kolom yang akan diexport
        const columnDefinitions = [
            { field: 'product.sku', header: 'Part Number' },
            { field: 'product.name', header: 'Nama Produk' },
            { field: 'product.unit.name', header: 'Satuan' },
            { field: 'warehouse.code', header: 'Kode Gudang' },
            { field: 'warehouse.name', header: 'Nama Gudang' },
            { field: 'quantity', header: 'Quantity' }
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
        excelData.push(['Laporan Stock']);
        excelData.push([`Dibuat pada: ${new Date().toLocaleString('id-ID')}`]);
        excelData.push([`Total Data: ${dataToExport.length}`]);

        // Info filter
        const filterInfo = [];
        if (params.value.productId) {
            const product = allProducts.value?.find(p => p.id === params.value.productId);
            if (product) {
                filterInfo.push(`Produk: ${product.name}`);
            }
        }
        if (params.value.warehouseId) {
            const warehouse = warehouseList.value?.find(w => w.id === params.value.warehouseId);
            if (warehouse) {
                filterInfo.push(`Gudang: ${warehouse.name}`);
            }
        }
        if (params.value.search) {
            filterInfo.push(`Pencarian: ${params.value.search}`);
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

                // Format khusus untuk quantity
                if (col.field === 'quantity') {
                    if (value && value !== '-') {
                        value = Math.floor(Number(value));
                    }
                }

                return String(value);
            });
            excelData.push(rowData);
        });

        // Baris kosong
        excelData.push([]);

        // Summary
        excelData.push(['Total Stock:', dataToExport.length]);

        // Hitung total quantity
        let totalQuantity = 0;
        dataToExport.forEach(row => {
            const quantity = Number(row.quantity) || 0;
            totalQuantity += quantity;
        });
        excelData.push(['Total Quantity:', Math.floor(totalQuantity)]);

        // Buat workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 20 }, // Part Number
            { wch: 35 }, // Nama Produk
            { wch: 15 }, // Satuan
            { wch: 18 }, // Kode Gudang
            { wch: 30 }, // Nama Gudang
            { wch: 15 }  // Quantity
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

        XLSX.utils.book_append_sheet(wb, ws, 'Stock');
        XLSX.writeFile(wb, 'stock.xlsx');
    });
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Stock',
  description: 'Stock Management',
  keywords: 'Stock, Inventory, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
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
