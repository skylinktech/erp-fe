<template>
  <div
    class="multi-signature-display"
    :class="{ 'multi-signature--cuti-print': cutiPrintMode }"
  >
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
      <p class="mt-2 text-muted">Memuat tanda tangan...</p>
    </div>

    <!-- Signatures Display -->
    <div v-else-if="signatures.length > 0">
      <!-- Cetak cuti: chrome atas seperti tampilan biasa, aksen biru -->
      <div v-if="cutiPrintMode" class="cuti-print-chrome-header mb-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="mb-0 cuti-print-chrome-title">{{ title }}</h5>
          <div class="signature-progress">
            <span
              class="badge cuti-print-count-badge"
              :class="isFullySigned ? 'cuti-print-count-badge--done' : 'cuti-print-count-badge--wait'"
            >
              {{ signatures.length }}/{{ cutiPrintBadgeDenominator }} Tanda Tangan
            </span>
          </div>
        </div>
        <div v-if="effectiveRequired > 0" class="progress mt-2 cuti-print-progress-track" style="height: 8px">
          <div
            class="progress-bar cuti-print-progress-bar"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Header + progress (layar biasa / non-cetak cuti) -->
      <div v-if="!cutiPrintMode && showHeader" class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">{{ title }}</h5>
        <div class="signature-progress no-print">
          <span class="badge" :class="isFullySigned ? 'bg-success' : 'bg-warning'">
            {{ signatures.length }}/{{ effectiveRequired }} Tanda Tangan
          </span>
        </div>
      </div>

      <div v-if="!cutiPrintMode && showHeader && effectiveRequired > 0" class="progress mb-4" style="height: 8px;">
        <div
          class="progress-bar"
          :class="isFullySigned ? 'bg-success' : 'bg-primary'"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>

      <!-- Signatures Grid; gap minimal antara Prepared by & Approved by -->
      <div class="row signature-grid" :class="[compact ? 'g-0' : 'g-1', { 'justify-content-center': signatures.length === 1 || compact }, compact && 'signature-grid-compact']">
        <div
          v-for="(signature, index) in signatures"
          :key="signature.id"
          :class="signatures.length === 1 ? 'col-12 col-md-6 col-lg-4' : columnClass"
        >
          <div class="signature-card">
            <div v-if="cutiPrintMode" class="cuti-print-sig-kicker">
              {{ cutiPrintHeader(index, signatures.length) }}
            </div>
            <!-- Judul di atas QR: Prepared by / Approved by (Approved by bisa disembunyikan via prop, mis. di cetak quotation) -->
            <div v-else-if="isPreparedBy(signature)" class="signature-card-label mb-2">Prepared by</div>
            <div v-else-if="showApprovedByLabel" class="signature-card-label mb-2 mt-8"></div>
            <!-- QR Code -->
            <div class="qr-wrapper">
              <QRCodeGenerator
                :value="getVerificationUrl(signature.token)"
                :size="qrSize"
                :show-label="false"
              />
            </div>

            <!-- Signature Info: Nama, hairline, Jabatan/Role -->
            <div class="signature-info mt-2">
              <!-- Nama (fullName atau dari user) -->
              <div class="user-name fw-bold text-break">
                {{ displayName(signature) }}
              </div>
              <!-- Pemisah: hairline seperti Site Investment -->
              <hr class="signature-separator-hairline my-1">
              <!-- Jabatan (jika ada) atau Role user -->
              <div class="signature-title small">
                {{ displayTitle(signature) }}
              </div>

              <!-- Signed Date -->
              <div class="signed-date text-muted small mt-1">
                {{ formatDate(signature.signedAt) }}
              </div>

              <!-- Notes (if any) -->
              <div v-if="signature.notes" class="signature-notes small text-muted mt-1">
                <i class="ri-message-2-line me-1"></i>
                {{ signature.notes }}
              </div>

              <!-- Verification Status (tanpa hairline/label di bawah) -->
              <div
                class="verification-status mt-2"
                :class="{ 'verification-status--cuti-print': cutiPrintMode }"
              >
                <i
                  class="ri-verified-badge-fill me-1"
                  :class="cutiPrintMode ? 'text-cuti-print-accent' : 'text-success'"
                ></i>
                <small :class="cutiPrintMode ? 'text-cuti-print-accent' : 'text-success'">Terverifikasi</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending / lengkap (disembunyikan di cetak cuti / tanpa header) -->
      <div v-if="!cutiPrintMode && showHeader && !isFullySigned && effectiveRequired > 0" class="alert alert-info mt-3">
        <i class="ri-information-line me-2"></i>
        <strong>Status:</strong> Menunggu {{ effectiveRequired - signatures.length }} tanda tangan lagi
      </div>

      <div v-if="!cutiPrintMode && showHeader && isFullySigned && effectiveRequired > 0" class="alert alert-success mt-3">
        <i class="ri-checkbox-circle-line me-2"></i>
        <strong>Dokumen telah ditandatangani lengkap</strong>
      </div>

      <!-- Cetak cuti: status bawah (biru, menggantikan alert success hijau) -->
      <div
        v-if="cutiPrintMode && !isFullySigned && effectiveRequired > 0"
        class="cuti-print-doc-pending mt-3"
      >
        <i class="ri-information-line me-2"></i>
        <strong>Status:</strong> Menunggu {{ effectiveRequired - signatures.length }} tanda tangan lagi
      </div>
      <div
        v-if="cutiPrintMode && isFullySigned && effectiveRequired > 0"
        class="cuti-print-doc-complete mt-3"
      >
        <i class="ri-checkbox-circle-line me-2"></i>
        <strong>Dokumen telah ditandatangani lengkap</strong>
      </div>
    </div>

    <!-- Legacy: single QR jika tidak ada multi-signature tapi ada token lama -->
    <div v-else-if="legacySignatureToken" class="legacy-single-qr text-center py-3">
      <QRCodeGenerator
        :value="getVerificationUrl(legacySignatureToken)"
        :size="qrSize"
        :show-label="true"
        label="Scan QR untuk verifikasi keaslian dokumen"
        container-class="mx-auto"
      />
      <!-- Nama dan Jabatan/Role di bawah QR -->
      <div class="legacy-signer-info mt-3">
        <div class="user-name fw-bold text-break">{{ legacySignerName || '-' }}</div>
        <hr class="my-1 cetak-si-signature">
        <div class="signature-title small">{{ legacySignerTitle || '-' }}</div>
      </div>
      <p class="mt-3 text-muted small mb-0">Dokumen ini telah ditandatangani secara digital</p>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-4">
      <i class="ri-pen-nib-line" style="font-size: 3rem; color: #ccc;"></i>
      <p class="text-muted mt-2">Belum ada tanda tangan digital</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import QRCodeGenerator from './QRCodeGenerator.vue'

