<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <h4 class="mb-1">PKS</h4>
      <p class="mb-6">Daftar PKS yang terdaftar di sistem</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total PKS</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-file-list-3-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.totalPks || 0 }}</h5>
                  <span class="text-muted">PKS terdaftar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Draft</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-secondary">
                    <i class="ri-draft-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.draftPks || 0 }}</h5>
                  <span class="text-muted">Draft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Signed</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-info">
                    <i class="ri-file-check-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.signedPks || 0 }}</h5>
                  <span class="text-muted">Signed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Active</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.activePks || 0 }}</h5>
                  <span class="text-muted">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter PKS" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Customer</label>
                <CustomSelect2 v-model="filters.customerId" :options="customers || []" :get-option-label="o => o?.name ?? ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Customer" />
              </FilterField>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih Status" />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="tableControls.rows"
                  :options="rowsPerPageOptionsArray"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem;"
                />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_pks')"
                  class="btn btn-primary"
                  @click="navigateTo('/order-process/pks/form')"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Data
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari PKS..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="pksList"
                :rows="Number(params.rows)"
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
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="noPks" header="No. PKS" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/order-process/pks/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.noPks || slotProps.data.no_pks }}</a>
                  </template>
                </Column>
                <Column header="Tipe PKS" :sortable="false">
                  <template #body="slotProps">
                    <span>
                      {{ slotProps.data.isInternal ? 'Internal' : 'External' }}
                    </span>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true" />
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">{{ getStatusBadge(slotProps.data.status).text }}</span>
                  </template>
                </Column>
                <Column field="contractStartDate" header="Contract Start" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractStartDate || slotProps.data.contract_start_date ? new Date(slotProps.data.contractStartDate || slotProps.data.contract_start_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column field="contractEndDate" header="Contract End" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractEndDate || slotProps.data.contract_end_date ? new Date(slotProps.data.contractEndDate || slotProps.data.contract_end_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column field="createdAt" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <div class="dropdown d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i></a>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="(userHasRole('superadmin') || userHasPermission('approve_pks')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="pksStore.submitPks(slotProps.data.id)"><i class="ri-file-check-line me-2"></i> Signed</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_pks')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/pks/form/${slotProps.data.id}`)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('delete_pks')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="pksStore.deletePks(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/pks/detail/${slotProps.data.id}`)"><i class="ri-eye-line me-2"></i> Lihat Detail</a>
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
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePksStore } from '~/stores/pks'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()
const pksStore = usePksStore()
const customerStore = useCustomerStore()
const { userHasPermission, userHasRole } = usePermissions()

const { pksList, loading, totalRecords, params, statistics } = storeToRefs(pksStore)
const { customers } = storeToRefs(customerStore)

const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ search: '', customerId: null, status: null })

const hasActiveFilters = computed(
  () => !!filters.value.customerId || !!filters.value.status
)

function resetFilters() {
  filters.value.customerId = null
  filters.value.status = null
}
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Signed', value: 'signed' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Terminated', value: 'terminated' },
]

function getStatusBadge(status) {
  if (!status) return { text: '-', class: 'badge rounded-pill bg-label-light' }
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'signed': return { text: 'Signed', class: 'badge rounded-pill bg-label-info' }
    case 'active': return { text: 'Active', class: 'badge rounded-pill bg-label-success' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    case 'terminated': return { text: 'Terminated', class: 'badge rounded-pill bg-label-warning' }
    default: return { text: status, class: 'badge rounded-pill bg-label-light' }
  }
}

const onPage = (e) => { if (e) pksStore.setPagination(e) }
const handleRowsChange = (v) => {
  const rowsValue = Number(v) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  pksStore.fetchPks()
}
const onSort = (e) => { if (e) pksStore.setSort(e) }

const debouncedSearch = useDebounceFn(() => {
  pksStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => { pksStore.setFilters({ customerId: f.customerId, status: f.status, search: f.search }) }, { deep: true })

onMounted(() => {
  pksStore.fetchPks()
  pksStore.fetchStatistics()
  customerStore.fetchCustomers()
  setListTitle('PKS', pksList.value?.length ?? 0)
  tableControls.value.rows = Number(params.value.rows) || 10
  globalFilterValue.value = params.value.search || ''
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'PKS',
})
</script>
