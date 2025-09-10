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
                                <p class="mb-0">Total Jurnal</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-file-text-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="journal-heading">
                                    <h5 class="mb-1">{{ totalJournalsCount }}</h5>
                                    <span class="text-muted">Jurnal Terdaftar</span>
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

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Daftar Jurnal Umum</h4>
                    <p class="mb-0">Temukan semua jurnal dalam sistem akuntansi.</p>
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
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari jurnal..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable
                                ref="myDataTableRef"
                                :data="journals"
                                :rows="Number(params.rows)" 
                                :loading="loading"
                                :totalRecords="totalRecords"
                                :first="params.first"
                                @page="onPage($event)"
                                @sort="onSort($event)"
                                striped-rows
                                hover
                                paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                responsiveLayout="scroll" 
                                paginatorPosition="bottom"
                                class="p-datatable-sm"
                            >
                                <Column header="#" :sortable="false">
                                    <template #body="slotProps">
                                        {{ params.first + slotProps.index + 1 }}
                                    </template>
                                </Column>
                                <Column field="journalNumber" header="No. Jurnal" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.journalNumber }}</span>
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
                                        </div>
                                    </template>
                                </Column>
                                <Column field="status" header="Status" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span :class="getStatusBadgeClass(slotProps.data.status)">
                                            {{ getStatusLabel(slotProps.data.status) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="referenceType" header="Tipe Referensi" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span v-if="slotProps.data.referenceType" class="badge bg-label-info">
                                            {{ slotProps.data.referenceType }}
                                        </span>
                                        <span v-else class="text-muted">-</span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
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
                            <div class="row">
                                <div class="col">
                                    <ul class="nav nav-tabs" role="tablist">
                                        <li class="nav-item">
                                            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                                <span class="ri-user-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Informasi Jurnal</span>
                                            </button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-lines" role="tab" aria-selected="false" type="button">
                                                <span class="ri-file-text-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Detail Jurnal</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="tab-content pt-4">
                                <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    v-model="form.journalNumber" 
                                                    placeholder="Akan di-generate otomatis (JRN-0001-ddmmyy)"
                                                    :readonly="!isEditMode"
                                                >
                                                <label>No. Jurnal</label>
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
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    v-model="form.referenceType" 
                                                    placeholder="Tipe referensi (opsional)"
                                                >
                                                <label>Tipe Referensi</label>
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
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="form-tabs-lines" role="tabpanel">
                                    <div v-for="(line, index) in form.journalLines" :key="index" class="repeater-item mb-4">
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <v-select 
                                                    v-model="line.accountId" 
                                                    :options="accounts || []" 
                                                    :get-option-label="account => `${account.code} - ${account.name}`"
                                                    :reduce="account => account.id" 
                                                    placeholder="Pilih Akun" 
                                                    class="v-select-style"
                                                    :searchable="true"
                                                    :clearable="true"
                                                    :close-on-select="true"
                                                    :preserve-search="false"
                                                    :filter-by="(option, label, search) => {
                                                        const account = option;
                                                        const searchLower = search.toLowerCase();
                                                        return account.name.toLowerCase().includes(searchLower) || 
                                                               account.code.toLowerCase().includes(searchLower);
                                                    }"
                                                >
                                                    <template #option="option">
                                                        <div class="d-flex justify-content-between align-items-center w-100">
                                                            <div>
                                                                <div class="fw-bold">{{ option.code }} - {{ option.name }}</div>
                                                                <small class="text-muted">{{ option.type || 'No Type' }} - {{ option.category || 'No Category' }}</small>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <template #selected-option="option">
                                                        <div class="d-flex align-items-center">
                                                            <span class="fw-bold">{{ option.code }} - {{ option.name }}</span>
                                                        </div>
                                                    </template>
                                                    <template #no-options>
                                                        <div class="text-center p-3">
                                                            <div class="text-muted">
                                                                <i class="ri-search-line me-2"></i>
                                                                Tidak ada akun ditemukan
                                                            </div>
                                                        </div>
                                                    </template>
                                                </v-select>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="number" 
                                                        class="form-control" 
                                                        v-model="line.debit" 
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0"
                                                    >
                                                    <label>Debit</label>
                                                </div>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="number" 
                                                        class="form-control" 
                                                        v-model="line.credit" 
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0"
                                                    >
                                                    <label>Credit</label>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="text" 
                                                        class="form-control" 
                                                        v-model="line.description" 
                                                        placeholder="Deskripsi baris"
                                                    >
                                                    <label>Deskripsi</label>
                                                </div>
                                            </div>
                                            <div class="col-md-1 d-flex align-items-end">
                                                <button 
                                                    type="button" 
                                                    class="btn btn-outline-danger w-100 mb-1" 
                                                    @click="journalStore.removeJournalLine(index)"
                                                >
                                                    <i class="ri-subtract-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <hr class="my-4">
                                    </div>
                                    <div class="mt-4 col-12">
                                        <button type="button" class="btn btn-primary col-12 btn-sm" @click="journalStore.addJournalLine()">
                                            <i class="ri-add-line me-1"></i> Tambah Baris
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-outline-secondary" @click="journalStore.closeModal()">
                                    Tutup
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
        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '~/stores/journal'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle, setFormTitle } = useDynamicTitle()

