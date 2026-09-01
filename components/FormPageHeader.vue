<template>
  <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
    <div>
      <h4 class="mb-1">{{ title }}</h4>
      <PageBreadcrumb class="mt-1" :current-label="breadcrumbLabel || title" />
      <p v-if="subtitle" class="mb-0 text-muted small">{{ subtitle }}</p>
    </div>
    <NuxtLink :to="backHref" class="btn btn-outline-secondary btn-sm">
      <i class="ri-arrow-left-line me-1"></i> {{ backLabel }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    backHref: string
    backLabel?: string
    breadcrumbLabel?: string
  }>(),
  {
    subtitle: '',
    backLabel: 'Kembali',
    breadcrumbLabel: '',
  }
)
</script>
