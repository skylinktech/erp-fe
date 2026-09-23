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
    {
      label: 'Employees',
      value: r.employeeCount ?? 0,
      icon: 'ri-team-line',
      iconBgClass: 'bg-label-primary',
      info: {
        title: 'Employees',
        description: 'Jumlah karyawan yang termasuk dalam payroll run ini.',
      },
    },
    {
      label: 'Gross',
      value: money(r.grossTotal),
      icon: 'ri-money-dollar-circle-line',
      iconBgClass: 'bg-label-info',
      info: {
        title: 'Gross',
        description: 'Total nominal gross pay pada payroll run (nilai uang).',
      },
    },
    {
      label: 'Net Pay',
      value: money(r.netTotal),
      icon: 'ri-wallet-3-line',
      iconBgClass: 'bg-label-success',
      info: {
        title: 'Net Pay',
        description: 'Total nominal net pay yang dibayarkan pada payroll run (nilai uang).',
      },
    },
    {
      label: 'Employer Cost',
      value: money(r.employerCostTotal),
      icon: 'ri-building-line',
      iconBgClass: 'bg-label-secondary',
      info: {
        title: 'Employer Cost',
        description: 'Total biaya employer pada payroll run (nilai uang).',
      },
    },
    {
      label: 'Exceptions',
      value: r.blockedCount ?? 0,
      icon: 'ri-error-warning-line',
      iconBgClass: 'bg-label-danger',
      info: {
        title: 'Exceptions',
        description: 'Jumlah karyawan/item yang terblokir (exceptions) pada payroll run.',
      },
    },
    {
      label: 'Warnings',
      value: r.warningCount ?? 0,
      icon: 'ri-alert-line',
      iconBgClass: 'bg-label-warning',
      info: {
        title: 'Warnings',
        description: 'Jumlah peringatan (warnings) pada payroll run.',
      },
    },
  ]
})
</script>