// Page meta
definePageMeta({
    title: 'Jurnal Umum',
    description: 'Kelola jurnal umum untuk pencatatan transaksi akuntansi'
})

// Stores
const journalStore = useJournalStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Computed values dari store
const loading = computed(() => journalStore.loading)
const totalRecords = computed(() => journalStore.totalRecords || 0)
const params = computed(() => {
  return journalStore.params || {
    first: 0,
    rows: 10,
    sortField: 'date',
    sortOrder: -1,
    search: ''
  }
})
const form = computed(() => journalStore.form)
const isEditMode = computed(() => journalStore.isEditMode)
const showModal = computed(() => journalStore.showModal)
const validationErrors = computed(() => {
  return Array.isArray(journalStore.validationErrors) ? journalStore.validationErrors : []
})
const journalTypes = computed(() => {
  return Array.isArray(journalStore.journalTypes) ? journalStore.journalTypes : []
})
const journalStatuses = computed(() => {
  return Array.isArray(journalStore.journalStatuses) ? journalStore.journalStatuses : []
})
const accounts = computed(() => {
  const result = Array.isArray(journalStore.accounts) ? journalStore.accounts : []
  console.log('Accounts computed:', result, 'Length:', result.length) // Debug log
  return result
})
const journals = computed(() => {
  const result = Array.isArray(journalStore.journals) ? journalStore.journals : []
  console.log('Journals computed:', result, 'Length:', result.length, 'Loading:', journalStore.loading) // Debug log
  return result
})

// Statistics yang diperbaiki
const totalJournalsCount = computed(() => {
  if (!journalStore.journals || !Array.isArray(journalStore.journals)) return 0
  return journalStore.journals.length
})

const draftCount = computed(() => {
  if (!journalStore.journals || !Array.isArray(journalStore.journals)) return 0
  return journalStore.journals.filter(j => j.status === 'draft').length
})

const postedCount = computed(() => {
  if (!journalStore.journals || !Array.isArray(journalStore.journals)) return 0
  return journalStore.journals.filter(j => j.status === 'posted').length
})

const totalDebit = computed(() => {
  if (!journalStore.journals || !Array.isArray(journalStore.journals)) return 0
  return journalStore.journals.reduce((sum, j) => {
    // Hitung total debit dari journal lines
    if (j.journalLines && Array.isArray(j.journalLines)) {
      return sum + j.journalLines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0)
    }
    return sum
  }, 0)
})

// Modal computed
const modalTitle = computed(() => isEditMode.value ? 'Edit Jurnal' : 'Tambah Jurnal Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data jurnal di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan jurnal baru.')

