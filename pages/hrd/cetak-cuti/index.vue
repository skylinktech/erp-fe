<template>
  <CetakDocument
    type="CUTI"
    :document-number="cuti ? `#${cuti.id}` : ''"
    :status="cuti?.status"
    :company="perusahaan"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !cuti"
  >
    <template v-if="cuti">
    <div class="d-flex justify-content-between mb-3" style="font-size: 12px">
      <div class="text-start">
        <p class="mb-1"><strong>No. Pengajuan :</strong> #{{ cuti.id }}</p>
        <p class="mb-1"><strong>Tanggal Pengajuan :</strong> {{ formatDate(cuti.createdAt ?? cuti.created_at) }}</p>
        <p class="mb-1"><strong>Nama Pegawai :</strong> {{ pegawaiName }}</p>
        <p class="mb-1"><strong>NIK Pegawai :</strong> {{ pegawaiNik }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel }}</p>
        <p class="mb-1"><strong>Tipe :</strong> {{ cutiTypeName }}</p>
        <p v-if="cuti.submittedAt || cuti.submitted_at" class="mb-1">
          <strong>Diajukan ke Approval :</strong> {{ formatDateTime(cuti.submittedAt ?? cuti.submitted_at) }}
        </p>
      </div>
    </div>

    <!-- Ringkasan pengajuan -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-cuti-table m-0" style="font-size: 12px">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 36px">No</th>
            <th class="text-start">Keterangan</th>
            <th class="text-start">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td class="text-start">Rentang tanggal</td>
            <td class="text-start">{{ rangeLabel }}</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td class="text-start">Durasi</td>
            <td class="text-start">{{ durasiLabel }}</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td class="text-start">Izin per jam</td>
            <td class="text-start">{{ perJamLabel }}</td>
          </tr>
          <tr>
            <td class="text-center">4</td>
            <td class="text-start">Alasan / keperluan</td>
            <td class="text-start" style="white-space: pre-wrap">{{ cuti.alasan || '-' }}</td>
          </tr>
          <tr>
            <td class="text-center">5</td>
            <td class="text-start">Lampiran</td>
            <td class="text-start">
              <a v-if="cuti.attachment" :href="cuti.attachment" target="_blank" rel="noopener" class="no-print">
                Lihat lampiran
              </a>
              <span v-if="cuti.attachment" class="d-none print-only">{{ cuti.attachment }}</span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Riwayat approval (ringkas, sudah eager-load dari API) -->
    <div v-if="approvalRows.length" class="mb-4">
      <div class="cetak-cuti-section-header fw-bold text-white">Riwayat Persetujuan</div>
      <table class="table table-bordered cetak-cuti-table m-0" style="font-size: 11px">
        <thead class="table-dark table-head-white">
          <tr>
            <th class="text-center" style="width: 40px">Step</th>
            <th class="text-start">Aksi</th>
            <th class="text-start">Oleh</th>
            <th class="text-start">Tanggal</th>
            <th class="text-start">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in approvalRows" :key="log.id">
            <td class="text-center">{{ log.stepOrder ?? log.step_order }}</td>
            <td class="text-start text-capitalize">{{ log.action }}</td>
            <td class="text-start">{{ log.user?.fullName ?? log.user?.full_name ?? '-' }}</td>
            <td class="text-start">{{ formatDateTime(log.createdAt ?? log.created_at) }}</td>
            <td class="text-start" style="white-space: pre-wrap">{{ log.remarks || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tanda tangan: 3 kolom berdampingan, tanpa border (QR pengaju dari token Prepared By saat submit) -->
    <div v-if="isCutiApproved" class="cetak-cuti-sig-3 mt-5">
      <div v-if="sigLoading" class="text-muted small py-2">Memuat tanda tangan…</div>
      <div v-else class="row cetak-cuti-sig-3-row">
        <div class="col-12 col-md-4 cetak-cuti-sig-3-col">
          <div class="cetak-cuti-sig-3-kicker">Diajukan oleh,</div>
          <div class="cetak-cuti-sig-3-qr">
            <QRCodeGenerator
              v-if="preparedSignature?.token"
              :value="verificationUrl(preparedSignature.token)"
              :size="QR_COL_SIZE"
              :show-label="false"
              container-class="mx-auto"
            />
            <div v-else class="cetak-cuti-sig-3-qr-placeholder text-muted small">—</div>
          </div>
          <div class="cetak-cuti-sig-3-name fw-bold">{{ pegawaiName }}</div>
          <div class="cetak-cuti-sig-3-meta">{{ pegawaiPengajuJabatan }}</div>
          <div v-if="preparedSignature?.signedAt" class="cetak-cuti-sig-3-date text-muted small">
            {{ displaySigDate(preparedSignature) }}
          </div>
        </div>
        <div class="col-12 col-md-4 cetak-cuti-sig-3-col">
          <div class="cetak-cuti-sig-3-kicker">Disetujui/Tidak Disetujui oleh,</div>
          <div class="cetak-cuti-sig-3-qr">
            <QRCodeGenerator
              v-if="signatureDept?.token"
              :value="verificationUrl(signatureDept.token)"
              :size="QR_COL_SIZE"
              :show-label="false"
              container-class="mx-auto"
            />
            <div v-else class="cetak-cuti-sig-3-qr-placeholder text-muted small">—</div>
          </div>
          <div v-if="signatureDept" class="cetak-cuti-sig-3-name fw-bold">{{ displaySigName(signatureDept) }}</div>
          <div v-if="signatureDept" class="cetak-cuti-sig-3-meta">{{ displaySigTitle(signatureDept) }}</div>
          <div v-if="signatureDept?.signedAt" class="cetak-cuti-sig-3-date text-muted small">
            {{ displaySigDate(signatureDept) }}
          </div>
        </div>
        <div class="col-12 col-md-4 cetak-cuti-sig-3-col">
          <div class="cetak-cuti-sig-3-kicker">Diketahui oleh,</div>
          <div class="cetak-cuti-sig-3-qr">
            <QRCodeGenerator
              v-if="signatureHr?.token"
              :value="verificationUrl(signatureHr.token)"
              :size="QR_COL_SIZE"
              :show-label="false"
              container-class="mx-auto"
            />
            <div v-else class="cetak-cuti-sig-3-qr-placeholder text-muted small">—</div>
          </div>
          <div v-if="signatureHr" class="cetak-cuti-sig-3-name fw-bold">{{ displaySigName(signatureHr) }}</div>
          <div v-if="signatureHr" class="cetak-cuti-sig-3-meta">{{ displaySigTitle(signatureHr) }}</div>
          <div v-if="signatureHr?.signedAt" class="cetak-cuti-sig-3-date text-muted small">
            {{ displaySigDate(signatureHr) }}
          </div>
        </div>
      </div>
    </div>

    <p class="text-muted small text-center mt-3 mb-0 no-print" style="font-size: 11px">
      Dicetak pada {{ printedAt }}
    </p>
    </template>
  </CetakDocument>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp, useRuntimeConfig } from '#app'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { apiFetch } from '~/utils/apiFetch'
import QRCodeGenerator from '~/components/QRCodeGenerator.vue'
import {
  formatDurasiCuti,
  formatRangeTanggal,
  getStatusCutiBadge,
  STATUS_CUTI_APPROVED,
} from '~/constants/hrd/cutiForm'

definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
})

