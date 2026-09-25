<script setup lang="ts">
/**
 * Legacy eligibility page — configuration lives under Settings → Business Model.
 */
definePageMeta({
  middleware: ['auth'],
  redirect: '/settings/business-model',
})
</script>

<template>
  <div class="container-fluid py-3">
    <p class="text-muted">Mengalihkan ke Model Bisnis Perusahaan…</p>
  </div>
</template>
