<template>
  <SalesInvoiceFormPage />
</template>

<script setup>
import SalesInvoiceFormPage from '~/components/sales-invoice/SalesInvoiceFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout   : 'default',
  middleware: ['auth', 'check-permission'],
})
</script>
