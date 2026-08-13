<template>
  <CetakDocument
    type="MATERIAL_REQUEST"
    :document-number="materialRequest ? getMaterialRequestNo(materialRequest) : ''"
    :status="materialRequest?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !materialRequest"
  >
    <template v-if="materialRequest">
      <CetakInfoGrid :left="infoLeft" :right="infoRight" />

      <CetakTable>
        <template #head>
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Material</th>
            <th class="text-start">Spesifikasi</th>
            <th class="text-end" style="width: 60px;">Qty</th>
            <th class="text-start" style="width: 70px;">Satuan</th>
            <th class="text-end" style="width: 110px;">Harga</th>
            <th class="text-end" style="width: 120px;">Subtotal</th>
          </tr>
        </template>
        <tr v-for="(d, idx) in tableRows" :key="d.id || idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="cetak-desc">{{ itemLabel(d) }}</td>
          <td class="cetak-desc">{{ d.specification || '—' }}</td>
          <td class="cetak-num">{{ Number(d.qty ?? d.quantity) || 0 }}</td>
          <td>{{ d.uom?.symbol || d.uom?.name || '—' }}</td>
          <td class="cetak-num">{{ formatRupiahNum(Number(d.estimatedPrice ?? d.estimated_price ?? d.unitPrice) || 0) }}</td>
          <td class="cetak-num">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
        </tr>
        <tr v-if="tableRows.length > 0" class="cetak-table__total">
          <td colspan="6" class="text-end">Grand Total</td>
          <td class="cetak-num">{{ formatRupiahNum(getMaterialRequestTotal(materialRequest)) }}</td>
        </tr>
        <tr v-if="tableRows.length === 0">
          <td colspan="7" class="text-center py-4 text-muted">Tidak ada item</td>
        </tr>
      </CetakTable>

      <CetakNotes title="Deskripsi" :html="descriptionHtml" />

      <CetakSignature
        :show="showSignatureSection"
        heading="LEMBAR PENGESAHAN"
        caption="Dokumen Material Request Form ini telah disetujui dan ditandatangani secara digital."
        document-type="material-requests"
        :document-id="materialRequest.id != null ? String(materialRequest.id) : ''"
        :legacy-signature-token="materialRequest.signatureToken || undefined"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})
import { onMounted, computed } from 'vue'
import { useMaterialRequestStore, getMaterialRequestNo, getMaterialRequestTotal, getMaterialRequestItemsList } from '~/stores/material-request'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setDetailTitle } = useDynamicTitle()
const materialRequestStore = useMaterialRequestStore()
const route = useRoute()
const { materialRequest, loading, error } = storeToRefs(materialRequestStore)

const tableRows = computed(() => getMaterialRequestItemsList(materialRequest.value))

const siteInvestmentLabel = computed(() => {
  const si = materialRequest.value?.siteInvestment
  if (!si) return '—'
  return si.siNumber || si.si_number || '—'
})

const projectLabel = computed(() => {
  const si = materialRequest.value?.siteInvestment
  if (!si) return '—'
  const name = si.name || si.projectName || si.project_name || ''
  const customer = si.customer?.name || ''
  return [name, customer ? `(${customer})` : ''].filter(Boolean).join(' ') || '—'
})

const descriptionHtml = computed(() => {
  const desc = (materialRequest.value?.purpose ?? materialRequest.value?.notes ?? '') + ''
  return desc.trim() || ''
})

const showSignatureSection = computed(() => materialRequest.value?.status === 'approved')
const legacySignerName = computed(() => materialRequest.value?.approvedByUser?.fullName ?? materialRequest.value?.approvedByUser?.full_name ?? null)
const legacySignerTitle = computed(() => materialRequest.value?.approvedByUser?.roles?.[0]?.name ?? null)

const infoLeft = computed(() => {
  const mr = materialRequest.value
  if (!mr) return []
  const items = [
    { label: 'No. Material Request', value: getMaterialRequestNo(mr) || '—' },
    { label: 'Tanggal Request', value: formatDate(mr.requestDate || mr.request_date || mr.createdAt) },
    { label: 'Pemohon', value: mr.requestedByUser?.fullName || mr.requestedByUser?.full_name || mr.createdByUser?.full_name || '—' },
    { label: 'Site Investment', value: siteInvestmentLabel.value },
    { label: 'Proyek', value: projectLabel.value },
  ]
  if (mr.purpose) items.push({ label: 'Keperluan', value: mr.purpose })
  return items
})

const infoRight = computed(() => {
  const mr = materialRequest.value
  if (!mr) return []
  return [
    { label: 'Prioritas', value: (mr.priority || '—').toUpperCase() },
    { label: 'Status', value: statusLabel(mr.status) },
  ]
})

function formatRupiahNum (val) {
  if (val === null || val === undefined || val === '') return '-'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '-'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n))
}

function formatDate (val) {
  if (!val) return '-'
  const d = typeof val === 'string' ? new Date(val) : val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel (s) {
  const map = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
  return s ? (map[s] || s) : '-'
}

function itemLabel (d) {
  return d?.productName || d?.product_name || d?.product?.name || '—'
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await materialRequestStore.getMaterialRequestDetails(String(id))
      if (materialRequest.value) {
        setDetailTitle('Cetak Material Request - ' + getMaterialRequestNo(materialRequest.value))
      }
    } catch (e) {
      console.error('Cetak Material Request load error:', e)
    }
  }
})
</script>
