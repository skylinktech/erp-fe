<template>
  <PayrollCompensationFormPage :compensation-id="compensationId" />
</template>
<script setup lang="ts">
import PayrollCompensationFormPage from '~/components/payroll/PayrollCompensationFormPage.vue'

definePageMeta({
  title: 'Edit Compensation',
  middleware: ['auth', 'check-permission'],
  alias: ['/payroll/compensations/:id/edit', '/payroll/configuration/compensations/:id/edit'],
  hidePageHeading: true,
})

const route = useRoute()
const compensationId = computed(() => String(route.params.id || '') || null)
</script>
