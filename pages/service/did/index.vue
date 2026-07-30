<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
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
          <h4 class="mb-1">List DID</h4>
          <p class="mb-6">
            List DID (Delivery, Installation, Survey, Dismantle) yang terdaftar di sistem
            <span v-if="globalFilterValue" class="text-muted">
              - Menampilkan {{ totalRecords }} hasil untuk "{{ globalFilterValue }}"
            </span>
          </p>
          <div class="row g-6 mb-6">
            <div class="col-6">
              <div class="card h-100">
                <div class="row h-100">
                  <div class="col-sm-5">
                    <div class="d-flex align-items-end h-100 justify-content-center">
                      <i class="ri-list-check-2 text-primary" style="font-size: 3rem"></i>
                    </div>
                  </div>
                  <div class="col-sm-7">
                    <div class="card-body text-sm-end text-center ps-sm-0">
                      <h4 class="mb-1">
                        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span v-else>{{ totalDids }}</span>
                      </h4>
                      <p class="mb-0 mt-1">Total DID</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="card h-100">
                <div class="row h-100">
                  <div class="col-sm-5">
                    <div class="d-flex align-items-end h-100 justify-content-center">
                      <img
                        src="/img/illustrations/add-new-role-illustration.png"
                        class="img-fluid"
                        alt="Image"
                        width="70"
                      />
                    </div>
                  </div>
                  <div class="col-sm-7">
                    <div class="card-body text-sm-end text-center ps-sm-0">
                      <button
                        v-if="userHasRole('superadmin') || userHasPermission('create_did')"
                        @click="didStore.openModal()"
                        class="btn btn-primary mb-2 text-nowrap add-new-role"
                      >
                        Tambah DID
                      </button>
                      <p class="mb-0 mt-1">Buat DID baru</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-6">
            <div class="col-12">
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
                              style="width: 8rem"
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
                            <div class="input-group">
                              <InputText
                                v-model="tableControls.search"
                                placeholder="Cari berdasarkan kode, nama, SLA, provinsi atau kabupaten..."
                                class="w-full md:w-20rem"
                                @input="(e) => handleSearch(e.target?.value || '')"
                              />
                            </div>
                          </div>
                        </div>
                        <div class="d-md-none">
                          <div class="mb-3">
                            <div class="d-flex align-items-center">
                              <span class="me-2" style="font-weight: 500; white-space: nowrap; color: #6c757d">Baris:</span>
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
                              placeholder="Cari berdasarkan kode, nama, SLA, provinsi atau kabupaten..."
                              class="w-100"
                              style="height: 38px; border-radius: 6px"
                              @input="(e) => handleSearch(e.target?.value || '')"
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
            </div>
          </div>
        </div>
      </template>

      <Modal
        id="DidModal"
        :title="modalTitle"
        :description="modalDescription"
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form @submit.prevent="didStore.saveDid()">
            <div class="row">
              <div class="col">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#did-tabs-info" role="tab" aria-selected="true" type="button">
                      <span class="ri-information-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Informasi</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#did-tabs-services" role="tab" aria-selected="false" type="button">
                      <span class="ri-service-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Services</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-6">
              <!-- Tab Info -->
              <div class="tab-pane fade active show" id="did-tabs-info" role="tabpanel">
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
              <div class="tab-pane fade" id="did-tabs-services" role="tabpanel">
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

            <div class="modal-footer mt-6">
              <button type="button" class="btn btn-outline-secondary" @click="didStore.closeModal()">
                Tutup
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Simpan
              </button>
            </div>
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
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
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

