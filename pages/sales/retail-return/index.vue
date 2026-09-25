<template>
  <div class="container-fluid py-3">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h4 class="mb-0">Retail Return</h4>
    </div>
    <div v-if="loading" class="text-muted">Memuat retur...</div>
    <div v-if="error" class="alert alert-danger text-break">{{ error }}</div>
    <div v-if="notice" class="alert alert-success text-break">{{ notice }}</div>
    <form v-if="actions.canCreate" class="card card-body mb-3" @submit.prevent="createReturn">
      <div class="row g-2">
        <div class="col-12 col-md-4">
          <label class="form-label" for="return-sale">Retail Sale</label>
          <input id="return-sale" v-model="form.retailSaleId" class="form-control" required />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label" for="return-line">Baris</label>
          <input id="return-line" v-model.number="form.retailSaleItemId" type="number" class="form-control" required />
        </div>
        <div class="col-6 col-md-2">
          <label class="form-label" for="return-qty">Qty</label>
          <input id="return-qty" v-model.number="form.quantity" type="number" min="0.0001" step="0.0001" class="form-control" required />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label" for="return-reason">Alasan</label>
          <input id="return-reason" v-model="form.reason" class="form-control" required />
        </div>
        <div class="col-12">
          <button class="btn btn-primary" type="submit" :disabled="saving">Buat permintaan</button>
        </div>
      </div>
    </form>
    <div v-if="!loading && !rows.length" class="text-muted">Belum ada retur.</div>
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead>
          <tr>
            <th>Nomor</th>
            <th>Penjualan</th>
            <th>Mode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" role="button" @click="selected = row">
            <td class="text-break">{{ row.returnNumber }}</td>
            <td class="text-break">{{ row.saleNumber }}</td>
            <td>{{ row.customerMode === 'WALK_IN' ? 'Walk-in' : 'Terdaftar' }}</td>
            <td>{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selected" class="card card-body mt-3">
      <h5 class="h6 text-break">{{ selected.returnNumber }} · {{ selected.status }}</h5>
      <p class="small text-muted mb-2">Penjualan {{ selected.saleNumber }} tetap {{ selected.saleStatus }}.</p>
      <div class="row g-2 mb-3">
        <div class="col-12 col-md-6">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Barang</div>
            <div>{{ selected.status }}</div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Kompensasi</div>
            <div>{{ selected.finance?.compensationStatus || 'Belum disetujui' }}</div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Nota kredit</div>
            <div class="text-break">{{ selected.finance?.invoiceNo || 'Invoice belum tertaut' }}</div>
            <div>{{ selected.finance?.creditStatus || 'Belum ada' }} · {{ selected.finance?.creditAmount || 0 }}</div>
            <div class="small">Sisa piutang {{ selected.finance?.invoiceRemaining ?? '—' }} · status invoice {{ selected.finance?.invoiceStatus || '—' }}</div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="border rounded p-2 h-100">
            <div class="small text-muted">Refund</div>
            <div>{{ selected.finance?.resolution || 'NONE' }}</div>
            <div class="small text-break">Kas dapat dikembalikan {{ selected.finance?.refundableCash || 0 }}</div>
            <div v-if="selected.finance?.refundMethod === 'bank_transfer'" class="small">Transfer bank belum terverifikasi dan tidak ditandai selesai.</div>
          </div>
        </div>
      </div>
      <div class="row g-2">
        <div v-for="item in selected.items || []" :key="item.id" class="col-12 col-md-6">
          <div class="border rounded p-2 h-100">
            <div>Diminta {{ item.requestedQuantity }}</div>
            <div class="small text-muted">Diterima {{ item.receivedQuantity ?? '—' }} · {{ item.condition || 'belum dinilai' }}</div>
            <div class="small text-break">Harga pokok asal {{ item.originalUnitCost }}</div>
            <div v-if="item.posting" class="small text-break">Gerakan {{ item.posting.stockMovementId || 'tidak masuk stok jual' }}</div>
          </div>
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-3">
        <button v-if="actions.canApprove" class="btn btn-success" type="button" :disabled="saving" @click="act('approve')">Setujui</button>
        <button v-if="actions.canReceive" class="btn btn-primary" type="button" :disabled="saving" @click="receive">Terima fisik</button>
        <button v-if="actions.canPost" class="btn btn-primary" type="button" :disabled="saving" @click="act('post')">Posting stok</button>
        <button v-if="actions.canCompensate" class="btn btn-success" type="button" :disabled="saving" @click="compensate">Setujui kompensasi</button>
        <button v-if="actions.canCredit" class="btn btn-primary" type="button" :disabled="saving" @click="financeAct('credit')">Buat nota kredit</button>
        <button v-if="actions.canRequestRefund" class="btn btn-primary" type="button" :disabled="saving" @click="requestRefund">Ajukan refund</button>
        <button v-if="actions.canApproveRefund" class="btn btn-success" type="button" :disabled="saving" @click="financeAct('refundApprove')">Setujui refund</button>
        <button v-if="actions.canConfirmCashRefund" class="btn btn-primary" type="button" :disabled="saving" @click="financeAct('refundConfirm')">Konfirmasi refund tunai</button>
      </div>
      <div v-if="actions.canRequestRefund" class="row g-2 mt-2">
        <div class="col-12 col-md-4">
          <label class="form-label" for="refund-method">Metode refund</label>
          <select id="refund-method" v-model="refundMethod" class="form-select">
            <option value="cash">Tunai</option>
            <option value="bank_transfer">Transfer bank</option>
          </select>
        </div>
        <div class="col-12 col-md-8">
          <label class="form-label" for="refund-bank">Rekening perusahaan</label>
          <input id="refund-bank" v-model="bankAccountId" class="form-control" />
        </div>
      </div>
      <div v-if="actions.canReceive" class="mt-2">
        <label class="form-label" for="return-condition">Kondisi</label>
        <select id="return-condition" v-model="condition" class="form-select">
          <option value="SELLABLE">Layak jual</option>
          <option value="DAMAGED">Rusak</option>
          <option value="EXPIRED">Kedaluwarsa</option>
          <option value="QUARANTINE">Karantina</option>
          <option value="OPENED_OR_UNSEALED">Terbuka</option>
          <option value="OTHER_NON_SELLABLE">Tidak layak jual</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { readAccessToken } from '~/utils/authCookie'
import { retailReturnActions } from '~/utils/retailReturn'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { userHasPermission, userHasRole } = usePermissions()
const privileged = computed(() => userHasRole('admin') || userHasRole('superadmin'))
const actions = computed(() => retailReturnActions({
  status: selected.value?.status,
  canCreate: privileged.value || userHasPermission('create_retail_return'),
  canApprove: privileged.value || userHasPermission('approve_retail_return'),
  canReceive: privileged.value || userHasPermission('receive_retail_return'),
  canPost: privileged.value || userHasPermission('post_retail_return'),
  canCompensate: privileged.value || userHasPermission('approve_retail_compensation'),
  canCredit: privileged.value || userHasPermission('create_retail_credit_note'),
  canRequestRefund: privileged.value || userHasPermission('request_retail_refund'),
  canApproveRefund: privileged.value || userHasPermission('approve_retail_refund'),
  canConfirmRefund: privileged.value || userHasPermission('confirm_retail_refund'),
  compensationStatus: selected.value?.finance?.compensationStatus,
  creditStatus: selected.value?.finance?.creditStatus,
  refundStatus: selected.value?.finance?.refundStatus,
  refundMethod: selected.value?.finance?.refundMethod,
  refundableCash: selected.value?.finance?.refundableCash,
}))
const rows = ref<any[]>([])
const selected = ref<any>(null)
const error = ref('')
const notice = ref('')
const loading = ref(false)
const saving = ref(false)
const condition = ref('SELLABLE')
const refundMethod = ref('cash')
const bankAccountId = ref('')
const form = ref({ retailSaleId: '', retailSaleItemId: null as number | null, quantity: 1, reason: '' })

function headers() {
  const token = readAccessToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

async function load() {
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailReturns(), { headers: headers() })
  const payload = await res.json().catch(() => ({}))
  loading.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Retur tidak dapat dimuat.'
    return
  }
  rows.value = payload.data || []
}

