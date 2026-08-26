<template>
  <OpenDocumentTable
    :rows="rows"
    :loading="loading"
    :error="error"
    subtitle="Tagihan vendor dengan sisa hutang (derived dari AP Aging)"
    party-label="Vendor"
    document-label="AP Invoice"
    search-placeholder="Cari invoice / vendor…"
    empty-message="Tidak ada tagihan vendor outstanding."
    view-action-label="Lihat AP Invoice"
    create-payment-label="Buat Pembayaran"
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
  'create-payment': [row: OpenDocumentRow]
}>()

const { userHasPermission, userHasRole } = usePermissions()
const canCreate =
  userHasRole('superadmin') || userHasPermission('create_ap_payment')

const { report, loading, error, load } = useAgingReport('ap')
const asOf = ref(new Date().toISOString().slice(0, 10))

const rows = computed(() => (report.value?.rows || []).map((r) => agingRowToOpenDocument(r)))

async function refresh() {
  await load({ asOf: asOf.value, force: true })
}

function onView(row: OpenDocumentRow) {
  navigateTo(`/purchasing/purchase-invoice?highlight=${row.id}`)
}

function onCreatePayment(row: OpenDocumentRow) {
  emit('create-payment', row)
}

onMounted(refresh)

defineExpose({ refresh, rows })
</script>
