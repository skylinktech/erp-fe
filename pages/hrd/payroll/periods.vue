<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">Periode payroll. Satu periode boleh punya beberapa Payroll Run.</p>
      <ListPageStatsCards :items="statItems" :loading="store.loading && !tableRows.length" />

      <CollapsibleFilterCard
        title="Filter Periode"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="3">
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2
              v-model="cardFilters.status"
              :options="statusOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              searchable
              clearable
              placeholder="Semua status"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Tahun</label>
            <CustomSelect2
              v-model="cardFilters.year"
              :options="yearOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              searchable
              clearable
              placeholder="Semua tahun"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Attendance</label>
            <CustomSelect2
              v-model="cardFilters.attendance"
              :options="attendanceFilterOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              searchable
              clearable
              placeholder="Semua"
            />
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div class="card">
        <ListPageTableHeader
          :rows="pageRows"
          :rows-options="[10, 25, 50, 100]"
          :search="globalFilterValue"
          search-placeholder="Cari kode, nama, bulan..."
          :export-disabled="store.loading"
          :export-items="[{ value: 'csv', label: 'CSV' }]"
          @update:rows="pageRows = $event"
          @update:search="(v) => { globalFilterValue = v }"
          @export="exportData"
        >
          <template #add>
            <button v-if="canManagePeriod" type="button" class="btn btn-primary" @click="openCreate">
              <i class="ri-add-line me-1"></i>Tambah Periode
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
            :globalFilterFields="['code', 'name', 'periodLabel', 'paymentDateDisplay', 'attendanceLabel', 'status']"
            tableStyle="min-width: 100%"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
            responsiveLayout="scroll"
            paginatorPosition="bottom"
          >
            <Column field="code" header="Kode" :sortable="true" :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-if="filterModel"
                  v-model="filterModel.value"
                  type="text"
                  class="p-column-filter"
                  placeholder="Cari kode"
                  @input="filterCallback()"
                />
              </template>
            </Column>
            <Column field="name" header="Nama" :sortable="true" :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-if="filterModel"
                  v-model="filterModel.value"
                  type="text"
                  class="p-column-filter"
                  placeholder="Cari nama"
                  @input="filterCallback()"
                />
              </template>
            </Column>
            <Column field="periodLabel" header="Bulan" class="d-none d-md-table-cell" :sortable="true" :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-if="filterModel"
                  v-model="filterModel.value"
                  :options="monthFilterOptions"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column field="paymentDateDisplay" header="Payment Date" class="d-none d-lg-table-cell" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }">{{ data.paymentDateDisplay || '—' }}</template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-if="filterModel"
                  v-model="filterModel.value"
                  type="text"
                  class="p-column-filter"
                  placeholder="Cari tanggal"
                  @input="filterCallback()"
                />
              </template>
            </Column>
            <Column field="attendanceLabel" header="Attendance" class="d-none d-xl-table-cell" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }">{{ data.attendanceLabel || '—' }}</template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-if="filterModel"
                  v-model="filterModel.value"
                  :options="attendanceColumnOptions"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" :showFilterMenu="false">
              <template #body="{ data }"><PayrollRunStatusBadge :status="data.status" /></template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-if="filterModel"
                  v-model="filterModel.value"
                  :options="statusColumnOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Semua"
                  showClear
                  class="p-column-filter w-100"
                  @change="filterCallback()"
                />
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
      <Modal id="payrollPeriodModal" v-model="showModal" title="Payroll Period" dialog-class="modal-lg">
        <form @submit.prevent="submit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <CustomSelect2 v-model="form.perusahaan_id" :options="perusahaanOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
            </div>
            <div class="col-md-6">
              <label class="form-label">Attendance Period</label>
              <CustomSelect2 v-model="form.attendance_period_id" :options="attendanceOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable />
            </div>
            <div class="col-md-4">
              <label class="form-label">Code <span class="text-danger">*</span></label>
              <input v-model="form.code" class="form-control" required maxlength="40" />
            </div>
            <div class="col-md-8">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input v-model="form.name" class="form-control" required maxlength="150" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Bulan <span class="text-danger">*</span></label>
              <input v-model.number="form.period_month" type="number" min="1" max="12" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Tahun <span class="text-danger">*</span></label>
              <input v-model.number="form.period_year" type="number" min="2000" max="2100" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Payment Date</label>
              <input v-model="form.payment_date" type="date" class="form-control" />
            </div>
            <div class="col-12 form-check">
              <input id="last-period" v-model="form.is_last_period" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="last-period">Periode terakhir tahun (THR prorate)</label>
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
import { FilterMatchMode } from '@primevue/core/api'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { apiFetch } from '~/utils/apiFetch'
import { unwrapCollection } from '~/types/payroll'

definePageMeta({ title: 'Payroll Periods', middleware: ['auth', 'check-permission'], alias: '/payroll/periods' })

type PeriodRow = Record<string, any>

const store = usePayrollStore()
const { canManagePeriod } = usePayrollPermissions()
const { formatDate } = usePayrollStatus()
const { perusahaanOptions, fetchPerusahaanOptions } = usePayrollLookups()
const { $api } = useNuxtApp()
const myDataTableRef = ref<{ exportCSV: (options?: Record<string, unknown>) => void } | null>(null)
const showModal = ref(false)
const saving = ref(false)
const pageRows = ref(10)
const globalFilterValue = ref('')
const now = new Date()
const form = reactive({
  perusahaan_id: null as number | null,
  code: '',
  name: '',
  period_month: now.getMonth() + 1,
  period_year: now.getFullYear(),
  payment_date: '',
  attendance_period_id: null as number | null,
  is_last_period: false,
})
const attendanceOptions = ref<Array<{ label: string; value: number }>>([])
const cardFilters = reactive({
  status: null as string | null,
  year: null as number | null,
  attendance: null as string | null,
})

