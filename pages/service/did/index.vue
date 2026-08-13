<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <h4 class="mb-1">List DID</h4>
      <p class="mb-6">
        List DID (Delivery, Installation, Survey, Dismantle) yang terdaftar di sistem
        <span v-if="globalFilterValue" class="text-muted">
          - Menampilkan {{ totalRecords }} hasil untuk "{{ globalFilterValue }}"
        </span>
      </p>

      <ListPageStatsCards :items="statItems" :loading="loadingStats" />

      <div class="card">
        <ListPageTableHeader
          :rows="Number(params.rows)"
          :rows-options="rowsPerPageOptionsArray"
          :search="globalFilterValue"
          search-placeholder="Cari berdasarkan kode, nama, SLA, provinsi atau kabupaten..."
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
              v-if="userHasRole('superadmin') || userHasPermission('create_did')"
              type="button"
              class="btn btn-primary btn-sm"
              @click="didStore.openModal()"
            >
              <i class="ri-add-line me-1"></i> Tambah DID
            </button>
          </template>
        </ListPageTableHeader>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            :data="dids"
            :rows="Number(params.rows)"
            :loading="loading"
            :totalRecords="totalRecords"
            :first="params.first"
            :expandedRows="expandedRows"
            :lazy="true"
            :sort-field="params.sortField"
            :sort-order="params.sortOrder"
            sort-mode="single"
            @page="onPage($event)"
            @sort="onSort($event)"
            @row-toggle="onRowToggle($event)"
            responsive-layout="scroll"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
<Column :expander="true" headerStyle="width: 3rem" />
                    <Column header="#" :sortable="false">
                      <template #body="slotProps">
                        {{ params.first + slotProps.index + 1 }}
                      </template>
                    </Column>
                    <Column field="code" header="Kode" :sortable="true" class="text-nowrap" />
                    <Column field="name" header="Nama" :sortable="true" />
                    <Column field="sla" header="SLA" :sortable="true" class="text-nowrap">
                      <template #body="slotProps">
                        {{ slotProps.data.sla || '-' }}
                      </template>
                    </Column>
                    <Column field="province.name" header="Provinsi" :sortable="false" class="text-nowrap">
                      <template #body="slotProps">
                        {{ slotProps.data.province?.name || '-' }}
                      </template>
                    </Column>
                    <Column field="regency.name" header="Kabupaten/Kota" :sortable="false" class="text-nowrap">
                      <template #body="slotProps">
                        {{ slotProps.data.regency?.name || '-' }}
                      </template>
                    </Column>
                    <Column field="createdAt" header="Tanggal Dibuat" :sortable="true" class="text-nowrap">
                      <template #body="slotProps">
                        {{ formatDate(slotProps.data.createdAt) }}
                      </template>
                    </Column>
                    <Column header="Actions" :exportable="false" style="min-width: 8rem">
                      <template #body="slotProps">
                        <div class="d-inline-block">
                          <a
                            href="javascript:;"
                            class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                            data-bs-toggle="dropdown"
                          >
                            <i class="ri-more-2-fill"></i>
                          </a>
                          <ul class="dropdown-menu">
                            <li v-if="userHasRole('superadmin') || userHasPermission('edit_did')">
                              <a class="dropdown-item" href="javascript:void(0)" @click="didStore.openModal(slotProps.data)">
                                <i class="ri-edit-box-line me-2"></i> Edit
                              </a>
                            </li>
                            <li v-if="userHasRole('superadmin') || userHasPermission('delete_did')">
                              <a class="dropdown-item text-danger" href="javascript:void(0)" @click="didStore.deleteDid(slotProps.data.id)">
                                <i class="ri-delete-bin-7-line me-2"></i> Hapus
                              </a>
                            </li>
                          </ul>
                        </div>
                      </template>
                    </Column>
                    <!-- Expansion Template -->
                    <template #expansion="slotProps">
                      <DidExpandedRow :did="slotProps.data" />
                    </template>
                  </MyDataTable>
        </div>
      </div>