const { setDetailTitle } = useDynamicTitle()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const loading = ref(true)
const error = ref<string | null>(null)
const cuti = ref<Record<string, any> | null>(null)
const perusahaan = ref<Record<string, any> | null>(null)
const cutiSignatures = ref<Record<string, any>[]>([])
const sigLoading = ref(false)

const QR_COL_SIZE = 80

const pegawaiName = computed(() => cuti.value?.pegawai?.nmPegawai ?? cuti.value?.pegawai?.nm_pegawai ?? '-')
const pegawaiNik = computed(
  () => cuti.value?.pegawai?.nikPegawai ?? cuti.value?.pegawai?.nik_pegawai ?? '-'
)

function pegawaiHistories(pegawai: Record<string, any> | null | undefined) {
  return pegawai?.pegawaiHistory ?? pegawai?.PegawaiHistory ?? pegawai?.pegawai_history ?? []
}

function jabatanFromPegawai(pegawai: Record<string, any> | null | undefined): string | null {
  if (!pegawai) return null
  const histories = pegawaiHistories(pegawai)
  const first = Array.isArray(histories) && histories.length ? histories[0] : null
  const j = first?.jabatan
  const nm = j?.nmJabatan ?? j?.nm_jabatan
  return nm && String(nm).trim() ? String(nm).trim() : null
}

