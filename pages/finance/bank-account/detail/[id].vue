<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-1">{{ account?.bank_name || 'Rekening Bank' }}</h4>
          <p class="mb-0 text-muted">{{ account?.account_number }} · {{ account?.currency || 'IDR' }}</p>
        </div>
        <NuxtLink class="btn btn-outline-secondary btn-sm" to="/finance/bank-account">Kembali</NuxtLink>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loadingAccount" class="text-muted">Memuat…</div>

      <ul class="nav nav-tabs mb-4" v-if="account">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'overview' }" @click="tab = 'overview'">Overview</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'ledger' }" @click="tab = 'ledger'">Ledger</button>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" :to="`/finance/bank-recon?bankAccountId=${account.id}`">Reconciliation</NuxtLink>
        </li>
      </ul>

      <div v-if="account && tab === 'overview'" class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <dl class="row mb-0 small">
                <dt class="col-5">Nama Bank</dt><dd class="col-7">{{ account.bank_name }}</dd>
                <dt class="col-5">Nomor Rekening</dt><dd class="col-7">{{ account.account_number }}</dd>
                <dt class="col-5">Nama Rekening</dt><dd class="col-7">{{ account.account_name }}</dd>
                <dt class="col-5">Mata Uang</dt><dd class="col-7">{{ account.currency }}</dd>
                <dt class="col-5">Mapped COA</dt>
                <dd class="col-7">
                  <span v-if="account.gl_account">{{ account.gl_account.code }} — {{ account.gl_account.name }}</span>
                  <span v-else class="text-danger">Belum dipetakan</span>
                </dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row mb-0 small">
                <dt class="col-5">Saldo Awal</dt><dd class="col-7">{{ formatRupiah(account.opening_balance) }}</dd>
                <dt class="col-5">Ledger Balance</dt><dd class="col-7 fw-semibold">{{ formatRupiah(account.ledger_balance) }}</dd>
                <dt class="col-5">Settled In</dt><dd class="col-7">{{ formatRupiah(account.settled_in) }}</dd>
                <dt class="col-5">Settled Out</dt><dd class="col-7">{{ formatRupiah(account.settled_out) }}</dd>
                <dt class="col-5">Unreconciled</dt><dd class="col-7">{{ account.unreconciled_count || 0 }}</dd>
                <dt class="col-5">Last Reconciled</dt><dd class="col-7">{{ account.last_reconciled_at || '—' }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div v-if="account && tab === 'ledger'" class="card">
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-md-2">
              <label class="form-label small">Dari</label>
              <input v-model="filters.startDate" type="date" class="form-control form-control-sm" @change="loadLedger" />
            </div>
            <div class="col-md-2">
              <label class="form-label small">Sampai</label>
              <input v-model="filters.endDate" type="date" class="form-control form-control-sm" @change="loadLedger" />
            </div>
            <div class="col-md-2">
              <label class="form-label small">Arah</label>
              <select v-model="filters.direction" class="form-select form-select-sm" @change="resetAndLoad">
                <option value="">Semua</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small">Sumber</label>
              <select v-model="filters.source" class="form-select form-select-sm" @change="resetAndLoad">
                <option value="">Semua</option>
                <option value="ar_receipt">AR Receipt</option>
                <option value="ap_payment">AP Payment</option>
                <option value="payroll_payment_item">Payroll</option>
                <option value="expense_payment">Expense</option>
                <option value="employee_advance">Advance</option>
                <option value="bank_transfer">Transfer</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small">Recon</label>
              <select v-model="filters.reconStatus" class="form-select form-select-sm" @change="resetAndLoad">
                <option value="">Semua</option>
                <option value="UNRECONCILED">Unreconciled</option>
                <option value="RECONCILED">Reconciled</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small">Cari</label>
              <input v-model="filters.search" class="form-control form-control-sm" @keyup.enter="resetAndLoad" />
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Referensi</th>
                  <th>Sumber</th>
                  <th>Deskripsi</th>
                  <th class="text-end">Money In</th>
                  <th class="text-end">Money Out</th>
                  <th class="text-end">Running Balance</th>
                  <th>Recon</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in ledgerRows" :key="row.id">
                  <td>{{ formatDate(row.transaction_date || row.transactionDate) }}</td>
                  <td>
                    <NuxtLink v-if="row.source_path" :to="row.source_path">{{ shortId(row.reference_id || row.referenceId) }}</NuxtLink>
                    <span v-else>{{ shortId(row.reference_id || row.referenceId) }}</span>
                  </td>
                  <td>{{ row.source_label || sourceLabel(row.reference_type || row.referenceType) }}</td>
                  <td>{{ row.description || '—' }}</td>
                  <td class="text-end text-success">{{ isIn(row) ? formatRupiah(row.amount) : '' }}</td>
                  <td class="text-end text-danger">{{ isIn(row) ? '' : formatRupiah(row.amount) }}</td>
                  <td class="text-end fw-semibold">{{ formatRupiah(row.running_balance) }}</td>
                  <td>
                    <span class="badge" :class="reconClass(row.reconciliation_status || row.reconciliationStatus)">
                      {{ row.reconciliation_status || row.reconciliationStatus }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!ledgerRows.length && !loadingLedger">
                  <td colspan="8" class="text-center text-muted">Tidak ada mutasi</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="small text-muted">Total {{ ledgerMeta.total || 0 }} baris</span>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="prevPage">Prev</button>
              <button class="btn btn-sm btn-outline-secondary" :disabled="page >= lastPage" @click="nextPage">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBankAccountStore } from '~/stores/bank-accounts'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { bankLedgerSourceLabel } from '~/utils/bankLedgerSource'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Bank Account Detail',
})

