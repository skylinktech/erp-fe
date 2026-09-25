<template>
  <ul
    class="nav nav-tabs workspace-tabs flex-nowrap overflow-auto"
    :class="embedded ? 'mb-0' : 'mb-4'"
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
import { nextTick } from 'vue'
import type { WorkspaceTab } from '~/types/workspaceTab'

const props = withDefaults(
  defineProps<{
    tabs: WorkspaceTab[]
    modelValue: string
    idPrefix?: string
    /** When true, remove bottom margin (e.g. tabs inside a filter card). */
    embedded?: boolean
  }>(),
  { idPrefix: 'workspace', embedded: false }
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
    document.getElementById(`${props.idPrefix}-tab-${nextId}`)?.focus()
  })
}
</script>

<style scoped>
.workspace-tabs {
  -webkit-overflow-scrolling: touch;
}
.workspace-tabs .nav-item {
  flex: 0 0 auto;
}
.workspace-tabs .nav-link {
  cursor: pointer;
}
</style>
