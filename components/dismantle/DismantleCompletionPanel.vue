<template>
  <div class="card mb-4">
    <div class="card-header bg-transparent border-0 px-4 py-3 d-flex justify-content-between">
      <h6 class="mb-0">Completion Readiness</h6>
      <span v-if="readiness" :class="readiness.eligible ? 'badge bg-label-success' : 'badge bg-label-danger'">
        {{ readiness.eligible ? 'Siap complete' : 'Belum siap' }}
      </span>
    </div>
    <div class="card-body px-4 pt-0 pb-4">
      <DismantleBlockerList :blockers="readiness?.blockers ?? []" title="Blocker completion" />
      <button
        v-if="canComplete"
        type="button"
        class="btn btn-success"
        :disabled="!readiness?.eligible || completing"
        @click="$emit('complete')"
      >
        <span v-if="completing" class="spinner-border spinner-border-sm me-1"></span>
        Complete Request
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DismantleCompletionReadiness } from '~/types/operations/dismantle'
import DismantleBlockerList from '~/components/dismantle/DismantleBlockerList.vue'

defineProps<{
  readiness: DismantleCompletionReadiness | null
  canComplete?: boolean
  completing?: boolean
}>()

defineEmits<{ complete: [] }>()
</script>