// Methods
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID')
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
    router.push({ path: `/accounting/journals/detail`, query: { id: journalId } })
}

const exportData = (format) => {
    if (format === 'csv' && myDataTableRef.value) {
        myDataTableRef.value.exportCSV()
    }
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions()

// Lifecycle
let modalInstance = null
onMounted(async () => {
    try {
        await permissionStore.fetchPermissions()
        await userStore.loadUser()
        // Pastikan journals diinisialisasi sebagai array kosong terlebih dahulu
        journalStore.journals = []
        // Load accounts dan journals secara bersamaan
        await Promise.all([
            journalStore.fetchAccounts(),
            journalStore.fetchJournals()
        ])
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
    setListTitle('Jurnal Umum', totalJournalsCount.value)
})

// Cleanup modal instance saat komponen di-unmount
onUnmounted(() => {
    if (modalInstance) {
        modalInstance.dispose()
        modalInstance = null
    }
})

// Watchers
watch(showModal, (newValue) => {
    if (newValue) {
        nextTick(() => {
            const modalElement = document.getElementById('JournalModal')
            if (modalElement) {
                // Hapus instance lama jika ada
                if (modalInstance) {
                    modalInstance.dispose()
                }
                // Buat instance baru
                modalInstance = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                })
                modalInstance.show()
            }
        })
    } else {
        if (modalInstance) {
            modalInstance.hide()
        }
    }
})

const debouncedSearch = useDebounceFn(() => {
    journalStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => {
    journalStore.setPagination(event)
}

const onSort = (event) => {
    journalStore.setSort(event)
}

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    journalStore.params.rows = rowsValue
    journalStore.params.first = 0
    await journalStore.fetchJournals()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    journalStore.params.first = 0
    await journalStore.fetchJournals()
}
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

/* v-select styling */
.v-select-style {
    height: 48px !important;
    border-radius: 7px;
}

:deep(.v-select-style .vs__dropdown-toggle) {
    height: 48px !important;
    border-radius: 7px;
}

:deep(.v-select-style .vs__search) {
    font-size: 13px !important;
    border: none !important;
    outline: none !important;
    background: transparent !important;
    width: 100% !important;
    min-width: 0 !important;
}

:deep(.v-select-style .vs__dropdown-menu) {
    max-height: 250px !important;
    overflow-y: auto !important;
    border-radius: 7px !important;
}

:deep(.v-select-style .vs__dropdown-option--highlight) {
    background-color: #4a4a4a !important;
    color: white !important;
}

:deep(.v-select-style .vs__dropdown-option) {
    padding: 10px 14px !important;
    font-size: 13px !important;
    line-height: 1.4 !important;
    border-bottom: 1px solid #f0f0f0 !important;
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    min-height: auto !important;
    height: auto !important;
}

:deep(.v-select-style .vs__dropdown-option:last-child) {
    border-bottom: none !important;
}

:deep(.v-select-style .vs__dropdown-option:hover) {
    background-color: #f8f9fa !important;
    color: #666bff !important;
}

:deep(.v-select-style .vs__dropdown-option--highlight:hover) {
    background-color: #666bff !important;
    color: white !important;
}

:deep(.v-select-style .vs__dropdown-option--highlight) {
    background-color: #4a4a4a !important;
    color: white !important;
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

:deep(.v-select-style .vs__dropdown-option .d-flex) {
    width: 100% !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
}

:deep(.v-select-style .vs__dropdown-option .fw-bold) {
    word-break: break-word !important;
    hyphens: auto !important;
    line-height: 1.3 !important;
}

:deep(.v-select-style .vs__dropdown-option small) {
    word-break: break-word !important;
    hyphens: auto !important;
    line-height: 1.2 !important;
    margin-top: 2px !important;
}

.is-invalid .vs__dropdown-toggle {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.v-select-style:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.v-select-style:disabled .vs__dropdown-toggle {
    background-color: #e9ecef;
    cursor: not-allowed;
}
</style>
