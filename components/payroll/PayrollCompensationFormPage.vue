<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <NuxtLink :to="backTo" class="btn btn-outline-secondary btn-sm mb-2">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
          <h4 class="mb-1 fw-semibold">{{ pageTitle }}</h4>
          <PageBreadcrumb :current-label="pageTitle" />
        </div>
        <PayrollRunStatusBadge v-if="status" :status="status" />
      </div>

      <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary" /></div>
      <div v-else-if="immutable" class="card">
        <div class="card-body">
          <p class="mb-3">Compensation ini sudah {{ status }} dan tidak diedit di tempat agar histori payroll tetap utuh.</p>
          <NuxtLink :to="`${createVersionTo}`" class="btn btn-primary">
            Buat Versi Baru
          </NuxtLink>
        </div>
      </div>
      <form v-else @submit.prevent="submit">
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div class="card mb-4">
          <div class="card-header"><h5 class="mb-0">Informasi Compensation</h5></div>
          <div class="card-body">
            <div class="row g-3 py-3">
              <div class="col-md-6">
                <label class="form-label">Pegawai <span class="text-danger">*</span></label>
                <CustomSelect2
                  v-model="form.pegawai_id"
                  :options="pegawaiOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  :disabled="Boolean(compensationId)"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Salary Structure <span class="text-danger">*</span></label>
                <CustomSelect2
                  v-model="form.salary_structure_id"
                  :options="structureOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Perusahaan</label>
                <p class="mb-0">{{ perusahaanLabel }}</p>
                <small class="text-muted">Mengikuti Salary Structure yang dipilih.</small>
              </div>
              <div class="col-md-3">
                <label class="form-label">Effective From <span class="text-danger">*</span></label>
                <input v-model="form.effective_from" type="date" class="form-control" required>
              </div>
              <div class="col-md-3">
                <label class="form-label">Effective To</label>
                <input v-model="form.effective_to" type="date" class="form-control">
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header"><h5 class="mb-0">Salary Components</h5></div>
          <div class="card-body py-3">
            <div v-if="loadingComponents" class="text-muted small py-2">Memuat komponen structure…</div>
            <PayrollCompensationComponentTable v-else :rows="rows" />
          </div>
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-md-end gap-2">
          <NuxtLink :to="backTo" class="btn btn-outline-secondary">Batal</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="saving || !form.salary_structure_id">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import Swal from 'sweetalert2'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import PayrollCompensationComponentTable from '~/components/payroll/PayrollCompensationComponentTable.vue'
import {
  buildCompensationRows,
  compensationPayloadComponents,
  isManualAmountMethod,
  reconcileCompensationRows,
  type CompensationComponentRow,
} from '~/composables/useCompensationComponents'

const props = defineProps<{
  compensationId?: string | null
  cloneFromId?: string | null
}>()

const store = usePayrollStore()
const route = useRoute()
const { pegawaiOptions, perusahaanOptions, fetchPegawaiOptions, fetchPerusahaanOptions } = usePayrollLookups()
const today = new Date().toISOString().slice(0, 10)
const backTo = computed(() =>
  String(route.query.return || '') === 'config' ? '/payroll/configuration?tab=compensation' : '/payroll/compensations'
)
const createVersionTo = computed(() => {
  const q = String(route.query.return || '') === 'config' ? '&return=config' : ''
  return `/payroll/compensations/create?from=${props.compensationId}${q}`
})
const loading = ref(true)
const loadingComponents = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const status = ref('')
const rows = ref<CompensationComponentRow[]>([])
const structurePerusahaanId = ref<number | null>(null)
const form = reactive({
  pegawai_id: null as number | null,
  salary_structure_id: null as string | null,
  effective_from: today,
  effective_to: '',
})

const pageTitle = computed(() => (props.compensationId ? 'Edit Compensation' : 'Tambah Compensation'))
const immutable = computed(() => Boolean(props.compensationId && status.value && status.value !== 'DRAFT'))
const structureOptions = computed(() =>
  store.structures.map((s) => ({ label: `${s.code} — ${s.name}`, value: s.id }))
)
const selectedStructure = computed(() =>
  store.structures.find((s) => String(s.id) === String(form.salary_structure_id))
)
const perusahaanLabel = computed(() => {
  const id = structurePerusahaanId.value ?? selectedStructure.value?.perusahaanId ?? selectedStructure.value?.perusahaan_id
  if (!id) return 'Mengikuti structure'
  return perusahaanOptions.value.find((o) => Number(o.value) === Number(id))?.label || `Perusahaan #${id}`
})

