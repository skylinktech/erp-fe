<template>
  <ProgressTrackerFormPage :edit-id="editId" />
</template>

<script setup lang="ts">
import ProgressTrackerFormPage from '~/components/progress-tracker/ProgressTrackerFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Form Progress Tracker',
})

const route = useRoute()
const editId = computed(() => {
  const p = route.params.id
  return p && p !== 'undefined' ? String(p) : undefined
})
</script>
