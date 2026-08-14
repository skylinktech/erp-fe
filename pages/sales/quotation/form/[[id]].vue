<template>
  <QuotationFormPage />
</template>

<script setup lang="ts">
import QuotationFormPage from '~/components/quotation/QuotationFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>
