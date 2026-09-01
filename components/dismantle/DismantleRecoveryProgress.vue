<template>
  <div class="card mb-4" v-if="recovery">
    <div class="card-header bg-transparent border-0 px-4 py-3">
      <h6 class="mb-0">Progress Recovery</h6>
    </div>
    <div class="card-body px-4 pt-0 pb-4">
      <div class="row g-3 text-center">
        <div class="col-6 col-md-4 col-lg-2" v-for="item in items" :key="item.key">
          <div class="border rounded p-2 h-100">
            <div class="text-muted small">{{ item.label }}</div>
            <div class="fw-semibold fs-5">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DismantleRecoverySummary } from '~/types/operations/dismantle'

const props = defineProps<{ recovery: DismantleRecoverySummary | null }>()

const items = computed(() => {
  const r = props.recovery
  if (!r) return []
  return [
    { key: 'total', label: 'Total', value: r.total },
    { key: 'pendingPhysical', label: 'Pending Physical', value: r.pendingPhysical },
    { key: 'inTransit', label: 'In Transit', value: r.inTransit },
    { key: 'received', label: 'Received', value: r.received },
    { key: 'customerHandover', label: 'Customer Handover', value: r.customerHandover },
    { key: 'notFound', label: 'Not Found', value: r.notFound },
  ]
})
</script>