const { dids, loading, totalRecords, totalDids, params, form, isEditMode, showModal, validationErrors } = storeToRefs(didStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const expandedRows = ref({})

const tableControls = ref({
  rows: 10,
  search: '',
})

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
    
    if (!res.ok) {
      console.error('Failed to fetch provinces:', res.status, res.statusText)
      provinceOptions.value = []
      return
    }
    
    const json = await res.json()
    // Handle pagination response format (data is array) or direct array
    if (Array.isArray(json)) {
      provinceOptions.value = json
    } else if (json.data && Array.isArray(json.data)) {
      provinceOptions.value = json.data
    } else {
      provinceOptions.value = []
    }
    
    if (provinceOptions.value.length === 0) {
      console.warn('No provinces found in response:', json)
    } else {
      console.log(`Loaded ${provinceOptions.value.length} provinces`)
    }
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
    
    if (!res.ok) {
      console.error('Failed to fetch regencies:', res.status, res.statusText)
      regencyOptions.value = []
      return
    }
    
    const json = await res.json()
    // Handle pagination response format (data is array) or direct array
    if (Array.isArray(json)) {
      regencyOptions.value = json
    } else if (json.data && Array.isArray(json.data)) {
      regencyOptions.value = json.data
    } else {
      regencyOptions.value = []
    }
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
    
    if (!res.ok) {
      console.error('Failed to fetch service plans:', res.status, res.statusText)
      servicePlanOptions.value = []
      return
    }
    
    const json = await res.json()
    // Handle pagination response format (data is array) or direct array
    if (Array.isArray(json)) {
      servicePlanOptions.value = json
    } else if (json.data && Array.isArray(json.data)) {
      servicePlanOptions.value = json.data
    } else {
      servicePlanOptions.value = []
    }
  } catch (e) {
    console.error('Error fetching service plans:', e)
    servicePlanOptions.value = []
  }
}

const filteredRegencies = computed(() => {
  if (!form.value.provinceId) return []
  return regencyOptions.value.filter((r) => r.provinceId === form.value.provinceId)
})

const onProvinceChange = () => {
  form.value.regencyId = null
}

const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0
  return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

const getUniqueCategories = (services) => {
  if (!services || !Array.isArray(services)) return []
  const categories = services.map(s => s.category).filter(Boolean)
  return [...new Set(categories)]
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

let modalInstance = null

onMounted(() => {
  tableControls.value.rows = Number(params.value.rows) || 10
  tableControls.value.search = globalFilterValue.value

  didStore.fetchDids()
  didStore.fetchTotalDids()
  fetchProvinceOptions()
  fetchRegencyOptions()
  fetchServicePlanOptions()
  permissionStore.fetchPermissions()
  userStore.loadUser()

  const modalElement = document.getElementById('DidModal')
  if (modalElement) {
    modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(modalElement) : null
  }
  setListTitle('DID', dids.value.length)
})

watch(showModal, async (newValue) => {
  if (newValue) {
    modalInstance?.show()
    // Ensure options are loaded when modal opens
    if (provinceOptions.value.length === 0) {
      await fetchProvinceOptions()
    }
    if (regencyOptions.value.length === 0) {
      await fetchRegencyOptions()
    }
    if (servicePlanOptions.value.length === 0) {
      await fetchServicePlanOptions()
    }
  } else {
    modalInstance?.hide()
  }
})

const handleRowsChange = (value) => {
  const rowsValue = Number(value) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  didStore.fetchDids()
}

const handleSearch = (value) => {
  globalFilterValue.value = value
  tableControls.value.search = value
  params.value.first = 0
}

watch(
  () => params.value.rows,
  (newValue) => {
    tableControls.value.rows = Number(newValue) || 10
  }
)

watch(
  () => params.value.search,
  (newValue) => {
    if (newValue !== globalFilterValue.value) {
      globalFilterValue.value = newValue
      tableControls.value.search = newValue
    }
  }
)

const debouncedSearch = useDebounceFn(() => {
  didStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => didStore.setPagination(event)
const onSort = (event) => didStore.setSort(event)
const onRowToggle = (e) => {
  expandedRows.value = e.data
}

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'csv') {
      myDataTableRef.value?.exportCSV({
        title: 'Data DID',
        border: true,
      })
    } else if (format === 'excel') {
      const exportResult = await didStore.fetchDidsForExport()
      myDataTableRef.value?.exportExcel({
        title: `Data DID ${exportResult.nmPerusahaan}`,
        data: exportResult.data,
      })
    } else if (format === 'pdf') {
      // placeholder
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error({
      title: 'Error',
      message: 'Gagal melakukan export data',
      color: 'red',
      position: 'topRight',
    })
  }
}

const hasFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false
  return validationErrors.value.some((err) => {
    if (typeof err === 'string') return false
    return err.field === fieldName || err.rule === fieldName
  })
}

const getFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return ''
  const err = validationErrors.value.find((e) => {
    if (typeof e === 'string') return false
    return e.field === fieldName || e.rule === fieldName
  })
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
.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.form-select:focus {
  border-color: #696cff;
  box-shadow: 0 0 0 0.2rem rgba(105, 108, 255, 0.25);
  outline: 0;
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
