<template>
  <div class="row g-6 mb-6">
    <div
      v-for="item in items"
      :key="item.key || item.label"
      :class="colClass"
    >
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="skeleton-loader" style="height: 48px" />
          <template v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">{{ item.label }}</p>
              <div class="avatar">
                <span
                  class="avatar-initial rounded"
                  :class="item.iconBgClass || 'bg-label-primary'"
                >
                  <i :class="item.icon || 'ri-bar-chart-line'" />
                </span>
              </div>
            </div>
            <div class="account-heading">
              <h5 class="mb-1" :class="item.valueClass">{{ item.value }}</h5>
              <span v-if="item.subtitle" class="text-muted">{{ item.subtitle }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ListPageStatItem {
  key?: string
  label: string
  value: string | number
  icon?: string
  iconBgClass?: string
  valueClass?: string
  subtitle?: string
}

const props = withDefaults(
  defineProps<{
    items: ListPageStatItem[]
    loading?: boolean
    /** Bootstrap column class override; auto from item count when omitted */
    columnsClass?: string
  }>(),
  {
    loading: false,
    columnsClass: undefined,
  }
)

const colClass = computed(() => {
  if (props.columnsClass) return props.columnsClass
  const n = props.items?.length || 4
  if (n <= 2) return 'col-xl-6 col-md-6'
  if (n === 3) return 'col-xl-4 col-md-6'
  return 'col-xl-3 col-lg-6 col-md-6'
})
</script>
