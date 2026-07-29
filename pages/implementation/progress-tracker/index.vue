<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Progress Tracker</h4>
      <p class="mb-6">Lacak progress project implementation per node/network</p>

      <div v-if="!loading && !workflowConfigured" class="alert alert-warning mb-4">
        Approval workflow entitas <code>progress_tracker</code> belum dikonfigurasi.
        <NuxtLink to="/admin/approval-workflows">Atur di Approval Workflows</NuxtLink>.
      </div>

      <div class="row g-6 mb-6">
        <div
          v-for="card in summaryCards"
          :key="card.key"
          class="col-xl col-lg-6 col-md-6"
        >
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">{{ card.label }}</p>
                <div class="avatar">
                  <span class="avatar-initial rounded" :class="card.avatarClass">
                    <i :class="card.icon"></i>
                  </span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ card.value }}</h5>
                <span class="text-muted">{{ card.caption }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CollapsibleFilterCard
        title="Filter Progress Tracker"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div class="col-md-6">
            <FilterField>
              <label class="form-label">Status project</label>
              <CustomSelect2
                v-model="filters.status"
                :options="PROJECT_STATUS_OPTIONS"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Status project"
              />
            </FilterField>
          </div>
          <div class="col-md-6">
            <FilterField>
              <label class="form-label">Status approval</label>
              <CustomSelect2
                v-model="filters.approvalStatus"
                :options="PROGRESS_TRACKER_APPROVAL_STATUS_OPTIONS"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Status approval"
              />
            </FilterField>
          </div>
          <div class="col-md-6 offset-md-6 d-flex justify-content-end mt-4">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
              <i class="ri-refresh-line me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div class="card">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <Dropdown v-model="tableControls.rows" :options="[10, 25, 50]" @change="onRowsChange" style="width: 8rem" />
          <div class="d-flex gap-2">
            <button
              v-if="userHasRole('superadmin') || userHasPermission('create_progress_tracker')"
              class="btn btn-primary btn-sm"
              @click="navigateTo('/implementation/progress-tracker/form')"
            >
              <i class="ri-add-line me-1"></i>Tambah Project
            </button>
            <InputText v-model="globalFilter" placeholder="Cari project..." class="w-12rem" />
          </div>
        </div>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            :data="projects"
            :rows="Number(params.rows)"
            :loading="loading"
            :totalRecords="totalRecords"
            :first="params.first"
            :lazy="true"
            @page="onPage"
            @sort="onSort"
          >
            <Column header="#">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="projectCode" header="Kode" :sortable="true">
              <template #body="slotProps">
                <a
                  class="text-primary text-decoration-underline"
                  style="cursor: pointer"
                  @click="navigateTo(`/implementation/progress-tracker/detail/${slotProps.data.id}`)"
                >
                  {{ slotProps.data.projectCode || slotProps.data.project_code }}
                </a>
              </template>
            </Column>
            <Column field="name" header="Nama Project" :sortable="true" />
            <Column header="Site Investment">
              <template #body="slotProps">
                {{
                  slotProps.data.siteInvestment?.siNumber ||
                  slotProps.data.siteInvestment?.si_number ||
                  '—'
                }}
              </template>
            </Column>
            <Column header="Nodes">
              <template #body="slotProps">
                {{ slotProps.data.nodesCount ?? slotProps.data.nodes_count ?? 0 }}
              </template>
            </Column>
            <Column field="status" header="Status Project">
              <template #body="slotProps">
                <span :class="getProjectStatusBadge(slotProps.data.status).class">
                  {{ getProjectStatusBadge(slotProps.data.status).text }}
                </span>
              </template>
            </Column>
            <Column header="Approval">
              <template #body="slotProps">
                <span :class="getApprovalStatusBadge(approvalBadgeRow(slotProps.data)).class">
                  {{ getApprovalStatusBadge(approvalBadgeRow(slotProps.data)).text }}
                </span>
              </template>
            </Column>
            <Column header="Actions" :exportable="false" style="min-width: 5rem">
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

    <Menu
      id="progress-tracker-actions-menu"
      ref="actionsMenuRef"
      :model="actionMenuItems"
      :popup="true"
      append-to="body"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import {
  useProgressTrackerStore,
  type ProgressTrackerProject,
} from '~/stores/progress-tracker'
import { usePermissions } from '~/composables/usePermissions'
import { useProgressTrackerApproval } from '~/composables/useProgressTrackerApproval'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import {
  PROJECT_STATUS_OPTIONS,
  PROGRESS_TRACKER_APPROVAL_STATUS_OPTIONS,
  getProjectStatusBadge,
  getProjectApprovalStatus,
} from '~/constants/implementation/progressTrackerStatuses'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Progress Tracker',
})

const store = useProgressTrackerStore()
const { projects, loading, totalRecords, params, statistics, workflowConfigured } =
  storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()
const {
  canApproveProgressTracker,
  canRejectProgressTracker,
  canSubmitProgressTracker,
} = useProgressTrackerApproval()
const { getStatusBadge: getApprovalStatusBadge } = useApprovalStatus()

const filters = ref({ status: null as string | null, approvalStatus: null as string | null })

const hasActiveFilters = computed(() => !!filters.value.status || !!filters.value.approvalStatus)

function resetFilters() {
  filters.value.status = null
  filters.value.approvalStatus = null
}
const globalFilter = ref('')
const tableControls = ref({ rows: 10 })

const canEdit = computed(
  () =>
    userHasRole('superadmin') ||
    userHasPermission('edit_progress_tracker') ||
    userHasPermission('create_progress_tracker')
)

function canEditRow(row: ProgressTrackerProject) {
  const approvalStatus = getProjectApprovalStatus(row)
  return (
    (approvalStatus === 'draft' || approvalStatus === 'rejected') &&
    canEdit.value
  )
}

