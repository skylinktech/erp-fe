<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        Role mengatur akses ke menu dan fitur yang sudah ditentukan, sehingga administrator hanya melihat apa yang dibutuhkan.
      </p>

      <ListPageStatsCards :items="statItems" :loading="loading && !roles.length" />

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Filter & Daftar Role</h4>
          <p class="mb-0">Cari dan kelola semua role beserta hak aksesnya.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(params.rows)"
              :rows-options="rowsPerPageOptionsArray"
              :search="globalFilterValue"
              search-placeholder="Cari Role..."
              :export-disabled="loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
              @export="exportData"
            >
              <template #add>
                <button type="button" class="btn btn-primary" @click="rolesStore.openModal()">
                  <i class="ri-add-line me-1"></i>
                  Tambah Role
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="roles"
                :rows="params.rows"
                :loading="loading"
                :totalRecords="totalRecords"
                :first="params.first"
                :lazy="true"
                @page="onPage($event)"
                @sort="onSort($event)"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
              >
                <Column field="id" header="#" :sortable="true"></Column>
                <Column field="name" header="Nama Role" :sortable="true"></Column>
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
                        <li>
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="rolesStore.openModal(slotProps.data)"
                          >
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            @click="rolesStore.deleteRole(slotProps.data.id)"
                          >
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

      <Modal
        :model-value="showModal"
        @close="rolesStore.closeModal"
        id="RolesModal"
        :title="modalTitle"
        :description="modalDescription"
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form @submit.prevent="rolesStore.saveRole()">
            <div class="row g-6">
              <div class="col-12">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    id="modalRoleName"
                    name="modalRoleName"
                    class="form-control"
                    placeholder="Enter a role name"
                    tabindex="-1"
                    v-model="form.name"
                  />
                  <label for="modalRoleName">Role Name</label>
                </div>
              </div>
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0">Role Permissions</h5>
                </div>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-4 mb-4">
                  <div class="d-flex align-items-center gap-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="selectAll" v-model="selectAll" />
                      <label class="form-check-label" for="selectAll">Pilih Semua</label>
                    </div>
                  </div>
                  <div class="d-flex align-items-center">
                    <span class="p-input-icon-left">
                      <InputText v-model="permissionSearch" placeholder="Cari Menu..." />
                    </span>
                  </div>
                </div>
                <DataTable
                  :value="filteredMenuDetails"
                  :rows="permissionTableRows"
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} menu"
                  responsiveLayout="scroll"
                  :paginator="true"
                  class="p-datatable-sm"
                >
                  <Column field="name" header="Menu" :sortable="true" style="min-width: 12rem;"></Column>
                  <Column v-for="permName in masterPermissionNames" :key="permName" style="min-width: 6rem;">
                    <template #header>
                      <div class="text-center w-100 font-weight-bold">{{ permName }}</div>
                    </template>
                    <template #body="{ data }">
                      <div v-if="getPermission(data, permName)" class="form-check d-flex justify-content-center">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :value="getPermission(data, permName).id"
                          v-model="form.permissionIds"
                        />
                      </div>
                    </template>
                  </Column>
                  <template #empty>
                    <div class="text-center p-4">Tidak ada data menu.</div>
                  </template>
                </DataTable>
              </div>
              <div class="d-flex justify-content-end flex-wrap gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="rolesStore.closeModal()">
                  Tutup
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {{ isEditMode ? 'Update' : 'Simpan' }}
                </button>
              </div>
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
import { useRolesStore } from '~/stores/roles'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()

