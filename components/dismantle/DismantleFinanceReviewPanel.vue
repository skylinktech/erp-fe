<template>
  <div class="card mb-4" v-if="visible">
    <div class="card-header bg-transparent border-0 px-4 py-3">
      <h6 class="mb-0">Finance Review</h6>
    </div>
    <div class="card-body px-4 pt-0 pb-4">
      <p v-if="!serviceLines.length" class="text-muted mb-0">Tidak ada service line.</p>
      <div v-for="svc in serviceLines" :key="svc.id" class="border rounded p-3 mb-3">
        <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
          <div>
            <div class="fw-medium">{{ svc.serviceNumber || svc.serviceInstanceId }}</div>
            <small class="text-muted">{{ svc.planName }}</small>
          </div>
          <span class="badge bg-label-info">{{ svc.financeReviewStatus || '—' }}</span>
        </div>
        <div v-if="svc.financeReviewStatus === 'PENDING' || svc.financeReviewStatus === 'REVISION_REQUIRED'" class="row g-2">
          <div class="col-12">
            <label class="form-label">Keputusan</label>
            <select v-model="decisions[svc.id]" class="form-select">
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="REQUEST_REVISION">Request Revision</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Catatan</label>
            <textarea v-model="notes[svc.id]" class="form-control" rows="2"></textarea>
          </div>
          <div class="col-12">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="reviewing"
              @click="submitReview(svc.id)"
            >
              Simpan Review
            </button>
          </div>
        </div>
        <div v-else class="text-muted small">Review tidak diperlukan atau sudah final.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { DismantleRequestService } from '~/types/operations/dismantle'

const props = defineProps<{
  serviceLines: DismantleRequestService[]
  visible?: boolean
  reviewing?: boolean
}>()

const emit = defineEmits<{
  review: [serviceLineId: string, payload: { decision: string; notes?: string }]
}>()

const decisions = reactive<Record<string, string>>({})
const notes = reactive<Record<string, string>>({})

function submitReview(serviceLineId: string) {
  emit('review', serviceLineId, {
    decision: decisions[serviceLineId] || 'APPROVE',
    notes: notes[serviceLineId],
  })
}
</script>
