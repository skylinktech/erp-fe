<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Master data payroll. Mapping akun jurnal dikelola di Finance, bukan di halaman ini.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !store.components.length" />
      <ul class="nav nav-tabs mb-4 flex-nowrap overflow-auto">
        <li v-for="t in tabs" :key="t.id" class="nav-item">
          <button type="button" class="nav-link text-nowrap" :class="{ active: tab === t.id }" @click="tab = t.id">{{ t.label }}</button>
        </li>
      </ul>

      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          :search-placeholder="searchPlaceholder"
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData(exportTitle)"
        >
          <template #add>
            <button v-if="canCreateCurrent" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>{{ createLabel }}
            </button>
          </template>
        </ListPageTableHeader>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            :key="tab"
            ref="myDataTableRef"
            v-model:filters="filters"
            :data="displayRows"
            :rows="pageRows"
            :loading="store.loading"
            :totalRecords="displayRows.length"
            :lazy="false"
            filterDisplay="row"
            :globalFilterFields="currentGlobalFields"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column v-if="tab === 'components'" field="code" header="Code" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari kode" /></template>
            </Column>
            <Column v-if="tab === 'components'" field="name" header="Name" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari nama" /></template>
            </Column>
            <Column v-if="tab === 'components'" field="componentType" header="Type" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'componentType')" /></template>
            </Column>
            <Column v-if="tab === 'components'" field="calculationMethod" header="Method" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'calculationMethod')" /></template>
            </Column>
            <Column v-if="tab === 'components'" field="effectiveFromDisplay" header="Effective" class="d-none d-xl-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column v-if="tab === 'components'" field="statusLabel" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.isActive === false ? 'CANCELLED' : 'APPROVED'" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Aktif', 'Nonaktif']" /></template>
            </Column>

            <Column v-if="tab === 'structures'" field="code" header="Code" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }">
                <NuxtLink :to="`/payroll/structures/${data.id}`" class="text-primary">{{ data.code }}</NuxtLink>
              </template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari kode" /></template>
            </Column>
            <Column v-if="tab === 'structures'" field="name" header="Name" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari nama" /></template>
            </Column>
            <Column v-if="tab === 'structures'" field="effectiveFromDisplay" header="Effective" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column v-if="tab === 'structures'" field="statusLabel" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.isActive === false ? 'CANCELLED' : 'APPROVED'" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Aktif', 'Nonaktif']" /></template>
            </Column>

            <Column v-if="tab === 'profiles'" field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column v-if="tab === 'profiles'" field="taxMethod" header="Tax Method" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['GROSS', 'NET', 'GROSS_UP']" /></template>
            </Column>
            <Column v-if="tab === 'profiles'" field="paymentMethod" header="Payment" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="uniqueValues(displayRows, 'paymentMethod')" /></template>
            </Column>
            <Column v-if="tab === 'profiles'" field="eligibleLabel" header="Eligible" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Ya', 'Tidak']" /></template>
            </Column>

            <Column v-if="tab === 'compensation'" field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column v-if="tab === 'compensation'" field="structureLabel" header="Structure" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari structure" /></template>
            </Column>
            <Column v-if="tab === 'compensation'" field="effectiveFromDisplay" header="Effective From" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column v-if="tab === 'compensation'" field="effectiveToDisplay" header="Effective To" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column v-if="tab === 'compensation'" field="fixedTotalDisplay" header="Fixed Total" class="d-none d-xl-table-cell text-end" :sortable="true" :showFilterMenu="false" />
            <Column v-if="tab === 'compensation'" field="status" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['DRAFT', 'ACTIVE', 'INACTIVE']" /></template>
            </Column>
            <Column header="Action" class="text-end" :showFilterMenu="false">
              <template #body="{ data }">
                <PayrollSalaryComponentRowActions
                  v-if="tab === 'components'"
                  :row="data"
                  @edit="openComponentEdit"
                  @delete="confirmComponentDelete"
                />
                <PayrollCompensationRowActions
                  v-else-if="tab === 'compensation'"
                  :row="data"
                  return-to="config"
                />
              </template>
            </Column>

            <Column v-if="tab === 'tax'" field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column v-if="tab === 'tax'" field="ptkpStatus" header="PTKP" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari PTKP" /></template>
            </Column>
            <Column v-if="tab === 'tax'" field="taxMethod" header="Method" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['GROSS', 'NET', 'GROSS_UP']" /></template>
            </Column>
            <Column v-if="tab === 'tax'" field="effectiveFromDisplay" header="Effective From" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column v-if="tab === 'tax'" field="effectiveToDisplay" header="Effective To" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>

            <Column v-if="tab === 'bpjs'" field="pegawaiLabel" header="Pegawai" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari pegawai" /></template>
            </Column>
            <Column v-if="tab === 'bpjs'" field="healthLabel" header="Health" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Aktif', 'Tidak']" /></template>
            </Column>
            <Column v-if="tab === 'bpjs'" field="employmentLabel" header="Employment" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Semua" :options="['Aktif', 'Tidak']" /></template>
            </Column>
            <Column v-if="tab === 'bpjs'" field="effectiveFromDisplay" header="Effective From" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
            <Column v-if="tab === 'bpjs'" field="effectiveToDisplay" header="Effective To" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="slotProps"><PayrollColumnFilter v-bind="slotProps" placeholder="Cari tanggal" /></template>
            </Column>
          </MyDataTable>
        </div>
      </div>

      <Modal id="payrollConfigModal" v-model="showModal" :title="createLabel" :dialog-class="tab === 'structures' ? 'modal-xl' : 'modal-lg'">
        <form @submit.prevent="submitCreate">
          <div v-if="tab === 'structures'" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="structureForm.perusahaan_id" :options="perusahaanOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Code <span class="text-danger">*</span></label>
              <input v-model="structureForm.code" class="form-control" required maxlength="64" />
            </div>
            <div class="col-12">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input v-model="structureForm.name" class="form-control" required maxlength="150" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="structureForm.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective To</label>
              <input v-model="structureForm.effective_to" type="date" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label">Components</label>
              <PayrollStructureMembershipTable :rows="structureMembership" />
            </div>
          </div>

          <div v-else-if="tab === 'profiles'" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="profileForm.pegawai_id" :options="pegawaiOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="profileForm.perusahaan_id" :options="perusahaanOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Tax Method</label>
              <select v-model="profileForm.tax_method" class="form-select">
                <option value="GROSS">GROSS</option>
                <option value="NET">NET</option>
                <option value="GROSS_UP">GROSS_UP</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Payment Method</label>
              <select v-model="profileForm.payment_method" class="form-select">
                <option value="PAYROLL_BANK">PAYROLL_BANK</option>
                <option value="MANUAL">MANUAL</option>
                <option value="EXTERNAL">EXTERNAL</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="profileForm.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6 form-check mt-4">
              <input id="eligible" v-model="profileForm.payroll_eligible" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="eligible">Payroll eligible</label>
            </div>
          </div>

          <div v-else-if="tab === 'tax'" class="row g-3">
            <p class="text-muted mb-0">Employee tax profile versi efektif. Rate PPh21 tidak diinput di sini.</p>
            <div class="col-md-6">
              <label class="form-label">Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="taxForm.pegawai_id" :options="pegawaiOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">PTKP <span class="text-danger">*</span></label>
              <input v-model="taxForm.ptkp_status" class="form-control" required placeholder="TK/0" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Tax Method</label>
              <select v-model="taxForm.tax_method" class="form-select">
                <option value="GROSS">GROSS</option>
                <option value="NET">NET</option>
                <option value="GROSS_UP">GROSS_UP</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="taxForm.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective To</label>
              <input v-model="taxForm.effective_to" type="date" class="form-control" />
            </div>
          </div>

          <div v-else-if="tab === 'bpjs'" class="row g-3">
            <p class="text-muted mb-0">Employee BPJS profile versi efektif. Rate iuran tidak diinput di sini.</p>
            <div class="col-md-6">
              <label class="form-label">Pegawai <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="bpjsForm.pegawai_id" :options="pegawaiOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective From <span class="text-danger">*</span></label>
              <input v-model="bpjsForm.effective_from" type="date" class="form-control" required />
            </div>
            <div class="col-md-6 form-check mt-4">
              <input id="health" v-model="bpjsForm.health_active" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="health">BPJS Kesehatan aktif</label>
            </div>
            <div class="col-md-6 form-check mt-4">
              <input id="emp" v-model="bpjsForm.employment_active" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="emp">BPJS Ketenagakerjaan aktif</label>
            </div>
            <div class="col-md-6">
              <label class="form-label">Effective To</label>
              <input v-model="bpjsForm.effective_to" type="date" class="form-control" />
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">Simpan</button>
          </div>
        </form>
      </Modal>

      <PayrollSalaryComponentFormModal v-model="showComponentModal" :edit-row="componentEditRow" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Swal from 'sweetalert2'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import PayrollColumnFilter from '~/components/payroll/PayrollColumnFilter.vue'
