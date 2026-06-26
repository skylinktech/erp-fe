<template>
  <FdrFormPage />
</template>

<script setup lang="ts">
import FdrFormPage from '~/components/fdr/FdrFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>