function pegawaiLinkedUser(pegawai: Record<string, any> | null | undefined) {
  return pegawai?.users ?? pegawai?.user ?? null
}

function rolesLineFromUser(u: Record<string, any> | null | undefined): string | null {
  const roles = u?.roles ?? []
  if (!Array.isArray(roles) || !roles.length) return null
  return roles.map((r: Record<string, any>) => r?.name).filter(Boolean).join(', ')
}

/** Jabatan terbaru (history); jika kosong, gabungan nama role akun user terkait pegawai. */
const pegawaiPengajuJabatan = computed(() => {
  const p = cuti.value?.pegawai
  const j = jabatanFromPegawai(p)
  if (j) return j
  const rl = rolesLineFromUser(pegawaiLinkedUser(p))
  if (rl && String(rl).trim()) return String(rl).trim()
  return '-'
})
const cutiTypeName = computed(
  () => cuti.value?.cutiType?.nmTipeCuti ?? cuti.value?.cutiType?.nm_tipe_cuti ?? '-'
)
const statusLabel = computed(() => {
  const s = cuti.value?.status
  return getStatusCutiBadge(s).text
})
const isCutiApproved = computed(() => Number(cuti.value?.status) === STATUS_CUTI_APPROVED)

const preparedSignature = computed(() =>
  cutiSignatures.value.find((s) => String(s.role || '').toLowerCase() === 'prepared by')
)

const approvalSignatures = computed(() =>
  [...cutiSignatures.value]
    .filter((s) => String(s.role || '').toLowerCase() !== 'prepared by')
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
)

/** Kolom tengah: penandatangan pertama (setelah pengaju). */
const signatureDept = computed(() => {
  const list = approvalSignatures.value
  return list.length ? list[0] : null
})

/** Kolom kanan: penandatangan terakhir (biasanya HR); kosong jika hanya satu approver. */
const signatureHr = computed(() => {
  const list = approvalSignatures.value
  if (list.length < 2) return null
  return list[list.length - 1]
})

function verificationUrl(token: string) {
  let origin = typeof window !== 'undefined' ? window.location.origin : ''
  if (!origin) origin = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '')
  return `${origin}/verify?token=${encodeURIComponent(token)}`
}

function displaySigName(sig: Record<string, any> | null | undefined) {
  if (!sig?.user) return '-'
  const u = sig.user
  return u.nmPegawai || u.name || u.fullName || u.username || '-'
}

function displaySigTitle(sig: Record<string, any> | null | undefined) {
  if (!sig?.user) return '-'
  const u = sig.user
  return u.jabatan || u.roleName || sig.role || '-'
}

function displaySigDate(sig: Record<string, any> | null | undefined) {
  if (!sig?.signedAt) return ''
  return formatDateTime(sig.signedAt)
}

async function loadCutiSignatures() {
  const id = cuti.value?.id
  if (!id || !isCutiApproved.value) {
    cutiSignatures.value = []
    return
  }
  sigLoading.value = true
  try {
    const base = (runtimeConfig.public.apiBase || '').replace(/\/$/, '')
    const path = `cuti/${id}/signatures`
    const url = base.endsWith('/api') ? `${base}/${path}` : `${base}/api/${path}`
    const res = await apiFetch<{ signatures?: Record<string, any>[] }>(url, { credentials: 'include' })
    cutiSignatures.value = Array.isArray(res.signatures) ? res.signatures : []
  } catch {
    cutiSignatures.value = []
  } finally {
    sigLoading.value = false
  }
}

