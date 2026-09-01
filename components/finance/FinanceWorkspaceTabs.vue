<template>
  <ul
    class="nav nav-tabs finance-workspace-tabs mb-4 flex-nowrap overflow-auto"
    role="tablist"
    @keydown="onKeydown"
  >
    <li v-for="tab in tabs" :key="tab.id" class="nav-item" role="presentation">
      <button
        :id="`${idPrefix}-tab-${tab.id}`"
        type="button"
        class="nav-link text-nowrap"
        :class="{ active: tab.id === modelValue }"
        role="tab"
        :aria-selected="tab.id === modelValue"
        :aria-controls="`${idPrefix}-panel-${tab.id}`"
        :tabindex="tab.id === modelValue ? 0 : -1"
        @click="emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
        <span
          v-if="tab.count != null"
          class="badge rounded-pill bg-label-primary ms-1"
        >{{ tab.count }}</span>
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { FinanceWorkspaceTab } from '~/types/finance/workspace'

const props = withDefaults(
  defineProps<{
    tabs: FinanceWorkspaceTab[]
    modelValue: string
    idPrefix?: string
  }>(),
  { idPrefix: 'workspace' }
)

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

function onKeydown(event: KeyboardEvent) {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
  const index = props.tabs.findIndex((tab) => tab.id === props.modelValue)
  if (index < 0 || !props.tabs.length) return
  event.preventDefault()
  let next = index
  if (event.key === 'ArrowRight') next = (index + 1) % props.tabs.length
  if (event.key === 'ArrowLeft') next = (index - 1 + props.tabs.length) % props.tabs.length
  if (event.key === 'Home') next = 0
  if (event.key === 'End') next = props.tabs.length - 1
  const nextId = props.tabs[next]?.id
  if (!nextId) return
  emit('update:modelValue', nextId)
  nextTick(() => {
    const el = document.getElementById(`${props.idPrefix}-tab-${nextId}`)
    el?.focus()
  })
}
</script>

<style scoped>
.finance-workspace-tabs {
  -webkit-overflow-scrolling: touch;
}
.finance-workspace-tabs .nav-item {
  flex: 0 0 auto;
}
.finance-workspace-tabs .nav-link {
  cursor: pointer;
}
</style>
