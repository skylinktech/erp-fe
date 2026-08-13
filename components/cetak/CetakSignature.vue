<template>
  <div v-if="show" class="cetak-signature signature-section">
    <h2
      v-if="heading"
      class="text-center fw-bold mb-3"
      style="font-size: 16px;"
    >
      {{ heading }}
    </h2>
    <p
      v-if="caption"
      class="text-center mb-0"
      style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto;"
    >
      {{ caption }}
    </p>
    <MultiSignatureDisplay
      :document-type="documentType"
      :document-id="documentId"
      :columns="columns"
      :qr-size="qrSize"
      :compact="compact"
      :show-header="showHeader"
      :show-approved-by-label="showApprovedByLabel"
      :legacy-signature-token="legacySignatureToken"
      :legacy-signer-name="legacySignerName"
      :legacy-signer-title="legacySignerTitle"
      :title="title"
    />
  </div>
</template>

<script setup lang="ts">
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

withDefaults(
  defineProps<{
    show?: boolean
    heading?: string
    caption?: string
    documentType: string
    documentId: string | number
    columns?: number
    qrSize?: number
    compact?: boolean
    showHeader?: boolean
    showApprovedByLabel?: boolean
    legacySignatureToken?: string
    legacySignerName?: string
    legacySignerTitle?: string
    title?: string
  }>(),
  {
    show: true,
    heading: '',
    caption: '',
    columns: 4,
    qrSize: 96,
    compact: true,
    showHeader: false,
    showApprovedByLabel: false,
    legacySignatureToken: undefined,
    legacySignerName: undefined,
    legacySignerTitle: undefined,
    title: 'Verifikasi Digital Dokumen',
  }
)
</script>
