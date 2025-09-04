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
                <div class="col-xl-3 col-lg-6 col-md-6" v-if="loading">
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-else>
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-if="loading">
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-else>
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-if="loading">
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-else>
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-if="loading">
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
                <div class="col-xl-3 col-lg-6 col-md-6" v-else>
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
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Daftar Aset Tetap</h4>
                    <p class="mb-0">Kelola semua aset tetap dalam sistem.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                            </div>
                            <div class="d-flex align-items-center gap-2">
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
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari kode, nama, kategori, lokasi..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="assets"
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
                                        {{
                                            (Number(params.first) || 0) + (Number(slotProps.index) || 0) + 1
                                        }}
                                    </template>
                                </Column>
                                <Column field="assetCode" header="Kode Aset" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.assetCode || slotProps.data.asset_code }}</span>
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
                                <Column field="acquisitionDate" header="Tanggal Beli" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span>{{ formatDate(slotProps.data.acquisitionDate) }}</span>
                                    </template>
                                </Column>
                                <Column field="acquisitionCost" header="Nilai Beli" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">
                                            {{ formatRupiah(slotProps.data.acquisitionCost || 0) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="residualValue" header="Nilai Sisa" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">
                                            {{ formatRupiah(slotProps.data.residualValue || 0) }}
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
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
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
                            <v-select 
                                v-model="form.perusahaanId" 
                                :options="perusahaans" 
                                label="nmPerusahaan" 
                                :reduce="p => p.id" 
                                placeholder="Pilih Perusahaan" 
                                class="v-select-style"
                                required
                            />
                        </div>
                        <div class="col-md-6">
                            <v-select 
                                v-model="form.cabangId" 
                                :options="filteredCabangs" 
                                label="nmCabang" 
                                :reduce="c => c.id" 
                                placeholder="Pilih Cabang" 
                                class="v-select-style"
                                :disabled="!form.perusahaanId"
                                required
                            />
                        </div>
                        <div class="col-md-3">
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
                        <div class="col-md-3">
                            <v-select 
                                v-model="form.vendorId" 
                                :options="vendors" 
                                label="name" 
                                :reduce="v => v.id" 
                                placeholder="Pilih Vendor" 
                                class="v-select-style"
                            />
                        </div>
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.category" 
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="computer">Computer</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="furniture">Furniture</option>
                                    <option value="building">Building</option>
                                    <option value="land">Land</option>
                                    <option value="other">Other</option>
                                </select>
                                <label>Kategori *</label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="date" 
                                    class="form-control" 
                                    v-model="form.acquisitionDate" 
                                    required
                                >
                                <label>Tanggal Pembelian *</label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    :value="formatRupiah(form.acquisitionCost || 0)"
                                    @input="onAcquisitionCostInput"
                                    placeholder="Masukkan nilai pembelian"
                                    required
                                >
                                <label>Nilai Pembelian *</label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    :value="formatRupiah(form.residualValue || 0)"
                                    @input="onResidualValueInput"
                                    placeholder="Masukkan nilai sisa"
                                    required
                                >
                                <label>Nilai Sisa *</label>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.depreciationMethod"
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
                                    v-model="form.usefulLife" 
                                    placeholder="Masukkan umur ekonomis"
                                    min="1"
                                    required
                                >
                                <label>Umur Ekonomis (Tahun) *</label>
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
                        <div class="col-md-3">
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
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.serialNumber" 
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
                                    v-model="form.warrantyExpiry" 
                                >
                                <label>Tanggal Berakhir Garansi</label>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetStore } from '~/stores/assets'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useVendorStore } from '~/stores/vendor'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import vSelect from 'vue-select'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import 'vue-select/dist/vue-select.css'

const { setListTitle, setFormTitle } = useDynamicTitle()

// Components
const components = {
    vSelect
}

