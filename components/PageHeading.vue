<template>
  <div v-if="!hidden" class="app-page-heading mb-4">
    <h4 class="fw-bold mb-1">{{ title }}</h4>
    <PageBreadcrumb />
  </div>
</template>

<script setup lang="ts">
const { hidden, title } = usePageHeading()
</script>

<style scoped>
.app-page-heading h4 {
  color: #080808;
}
</style>
