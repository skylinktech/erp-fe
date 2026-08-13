<template>
  <footer class="cetak-footer" aria-label="Document footer">
    <span class="cetak-footer__left">{{ leftText }}</span>
    <span v-if="centerText" class="cetak-footer__center">{{ centerText }}</span>
    <span class="cetak-footer__right">{{ rightText }}</span>
  </footer>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    documentNumber?: string
    footerBrand?: string
    revision?: string
    generatedAt?: string
    showPageNumber?: boolean
  }>(),
  {
    documentNumber: '',
    footerBrand: 'Skylink',
    revision: '',
    generatedAt: '',
    showPageNumber: true,
  }
)

const leftText = computed(() => {
  const numberPart = props.documentNumber ? ` (${props.documentNumber})` : ''
  return `${props.title}${numberPart} ${props.footerBrand}`.trim()
})

const centerText = computed(() => {
  const parts: string[] = []
  if (props.revision) parts.push(`Rev. ${props.revision}`)
  if (props.generatedAt) parts.push(props.generatedAt)
  return parts.join(' · ')
})

const rightText = computed(() => {
  // Chromium does not reliably expose CSS page counters to the DOM.
  // Page x/y is provided via @page margin boxes when the engine supports them.
  return props.showPageNumber ? '' : ''
})
</script>
