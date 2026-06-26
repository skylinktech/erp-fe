<template>
  <ArfFormPage />
</template>

<script setup lang="ts">
import ArfFormPage from '~/components/arf/ArfFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'ARF Form',
})
</script>
