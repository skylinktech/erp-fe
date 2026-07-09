<template>
  <LemburFormPage />
</template>

<script setup lang="ts">
import LemburFormPage from '~/components/hrd/LemburFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['create_lembur', 'edit_lembur'],
})
</script>
