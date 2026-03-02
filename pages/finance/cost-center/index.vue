<template>
  <div class="content-wrapper">
    <!-- Content -->
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">Cost Centers</h4>
      <p class="mb-6">
        Kelola cost center untuk kebutuhan alokasi biaya dan pelaporan keuangan.
      </p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6" v-if="loading">
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
                <p class="mb-0">Total Cost Center</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-group-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ totalCostCenters }}</h5>
                  <span class="text-muted">Cost center terdaftar</span>
                </div>
                <a href="javascript:void(0);" class="text-secondary">
                  <i class="ri-file-copy-line ri-22px"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Daftar Cost Center</h4>
          <p class="mb-0">Temukan dan kelola semua cost center di sistem.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="params.rows"
                  :options="rowsPerPageOptionsArray"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem;"
                />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_cost_center')"
                  @click="costCenterStore.openModal()"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Cost Center
                </button>
                <button @click="exportData('excel')" class="btn btn-outline-secondary" :disabled="loading">
                  <i class="ri-download-line me-1"></i>
                  Export Excel
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari cost center..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <DataTable
                ref="myDataTableRef"
                :value="costCenters"
                :rows="Number(params.rows)"
                :loading="loading"
                :totalRecords="totalRecords"
                :first="params.first"
                paginator
                @page="onPage($event)"
                @sort="onSort($event)"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                dataKey="id"
                tableStyle="min-width: 50rem"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">
                    {{ params.first + slotProps.index + 1 }}
                  </template>
                </Column>
                <Column field="code" header="Kode" :sortable="true" style="min-width:120px">
                  <template #body="slotProps">
                    <span class="fw-semibold">{{ slotProps.data.code }}</span>
                  </template>
                </Column>
                <Column field="name" header="Nama Cost Center" :sortable="true" style="min-width:200px">
                  <template #body="slotProps">
                    <div class="fw-semibold">{{ slotProps.data.name }}</div>
                  </template>
                </Column>
                <Column field="type" header="Tipe" :sortable="true" style="min-width:150px">
                  <template #body="slotProps">
                    <span class="badge bg-label-secondary">
                      {{ getTypeLabel(slotProps.data.type) }}
                    </span>
                  </template>
                </Column>
                <Column field="parent" header="Parent" :sortable="true" style="min-width:150px">
                  <template #body="slotProps">
                    <span v-if="slotProps.data.parent" class="text-muted">
                      {{ slotProps.data.parent.code }} - {{ slotProps.data.parent.name }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </template>
                </Column>
                <Column field="isActive" header="Status" :sortable="true" style="min-width:120px">
                  <template #body="slotProps">
                    <span
                      class="badge"
                      :class="slotProps.data.isActive ? 'bg-label-success' : 'bg-label-danger'"
                    >
                      {{ slotProps.data.isActive ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:8rem">
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
                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_cost_center')">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="costCenterStore.openModal(slotProps.data)"
                          >
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_cost_center')">
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            @click="costCenterStore.deleteCostCenter(slotProps.data.id)"
                          >
                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                          </a>
                        </li>
                      </ul>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Cost Center Modal -->
        <Modal
          id="CostCenterModal"
          :title="modalTitle"
          :description="modalDescription"
          :validation-errors-from-parent="validationErrors"
        >
          <template #default>
            <form @submit.prevent="costCenterStore.saveCostCenter()">
              <div class="row g-6">
                <div class="col-md-12">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.name"
                      placeholder="Masukkan nama cost center"
                    />
                    <label>Nama Cost Center *</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <select
                      class="form-select"
                      v-model="form.type"
                    >
                      <option value="">Pilih Tipe</option>
                      <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <label>Tipe Cost Center *</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <select
                      class="form-select"
                      v-model="form.parentId"
                      :disabled="!form.type"
                    >
                      <option :value="null">Pilih Parent (Opsional)</option>
                      <option
                        v-for="parent in parentOptions"
                        :key="parent.id"
                        :value="parent.id"
                      >
                        [{{ getTypeLabel(parent.type) }}] {{ parent.code }} - {{ parent.name }}
                      </option>
                    </select>
                    <label>Parent Cost Center</label>
                    <small v-if="form.type" class="text-muted">
                      <i class="ri-information-line me-1"></i>
                      Pilih parent sesuai hierarki: {{ getTypeLabel(form.type) }} dapat memiliki parent
                      {{ getParentTypeHint(form.type) }}
                    </small>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="form.isActive"
                      id="isActive"
                    />
                    <label class="form-check-label" for="isActive">
                      Aktif
                    </label>
                  </div>
                </div>
              </div>
              <div class="mt-4 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="costCenterStore.closeModal()">
                  Tutup
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? 'Update' : 'Simpan' }}
                </button>
              </div>
            </form>
          </template>
        </Modal>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCostCenterStore } from '~/stores/cost-center'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDebounceFn } from '@vueuse/core'
import Modal from '~/components/modal/Modal.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()

