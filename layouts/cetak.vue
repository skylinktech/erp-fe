<template>
  <div class="cetak-layout">
    <!--
      position: fixed → browser repeats overlay on every printed page.
      Outside .invoice-print so global print color resets do not mute it.
    -->
    <div
      v-if="showDraftWatermark"
      class="cetak-draft-watermark"
      aria-hidden="true"
    >
      <span class="cetak-draft-watermark__text">DRAFT</span>
    </div>

    <div class="invoice-print p-6">
      <Head>
        <Title>{{ title ? title + ' - Sinergi Innovate Pratama' : 'Sinergi Innovate Pratama' }}</Title>
        <Link rel="stylesheet" href="/vendor/css/pages/app-invoice-print.css" />
      </Head>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useCetakDraftWatermarkVisible } from '~/composables/useCetakDraftWatermark'

const route = useRoute()
const title = route.meta.title
const showDraftWatermark = useCetakDraftWatermarkVisible()
</script>

<style>
.cetak-draft-watermark {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
  user-select: none;
}

.cetak-draft-watermark__text {
  font-family: Impact, Haettenschweiler, 'Arial Black', sans-serif;
  font-size: clamp(96px, 28vw, 220px);
  font-weight: 900;
  letter-spacing: 0.12em;
  line-height: 1;
  color: rgba(180, 20, 20, 0.18);
  transform: rotate(-35deg);
  white-space: nowrap;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@media print {
  .cetak-draft-watermark {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
  }

  .cetak-draft-watermark__text {
    color: rgba(180, 20, 20, 0.22) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
