<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        List menu group yang terdaftar di sistem
      </p>

      <ListPageStatsCards :items="statItems" :loading="loading && !menuGroups.length" />

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Filter & Daftar Menu Group</h4>
          <p class="mb-0">Cari dan kelola semua menu group beserta jenis dan urutannya.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(params.rows)"
              :rows-options="rowsPerPageOptionsArray"
              :search="globalFilterValue"
              search-placeholder="Cari Menu Group..."
              :export-disabled="loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
              @export="exportData"
            >
              <template #add>
                <button type="button" class="btn btn-primary" @click="menuGroupStore.openModal()">
                  <i class="ri-add-line me-1"></i>
                  Tambah Menu Group
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="menuGroups"
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
                <Column field="name" header="Nama Menu Group" :sortable="true"></Column>
                <Column field="icon" header="Icon" :sortable="true"></Column>
                <Column field="order" header="Order" :sortable="true"></Column>
                <Column field="jenisMenu" header="Jenis Menu" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.jenisMenu).class">
                      {{ getStatusBadge(slotProps.data.jenisMenu).text }}
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
                        <li>
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="menuGroupStore.openModal(slotProps.data)"
                          >
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            @click="menuGroupStore.deleteMenuGroup(slotProps.data.id)"
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
        @close="menuGroupStore.closeModal"
        id="MenuGroupModal"
        :title="modalTitle"
        :description="modalDescription"
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form @submit.prevent="menuGroupStore.saveMenuGroup()">
            <div class="row g-6">
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.name"
                    placeholder="Masukkan nama menu group"
                  >
                  <label for="name">Nama Menu Group</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.icon"
                    placeholder="Masukkan nama icon"
                  >
                  <label for="icon">Icon</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.order"
                    placeholder="Masukkan urutan"
                    @input="form.order = $event.target.value.replace(/[^0-9]/g, '')"
                    inputmode="numeric"
                    pattern="[0-9]*"
                  >
                  <label for="order">Order</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <CustomSelect2
                    v-model="form.jenisMenu"
                    :options="jenisMenuOptions"
                    :get-option-label="option => option.label"
                    :reduce="option => option.value"
                    searchable
                    clearable
                    placeholder="-- Pilih Jenis Menu --"
                    class="select-jenis-menu"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-end flex-wrap gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="menuGroupStore.closeModal()">
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
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import { useMenuGroupStore } from '~/stores/menu-group'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()

const myDataTableRef = ref(null)
const menuGroupStore = useMenuGroupStore()
const {
  menuGroups,
  loading,
  totalRecords,
  params,
  form,
  isEditMode,
  showModal,
  validationErrors,
} = storeToRefs(menuGroupStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => (isEditMode.value ? 'Edit Menu Group' : 'Tambah Menu Group'))
const modalDescription = computed(() =>
  isEditMode.value ? 'Ubah detail menu group.' : 'Isi untuk menambah menu group baru.'
)

const summaryFromGroups = computed(() => {
  const rows = menuGroups.value || []
  const jenisSet = new Set(rows.map((row) => row.jenisMenu).filter((v) => v != null))
  return {
    withIcon: rows.filter((row) => !!row.icon).length,
    jenisCount: jenisSet.size,
  }
})

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Menu Group',
    value: totalRecords.value || menuGroups.value?.length || 0,
    icon: 'ri-folder-3-line',
    iconBgClass: 'bg-label-primary',
    subtitle: 'Group terdaftar',
  },
  {
    key: 'jenis',
    label: 'Jenis Menu',
    value: summaryFromGroups.value.jenisCount,
    icon: 'ri-apps-2-line',
    iconBgClass: 'bg-label-info',
    subtitle: 'Kategori unik',
  },
  {
    key: 'icon',
    label: 'Dengan Icon',
    value: summaryFromGroups.value.withIcon,
    icon: 'ri-remixicon-line',
    iconBgClass: 'bg-label-success',
    subtitle: 'Sudah punya icon',
  },
  {
    key: 'page',
    label: 'Ditampilkan',
    value: menuGroups.value?.length || 0,
    icon: 'ri-list-check-2',
    iconBgClass: 'bg-label-warning',
    subtitle: 'Baris halaman ini',
  },
])

const jenisMenuOptions = [
  { label: 'Purchasing', value: 1 },
  { label: 'HRD', value: 2 },
  { label: 'Finance', value: 3 },
  { label: 'Inventory', value: 4 },
  { label: 'Sales', value: 5 },
  { label: 'Company', value: 6 },
  { label: 'System', value: 7 },
  { label: 'Service Management', value: 8 },
  { label: 'Order Processing', value: 9 },
  { label: 'Admin', value: 10 },
  { label: 'Documentations', value: 11 },
]

onMounted(() => {
  menuGroupStore.fetchMenuGroups()
  setListTitle('Menu Group', menuGroups.value.length)
})

const debouncedSearch = useDebounceFn(() => {
  menuGroupStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => menuGroupStore.setPagination(event)

const handleRowsChange = () => {
  params.value.first = 0
  menuGroupStore.fetchMenuGroups()
}

const onToolbarRows = (v) => {
  params.value.rows = Number(v) || 10
  handleRowsChange()
}

const onSort = (event) => menuGroupStore.setSort(event)

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

const getStatusBadge = (jenisMenu) => {
  switch (jenisMenu) {
    case 1:
      return { text: 'Purchasing', class: 'badge rounded-pill bg-label-primary' }
    case 2:
      return { text: 'HRD', class: 'badge rounded-pill bg-label-secondary' }
    case 3:
      return { text: 'Finance', class: 'badge rounded-pill bg-label-warning text-dark' }
    case 4:
      return { text: 'Inventory', class: 'badge rounded-pill bg-label-info' }
    case 5:
      return { text: 'Sales', class: 'badge rounded-pill bg-label-success' }
    case 6:
      return { text: 'Company', class: 'badge rounded-pill bg-label-info' }
    case 7:
      return { text: 'System', class: 'badge rounded-pill bg-label-danger' }
    case 8:
      return { text: 'Service Management', class: 'badge rounded-pill bg-label-dark' }
    case 9:
      return { text: 'Order Processing', class: 'badge rounded-pill bg-label-dark' }
    case 10:
      return { text: 'Admin', class: 'badge rounded-pill bg-label-dark' }
    case 11:
      return { text: 'Documentations', class: 'badge rounded-pill bg-label-dark' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Menu Group',
  description: 'Menu Group Management',
  keywords: 'Menu Group, Admin, Sinergi Innovate Pratama',
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
