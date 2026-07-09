<template>
  <PerjalananDinasFormPage />
</template>

<script setup lang="ts">
import PerjalananDinasFormPage from '~/components/hrd/PerjalananDinasFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['create_perjalanan_dinas', 'edit_perjalanan_dinas'],
})
</script>
