<template>
  <div class="container-fluid py-3">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <button v-if="actions.canCreate" class="btn btn-primary" type="button" @click="creating = !creating">Draft baru</button>
    </div>
    <div v-if="loading" class="text-muted">Memuat draft...</div>
    <div v-if="error" class="alert alert-danger text-break">{{ error }}</div>
    <div v-if="notice" class="alert alert-success">{{ notice }}</div>
    <form v-if="creating && actions.canCreate" class="card card-body mb-3" @submit.prevent="createDraft">
      <div class="row g-2">
        <div class="col-12">
          <ActiveCompanyField input-id="retail-company" />
          <p class="small text-muted mb-0 mt-1">
            Direct Sale membuat journey Retail secara internal. Business Case tidak diisi pengguna.
          </p>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label" for="retail-warehouse">Gudang</label>
          <WarehouseSelect
            id="retail-warehouse"
            v-model="form.warehouseId"
            :company-id="companyId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label" for="retail-mode">Pelanggan</label>
          <select id="retail-mode" v-model="form.customerMode" class="form-select">
            <option value="WALK_IN">Walk-in</option>
            <option value="REGISTERED">Terdaftar</option>
          </select>
        </div>
        <div v-if="form.customerMode === 'REGISTERED'" class="col-12 col-md-4">
          <label class="form-label" for="retail-customer">Pelanggan</label>
          <CustomerSelect
            id="retail-customer"
            v-model="form.customerId"
            :company-id="companyId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div v-else class="col-12 col-md-4">
          <label class="form-label" for="retail-walkin">Nama walk-in</label>
          <input id="retail-walkin" v-model="form.walkInName" class="form-control" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label" for="retail-product">Produk</label>
          <ProductSelect
            id="retail-product"
            v-model="form.productId"
            :company-id="companyId"
            :warehouse-id="form.warehouseId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label" for="retail-unit">Satuan</label>
          <UnitSelect id="retail-unit" v-model="form.unitId" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label" for="retail-qty">Quantity</label>
          <input id="retail-qty" v-model.number="form.quantity" type="number" min="0.0001" step="0.0001" class="form-control" required />
        </div>
        <div class="col-12 col-md-3 d-flex align-items-end">
          <button class="btn btn-success w-100" type="submit" :disabled="saving || !activeCompanyReady">Simpan draft</button>
        </div>
      </div>
    </form>

    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead>
          <tr><th>Nomor</th><th>Status</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length && !loading"><td colspan="4" class="text-muted">Belum ada draft Retail Sale.</td></tr>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.saleNumber }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.grandTotal }}</td>
            <td><button class="btn btn-outline-secondary btn-sm" type="button" @click="openSale(row.id)">Lihat</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selected" class="card card-body mt-3">
      <h5 class="h6 text-break">{{ selected.saleNumber }} · {{ selected.status }}</h5>
      <p class="small text-muted mb-2">
        {{ selected.customerMode === 'WALK_IN' ? 'Walk-in' : 'Pelanggan terdaftar' }}
        <span v-if="selected.customerMode === 'WALK_IN'"> · {{ selected.walkInName || selected.saleNumber }}</span>
        <span v-else-if="selected.customer"> · {{ selected.customer.name }}</span>
      </p>
      <p class="small text-muted mb-2">Gudang {{ selected.warehouseId }}<span v-if="selected.fulfilledAt"> · dipenuhi {{ selected.fulfilledAt }}</span></p>
      <p class="mb-2">Total server {{ totals.grandTotal }} {{ selected.currency }}</p>
      <div v-for="item in selected.items || []" :key="item.id" class="border-top py-2">
        <div>{{ item.productNameSnapshot }} · {{ item.skuSnapshot }}</div>
        <div class="small text-muted">{{ item.quantity }} {{ item.unitNameSnapshot }} × {{ item.officialUnitPrice }}</div>
        <div v-if="!item.confirmable" class="small text-warning">Stok tersedia {{ item.availableQty }}. Draft ini belum dapat dikonfirmasi.</div>
      </div>
      <div v-if="selected.reservations?.length" class="small mb-2">
        Reservasi
        <span v-for="row in selected.reservations" :key="row.id">{{ row.status }} {{ row.quantity }}</span>
      </div>
      <div v-if="priceConflict" class="alert alert-warning">
        <div>{{ conflictText }}</div>
        <button class="btn btn-warning mt-2" type="button" :disabled="saving" @click="refreshPrices">Perbarui harga resmi</button>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-2">
        <button v-if="actions.canConfirm" class="btn btn-success" type="button" :disabled="saving" @click="confirmSale">Konfirmasi</button>
        <button v-if="actions.canFulfill" class="btn btn-success" type="button" :disabled="saving" @click="fulfillSale">Penuhi</button>
        <button v-if="actions.canInvoice" class="btn btn-primary" type="button" :disabled="saving" @click="invoiceSale">Buat invoice</button>
        <button v-if="actions.canResumeSubmit" class="btn btn-outline-primary" type="button" :disabled="saving" @click="resumeInvoice">Kirim ulang persetujuan</button>
        <button v-if="actions.canPay" class="btn btn-primary" type="button" :disabled="saving || !payBankAccountId" @click="paySale">Terima pelunasan</button>
        <button v-if="actions.canCancel" class="btn btn-outline-danger" type="button" :disabled="saving" @click="cancelSale">Batalkan</button>
      </div>
      <div v-if="selected.issues?.length" class="small mt-2 text-break">
        Pengeluaran
        <span v-for="issue in selected.issues" :key="issue.id">{{ issue.stockMovementId }} nilai {{ issue.movementValue }}</span>
      </div>
      <div class="row g-2 mt-2">
        <div class="col-12 col-md-4">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Fisik</div>
            <div>{{ selected.status }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Keuangan</div>
            <div>{{ selected.finance?.state || 'NOT_INVOICED' }}</div>
            <div v-if="selected.finance?.counterparty" class="small text-break">Walk-in {{ selected.finance.counterparty.displayName || selected.saleNumber }}</div>
            <div v-if="selected.finance?.invoice" class="small text-break">{{ selected.finance.invoice.noInvoice }} · {{ selected.finance.invoice.documentStatus }}</div>
            <div v-if="selected.finance?.invoice" class="small">Sisa kas {{ selected.finance.invoice.expectedCashAmount }}</div>
            <div v-if="selected.finance?.blockingReason" class="small text-warning">{{ selected.finance.blockingReason }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Penerimaan</div>
            <div v-if="selected.finance?.receipt" class="small text-break">{{ selected.finance.receipt.receiptNumber }} · {{ selected.finance.receipt.status }}</div>
            <div v-else class="small">Belum ada penerimaan</div>
          </div>
        </div>
      </div>
      <div v-if="actions.canPay" class="row g-2 mt-2">
        <div class="col-12 col-md-4">
          <label class="form-label" for="retail-bank">Rekening perusahaan</label>
          <BankAccountSelect
            id="retail-bank"
            v-model="payBankAccountId"
            :company-id="companyId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label" for="retail-method">Metode</label>
          <select id="retail-method" v-model="payMethod" class="form-select">
            <option value="bank_transfer">Transfer bank</option>
            <option value="cash">Kas</option>
          </select>
        </div>
      </div>
      <form v-if="actions.canEdit" class="row g-2 mt-2" @submit.prevent="saveQuantity">
        <div class="col-8 col-md-4">
          <label class="form-label" for="retail-edit-qty">Quantity</label>
          <input id="retail-edit-qty" v-model.number="editQty" type="number" min="0.0001" step="0.0001" class="form-control" required />
        </div>
        <div class="col-4 col-md-2 d-flex align-items-end">
          <button class="btn btn-primary w-100" type="submit" :disabled="saving">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { readAccessToken } from '~/utils/authCookie'
import { retailConflictMessage, retailDraftActions, retailTotalsFromServer } from '~/utils/retailSaleDraft'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import WarehouseSelect from '~/components/reference/WarehouseSelect.vue'
import CustomerSelect from '~/components/reference/CustomerSelect.vue'
import UnitSelect from '~/components/reference/UnitSelect.vue'
import BankAccountSelect from '~/components/reference/BankAccountSelect.vue'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { userHasPermission, userHasRole } = usePermissions()
const activeCompany = useActiveCompany()
const {
  ready: activeCompanyReady,
  requireCompanyId,
  missingMessage: activeCompanyMissing,
  ensureBootstrapped,
  companyId,
} = activeCompany
void ensureBootstrapped()
const privileged = computed(() => userHasRole('admin') || userHasRole('superadmin'))
const canCreate = computed(() => privileged.value || userHasPermission('create_retail_sale'))
const canConfirm = computed(() => privileged.value || userHasPermission('confirm_retail_sale'))
const canCancel = computed(() => privileged.value || userHasPermission('cancel_retail_sale'))
const canFulfill = computed(() => privileged.value || userHasPermission('fulfill_retail_sale'))
const canInvoice = computed(() => (privileged.value || userHasPermission('invoice_retail_sale')) && (privileged.value || userHasPermission('create_sales_invoice')))
const canPay = computed(() => (privileged.value || userHasPermission('pay_retail_sale')) && (privileged.value || userHasPermission('create_ar_receipt')))
const payBankAccountId = ref<number | string | null>(null)
const payMethod = ref('bank_transfer')
const actions = computed(() => retailDraftActions({
  status: selected.value?.status,
  canCreate: canCreate.value,
  canConfirm: canConfirm.value,
  canCancel: canCancel.value,
  canFulfill: canFulfill.value,
  canInvoice: canInvoice.value,
  canPay: canPay.value,
  financeState: selected.value?.finance?.state || 'NOT_INVOICED',
  invoiceDocumentStatus: selected.value?.finance?.invoice?.documentStatus || null,
}))
const totals = computed(() => retailTotalsFromServer(selected.value))
const conflictText = computed(() => retailConflictMessage(priceConflict.value))
const rows = ref<any[]>([])
const selected = ref<any>(null)
const error = ref('')
const notice = ref('')
const priceConflict = ref<any>(null)
const loading = ref(false)
const saving = ref(false)
const creating = ref(false)
const editQty = ref(1)
const form = ref({
  warehouseId: null as number | null,
  customerMode: 'WALK_IN',
  customerId: null as number | null,
  walkInName: '',
  productId: null as number | null,
  unitId: null as number | null,
  quantity: 1,
})

function headers() {
  const token = readAccessToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

async function load() {
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSales(), { headers: headers() })
  const payload = await res.json().catch(() => ({}))
  loading.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Draft Retail tidak dapat dimuat.'
    return
  }
  rows.value = payload.data || []
}

async function openSale(id: string) {
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSale(id), { headers: headers() })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Draft tidak ditemukan.'
    return
  }
  selected.value = payload.data
  priceConflict.value = null
  editQty.value = Number(payload.data?.items?.[0]?.quantity || 1)
}

