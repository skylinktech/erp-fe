<template>
  <Modal
    id="payrollSalaryComponentModal"
    :model-value="modelValue"
    :title="isEditMode ? 'Edit Salary Component' : 'Tambah Salary Component'"
    dialog-class="modal-lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form @submit.prevent="onSubmit">
      <div class="row g-3">
        <div class="col-12"><h6 class="mb-0">Basic Information</h6></div>
        <div class="col-md-4">
          <label class="form-label">Code <span class="text-danger">*</span></label>
          <input v-model="form.code" class="form-control" required maxlength="64" :readonly="isEditMode" />
          <small v-if="isEditMode" class="text-muted">Code tidak dapat diubah setelah dibuat.</small>
        </div>
        <div class="col-md-8">
          <label class="form-label">Name <span class="text-danger">*</span></label>
          <input v-model="form.name" class="form-control" required maxlength="150" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Type <span class="text-danger">*</span></label>
          <select v-model="form.component_type" class="form-select" required>
            <option value="EARNING">Earning</option>
            <option value="DEDUCTION">Deduction</option>
            <option value="EMPLOYER_CONTRIBUTION">Employer Contribution</option>
            <option value="INFORMATION">Information</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Calculation Method <span class="text-danger">*</span></label>
          <select v-model="form.calculation_method" class="form-select" required>
            <option v-for="m in SALARY_COMPONENT_METHODS" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="col-12"><h6 class="mb-0">Tax / BPJS / THR Behavior</h6></div>
        <div class="col-md-4 form-check">
          <input :id="`${fieldId}-taxable`" v-model="form.taxable" type="checkbox" class="form-check-input">
          <label class="form-check-label" :for="`${fieldId}-taxable`">Taxable</label>
        </div>
        <div class="col-md-4 form-check">
          <input :id="`${fieldId}-bpjs`" v-model="form.included_in_bpjs_base" type="checkbox" class="form-check-input">
          <label class="form-check-label" :for="`${fieldId}-bpjs`">BPJS base</label>
        </div>
        <div class="col-md-4 form-check">
          <input :id="`${fieldId}-thr`" v-model="form.included_in_thr_base" type="checkbox" class="form-check-input">
          <label class="form-check-label" :for="`${fieldId}-thr`">THR base</label>
        </div>
        <div v-if="form.calculation_method === 'FORMULA'" class="col-12">
          <label class="form-label">Formula</label>
          <input v-model="form.formula" class="form-control" placeholder="Contoh: BASIC * 0.1" />
          <small class="text-muted">Hanya identifier whitelist backend. Frontend tidak mengeksekusi formula.</small>
        </div>
        <div class="col-12"><h6 class="mb-0">Effective Period</h6></div>
        <div class="col-md-6">
          <label class="form-label">Effective From <span class="text-danger">*</span></label>
          <input v-model="form.effective_from" type="date" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Effective To</label>
          <input v-model="form.effective_to" type="date" class="form-control" />
        </div>
        <div v-if="isEditMode" class="col-12 form-check">
          <input :id="`${fieldId}-active`" v-model="form.is_active" type="checkbox" class="form-check-input">
          <label class="form-check-label" :for="`${fieldId}-active`">Aktif</label>
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-outline-secondary" @click="close">Batal</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">Simpan</button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/modal/Modal.vue'
import { SALARY_COMPONENT_METHODS, useSalaryComponentForm } from '~/composables/useSalaryComponentForm'

const props = defineProps<{
  modelValue: boolean
  editRow?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const fieldId = `sc-${Math.random().toString(36).slice(2, 9)}`
const { form, saving, isEditMode, resetForm, loadRow, submit } = useSalaryComponentForm()

watch(
  () => [props.modelValue, props.editRow] as const,
  ([open, row]) => {
    if (!open) {
      resetForm()
      return
    }
    if (row) loadRow(row)
    else resetForm()
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

async function onSubmit() {
  const ok = await submit()
  if (!ok) return
  emit('saved')
  close()
}
</script>
