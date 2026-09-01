<template>
<div>
<ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Scrap"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2
              v-model="filters.status"
              :options="statusOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua status"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Reason</label>
            <CustomSelect2
              v-model="filters.reason"
              :options="reasonOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua reason"
            />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div class="card">
        <ListPageTableHeader
          :rows="Number(tableControls.rows)"
          :rows-options="rowsPerPageOptionsArray"
          :search="globalFilterValue"
          search-placeholder="Cari scrap / equipment..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Equipment Scrap' })"
        />

        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="columnFilters"
            :data="rows"
            :rows="Number(params.rows)"
            :loading="loading"
            :total-records="totalRecords"
            :first="params.first"
            :lazy="true"
            filter-display="row"
            @page="onPage"
            responsive-layout="scroll"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column header="#" :show-filter-menu="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="scrapNo" header="Scrap No" :show-filter-menu="false">
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="SCR-" />
              </template>
            </Column>
            <Column header="Equipment" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink v-if="data.equipmentId" :to="`/inventory/equipment/${data.equipmentId}`">
                  {{ data.equipment?.equipmentNo }}
                </NuxtLink>
                <div class="small text-muted">{{ data.equipment?.serialNumber }}</div>
              </template>
            </Column>
            <Column header="Warehouse" :show-filter-menu="false">
              <template #body="{ data }">{{ data.warehouse?.code || '—' }}</template>
            </Column>
            <Column field="reason" header="Reason" :show-filter-menu="false" />
            <Column field="status" header="Status" :show-filter-menu="false" />
            <Column header="Requested" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.requestedAt) }}</template>
            </Column>
            <Column header="Approved" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.approvedAt) }}</template>
            </Column>
            <Column header="Executed" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.executedAt) }}</template>
            </Column>
            <Column header="Action" :show-filter-menu="false">
              <template #body="{ data }">
                <button
                  v-if="
                    data.status === 'REQUESTED' &&
                    (userHasRole('superadmin') || userHasPermission('approve_equipment_scrap'))
                  "
                  type="button"
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="approve(data)"
                >
                  Approve
                </button>
                <button
                  v-if="
                    data.status === 'APPROVED' &&
                    (userHasRole('superadmin') || userHasPermission('execute_equipment_scrap'))
                  "
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="execute(data)"
                >
                  Execute WRITE_OFF
                </button>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
</div>
</template>

<script setup>
import { getApiErrorMessage } from '~/utils/apiError'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import ListColumnFilter from '~/components/list/ListColumnFilter.vue'
import Column from 'primevue/column'

const { $api } = useNuxtApp()
const toast = useToast()
const { userHasPermission, userHasRole } = usePermissions()

const filters = reactive({ status: null, reason: null })
const statusOptions = ['REQUESTED', 'APPROVED', 'EXECUTED', 'REJECTED', 'CANCELLED'].map((v) => ({
  label: v,
  value: v,
}))
const reasonOptions = [
  'BEYOND_REPAIR',
  'PHYSICAL_DESTRUCTION',
  'WARRANTY_REJECTED_UNREPAIRABLE',
  'OBSOLETE',
  'LOST',
  'OTHER',
].map((v) => ({ label: v, value: v }))

const list = useServerPaginatedList({
  endpoint: () => $api.equipmentScraps(),
  buildFilters: () => ({
    status: filters.status || undefined,
    reason: filters.reason || undefined,
  }),
})

const {
  rows,
  loading,
  totalRecords,
  summary,
  summaryCount,
  globalFilterValue,
  params,
  tableControls,
  rowsPerPageOptionsArray,
  columnFilters,
  initColumnFilters,
  fetchList,
  reload,
  onPage,
  onToolbarRows,
  onSearchUpdate,
  exportData,
} = list

const myDataTableRef = ref(null)
const hasActiveFilters = computed(() => !!(filters.status || filters.reason))

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: summary.value.total ?? totalRecords.value,
    icon: 'ri-delete-bin-line',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'requested',
    label: 'Requested',
    value: summaryCount('REQUESTED'),
    icon: 'ri-time-line',
    iconBgClass: 'bg-label-warning',
  },
  {
    key: 'approved',
    label: 'Approved',
    value: summaryCount('APPROVED'),
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-info',
  },
  {
    key: 'executed',
    label: 'Executed',
    value: summaryCount('EXECUTED'),
    icon: 'ri-close-circle-line',
    iconBgClass: 'bg-label-danger',
  },
])

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

function resetFilters() {
  filters.status = null
  filters.reason = null
  reload()
}

async function approve(row) {
  if (!confirm('Approve scrap? Stock unchanged until execute.')) return
  try {
    await $fetch($api.equipmentScrapApprove(row.id), {
      method: 'POST',
      credentials: 'include',
    })
    toast.success({ title: 'Approved', message: 'No stock change', color: 'green', position: 'bottomRight' })
    await reload()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal approve scrap'),
      color: 'red',
      position: 'bottomRight',
    })
  }
}

async function execute(row) {
  if (!confirm('Execute WRITE_OFF? Stock −1. Equipment → SCRAPPED.')) return
  try {
    await $fetch($api.equipmentScrapExecute(row.id), {
      method: 'POST',
      credentials: 'include',
    })
    toast.success({
      title: 'Executed',
      message: 'WRITE_OFF posted — equipment SCRAPPED',
      color: 'green',
      position: 'bottomRight',
    })
    await reload()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal execute scrap'),
      color: 'red',
      position: 'bottomRight',
    })
  }
}

watch(filters, () => reload(), { deep: true })

onMounted(async () => {
  initColumnFilters(['scrapNo'])
  await fetchList()
})
</script>