const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  code: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  periodLabel: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  paymentDateDisplay: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  attendanceLabel: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
})

const statusOptions = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
]
const attendanceFilterOptions = [
  { label: 'Dengan attendance', value: 'with' },
  { label: 'Tanpa attendance', value: 'without' },
]

const tableRows = computed<PeriodRow[]>(() => {
  return store.periods.map((p) => {
    const month = Number(p.periodMonth ?? p.period_month ?? 0)
    const year = Number(p.periodYear ?? p.period_year ?? 0)
    const attendanceId = p.attendancePeriodId ?? p.attendance_period_id ?? null
    const attendanceLabel = attendanceId
      ? attendanceOptions.value.find((o) => Number(o.value) === Number(attendanceId))?.label || String(attendanceId)
      : ''
    return {
      ...p,
      periodMonth: month,
      periodYear: year,
      periodLabel: month && year ? `${String(month).padStart(2, '0')}/${year}` : '—',
      paymentDateDisplay: formatDate(p.paymentDate || p.payment_date) || '',
      attendancePeriodId: attendanceId,
      attendanceLabel,
      status: String(p.status || '').toUpperCase(),
    }
  })
})

const displayRows = computed(() => {
  return tableRows.value.filter((row) => {
    if (cardFilters.status && row.status !== cardFilters.status) return false
    if (cardFilters.year && Number(row.periodYear) !== Number(cardFilters.year)) return false
    if (cardFilters.attendance === 'with' && !row.attendancePeriodId) return false
    if (cardFilters.attendance === 'without' && row.attendancePeriodId) return false
    return true
  })
})

const yearOptions = computed(() => {
  const years = new Set<number>()
  years.add(now.getFullYear())
  for (const row of tableRows.value) {
    if (row.periodYear) years.add(Number(row.periodYear))
  }
  return [...years].sort((a, b) => b - a).map((y) => ({ label: String(y), value: y }))
})

const monthFilterOptions = computed(() => {
  const labels = [...new Set(displayRows.value.map((r) => r.periodLabel).filter((v) => v && v !== '—'))]
  return labels.sort()
})

const attendanceColumnOptions = computed(() => {
  const labels = [...new Set(displayRows.value.map((r) => r.attendanceLabel).filter(Boolean))]
  return labels.sort()
})

const statusColumnOptions = computed(() => {
  const found = new Set(tableRows.value.map((r) => r.status).filter(Boolean))
  found.add('OPEN')
  found.add('CLOSED')
  return [...found].map((value) => ({
    label: value === 'OPEN' ? 'Open' : value === 'CLOSED' ? 'Closed' : value,
    value,
  }))
})

const hasActiveFilters = computed(() =>
  Boolean(cardFilters.status || cardFilters.year || cardFilters.attendance)
)

const statItems = computed<ListPageStatItem[]>(() => {
  const list = tableRows.value
  return [
    { label: 'Total', value: list.length, icon: 'ri-calendar-line', iconBgClass: 'bg-label-primary' },
    { label: 'Open', value: list.filter((p) => p.status === 'OPEN').length, icon: 'ri-lock-unlock-line', iconBgClass: 'bg-label-info' },
    { label: 'Dengan Attendance', value: list.filter((p) => p.attendancePeriodId).length, icon: 'ri-calendar-check-line', iconBgClass: 'bg-label-success' },
    { label: 'Last Period', value: list.filter((p) => p.isLastPeriod || p.is_last_period).length, icon: 'ri-flag-line', iconBgClass: 'bg-label-warning' },
  ]
})

const applySearch = useDebounceFn((value: string) => {
  filters.value.global.value = value || null
}, 300)
watch(globalFilterValue, (value) => applySearch(value))

function resetFilters() {
  cardFilters.status = null
  cardFilters.year = null
  cardFilters.attendance = null
}

function exportData() {
  myDataTableRef.value?.exportCSV({ title: 'Payroll Periods' })
}

async function loadAttendance() {
  try {
    const res = await apiFetch<{ data: unknown }>($api.kehadiranPeriods(), { credentials: 'include' })
    attendanceOptions.value = unwrapCollection<Record<string, unknown>>(res.data).rows.map((p) => ({
      value: Number(p.id),
      label: String(p.name || p.code || p.id),
    }))
  } catch {
    attendanceOptions.value = []
  }
}

async function openCreate() {
  form.code = `PR-${form.period_year}${String(form.period_month).padStart(2, '0')}`
  form.name = `Payroll ${form.period_month}/${form.period_year}`
  await Promise.all([fetchPerusahaanOptions(), loadAttendance()])
  showModal.value = true
}

async function submit() {
  if (!form.perusahaan_id) return
  saving.value = true
  const ok = await store.savePeriod({
    ...form,
    payment_date: form.payment_date || null,
    attendance_period_id: form.attendance_period_id || null,
  })
  saving.value = false
  if (ok) showModal.value = false
}

onMounted(async () => {
  await Promise.all([store.fetchPeriods(), loadAttendance()])
})
</script>
