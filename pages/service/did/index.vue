<template>
  <div class="content-wrapper">
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
                                placeholder="Cari berdasarkan kode, nama atau kategori..."
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
                              placeholder="Cari berdasarkan kode, nama atau kategori..."
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
                    :lazy="true"
                    :sort-field="params.sortField"
                    :sort-order="params.sortOrder"
                    sort-mode="single"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    responsive-layout="scroll"
                    paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  >
                    <Column header="#" :sortable="false">
                      <template #body="slotProps">
                        {{ params.first + slotProps.index + 1 }}
                      </template>
                    </Column>
                    <Column field="code" header="Kode" :sortable="true" class="text-nowrap" />
                    <Column field="name" header="Nama" :sortable="true" />
                    <Column field="price" header="Harga" :sortable="true" class="text-nowrap">
                      <template #body="slotProps">
                        {{ formatRupiah(slotProps.data.price) }}
                      </template>
                    </Column>
                    <Column field="category" header="Kategori" :sortable="true" class="text-nowrap">
                      <template #body="slotProps">
                        {{ labelCategory(slotProps.data.category) }}
                      </template>
                    </Column>
                    <Column field="unit.name" header="Unit" :sortable="false" class="text-nowrap">
                      <template #body="slotProps">
                        {{ slotProps.data.unit?.name || '-' }}
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
            <div class="row g-4">
              <div class="col-md-12">
                <label class="form-label">Kode <span class="text-danger">*</span></label>
                <input
                  v-model="form.code"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: DEL-001"
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
              <div class="col-md-6">
                <label class="form-label">Kategori <span class="text-danger">*</span></label>
                <select v-model="form.category" class="form-select" required>
                  <option value="delivery">Delivery</option>
                  <option value="installation">Installation</option>
                  <option value="survey">Survey</option>
                  <option value="dismantle">Dismantle</option>
                </select>
                <div v-if="hasFieldError('category')" class="invalid-feedback d-block">
                  {{ getFieldError('category') }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Harga</label>
                <input
                  type="text"
                  class="form-control"
                  :value="formatRupiah(form.price)"
                  @input="updatePriceFromInput"
                  placeholder="0"
                />
                <div v-if="hasFieldError('price')" class="invalid-feedback d-block">
                  {{ getFieldError('price') }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Unit <span class="text-danger">*</span></label>
                <CustomSelect2
                  v-model="form.unitId"
                  :options="unitOptions"
                  :get-option-label="(opt) => opt?.name ?? ''"
                  :reduce="(opt) => (opt != null ? opt.id : null)"
                  placeholder="Pilih unit"
                  :searchable="true"
                  :clearable="false"
                  :is-invalid="hasFieldError('unitId')"
                />
                <div v-if="hasFieldError('unitId')" class="invalid-feedback d-block">
                  {{ getFieldError('unitId') }}
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

const unitOptions = ref([])

async function fetchUnitOptions() {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.unit()}?page=1&rows=500`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    const json = await res.json()
    unitOptions.value = json.data || []
  } catch (e) {
    unitOptions.value = []
  }
}

const CATEGORY_LABELS = {
  delivery: 'Delivery',
  installation: 'Installation',
  survey: 'Survey',
  dismantle: 'Dismantle',
}

function labelCategory(value) {
  return CATEGORY_LABELS[value] || value || '-'
}

const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0
  return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

const updatePriceFromInput = (event) => {
  const numericValue = parseRupiahToNumber(event.target?.value || '')
  didStore.form.price = Math.round(numericValue)
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
  fetchUnitOptions()
  permissionStore.fetchPermissions()
  userStore.loadUser()

  const modalElement = document.getElementById('DidModal')
  if (modalElement) {
    modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(modalElement) : null
  }
  setListTitle('DID', dids.value.length)
})

watch(showModal, (newValue) => {
  if (newValue) {
    modalInstance?.show()
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
  keywords: 'DID, Accounting, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
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
