<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Progress Tracker</h4>
      <p class="mb-6">Lacak progress project implementation per node/network</p>

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

      <div class="row g-6 mb-7">
        <div class="col-12">
          <h4 class="mt-2 mb-1">Filter</h4>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-2">
                <div class="col-md-12">
                  <CustomSelect2
                    v-model="filters.status"
                    :options="PROJECT_STATUS_OPTIONS"
                    :get-option-label="(o) => o.label"
                    :reduce="(o) => o.value"
                    searchable
                    clearable
                    placeholder="Status project"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <Column field="status" header="Status">
              <template #body="slotProps">
                <span :class="getProjectStatusBadge(slotProps.data.status).class">
                  {{ getProjectStatusBadge(slotProps.data.status).text }}
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
import {
  PROJECT_STATUS_OPTIONS,
  getProjectStatusBadge,
} from '~/constants/implementation/progressTrackerStatuses'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Progress Tracker',
})

const store = useProgressTrackerStore()
const { projects, loading, totalRecords, params, statistics } = storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()

const filters = ref({ status: null as string | null })
const globalFilter = ref('')
const tableControls = ref({ rows: 10 })

const canEdit = computed(
  () =>
    userHasRole('superadmin') ||
    userHasPermission('edit_progress_tracker') ||
    userHasPermission('create_progress_tracker')
)

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
  if (canEdit.value) {
    items.push({
      label: 'Edit',
      icon: 'ri-edit-box-line',
      command: () => navigateTo(`/implementation/progress-tracker/form/${row.id}`),
    })
  }
  if (canDelete.value) {
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

watch(filters, () => {
  params.value.status = filters.value.status
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
