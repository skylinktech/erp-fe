<template>
  <CutiFormPage />
</template>

<script setup lang="ts">
import CutiFormPage from '~/components/hrd/CutiFormPage.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useRoute } from '#app'

const route = useRoute()
const { setDetailTitle } = useDynamicTitle()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
setDetailTitle(id ? 'Cuti' : 'Pengajuan Cuti', id ? `#${id}` : 'Baru', !!id)

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['create_cuti', 'edit_cuti'],
})
</script>
