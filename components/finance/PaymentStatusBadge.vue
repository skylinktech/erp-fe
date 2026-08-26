<template>
  <span class="badge" :class="paymentStatusBadgeClass(status)">{{ display }}</span>
</template>

<script setup lang="ts">
import type { PaymentStatus } from '~/types/finance/workspace'
import { paymentStatusBadgeClass } from '~/utils/finance/agingView'

const props = defineProps<{
  status: PaymentStatus
}>()

const display = computed(() => {
  switch (props.status) {
    case 'paid':
      return 'PAID'
    case 'partial':
      return 'PARTIAL'
    default:
      return 'UNPAID'
  }
})
</script>
