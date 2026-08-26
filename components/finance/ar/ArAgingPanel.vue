<template>
  <AgingReportPanel
    side="ar"
    party-column-label="Customer"
    document-column-label="Invoice"
    by-document-label="By Invoice"
    by-party-label="By Customer"
    search-placeholder="Cari invoice / pelanggan…"
    count-label="invoice"
    empty-message="Tidak ada piutang pada filter ini."
  />
</template>

<script setup lang="ts">
import AgingReportPanel from '~/components/finance/AgingReportPanel.vue'
</script>
