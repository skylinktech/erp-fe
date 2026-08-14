<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">
            List customer yang terdaftar di sistem
            </p>
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Customer</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary"><i class="ri-team-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ totalRecords }}</h5>
                                <span class="text-muted">Customer terdaftar</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Prospect</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info"><i class="ri-user-search-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ customerTypeCounts.prospect }}</h5>
                                <span class="text-muted">Pada halaman ini</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Regular</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success"><i class="ri-user-follow-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ customerTypeCounts.regular }}</h5>
                                <span class="text-muted">Pada halaman ini</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">VIP</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning"><i class="ri-vip-crown-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ customerTypeCounts.vip }}</h5>
                                <span class="text-muted">Pada halaman ini</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Data Customer</h4>
                    <p class="mb-0">Kelola daftar customer dan data terkait.</p>
                </div>
                <div class="col-12">
                    <!-- customer Table -->
                    <div class="card">
                        <ListPageTableHeader
                            :rows="Number(tableControls.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari customer..."
                            :export-disabled="loading"
                            @update:rows="onCustomerToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                            @export="exportData"
                        >
                            <template #add>
                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    @click="customerStore.openModal()"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah
                                </button>
                            </template>
                        </ListPageTableHeader>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="customers" 
                            :rows="Number(params.rows)" 
                            :loading="loading"
                            :totalRecords="totalRecords"
                            :first="params.first"
                            :lazy="true"
                            @page="onPage($event)"
                            @sort="onSort($event)"
                            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                            <Column field="id" header="#" :sortable="true"></Column> 
                                <Column field="logo" header="Logo" :sortable="true">
                                    <template #body="slotProps">
                                        <div v-if="slotProps.data.logo">
                                            <img 
                                                :src="getCustomerLogo(slotProps.data.logo)" 
                                                alt="Logo Customer" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;" 
                                                @error="(e) => handleImageError(e, '/img/default-customer-logo.png')"
                                            />
                                        </div>
                                        <div v-else>
                                            <img 
                                                src="/img/default-customer-logo.png" 
                                                alt="Default Logo" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="name" header="Nama Customer" :sortable="true"></Column>
                                <Column field="code" header="Kode Customer" :sortable="true"></Column>
                                <Column field="type" header="Tipe" :sortable="true">
                                    <template #body="slotProps">
                                        {{ getTypeLabel(slotProps.data.type) }}
                                    </template>
                                </Column>
                                <Column field="address" header="Alamat Customer" :sortable="true"></Column>
                                <Column field="npwp" header="NPWP Customer" :sortable="true"></Column>
                                <Column field="ktp" header="KTP Customer" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.ktp || '-' }}
                                    </template>
                                </Column>
                                <Column field="email" header="Email Customer" :sortable="true"></Column>
                                <Column field="phone" header="Phone Customer" :sortable="true"></Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block dropdown">
                                            <a
                                                href="javascript:;"
                                                class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                                                data-bs-toggle="dropdown"
                                                data-bs-popper-config='{"strategy":"fixed"}'
                                            >
                                                <i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu dropdown-menu-end customer-actions-dropdown">
                                                <li v-if="userHasRole('superadmin') || userHasPermission('view_customer')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="openCustomerDetails(slotProps.data.id)">
                                                        <i class="ri-eye-line me-2"></i> Lihat Detail
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || userHasPermission('edit_customer')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="customerStore.openModal(slotProps.data)">
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || userHasPermission('delete_customer')">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="customerStore.deleteCustomer(slotProps.data.id)">
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
                    <!--/ customer Table -->
                </div>
            </div>
            <!--/ customer cards -->

            <!-- Placeholder untuk MenuModal component -->
            <Modal 
                id="CustomerModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="customerStore.saveCustomer()">
                        <div class="row g-6">
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="file" 
                                        class="form-control" 
                                        @change="onLogoChange"
                                        placeholder="Masukkan logo customer"
                                    >
                                    <label>Logo Customer <span class="text-muted small">(Opsional)</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.name" 
                                        placeholder="Masukkan nama customer"
                                        
                                    >
                                    <label>Nama Customer <span class="text-danger">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="email" 
                                        class="form-control" 
                                        :class="{ 'is-invalid': hasEmailError }"
                                        v-model.trim="form.email" 
                                        placeholder="Masukkan email customer"
                                        required
                                        autocomplete="email"
                                        inputmode="email"
                                    >
                                    <label>Email Customer <span class="text-danger">*</span></label>
                                </div>
                                <div v-if="hasEmailError" class="text-danger small mt-1">Email harus menggunakan format email yang valid.</div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                    type="tel" 
                                    class="form-control" 
                                    :class="{ 'is-invalid': hasPhoneError }"
                                    :value="form.phone"
                                    @input="onPhoneInput"
                                    placeholder="Masukkan no. telp customer"
                                    required
                                    inputmode="numeric"
                                    pattern="[0-9]*"
                                    autocomplete="tel"
                                    >
                                    <label>No. Telp Customer <span class="text-danger">*</span></label>
                                </div>
                                <div v-if="hasPhoneError" class="text-danger small mt-1">Nomor telepon hanya boleh berisi angka.</div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.npwp" 
                                    placeholder="Masukkan npwp customer"
                                    >
                                    <label>NPWP Customer <span class="text-muted small">(Opsional)</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input
                                    type="text"
                                    class="form-control"
                                    v-model="form.ktp"
                                    placeholder="Masukkan KTP customer"
                                    >
                                    <label>KTP Customer <span class="text-muted small">(Opsional)</span></label>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <CustomSelect2
                                        v-model="form.type"
                                        :options="customerTypeOptions"
                                        :get-option-label="option => option.label"
                                        :reduce="option => option.value"
                                        searchable
                                        clearable
                                        placeholder="-- Pilih Tipe Customer --"
                                    />
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <textarea
                                        class="form-control h-px-100"
                                        placeholder="Alamat Customer"
                                        v-model="form.address">
                                    </textarea>
                                    <label>Alamat Customer <span class="text-danger">*</span></label>
                                </div>
                            </div>
                            <div class="modal-footer mt-6">
                                <button type="button" class="btn btn-outline-secondary me-2" @click="customerStore.closeModal()">Tutup</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </form>
                </template>
            </Modal>
        </div>
         <!-- / Content -->
 
         <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>

