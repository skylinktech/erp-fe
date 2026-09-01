<template>
  <div v-if="warnings.length" class="mb-3">
    <div class="text-muted small mb-2">{{ title }}</div>
    <ul class="list-unstyled mb-0">
      <li
        v-for="(w, idx) in warnings"
        :key="`${w.code}-${idx}`"
        class="d-flex gap-2 align-items-start mb-2 p-2 rounded bg-label-warning"
      >
        <i class="ri-alert-line text-warning mt-1" aria-hidden="true"></i>
        <div>
          <div>{{ w.message }}</div>
          <small class="text-muted"><code>{{ w.code }}</code></small>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { DismantleWarning } from '~/types/operations/dismantle'

withDefaults(
  defineProps<{
    warnings: DismantleWarning[]
    title?: string
  }>(),
  { title: 'Peringatan' }
)
</script>