const route = useRoute()
const store = useBankAccountStore()
const formatRupiah = useFormatRupiah()

const tab = ref('overview')
const account = ref(null)
const error = ref('')
const loadingAccount = ref(false)
const loadingLedger = ref(false)
const ledgerRows = ref([])
const ledgerMeta = ref({})
const page = ref(1)
const rowsPerPage = 20
const filters = ref({
  startDate: '',
  endDate: '',
  direction: '',
  source: '',
  reconStatus: '',
  search: '',
})

const lastPage = computed(() => Number(ledgerMeta.value.lastPage || ledgerMeta.value.last_page || 1))

function formatDate(v) {
  if (!v) return '—'
  return String(v).slice(0, 10)
}
function shortId(v) {
  const s = String(v || '')
  return s.length > 12 ? `${s.slice(0, 8)}…` : s || '—'
}
function isIn(row) {
  return String(row.direction || '').toUpperCase() === 'IN'
}
function sourceLabel(type) {
  return bankLedgerSourceLabel(type)
}
function reconClass(status) {
  return String(status) === 'RECONCILED' ? 'bg-label-success' : 'bg-label-warning'
}

async function loadAccount() {
  loadingAccount.value = true
  error.value = ''
  try {
    account.value = await store.fetchBankAccount(route.params.id)
  } catch (e) {
    error.value = e.message || 'Gagal memuat rekening'
  } finally {
    loadingAccount.value = false
  }
}

async function loadLedger() {
  if (!route.params.id) return
  loadingLedger.value = true
  try {
    const result = await store.fetchLedger(route.params.id, {
      page: page.value,
      rows: rowsPerPage,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      direction: filters.value.direction,
      source: filters.value.source,
      reconStatus: filters.value.reconStatus,
      search: filters.value.search,
    })
    ledgerRows.value = result.rows
    ledgerMeta.value = result.meta || {}
  } catch (e) {
    error.value = e.message || 'Gagal memuat ledger'
  } finally {
    loadingLedger.value = false
  }
}

function resetAndLoad() {
  page.value = 1
  loadLedger()
}
function prevPage() {
  if (page.value > 1) {
    page.value -= 1
    loadLedger()
  }
}
function nextPage() {
  if (page.value < lastPage.value) {
    page.value += 1
    loadLedger()
  }
}

watch(tab, (v) => {
  if (v === 'ledger' && !ledgerRows.value.length) loadLedger()
})

onMounted(async () => {
  await loadAccount()
})
</script>
