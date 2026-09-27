<template>
  <div class="pos-layout min-vh-100">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * Minimal POS shell — full terminal chrome lives in the page (toolbar + catalog + cart).
 * Keeps SkyFlow global styles; no REDDI sidebar chrome.
 */
</script>

<style scoped>
.pos-layout {
  background: var(--bs-body-bg, #f5f5f9);
}
</style>
