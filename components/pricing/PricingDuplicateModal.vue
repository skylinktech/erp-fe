<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.35)"
    @click.self="onCancel"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">Duplikat sebagai Draft</h2>
          <button type="button" class="btn-close" aria-label="Tutup" :disabled="busy" @click="onCancel" />
        </div>
        <div class="modal-body">
          <p class="text-muted small mb-3">
            Baris harga akan disalin ke draft baru. Draft asal ({{ sourceCode || '—' }}) tidak berubah.
          </p>
          <label class="form-label" for="pricing-duplicate-target-channel">Kanal Tujuan</label>
          <CustomSelect2
            id="pricing-duplicate-target-channel"
            v-model="targetChannel"
            :options="channelOptions"
            :get-option-label="(o) => o.label"
            :reduce="(o) => o.value"
            :get-option-key="(o) => o.value"
            :clearable="false"
            :disabled="busy"
            placeholder="Pilih kanal tujuan"
          />
          <div v-if="error" class="alert alert-danger small mt-3 mb-0 text-break">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" :disabled="busy" @click="onCancel">
            Batal
          </button>
          <button type="button" class="btn btn-primary" :disabled="busy" @click="onConfirm">
            <span v-if="busy" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ busy ? 'Menduplikasi…' : 'Duplikat' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { PRICING_CHANNEL_OPTIONS, type PricingChannel } from '~/utils/pricingChannel'

const props = withDefaults(
  defineProps<{
    show: boolean
    sourceCode?: string | null
    sourceChannel?: PricingChannel | null
    busy?: boolean
    error?: string
  }>(),
  { sourceCode: '', sourceChannel: null, busy: false, error: '' }
)

const emit = defineEmits<{
  cancel: []
  confirm: [targetChannel: PricingChannel]
}>()

const channelOptions = PRICING_CHANNEL_OPTIONS
const targetChannel = ref<PricingChannel>(props.sourceChannel || 'POS')

watch(
  () => props.show,
  (visible) => {
    if (visible) targetChannel.value = props.sourceChannel || 'POS'
  }
)

function onCancel() {
  if (props.busy) return
  emit('cancel')
}

function onConfirm() {
  if (props.busy) return
  emit('confirm', targetChannel.value)
}
</script>
