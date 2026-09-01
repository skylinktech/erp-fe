<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1">

        <PageLoadingState v-if="loading" message="Memuat Work Order Request..." />

        <PageErrorAlert
          v-else-if="error && !workOrderRequest"
          :message="error?.message || 'Gagal memuat data.'"
          back-href="/operations/work-order-request"
        />

        <template v-else-if="workOrderRequest">
          <DetailPageHeader
            :title="getWorkOrderRequestNo(workOrderRequest) || '—'"
            :subtitle="formatDateTime(workOrderRequest.createdAt)"
            back-href="/operations/work-order-request"
          >
            <template #badges>
              <span :class="getStatusBadge(workOrderRequest).class" class="badge">{{ getStatusBadge(workOrderRequest).text }}</span>
              <span :class="['badge', urgencyBadgeClass(workOrderRequest.urgencyLevel ?? workOrderRequest.urgency_level)]">
                {{ urgencyShortLabel(workOrderRequest.urgencyLevel ?? workOrderRequest.urgency_level) }}
              </span>
            </template>
            <template #actions>
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
                    {{ workOrderRequest.status === 'rejected' ? 'Submit Revisi' : 'Submit untuk Approval' }}
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="showRejectModal = true">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a
                    v-if="workOrderRequest.status === 'approved' && (userHasRole('superadmin') || userHasPermission('edit_work_order_request'))"
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
                    @click="navigateTo(`/operations/work-order-request/form/${workOrderRequest.id}`)"
                  >
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="navigateTo({ path: '/operations/cetak-work-order-request', query: { id: workOrderRequest.id } })"
                  >
                    <i class="ri-printer-line me-2"></i> Cetak / Print
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
            </template>
          </DetailPageHeader>

          <div class="row g-4">
            <!-- Main Content -->
            <div class="col-xl-8">
              <!-- Informasi Site -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0"><i class="ri-map-pin-2-line me-2 text-primary"></i>Informasi Site</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width:2px">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted">No. Work Order Request</label>
                      <p class="mb-0 fw-medium">{{ getWorkOrderRequestNo(workOrderRequest) || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tanggal Request</label>
                      <p class="mb-0">{{ workOrderRequest.requestDate || workOrderRequest.request_date || '—' }}</p>
                    </div>

                    <!-- Site Investment link -->
                    <div v-if="workOrderRequest.siteInvestmentId || workOrderRequest.site_investment_id" class="col-12">
                      <label class="form-label text-muted">Site Investment (SI)</label>
                      <p class="mb-0">
                        <NuxtLink
                          :to="`/implementation/site-investment/${workOrderRequest.siteInvestmentId ?? workOrderRequest.site_investment_id}`"
                          class="text-primary fw-medium"
                          style="text-decoration:underline"
                        >
                          <i class="ri-links-line me-1"></i>
                          {{ workOrderRequest.siteInvestment?.siNumber || workOrderRequest.siteInvestment?.si_number || '—' }}
                          <span class="text-muted fw-normal ms-1">— {{ workOrderRequest.siteInvestment?.name || '' }}</span>
                        </NuxtLink>
                      </p>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label text-muted">Nama Site / Project</label>
                      <p class="mb-0">{{ workOrderRequest.siteName || workOrderRequest.site_name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Perusahaan / Client</label>
                      <p class="mb-0">{{ workOrderRequest.client?.name || workOrderRequest.siteInvestment?.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Lokasi</label>
                      <p class="mb-0">{{ workOrderRequest.location || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">PIC Lokasi</label>
                      <p class="mb-0">{{ workOrderRequest.picName || workOrderRequest.pic_name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">No. HP PIC</label>
                      <p class="mb-0">{{ workOrderRequest.picPhone || workOrderRequest.pic_phone || '—' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detail Pekerjaan -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0"><i class="ri-tools-line me-2 text-primary"></i>Detail Pekerjaan</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width:2px">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Jenis Pekerjaan</label>
                      <p class="mb-0">
                        <span class="badge bg-label-secondary">{{ jobTypeLabel(workOrderRequest.jobType ?? workOrderRequest.job_type) }}</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tingkat Urgency</label>
                      <p class="mb-0">
                        <span :class="['badge', urgencyBadgeClass(workOrderRequest.urgencyLevel ?? workOrderRequest.urgency_level)]">
                          {{ urgencyFullLabel(workOrderRequest.urgencyLevel ?? workOrderRequest.urgency_level) }}
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Target Pelaksanaan</label>
                      <p class="mb-0">{{ workOrderRequest.targetDate || workOrderRequest.target_date || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Estimasi Durasi</label>
                      <p class="mb-0">{{ workOrderRequest.estimatedDuration || workOrderRequest.estimated_duration || '—' }}</p>
                    </div>
                    <div class="col-12" v-if="workOrderRequest.jobDescription || workOrderRequest.job_description">
                      <label class="form-label text-muted">Deskripsi Pekerjaan</label>
                      <p class="mb-0 text-break" style="white-space:pre-line">{{ workOrderRequest.jobDescription || workOrderRequest.job_description }}</p>
                    </div>
                    <div class="col-12" v-if="workOrderRequest.faultIndication || workOrderRequest.fault_indication">
                      <label class="form-label text-muted">Indikasi Gangguan</label>
                      <p class="mb-0 text-break text-warning-emphasis" style="white-space:pre-line">{{ workOrderRequest.faultIndication || workOrderRequest.fault_indication }}</p>
                    </div>
                    <div class="col-12" v-if="workOrderRequest.notes">
                      <label class="form-label text-muted">Catatan</label>
                      <p class="mb-0 text-break" style="white-space:pre-line">{{ workOrderRequest.notes }}</p>
                    </div>
                    <div v-if="workOrderRequest.status === 'rejected' && workOrderRequest.rejectionReason" class="col-12">
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ workOrderRequest.rejectionReason }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-xl-4">
              <!-- Metadata -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Metadata</h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Pemohon</label>
                    <p class="mb-0 fw-medium">{{ workOrderRequest.requestedByUser?.fullName || workOrderRequest.requestedByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ workOrderRequest.createdByUser?.fullName || workOrderRequest.createdByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0">{{ formatDateTime(workOrderRequest.createdAt) }}</p>
                  </div>
                  <div v-if="workOrderRequest.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ workOrderRequest.approvedByUser?.fullName || workOrderRequest.approvedByUser?.full_name || '—' }}</p>
                  </div>
                  <div v-if="workOrderRequest.submittedAt" class="mb-0">
                    <label class="form-label text-muted mb-1">Disubmit Pada</label>
                    <p class="mb-0">{{ formatDateTime(workOrderRequest.submittedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Approval Card -->
              <ApprovalCard
                :status-text="getStatusText(workOrderRequest)"
                :current-step="approvalStepDisplay"
                :current-approvers="workOrderRequest.currentApprovers ?? []"
                :approval-logs="workOrderRequest.approvalLogs ?? []"
              />

              <!-- Digital Signature Card -->
              <div class="card mt-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0"><i class="ri-pen-nib-line me-2 text-primary"></i>Tanda Tangan Digital</h5>
                </div>
                <div class="card-body px-5 pt-2 pb-4">
                  <MultiSignatureDisplay
                    :key="'sig-' + workOrderRequest.id"
                    document-type="work-order-requests"
                    :document-id="String(workOrderRequest.id)"
                    title="Tanda Tangan Digital"
                    :columns="4"
                    :qr-size="96"
                    :compact="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)" @click.self="showRejectModal = false">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Reject Work Order Request</h5>
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
  useWorkOrderRequestStore,
  getWorkOrderRequestNo,
  JOB_TYPE_LABELS,
  URGENCY_LABELS,
  URGENCY_BADGE_CLASS,
} from '~/stores/work-order-request'
import type { WorkOrderJobType, WorkOrderUrgencyLevel } from '~/stores/work-order-request'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { usePermissions } from '~/composables/usePermissions'
import ApprovalCard from '~/components/ApprovalCard.vue'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'

const route = useRoute()
const store = useWorkOrderRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { workOrderRequest, loading, error } = storeToRefs(store)
const { getStatusBadge, getStatusText } = useApprovalStatus()

const id = computed(() => String(route.params.id || ''))
const showRejectModal = ref(false)
useEscapeToClose(showRejectModal, () => {
  showRejectModal.value = false
})
const rejectRemarks = ref('')

const isEditable = computed(() =>
  workOrderRequest.value?.status === 'draft' || workOrderRequest.value?.status === 'rejected'
)

const canApprove = computed(() =>
  workOrderRequest.value?.status === 'pending' &&
  (userHasRole('superadmin') || userHasPermission('approve_work_order_request'))
)

const canReject = computed(() => canApprove.value)

const approvalStepDisplay = computed(() => {
  const wor = workOrderRequest.value
  if (!wor || wor.status !== 'pending') return wor?.currentApprovalStep ?? null
  return wor.nextApprovalStep ?? (Number(wor.currentApprovalStep ?? 0) + 1)
})

function jobTypeLabel(type?: string): string {
  return JOB_TYPE_LABELS[(type as WorkOrderJobType)] ?? type?.toUpperCase() ?? '—'
}

function urgencyFullLabel(level?: string): string {
  return URGENCY_LABELS[(level as WorkOrderUrgencyLevel)] ?? level ?? '—'
}

function urgencyShortLabel(level?: string): string {
  const map: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }
  return map[level ?? ''] ?? level ?? '—'
}

function urgencyBadgeClass(level?: string): string {
  return URGENCY_BADGE_CLASS[(level as WorkOrderUrgencyLevel)] ?? 'bg-label-secondary'
}

function formatDateTime(v?: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

async function load() {
  if (!id.value) return
  await store.getWorkOrderRequestDetails(id.value)
}

async function onSubmit() {
  if (!workOrderRequest.value) return
  const ok = await store.submitWorkOrderRequest(workOrderRequest.value.id)
  if (ok) await load()
}

async function onApprove() {
  if (!workOrderRequest.value) return
  const ok = await store.approveWorkOrderRequest(workOrderRequest.value.id)
  if (ok) await load()
}

async function handleReject() {
  if (!workOrderRequest.value || !rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await store.rejectWorkOrderRequest(workOrderRequest.value.id, rejectRemarks.value.trim())
  if (ok) await load()
  rejectRemarks.value = ''
}

async function onComplete() {
  if (!workOrderRequest.value) return
  const ok = await store.markCompleted(workOrderRequest.value.id)
  if (ok) await load()
}

async function onDelete() {
  if (!workOrderRequest.value) return
  await store.deleteWorkOrderRequest(workOrderRequest.value.id)
  await navigateTo('/operations/work-order-request')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  hidePageHeading: true, layout: 'default', middleware: ['auth', 'check-permission'] })
</script>
