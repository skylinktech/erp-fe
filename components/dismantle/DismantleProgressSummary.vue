<template>
  <div class="d-flex flex-wrap gap-2 align-items-center">
    <span :class="statusBadge.class" :title="`Status: ${statusBadge.text}`">{{ statusBadge.text }}</span>
    <span v-if="phase" class="text-muted small">Progress:</span>
    <span v-if="phase" :class="phaseBadge.class">{{ phaseBadge.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getDismantlePhaseBadge, getDismantleStatusBadge } from '~/utils/dismantleLabels'

const props = defineProps<{
  status: string
  phase?: string | null
}>()

const statusBadge = computed(() => getDismantleStatusBadge(props.status))
const phaseBadge = computed(() => getDismantlePhaseBadge(props.phase))
</script>
