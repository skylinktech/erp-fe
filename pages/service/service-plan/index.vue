<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <div v-if="loading" class="text-center py-8">
                <ProgressSpinner 
                    style="width: 50px; height: 50px" 
                    strokeWidth="4"
                    fill="transparent"
                    animationDuration="1s"
                />
                <div class="mt-3 text-muted">Memuat data...</div>
            </div>
            <template v-else>
                <div>
                    <h4 class="mb-1">List Service Plan</h4>
                    <p class="mb-6">
                        List service plan yang terdaftar di sistem
                        <span v-if="globalFilterValue" class="text-muted">
                            - Menampilkan {{ totalRecords }} hasil untuk "{{ globalFilterValue }}"
                        </span>
                    </p>
                    <div class="row g-6 mb-6">
                        <!-- Total Service Plans Card -->
                        <div class="col-6">
                            <div class="card h-100">
                                <div class="row h-100">
                                    <div class="col-sm-5">
                                        <div class="d-flex align-items-end h-100 justify-content-center">
                                            <i class="ri-file-list-3-line text-primary" style="font-size: 3rem;"></i>
                                        </div>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="card-body text-sm-end text-center ps-sm-0">
                                            <h4 class="mb-1">
                                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span v-else>{{ totalServicePlans }}</span>
                                            </h4>
                                            <p class="mb-0 mt-1">Total Service Plan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Add Service Plan Card -->
                        <div class="col-6">
                            <div class="card h-100">
                                <div class="row h-100">
                                    <div class="col-sm-5">
                                        <div class="d-flex align-items-end h-100 justify-content-center">
                                            <img
                                                src="/img/illustrations/add-new-role-illustration.png"
                                                class="img-fluid"
                                                alt="Image"
                                                width="70" />
                                        </div>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="card-body text-sm-end text-center ps-sm-0">
                                            <button v-if="userHasRole('superadmin') || userHasPermission('create_service_plan')"
                                                @click="servicePlanStore.openModal()"
                                                class="btn btn-primary mb-2 text-nowrap add-new-role"
                                            >
                                                Tambah Service Plan
                                            </button>
                                            <p class="mb-0 mt-1">Buat Service Plan baru</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-6">
                        <div class="col-12">
                            <!-- Service Plan Table -->
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center flex-wrap">
                                        <div class="flex-grow-1">
                                            <div class="table-controls-custom">
                                                <div class="d-none d-md-flex justify-content-between align-items-center">
                                                    <div class="d-flex align-items-center me-3">
                                                        <span class="me-2">Baris:</span>
                                                        <Dropdown 
                                                            v-model="tableControls.rows" 
                                                            :options="rowsPerPageOptionsArray" 
                                                            @change="handleRowsChange" 
                                                            placeholder="Jumlah" 
                                                            style="width: 8rem;"
                                                            :showClear="false"
                                                        />
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <div class="btn-group me-2">
                                                            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i class="ri-upload-2-line me-1"></i> Export
                                                            </button>
                                                            <ul class="dropdown-menu">
                                                                <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('csv')">CSV</a></li>
                                                                <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('excel')">Excel</a></li>
                                                                <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('pdf')">PDF</a></li>
                                                            </ul>
                                                        </div>
                                                        <div class="d-flex align-items-center gap-2 flex-wrap">
                                                            <Dropdown
                                                                v-model="tableControls.serviceTypeId"
                                                                :options="serviceTypeOptions"
                                                                optionLabel="label"
                                                                optionValue="value"
                                                                placeholder="Semua Tipe"
                                                                class="w-10rem"
                                                                :showClear="true"
                                                                @change="handleServiceTypeChange"
                                                            />
                                                            <div class="input-group">
                                                                <span class="p-input-icon-left">
                                                                    <InputText
                                                                        v-model="tableControls.search"
                                                                        placeholder="Cari berdasarkan nama atau deskripsi..."
                                                                        class="w-full md:w-20rem"
                                                                        @input="(e) => handleSearch(e.target.value)"
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="d-md-none">
                                                    <div class="mb-3">
                                                        <div class="d-flex align-items-center">
                                                            <span class="me-2" style="font-weight: 500; white-space: nowrap; color: #6c757d;">Baris:</span>
                                                            <Dropdown 
                                                                v-model="tableControls.rows" 
                                                                :options="rowsPerPageOptionsArray" 
                                                                @change="handleRowsChange" 
                                                                placeholder="Jumlah" 
                                                                class="flex-grow-1"
                                                                :showClear="false"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class="mb-3">
                                                        <InputText
                                                            v-model="tableControls.search"
                                                            placeholder="Cari berdasarkan nama atau deskripsi..."
                                                            class="w-100"
                                                            style="height: 38px; border-radius: 6px;"
                                                            @input="(e) => handleSearch(e.target.value)"
                                                        />
                                                    </div>
                                                    <div class="mb-3">
                                                        <div class="btn-group w-100">
                                                            <button class="btn btn-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i class="ri-upload-2-line me-1"></i> Export
                                                            </button>
                                                            <ul class="dropdown-menu">
                                                                <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('csv')">CSV</a></li>
                                                                <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('excel')">Excel</a></li>
                                                                <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('pdf')">PDF</a></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable 
                                    ref="myDataTableRef"
                                    :data="servicePlans" 
                                    :rows="Number(params.rows)" 
                                    :loading="loading"
                                    :totalRecords="totalRecords"
                                    :first="params.first"
                                    :lazy="true"
                                    :sort-field="params.sortField"
                                    :sort-order="params.sortOrder"
                                    sort-mode="single"
                                    @page="onPage($event)"
                                    @sort="onSort($event)"
                                    responsiveLayout="scroll"
                                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                    >
                                    <Column header="#" :sortable="false">
                                        <template #body="slotProps">
                                            {{ params.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>
                                    <Column field="serviceType" header="Service Type" :sortable="false">
                                        <template #body="slotProps">
                                            <span v-if="slotProps.data.serviceType" class="badge bg-label-primary">{{ slotProps.data.serviceType.name }}</span>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>
                                    <Column field="name" header="Nama" :sortable="true"></Column>
                                    <Column field="description" header="Deskripsi" :sortable="true">
                                        <template #body="slotProps">
                                            <span :title="slotProps.data.description">
                                                {{ slotProps.data.description ? (slotProps.data.description.length > 50 ? slotProps.data.description.substring(0, 50) + '...' : slotProps.data.description) : '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="planFunction" header="Fungsi" :sortable="false">
                                        <template #body="slotProps">
                                            {{ slotProps.data.planFunction || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="quota" header="Quota" :sortable="false">
                                        <template #body="slotProps">
                                            {{ slotProps.data.quota || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="contractMonth" header="Kontrak (bln)" :sortable="false">
                                        <template #body="slotProps">
                                            {{ slotProps.data.contractMonth != null ? slotProps.data.contractMonth : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="createdAt" header="Tanggal Dibuat" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.createdAt) }}
                                        </template>
                                    </Column>
                                    <Column field="updatedAt" header="Tanggal Diperbarui" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.updatedAt) }}
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('edit_service_plan'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="servicePlanStore.openModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('delete_service_plan'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="servicePlanStore.deleteServicePlan(slotProps.data.id)">
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
            </template>
            <!-- Modal untuk Service Plan -->
            <Modal 
                id="ServicePlanModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validationErrorsFromParent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="servicePlanStore.saveServicePlan()">
                        <div class="row g-4">
                            <!-- Service Type -->
                            <div class="col-md-6">
                                <label class="form-label">Service Type</label>
                                <select class="form-select" v-model="form.serviceTypeId">
                                    <option :value="null">— Pilih Service Type —</option>
                                    <option v-for="t in servicePlanStore.serviceTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
                                </select>
                                <div v-if="hasFieldError('serviceTypeId')" class="invalid-feedback d-block">{{ getFieldError('serviceTypeId') }}</div>
                            </div>
                            <!-- Basic -->
                            <div class="col-md-6">
                                <label class="form-label">Nama Service Plan <span class="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    class="form-control"
                                    v-model="form.name" 
                                    placeholder="Masukkan nama service plan"
                                    id="name"
                                    @input="form.name = $event.target.value.toUpperCase()"
                                    required
                                >
                                <div v-if="hasFieldError('name')" class="invalid-feedback d-block">
                                    {{ getFieldError('name') }}
                                </div>
                            </div>
                            <!-- Atribut Plan -->
                            <div class="col-md-6">
                                <label class="form-label">Fungsi</label>
                                <input type="text" class="form-control" v-model="form.planFunction" placeholder="Fungsi plan" id="planFunction">
                                <div v-if="hasFieldError('planFunction')" class="invalid-feedback d-block">{{ getFieldError('planFunction') }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Quota</label>
                                <input type="text" class="form-control" v-model="form.quota" placeholder="Quota" id="quota">
                                <div v-if="hasFieldError('quota')" class="invalid-feedback d-block">{{ getFieldError('quota') }}</div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Tipe Quota</label>
                                <input type="text" class="form-control" v-model="form.typeQuota" placeholder="Tipe quota" id="typeQuota">
                                <div v-if="hasFieldError('typeQuota')" class="invalid-feedback d-block">{{ getFieldError('typeQuota') }}</div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Kontrak (bulan)</label>
                                <input type="number" class="form-control" v-model.number="form.contractMonth" placeholder="Bulan" id="contractMonth" min="0" step="1">
                                <div v-if="hasFieldError('contractMonth')" class="invalid-feedback d-block">{{ getFieldError('contractMonth') }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">FUP</label>
                                <input type="text" class="form-control" v-model="form.fup" placeholder="FUP" id="fup">
                                <div v-if="hasFieldError('fup')" class="invalid-feedback d-block">{{ getFieldError('fup') }}</div>
                            </div>
                            <!-- Fitur (checkbox) -->
                            <div class="col-12">
                                <label class="form-label d-block">Fitur</label>
                                <span class="text-muted">Pilih fitur yang akan ditambahkan ke service plan</span>
                                <div class="row mt-3">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasSla" id="hasSla">
                                            <label class="form-check-label" for="hasSla">SLA</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasTopup" id="hasTopup">
                                            <label class="form-check-label" for="hasTopup">Top Up</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasAutoTopup" id="hasAutoTopup">
                                            <label class="form-check-label" for="hasAutoTopup">Auto Top Up</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasIpPublic" id="hasIpPublic">
                                            <label class="form-check-label" for="hasIpPublic">IP Public</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasApi" id="hasApi">
                                            <label class="form-check-label" for="hasApi">API</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasDashboard" id="hasDashboard">
                                            <label class="form-check-label" for="hasDashboard">Dashboard</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" v-model="form.hasMonthlyReport" id="hasMonthlyReport">
                                            <label class="form-check-label" for="hasMonthlyReport">Laporan Bulanan</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Info Pembayaran</label>
                                <textarea class="form-control" v-model="form.paymentInfo" placeholder="Info pembayaran" id="paymentInfo" rows="2"></textarea>
                                <div v-if="hasFieldError('paymentInfo')" class="invalid-feedback d-block">{{ getFieldError('paymentInfo') }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Info Registrasi</label>
                                <textarea class="form-control" v-model="form.registrationInfo" placeholder="Info registrasi" id="registrationInfo" rows="2"></textarea>
                                <div v-if="hasFieldError('registrationInfo')" class="invalid-feedback d-block">{{ getFieldError('registrationInfo') }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Deskripsi</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="form.description" 
                                    placeholder="Masukkan deskripsi service plan"
                                    id="description"
                                    rows="2"
                                ></textarea>
                                <div v-if="hasFieldError('description')" class="invalid-feedback d-block">
                                    {{ getFieldError('description') }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="servicePlanStore.closeModal()">Tutup</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Simpan
                            </button>
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
import { useServicePlanStore } from '~/stores/service-plan'
import { useUserStore } from '~/stores/user'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions();

const myDataTableRef    = ref(null)
const servicePlanStore = useServicePlanStore()
const permissionStore  = usePermissionsStore()
const userStore        = useUserStore()

const { servicePlans, loading, totalRecords, totalServicePlans, params, form, isEditMode, showModal, validationErrors } = storeToRefs(servicePlanStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

const serviceTypeOptions = computed(() => {
  const types = servicePlanStore.serviceTypes || []
  return [
    { label: 'Semua Tipe', value: '' },
    ...types.map((t) => ({ label: t.name, value: String(t.id) })),
  ]
})

const tableControls = ref({
    rows: 10,
    search: '',
    serviceTypeId: '',
});

const modalTitle = computed(() => isEditMode.value ? 'Edit Service Plan' : 'Tambah Service Plan');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data service plan di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan service plan baru.');

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year  : 'numeric',
        month : 'long',
        day   : 'numeric',
    });
};

let modalInstance = null
const handleServiceTypeChange = () => {
  servicePlanStore.setServiceTypeId(tableControls.value.serviceTypeId ?? '')
}

onMounted(() => {
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;
    tableControls.value.serviceTypeId = params.value.serviceTypeId ?? '';

    servicePlanStore.fetchServiceTypes()
    servicePlanStore.fetchServicePlans();
    servicePlanStore.fetchTotalServicePlans();
    permissionStore.fetchPermissions()
    userStore.loadUser()
    const modalElement = document.getElementById('ServicePlanModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Service Plan', servicePlans.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    servicePlanStore.fetchServicePlans();
};

const handleSearch = (value) => {
    globalFilterValue.value = value;
    tableControls.value.search = value;
    params.value.first = 0;
};

watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(() => params.value.search, (newValue) => {
    if (newValue !== globalFilterValue.value) {
        globalFilterValue.value = newValue;
        tableControls.value.search = newValue;
    }
});

watch(() => params.value.serviceTypeId, (newValue) => {
    const v = newValue ?? ''
    if (tableControls.value.serviceTypeId !== v) {
        tableControls.value.serviceTypeId = v
    }
});

const debouncedSearch = useDebounceFn(() => {
    servicePlanStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch);

const onPage = (event) => servicePlanStore.setPagination(event);

const onSort = (event) => servicePlanStore.setSort(event);

const exportData = async (format) => {
    const toast = useToast();
    try {
        if (format === 'csv') {
            myDataTableRef.value.exportCSV({
                title: 'Data Service Plan',
                border: true
            });
        } else if (format === 'excel') {
            const exportResult = await servicePlanStore.fetchServicePlansForExport();
            myDataTableRef.value.exportExcel({
                title: `Data Service Plan ${exportResult.nmPerusahaan}`,
                data: exportResult.data
            });
        } else if (format === 'pdf') {
            // Implement PDF export if needed
        }
    } catch (error) {
        console.error('Export error:', error);
        toast.error({
          title: 'Error',
          message: 'Gagal melakukan export data',
          color: 'red',
          position: 'topRight',
        });
    }
};

const hasFieldError = (fieldName) => {
    if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false;
    return validationErrors.value.some(error => {
        if (typeof error === 'string') return false;
        return error.field === fieldName || error.rule === fieldName;
    });
};

const getFieldError = (fieldName) => {
    if (!validationErrors.value || !Array.isArray(validationErrors.value)) return '';
    const error = validationErrors.value.find(error => {
        if (typeof error === 'string') return false;
        return error.field === fieldName || error.rule === fieldName;
    });
    return error ? error.message : '';
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Service Plan',
  description: 'Service Plan Management',
  keywords: 'Service Plan, Inventory, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>

<style scoped>
.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #696cff;
  box-shadow: 0 0 0 0.2rem rgba(105, 108, 255, 0.25);
  outline: 0;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

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
