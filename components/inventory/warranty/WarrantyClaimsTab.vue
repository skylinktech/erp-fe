<template>
<div>
<ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Claims"
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
            <label class="form-label">Provider</label>
            <CustomSelect2
              v-model="filters.providerId"
              :options="providers"
              :get-option-label="(o) => `${o.code} — ${o.name}`"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Semua provider"
            />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div class="card">
        <ListPageTableHeader
          :rows="Number(tableControls.rows)"
          :rows-options="rowsPerPageOptionsArray"
          :search="globalFilterValue"
          search-placeholder="Cari claim / provider ref..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Warranty Claims' })"
        >
          <template #toolbar-extra>
            <NuxtLink to="/inventory/warranty?tab=assessments" class="btn btn-outline-secondary">
              Assessments
            </NuxtLink>
            <NuxtLink to="/inventory/warranty?tab=rma" class="btn btn-outline-secondary">RMA</NuxtLink>
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
            <Column header="#" :show-filter-menu="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="claimNo" header="Claim" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/inventory/warranty-claim/${data.id}`">
                  <code>{{ data.claimNo }}</code>
                </NuxtLink>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="WCL-" />
              </template>
            </Column>
            <Column field="equipment.equipmentNo" header="Equipment" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.equipment?.equipmentNo }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="EQ" />
              </template>
            </Column>
            <Column field="provider.code" header="Provider" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.provider?.code }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Provider" />
              </template>
            </Column>
            <Column field="assessment.assessmentNo" header="Assessment" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                {{ data.assessment?.assessmentNo }}
                <div class="small text-muted">{{ data.assessment?.coverageResult }}</div>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="WA-" />
              </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <span class="badge bg-label-primary">{{ data.status }}</span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Status" :options="statuses" />
              </template>
            </Column>
            <Column field="providerReference" header="Provider Ref" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.providerReference || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Ref" />
              </template>
            </Column>
            <Column field="submittedAt" header="Submitted" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.submittedAt) }}</template>
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
const providers = ref([])
const filters = reactive({ status: null, providerId: null })
const statuses = ['DRAFT', 'SUBMITTED', 'UNDER_PROVIDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED']
const statusOptions = statuses.map((v) => ({ label: v, value: v }))

const list = useServerPaginatedList({
  endpoint: () => $api.warrantyClaims(),
  buildFilters: () => ({
    status: filters.status || undefined,
    providerId: filters.providerId || undefined,
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
const hasActiveFilters = computed(() => !!(filters.status || filters.providerId))

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Claims',
    value: summary.value.total ?? totalRecords.value,
    icon: 'ri-file-shield-2-line',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'open',
    label: 'In Progress',
    value: summaryCount('DRAFT', 'SUBMITTED', 'UNDER_PROVIDER_REVIEW'),
    icon: 'ri-time-line',
    iconBgClass: 'bg-label-warning',
  },
  {
    key: 'approved',
    label: 'Approved',
    value: summaryCount('APPROVED'),
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    value: summaryCount('REJECTED'),
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
  filters.providerId = null
  reload()
}

watch(filters, () => reload(), { deep: true })

onMounted(async () => {
  initColumnFilters([
    'claimNo',
    'equipment.equipmentNo',
    'provider.code',
    'assessment.assessmentNo',
    'status',
    'providerReference',
  ])
  try {
    const res = await $fetch($api.warrantyProviders(), { credentials: 'include' })
    providers.value = res?.data || []
  } catch {
    providers.value = []
  }
  await fetchList()
})
</script>
