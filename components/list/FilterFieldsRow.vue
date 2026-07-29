<template>
  <div class="filter-fields-row" :class="columnsClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Number,
    default: null,
  },
})

const columnsClass = computed(() =>
  props.columns ? `filter-fields-row--cols-${props.columns}` : null
)
</script>
