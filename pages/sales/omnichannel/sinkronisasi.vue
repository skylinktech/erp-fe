<script setup lang="ts">
/** Legacy leaf → Settings › Sinkronisasi */
definePageMeta({
  middleware: [
    'auth',
    'check-permission',
    () => navigateTo('/sales/omnichannel/settings?tab=sinkronisasi', { replace: true }),
  ],
})
</script>

<template>
  <div class="p-3 text-muted small">Mengalihkan ke Settings › Sinkronisasi…</div>
</template>
