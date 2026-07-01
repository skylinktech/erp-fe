<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Work Order Request</h4>
      <p class="mb-6">Pengajuan penugasan teknisi untuk pekerjaan PM, CM, dan Relokasi perangkat.</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Total WOR</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-file-list-3-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.total }}</h5>
          </div></div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Pending</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.pending }}</h5>
          </div></div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Approved</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.approved }}</h5>
          </div></div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Urgency Tinggi</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-danger"><i class="ri-alarm-warning-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.highUrgency }}</h5>
          </div></div>
        </div>
      </div>

      <div class="row g-6">
        <!-- Filter -->
        <div class="col-12"><h4 class="mt-2 mb-1">Filter</h4></div>
        <div class="col-12">
          <div class="card"><div class="card-body"><div class="row g-2">
            <div class="col-md-4">
              <CustomSelect2
                v-model="filters.status"
                :options="statusOptions"
                :get-option-label="o => o.label"
                :reduce="o => o.value"
                searchable clearable
                placeholder="Status"
              />
            </div>
            <div class="col-md-4">
              <CustomSelect2
                v-model="filters.jobType"
                :options="jobTypeOptions"
                :get-option-label="o => o.label"
                :reduce="o => o.value"
                searchable clearable
                placeholder="Jenis Pekerjaan"
              />
            </div>
            <div class="col-md-4">
              <CustomSelect2
                v-model="filters.urgencyLevel"
                :options="urgencyOptions"
                :get-option-label="o => o.label"
                :reduce="o => o.value"
                searchable clearable
                placeholder="Tingkat Urgency"
              />
            </div>
          </div></div></div>
        </div>

        <!-- Table -->
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown v-model="tableControls.rows" :options="rowsPerPageOptions" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_work_order_request')"
                  @click="navigateTo('/operations/work-order-request/form')"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>Tambah
                </button>
                <span class="p-input-icon-left">
                  <InputText v-model="globalFilterValue" placeholder="Cari no. WOR, site, lokasi..." class="w-full md:w-20rem" />
                </span>
              </div>
            </div>

            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="workOrderRequests"
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
                <Column field="requestNo" header="No. WOR" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a
                      @click="navigateTo(`/operations/work-order-request/detail/${slotProps.data.id}`)"
                      class="text-primary"
                      style="cursor:pointer;text-decoration:underline"
                    >
                      {{ getWorkOrderRequestNo(slotProps.data) || '—' }}
                    </a>
                  </template>
                </Column>
                <Column field="siteName" header="Site / Project" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.siteName || slotProps.data.site_name || '—' }}</template>
                </Column>
                <Column field="jobType" header="Jenis" :sortable="true">
                  <template #body="slotProps">
                    <span class="badge bg-label-secondary">{{ jobTypeShortLabel(slotProps.data.jobType ?? slotProps.data.job_type) }}</span>
                  </template>
                </Column>
                <Column field="urgencyLevel" header="Urgency" :sortable="true">
                  <template #body="slotProps">
                    <span :class="['badge', urgencyBadgeClass(slotProps.data.urgencyLevel ?? slotProps.data.urgency_level)]">
                      {{ urgencyShortLabel(slotProps.data.urgencyLevel ?? slotProps.data.urgency_level) }}
                    </span>
                  </template>
                </Column>
                <Column field="requestedByUser.full_name" header="Pemohon" :sortable="true">
                  <template #body="slotProps">
                    {{ slotProps.data.requestedByUser?.fullName || slotProps.data.requestedByUser?.full_name || slotProps.data.createdByUser?.fullName || slotProps.data.createdByUser?.full_name || '—' }}
                  </template>
                </Column>
                <Column field="requestDate" header="Tgl. Request" :sortable="true">
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

    <Menu id="wor-actions-menu" ref="actionsMenuRef" :model="actionMenuItems" :popup="true" append-to="body" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useWorkOrderRequestStore,
  getWorkOrderRequestNo,
  JOB_TYPE_LABELS,
  URGENCY_LABELS,
  URGENCY_BADGE_CLASS,
} from '~/stores/work-order-request'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'
import type { WorkOrderJobType, WorkOrderUrgencyLevel } from '~/stores/work-order-request'

