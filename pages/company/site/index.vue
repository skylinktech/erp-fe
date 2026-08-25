<template>
  <div class="content-wrapper">
    <!-- Content -->
    <div class="container-xxl flex-grow-1 container-p-y">
      
      <p class="mb-6">
        Kelola site untuk kebutuhan lokasi kantor, gudang, tower, project, dan lainnya.
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
                <p class="mb-0">Total Site</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-map-pin-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ totalSites }}</h5>
                  <span class="text-muted">Site terdaftar</span>
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
          <h4 class="mt-6 mb-1">Daftar Site</h4>
          <p class="mb-0">Temukan dan kelola semua site di sistem.</p>
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
                  v-if="userHasRole('superadmin') || userHasPermission('create_site')"
                  @click="siteStore.openModal()"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Site
                </button>
                <button @click="exportData('excel')" class="btn btn-outline-secondary" :disabled="loading">
                  <i class="ri-download-line me-1"></i>
                  Export Excel
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari site..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <DataTable
                ref="myDataTableRef"
                :value="sites"
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
                <Column field="name" header="Nama Site" :sortable="true" style="min-width:200px">
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
                <Column field="city" header="Kota" :sortable="true" style="min-width:120px">
                  <template #body="slotProps">
                    <span>{{ slotProps.data.city || '-' }}</span>
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true" style="min-width:120px">
                  <template #body="slotProps">
                    <span class="badge" :class="getStatusBadgeClass(slotProps.data.status)">
                      {{ getStatusLabel(slotProps.data.status) }}
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
                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_site') || userHasPermission('view_site') || userHasPermission('view_site_equipment') || userHasPermission('access_site_equipment')">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="goToSiteDetail(slotProps.data.id)"
                          >
                            <i class="ri-eye-line me-2"></i> Detail / Equipment
                          </a>
                        </li>
                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_site')">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="siteStore.openModal(slotProps.data)"
                          >
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_site')">
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            @click="siteStore.deleteSite(slotProps.data.id)"
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

        <!-- Site Modal -->
        <Modal
          :model-value="showModal"
          @close="siteStore.closeModal"
          id="SiteModal"
          :title="modalTitle"
          :description="modalDescription"
          :validation-errors-from-parent="validationErrors"
        >
          <template #default>
            <form @submit.prevent="onSubmitSiteForm">
              <div class="row g-6">
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.name"
                      placeholder="Masukkan nama site"
                    />
                    <label>Nama Site <span class="text-danger" aria-hidden="true">*</span></label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <select class="form-select" v-model="form.type">
                      <option value="">Pilih Tipe</option>
                      <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <label>Tipe Site <span class="text-danger" aria-hidden="true">*</span></label>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-floating form-floating-outline">
                    <select class="form-select" v-model="form.status">
                      <option value="">Pilih Status</option>
                      <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <label>Status <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-floating form-floating-outline">
                    <textarea
                      class="form-control"
                      v-model="form.address"
                      placeholder="Masukkan alamat"
                      rows="2"
                    ></textarea>
                    <label>Alamat <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.city"
                      placeholder="Masukkan kota"
                    />
                    <label>Kota <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.province"
                      placeholder="Masukkan provinsi"
                    />
                    <label>Provinsi <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.country"
                      placeholder="Masukkan negara"
                    />
                    <label>Negara <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <input
                      ref="latitudeInputRef"
                      name="latitude"
                      type="number"
                      step="any"
                      class="form-control"
                      v-model="form.latitude"
                      placeholder="-6.2088"
                    />
                    <label>Latitude</label>
                  </div>
                  <small class="text-muted d-block mt-1">Range: -90 s/d 90 (contoh: -6.2088)</small>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <input
                      ref="longitudeInputRef"
                      name="longitude"
                      type="number"
                      step="any"
                      class="form-control"
                      v-model="form.longitude"
                      placeholder="106.8456"
                    />
                    <label>Longitude</label>
                  </div>
                  <small class="text-muted d-block mt-1">Range: -180 s/d 180 (contoh: 106.8456)</small>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="date"
                      class="form-control"
                      v-model="form.startDate"
                      placeholder="Masukkan tanggal mulai"
                    />
                    <label>Tanggal Mulai <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="date"
                      class="form-control"
                      v-model="form.endDate"
                      placeholder="Masukkan tanggal selesai"
                    />
                    <label>Tanggal Selesai <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <select class="form-select" v-model="form.parentId">
                      <option :value="null">Pilih Parent Site (Opsional)</option>
                      <option v-for="parent in parentOptions" :key="parent.id" :value="parent.id">
                        [{{ getTypeLabel(parent.type) }}] {{ parent.code }} - {{ parent.name }}
                      </option>
                    </select>
                    <label>Parent Site <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating form-floating-outline">
                    <select class="form-select" v-model="form.costCenterId">
                      <option :value="null">Pilih Cost Center (Opsional)</option>
                      <option
                        v-for="cc in costCenterOptions"
                        :key="cc.id"
                        :value="cc.id"
                      >
                        {{ cc.code }} - {{ cc.name }}
                      </option>
                    </select>
                    <label>Cost Center <span class="text-muted small">(Opsional)</span></label>
                  </div>
                </div>
              </div>
              <div class="mt-4 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="siteStore.closeModal()">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSiteStore } from '~/stores/site'
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
const siteStore = useSiteStore()
const costCenterStore = useCostCenterStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const latitudeInputRef = ref<HTMLInputElement | null>(null)
const longitudeInputRef = ref<HTMLInputElement | null>(null)

