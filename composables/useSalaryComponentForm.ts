export const SALARY_COMPONENT_METHODS = [
  'FIXED',
  'FORMULA',
  'ATTENDANCE',
  'OVERTIME',
  'VARIABLE',
  'TAX',
  'BPJS',
  'SYSTEM',
] as const

export type SalaryComponentFormState = {
  code: string
  name: string
  component_type: string
  calculation_method: string
  taxable: boolean
  included_in_bpjs_base: boolean
  included_in_thr_base: boolean
  formula: string
  effective_from: string
  effective_to: string
  is_active: boolean
}

export function emptySalaryComponentForm(today = new Date().toISOString().slice(0, 10)): SalaryComponentFormState {
  return {
    code: '',
    name: '',
    component_type: 'EARNING',
    calculation_method: 'FIXED',
    taxable: true,
    included_in_bpjs_base: false,
    included_in_thr_base: false,
    formula: '',
    effective_from: today,
    effective_to: '',
    is_active: true,
  }
}

function isoDate(value: unknown): string {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export function salaryComponentFormFromRow(row: Record<string, unknown>): SalaryComponentFormState {
  const today = new Date().toISOString().slice(0, 10)
  return {
    code: String(row.code || ''),
    name: String(row.name || ''),
    component_type: String(row.componentType || row.component_type || 'EARNING'),
    calculation_method: String(row.calculationMethod || row.calculation_method || 'FIXED'),
    taxable: row.taxable !== false,
    included_in_bpjs_base: Boolean(row.includedInBpjsBase ?? row.included_in_bpjs_base),
    included_in_thr_base: Boolean(row.includedInThrBase ?? row.included_in_thr_base),
    formula: String(row.formula || ''),
    effective_from: isoDate(row.effectiveFrom || row.effective_from) || today,
    effective_to: isoDate(row.effectiveTo || row.effective_to),
    is_active: row.isActive !== false && row.is_active !== false,
  }
}

export function salaryComponentPayload(form: SalaryComponentFormState) {
  return {
    ...form,
    effective_to: form.effective_to || null,
    formula: form.calculation_method === 'FORMULA' ? form.formula || null : null,
  }
}

export function useSalaryComponentForm() {
  const store = usePayrollStore()
  const today = new Date().toISOString().slice(0, 10)
  const form = reactive(emptySalaryComponentForm(today))
  const editingId = ref<string | null>(null)
  const saving = ref(false)
  const isEditMode = computed(() => Boolean(editingId.value))

  function resetForm() {
    editingId.value = null
    Object.assign(form, emptySalaryComponentForm(today))
  }

  function loadRow(row: Record<string, unknown>) {
    editingId.value = String(row.id)
    Object.assign(form, salaryComponentFormFromRow(row))
  }

  async function submit(): Promise<boolean> {
    saving.value = true
    const body = salaryComponentPayload(form)
    const ok = editingId.value
      ? await store.updateComponent(editingId.value, body)
      : await store.saveComponent(body)
    saving.value = false
    if (ok) resetForm()
    return ok
  }

  return {
    form,
    editingId,
    saving,
    isEditMode,
    resetForm,
    loadRow,
    submit,
  }
}