const props = defineProps({
  // Document type & ID
  documentType: {
    type: String,
    required: true,
    validator: (value) =>
      [
        'site-investments',
        'quotations',
        'purchase-requests',
        'material-requests',
        'fdrs',
        'purchase-orders',
        'sales-invoices',
        'surat-jalans',
        'stock-transfers',
        'cuti',
        'lembur',
        'perjalanan-dinas',
        'work-order-requests',
        'arfs',
        'payment-requests',
        // Print-only allowlist so BA cetak can fetch existing signatures.
        'berita-acara',
      ].includes(value),
  },
  documentId: {
    type: [String, Number],
    required: true,
  },
  qrSize: {
    type: Number,
    default: 96,
  },
  columns: {
    type: Number,
    default: 4,
    validator: (value) => [2, 3, 4, 6].includes(value),
  },
  requiredCount: {
    type: Number,
    default: null,
  },
  
  // Auto fetch on mount
  autoFetch: {
    type: Boolean,
    default: true,
  },

  // Fallback: tampilkan single QR jika tidak ada multi-signature (dokumen lama)
  legacySignatureToken: {
    type: String,
    default: null,
  },
  /** Nama penandatangan (untuk legacy single QR) */
  legacySignerName: {
    type: String,
    default: null,
  },
  /** Jabatan atau role penandatangan (untuk legacy single QR) */
  legacySignerTitle: {
    type: String,
    default: null,
  },
  /** Tampilkan label "Approved by" di atas QR (false = sembunyikan, mis. di halaman cetak quotation) */
  showApprovedByLabel: {
    type: Boolean,
    default: true,
  },
  /** Tampilkan judul "Tanda tangan digital" + progress bar (false = cetak invoice) */
  showHeader: {
    type: Boolean,
    default: true,
  },
  /** Layout ringkas untuk halaman cetak */
  compact: {
    type: Boolean,
    default: false,
  },
  /** Mode cetak form cuti: chrome biru (judul, badge counter, progress, status bawah) + label di atas QR */
  cutiPrintMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['signatures-loaded', 'error'])

const title = computed(() => 'Tanda tangan digital')

/** Keterangan di atas QR untuk cetak cuti. Blok "Diajukan oleh" (pegawai) ada di halaman cetak; di sini hanya label per tanda tangan digital. */
function cutiPrintHeader(index, total) {
  const n = Math.max(0, Number(total) || 0)
  const i = Math.max(0, Number(index) || 0)
  if (n <= 0) return ''
  if (n === 1) return 'Disetujui/Tidak Disetujui oleh,'
  if (n === 2) return i === 0 ? 'Disetujui/Tidak Disetujui oleh,' : 'Diketahui oleh,'
  if (i === n - 1) return 'Diketahui oleh,'
  return 'Disetujui/Tidak Disetujui oleh,'
}

// State
const loading = ref(false)
const signatures = ref([])
/** Required dari API (jumlah step approval_workflow); fallback ke prop requiredCount */
const requiredFromApi = ref(null)
const config = useRuntimeConfig()

// Computed: pakai required dari API dulu, fallback ke prop
const effectiveRequired = computed(() => {
  if (requiredFromApi.value != null && requiredFromApi.value > 0) {
    return requiredFromApi.value
  }
  return props.requiredCount ?? 1
})

const cutiPrintBadgeDenominator = computed(() => {
  const r = Number(effectiveRequired.value) || 0
  const n = signatures.value.length
  return Math.max(r, n) || 1
})

const columnClass = computed(() => {
  if (props.compact) return 'col-auto'
  const colMap = {
    2: 'col-md-6',
    3: 'col-md-4',
    4: 'col-md-3',
    6: 'col-md-2',
  }
  return `${colMap[props.columns]} col-6`
})

const isFullySigned = computed(() => {
  return signatures.value.length >= effectiveRequired.value
})

const progressPercentage = computed(() => {
  if (effectiveRequired.value <= 0) return 0
  return Math.min(100, Math.round((signatures.value.length / effectiveRequired.value) * 100))
})

// Methods
async function fetchSignatures() {
  const id = props.documentId != null && props.documentId !== '' ? String(props.documentId) : null
  if (!id) return
  loading.value = true
  try {
    const base = (config.public.apiBase || '').replace(/\/$/, '')
    const path = `${props.documentType}/${id}/signatures`
    const url = base.endsWith('/api') ? `${base}/${path}` : `${base}/api/${path}`
    const { apiFetch } = await import('~/utils/apiFetch')
    const response = await apiFetch(url, { credentials: 'include' })
    const list = response.signatures || []
    signatures.value = list.slice().sort((a, b) => {
      const aPrepared = (a.role || '').toLowerCase() === 'prepared by'
      const bPrepared = (b.role || '').toLowerCase() === 'prepared by'
      if (aPrepared && !bPrepared) return -1
      if (!aPrepared && bPrepared) return 1
      return (a.order ?? 0) - (b.order ?? 0)
    })
    requiredFromApi.value = response.required ?? null
    emit('signatures-loaded', signatures.value)
  } catch (error) {
    console.error('Error fetching signatures:', error)
    emit('error', error)
  } finally {
    loading.value = false
  }
}

function getVerificationUrl(token) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : config.public.siteUrl || 'https://yourdomain.com'
  return `${baseUrl}/verify?token=${token}`
}

