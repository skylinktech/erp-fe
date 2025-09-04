<template>
  <div class="content-wrapper">
    <!-- Content -->
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">Pembayaran ke Vendor</h4>
      <p class="mb-6">
        Kelola pembayaran ke vendor untuk transaksi keuangan
      </p>

      <!-- Payment Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6" v-if="apPaymentStore.loading">
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
                <p class="mb-0">Total Pembayaran</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-money-dollar-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="payment-heading">
                  <h5 class="mb-1">{{ apPaymentStore.totalRecords }}</h5>
                  <span class="text-muted">Pembayaran Aktif</span>
                </div>
                <a href="javascript:void(0);" class="text-secondary">
                  <i class="ri-file-copy-line ri-22px"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6" v-if="apPaymentStore.loading">
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
                <div class="payment-heading">
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
        <div class="col-xl-3 col-lg-6 col-md-6" v-if="apPaymentStore.loading">
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
                <div class="payment-heading">
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
        <div class="col-xl-3 col-lg-6 col-md-6" v-if="apPaymentStore.loading">
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
                <div class="payment-heading">
                  <h5 class="mb-1">{{ formatRupiah(totalAmount) }}</h5>
                  <span class="text-muted">Total Pembayaran</span>
                </div>
                <a href="javascript:void(0);" class="text-secondary">
                  <i class="ri-file-copy-line ri-22px"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Table -->
      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Daftar Pembayaran ke Vendor</h4>
          <p class="mb-0">Kelola semua pembayaran ke vendor dalam sistem.</p>
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
                  v-if="userHasPermission('create_ap_payment') || userHasRole('superadmin')"
                  @click="openModal()" 
                  class="btn btn-primary">
                  <i class="ri-add-line me-1"></i>
                  Tambah Pembayaran
                </button>
                <button @click="exportData()" class="btn btn-outline-secondary">
                  <i class="ri-download-line me-1"></i>
                  Export
                </button>
                <span class="p-input-icon-left">
                  <InputText v-model="globalFilterValue" placeholder="Cari nomor referensi, vendor..." class="w-full md:w-20rem" />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable 
                ref="myDataTableRef"
                :data="apPaymentStore.payments"
                :rows="Number(params.rows)" 
                :loading="apPaymentStore.loading"
                :totalRecords="apPaymentStore.totalRecords"
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
                <Column field="vendor.name" header="Vendor" :sortable="true" style="min-width:200px">
                  <template #body="slotProps">
                    <div>
                      <div class="fw-semibold">{{ slotProps.data.vendor?.name || 'N/A' }}</div>
                      <small class="text-muted">{{ slotProps.data.vendor?.code || '' }}</small>
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
                      {{ formatRupiah(slotProps.data.amount) }}
                    </span>
                    <div class="text-muted">{{ slotProps.data.currency }}</div>
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true" style="min-width:120px">
                  <template #body="slotProps">
                    <span :class="getStatusBadgeClass(slotProps.data.status)">
                      {{ getStatusLabel(slotProps.data.status) }}
                    </span>
                  </template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:8rem">
                  <template #body="slotProps">
                    <button @click="viewDetail(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="userHasPermission('show_ap_payment')">
                      <i class="ri-eye-line ri-20px"></i>
                    </button>
                    <button @click="openModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="userHasPermission('edit_ap_payment') && slotProps.data.status === 'draft'">
                      <i class="ri-edit-box-line ri-20px"></i>
                    </button>
                    <button @click="confirmPayment(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2" v-if="userHasPermission('approve_ap_payment') && slotProps.data.status === 'draft'">
                      <i class="ri-checkbox-circle-line ri-20px"></i>
                    </button>
                    <button @click="deletePayment(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon" v-if="userHasPermission('delete_ap_payment') && slotProps.data.status === 'draft'">
                      <i class="ri-delete-bin-7-line ri-20px"></i>
                    </button>
                  </template>
                </Column>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <Modal 
      id="PaymentModal"
      :title="modalTitle" 
      :description="modalDescription"
      :validation-errors-from-parent="validationErrors"
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
              <v-select 
                v-model="apPaymentStore.form.vendor_id" 
                :options="apPaymentStore.vendors" 
                label="name" 
                :reduce="v => v.id" 
                placeholder="Pilih Vendor" 
                class="v-select-style"
                :class="{ 'is-invalid': hasError('vendor_id') }"
                :searchable="true"
                :clearable="true"
                :close-on-select="true"
                :max-height="300"
                :max-options="100"
                no-options-text="Tidak ada vendor yang tersedia"
                no-results-text="Tidak ada vendor yang cocok dengan pencarian"
                required
              >
                <template #option="option">
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                      <div class="fw-bold">{{ option.name }}</div>
                      <small class="text-muted">{{ option.code }}</small>
                    </div>
                  </div>
                </template>
                <template #no-options>
                  <div class="text-center p-3">
                    <i class="ri-search-line me-2"></i>
                    Tidak ada vendor yang tersedia
                  </div>
                </template>
                <template #no-results>
                  <div class="text-center p-3">
                    <i class="ri-search-line me-2"></i>
                    Tidak ada vendor yang cocok dengan pencarian
                  </div>
                </template>
              </v-select>
              <div v-if="hasError('vendor_id')" class="invalid-feedback">
                {{ getError('vendor_id') }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Invoice (Opsional)</label>
              <v-select 
                v-model="apPaymentStore.form.invoice_id" 
                :options="apPaymentStore.invoices" 
                label="reference_number" 
                :reduce="v => v.id" 
                placeholder="Pilih Invoice" 
                class="v-select-style"
                :class="{ 'is-invalid': hasError('invoice_id') }"
                :searchable="true"
                :clearable="true"
                :close-on-select="true"
                :max-height="300"
                :max-options="100"
                no-options-text="Tidak ada invoice yang tersedia"
                no-results-text="Tidak ada invoice yang cocok dengan pencarian"
              >
                <template #option="option">
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                      <div class="fw-bold">{{ option.reference_number }}</div>
                      <small class="text-muted">{{ formatRupiah(option.total_amount) }}</small>
                    </div>
                  </div>
                </template>
                <template #no-options>
                  <div class="text-center p-3">
                    <i class="ri-search-line me-2"></i>
                    Tidak ada invoice yang tersedia
                  </div>
                </template>
                <template #no-results>
                  <div class="text-center p-3">
                    <i class="ri-search-line me-2"></i>
                    Tidak ada invoice yang cocok dengan pencarian
                  </div>
                </template>
              </v-select>
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
          <div class="col-md-3">
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
          
          <div class="col-md-3">
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
          
          <div class="col-md-3">
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
          <div class="col-md-3">
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
          <div class="col-md-12">
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
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3">
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
import { useFormatRupiah } from '~/composables/formatRupiah'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const { setListTitle, setFormTitle } = useDynamicTitle()

// Stores
const apPaymentStore = useAPPaymentStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

const formatRupiah = useFormatRupiah()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions();

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

const params = computed(() => apPaymentStore.params || {})

// Modal
const modalTitle = computed(() => apPaymentStore.isEditMode ? 'Edit Pembayaran' : 'Tambah Pembayaran Baru')
const modalDescription = computed(() => apPaymentStore.isEditMode ? 'Silakan ubah data pembayaran di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan pembayaran baru.')
const showModal = computed(() => apPaymentStore.showModal || false)
const validationErrors = computed(() => apPaymentStore.validationErrors || [])

// Lifecycle
onMounted(async () => {
  try {
    await permissionStore.fetchPermissions()
    await userStore.loadUser()
    if (apPaymentStore.payments.length === 0) {
      await apPaymentStore.fetchPayments()
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
  setListTitle('AP Payments', apPaymentStore.payments.length)
})

// Watchers
watch(showModal, async (newValue) => {
  if (newValue) {
    // Delay untuk memastikan modal sudah di-render
    nextTick(() => {
      const modalElement = document.getElementById('PaymentModal')
      if (modalElement && typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modalElement)
        bsModal.show()
      }
    })
  } else {
    // Hapus modal backdrop dan modal dari DOM
    nextTick(() => {
      // Hapus modal backdrop
      const backdrop = document.querySelector('.modal-backdrop')
      if (backdrop) {
        backdrop.remove()
      }
      
      // Hapus modal dari DOM
      const modalElement = document.getElementById('PaymentModal')
      if (modalElement) {
        modalElement.remove()
      }
      
      // Hapus class modal-open dari body
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    })
  }
})

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
    cash: 'badge bg-label-success',
    bank_transfer: 'badge bg-label-primary',
    check: 'badge bg-label-info',
    credit_card: 'badge bg-label-warning',
    giro: 'badge bg-label-secondary'
  }
  return classes[method] || 'badge bg-label-secondary'
}

