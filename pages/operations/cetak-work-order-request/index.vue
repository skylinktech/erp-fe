<template>
  <CetakDocument
    type="WORK_ORDER_REQUEST"
    :document-number="workOrderRequest ? getWorkOrderRequestNo(workOrderRequest) : ''"
    :status="workOrderRequest?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !workOrderRequest"
  >
    <template v-if="workOrderRequest">
      <CetakInfoGrid
        :left="[
          { label: 'PROJECT / SITE', value: workOrderRequest.siteName || workOrderRequest.site_name || '—' },
          { label: 'CLIENT', value: clientName },
          { label: 'PEMOHON', value: requesterName },
          { label: 'STATUS', value: statusLabel(workOrderRequest.status, workOrderRequest) },
        ]"
        :right="[
          { label: 'NO. WOR', value: getWorkOrderRequestNo(workOrderRequest) || '—' },
          { label: 'TANGGAL REQUEST', value: workOrderRequest.requestDate || workOrderRequest.request_date || '—' },
          { label: 'JENIS PEKERJAAN', value: jobTypeLabel(workOrderRequest.jobType ?? workOrderRequest.job_type) },
          { label: 'URGENCY', value: urgencyFullLabel(workOrderRequest.urgencyLevel ?? workOrderRequest.urgency_level) },
        ]"
      />

      <CetakTable>
        <template #head>
          <tr>
            <th class="text-start" style="width: 28%;">FIELD</th>
            <th class="text-start">KETERANGAN</th>
          </tr>
        </template>
        <tr class="cetak-table__section">
          <td colspan="2" class="text-start">INFORMASI SITE</td>
        </tr>
        <tr v-if="siNumber">
          <td class="text-start">Site Investment (SI)</td>
          <td class="text-start"><strong>{{ siNumber }}</strong> — {{ siName }}</td>
        </tr>
        <tr>
          <td class="text-start">Lokasi</td>
          <td class="cetak-desc">{{ workOrderRequest.location || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">PIC Lokasi</td>
          <td class="cetak-desc">{{ workOrderRequest.picName || workOrderRequest.pic_name || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">No. HP PIC</td>
          <td>{{ workOrderRequest.picPhone || workOrderRequest.pic_phone || '—' }}</td>
        </tr>
        <tr class="cetak-table__section">
          <td colspan="2" class="text-start">DETAIL PEKERJAAN</td>
        </tr>
        <tr>
          <td class="text-start">Target Pelaksanaan</td>
          <td>{{ workOrderRequest.targetDate || workOrderRequest.target_date || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">Estimasi Durasi</td>
          <td>{{ workOrderRequest.estimatedDuration || workOrderRequest.estimated_duration || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">Deskripsi Pekerjaan</td>
          <td class="cetak-desc">{{ workOrderRequest.jobDescription || workOrderRequest.job_description || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">Indikasi Gangguan</td>
          <td class="cetak-desc">{{ workOrderRequest.faultIndication || workOrderRequest.fault_indication || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">Catatan</td>
          <td class="cetak-desc">{{ workOrderRequest.notes || '—' }}</td>
        </tr>
      </CetakTable>

      <CetakSignature
        :show="showSignatureSection"
        heading="LEMBAR PENGESAHAN"
        caption="Dokumen Work Order Request ini telah diajukan dan ditandatangani secara digital sesuai alur persetujuan yang berlaku."
        document-type="work-order-requests"
        :document-id="String(workOrderRequest.id)"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
  title: 'Cetak Work Order Request',
})

import { onMounted, computed } from 'vue'
import {
  useWorkOrderRequestStore,
  getWorkOrderRequestNo,
  JOB_TYPE_LABELS,
  URGENCY_LABELS,
} from '~/stores/work-order-request'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setDetailTitle } = useDynamicTitle()
const store = useWorkOrderRequestStore()
const route = useRoute()
const { workOrderRequest, loading, error } = storeToRefs(store)

const siData = computed(() =>
  workOrderRequest.value?.siteInvestment ?? workOrderRequest.value?.site_investment ?? null
)
const siNumber = computed(() => siData.value?.siNumber || siData.value?.si_number || '')
const siName = computed(() => siData.value?.name || '—')
const clientName = computed(() =>
  workOrderRequest.value?.client?.name || siData.value?.customer?.name || '—'
)
const requesterName = computed(() =>
  workOrderRequest.value?.requestedByUser?.fullName
  || workOrderRequest.value?.requestedByUser?.full_name
  || workOrderRequest.value?.createdByUser?.fullName
  || workOrderRequest.value?.createdByUser?.full_name
  || '—'
)
const showSignatureSection = computed(() => {
  const status = workOrderRequest.value?.status
  return status === 'pending' || status === 'approved' || status === 'completed'
})
const legacySignerName = computed(() =>
  workOrderRequest.value?.approvedByUser?.fullName
  || workOrderRequest.value?.approvedByUser?.full_name
  || null
)
const legacySignerTitle = computed(() => workOrderRequest.value?.approvedByUser?.roles?.[0]?.name || null)

function jobTypeLabel(type) {
  return JOB_TYPE_LABELS[type] ?? (type ? String(type).toUpperCase() : '—')
}
function urgencyFullLabel(level) {
  return URGENCY_LABELS[level] ?? level ?? '—'
}
function statusLabel(status, wor) {
  if (status === 'approved' && wor?.approvedByUser?.fullName) {
    return 'Approved by ' + wor.approvedByUser.fullName
  }
  if (status === 'approved' && wor?.approvedByUser?.full_name) {
    return 'Approved by ' + wor.approvedByUser.full_name
  }
  const map = {
    draft: 'Draft',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  }
  return status ? (map[status] || status) : '—'
}

onMounted(async () => {
  const id = route.query.id
  if (!id) return
  try {
    await store.getWorkOrderRequestDetails(String(id))
    if (workOrderRequest.value) {
      setDetailTitle('Cetak Work Order Request - ' + getWorkOrderRequestNo(workOrderRequest.value))
    }
  } catch (e) {
    console.error('Cetak WOR load error:', e)
  }
})
</script>
