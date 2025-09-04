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
                                <p class="mb-0">PPN</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-percent-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ ppnTaxCount }}</h5>
                                    <span class="text-muted">Pajak PPN</span>
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
                                <p class="mb-0">PPh</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-percent-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ pphTaxCount }}</h5>
                                    <span class="text-muted">Pajak PPh</span>
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
                                <p class="mb-0">Lainnya</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-secondary">
                                        <i class="ri-percent-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="tax-heading">
                                    <h5 class="mb-1">{{ lainnyaTaxCount }}</h5>
                                    <span class="text-muted">Pajak Lainnya</span>
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
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Daftar Pajak</h4>
                    <p class="mb-0">Kelola semua pajak dalam sistem.</p>
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
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari kode, nama, tipe..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="taxes"
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
                                <Column field="code" header="Kode Pajak" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.code }}</span>
                                    </template>
                                </Column>
                                <Column field="name" header="Nama Pajak" :sortable="true" style="min-width:200px">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="fw-semibold">{{ slotProps.data.name }}</div>
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
                                <Column field="isActive" header="Status" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span :class="slotProps.data.isActive ? 'badge bg-label-success' : 'badge bg-label-danger'">
                                            {{ slotProps.data.isActive ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="createdByUser.fullName" header="Dibuat Oleh" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="text-muted">{{ slotProps.data.createdByUser?.fullName || '-' }}</span>
                                    </template>
                                </Column>
                                <Column field="createdAt" header="Tanggal Dibuat" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span>{{ formatDate(slotProps.data.createdAt) }}</span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
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
                                    placeholder="Masukkan tarif pajak"
                                    :step="0.01"
                                    :min="0"
                                    required
                                >
                                <label>Tarif *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check form-switch">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    v-model="form.isActive"
                                    id="isActive"
                                >
                                <label class="form-check-label" for="isActive">
                                    Pajak Aktif
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTaxStore } from '~/stores/taxes'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

const { setListTitle, setFormTitle } = useDynamicTitle()

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

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions();

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
const activeTaxCount = computed(() => taxes.value.filter(tax => tax.isActive).length)
const ppnTaxCount = computed(() => taxes.value.filter(tax => tax.type === 'ppn').length)
const pphTaxCount = computed(() => taxes.value.filter(tax => tax.type === 'pph').length)
const lainnyaTaxCount = computed(() => taxes.value.filter(tax => tax.type === 'lainnya').length)

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Pajak' : 'Tambah Pajak Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data pajak di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan pajak baru.')

// Methods
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID')
}

const getTypeBadgeClass = (type) => {
    const classes = {
        ppn: 'badge bg-label-primary',
        pph: 'badge bg-label-warning',
        lainnya: 'badge bg-label-secondary'
    }
    return classes[type] || 'badge bg-label-secondary'
}

const getTypeLabel = (type) => {
    const labels = {
        ppn: 'PPN',
        pph: 'PPh',
        lainnya: 'Lainnya'
    }
    return labels[type] || type
}

const formatRate = (rate, type) => {
    return `${rate}%`
}

const openTaxDetails = (taxId) => {
    router.push({ path: `/accounting/taxes/detail`, query: { id: taxId } })
}

const exportData = (format) => {
    if (format === 'csv') {
        myDataTableRef.value.exportCSV()
    }
}

// Modal instance variable
let modalInstance = null
onMounted(async () => {
    try {
        await permissionStore.fetchPermissions()
        await userStore.loadUser()
        if (taxStore.taxes.length === 0) {
            await taxStore.fetchTaxes()
        }
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
    setListTitle('Taxes', taxes.value.length)
})

// Watchers
watch(showModal, (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('TaxModal')
            if (modalElement && !modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement)
            }
            modalInstance?.show()
        })
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
    taxStore.params.rows = rowsValue
    taxStore.params.first = 0
    await taxStore.fetchTaxes()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    taxStore.params.first = 0
    await taxStore.fetchTaxes()
}

const onSort = (event) => taxStore.setSort(event)
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
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