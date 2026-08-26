<template>
  <OpenDocumentTable
    :rows="rows"
    :loading="loading"
    :error="error"
    subtitle="Invoice approved dengan sisa piutang (derived dari AR Aging)"
    party-label="Customer"
    document-label="Invoice"
    search-placeholder="Cari invoice / pelanggan…"
    empty-message="Tidak ada invoice outstanding."
    view-action-label="Lihat Invoice"
    create-payment-label="Catat Pembayaran"
    :can-create-payment="canCreate"
    @refresh="refresh"
    @view="onView"
    @create-payment="onCreatePayment"
  />
</template>

<script setup lang="ts">
import type { OpenDocumentRow } from '~/types/finance/workspace'
import { agingRowToOpenDocument } from '~/utils/finance/agingView'
import { useAgingReport } from '~/composables/useAgingReport'
import { usePermissions } from '~/composables/usePermissions'
import OpenDocumentTable from '~/components/finance/OpenDocumentTable.vue'

const emit = defineEmits<{
  'record-payment': [row: OpenDocumentRow]
}>()

const { userHasPermission, userHasRole } = usePermissions()
const canCreate =
  userHasRole('superadmin') || userHasPermission('create_ar_receipt')

const { report, loading, error, load } = useAgingReport('ar')
const asOf = ref(new Date().toISOString().slice(0, 10))

const rows = computed(() => (report.value?.rows || []).map((r) => agingRowToOpenDocument(r)))

async function refresh() {
  await load({ asOf: asOf.value, force: true })
}

function onView(row: OpenDocumentRow) {
  navigateTo(`/finance/invoices?highlight=${row.id}`)
}

function onCreatePayment(row: OpenDocumentRow) {
  emit('record-payment', row)
}

onMounted(refresh)

defineExpose({ refresh, rows })
</script>
