<template>
  <div class="row g-3 mb-4">
    <div v-for="b in buckets" :key="b.key" class="col-md">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">{{ b.label }}</div>
          <div class="fs-5 fw-semibold">{{ formatFinanceMoney(b.amount) }}</div>
          <div class="small text-muted">{{ b.count }} {{ countLabel }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showTotal" class="card mb-3">
    <div class="card-body d-flex justify-content-between">
      <span>Total outstanding</span>
      <strong>{{ formatFinanceMoney(totalAmount) }} ({{ totalCount }})</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AgingBucketSummary } from '~/types/finance/workspace'
import { formatFinanceMoney } from '~/utils/finance/agingView'

withDefaults(
  defineProps<{
    buckets: AgingBucketSummary[]
    totalAmount?: number
    totalCount?: number
    countLabel?: string
    showTotal?: boolean
  }>(),
  {
    totalAmount: 0,
    totalCount: 0,
    countLabel: 'dokumen',
    showTotal: true,
  }
)
</script>
