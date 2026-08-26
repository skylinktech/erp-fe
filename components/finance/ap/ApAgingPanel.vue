<template>
  <AgingReportPanel
    side="ap"
    party-column-label="Vendor"
    document-column-label="AP Invoice"
    by-document-label="By Invoice"
    by-party-label="By Vendor"
    search-placeholder="Cari invoice / vendor…"
    count-label="invoice"
    empty-message="Tidak ada hutang pada filter ini."
  />
</template>

<script setup lang="ts">
import AgingReportPanel from '~/components/finance/AgingReportPanel.vue'
</script>