import PayrollStructureMembershipTable from '~/components/payroll/PayrollStructureMembershipTable.vue'
import PayrollSalaryComponentFormModal from '~/components/payroll/PayrollSalaryComponentFormModal.vue'
import PayrollSalaryComponentRowActions from '~/components/payroll/PayrollSalaryComponentRowActions.vue'
import PayrollCompensationRowActions from '~/components/payroll/PayrollCompensationRowActions.vue'
import { catalogToMembership, membershipPayload, type StructureMembershipRow } from '~/composables/useCompensationComponents'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

definePageMeta({ title: 'Payroll Configuration', middleware: ['auth', 'check-permission'], alias: '/payroll/configuration' })

const store = usePayrollStore()
const route = useRoute()
const { formatDate, money } = usePayrollStatus()
const {
  canManageComponent,
  canManageCompensation,
  canManageTax,
  canManageBpjs,
  canManageProfile,
  canManageStructure,
} = usePayrollPermissions()
const { pegawaiOptions, perusahaanOptions, fetchPegawaiOptions, fetchPerusahaanOptions } = usePayrollLookups()

const tabs = [
  { id: 'components', label: 'Salary Components' },
  { id: 'structures', label: 'Salary Structures' },
  { id: 'profiles', label: 'Payroll Profiles' },
  { id: 'compensation', label: 'Compensation' },
  { id: 'tax', label: 'Tax' },
  { id: 'bpjs', label: 'BPJS' },
]
const tab = ref(String(route.query.tab || 'components'))
const showModal = ref(false)
const showComponentModal = ref(false)
const componentEditRow = ref<Record<string, unknown> | null>(null)
const saving = ref(false)
const today = new Date().toISOString().slice(0, 10)
const { pageRows, globalFilterValue, filters, myDataTableRef, exportData, uniqueValues } = usePayrollClientTable([
  'code',
  'name',
  { field: 'componentType', mode: 'equals' },
  { field: 'calculationMethod', mode: 'equals' },
  'effectiveFromDisplay',
  'effectiveToDisplay',
  { field: 'statusLabel', mode: 'equals' },
  'pegawaiLabel',
  { field: 'taxMethod', mode: 'equals' },
  { field: 'paymentMethod', mode: 'equals' },
  { field: 'eligibleLabel', mode: 'equals' },
  'structureLabel',
  { field: 'status', mode: 'equals' },
  'ptkpStatus',
  { field: 'healthLabel', mode: 'equals' },
  { field: 'employmentLabel', mode: 'equals' },
])

