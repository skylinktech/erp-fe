<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Pengeluaran</h4>
            <p class="mb-6">
                Kelola pengeluaran dan biaya operasional perusahaan
            </p>

            <!-- Expense Statistics Cards -->
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
                                <p class="mb-0">Total Pengeluaran</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="expense-heading">
                                    <h5 class="mb-1">{{ formatRupiah(totalExpenses) }}</h5>
                                    <span class="text-muted">Total Pengeluaran</span>
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
                                <div class="expense-heading">
                                    <h5 class="mb-1">{{ draftCount }}</h5>
                                    <span class="text-muted">Menunggu Persetujuan</span>
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
                                <p class="mb-0">Disetujui</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-check-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="expense-heading">
                                    <h5 class="mb-1">{{ approvedCount }}</h5>
                                    <span class="text-muted">Pengeluaran Disetujui</span>
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
                                <p class="mb-0">Dibayar</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-bank-card-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="expense-heading">
                                    <h5 class="mb-1">{{ paidCount }}</h5>
                                    <span class="text-muted">Pengeluaran Dibayar</span>
                                </div>
                                <a href="javascript:void(0);" class="text-secondary">
                                    <i class="ri-file-copy-line ri-22px"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Expense Table -->
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Daftar Pengeluaran</h4>
                    <p class="mb-0">Kelola semua pengeluaran dalam sistem</p>
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
                                    v-if="userHasRole('superadmin') || userHasPermission('create_expenses')"
                                    @click="expenseStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Pengeluaran
                                </button>
                                <button @click="exportData('csv')" class="btn btn-outline-secondary">
                                    <i class="ri-download-line me-1"></i>
                                    Export
                                </button>
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari Pengeluaran..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="expenses"
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
                                <Column field="expenseNumber" header="No. Referensi" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.expenseNumber }}</span>
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
                                <Column field="amount" header="Jumlah" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold text-danger">
                                            {{ formatRupiah(slotProps.data.amount || 0) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="paymentMethod" header="Metode Pembayaran" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span >
                                            {{ getPaymentMethodLabel(slotProps.data.paymentMethod) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li v-if="userHasRole('superadmin') || userHasPermission('view_expenses')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="openExpenseDetails(slotProps.data.id)">
                                                        <i class="ri-eye-line me-2"></i> Lihat Detail
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || userHasPermission('edit_expenses')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="expenseStore.openModal(slotProps.data)">
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || userHasPermission('delete_expenses')">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="expenseStore.deleteExpense(slotProps.data.id)">
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

        <!-- Expense Modal -->
        <Modal 
            id="ExpenseModal"
            :title="modalTitle" 
            :description="modalDescription"
            :validation-errors-from-parent="validationErrors"
        >
            <template #default>
                <form @submit.prevent="expenseStore.saveExpense()">
                    <div class="row g-6">
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.expenseNumber" 
                                    placeholder="Masukkan nomor referensi"
                                    
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
                                    placeholder="Masukkan deskripsi pengeluaran"
                                    
                                >
                                <label>Deskripsi *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.amount" 
                                    placeholder="Masukkan jumlah"
                                    step="0.01"
                                    min="0"
                                    
                                >
                                <label>Jumlah *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.paymentMethod"
                                    
                                >
                                    <option value="" selected disabled>Pilih Metode Pembayaran</option>
                                    <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
                                        {{ method.label }}
                                    </option>
                                </select>
                                <label>Metode Pembayaran *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.departemenId"
                                    
                                >
                                    <option value="" selected disabled>Pilih Departemen</option>
                                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                                        {{ dept.nmDepartemen }}
                                    </option>
                                </select>
                                <label>Departemen *</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.bankAccountId"
                                    
                                >
                                    <option value="" selected disabled>Pilih Rekening Bank</option>
                                    <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                                        {{ account.accountName }} - {{ account.accountNumber }}
                                    </option>
                                </select>
                                <label>Rekening Bank *</label>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="expenseStore.closeModal()">
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
import { useExpenseStore } from '~/stores/expenses'
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
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

// Computed
const expenses = computed(() => {
  const data = expenseStore.expenses
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object' && data.data && Array.isArray(data.data)) return data.data
  return []
})
const loading = computed(() => expenseStore.loading || false)
const totalRecords = computed(() => expenseStore.totalRecords || 0)
const params = computed(() => expenseStore.params || {})
const form = computed(() => expenseStore.form || {})
const isEditMode = computed(() => expenseStore.isEditMode || false)
const showModal = computed(() => expenseStore.showModal || false)
const validationErrors = computed(() => expenseStore.validationErrors || [])
const paymentMethods = computed(() => expenseStore.paymentMethods || [])
const bankAccounts = computed(() => expenseStore.bankAccounts || [])
const departments = computed(() => expenseStore.departments || [])

// Statistics
const totalExpenses = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return 0
    return expenses.value.reduce((sum, exp) => {
        const amount = Number(exp.amount) || 0
        return sum + amount
    }, 0)
})
const draftCount = computed(() => 0) // Not available in current database schema
const approvedCount = computed(() => 0) // Not available in current database schema
const paidCount = computed(() => 0) // Not available in current database schema

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data pengeluaran di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan pengeluaran baru.')

// Methods
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID')
}

const getPaymentMethodLabel = (method) => {
    const labels = {
        cash: 'Tunai',
        bank_transfer: 'Transfer Bank',
        check: 'Cek',
        credit_card: 'Kartu Kredit'
    }
    return labels[method] || method
}

const getPaymentMethodBadgeClass = (method) => {
    const classes = {
        cash: 'badge bg-label-success',
        bank_transfer: 'badge bg-label-primary',
        check: 'badge bg-label-warning',
        credit_card: 'badge bg-label-info'
    }
    return classes[method] || 'badge bg-label-secondary'
}

const openExpenseDetails = (expenseId) => {
    router.push({ path: `/accounting/expenses/detail`, query: { id: expenseId } })
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
        if (expenseStore.expenses.length === 0) {
            await expenseStore.fetchExpenses()
        }
        setListTitle('Expense', expenses.value.length)
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
})

// Watchers
watch(showModal, async (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        await nextTick()
        const modalElement = document.getElementById('ExpenseModal')
        if (modalElement) {
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement)
            }
            modalInstance.show()
        }
    } else {
        if (modalInstance) {
            modalInstance.hide()
        }
    }
})

const debouncedSearch = useDebounceFn(() => {
    expenseStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => expenseStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    expenseStore.params.rows = rowsValue
    expenseStore.params.first = 0
    await expenseStore.fetchExpenses()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    expenseStore.params.first = 0
    await expenseStore.fetchExpenses()
}

const onSort = (event) => expenseStore.setSort(event)
</script>

<style scoped>
<style scoped>

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
