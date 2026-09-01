<template>
<div>
<ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Equipment"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="3">
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
            <label class="form-label">Assignment</label>
            <CustomSelect2
              v-model="filters.assigned"
              :options="assignedOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => String(o.value)"
              searchable
              clearable
              placeholder="Semua"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Warehouse</label>
            <CustomSelect2
              v-model="filters.warehouseId"
              :options="warehouses"
              :get-option-label="(o) => `${o.code} — ${o.name}`"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Semua gudang"
            />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div class="card">
        <ListPageTableHeader
          :rows="Number(tableControls.rows)"
          :rows-options="rowsPerPageOptionsArray"
          :search="globalFilterValue"
          search-placeholder="Cari EQ- / serial / UTID..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Data Equipment' })"
        >
          <template #toolbar-extra>
            <NuxtLink to="/inventory/equipment?tab=inspection" class="btn btn-outline-secondary">
              Inspection
            </NuxtLink>
            <NuxtLink to="/inventory/warranty?tab=claims" class="btn btn-outline-secondary">
              Warranty
            </NuxtLink>
          </template>
        </ListPageTableHeader>

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
            <Column header="#" :sortable="false" :show-filter-menu="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="equipmentNo" header="Equipment No" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/inventory/equipment/${data.id}`"><code>{{ data.equipmentNo }}</code></NuxtLink>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Cari EQ" />
              </template>
            </Column>
            <Column field="product.sku" header="Product" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <div>{{ data.product?.sku }}</div>
                <small class="text-muted">{{ data.product?.name }}</small>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="SKU" />
              </template>
            </Column>
            <Column field="serialNumber" header="Serial" :sortable="true" :show-filter-menu="false">
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Serial" />
              </template>
            </Column>
            <Column field="utid" header="UTID" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.utid || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="UTID" />
              </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <span class="badge me-1" :class="statusBadgeClass(data.status)">{{ data.status }}</span>
                <span v-if="data.sealStatus === 'SEALED'" class="badge bg-label-warning me-1">SEALED</span>
                <span
                  v-if="data.serialCaptureStatus && data.serialCaptureStatus !== 'COMPLETE' && data.serialCaptureStatus !== 'VERIFIED'"
                  class="badge bg-label-danger"
                >
                  SERIAL {{ data.serialCaptureStatus === 'PARTIAL' ? 'PARTIAL' : 'PENDING' }}
                </span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter
                  v-bind="slotProps"
                  placeholder="Status"
                  :options="statusOptions.map((o) => o.value)"
                />
              </template>
            </Column>
            <Column field="warehouse.code" header="Warehouse" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.warehouse?.code || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="WH" />
              </template>
            </Column>
            <Column field="currentSite.code" header="Site" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink v-if="data.currentSiteId" :to="`/company/site/${data.currentSiteId}`">
                  {{ data.currentSite?.code || data.currentSiteId }}
                </NuxtLink>
                <span v-else>—</span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Site" />
              </template>
            </Column>
            <Column header="Actions" :exportable="false" :show-filter-menu="false" style="min-width:6rem">
              <template #body="{ data }">
                <NuxtLink :to="`/inventory/equipment/${data.id}`" class="btn btn-sm btn-outline-primary">
                  Detail
                </NuxtLink>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
</div>
</template>

<script setup>
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import ListColumnFilter from '~/components/list/ListColumnFilter.vue'
import Column from 'primevue/column'

const { $api } = useNuxtApp()
const warehouses = ref([])
const filters = reactive({ status: null, assigned: null, warehouseId: null })

const statusOptions = [
  { label: 'AVAILABLE', value: 'AVAILABLE' },
  { label: 'ASSIGNED', value: 'ASSIGNED' },
  { label: 'INSTALLED', value: 'INSTALLED' },
  { label: 'RETURNED', value: 'RETURNED' },
  { label: 'UNDER_INSPECTION', value: 'UNDER_INSPECTION' },
  { label: 'UNDER_RMA', value: 'UNDER_RMA' },
]
const assignedOptions = [
  { label: 'Unassigned', value: '0' },
  { label: 'Assigned', value: '1' },
]

function statusBadgeClass(status) {
  return status === 'AVAILABLE' ? 'bg-label-success' : 'bg-label-primary'
}

const list = useServerPaginatedList({
  endpoint: () => $api.equipment(),
  buildFilters: () => ({
    status: filters.status || undefined,
    assigned: filters.assigned ?? undefined,
    warehouseId: filters.warehouseId || undefined,
  }),
})

const {
  rows,
  loading,
  totalRecords,
  summaryCount,
  summary,
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

const hasActiveFilters = computed(
  () => !!(filters.status || filters.assigned != null || filters.warehouseId)
)

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Equipment',
    value: summary.value.total ?? totalRecords.value,
    icon: 'ri-cpu-line',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'available',
    label: 'Available',
    value: summaryCount('AVAILABLE'),
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
  },
  {
    key: 'installed',
    label: 'Installed',
    value: summaryCount('INSTALLED'),
    icon: 'ri-map-pin-line',
    iconBgClass: 'bg-label-info',
  },
  {
    key: 'recovery',
    label: 'Inspection / RMA',
    value: summaryCount('UNDER_INSPECTION', 'UNDER_RMA', 'RETURNED'),
    icon: 'ri-tools-line',
    iconBgClass: 'bg-label-warning',
  },
])

function resetFilters() {
  filters.status = null
  filters.assigned = null
  filters.warehouseId = null
  reload()
}

watch(filters, () => reload(), { deep: true })

onMounted(async () => {
  initColumnFilters(['equipmentNo', 'product.sku', 'serialNumber', 'utid', 'status', 'warehouse.code', 'currentSite.code'])
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
  await fetchList()
})
</script>
