<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-pt-12">
            <div v-if="loading" class="text-center py-8">
                <ProgressSpinner 
                    style="width: 50px; height: 50px" 
                    strokeWidth="4"
                    fill="transparent"
                    animationDuration="1s"
                />
                <div class="mt-3 text-muted">Memuat data...</div>
            </div>
            <template v-else>
                <div>
                    <h4 class="mb-1">List Product</h4>
                    <p class="mb-6">
                        List product yang terdaftar di sistem
                        <span v-if="globalFilterValue" class="text-muted">
                            - Menampilkan {{ totalRecords }} hasil untuk "{{ globalFilterValue }}"
                        </span>
                    </p>
                                        <div class="row g-6 mb-6">
                        <div class="col-xl-3 col-lg-6 col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <p class="mb-0">Total Product</p>
                                        <div class="avatar">
                                            <span class="avatar-initial rounded bg-label-primary"><i class="ri-box-3-line"></i></span>
                                        </div>
                                    </div>
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ totalProducts }}</h5>
                                        <span class="text-muted">Product terdaftar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-6">
                        <div class="col-12">
                            <h4 class="mt-6 mb-1">Data Product</h4>
                            <p class="mb-0">Kelola master data produk dan komponen kit.</p>
                        </div>
                        <div class="col-12">
                                                        <div class="card">
                                <ListPageTableHeader
                                    :rows="Number(tableControls.rows)"
                                    :rows-options="rowsPerPageOptionsArray"
                                    :search="globalFilterValue"
                                    search-placeholder="Cari berdasarkan nama, atau part number..."
                                    :export-disabled="loading"
                                    :export-items="[
                                        { value: 'csv', label: 'CSV' },
                                        { value: 'excel', label: 'Excel' },
                                        { value: 'pdf', label: 'PDF' },
                                    ]"
                                    @update:rows="onProductToolbarRows"
                                    @update:search="(v) => { globalFilterValue = v }"
                                    @export="exportData"
                                >
                                    <template #add>
                                        <button
                                            v-if="userHasRole('superadmin') || userHasPermission('create_product')"
                                            type="button"
                                            class="btn btn-primary"
                                            @click="productStore.openModal()"
                                        >
                                            <i class="ri-add-line me-1"></i>
                                            Tambah Product
                                        </button>
                                    </template>
                                    <template #toolbar-extra>
                                        <NuxtLink
                                            v-if="userHasRole('superadmin')"
                                            to="/inventory/import-product"
                                            class="btn btn-dark btn-sm"
                                        >
                                            <i class="ri-download-line me-1"></i> Import Excel
                                        </NuxtLink>
                                    </template>
                                </ListPageTableHeader>