function approvalBadgeRow(row: ProgressTrackerProject) {
  return { ...row, status: getProjectApprovalStatus(row) }
}

const canDelete = computed(
  () => userHasRole('superadmin') || userHasPermission('delete_progress_tracker')
)

const summaryCards = computed(() => [
  {
    key: 'total',
    label: 'Total Project',
    value: statistics.value.totalProjects ?? 0,
    caption: 'Semua project',
    icon: 'ri-route-line',
    avatarClass: 'bg-label-primary',
  },
  {
    key: 'active',
    label: 'Active',
    value: statistics.value.activeProjects ?? 0,
    caption: 'Sedang berjalan',
    icon: 'ri-play-circle-line',
    avatarClass: 'bg-label-success',
  },
  {
    key: 'completed',
    label: 'Completed',
    value: statistics.value.completedProjects ?? 0,
    caption: 'Selesai',
    icon: 'ri-checkbox-circle-line',
    avatarClass: 'bg-label-info',
  },
  {
    key: 'on_hold',
    label: 'On Hold',
    value: statistics.value.onHoldProjects ?? 0,
    caption: 'Ditahan',
    icon: 'ri-pause-circle-line',
    avatarClass: 'bg-label-warning',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    value: statistics.value.cancelledProjects ?? 0,
    caption: 'Dibatalkan',
    icon: 'ri-close-circle-line',
    avatarClass: 'bg-label-danger',
  },
])

const actionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)
const activeRow = ref<ProgressTrackerProject | null>(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row?.id) return []
  const items: { label: string; icon: string; command: () => void }[] = [
    {
      label: 'Detail',
      icon: 'ri-eye-line',
      command: () => navigateTo(`/implementation/progress-tracker/detail/${row.id}`),
    },
  ]
  if (canSubmitProgressTracker(row)) {
    items.push({
      label: getProjectApprovalStatus(row) === 'rejected' ? 'Submit Revisi' : 'Submit untuk Approval',
      icon: 'ri-send-plane-line',
      command: () => onSubmitRow(row),
    })
  }
  if (canApproveProgressTracker(row)) {
    items.push({
      label: 'Approve',
      icon: 'ri-check-line',
      command: () => onApproveRow(row),
    })
  }
  if (canRejectProgressTracker(row)) {
    items.push({
      label: 'Reject',
      icon: 'ri-close-line',
      command: () => onRejectRow(row),
    })
  }
  if (canEditRow(row)) {
    items.push({
      label: 'Edit',
      icon: 'ri-edit-box-line',
      command: () => navigateTo(`/implementation/progress-tracker/form/${row.id}`),
    })
  }
  if (canDelete.value && getProjectApprovalStatus(row) === 'draft') {
    items.push({
      label: 'Hapus',
      icon: 'ri-delete-bin-7-line',
      command: () => onDeleteRow(row),
    })
  }
  return items
})

function toggleActions(event: Event, row: ProgressTrackerProject) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

async function onDeleteRow(row: ProgressTrackerProject) {
  if (!row.id) return
  const ok = await store.deleteProject(row.id)
  if (ok) {
    await store.fetchStatistics()
    await store.fetchProjects()
  }
}

async function onSubmitRow(row: ProgressTrackerProject) {
  if (!row.id) return
  const ok = await store.submitForApproval(row.id)
  if (ok) {
    await store.fetchStatistics()
    await store.fetchProjects()
  }
}

async function onApproveRow(row: ProgressTrackerProject) {
  if (!row.id) return
  const { value: remarks, isConfirmed } = await Swal.fire({
    title: 'Approve Project',
    input: 'textarea',
    inputLabel: 'Catatan approval (opsional)',
    inputPlaceholder: 'Catatan...',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Batal',
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-label-secondary',
    },
  })
  if (!isConfirmed) return
  const ok = await store.approve(row.id, remarks?.trim() || undefined)
  if (ok) {
    await store.fetchStatistics()
    await store.fetchProjects()
  }
}

async function onRejectRow(row: ProgressTrackerProject) {
  if (!row.id) return
  const { value: remarks, isConfirmed } = await Swal.fire({
    title: 'Reject Project',
    input: 'textarea',
    inputLabel: 'Alasan penolakan (wajib)',
    inputPlaceholder: 'Alasan...',
    inputValidator: (v) => (!v?.trim() ? 'Alasan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Reject',
    cancelButtonText: 'Batal',
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-label-secondary',
    },
  })
  if (!isConfirmed || !remarks?.trim()) return
  const ok = await store.reject(row.id, remarks.trim())
  if (ok) {
    await store.fetchStatistics()
    await store.fetchProjects()
  }
}

watch(filters, () => {
  params.value.status = filters.value.status
  params.value.approvalStatus = filters.value.approvalStatus
  params.value.first = 0
  store.fetchProjects()
}, { deep: true })

const debouncedSearch = useDebounceFn(() => {
  params.value.search = globalFilter.value
  params.value.first = 0
  store.fetchProjects()
}, 400)

watch(globalFilter, debouncedSearch)

onMounted(async () => {
  await store.fetchStatistics()
  await store.fetchProjects()
})

function onPage(e: { first: number; rows: number }) {
  params.value.first = e.first
  params.value.rows = e.rows
  store.fetchProjects()
}

function onSort(e: { sortField?: string; sortOrder?: number }) {
  params.value.sortField = e.sortField ?? 'created_at'
  params.value.sortOrder = e.sortOrder ?? -1
  store.fetchProjects()
}

function onRowsChange() {
  params.value.rows = tableControls.value.rows
  params.value.first = 0
  store.fetchProjects()
}
</script>
