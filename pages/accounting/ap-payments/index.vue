<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0 text-gray-800">AP Payments</h1>
        <p class="text-muted">Manajemen Pembayaran ke Vendor</p>
      </div>
      <div v-if="userHasPermission('ap-payments.create')">
        <button 
          @click="openModal()" 
          class="btn btn-primary"
          :disabled="apPaymentStore.loading"
        >
          <i class="fas fa-plus me-2"></i>
          Tambah Pembayaran
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Total Pembayaran
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ apPaymentStore.totalRecords }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-credit-card fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-success shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                  Draft
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ draftCount }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-file-alt fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-info shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                  Dikonfirmasi
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ confirmedCount }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-check-circle fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-warning shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                  Total Amount
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ formatRupiah.format(totalAmount) }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-calculator fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card shadow mb-4">
      <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
        <h6 class="m-0 font-weight-bold text-primary">Daftar Pembayaran ke Vendor</h6>
        <div class="d-flex gap-2">
          <button 
            @click="exportData" 
            class="btn btn-sm btn-outline-secondary"
            :disabled="apPaymentStore.loading"
          >
            <i class="fas fa-download me-1"></i>
            Export
          </button>
        </div>
      </div>
      <div class="card-body">
        <MyDataTable
          :value="apPaymentStore.payments"
          :loading="apPaymentStore.loading"
          :total-records="apPaymentStore.totalRecords"
          :rows="params.rows"
          :first="params.first"
          :sort-field="params.sortField"
          :sort-order="params.sortOrder"
          :global-filter="globalFilterValue"
          @page="onPage"
          @sort="onSort"
          @rows-change="handleRowsChange"
          @search="handleSearch"
        >
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Pembayaran ke Vendor</h5>
              <div class="d-flex gap-2">
                <input
                  v-model="globalFilterValue"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Cari..."
                  style="width: 200px;"
                />
              </div>
            </div>
          </template>

          <Column field="reference_number" header="No. Referensi" sortable>
            <template #body="{ data }">
              <span class="fw-bold">{{ data.reference_number }}</span>
            </template>
          </Column>

          <Column field="date" header="Tanggal" sortable>
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>

          <Column field="vendor.name" header="Vendor" sortable>
            <template #body="{ data }">
              <div>
                <div class="fw-bold">{{ data.vendor?.name || '-' }}</div>
                <small class="text-muted">{{ data.vendor?.code || '' }}</small>
              </div>
            </template>
          </Column>

          <Column field="payment_method" header="Metode Pembayaran" sortable>
            <template #body="{ data }">
              <span :class="getPaymentMethodBadgeClass(data.payment_method)">
                {{ getPaymentMethodLabel(data.payment_method) }}
              </span>
            </template>
          </Column>

          <Column field="amount" header="Jumlah" sortable>
            <template #body="{ data }">
              <div class="text-end">
                <div class="fw-bold">{{ formatRupiah.format(data.amount) }}</div>
                <small class="text-muted">{{ data.currency }}</small>
              </div>
            </template>
          </Column>

          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <span :class="getStatusBadgeClass(data.status)">
                {{ getStatusLabel(data.status) }}
              </span>
            </template>
          </Column>

          <Column header="Aksi" :exportable="false" style="min-width: 8rem">
            <template #body="{ data }">
              <div class="d-flex gap-1">
                <button
                  v-if="userHasPermission('ap-payments.read')"
                  @click="viewDetail(data)"
                  class="btn btn-sm btn-info"
                  title="Lihat Detail"
                >
                  <i class="fas fa-eye"></i>
                </button>
                
                <button
                  v-if="userHasPermission('ap-payments.update') && data.status === 'draft'"
                  @click="openModal(data)"
                  class="btn btn-sm btn-warning"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>
                
                <button
                  v-if="userHasPermission('ap-payments.delete') && data.status === 'draft'"
                  @click="deletePayment(data.id)"
                  class="btn btn-sm btn-danger"
                  title="Hapus"
                >
                  <i class="fas fa-trash"></i>
                </button>
                
                <button
                  v-if="userHasPermission('ap-payments.confirm') && data.status === 'draft'"
                  @click="confirmPayment(data.id)"
                  class="btn btn-sm btn-success"
                  title="Konfirmasi"
                >
                  <i class="fas fa-check"></i>
                </button>
              </div>
            </template>
          </Column>
        </MyDataTable>
      </div>
    </div>

    <!-- Modal Form -->
    <Modal
      v-model="apPaymentStore.showModal"
      :title="apPaymentStore.isEditMode ? 'Edit Pembayaran' : 'Tambah Pembayaran'"
      size="lg"
      @close="apPaymentStore.closeModal()"
    >
      <form @submit.prevent="apPaymentStore.savePayment()">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">No. Referensi <span class="text-danger">*</span></label>
              <input
                v-model="apPaymentStore.form.reference_number"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': hasError('reference_number') }"
                required
              />
              <div v-if="hasError('reference_number')" class="invalid-feedback">
                {{ getError('reference_number') }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Tanggal <span class="text-danger">*</span></label>
              <input
                v-model="apPaymentStore.form.date"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': hasError('date') }"
                required
              />
              <div v-if="hasError('date')" class="invalid-feedback">
                {{ getError('date') }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Vendor <span class="text-danger">*</span></label>
              <select
                v-model="apPaymentStore.form.vendor_id"
                class="form-select"
                :class="{ 'is-invalid': hasError('vendor_id') }"
                required
              >
                <option value="">Pilih Vendor</option>
                <option
                  v-for="vendor in apPaymentStore.vendors"
                  :key="vendor.id"
                  :value="vendor.id"
                >
                  {{ vendor.code }} - {{ vendor.name }}
                </option>
              </select>
              <div v-if="hasError('vendor_id')" class="invalid-feedback">
                {{ getError('vendor_id') }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Invoice (Opsional)</label>
              <select
                v-model="apPaymentStore.form.invoice_id"
                class="form-select"
                :class="{ 'is-invalid': hasError('invoice_id') }"
              >
                <option value="">Pilih Invoice</option>
                <option
                  v-for="invoice in apPaymentStore.invoices"
                  :key="invoice.id"
                  :value="invoice.id"
                >
                  {{ invoice.reference_number }} - {{ formatRupiah.format(invoice.total_amount) }}
                </option>
              </select>
              <div v-if="hasError('invoice_id')" class="invalid-feedback">
                {{ getError('invoice_id') }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Metode Pembayaran <span class="text-danger">*</span></label>
              <select
                v-model="apPaymentStore.form.payment_method"
                class="form-select"
                :class="{ 'is-invalid': hasError('payment_method') }"
                required
              >
                <option
                  v-for="method in apPaymentStore.paymentMethods"
                  :key="method.value"
                  :value="method.value"
                >
                  {{ method.label }}
                </option>
              </select>
              <div v-if="hasError('payment_method')" class="invalid-feedback">
                {{ getError('payment_method') }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Rekening Bank</label>
              <select
                v-model="apPaymentStore.form.bank_account_id"
                class="form-select"
                :class="{ 'is-invalid': hasError('bank_account_id') }"
                :required="apPaymentStore.form.payment_method !== 'cash'"
              >
                <option value="">Pilih Rekening Bank</option>
                <option
                  v-for="account in apPaymentStore.bankAccounts"
                  :key="account.id"
                  :value="account.id"
                >
                  {{ account.name }} - {{ account.account_number }}
                </option>
              </select>
              <div v-if="hasError('bank_account_id')" class="invalid-feedback">
                {{ getError('bank_account_id') }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Jumlah <span class="text-danger">*</span></label>
              <input
                v-model.number="apPaymentStore.form.amount"
                type="number"
                step="0.01"
                class="form-control"
                :class="{ 'is-invalid': hasError('amount') }"
                required
              />
              <div v-if="hasError('amount')" class="invalid-feedback">
                {{ getError('amount') }}
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Mata Uang <span class="text-danger">*</span></label>
              <select
                v-model="apPaymentStore.form.currency"
                class="form-select"
                :class="{ 'is-invalid': hasError('currency') }"
                required
              >
                <option
                  v-for="currency in apPaymentStore.currencies"
                  :key="currency.value"
                  :value="currency.value"
                >
                  {{ currency.label }}
                </option>
              </select>
              <div v-if="hasError('currency')" class="invalid-feedback">
                {{ getError('currency') }}
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Kurs Tukar</label>
              <input
                v-model.number="apPaymentStore.form.exchange_rate"
                type="number"
                step="0.0001"
                class="form-control"
                :class="{ 'is-invalid': hasError('exchange_rate') }"
                :disabled="apPaymentStore.form.currency === 'IDR'"
              />
              <div v-if="hasError('exchange_rate')" class="invalid-feedback">
                {{ getError('exchange_rate') }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Status</label>
              <select
                v-model="apPaymentStore.form.status"
                class="form-select"
                :class="{ 'is-invalid': hasError('status') }"
              >
                <option
                  v-for="status in apPaymentStore.statuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
              <div v-if="hasError('status')" class="invalid-feedback">
                {{ getError('status') }}
              </div>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Catatan</label>
          <textarea
            v-model="apPaymentStore.form.notes"
            class="form-control"
            :class="{ 'is-invalid': hasError('notes') }"
            rows="3"
          ></textarea>
          <div v-if="hasError('notes')" class="invalid-feedback">
            {{ getError('notes') }}
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            @click="apPaymentStore.closeModal()"
            class="btn btn-secondary"
            :disabled="apPaymentStore.loading"
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="apPaymentStore.loading"
          >
            <span v-if="apPaymentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ apPaymentStore.isEditMode ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAPPaymentStore } from '~/stores/ap-payments'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'

// Page meta
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Stores
const apPaymentStore = useAPPaymentStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const globalFilterValue = ref('')
const params = ref({
  first: 0,
  rows: 10,
  sortField: 'date',
  sortOrder: -1
})

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions();

// Lifecycle
onMounted(async () => {
  await permissionStore.fetchPermissions()
  await userStore.loadUser()
  if (apPaymentStore.payments.length === 0) {
    await apPaymentStore.fetchPayments()
  }
  
  // Initialize table controls
  params.value.rows = Number(params.value.rows) || 10;
  params.value.search = globalFilterValue.value;
})

// Computed
const draftCount = computed(() => 
  apPaymentStore.payments.filter(p => p.status === 'draft').length
)

const confirmedCount = computed(() => 
  apPaymentStore.payments.filter(p => p.status === 'confirmed').length
)

const totalAmount = computed(() => 
  apPaymentStore.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
)

// Methods
const openModal = (payment) => {
  apPaymentStore.openModal(payment)
}

const deletePayment = (id) => {
  apPaymentStore.deletePayment(id)
}

const confirmPayment = (id) => {
  apPaymentStore.confirmPayment(id)
}

const viewDetail = (payment) => {
  router.push(`/accounting/ap-payments/${payment.id}`)
}

const exportData = () => {
  // Implement export functionality
  console.log('Export data')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID')
}

const getPaymentMethodLabel = (method) => {
  const methodObj = apPaymentStore.paymentMethods.find(m => m.value === method)
  return methodObj ? methodObj.label : method
}

const getPaymentMethodBadgeClass = (method) => {
  const classes = {
    cash: 'badge bg-success',
    bank_transfer: 'badge bg-primary',
    check: 'badge bg-info',
    credit_card: 'badge bg-warning',
    giro: 'badge bg-secondary'
  }
  return classes[method] || 'badge bg-secondary'
}

const getStatusLabel = (status) => {
  const statusObj = apPaymentStore.statuses.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    draft: 'badge bg-warning',
    confirmed: 'badge bg-success',
    cancelled: 'badge bg-danger'
  }
  return classes[status] || 'badge bg-secondary'
}

const hasError = (field) => {
  return apPaymentStore.validationErrors.some(error => 
    error.toLowerCase().includes(field.toLowerCase())
  )
}

const getError = (field) => {
  return apPaymentStore.validationErrors.find(error => 
    error.toLowerCase().includes(field.toLowerCase())
  ) || ''
}

// Table handlers
const onSort = (event) => apPaymentStore.setSort(event)
const onPage = (event) => apPaymentStore.setPagination(event)

const handleRowsChange = async (value) => {
  const rowsValue = Number(value) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  await apPaymentStore.fetchPayments()
}

const handleSearch = async (value) => {
  globalFilterValue.value = value
  params.value.first = 0
  await apPaymentStore.fetchPayments()
}
</script>

<style scoped>
.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.text-gray-300 {
  color: #dddfeb !important;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.text-xs {
  font-size: 0.7rem;
}

.font-weight-bold {
  font-weight: 700 !important;
}

.text-uppercase {
  text-transform: uppercase !important;
}
</style>