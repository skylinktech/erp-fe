<template>
  <div class="hrd-cetak-sig mt-5">
    <div v-if="loading" class="text-muted small py-2 text-center">Memuat tanda tangan…</div>
    <div v-else class="hrd-cetak-sig-row">
      <div class="hrd-cetak-sig-col">
        <div class="hrd-cetak-sig-kicker">Yang mengajukan,</div>
        <div class="hrd-cetak-sig-qr">
          <QRCodeGenerator
            v-if="preparedSignature?.token"
            :value="verificationUrl(preparedSignature.token)"
            :size="qrSize"
            :show-label="false"
            container-class="mx-auto"
          />
          <div v-else class="hrd-cetak-sig-qr-placeholder text-muted small">
            {{ submitted ? '—' : 'Belum diajukan' }}
          </div>
        </div>
        <div class="hrd-cetak-sig-name fw-bold">{{ pegawaiName }}</div>
        <div class="hrd-cetak-sig-meta">{{ pegawaiJabatan || '-' }}</div>
        <div v-if="preparedSignature?.signedAt" class="hrd-cetak-sig-date text-muted small">
          {{ displaySigDate(preparedSignature) }}
        </div>
      </div>

      <div class="hrd-cetak-sig-col">
        <template v-if="approvalSignatures.length">
          <div
            v-for="(sig, idx) in approvalSignatures"
            :key="sig.id ?? idx"
            :class="{ 'mt-4 pt-3 border-top': idx > 0 }"
          >
            <div class="hrd-cetak-sig-kicker">{{ idx === 0 ? 'Disetujui oleh,' : 'Disetujui oleh,' }}</div>
            <div class="hrd-cetak-sig-qr">
              <QRCodeGenerator
                v-if="sig?.token"
                :value="verificationUrl(sig.token)"
                :size="qrSize"
                :show-label="false"
                container-class="mx-auto"
              />
              <div v-else class="hrd-cetak-sig-qr-placeholder text-muted small">—</div>
            </div>
            <div class="hrd-cetak-sig-name fw-bold">{{ displaySigName(sig) }}</div>
            <div class="hrd-cetak-sig-meta">{{ displaySigTitle(sig) }}</div>
            <div v-if="sig?.signedAt" class="hrd-cetak-sig-date text-muted small">
              {{ displaySigDate(sig) }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="hrd-cetak-sig-kicker">Disetujui oleh,</div>
          <div class="hrd-cetak-sig-qr">
            <div class="hrd-cetak-sig-qr-placeholder text-muted small">
              {{ showWaitingApproval ? 'Menunggu persetujuan' : '—' }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRuntimeConfig } from '#app'
import QRCodeGenerator from '~/components/QRCodeGenerator.vue'
import { apiFetch } from '~/utils/apiFetch'

const props = withDefaults(
  defineProps<{
    documentType: 'lembur' | 'perjalanan-dinas'
    documentId: string | number | null | undefined
    pegawaiName: string
    pegawaiJabatan?: string
    /** Muat tanda tangan setelah dokumen diajukan (menunggu / disetujui). */
    submitted?: boolean
    /** Dokumen sudah disetujui penuh. */
    isApproved?: boolean
    /** Riwayat approval sebagai fallback jika signature API belum lengkap. */
    approvalLogs?: Record<string, any>[]
    qrSize?: number
  }>(),
  {
    pegawaiJabatan: '-',
    submitted: false,
    isApproved: false,
    approvalLogs: () => [],
    qrSize: 80,
  }
)

const runtimeConfig = useRuntimeConfig()
const loading = ref(false)
const signatures = ref<Record<string, any>[]>([])

const preparedSignature = computed(() =>
  signatures.value.find((s) => String(s.role || '').toLowerCase() === 'prepared by')
)

const approvalSignatures = computed(() => {
  const fromApi = [...signatures.value]
    .filter((s) => String(s.role || '').toLowerCase() !== 'prepared by')
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))

  if (fromApi.length > 0) return fromApi

  const logs = Array.isArray(props.approvalLogs) ? props.approvalLogs : []
  return logs
    .filter((l) => String(l.action || '').toLowerCase() === 'approved')
    .sort(
      (a, b) =>
        Number(a.stepOrder ?? a.step_order ?? 0) - Number(b.stepOrder ?? b.step_order ?? 0)
    )
    .map((l) => ({
      id: `log-${l.id}`,
      user: {
        name: l.user?.fullName ?? l.user?.full_name ?? l.user?.username ?? '-',
        fullName: l.user?.fullName ?? l.user?.full_name,
        username: l.user?.username,
        jabatan: l.user?.jabatan ?? null,
        roleName: l.user?.roleName ?? null,
      },
      signedAt: l.createdAt ?? l.created_at,
      token: null,
      role: 'Approver',
      order: l.stepOrder ?? l.step_order ?? 0,
    }))
})

const showWaitingApproval = computed(
  () => props.submitted && !props.isApproved && approvalSignatures.value.length === 0
)

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
  return new Date(sig.signedAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadSignatures() {
  const id = props.documentId != null && props.documentId !== '' ? String(props.documentId) : null
  if (!id || !props.submitted) {
    signatures.value = []
    return
  }
  loading.value = true
  try {
    const base = (runtimeConfig.public.apiBase || '').replace(/\/$/, '')
    const path = `${props.documentType}/${id}/signatures`
    const url = base.endsWith('/api') ? `${base}/${path}` : `${base}/api/${path}`
    const res = await apiFetch<{ signatures?: Record<string, any>[] }>(url, { credentials: 'include' })
    signatures.value = Array.isArray(res.signatures) ? res.signatures : []
  } catch {
    signatures.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.documentId, props.submitted, props.documentType] as const,
  () => {
    void loadSignatures()
  },
  { immediate: true }
)
</script>

<style scoped>
.hrd-cetak-sig {
  padding: 0.25rem 0 0;
  page-break-inside: avoid;
}

.hrd-cetak-sig-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 1.25rem;
}

.hrd-cetak-sig-col {
  flex: 1 1 50%;
  max-width: 50%;
  min-width: 0;
  text-align: center;
  padding-bottom: 0.5rem;
}

.hrd-cetak-sig-kicker {
  font-size: 12px;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
  line-height: 1.35;
}

.hrd-cetak-sig-qr {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 96px;
  margin-bottom: 0.35rem;
}

.hrd-cetak-sig-qr :deep(.qr-code-container) {
  margin: 0 auto;
  padding: 0;
}

.hrd-cetak-sig-qr-placeholder {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hrd-cetak-sig-name {
  font-size: 13px;
  color: #333;
  margin-top: 0.15rem;
}

.hrd-cetak-sig-meta {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-top: 0.15rem;
}

.hrd-cetak-sig-date {
  margin-top: 0.25rem;
  font-size: 10px;
}
</style>

<style>
@media print {
  .hrd-cetak-sig {
    page-break-inside: avoid;
  }

  .hrd-cetak-sig-row {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: flex-start !important;
    gap: 1rem !important;
  }

  .hrd-cetak-sig-col {
    flex: 0 0 50% !important;
    max-width: 50% !important;
    width: 50% !important;
    padding: 0 0.35rem !important;
  }

  .hrd-cetak-sig-kicker {
    font-size: 11px !important;
  }

  .hrd-cetak-sig-name {
    font-size: 12px !important;
  }

  .hrd-cetak-sig-meta {
    font-size: 10px !important;
  }

  .hrd-cetak-sig-date {
    font-size: 9px !important;
  }
}
</style>