const lastStructureId = ref<string | null>(null)
const hydrating = ref(false)

async function loadStructureRows(structureId: string, existingLines: Record<string, any>[] = [], previous?: CompensationComponentRow[]) {
  loadingComponents.value = true
  const data = await store.fetchStructureComponents(structureId)
  loadingComponents.value = false
  const members = ((data?.components as Record<string, any>[]) || [])
  structurePerusahaanId.value = Number(data?.perusahaanId ?? data?.perusahaan_id ?? selectedStructure.value?.perusahaanId ?? 0) || null
  rows.value = previous?.length ? reconcileCompensationRows(members, previous) : buildCompensationRows(members, existingLines)
  lastStructureId.value = structureId
}

watch(
  () => form.salary_structure_id,
  async (next, prev) => {
    if (hydrating.value || next === lastStructureId.value) return
    if (!next) {
      rows.value = []
      structurePerusahaanId.value = null
      lastStructureId.value = null
      return
    }
    const previous = rows.value
    if (prev && previous.some((row) => row.selected)) {
      const confirm = await Swal.fire({
        icon: 'warning',
        title: 'Ganti Salary Structure?',
        text: 'Mengganti Salary Structure akan memuat ulang daftar komponen dan dapat menghapus nilai komponen yang tidak tersedia pada structure baru.',
        showCancelButton: true,
        confirmButtonText: 'Lanjutkan',
        cancelButtonText: 'Batal',
      })
      if (!confirm.isConfirmed) {
        form.salary_structure_id = prev
        return
      }
    }
    await loadStructureRows(next, [], previous)
  }
)

function validate(): string | null {
  if (!form.pegawai_id) return 'Pegawai wajib dipilih.'
  if (!form.salary_structure_id) return 'Salary Structure wajib dipilih.'
  if (!form.effective_from) return 'Effective From wajib diisi.'
  for (const row of rows.value) {
    if (row.required && !row.selected) return `Komponen ${row.name} wajib digunakan oleh Structure ini.`
    if (row.selected && isManualAmountMethod(row.calculationMethod) && (row.amount == null || Number.isNaN(Number(row.amount)))) {
      return `${row.name} wajib diisi.`
    }
  }
  return null
}

async function submit() {
  errorMessage.value = validate() || ''
  if (errorMessage.value) return
  saving.value = true
  const body = {
    pegawai_id: form.pegawai_id,
    perusahaan_id: structurePerusahaanId.value,
    salary_structure_id: form.salary_structure_id,
    effective_from: form.effective_from,
    effective_to: form.effective_to || null,
    components: compensationPayloadComponents(rows.value),
  }
  const ok = props.compensationId
    ? await store.updateCompensation(props.compensationId, body)
    : await store.saveCompensation(body)
  saving.value = false
  if (ok) await navigateTo(backTo.value)
}

onMounted(async () => {
  hydrating.value = true
  await Promise.all([store.fetchMasters(), fetchPegawaiOptions(), fetchPerusahaanOptions()])
  const sourceId = props.compensationId || props.cloneFromId
  if (sourceId) {
    const data = await store.fetchCompensation(sourceId)
    if (data) {
      form.pegawai_id = Number(data.pegawaiId ?? data.pegawai_id)
      form.salary_structure_id = data.salaryStructureId ?? data.salary_structure_id ? String(data.salaryStructureId ?? data.salary_structure_id) : null
      form.effective_from = String(data.effectiveFrom || data.effective_from || today).slice(0, 10)
      form.effective_to = data.effectiveTo || data.effective_to ? String(data.effectiveTo || data.effective_to).slice(0, 10) : ''
      status.value = props.cloneFromId && !props.compensationId ? '' : String(data.status || '')
      const members = (data.structureMembers as Record<string, any>[]) || []
      const lines = (data.lines as Record<string, any>[]) || []
      if (members.length) {
        rows.value = buildCompensationRows(members, lines)
        lastStructureId.value = form.salary_structure_id
        structurePerusahaanId.value = Number(data.perusahaanId ?? data.perusahaan_id ?? 0) || null
      } else if (form.salary_structure_id) {
        await loadStructureRows(form.salary_structure_id, lines)
      }
      if (props.cloneFromId && !props.compensationId) {
        form.effective_from = today
        form.effective_to = ''
        status.value = ''
      }
    }
  }
  hydrating.value = false
  loading.value = false
})
</script>
