<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th>Komponen</th>
          <th class="d-none d-md-table-cell">Tipe</th>
          <th class="d-none d-lg-table-cell">Sumber</th>
          <th class="d-none d-xl-table-cell text-end">Qty</th>
          <th class="d-none d-xl-table-cell text-end">Rate</th>
          <th class="text-end">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(line, idx) in lines" :key="line.id || idx">
          <td>{{ line.componentNameSnapshot || line.component_name_snapshot || '—' }}</td>
          <td class="d-none d-md-table-cell">{{ line.componentType || line.component_type }}</td>
          <td class="d-none d-lg-table-cell">{{ line.calculationSource || line.calculation_source || '—' }}</td>
          <td class="d-none d-xl-table-cell text-end">{{ line.quantity ?? '—' }}</td>
          <td class="d-none d-xl-table-cell text-end">{{ line.rate != null ? money(line.rate) : '—' }}</td>
          <td class="text-end">{{ money(line.amount) }}</td>
        </tr>
        <tr v-if="!lines.length">
          <td colspan="6" class="text-muted">Belum ada komponen.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import type { PayrollLine } from '~/types/payroll'
const props = defineProps<{ lines?: Array<Record<string, unknown> | PayrollLine> }>()
const { money } = usePayrollStatus()
const lines = computed(() => props.lines || [])
</script>
