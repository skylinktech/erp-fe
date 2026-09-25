<template>
  <div class="container-fluid py-3 omni-page">
    <header class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
      <div class="min-w-0">
        <h1 class="h4 mb-1">{{ title }}</h1>
        <p class="text-muted small mb-0">{{ subtitle }}</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </header>

    <div class="card card-body mb-3">
      <ActiveCompanyField :input-id="companyInputId" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    companyInputId?: string
  }>(),
  {
    title: 'Omnichannel',
    subtitle: 'Marketplace read-only · tanpa stok push / RetailSale / jurnal',
    companyInputId: 'omni-company',
  }
)
</script>
