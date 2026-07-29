<template>
  <MaterialRequestFormPage />
</template>

<script setup>
import MaterialRequestFormPage from '~/components/material-request/MaterialRequestFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Material Request Form',
})
</script>
