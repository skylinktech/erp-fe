<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Chart of Accounts</h4>
            <p class="mb-6">
                Kelola Chart of Accounts (COA) untuk sistem akuntansi
            </p>

            <!-- Account Statistics Cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Akun</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-bank-card-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ accounts.length }}</h5>
                                    <span class="text-muted">Akun Aktif</span>
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
                                <p class="mb-0">Asset</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ assetCount }}</h5>
                                    <span class="text-muted">Akun Asset</span>
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
                                <p class="mb-0">Liability</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-exchange-funds-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ liabilityCount }}</h5>
                                    <span class="text-muted">Akun Liability</span>
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
                                <p class="mb-0">Equity</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-user-star-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ equityCount }}</h5>
                                    <span class="text-muted">Akun Equity</span>
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
                    <h4 class="mt-6 mb-1">Total & Filter Chart of Accounts</h4>
                    <p class="mb-0">Temukan semua akun dalam sistem Chart of Accounts.</p>
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
                                    v-if="userHasRole('superadmin') || userHasPermission('create_account')"
                                    @click="accountStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Akun
                                </button>
                                <button @click="exportData('csv')" class="btn btn-outline-secondary">
                                    <i class="ri-download-line me-1"></i>
                                    Export
                                </button>
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari Chart of Accounts..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="accounts"
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
                                        {{ params.first + slotProps.index + 1 }}
                                    </template>
                                </Column>
                                <Column field="code" header="Kode Akun" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.code }}</span>
                                    </template>
                                </Column>
                                                             <Column field="name" header="Nama Akun" :sortable="true" style="min-width:200px">
                                 <template #body="slotProps">
                                     <div>
                                         <div class="fw-semibold">{{ slotProps.data.name }}</div>
                                     </div>
                                 </template>
                             </Column>
                                <Column field="category" header="Kategori" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span :class="getTypeBadgeClass(slotProps.data.category)">
                                            {{ getTypeLabel(slotProps.data.category) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="normalBalance" header="Normal Balance" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="badge bg-label-secondary">{{ slotProps.data.normalBalance }}</span>
                                    </template>
                                </Column>
                                <Column field="parent" header="Parent Account" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span v-if="slotProps.data.parent" class="text-muted">
                                            {{ slotProps.data.parent.code }} - {{ slotProps.data.parent.name }}
                                        </span>
                                        <span v-else class="text-muted">-</span>
                                    </template>
                                </Column>
                                <Column field="level" header="Level" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span class="badge bg-label-info">{{ slotProps.data.level }}</span>
                                    </template>
                                </Column>
                                <Column field="isParent" header="Tipe" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span :class="slotProps.data.isParent ? 'badge bg-label-primary' : 'badge bg-label-secondary'">
                                            {{ slotProps.data.isParent ? 'Parent' : 'Child' }}
                                        </span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <button @click="openAccountDetails(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="userHasRole('superadmin') || userHasPermission('view_account')">
                                            <i class="ri-eye-line ri-20px"></i>
                                        </button>
                                        <button @click="accountStore.openModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="userHasRole('superadmin') || userHasPermission('edit_account')">
                                            <i class="ri-edit-box-line ri-20px"></i>
                                        </button>
                                        <button @click="accountStore.deleteAccount(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon" v-if="userHasRole('superadmin') || userHasPermission('delete_account')">
                                            <i class="ri-delete-bin-7-line ri-20px"></i>
                                        </button>
                                    </template>
                                </Column>
                            </MyDataTable>
                        </div>
                    </div>
                </div>

                <!-- Account Modal -->
                <Modal 
                    id="AccountModal"
                    :title="modalTitle" 
                    :description="modalDescription"
                    :validation-errors-from-parent="validationErrors"
                >
                    <template #default>
                        <form @submit.prevent="accountStore.saveAccount()">
                            <div class="row g-6">
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="form.code" 
                                            placeholder="Masukkan kode akun"
                                            required
                                        >
                                        <label>Kode Akun *</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="form.name" 
                                            placeholder="Masukkan nama akun"
                                            required
                                        >
                                        <label>Nama Akun *</label>
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
                                            <option v-for="category in accountCategories" :key="category.value" :value="category.value">
                                                {{ category.label }}
                                            </option>
                                        </select>
                                        <label>Kategori *</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.normalBalance"
                                            required
                                        >
                                            <option value="">Pilih Normal Balance</option>
                                            <option value="debit">Debit</option>
                                            <option value="credit">Credit</option>
                                        </select>
                                        <label>Normal Balance *</label>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.parentId"
                                        >
                                            <option value="">Pilih Parent Account (Opsional)</option>
                                            <option v-for="parent in parentAccounts" :key="parent.id" :value="parent.id">
                                                {{ parent.code }} - {{ parent.name }}
                                            </option>
                                        </select>
                                        <label>Parent Account</label>
                                    </div>
                                </div>
                                
                                <div class="col-md-12">
                                    <div class="form-check form-switch">
                                        <input 
                                            class="form-check-input" 
                                            type="checkbox" 
                                            v-model="form.isParent"
                                            id="isParent"
                                        >
                                        <label class="form-check-label" for="isParent">
                                            Akun Parent
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-outline-secondary" @click="accountStore.closeModal()">
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
        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '~/stores/accounts'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Modal from '~/components/modal/Modal.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

// Page meta
definePageMeta({
    title: 'Chart of Accounts',
    description: 'Kelola Chart of Accounts (COA) untuk sistem akuntansi'
})

// Stores
const accountStore = useAccountStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);



// Computed
const accounts = computed(() => {
  return Array.isArray(accountStore.accounts) ? accountStore.accounts : []
})
const loading = computed(() => accountStore.loading)
const totalRecords = computed(() => {
  return typeof accountStore.totalRecords === 'number' ? accountStore.totalRecords : 0
})
const params = computed(() => {
  return accountStore.params || {
    first: 0,
    rows: 10,
    sortField: 'code',
    sortOrder: 1,
    search: ''
  }
})
const form = computed(() => accountStore.form)
const isEditMode = computed(() => accountStore.isEditMode)
const showModal = computed(() => accountStore.showModal)
const validationErrors = computed(() => {
  return Array.isArray(accountStore.validationErrors) ? accountStore.validationErrors : []
})
const parentAccounts = computed(() => {
  return Array.isArray(accountStore.parentAccounts) ? accountStore.parentAccounts : []
})
const accountTypes = computed(() => {
  return Array.isArray(accountStore.accountTypes) ? accountStore.accountTypes : []
})
const accountCategories = computed(() => {
  return Array.isArray(accountStore.accountCategories) ? accountStore.accountCategories : []
})

// Statistics
const assetCount = computed(() => {
  if (!Array.isArray(accounts.value)) return 0
  return accounts.value.filter(acc => acc.category === 'asset').length
})
const liabilityCount = computed(() => {
  if (!Array.isArray(accounts.value)) return 0
  return accounts.value.filter(acc => acc.category === 'liability').length
})
const equityCount = computed(() => {
  if (!Array.isArray(accounts.value)) return 0
  return accounts.value.filter(acc => acc.category === 'equity').length
})


// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Akun' : 'Tambah Akun Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data akun di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan akun baru.')

// Methods
const getTypeBadgeClass = (type) => {
    const classes = {
        asset: 'badge bg-label-success',
        liability: 'badge bg-label-warning',
        equity: 'badge bg-label-info',
        revenue: 'badge bg-label-primary',
        expense: 'badge bg-label-danger'
    }
    return classes[type] || 'badge bg-label-secondary'
}

const getTypeLabel = (type) => {
    const labels = {
        asset: 'Asset',
        liability: 'Liability',
        equity: 'Equity',
        revenue: 'Revenue',
        expense: 'Expense'
    }
    return labels[type] || type
}





const openAccountDetails = (accountId) => {
    router.push({ path: `/accounting/accounts/detail`, query: { id: accountId } })
}

const exportData = (format) => {
    if (format === 'csv' && myDataTableRef.value) {
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
        await accountStore.fetchAccounts()
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
})

// Watchers
watch(showModal, (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('AccountModal')
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
    accountStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => {
    accountStore.setPagination(event)
}



const onSort = (event) => {
    accountStore.setSort(event)
}

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    accountStore.params.rows = rowsValue
    accountStore.params.first = 0
    await accountStore.fetchAccounts()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    accountStore.params.first = 0
    await accountStore.fetchAccounts()
}
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}
</style>