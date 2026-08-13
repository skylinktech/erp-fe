<template>
  <div class="card mb-6 collapsible-filter-card">
    <div
      class="card-header d-flex justify-content-between align-items-center collapsible-filter-card__header"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <div class="d-flex align-items-center gap-2">
        <i class="ri-filter-line text-heading"></i>
        <span class="fw-semibold text-heading">{{ title }}</span>
        <span v-if="hasActiveFilters" class="badge bg-primary ms-1">Aktif</span>
      </div>
      <i
        class="text-heading"
        :class="isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
      ></i>
    </div>

    <div v-show="isOpen" class="card-body pt-4">
      <p v-if="description" class="text-muted small mb-4">{{ description }}</p>
      <div class="collapsible-filter-card__fields">
        <slot />
      </div>
      <div v-if="showReset" class="mt-3 d-flex justify-content-end">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click.stop="emitReset">
          <i class="ri-refresh-line me-1"></i>
          Reset Filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    hasActiveFilters?: boolean
    showReset?: boolean
    open?: boolean
  }>(),
  {
    description: '',
    hasActiveFilters: false,
    showReset: true,
    open: undefined,
  }
)

const emit = defineEmits<{
  reset: []
  'update:open': [value: boolean]
}>()

const internalOpen = ref(true)

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

function toggle() {
  isOpen.value = !isOpen.value
}

function emitReset() {
  emit('reset')
}
</script>

<style scoped>
.collapsible-filter-card {
  border: 1px solid var(--bs-card-border-color, #e6e6e8);
  box-shadow: none;
}

.collapsible-filter-card__header {
  cursor: pointer;
  user-select: none;
  background: transparent;
  border-bottom: 0;
}

.collapsible-filter-card__header + .card-body {
  border-top: 1px solid rgba(67, 89, 113, 0.12);
}

.collapsible-filter-card__fields {
  width: 100%;
}
</style>
