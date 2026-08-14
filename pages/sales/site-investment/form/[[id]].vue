<template>
  <SiteInvestmentFormPage />
</template>

<script setup lang="ts">
import SiteInvestmentFormPage from '~/components/site-investment/SiteInvestmentFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>
