<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">Pengajuan dismantle layanan — terminasi, recovery peralatan, billing, dan completion.</p>

      <div class="row g-4 mb-6">
        <div v-for="kpi in kpiCards" :key="kpi.key" class="col-xl-3 col-lg-4 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="mb-0 text-muted">{{ kpi.label }}</p>
                <span :class="`avatar-initial rounded ${kpi.bg}`"><i :class="kpi.icon"></i></span>
              </div>
              <h5 class="mb-0">{{ kpi.value }}</h5>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter Request Dismantle" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2
                  v-model="filters.status"
                  :options="statusOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  clearable
                  placeholder="Status"
                />
              </FilterField>
              <FilterField>
                <label class="form-label">Tipe Terminasi</label>
                <CustomSelect2
                  v-model="filters.terminationType"
                  :options="terminationOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  clearable
                  placeholder="Tipe terminasi"
                />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>

        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="d-flex align-items-center">
                <span class="me-2">Baris:</span>
                <Dropdown v-model="tableControls.rows" :options="rowsPerPageOptions" @change="handleRowsChange" style="width: 8rem;" />
              </div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <button
                  v-if="canCreate"
                  type="button"
                  class="btn btn-primary"
                  @click="navigateTo('/operations/request-dismantle/form')"
                >
                  <i class="ri-add-line me-1"></i>Tambah
                </button>
                <span class="p-input-icon-left">
                  <InputText v-model="globalFilterValue" placeholder="Cari no. request, customer..." class="w-full md:w-20rem" />
                </span>
              </div>
            </div>

            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                :data="items"
                :rows="Number(params.rows)"
                :loading="loadingList"
                :totalRecords="totalRecords"
                :first="params.first"
                :lazy="true"
                @page="onPage"
                responsiveLayout="scroll"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="requestNumber" header="No. Request" class="text-nowrap">
                  <template #body="slotProps">
                    <a
                      class="text-primary"
                      style="cursor:pointer;text-decoration:underline"
                      @click="navigateTo(`/operations/request-dismantle/detail/${slotProps.data.id}`)"
                    >
                      {{ slotProps.data.requestNumber || '—' }}
                    </a>
                  </template>
                </Column>
                <Column header="Customer">
                  <template #body="slotProps">{{ slotProps.data.customer?.name || '—' }}</template>
                </Column>
                <Column header="Site">
                  <template #body="slotProps">{{ slotProps.data.site?.name || '—' }}</template>
                </Column>
                <Column header="Tipe">
                  <template #body="slotProps">{{ slotProps.data.terminationType || '—' }}</template>
                </Column>
                <Column header="Svc / Eq">
                  <template #body="slotProps">
                    {{ slotProps.data.serviceCount ?? slotProps.data.services?.length ?? 0 }} /
                    {{ slotProps.data.equipmentCount ?? '—' }}
                  </template>
                </Column>
                <Column header="Efektif">
                  <template #body="slotProps">{{ formatDate(slotProps.data.requestedEffectiveTerminationAt) }}</template>
                </Column>
                <Column header="Status">
                  <template #body="slotProps">
                    <DismantleProgressSummary :status="slotProps.data.status" :phase="slotProps.data.summaryPhase" />
                  </template>
                </Column>
                <Column header="Aksi" style="min-width: 4rem">
                  <template #body="slotProps">
                    <button type="button" class="btn btn-sm btn-text-secondary rounded-pill btn-icon" @click.stop="toggleActions($event, slotProps.data)">
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
    <Menu ref="actionsMenuRef" :model="actionMenuItems" :popup="true" append-to="body" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import { useDebounceFn } from '@vueuse/core'
import { useRequestDismantleStore } from '~/stores/request-dismantle'
import { usePermissions } from '~/composables/usePermissions'
import { TERMINATION_TYPE_OPTIONS } from '~/utils/dismantleLabels'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import DismantleProgressSummary from '~/components/dismantle/DismantleProgressSummary.vue'
import type { DismantleRequestListItem } from '~/types/operations/dismantle'

definePageMeta({ middleware: ['auth', 'check-permission'], title: 'Request Dismantle' })

const store = useRequestDismantleStore()
const { userHasPermission } = usePermissions()
const { items, loadingList, totalRecords, params, statistics, filters } = storeToRefs(store)

