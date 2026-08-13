<template>
  <CetakDocument
    type="FDR"
    :document-number="fdr?.fdrNumber || ''"
    :status="fdr?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !fdr"
  >
    <FdrPrintContent v-if="fdr" :fdr="fdr" />
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted } from 'vue'
import { useFdrStore } from '~/stores/fdr'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import FdrPrintContent from '~/components/cetak/documents/FdrPrintContent.vue'

const { setDetailTitle } = useDynamicTitle()
const fdrStore = useFdrStore()
const route = useRoute()
const { fdr, loading, error } = storeToRefs(fdrStore)

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await fdrStore.getFdrDetails(String(id))
      if (fdr.value) {
        setDetailTitle('Cetak FDR - ' + fdr.value.fdrNumber)
      }
    } catch (e) {
      console.error('Cetak FDR load error:', e)
    }
  }
})
</script>
