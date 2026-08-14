<template>
  <PurchaseRequestFormPage />
</template>

<script setup>
import PurchaseRequestFormPage from '~/components/purchase-request/PurchaseRequestFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Purchase Request Form',
})
</script>
