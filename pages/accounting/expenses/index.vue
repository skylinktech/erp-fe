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
                <div class="col-xl-3 col-lg-6 col-md-6">
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
                <div class="col-xl-3 col-lg-6 col-md-6">
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
                <div class="col-xl-3 col-lg-6 col-md-6">
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
            <div class="card">
                <div class="card-header border-bottom">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Daftar Pengeluaran</h5>
                        <small class="text-muted">Kelola semua pengeluaran dalam sistem</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-4 text-muted">
                            <small>Menampilkan {{ totalRecords }} dari {{ expenses.length }} pengeluaran</small>
                        </div>
                        <div class="col-md-4 d-flex justify-content-end">
                            <div class="d-flex gap-2">
                                <button 
                                    v-if="userHasRole('superadmin') || userHasPermission('create_expense')"
                                    @click="expenseStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Pengeluaran
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
                        :value="expenses"
                        :loading="loading"
                        :total-records="totalRecords"
                        :lazy="true"
                        :paginator="true"
                        :rows="params.rows"
                        :rows-per-page-options="rowsPerPageOptionsArray"
                        :global-filter="globalFilterValue"
                        :global-filter-fields="['reference_number', 'description', 'category']"
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
                        current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} pengeluaran"
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
                        <Column field="category" header="Kategori" :sortable="true" style="min-width:150px">
                            <template #body="slotProps">
                                <span class="badge bg-label-secondary">{{ getCategoryLabel(slotProps.data.category) }}</span>
                            </template>
                        </Column>
                        <Column field="amount" header="Jumlah" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold text-danger">
                                    {{ formatRupiah(slotProps.data.amount || 0) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="total_amount" header="Total" :sortable="true" style="min-width:120px">
                            <template #body="slotProps">
                                <span class="fw-semibold text-danger">
                                    {{ formatRupiah(slotProps.data.total_amount || 0) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="payment_method" header="Metode Pembayaran" :sortable="true" style="min-width:150px">
                            <template #body="slotProps">
                                <span :class="getPaymentMethodBadgeClass(slotProps.data.payment_method)">
                                    {{ getPaymentMethodLabel(slotProps.data.payment_method) }}
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
                                        <li v-if="userHasRole('superadmin') || userHasPermission('view_expense')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="openExpenseDetails(slotProps.data.id)">
                                                <i class="ri-eye-line me-2"></i> Lihat Detail
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_expense')">
                                            <a class="dropdown-item" href="javascript:void(0)" @click="expenseStore.openModal(slotProps.data)">
                                                <i class="ri-edit-box-line me-2"></i> Edit
                                            </a>
                                        </li>
                                        <li v-if="(userHasRole('superadmin') || userHasPermission('approve_expense')) && slotProps.data.status === 'draft'">
                                            <a class="dropdown-item text-success" href="javascript:void(0)" @click="expenseStore.approveExpense(slotProps.data.id)">
                                                <i class="ri-check-line me-2"></i> Setujui
                                            </a>
                                        </li>
                                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_expense')">
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
                                    placeholder="Masukkan deskripsi pengeluaran"
                                    required
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
                                    @input="expenseStore.calculateTotalAmount()"
                                    required
                                >
                                <label>Jumlah *</label>
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
                                    <option v-for="category in expenseCategories" :key="category.value" :value="category.value">
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
                                    v-model="form.payment_method"
                                    required
                                >
                                    <option value="">Pilih Metode Pembayaran</option>
                                    <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
                                        {{ method.label }}
                                    </option>
                                </select>
                                <label>Metode Pembayaran *</label>
                            </div>
                        </div>
                        <div class="col-md-6" v-if="form.payment_method === 'bank_transfer'">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.bank_account_id"
                                >
                                    <option value="">Pilih Rekening Bank</option>
                                    <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                                        {{ account.name }} - {{ account.account_number }}
                                    </option>
                                </select>
                                <label>Rekening Bank</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.vendor_id"
                                >
                                    <option value="">Pilih Vendor (Opsional)</option>
                                    <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                                        {{ vendor.name }}
                                    </option>
                                </select>
                                <label>Vendor</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <select 
                                    class="form-select" 
                                    v-model="form.tax_id"
                                    @change="expenseStore.handleTaxChange()"
                                >
                                    <option value="">Pilih Pajak (Opsional)</option>
                                    <option v-for="tax in taxes" :key="tax.id" :value="tax.id">
                                        {{ tax.name }} ({{ tax.rate }}{{ tax.type === 'percentage' ? '%' : '' }})
                                    </option>
                                </select>
                                <label>Pajak</label>
                            </div>
                        </div>
                        <div class="col-md-6" v-if="form.tax_amount > 0">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.tax_amount" 
                                    placeholder="Jumlah pajak"
                                    step="0.01"
                                    min="0"
                                    readonly
                                >
                                <label>Jumlah Pajak</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="form.total_amount" 
                                    placeholder="Total jumlah"
                                    step="0.01"
                                    min="0"
                                    readonly
                                >
                                <label>Total Jumlah</label>
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
                                    <option v-for="status in expenseStatuses" :key="status.value" :value="status.value">
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
                        <div class="col-md-12">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="file" 
                                    class="form-control" 
                                    multiple
                                    @change="onFileChange"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                >
                                <label>Lampiran</label>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" @click="expenseStore.closeModal()">
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
import { useExpenseStore } from '~/stores/expenses'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'

// Page meta
definePageMeta({
    title: 'Pengeluaran',
    description: 'Kelola pengeluaran dan biaya operasional perusahaan'
})

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
const expenses = computed(() => expenseStore.expenses)
const loading = computed(() => expenseStore.loading)
const totalRecords = computed(() => expenseStore.totalRecords)
const params = computed(() => expenseStore.params)
const form = computed(() => expenseStore.form)
const isEditMode = computed(() => expenseStore.isEditMode)
const showModal = computed(() => expenseStore.showModal)
const validationErrors = computed(() => expenseStore.validationErrors)
const paymentMethods = computed(() => expenseStore.paymentMethods)
const expenseCategories = computed(() => expenseStore.expenseCategories)
const expenseStatuses = computed(() => expenseStore.expenseStatuses)
const bankAccounts = computed(() => expenseStore.bankAccounts)
const vendors = computed(() => expenseStore.vendors)
const taxes = computed(() => expenseStore.taxes)

// Statistics
const totalExpenses = computed(() => expenses.value.reduce((sum, exp) => sum + (exp.total_amount || 0), 0))
const draftCount = computed(() => expenses.value.filter(exp => exp.status === 'draft').length)
const approvedCount = computed(() => expenses.value.filter(exp => exp.status === 'approved').length)
const paidCount = computed(() => expenses.value.filter(exp => exp.status === 'paid').length)

// Table options
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data pengeluaran di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan pengeluaran baru.')

// Methods
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID')
}

const getCategoryLabel = (category) => {
    const labels = {
        office_supplies: 'Perlengkapan Kantor',
        utilities: 'Utilitas',
        rent: 'Sewa',
        salary: 'Gaji',
        marketing: 'Pemasaran',
        travel: 'Perjalanan',
        maintenance: 'Pemeliharaan',
        insurance: 'Asuransi',
        legal: 'Hukum',
        other: 'Lainnya'
    }
    return labels[category] || category
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

const getStatusLabel = (status) => {
    const labels = {
        draft: 'Draft',
        approved: 'Disetujui',
        paid: 'Dibayar',
        cancelled: 'Dibatalkan'
    }
    return labels[status] || status
}

const getStatusBadgeClass = (status) => {
    const classes = {
        draft: 'badge bg-label-warning',
        approved: 'badge bg-label-success',
        paid: 'badge bg-label-info',
        cancelled: 'badge bg-label-danger'
    }
    return classes[status] || 'badge bg-label-secondary'
}

const openExpenseDetails = (expenseId) => {
    router.push({ path: `/accounting/expenses/detail`, query: { id: expenseId } })
}

const exportData = (format) => {
    if (format === 'csv') {
        myDataTableRef.value.exportCSV()
    }
}

const onFileChange = (event) => {
    const files = Array.from(event.target.files)
    form.value.attachments = files
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions();


// Lifecycle
let modalInstance = null
onMounted(async () => {
    await permissionStore.fetchPermissions()
    userStore.loadUser()
    if (expenseStore.expenses.length === 0) {
        await expenseStore.fetchExpenses()
    }
    
    const modalElement = document.getElementById('ExpenseModal')
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
    expenseStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => expenseStore.setPagination(event)

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    await expenseStore.fetchExpenses()
}

const handleSearch = (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    expenseStore.fetchExpenses()
}

const onSort = (event) => expenseStore.setSort(event)
</script>

<style scoped>
.badge {
    font-size: 0.75rem;
}
</style>