const statItems = computed<ListPageStatItem[]>(() => [
  { label: 'Components', value: store.components.length, icon: 'ri-price-tag-3-line', iconBgClass: 'bg-label-primary' },
  { label: 'Structures', value: store.structures.length, icon: 'ri-organization-chart', iconBgClass: 'bg-label-info' },
  { label: 'Profiles', value: store.profiles.length, icon: 'ri-user-settings-line', iconBgClass: 'bg-label-secondary' },
  { label: 'Compensation', value: store.compensations.length, icon: 'ri-money-cny-circle-line', iconBgClass: 'bg-label-success' },
])

const structureForm = reactive({
  perusahaan_id: null as number | null,
  code: '',
  name: '',
  effective_from: today,
  effective_to: '',
})
const structureMembership = ref<StructureMembershipRow[]>([])
const profileForm = reactive({
  pegawai_id: null as number | null,
  perusahaan_id: null as number | null,
  tax_method: 'GROSS',
  payment_method: 'PAYROLL_BANK',
  payroll_eligible: true,
  effective_from: today,
})
const taxForm = reactive({
  pegawai_id: null as number | null,
  ptkp_status: 'TK/0',
  tax_method: 'GROSS',
  effective_from: today,
  effective_to: '',
})
const bpjsForm = reactive({
  pegawai_id: null as number | null,
  health_active: true,
  employment_active: true,
  effective_from: today,
  effective_to: '',
})