function formatDate(date) {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return String(date)
  }
}

function getRoleLabel(role) {
  if (!role) return ''
  const roleLabels = {
    'manager': 'Manager',
    'director': 'Director',
    'cfo': 'CFO',
    'ceo': 'CEO',
    'superadmin': 'Superadmin',
    'approver': 'Approver',
    'reviewer': 'Reviewer',
    'witness': 'Witness',
    'finance': 'Finance',
    'technical': 'Technical',
    'commercial': 'Commercial',
    'prepared by': 'Prepared By',
  }
  const key = typeof role === 'string' ? role.toLowerCase() : role
  return roleLabels[key] || role
}

/** True jika signature ini role Prepared By */
function isPreparedBy(signature) {
  const role = signature?.role || signature?.signatureRole
  return role && String(role).toLowerCase() === 'prepared by'
}

/** Nama di bawah QR: nm_pegawai prioritas, fallback username */
function displayName(signature) {
  const nm = signature?.user?.nmPegawai
  if (nm && String(nm).trim()) return String(nm).trim()
  return signature?.user?.username || signature?.user?.fullName || signature?.user?.name || '-'
}

/** Baris di bawah username: Jabatan (prioritas) atau Role (fallback) */
function displayTitle(signature) {
  const jabatan = signature?.user?.jabatan ?? signature?.user?.nmJabatan
  if (jabatan && String(jabatan).trim()) return String(jabatan).trim()
  const role = signature?.user?.roleName ?? signature?.role ?? signature?.signatureRole
  return getRoleLabel(role) || '-'
}

