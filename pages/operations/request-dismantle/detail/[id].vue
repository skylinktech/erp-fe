<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loadingDetail" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Memuat Request Dismantle...</p>
      </div>

      <template v-else-if="selected">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <NuxtLink to="/operations/request-dismantle" class="btn btn-outline-secondary btn-sm mb-2">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <h4 class="mb-1">{{ selected.requestNumber }}</h4>
            <DismantleProgressSummary :status="selected.status" :phase="selected.summaryPhase" />
          </div>
          <div class="d-flex gap-2">
            <div v-if="hasAnyAction" class="btn-group">
              <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown">
                Actions
              </button>
              <div class="dropdown-menu dropdown-menu-end">
                <a
                  v-if="canEdit"
                  class="dropdown-item"
                  href="javascript:void(0)"
                  @click="navigateTo(`/operations/request-dismantle/form/${selected.id}`)"
                >
                  <i class="ri-edit-box-line me-2"></i> Edit Draft
                </a>
                <a
                  v-if="canSubmit"
                  class="dropdown-item"
                  :class="{ disabled: submitting }"
                  href="javascript:void(0)"
                  @click="!submitting && store.submitRequest(selected.id)"
                >
                  <i class="ri-send-plane-line me-2"></i> Submit
                </a>
                <div v-if="canApprove || canEmergencyOverrideApprove || canReject" class="dropdown-divider"></div>
                <a
                  v-if="canApprove"
                  class="dropdown-item"
                  :class="{ disabled: approving }"
                  href="javascript:void(0)"
                  @click="!approving && onApprove()"
                >
                  <i class="ri-check-line me-2"></i> Approve
                </a>
                <a
                  v-if="canEmergencyOverrideApprove"
                  class="dropdown-item text-danger"
                  :class="{ disabled: approving }"
                  href="javascript:void(0)"
                  @click="!approving && (showOverrideModal = true)"
                >
                  <i class="ri-shield-flash-line me-2"></i> Emergency Override Approve
                </a>
                <a
                  v-if="canReject"
                  class="dropdown-item text-danger"
                  :class="{ disabled: rejecting }"
                  href="javascript:void(0)"
                  @click="!rejecting && onReject()"
                >
                  <i class="ri-close-line me-2"></i> Reject
                </a>
                <div v-if="canStart || canExecute || canReceive" class="dropdown-divider"></div>
                <a
                  v-if="canStart"
                  class="dropdown-item"
                  :class="{ disabled: starting }"
                  href="javascript:void(0)"
                  @click="!starting && store.startRequest(selected.id)"
                >
                  <i class="ri-play-line me-2"></i> Start
                </a>
                <a
                  v-if="canExecute"
                  class="dropdown-item"
                  href="javascript:void(0)"
                  @click="navigateTo(`/operations/request-dismantle/${selected.id}/execute`)"
                >
                  <i class="ri-tools-line me-2"></i> Execute
                </a>
                <a
                  v-if="canReceive"
                  class="dropdown-item"
                  href="javascript:void(0)"
                  @click="navigateTo(`/operations/request-dismantle/${selected.id}/receive`)"
                >
                  <i class="ri-inbox-archive-line me-2"></i> Receive
                </a>
                <div v-if="canTerminate || canSyncCharges" class="dropdown-divider"></div>
                <a
                  v-if="canTerminate"
                  class="dropdown-item text-danger"
                  :class="{ disabled: terminatingServices }"
                  href="javascript:void(0)"
                  @click="!terminatingServices && store.terminateServices(selected.id)"
                >
                  <i class="ri-stop-circle-line me-2"></i> Terminate Services
                </a>
                <a
                  v-if="canSyncCharges"
                  class="dropdown-item"
                  :class="{ disabled: syncingCharges }"
                  href="javascript:void(0)"
                  @click="!syncingCharges && store.syncFinalCharges(selected.id)"
                >
                  <i class="ri-refresh-line me-2"></i> Sync Charges
                </a>
              </div>
            </div>
          </div>
        </div>

        <ul class="nav nav-tabs mb-4 flex-nowrap overflow-auto">
          <li v-for="tab in tabs" :key="tab.id" class="nav-item">
            <button type="button" class="nav-link" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
          </li>
        </ul>

        <div v-show="activeTab === 'overview'">
          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <div class="card h-100"><div class="card-body">
                <h6>Customer / Site</h6>
                <p class="mb-1">{{ selected.customer?.name }} — {{ selected.site?.name }}</p>
                <p class="mb-1 text-muted">Efektif: {{ formatJakarta(selected.requestedEffectiveTerminationAt) }}</p>
                <p class="mb-0 text-muted">Warehouse: {{ selected.destinationWarehouse?.name || '—' }}</p>
              </div></div>
            </div>
            <div class="col-md-6">
              <DismantleReadinessPanel :readiness="readiness" :loading="readinessLoading" />
            </div>
          </div>
          <DismantleRecoveryProgress :recovery="recoverySummary" />
          <DismantleCompletionPanel
            :readiness="completionReadiness"
            :can-complete="canComplete"
            :completing="completing"
            @complete="store.completeRequest(selected.id)"
          />
        </div>

        <div v-show="activeTab === 'services'">
          <div v-for="svc in selected.services" :key="svc.id" class="card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div>
                  <div class="fw-medium">{{ svc.serviceNumber }} — {{ svc.serviceName }}</div>
                  <small class="text-muted">{{ svc.planName }}</small>
                </div>
                <span class="badge bg-label-info">{{ svc.terminationStatus || 'PENDING' }}</span>
              </div>
              <div class="row g-2 mt-2 small">
                <div class="col-md-4">Cutoff: {{ svc.billingCutoffPolicy }}</div>
                <div class="col-md-4">Finance: {{ svc.financeReviewStatus || '—' }}</div>
                <div class="col-md-4">Error: {{ svc.terminationLastError || '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'equipment'">
          <div v-for="eq in allEquipment" :key="eq.id" class="card mb-2">
            <div class="card-body py-3 d-flex flex-wrap justify-content-between gap-2">
              <div>
                <div class="fw-medium">{{ eq.equipmentNo }}</div>
                <small>{{ eq.serialNumber }} · {{ eq.ownershipType }}</small>
              </div>
              <div class="text-end small">
                <div>Found: {{ eq.foundStatus }}</div>
                <div>Disposition: {{ eq.dispositionStatus || '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'schedule'">
          <div class="card"><div class="card-body">
            <p class="mb-1">Scheduled: {{ formatJakarta(selected.scheduledAt) }}</p>
            <p class="mb-1">Started: {{ formatJakarta(selected.startedAt) }}</p>
            <p class="mb-0">Notes: {{ selected.notes || '—' }}</p>
          </div></div>
        </div>

        <div v-show="activeTab === 'financial'">
          <div v-if="!canViewFinancial" class="alert alert-warning">Anda tidak memiliki akses financial summary.</div>
          <template v-else>
            <div class="card mb-3"><div class="card-body">
              <div v-for="c in financialSummary?.charges ?? []" :key="c.chargeKey" class="d-flex justify-content-between border-bottom py-2">
                <div>
                  <code>{{ c.chargeKey }}</code>
                  <div class="small text-muted">{{ c.chargeType }}</div>
                </div>
                <span class="badge bg-label-secondary">{{ c.status }}</span>
              </div>
            </div></div>
            <DismantleFinanceReviewPanel
              :service-lines="selected.services"
              :visible="canFinanceReview"
              :reviewing="reviewingFinance"
              @review="onFinanceReview"
            />
          </template>
        </div>

        <div v-show="activeTab === 'attachments'">
          <DismantleAttachmentsPanel
            :request-id="selected.id"
            :services="selected.services"
            :can-upload-any="canUploadAttachment"
          />
        </div>

        <div v-show="activeTab === 'audit'">
          <ApprovalCard
            :status-text="selected.approvalStatus || selected.status"
            :current-step="selected.nextApprovalStep"
            :current-approvers="selected.currentApprovers"
            :approval-logs="selected.approvalLogs"
          />
          <div class="card mt-3"><div class="card-body">
            <h6>Events</h6>
            <ul class="mb-0">
              <li v-for="ev in selected.events ?? []" :key="String(ev.id)">
                {{ ev.eventType || ev.event_type }} — {{ ev.createdAt || ev.created_at }}
              </li>
            </ul>
          </div></div>
        </div>
      </template>
    </div>
    <EmergencyOverrideApproveModal
      v-model="showOverrideModal"
      :loading="approving"
      @confirm="onEmergencyOverrideConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { useRequestDismantleStore } from '~/stores/request-dismantle'
import { usePermissions } from '~/composables/usePermissions'
import { useWorkflowApproval } from '~/composables/useWorkflowApproval'
import DismantleProgressSummary from '~/components/dismantle/DismantleProgressSummary.vue'
import DismantleReadinessPanel from '~/components/dismantle/DismantleReadinessPanel.vue'
import DismantleRecoveryProgress from '~/components/dismantle/DismantleRecoveryProgress.vue'
import DismantleCompletionPanel from '~/components/dismantle/DismantleCompletionPanel.vue'
import DismantleFinanceReviewPanel from '~/components/dismantle/DismantleFinanceReviewPanel.vue'
import DismantleAttachmentsPanel from '~/components/dismantle/DismantleAttachmentsPanel.vue'
import ApprovalCard from '~/components/ApprovalCard.vue'
import EmergencyOverrideApproveModal from '~/components/approval/EmergencyOverrideApproveModal.vue'

definePageMeta({ middleware: ['auth', 'check-permission'], title: 'Request Dismantle Detail', hidePageHeading: true })

const route = useRoute()
const store = useRequestDismantleStore()
const { userHasPermission } = usePermissions()
const {
  canApprove: workflowCanApprove,
  canEmergencyOverrideApprove: workflowCanEmergencyOverrideApprove,
  canReject: workflowCanReject,
} = useWorkflowApproval({
  approvePermission: 'approve_dismantle_request',
  rejectPermission: 'reject_dismantle_request',
  pendingStatuses: ['submitted'],
})
const showOverrideModal = ref(false)
const {
  selected,
  loadingDetail,
  readiness,
  readinessLoading,
  completionReadiness,
  recoverySummary,
  financialSummary,
  submitting,
  approving,
  rejecting,
  starting,
  terminatingServices,
  syncingCharges,
  completing,
  reviewingFinance,
} = storeToRefs(store)

const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'equipment', label: 'Equipment Recovery' },
  { id: 'schedule', label: 'Schedule & Execution' },
  { id: 'financial', label: 'Financial' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'audit', label: 'Approval & Audit' },
]

const allEquipment = computed(() => selected.value?.services?.flatMap((s) => s.equipments) ?? [])

const canEdit = computed(() => selected.value?.status === 'draft' && userHasPermission('edit_dismantle_request'))
const canSubmit = computed(() => selected.value?.status === 'draft' && userHasPermission('submit_dismantle_request'))
const canApprove = computed(() => workflowCanApprove(selected.value))
const canEmergencyOverrideApprove = computed(() =>
  workflowCanEmergencyOverrideApprove(selected.value)
)
const canReject = computed(() => workflowCanReject(selected.value))
const canStart = computed(() => ['approved', 'scheduled'].includes(selected.value?.status ?? '') )
const canExecute = computed(() => ['approved', 'scheduled', 'in_progress'].includes(selected.value?.status ?? ''))
const canReceive = computed(() => selected.value?.status === 'in_progress')
const canTerminate = computed(() => ['in_progress', 'scheduled', 'approved'].includes(selected.value?.status ?? ''))
const canSyncCharges = computed(() => userHasPermission('view_dismantle_financial_summary'))
const canComplete = computed(() => userHasPermission('approve_dismantle_request') || userHasPermission('edit_dismantle_request'))
const canViewFinancial = computed(() => userHasPermission('view_dismantle_financial_summary'))
const canFinanceReview = computed(() => userHasPermission('review_dismantle_finance'))
const canUploadAttachment = computed(
  () =>
    userHasPermission('upload_dismantle_attachment') &&
    !['completed', 'cancelled', 'rejected'].includes(selected.value?.status ?? '')
)

const hasAnyAction = computed(
  () =>
    canEdit.value ||
    canSubmit.value ||
    canApprove.value ||
    canEmergencyOverrideApprove.value ||
    canReject.value ||
    canStart.value ||
    canExecute.value ||
    canReceive.value ||
    canTerminate.value ||
    canSyncCharges.value
)

function formatJakarta(val?: string | null) {
  if (!val) return '—'
  return new Date(val).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

async function onApprove() {
  const { value: remarks } = await Swal.fire({ title: 'Approve', input: 'textarea', inputPlaceholder: 'Catatan (opsional)', showCancelButton: true })
  if (remarks === undefined) return
  await store.approveRequest(selected.value!.id, remarks || undefined)
  await reload()
}

async function onEmergencyOverrideConfirm(payload: { reason: string; ticketRef?: string }) {
  showOverrideModal.value = false
  const ok = await store.approveRequest(selected.value!.id, undefined, {
    override: {
      mode: 'SUPERADMIN_EMERGENCY_OVERRIDE',
      reason: payload.reason,
      ticketRef: payload.ticketRef,
    },
  })
  if (ok) await reload()
}

async function onReject() {
  const { value: reason, isConfirmed } = await Swal.fire({
    title: 'Reject Request',
    input: 'textarea',
    inputLabel: 'Alasan wajib',
    inputValidator: (v) => (!v || v.length < 3 ? 'Minimal 3 karakter' : undefined),
    showCancelButton: true,
  })
  if (!isConfirmed || !reason) return
  await store.rejectRequest(selected.value!.id, reason)
  await reload()
}

async function onFinanceReview(serviceLineId: string, payload: { decision: string; notes?: string }) {
  await store.financeReview(selected.value!.id, serviceLineId, {
    decision: payload.decision as 'APPROVE' | 'REJECT' | 'REQUEST_REVISION',
    notes: payload.notes,
    version: selected.value!.version,
  })
}

async function reload() {
  const id = String(route.params.id)
  await store.fetchDetail(id)
  await Promise.all([
    store.fetchReadiness(id, 'submit'),
    store.fetchCompletionReadiness(id),
    store.fetchRecoverySummary(id),
    canViewFinancial.value ? store.fetchFinancialSummary(id) : Promise.resolve(),
    canFinanceReview.value ? store.fetchFinancialReviewData(id) : Promise.resolve(),
  ])
}

onMounted(reload)
</script>
