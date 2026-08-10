<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container-pt-10">

        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height:400px">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width:3rem;height:3rem"></div>
            <p class="mt-3 text-muted">Memuat Berita Acara...</p>
          </div>
        </div>

        <div v-else-if="error && !beritaAcara" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/operations/berita-acara" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="beritaAcara">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/operations/berita-acara" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ getBeritaAcaraNo(beritaAcara) || '—' }}</h4>
                <small class="text-muted">{{ formatDateTime(beritaAcara.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(beritaAcara).class" class="badge">{{ getStatusBadge(beritaAcara).text }}</span>
            </div>

            <div class="d-flex gap-2">
              <button
                v-if="canSend"
                type="button"
                class="btn btn-outline-primary btn-sm"
                :disabled="store.sending"
                @click="onSend"
              >
                <i class="ri-mail-send-line me-1"></i>
                {{ store.sending ? 'Mengirim...' : 'Kirim Email' }}
              </button>
              <div class="btn-group">
                <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown">
                  Actions
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                  <a
                    v-if="isEditable"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="onSubmit"
                  >
                    <i class="ri-send-plane-line me-2"></i>
                    {{ beritaAcara.status === 'rejected' ? 'Submit Revisi' : 'Submit untuk Approval' }}
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="showRejectModal = true">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a
                    v-if="beritaAcara.status === 'approved' && (userHasRole('superadmin') || userHasPermission('edit_berita_acara'))"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="onComplete"
                  >
                    <i class="ri-checkbox-circle-line me-2"></i> Tandai Selesai
                  </a>
                  <a
                    v-if="isEditable"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="navigateTo(`/operations/berita-acara/form/${beritaAcara.id}`)"
                  >
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="navigateTo({ path: '/operations/cetak-berita-acara', query: { id: beritaAcara.id } })"
                  >
                    <i class="ri-printer-line me-2"></i> Cetak
                  </a>
                  <a
                    v-if="canSend"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    :class="{ disabled: store.sending }"
                    @click="onSend"
                  >
                    <i class="ri-mail-send-line me-2"></i>
                    {{ store.sending ? 'Mengirim...' : 'Kirim Email' }}
                  </a>
                  <div class="dropdown-divider" v-if="isEditable"></div>
                  <a
                    v-if="isEditable"
                    class="dropdown-item text-danger"
                    href="javascript:void(0)"
                    @click="onDelete"
                  >
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-xl-8">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0"><i class="ri-file-list-3-line me-2 text-primary"></i>Berita Acara Performansi</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width:2px">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Customer</label>
                      <p class="mb-0 fw-medium">{{ beritaAcara.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tanggal BA</label>
                      <p class="mb-0">{{ beritaAcara.documentDate || beritaAcara.document_date || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Nomor Kontrak</label>
                      <p class="mb-0">{{ beritaAcara.contractNo || beritaAcara.contract_no || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Partner</label>
                      <p class="mb-0">{{ beritaAcara.partnerName || beritaAcara.partner_name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Periode Performansi</label>
                      <p class="mb-0 fw-medium">{{ formatPeriod(beritaAcara) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Request by</label>
                      <p class="mb-0">{{ beritaAcara.requestedByUser?.fullName || beritaAcara.requestedByUser?.full_name || '—' }}</p>
                    </div>
                    <div class="col-12" v-if="beritaAcara.notes">
                      <label class="form-label text-muted">Catatan / SLA</label>
                      <p class="mb-0 text-break" style="white-space:pre-line">{{ beritaAcara.notes }}</p>
                    </div>
                    <div v-if="beritaAcara.status === 'rejected' && beritaAcara.rejectionReason" class="col-12">
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ beritaAcara.rejectionReason }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0"><i class="ri-table-line me-2 text-primary"></i>Data Performansi</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width:2px">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-bordered align-middle mb-0">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>PID</th>
                          <th>Lokasi</th>
                          <th>Bandwidth</th>
                          <th>Uptime</th>
                          <th>Avg Ping</th>
                          <th>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, idx) in beritaAcara.items || []" :key="item.id || idx">
                          <td>{{ idx + 1 }}</td>
                          <td class="fw-medium">{{ item.pid }}</td>
                          <td>{{ item.lokasi }}</td>
                          <td>{{ item.bandwidth || '—' }}</td>
                          <td>{{ item.uptimeStatus || item.uptime_status || '—' }}</td>
                          <td>{{ item.averagePing ?? item.average_ping ?? '—' }}</td>
                          <td>{{ item.keterangan || '—' }}</td>
                        </tr>
                        <tr v-if="!(beritaAcara.items || []).length">
                          <td colspan="7" class="text-center text-muted">Tidak ada data performansi</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Metadata</h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Pemohon</label>
                    <p class="mb-0 fw-medium">{{ beritaAcara.requestedByUser?.fullName || beritaAcara.requestedByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ beritaAcara.createdByUser?.fullName || beritaAcara.createdByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0">{{ formatDateTime(beritaAcara.createdAt) }}</p>
                  </div>
                  <div v-if="beritaAcara.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ beritaAcara.approvedByUser?.fullName || beritaAcara.approvedByUser?.full_name || '—' }}</p>
                  </div>
                  <div v-if="beritaAcara.submittedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disubmit Pada</label>
                    <p class="mb-0">{{ formatDateTime(beritaAcara.submittedAt) }}</p>
                  </div>
                  <div v-if="beritaAcara.sentAt || beritaAcara.sent_at" class="mb-0">
                    <label class="form-label text-muted mb-1">Terkirim Email</label>
                    <p class="mb-0 text-success">{{ formatDateTime(beritaAcara.sentAt || beritaAcara.sent_at) }}</p>
                  </div>
                </div>
              </div>

              <ApprovalCard
                :status-text="getStatusText(beritaAcara)"
                :current-step="approvalStepDisplay"
                :current-approvers="beritaAcara.currentApprovers ?? []"
                :approval-logs="beritaAcara.approvalLogs ?? []"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>

    <Teleport to="body">
      <div v-if="showRejectModal" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)" @click.self="showRejectModal = false">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Reject Berita Acara</h5>
              <button type="button" class="btn-close" @click="showRejectModal = false"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">Alasan Penolakan <span class="text-danger">*</span></label>
              <textarea v-model="rejectRemarks" class="form-control" rows="3" placeholder="Wajib diisi..." required></textarea>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
              <button class="btn btn-danger" :disabled="!rejectRemarks?.trim()" @click="handleReject">
                <i class="ri-close-line me-1"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useBeritaAcaraStore,
  getBeritaAcaraNo,
  formatPeriod,
  isBeritaAcaraSendable,
} from '~/stores/berita-acara'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { usePermissions } from '~/composables/usePermissions'
import { useBeritaAcaraApproval } from '~/composables/useBeritaAcaraApproval'
import ApprovalCard from '~/components/ApprovalCard.vue'

const route = useRoute()
const store = useBeritaAcaraStore()
const { userHasPermission, userHasRole } = usePermissions()
const { canApproveBeritaAcara, canRejectBeritaAcara } = useBeritaAcaraApproval()
const { beritaAcara, loading, error } = storeToRefs(store)
const { getStatusBadge, getStatusText } = useApprovalStatus()

const id = computed(() => String(route.params.id || ''))
const showRejectModal = ref(false)
const rejectRemarks = ref('')

const isEditable = computed(() =>
  beritaAcara.value?.status === 'draft' || beritaAcara.value?.status === 'rejected'
)

const canApprove = computed(() => canApproveBeritaAcara(beritaAcara.value))
const canReject = computed(() => canRejectBeritaAcara(beritaAcara.value))
const canSend = computed(() =>
  !!beritaAcara.value &&
  isBeritaAcaraSendable(beritaAcara.value) &&
  (userHasRole('superadmin') || userHasPermission('edit_berita_acara'))
)

const approvalStepDisplay = computed(() => {
  const row = beritaAcara.value
  if (!row || row.status !== 'pending') return row?.currentApprovalStep ?? null
  return row.nextApprovalStep ?? (Number(row.currentApprovalStep ?? 0) + 1)
})

function formatDateTime(v?: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

async function load() {
  if (!id.value) return
  await store.getBeritaAcaraDetails(id.value)
}

async function onSubmit() {
  if (!beritaAcara.value) return
  const ok = await store.submitBeritaAcara(beritaAcara.value.id)
  if (ok) await load()
}

async function onApprove() {
  if (!beritaAcara.value) return
  const ok = await store.approveBeritaAcara(beritaAcara.value.id)
  if (ok) await load()
}

async function handleReject() {
  if (!beritaAcara.value || !rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await store.rejectBeritaAcara(beritaAcara.value.id, rejectRemarks.value.trim())
  if (ok) await load()
  rejectRemarks.value = ''
}

async function onComplete() {
  if (!beritaAcara.value) return
  const ok = await store.markCompleted(beritaAcara.value.id)
  if (ok) await load()
}

async function onSend() {
  if (!beritaAcara.value || store.sending) return
  await store.sendBeritaAcara(beritaAcara.value.id)
}

async function onDelete() {
  if (!beritaAcara.value) return
  await store.deleteBeritaAcara(beritaAcara.value.id)
  await navigateTo('/operations/berita-acara')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Berita Acara Detail' })
</script>