// Expose methods untuk parent component
defineExpose({
  fetchSignatures,
  signatures,
})

// Lifecycle: fetch on mount dan saat documentId berubah (mis. quotation baru selesai diload)
onMounted(() => {
  if (props.autoFetch && props.documentId != null && props.documentId !== '') {
    fetchSignatures()
  }
})

watch(
  () => props.documentId,
  (newId, oldId) => {
    if (props.autoFetch && newId != null && newId !== '' && String(newId) !== String(oldId)) {
      fetchSignatures()
    }
  }
)
</script>

<style scoped>
.multi-signature-display {
  padding: 0.5rem 0;
}

.signature-grid {
  --bs-gutter-x: 0.35rem;
  --bs-gutter-y: 0.35rem;
}

.signature-grid-compact {
  --bs-gutter-x: 0.1rem;
  --bs-gutter-y: 0.15rem;
  gap: 0.25rem 0.5rem;
}

.signature-grid-compact .signature-card {
  padding: 0.2rem 0.35rem;
  max-width: fit-content;
}

.signature-grid-compact .signature-info {
  margin-top: 0.3rem;
}

.signature-grid-compact .qr-wrapper {
  min-height: 72px;
}

.signature-grid-compact .user-name {
  margin: 0.2rem 0 0.08rem;
  font-size: 11px;
}

.signature-grid-compact .signature-title {
  font-size: 10px;
}

.signature-grid-compact .signed-date {
  font-size: 10px;
  margin-top: 0.15rem;
}

.signature-grid-compact .verification-status {
  margin-top: 0.25rem;
  padding: 0.15rem 0.35rem;
  font-size: 10px;
}

.signature-card {
  background: #fff;
  padding: 0.5rem 0.75rem;
  text-align: center;
}

.signature-card-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-transform: none;
}

