<template>
<div>
<ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Inspection Queue"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="3">
          <FilterField>
            <label class="form-label">Equipment Status</label>
            <CustomSelect2
              v-model="filters.eqStatus"
              :options="eqStatusOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Inspection Result</label>
            <CustomSelect2
              v-model="filters.inspectionResult"
              :options="resultOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => o.value"
              searchable
              clearable
              placeholder="Semua hasil"
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
          search-placeholder="Cari equipment / serial..."
          :export-disabled="loading"
          :export-items="[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
          ]"
          @update:rows="onToolbarRows"
          @update:search="onSearchUpdate"
          @export="(f) => exportData(f, myDataTableRef, { title: 'Equipment Inspection Queue' })"
        >
          <template #toolbar-extra>
            <NuxtLink to="/inventory/equipment?tab=register" class="btn btn-outline-secondary">Equipment</NuxtLink>
            <NuxtLink to="/inventory/warranty?tab=assessments" class="btn btn-outline-secondary">
              Warranty
            </NuxtLink>
          </template>
        </ListPageTableHeader>

        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="columnFilters"
            :data="displayRows"
            :rows="Number(params.rows)"
            :loading="loading"
            :total-records="totalRecords"
            :first="params.first"
            :lazy="true"
            filter-display="row"
            data-key="equipmentId"
            @page="onPage"
            responsive-layout="scroll"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column header="#" :show-filter-menu="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="equipmentNo" header="Equipment" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/inventory/equipment/${data.equipmentId}`">
                  <code>{{ data.equipmentNo }}</code>
                </NuxtLink>
                <div class="small text-muted">{{ data.serialNumber }}</div>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="EQ" />
              </template>
            </Column>
            <Column field="product.sku" header="Product" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.product?.sku }} — {{ data.product?.name }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="SKU" />
              </template>
            </Column>
            <Column field="originSite.code" header="Origin Site" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <span v-if="data.originSite">{{ data.originSite.code }} — {{ data.originSite.name }}</span>
                <span v-else>—</span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Site" />
              </template>
            </Column>
            <Column field="incidentType" header="Incident" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <div>{{ data.withdrawalReason || '—' }}</div>
                <small v-if="data.incidentType" class="text-muted">{{ data.incidentType }}</small>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Incident" />
              </template>
            </Column>
            <Column field="warehouse.code" header="Warehouse" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">{{ data.warehouse?.code || data.warehouseId || '—' }}</template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="WH" />
              </template>
            </Column>
            <Column field="status" header="EQ Status" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <span class="badge bg-label-warning">{{ data.status }}</span>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter
                  v-bind="slotProps"
                  placeholder="Status"
                  :options="['RETURNED', 'UNDER_INSPECTION']"
                />
              </template>
            </Column>
            <Column field="inspectionStatus" header="Inspection" :sortable="true" :show-filter-menu="false">
              <template #body="{ data }">
                <div>{{ data.inspectionStatus || '—' }}</div>
                <small v-if="data.inspectionResult" class="text-muted">{{ data.inspectionResult }}</small>
              </template>
              <template #filter="slotProps">
                <ListColumnFilter v-bind="slotProps" placeholder="Status" />
              </template>
            </Column>
            <Column header="Actions" :exportable="false" :show-filter-menu="false" style="min-width:10rem">
              <template #body="{ data }">
                <button
                  v-if="!data.inspectionId && (userHasRole('superadmin') || userHasPermission('inspect_equipment'))"
                  class="btn btn-xs btn-outline-primary me-1"
                  @click="startInspection(data)"
                >
                  Start
                </button>
                <button
                  v-if="data.inspectionStatus === 'STARTED' && (userHasRole('superadmin') || userHasPermission('complete_equipment_inspection'))"
                  class="btn btn-xs btn-primary me-1"
                  @click="openComplete(data)"
                >
                  Complete
                </button>
                <button
                  v-if="data.inspectionResult === 'WARRANTY_ASSESSMENT_REQUIRED' && (userHasRole('superadmin') || userHasPermission('create_warranty_assessment'))"
                  class="btn btn-xs btn-outline-warning"
                  @click="openAssess(data)"
                >
                  Assess Warranty
                </button>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>

    <!-- Complete modal -->
    <div v-if="showComplete" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Complete Inspection — {{ completeRow?.equipmentNo }}</h5>
            <button type="button" class="btn-close" @click="showComplete = false" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Condition</label>
              <select v-model="completeForm.condition" class="form-select">
                <option value="GOOD">GOOD</option>
                <option value="MINOR_DAMAGE">MINOR_DAMAGE</option>
                <option value="MAJOR_DAMAGE">MAJOR_DAMAGE</option>
                <option value="TOTAL_DAMAGE">TOTAL_DAMAGE</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Disposition Recommendation</label>
              <select v-model="completeForm.inspectionResult" class="form-select">
                <option value="RETURN_TO_AVAILABLE">RETURN_TO_AVAILABLE</option>
                <option value="REPAIR_RECOMMENDED">REPAIR_RECOMMENDED</option>
                <option value="WARRANTY_ASSESSMENT_REQUIRED">WARRANTY_ASSESSMENT_REQUIRED</option>
                <option value="SCRAP_ASSESSMENT_REQUIRED">SCRAP_ASSESSMENT_REQUIRED</option>
                <option value="FURTHER_DIAGNOSIS">FURTHER_DIAGNOSIS</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Findings</label>
              <textarea v-model="completeForm.findings" class="form-control" rows="2" />
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="completeForm.notes" class="form-control" rows="2" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showComplete = false">Batal</button>
            <button class="btn btn-primary" :disabled="saving" @click="submitComplete">
              {{ saving ? 'Saving...' : 'Complete Inspection' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assess modal -->
    <div v-if="showAssess" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assess Warranty — {{ assessRow?.equipmentNo }}</h5>
            <button type="button" class="btn-close" @click="showAssess = false" />
          </div>
          <div class="modal-body">
            <div class="row g-2 mb-3 small">
              <div class="col-md-6"><strong>Serial:</strong> {{ assessRow?.serialNumber }}</div>
              <div class="col-md-6">
                <strong>Product:</strong> {{ assessRow?.product?.sku }} — {{ assessRow?.product?.name }}
              </div>
              <div class="col-md-6"><strong>Incident:</strong> {{ assessRow?.incidentType || '—' }}</div>
              <div class="col-md-6"><strong>Inspection:</strong> {{ assessRow?.inspectionResult }}</div>
            </div>
            <div v-if="assessComponents.length" class="mb-3">
              <label class="form-label">Faulty Component (optional)</label>
              <select v-model="assessForm.componentIdentityId" class="form-select">
                <option value="">— parent kit (carrying value tetap di equipment) —</option>
                <option v-for="c in assessComponents" :key="c.id" :value="c.id">
                  {{ c.componentType }} — {{ c.serialNumber }}
                </option>
              </select>
              <small class="text-muted">Warranty/RMA tetap terikat ke parent Equipment Kit.</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Policy</label>
              <select v-model="assessForm.policyId" class="form-select" @change="onPolicyChange">
                <option value="">— select —</option>
                <option v-for="p in policies" :key="p.id" :value="p.id">
                  {{ p.code }} — {{ p.name }} ({{ p.provider?.code }})
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Known Exclusion (optional)</label>
              <select v-model="assessForm.primaryExclusionId" class="form-select">
                <option value="">— none / use incident rules —</option>
                <option v-for="ex in exclusions" :key="ex.id" :value="ex.id">
                  {{ ex.code }} — {{ ex.name }}
                </option>
              </select>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label">Warranty Start (override if MANUAL)</label>
                <input v-model="assessForm.warrantyStartDate" type="date" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Warranty End (optional)</label>
                <input v-model="assessForm.warrantyEndDate" type="date" class="form-control" />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="assessForm.notes" class="form-control" rows="2" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showAssess = false">Batal</button>
            <button class="btn btn-warning" :disabled="saving || !assessForm.policyId" @click="submitAssess">
              {{ saving ? 'Assessing...' : 'Submit Assessment' }}
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

const warehouses = ref([])
const filters = reactive({ eqStatus: null, inspectionResult: null, warehouseId: null })
const eqStatusOptions = [
  { label: 'RETURNED', value: 'RETURNED' },
  { label: 'UNDER_INSPECTION', value: 'UNDER_INSPECTION' },
]
const resultOptions = [
  { label: 'RETURN_TO_AVAILABLE', value: 'RETURN_TO_AVAILABLE' },
  { label: 'REPAIR_RECOMMENDED', value: 'REPAIR_RECOMMENDED' },
  { label: 'WARRANTY_ASSESSMENT_REQUIRED', value: 'WARRANTY_ASSESSMENT_REQUIRED' },
  { label: 'SCRAP_ASSESSMENT_REQUIRED', value: 'SCRAP_ASSESSMENT_REQUIRED' },
  { label: 'FURTHER_DIAGNOSIS', value: 'FURTHER_DIAGNOSIS' },
]

const saving = ref(false)
const showComplete = ref(false)
const completeRow = ref(null)
const completeForm = reactive({
  condition: 'GOOD',
  inspectionResult: 'RETURN_TO_AVAILABLE',
  findings: '',
  notes: '',
})
const showAssess = ref(false)
const assessRow = ref(null)
const policies = ref([])
const exclusions = ref([])
const assessForm = reactive({
  policyId: '',
  primaryExclusionId: '',
  warrantyStartDate: '',
  warrantyEndDate: '',
  notes: '',
  componentIdentityId: '',
})
const assessComponents = ref([])

const list = useServerPaginatedList({
  endpoint: () => $api.equipmentInspections(),
  buildFilters: () => ({
    status: 'queue',
    warehouseId: filters.warehouseId || undefined,
    inspectionResult: filters.inspectionResult || undefined,
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

const displayRows = computed(() => {
  if (!filters.eqStatus) return rows.value
  return rows.value.filter((r) => r.status === filters.eqStatus)
})

const hasActiveFilters = computed(
  () => !!(filters.eqStatus || filters.inspectionResult || filters.warehouseId)
)

const statItems = computed(() => [
  {
    key: 'queue',
    label: 'Queue Total',
    value: summary.value.queue ?? summary.value.total ?? totalRecords.value,
    icon: 'ri-list-check-2',
    iconBgClass: 'bg-label-primary',
  },
  {
    key: 'returned',
    label: 'Returned',
    value: summaryCount('RETURNED'),
    icon: 'ri-arrow-go-back-line',
    iconBgClass: 'bg-label-secondary',
  },
  {
    key: 'insp',
    label: 'Under Inspection',
    value: summaryCount('UNDER_INSPECTION'),
    icon: 'ri-search-eye-line',
    iconBgClass: 'bg-label-warning',
  },
  {
    key: 'page',
    label: 'This Page',
    value: displayRows.value.length,
    icon: 'ri-file-list-line',
    iconBgClass: 'bg-label-info',
  },
])

function showError(e, fallback) {
  toast.error({
    title: 'Error',
    message: getApiErrorMessage(e, fallback),
    color: 'red',
    position: 'bottomRight',
  })
}

function resetFilters() {
  filters.eqStatus = null
  filters.inspectionResult = null
  filters.warehouseId = null
  reload()
}

async function startInspection(row) {
  try {
    await $fetch($api.equipmentInspectionStart(), {
      method: 'POST',
      credentials: 'include',
      body: {
        equipmentId: row.equipmentId,
        withdrawalId: row.withdrawalId || undefined,
        incidentId: row.incidentId || undefined,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Inspection started',
      color: 'green',
      position: 'bottomRight',
    })
    await reload()
  } catch (e) {
    showError(e, 'Gagal start inspection')
  }
}

function openComplete(row) {
  completeRow.value = row
  completeForm.condition = 'GOOD'
  completeForm.inspectionResult = 'RETURN_TO_AVAILABLE'
  completeForm.findings = ''
  completeForm.notes = ''
  showComplete.value = true
}

async function submitComplete() {
  if (!completeRow.value?.inspectionId) return
  saving.value = true
  try {
    await $fetch($api.equipmentInspectionComplete(completeRow.value.inspectionId), {
      method: 'POST',
      credentials: 'include',
      body: {
        condition: completeForm.condition,
        inspectionResult: completeForm.inspectionResult,
        findings: completeForm.findings || undefined,
        notes: completeForm.notes || undefined,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Disposition recorded — stock unchanged',
      color: 'green',
      position: 'bottomRight',
    })
    showComplete.value = false
    await reload()
  } catch (e) {
    showError(e, 'Gagal complete inspection')
  } finally {
    saving.value = false
  }
}

async function openAssess(row) {
  assessRow.value = row
  assessForm.policyId = ''
  assessForm.primaryExclusionId = ''
  assessForm.warrantyStartDate = ''
  assessForm.warrantyEndDate = ''
  assessForm.notes = ''
  assessForm.componentIdentityId = ''
  assessComponents.value = []
  exclusions.value = []
  try {
    if (row.equipmentId) {
      const eqRes = await $fetch($api.equipmentShow(row.equipmentId), { credentials: 'include' }).catch(() => null)
      const eq = eqRes?.data || eqRes
      assessComponents.value = eq?.componentIdentities || []
    }
    const res = await $fetch($api.warrantyPolicies(), { credentials: 'include' })
    policies.value = res?.data || []
    const starlink = policies.value.find((p) => p.code === 'STARLINK_LIMITED_WARRANTY')
    if (starlink) {
      assessForm.policyId = starlink.id
      await onPolicyChange()
    }
  } catch (e) {
    showError(e, 'Gagal load warranty policies')
  }
  showAssess.value = true
}

async function onPolicyChange() {
  exclusions.value = []
  assessForm.primaryExclusionId = ''
  if (!assessForm.policyId) return
  try {
    const res = await $fetch($api.warrantyExclusions(), {
      credentials: 'include',
      query: { policyId: assessForm.policyId },
    })
    exclusions.value = res?.data || []
  } catch {
    exclusions.value = []
  }
}

async function submitAssess() {
  if (!assessRow.value?.equipmentId || !assessForm.policyId) return
  saving.value = true
  try {
    const res = await $fetch($api.warrantyAssessments(), {
      method: 'POST',
      credentials: 'include',
      body: {
        equipmentId: assessRow.value.equipmentId,
        policyId: assessForm.policyId,
        inspectionId: assessRow.value.inspectionId || undefined,
        incidentId: assessRow.value.incidentId || undefined,
        withdrawalId: assessRow.value.withdrawalId || undefined,
        primaryExclusionId: assessForm.primaryExclusionId || undefined,
        applyIncidentRules: true,
        warrantyStartDate: assessForm.warrantyStartDate || undefined,
        warrantyEndDate: assessForm.warrantyEndDate || undefined,
        notes: assessForm.notes || undefined,
        componentIdentityId: assessForm.componentIdentityId || undefined,
      },
    })
    const a = res?.data
    toast.success({
      title: a?.coverageResult || 'Assessed',
      message: a?.assessmentNo
        ? `${a.assessmentNo}: ${a.coverageResult} — stock unchanged`
        : 'Assessment saved',
      color: 'green',
      position: 'bottomRight',
    })
    showAssess.value = false
    await reload()
  } catch (e) {
    showError(e, 'Gagal assess warranty')
  } finally {
    saving.value = false
  }
}

watch(
  () => [filters.inspectionResult, filters.warehouseId],
  () => reload(),
  { deep: true }
)

onMounted(async () => {
  initColumnFilters([
    'equipmentNo',
    'product.sku',
    'originSite.code',
    'incidentType',
    'warehouse.code',
    'status',
    'inspectionStatus',
  ])
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
  await fetchList()
})
</script>
