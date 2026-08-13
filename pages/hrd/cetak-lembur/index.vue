<template>
  <CetakDocument
    type="LEMBUR"
    :document-number="lembur ? `#${lembur.id}` : ''"
    :status="lembur?.status"
    :company="perusahaan"
    :generated-at="printedAt"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !lembur"
  >
    <template v-if="lembur">
    <div class="d-flex justify-content-between mb-3" style="font-size: 12px">
      <div>
        <p class="mb-1"><strong>No. Pengajuan :</strong> #{{ lembur.id }}</p>
        <p class="mb-1"><strong>Nama Pegawai :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>Yang Mengajukan :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>NIK :</strong> {{ pegawaiNik }}</p>
        <p class="mb-1"><strong>Jabatan :</strong> {{ pegawaiJabatan }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel }}</p>
        <p class="mb-1"><strong>Tanggal Lembur :</strong> {{ formatDate(lembur.tanggal) }}</p>
        <p v-if="lembur.submittedAt" class="mb-1"><strong>Diajukan :</strong> {{ formatDateTime(lembur.submittedAt) }}</p>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-lembur-table m-0" style="font-size: 12px">
        <thead>
          <tr>
            <th class="cetak-lembur-th text-center" style="width: 36px">No</th>
            <th class="cetak-lembur-th">Keterangan</th>
            <th class="cetak-lembur-th">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="text-center">1</td><td>Tipe hari</td><td>{{ getTipeHariLabel(lembur.tipeHari ?? lembur.tipe_hari) }}</td></tr>
          <tr><td class="text-center">2</td><td>Jam lembur</td><td>{{ jamLabel }}</td></tr>
          <tr><td class="text-center">3</td><td>Istirahat</td><td>{{ lembur.istirahatMenit ?? lembur.istirahat_menit ?? 0 }} menit</td></tr>
          <tr><td class="text-center">4</td><td>Durasi lembur</td><td>{{ formatDurasiJam(lembur.durasiJam ?? lembur.durasi_jam) }}</td></tr>
          <tr><td class="text-center">5</td><td>Pekerjaan</td><td style="white-space: pre-wrap">{{ lembur.pekerjaan }}</td></tr>
          <tr><td class="text-center">6</td><td>Alasan / dasar</td><td style="white-space: pre-wrap">{{ lembur.alasan }}</td></tr>
          <tr>
            <td class="text-center">7</td><td>Lampiran</td>
            <td>
              <a v-if="lembur.attachment" :href="lembur.attachment" target="_blank" class="no-print">Lihat</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="multiplierBreakdown.length" class="mb-4">
      <div class="cetak-lembur-section-header">Indeks Upah Lembur (PP 35/2021)</div>
      <table class="table table-bordered cetak-lembur-table m-0" style="font-size: 11px">
        <thead>
          <tr>
            <th class="cetak-lembur-th text-center" style="width: 50px">Jam ke-</th>
            <th class="cetak-lembur-th text-center" style="width: 80px">Multiplier</th>
            <th class="cetak-lembur-th">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in multiplierBreakdown" :key="row.jam_ke">
            <td class="text-center">{{ row.jam_ke }}</td>
            <td class="text-center">{{ row.multiplier }}×</td>
            <td>{{ row.keterangan }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <HrdCetakSignatureBlock
      document-type="lembur"
      :document-id="lembur.id"
      :pegawai-name="pegawaiName"
      :pegawai-jabatan="pegawaiJabatan"
      :submitted="isSubmitted"
      :is-approved="isApproved"
      :approval-logs="approvalRows"
    />
    </template>
  </CetakDocument>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { apiFetch } from '~/utils/apiFetch'
import HrdCetakSignatureBlock from '~/components/hrd/HrdCetakSignatureBlock.vue'
import {
  STATUS_LEMBUR_APPROVED,
  STATUS_LEMBUR_MENUNGGU,
  formatDurasiJam,
  getStatusLemburBadge,
  getTipeHariLabel,
} from '~/constants/hrd/lemburForm'

definePageMeta({ layout: 'cetak', middleware: ['auth', 'check-permission'] })

const { setDetailTitle } = useDynamicTitle()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const lembur = ref<Record<string, any> | null>(null)
const perusahaan = ref<Record<string, any> | null>(null)
const multiplierBreakdown = ref<Array<{ jam_ke: number; multiplier: number; keterangan: string }>>([])

const pegawaiName = computed(() => lembur.value?.pegawai?.nmPegawai ?? lembur.value?.pegawai?.nm_pegawai ?? '-')
const pegawaiNik = computed(() => lembur.value?.pegawai?.nikPegawai ?? lembur.value?.pegawai?.nik_pegawai ?? '-')
const pegawaiJabatan = computed(() => {
  const h = lembur.value?.pegawai?.pegawaiHistory ?? lembur.value?.pegawai?.PegawaiHistory ?? []
  const first = Array.isArray(h) && h.length ? h[0] : null
  return first?.jabatan?.nmJabatan ?? first?.jabatan?.nm_jabatan ?? '-'
})
const statusLabel = computed(() => getStatusLemburBadge(lembur.value?.status).text)
const isSubmitted = computed(() => {
  const s = Number(lembur.value?.status)
  return s === STATUS_LEMBUR_MENUNGGU || s === STATUS_LEMBUR_APPROVED
})
const isApproved = computed(() => Number(lembur.value?.status) === STATUS_LEMBUR_APPROVED)
const jamLabel = computed(() => {
  const a = (lembur.value?.jamMulai ?? lembur.value?.jam_mulai ?? '').toString().slice(0, 5)
  const b = (lembur.value?.jamSelesai ?? lembur.value?.jam_selesai ?? '').toString().slice(0, 5)
  return `${a} – ${b}`
})
const approvalRows = computed(() => {
  const logs = lembur.value?.approvalLogs ?? lembur.value?.approval_logs ?? []
  return Array.isArray(logs) ? logs : []
})
const printedAt = computed(() => new Date().toLocaleString('id-ID'))
function formatDate(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatDateTime(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleString('id-ID')
}

onMounted(async () => {
  const id = route.query.id
  if (!id) {
    error.value = 'Parameter id wajib.'
    loading.value = false
    return
  }
  const { $api } = useNuxtApp()
  try {
    const res = await apiFetch<{
      data: {
        lembur: Record<string, any>
        perusahaan: Record<string, any> | null
        multiplierBreakdown: Array<{ jam_ke: number; multiplier: number; keterangan: string }>
      }
    }>($api.lemburCetak(id), { credentials: 'include' })
    lembur.value = res.data?.lembur ?? null
    perusahaan.value = res.data?.perusahaan ?? null
    multiplierBreakdown.value = res.data?.multiplierBreakdown ?? []
    if (lembur.value) {
      setDetailTitle('Cetak Lembur SPKL', `#${lembur.value.id}`, false)
    } else {
      error.value = 'Data tidak ditemukan.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat cetak.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.cetak-lembur-section-header {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
}

.cetak-lembur-th {
  background-color: var(--print-table-header, #3b4056) !important;
  color: #fff !important;
  font-weight: 600;
  border-color: transparent !important;
}

.cetak-lembur-table thead th {
  background-color: var(--print-table-header, #3b4056) !important;
  color: #fff !important;
}
</style>
