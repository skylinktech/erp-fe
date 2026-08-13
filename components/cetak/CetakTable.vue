<template>
  <div class="cetak-table-wrap table-responsive mb-4">
    <table class="table table-striped cetak-table m-0" :class="tableClass">
      <thead v-if="$slots.head" class="table-dark table-head-white">
        <slot name="head" />
      </thead>
      <tbody>
        <slot />
      </tbody>
      <tfoot v-if="$slots.foot">
        <slot name="foot" />
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tableClass?: string
  }>(),
  {
    tableClass: '',
  }
)
</script>
