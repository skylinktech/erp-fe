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
          <li v-for="log in sortedApprovalLogs" :key="log.id" :class="(log.action ?? log.Action) === 'approved' ? 'text-success' : 'text-danger'">
            {{ (log.action ?? log.Action) === 'approved' ? 'Approved' : 'Rejected' }} by {{ getStepJabatanLabel(log) }}
            <div v-if="log.remarks" class="text-muted small">Catatan: {{ log.remarks }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: string
}

interface ApprovalLog {
  id: number
  stepOrder?: number
  step_order?: number
  action?: string
  Action?: string
  remarks?: string
  user?: { fullName?: string; full_name?: string; email?: string }
  workflow?: { steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string; jabatan?: { nm_jabatan?: string; nmJabatan?: string }; role?: { name?: string } }> }
  createdAt?: string
  created_at?: string
}

const props = defineProps<{
  statusText: string
  currentStep?: number | null
  currentApprovers?: ApproverInfo[]
  approvalLogs?: ApprovalLog[]
}>()

/** Urutan kronologis: sesuai urutan kejadian (created_at asc). Contoh: Approved → Rejected → Approved (resubmit) → Approved */
const sortedApprovalLogs = computed(() => {
  const logs = props.approvalLogs || []
  return [...logs].sort((a, b) => {
    const ta = new Date(a.createdAt ?? a.created_at ?? 0).getTime()
    const tb = new Date(b.createdAt ?? b.created_at ?? 0).getTime()
    if (ta !== tb) return ta - tb
    return (a.id ?? 0) - (b.id ?? 0)
  })
})

/** Label "Approved by X": prioritas Jabatan → Role → step_name → fullName user */
function getStepJabatanLabel(log: ApprovalLog) {
  const steps = log.workflow?.steps || []
  const stepOrder = log.stepOrder ?? log.step_order
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === stepOrder)
  const jabatan = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
  if (jabatan) return jabatan
  const role = step?.role?.name ?? ''
  if (role) return role
  const stepName = step?.step_name ?? step?.stepName ?? ''
  if (stepName) return stepName
  return log.user?.fullName ?? log.user?.full_name ?? log.user?.email ?? '—'
}

function stepLabel(log: ApprovalLog) {
  const steps = log.workflow?.steps || []
  const stepOrder = log.stepOrder ?? log.step_order
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === stepOrder)
  const stepName = step?.step_name ?? step?.stepName
  if (stepName) return stepName
  return `Step ${stepOrder}`
}
</script>
