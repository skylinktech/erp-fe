<template>
  <ListPageStatsCards :items="items" :loading="loading" :columns-class="columnsClass" />
</template>
<script setup lang="ts">
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import type { PayrollRunSummary } from '~/types/payroll'

const props = defineProps<{
  run?: PayrollRunSummary | null
  loading?: boolean
}>()

const { money } = usePayrollStatus()
const columnsClass = 'col-xl-3 col-md-6'

const items = computed<ListPageStatItem[]>(() => {
  const r = props.run || {}
  return [
    { label: 'Employees', value: r.employeeCount ?? 0, icon: 'ri-team-line', iconBgClass: 'bg-label-primary' },
    { label: 'Gross', value: money(r.grossTotal), icon: 'ri-money-dollar-circle-line', iconBgClass: 'bg-label-info' },
    { label: 'Net Pay', value: money(r.netTotal), icon: 'ri-wallet-3-line', iconBgClass: 'bg-label-success' },
    { label: 'Employer Cost', value: money(r.employerCostTotal), icon: 'ri-building-line', iconBgClass: 'bg-label-secondary' },
    { label: 'Exceptions', value: r.blockedCount ?? 0, icon: 'ri-error-warning-line', iconBgClass: 'bg-label-danger' },
    { label: 'Warnings', value: r.warningCount ?? 0, icon: 'ri-alert-line', iconBgClass: 'bg-label-warning' },
  ]
})
</script>
