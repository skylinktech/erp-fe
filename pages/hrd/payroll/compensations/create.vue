<template>
  <PayrollCompensationFormPage :clone-from-id="cloneFromId" />
</template>
<script setup lang="ts">
import PayrollCompensationFormPage from '~/components/payroll/PayrollCompensationFormPage.vue'

definePageMeta({
  title: 'Tambah Compensation',
  middleware: ['auth', 'check-permission'],
  alias: ['/payroll/compensations/create', '/payroll/configuration/compensations/create'],
  hidePageHeading: true,
})

const route = useRoute()
const cloneFromId = computed(() => {
  const raw = Array.isArray(route.query.from) ? route.query.from[0] : route.query.from
  const id = String(raw || '').trim()
  return id || null
})
</script>