async function confirmSale() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  priceConflict.value = null
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleConfirm(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (payload?.code === 'RETAIL_PRICE_CHANGED') {
    priceConflict.value = payload
    error.value = retailConflictMessage(payload)
    return
  }
  if (!res.ok) {
    error.value = payload?.message || 'Konfirmasi ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = 'Retail Sale terkonfirmasi. Stok dipesan, belum dikeluarkan.'
  await load()
}

async function fulfillSale() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleFulfill(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Pemenuhan ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = 'Retail Sale dipenuhi. Stok dikeluarkan dan COGS dicatat. Invoice belum dibuat.'
  await load()
}

async function invoiceSale() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleInvoice(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Invoice ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = payload.code === 'RETAIL_INVOICE_PENDING_APPROVAL'
    ? 'Invoice menunggu persetujuan Finance. Belum lunas.'
    : 'Invoice draft tersimpan. Persetujuan Finance belum siap, sale tidak lunas.'
  await load()
}

async function resumeInvoice() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleInvoiceSubmit(selected.value.id), {
    method: 'POST',
    headers: headers(),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Pengiriman ulang ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = payload.code === 'RETAIL_INVOICE_PENDING_APPROVAL'
    ? 'Invoice dikirim ulang ke persetujuan Finance.'
    : 'Invoice tetap draft. Approver Finance belum tersedia.'
  await load()
}

async function paySale() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSalePay(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      idempotencyKey: crypto.randomUUID(),
      bankAccountId: payBankAccountId.value,
      method: payMethod.value,
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Pembayaran ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = payload.code === 'RETAIL_PAID'
    ? 'Pelunasan tercatat dan jurnal kas posted.'
    : 'Penerimaan belum lunas. Jurnal kas belum posted.'
  await load()
}

async function cancelSale() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleCancel(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Pembatalan ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = 'Retail Sale dibatalkan.'
  await load()
}

async function refreshPrices() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleRefreshPrices(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ expectedRevision: selected.value.revision }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Harga resmi tidak dapat diperbarui.'
    return
  }
  selected.value = payload.data
  priceConflict.value = null
  notice.value = 'Harga resmi diperbarui. Konfirmasi belum dijalankan.'
}