const canCreateCurrent = computed(() => {
  if (tab.value === 'components') return canManageComponent.value
  if (tab.value === 'structures') return canManageStructure.value
  if (tab.value === 'profiles') return canManageProfile.value
  if (tab.value === 'compensation') return canManageCompensation.value
  if (tab.value === 'tax') return canManageTax.value
  if (tab.value === 'bpjs') return canManageBpjs.value
  return false
})
const createLabel = computed(() => {
  if (tab.value === 'components') return 'Tambah Component'
  if (tab.value === 'structures') return 'Tambah Structure'
  if (tab.value === 'profiles') return 'Tambah Profile'
  if (tab.value === 'compensation') return 'Tambah Compensation'
  if (tab.value === 'tax') return 'Tambah Tax Profile'
  if (tab.value === 'bpjs') return 'Tambah BPJS Profile'
  return 'Tambah'
})
const searchPlaceholder = computed(() => {
  if (tab.value === 'components' || tab.value === 'structures') return 'Cari kode atau nama...'
  return 'Cari pegawai...'
})
const exportTitle = computed(() => tabs.find((t) => t.id === tab.value)?.label || 'Payroll Configuration')
const currentGlobalFields = computed(() => {
  if (tab.value === 'components') return ['code', 'name', 'componentType', 'calculationMethod', 'statusLabel']
  if (tab.value === 'structures') return ['code', 'name', 'statusLabel']
  if (tab.value === 'profiles') return ['pegawaiLabel', 'taxMethod', 'paymentMethod', 'eligibleLabel']
  if (tab.value === 'compensation') return ['pegawaiLabel', 'structureLabel', 'status']
  if (tab.value === 'tax') return ['pegawaiLabel', 'ptkpStatus', 'taxMethod']
  return ['pegawaiLabel', 'healthLabel', 'employmentLabel']
})

function pegawaiLabel(id: unknown) {
  return pegawaiOptions.value.find((o) => Number(o.value) === Number(id))?.label || String(id || '—')
}