// Stores
const assetStore = useAssetStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const perusahaanStore = usePerusahaanStore()
const cabangStore = useCabangStore()
const vendorStore = useVendorStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')
const assetsSummary = ref(null)

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions();

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
const perusahaans = computed(() => perusahaanStore.perusahaans)
const cabangs = computed(() => cabangStore.cabangs)
const vendors = computed(() => vendorStore.vendors)

// Computed untuk filtered cabang berdasarkan perusahaan
const filteredCabangs = computed(() => {
    if (!form.value.perusahaanId || !cabangs.value) return [];
    return cabangs.value.filter(c => c.perusahaanId === form.value.perusahaanId);
});

// Statistics
const totalValue = computed(() => {
  // Gunakan data dari summary API jika tersedia, jika tidak gunakan fallback
  if (assetsSummary.value?.totalValue) {
    return assetsSummary.value.totalValue
  }
  // Fallback: hitung dari data yang ada (tidak akurat karena pagination)
  return assets.value.reduce((sum, asset) => sum + (asset.acquisitionCost || 0), 0)
})

const activeAssetCount = computed(() => {
  // Gunakan data dari summary API jika tersedia, jika tidak gunakan fallback
  if (assetsSummary.value?.activeAssets !== undefined) {
    return assetsSummary.value.activeAssets
  }
  // Fallback: hitung dari data yang ada
  return assets.value.filter(asset => asset.status === 'active').length
})

const totalDepreciation = computed(() => {
  // Hitung dari data yang ada (tidak akurat karena pagination)
  return assets.value.reduce((sum, asset) => sum + ((asset.acquisitionCost || 0) - (asset.residualValue || 0)), 0)
})

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
        'active': 'Aktif',
        'inactive': 'Tidak Aktif',
        'sold': 'Terjual',
        'trashed': 'Dibuang',
    }
    return labels[status] || status
}

const getStatusBadgeClass = (status) => {
    const classes = {
        'active': 'badge bg-label-success',
        'inactive': 'badge bg-label-warning',
        'sold': 'badge bg-label-info',
        'trashed': 'badge bg-label-danger',
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

const fetchAssetsSummary = async () => {
  try {
    const { $api } = useNuxtApp()
    const token = localStorage.getItem('token')
    
    const response = await fetch($api.assetsSummary(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include'
    })

    if (response.ok) {
      const result = await response.json()
      // Simpan ke state lokal
      assetsSummary.value = result.data
    }
  } catch (error) {
    console.error('Error fetching assets summary:', error)
  }
}

// Modal instance variable (sama seperti halaman accounts)
let modalInstance = null
onMounted(async () => {
    try {
        await permissionStore.fetchPermissions()
        await userStore.loadUser()
        await perusahaanStore.fetchPerusahaans()
        await cabangStore.fetchCabangs()
        await vendorStore.fetchVendors()
        if (assetStore.assets.length === 0) {
            await assetStore.fetchAssets()
        }
        // Fetch summary data untuk statistics yang akurat
        await fetchAssetsSummary()
        

    } catch (error) {
        console.error('Error in onMounted:', error)
    }
    setListTitle('Aset Tetap', assets.value.length)
})

// Watchers (persis sama dengan halaman accounts)
watch(showModal, (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('AssetModal')
            if (modalElement && !modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement)
            }
            modalInstance?.show()
        })
    } else {
        modalInstance?.hide()
    }
})

// Watcher untuk perusahaan_id agar cabang_id di-reset saat berubah
watch(() => form.value.perusahaanId, (newPerusahaanId, oldPerusahaanId) => {
    if (oldPerusahaanId && newPerusahaanId !== oldPerusahaanId && !isEditMode.value) {
        form.value.cabangId = null;
    }
});

const debouncedSearch = useDebounceFn(() => {
    assetStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => assetStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    assetStore.params.rows = rowsValue
    assetStore.params.first = 0
    await assetStore.fetchAssets()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    assetStore.params.first = 0
    await assetStore.fetchAssets()
}

const onSort = (event) => assetStore.setSort(event)

// Input handlers for formatted values
const onAcquisitionCostInput = (event) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    assetStore.setAcquisitionCost(value);
};

