<template>
  <div class="d-flex justify-content-center align-items-center page-loading-state">
    <div class="text-center">
      <div
        class="spinner-border text-primary"
        role="status"
        :style="{ width: spinnerSize, height: spinnerSize }"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
      <p v-if="message" class="mt-3 text-muted">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    spinnerSize?: string
  }>(),
  {
    message: 'Memuat data...',
    spinnerSize: '3rem',
  }
)
</script>

<style scoped>
.page-loading-state {
  min-height: 400px;
}
</style>
