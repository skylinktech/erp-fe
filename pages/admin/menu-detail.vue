<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        List menu detail yang terdaftar di sistem
      </p>

      <ListPageStatsCards :items="statItems" :loading="loadingStats" />

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Filter & Daftar Menu Detail</h4>
          <p class="mb-0">Cari dan kelola semua menu detail beserta parent, group, dan referensinya.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(params.rows)"
              :rows-options="rowsPerPageOptionsArray"
              :search="globalFilterValue"
              search-placeholder="Cari Menu Detail..."
              :export-disabled="loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
              @export="exportData"
            >
              <template #add>
                <button type="button" class="btn btn-primary" @click="menuDetailStore.openModal()">
                  <i class="ri-add-line me-1"></i>
                  Tambah Menu Detail
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="menuDetails"
                :rows="params.rows"
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
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
              >
                <Column field="id" header="#" :sortable="true"></Column>
                <Column field="name" header="Nama Menu Detail" :sortable="true"></Column>
                <Column field="route" header="Route" :sortable="true">
                  <template #body="slotProps">
                    <span>{{ slotProps.data.route || '—' }}</span>
                  </template>
                </Column>
                <Column field="parentId" header="Parent" :sortable="true">
                  <template #body="slotProps">
                    <span>{{ slotProps.data.parent?.name || '—' }}</span>
                  </template>
                </Column>
                <Column field="order" header="Order" :sortable="true"></Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">
                      {{ getStatusBadge(slotProps.data.status).text }}
                    </span>
                  </template>
                </Column>
                <Column field="menuGroupId" header="Menu Group" :sortable="true">
                  <template #body="slotProps">
                    <span>{{ slotProps.data.menuGroup?.name || '-' }}</span>
                  </template>
                </Column>
                <Column field="is_referenceable" header="Referenceable" :sortable="true">
                  <template #body="slotProps">
                    <span
                      v-if="slotProps.data.is_referenceable || slotProps.data.isReferenceable"
                      class="badge rounded-pill bg-label-primary"
                    >Ya</span>
                    <span v-else class="badge rounded-pill bg-label-danger">Tidak</span>
                  </template>
                </Column>
                <Column field="reference_code" header="Reference Code" :sortable="true">
                  <template #body="slotProps">
                    <span>{{ slotProps.data.reference_code || slotProps.data.referenceCode || '-' }}</span>
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
                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_menu_detail')">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="menuDetailStore.openModal(slotProps.data, true)"
                          >
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_menu_detail')">
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            @click="menuDetailStore.deleteMenuDetail(slotProps.data.id)"
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
        @close="menuDetailStore.closeModal"
        id="MenuDetailModal"
        :title="modalTitle"
        :description="modalDescription"
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form v-if="showModal" @submit.prevent="menuDetailStore.saveMenuDetail()">
            <div class="row g-6">
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.name"
                    placeholder="Masukkan nama menu detail"
                  >
                  <label>Nama Menu Detail</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.route"
                    placeholder="Kosongkan jika folder (punya submenu)"
                  >
                  <label>Route (kosong = folder)</label>
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
                  <label>Order</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <CustomSelect2
                    v-model="form.status"
                    :options="statusOptions"
                    :get-option-label="option => option?.label ?? ''"
                    :reduce="option => option?.value"
                    searchable
                    clearable
                    placeholder="-- Pilih Status --"
                    class="select-status"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <CustomSelect2
                    v-model="form.menuGroupId"
                    :options="menuGroups || []"
                    :get-option-label="option => option?.name ?? ''"
                    :reduce="option => option?.id"
                    searchable
                    clearable
                    placeholder="-- Pilih Menu Group --"
                    class="select-menu-group"
                  />
                  <p v-if="menuGroups.length === 0" class="small text-muted">Memuat data menu group....</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <CustomSelect2
                    v-model="form.parentId"
                    :options="parentOptions || []"
                    :get-option-label="option => option?.label ?? option?.name ?? ''"
                    :reduce="option => option?.id"
                    searchable
                    clearable
                    placeholder="-- Parent (opsional) --"
                    class="select-parent"
                    :disabled="!form.menuGroupId"
                  />
                  <p class="small text-muted mb-0">Kosongkan untuk menempatkan langsung di bawah Menu Group.</p>
                </div>
              </div>
              <div class="col-md-6" v-if="isReferenceable">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="referenceCode"
                    placeholder="Masukkan reference code"
                  >
                  <label>Reference Code</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-check form-switch mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="isReferenceable"
                    v-model="isReferenceable"
                  >
                  <label class="form-check-label" for="isReferenceable">
                    Is Referenceable
                  </label>
                </div>
              </div>
              <div class="d-flex justify-content-end flex-wrap gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="menuDetailStore.closeModal()">
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
import { useMenuDetailStore } from '~/stores/menu-detail'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()

