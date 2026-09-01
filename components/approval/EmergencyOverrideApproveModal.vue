<template>
  <div v-if="modelValue" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.45)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-danger">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Emergency Override Approve</h5>
          <button type="button" class="btn-close btn-close-white" @click="close" />
        </div>
        <div class="modal-body">
          <div class="alert alert-warning small mb-3">
            Emergency approval override akan melewati assignment approver,
            company scope, dan/atau maker-checker.
            <br><br>
            Technical integrity, accounting, inventory, and finalization rules
            will tetap dijalankan.
            <br><br>
            Seluruh tindakan dicatat secara permanen.
          </div>
          <div class="mb-3">
            <label class="form-label">Alasan override <span class="text-danger">*</span></label>
            <textarea v-model="reason" class="form-control" rows="3" :minlength="10" placeholder="Minimal 10 karakter" />
          </div>
          <div class="mb-3">
            <label class="form-label">Ticket / referensi (opsional)</label>
            <input v-model="ticketRef" type="text" class="form-control" maxlength="128" />
          </div>
          <div class="form-check mb-2">
            <input id="overrideConfirm" v-model="confirmed" class="form-check-input" type="checkbox">
            <label class="form-check-label" for="overrideConfirm">
              Saya memahami tindakan ini akan dicatat sebagai emergency override.
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="close">Batal</button>
          <button type="button" class="btn btn-danger" :disabled="!canSubmit || loading" @click="submit">
            Emergency Override Approve
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: [{ reason: string; ticketRef?: string }]
}>()

const reason = ref('')
const ticketRef = ref('')
const confirmed = ref(false)

const canSubmit = computed(
  () => confirmed.value && reason.value.trim().length >= 10
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      reason.value = ''
      ticketRef.value = ''
      confirmed.value = false
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  if (!canSubmit.value) return
  emit('confirm', {
    reason: reason.value.trim(),
    ticketRef: ticketRef.value.trim() || undefined,
  })
}
</script>
