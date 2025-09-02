<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Aset Tetap</h4>
            <p class="mb-6">
                Kelola aset tetap dan perhitungan penyusutan
            </p>

            <!-- Asset Statistics Cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Aset</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-building-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="asset-heading">
                                    <h5 class="mb-1">{{ assets.length }}</h5>
                                    <span class="text-muted">Aset Terdaftar</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Nilai</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="asset-heading">
                                    <h5 class="mb-1">{{ formatRupiah(totalValue) }}</h5>
                                    <span class="text-muted">Nilai Aset</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Aset Aktif</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-check-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="asset-heading">
                                    <h5 class="mb-1">{{ activeAssetCount }}</h5>
                                    <span class="text-muted">Aset Aktif</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Penyusutan</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-calculator-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="asset-heading">
                                    <h5 class="mb-1">{{ formatRupiah(totalDepreciation) }}</h5>
                                    <span class="text-muted">Akumulasi Penyusutan</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Asset Table -->
            <div class="card">
                <div class="card-header border-bottom">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Daftar Aset Tetap</h5>
                        <small class="text-muted">Kelola semua aset tetap dalam sistem</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-4 text-muted">
                            <small>Menampilkan {{ totalRecords }} dari {{ assets.length }} aset</small>
                        </div>
                        <div class="col-md-4 d-flex justify-content-end">
                            <div class="d-flex gap-2">
                                <button 
                                    v-if="userHasRole('superadmin') || userHasPermission('create_asset')"
                                    @click="assetStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Aset
                                </button>
                                <button @click="exportData('csv')" class="btn btn-outline-secondary">
                                    <i class="ri-download-line me-1"></i>
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-datatable table-responsive">
                    <MyDataTable
                        ref="myDataTableRef"
                        :value="assets"
                        :loading="loading"
                        :total-records="totalRecords"
                        :lazy="true"
                        :paginator="true"
                        :rows="params.rows"
                        :rows-per-page-options="rowsPerPageOptionsArray"
                        :global-filter="globalFilterValue"
                        :global-filter-fields="['name', 'code', 'category', 'location']"
                        :sort-field="params.sortField"
                        :sort-order="params.sortOrder"
                        @page="onPage"
                        @sort="onSort"
                        @filter="handleSearch"
                        @rows-change="handleRowsChange"
                        striped-rows
                        show-gridlines
                        hover
                        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} aset"
                        responsive-layout="scroll"
                        class="p-datatable-sm"
                    >
                        <Column field="code" header="Kode Aset" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold">{{ slotProps.data.code }}</span>
                            </template>
                        </Column>
                        <Column field="name" header="Nama Aset" :sortable="true" style="min-width:200px">
                            <template #body="slotProps">
                                <div>
                                    <div class="fw-semibold">{{ slotProps.data.name }}</div>
                                    <small class="text-muted" v-if="slotProps.data.description">
                                        {{ slotProps.data.description }}
                                    </small>
                                </div>
                            </template>
                        </Column>
                        <Column field="category" header="Kategori" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="badge bg-label-secondary">{{ getCategoryLabel(slotProps.data.category) }}</span>
                            </template>
                        </Column>
                        <Column field="purchase_date" header="Tanggal Beli" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span>{{ formatDate(slotProps.data.purchase_date) }}</span>
                            </template>
                        </Column>
                        <Column field="purchase_cost" header="Nilai Beli" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold">
                                    {{ formatRupiah(slotProps.data.purchase_cost || 0) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="current_value" header="Nilai Sekarang" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold text-success">
                                    {{ formatRupiah(slotProps.data.current_value || 0) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="location" header="Lokasi" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="text-muted">{{ slotProps.data.location }}</span>
                            </template>
                        </Column>
                        <Column field="status" header="Status" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span :class="getStatusBadgeClass(slotProps.data.status)">
                                    {{ getStatusLabel(slotProps.data.status) }}
                                </span>
                            </template>
                        </Column>
                        <Column header="Actions" :exportable="false" style="min-width:8rem">
                            <template #body="slotProps">
                                <div class="d-inline-block">
                                    <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                        <i class="ri-more-2-fill"></i>
                                    </a>
                                    <ul class="dropdown-menu">
                                        <li v-if="userHasRole('superadmin') || userHasPermission('view_asset')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="openAssetDetails(slotProps.data.id)">
                                                <i class="ri-eye-line me-2"></i> Lihat Detail
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_asset')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="assetStore.openModal(slotProps.data)">
                                                <i class="ri-edit-box-line me-2"></i> Edit
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_asset')">
                                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="assetStore.deleteAsset(slotProps.data.id)">
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

        <!-- Asset Modal -->
        <Modal 
            id="AssetModal"
            :title="modalTitle" 
            :description="modalDescription"
            :validation-errors-from-parent="validationErrors"
        >
            <template #default>
                <form @submit.prevent="assetStore.saveAsset()">
                    <div class="row g-6">
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.code" 
                                    placeholder="Masukkan kode aset"
                                    required
                                >
                                <label>Kode Aset *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.name" 
                                    placeholder="Masukkan nama aset"
                                    required
                                >
                                <label>Nama Aset *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.category"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option v-for="category in assetCategories" :key="category.value" :value="category.value">
                                        {{ category.label }}
                                    </option>
                                </select>
                                <label>Kategori *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="date" 
                                    class="form-control" 
                                    v-model="form.purchase_date" 
                                    required
                                >
                                <label>Tanggal Pembelian *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.purchase_cost" 
                                    placeholder="Masukkan nilai pembelian"
                                    step="0.01"
                                    min="0"
                                    @input="assetStore.calculateDepreciation()"
                                    required
                                >
                                <label>Nilai Pembelian *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.salvage_value" 
                                    placeholder="Masukkan nilai sisa"
                                    step="0.01"
                                    min="0"
                                    @input="assetStore.calculateDepreciation()"
                                    required
                                >
                                <label>Nilai Sisa *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.depreciation_method"
                                    @change="assetStore.calculateDepreciation()"
                                    required
                                >
                                    <option value="">Pilih Metode Penyusutan</option>
                                    <option v-for="method in depreciationMethods" :key="method.value" :value="method.value">
                                        {{ method.label }}
                                    </option>
                                </select>
                                <label>Metode Penyusutan *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.useful_life" 
                                    placeholder="Masukkan umur ekonomis"
                                    min="1"
                                    @input="assetStore.calculateDepreciation()"
                                    required
                                >
                                <label>Umur Ekonomis (Tahun) *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.current_value" 
                                    placeholder="Nilai sekarang"
                                    step="0.01"
                                    min="0"
                                    readonly
                                >
                                <label>Nilai Sekarang</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.location" 
                                    placeholder="Masukkan lokasi aset"
                                    required
                                >
                                <label>Lokasi *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.status"
                                    required
                                >
                                    <option value="">Pilih Status</option>
                                    <option v-for="status in assetStatuses" :key="status.value" :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>
                                <label>Status *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.serial_number" 
                                    placeholder="Masukkan nomor seri"
                                >
                                <label>Nomor Seri</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="date" 
                                    class="form-control" 
                                    v-model="form.warranty_expiry" 
                                >
                                <label>Tanggal Berakhir Garansi</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.supplier" 
                                    placeholder="Masukkan nama supplier"
                                >
                                <label>Supplier</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="form-floating form-floating-outline">
                                <textarea
                                    class="form-control h-px-100"
                                    placeholder="Deskripsi aset"
                                    v-model="form.description">
                                </textarea>
                                <label>Deskripsi</label>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="assetStore.closeModal()">
                            Batal
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                            {{ isEditMode ? 'Update' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetStore } from '~/stores/assets'
import { useUserStore } from '~/stores/user'
import { usePermissionStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { formatRupiah } from '~/composables/formatRupiah'

// Page meta
definePageMeta({
    title: 'Aset Tetap',
    description: 'Kelola aset tetap dan perhitungan penyusutan'
})

// Stores
const assetStore = useAssetStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

// Computed
const assets = computed(() => assetStore.assets)
const loading = computed(() => assetStore.loading)
const totalRecords = computed(() => assetStore.totalRecords)
const params = computed(() => assetStore.params)
const form = computed(() => assetStore.form)
const isEditMode = computed(() => assetStore.isEditMode)
const showModal = computed(() => assetStore.showModal)
const validationErrors = computed(() => assetStore.validationErrors)
const assetCategories = computed(() => assetStore.assetCategories)
const depreciationMethods = computed(() => assetStore.depreciationMethods)
const assetStatuses = computed(() => assetStore.assetStatuses)

// Statistics
const totalValue = computed(() => assets.value.reduce((sum, asset) => sum + (asset.current_value || 0), 0))
const activeAssetCount = computed(() => assets.value.filter(asset => asset.status === 'active').length)
const totalDepreciation = computed(() => assets.value.reduce((sum, asset) => sum + ((asset.purchase_cost || 0) - (asset.current_value || 0)), 0))

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Aset' : 'Tambah Aset Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data aset di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan aset baru.')

// Methods
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID')
}

const getCategoryLabel = (category) => {
    const labels = {
        land: 'Tanah',
        building: 'Bangunan',
        vehicle: 'Kendaraan',
        equipment: 'Peralatan',
        furniture: 'Furnitur',
        computer: 'Komputer',
        software: 'Software',
        intangible: 'Aset Tidak Berwujud',
        other: 'Lainnya'
    }
    return labels[category] || category
}

const getStatusLabel = (status) => {
    const labels = {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        sold: 'Terjual',
        disposed: 'Dibuang'
    }
    return labels[status] || status
}

const getStatusBadgeClass = (status) => {
    const classes = {
        active: 'badge bg-label-success',
        inactive: 'badge bg-label-warning',
        sold: 'badge bg-label-info',
        disposed: 'badge bg-label-danger'
    }
    return classes[status] || 'badge bg-label-secondary'
}

const openAssetDetails = (assetId) => {
    router.push({ path: `/accounting/assets/detail`, query: { id: assetId } })
}

const exportData = (format) => {
    if (format === 'csv') {
        myDataTableRef.value.exportCSV()
    }
}

// Permission helpers
const userHasRole = (role) => userStore.user?.roles?.some(r => r.name === role) || false
const userHasPermission = (permission) => permissionStore.hasPermission(permission)

// Lifecycle
let modalInstance = null
onMounted(() => {
    permissionStore.fetchPermissions()
    userStore.loadUser()
    if (assetStore.assets.length === 0) {
        assetStore.fetchAssets()
    }
    
    const modalElement = document.getElementById('AssetModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
})

// Watchers
watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    assetStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => assetStore.setPagination(event)

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    assetStore.fetchAssets()
}

const handleSearch = (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    assetStore.fetchAssets()
}

const onSort = (event) => assetStore.setSort(event)
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}
</style>