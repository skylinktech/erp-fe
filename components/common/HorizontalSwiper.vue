<template>
  <div class="horizontal-swiper" :class="customClass">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  /**
   * Class tambahan untuk styling khusus per penggunaan.
   */
  customClass: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<style scoped>
.horizontal-swiper {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 16px;
  -webkit-overflow-scrolling: touch;
}

.horizontal-swiper::-webkit-scrollbar {
  height: 8px;
}

.horizontal-swiper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.horizontal-swiper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.horizontal-swiper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

