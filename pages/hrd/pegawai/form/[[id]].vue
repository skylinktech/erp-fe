<template>
  <PegawaiFormPage />
</template>

<script setup lang="ts">
import PegawaiFormPage from '~/components/hrd/PegawaiFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Form Pegawai',
  description: 'Tambah atau ubah data pegawai',
})
</script>
