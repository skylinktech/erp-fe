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
                    <span >
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
              <label class="form-label">Invoice (Opsional)</label>
              <CustomSelect2 
                v-model="apPaymentStore.form.invoice_id" 
                :options="apPaymentStore.invoices" 
                :get-option-label="getInvoiceLabel" 
                :reduce="option => option.id" 
                placeholder="Pilih Invoice"
                searchable
                clearable
                :close-on-select="true"
              >
                <template #option="slotProps">
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                      <div class="fw-bold">{{ slotProps.option.noInvoice || '-' }}</div>
                      <small class="text-muted">{{ slotProps.option.vendor?.name || 'No Vendor' }}</small>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">{{ formatDate(slotProps.option.paymentDate) }}</small>
                      <div class="fw-semibold ms-3">{{ formatRupiah(slotProps.option.total || 0) }}</div>
                    </div>
                  </div>
                </template>
                <template #selection="slotProps">
                  <div class="d-flex align-items-center">
                    <span class="fw-bold text-primary me-2">{{ slotProps.option.noInvoice || '-' }}</span>
                    <small class="text-muted">{{ slotProps.option.vendor?.name || '' }}</small>
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
              </CustomSelect2>
              <div v-if="hasError('invoice_id')" class="invalid-feedback">
                {{ getError('invoice_id') }}
              </div>
            </div>
          </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Vendor <span class="text-danger">*</span></label>
                <CustomSelect2 
                  v-model="apPaymentStore.form.vendor_id" 
                  :options="vendorOptions" 
                  :get-option-label="option => option.name" 
                  :reduce="option => option.id" 
                  searchable 
                  clearable 
                  placeholder="Pilih Vendor" 
                  :close-on-select="true"
                  :loading="apPaymentStore.loading"
                  :disabled="!!apPaymentStore.form.invoice_id"
              >
                <template #option="slotProps">
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                      <div class="fw-bold">{{ slotProps.option.name }}</div>
                      <small class="text-muted">{{ slotProps.option.email || slotProps.option.phone || slotProps.option.address || 'No contact info' }}</small>
                    </div>
                  </div>
                </template>
                <template #selection="slotProps">
                  <div class="d-flex align-items-center">
                    <span class="fw-bold text-primary me-2">{{ slotProps.option.name }}</span>
                    <small class="text-muted">{{ slotProps.option.email || slotProps.option.phone || slotProps.option.address || '' }}</small>
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
                </CustomSelect2>
                <div v-if="!!apPaymentStore.form.invoice_id" class="form-text mt-1">
                  <small class="text-muted">📋 Vendor diambil dari invoice yang dipilih</small>
                </div>
                <div v-if="hasError('vendor_id')" class="invalid-feedback">
                  {{ getError('vendor_id') }}
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
                
                :="apPaymentStore.form.payment_method !== 'cash'"
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
                :value="formatRupiah(apPaymentStore.form.amount || 0)"
                @input="updateAmountFromInput"
                type="text"
                class="form-control"
                placeholder="Rp 0"
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
            Tutup
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
import CustomSelect2 from '~/components/CustomSelect2.vue'
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

