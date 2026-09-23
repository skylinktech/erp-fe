<template>
  <div class="row g-6 mb-6 list-page-stats-cards">
    <div
      v-for="item in items"
      :key="item.key || item.label"
      :class="colClass"
    >
      <div class="card h-100">
        <div class="card-body">
          <div v-if="loading" class="skeleton-loader" style="height: 48px" />
          <template v-else>
            <div class="d-flex justify-content-between align-items-start mb-4 gap-2">
              <div class="stat-card-label">
                <span class="stat-card-label-text">{{ item.label }}</span>
                <InfoPopover
                  v-if="item.info?.title && item.info?.description"
                  :title="item.info.title"
                  :description="item.info.description"
                  :label="`Lihat informasi ${item.label}`"
                />
              </div>
              <div class="avatar flex-shrink-0">
                <span
                  class="avatar-initial rounded"
                  :class="item.iconBgClass || 'bg-label-primary'"
                >
                  <i :class="item.icon || 'ri-bar-chart-line'" aria-hidden="true" />
                </span>
              </div>
            </div>
            <div class="account-heading">
              <h5 class="mb-1 text-break" :class="item.valueClass">{{ item.value }}</h5>
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
import InfoPopover from '~/components/common/InfoPopover.vue'

export interface ListPageStatItemInfo {
  title: string
  description: string
}

export interface ListPageStatItem {
  key?: string
  label: string
  value: string | number
  icon?: string
  iconBgClass?: string
  valueClass?: string
  subtitle?: string
  info?: ListPageStatItemInfo
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
  // 4+ cards: 4 per row on xl, wrap cleanly on smaller breakpoints
  return 'col-xl-3 col-lg-6 col-md-6'
})
</script>

<style scoped>
.stat-card-label {
  display: flex;
  align-items: flex-start;
  gap: 0.125rem;
  min-width: 0;
  flex: 1 1 auto;
}

.stat-card-label-text {
  margin: 0;
  line-height: 1.35;
  padding-top: 0.35rem;
  word-break: break-word;
}
</style>
