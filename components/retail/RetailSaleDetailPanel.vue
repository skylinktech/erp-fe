<template>
  <div :class="embedded ? 'card retail-sale-detail-embedded m-2' : 'card'">
    <div
      v-if="!embedded"
      class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2"
    >
      <div class="min-w-0">
        <h5 class="mb-1 text-break">{{ sale.saleNumber }}</h5>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <span :class="statusBadge.class">{{ statusBadge.text }}</span>
          <span :class="financeBadge.class">{{ financeBadge.text }}</span>
          <span class="small text-muted text-break">
            {{ customerModeLabel }} · {{ customerLabel }}
          </span>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('close')">
        <i class="ri-close-line me-1"></i>
        Tutup
      </button>
    </div>

    <div class="card-body">
      <div v-if="embedded" class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h6 class="mb-0 text-break">{{ sale.saleNumber }}</h6>
        <span :class="statusBadge.class">{{ statusBadge.text }}</span>
        <span :class="financeBadge.class">{{ financeBadge.text }}</span>
        <span class="small text-muted text-break">{{ customerModeLabel }} · {{ customerLabel }}</span>
      </div>

      <div v-if="error" class="alert alert-danger text-break">{{ error }}</div>
      <div v-if="notice" class="alert alert-success text-break">{{ notice }}</div>
      <div
        v-if="actions.canInvoice && isMarketplace"
        class="alert alert-info text-break"
      >
        Kanal marketplace: Sales Invoice akan dibuat tanpa email pelanggan (email TikTok bersifat relay).
      </div>
      <div
        v-if="!actions.canInvoice && invoiceBlockers.length && sale.status === 'FULFILLED' && financeState === 'NOT_INVOICED'"
        class="alert alert-warning text-break"
      >
        <div class="fw-semibold mb-1">Invoice belum tersedia</div>
        <ul class="mb-0 ps-3">
          <li v-for="(msg, idx) in invoiceBlockers" :key="idx">{{ msg }}</li>
        </ul>
      </div>
      <div v-if="existingInvoice && !actions.canInvoice" class="alert alert-secondary text-break">
        Invoice sudah ada:
        <strong>{{ existingInvoice.noInvoice || existingInvoice.id }}</strong>
        · {{ humanizeLabel(existingInvoice.documentStatus, { fallback: '—' }) }}
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-md-4">
          <div class="border rounded p-3 h-100">
            <div class="small text-muted mb-1">Gudang</div>
            <div class="text-break">{{ warehouseLabel }}</div>
            <div v-if="sale.fulfilledAt" class="small text-muted mt-1">
              Dipenuhi {{ formatRetailDateTime(sale.fulfilledAt) }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="border rounded p-3 h-100">
            <div class="small text-muted mb-1">Total</div>
            <div class="fw-semibold">{{ formatRetailMoney(totals.grandTotal, sale.currency) }}</div>
            <div class="small text-muted">Subtotal {{ formatRetailMoney(totals.subtotal, sale.currency) }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="border rounded p-3 h-100">
            <div class="small text-muted mb-1">Keuangan</div>
            <div>{{ financeBadge.text }}</div>
            <div v-if="sale.finance?.invoice" class="small text-break mt-1">
              {{ sale.finance.invoice.noInvoice }} · {{ humanizeLabel(sale.finance.invoice.documentStatus, { fallback: '—' }) }}
            </div>
            <div v-if="sale.finance?.invoice" class="small">
              Sisa kas {{ formatRetailMoney(sale.finance.invoice.expectedCashAmount, sale.currency) }}
            </div>
            <div v-if="sale.finance?.blockingReason" class="small text-warning mt-1">
              {{ sale.finance.blockingReason }}
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive mb-3">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Produk</th>
              <th>SKU</th>
              <th class="text-end">Qty</th>
              <th class="text-end">Harga</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sale.items || []" :key="item.id">
              <td class="text-break">
                {{ item.productNameSnapshot }}
                <div v-if="!item.confirmable" class="small text-warning">
                  Stok tersedia {{ item.availableQty }}. Draft belum dapat dikonfirmasi.
                </div>
              </td>
              <td class="text-nowrap">{{ item.skuSnapshot || '—' }}</td>
              <td class="text-end text-nowrap">{{ item.quantity }} {{ item.unitNameSnapshot }}</td>
              <td class="text-end text-nowrap">{{ formatRetailMoney(item.officialUnitPrice, item.currency || sale.currency) }}</td>
              <td class="text-end text-nowrap">{{ formatRetailMoney(item.lineTotal, item.currency || sale.currency) }}</td>
            </tr>
            <tr v-if="!(sale.items || []).length">
              <td colspan="5" class="text-muted">Tidak ada baris item.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="sale.reservations?.length" class="small mb-3 text-break">
        Reservasi:
        <span v-for="row in sale.reservations" :key="row.id" class="me-2">
          {{ humanizeLabel(row.status, { fallback: '—' }) }} {{ row.quantity }}
        </span>
      </div>

      <div v-if="priceConflict" class="alert alert-warning">
        <div>{{ conflictText }}</div>
        <button
          class="btn btn-warning btn-sm mt-2"
          type="button"
          :disabled="saving"
          @click="$emit('refresh-prices', sale.id)"
        >
          Perbarui harga resmi
        </button>
      </div>

      <div class="d-flex flex-wrap gap-2 mb-3">
        <button
          v-if="actions.canConfirm"
          class="btn btn-success"
          type="button"
          :disabled="saving"
          @click="$emit('confirm', sale.id)"
        >
          Konfirmasi
        </button>
        <button
          v-if="actions.canFulfill"
          class="btn btn-success"
          type="button"
          :disabled="saving"
          @click="$emit('fulfill', sale.id)"
        >
          Penuhi
        </button>
        <button
          v-if="actions.canInvoice"
          class="btn btn-primary"
          type="button"
          :disabled="saving"
          :aria-busy="saving ? 'true' : 'false'"
          @click="$emit('invoice', sale.id)"
        >
          <span
            v-if="saving"
            class="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          />
          {{ saving ? 'Membuat invoice…' : 'Buat invoice' }}
        </button>
        <button
          v-if="actions.canResumeSubmit"
          class="btn btn-outline-primary"
          type="button"
          :disabled="saving"
          @click="$emit('resume-invoice', sale.id)"
        >
          Kirim ulang persetujuan
        </button>
        <button
          v-if="actions.canPay"
          class="btn btn-primary"
          type="button"
          :disabled="saving || !localPayBankAccountId"
          @click="emitPay"
        >
          Terima pelunasan
        </button>
        <button
          v-if="actions.canCancel"
          class="btn btn-outline-danger"
          type="button"
          :disabled="saving"
          @click="$emit('cancel', sale.id)"
        >
          Batalkan
        </button>
      </div>

      <div v-if="sale.issues?.length" class="small mb-3 text-break">
        Pengeluaran:
        <span v-for="issue in sale.issues" :key="issue.id" class="me-2">
          {{ issue.stockMovementId }} nilai {{ issue.movementValue }}
        </span>
      </div>

      <div v-if="actions.canPay" class="row g-3 mb-3">
        <div class="col-12 col-md-4">
          <label class="form-label" :for="`retail-bank-${sale.id}`">Rekening perusahaan</label>
          <BankAccountSelect
            :id="`retail-bank-${sale.id}`"
            v-model="localPayBankAccountId"
            :company-id="companyId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label" :for="`retail-method-${sale.id}`">Metode</label>
          <select :id="`retail-method-${sale.id}`" v-model="localPayMethod" class="form-select">
            <option value="bank_transfer">Transfer bank</option>
            <option value="cash">Kas</option>
          </select>
        </div>
      </div>

      <form v-if="actions.canEdit" class="row g-3" @submit.prevent="emitSaveQuantity">
        <div class="col-8 col-md-4">
          <label class="form-label" :for="`retail-edit-qty-${sale.id}`">Quantity</label>
          <input
            :id="`retail-edit-qty-${sale.id}`"
            v-model.number="localEditQty"
            type="number"
            min="0.0001"
            step="0.0001"
            class="form-control"
            required
          >
        </div>
        <div class="col-4 col-md-2 d-flex align-items-end">
          <button class="btn btn-primary w-100" type="submit" :disabled="saving">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { humanizeLabel } from '~/utils/humanizeLabel'

import { computed, ref, watch } from 'vue'
import BankAccountSelect from '~/components/reference/BankAccountSelect.vue'
import { formatRetailDateTime, formatRetailMoney, retailConflictMessage, retailCustomerModeLabel, retailFinanceStateBadge, isMarketplaceRetailSale, retailSaleStatusBadge, retailTotalsFromServer } from '~/utils/retailSaleDraft'

const props = withDefaults(
  defineProps<{
    sale: any
    actions: Record<string, boolean>
    saving?: boolean
    error?: string
    notice?: string
    priceConflict?: any
    companyId: number | string | null
    activeCompanyReady: boolean
    embedded?: boolean
  }>(),
  {
    saving: false,
    error: '',
    notice: '',
    priceConflict: null,
    embedded: false}
)

const emit = defineEmits<{
  close: []
  confirm: [saleId: string]
  fulfill: [saleId: string]
  invoice: [saleId: string]
  'resume-invoice': [saleId: string]
  pay: [payload: { saleId: string; bankAccountId: number | string | null; method: string }]
  cancel: [saleId: string]
  'refresh-prices': [saleId: string]
  'save-quantity': [payload: { saleId: string; quantity: number }]
}>()

const localEditQty = ref(1)
const localPayBankAccountId = ref<number | string | null>(null)
const localPayMethod = ref('bank_transfer')

watch(
  () => props.sale,
  (sale) => {
    localEditQty.value = Number(sale?.items?.[0]?.quantity || 1)
  },
  { immediate: true }
)

const statusBadge = computed(() => retailSaleStatusBadge(props.sale?.status))
const financeBadge = computed(() => retailFinanceStateBadge(props.sale?.finance?.state))
const totals = computed(() => retailTotalsFromServer(props.sale))
const conflictText = computed(() => retailConflictMessage(props.priceConflict))
const isMarketplace = computed(() => isMarketplaceRetailSale(props.sale))
const customerModeLabel = computed(() => retailCustomerModeLabel(props.sale?.customerMode))
const invoiceBlockers = computed(() => {
  const fromActions = (props.actions as any)?.invoiceBlockers
  if (Array.isArray(fromActions) && fromActions.length) return fromActions
  return props.sale?.invoiceEligibility?.messages || []
})
const financeState = computed(() => props.sale?.finance?.state || 'NOT_INVOICED')
const existingInvoice = computed(() => props.sale?.finance?.invoice || null)
const customerLabel = computed(() => {
  if (props.sale?.customerMode === 'WALK_IN') {
    return props.sale?.walkInName || props.sale?.customerLabel || props.sale?.saleNumber
  }
  return props.sale?.customer?.name || props.sale?.customerLabel || '—'
})
const warehouseLabel = computed(() => {
  const wh = props.sale?.warehouse
  if (wh?.name) return wh.code ? `${wh.name} (${wh.code})` : wh.name
  return props.sale?.warehouseId != null ? `Gudang #${props.sale.warehouseId}` : '—'
})

function emitPay() {
  emit('pay', {
    saleId: props.sale.id,
    bankAccountId: localPayBankAccountId.value,
    method: localPayMethod.value})
}

function emitSaveQuantity() {
  emit('save-quantity', {
    saleId: props.sale.id,
    quantity: localEditQty.value})
}
</script>
