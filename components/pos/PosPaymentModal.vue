<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    style="background: rgba(0, 0, 0, 0.35)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h6 mb-0">Pembayaran</h2>
          <button type="button" class="btn-close" aria-label="Tutup" :disabled="busy" @click="$emit('cancel')" />
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-between mb-3">
            <span class="text-muted">Total tagihan</span>
            <span class="fs-5 fw-bold text-primary">{{ formatPosMoney(total) }}</span>
          </div>

          <label class="form-label" for="pos-pay-method">Metode</label>
          <select id="pos-pay-method" v-model="method" class="form-select mb-3" :disabled="busy">
            <option value="cash">Tunai</option>
            <option value="credit_card">Kartu (EDC)</option>
            <option value="payment_gateway">Payment Gateway</option>
            <option value="bank_transfer">Transfer bank</option>
          </select>

          <label class="form-label" for="pos-pay-bank">Rekening perusahaan</label>
          <BankAccountSelect
            id="pos-pay-bank"
            v-model="bankAccountId"
            :company-id="companyId"
            :disabled="!companyReady || busy"
          />

          <template v-if="method === 'cash'">
            <label class="form-label mt-3" for="pos-tendered">Nominal diterima</label>
            <input
              id="pos-tendered"
              v-model.number="tenderedAmount"
              type="number"
              min="0"
              step="100"
              class="form-control"
              :disabled="busy"
            />
            <p class="small mt-2 mb-0" :class="change < 0 ? 'text-danger' : 'text-muted'">
              Kembalian: {{ formatPosMoney(Math.max(0, change)) }}
              <span v-if="change < 0" class="d-block">Nominal kurang — pembayaran penuh wajib.</span>
            </p>
          </template>

          <template v-else-if="method === 'credit_card'">
            <div class="row g-2 mt-1">
              <div class="col-6">
                <label class="form-label" for="pos-auth">Auth / approval code</label>
                <input id="pos-auth" v-model="authCode" class="form-control" :disabled="busy" autocomplete="off" />
              </div>
              <div class="col-6">
                <label class="form-label" for="pos-term">Ref terminal</label>
                <input id="pos-term" v-model="terminalRef" class="form-control" :disabled="busy" autocomplete="off" />
              </div>
              <div class="col-6">
                <label class="form-label" for="pos-last4">4 digit terakhir</label>
                <input
                  id="pos-last4"
                  v-model="last4"
                  class="form-control"
                  maxlength="4"
                  inputmode="numeric"
                  :disabled="busy"
                  autocomplete="off"
                />
              </div>
              <div class="col-6">
                <label class="form-label" for="pos-brand">Brand (opsional)</label>
                <input id="pos-brand" v-model="brand" class="form-control" :disabled="busy" autocomplete="off" />
              </div>
            </div>
            <div class="form-check mt-3">
              <input id="pos-card-ok" v-model="cardApproved" class="form-check-input" type="checkbox" :disabled="busy" />
              <label class="form-check-label" for="pos-card-ok">
                EDC menampilkan approved (bukan sekadar tekan bayar)
              </label>
            </div>
            <p class="small text-muted mt-2 mb-0">Jangan masukkan nomor kartu penuh atau CVV.</p>
          </template>

          <template v-else-if="method === 'payment_gateway'">
            <p class="small text-muted mt-3 mb-0">
              Charge dibuat di server. Status sukses hanya dari webhook/poll provider (sandbox: mock).
            </p>
          </template>

          <p v-if="error" class="small text-danger mt-3 mb-0 text-break">{{ error }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" :disabled="busy" @click="$emit('cancel')">
            Batal
          </button>
          <button type="button" class="btn btn-success" :disabled="!canSubmit || busy" @click="submit">
            {{ busy ? 'Memproses…' : 'Bayar & selesaikan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BankAccountSelect from '~/components/reference/BankAccountSelect.vue'
import { formatPosMoney } from '~/utils/posCart'

const props = defineProps<{
  total: number
  companyId: number | null
  companyReady: boolean
  busy: boolean
  error: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [payload: Record<string, unknown>]
}>()

const method = ref<'cash' | 'credit_card' | 'payment_gateway' | 'bank_transfer'>('cash')
const bankAccountId = ref<string | number | null>(null)
const tenderedAmount = ref(0)
const authCode = ref('')
const terminalRef = ref('')
const last4 = ref('')
const brand = ref('')
const cardApproved = ref(false)

watch(
  () => props.total,
  (v) => {
    tenderedAmount.value = Number(v) || 0
  },
  { immediate: true }
)

const change = computed(() => Number(tenderedAmount.value || 0) - Number(props.total || 0))

const canSubmit = computed(() => {
  if (!bankAccountId.value) return false
  if (method.value === 'cash') return change.value >= -0.001
  if (method.value === 'credit_card') {
    return cardApproved.value && !!(authCode.value || terminalRef.value)
  }
  return true
})

function submit() {
  if (!canSubmit.value) return
  const payment: Record<string, unknown> = {
    method: method.value,
    bankAccountId: String(bankAccountId.value),
  }
  if (method.value === 'cash') {
    payment.tenderedAmount = Number(tenderedAmount.value)
  }
  if (method.value === 'credit_card') {
    payment.card = {
      approved: cardApproved.value,
      authCode: authCode.value || null,
      terminalRef: terminalRef.value || null,
      last4: last4.value || null,
      brand: brand.value || null,
      provider: 'edc_manual',
    }
  }
  emit('confirm', payment)
}
</script>
