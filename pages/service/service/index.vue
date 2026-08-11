<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-pt-10">
            <h4 class="mb-1">List Service Line</h4>
            <p class="mb-6">
                List service line yang terdaftar di sistem
                <span v-if="globalFilterValue" class="text-muted">
                    - Menampilkan {{ totalRecords }} hasil untuk "{{ globalFilterValue }}"
                </span>
            </p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

            <CollapsibleFilterCard
                title="Filter Service Line"
                :has-active-filters="hasActiveFilters"
                @reset="resetFilters"
            >
                <FilterFieldsRow :columns="2">
                    <FilterField>
                        <label class="form-label">Tipe Line</label>
                        <select class="form-select w-100" v-model="filterLineType" @change="applyFilters">
                            <option value="">Semua Tipe</option>
                            <option value="leased">Leased</option>
                            <option value="add_quota">Add Quota</option>
                        </select>
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Billing Type</label>
                        <select class="form-select w-100" v-model="filterBillingType" @change="applyFilters">
                            <option value="">Semua Billing</option>
                            <option value="one_time">One Time</option>
                            <option value="recurring">Recurring</option>
                        </select>
                    </FilterField>
                </FilterFieldsRow>
            </CollapsibleFilterCard>

            <div class="card">
                <ListPageTableHeader
                    :rows="Number(params.rows)"
                    :rows-options="rowsPerPageOptionsArray"
                    :search="globalFilterValue"
                    search-placeholder="Cari berdasarkan nama, kode atau deskripsi..."
                    :export-disabled="loading"
                    :export-items="[
                        { value: 'csv', label: 'CSV' },
                        { value: 'excel', label: 'Excel' },
                        { value: 'pdf', label: 'PDF' },
                    ]"
                    @update:rows="handleRowsChange"
                    @update:search="(v) => { globalFilterValue = v }"
                    @export="exportData"
                >
                    <template #add>
                        <button
                            v-if="userHasRole('superadmin') || userHasPermission('create_service')"
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="openCreateModal"
                        >
                            <i class="ri-add-line me-1"></i> Tambah Service Line
                        </button>
                    </template>
                </ListPageTableHeader>
                <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable 
                    ref="myDataTableRef"
                    :data="services" 
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
                                    <Column field="name" header="Nama" :sortable="true"></Column>
                                    <Column field="code" header="Kode" :sortable="true"></Column>
                                    <Column field="period" header="Periode" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.period ? slotProps.data.period + ' hari' : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="servicePlan.name" header="Service Plan" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ slotProps.data.servicePlan?.name || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="servicePlan.serviceType.name" header="Tipe" :sortable="false" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ slotProps.data.servicePlan?.serviceType?.name || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="serviceLineType" header="Line Type" :sortable="false" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatLineType(slotProps.data.serviceLineType) }}
                                        </template>
                                    </Column>
                                    <Column field="description" header="Deskripsi" :sortable="true">
                                        <template #body="slotProps">
                                            <span :title="slotProps.data.description">
                                                {{ truncateText(slotProps.data.description, 50) }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="createdAt" header="Tanggal Dibuat" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.createdAt) }}
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('edit_service')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="openEditModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('delete_service')">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="serviceStore.deleteService(slotProps.data.id)">
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
                            <!-- Modal untuk Service -->
            <Modal 
                id="ServiceModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validationErrorsFromParent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="serviceStore.saveService()">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label">Nama Service Line <span class="text-danger">*</span></label>
                                <input
                                    type="text"
                                    class="form-control"
                                    v-model="form.name"
                                    placeholder="Masukkan nama service line"
                                    id="name"
                                    @input="form.name = $event.target.value.toUpperCase()"
                                    required
                                >
                                <div v-if="hasFieldError('name')" class="invalid-feedback d-block">
                                    {{ getFieldError('name') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Kode <span class="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    class="form-control"
                                    v-model="form.code" 
                                    placeholder="Masukkan kode"
                                    id="code"
                                    @input="form.code = $event.target.value.toUpperCase()"
                                    required
                                >
                                <div v-if="hasFieldError('code')" class="invalid-feedback d-block">
                                    {{ getFieldError('code') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Periode (Hari) <span class="text-danger">*</span></label>
                                <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model.number="form.period" 
                                    placeholder="Masukkan periode dalam hari"
                                    id="period"
                                    min="0"
                                    required
                                >
                                <div v-if="hasFieldError('period')" class="invalid-feedback d-block">
                                    {{ getFieldError('period') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Service Plan <span class="text-danger">*</span></label>
                                <CustomSelect2
                                    v-model="form.servicePlanId"
                                    :options="servicePlanOptions"
                                    :get-option-label="(option) => option?.name ?? ''"
                                    :reduce="(option) => option != null ? option.id : null"
                                    placeholder="Pilih service plan"
                                    :searchable="true"
                                    :clearable="false"
                                    :is-invalid="hasFieldError('servicePlanId')"
                                />
                                <div v-if="hasFieldError('servicePlanId')" class="invalid-feedback d-block">
                                    {{ getFieldError('servicePlanId') }}
                                </div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Service Line Type</label>
                                <select class="form-select" v-model="form.serviceLineType">
                                    <option :value="null">— Pilih —</option>
                                    <option value="leased">Leased</option>
                                    <option value="add_quota">Add Quota</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Quota Label</label>
                                <input type="text" class="form-control" v-model="form.quotaLabel" placeholder="e.g. Priority 50 GB" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Billing Type</label>
                                <select class="form-select" v-model="form.billingType">
                                    <option :value="null">— Pilih —</option>
                                    <option value="one_time">One Time</option>
                                    <option value="recurring">Recurring</option>
                                </select>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Deskripsi</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="form.description" 
                                    placeholder="Masukkan deskripsi service"
                                    id="description"
                                    rows="3"
                                ></textarea>
                                <div v-if="hasFieldError('description')" class="invalid-feedback d-block">
                                    {{ getFieldError('description') }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="serviceStore.closeModal()">Tutup</button>
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
import { storeToRefs } from 'pinia'
import { useServiceStore } from '~/stores/service'
import { useUserStore } from '~/stores/user'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()

const myDataTableRef = ref(null)
const serviceStore = useServiceStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()

const {
  services,
  loading,
  loadingStats,
  totalRecords,
  statistics,
  params,
  form,
  isEditMode,
  showModal,
  validationErrors,
} = storeToRefs(serviceStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const filterLineType = ref('')
const filterBillingType = ref('')

const hasActiveFilters = computed(() => !!(filterLineType.value || filterBillingType.value))

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Master',
    value: statistics.value.total,
    icon: 'ri-service-line',
    iconBgClass: 'bg-label-primary',
    subtitle: 'Semua service line',
  },
  {
    key: 'withPlan',
    label: 'Dengan Plan',
    value: statistics.value.withPlan,
    icon: 'ri-file-list-3-line',
    iconBgClass: 'bg-label-info',
  },
  {
    key: 'leased',
    label: 'Leased',
    value: statistics.value.leased,
    icon: 'ri-links-line',
    iconBgClass: 'bg-label-success',
    valueClass: 'text-success',
  },
  {
    key: 'addQuota',
    label: 'Add Quota',
    value: statistics.value.addQuota,
    icon: 'ri-add-circle-line',
    iconBgClass: 'bg-label-warning',
  },
])

const applyFilters = () => {
  params.value.serviceLineType = filterLineType.value
  params.value.billingType = filterBillingType.value
  params.value.first = 0
  serviceStore.fetchServices()
}

const resetFilters = () => {
  filterLineType.value = ''
  filterBillingType.value = ''
  applyFilters()
}

const modalTitle = computed(() => (isEditMode.value ? 'Edit Service Line' : 'Tambah Service Line'))
const modalDescription = computed(() =>
  isEditMode.value
    ? 'Silakan ubah data service line di bawah ini.'
    : 'Silakan isi form di bawah ini untuk menambahkan service line baru.'
)

const servicePlanOptions = ref([])
const servicePlansLoaded = ref(false)

async function ensureServicePlanOptions() {
  if (servicePlansLoaded.value) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.servicePlan()}?page=1&rows=200`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    const json = await res.json()
    servicePlanOptions.value = Array.isArray(json.data) ? json.data : []
    servicePlansLoaded.value = true
  } catch {
    servicePlanOptions.value = []
  }
}

async function openCreateModal() {
  await ensureServicePlanOptions()
  serviceStore.openModal()
}

async function openEditModal(row) {
  await ensureServicePlanOptions()
  serviceStore.openModal(row)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatLineType = (value) => {
  if (value === 'leased') return 'Leased'
  if (value === 'add_quota') return 'Add Quota'
  return value || '-'
}

const truncateText = (value, max = 50) => {
  if (!value) return '-'
  return value.length > max ? `${value.substring(0, max)}...` : value
}

let modalInstance = null
onMounted(() => {
  filterLineType.value = params.value.serviceLineType || ''
  filterBillingType.value = params.value.billingType || ''

  Promise.all([
    serviceStore.fetchServices(),
    serviceStore.fetchStatistics(),
    permissionStore.fetchPermissions(),
    userStore.loadUser(),
  ])

  const modalElement = document.getElementById('ServiceModal')
  if (modalElement) {
    modalInstance = new bootstrap.Modal(modalElement)
  }
  setListTitle('Service Line', totalRecords.value)
})

watch(showModal, async (open) => {
  if (open) {
    await ensureServicePlanOptions()
    modalInstance?.show()
  } else {
    modalInstance?.hide()
  }
})

const handleRowsChange = (value) => {
  params.value.rows = Number(value) || 10
  params.value.first = 0
  serviceStore.fetchServices()
}

watch(() => params.value.search, (newValue) => {
  if (newValue !== globalFilterValue.value) {
    globalFilterValue.value = newValue
  }
})

const debouncedSearch = useDebounceFn(() => {
  serviceStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => serviceStore.setPagination(event)
const onSort = (event) => serviceStore.setSort(event)

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'csv') {
      myDataTableRef.value.exportCSV({
        title: 'Data Service Line',
        border: true,
      })
    } else if (format === 'excel') {
      const exportResult = await serviceStore.fetchServicesForExport()
      myDataTableRef.value.exportExcel({
        title: `Data Service Line ${exportResult.nmPerusahaan}`,
        data: exportResult.data,
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error({
      title: 'Error',
      message: 'Gagal melakukan export data',
      color: 'red',
      position: 'bottomRight',
    })
  }
}

const hasFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false
  return validationErrors.value.some((error) => {
    if (typeof error === 'string') return false
    return error.field === fieldName || error.rule === fieldName
  })
}

const getFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return ''
  const error = validationErrors.value.find((err) => {
    if (typeof err === 'string') return false
    return err.field === fieldName || err.rule === fieldName
  })
  return error ? error.message : ''
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Service Line',
  description: 'Service Line Management',
  keywords: 'Service Line, Service, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
})

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
