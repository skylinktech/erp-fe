<template>
  <div v-if="blockers.length" class="mb-3">
    <div class="text-muted small mb-2">{{ title }}</div>
    <ul class="list-unstyled mb-0">
      <li
        v-for="(b, idx) in blockers"
        :key="`${b.code}-${idx}`"
        class="d-flex gap-2 align-items-start mb-2 p-2 rounded bg-label-danger"
      >
        <i class="ri-error-warning-line text-danger mt-1" aria-hidden="true"></i>
        <div class="flex-grow-1">
          <div class="fw-medium">{{ b.message }}</div>
          <small class="text-muted">
            <span class="badge bg-label-secondary me-1">{{ getBlockerCategory(b.code) }}</span>
            <code>{{ b.code }}</code>
            <span v-if="b.referenceId"> · {{ b.referenceType ?? 'ref' }}: {{ b.referenceId }}</span>
          </small>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { DismantleBlocker } from '~/types/operations/dismantle'
import { getBlockerCategory } from '~/utils/dismantleLabels'

withDefaults(
  defineProps<{
    blockers: DismantleBlocker[]
    title?: string
  }>(),
  { title: 'Blocker' }
)
</script>
