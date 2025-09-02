<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Daftar Pajak</h4>
            <p class="mb-6">
                Kelola daftar pajak yang digunakan dalam transaksi
            </p>

            <!-- Tax Statistics Cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Pajak</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-percent-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ taxes.length }}</h5>
                                    <span class="text-muted">Pajak Terdaftar</span>
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
                                <p class="mb-0">Pajak Aktif</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-check-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ activeTaxCount }}</h5>
                                    <span class="text-muted">Pajak Aktif</span>
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
                                <p class="mb-0">Persentase</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-percent-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ percentageTaxCount }}</h5>
                                    <span class="text-muted">Pajak Persentase</span>
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
                                <p class="mb-0">Nominal Tetap</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ fixedTaxCount }}</h5>
                                    <span class="text-muted">Pajak Nominal</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tax Table -->
            <div class="card">
                <div class="card-header border-bottom">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Daftar Pajak</h5>
                        <small class="text-muted">Kelola semua pajak dalam sistem</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-4 text-muted">
                            <small>Menampilkan {{ totalRecords }} dari {{ taxes.length }} pajak</small>
                        </div>
                        <div class="col-md-4 d-flex justify-content-end">
                            <div class="d-flex gap-2">
                                <button 
                                    v-if="userHasRole('superadmin') || userHasPermission('create_tax')"
                                    @click="taxStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Pajak
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
                        :value="taxes"
                        :loading="loading"
                        :total-records="totalRecords"
                        :lazy="true"
                        :paginator="true"
                        :rows="params.rows"
                        :rows-per-page-options="rowsPerPageOptionsArray"
                        :global-filter="globalFilterValue"
                        :global-filter-fields="['name', 'code', 'type']"
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
                        current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} pajak"
                        responsive-layout="scroll"
                        class="p-datatable-sm"
                    >
                        <Column field="code" header="Kode Pajak" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold">{{ slotProps.data.code }}</span>
                            </template>
                        </Column>
                        <Column field="name" header="Nama Pajak" :sortable="true" style="min-width:200px">
                            <template #body="slotProps">
                                <div>
                                    <div class="fw-semibold">{{ slotProps.data.name }}</div>
                                    <small class="text-muted" v-if="slotProps.data.description">
                                        {{ slotProps.data.description }}
                                    </small>
                                </div>
                            </template>
                        </Column>
                        <Column field="type" header="Tipe" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span :class="getTypeBadgeClass(slotProps.data.type)">
                                    {{ getTypeLabel(slotProps.data.type) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="rate" header="Tarif" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold">
                                    {{ formatRate(slotProps.data.rate, slotProps.data.type) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="is_default" header="Default" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span v-if="slotProps.data.is_default" class="badge bg-label-primary">
                                    Default
                                </span>
                                <span v-else class="text-muted">-</span>
                            </template>
                        </Column>
                        <Column field="is_active" header="Status" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span :class="slotProps.data.is_active ? 'badge bg-label-success' : 'badge bg-label-danger'">
                                    {{ slotProps.data.is_active ? 'Aktif' : 'Nonaktif' }}
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
                                        <li v-if="userHasRole('superadmin') || userHasPermission('view_tax')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="openTaxDetails(slotProps.data.id)">
                                                <i class="ri-eye-line me-2"></i> Lihat Detail
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_tax')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="taxStore.openModal(slotProps.data)">
                                                <i class="ri-edit-box-line me-2"></i> Edit
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_tax')">
                                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="taxStore.deleteTax(slotProps.data.id)">
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

        <!-- Tax Modal -->
        <Modal 
            id="TaxModal"
            :title="modalTitle" 
            :description="modalDescription"
            :validation-errors-from-parent="validationErrors"
        >
            <template #default>
                <form @submit.prevent="taxStore.saveTax()">
                    <div class="row g-6">
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.code" 
                                    placeholder="Masukkan kode pajak"
                                    required
                                >
                                <label>Kode Pajak *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.name" 
                                    placeholder="Masukkan nama pajak"
                                    required
                                >
                                <label>Nama Pajak *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.type"
                                    required
                                >
                                    <option value="">Pilih Tipe Pajak</option>
                                    <option v-for="type in taxTypes" :key="type.value" :value="type.value">
                                        {{ type.label }}
                                    </option>
                                </select>
                                <label>Tipe Pajak *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.rate" 
                                    :placeholder="form.type === 'percentage' ? 'Masukkan persentase' : 'Masukkan nominal'"
                                    :step="form.type === 'percentage' ? '0.01' : '1'"
                                    :min="0"
                                    required
                                >
                                <label>Tarif *</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="form-floating form-floating-outline">
                                <textarea
                                    class="form-control h-px-100"
                                    placeholder="Deskripsi pajak"
                                    v-model="form.description">
                                </textarea>
                                <label>Deskripsi</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check form-switch">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    v-model="form.is_active"
                                    id="isActive"
                                >
                                <label class="form-check-label" for="isActive">
                                    Pajak Aktif
                                </label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check form-switch">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    v-model="form.is_default"
                                    id="isDefault"
                                >
                                <label class="form-check-label" for="isDefault">
                                    Pajak Default
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="taxStore.closeModal()">
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
import { useTaxStore } from '~/stores/taxes'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'

// Page meta
definePageMeta({
    title: 'Daftar Pajak',
    description: 'Kelola daftar pajak yang digunakan dalam transaksi'
})

// Stores
const taxStore = useTaxStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

// Computed
const taxes = computed(() => taxStore.taxes)
const loading = computed(() => taxStore.loading)
const totalRecords = computed(() => taxStore.totalRecords)
const params = computed(() => taxStore.params)
const form = computed(() => taxStore.form)
const isEditMode = computed(() => taxStore.isEditMode)
const showModal = computed(() => taxStore.showModal)
const validationErrors = computed(() => taxStore.validationErrors)
const taxTypes = computed(() => taxStore.taxTypes)

// Statistics
const activeTaxCount = computed(() => taxes.value.filter(tax => tax.is_active).length)
const percentageTaxCount = computed(() => taxes.value.filter(tax => tax.type === 'percentage').length)
const fixedTaxCount = computed(() => taxes.value.filter(tax => tax.type === 'fixed').length)

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Pajak' : 'Tambah Pajak Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data pajak di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan pajak baru.')

// Methods
const getTypeBadgeClass = (type) => {
    const classes = {
        percentage: 'badge bg-label-primary',
        fixed: 'badge bg-label-warning'
    }
    return classes[type] || 'badge bg-label-secondary'
}

const getTypeLabel = (type) => {
    const labels = {
        percentage: 'Persentase',
        fixed: 'Nominal Tetap'
    }
    return labels[type] || type
}

const formatRate = (rate, type) => {
    if (type === 'percentage') {
        return `${rate}%`
    } else {
        return formatRupiah(rate)
    }
}

const openTaxDetails = (taxId) => {
    router.push({ path: `/accounting/taxes/detail`, query: { id: taxId } })
}

const exportData = (format) => {
    if (format === 'csv') {
        myDataTableRef.value.exportCSV()
    }
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions();

// Lifecycle
let modalInstance = null
onMounted(async () => {
    permissionStore.fetchPermissions()
    userStore.loadUser()
    if (taxStore.taxes.length === 0) {
        await taxStore.fetchTaxes()
    }
    
    const modalElement = document.getElementById('TaxModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
})

// Watchers
watch(showModal, async (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    taxStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => taxStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    taxStore.fetchTaxes()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    await taxStore.fetchTaxes()
}

const onSort = (event) => taxStore.setSort(event)
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}
</style>