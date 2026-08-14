<template>
  <ArfFormPage />
</template>

<script setup lang="ts">
import ArfFormPage from '~/components/arf/ArfFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'ARF Form',
})
</script>
