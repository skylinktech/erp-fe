<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        Internal eligibility — does not create RMA or change On Hand.
      </p>

      <ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Assessment"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">Coverage Result</label>
            <CustomSelect2
              v-model="filters.coverageResult"
              :options="coverageOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua hasil"
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
          search-placeholder="Cari assessment / equipment..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Warranty Assessments' })"
        >
          <template #toolbar-extra>
            <NuxtLink to="/inventory/equipment-inspection" class="btn btn-outline-secondary">
              Inspection
            </NuxtLink>
            <NuxtLink to="/inventory/warranty-claim" class="btn btn-outline-secondary">
              Claims
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
            <Column header="#" :show-filter-menu="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="assessmentNo" header="Assessment" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }"><code>{{ data.assessmentNo }}</code></template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="WA-" />
              </template>
            </Column>
            <Column field="equipment.equipmentNo" header="Equipment" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/inventory/equipment/${data.equipmentId}`">
                  {{ data.equipment?.equipmentNo }}
                </NuxtLink>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="EQ" />
              </template>
            </Column>
            <Column field="coverageResult" header="Result" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <span
                  class="badge"
                  :class="{
                    'bg-label-success': data.coverageResult === 'ELIGIBLE',
                    'bg-label-danger': data.coverageResult === 'NOT_ELIGIBLE',
                    'bg-label-warning': data.coverageResult === 'NEEDS_REVIEW',
                  }"
                >
                  {{ data.coverageResult }}
                </span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter
                  v-bind="slotProps"
                  placeholder="Result"
                  :options="['ELIGIBLE', 'NOT_ELIGIBLE', 'NEEDS_REVIEW']"
                />
              </template>
            </Column>
            <Column field="reason" header="Reason" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.reason || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Reason" />
              </template>
            </Column>
            <Column field="primaryExclusion.code" header="Exclusion" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.primaryExclusion?.code || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Exclusion" />
              </template>
            </Column>
            <Column field="provider.code" header="Provider" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.provider?.code || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Provider" />
              </template>
            </Column>
            <Column header="Actions" :exportable="false" :show-filter-menu="false">
              <template #body="{ data }">
                <button
                  v-if="data.coverageResult === 'ELIGIBLE' && (userHasRole('superadmin') || userHasPermission('create_warranty_claim'))"
                  class="btn btn-sm btn-primary"
                  @click="createClaim(data)"
                >
                  Create Claim
                </button>
              </template>
            </Column>
          </MyDataTable>
        </div>
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

definePageMeta({ middleware: ['auth', 'check-permission'], title: 'Warranty Assessments' })

const { $api } = useNuxtApp()
const toast = useToast()
const router = useRouter()
const { userHasPermission, userHasRole } = usePermissions()

const providers = ref([])
const filters = reactive({ coverageResult: null, providerId: null })
const coverageOptions = [
  { label: 'ELIGIBLE', value: 'ELIGIBLE' },
  { label: 'NOT_ELIGIBLE', value: 'NOT_ELIGIBLE' },
  { label: 'NEEDS_REVIEW', value: 'NEEDS_REVIEW' },
]

const list = useServerPaginatedList({
  endpoint: () => $api.warrantyAssessments(),
  buildFilters: () => ({
    coverageResult: filters.coverageResult || undefined,
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
const hasActiveFilters = computed(() => !!(filters.coverageResult || filters.providerId))

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: summary.value.total ?? totalRecords.value,
    icon: 'ri-file-list-3-line',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'eligible',
    label: 'Eligible',
    value: summaryCount('ELIGIBLE'),
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
  },
  {
    key: 'not',
    label: 'Not Eligible',
    value: summaryCount('NOT_ELIGIBLE'),
    icon: 'ri-close-circle-line',
    iconBgClass: 'bg-label-danger',
  },
  {
    key: 'review',
    label: 'Needs Review',
    value: summaryCount('NEEDS_REVIEW'),
    icon: 'ri-error-warning-line',
    iconBgClass: 'bg-label-warning',
  },
])

function resetFilters() {
  filters.coverageResult = null
  filters.providerId = null
  reload()
}

async function createClaim(row) {
  try {
    const res = await $fetch($api.warrantyClaims(), {
      method: 'POST',
      credentials: 'include',
      body: { assessmentId: row.id },
    })
    toast.success({
      title: 'Berhasil',
      message: res?.data?.claimNo || 'Claim created',
      color: 'green',
      position: 'bottomRight',
    })
    if (res?.data?.id) await router.push(`/inventory/warranty-claim/${res.data.id}`)
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal create claim'),
      color: 'red',
      position: 'bottomRight',
    })
  }
}

watch(filters, () => reload(), { deep: true })

onMounted(async () => {
  initColumnFilters([
    'assessmentNo',
    'equipment.equipmentNo',
    'coverageResult',
    'reason',
    'primaryExclusion.code',
    'provider.code',
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
