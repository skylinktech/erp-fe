export const MANUAL_AMOUNT_METHODS = new Set(['FIXED'])
export const AUTO_CALCULATION_METHODS = new Set([
  'FORMULA',
  'ATTENDANCE',
  'OVERTIME',
  'VARIABLE',
  'TAX',
  'BPJS',
  'SYSTEM',
])

export function isManualAmountMethod(method?: string | null) {
  return MANUAL_AMOUNT_METHODS.has(String(method || ''))
}

export function isAutoCalculatedMethod(method?: string | null) {
  return AUTO_CALCULATION_METHODS.has(String(method || ''))
}

export function autoCalculationLabel(method?: string | null) {
  const m = String(method || '')
  if (m === 'TAX') return 'Calculated by Tax Engine'
  if (m === 'BPJS') return 'Calculated by BPJS Engine'
  if (m === 'VARIABLE') return 'From variable payroll input'
  if (m === 'OVERTIME' || m === 'ATTENDANCE') return 'Calculated automatically'
  return 'Calculated automatically'
}

export interface CompensationComponentRow {
  salaryComponentId: string
  code: string
  name: string
  componentType: string
  calculationMethod: string
  required: boolean
  selected: boolean
  defaultAmount: number | null
  amount: number | null
  allowOverride: boolean
}

export interface StructureMembershipRow {
  salaryComponentId: string
  code: string
  name: string
  componentType: string
  calculationMethod: string
  selected: boolean
  isRequired: boolean
  allowEmployeeOverride: boolean
  defaultAmount: number | null
}

export function mapStructureComponentDto(raw: Record<string, any>): Omit<CompensationComponentRow, 'selected' | 'amount'> {
  const method = String(raw.calculationMethod || raw.calculation_method || 'FIXED')
  const defaultAmount = raw.defaultAmount ?? raw.default_amount ?? null
  return {
    salaryComponentId: String(raw.salaryComponentId ?? raw.salary_component_id ?? raw.id),
    code: String(raw.code || ''),
    name: String(raw.name || ''),
    componentType: String(raw.componentType || raw.component_type || ''),
    calculationMethod: method,
    required: Boolean(raw.isRequired ?? raw.is_required),
    defaultAmount: defaultAmount == null || defaultAmount === '' ? null : Number(defaultAmount),
    allowOverride: raw.allowEmployeeOverride !== false && raw.allow_employee_override !== false,
  }
}

export function buildCompensationRows(
  members: Record<string, any>[],
  existingLines: Array<Record<string, any>> = []
): CompensationComponentRow[] {
  const lineByComponent = new Map<string, Record<string, any>>()
  for (const line of existingLines) {
    const id = String(line.salaryComponentId ?? line.salary_component_id ?? '')
    if (id) lineByComponent.set(id, line)
  }
  return members.map((raw) => {
    const base = mapStructureComponentDto(raw)
    const line = lineByComponent.get(base.salaryComponentId)
    const selected = base.required || Boolean(line)
    const amountFromLine = line ? Number(line.amount ?? 0) : null
    return {
      ...base,
      selected,
      amount: selected
        ? amountFromLine ?? base.defaultAmount
        : base.defaultAmount,
    }
  })
}

export function reconcileCompensationRows(
  nextMembers: Record<string, any>[],
  previous: CompensationComponentRow[]
): CompensationComponentRow[] {
  const prevById = new Map(previous.map((row) => [row.salaryComponentId, row]))
  return nextMembers.map((raw) => {
    const base = mapStructureComponentDto(raw)
    const prev = prevById.get(base.salaryComponentId)
    if (!prev) {
      return {
        ...base,
        selected: base.required,
        amount: base.defaultAmount,
      }
    }
    return {
      ...base,
      selected: base.required ? true : prev.selected,
      amount: isManualAmountMethod(base.calculationMethod) ? prev.amount ?? base.defaultAmount : null,
    }
  })
}

export function catalogToMembership(components: Record<string, any>[]): StructureMembershipRow[] {
  return components.map((raw) => ({
    salaryComponentId: String(raw.id),
    code: String(raw.code || ''),
    name: String(raw.name || ''),
    componentType: String(raw.componentType || raw.component_type || ''),
    calculationMethod: String(raw.calculationMethod || raw.calculation_method || 'FIXED'),
    selected: false,
    isRequired: false,
    allowEmployeeOverride: true,
    defaultAmount: null,
  }))
}

export function membershipPayload(rows: StructureMembershipRow[]) {
  return rows
    .filter((row) => row.selected)
    .map((row, index) => ({
      salary_component_id: row.salaryComponentId,
      is_required: row.isRequired,
      allow_employee_override: row.allowEmployeeOverride,
      default_amount: isManualAmountMethod(row.calculationMethod) ? row.defaultAmount : null,
      display_order: (index + 1) * 10,
    }))
}

export function compensationPayloadComponents(rows: CompensationComponentRow[]) {
  return rows.map((row) => ({
    salary_component_id: row.salaryComponentId,
    selected: row.selected,
    amount: row.selected && isManualAmountMethod(row.calculationMethod) ? Number(row.amount ?? 0) : null,
  }))
}
