<template>
  <ServiceInstanceListPage status="pending_activation" title="Pending Activation" />
</template>
<script setup lang="ts">
import ServiceInstanceListPage from '~/components/service-management/ServiceInstanceListPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Pending Activation',
})
</script>
