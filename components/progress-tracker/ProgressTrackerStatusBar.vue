<template>
  <div class="progress-tracker-status-bar">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <span class="small fw-medium text-primary">{{ currentLabel }}</span>
      <span class="small text-muted">Tahap {{ stepNumber }} / {{ totalSteps }} · {{ percent }}%</span>
    </div>

    <div class="progress progress-tracker-status-bar__track mb-2" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div
        class="progress-bar progress-bar-striped progress-bar-animated"
        :class="barClass"
        :style="{ width: `${percent}%` }"
      />
    </div>

    <div class="progress-tracker-status-bar__segments" aria-hidden="true">
      <div
        v-for="(opt, idx) in statusOptions"
        :key="opt.value"
        class="progress-tracker-status-bar__segment"
        :class="segmentClass(idx)"
        :title="opt.label"
      >
        <span class="progress-tracker-status-bar__segment-num">{{ idx + 1 }}</span>
        <span class="progress-tracker-status-bar__segment-label">{{ shortLabel(opt.label) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  PROGRESS_TRACKER_STATUS_OPTIONS,
  getProgressTrackerPercent,
  getProgressTrackerStatusIndex,
  normalizeProgressTrackerStatus,
  PROGRESS_TRACKER_STATUS_LABELS,
  type ProgressTrackerStatus,
} from '~/constants/implementation/progressTrackerStatuses'

const props = defineProps<{
  status: ProgressTrackerStatus | string | undefined | null
  compact?: boolean
}>()

const statusOptions = PROGRESS_TRACKER_STATUS_OPTIONS
const totalSteps = statusOptions.length

const normalizedStatus = computed(() =>
  normalizeProgressTrackerStatus(props.status, 'material_readiness')
)

const currentIndex = computed(() => getProgressTrackerStatusIndex(normalizedStatus.value))
const percent = computed(() => getProgressTrackerPercent(normalizedStatus.value))
const stepNumber = computed(() => currentIndex.value + 1)
const currentLabel = computed(
  () => PROGRESS_TRACKER_STATUS_LABELS[normalizedStatus.value] || '—'
)

const barClass = computed(() => {
  if (percent.value >= 100) return 'bg-success'
  if (percent.value >= 70) return 'bg-info'
  if (percent.value >= 40) return 'bg-primary'
  return 'bg-secondary'
})

function segmentClass(idx: number) {
  if (idx < currentIndex.value) return 'is-done'
  if (idx === currentIndex.value) return 'is-current'
  return 'is-pending'
}

function shortLabel(label: string) {
  if (props.compact) return ''
  const words = label.split(' ')
  if (words.length <= 2) return label
  return `${words[0]} ${words[1]}`
}
</script>

<style scoped>
.progress-tracker-status-bar__track {
  height: 0.65rem;
  border-radius: 0.5rem;
  background-color: rgba(var(--bs-primary-rgb, 0, 143, 236), 0.12);
}

.progress-tracker-status-bar__segments {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.35rem;
}

.progress-tracker-status-bar__segment {
  text-align: center;
  padding: 0.35rem 0.15rem;
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color, #e4e6ef);
  background: var(--bs-body-bg, #fff);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.progress-tracker-status-bar__segment.is-done {
  border-color: rgba(var(--bs-success-rgb, 0, 172, 79), 0.45);
  background: rgba(var(--bs-success-rgb, 0, 172, 79), 0.08);
}

.progress-tracker-status-bar__segment.is-current {
  border-color: var(--bs-primary, #008fec);
  background: rgba(var(--bs-primary-rgb, 0, 143, 236), 0.1);
  box-shadow: 0 0 0 1px rgba(var(--bs-primary-rgb, 0, 143, 236), 0.25);
}

.progress-tracker-status-bar__segment.is-pending {
  opacity: 0.65;
}

.progress-tracker-status-bar__segment-num {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--bs-secondary-color, #6c757d);
}

.progress-tracker-status-bar__segment.is-current .progress-tracker-status-bar__segment-num {
  color: var(--bs-primary, #008fec);
}

.progress-tracker-status-bar__segment-label {
  display: block;
  font-size: 0.6rem;
  line-height: 1.15;
  color: var(--bs-secondary-color, #6c757d);
  margin-top: 0.1rem;
  word-break: break-word;
}

@media (max-width: 992px) {
  .progress-tracker-status-bar__segment-label {
    display: none;
  }
}
</style>