<Modal
        id="DidModal"
        :title="modalTitle"
        :description="modalDescription"
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || loading"
              @select="goTo"
            />

            <div class="tab-content pt-6">
              <!-- Tab Info -->
              <div class="tab-pane fade" id="did-tabs-info" data-step-id="did-tabs-info" role="tabpanel" :class="paneClass('did-tabs-info')">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label">Kode <span class="text-danger">*</span></label>
                    <input
                      v-model="form.code"
                      type="text"
                      class="form-control"
                      placeholder="Contoh: DID-001"
                      maxlength="50"
                      @input="form.code = ($event.target?.value || '').toUpperCase()"
                      required
                    />
                    <div v-if="hasFieldError('code')" class="invalid-feedback d-block">
                      {{ getFieldError('code') }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Nama <span class="text-danger">*</span></label>
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      placeholder="Masukkan nama DID"
                      required
                    />
                    <div v-if="hasFieldError('name')" class="invalid-feedback d-block">
                      {{ getFieldError('name') }}
                    </div>
                  </div>
                  <div class="col-md-12">
                    <label class="form-label">SLA</label>
                    <input
                      v-model="form.sla"
                      type="text"
                      class="form-control"
                      placeholder="Masukkan SLA (contoh: 24 jam)"
                    />
                    <div v-if="hasFieldError('sla')" class="invalid-feedback d-block">
                      {{ getFieldError('sla') }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Provinsi <span class="text-danger">*</span></label>
                    <CustomSelect2
                      v-model="form.provinceId"
                      :options="provinceOptions"
                      :get-option-label="(opt) => opt?.name ?? ''"
                      :reduce="(opt) => (opt != null ? opt.id : null)"
                      placeholder="Pilih provinsi"
                      :searchable="true"
                      :clearable="false"
                      :is-invalid="hasFieldError('provinceId')"
                      @update:modelValue="onProvinceChange"
                    />
                    <div v-if="hasFieldError('provinceId')" class="invalid-feedback d-block">
                      {{ getFieldError('provinceId') }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Kabupaten/Kota <span class="text-danger">*</span></label>
                    <CustomSelect2
                      v-model="form.regencyId"
                      :options="filteredRegencies"
                      :get-option-label="(opt) => opt?.name ?? ''"
                      :reduce="(opt) => (opt != null ? opt.id : null)"
                      placeholder="Pilih kabupaten/kota"
                      :searchable="true"
                      :clearable="false"
                      :is-invalid="hasFieldError('regencyId')"
                      :disabled="!form.provinceId"
                    />
                    <div v-if="hasFieldError('regencyId')" class="invalid-feedback d-block">
                      {{ getFieldError('regencyId') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Services -->
              <div class="tab-pane fade" id="did-tabs-services" data-step-id="did-tabs-services" role="tabpanel" :class="paneClass('did-tabs-services')">
                <div v-for="(item, index) in form.services" :key="index" class="repeater-item mb-4">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <CustomSelect2
                        v-model="item.servicePlanId"
                        :options="servicePlanOptions"
                        :get-option-label="(sp) => sp?.name ?? ''"
                        :reduce="(sp) => (sp != null ? sp.id : null)"
                        placeholder="Pilih Service Plan"
                        :searchable="true"
                        :clearable="false"
                        :is-invalid="hasFieldError(`services.${index}.servicePlanId`)"
                        @update:modelValue="onServicePlanChange(index)"
                      />
                      <div v-if="hasFieldError(`services.${index}.servicePlanId`)" class="invalid-feedback d-block">
                        {{ getFieldError(`services.${index}.servicePlanId`) }}
                      </div>
                    </div>
                    <div class="col-md-4">
                      <CustomSelect2
                        v-model="item.category"
                        :options="categoryOptions"
                        :get-option-label="(opt) => opt.label"
                        :reduce="(opt) => opt.value"
                        placeholder="Kategori"
                        :searchable="false"
                        :clearable="false"
                      />
                      <div v-if="hasFieldError(`services.${index}.category`)" class="invalid-feedback d-block">
                        {{ getFieldError(`services.${index}.category`) }}
                      </div>
                    </div>
                    <div class="col-md-2 d-flex justify-content-end">
                      <button @click.prevent="didStore.removeServiceItem(index)" class="btn btn-outline-danger">Hapus</button>
                    </div>
                  </div>
                  <hr class="my-4">
                </div>
                <div class="mt-4">
                  <button @click.prevent="didStore.addServiceItem()" class="btn btn-primary">Tambah Service</button>
                </div>
              </div>
            </div>

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="loading"
              cancel-label="Tutup"
              @next="next"
              @previous="previous"
              @cancel="didStore.closeModal()"
            />
          </form>
        </template>
      </Modal>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDidStore } from '~/stores/did'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import DidExpandedRow from '~/components/table/DidExpandedRow.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import Column from 'primevue/column'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useFormatRupiah } from '~/composables/formatRupiah'

const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()

const myDataTableRef = ref(null)
const didStore = useDidStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()

const { dids, loading, loadingStats, totalRecords, statistics, params, form, isEditMode, showModal, validationErrors } = storeToRefs(didStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const expandedRows = ref({})
const formRoot = ref(null)
const formSteps = [
  { id: 'did-tabs-info', label: 'Informasi', icon: 'ri-information-line' },
  { id: 'did-tabs-services', label: 'Services', icon: 'ri-service-line' },
]
const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  paneClass,
  reset,
  validateAll,
} = useTabbedFormNavigation({ steps: formSteps, formRoot })

const statItems = computed(() => [
  { key: 'total', label: 'Total DID', value: statistics.value.total, icon: 'ri-list-check-2', iconBgClass: 'bg-label-primary', subtitle: 'Semua DID' },
  { key: 'withServices', label: 'Dengan Service', value: statistics.value.withServices, icon: 'ri-service-line', iconBgClass: 'bg-label-info' },
  { key: 'provinces', label: 'Provinsi', value: statistics.value.provinces, icon: 'ri-map-pin-line', iconBgClass: 'bg-label-success', valueClass: 'text-success' },
  { key: 'linkedServices', label: 'Linked Services', value: statistics.value.linkedServices, icon: 'ri-links-line', iconBgClass: 'bg-label-warning' },
])

const modalTitle = computed(() => (isEditMode.value ? 'Edit DID' : 'Tambah DID'))
const modalDescription = computed(() =>
  isEditMode.value
    ? 'Silakan ubah data DID di bawah ini.'
    : 'Silakan isi form di bawah ini untuk menambahkan DID baru.'
)

const provinceOptions = ref([])
const regencyOptions = ref([])
const servicePlanOptions = ref([])

const categoryOptions = [
  { label: 'Delivery', value: 'delivery' },
  { label: 'Installation', value: 'installation' },
  { label: 'Survey', value: 'survey' },
  { label: 'Dismantle', value: 'dismantle' },
]

async function fetchProvinceOptions() {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.province()}?page=1&rows=500`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) { provinceOptions.value = []; return }
    const json = await res.json()
    if (Array.isArray(json)) provinceOptions.value = json
    else if (json.data && Array.isArray(json.data)) provinceOptions.value = json.data
    else provinceOptions.value = []
  } catch (e) {
    console.error('Error fetching provinces:', e)
    provinceOptions.value = []
  }
}

async function fetchRegencyOptions() {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.regency()}?page=1&rows=1000`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) { regencyOptions.value = []; return }
    const json = await res.json()
    if (Array.isArray(json)) regencyOptions.value = json
    else if (json.data && Array.isArray(json.data)) regencyOptions.value = json.data
    else regencyOptions.value = []
  } catch (e) {
    console.error('Error fetching regencies:', e)
    regencyOptions.value = []
  }
}

async function fetchServicePlanOptions() {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.servicePlan()}?page=1&rows=500`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) { servicePlanOptions.value = []; return }
    const json = await res.json()
    if (Array.isArray(json)) servicePlanOptions.value = json
    else if (json.data && Array.isArray(json.data)) servicePlanOptions.value = json.data
    else servicePlanOptions.value = []
  } catch (e) {
    console.error('Error fetching service plans:', e)
    servicePlanOptions.value = []
  }
}

const filteredRegencies = computed(() => {
  if (!form.value.provinceId) return []
  return regencyOptions.value.filter((r) => r.provinceId === form.value.provinceId)
})

const onProvinceChange = () => { form.value.regencyId = null }

const onServicePlanChange = (_index) => {
  // reserved for future service-plan dependent fields
}


const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

let modalInstance = null

onMounted(() => {
  Promise.all([
    didStore.fetchDids(),
    didStore.fetchStatistics(),
    fetchProvinceOptions(),
    fetchRegencyOptions(),
    fetchServicePlanOptions(),
    permissionStore.fetchPermissions(),
    userStore.loadUser(),
  ])
  const modalElement = document.getElementById('DidModal')
  if (modalElement) {
    modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(modalElement) : null
  }
  setListTitle('DID', totalRecords.value)
})

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await didStore.saveDid()
}

watch(showModal, async (newValue) => {
  if (newValue) {
    reset()
    modalInstance?.show()
    if (provinceOptions.value.length === 0) await fetchProvinceOptions()
    if (regencyOptions.value.length === 0) await fetchRegencyOptions()
    if (servicePlanOptions.value.length === 0) await fetchServicePlanOptions()
  } else {
    modalInstance?.hide()
  }
})

const handleRowsChange = (value) => {
  params.value.rows = Number(value) || 10
  params.value.first = 0
  didStore.fetchDids()
}

const debouncedSearch = useDebounceFn(() => {
  didStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => didStore.setPagination(event)
const onSort = (event) => didStore.setSort(event)
const onRowToggle = (e) => { expandedRows.value = e.data }

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'csv') {
      myDataTableRef.value?.exportCSV({ title: 'Data DID', border: true })
    } else if (format === 'excel') {
      const exportResult = await didStore.fetchDidsForExport()
      myDataTableRef.value?.exportExcel({
        title: `Data DID ${exportResult.nmPerusahaan}`,
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
  return validationErrors.value.some((err) => typeof err !== 'string' && (err.field === fieldName || err.rule === fieldName))
}

const getFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return ''
  const err = validationErrors.value.find((e) => typeof e !== 'string' && (e.field === fieldName || e.rule === fieldName))
  return err && typeof err === 'object' && 'message' in err ? String(err.message) : ''
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'DID',
  description: 'DID (Delivery, Installation, Survey, Dismantle)',
  keywords: 'DID, Accounting, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
})
</script>

<style scoped>
.form-label { font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
.form-control, .form-select { border-radius: 0.375rem; border: 1px solid #d1d5db; padding: 0.75rem; }
.form-control:focus, .form-select:focus { border-color: #696cff; box-shadow: 0 0 0 0.2rem rgba(105, 108, 255, 0.25); outline: 0; }
</style>
