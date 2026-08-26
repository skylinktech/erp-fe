<template>
  <span class="badge" :class="agingBucketBadgeClass(bucket)">{{ label || bucket }}</span>
</template>

<script setup lang="ts">
import { agingBucketBadgeClass } from '~/utils/finance/agingView'

defineProps<{
  bucket: string
  label?: string
}>()
</script>