const myDataTableRef = ref(null)
const menuDetailStore = useMenuDetailStore()
const {
  menuDetails,
  menuGroups,
  parentOptions,
  loading,
  loadingStats,
  totalRecords,
  statistics,
  params,
  form,
  isEditMode,
  showModal,
  validationErrors,
} = storeToRefs(menuDetailStore)
const { userHasPermission, userHasRole } = usePermissions()

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const statusOptions = ref([
  { label: 'Aktif', value: 1 },
  { label: 'Nonaktif', value: 0 },
])

const modalTitle = computed(() => (isEditMode.value ? 'Edit Menu Detail' : 'Tambah Menu Detail'))
const modalDescription = computed(() =>
  isEditMode.value ? 'Ubah detail menu.' : 'Isi untuk menambah menu detail baru.'
)

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Menu Detail',
    value: statistics.value.total || totalRecords.value || 0,
    icon: 'ri-menu-2-line',
    iconBgClass: 'bg-label-primary',
    subtitle: 'Menu terdaftar',
  },
  {
    key: 'aktif',
    label: 'Aktif',
    value: statistics.value.aktif || 0,
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
    subtitle: 'Status aktif',
  },
  {
    key: 'nonaktif',
    label: 'Nonaktif',
    value: statistics.value.nonaktif || 0,
    icon: 'ri-close-circle-line',
    iconBgClass: 'bg-label-danger',
    subtitle: 'Status nonaktif',
  },
  {
    key: 'referenceable',
    label: 'Referenceable',
    value: statistics.value.referenceable || 0,
    icon: 'ri-link',
    iconBgClass: 'bg-label-info',
    subtitle: 'Bisa direferensikan',
  },
])

const isReferenceable = computed({
  get() {
    if (!form.value) return false
    return form.value.isReferenceable || form.value['is_referenceable'] || false
  },
  set(value) {
    if (form.value) {
      form.value.isReferenceable = value
    }
  },
})

const referenceCode = computed({
  get() {
    if (!form.value) return ''
    return form.value.referenceCode || form.value['reference_code'] || ''
  },
  set(value) {
    if (form.value) {
      form.value.referenceCode = value
    }
  },
})

onMounted(() => {
  menuDetailStore.fetchMenuDetails()
  menuDetailStore.fetchStatistics()
  setListTitle('Menu Detail', menuDetails.value.length)
})

watch(
  () => form.value?.menuGroupId,
  async (groupId, oldGroupId) => {
    if (!showModal.value) return
    if (groupId === oldGroupId) return
    if (oldGroupId != null && groupId !== oldGroupId) {
      form.value.parentId = null
    }
    await menuDetailStore.fetchParentOptions(
      groupId,
      isEditMode.value ? form.value?.id ?? null : null
    )
  }
)

const debouncedSearch = useDebounceFn(() => {
  menuDetailStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => menuDetailStore.setPagination(event)

const handleRowsChange = () => {
  params.value.first = 0
  menuDetailStore.fetchMenuDetails()
}

const onToolbarRows = (v) => {
  params.value.rows = Number(v) || 10
  handleRowsChange()
}

const onSort = (event) => menuDetailStore.setSort(event)

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

const getStatusBadge = (status) => {
  switch (status) {
    case 1:
      return { text: 'Aktif', class: 'badge rounded-pill bg-label-primary' }
    case 0:
      return { text: 'Nonaktif', class: 'badge rounded-pill bg-label-danger' }
    default:
      return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Menu Detail',
  description: 'Menu Detail Management',
  keywords: 'Menu Detail, Admin, Sinergi Innovate Pratama',
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