const rangeLabel = computed(() =>
  cuti.value ? formatRangeTanggal(cuti.value.tanggalMulai ?? cuti.value.tanggal_mulai, cuti.value.tanggalSelesai ?? cuti.value.tanggal_selesai) : '-'
)
const durasiLabel = computed(() => (cuti.value ? formatDurasiCuti(cuti.value) : '-'))
const perJamLabel = computed(() => {
  if (!cuti.value) return '-'
  const pj = cuti.value.isPerJam ?? cuti.value.is_per_jam
  if (!pj) return 'Tidak'
  const a = (cuti.value.jamMulai ?? cuti.value.jam_mulai ?? '').toString().slice(0, 5)
  const b = (cuti.value.jamSelesai ?? cuti.value.jam_selesai ?? '').toString().slice(0, 5)
  return a && b ? `Ya (${a} – ${b})` : 'Ya'
})

const approvalRows = computed(() => {
  const logs = cuti.value?.approvalLogs ?? cuti.value?.approval_logs ?? []
  return Array.isArray(logs) ? logs : []
})

const printedAt = computed(() =>
  new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
)

function formatDate(val: string | null | undefined) {
  if (!val) return '-'
  const d = typeof val === 'string' ? new Date(val) : val
  if (Number.isNaN((d as Date).getTime())) return '-'
  return (d as Date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(val: string | null | undefined) {
  if (!val) return '-'
  const d = typeof val === 'string' ? new Date(val) : val
  if (Number.isNaN((d as Date).getTime())) return '-'
  return (d as Date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  const id = route.query.id
  if (!id) {
    error.value = 'Parameter id wajib diisi.'
    loading.value = false
    return
  }
  const { $api } = useNuxtApp()
  try {
    const res = await apiFetch<{ data: { cuti: Record<string, any>; perusahaan: Record<string, any> | null } }>(
      $api.cutiCetak(id),
      { credentials: 'include' }
    )
    cuti.value = res.data?.cuti ?? null
    perusahaan.value = res.data?.perusahaan ?? null
    if (cuti.value) {
      setDetailTitle('Cetak Cuti / Izin / Sakit', `#${cuti.value.id}`, false)
      if (Number(cuti.value.status) === STATUS_CUTI_APPROVED) {
        await loadCutiSignatures()
      }
    } else {
      error.value = 'Data tidak ditemukan.'
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memuat data cetak.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.cetak-cuti-table thead th {
  white-space: nowrap;
  background-color: var(--print-table-header, #3b4056);
}
.table-head-white {
  color: #fff;
}
.cetak-cuti-section-header {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
}
/* Tiga kolom tanda tangan berdampingan — tanpa border kotak */
.cetak-cuti-sig-3 {
  padding: 0.25rem 0 0;
}
.cetak-cuti-sig-3-row {
  --bs-gutter-x: 1.25rem;
}
.cetak-cuti-sig-3-col {
  text-align: center;
  padding-bottom: 0.5rem;
}
.cetak-cuti-sig-3-kicker {
  font-size: 12px;
  font-weight: 600;
  color: #222;
  text-align: center;
  margin-bottom: 0.5rem;
  line-height: 1.35;
}
.cetak-cuti-sig-3-qr {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 96px;
  margin-bottom: 0.35rem;
}
.cetak-cuti-sig-3-qr :deep(.qr-code-container) {
  margin: 0 auto;
  padding: 0;
}
.cetak-cuti-sig-3-qr-placeholder {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cetak-cuti-sig-3-name {
  font-size: 13px;
  color: #333;
  margin-top: 0.15rem;
}
.cetak-cuti-sig-3-meta {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-top: 0.15rem;
}
.cetak-cuti-sig-3-date {
  margin-top: 0.25rem;
  font-size: 10px;
}
</style>

<style>
@media print {
  .cetak-cuti-sig-3-row {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: flex-start !important;
  }
  .cetak-cuti-sig-3-col {
    flex: 0 0 33.333% !important;
    max-width: 33.333% !important;
    padding: 0 0.35rem !important;
  }
}
</style>
