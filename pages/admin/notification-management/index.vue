<script setup lang="ts">
definePageMeta({
  title: 'Notification Management',
  layout: 'default',
  middleware: ['auth'],
})

await navigateTo({
  path: '/settings/notification-management',
  query: useRoute().query,
  replace: true,
})
</script>

<template>
  <div class="p-4 text-muted">Mengalihkan ke Settings → Notification Management…</div>
</template>