// Vendor data
const vendorOptions = computed(() => {
  return apPaymentStore.vendors || [];
})

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
    
    // Preload vendor data untuk dropdown
    if (apPaymentStore.vendors.length === 0) {
      await apPaymentStore.fetchVendors();
    }
    
    // Preload invoice data untuk dropdown
    if (apPaymentStore.invoices.length === 0) {
      await apPaymentStore.fetchInvoices();
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
const openModal = async (payment) => {
  apPaymentStore.openModal(payment)
  
  // Pastikan vendor data dimuat saat modal dibuka
  if (apPaymentStore.vendors.length === 0) {
    await apPaymentStore.fetchVendors();
  }
  
  // Pastikan invoice data dimuat saat modal dibuka
  if (apPaymentStore.invoices.length === 0) {
    await apPaymentStore.fetchInvoices();
  }
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

// Label untuk opsi invoice pada v-select
const getInvoiceLabel = (option) => {
  if (!option) return ''
  const parts = []
  if (option.noInvoice) parts.push(option.noInvoice)
  if (option.vendor && option.vendor.name) parts.push(option.vendor.name)
  return parts.join(' - ')
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

// Watch vendor data changes
watch(() => apPaymentStore.vendors, (newVendors) => {
  // Vendor data changed, no action needed as computed property will update
}, { deep: true })

// ✅ NEW: Watcher untuk auto fill vendor ketika invoice dipilih
watch(() => apPaymentStore.form.invoice_id, (newInvoiceId, oldInvoiceId) => {
  if (newInvoiceId && newInvoiceId !== oldInvoiceId) {
    // Cari invoice yang dipilih dari data invoices
    const selectedInvoice = apPaymentStore.invoices.find(invoice => invoice.id === newInvoiceId);
    
    if (selectedInvoice) {
      console.log('🧾 Invoice dipilih:', selectedInvoice);
      
      // Auto fill vendor dari invoice yang dipilih
      if (selectedInvoice.vendor && selectedInvoice.vendor.id) {
        apPaymentStore.form.vendor_id = selectedInvoice.vendor.id;
        console.log('👤 Auto fill vendor:', selectedInvoice.vendor.name);
      } else if (selectedInvoice.vendorId) {
        apPaymentStore.form.vendor_id = selectedInvoice.vendorId;
        console.log('👤 Auto fill vendor ID:', selectedInvoice.vendorId);
      }
      
      // Optional: Auto fill other related data from invoice
      if (selectedInvoice.total && !apPaymentStore.form.amount) {
        // Hitung remaining amount jika ada
        const remainingAmount = selectedInvoice.total - (selectedInvoice.paidAmount || 0);
        if (remainingAmount > 0) {
          apPaymentStore.form.amount = remainingAmount;
          console.log('💰 Auto fill amount with remaining:', remainingAmount);
        } else {
          apPaymentStore.form.amount = selectedInvoice.total;
          console.log('💰 Auto fill amount with total:', selectedInvoice.total);
        }
      }
      
      // Auto fill currency jika tersedia
      if (selectedInvoice.currency) {
        apPaymentStore.form.currency = selectedInvoice.currency;
        console.log('💱 Auto fill currency:', selectedInvoice.currency);
      }
      
      // Auto fill notes dengan referensi invoice
      if (!apPaymentStore.form.notes) {
        apPaymentStore.form.notes = `Pembayaran untuk Invoice ${selectedInvoice.noInvoice || selectedInvoice.id}`;
        console.log('📝 Auto fill notes');
      }
    }
  } else if (!newInvoiceId && oldInvoiceId) {
    // Jika invoice di-clear, reset vendor hanya jika tidak dalam edit mode
    if (!apPaymentStore.isEditMode) {
      console.log('🧾 Invoice di-clear, reset vendor');
      apPaymentStore.form.vendor_id = null;
      
      // Optional: Reset other fields yang di auto-fill dari invoice
      if (!apPaymentStore.form.amount || apPaymentStore.form.amount === 0) {
        // Hanya reset amount jika belum diisi manual
      }
    }
  }
}, { immediate: false })

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

// ✅ NEW: Function untuk convert formatted rupiah back to number
const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0;
  // Remove 'Rp', spaces, dots (thousand separators) and convert to number
  return Number(rupiahString.replace(/[Rp\s.]/g, '').replace(',', '.')) || 0;
};

// ✅ NEW: Handler untuk update amount dari input yang diformat
const updateAmountFromInput = (event) => {
  const inputValue = event.target.value;
  const numericValue = parseRupiahToNumber(inputValue);
  apPaymentStore.form.amount = Math.round(numericValue);
};
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
