<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1">

        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height:400px">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width:3rem;height:3rem"></div>
            <p class="mt-3 text-muted">Memuat Request Activation...</p>
          </div>
        </div>

        <div v-else-if="error && !requestActivation" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/operations/request-activation" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="requestActivation">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/operations/request-activation" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ getRequestActivationNo(requestActivation) || '—' }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="getRequestActivationNo(requestActivation) || '—'" />
                <small class="text-muted">{{ formatDateTime(requestActivation.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(requestActivation).class" class="badge">{{ getStatusBadge(requestActivation).text }}</span>
            </div>

            <div class="d-flex gap-2">
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
                    {{ requestActivation.status === 'rejected' ? 'Submit Revisi' : 'Submit untuk Approval' }}
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="showRejectModal = true">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a
                    v-if="requestActivation.status === 'approved' && (userHasRole('superadmin') || userHasPermission('edit_request_activation'))"
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
                    @click="navigateTo(`/operations/request-activation/form/${requestActivation.id}`)"
                  >
                    <i class="ri-edit-box-line me-2"></i> Edit
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
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0"><i class="ri-rocket-line me-2 text-primary"></i>Request Aktivasi</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width:2px">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Customer</label>
                      <p class="mb-0 fw-medium">{{ requestActivation.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tanggal</label>
                      <p class="mb-0">{{ requestActivation.requestDate || requestActivation.request_date || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Service Line</label>
                      <p class="mb-0">{{ requestActivation.serviceLine || requestActivation.service_line || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Paket Layanan</label>
                      <p class="mb-0">{{ requestActivation.planName || requestActivation.plan_name || requestActivation.servicePlan?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">SN KIT</label>
                      <p class="mb-0 fw-medium">{{ requestActivation.snKit || requestActivation.sn_kit || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Nama Lokasi</label>
                      <p class="mb-0">{{ requestActivation.locationName || requestActivation.location_name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">PIC</label>
                      <p class="mb-0">{{ requestActivation.picName || requestActivation.pic_name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Nomor PIC</label>
                      <p class="mb-0">{{ requestActivation.picPhone || requestActivation.pic_phone || '—' }}</p>
                    </div>
                    <div class="col-12">
                      <label class="form-label text-muted">Form Berlangganan</label>
                      <p class="mb-0">
                        <a
                          v-if="requestActivation.subscriptionFormUrl || requestActivation.subscription_form_url"
                          :href="requestActivation.subscriptionFormUrl || requestActivation.subscription_form_url || '#'"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-primary"
                        >
                          {{ requestActivation.subscriptionFormUrl || requestActivation.subscription_form_url }}
                        </a>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Service Instance</label>
                      <p class="mb-0">
                        <NuxtLink
                          v-if="requestActivation.serviceInstanceId || requestActivation.service_instance_id"
                          :to="`/service-management/${requestActivation.serviceInstanceId || requestActivation.service_instance_id}`"
                          class="text-primary"
                        >
                          {{ requestActivation.serviceInstanceId || requestActivation.service_instance_id }}
                        </NuxtLink>
                        <span v-else class="text-muted">— (di-link saat Complete)</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Subscription (linked)</label>
                      <p class="mb-0">
                        <NuxtLink
                          v-if="requestActivation.subscriptionId || requestActivation.subscription_id || requestActivation.subscription"
                        :to="`/order-process/subscription/detail/${requestActivation.subscriptionId || requestActivation.subscription_id || requestActivation.subscription?.id}`"
                          class="text-primary"
                        >
                          {{
                            requestActivation.subscription?.noSubscription ||
                            requestActivation.subscription?.no_subscription ||
                            requestActivation.subscriptionId ||
                            requestActivation.subscription_id
                          }}
                        </NuxtLink>
                        <span v-else class="text-muted">Belum dilink</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Contact AM</label>
                      <p class="mb-0">{{ requestActivation.contactAm || requestActivation.contact_am || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Request by</label>
                      <p class="mb-0">{{ requestActivation.requestedByUser?.fullName || requestActivation.requestedByUser?.full_name || '—' }}</p>
                    </div>
                    <div class="col-12">
                      <label class="form-label text-muted">Address</label>
                      <p class="mb-0 text-break" style="white-space:pre-line">{{ requestActivation.address || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Latitude</label>
                      <p class="mb-0">{{ formatCoord(requestActivation.latitude) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Longitude</label>
                      <p class="mb-0">{{ formatCoord(requestActivation.longitude) }}</p>
                    </div>
                    <div class="col-12" v-if="requestActivation.notes">
                      <label class="form-label text-muted">Keterangan</label>
                      <p class="mb-0 text-break" style="white-space:pre-line">{{ requestActivation.notes }}</p>
                    </div>
                    <div v-if="requestActivation.status === 'rejected' && requestActivation.rejectionReason" class="col-12">
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ requestActivation.rejectionReason }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4">
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Metadata</h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Pemohon</label>
                    <p class="mb-0 fw-medium">{{ requestActivation.requestedByUser?.fullName || requestActivation.requestedByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ requestActivation.createdByUser?.fullName || requestActivation.createdByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0">{{ formatDateTime(requestActivation.createdAt) }}</p>
                  </div>
                  <div v-if="requestActivation.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ requestActivation.approvedByUser?.fullName || requestActivation.approvedByUser?.full_name || '—' }}</p>
                  </div>
                  <div v-if="requestActivation.submittedAt" class="mb-0">
                    <label class="form-label text-muted mb-1">Disubmit Pada</label>
                    <p class="mb-0">{{ formatDateTime(requestActivation.submittedAt) }}</p>
                  </div>
                </div>
              </div>

              <ApprovalCard
                :status-text="getStatusText(requestActivation)"
                :current-step="approvalStepDisplay"
                :current-approvers="requestActivation.currentApprovers ?? []"
                :approval-logs="requestActivation.approvalLogs ?? []"
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
              <h5 class="modal-title">Reject Request Activation</h5>
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
  useRequestActivationStore,
  getRequestActivationNo,
} from '~/stores/request-activation'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { usePermissions } from '~/composables/usePermissions'
import ApprovalCard from '~/components/ApprovalCard.vue'

const route = useRoute()
const store = useRequestActivationStore()
const { userHasPermission, userHasRole } = usePermissions()
const { requestActivation, loading, error } = storeToRefs(store)
const { getStatusBadge, getStatusText } = useApprovalStatus()

const id = computed(() => String(route.params.id || ''))
const showRejectModal = ref(false)
const rejectRemarks = ref('')

const isEditable = computed(() =>
  requestActivation.value?.status === 'draft' || requestActivation.value?.status === 'rejected'
)

const canApprove = computed(() =>
  requestActivation.value?.status === 'pending' &&
  (userHasRole('superadmin') || userHasPermission('approve_request_activation'))
)

const canReject = computed(() => canApprove.value)

const approvalStepDisplay = computed(() => {
  const row = requestActivation.value
  if (!row || row.status !== 'pending') return row?.currentApprovalStep ?? null
  return row.nextApprovalStep ?? (Number(row.currentApprovalStep ?? 0) + 1)
})

function formatDateTime(v?: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatCoord(v?: number | string | null) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

async function load() {
  if (!id.value) return
  await store.getRequestActivationDetails(id.value)
}

async function onSubmit() {
  if (!requestActivation.value) return
  const ok = await store.submitRequestActivation(requestActivation.value.id)
  if (ok) await load()
}

async function onApprove() {
  if (!requestActivation.value) return
  const ok = await store.approveRequestActivation(requestActivation.value.id)
  if (ok) await load()
}

async function handleReject() {
  if (!requestActivation.value || !rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await store.rejectRequestActivation(requestActivation.value.id, rejectRemarks.value.trim())
  if (ok) await load()
  rejectRemarks.value = ''
}

async function onComplete() {
  if (!requestActivation.value) return
  const ok = await store.markCompleted(requestActivation.value.id)
  if (ok) await load()
}

async function onDelete() {
  if (!requestActivation.value) return
  await store.deleteRequestActivation(requestActivation.value.id)
  await navigateTo('/operations/request-activation')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  hidePageHeading: true, layout: 'default', middleware: ['auth', 'check-permission'], title: 'Request Activation Detail' })
</script>
