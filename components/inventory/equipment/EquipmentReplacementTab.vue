<template>
<div>
<ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Replacement"
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
            <label class="form-label">Stock Source</label>
            <CustomSelect2
              v-model="filters.stockSource"
              :options="stockSourceOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua source"
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
          search-placeholder="Cari replacement / equipment..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Equipment Replacement' })"
        >
          <template #add>
            <button
              v-if="userHasRole('superadmin') || userHasPermission('create_equipment_replacement')"
              type="button"
              class="btn btn-primary"
              @click="showCreate = true"
            >
              <i class="ri-add-line me-1" />
              Buat Replacement
            </button>
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
            <Column field="replacementNo" header="Replacement No" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/inventory/equipment-replacement/${data.id}`">
                  <code>{{ data.replacementNo }}</code>
                </NuxtLink>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="No" />
              </template>
            </Column>
            <Column field="originalEquipment.equipmentNo" header="Original" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink
                  v-if="data.originalEquipment"
                  :to="`/inventory/equipment/${data.originalEquipmentId}`"
                >
                  {{ data.originalEquipment.equipmentNo }}
                </NuxtLink>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Original" />
              </template>
            </Column>
            <Column field="replacementEquipment.equipmentNo" header="Replacement" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink
                  v-if="data.replacementEquipment"
                  :to="`/inventory/equipment/${data.replacementEquipmentId}`"
                >
                  {{ data.replacementEquipment.equipmentNo }}
                </NuxtLink>
                <span v-else class="text-muted">—</span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Target" />
              </template>
            </Column>
            <Column field="site.code" header="Site" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.site?.code || data.siteId }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Site" />
              </template>
            </Column>
            <Column field="reason" header="Reason" :sortable="true" :show-filter-menu="false">
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Reason" :options="reasons" />
              </template>
            </Column>
            <Column field="stockSource" header="Source" :sortable="true" :show-filter-menu="false">
              <template #filter="slotProps">
                <ListColumnFilter
                  v-bind="slotProps"
                  placeholder="Source"
                  :options="['STANDARD_STOCK', 'BUFFER_STOCK']"
                />
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
            <Column field="requestedAt" header="Requested" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ formatDate(data.requestedAt) }}</template>
            </Column>
          </MyDataTable>
        </div>
      </div>

    <div v-if="showCreate" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Replacement</h5>
            <button type="button" class="btn-close" @click="showCreate = false" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Original Equipment ID</label>
              <input v-model="createForm.originalEquipmentId" class="form-control" placeholder="UUID" />
            </div>
            <div class="mb-3">
              <label class="form-label">Reason</label>
              <select v-model="createForm.reason" class="form-select">
                <option v-for="r in reasons" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Stock Source</label>
              <select v-model="createForm.stockSource" class="form-select">
                <option value="STANDARD_STOCK">STANDARD_STOCK</option>
                <option
                  value="BUFFER_STOCK"
                  :disabled="!(userHasRole('superadmin') || userHasPermission('use_buffer_for_replacement'))"
                >
                  BUFFER_STOCK
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="createForm.notes" class="form-control" rows="2" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showCreate = false">Batal</button>
            <button class="btn btn-primary" :disabled="saving" @click="submitCreate">
              {{ saving ? 'Saving...' : 'Create' }}
            </button>
          </div>
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

const { $api } = useNuxtApp()
const toast = useToast()
const { userHasPermission, userHasRole } = usePermissions()
const router = useRouter()

const showCreate = ref(false)
const saving = ref(false)
const filters = reactive({ status: null, stockSource: null, reason: null })
const statuses = ['REQUESTED', 'APPROVED', 'READY', 'COMPLETED', 'CANCELLED', 'REJECTED']
const reasons = [
  'HARDWARE_FAILURE',
  'PHYSICAL_DAMAGE',
  'PREVENTIVE_REPLACEMENT',
  'SLA_RECOVERY',
  'UPGRADE',
  'OTHER',
]
const statusOptions = statuses.map((v) => ({ label: v, value: v }))
const stockSourceOptions = [
  { label: 'STANDARD_STOCK', value: 'STANDARD_STOCK' },
  { label: 'BUFFER_STOCK', value: 'BUFFER_STOCK' },
]
const reasonOptions = reasons.map((v) => ({ label: v, value: v }))
const createForm = reactive({
  originalEquipmentId: '',
  reason: 'HARDWARE_FAILURE',
  stockSource: 'STANDARD_STOCK',
  notes: '',
})

const list = useServerPaginatedList({
  endpoint: () => $api.equipmentReplacements(),
  buildFilters: () => ({
    status: filters.status || undefined,
    stockSource: filters.stockSource || undefined,
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
const hasActiveFilters = computed(
  () => !!(filters.status || filters.stockSource || filters.reason)
)

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: summary.value.total ?? totalRecords.value,
    icon: 'ri-refresh-line',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'open',
    label: 'Open',
    value: summaryCount('REQUESTED', 'APPROVED', 'READY'),
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
  {
    key: 'cancelled',
    label: 'Cancelled / Rejected',
    value: summaryCount('CANCELLED', 'REJECTED'),
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
  filters.stockSource = null
  filters.reason = null
  reload()
}

async function submitCreate() {
  if (!createForm.originalEquipmentId.trim()) {
    toast.error({
      title: 'Validasi',
      message: 'Original equipment ID wajib',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  saving.value = true
  try {
    const res = await $fetch($api.equipmentReplacements(), {
      method: 'POST',
      credentials: 'include',
      body: { ...createForm },
    })
    toast.success({
      title: 'Berhasil',
      message: res?.data?.replacementNo || 'Created',
      color: 'green',
      position: 'bottomRight',
    })
    showCreate.value = false
    if (res?.data?.id) await router.push(`/inventory/equipment-replacement/${res.data.id}`)
    else await reload()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal create replacement'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    saving.value = false
  }
}

watch(filters, () => reload(), { deep: true })

onMounted(() => {
  initColumnFilters([
    'replacementNo',
    'originalEquipment.equipmentNo',
    'replacementEquipment.equipmentNo',
    'site.code',
    'reason',
    'stockSource',
    'status',
  ])
  fetchList()
})
</script>
