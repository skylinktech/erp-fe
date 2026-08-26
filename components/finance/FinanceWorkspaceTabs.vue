<template>
  <ul class="nav nav-tabs finance-workspace-tabs mb-4" role="tablist">
    <li v-for="tab in tabs" :key="tab.id" class="nav-item" role="presentation">
      <button
        type="button"
        class="nav-link"
        :class="{ active: tab.id === modelValue }"
        role="tab"
        :aria-selected="tab.id === modelValue"
        @click="$emit('update:modelValue', tab.id)"
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

defineProps<{
  tabs: FinanceWorkspaceTab[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<style scoped>
.finance-workspace-tabs .nav-link {
  cursor: pointer;
}
</style>
