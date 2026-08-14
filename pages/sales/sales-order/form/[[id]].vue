<template>
  <SalesOrderFormPage />
</template>

<script setup>
import SalesOrderFormPage from '~/components/sales-order/SalesOrderFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Sales Order Form',
})
</script>