const store = useWorkOrderRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { workOrderRequests, loading, totalRecords, params, statistics } = storeToRefs(store)
const { getStatusBadge } = useApprovalStatus()

const tableControls = ref({ rows: 10 })
const filters = ref({ status: null as string | null, jobType: null as string | null, urgencyLevel: null as string | null })
const globalFilterValue = ref('')
const rowsPerPageOptions = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
]

const jobTypeOptions = [
  { label: 'PM (Preventive Maintenance)', value: 'pm' },
  { label: 'CM (Corrective Maintenance)', value: 'cm' },
  { label: 'Relokasi / Moving Perangkat', value: 'relocation' },
]

const urgencyOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

function jobTypeShortLabel(type: string): string {
  const map: Record<string, string> = { pm: 'PM', cm: 'CM', relocation: 'Relokasi' }
  return map[type] ?? type?.toUpperCase() ?? '—'
}

function urgencyShortLabel(level: string): string {
  const map: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }
  return map[level] ?? level ?? '—'
}

function urgencyBadgeClass(level: WorkOrderUrgencyLevel): string {
  return URGENCY_BADGE_CLASS[level] ?? 'bg-label-secondary'
}

const actionsMenuRef = ref(null)
const activeRow = ref<any>(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = []
  const canEdit = userHasRole('superadmin') || userHasPermission('edit_work_order_request')
  const isEditable = row.status === 'draft' || row.status === 'rejected'

  if (canEdit && isEditable) {
    items.push({
      label: 'Submit',
      icon: 'ri ri-send-plane-line',
      command: () => store.submitWorkOrderRequest(row.id),
    })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/operations/work-order-request/form/${row.id}`),
    })
  }

  const canApprove = userHasRole('superadmin') || userHasPermission('approve_work_order_request')
  if (canApprove && row.status === 'pending') {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => store.approveWorkOrderRequest(row.id),
    })
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => rejectRow(row),
    })
  }

  if (row.status === 'approved' && (userHasRole('superadmin') || userHasPermission('edit_work_order_request'))) {
    items.push({
      label: 'Tandai Selesai',
      icon: 'ri ri-checkbox-circle-line',
      command: () => store.markCompleted(row.id),
    })
  }

  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => navigateTo(`/operations/work-order-request/detail/${row.id}`),
  })
  items.push({
    label: 'Cetak',
    icon: 'ri ri-printer-line',
    command: () => navigateTo({ path: '/operations/cetak-work-order-request', query: { id: row.id } }),
  })

  if (isEditable && canEdit) {
    items.push({ separator: true })
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'text-danger',
      command: () => store.deleteWorkOrderRequest(row.id),
    })
  }

  return items
})

async function rejectRow(row: any) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak Work Order Request',
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
    await store.rejectWorkOrderRequest(row.id, value.trim())
  }
}

function toggleActions(event: Event, row: any) {
  activeRow.value = row
  nextTick(() => (actionsMenuRef.value as any)?.toggle(event))
}

const onPage = (e: any) => { if (e) store.setPagination(e) }
const onSort = (e: any) => { if (e) store.setSort(e) }
const handleRowsChange = (v: any) => {
  params.value.rows = Number(v) || 10
  params.value.first = 0
  store.fetchWorkOrderRequests()
}

const debouncedSearch = useDebounceFn(() => store.setSearch(globalFilterValue.value), 500)
watch(globalFilterValue, debouncedSearch)
watch(
  filters,
  (f) => store.setFilters({ status: f.status, jobType: f.jobType, urgencyLevel: f.urgencyLevel }),
  { deep: true }
)

onMounted(() => {
  store.fetchWorkOrderRequests()
  store.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Work Order Request' })
</script>
