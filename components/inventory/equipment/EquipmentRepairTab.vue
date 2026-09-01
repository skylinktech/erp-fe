<template>
<div>
<ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Repair"
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
            <label class="form-label">Result</label>
            <CustomSelect2
              v-model="filters.result"
              :options="resultOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua result"
            />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div class="card">
        <ListPageTableHeader
          :rows="Number(tableControls.rows)"
          :rows-options="rowsPerPageOptionsArray"
          :search="globalFilterValue"
          search-placeholder="Cari repair / serial..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Equipment Repair' })"
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
            <Column field="repairNo" header="Repair No" :show-filter-menu="false">
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="ERP-" />
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
            <Column header="Product" :show-filter-menu="false">
              <template #body="{ data }">{{ data.equipment?.product?.sku || '—' }}</template>
            </Column>
            <Column header="Warehouse" :show-filter-menu="false">
              <template #body="{ data }">{{ data.equipment?.warehouse?.code || '—' }}</template>
            </Column>
            <Column field="repairType" header="Type" :show-filter-menu="false" />
            <Column field="status" header="Status" :show-filter-menu="false" />
            <Column field="result" header="Result" :show-filter-menu="false">
              <template #body="{ data }">{{ data.result || '—' }}</template>
            </Column>
            <Column header="Started" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.startedAt) }}</template>
            </Column>
            <Column header="Completed" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.completedAt) }}</template>
            </Column>
            <Column header="Action" :show-filter-menu="false">
              <template #body="{ data }">
                <button
                  v-if="
                    data.status === 'IN_PROGRESS' &&
                    (userHasRole('superadmin') || userHasPermission('complete_equipment_repair'))
                  "
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="completeRepair(data)"
                >
                  Complete
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

const filters = reactive({ status: null, result: null })
const statusOptions = ['REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'].map((v) => ({
  label: v,
  value: v,
}))
const resultOptions = ['REPAIRED', 'UNREPAIRABLE', 'NEEDS_FURTHER_DIAGNOSIS'].map((v) => ({
  label: v,
  value: v,
}))

const list = useServerPaginatedList({
  endpoint: () => $api.equipmentRepairs(),
  buildFilters: () => ({
    status: filters.status || undefined,
    result: filters.result || undefined,
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
const hasActiveFilters = computed(() => !!(filters.status || filters.result))

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: summary.value.total ?? totalRecords.value,
    icon: 'ri-tools-line',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'progress',
    label: 'In Progress',
    value: summaryCount('IN_PROGRESS', 'REQUESTED'),
    icon: 'ri-time-line',
    iconBgClass: 'bg-label-warning',
  },
  {
    key: 'done',
    label: 'Completed',
    value: summaryCount('COMPLETED'),
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
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
  filters.result = null
  reload()
}

async function completeRepair(row) {
  const result = prompt('Result: REPAIRED | UNREPAIRABLE | NEEDS_FURTHER_DIAGNOSIS', 'REPAIRED')
  if (!result) return
  try {
    await $fetch($api.equipmentRepairComplete(row.id), {
      method: 'POST',
      credentials: 'include',
      body: { result },
    })
    toast.success({
      title: 'Completed',
      message: 'Equipment → UNDER_INSPECTION (no stock change)',
      color: 'green',
      position: 'bottomRight',
    })
    await reload()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal complete repair'),
      color: 'red',
      position: 'bottomRight',
    })
  }
}

watch(filters, () => reload(), { deep: true })

onMounted(async () => {
  initColumnFilters(['repairNo'])
  await fetchList()
})
</script>
