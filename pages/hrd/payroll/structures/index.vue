<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Salary structure: paket komponen per perusahaan. Klik structure untuk master-detail.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !tableRows.length" />
      <CollapsibleFilterCard title="Filter Structure" :has-active-filters="hasActiveFilters" @reset="resetFilters">
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2 v-model="cardFilters.status" :options="activeOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua status" />
          </FilterField>
          <FilterField>
            <label class="form-label">Komponen</label>
            <CustomSelect2 v-model="cardFilters.components" :options="componentPresenceOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Semua" />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>
      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari kode atau nama..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData('Salary Structures')"
        >
          <template #add>
            <button v-if="canManageStructure" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Tambah Structure
            </button>
          </template>
        </ListPageTableHeader>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            v-model:filters="filters"
            :data="displayRows"
            :rows="pageRows"
            :loading="store.loading"
            :totalRecords="displayRows.length"
            :lazy="false"
            filterDisplay="row"
            :globalFilterFields="['code', 'name', 'statusLabel']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column field="code" header="Code" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }">
                <a class="text-primary" style="cursor:pointer;text-decoration:underline" @click="navigateTo(`/payroll/structures/${data.id}`)">{{ data.code }}</a>
              </template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari kode" /></template>
            </Column>
            <Column field="name" header="Name" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari nama" /></template>
            </Column>
            <Column field="componentCount" header="Components" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false" />
            <Column field="effectiveFromDisplay" header="Effective" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column field="statusLabel" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.isActive === false ? 'CANCELLED' : 'APPROVED'" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Aktif', 'Nonaktif']" /></template>
            </Column>
          </MyDataTable>
        </div>
      </div>
      <Modal id="payrollStructureModal" v-model="showModal" title="Salary Structure" dialog-class="modal-xl">
        <form @submit.prevent="submit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.perusahaan_id" :options="perusahaanOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Code <span class="text-danger">*</span></label>
              <input v-model="form.code" class="form-control" required maxlength="64" />
            </div>
            <div class="col-12">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input v-model="form.name" class="form-control" required maxlength="150" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="form.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective To</label>
              <input v-model="form.effective_to" type="date" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label">Components</label>
              <PayrollStructureMembershipTable :rows="membership" />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>
<script setup lang="ts">
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import PayrollColumnFilter from '~/components/payroll/PayrollColumnFilter.vue'
import PayrollStructureMembershipTable from '~/components/payroll/PayrollStructureMembershipTable.vue'
import { catalogToMembership, membershipPayload, type StructureMembershipRow } from '~/composables/useCompensationComponents'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Salary Structures', middleware: ['auth', 'check-permission'], alias: '/payroll/structures' })

const store = usePayrollStore()
const { canManageStructure } = usePayrollPermissions()
const { formatDate } = usePayrollStatus()
const { perusahaanOptions, fetchPerusahaanOptions } = usePayrollLookups()
const showModal = ref(false)
const saving = ref(false)
const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  perusahaan_id: null as number | null,
  code: '',
  name: '',
  effective_from: today,
  effective_to: '',
})
const membership = ref<StructureMembershipRow[]>([])
const { pageRows, globalFilterValue, filters, myDataTableRef, exportData } = usePayrollClientTable([
  'code',
  'name',
  'effectiveFromDisplay',
  { field: 'statusLabel', mode: 'equals' },
])
const cardFilters = reactive({ status: null as string | null, components: null as string | null })
const activeOptions = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]
const componentPresenceOptions = [
  { label: 'Dengan komponen', value: 'with' },
  { label: 'Kosong', value: 'without' },
]
const rows = computed(() => store.structures)
const tableRows = computed(() =>
  store.structures.map((row) => {
    const isActive = row.isActive !== false
    const componentCount = (row.components as unknown[] | undefined)?.length || 0
    return {
      ...row,
      componentCount,
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      statusLabel: isActive ? 'Aktif' : 'Nonaktif',
      isActive,
    }
  })
)
const displayRows = computed(() =>
  tableRows.value.filter((row) => {
    if (cardFilters.status && row.statusLabel !== cardFilters.status) return false
    if (cardFilters.components === 'with' && !row.componentCount) return false
    if (cardFilters.components === 'without' && row.componentCount) return false
    return true
  })
)
const hasActiveFilters = computed(() => Boolean(cardFilters.status || cardFilters.components))
function resetFilters() {
  cardFilters.status = null
  cardFilters.components = null
}
const statItems = computed<ListPageStatItem[]>(() => {
  const list = rows.value
  return [
    { label: 'Total', value: list.length, icon: 'ri-organization-chart', iconBgClass: 'bg-label-primary' },
    { label: 'Aktif', value: list.filter((r) => r.isActive !== false).length, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
    { label: 'Dengan komponen', value: list.filter((r) => (r.components as unknown[] | undefined)?.length).length, icon: 'ri-list-check', iconBgClass: 'bg-label-info' },
    { label: 'Kosong', value: list.filter((r) => !(r.components as unknown[] | undefined)?.length).length, icon: 'ri-inbox-line', iconBgClass: 'bg-label-warning' },
  ]
})

async function openCreate() {
  await Promise.all([fetchPerusahaanOptions(), store.fetchMasters()])
  membership.value = catalogToMembership(store.components)
  showModal.value = true
}

async function submit() {
  saving.value = true
  const ok = await store.saveStructure({
    perusahaan_id: form.perusahaan_id,
    code: form.code,
    name: form.name,
    effective_from: form.effective_from,
    effective_to: form.effective_to || null,
    components: membershipPayload(membership.value),
  })
  saving.value = false
  if (ok) showModal.value = false
}

onMounted(() => store.fetchMasters())
</script>
