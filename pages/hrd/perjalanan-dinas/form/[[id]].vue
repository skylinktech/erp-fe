<template>
  <PerjalananDinasFormPage />
</template>

<script setup lang="ts">
import PerjalananDinasFormPage from '~/components/hrd/PerjalananDinasFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['create_perjalanan_dinas', 'edit_perjalanan_dinas'],
})
</script>