<div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable 
                                    ref="myDataTableRef"
                                    :data="products" 
                                    :rows="Number(params.rows)" 
                                    :loading="loading"
                                    :totalRecords="totalRecords"
                                    :first="params.first"
                                    :lazy="true"
                                    :sort-field="params.sortField"
                                    :sort-order="params.sortOrder"
                                    sort-mode="single"
                                    @page="onPage($event)"
                                    @sort="onSort($event)"
                                    responsiveLayout="scroll"
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
                                    <Column field="image" header="Gambar" :sortable="true">
                                        <template #body="slotProps">
                                            <div v-if="slotProps.data.image">
                                                <img 
                                                    :src="getProductImage(slotProps.data.image)" 
                                                    alt="Gambar Produk" 
                                                    style="height: 40px; max-width: 80px; object-fit: contain; cursor: pointer;" 
                                                    @error="(e) => handleImageError(e, '/img/default-product-image.png')"
                                                    @click="productStore.openImageInNewTab(slotProps.data.image)"
                                                    @load="debugImageUrl(slotProps.data.image)"
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
                                    <Column field="sku" header="No. Product" :sortable="true"></Column>
                                    <Column field="name" header="Nama Product" :sortable="true"></Column>
                                    <Column field="productType" header="Jenis / Type KIT" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.productType || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="isDevice" header="Device" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.isDevice).class">
                                                {{ getStatusBadge(slotProps.data.isDevice).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="isKit" header="Kit" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.isKit).class">
                                                {{ getStatusBadge(slotProps.data.isKit).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="billingType" header="Tipe Tagihan" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.billingType === 'recurring' ? 'Recurring' : 'One Time' }}
                                        </template>
                                    </Column>
                                    <Column field="condition" header="Condition" :sortable="true">
                                        <template #body="slotProps">
                                            {{
                                              slotProps.data.condition === 'good'
                                                ? 'Good'
                                                : slotProps.data.condition === 'bad'
                                                  ? 'Bad'
                                                  : slotProps.data.condition === 'reject'
                                                    ? 'Reject'
                                                    : slotProps.data.condition === 'damaged'
                                                      ? 'Damaged'
                                                      : '-'
                                            }}
                                        </template>
                                    </Column>
                                    <Column header="Kategori" field="category.name" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.category && slotProps.data.category.name ? slotProps.data.category.name : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="createdByUser.fullName" header="Dibuat Oleh" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.createdByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('edit_product'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="productStore.openModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('delete_product'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="productStore.deleteProduct(slotProps.data.id)">
                                                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </Column>
                                    <template #expansion="slotProps">
                                        <div class="p-3 bg-light">
                                            <h6 class="mb-3">Komponen Kit</h6>
                                            <div v-if="slotProps.data.isKit && slotProps.data.productKits?.length">
                                                <div class="table-responsive">
                                                    <table class="table table-sm table-bordered mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th style="width: 60px">#</th>
                                                                <th>Name</th>
                                                                <th>Serial Number</th>
                                                                <th>Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(kit, index) in slotProps.data.productKits" :key="kit.id || `kit-${index}`">
                                                                <td>{{ index + 1 }}</td>
                                                                <td>{{ kit.name || '-' }}</td>
                                                                <td>{{ kit.serialNumber || kit.serial_number || '-' }}</td>
                                                                <td class="text-capitalize">{{ kit.type || '-' }}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div v-else class="text-muted">
                                                Product ini tidak memiliki komponen kit.
                                            </div>
                                        </div>
                                    </template>
                                </MyDataTable>
                                </div>
                            </div>
                            <!--/ product Table -->
                        </div>
                    </div>
                    <!--/ product cards -->
                </div>
            </template>
            <!-- Placeholder untuk MenuModal component -->
            <Modal 
                id="ProductModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validationErrorsFromParent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="productStore.saveProduct()">
                        <ul class="nav nav-tabs mb-4" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button
                                    class="nav-link"
                                    :class="{ active: activeProductModalTab === 'product-info' }"
                                    type="button"
                                    @click="activeProductModalTab = 'product-info'"
                                >
                                    Informasi Produk
                                </button>
                            </li>
                            <li v-if="form.isKit" class="nav-item" role="presentation">
                                <button
                                    class="nav-link"
                                    :class="{ active: activeProductModalTab === 'product-kit' }"
                                    type="button"
                                    @click="activeProductModalTab = 'product-kit'"
                                >
                                    Product Kit
                                </button>
                            </li>
                        </ul>
                        <div v-show="activeProductModalTab === 'product-info'" class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label">Part Number</label>
                                <input type="text" class="form-control" v-model="form.sku" placeholder="Masukkan part number" id="sku">
                                <div v-if="hasFieldError('sku')" class="invalid-feedback">
                                    {{ getFieldError('sku') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nama Barang</label>
                                <input type="text" class="form-control" v-model="form.name" placeholder="Masukkan nama barang" id="name" @input="form.name = $event.target.value.toUpperCase()">
                                <div v-if="hasFieldError('name')" class="invalid-feedback">
                                    {{ getFieldError('name') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Satuan</label>
                                <CustomSelect2
                                    v-model="form.unitId"
                                    :options="units"
                                    :get-option-label="option => option?.name || ''"
                                    :reduce="option => option?.id"
                                    searchable
                                    clearable
                                    placeholder="-- Pilih Satuan --"
                                    class="unit"
                                    id="unitId"
                                />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Kategori</label>
                                <CustomSelect2
                                    v-model="form.categoryId"
                                    :options="kategori"
                                    :get-option-label="option => option?.name || ''"
                                    :reduce="option => option?.id"
                                    searchable
                                    clearable
                                    placeholder="-- Pilih Kategori --"
                                    class="kategori"
                                    id="categoryId"
                                />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Jenis / Type KIT</label>
                                <input type="text" class="form-control" v-model="form.productType" placeholder="e.g. Flat Standard-V4, Standard Actuated-V3" id="productType">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Tipe Tagihan</label>
                                <CustomSelect2 v-model="form.billingType" :options="billingTypeOptions" :get-option-label="option => option.label" :reduce="option => option.value" searchable clearable :get-option-key="option => option.value" placeholder="-- Pilih Tipe Tagihan --" id="billingType" class="select-billing-type" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Condition</label>
                                <CustomSelect2 v-model="form.condition" :options="conditionOptions" :get-option-label="option => option.label" :reduce="option => option.value" searchable :clearable="false" placeholder="-- Pilih Condition --" id="condition" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Gambar</label>
                                <input type="file" class="form-control" @change="onImageChange" accept="image/*" id="image">
                                <div v-if="form.imagePreview" class="mt-2">
                                    <img :src="form.imagePreview" alt="Image Preview" class="image-preview" style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;" @error="(e) => handleImageError(e, '/img/default-product-image.png')" />
                                    <a :href="form.imagePreview" target="_blank" rel="noopener noreferrer" class="d-block mt-1">Lihat Gambar</a>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-center gap-4 mt-3 flex-wrap">
                                    <div class="form-check form-switch d-flex align-items-center mb-0">
                                        <input class="form-check-input me-2" type="checkbox" v-model="form.isDevice" />
                                        <label class="form-check-label mb-0">Is Device?</label>
                                    </div>
                                    <div class="form-check form-switch d-flex align-items-center mb-0">
                                        <input class="form-check-input me-2" type="checkbox" v-model="form.isKit" @change="onKitToggle" />
                                        <label class="form-check-label mb-0">Is Kit?</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="form.isKit && activeProductModalTab === 'product-kit'" class="mt-2">
                            <div class="alert alert-secondary mb-4">
                                Tambahkan komponen kit di bawah ini.
                            </div>
                            <div v-for="(item, index) in form.productKits" :key="`kit-${index}`" class="repeater-item mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="text-muted fw-medium">Kit Item #{{ index + 1 }}</span>
                                    <button class="btn btn-sm btn-outline-danger" @click.prevent="productStore.removeProductKit(index)" type="button">
                                        <i class="ri-delete-bin-line me-1"></i> Hapus
                                    </button>
                                </div>
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label class="form-label">Name</label>
                                        <input type="text" class="form-control" v-model="item.name" placeholder="Nama komponen kit">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Serial Number</label>
                                        <input type="text" class="form-control" v-model="item.serialNumber" placeholder="Serial number">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Type</label>
                                        <CustomSelect2
                                            v-model="item.type"
                                            :options="productKitTypeOptions"
                                            :get-option-label="option => option.label"
                                            :reduce="option => option.value"
                                            :get-option-key="option => option.value"
                                            :clearable="false"
                                            placeholder="-- Pilih Type --"
                                        />
                                    </div>
                                </div>
                                <hr class="my-4">
                            </div>
                            <button type="button" class="btn btn-outline-primary" @click="productStore.addProductKit()">
                                Tambah Item Kit
                            </button>
                        </div>
                        <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="productStore.closeModal()">Tutup</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Simpan
                            </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useProductStore } from '~/stores/product'
import { useKategoriStore } from '~/stores/kategori'
import { useUserStore } from '~/stores/user'
import { useUnitStore } from '~/stores/unit'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import 'vue-select/dist/vue-select.css'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { useFormatRupiah } from '~/composables/formatRupiah';
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()
const { getProductImage, handleImageError, debugImageUrl } = useImageUrl()

const { userHasPermission, userHasRole } = usePermissions();

const formatRupiah = useFormatRupiah()

const myDataTableRef    = ref(null)
const productStore      = useProductStore()
const kategoriStore     = useKategoriStore()
const unitStore         = useUnitStore()
const permissionStore   = usePermissionsStore()
const userStore         = useUserStore()

const { products, loading, totalRecords, totalProducts, params, form, isEditMode, showModal, validationErrors } = storeToRefs(productStore)
const { kategori } = storeToRefs(kategoriStore)
const { units } = storeToRefs(unitStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const activeProductModalTab = ref('product-info')
const expandedRows = ref({})

// Table controls state
const tableControls = ref({
    rows: 10,
    search: '',
});

const modalTitle = computed(() => isEditMode.value ? 'Edit Product' : 'Tambah Product');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data product di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan product baru.');


const billingTypeOptions = [
    { label: 'One Time', value: 'one_time' },
    { label: 'Recurring', value: 'recurring' }
];

const conditionOptions = [
    { label: 'Good', value: 'good' },
    { label: 'Bad', value: 'bad' },
    { label: 'Reject', value: 'reject' },
    { label: 'Damaged', value: 'damaged' },
];
const productKitTypeOptions = [
    { label: 'Router', value: 'router' },
    { label: 'Adaptor', value: 'adaptor' },
    { label: 'Cable', value: 'cable' },
];

const config = useRuntimeConfig();

let modalInstance = null
onMounted(() => {
    // Initialize table controls
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;
    
    productStore.fetchProducts();
    productStore.fetchTotalProducts();
    kategoriStore.fetchKategori();
    unitStore.fetchUnit();
    permissionStore.fetchPermissions()
    userStore.loadUser()
    const modalElement = document.getElementById('ProductModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Product', products.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        activeProductModalTab.value = 'product-info'
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const onKitToggle = () => {
    if (form.value.isKit) {
        if (!Array.isArray(form.value.productKits) || form.value.productKits.length === 0) {
            productStore.addProductKit()
        }
        activeProductModalTab.value = 'product-kit'
    } else {
        form.value.productKits = []
        activeProductModalTab.value = 'product-info'
    }
}

// Handler untuk rows change
const onProductToolbarRows = (value) => {
    tableControls.value.rows = Number(value) || 10;
    handleRowsChange(value);
};

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    productStore.fetchProducts();
};

// Handler untuk search
const handleSearch = (value) => {
    globalFilterValue.value = value;
    tableControls.value.search = value;
    params.value.first = 0;
    // Debounce akan di-handle oleh watch globalFilterValue
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

const debouncedSearch = useDebounceFn(() => {
    productStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch);

const onPage = (event) => productStore.setPagination(event);

const onSort = (event) => productStore.setSort(event);
const onRowToggle = (event) => {
    expandedRows.value = event.data;
};

const exportData = async (format) => {
    const toast     = useToast();
    try {
        if (format === 'csv') {
            myDataTableRef.value.exportCSV({
                title: 'Data Produk',
                border: true
            });
        } else if (format === 'excel') {
            // Ambil data dari API untuk export Excel
            const exportResult = await productStore.fetchProductsForExport();
            myDataTableRef.value.exportExcel({
                title: `Data Produk ${exportResult.nmPerusahaan}`,
                data: exportResult.data
            });
        } else if (format === 'pdf') {
            // Implement PDF export if needed
        }
    } catch (error) {
        console.error('Export error:', error);
        toast.error({
          title: 'Error',
          message: 'Gagal melakukan export data',
          color: 'red',
          position: 'topRight',
        });
    }
};

function onImageChange(e) {
  const file = e.target.files[0];
  if (file) {
    productStore.handleImageChange(file);
  }
}

const getStatusBadge = (status) => {
    switch (status) {
        case true:
            return { text: 'Ya', class: 'badge rounded-pill bg-label-primary' };
        case false:
            return { text: 'Tidak', class: 'badge rounded-pill bg-label-danger' };
        default:
            return { text: '-', class: 'badge rounded-pill bg-label-light' };
    }
};

// Helper function to check if field has validation error
const hasFieldError = (fieldName) => {
    if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false;
    return validationErrors.value.some(error => {
        if (typeof error === 'string') return false;
        return error.field === fieldName || error.rule === fieldName;
    });
};

// Helper function to get field error message
const getFieldError = (fieldName) => {
    if (!validationErrors.value || !Array.isArray(validationErrors.value)) return '';
    const error = validationErrors.value.find(error => {
        if (typeof error === 'string') return false;
        return error.field === fieldName || error.rule === fieldName;
    });
    return error ? error.message : '';
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Product',
  description: 'Product Management',
  keywords: 'Product, Inventory, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>

<style scoped>
/* Form styling */
.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #696cff;
  box-shadow: 0 0 0 0.2rem rgba(105, 108, 255, 0.25);
  outline: 0;
}

/* Image preview styling */
.image-preview {
  transition: all 0.3s ease;
}

.image-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

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
