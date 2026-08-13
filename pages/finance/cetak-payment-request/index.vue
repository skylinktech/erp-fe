<template>
  <CetakDocument
    type="PAYMENT_REQUEST"
    :title="documentTitle"
    :subtitle="requestTypeLabel"
    :document-number="paymentRequest ? (getPaymentRequestNo(paymentRequest) || '') : ''"
    :status="paymentRequest?.status"
    :generated-at="printedAt"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !paymentRequest"
    show-number-under-title
  >
    <template v-if="paymentRequest">

    <div class="d-flex justify-content-between mb-4" style="font-size: 12px;">
      <div class="text-start">
        <p class="mb-1"><strong>Tanggal :</strong> {{ formatDate(paymentRequest.requestDate || paymentRequest.request_date || paymentRequest.createdAt) }}</p>
        <p class="mb-1"><strong>Jatuh Tempo :</strong> {{ formatDate(paymentRequest.dueDate || paymentRequest.due_date) }}</p>
        <p class="mb-1"><strong>Pemohon :</strong> {{ requesterName }}</p>
        <template v-if="isProjectType">
          <p class="mb-1"><strong>Sumber :</strong> {{ sourceLabel }}</p>
          <p class="mb-1"><strong>No. Dokumen Sumber :</strong> {{ paymentRequest.sourceNumber || paymentRequest.source_number || '-' }}</p>
        </template>
        <template v-else>
          <p class="mb-1"><strong>Layanan Aktif :</strong> {{ serviceInstanceLabel }}</p>
        </template>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Prioritas :</strong> {{ (paymentRequest.priority || '-').toUpperCase() }}</p>
        <template v-if="!isProjectType">
          <p class="mb-1"><strong>Customer :</strong> {{ customerName }}</p>
          <p class="mb-1"><strong>Estimasi Durasi :</strong> {{ estimatedDurationLabel }}</p>
        </template>
        <p v-if="paymentRequest.purpose" class="mb-1"><strong>Keperluan :</strong> {{ paymentRequest.purpose }}</p>
      </div>
    </div>

    <template v-if="!isProjectType && employeeRows.length">
      <div class="cetak-payment-request-section-header">Pegawai Terlibat</div>
      <div class="table-responsive mb-4">
        <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
          <thead class="table-dark table-head-white">
            <tr>
              <th class="text-center" style="width: 40px;">No</th>
              <th class="text-start">Nama Pegawai</th>
              <th class="text-end" style="width: 140px;">Gaji /hari</th>
              <th class="text-start">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(emp, idx) in employeeRows" :key="`emp-${idx}`">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start">{{ emp.name }}</td>
              <td class="text-end">{{ emp.salaryLabel }}</td>
              <td class="text-start">{{ emp.notes || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div class="cetak-payment-request-section-header">Informasi Penerima</div>
    <div class="table-responsive mb-4">
      <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
        <tbody>
          <tr>
            <td style="width: 28%;" class="fw-medium">Nama Penerima</td>
            <td>{{ paymentRequest.payeeName || paymentRequest.payee_name || paymentRequest.vendor?.name || '—' }}</td>
            <td style="width: 28%;" class="fw-medium">Bank</td>
            <td>{{ paymentRequest.bankName || paymentRequest.bank_name || '—' }}</td>
          </tr>
          <tr>
            <td class="fw-medium">No. Rekening</td>
            <td>{{ paymentRequest.bankAccountNumber || paymentRequest.bank_account_number || '—' }}</td>
            <td class="fw-medium">Atas Nama</td>
            <td>{{ paymentRequest.bankAccountName || paymentRequest.bank_account_name || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cetak-payment-request-section-header">Rincian Pengajuan</div>
    <div class="table-responsive mb-4">
      <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">Deskripsi</th>
            <th class="text-end" style="width: 70px;">Qty</th>
            <th class="text-end" style="width: 120px;">Nominal</th>
            <th class="text-end" style="width: 130px;">Subtotal</th>
            <th class="text-start">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, idx) in sourceRows" :key="`src-${idx}`">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-start">{{ d.description || '—' }}</td>
            <td class="text-end">{{ Number(d.qty) || 0 }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.unitAmount ?? d.unit_amount) || 0) }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
            <td class="text-start">{{ d.remarks || '—' }}</td>
          </tr>
          <tr v-if="sourceRows.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">Tidak ada item</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="otherRows.length">
      <div class="cetak-payment-request-section-header">Biaya Lainnya</div>
      <div class="table-responsive mb-4">
        <table class="table table-striped cetak-payment-request-table m-0" style="font-size: 12px;">
          <thead class="table-dark table-head-white">
            <tr>
              <th class="text-center" style="width: 40px;">No</th>
              <th class="text-start">Deskripsi</th>
              <th class="text-end" style="width: 70px;">Qty</th>
              <th class="text-end" style="width: 120px;">Nominal</th>
              <th class="text-end" style="width: 130px;">Subtotal</th>
              <th class="text-start">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, idx) in otherRows" :key="`oth-${idx}`">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start">{{ d.description || '—' }}</td>
              <td class="text-end">{{ Number(d.qty) || 0 }}</td>
              <td class="text-end">{{ formatRupiahNum(Number(d.unitAmount ?? d.unit_amount) || 0) }}</td>
              <td class="text-end">{{ formatRupiahNum(Number(d.subtotal) || 0) }}</td>
              <td class="text-start">{{ d.remarks || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-if="sourceRows.length > 0 || otherRows.length > 0 || employeeSalarySubtotal > 0" class="d-flex justify-content-end mb-4">
      <div style="min-width: 280px; font-size: 12px;">
        <div class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">Subtotal sumber</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(sourceSubtotal) }}</span>
        </div>
        <div v-if="otherSubtotal > 0" class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">Biaya lainnya</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(otherSubtotal) }}</span>
        </div>
        <div v-if="employeeSalarySubtotal > 0" class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">Gaji pegawai</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(employeeSalarySubtotal) }}</span>
        </div>
        <div class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">
            Diskon
            <span v-if="discountPercent > 0">({{ discountPercent }}%)</span>
          </span>
          <span class="px-2">:</span>
          <span v-if="discountPercent > 0" class="fw-semibold text-end flex-grow-1">-{{ formatRupiahNum(discountAmount) }}</span>
          <span v-else class="fw-semibold text-end flex-grow-1">-</span>
        </div>
        <div class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">DPP</span>
          <span class="px-2">:</span>
          <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(dppAmount) }}</span>
        </div>
        <template v-if="taxRows.length">
          <div
            v-for="(tax, tIdx) in taxRows"
            :key="tax.id || `tax-${tIdx}`"
            class="mb-2 d-flex"
          >
            <span class="fw-medium" style="min-width: 110px;">
              {{ tax.taxCode }}
              <span v-if="tax.calculationType === 'PERCENTAGE'">({{ Number(tax.rate) }}%)</span>
            </span>
            <span class="px-2">:</span>
            <span class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(tax.amount) }}</span>
          </div>
        </template>
        <div v-else class="mb-2 d-flex">
          <span class="fw-medium" style="min-width: 110px;">
            Pajak / PPN
            <span v-if="taxPercent > 0">({{ taxPercent }}%)</span>
          </span>
          <span class="px-2">:</span>
          <span v-if="taxPercent > 0" class="fw-semibold text-end flex-grow-1">{{ formatRupiahNum(taxAmount) }}</span>
          <span v-else class="fw-semibold text-end flex-grow-1">-</span>
        </div>
        <div class="fw-bold border-top border-dark pt-2 d-flex">
          <span style="min-width: 110px;">Grand Total</span>
          <span class="px-2">:</span>
          <span class="text-end flex-grow-1">{{ formatRupiahNum(getPaymentRequestTotal(paymentRequest)) }}</span>
        </div>
      </div>
    </div>

    <div v-if="notesText" class="cetak-payment-request-description mb-4">
      <div class="cetak-payment-request-terms-header fw-bold text-white">Catatan</div>
      <div class="cetak-payment-request-description-body" style="white-space: pre-wrap;">{{ notesText }}</div>
    </div>

    <div v-if="attachmentUrl" class="cetak-payment-request-description mb-4">
      <div class="cetak-payment-request-terms-header fw-bold text-white">Attachment</div>
      <div class="cetak-payment-request-description-body">
        <a :href="attachmentUrl" target="_blank" rel="noopener noreferrer">{{ attachmentLabel }}</a>
      </div>
    </div>

    <div
      v-if="paymentRequest.status === 'rejected' && (paymentRequest.rejectionReason || paymentRequest.rejectReason)"
      class="alert alert-danger py-2 mb-4"
      style="font-size: 12px"
    >
      <strong>Alasan Penolakan:</strong> {{ paymentRequest.rejectionReason || paymentRequest.rejectReason }}
    </div>

    <div v-if="showSignatureSection" class="signature-section mt-5">
      <CetakSignature
        :key="'sig-' + (paymentRequest.id ?? '')"
        heading="LEMBAR PENGESAHAN"
        caption="Dokumen Payment Request ini telah disetujui dan ditandatangani secara digital."
        document-type="payment-requests"
        :document-id="paymentRequest.id != null ? String(paymentRequest.id) : ''"
        :columns="4"
        :qr-size="96"
        :show-header="false"
        :legacy-signer-name="legacySignerName"
        :legacy-signer-title="legacySignerTitle"
      />
    </div>

    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
})
import { onMounted, computed } from 'vue'
import {
  usePaymentRequestStore,
  getPaymentRequestNo,
  getPaymentRequestTotal,
  getPaymentRequestSourceSubtotal,
  getPaymentRequestOtherSubtotal,
  getPaymentRequestEmployeeSalarySubtotal,
  getPaymentRequestDiscountAmount,
  getPaymentRequestTaxAmount,
  getPaymentRequestTaxes,
  getPaymentRequestSourceItems,
  getPaymentRequestOtherCharges,
  getSourceTypeLabel,
  getRequestTypeLabel,
  formatDurationDaysLabel,
} from '~/stores/payment-request'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

