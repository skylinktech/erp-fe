<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6">
        Kelola permintaan akses pegawai terhadap modul dan menu aplikasi
      </p>

      <div class="row g-6 mb-6">
        <div v-if="stats.draft !== undefined" class="col-xl col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Draft</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ stats.draft }}</h5>
                <span class="text-muted">Permintaan</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="stats.pending !== undefined" class="col-xl col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Pending</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ stats.pending }}</h5>
                <span class="text-muted">Permintaan</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="stats.approved !== undefined" class="col-xl col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Approved</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ stats.approved }}</h5>
                <span class="text-muted">Permintaan</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="stats.rejected !== undefined" class="col-xl col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Rejected</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-danger"><i class="ri-close-circle-line"></i></span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ stats.rejected }}</h5>
                <span class="text-muted">Permintaan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Daftar Permintaan Akses</h4>
          <p class="mb-0">Filter dan kelola permintaan akses modul/menu.</p>
        </div>
        <div class="col-12">
          <CollapsibleFilterCard
            title="Filter Permintaan Akses"
            :has-active-filters="hasActiveFilters"
            @reset="resetFilters"
          >
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Status</label>
                <select v-model="params.status" class="form-select" @change="onAccessStatusChange">
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(params.rows)"
              :rows-options="rowsPerPageOptionsArray"
              :search="globalFilterValue"
              search-placeholder="Cari pegawai, deskripsi..."
              :show-export="false"
              :export-disabled="store.loading"
              @update:rows="onAccessRequestToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
            >
              <template #add>
                <button
                  v-if="userHasRole('superadmin') || userHasRole('admin')"
                  type="button"
                  class="btn btn-primary"
                  @click="store.openModal()"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Permintaan
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="store.accessRequests"
                :rows="Number(params.rows)"
                :loading="store.loading"
                :totalRecords="store.totalRecords"
                :first="params.first"
                :lazy="true"
                @page="store.setPagination($event)"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
              >
                <Column field="id" header="#" style="min-width: 3rem;" />
                <Column field="pegawai_nama" header="Nama Pegawai" style="min-width: 12rem;">
                  <template #body="{ data }">
                    {{ data.pegawai_nama || data.pegawai?.nm_pegawai || '-' }}
                  </template>
                </Column>
                <Column header="Departemen" style="min-width: 10rem;">
                  <template #body="{ data }">{{ data.departemen || '-' }}</template>
                </Column>
                <Column header="Jabatan" style="min-width: 10rem;">
                  <template #body="{ data }">{{ data.jabatan || '-' }}</template>
                </Column>
                <Column header="Deskripsi" style="min-width: 12rem;">
                  <template #body="{ data }">
                    <span class="text-truncate d-inline-block" style="max-width: 200px;">{{ data.description || '-' }}</span>
                  </template>
                </Column>
                <Column field="status" header="Status" style="min-width: 8rem;">
                  <template #body="{ data }">
                    <span :class="getStatusBadge(data).class">{{ getStatusBadge(data).text }}</span>
                  </template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width: 10rem;">
                  <template #body="{ data }">
                    <div class="d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                        <i class="ri-more-2-fill"></i>
                      </a>
                      <ul class="dropdown-menu">
                        <li>
                          <NuxtLink :to="`/admin/access-request/${data.id}`" class="dropdown-item">
                            <i class="ri-eye-line me-2"></i> Lihat
                          </NuxtLink>
                        </li>
                        <li v-if="data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="store.openModal(data)">
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li v-if="data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="handleSubmit(data.id)">
                            <i class="ri-send-plane-line me-2"></i> Submit
                          </a>
                        </li>
                        <li v-if="data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="store.deleteRequest(data.id)">
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

    <!-- Modal Form -->
    <Modal
      id="AccessRequestModal"
      :title="store.isEditMode ? 'Edit Permintaan Akses' : 'Tambah Permintaan Akses'"
      :description="store.isEditMode ? 'Ubah detail permintaan akses.' : 'Isi form untuk membuat permintaan akses modul/menu.'"
    >
      <template #default>
        <form @submit.prevent="store.save()">
          <div class="row g-3 p-3">
            <div class="col-12">
              <label class="form-label">Nama Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="store.form.pegawaiId"
                :options="pegawaiOptions"
                :get-option-label="(o) => o.nm_pegawai || o.name || '-'"
                :reduce="(o) => o.id_pegawai"
                searchable
                placeholder="-- Pilih Pegawai --"
                @update:modelValue="onPegawaiSelect"
              />
            </div>
            <div class="col-6">
              <label class="form-label">Departemen</label>
              <input type="text" class="form-control" :value="selectedPegawaiDept" readonly placeholder="-" />
            </div>
            <div class="col-6">
              <label class="form-label">Divisi</label>
              <input type="text" class="form-control" :value="selectedPegawaiDivisi" readonly placeholder="-" />
            </div>
            <div class="col-12">
              <label class="form-label">Deskripsi/Alasan</label>
              <textarea v-model="store.form.description" class="form-control" rows="3" placeholder="Alasan permintaan akses..."></textarea>
            </div>
            <div class="col-4">
              <label class="form-label">Workflow Approval</label>
              <CustomSelect2
                v-model="store.form.workflowId"
                :options="workflowOptions"
                :get-option-label="(o) => o.name"
                :reduce="(o) => o.id"
                searchable
                clearable
                placeholder="-- Pilih Workflow (opsional) --"
              />
            </div>
            <div class="col-4">
              <label class="form-label">Prioritas</label>
              <select v-model="store.form.priority" class="form-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="col-4">
              <label class="form-label">Periode Akses</label>
              <select v-model="store.form.accessPeriod" class="form-select">
                <option value="permanent">Permanen</option>
                <option value="temporary">Sementara</option>
              </select>
            </div>
            <div v-if="store.form.accessPeriod === 'temporary'" class="col-6">
              <label class="form-label">Tanggal Berakhir</label>
              <input v-model="store.form.expiryDate" type="date" class="form-control" />
            </div>

            <!-- Permission checkbox (seperti Roles) -->
            <div class="col-12">
              <div class="permission-picker-panel">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0">Permission</h5>
                  <InputText v-model="permissionSearch" placeholder="Cari Menu..." class="form-control" style="max-width: 12rem;" />
                </div>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" id="selectAllPerm" v-model="selectAllPerm" />
                  <label class="form-check-label" for="selectAllPerm">Pilih Semua</label>
                </div>
                <DataTable
                  :value="filteredMenuDetails"
                  :rows="8"
                  paginator
                  responsiveLayout="scroll"
                  class="p-datatable-sm permission-picker-table"
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} menu"
                >
                  <Column field="name" header="Menu" style="min-width: 12rem;" />
                  <Column v-for="permName in masterPermissionNames" :key="permName" style="min-width: 5rem;">
                    <template #header>
                      <div class="text-center w-100 small fw-bold">{{ permName }}</div>
                    </template>
                    <template #body="{ data }">
                      <div v-if="getPermission(data, permName)" class="form-check d-flex justify-content-center">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :value="getPermission(data, permName).id"
                          v-model="store.form.permissionIds"
                        />
                      </div>
                    </template>
                  </Column>
                  <template #empty>
                    <div class="text-center p-4">Tidak ada data permission.</div>
                  </template>
                </DataTable>
              </div>
            </div>
          </div>
          <div class="modal-footer mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="store.closeModal()">Tutup</button>
            <button type="submit" class="btn btn-primary" :disabled="store.loading || !store.form.pegawaiId">
              <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status"></span>
              Simpan
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccessRequestStore } from '~/stores/access-request'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { mapPegawaiShowResponseToListRow } from '~/utils/pegawaiApiMapper'