.cetak-si-signature {
    border-top: 1px solid #000 !important;
    margin: 1rem 0 !important;
    padding: 0 !important;
    width: 20% !important;
    align-items: center !important;
    justify-content: center !important;
    display: block !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
}

.signature-info {
  margin-top: 1rem;
}

.user-name {
  font-size: 14px;
  color: #333;
  margin: 0.5rem 0 0.25rem;
}

/* Hairline pemisah di bawah nama (seperti Site Investment) */
.signature-separator-hairline {
  border: none;
  border-top: 1px solid #000;
  margin: 0.5rem auto;
  padding: 0;
  width: 40%;
  display: block;
  margin-left: auto;
  margin-right: auto;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.signature-title {
  color: #555;
  font-size: 12px;
  font-weight: 600;
}

.signed-date {
  font-size: 11px;
  color: #666;
}

.signature-notes {
  font-size: 11px;
  font-style: italic;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}

.verification-status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: #d4edda;
  border-radius: 0.25rem;
}

/* Cetak form cuti: chrome atas/bawah biru + keterangan di atas QR */
.multi-signature--cuti-print {
  padding: 0.15rem 0 0;
}

.cuti-print-chrome-header {
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid rgba(66, 117, 246, 0.28);
}

.cuti-print-chrome-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #222;
}

.cuti-print-count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35em 0.55em;
}

.cuti-print-count-badge--done {
  background: #4275f6 !important;
  color: #fff !important;
}

.cuti-print-count-badge--wait {
  background: #5b87f7 !important;
  color: #fff !important;
}

.cuti-print-progress-track {
  background: #e8f0fe;
  border-radius: 4px;
  overflow: hidden;
}

.cuti-print-progress-bar {
  background: #4275f6 !important;
}

.cuti-print-doc-complete,
.cuti-print-doc-pending {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.cuti-print-doc-complete {
  background: #e8f0fe;
  border: 1px solid #4275f6;
  color: #153e7a;
}

.cuti-print-doc-pending {
  background: #f0f5ff;
  border: 1px solid rgba(66, 117, 246, 0.45);
  color: #1a3a7a;
}

.cuti-print-sig-kicker {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.65rem;
  text-align: center;
  line-height: 1.35;
}

.multi-signature--cuti-print .verification-status--cuti-print {
  background: #e8f0fe;
  border: 1px solid #4275f6;
  border-radius: 0.25rem;
}

.multi-signature--cuti-print .signature-separator-hairline {
  border-top-color: #4275f6;
  opacity: 0.85;
}

.text-cuti-print-accent {
  color: #4275f6 !important;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  .signature-card {
    page-break-inside: avoid;
  }

  .cetak-si-signature {
    border-top: 1px solid #000 !important;
    margin: 1rem 0 !important;
    padding: 0 !important;
    width: 10% !important;
    display: block !important;
    align-self: center !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  .signature-separator-hairline {
    display: block !important;
    visibility: visible !important;
    border: none !important;
    border-top: 1pt solid #000 !important;
    width: 40% !important;
    margin: 0.5rem auto !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding: 0 !important;
    height: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .alert {
    display: none;
  }

  .multi-signature--cuti-print .verification-status--cuti-print {
    background: #e8f0fe !important;
    border: 1pt solid #4275f6 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .multi-signature--cuti-print .signature-separator-hairline {
    border-top: 1pt solid #4275f6 !important;
  }

  .cuti-print-chrome-header {
    border-bottom: 1pt solid rgba(66, 117, 246, 0.35) !important;
  }

  .cuti-print-count-badge--done,
  .cuti-print-count-badge--wait {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .cuti-print-progress-track {
    background: #e8f0fe !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .cuti-print-progress-bar {
    background: #4275f6 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .cuti-print-doc-complete,
  .cuti-print-doc-pending {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .signature-card {
    padding: 0.75rem;
  }
  
  .user-name {
    font-size: 12px;
  }
}
</style>