// Computed dari store
const loading = computed(() => siteStore.loading)
const sites = computed(() => siteStore.sites || [])
const totalRecords = computed(() => siteStore.totalRecords || 0)
const totalSites = computed(() => totalRecords.value)
const params = computed(() => siteStore.params)
const form = computed(() => siteStore.form)
const isEditMode = computed(() => siteStore.isEditMode)
const showModal = computed(() => siteStore.showModal)
const validationErrors = computed(() =>
  Array.isArray(siteStore.validationErrors) ? siteStore.validationErrors : []
)

// Parent options - exclude current item saat edit
const parentOptions = computed(() => {
  const allSites = siteStore.sites || []
  const currentForm = form.value

  return allSites.filter((site) => {
    // Exclude current item saat edit
    if (isEditMode.value && currentForm.id && site.id === currentForm.id) {
      return false
    }
    // Exclude item yang sudah memiliki parent (hanya root level yang bisa jadi parent)
    if (site.parentId) {
      return false
    }
    return true
  })
})

// Cost center options
const costCenterOptions = computed(() => costCenterStore.costCenters || [])

const typeOptions = [
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'tower', label: 'Tower' },
  { value: 'project', label: 'Project' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
]

// Submit: baca latitude/longitude dari DOM (nilai terakhir yang terlihat) lalu kirim ke store
function onSubmitSiteForm() {
  const latRaw = latitudeInputRef.value?.value ?? form.value.latitude
  const lngRaw = longitudeInputRef.value?.value ?? form.value.longitude
  siteStore.saveSite({ latitude: latRaw, longitude: lngRaw })
}

// Modal computed
const modalTitle = computed(() => (isEditMode.value ? 'Edit Site' : 'Tambah Site Baru'))
const modalDescription = computed(() =>
  isEditMode.value
    ? 'Silakan ubah data site di bawah ini.'
    : 'Silakan isi form di bawah ini untuk menambahkan site baru.'
)

// Helpers
const getTypeLabel = (type) => {
  const labels = {
    office: 'Office',
    warehouse: 'Warehouse',
    tower: 'Tower',
    project: 'Project',
    other: 'Other',
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    planned: 'Planned',
    active: 'Active',
    inactive: 'Inactive',
    closed: 'Closed',
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    planned: 'bg-label-info',
    active: 'bg-label-success',
    inactive: 'bg-label-warning',
    closed: 'bg-label-danger',
  }
  return classes[status] || 'bg-label-secondary'
}

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'csv' && myDataTableRef.value) {
      myDataTableRef.value.exportCSV({
        title: 'Data Site',
        border: true,
      })
    } else if (format === 'excel') {
      // Ambil data dari API untuk export Excel
      const exportResult = await siteStore.fetchSitesForExport()
      if (myDataTableRef.value && exportResult.data) {
        await myDataTableRef.value.exportExcel({
          title: `Data Site ${exportResult.nmPerusahaan ? `- ${exportResult.nmPerusahaan}` : ''}`,
          data: exportResult.data,
        })
        toast.success({
          title: 'Success',
          message: 'Data site berhasil diekspor ke Excel',
          color: 'green',
          position: 'bottomRight',
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
      position: 'bottomRight',
      layout: 2,
    })
  }
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions()

function goToSiteDetail(id) {
  if (!id) return
  navigateTo(`/company/site/${id}`)
}

// Lifecycle
onMounted(async () => {
  try {
    await permissionStore.fetchPermissions()
    await userStore.loadUser()
    await siteStore.fetchSites()
    // Fetch cost centers untuk dropdown
    await costCenterStore.fetchCostCenters(true)
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
  setListTitle('Sites', totalSites.value)
})

const debouncedSearch = useDebounceFn(() => {
  siteStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => {
  siteStore.setPagination(event)
}

const onSort = (event) => {
  siteStore.setSort(event)
}

const handleRowsChange = async (value) => {
  const rowsValue = Number(value) || 10
  siteStore.params.rows = rowsValue
  siteStore.params.first = 0
  await siteStore.fetchSites(true)
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Sites',
  description: 'Site Management',
  keywords: 'Site, Company, Sinergi Innovate Pratama',
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
