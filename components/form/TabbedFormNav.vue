<template>
  <ul class="nav nav-tabs" :class="navClass" role="tablist">
    <li v-for="(step, index) in steps" :key="step.id" class="nav-item" role="presentation">
      <button
        type="button"
        class="nav-link"
        :class="{ active: index === currentIndex }"
        role="tab"
        :aria-selected="index === currentIndex"
        :disabled="disabled"
        @click="$emit('select', index)"
      >
        <template v-if="compactMobile">
          <span v-if="step.icon" class="d-sm-none" :class="step.icon"></span>
          <span :class="step.icon ? 'd-none d-sm-block' : ''">
            <i v-if="step.icon && showDesktopIcon" :class="[step.icon, 'me-1']"></i>
            {{ step.label }}
          </span>
        </template>
        <template v-else>
          <i v-if="step.icon" :class="[step.icon, 'me-1']"></i>
          {{ step.label }}
        </template>
        <span
          v-if="step.badge !== null && step.badge !== undefined && step.badge !== ''"
          class="badge ms-1"
          :class="step.badgeClass || 'bg-primary'"
        >
          {{ step.badge }}
        </span>
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { TabbedFormStep } from '~/composables/useTabbedFormNavigation'

withDefaults(
  defineProps<{
    steps: TabbedFormStep[]
    currentIndex: number
    disabled?: boolean
    compactMobile?: boolean
    showDesktopIcon?: boolean
    navClass?: string
  }>(),
  {
    disabled: false,
    compactMobile: true,
    showDesktopIcon: false,
    navClass: '',
  }
)

defineEmits<{
  select: [index: number]
}>()
</script>
