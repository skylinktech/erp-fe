<template>
  <PurchaseOrderFormPage />
</template>

<script setup>
import PurchaseOrderFormPage from '~/components/purchase-order/PurchaseOrderFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Purchase Order Form',
})
</script>
