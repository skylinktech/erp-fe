<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Rekening Bank</h4>
            <p class="mb-6">
                Kelola rekening bank untuk transaksi keuangan
            </p>

            <!-- Bank Account Statistics Cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Rekening</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-bank-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="bank-heading">
                                    <h5 class="mb-1">{{ bankAccounts.length }}</h5>
                                    <span class="text-muted">Rekening Terdaftar</span>
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
                                <p class="mb-0">Rekening Aktif</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-check-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="bank-heading">
                                    <h5 class="mb-1">{{ activeAccountCount }}</h5>
                                    <span class="text-muted">Rekening Aktif</span>
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
                                <p class="mb-0">Total Saldo</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="bank-heading">
                                    <h5 class="mb-1">{{ formatRupiah(totalBalance) }}</h5>
                                    <span class="text-muted">Total Saldo</span>
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
                                <p class="mb-0">Rekening Default</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-star-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="bank-heading">
                                    <h5 class="mb-1">{{ defaultAccountCount }}</h5>
                                    <span class="text-muted">Rekening Default</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bank Account Table -->
            <div class="card">
                <div class="card-header border-bottom">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Daftar Rekening Bank</h5>
                        <small class="text-muted">Kelola semua rekening bank dalam sistem</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-4 text-muted">
                            <small>Menampilkan {{ totalRecords }} dari {{ bankAccounts.length }} rekening</small>
                        </div>
                        <div class="col-md-4 d-flex justify-content-end">
                            <div class="d-flex gap-2">
                                <button 
                                    v-if="userHasRole('superadmin') || userHasPermission('create_bank_account')"
                                    @click="bankAccountStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Rekening
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
                        :value="bankAccounts"
                        :loading="loading"
                        :total-records="totalRecords"
                        :lazy="true"
                        :paginator="true"
                        :rows="params.rows"
                        :rows-per-page-options="rowsPerPageOptionsArray"
                        :global-filter="globalFilterValue"
                        :global-filter-fields="['name', 'account_number', 'bank_name', 'branch']"
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
                        current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} rekening"
                        responsive-layout="scroll"
                        class="p-datatable-sm"
                    >
                        <Column field="name" header="Nama Rekening" :sortable="true" style="min-width:150px">
                            <template #body="slotProps">
                                <div>
                                    <div class="fw-semibold">{{ slotProps.data.name }}</div>
                                    <small class="text-muted" v-if="slotProps.data.description">
                                        {{ slotProps.data.description }}
                                    </small>
                                </div>
                            </template>
                        </Column>
                        <Column field="bank_name" header="Bank" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold">{{ slotProps.data.bank_name }}</span>
                            </template>
                        </Column>
                        <Column field="account_number" header="Nomor Rekening" :sortable="true" style="min-width:150px">
                            <template #body="slotProps">
                                <span class="fw-semibold">{{ slotProps.data.account_number }}</span>
                            </template>
                        </Column>
                        <Column field="branch" header="Cabang" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="text-muted">{{ slotProps.data.branch }}</span>
                            </template>
                        </Column>
                        <Column field="account_type" header="Tipe" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span :class="getTypeBadgeClass(slotProps.data.account_type)">
                                    {{ getTypeLabel(slotProps.data.account_type) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="currency" header="Mata Uang" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span class="badge bg-label-secondary">{{ slotProps.data.currency }}</span>
                            </template>
                        </Column>
                        <Column field="balance" header="Saldo" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold" :class="getBalanceClass(slotProps.data.balance)">
                                    {{ formatRupiah(slotProps.data.balance || 0) }}
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
                                        <li v-if="userHasRole('superadmin') || userHasPermission('view_bank_account')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="openBankAccountDetails(slotProps.data.id)">
                                                <i class="ri-eye-line me-2"></i> Lihat Detail
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_bank_account')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="bankAccountStore.openModal(slotProps.data)">
                                                <i class="ri-edit-box-line me-2"></i> Edit
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_bank_account')">
                                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="bankAccountStore.deleteBankAccount(slotProps.data.id)">
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

        <!-- Bank Account Modal -->
        <Modal 
            id="BankAccountModal"
            :title="modalTitle" 
            :description="modalDescription"
            :validation-errors-from-parent="validationErrors"
        >
            <template #default>
                <form @submit.prevent="bankAccountStore.saveBankAccount()">
                    <div class="row g-6">
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.name" 
                                    placeholder="Masukkan nama rekening"
                                    required
                                >
                                <label>Nama Rekening *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.bank_name" 
                                    placeholder="Masukkan nama bank"
                                    required
                                >
                                <label>Nama Bank *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.account_number" 
                                    placeholder="Masukkan nomor rekening"
                                    required
                                >
                                <label>Nomor Rekening *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.branch" 
                                    placeholder="Masukkan cabang bank"
                                    required
                                >
                                <label>Cabang Bank *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.account_type"
                                    required
                                >
                                    <option value="">Pilih Tipe Rekening</option>
                                    <option v-for="type in accountTypes" :key="type.value" :value="type.value">
                                        {{ type.label }}
                                    </option>
                                </select>
                                <label>Tipe Rekening *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.currency"
                                    required
                                >
                                    <option value="">Pilih Mata Uang</option>
                                    <option v-for="currency in currencies" :key="currency.value" :value="currency.value">
                                        {{ currency.label }}
                                    </option>
                                </select>
                                <label>Mata Uang *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.balance" 
                                    placeholder="Masukkan saldo awal"
                                    step="0.01"
                                    min="0"
                                    required
                                >
                                <label>Saldo Awal *</label>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="form-floating form-floating-outline">
                                <textarea
                                    class="form-control h-px-100"
                                    placeholder="Deskripsi rekening"
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
                                    Rekening Aktif
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
                                    Rekening Default
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="bankAccountStore.closeModal()">
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
import { useBankAccountStore } from '~/stores/bank-accounts'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'

// Page meta
definePageMeta({
    title: 'Rekening Bank',
    description: 'Kelola rekening bank untuk transaksi keuangan'
})

// Stores
const bankAccountStore = useBankAccountStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

// Computed
const bankAccounts = computed(() => bankAccountStore.bankAccounts)
const loading = computed(() => bankAccountStore.loading)
const totalRecords = computed(() => bankAccountStore.totalRecords)
const params = computed(() => bankAccountStore.params)
const form = computed(() => bankAccountStore.form)
const isEditMode = computed(() => bankAccountStore.isEditMode)
const showModal = computed(() => bankAccountStore.showModal)
const validationErrors = computed(() => bankAccountStore.validationErrors)
const accountTypes = computed(() => bankAccountStore.accountTypes)
const currencies = computed(() => bankAccountStore.currencies)

// Statistics
const activeAccountCount = computed(() => bankAccounts.value.filter(acc => acc.is_active).length)
const defaultAccountCount = computed(() => bankAccounts.value.filter(acc => acc.is_default).length)
const totalBalance = computed(() => bankAccounts.value.reduce((sum, acc) => sum + (acc.balance || 0), 0))

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data rekening bank di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan rekening bank baru.')

// Methods
const getTypeBadgeClass = (type) => {
    const classes = {
        savings: 'badge bg-label-success',
        checking: 'badge bg-label-warning',
        current: 'badge bg-label-info'
    }
    return classes[type] || 'badge bg-label-secondary'
}

const getTypeLabel = (type) => {
    const labels = {
        savings: 'Tabungan',
        checking: 'Giro',
        current: 'Koran'
    }
    return labels[type] || type
}

const getBalanceClass = (balance) => {
    if (!balance) return 'text-muted'
    return balance >= 0 ? 'text-success' : 'text-danger'
}

const openBankAccountDetails = (accountId) => {
    router.push({ path: `/accounting/bank-accounts/detail`, query: { id: accountId } })
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
    await permissionStore.fetchPermissions()
    await userStore.loadUser()
    if (bankAccountStore.bankAccounts.length === 0) {
        await bankAccountStore.fetchBankAccounts()
    }
    
    // Initialize table controls
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;
})

// Watchers
watch(showModal, async (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('BankAccountModal')
            if (modalElement && !instance) {
                instance = new bootstrap.Modal(modalElement)
            }
            instance?.show()
        })
    } else {
        instance?.hide()
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
    bankAccountStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => bankAccountStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    await bankAccountStore.fetchBankAccounts()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    await bankAccountStore.fetchBankAccounts()
}

const onSort = (event) => bankAccountStore.setSort(event)
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}
</style>
