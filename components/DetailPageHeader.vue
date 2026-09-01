<template>
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
    <div class="d-flex flex-wrap align-items-center gap-3">
      <NuxtLink :to="backHref" class="btn btn-outline-secondary btn-sm">
        <i class="ri-arrow-left-line me-1"></i> {{ backLabel }}
      </NuxtLink>
      <span class="text-muted align-self-center">/</span>
      <div class="d-flex flex-column">
        <h4 class="mb-0 fw-semibold">{{ title }}</h4>
        <PageBreadcrumb class="mt-1" :current-label="breadcrumbLabel || title" />
        <small v-if="subtitle" class="text-muted">{{ subtitle }}</small>
      </div>
      <slot name="badges" />
    </div>
    <div class="d-flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
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
