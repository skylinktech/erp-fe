<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <div class="form-check mb-0">
        <input
          id="comp-select-all"
          class="form-check-input"
          type="checkbox"
          :checked="headerChecked"
          :indeterminate="headerIndeterminate"
          @change="toggleSelectAll(($event.target as HTMLInputElement).checked)"
        >
        <label class="form-check-label" for="comp-select-all">Select All</label>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th style="width: 2.5rem"></th>
            <th class="d-none d-lg-table-cell">Code</th>
            <th>Component</th>
            <th class="d-none d-md-table-cell">Type</th>
            <th class="d-none d-lg-table-cell">Method</th>
            <th class="d-none d-xl-table-cell text-end">Default</th>
            <th>Amount / Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.salaryComponentId">
            <td>
              <input
                class="form-check-input"
                type="checkbox"
                :checked="row.selected"
                :disabled="row.required || readonly"
                @change="onToggle(row, ($event.target as HTMLInputElement).checked)"
              >
            </td>
            <td class="d-none d-lg-table-cell">{{ row.code }}</td>
            <td>
              <div>{{ row.name }}</div>
              <div class="text-muted small d-lg-none">{{ row.code }} · {{ row.calculationMethod }}</div>
            </td>
            <td class="d-none d-md-table-cell">{{ row.componentType }}</td>
            <td class="d-none d-lg-table-cell">{{ row.calculationMethod }}</td>
            <td class="d-none d-xl-table-cell text-end">
              {{ row.defaultAmount != null ? money(row.defaultAmount) : '—' }}
            </td>
            <td>
              <template v-if="row.selected && isManualAmountMethod(row.calculationMethod)">
                <input
                  type="text"
                  inputmode="numeric"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': Boolean(amountError(row)) }"
                  :disabled="readonly || !row.allowOverride && row.defaultAmount != null"
                  placeholder="Rp 0"
                  :value="amountDisplay(row)"
                  @input="onAmountInput(row, $event)"
                >
                <div v-if="amountError(row)" class="invalid-feedback d-block">{{ amountError(row) }}</div>
              </template>
              <span v-else-if="row.selected" class="text-muted small">{{ autoCalculationLabel(row.calculationMethod) }}</span>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="text-muted text-center py-3">Pilih Salary Structure untuk memuat komponen.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  autoCalculationLabel,
  isManualAmountMethod,
  type CompensationComponentRow,
} from '~/composables/useCompensationComponents'
import { formatRupiahInput, parseRupiahInputNullable } from '~/composables/formatRupiah'

const props = defineProps<{
  rows: CompensationComponentRow[]
  readonly?: boolean
}>()

const { money } = usePayrollStatus()

const selectable = computed(() => props.rows.filter((row) => !row.required))
const headerChecked = computed(
  () => props.rows.length > 0 && selectable.value.every((row) => row.selected) && props.rows.filter((row) => row.required).every((row) => row.selected)
)
const headerIndeterminate = computed(() => {
  const selectedOptional = selectable.value.filter((row) => row.selected).length
  return selectedOptional > 0 && selectedOptional < selectable.value.length
})

function toggleSelectAll(checked: boolean) {
  for (const row of props.rows) {
    if (row.required) {
      row.selected = true
      continue
    }
    row.selected = checked
  }
}

function onToggle(row: CompensationComponentRow, checked: boolean) {
  if (row.required) {
    row.selected = true
    return
  }
  row.selected = checked
}

function amountDisplay(row: CompensationComponentRow) {
  return formatRupiahInput(row.amount)
}

function onAmountInput(row: CompensationComponentRow, event: Event) {
  row.amount = parseRupiahInputNullable((event.target as HTMLInputElement).value)
}

function amountError(row: CompensationComponentRow) {
  if (!row.selected || !isManualAmountMethod(row.calculationMethod)) return ''
  if (row.amount == null || row.amount === ('' as unknown) || Number.isNaN(Number(row.amount))) {
    return `${row.name} wajib diisi.`
  }
  return ''
}
</script>