const { setDetailTitle } = useDynamicTitle()
const { getAttachmentUrl } = useImageUrl()

const paymentRequestStore = usePaymentRequestStore()
const route = useRoute()

const { paymentRequest, loading, error } = storeToRefs(paymentRequestStore)

const sourceRows = computed(() => getPaymentRequestSourceItems(paymentRequest.value))
const otherRows = computed(() => getPaymentRequestOtherCharges(paymentRequest.value))

const sourceSubtotal = computed(() => getPaymentRequestSourceSubtotal(paymentRequest.value))
const otherSubtotal = computed(() => getPaymentRequestOtherSubtotal(paymentRequest.value))
const employeeSalarySubtotal = computed(() =>
  getPaymentRequestEmployeeSalarySubtotal(paymentRequest.value)
)
const discountAmount = computed(() => getPaymentRequestDiscountAmount(paymentRequest.value))
const taxAmount = computed(() => getPaymentRequestTaxAmount(paymentRequest.value))
const taxRows = computed(() => getPaymentRequestTaxes(paymentRequest.value))
const discountPercent = computed(() =>
  Number(paymentRequest.value?.discountPercent ?? paymentRequest.value?.discount_percent ?? 0)
)
const taxPercent = computed(() =>
  Number(paymentRequest.value?.taxPercent ?? paymentRequest.value?.tax_percent ?? 0)
)
const dppAmount = computed(() => {
  const stored = Number(paymentRequest.value?.dpp ?? 0)
  if (stored > 0) return stored
  return (
    Math.max(0, sourceSubtotal.value - discountAmount.value) +
    otherSubtotal.value +
    employeeSalarySubtotal.value
  )
})

