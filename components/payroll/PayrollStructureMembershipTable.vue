<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <div class="form-check mb-0">
        <input
          :id="selectAllId"
          class="form-check-input"
          type="checkbox"
          :checked="allSelected"
          :indeterminate="indeterminate"
          @change="toggleSelectAll(($event.target as HTMLInputElement).checked)"
        >
        <label class="form-check-label" :for="selectAllId">Select All</label>
      </div>
      <input v-model="search" class="form-control form-control-sm" style="max-width: 240px" placeholder="Cari komponen..." />
    </div>
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th style="width: 2.5rem"></th>
            <th>Code</th>
            <th>Component</th>
            <th class="d-none d-md-table-cell">Type</th>
            <th class="d-none d-lg-table-cell">Method</th>
            <th>Required</th>
            <th class="d-none d-xl-table-cell">Allow Override</th>
            <th class="text-end">Default Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visibleRows" :key="row.salaryComponentId">
            <td>
              <input v-model="row.selected" class="form-check-input" type="checkbox">
            </td>
            <td>{{ row.code }}</td>
            <td>{{ row.name }}</td>
            <td class="d-none d-md-table-cell">{{ row.componentType }}</td>
            <td class="d-none d-lg-table-cell">{{ row.calculationMethod }}</td>
            <td>
              <input v-model="row.isRequired" class="form-check-input" type="checkbox" :disabled="!row.selected">
            </td>
            <td class="d-none d-xl-table-cell">
              <input v-model="row.allowEmployeeOverride" class="form-check-input" type="checkbox" :disabled="!row.selected">
            </td>
            <td class="text-end">
              <input
                v-if="row.selected && isManualAmountMethod(row.calculationMethod)"
                v-model.number="row.defaultAmount"
                type="number"
                min="0"
                class="form-control form-control-sm text-end"
                placeholder="Opsional"
              >
              <span v-else class="text-muted small">{{ row.selected ? 'Automatic' : '—' }}</span>
            </td>
          </tr>
          <tr v-if="!visibleRows.length">
            <td colspan="8" class="text-muted text-center py-3">Tidak ada komponen.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isManualAmountMethod, type StructureMembershipRow } from '~/composables/useCompensationComponents'

const props = defineProps<{
  rows: StructureMembershipRow[]
}>()

const search = ref('')
const selectAllId = `ss-select-all-${Math.random().toString(36).slice(2, 8)}`

const visibleRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter((row) => `${row.code} ${row.name}`.toLowerCase().includes(q))
})
const allSelected = computed(() => props.rows.length > 0 && props.rows.every((row) => row.selected))
const indeterminate = computed(() => {
  const n = props.rows.filter((row) => row.selected).length
  return n > 0 && n < props.rows.length
})

function toggleSelectAll(checked: boolean) {
  for (const row of props.rows) row.selected = checked
}
</script>
