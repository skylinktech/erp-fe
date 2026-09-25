<script setup lang="ts">
/**
 * Legacy Sales URL — page UI removed; keep route to avoid breaking
 * existing menu_detail rows that still point here until reseed/update.
 */
const route = useRoute()

await navigateTo(
  {
    path: '/finance/pricing-approval',
    query: { ...route.query },
  },
  { replace: true }
)
</script>

<template>
  <div />
</template>
