<template>
  <div class="card mb-4">
    <div class="card-header bg-transparent border-0 px-4 py-3 d-flex justify-content-between align-items-center">
      <h6 class="mb-0">{{ title }}</h6>
      <span v-if="loading" class="spinner-border spinner-border-sm text-primary" role="status" aria-label="Memuat"></span>
      <span v-else-if="readiness" :class="readiness.eligible ? 'badge bg-label-success' : 'badge bg-label-danger'">
        {{ readiness.eligible ? 'Eligible' : 'Tidak eligible' }}
      </span>
    </div>
    <div class="card-body px-4 pt-0 pb-4">
      <DismantleBlockerList :blockers="readiness?.blockers ?? []" />
      <DismantleWarningList :warnings="readiness?.warnings ?? []" />
      <p v-if="!loading && !readiness" class="text-muted mb-0 small">Belum ada data readiness.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DismantleReadiness } from '~/types/operations/dismantle'
import DismantleBlockerList from '~/components/dismantle/DismantleBlockerList.vue'
import DismantleWarningList from '~/components/dismantle/DismantleWarningList.vue'

withDefaults(
  defineProps<{
    readiness: DismantleReadiness | null
    loading?: boolean
    title?: string
  }>(),
  { loading: false, title: 'Readiness' }
)
</script>
