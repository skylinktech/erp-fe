<script setup lang="ts">
/** Alias route — sidebar uses /produk */
definePageMeta({
  middleware: [
    'auth',
    'check-permission',
    () => navigateTo('/sales/omnichannel/produk', { replace: true }),
  ],
})
</script>

<template>
  <div class="p-3 text-muted small">Mengalihkan ke Product Omnichannel…</div>
</template>