const tableControls = ref({ rows: 10 })
const globalFilterValue = ref('')
const rowsPerPageOptions = [10, 25, 50, 100]
const actionsMenuRef = ref()
const actionRow = ref<DismantleRequestListItem | null>(null)

const canCreate = computed(() => userHasPermission('create_dismantle_request'))

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Menunggu Approval', value: 'submitted' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Terjadwal', value: 'scheduled' },
  { label: 'Berjalan', value: 'in_progress' },
  { label: 'Terblokir', value: 'blocked' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Ditolak', value: 'rejected' },
  { label: 'Dibatalkan', value: 'cancelled' },
]

const terminationOptions = TERMINATION_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))

const hasActiveFilters = computed(
  () => !!(filters.value.status || filters.value.terminationType || filters.value.search)
)

const kpiCards = computed(() => {
  const s = statistics.value
  return [
    { key: 'total', label: 'Total', value: s.total, icon: 'ri-file-list-3-line', bg: 'bg-label-primary' },
    { key: 'draft', label: 'Draft', value: s.draft, icon: 'ri-draft-line', bg: 'bg-label-secondary' },
    { key: 'submitted', label: 'Waiting Approval', value: s.submitted, icon: 'ri-time-line', bg: 'bg-label-warning' },
    { key: 'scheduled', label: 'Scheduled', value: s.scheduled, icon: 'ri-calendar-line', bg: 'bg-label-info' },
    { key: 'in_progress', label: 'In Progress', value: s.in_progress, icon: 'ri-play-circle-line', bg: 'bg-label-primary' },
    { key: 'blocked', label: 'Blocked', value: s.blocked, icon: 'ri-forbid-line', bg: 'bg-label-danger' },
    { key: 'completed', label: 'Completed', value: s.completed, icon: 'ri-checkbox-circle-line', bg: 'bg-label-success' },
    { key: 'recovery', label: 'Equipment Pending Return*', value: '—', icon: 'ri-tools-line', bg: 'bg-label-warning' },
  ]
})

function formatDate(val?: string | null) {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium' })
  } catch {
    return val
  }
}

function resetFilters() {
  filters.value.status = null
  filters.value.terminationType = null
  filters.value.search = ''
  globalFilterValue.value = ''
}

function onPage(e: { first: number; rows: number }) {
  params.value.first = e.first
  params.value.rows = e.rows
  store.fetchList()
}

function handleRowsChange() {
  params.value.rows = tableControls.value.rows
  params.value.first = 0
  store.fetchList()
}

const debouncedSearch = useDebounceFn(() => {
  filters.value.search = globalFilterValue.value
  params.value.first = 0
  store.fetchList()
}, 400)

watch(globalFilterValue, debouncedSearch)
watch([() => filters.value.status, () => filters.value.terminationType], () => {
  params.value.first = 0
  store.fetchList()
})

const actionMenuItems = computed(() => {
  const row = actionRow.value
  if (!row) return []
  const items = [
    { label: 'Lihat Detail', icon: 'ri-eye-line', command: () => navigateTo(`/operations/request-dismantle/detail/${row.id}`) },
  ]
  if (row.status === 'draft' && userHasPermission('edit_dismantle_request')) {
    items.push({ label: 'Edit Draft', icon: 'ri-edit-line', command: () => navigateTo(`/operations/request-dismantle/form/${row.id}`) })
  }
  if (['approved', 'scheduled'].includes(row.status)) {
    items.push({ label: 'Execute', icon: 'ri-hammer-line', command: () => navigateTo(`/operations/request-dismantle/${row.id}/execute`) })
  }
  if (row.status === 'in_progress') {
    items.push({ label: 'Warehouse Receipt', icon: 'ri-inbox-archive-line', command: () => navigateTo(`/operations/request-dismantle/${row.id}/receive`) })
  }
  return items
})

function toggleActions(event: Event, row: DismantleRequestListItem) {
  actionRow.value = row
  actionsMenuRef.value?.toggle(event)
}

onMounted(async () => {
  tableControls.value.rows = params.value.rows
  await Promise.all([store.fetchStatistics(), store.fetchList()])
})
</script>
