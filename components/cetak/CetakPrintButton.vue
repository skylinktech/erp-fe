<template>
  <button
    type="button"
    class="btn btn-primary no-print cetak-print-btn"
    aria-label="Print"
    @click="onPrint"
  >
    <i class="ri-printer-line me-1"></i>
    Print
  </button>
</template>

<script setup lang="ts">
function onPrint() {
  if (typeof window !== 'undefined') {
    window.print()
  }
}
</script>
