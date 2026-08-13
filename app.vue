<template>
  <div>
    <!-- ✅ Nuxt Loading Indicator untuk transisi halaman -->
    <NuxtLoadingIndicator color="#008fec" :height="3" :duration="2000" :throttle="200" />
    
    <LoadingOverlay />
    
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page' }" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// ✅ App.vue with proper loading indicator
// NuxtLoadingIndicator akan tampil otomatis saat navigasi
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>