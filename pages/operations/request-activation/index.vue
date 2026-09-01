<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <PageDescription>Pengajuan aktivasi layanan pelanggan (SN KIT, lokasi, PIC, dan form berlangganan).</PageDescription>

      <ListPageStatsCards :items="statItems" />

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter Request Activation" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2
                  v-model="filters.status"
                  :options="statusOptions"
                  :get-option-label="o => o.label"
                  :reduce="o => o.value"
                  searchable
                  clearable
                  placeholder="Status"
                />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>

        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(tableControls.rows)"
              :rows-options="rowsPerPageOptions"
              :search="globalFilterValue"
              search-placeholder="Cari no. RA, customer, SN KIT..."
              :show-export="false"
              @update:rows="handleRowsChange"
              @update:search="(v) => { globalFilterValue = v }"
            >
              <template #add>
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_request_activation')"
                  type="button"
                  class="btn btn-primary"
                  @click="navigateTo('/operations/request-activation/form')"
                >
                  <i class="ri-add-line me-1"></i>Tambah
                </button>
              </template>
            </ListPageTableHeader>

            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="requestActivations"
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
                <Column field="requestNo" header="No. RA" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a
                      @click="navigateTo(`/operations/request-activation/detail/${slotProps.data.id}`)"
                      class="text-primary"
                      style="cursor:pointer;text-decoration:underline"
                    >
                      {{ getRequestActivationNo(slotProps.data) || '—' }}
                    </a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.customer?.name || '—' }}</template>
                </Column>
                <Column field="locationName" header="Lokasi" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.locationName || slotProps.data.location_name || '—' }}</template>
                </Column>
                <Column field="serviceLine" header="Service Line" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.serviceLine || slotProps.data.service_line || '—' }}</template>
                </Column>
                <Column field="planName" header="Paket" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.planName || slotProps.data.plan_name || slotProps.data.servicePlan?.name || '—' }}</template>
                </Column>
                <Column field="snKit" header="SN KIT" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.snKit || slotProps.data.sn_kit || '—' }}</template>
                </Column>
                <Column field="requestDate" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.requestDate || slotProps.data.request_date || '—' }}</template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span>
                  </template>
                </Column>
                <Column header="Aksi" :exportable="false" style="min-width:8rem">
                  <template #body="slotProps">
                    <button
                      type="button"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                      @click.stop="toggleActions($event, slotProps.data)"
                    >
                      <i class="ri-more-2-fill"></i>
                    </button>
                  </template>
                </Column>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Menu id="ra-actions-menu" ref="actionsMenuRef" :model="actionMenuItems" :popup="true" append-to="body" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useRequestActivationStore,
  getRequestActivationNo,
} from '~/stores/request-activation'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'

const store = useRequestActivationStore()
const { userHasPermission, userHasRole } = usePermissions()
const { requestActivations, loading, totalRecords, params, statistics } = storeToRefs(store)
const { getStatusBadge } = useApprovalStatus()

const statItems = computed(() => [
  { key: 'total', label: 'Total', value: statistics.value.total, icon: 'ri-rocket-line', iconBgClass: 'bg-label-primary' },
  { key: 'pending', label: 'Pending', value: statistics.value.pending, icon: 'ri-time-line', iconBgClass: 'bg-label-warning' },
  { key: 'approved', label: 'Approved', value: statistics.value.approved, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
  { key: 'completed', label: 'Completed', value: statistics.value.completed, icon: 'ri-flag-line', iconBgClass: 'bg-label-info' },
])

const tableControls = ref({ rows: 10 })
const filters = ref({ status: null as string | null })
const hasActiveFilters = computed(() => !!filters.value.status)

function resetFilters() {
  filters.value.status = null
}

const globalFilterValue = ref('')
const rowsPerPageOptions = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
]

const actionsMenuRef = ref(null)
const activeRow = ref<any>(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = []
  const canEdit = userHasRole('superadmin') || userHasPermission('edit_request_activation')
  const isEditable = row.status === 'draft' || row.status === 'rejected'

  if (canEdit && isEditable) {
    items.push({
      label: 'Submit',
      icon: 'ri ri-send-plane-line',
      command: () => store.submitRequestActivation(row.id),
    })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/operations/request-activation/form/${row.id}`),
    })
  }

  const canApprove = userHasRole('superadmin') || userHasPermission('approve_request_activation')
  if (canApprove && row.status === 'pending') {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => store.approveRequestActivation(row.id),
    })
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => rejectRow(row),
    })
  }

  if (row.status === 'approved' && (userHasRole('superadmin') || userHasPermission('edit_request_activation'))) {
    items.push({
      label: 'Tandai Selesai',
      icon: 'ri ri-checkbox-circle-line',
      command: () => store.markCompleted(row.id),
    })
  }

  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => navigateTo(`/operations/request-activation/detail/${row.id}`),
  })

  if (isEditable && canEdit) {
    items.push({ separator: true })
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'text-danger',
      command: () => store.deleteRequestActivation(row.id),
    })
  }

  return items
})

async function rejectRow(row: any) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak Request Activation',
    input: 'textarea',
    inputLabel: 'Alasan penolakan',
    inputPlaceholder: 'Wajib diisi',
    inputValidator: (v) => (!v?.trim() ? 'Alasan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Tolak',
    cancelButtonText: 'Batal',
    customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
  })
  if (isConfirmed && value?.trim()) {
    await store.rejectRequestActivation(row.id, value.trim())
  }
}

function toggleActions(event: Event, row: any) {
  activeRow.value = row
  nextTick(() => (actionsMenuRef.value as any)?.toggle(event))
}

const onPage = (e: any) => { if (e) store.setPagination(e) }
const onSort = (e: any) => { if (e) store.setSort(e) }
const handleRowsChange = (v: any) => {
  const rows = Number(v) || 10
  tableControls.value.rows = rows
  params.value.rows = rows
  params.value.first = 0
  store.fetchRequestActivations()
}

const debouncedSearch = useDebounceFn(() => store.setSearch(globalFilterValue.value), 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => store.setFilters({ status: f.status }), { deep: true })

onMounted(() => {
  store.fetchRequestActivations()
  store.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Request Activation' })
</script>
