<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container-pt-12">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail permintaan akses...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="!loading && !request" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          Permintaan akses tidak ditemukan.
          <NuxtLink to="/admin/access-request" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="request">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/admin/access-request" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">Detail Permintaan Akses #{{ request.id }}</h4>
                <small class="text-muted">{{ formatDateTime(request.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(request).class" class="badge">{{ getStatusBadge(request).text }}</span>
              <span :class="getPriorityBadgeClass(request.priority)" class="badge">{{ request.priority }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnActions" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span>Actions</span>
                </button>
                <div class="dropdown-menu" aria-labelledby="btnActions">
                  <a v-if="request.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="handleSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit
                  </a>
                  <a v-if="request.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="router.push(`/admin/access-request?edit=${request.id}`)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="showApproveModal = true">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="showRejectModal = true">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a v-if="request.status === 'draft' || request.status === 'pending'" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleCancel">
                    <i class="ri-close-circle-line me-2"></i> Batalkan
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Card: Informasi Pegawai -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Pegawai
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Nama Pegawai</label>
                      <p class="mb-0 fw-medium">{{ request.pegawai_nama || request.pegawai?.nm_pegawai || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Departemen</label>
                      <p class="mb-0">{{ request.departemen || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Jabatan</label>
                      <p class="mb-0">{{ request.jabatan || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Requested By</label>
                      <p class="mb-0">{{ request.requestedByUser?.full_name || request.requestedByUser?.email || '—' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card: Informasi Permintaan -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-list-3-line me-2 text-primary"></i>
                    Informasi Permintaan
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-12">
                      <label class="form-label text-muted">Deskripsi / Alasan</label>
                      <p class="mb-0 text-break">{{ request.description || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Prioritas</label>
                      <p class="mb-0">{{ request.priority || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Periode Akses</label>
                      <p class="mb-0">
                        {{ request.accessPeriod === 'temporary' && request.expiryDate ? `Sementara (hingga ${formatDate(request.expiryDate)})` : 'Permanen' }}
                      </p>
                    </div>
                    <div v-if="request.rejectReason" class="col-12">
                      <label class="form-label text-muted">Alasan Reject</label>
                      <p class="mb-0 text-danger text-break">{{ request.rejectReason }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card: Permission yang Diminta -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-shield-keyhole-line me-2 text-primary"></i>
                    Permission yang Diminta
                  </h5>
                  <span v-if="request.permissions?.length" class="badge bg-label-primary">{{ request.permissions.length }} item</span>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!request.permissions?.length" class="text-muted text-center py-4">Tidak ada permission</div>
                  <div v-else class="d-flex flex-wrap gap-2">
                    <span
                      v-for="p in request.permissions"
                      :key="p.id"
                      class="badge bg-label-primary"
                    >
                      {{ p.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-xl-4 col-12">
              <ApprovalCard
                :status-text="getStatusText(request)"
                :current-step="request.currentApprovalStep"
                :current-approvers="request.currentApprovers || []"
                :approval-logs="request.approvalLogs || []"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>

  <!-- Approve Modal -->
  <Teleport to="body">
    <div v-if="showApproveModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click.self="showApproveModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Permintaan Akses</h5>
            <button type="button" class="btn-close" @click="showApproveModal = false"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Catatan (opsional)</label>
            <textarea v-model="approveRemarks" class="form-control" rows="2" placeholder="Catatan untuk approver..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showApproveModal = false">Batal</button>
            <button type="button" class="btn btn-success" @click="handleApprove">
              <i class="ri-check-line me-1"></i> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Reject Modal -->
  <Teleport to="body">
    <div v-if="showRejectModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click.self="showRejectModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reject Permintaan Akses</h5>
            <button type="button" class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Alasan Reject <span class="text-danger">*</span></label>
            <textarea v-model="rejectRemarks" class="form-control" rows="3" placeholder="Wajib diisi..." required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
            <button type="button" class="btn btn-danger" :disabled="!rejectRemarks?.trim()" @click="handleReject">
              <i class="ri-close-line me-1"></i> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccessRequestStore } from '~/stores/access-request'
import { useUserStore } from '~/stores/user'
import { useApprovalStatus } from '~/composables/useApprovalStatus'

const route = useRoute()
const router = useRouter()
const store = useAccessRequestStore()
const userStore = useUserStore()
const { getStatusBadge } = useApprovalStatus()

const request = ref(null)
const loading = ref(true)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveRemarks = ref('')
const rejectRemarks = ref('')

const canApprove = computed(() => {
  if (!request.value?.currentApprovers?.length) return false
  const user = userStore.user
  if (!user?.id) return false
  return request.value.currentApprovers.some((a) => a.userId === user.id)
})

const canReject = computed(() => canApprove.value)

function getPriorityBadgeClass(priority) {
  const map = {
    low: 'badge rounded-pill bg-label-info',
    medium: 'badge rounded-pill bg-label-warning',
    high: 'badge rounded-pill bg-label-danger',
  }
  return map[priority] || 'badge rounded-pill bg-label-light'
}

function getStatusText(req) {
  if (!req) return '—'
  const s = req.status
  if (s === 'draft') return 'Draft'
  if (s === 'pending') return 'Menunggu Approval'
  if (s === 'approved') return 'Approved'
  if (s === 'rejected') return 'Rejected'
  if (s === 'cancelled') return 'Dibatalkan'
  return s || '—'
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return String(val)
  }
}

function formatDateTime(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return String(val)
  }
}

async function load() {
  loading.value = true
  try {
    request.value = await store.fetchDetail(route.params.id)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const ok = await store.submit(route.params.id)
  if (ok) {
    await load()
    router.push('/admin/access-request')
  }
}

async function handleApprove() {
  showApproveModal.value = false
  const ok = await store.approve(route.params.id, approveRemarks.value)
  if (ok) await load()
  approveRemarks.value = ''
}

async function handleReject() {
  if (!rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await store.reject(route.params.id, rejectRemarks.value)
  if (ok) await load()
  rejectRemarks.value = ''
}

async function handleCancel() {
  const ok = await store.cancel(route.params.id)
  if (ok) {
    await load()
    router.push('/admin/access-request')
  }
}

onMounted(load)

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Permintaan Akses',
})
</script>
