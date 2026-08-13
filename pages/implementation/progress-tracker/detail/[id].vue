<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div v-if="loading" class="d-flex justify-content-center pt-10">
        <div class="spinner-border text-primary" />
      </div>

      <div v-else-if="!project" class="alert alert-danger">
        Project tidak ditemukan.
        <NuxtLink to="/implementation/progress-tracker" class="alert-link ms-2">Kembali</NuxtLink>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div class="d-flex flex-wrap align-items-center gap-3">
            <NuxtLink to="/implementation/progress-tracker" class="btn btn-outline-secondary btn-sm">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <div>
              <h4 class="mb-0">{{ project.name }}</h4>
              <small class="text-muted">{{ getProjectCode(project) }}</small>
            </div>
            <span :class="getProjectStatusBadge(project.status).class">
              {{ getProjectStatusBadge(project.status).text }}
            </span>
            <span :class="getApprovalStatusBadge(approvalBadgeRow(project)).class">
              {{ getApprovalStatusBadge(approvalBadgeRow(project)).text }}
            </span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <button
              v-if="canSubmit"
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="loading"
              @click="onSubmit"
            >
              <i class="ri-send-plane-line me-1"></i>
              {{ approvalStatus === 'rejected' ? 'Submit Revisi' : 'Submit' }}
            </button>
            <div v-if="canEdit || canDelete || canApprove || canReject" class="btn-group" role="group">
            <button
              id="progressTrackerActionsDropdown"
              type="button"
              class="btn btn-outline-secondary dropdown-toggle btn-sm"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span class="d-none d-sm-inline">Actions</span>
              <span class="d-sm-none"><i class="ri-more-2-line"></i></span>
            </button>
            <div class="dropdown-menu dropdown-menu-end" aria-labelledby="progressTrackerActionsDropdown">
              <a
                v-if="canApprove"
                class="dropdown-item text-success"
                href="javascript:void(0)"
                @click="showApproveModal = true"
              >
                <i class="ri-check-line me-2"></i> Approve
              </a>
              <a
                v-if="canReject"
                class="dropdown-item text-danger"
                href="javascript:void(0)"
                @click="showRejectModal = true"
              >
                <i class="ri-close-line me-2"></i> Reject
              </a>
              <a
                v-if="canEdit"
                class="dropdown-item"
                href="javascript:void(0)"
                @click="navigateTo(`/implementation/progress-tracker/form/${project.id}`)"
              >
                <i class="ri-edit-box-line me-2"></i> Edit
              </a>
              <a
                v-if="canDelete"
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

        <div v-if="!workflowConfigured" class="alert alert-warning mb-4">
          Approval workflow entitas <code>progress_tracker</code> belum dikonfigurasi.
          <NuxtLink to="/admin/approval-workflows">Atur di Approval Workflows</NuxtLink>.
        </div>

        <div v-if="approvalStatus === 'rejected' && rejectionReason" class="alert alert-danger mb-4">
          <strong>Alasan penolakan:</strong> {{ rejectionReason }}
        </div>

        <div v-if="approvalStatus !== 'approved'" class="alert alert-info mb-4">
          Perubahan status node hanya dapat dilakukan setelah project disetujui.
        </div>

        <div class="row g-4 mb-4">
          <div class="col-xl-8">
            <div class="card">
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="small text-muted">Site Investment</div>
                    <div class="fw-medium">
                      <NuxtLink
                        v-if="project.siteInvestment?.id"
                        :to="`/sales/site-investment/detail/${project.siteInvestment.id}`"
                        class="text-primary text-decoration-none"
                      >
                        {{
                          project.siteInvestment?.siNumber ||
                          project.siteInvestment?.si_number ||
                          '—'
                        }}
                      </NuxtLink>
                      <template v-else>
                        {{
                          project.siteInvestment?.siNumber ||
                          project.siteInvestment?.si_number ||
                          '—'
                        }}
                      </template>
                      <span v-if="project.siteInvestment?.name" class="text-muted">
                        — {{ project.siteInvestment.name }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="small text-muted">Customer</div>
                    <div class="fw-medium">
                      {{
                        project.customer?.name ||
                        project.customer?.customerName ||
                        project.customer?.customer_name ||
                        '—'
                      }}
                    </div>
                  </div>
                  <div v-if="project.description" class="col-12">
                    <div class="small text-muted">Deskripsi</div>
                    <p class="mb-0">{{ project.description }}</p>
                  </div>
                </div>

                <hr class="my-4" />

                <h6 class="mb-3">Progress Keseluruhan Project</h6>
                <ProgressTrackerStatusBar :status="overallRepresentativeStatus" />
                <p class="small text-muted mb-0 mt-2">
                  Rata-rata progres {{ projectProgressPercent }}% dari
                  {{ project.nodes?.length ?? 0 }} node
                </p>
              </div>
            </div>
          </div>
          <div class="col-xl-4">
            <ApprovalCard
              v-if="approvalLogs.length || approvalStatus === 'pending'"
              :status-text="approvalStatusText"
              :current-step="project.nextApprovalStep ?? project.next_approval_step ?? null"
              :current-approvers="project.currentApprovers ?? project.current_approvers"
              :approval-logs="approvalLogs"
            />
            <div class="card">
              <div class="card-body">
                <h6 class="mb-3">Ringkasan Node per Status</h6>
                <div v-for="opt in PROGRESS_TRACKER_STATUS_OPTIONS" :key="opt.value" class="d-flex justify-content-between small mb-1">
                  <span>{{ opt.label }}</span>
                  <span class="fw-medium">{{ nodeCountByStatus(opt.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 align-items-start">
          <div :class="project.siteInvestment ? 'col-xl-8' : 'col-12'">
            <div class="card h-100">
              <div class="card-header border-0 bg-transparent pt-4 pb-2 px-4">
                <h5 class="mb-4">Progress per Node / Network</h5>
                <div v-if="!(project.nodes?.length)" class="text-muted small pb-2">
                  Belum ada node pada project ini.
                </div>
                <ul
                  v-else
                  class="nav nav-tabs node-progress-tabs flex-nowrap mb-0"
                  role="tablist"
                >
                  <li
                    v-for="(node, index) in project.nodes"
                    :key="node.id"
                    class="nav-item d-flex align-items-center"
                    role="presentation"
                  >
                    <span
                      v-if="index > 0"
                      class="node-progress-tabs__separator"
                      aria-hidden="true"
                    >|</span>
                    <button
                      type="button"
                      class="nav-link d-flex align-items-center gap-2"
                      :class="{ active: activeNodeId === node.id }"
                      role="tab"
                      :aria-selected="activeNodeId === node.id"
                      @click="activeNodeId = node.id"
                    >
                      <span class="text-truncate node-progress-tabs__label">{{ nodeTabLabel(node) }}</span>
                      <span
                        class="badge rounded-pill flex-shrink-0"
                        :class="getProgressStatusBadge(getNodeStatus(node)).class"
                      >
                        {{ getProgressStatusBadge(getNodeStatus(node)).text }}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>

              <div v-if="project.nodes?.length" class="card-body pt-3 pb-4 px-4">
                <div
                  v-for="node in project.nodes"
                  v-show="activeNodeId === node.id"
                  :key="node.id"
                  role="tabpanel"
                >
                  <NodeProgressPanel
                    :node="node"
                    :project-id="project.id"
                    :approval-status="approvalStatus"
                    @updated="refresh"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-if="project.siteInvestment" class="col-xl-4">
            <div class="card h-100">
              <div class="card-body px-4 py-4">
                <ProgressTrackerSiteInvestmentItems :site-investment="project.siteInvestment" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="showApproveModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Project</h5>
            <button type="button" class="btn-close" @click="showApproveModal = false"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="approveRemarks" class="form-control" rows="3" placeholder="Catatan approval (opsional)"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showApproveModal = false">Batal</button>
            <button type="button" class="btn btn-success" :disabled="loading" @click="onApprove">Approve</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reject Project</h5>
            <button type="button" class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Alasan penolakan (wajib)" required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
            <button type="button" class="btn btn-danger" :disabled="loading || !rejectReason?.trim()" @click="onReject">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import NodeProgressPanel from '~/components/progress-tracker/NodeProgressPanel.vue'
import ProgressTrackerStatusBar from '~/components/progress-tracker/ProgressTrackerStatusBar.vue'
import ProgressTrackerSiteInvestmentItems from '~/components/progress-tracker/ProgressTrackerSiteInvestmentItems.vue'
import ApprovalCard from '~/components/ApprovalCard.vue'
import {
  useProgressTrackerStore,
  getProjectCode,
  getNodeStatus,
} from '~/stores/progress-tracker'
import { usePermissions } from '~/composables/usePermissions'
import { useProgressTrackerApproval } from '~/composables/useProgressTrackerApproval'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import {
  getProjectStatusBadge,
  getProgressStatusBadge,
  getProgressTrackerPercent,
  getProjectApprovalStatus,
  PROGRESS_TRACKER_STATUS_OPTIONS,
  PROGRESS_TRACKER_STATUSES,
  type ProgressTrackerStatus,
} from '~/constants/implementation/progressTrackerStatuses'
import type { ProgressTrackerNode } from '~/stores/progress-tracker'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Progress Tracker',
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const store = useProgressTrackerStore()
const { project, loading, workflowConfigured } = storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()
const {
  canApproveProgressTracker,
  canRejectProgressTracker,
  canSubmitProgressTracker,
} = useProgressTrackerApproval()
const { getStatusBadge: getApprovalStatusBadge, getStatusText } = useApprovalStatus()

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveRemarks = ref('')
const rejectReason = ref('')

const approvalStatus = computed(() => getProjectApprovalStatus(project.value))
const approvalLogs = computed(
  () => project.value?.approvalLogs ?? project.value?.approval_logs ?? []
)
const approvalStatusText = computed(() =>
  getStatusText({ ...project.value, status: approvalStatus.value })
)
const rejectionReason = computed(
  () => project.value?.rejectionReason ?? project.value?.rejection_reason ?? ''
)

const canEdit = computed(
  () =>
    (approvalStatus.value === 'draft' || approvalStatus.value === 'rejected') &&
    (userHasRole('superadmin') || userHasPermission('edit_progress_tracker'))
)
const canDelete = computed(
  () =>
    approvalStatus.value === 'draft' &&
    (userHasRole('superadmin') || userHasPermission('delete_progress_tracker'))
)
const canSubmit = computed(() => canSubmitProgressTracker(project.value))
const canApprove = computed(() => canApproveProgressTracker(project.value))
const canReject = computed(() => canRejectProgressTracker(project.value))

function approvalBadgeRow(row: NonNullable<typeof project.value>) {
  return { ...row, status: getProjectApprovalStatus(row) }
}

const activeNodeId = ref<string | null>(null)

function nodeTabLabel(node: ProgressTrackerNode) {
  const code = node.nodeCode || node.node_code
  const network = node.networkIdentifier || node.network_identifier
  if (node.name && code) return `${node.name} (${code})`
  return node.name || code || network || 'Node'
}

watch(
  () => project.value?.nodes,
  (nodes) => {
    if (!nodes?.length) {
      activeNodeId.value = null
      return
    }
    const stillExists = nodes.some((node) => node.id === activeNodeId.value)
    if (!stillExists) {
      activeNodeId.value = nodes[0]?.id ?? null
    }
  },
  { immediate: true }
)

function nodeCountByStatus(status: ProgressTrackerStatus) {
  return (project.value?.nodes ?? []).filter((n) => getNodeStatus(n) === status).length
}

const projectProgressPercent = computed(() => {
  const nodes = project.value?.nodes ?? []
  if (!nodes.length) return 0
  const sum = nodes.reduce((s, n) => s + getProgressTrackerPercent(getNodeStatus(n)), 0)
  return Math.round(sum / nodes.length)
})

/** Status representatif untuk progress bar project (median tahap node). */
const overallRepresentativeStatus = computed((): ProgressTrackerStatus => {
  const nodes = project.value?.nodes ?? []
  if (!nodes.length) return 'material_readiness'
  const indices = nodes
    .map((n) => PROGRESS_TRACKER_STATUSES.indexOf(getNodeStatus(n)))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)
  const mid = indices[Math.floor(indices.length / 2)] ?? 0
  return PROGRESS_TRACKER_STATUSES[mid] ?? 'material_readiness'
})

async function refresh() {
  if (id.value) await store.getProjectDetails(id.value)
}

async function onDelete() {
  if (!project.value?.id) return
  const ok = await store.deleteProject(project.value.id)
  if (ok) navigateTo('/implementation/progress-tracker')
}

async function onSubmit() {
  if (!project.value?.id) return
  const ok = await store.submitForApproval(project.value.id)
  if (ok) await refresh()
}

async function onApprove() {
  if (!project.value?.id) return
  const ok = await store.approve(project.value.id, approveRemarks.value)
  showApproveModal.value = false
  approveRemarks.value = ''
  if (ok) await refresh()
}

async function onReject() {
  if (!project.value?.id || !rejectReason.value?.trim()) return
  const ok = await store.reject(project.value.id, rejectReason.value)
  showRejectModal.value = false
  rejectReason.value = ''
  if (ok) await refresh()
}

onMounted(() => refresh())
</script>

<style scoped>
.node-progress-tabs {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  border-bottom: 1px solid rgba(67, 89, 113, 0.12);
  padding-top: 0.25rem;
}

.node-progress-tabs .nav-link {
  max-width: 16rem;
  white-space: nowrap;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.node-progress-tabs__label {
  max-width: 10rem;
}

.node-progress-tabs__separator {
  color: rgba(67, 89, 113, 0.35);
  font-size: 1rem;
  line-height: 1;
  padding: 0 0.35rem;
  user-select: none;
}
</style>