const onResidualValueInput = (event) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    assetStore.setResidualValue(value);
};


</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}

.v-select-style {
    min-height: 48px;
}

:deep(.v-select-style .vs__dropdown-toggle),
:deep(.perusahaan .vs__dropdown-toggle),
:deep(.status .vs__dropdown-toggle),
:deep(.customer .vs__dropdown-toggle),
:deep(.product-select .vs__dropdown-toggle),
:deep(.cabang .vs__dropdown-toggle) {
    height: 48px !important;
    border-radius: 7px;
}

/* ✅ NEW: Limit dropdown height dan tambahkan scroll */
:deep(.v-select-style .vs__dropdown-menu) {
    max-height: 300px !important;
    overflow-y: auto !important;
}

/* ✅ NEW: Styling untuk option dalam dropdown */
:deep(.v-select-style .vs__dropdown-option) {
    padding: 8px 12px !important;
    border-bottom: 1px solid #f0f0f0 !important;
}

:deep(.v-select-style .vs__dropdown-option:hover) {
    background-color: #f8f9fa !important;
}

:deep(.v-select-style .vs__dropdown-option--highlight) {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
}

/* ✅ NEW: Styling untuk search input dalam dropdown */
:deep(.v-select-style .vs__search) {
    padding: 8px 12px !important;
    font-size: 14px !important;
    border: none !important;
    outline: none !important;
    background: transparent !important;
}

/* ✅ NEW: Styling untuk loading state */
:deep(.v-select-style .vs__spinner) {
    border-color: #1976d2 !important;
    border-top-color: transparent !important;
}

/* ✅ NEW: Styling untuk no options message */
:deep(.v-select-style .vs__no-options) {
    padding: 12px !important;
    text-align: center !important;
    color: #6c757d !important;
    font-style: italic !important;
}

/* ✅ NEW: Styling untuk selected option */
:deep(.v-select-style .vs__selected) {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    border: 1px solid #1976d2 !important;
    border-radius: 4px !important;
    padding: 2px 6px !important;
    margin: 2px !important;
}

/* ✅ NEW: Animasi loading untuk spinner */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

:deep(.v-select-style .vs__spinner) {
    animation: spin 1s linear infinite !important;
}

/* ✅ NEW: Styling untuk option yang sedang dipilih */
:deep(.v-select-style .vs__dropdown-option--selected) {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    font-weight: 600 !important;
}

/* ✅ NEW: Styling untuk tombol clear */
:deep(.v-select-style .vs__clear) {
    color: #6c757d !important;
    font-size: 16px !important;
    padding: 4px !important;
    margin-right: 8px !important;
    display: block !important;
    visibility: visible !important;
}

:deep(.v-select-style .vs__clear:hover) {
    color: #dc3545 !important;
}

/* ✅ NEW: Styling untuk tombol dropdown */
:deep(.v-select-style .vs__open-indicator) {
    color: #6c757d !important;
    margin-right: 8px !important;
}

/* ✅ NEW: Memastikan tombol clear muncul saat ada value */
:deep(.v-select-style.vs--has-value .vs__clear) {
    display: block !important;
    visibility: visible !important;
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
    z-index: 1000 !important;
    border: 1px solid #ddd !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

/* ✅ NEW: Styling untuk option yang sedang difilter */
:deep(.v-select-style .vs__dropdown-option--highlight) {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    font-weight: 600 !important;
}

/* Responsive design */
@media (max-width: 768px) {
    .v-select-style {
        min-height: 44px;
    }
    
    :deep(.v-select-style .vs__dropdown-toggle) {
        height: 44px !important;
    }
}

/* Skeleton Loader */
.skeleton-loader {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Dark mode skeleton */
:deep(.dark) .skeleton-loader {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
}
</style>