const { $api } = useNuxtApp()
const { userHasRole } = usePermissions()
const { getStatusBadge } = useApprovalStatus()
const store = useAccessRequestStore()
const { params, form: _form, stats } = storeToRefs(store)

const myDataTableRef = ref(null)
const globalFilterValue = ref('')
const permissionSearch = ref('')
const pegawaiOptions = ref([])
const workflowOptions = ref([])
const permissions = ref([])
const selectedPegawaiData = ref(null)

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const masterPermissionNames = ['View', 'Create', 'Edit', 'Delete', 'Show', 'Approve', 'Reject', 'Access']

const hasActiveFilters = computed(() => !!params.value.status)

function resetFilters() {
  params.value.status = ''
  store.setStatusFilter('')
}

const selectedPegawaiDept = computed(() => {
  const h = selectedPegawaiData.value?.history
  return h?.departemen?.nama || h?.departemen?.nm_departemen || '-'
})
const selectedPegawaiDivisi = computed(() => {
  const h = selectedPegawaiData.value?.history
  return h?.divisi?.nama || h?.divisi?.nm_divisi || '-'
})

function findPegawaiOption(pegawaiId) {
  if (pegawaiId == null || pegawaiId === '') return null
  return pegawaiOptions.value.find((x) => String(x.id_pegawai) === String(pegawaiId)) ?? null
}