// Stores
const costCenterStore = useCostCenterStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Computed dari store
const loading = computed(() => costCenterStore.loading)
const costCenters = computed(() => costCenterStore.costCenters || [])
const totalRecords = computed(() => costCenterStore.totalRecords || 0)
const totalCostCenters = computed(() => totalRecords.value)
const params = computed(() => costCenterStore.params)
const form = computed(() => costCenterStore.form)
const isEditMode = computed(() => costCenterStore.isEditMode)
const showModal = computed(() => costCenterStore.showModal)
const validationErrors = computed(() =>
  Array.isArray(costCenterStore.validationErrors) ? costCenterStore.validationErrors : []
)

// Parent options dengan filter yang lebih pintar
const parentOptions = computed(() => {
  const allCostCenters = costCenterStore.costCenters || []
  const currentForm = form.value

  // Filter berdasarkan hierarki tipe:
  // - company bisa jadi parent untuk department, site, project
  // - department bisa jadi parent untuk site, project
  // - site bisa jadi parent untuk project
  // - project tidak bisa jadi parent
  const typeHierarchy = {
    company: ['department', 'site', 'project'],
    department: ['site', 'project'],
    site: ['project'],
    project: [],
  }

  const allowedParentTypes = currentForm.type
    ? typeHierarchy[currentForm.type] || []
    : ['company', 'department', 'site', 'project']

  return allCostCenters.filter((cc) => {
    // Exclude current item saat edit
    if (isEditMode.value && currentForm.id && cc.id === currentForm.id) {
      return false
    }

    // Exclude item yang sudah memiliki parent (hanya root level yang bisa jadi parent)
    if (cc.parentId) {
      return false
    }

    // Filter berdasarkan tipe yang diizinkan
    if (currentForm.type && allowedParentTypes.length > 0) {
      return allowedParentTypes.includes(cc.type)
    }

    return true
  })
})

const typeOptions = [
  { value: 'company', label: 'Company' },
  { value: 'department', label: 'Department' },
  { value: 'site', label: 'Site' },
  { value: 'project', label: 'Project' },
]

// Modal computed
const modalTitle = computed(() => (isEditMode.value ? 'Edit Cost Center' : 'Tambah Cost Center Baru'))
const modalDescription = computed(() =>
  isEditMode.value
    ? 'Silakan ubah data cost center di bawah ini.'
    : 'Silakan isi form di bawah ini untuk menambahkan cost center baru.'
)

// Helpers
const getTypeLabel = (type) => {
  const labels = {
    company: 'Company',
    department: 'Department',
    site: 'Site',
    project: 'Project',
  }
  return labels[type] || type
}

const getParentTypeHint = (type) => {
  const hints = {
    company: 'tidak ada (root level)',
    department: 'Company',
    site: 'Company atau Department',
    project: 'Company, Department, atau Site',
  }
  return hints[type] || 'tidak ada'
}

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'csv' && myDataTableRef.value) {
      myDataTableRef.value.exportCSV({
        title: 'Data Cost Center',
        border: true,
      })
    } else if (format === 'excel') {
      // Ambil data dari API untuk export Excel
      const exportResult = await costCenterStore.fetchCostCentersForExport()
      if (myDataTableRef.value && exportResult.data) {
        await myDataTableRef.value.exportExcel({
          title: `Data Cost Center ${exportResult.nmPerusahaan ? `- ${exportResult.nmPerusahaan}` : ''}`,
          data: exportResult.data,
        })
        toast.success({
          title: 'Success',
          message: 'Data cost center berhasil diekspor ke Excel',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      }
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error({
      title: 'Error',
      message: error.message || 'Gagal melakukan export data',
      color: 'red',
      position: 'topRight',
      layout: 2,
    })
  }
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions()

// Lifecycle
let modalInstance = null
onMounted(async () => {
  try {
    await permissionStore.fetchPermissions()
    await userStore.loadUser()
    await costCenterStore.fetchCostCenters()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
  setListTitle('Cost Centers', totalCostCenters.value)
})

// Watch modal visibility untuk bootstrap modal
watch(showModal, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const modalElement = document.getElementById('CostCenterModal')
      if (modalElement && !modalInstance) {
        // @ts-ignore
        modalInstance = new bootstrap.Modal(modalElement)
      }
      modalInstance?.show()
    })
  } else {
    modalInstance?.hide()
  }
})

const debouncedSearch = useDebounceFn(() => {
  costCenterStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => {
  costCenterStore.setPagination(event)
}

const onSort = (event) => {
  costCenterStore.setSort(event)
}

const handleRowsChange = async (value) => {
  const rowsValue = Number(value) || 10
  costCenterStore.params.rows = rowsValue
  costCenterStore.params.first = 0
  await costCenterStore.fetchCostCenters(true)
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Cost Centers',
  description: 'Cost Center Management',
  keywords: 'Cost Center, Accounting, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport:
    'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
})
</script>

<style scoped>
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

