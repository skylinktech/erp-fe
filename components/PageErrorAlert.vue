<template>
  <div class="alert alert-danger" role="alert">
    <i class="ri-error-warning-line me-2"></i>
    <span>{{ message }}</span>
    <NuxtLink v-if="backHref" :to="backHref" class="alert-link ms-2">
      {{ backLabel }}
    </NuxtLink>
    <button
      v-if="showRetry"
      type="button"
      class="btn btn-sm btn-outline-danger ms-2"
      @click="$emit('retry')"
    >
      Coba lagi
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    backHref?: string
    backLabel?: string
    showRetry?: boolean
  }>(),
  {
    backHref: '',
    backLabel: 'Kembali ke Daftar',
    showRetry: false,
  }
)

defineEmits<{
  retry: []
}>()
</script>