function hasOrgHistory(row) {
  const h = row?.history
  return !!(h?.departemen?.nama || h?.departemen?.nm_departemen || h?.divisi?.nama || h?.divisi?.nm_divisi)
}

async function resolveSelectedPegawai(pegawaiId) {
  if (!pegawaiId) {
    selectedPegawaiData.value = null
    return
  }

  const cached = findPegawaiOption(pegawaiId)
  if (cached && hasOrgHistory(cached)) {
    selectedPegawaiData.value = cached
    return
  }

  try {
    const r = await fetch($api.pegawaiShow(pegawaiId), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const raw = await r.json()
      const mapped = mapPegawaiShowResponseToListRow(raw)
      const idx = pegawaiOptions.value.findIndex((x) => String(x.id_pegawai) === String(pegawaiId))
      if (idx >= 0) {
        pegawaiOptions.value[idx] = { ...pegawaiOptions.value[idx], history: mapped.history }
        selectedPegawaiData.value = pegawaiOptions.value[idx]
      } else {
        selectedPegawaiData.value = mapped
      }
      return
    }
  } catch {
    // fallback ke data cache
  }

  selectedPegawaiData.value = cached
}

const menuDetailsWithPermissions = computed(() => {
  const result = {}
  const masterPermissions = Array.isArray(permissions.value) ? permissions.value : []

  masterPermissions.forEach((p) => {
    const permParts = p.name?.split('_')
    let menuKey = ''
    if (permParts && permParts.length > 1) {
      menuKey = permParts.slice(1).join('_')
    } else {
      menuKey = 'general'
    }
    if (menuKey.endsWith('s')) menuKey = menuKey.slice(0, -1)

    let displayPermissionName = ''
    const permName = p.name?.toLowerCase()
    if (permName?.includes('view')) displayPermissionName = 'View'
    else if (permName?.includes('create')) displayPermissionName = 'Create'
    else if (permName?.includes('update') || permName?.includes('edit')) displayPermissionName = 'Edit'
    else if (permName?.includes('delete')) displayPermissionName = 'Delete'
    else if (permName?.includes('show')) displayPermissionName = 'Show'
    else if (permName?.includes('approve')) displayPermissionName = 'Approve'
    else if (permName?.includes('reject')) displayPermissionName = 'Reject'
    else if (permName?.includes('access')) displayPermissionName = 'Access'
    if (!displayPermissionName) return

    const permissionObject = { id: p.id, name: displayPermissionName, dbName: p.name }
    if (!result[menuKey]) {
      result[menuKey] = {
        id: menuKey,
        name: menuKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        order: Object.keys(result).length,
        permissions: [],
      }
    }
    if (!result[menuKey].permissions.some((x) => x.id === permissionObject.id)) {
      result[menuKey].permissions.push(permissionObject)
    }
  })

  const sorted = Object.values(result).sort((a, b) => a.name.localeCompare(b.name))
  sorted.forEach((md) => {
    md.permissions.sort((a, b) => masterPermissionNames.indexOf(a.name) - masterPermissionNames.indexOf(b.name))
  })
  return sorted
})

const filteredMenuDetails = computed(() => {
  if (!permissionSearch.value) return menuDetailsWithPermissions.value
  const searchLower = permissionSearch.value.toLowerCase()
  return menuDetailsWithPermissions.value.filter((menu) => menu.name.toLowerCase().includes(searchLower))
})