import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia';
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useCustomerStore } from '~/stores/customer'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import 'vue-select/dist/vue-select.css'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import { useRouter } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl';

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()
const { getCustomerLogo, handleImageError } = useImageUrl();

const config   = useRuntimeConfig();
const router = useRouter()

const myDataTableRef                     = ref(null)
const customerStore                      = useCustomerStore()
const { userHasPermission, userHasRole } = usePermissions();
const permissionStore                    = usePermissionsStore()
const userStore                          = useUserStore()

const { customers, loading, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(customerStore)
const { permissions } = storeToRefs(permissionStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

const customerTypeOptions = [
  { label: 'Prospect', value: 'prospect' },
  { label: 'Regular', value: 'regular' },
  { label: 'VIP', value: 'vip' }
];

const getTypeLabel = (type) => {
  const opt = customerTypeOptions.find(o => o.value === type);
  return opt ? opt.label : type || '-';
};

const customerTypeCounts = computed(() => {
  const rows = customers.value || []
  return {
    prospect: rows.filter((c) => c.type === 'prospect').length,
    regular: rows.filter((c) => c.type === 'regular').length,
    vip: rows.filter((c) => c.type === 'vip').length,
  }
});

// Table controls data
const tableControls = ref({
  rows: 10,
  search: ''
});

const modalTitle = computed(() => isEditMode.value ? 'Edit Customer' : 'Tambah Customer');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data customer di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan customer baru.');

let modalInstance = null
onMounted(() => {
    permissionStore.fetchPermissions();
    userStore.loadUser();
    if (customerStore.customers.length === 0) {
      customerStore.fetchCustomers();
    }
    const modalElement = document.getElementById('CustomerModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Customer', customers.value.length)
    
    // Initialize table controls
    tableControls.value.rows = params.value.rows;
    tableControls.value.search = globalFilterValue.value;
});

// Watch untuk sinkronisasi table controls
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = newValue;
});

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue;
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    customerStore.setSearch(globalFilterValue.value)
}, 500);
watch(globalFilterValue, debouncedSearch);

// Fungsi untuk menangani event load lazy data dari customer
const onPage = (event) => customerStore.setPagination(event);

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    customerStore.fetchCustomers();
};

const onCustomerToolbarRows = (value) => {
    tableControls.value.rows = Number(value) || 10;
    handleRowsChange(value);
};

const onSort = (event) => customerStore.setSort(event);

const exportData = (format) => {
    if (format === 'excel' || format === 'csv') {
        myDataTableRef.value?.exportCSV?.();
        return;
    }
    if (format === 'pdf') {
        useToast().info({
            title: 'Info',
            message: 'Export PDF akan tersedia pada rilis berikutnya.',
            color: 'blue',
            position: 'bottomRight',
            layout: 2,
        });
    }
};

const hasEmailError = computed(() =>
  (validationErrors.value || []).some((err) => String(err).toLowerCase().includes('email'))
)
const hasPhoneError = computed(() =>
  (validationErrors.value || []).some((err) => {
    const text = String(err).toLowerCase()
    return text.includes('telepon') || text.includes('telp') || text.includes('phone')
  })
)

function onPhoneInput(e) {
  const digits = String(e.target.value || '').replace(/\D/g, '')
  form.value.phone = digits
  e.target.value = digits
}

function onLogoChange(e) {
  const file = e.target.files[0];
  if (file) {
    customerStore.handleLogoChange(file)
  }
}

// View Customer Details
const openCustomerDetails = (customerId) => {
    router.push({ path: `/sales/customer-detail`, query: { id: customerId } });
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Customer',
  description: 'Customer Management',
  keywords: 'Customer, Sales, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>

<style scoped>
/* Dropdown aksi: fixed strategy agar tidak ter-clip overflow datatable */
:deep(.customer-actions-dropdown) {
  z-index: 1100 !important;
}

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
