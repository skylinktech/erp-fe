<template>
  <div class="progress-status-stepper">
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button
        v-for="(step, idx) in statusOptions"
        :key="step.value"
        type="button"
        class="btn btn-sm"
        :class="stepButtonClass(step.value, idx)"
        :disabled="readonly"
        @click="selectStatus(step.value)"
      >
        <span class="step-index me-1">{{ idx + 1 }}</span>
        {{ step.label }}
      </button>
    </div>
    <div v-if="!readonly && selectedStatus !== modelValue" class="alert alert-light border py-2 px-3 mb-0 small">
      Ubah status ke <strong>{{ labelFor(selectedStatus) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PROGRESS_TRACKER_STATUS_OPTIONS,
  type ProgressTrackerStatus,
} from '~/constants/implementation/progressTrackerStatuses'

const props = withDefaults(
  defineProps<{
    modelValue: ProgressTrackerStatus
    readonly?: boolean
  }>(),
  { readonly: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: ProgressTrackerStatus]
}>()

const statusOptions = PROGRESS_TRACKER_STATUS_OPTIONS
const selectedStatus = ref<ProgressTrackerStatus>(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    selectedStatus.value = v
  }
)

function labelFor(s: ProgressTrackerStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function stepIndex(status: ProgressTrackerStatus) {
  return statusOptions.findIndex((o) => o.value === status)
}

function stepButtonClass(status: ProgressTrackerStatus, idx: number) {
  const currentIdx = stepIndex(props.modelValue)
  const selectedIdx = stepIndex(selectedStatus.value)
  if (status === selectedStatus.value && selectedStatus.value !== props.modelValue) {
    return 'btn-warning'
  }
  if (idx < currentIdx) return 'btn-success'
  if (idx === currentIdx) return 'btn-primary'
  return 'btn-outline-secondary'
}

function selectStatus(status: ProgressTrackerStatus) {
  if (props.readonly) return
  selectedStatus.value = status
  emit('update:modelValue', status)
}
</script>

<style scoped>
.step-index {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  font-size: 0.7rem;
}
</style>
