<template>
  <PurchaseOrderFormPage />
</template>

<script setup>
import PurchaseOrderFormPage from '~/components/purchase-order/PurchaseOrderFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Purchase Order Form',
})
</script>
