<script setup lang="ts">
/**
 * Legacy leaf → Settings › Toko Terhubung.
 * Use middleware redirect (not top-level await navigateTo) to avoid Nuxt suspense 500.
 */
definePageMeta({
  middleware: [
    'auth',
    'check-permission',
    () => navigateTo('/sales/omnichannel/settings?tab=toko', { replace: true }),
  ],
})
</script>

<template>
  <div class="p-3 text-muted small">Mengalihkan ke Settings › Toko Terhubung…</div>
</template>