const getStatusLabel = (status) => {
  const statusObj = apPaymentStore.statuses.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    draft: 'badge bg-label-warning',
    confirmed: 'badge bg-label-success',
    cancelled: 'badge bg-label-danger'
  }
  return classes[status] || 'badge bg-label-secondary'
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

const debouncedSearch = useDebounceFn(() => {
  apPaymentStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => apPaymentStore.setPagination(event)
const onSort = (event) => apPaymentStore.setSort(event)

const handleRowsChange = async (value) => {
  const rowsValue = Number(value) || 10
  apPaymentStore.params.rows = rowsValue
  apPaymentStore.params.first = 0
  await apPaymentStore.fetchPayments()
}

const handleSearch = async (value) => {
  globalFilterValue.value = value
  apPaymentStore.params.first = 0
  await apPaymentStore.fetchPayments()
}
</script>

<style scoped>
.badge {
  font-size: 0.75rem;
}

.v-select-style {
  min-height: 48px;
}

:deep(.v-select-style .vs__dropdown-toggle) {
  height: 48px !important;
  border-radius: 7px;
  border: 1px solid #d1d7e0 !important;
  background-color: #fff !important;
}

:deep(.v-select-style .vs__dropdown-toggle:focus-within) {
  border-color: #696cff !important;
  box-shadow: 0 0 0.375rem 0.25rem rgba(105, 108, 255, 0.08) !important;
}

:deep(.v-select-style.is-invalid .vs__dropdown-toggle) {
  border-color: #dc3545 !important;
}

:deep(.v-select-style .vs__dropdown-menu) {
  max-height: 300px !important;
  overflow-y: auto !important;
  z-index: 1000 !important;
  border: 1px solid #ddd !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

:deep(.v-select-style .vs__dropdown-option) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

:deep(.v-select-style .vs__dropdown-option:hover) {
  background-color: #f8f9fa !important;
}

:deep(.v-select-style .vs__dropdown-option--highlight) {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
}

:deep(.v-select-style .vs__search) {
  padding: 8px 12px !important;
  font-size: 14px !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
}

:deep(.v-select-style .vs__search::placeholder) {
  color: #a1acb8 !important;
}

:deep(.v-select-style .vs__selected) {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  border: 1px solid #1976d2 !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
  margin: 2px !important;
}

:deep(.v-select-style .vs__dropdown-option--selected) {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  font-weight: 600 !important;
}

:deep(.v-select-style .vs__clear) {
  color: #6c757d !important;
  font-size: 16px !important;
  padding: 4px !important;
  margin-right: 8px !important;
  display: block !important;
  visibility: visible !important;
}

:deep(.v-select-style .vs__clear:hover) {
  color: #dc3545 !important;
}

:deep(.v-select-style .vs__open-indicator) {
  color: #6c757d !important;
  margin-right: 8px !important;
}

:deep(.v-select-style.vs--has-value .vs__clear) {
  display: block !important;
  visibility: visible !important;
}

:deep(.v-select-style .vs__dropdown-toggle .vs__selected-options) {
  padding: 0.5rem 0.75rem !important;
}

:deep(.v-select-style .vs__actions) {
  padding: 0.5rem 0.75rem !important;
}

:deep(.v-select-style .vs__dropdown-toggle:focus-within) {
  border-color: #696cff !important;
  box-shadow: 0 0 0.375rem 0.25rem rgba(105, 108, 255, 0.08) !important;
}

:deep(.v-select-style.is-invalid .vs__dropdown-toggle) {
  border-color: #dc3545 !important;
}

:deep(.v-select-style .vs__search::placeholder) {
  color: #a1acb8 !important;
}

:deep(.v-select-style .vs__dropdown-toggle .vs__selected-options) {
  padding: 0.5rem 0.75rem !important;
}

:deep(.v-select-style .vs__actions) {
  padding: 0.5rem 0.75rem !important;
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