const requesterName = computed(
  () =>
    paymentRequest.value?.requestedByUser?.fullName ||
    paymentRequest.value?.requestedByUser?.full_name ||
    paymentRequest.value?.createdByUser?.full_name ||
    '-'
)

const sourceLabel = computed(() =>
  getSourceTypeLabel(paymentRequest.value?.sourceType || paymentRequest.value?.source_type)
)

const requestType = computed(
  () => paymentRequest.value?.requestType || paymentRequest.value?.request_type || 'project'
)
const isProjectType = computed(() => requestType.value === 'project')
const requestTypeLabel = computed(() => getRequestTypeLabel(requestType.value))
const documentTitle = computed(() => {
  if (requestType.value === 'operational') return 'OPERATIONAL PAYMENT REQUEST'
  if (requestType.value === 'reimbursement') return 'REIMBURSEMENT REQUEST'
  return 'PAYMENT REQUEST'
})

const serviceInstanceLabel = computed(() => {
  const si = paymentRequest.value?.serviceInstance
  if (!si) return '—'
  const number = si.serviceNumber || si.service_number || ''
  const name = si.serviceName || si.service_name || ''
  return [number, name].filter(Boolean).join(' — ') || '—'
})

const customerName = computed(
  () =>
    paymentRequest.value?.customer?.name ||
    paymentRequest.value?.serviceInstance?.customer?.name ||
    '—'
)

const estimatedDurationLabel = computed(() => {
  const start =
    paymentRequest.value?.estimatedStartDate || paymentRequest.value?.estimated_start_date
  const end = paymentRequest.value?.estimatedEndDate || paymentRequest.value?.estimated_end_date
  const days =
    paymentRequest.value?.estimatedDurationDays ??
    paymentRequest.value?.estimated_duration_days
  if (!start && !end && !days) return '—'
  const range = start || end ? `${formatDate(start)} – ${formatDate(end)}` : ''
  const dayLabel = formatDurationDaysLabel(days)
  return [range, dayLabel !== '—' ? `(${dayLabel})` : ''].filter(Boolean).join(' ') || '—'
})

