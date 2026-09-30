<script setup lang="ts">
/**
 * Legacy leaf → Settings › Warehouse.
 * Use middleware redirect (not top-level await navigateTo) to avoid Nuxt suspense 500.
 */
definePageMeta({
  middleware: [
    'auth',
    'check-permission',
    (to) => {
      const mapped = to.query?.mapped
      if (mapped != null && String(mapped) !== '') {
        return navigateTo(
          { path: '/sales/omnichannel/produk', query: { mapped, tab: 'cache' } },
          { replace: true }
        )
      }
      return navigateTo('/sales/omnichannel/settings?tab=warehouse', { replace: true })
    },
  ],
})
</script>

<template>
  <div class="p-3 text-muted small">Mengalihkan ke Settings › Warehouse…</div>
</template>