const displayRows = computed(() => {
  if (tab.value === 'components') {
    return store.components.map((row) => ({
      ...row,
      componentType: String(row.componentType || row.component_type || ''),
      calculationMethod: String(row.calculationMethod || row.calculation_method || ''),
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      statusLabel: row.isActive === false ? 'Nonaktif' : 'Aktif',
    }))
  }
  if (tab.value === 'structures') {
    return store.structures.map((row) => ({
      ...row,
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      statusLabel: row.isActive === false ? 'Nonaktif' : 'Aktif',
    }))
  }
  if (tab.value === 'profiles') {
    return store.profiles.map((row) => ({
      ...row,
      pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
      taxMethod: String(row.taxMethod || row.tax_method || ''),
      paymentMethod: String(row.paymentMethod || row.payment_method || ''),
      eligibleLabel: row.payrollEligible ?? row.payroll_eligible ? 'Ya' : 'Tidak',
    }))
  }
  if (tab.value === 'compensation') {
    return store.compensations.map((row) => ({
      ...row,
      pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
      structureLabel: String(row.structureName || row.structureCode || row.structure_name || row.structure_code || '—'),
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      effectiveToDisplay: formatDate(row.effectiveTo || row.effective_to) || '',
      fixedTotalDisplay: money(row.fixedTotal ?? row.fixed_total ?? 0),
      status: String(row.status || ''),
    }))
  }
  if (tab.value === 'tax') {
    return store.taxProfiles.map((row) => ({
      ...row,
      pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
      ptkpStatus: String(row.ptkpStatus || row.ptkp_status || ''),
      taxMethod: String(row.taxMethod || row.tax_method || ''),
      effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
      effectiveToDisplay: formatDate(row.effectiveTo || row.effective_to) || '',
    }))
  }
  return store.bpjsProfiles.map((row) => ({
    ...row,
    pegawaiLabel: pegawaiLabel(row.pegawaiId || row.pegawai_id),
    healthLabel: (row.healthActive ?? row.health_active) ? 'Aktif' : 'Tidak',
    employmentLabel: (row.employmentActive ?? row.employment_active) ? 'Aktif' : 'Tidak',
    effectiveFromDisplay: formatDate(row.effectiveFrom || row.effective_from) || '',
    effectiveToDisplay: formatDate(row.effectiveTo || row.effective_to) || '',
  }))
})

async function openCreate() {
  if (tab.value === 'compensation') {
    await navigateTo('/payroll/compensations/create?return=config')
    return
  }
  if (tab.value === 'components') {
    componentEditRow.value = null
    showComponentModal.value = true
    return
  }
  await Promise.all([fetchPegawaiOptions(), fetchPerusahaanOptions()])
  if (tab.value === 'structures') {
    structureMembership.value = catalogToMembership(store.components)
  }
  showModal.value = true
}

function openComponentEdit(row: Record<string, unknown>) {
  componentEditRow.value = row
  showComponentModal.value = true
}

async function confirmComponentDelete(row: Record<string, unknown>) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Salary Component?',
    html: `Komponen <strong>${row.code}</strong> — ${row.name} akan dihapus.<br><small class="text-muted">Jika masih dipakai di structure, komponen akan dinonaktifkan saja.</small>`,
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
    customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
    buttonsStyling: false,
  })
  if (!result.isConfirmed) return
  await store.deleteComponent(String(row.id))
}

async function submitCreate() {
  saving.value = true
  let ok = false
  if (tab.value === 'structures') {
    ok = await store.saveStructure({
      perusahaan_id: structureForm.perusahaan_id,
      code: structureForm.code,
      name: structureForm.name,
      effective_from: structureForm.effective_from,
      effective_to: structureForm.effective_to || null,
      components: membershipPayload(structureMembership.value),
    })
  }
  if (tab.value === 'profiles') ok = await store.saveProfile({ ...profileForm })
  if (tab.value === 'tax') ok = await store.saveTaxProfile({ ...taxForm, effective_to: taxForm.effective_to || null })
  if (tab.value === 'bpjs') ok = await store.saveBpjsProfile({ ...bpjsForm, effective_to: bpjsForm.effective_to || null })
  saving.value = false
  if (ok) showModal.value = false
}

watch(tab, (v) => {
  globalFilterValue.value = ''
  filters.value.global.value = null
  void navigateTo({ query: { tab: v } }, { replace: true })
})
onMounted(async () => {
  await Promise.all([store.fetchMasters(), fetchPegawaiOptions()])
})
</script>
