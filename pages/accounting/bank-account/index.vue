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
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Daftar Rekening Bank</h4>
                    <p class="mb-0">Kelola semua rekening bank dalam sistem</p>
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
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari Rekening Bank..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                <div class="card-datatable table-responsive py-3 px-3">
                    <MyDataTable 
                        ref="myDataTableRef"
                        :data="bankAccounts"
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
                        <Column field="account_name" header="Nama Rekening" :sortable="true" style="min-width:150px">
                            <template #body="slotProps">
                                <div>
                                    <div class="fw-semibold">{{ slotProps.data.account_name }}</div>
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

                        <Column field="currency" header="Mata Uang" :sortable="true" style="min-width:100px">
                            <template #body="slotProps">
                                <span class="badge bg-label-secondary">{{ slotProps.data.currency }}</span>
                            </template>
                        </Column>
                        <Column field="opening_balance" header="Saldo" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold" :class="getBalanceClass(slotProps.data.opening_balance)">
                                    {{ formatRupiah(slotProps.data.opening_balance || 0) }}
                                </span>
                            </template>
                        </Column>
                        <Column header="Actions" :exportable="false" style="min-width:8rem">
                            <template #body="slotProps">
                                <div class="d-inline-block">
                                    <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                    </a>
                                    <ul class="dropdown-menu">
                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_bank_account')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="bankAccountStore.openModal(slotProps.data, 'admin')">
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
                                    v-model="form.account_name" 
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
                        <div class="col-md-3">
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

                        <div class="col-md-3">
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
                                    v-model="form.opening_balance" 
                                    placeholder="Masukkan saldo awal"
                                    step="0.01"
                                    min="0"
                                    required
                                >
                                <label>Saldo Awal *</label>
                            </div>
                        </div>

                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="bankAccountStore.closeModal()">
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
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBankAccountStore } from '~/stores/bank-accounts'
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
import Swal from 'sweetalert2'

const { setListTitle, setFormTitle } = useDynamicTitle()

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
const bankAccounts = computed(() => bankAccountStore.bankAccounts || [])
const loading = computed(() => bankAccountStore.loading || false)
const totalRecords = computed(() => bankAccountStore.totalRecords || 0)
const params = computed(() => bankAccountStore.params || {})
const form = computed(() => bankAccountStore.form || {})
const isEditMode = computed(() => bankAccountStore.isEditMode || false)
const showModal = computed(() => bankAccountStore.showModal || false)
const validationErrors = computed(() => bankAccountStore.validationErrors || [])
const accountTypes = computed(() => bankAccountStore.accountTypes || [])
const currencies = computed(() => bankAccountStore.currencies || [])

// Statistics
const activeAccountCount = computed(() => 0) // Not available in current database schema
const defaultAccountCount = computed(() => 0) // Not available in current database schema

const totalBalance = computed(() => {
    if (!bankAccounts.value || !Array.isArray(bankAccounts.value)) return 0
    return bankAccounts.value.reduce((sum, acc) => {
        const balance = Number(acc.opening_balance) || 0
        return sum + balance
    }, 0)
})

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data rekening bank di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan rekening bank baru.')

// Methods


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
    try {
        await permissionStore.fetchPermissions()
        await userStore.loadUser()
        if (bankAccountStore.bankAccounts.length === 0) {
            await bankAccountStore.fetchBankAccounts()
        }
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
    setListTitle('Bank Account', bankAccounts.value.length)
})

// Watchers
watch(showModal, async (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('BankAccountModal')
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
    bankAccountStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => bankAccountStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    bankAccountStore.params.rows = rowsValue
    bankAccountStore.params.first = 0
    await bankAccountStore.fetchBankAccounts()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    bankAccountStore.params.first = 0
    await bankAccountStore.fetchBankAccounts()
}

const onSort = (event) => bankAccountStore.setSort(event)
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
