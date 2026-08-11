<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-pt-10">
            <h4 class="mb-1">Penerimaan Piutang</h4>
            <p class="mb-6">
                Kelola penerimaan pembayaran dari pelanggan
            </p>

            <!-- Receipt Statistics Cards -->
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
                                <p class="mb-0">Total Penerimaan</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-money-dollar-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ receipts.length }}</h5>
                                    <span class="text-muted">Penerimaan Aktif</span>
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
                                        <i class="ri-file-list-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ draftCount }}</h5>
                                    <span class="text-muted">Menunggu Konfirmasi</span>
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
                                <p class="mb-0">Dikonfirmasi</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-checkbox-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ confirmedCount }}</h5>
                                    <span class="text-muted">Sudah Dikonfirmasi</span>
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
                                    <span class="avatar-initial rounded bg-label-info">
                                        <i class="ri-exchange-funds-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ formatCurrency(totalAmount) }}</h5>
                                    <span class="text-muted">Total Penerimaan</span>
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
                    <h4 class="mt-6 mb-1">Daftar Penerimaan Piutang</h4>
                    <p class="mb-0">Kelola semua penerimaan pembayaran dari pelanggan.</p>
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
                                    v-if="userHasPermission('create_ar_receipt') || userHasRole('superadmin')"
                                    @click="receiptStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Penerimaan
                                </button>
                                <button @click="exportData('csv')" class="btn btn-outline-secondary">
                                    <i class="ri-download-line me-1"></i>
                                    Export
                                </button>
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari nomor referensi, pelanggan..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="receipts"
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
                                <Column field="reference_number" header="No. Referensi" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.reference_number }}</span>
                                    </template>
                                </Column>
                                <Column field="date" header="Tanggal" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="text-muted">{{ formatDate(slotProps.data.date) }}</span>
                                    </template>
                                </Column>
                                <Column field="customer.name" header="Pelanggan" :sortable="true" style="min-width:200px">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="fw-semibold">{{ slotProps.data.customer?.name || 'N/A' }}</div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="payment_method" header="Metode Pembayaran" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="badge bg-label-secondary">
                                            {{ getPaymentMethodLabel(slotProps.data.payment_method) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="amount" header="Jumlah" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold text-success">
                                            {{ formatCurrency(slotProps.data.amount, slotProps.data.currency) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="status" header="Status" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span >
                                            {{ getStatusLabel(slotProps.data.status) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <button @click="receiptStore.openModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="slotProps.data.status === 'draft' && (userHasPermission('edit_ar_receipt') || userHasRole('superadmin'))">
                                            <i class="ri-edit-box-line ri-20px"></i>
                                        </button>
                                        <button @click="confirmReceipt(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="slotProps.data.status === 'draft' && (userHasPermission('approve_ar_receipt') || userHasRole('superadmin'))">
                                            <i class="ri-checkbox-circle-line ri-20px"></i>
                                        </button>
                                        <button @click="cancelReceipt(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="slotProps.data.status === 'confirmed' && (userHasPermission('approve_ar_receipt') || userHasRole('superadmin'))" title="Batalkan">
                                            <i class="ri-close-circle-line ri-20px"></i>
                                        </button>
                                        <button @click="receiptStore.deleteReceipt(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon" v-if="slotProps.data.status === 'draft' && (userHasPermission('delete_ar_receipt') || userHasRole('superadmin'))">
                                            <i class="ri-delete-bin-7-line ri-20px"></i>
                                        </button>
                                    </template>
                                </Column>
                            </MyDataTable>
                        </div>
                    </div>
                </div>

                <!-- Receipt Modal -->
                <Modal 
                    id="ReceiptModal"
                    :title="modalTitle" 
                    :description="modalDescription"
                    :validation-errors-from-parent="validationErrors"
                >
                    <template #default>
                        <form @submit.prevent="receiptStore.saveReceipt()">
                            <div class="row g-6">
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="form.reference_number" 
                                            placeholder="Masukkan nomor referensi"
                                            
                                        >
                                        <label>Nomor Referensi *</label>
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
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.customer_id"
                                            
                                        >
                                            <option value="">Pilih Pelanggan</option>
                                            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                                                {{ customer.name }}
                                            </option>
                                        </select>
                                        <label>Pelanggan *</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.invoice_id"
                                            @change="receiptStore.syncPrimaryAllocation()"
                                        >
                                            <option value="">Pilih Invoice (Opsional)</option>
                                            <option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
                                                {{ invoice.reference_number }} - {{ formatCurrency(invoice.total_amount, invoice.currency) }}
                                            </option>
                                        </select>
                                        <label>Invoice</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.payment_method"
                                            
                                        >
                                            <option value="">Pilih Metode Pembayaran</option>
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
                                            v-model="form.bank_account_id"
                                        >
                                            <option value="">Pilih Rekening Bank (Opsional)</option>
                                            <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                                                {{ account.bank_name }} - {{ account.account_number }}
                                            </option>
                                        </select>
                                        <label>Rekening Bank</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input 
                                            type="number" 
                                            class="form-control" 
                                            v-model="form.amount" 
                                            step="0.01"
                                            min="0"
                                            placeholder="Masukkan jumlah"
                                            @change="receiptStore.syncPrimaryAllocation()"
                                        >
                                        <label>Jumlah *</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                    <label class="form-label mb-0">Alokasi multi-invoice (opsional)</label>
                                    <button type="button" class="btn btn-sm btn-outline-primary" @click="receiptStore.addAllocation()">+ Baris</button>
                                  </div>
                                  <div class="table-responsive">
                                    <table class="table table-sm">
                                      <thead>
                                        <tr>
                                          <th>Invoice</th>
                                          <th style="width:160px">Amount</th>
                                          <th style="width:50px"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr v-for="(row, idx) in (form.allocations || [])" :key="idx">
                                          <td>
                                            <select v-model="row.salesInvoiceId" class="form-select form-select-sm">
                                              <option value="">Pilih invoice</option>
                                              <option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
                                                {{ invoice.reference_number || invoice.noInvoice || invoice.id }}
                                              </option>
                                            </select>
                                          </td>
                                          <td>
                                            <input v-model.number="row.amount" type="number" min="0" step="0.01" class="form-control form-control-sm" />
                                          </td>
                                          <td>
                                            <button type="button" class="btn btn-sm btn-outline-danger" @click="receiptStore.removeAllocation(idx)">×</button>
                                          </td>
                                        </tr>
                                        <tr v-if="!(form.allocations || []).length">
                                          <td colspan="3" class="text-muted small">Kosong = pakai invoice utama di atas (1:1).</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <div class="small" :class="Math.abs(receiptStore.allocationTotal() - Number(form.amount || 0)) > 0.01 && (form.allocations || []).length ? 'text-danger' : 'text-muted'">
                                    Total alokasi: {{ formatCurrency(receiptStore.allocationTotal(), form.currency) }}
                                    <span v-if="(form.allocations || []).length"> / receipt {{ formatCurrency(form.amount || 0, form.currency) }}</span>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.currency"
                                            
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
                                            v-model="form.exchange_rate" 
                                            step="0.0001"
                                            min="0"
                                            placeholder="Masukkan kurs tukar"
                                            
                                        >
                                        <label>Kurs Tukar *</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input
                                            type="text"
                                            class="form-control"
                                            :value="getStatusLabel(form.status || 'draft')"
                                            readonly
                                            disabled
                                        >
                                        <label>Status (otomatis draft)</label>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-floating form-floating-outline">
                                        <textarea 
                                            class="form-control" 
                                            v-model="form.notes" 
                                            rows="3"
                                            placeholder="Masukkan catatan (opsional)"
                                        ></textarea>
                                        <label>Catatan</label>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-outline-secondary" @click="receiptStore.closeModal()">
                                    Tutup
                                </button>
                                <button type="submit" class="btn btn-primary" :disabled="saving">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
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
import { useARReceiptStore } from '~/stores/ar-receipts'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import Modal from '~/components/modal/Modal.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

const { setListTitle, setFormTitle } = useDynamicTitle()

// Stores
const receiptStore = useARReceiptStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

// Computed
const receipts = computed(() => {
  return Array.isArray(receiptStore.receipts) ? receiptStore.receipts : []
})
const loading = computed(() => receiptStore.loading)
const saving = computed(() => receiptStore.saving)
const totalRecords = computed(() => {
  return typeof receiptStore.totalRecords === 'number' ? receiptStore.totalRecords : 0
})
const params = computed(() => {
  return receiptStore.params || {
    first: 0,
    rows: 10,
    sortField: 'reference_number',
    sortOrder: 1,
    search: ''
  }
})
const form = computed(() => receiptStore.form)
const isEditMode = computed(() => receiptStore.isEditMode)
const showModal = computed(() => receiptStore.showModal)
const validationErrors = computed(() => {
  return Array.isArray(receiptStore.validationErrors) ? receiptStore.validationErrors : []
})
const customers = computed(() => {
  return Array.isArray(receiptStore.customers) ? receiptStore.customers : []
})
const invoices = computed(() => {
  return Array.isArray(receiptStore.invoices) ? receiptStore.invoices : []
})
const paymentMethods = computed(() => {
  return Array.isArray(receiptStore.paymentMethods) ? receiptStore.paymentMethods : []
})
const bankAccounts = computed(() => {
  return Array.isArray(receiptStore.bankAccounts) ? receiptStore.bankAccounts : []
})
const currencies = computed(() => {
  return Array.isArray(receiptStore.currencies) ? receiptStore.currencies : []
})
const statuses = computed(() => {
  return Array.isArray(receiptStore.statuses) ? receiptStore.statuses : []
})

// Statistics
const draftCount = computed(() => {
  if (!Array.isArray(receipts.value)) return 0
  return receipts.value.filter(receipt => receipt.status === 'draft').length
})
const confirmedCount = computed(() => {
  if (!Array.isArray(receipts.value)) return 0
  return receipts.value.filter(receipt => receipt.status === 'confirmed').length
})
const totalAmount = computed(() => {
  if (!Array.isArray(receipts.value)) return 0
  return receipts.value.reduce((sum, receipt) => sum + (receipt.amount || 0), 0)
})

// Modal
const modalTitle = computed(() => isEditMode.value ? 'Edit Penerimaan' : 'Tambah Penerimaan Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data penerimaan di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan penerimaan baru.')

// Methods
const getStatusBadgeClass = (status) => {
    const classes = {
        draft: 'badge bg-label-warning',
        confirmed: 'badge bg-label-success',
        cancelled: 'badge bg-label-danger'
    }
    return classes[status] || 'badge bg-label-secondary'
}

const getStatusLabel = (status) => {
    const labels = {
        draft: 'Draft',
        confirmed: 'Dikonfirmasi',
        cancelled: 'Dibatalkan'
    }
    return labels[status] || status
}

const getPaymentMethodLabel = (method) => {
    const methodObj = paymentMethods.value.find(m => m.value === method)
    return methodObj ? methodObj.label : method
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('id-ID')
}

const formatCurrency = (amount, currency = 'IDR') => {
    if (!amount) return '0'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency
    }).format(amount)
}

const confirmReceipt = async (id) => {
    await receiptStore.confirmReceipt(id)
}

const cancelReceipt = async (id) => {
    await receiptStore.cancelReceipt(id)
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
        await receiptStore.fetchReceipts()
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
    setListTitle('AR Receipts', receipts.value.length)
})

// Watchers
watch(showModal, (newValue) => {
    if (newValue) {
        // Delay untuk memastikan modal sudah di-render
        nextTick(() => {
            const modalElement = document.getElementById('ReceiptModal')
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
    receiptStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => {
    receiptStore.setPagination(event)
}

const onSort = (event) => {
    receiptStore.setSort(event)
}

const handleRowsChange = async (value) => {
    const rowsValue = Number(value) || 10
    receiptStore.params.rows = rowsValue
    receiptStore.params.first = 0
    await receiptStore.fetchReceipts()
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    receiptStore.params.first = 0
    await receiptStore.fetchReceipts()
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'AR Receipts',
  description: 'Accounts Receivable Receipt Management',
  keywords: 'AR Receipts, Accounts Receivable, Accounting, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
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
