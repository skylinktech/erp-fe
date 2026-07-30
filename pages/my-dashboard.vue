<script setup lang="ts">
/**
 * Alias lama `/my-dashboard` → `/dashboard/settings`
 * (Dashboard Saya diganti nama menjadi Dashboard Settings).
 */
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

await navigateTo('/dashboard/settings', { replace: true })
</script>
