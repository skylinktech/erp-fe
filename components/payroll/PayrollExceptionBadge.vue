<template>
  <span :class="badge.class">{{ badge.text }}</span>
</template>
<script setup lang="ts">
const props = defineProps<{ severity?: string | null }>()
const { statusBadge } = usePayrollStatus()
const badge = computed(() => statusBadge(props.severity || 'WARNING'))
</script>
