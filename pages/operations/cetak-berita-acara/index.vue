<template>
  <CetakDocument
    type="BERITA_ACARA"
    :document-number="beritaAcara ? getBeritaAcaraNo(beritaAcara) : ''"
    :status="beritaAcara?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !beritaAcara"
  >
    <template v-if="beritaAcara">
      <CetakInfoGrid
        :left="[
          { label: 'CUSTOMER', value: customerName },
          { label: 'PARTNER', value: partnerName },
          { label: 'NO. KONTRAK', value: contractNo },
          { label: 'PEMOHON', value: requesterName },
          { label: 'STATUS', value: statusLabel(beritaAcara.status, beritaAcara) },
        ]"
        :right="[
          { label: 'NO. BA', value: getBeritaAcaraNo(beritaAcara) || '—' },
          { label: 'TANGGAL BA', value: documentDateLabel },
          { label: 'PERIODE', value: periodLabel },
          { label: 'HARI', value: dayName },
        ]"
      />

      <p class="mb-4" style="font-size: 12px;">
        Pada hari ini <strong>{{ dayName }}</strong> tanggal <strong>{{ documentDay }}</strong>
        bulan <strong>{{ documentMonthName }}</strong> tahun <strong>{{ documentYear }}</strong>,
        yang bertanda tangan dibawah ini, menerangkan bahwa antara
        <strong>{{ customerName }}</strong> dengan <strong>{{ partnerName }}</strong>
        berdasarkan perjanjian kerjasama NOMOR :
        <strong>{{ contractNo }}</strong>
        Availability link koneksi pada periode
        <strong>{{ periodLabel }}</strong>
        adalah sebagai berikut :
      </p>

      <CetakTable>
        <template #head>
          <tr>
            <th class="text-center" style="width: 40px;">No</th>
            <th class="text-start">PID</th>
            <th class="text-start">Lokasi</th>
            <th class="text-center">Bandwith (Kbps)</th>
            <th class="text-center">Uptime Status</th>
            <th class="text-center">Average Ping Time (msec)</th>
            <th class="text-start">Keterangan</th>
          </tr>
        </template>
        <tr v-for="(item, idx) in items" :key="item.id || idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="cetak-desc">{{ item.pid || '—' }}</td>
          <td class="cetak-desc">{{ item.lokasi || '—' }}</td>
          <td class="text-center">{{ item.bandwidth || '—' }}</td>
          <td class="text-center">{{ item.uptimeStatus || item.uptime_status || '—' }}</td>
          <td class="text-center">{{ item.averagePing ?? item.average_ping ?? '—' }}</td>
          <td class="cetak-desc">{{ item.keterangan || '—' }}</td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="7" class="text-center py-4 text-muted">Tidak ada data performansi</td>
        </tr>
      </CetakTable>

      <CetakNotes title="Note" :text="notes" />

      <CetakSignature
        :show="showSignatureSection"
        heading="LEMBAR PENGESAHAN"
        caption="Dokumen Berita Acara Performansi ini telah diajukan dan ditandatangani secara digital sesuai alur persetujuan yang berlaku."
        document-type="berita-acara"
        :document-id="String(beritaAcara.id)"
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
  title: 'Cetak Berita Acara',
})

import { onMounted, computed } from 'vue'
import {
  useBeritaAcaraStore,
  getBeritaAcaraNo,
} from '~/stores/berita-acara'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function parseDateOnly(raw) {
  if (!raw) return null
  const s = String(raw).slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDateShort(raw) {
  const d = parseDateOnly(raw)
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const { setDetailTitle } = useDynamicTitle()
const store = useBeritaAcaraStore()
const route = useRoute()
const { beritaAcara, loading, error } = storeToRefs(store)

const customerName = computed(() => beritaAcara.value?.customer?.name || '—')
const partnerName = computed(() =>
  beritaAcara.value?.partnerName || beritaAcara.value?.partner_name || 'SKYLINK'
)
const contractNo = computed(() =>
  beritaAcara.value?.contractNo || beritaAcara.value?.contract_no || '—'
)
const notes = computed(() => (beritaAcara.value?.notes || '').trim())
const items = computed(() => beritaAcara.value?.items || [])
const requesterName = computed(() =>
  beritaAcara.value?.requestedByUser?.fullName
  || beritaAcara.value?.requestedByUser?.full_name
  || beritaAcara.value?.createdByUser?.fullName
  || beritaAcara.value?.createdByUser?.full_name
  || '—'
)
const documentDate = computed(() =>
  parseDateOnly(beritaAcara.value?.documentDate || beritaAcara.value?.document_date)
)
const documentDateLabel = computed(() =>
  formatDateShort(beritaAcara.value?.documentDate || beritaAcara.value?.document_date)
)
const dayName = computed(() => {
  if (!documentDate.value) return '—'
  return DAY_NAMES[documentDate.value.getDay()] ?? '—'
})
const documentDay = computed(() => {
  if (!documentDate.value) return '—'
  return String(documentDate.value.getDate()).padStart(2, '0')
})
const documentMonthName = computed(() => {
  if (!documentDate.value) return '—'
  return MONTH_NAMES[documentDate.value.getMonth()] || '—'
})
const documentYear = computed(() => {
  if (!documentDate.value) return '—'
  return String(documentDate.value.getFullYear())
})

function formatPeriodPart(raw) {
  const d = parseDateOnly(raw)
  if (!d) return raw ? String(raw) : null
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

const periodLabel = computed(() => {
  const start = formatPeriodPart(beritaAcara.value?.periodStart || beritaAcara.value?.period_start)
  const end = formatPeriodPart(beritaAcara.value?.periodEnd || beritaAcara.value?.period_end)
  if (!start || !end) return '—'
  return `${start} - ${end}`
})

const showSignatureSection = computed(() => {
  const status = beritaAcara.value?.status
  return status === 'pending' || status === 'approved' || status === 'completed'
})
const legacySignerName = computed(() =>
  beritaAcara.value?.approvedByUser?.fullName || beritaAcara.value?.approvedByUser?.full_name || null
)
const legacySignerTitle = computed(() => beritaAcara.value?.approvedByUser?.roles?.[0]?.name || null)

function statusLabel(status, row) {
  if (status === 'approved' && row?.approvedByUser?.fullName) {
    return 'Approved by ' + row.approvedByUser.fullName
  }
  if (status === 'approved' && row?.approvedByUser?.full_name) {
    return 'Approved by ' + row.approvedByUser.full_name
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
    await store.getBeritaAcaraDetails(String(id))
    if (beritaAcara.value) {
      setDetailTitle('Cetak Berita Acara - ' + getBeritaAcaraNo(beritaAcara.value))
    }
  } catch (e) {
    console.error('Cetak Berita Acara load error:', e)
  }
})
</script>
