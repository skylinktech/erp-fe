<template>
  <div class="card mb-4">
    <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
      <div>
        <h5 class="card-title mb-0">Settlement / Pertanggungjawaban</h5>
        <small class="text-muted">
          Status: {{ settlementStatusLabel }}
        </small>
      </div>
      <button
        v-if="canCreate"
        type="button"
        class="btn btn-sm btn-primary"
        :disabled="saving"
        @click="showForm = !showForm"
      >
        <i class="ri-add-line me-1"></i>
        {{ showForm ? 'Tutup Form' : 'Buat Settlement' }}
      </button>
    </div>
    <hr class="mx-5 my-0" style="border-width: 2px;">
    <div class="card-body px-5 pt-4 pb-5">
      <div v-if="showForm" class="border rounded p-3 mb-4">
        <div class="row g-3 mb-3">
          <div class="col-md-12">
            <label class="form-label">Catatan</label>
            <textarea v-model="form.notes" class="form-control" rows="2" />
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>Item Pengeluaran</strong>
          <button type="button" class="btn btn-sm btn-outline-primary" @click="addItem">
            <i class="ri-add-line"></i> Tambah
          </button>
        </div>
        <div v-for="(item, idx) in form.items" :key="idx" class="row g-2 mb-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small">Kategori</label>
            <input v-model="item.category" class="form-control form-control-sm" placeholder="Transport / Hotel" />
          </div>
          <div class="col-md-4">
            <label class="form-label small">Deskripsi</label>
            <input v-model="item.description" class="form-control form-control-sm" required />
          </div>
          <div class="col-md-3">
            <label class="form-label small">Nominal</label>
            <input v-model.number="item.amount" type="number" min="0" class="form-control form-control-sm" />
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-sm btn-text-danger" @click="form.items.splice(idx, 1)">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
        <div class="d-flex justify-content-between mt-3">
          <div class="small text-muted">
            Advance: {{ formatRupiah(advanceAmount) }} · Expense: {{ formatRupiah(totalExpense) }} ·
            Sisa: {{ formatRupiah(balanceAmount) }}
          </div>
          <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="onCreate">
            Simpan Draft Settlement
          </button>
        </div>
      </div>

      <div v-if="!settlements.length" class="text-muted text-center py-3">
        Belum ada settlement.
      </div>

      <div v-for="s in settlements" :key="s.id" class="border rounded p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-semibold">{{ s.settlementNumber || s.settlement_number }}</div>
            <span class="badge bg-label-secondary text-capitalize">{{ s.status }}</span>
          </div>
          <div class="d-flex gap-1">
            <button
              v-if="s.status === 'draft' || s.status === 'rejected'"
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click="onSubmit(s.id)"
            >
              Submit
            </button>
            <button
              v-if="s.status === 'submitted' && canApprove"
              type="button"
              class="btn btn-sm btn-outline-success"
              @click="onApprove(s.id)"
            >
              Approve
            </button>
            <button
              v-if="s.status === 'submitted' && canApprove"
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click="onReject(s.id)"
            >
              Reject
            </button>
            <button
              v-if="s.status === 'approved' && canApprove"
              type="button"
              class="btn btn-sm btn-success"
              @click="onSettle(s)"
            >
              Settle
            </button>
          </div>
        </div>
        <div class="small mb-2">
          Expense {{ formatRupiah(s.totalExpense ?? s.total_expense) }} ·
          Advance {{ formatRupiah(s.advanceAmount ?? s.advance_amount) }} ·
          Balance {{ formatRupiah(s.balanceAmount ?? s.balance_amount) }} ·
          Returned {{ formatRupiah(s.returnedAmount ?? s.returned_amount) }}
        </div>
        <ul class="mb-0 small">
          <li v-for="(it, i) in s.items || []" :key="i">
            {{ it.category ? `[${it.category}] ` : '' }}{{ it.description }} — {{ formatRupiah(it.amount) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { usePaymentRequestStore } from '~/stores/payment-request'
import { usePermissions } from '~/composables/usePermissions'
import Swal from 'sweetalert2'

const props = defineProps<{
  paymentRequestId: string
  advanceAmount: number
  settlementStatus?: string | null
  settlements?: any[]
}>()

const emit = defineEmits<{ refreshed: [] }>()

const store = usePaymentRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()
const saving = ref(false)
const showForm = ref(false)

const form = reactive({
  notes: '',
  items: [{ category: '', description: '', amount: 0 }],
})

const settlements = computed(() => props.settlements || [])
const settlementStatusLabel = computed(() => props.settlementStatus || '—')
const canCreate = computed(
  () =>
    props.settlementStatus === 'pending' ||
    props.settlementStatus === 'submitted' ||
    props.settlementStatus === 'approved'
)
const canApprove = computed(
  () =>
    userHasRole('superadmin') ||
    userHasPermission('settle_payment_request') ||
    userHasPermission('approve_payment_request') ||
    userHasPermission('approve_operational_payment_request')
)

const totalExpense = computed(() =>
  form.items.reduce((s, i) => s + (Number(i.amount) || 0), 0)
)
const balanceAmount = computed(() => Number(props.advanceAmount || 0) - totalExpense.value)

function addItem() {
  form.items.push({ category: '', description: '', amount: 0 })
}

async function onCreate() {
  const items = form.items.filter((i) => i.description?.trim())
  if (!items.length) {
    await Swal.fire('Validasi', 'Minimal 1 item settlement', 'warning')
    return
  }
  saving.value = true
  try {
    await store.createSettlement(props.paymentRequestId, {
      notes: form.notes || null,
      items: items.map((i) => ({
        category: i.category || null,
        description: i.description.trim(),
        amount: Number(i.amount) || 0,
      })),
    })
    showForm.value = false
    form.notes = ''
    form.items = [{ category: '', description: '', amount: 0 }]
    emit('refreshed')
  } catch (e: any) {
    await Swal.fire('Error', e.message || 'Gagal membuat settlement', 'error')
  } finally {
    saving.value = false
  }
}

async function onSubmit(id: string) {
  try {
    await store.submitSettlement(props.paymentRequestId, id)
    emit('refreshed')
  } catch (e: any) {
    await Swal.fire('Error', e.message, 'error')
  }
}

async function onApprove(id: string) {
  try {
    await store.approveSettlement(props.paymentRequestId, id)
    emit('refreshed')
  } catch (e: any) {
    await Swal.fire('Error', e.message, 'error')
  }
}

async function onReject(id: string) {
  const { value } = await Swal.fire({
    title: 'Alasan penolakan',
    input: 'text',
    showCancelButton: true,
    inputValidator: (v) => (!v ? 'Wajib diisi' : null),
  })
  if (!value) return
  try {
    await store.rejectSettlement(props.paymentRequestId, id, value)
    emit('refreshed')
  } catch (e: any) {
    await Swal.fire('Error', e.message, 'error')
  }
}

async function onSettle(s: any) {
  const balance = Number(s.balanceAmount ?? s.balance_amount ?? 0)
  let returnedAmount = Number(s.returnedAmount ?? s.returned_amount ?? 0)
  if (balance > 0) {
    const { value } = await Swal.fire({
      title: 'Jumlah dikembalikan',
      input: 'number',
      inputValue: balance,
      showCancelButton: true,
      inputValidator: (v) => {
        if (v == null || Number(v) < balance) return `Minimal mengembalikan ${balance}`
        return null
      },
    })
    if (value == null) return
    returnedAmount = Number(value)
  }
  try {
    await store.settleSettlement(props.paymentRequestId, s.id, returnedAmount)
    emit('refreshed')
  } catch (e: any) {
    await Swal.fire('Error', e.message, 'error')
  }
}

watch(
  () => props.settlementStatus,
  (status) => {
    if (status === 'pending' && !settlements.value.length) showForm.value = true
  },
  { immediate: true }
)
</script>
