<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">
                List service plan yang terdaftar di sistem
                <span v-if="globalFilterValue" class="text-muted">
                    - Menampilkan {{ totalRecords }} hasil untuk "{{ globalFilterValue }}"
                </span>
            </p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

            <CollapsibleFilterCard
                title="Filter Service Plan"
                :has-active-filters="hasActiveFilters"
                @reset="resetFilters"
            >
                <FilterFieldsRow :columns="1">
                    <FilterField>
                        <label class="form-label">Service Type</label>
                        <select class="form-select w-100" v-model="filterServiceTypeId" @change="applyServiceTypeFilter">
                            <option value="">Semua Tipe</option>
                            <option v-for="t in servicePlanStore.serviceTypes" :key="t.id" :value="String(t.id)">{{ t.name }}</option>
                        </select>
                    </FilterField>
                </FilterFieldsRow>
            </CollapsibleFilterCard>

            <div class="card">
                <ListPageTableHeader
                    :rows="Number(params.rows)"
                    :rows-options="rowsPerPageOptionsArray"
                    :search="globalFilterValue"
                    search-placeholder="Cari berdasarkan nama atau deskripsi..."
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
                            v-if="userHasRole('superadmin') || userHasPermission('create_service_plan')"
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="servicePlanStore.openModal()"
                        >
                            <i class="ri-add-line me-1"></i> Tambah Service Plan
                        </button>
                    </template>
                </ListPageTableHeader>
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

            <Modal
                :model-value="showModal"
                @close="servicePlanStore.closeModal" 
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
import { storeToRefs } from 'pinia'
import { useServicePlanStore } from '~/stores/service-plan'
import { useUserStore } from '~/stores/user'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
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
const servicePlanStore = useServicePlanStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()

const { servicePlans, loading, loadingStats, totalRecords, statistics, params, form, isEditMode, showModal, validationErrors } = storeToRefs(servicePlanStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const filterServiceTypeId = ref('')

const hasActiveFilters = computed(() => !!filterServiceTypeId.value)

const statItems = computed(() => [
  { key: 'total', label: 'Total', value: statistics.value.total, icon: 'ri-file-list-3-line', iconBgClass: 'bg-label-primary', subtitle: 'Semua service plan' },
  { key: 'withType', label: 'Dengan Tipe', value: statistics.value.withType, icon: 'ri-price-tag-3-line', iconBgClass: 'bg-label-info' },
  { key: 'withSla', label: 'Dengan SLA', value: statistics.value.withSla, icon: 'ri-shield-check-line', iconBgClass: 'bg-label-success', valueClass: 'text-success' },
  { key: 'withIpPublic', label: 'IP Public', value: statistics.value.withIpPublic, icon: 'ri-global-line', iconBgClass: 'bg-label-warning' },
])

const applyServiceTypeFilter = () => {
  servicePlanStore.setServiceTypeId(filterServiceTypeId.value ?? '')
}

const resetFilters = () => {
  filterServiceTypeId.value = ''
  applyServiceTypeFilter()
}

const modalTitle = computed(() => isEditMode.value ? 'Edit Service Plan' : 'Tambah Service Plan')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data service plan di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan service plan baru.')

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
  filterServiceTypeId.value = params.value.serviceTypeId ?? ''
  Promise.all([
    servicePlanStore.fetchServiceTypes(),
    servicePlanStore.fetchServicePlans(),
    servicePlanStore.fetchStatistics(),
    permissionStore.fetchPermissions(),
    userStore.loadUser(),
  ])
  setListTitle('Service Plan', totalRecords.value)
})

const handleRowsChange = (value) => {
  params.value.rows = Number(value) || 10
  params.value.first = 0
  servicePlanStore.fetchServicePlans()
}

watch(() => params.value.serviceTypeId, (newValue) => {
  const v = newValue ?? ''
  if (filterServiceTypeId.value !== v) filterServiceTypeId.value = v
})

const debouncedSearch = useDebounceFn(() => {
  servicePlanStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => servicePlanStore.setPagination(event)
const onSort = (event) => servicePlanStore.setSort(event)

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'csv') {
      myDataTableRef.value.exportCSV({ title: 'Data Service Plan', border: true })
    } else if (format === 'excel') {
      const exportResult = await servicePlanStore.fetchServicePlansForExport()
      myDataTableRef.value.exportExcel({
        title: `Data Service Plan ${exportResult.nmPerusahaan}`,
        data: exportResult.data,
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error({ title: 'Error', message: 'Gagal melakukan export data', color: 'red', position: 'bottomRight' })
  }
}

const hasFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false
  return validationErrors.value.some(error => typeof error !== 'string' && (error.field === fieldName || error.rule === fieldName))
}

const getFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return ''
  const error = validationErrors.value.find(error => typeof error !== 'string' && (error.field === fieldName || error.rule === fieldName))
  return error ? error.message : ''
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Service Plan',
  description: 'Service Plan Management',
  keywords: 'Service Plan, Inventory, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
.form-label { font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
.form-control { border-radius: 0.375rem; border: 1px solid #d1d5db; padding: 0.75rem; }
.form-control:focus { border-color: #008fec; box-shadow: 0 0 0 0.2rem rgba(0, 143, 236, 0.25); outline: 0; }
textarea.form-control { resize: vertical; min-height: 80px; }
</style>
