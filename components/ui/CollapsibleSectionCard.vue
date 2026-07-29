<template>
  <div class="card border shadow-none mb-3 collapsible-section-card">
    <div
      class="card-header d-flex justify-content-between align-items-center pt-4 pb-3 px-4 collapsible-section-card__header"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <div class="d-flex align-items-center gap-2 min-w-0">
        <i v-if="icon" :class="icon" class="text-heading flex-shrink-0"></i>
        <span class="fw-semibold text-truncate">{{ title }}</span>
        <slot name="badge" />
      </div>
      <i
        class="text-heading flex-shrink-0 ms-2"
        :class="isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
      ></i>
    </div>

    <div v-show="isOpen" class="card-body pt-3 pb-4 px-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    icon?: string
    defaultOpen?: boolean
    open?: boolean
  }>(),
  {
    icon: '',
    defaultOpen: true,
    open: undefined,
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const internalOpen = ref(props.defaultOpen)

const isControlled = computed(() => props.open !== undefined)

const isOpen = computed({
  get: () => (isControlled.value ? !!props.open : internalOpen.value),
  set: (value: boolean) => {
    if (isControlled.value) {
      emit('update:open', value)
    } else {
      internalOpen.value = value
    }
  },
})

watch(
  () => props.defaultOpen,
  (value) => {
    if (!isControlled.value) {
      internalOpen.value = value
    }
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.collapsible-section-card__header {
  cursor: pointer;
  user-select: none;
  background: transparent;
  border-bottom: 0;
}

.collapsible-section-card__header + .card-body {
  border-top: 1px solid rgba(67, 89, 113, 0.12);
}
</style>
