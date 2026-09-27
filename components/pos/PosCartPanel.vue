<template>
  <aside class="card sf-pos-cart-panel h-100 d-flex flex-column">
    <div class="card-body d-flex flex-column gap-3 p-3">
      <div class="d-flex justify-content-between align-items-center gap-2">
        <h2 class="h6 mb-0">Keranjang</h2>
        <button
          type="button"
          class="btn btn-link btn-sm text-danger p-0"
          :disabled="!cart.length || checkoutBusy"
          @click="$emit('clear')"
        >
          Kosongkan
        </button>
      </div>

      <div>
        <label class="form-label small mb-1">Pelanggan</label>
        <select
          :value="customerMode"
          class="form-select form-select-sm mb-2"
          :disabled="checkoutBusy"
          @change="$emit('update:customerMode', ($event.target as HTMLSelectElement).value as 'WALK_IN' | 'REGISTERED')"
        >
          <option value="WALK_IN">Walk-in</option>
          <option value="REGISTERED">Pelanggan Terdaftar</option>
        </select>
        <CustomerSelect
          v-if="customerMode === 'REGISTERED'"
          :model-value="customerId"
          :company-id="companyId"
          :disabled="!companyReady || checkoutBusy"
          @update:model-value="$emit('update:customerId', $event)"
        />
        <input
          v-else
          :value="walkInName"
          type="text"
          class="form-control form-control-sm"
          placeholder="Nama walk-in (opsional)"
          :disabled="checkoutBusy"
          @input="$emit('update:walkInName', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="sf-pos-cart-lines flex-grow-1">
        <div v-if="!cart.length" class="text-muted small text-center py-4">
          Keranjang belanja kosong.
        </div>
        <ul v-else class="list-unstyled mb-0">
          <li
            v-for="(item, index) in cart"
            :key="`${item.productId}-${item.unitId}-${index}`"
            class="border-bottom py-2"
          >
            <div class="d-flex justify-content-between gap-2">
              <div class="min-w-0">
                <div class="fw-semibold text-break">{{ item.productName }}</div>
                <div class="small text-muted text-break">
                  {{ item.sku || '—' }} · {{ item.unitName || 'UOM' }} ·
                  {{ formatPosMoney(item.officialUnitPrice) }}
                </div>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger flex-shrink-0"
                :disabled="checkoutBusy"
                aria-label="Hapus item"
                @click="$emit('remove', index)"
              >
                ×
              </button>
            </div>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <div class="input-group input-group-sm" style="max-width: 8.5rem">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :disabled="checkoutBusy || item.quantity <= 0.0001"
                  @click="$emit('update-qty', index, Math.max(0.0001, Number(item.quantity) - 1))"
                >
                  −
                </button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  class="form-control text-center"
                  :disabled="checkoutBusy"
                  @change="onQtyChange(index, ($event.target as HTMLInputElement).value)"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :disabled="checkoutBusy"
                  @click="$emit('update-qty', index, Number(item.quantity) + 1)"
                >
                  +
                </button>
              </div>
              <div class="small fw-semibold">{{ formatPosMoney(item.quantity * item.officialUnitPrice) }}</div>
            </div>
          </li>
        </ul>
      </div>

      <div class="border-top pt-3">
        <div class="d-flex justify-content-between small mb-1">
          <span class="text-muted">Subtotal (indikatif)</span>
          <span>{{ formatPosMoney(subtotal) }}</span>
        </div>
        <div class="d-flex justify-content-between align-items-baseline mb-2">
          <span class="fw-semibold">Total indikatif</span>
          <span class="fs-5 fw-bold text-primary">{{ formatPosMoney(subtotal) }}</span>
        </div>
        <p class="small text-muted mb-2">
          Harga final dihitung server saat checkout. Pembayaran dilakukan di Riwayat transaksi.
        </p>
        <button
          type="button"
          class="btn btn-success w-100"
          :disabled="!canCheckout || checkoutBusy"
          @click="$emit('checkout')"
        >
          {{ checkoutBusy ? 'Memproses…' : 'Checkout (buat + konfirmasi)' }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import CustomerSelect from '~/components/reference/CustomerSelect.vue'
import { formatPosMoney, type PosCartLine } from '~/utils/posCart'

defineProps<{
  cart: PosCartLine[]
  subtotal: number
  customerMode: 'WALK_IN' | 'REGISTERED'
  customerId: number | null
  walkInName: string
  companyId: number | null
  companyReady: boolean
  canCheckout: boolean
  checkoutBusy: boolean
}>()

const emit = defineEmits<{
  clear: []
  remove: [index: number]
  'update-qty': [index: number, quantity: number]
  checkout: []
  'update:customerMode': [value: 'WALK_IN' | 'REGISTERED']
  'update:customerId': [value: number | null]
  'update:walkInName': [value: string]
}>()

function onQtyChange(index: number, raw: string) {
  const qty = Number(raw)
  emit('update-qty', index, qty)
}
</script>

<style scoped>
.sf-pos-cart-lines {
  min-height: 10rem;
  max-height: min(42vh, 28rem);
  overflow-y: auto;
}
.sf-pos-cart-panel {
  position: sticky;
  top: 0.75rem;
}
@media (max-width: 991.98px) {
  .sf-pos-cart-panel {
    position: static;
  }
  .sf-pos-cart-lines {
    max-height: none;
  }
}
</style>
