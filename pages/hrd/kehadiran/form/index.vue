<template>
  <KehadiranScheduleFormPage />
</template>

<script setup lang="ts">
import KehadiranScheduleFormPage from '~/components/hrd/KehadiranScheduleFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['manage_jadwal_kehadiran', 'edit_kehadiran'],
})
</script>
