<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Jurnal Umum</h4>
            <p class="mb-6">
                Kelola jurnal umum untuk pencatatan transaksi akuntansi
            </p>

            <!-- Journal Statistics Cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Jurnal</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-file-text-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="journal-heading">
                                    <h5 class="mb-1">{{ journals.length }}</h5>
                                    <span class="text-muted">Jurnal Terdaftar</span>
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
                                <p class="mb-0">Draft</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-file-text-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="journal-heading">
                                    <h5 class="mb-1">{{ draftCount }}</h5>
                                    <span class="text-muted">Jurnal Draft</span>
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
                                <p class="mb-0">Posted</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-check-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="journal-heading">
                                    <h5 class="mb-1">{{ postedCount }}</h5>
                                    <span class="text-muted">Jurnal Posted</span>
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
                                <p class="mb-0">Total Debit</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="journal-heading">
                                    <h5 class="mb-1">{{ formatRupiah(totalDebit) }}</h5>
                                    <span class="text-muted">Total Debit</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Journal Table -->
            <div class="card">
                <div class="card-header border-bottom">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Daftar Jurnal Umum</h5>
                        <small class="text-muted">Kelola semua jurnal dalam sistem</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-4 text-muted">
                            <small>Menampilkan {{ totalRecords }} dari {{ journals.length }} jurnal</small>
                        </div>
                        <div class="col-md-4 d-flex justify-content-end">
                            <div class="d-flex gap-2">
                                <button 
                                    v-if="userHasRole('superadmin') || userHasPermission('create_journal')"
                                    @click="journalStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Jurnal
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
                        :value="journals"
                        :loading="loading"
                        :total-records="totalRecords"
                        :lazy="true"
                        :paginator="true"
                        :rows="params.rows"
                        :rows-per-page-options="rowsPerPageOptionsArray"
                        :global-filter="globalFilterValue"
                        :global-filter-fields="['reference_number', 'description']"
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
                        current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} jurnal"
                        responsive-layout="scroll"
                        class="p-datatable-sm"
                    >
                        <Column field="reference_number" header="No. Referensi" :sortable="true" style="min-width:150px">
                            <template #body="slotProps">
                                <span class="fw-semibold">{{ slotProps.data.reference_number }}</span>
                            </template>
                        </Column>
                        <Column field="date" header="Tanggal" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span>{{ formatDate(slotProps.data.date) }}</span>
                            </template>
                        </Column>
                        <Column field="description" header="Deskripsi" :sortable="true" style="min-width:200px">
                            <template #body="slotProps">
                                <div>
                                    <div class="fw-semibold">{{ slotProps.data.description }}</div>
                                    <small class="text-muted" v-if="slotProps.data.notes">
                                        {{ slotProps.data.notes }}
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
                        <Column field="total_debit" header="Total Debit" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold text-success">
                                    {{ formatRupiah(slotProps.data.total_debit || 0) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="total_credit" header="Total Credit" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold text-danger">
                                    {{ formatRupiah(slotProps.data.total_credit || 0) }}
                                </span>
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
                                        <li v-if="userHasRole('superadmin') || userHasPermission('view_journal')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="openJournalDetails(slotProps.data.id)">
                                                <i class="ri-eye-line me-2"></i> Lihat Detail
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_journal')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="journalStore.openModal(slotProps.data)">
                                                <i class="ri-edit-box-line me-2"></i> Edit
                                            </a>
                                        </li>
                                        <li v-if="(userHasRole('superadmin') || userHasPermission('post_journal')) && slotProps.data.status === 'draft'">
                                            <a class="dropdown-item text-success" href="javascript:void(0)" @click="journalStore.postJournal(slotProps.data.id)">
                                                <i class="ri-check-line me-2"></i> Post
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_journal')">
                                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="journalStore.deleteJournal(slotProps.data.id)">
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

        <!-- Journal Modal -->
        <Modal 
            id="JournalModal"
            :title="modalTitle" 
            :description="modalDescription"
            :validation-errors-from-parent="validationErrors"
        >
            <template #default>
                <form @submit.prevent="journalStore.saveJournal()">
                    <div class="row g-6">
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.reference_number" 
                                    placeholder="Masukkan nomor referensi"
                                    required
                                >
                                <label>No. Referensi *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="date" 
                                    class="form-control" 
                                    v-model="form.date" 
                                    required
                                >
                                <label>Tanggal *</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.description" 
                                    placeholder="Masukkan deskripsi jurnal"
                                    required
                                >
                                <label>Deskripsi *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.type"
                                    required
                                >
                                    <option value="">Pilih Tipe Jurnal</option>
                                    <option v-for="type in journalTypes" :key="type.value" :value="type.value">
                                        {{ type.label }}
                                    </option>
                                </select>
                                <label>Tipe Jurnal *</label>
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
                                    <option v-for="status in journalStatuses" :key="status.value" :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>
                                <label>Status *</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="form-floating form-floating-outline">
                                <textarea
                                    class="form-control h-px-100"
                                    placeholder="Catatan tambahan"
                                    v-model="form.notes">
                                </textarea>
                                <label>Catatan</label>
                            </div>
                        </div>

                        <!-- Journal Lines -->
                        <div class="col-md-12">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="mb-0">Detail Jurnal</h6>
                                <button type="button" class="btn btn-sm btn-primary" @click="journalStore.addJournalLine()">
                                    <i class="ri-add-line me-1"></i> Tambah Baris
                                </button>
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Akun</th>
                                            <th>Debit</th>
                                            <th>Credit</th>
                                            <th>Deskripsi</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(line, index) in form.journal_lines" :key="index">
                                            <td>
                                                <select 
                                                    class="form-select form-select-sm" 
                                                    v-model="line.account_id"
                                                    required
                                                >
                                                    <option value="">Pilih Akun</option>
                                                    <option v-for="account in accounts" :key="account.id" :value="account.id">
                                                        {{ account.code }} - {{ account.name }}
                                                    </option>
                                                </select>
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    class="form-control form-control-sm" 
                                                    v-model="line.debit" 
                                                    step="0.01"
                                                    min="0"
                                                    @input="journalStore.calculateTotals()"
                                                >
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    class="form-control form-control-sm" 
                                                    v-model="line.credit" 
                                                    step="0.01"
                                                    min="0"
                                                    @input="journalStore.calculateTotals()"
                                                >
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    class="form-control form-control-sm" 
                                                    v-model="line.description" 
                                                    placeholder="Deskripsi"
                                                >
                                            </td>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    class="btn btn-sm btn-danger" 
                                                    @click="journalStore.removeJournalLine(index)"
                                                >
                                                    <i class="ri-delete-bin-line"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-secondary">
                                            <td><strong>Total</strong></td>
                                            <td><strong>{{ formatRupiah(form.total_debit || 0) }}</strong></td>
                                            <td><strong>{{ formatRupiah(form.total_credit || 0) }}</strong></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="journalStore.closeModal()">
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
import { useJournalStore } from '~/stores/journal'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'

// Page meta
definePageMeta({
    title: 'Jurnal Umum',
    description: 'Kelola jurnal umum untuk pencatatan transaksi akuntansi'
})

// Stores
const journalStore = useJournalStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

// Computed
const journals = computed(() => journalStore.journals)
const loading = computed(() => journalStore.loading)
const totalRecords = computed(() => journalStore.totalRecords)
const params = computed(() => journalStore.params)
const form = computed(() => journalStore.form)
const isEditMode = computed(() => journalStore.isEditMode)
const showModal = computed(() => journalStore.showModal)
const validationErrors = computed(() => journalStore.validationErrors)
const journalTypes = computed(() => journalStore.journalTypes)
const journalStatuses = computed(() => journalStore.journalStatuses)
const accounts = computed(() => journalStore.accounts)

// Statistics
const draftCount = computed(() => journals.value.filter(j => j.status === 'draft').length)
const postedCount = computed(() => journals.value.filter(j => j.status === 'posted').length)
const totalDebit = computed(() => journals.value.reduce((sum, j) => sum + (j.total_debit || 0), 0))

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Jurnal' : 'Tambah Jurnal Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data jurnal di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan jurnal baru.')

// Methods
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID')
}

const getTypeLabel = (type) => {
    const labels = {
        manual: 'Manual',
        system: 'Sistem',
        adjustment: 'Penyesuaian'
    }
    return labels[type] || type
}

const getTypeBadgeClass = (type) => {
    const classes = {
        manual: 'badge bg-label-primary',
        system: 'badge bg-label-success',
        adjustment: 'badge bg-label-warning'
    }
    return classes[type] || 'badge bg-label-secondary'
}

const getStatusLabel = (status) => {
    const labels = {
        draft: 'Draft',
        posted: 'Posted',
        cancelled: 'Dibatalkan'
    }
    return labels[status] || status
}

const getStatusBadgeClass = (status) => {
    const classes = {
        draft: 'badge bg-label-warning',
        posted: 'badge bg-label-success',
        cancelled: 'badge bg-label-danger'
    }
    return classes[status] || 'badge bg-label-secondary'
}

const openJournalDetails = (journalId) => {
    router.push({ path: `/accounting/journal/detail`, query: { id: journalId } })
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
    if (journalStore.journals.length === 0) {
        await journalStore.fetchJournals()
    }
    
    const modalElement = document.getElementById('JournalModal')
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
    journalStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => journalStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    journalStore.fetchJournals()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    await journalStore.fetchJournals()
}

const onSort = (event) => journalStore.setSort(event)
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}

.table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.table tfoot {
    background-color: #e9ecef;
}
</style>
