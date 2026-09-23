<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6">Daftar PKS Customer dan PKS Vendor yang terdaftar di sistem</p>

      <ListPageStatsCards :items="statItems" />

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter PKS" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Tipe PKS</label>
                <CustomSelect2
                  v-model="filters.pksType"
                  :options="pksTypeOptions"
                  :get-option-label="o => o.label"
                  :reduce="o => o.value"
                  searchable
                  clearable
                  placeholder="Semua Tipe"
                />
              </FilterField>
              <FilterField>
                <label class="form-label">Customer</label>
                <CustomSelect2
                  v-model="filters.customerId"
                  :options="customers || []"
                  :get-option-label="o => o?.name ?? ''"
                  :reduce="o => o?.id"
                  searchable
                  clearable
                  placeholder="Pilih Customer"
                />
              </FilterField>
              <FilterField>
                <label class="form-label">Vendor</label>
                <CustomSelect2
                  v-model="filters.vendorId"
                  :options="vendors || []"
                  :get-option-label="o => o?.name ?? ''"
                  :reduce="o => o?.id"
                  searchable
                  clearable
                  placeholder="Pilih Vendor"
                />
              </FilterField>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2
                  v-model="filters.status"
                  :options="statusOptions"
                  :get-option-label="o => o.label"
                  :reduce="o => o.value"
                  searchable
                  clearable
                  placeholder="Pilih Status"
                />
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
                    placeholder="Cari No. PKS, Vendor, No. Surat, PO..."
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
                    <span :class="pksTypeBadge(slotProps.data).class">
                      {{ pksTypeBadge(slotProps.data).text }}
                    </span>
                  </template>
                </Column>
                <Column header="Mitra" :sortable="false">
                  <template #body="slotProps">
                    {{ partnerName(slotProps.data) }}
                  </template>
                </Column>
                <Column header="Referensi" :sortable="false">
                  <template #body="slotProps">
                    {{ referenceLabel(slotProps.data) }}
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">{{ getStatusBadge(slotProps.data.status).text }}</span>
                  </template>
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
import { usePksStore, resolvePksType } from '~/stores/pks'
import { useCustomerStore } from '~/stores/customer'
import { useVendorStore } from '~/stores/vendor'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'

const { setListTitle } = useDynamicTitle()
const pksStore = usePksStore()
const customerStore = useCustomerStore()
const vendorStore = useVendorStore()
const { userHasPermission, userHasRole } = usePermissions()

const { pksList, loading, totalRecords, params, statistics } = storeToRefs(pksStore)
const { customers } = storeToRefs(customerStore)
const { vendors } = storeToRefs(vendorStore)

const statItems = computed(() => [
  {
    key: 'total-pks',
    label: 'Total PKS',
    value: statistics.value?.totalPks ?? 0,
    subtitle: 'Semua tipe',
    icon: 'ri-file-list-3-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description: 'Jumlah seluruh dokumen PKS Customer dan PKS Vendor yang terdaftar.',
    },
  },
  {
    key: 'customer-pks',
    label: 'PKS Customer',
    value: statistics.value?.customerPks ?? 0,
    subtitle: 'Berbasis customer',
    icon: 'ri-user-line',
    iconBgClass: 'bg-label-info',
    info: {
      title: 'PKS Customer',
      description: 'PKS yang terhubung ke Customer dan Subscription (sebelumnya disebut Internal).',
    },
  },
  {
    key: 'vendor-pks',
    label: 'PKS Vendor',
    value: statistics.value?.vendorPks ?? 0,
    subtitle: 'Berbasis vendor',
    icon: 'ri-store-2-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'PKS Vendor',
      description: 'PKS yang terhubung ke Vendor dan Purchase Order (sebelumnya disebut External).',
    },
  },
  {
    key: 'draft',
    label: 'Draft',
    value: statistics.value?.draftPks ?? 0,
    subtitle: 'Draft',
    icon: 'ri-draft-line',
    iconBgClass: 'bg-label-secondary',
    info: {
      title: 'Draft',
      description: 'Jumlah dokumen PKS berstatus Draft yang belum di-signed.',
    },
  },
  {
    key: 'signed',
    label: 'Signed',
    value: statistics.value?.signedPks ?? 0,
    subtitle: 'Signed',
    icon: 'ri-file-check-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'Signed',
      description: 'Jumlah dokumen PKS yang telah ditandatangani.',
    },
  },
])

const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ search: '', customerId: null, vendorId: null, pksType: null, status: null })

const hasActiveFilters = computed(
  () => !!filters.value.customerId || !!filters.value.vendorId || !!filters.value.pksType || !!filters.value.status
)

function resetFilters() {
  filters.value.customerId = null
  filters.value.vendorId = null
  filters.value.pksType = null
  filters.value.status = null
}
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const pksTypeOptions = [
  { label: 'PKS Customer', value: 'CUSTOMER' },
  { label: 'PKS Vendor', value: 'VENDOR' },
]

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Signed', value: 'signed' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Terminated', value: 'terminated' },
]

function pksTypeBadge(row) {
  const t = resolvePksType(row)
  if (t === 'VENDOR') return { text: 'PKS Vendor', class: 'badge rounded-pill bg-label-warning' }
  return { text: 'PKS Customer', class: 'badge rounded-pill bg-label-info' }
}

function partnerName(row) {
  const t = resolvePksType(row)
  if (t === 'VENDOR') {
    return row.vendor?.name || '—'
  }
  return row.customer?.name || row.customerName || row.customer_name || '—'
}

function referenceLabel(row) {
  const t = resolvePksType(row)
  if (t === 'VENDOR') {
    const noSurat = row.noSurat || row.no_surat
    const po = row.purchaseOrder?.noPo || row.purchaseOrder?.no_po || row.purchase_order?.no_po
    if (noSurat && po) return `${noSurat} · ${po}`
    return noSurat || po || '—'
  }
  const start = row.contractStartDate || row.contract_start_date
  const end = row.contractEndDate || row.contract_end_date
  if (!start && !end) return '—'
  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
  return `${fmt(start)} – ${fmt(end)}`
}

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
watch(filters, (f) => {
  pksStore.setFilters({
    customerId: f.customerId,
    vendorId: f.vendorId,
    pksType: f.pksType,
    status: f.status,
    search: f.search,
  })
}, { deep: true })

onMounted(() => {
  pksStore.fetchPks()
  pksStore.fetchStatistics()
  customerStore.fetchCustomers()
  vendorStore.fetchVendors?.(true)
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
