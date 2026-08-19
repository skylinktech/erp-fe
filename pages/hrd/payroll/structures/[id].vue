<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary" /></div>
      <div v-else-if="!row" class="alert alert-danger">Salary Structure tidak ditemukan. <NuxtLink to="/payroll/structures">Kembali</NuxtLink></div>
      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <NuxtLink to="/payroll/structures" class="btn btn-outline-secondary btn-sm mb-2">
              <i class="ri-arrow-left-line me-1"></i>Kembali
            </NuxtLink>
            <h4 class="fw-semibold mb-1">{{ row.name }}</h4>
            <PageBreadcrumb :current-label="String(row.code || row.name)" />
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span class="badge bg-label-secondary">{{ row.code }}</span>
              <PayrollRunStatusBadge :status="row.isActive === false ? 'CANCELLED' : 'APPROVED'" />
            </div>
          </div>
          <button v-if="canManageStructure" class="btn btn-primary" @click="showModal = true">
            <i class="ri-add-line me-1"></i>Tambah Component
          </button>
        </div>
        <ListPageStatsCards :items="statItems" />
        <div class="card">
          <div class="card-header"><h5 class="mb-0">Components</h5></div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Component</th>
                  <th class="d-none d-md-table-cell">Calculation</th>
                  <th class="text-end">Default Amount</th>
                  <th>Required</th>
                  <th class="d-none d-lg-table-cell">Override</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in components" :key="c.id">
                  <td>{{ c.displayOrder ?? c.display_order ?? '—' }}</td>
                  <td>{{ c.component?.code || c.salaryComponentId || c.salary_component_id }} — {{ c.component?.name || '' }}</td>
                  <td class="d-none d-md-table-cell">{{ c.calculationMethodOverride || c.component?.calculationMethod || '—' }}</td>
                  <td class="text-end">{{ money(c.defaultAmount ?? c.default_amount) }}</td>
                  <td>{{ (c.isRequired ?? c.is_required) ? 'Ya' : 'Tidak' }}</td>
                  <td class="d-none d-lg-table-cell">{{ (c.allowEmployeeOverride ?? c.allow_employee_override) !== false ? 'Ya' : 'Tidak' }}</td>
                </tr>
                <tr v-if="!components.length"><td colspan="6" class="text-muted">Belum ada komponen. Tambahkan dari tombol di header.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <Modal id="payrollStructureCompModal" v-model="showModal" title="Tambah Component ke Structure">
          <form @submit.prevent="attach">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Component <span class="text-danger">*</span></label>
                <CustomSelect2 v-model="form.salary_component_id" :options="componentOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable />
              </div>
              <div v-if="selectedIsManual" class="col-md-6">
                <label class="form-label">Default Amount</label>
                <input v-model.number="form.default_amount" type="number" min="0" class="form-control" placeholder="Opsional" />
              </div>
              <div v-else class="col-md-6">
                <label class="form-label">Default Amount</label>
                <p class="mb-0 text-muted small pt-2">Automatic</p>
              </div>
              <div class="col-md-6">
                <label class="form-label">Display Order</label>
                <input v-model.number="form.display_order" type="number" min="0" class="form-control" />
              </div>
              <div class="col-12 form-check">
                <input id="req" v-model="form.is_required" type="checkbox" class="form-check-input">
                <label class="form-check-label" for="req">Required</label>
              </div>
              <div class="col-12 form-check">
                <input id="ovr" v-model="form.allow_employee_override" type="checkbox" class="form-check-input">
                <label class="form-check-label" for="ovr">Allow employee override</label>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">Simpan</button>
            </div>
          </form>
        </Modal>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Modal from '~/components/modal/Modal.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { isManualAmountMethod } from '~/composables/useCompensationComponents'

definePageMeta({
  title: 'Salary Structure Detail',
  middleware: ['auth', 'check-permission'],
  alias: '/payroll/structures/:id',
  hidePageHeading: true,
})

const route = useRoute()
const store = usePayrollStore()
const { canManageStructure } = usePayrollPermissions()
const { money } = usePayrollStatus()
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const row = ref<Record<string, any> | null>(null)
const form = reactive({
  salary_component_id: null as string | null,
  default_amount: null as number | null,
  display_order: 10,
  is_required: false,
  allow_employee_override: true,
})
const components = computed(() => (row.value?.components as Record<string, any>[]) || [])
const attachedIds = computed(() => new Set(components.value.map((c) => String(c.salaryComponentId ?? c.salary_component_id))))
const componentOptions = computed(() =>
  store.components
    .filter((c) => !attachedIds.value.has(String(c.id)))
    .map((c) => ({ label: `${c.code} — ${c.name}`, value: c.id }))
)
const selectedCatalog = computed(() => store.components.find((c) => String(c.id) === String(form.salary_component_id)))
const selectedIsManual = computed(() =>
  isManualAmountMethod(String(selectedCatalog.value?.calculationMethod || selectedCatalog.value?.calculation_method || ''))
)
const statItems = computed<ListPageStatItem[]>(() => [
  { label: 'Components', value: components.value.length, icon: 'ri-list-check-2', iconBgClass: 'bg-label-primary' },
  { label: 'Required', value: components.value.filter((c) => c.isRequired ?? c.is_required).length, icon: 'ri-asterisk', iconBgClass: 'bg-label-warning' },
])

async function load() {
  loading.value = true
  row.value = await store.fetchStructure(String(route.params.id))
  loading.value = false
}

async function attach() {
  if (!form.salary_component_id) return
  saving.value = true
  const data = await store.attachStructureComponent(String(route.params.id), {
    salary_component_id: form.salary_component_id,
    default_amount: selectedIsManual.value ? form.default_amount : null,
    display_order: form.display_order,
    is_required: form.is_required,
    allow_employee_override: form.allow_employee_override,
  })
  saving.value = false
  if (data) {
    row.value = data
    showModal.value = false
  }
}

onMounted(async () => {
  await store.fetchMasters()
  await load()
})
</script>