async function createReturn() {
  saving.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailReturns(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      retailSaleId: form.value.retailSaleId,
      expectedRevision: 1,
      idempotencyKey: crypto.randomUUID(),
      reason: form.value.reason,
      lines: [{ retailSaleItemId: form.value.retailSaleItemId, quantity: form.value.quantity }],
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Permintaan retur ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = 'Permintaan retur dibuat. Stok belum berubah.'
  await load()
}

async function act(name: 'approve' | 'post') {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  const url = name === 'approve' ? $api.retailReturnApprove(selected.value.id) : $api.retailReturnPost(selected.value.id)
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ expectedRevision: selected.value.revision, idempotencyKey: crypto.randomUUID() }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Aksi retur ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = payload.message
  await load()
}

async function compensate() {
  if (!selected.value) return
  await postFinance($apiOf().retailReturnCompensate(selected.value.id), {
    expectedRevision: selected.value.revision,
    idempotencyKey: crypto.randomUUID(),
    reasonCode: 'CUSTOMER_RETURN',
    lines: (selected.value.items || []).map((item: any) => ({
      retailReturnItemId: item.id,
      quantity: item.receivedQuantity,
    })),
  }, 'Kompensasi disetujui. Uang belum keluar.')
}

function $apiOf() {
  const { $api } = useNuxtApp()
  return $api
}

async function requestRefund() {
  if (!selected.value) return
  await postFinance($apiOf().retailReturnRefund(selected.value.id), {
    expectedRevision: selected.value.revision,
    idempotencyKey: crypto.randomUUID(),
    bankAccountId: bankAccountId.value,
    method: refundMethod.value,
  }, refundMethod.value === 'cash' ? 'Refund tunai diminta.' : 'Transfer bank dicatat sebagai permintaan. Belum selesai.')
}

async function financeAct(name: 'credit' | 'refundApprove' | 'refundConfirm') {
  if (!selected.value) return
  const api = $apiOf()
  const url = name === 'credit'
    ? api.retailReturnCredit(selected.value.id)
    : name === 'refundApprove'
      ? api.retailReturnRefundApprove(selected.value.id)
      : api.retailReturnRefundConfirm(selected.value.id)
  await postFinance(url, {
    expectedRevision: selected.value.revision,
    idempotencyKey: crypto.randomUUID(),
  }, 'Status keuangan diperbarui.')
}

async function postFinance(url: string, body: Record<string, unknown>, success: string) {
  saving.value = true
  error.value = ''
  const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Aksi keuangan ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = success
  await load()
}

async function receive() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailReturnReceive(selected.value.id), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: selected.value.revision,
      idempotencyKey: crypto.randomUUID(),
      lines: (selected.value.items || []).map((item: any) => ({
        retailReturnItemId: item.id,
        quantity: item.authorizedQuantity,
        condition: condition.value,
      })),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Penerimaan ditolak.'
    return
  }
  selected.value = payload.data
  notice.value = 'Barang diterima. Stok belum berubah sampai posting.'
  await load()
}

onMounted(load)
</script>