const myDataTableRef = ref(null)
const rolesStore = useRolesStore()
const {
  roles,
  permissions,
  loading,
  totalRecords,
  params,
  form,
  isEditMode,
  showModal,
  validationErrors,
} = storeToRefs(rolesStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const permissionSearch = ref('')
const masterPermissionNames = ['View', 'Create', 'Edit', 'Delete', 'Show', 'Approve', 'Reject', 'Access']
const permissionTableRows = ref(10)

const selectAll = computed({
  get() {
    if (!permissions.value || permissions.value.length === 0) {
      return false
    }
    return form.value.permissionIds.length === permissions.value.length
  },
  set(value) {
    if (value) {
      form.value.permissionIds = permissions.value.map((p) => p.id)
    } else {
      form.value.permissionIds = []
    }
  },
})

const getPermission = (menu, permName) => {
  return menu.permissions.find((p) => p.name === permName)
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

    if (menuKey.endsWith('s')) {
      menuKey = menuKey.slice(0, -1)
    }

    let displayPermissionName = ''
    const permName = p.name?.toLowerCase()

    if (permName.includes('view')) displayPermissionName = 'View'
    else if (permName.includes('create')) displayPermissionName = 'Create'
    else if (permName.includes('update') || permName.includes('edit')) displayPermissionName = 'Edit'
    else if (permName.includes('delete')) displayPermissionName = 'Delete'
    else if (permName.includes('show')) displayPermissionName = 'Show'
    else if (permName.includes('approve')) displayPermissionName = 'Approve'
    else if (permName.includes('reject')) displayPermissionName = 'Reject'
    else if (permName.includes('access')) displayPermissionName = 'Access'

    if (!displayPermissionName) return

    const permissionObject = {
      id: p.id,
      name: displayPermissionName,
      dbName: p.name,
    }

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

  const sortedMenuDetails = Object.values(result).sort((a, b) => a.name.localeCompare(b.name))
  sortedMenuDetails.forEach((md) => {
    md.permissions.sort((a, b) => {
      const orderA = masterPermissionNames.indexOf(a.name)
      const orderB = masterPermissionNames.indexOf(b.name)
      return orderA - orderB
    })
  })

  return sortedMenuDetails
})

const filteredMenuDetails = computed(() => {
  if (!permissionSearch.value) {
    return menuDetailsWithPermissions.value
  }
  const searchLower = permissionSearch.value.toLowerCase()
  return menuDetailsWithPermissions.value.filter((menu) =>
    menu.name.toLowerCase().includes(searchLower)
  )
})

const modalTitle = computed(() => (isEditMode.value ? 'Edit Role' : 'Tambah Role'))
const modalDescription = computed(() =>
  isEditMode.value ? 'Ubah detail role.' : 'Isi untuk menambah role baru.'
)

const permissionMenuCount = computed(() => menuDetailsWithPermissions.value.length)

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Role',
    value: totalRecords.value || 0,
    icon: 'ri-shield-user-line',
    iconBgClass: 'bg-label-primary',
    subtitle: 'Role terdaftar',
  },
  {
    key: 'permissions',
    label: 'Permission',
    value: permissions.value?.length || 0,
    icon: 'ri-key-2-line',
    iconBgClass: 'bg-label-info',
    subtitle: 'Hak akses tersedia',
  },
  {
    key: 'menus',
    label: 'Menu Akses',
    value: permissionMenuCount.value || 0,
    icon: 'ri-menu-line',
    iconBgClass: 'bg-label-success',
    subtitle: 'Grup menu',
  },
  {
    key: 'page',
    label: 'Ditampilkan',
    value: roles.value?.length || 0,
    icon: 'ri-list-check-2',
    iconBgClass: 'bg-label-warning',
    subtitle: 'Baris halaman ini',
  },
])

onMounted(() => {
  rolesStore.fetchRoles()
  rolesStore.fetchPermissions()
  setListTitle('Roles', roles.value.length)
})

const debouncedSearch = useDebounceFn(() => {
  rolesStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => rolesStore.setPagination(event)

const handleRowsChange = () => {
  params.value.first = 0
  rolesStore.fetchRoles()
}

const onToolbarRows = (v) => {
  params.value.rows = Number(v) || 10
  handleRowsChange()
}

const onSort = (event) => rolesStore.setSort(event)

const exportData = (format) => {
  if (format === 'excel' || format === 'csv') {
    myDataTableRef.value?.exportCSV?.()
    return
  }
  if (format === 'pdf') {
    useToast().info({
      title: 'Info',
      message: 'Export PDF akan tersedia pada rilis berikutnya.',
      color: 'blue',
      position: 'bottomRight',
      layout: 2,
    })
  }
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Roles',
  description: 'Role Management',
  keywords: 'Roles, Admin, Sinergi Innovate Pratama',
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
}

@media (max-width: 576px) {
  .card-body {
    padding: 12px;
  }
}
</style>
