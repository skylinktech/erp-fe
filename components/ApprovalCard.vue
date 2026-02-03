<template>
  <div class="card mb-4 shadow-sm border-0">
    <div class="card-header border-0 bg-transparent px-5 py-4">
      <h5 class="card-title mb-0">Approval</h5>
    </div>
    <div class="card-body px-5 pt-3 pb-4">
      <div class="mb-3">
        <div class="text-muted">Status</div>
        <div class="fw-semibold">{{ statusText }}</div>
      </div>
      <div v-if="currentStep != null" class="mb-3">
        <div class="text-muted">Step Saat Ini</div>
        <div class="fw-semibold">{{ currentStep || '—' }}</div>
      </div>
      <div v-if="(currentApprovers?.length || 0) > 0" class="mb-3">
        <div class="text-muted">Approver Saat Ini</div>
        <ul class="mb-0 ps-3">
          <li v-for="ap in currentApprovers" :key="ap.userId">
            {{ ap.fullName || ap.email || ap.userId }}
            <small v-if="ap.source" class="text-muted">({{ ap.source }})</small>
          </li>
        </ul>
      </div>
      <div v-if="(approvalLogs?.length || 0) > 0">
        <div class="text-muted">Riwayat Approval</div>
        <ul class="mb-0 ps-3">
          <li v-for="log in approvalLogs" :key="log.id">
            {{ log.action === 'approved' ? 'Approved' : 'Rejected' }} by {{ getStepJabatanLabel(log) }} — {{ stepLabel(log) }}
            <div v-if="log.remarks" class="text-muted small">Catatan: {{ log.remarks }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: string
}

interface ApprovalLog {
  id: number
  stepOrder: number
  action: string
  remarks?: string
  user?: { fullName?: string; full_name?: string; email?: string }
  workflow?: { steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string; jabatan?: { nm_jabatan?: string; nmJabatan?: string } }> }
  createdAt?: string
}

const props = defineProps<{
  statusText: string
  currentStep?: number | null
  currentApprovers?: ApproverInfo[]
  approvalLogs?: ApprovalLog[]
}>()

/** Jabatan dari step workflow (bukan jabatan user) — sesuai konfigurasi approval_workflow_steps */
function getStepJabatanLabel(log: ApprovalLog) {
  const steps = log.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  const nm = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
  if (nm) return nm
  const stepName = step?.step_name ?? step?.stepName ?? ''
  if (stepName) return stepName
  return log.user?.fullName ?? log.user?.full_name ?? log.user?.email ?? '—'
}

function stepLabel(log: ApprovalLog) {
  const steps = log.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  const stepName = step?.step_name ?? step?.stepName
  if (stepName) return stepName
  return `Step ${log.stepOrder}`
}
</script>
