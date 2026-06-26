<template>
  <div class="form-page-sidebar">
    <slot name="prepend" />

    <div
      v-if="$slots.summary || (summaryRows && summaryRows.length)"
      class="card shadow-sm border-0 mb-4"
    >
      <div class="card-header border-0 bg-transparent px-4 py-3">
        <h6 class="card-title mb-0 d-flex align-items-center gap-2">
          <i v-if="summaryIcon" :class="summaryIcon" class="text-primary"></i>
          {{ summaryTitle }}
        </h6>
      </div>
      <div class="card-body px-4 pt-0 pb-4">
        <slot name="summary">
          <dl v-if="summaryRows?.length" class="row mb-0 small">
            <template v-for="(row, idx) in summaryRows" :key="idx">
              <dt class="col-5 text-muted mb-2">{{ row.label }}</dt>
              <dd class="col-7 mb-2 text-break">{{ row.value || '—' }}</dd>
            </template>
          </dl>
        </slot>
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header border-0 bg-transparent px-4 py-3">
        <h6 class="card-title mb-0 d-flex align-items-center gap-2">
          <i :class="navIcon" class="text-primary"></i>
          {{ navTitle }}
        </h6>
      </div>
      <div class="card-body px-4 pt-0 pb-4">
        <nav class="list-group list-group-flush" :aria-label="navTitle">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3 px-0"
            :class="{ active: isNavActive(item.to) }"
          >
            <span class="d-flex align-items-center gap-2">
              <i :class="item.icon" class="text-primary"></i>
              {{ item.label }}
            </span>
            <i class="ri-arrow-right-s-line text-muted flex-shrink-0"></i>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import type { FormPageNavItem, FormPageSummaryRow } from '~/types/form-page'

const props = withDefaults(
  defineProps<{
    navTitle: string
    navItems: FormPageNavItem[]
    navIcon?: string
    summaryTitle?: string
    summaryIcon?: string
    summaryRows?: FormPageSummaryRow[]
  }>(),
  {
    navIcon: 'ri-menu-2-line',
    summaryTitle: 'Ringkasan',
    summaryIcon: 'ri-information-line',
    summaryRows: () => [],
  }
)

const route = useRoute()

function isNavActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
.form-page-sidebar :deep(.list-group-item.active) {
  background-color: rgba(var(--bs-primary-rgb, 105, 108, 255), 0.08);
  border-color: transparent;
  color: var(--bs-primary, #696cff);
  font-weight: 500;
}

@media (min-width: 1200px) {
  .form-page-sidebar {
    position: sticky;
    top: 5.5rem;
    align-self: flex-start;
  }
}
</style>
