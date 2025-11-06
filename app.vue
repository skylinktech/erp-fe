<template>
  <div>
    <LoadingOverlay />
    <NuxtLayout>
      <NuxtPage :key="$route.fullPath" :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// ✅ Key binding pada NuxtPage akan memaksa component re-render saat route berubah
// Ini penting untuk memastikan halaman cetak selalu load data fresh
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>