async function createDraft() {
  saving.value = true
  error.value = ''
  notice.value = ''
  let perusahaanId: number
  try {
    perusahaanId = requireCompanyId()
  } catch (err: any) {
    saving.value = false
    error.value = err?.message || activeCompanyMissing.value || 'Active Company wajib.'
    return
  }
  if (!form.value.warehouseId || !form.value.productId || !form.value.unitId) {
    saving.value = false
    error.value = 'Lengkapi gudang, produk, dan satuan.'
    return
  }
  const { $api } = useNuxtApp()
  // DirectSaleCheckout creates the Retail journey internally — no Business Case UUID from user.
  const res = await fetch($api.directSaleCheckout(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      perusahaanId,
      idempotencyKey: crypto.randomUUID(),
      warehouseId: form.value.warehouseId,
      customerMode: form.value.customerMode,
      customerId: form.value.customerMode === 'REGISTERED' ? form.value.customerId : null,
      walkInName: form.value.customerMode === 'WALK_IN' ? form.value.walkInName : null,
      confirm: false,
      items: [{ productId: form.value.productId, unitId: form.value.unitId, quantity: form.value.quantity }],
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Draft ditolak.'
    return
  }
  creating.value = false
  selected.value = payload.data
  notice.value = 'Draft Direct Sale dibuat. Journey Retail diikat secara internal.'
  await load()
}

async function saveQuantity() {
  if (!selected.value?.items?.[0]) return
  saving.value = true
  error.value = ''
  const item = selected.value.items[0]
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSale(selected.value.id), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      warehouseId: selected.value.warehouseId,
      customerMode: selected.value.customerMode,
      customerId: selected.value.customerId,
      walkInName: selected.value.walkInName,
      walkInPhone: selected.value.walkInPhone,
      items: [{ productId: item.productId, unitId: item.unitId, quantity: editQty.value, expectedUnitPrice: item.officialUnitPrice }],
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Perubahan ditolak.'
    return
  }
  selected.value = payload.data
  await load()
}

onMounted(load)
</script>