const selectAllPerm = computed({
  get() {
    if (!permissions.value?.length) return false
    return store.form.permissionIds.length === permissions.value.length
  },
  set(value) {
    if (value) {
      store.form.permissionIds = permissions.value.map((p) => p.id)
    } else {
      store.form.permissionIds = []
    }
  },
})

function getPermission(menu, permName) {
  return menu.permissions.find((p) => p.name === permName)
}

async function onPegawaiSelect(pegawaiId) {
  await resolveSelectedPegawai(pegawaiId)
}

async function handleSubmit(id) {
  const ok = await store.submit(id)
  if (ok) await store.fetchAccessRequests()
}

async function fetchPegawai() {
  try {
    const r = await fetch(`${$api.pegawai()}?start=0&length=500`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const data = await r.json()
      pegawaiOptions.value = data.data || data || []
    }
  } catch (e) {
    pegawaiOptions.value = []
  }
}

async function fetchWorkflows() {
  try {
    const r = await fetch($api.approvalWorkflows(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const data = await r.json()
      workflowOptions.value = (data.data || data || []).filter(
        (w) => (w.entity?.code || w.entityType) === 'access_request'
      )
    }
  } catch (e) {
    workflowOptions.value = []
  }
}

async function fetchPermissions() {
  try {
    const r = await fetch($api.getPermissions(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const data = await r.json()
      permissions.value = data.data || data || []
    }
  } catch (e) {
    permissions.value = []
  }
}

const debouncedSearch = useDebounceFn(() => {
  store.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const handleRowsChange = () => {
  params.value.first = 0
  store.fetchAccessRequests()
}

function onAccessRequestToolbarRows(v) {
  params.value.rows = Number(v) || 10
  handleRowsChange()
}

function onAccessStatusChange() {
  store.setStatusFilter(params.value.status)
}

let modalInstance = null
onMounted(async () => {
  await Promise.all([store.fetchAccessRequests(), store.fetchCountByStatus(), fetchPegawai(), fetchWorkflows(), fetchPermissions()])
  const modalEl = document.getElementById('AccessRequestModal')
  if (modalEl) {
    modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(modalEl) : null
  }
})

watch(
  () => store.showModal,
  (val) => {
    if (val) modalInstance?.show()
    else modalInstance?.hide()
  }
)

watch(
  () => store.form.pegawaiId,
  (pegawaiId) => {
    void resolveSelectedPegawai(pegawaiId)
  }
)

watch(
  () => store.showModal,
  (show) => {
    if (show) {
      void resolveSelectedPegawai(store.form.pegawaiId)
    } else {
      selectedPegawaiData.value = null
    }
  }
)

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Permintaan Akses',
  description: 'Kelola permintaan akses modul/menu',
})
</script>

<style scoped>
.access-request-filter-row {
  --filter-height: 38px;
}

.access-request-dropdown {
  width: 11rem;
  height: var(--filter-height, 38px);
  min-height: var(--filter-height, 38px);
}

select.access-request-dropdown {
  height: var(--filter-height, 38px);
  padding: 0 2.25rem 0 0.75rem;
  line-height: calc(var(--filter-height, 38px) - 2px);
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

:deep(.p-dropdown.access-request-dropdown) {
  width: 11rem;
  height: var(--filter-height, 38px);
  min-height: var(--filter-height, 38px);
}

:deep(.p-dropdown.access-request-dropdown .p-dropdown-label) {
  min-height: var(--filter-height, 38px);
}

.access-request-search {
  height: var(--filter-height, 38px);
}

.access-request-search :deep(.form-control),
.access-request-search :deep(.p-inputtext) {
  height: var(--filter-height, 38px);
  min-height: var(--filter-height, 38px);
}

.access-request-search .btn {
  height: var(--filter-height, 38px);
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.permission-picker-panel {
  border: 1px solid #d9dee3;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(67, 89, 113, 0.06);
}

.permission-picker-table :deep(.p-datatable-table) {
  border: 1px solid #e7e9ed;
  border-radius: 0.375rem;
  overflow: hidden;
}

.permission-picker-table :deep(.p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e7e9ed;
}

.permission-picker-table :deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #f0f2f4;
}

.permission-picker-table :deep(.p-paginator) {
  border-top: 1px solid #e7e9ed;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}
</style>