const employeeRows = computed(() => {
  const rows =
    paymentRequest.value?.employees ||
    paymentRequest.value?.paymentRequestEmployees ||
    []
  if (Array.isArray(rows) && rows.length) {
    return rows.map((e) => {
      const salary = Number(e.salaryAmount ?? e.salary_amount ?? 0) || 0
      return {
        name:
          e.employee?.nm_pegawai ||
          e.employee?.nmPegawai ||
          e.nm_pegawai ||
          e.nmPegawai ||
          (e.employeeId || e.employee_id
            ? `Pegawai #${e.employeeId || e.employee_id}`
            : '—'),
        salaryLabel: salary > 0 ? `${formatRupiahNum(salary)} /hari` : '—',
        notes: e.notes || null,
      }
    })
  }
  const legacy = paymentRequest.value?.employee
  if (legacy?.nm_pegawai || legacy?.nmPegawai) {
    return [{ name: legacy.nm_pegawai || legacy.nmPegawai, salaryLabel: '—', notes: null }]
  }
  return []
})

const notesText = computed(() => {
  const notes = (paymentRequest.value?.notes ?? '') + ''
  return notes.trim() || ''
})

const attachmentUrl = computed(() => {
  const path = paymentRequest.value?.attachment
  return path ? getAttachmentUrl(path) : null
})
const attachmentLabel = computed(() => {
  const path = paymentRequest.value?.attachment || ''
  const name = String(path).split('/').pop() || 'Lihat / Unduh File'
  return decodeURIComponent(name.split('?')[0] || name)
})

const showSignatureSection = computed(
  () => paymentRequest.value?.status === 'approved' || paymentRequest.value?.status === 'completed'
)

const legacySignerName = computed(
  () =>
    paymentRequest.value?.approvedByUser?.fullName ??
    paymentRequest.value?.approvedByUser?.full_name ??
    null
)
const legacySignerTitle = computed(() => {
  const user = paymentRequest.value?.approvedByUser
  return user?.roles?.[0]?.name ?? null
})

const printedAt = computed(() => new Date().toLocaleString('id-ID'))

function formatRupiahNum(val) {
  if (val === null || val === undefined || val === '') return '-'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '-'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
    Math.round(n)
  )
}

function formatDate(val) {
  if (!val) return '-'
  try {
    const raw = String(val)
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`

    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch {
    return String(val)
  }
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      await paymentRequestStore.getPaymentRequestDetails(String(id))
      if (paymentRequest.value) {
        const typeLabel = getRequestTypeLabel(
          paymentRequest.value.requestType || paymentRequest.value.request_type
        )
        setDetailTitle(
          `Cetak ${typeLabel} - ${getPaymentRequestNo(paymentRequest.value)}`
        )
      }
    } catch (e) {
      console.error('Cetak Payment Request load error:', e)
    }
  }
})
</script>

<style scoped>
.cetak-payment-request-section-header {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 0;
}
.cetak-payment-request-table {
  border-color: var(--print-table-outline, #e5e7eb);
}
.cetak-payment-request-table thead th {
  white-space: nowrap;
  background-color: var(--print-table-header, #3b4056);
  color: #fff;
}
.cetak-payment-request-table tbody tr:nth-child(odd) > * {
  background-color: var(--print-stripe, #f4f5f7) !important;
  --bs-table-bg-type: var(--print-stripe, #f4f5f7);
  box-shadow: none !important;
}
.cetak-payment-request-table tbody tr:nth-child(even) > * {
  background-color: #fff !important;
  --bs-table-bg-type: #fff;
  box-shadow: none !important;
}
.table-head-white {
  color: #fff;
}
.cetak-payment-request-grand-total td {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
}
.cetak-payment-request-terms-header {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
.cetak-payment-request-description-body {
  font-size: 12px;
  border: none;
  padding: 12px;
  min-height: 60px;
}
</style>

<style>
@media print {
  .cetak-payment-request-table tbody tr:nth-child(odd) > * {
    background-color: var(--print-stripe, #f4f5f7) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-payment-request-table tbody tr:nth-child(even) > * {
    background-color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cetak-payment-request-table thead th,
  .cetak-payment-request-section-header,
  .cetak-payment-request-grand-total td,
  .cetak-payment-request-terms-header {
    background-color: var(--print-table-header, #3b4056) !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
