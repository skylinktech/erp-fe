<template>
  <FdrFormPage />
</template>

<script setup lang="ts">
import FdrFormPage from '~/components/fdr/FdrFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>
