<template>
  <div v-if="hasContent" class="cetak-notes cetak-section">
    <div class="cetak-section__title">{{ title }}</div>
    <div v-if="html" class="cetak-notes__body prose" v-html="html" />
    <div v-else class="cetak-notes__body">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    text?: string
    html?: string
  }>(),
  {
    title: 'Notes',
    text: '',
    html: '',
  }
)

const slots = useSlots()

const hasContent = computed(() => {
  if (props.html && String(props.html).trim()) return true
  if (props.text && String(props.text).trim()) return true
  return Boolean(slots.default)
})
</script>
