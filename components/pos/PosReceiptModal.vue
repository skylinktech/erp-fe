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
          <h2 class="modal-title h6 mb-0">Struk {{ receipt.saleNumber }}</h2>
          <button type="button" class="btn-close" aria-label="Tutup" @click="$emit('close')" />
        </div>
        <div class="modal-body">
          <div ref="printArea" class="sf-pos-receipt small">
            <div class="fw-semibold mb-1">{{ companyLabel || 'SkyFlow POS' }}</div>
            <div class="text-muted mb-2">{{ receipt.saleNumber }} · {{ receipt.status }}</div>
            <div class="mb-2">
              {{ receipt.customerMode === 'WALK_IN' ? 'Walk-in' : 'Pelanggan' }}
              <span v-if="receipt.walkInName"> · {{ receipt.walkInName }}</span>
              <span v-else-if="receipt.customer?.name"> · {{ receipt.customer.name }}</span>
            </div>
            <ul class="list-unstyled border-top border-bottom py-2 mb-2">
              <li v-for="item in receipt.items || []" :key="item.id" class="d-flex justify-content-between gap-2 mb-1">
                <span class="text-break">
                  {{ item.productNameSnapshot || item.productName }}
                  <span class="text-muted">
                    × {{ item.quantity }} {{ item.unitNameSnapshot || item.unitName }}
                  </span>
                </span>
                <span>{{ formatPosMoney(Number(item.lineTotal ?? item.quantity * item.officialUnitPrice)) }}</span>
              </li>
            </ul>
            <div class="d-flex justify-content-between fw-semibold">
              <span>Total</span>
              <span>{{ formatPosMoney(Number(receipt.grandTotal || 0)) }}</span>
            </div>
            <div v-if="paymentMeta" class="mt-2 text-muted">
              <div v-if="paymentMeta.method">Metode: {{ paymentMeta.method }}</div>
              <div v-if="paymentMeta.tenderedAmount != null">
                Diterima: {{ formatPosMoney(Number(paymentMeta.tenderedAmount)) }}
              </div>
              <div v-if="paymentMeta.changeAmount != null">
                Kembalian: {{ formatPosMoney(Number(paymentMeta.changeAmount)) }}
              </div>
              <div v-if="paymentMeta.status === 'succeeded' && paymentMeta.settlementComplete !== false" class="text-success">
                Status: Lunas (settlement tercatat)
              </div>
              <div v-else-if="paymentMeta.settlementComplete === false" class="text-warning">
                Status: Provider sukses — settlement lokal belum selesai
              </div>
              <div v-if="paymentMeta.journalPosted === false" class="text-warning">
                Jurnal kas masih pending — penerimaan sudah tercatat.
              </div>
            </div>
            <p v-if="receipt.paymentState === 'settled_journal_pending'" class="text-warning mt-2 mb-0">
              Settled tanpa journal posted — bukan struk gagal; jurnal menyusul via outbox.
            </p>
            <p v-if="receipt.reprinted" class="text-muted mt-2 mb-0">Cetak ulang — bukan transaksi baru.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">Tutup</button>
          <button type="button" class="btn btn-primary" @click="printReceipt">Cetak</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatPosMoney } from '~/utils/posCart'

defineProps<{
  receipt: Record<string, any>
  companyLabel: string
  paymentMeta?: Record<string, any> | null
}>()

defineEmits<{ close: [] }>()

const printArea = ref<HTMLElement | null>(null)

function printReceipt() {
  const html = printArea.value?.innerHTML || ''
  const w = window.open('', '_blank', 'noopener,noreferrer,width=420,height=640')
  if (!w) return
  w.document.write(
    `<html><head><title>Struk</title><style>body{font-family:ui-monospace,monospace;padding:12px;font-size:12px} .d-flex{display:flex;justify-content:space-between;gap:8px}</style></head><body>${html}</body></html>`
  )
  w.document.close()
  w.focus()
  w.print()
}
</script>
