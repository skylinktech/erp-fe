<template>
  <button
    :type="type"
    class="commerce-action-btn"
    :class="[btnClass, { 'commerce-action-btn--icon': iconOnly }]"
    :disabled="disabled || busy"
    :aria-busy="busy ? 'true' : 'false'"
    :aria-label="resolvedAriaLabel"
    :title="title || resolvedAriaLabel"
    @click="onClick"
  >
    <span
      v-if="busy"
      class="spinner-border spinner-border-sm flex-shrink-0"
      :class="iconOnly ? '' : 'me-1'"
      role="status"
      aria-hidden="true"
    />
    <i
      v-else-if="icon"
      :class="[icon, iconOnly ? '' : 'me-1']"
      aria-hidden="true"
    />
    <span v-if="!iconOnly" class="commerce-action-btn__label">{{ displayLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { commerceActionIdleLabel, commerceActionRunningLabel } from '~/utils/commerceActionBusy'

const props = withDefaults(
  defineProps<{
    action: string
    label?: string
    busy?: boolean
    busyLabel?: string
    disabled?: boolean
    icon?: string
    iconOnly?: boolean
    btnClass?: string
    type?: 'button' | 'submit' | 'reset'
    title?: string
    ariaLabel?: string
  }>(),
  {
    busy: false,
    disabled: false,
    iconOnly: false,
    btnClass: 'btn btn-sm btn-outline-secondary',
    type: 'button',
  }
)

const emit = defineEmits<{
  click: [MouseEvent]
}>()

const idleLabel = computed(
  () => props.label || commerceActionIdleLabel(props.action, props.action)
)
const displayLabel = computed(() =>
  props.busy
    ? props.busyLabel || commerceActionRunningLabel(props.action)
    : idleLabel.value
)
const resolvedAriaLabel = computed(
  () => props.ariaLabel || displayLabel.value
)

function onClick(e: MouseEvent) {
  if (props.busy || props.disabled) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  emit('click', e)
}
</script>

<style scoped>
.commerce-action-btn {
  min-width: 5.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.commerce-action-btn--icon {
  min-width: 2rem;
  width: 2rem;
  height: 2rem;
  padding: 0;
}
.commerce-action-btn__label {
  min-width: 0;
}
.commerce-action-btn:disabled {
  cursor: not-allowed;
}
</style>
