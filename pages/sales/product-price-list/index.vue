<template>
  <div class="p-3 text-muted small">Mengalihkan ke Pricing…</div>
</template>

<script setup lang="ts">
/**
 * Compatibility alias — Pricing is the canonical retail product selling-price UI.
 */
definePageMeta({ middleware: ['auth', 'check-permission'] })

await navigateTo('/sales/pricing', { replace: true })
</script>
