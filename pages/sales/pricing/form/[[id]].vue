<template>
  <PricingFormPage />
</template>

<script setup lang="ts">
import PricingFormPage from '~/components/pricing/PricingFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Pricing Form',
})
</script>
