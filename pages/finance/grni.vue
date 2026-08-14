<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-4 text-muted">Goods Received Not Invoiced — VIEW ONLY. No arbitrary manual clear.</p>

      <ul class="nav nav-tabs mb-3">
        <li class="nav-item" v-for="t in tabs" :key="t.key">
          <button
            class="nav-link"
            :class="{ active: tab === t.key }"
            type="button"
            @click="tab = t.key; load()"
          >{{ t.label }}</button>
        </li>
      </ul>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Company ID</label>
              <input v-model="companyId" class="form-control" />
            </div>
            <div v-if="tab === 'history'" class="col-md-2">
              <label class="form-label">Status</label>
              <input v-model="status" class="form-control" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" :disabled="loading" @click="load">
                {{ loading ? 'Loading…' : 'Load' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-if="tab === 'history'" class="card">
        <div class="card-body table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Created</th>
                <th>Company</th>
                <th>Receipt Movement</th>
                <th>Invoice</th>
                <th class="text-end">Cleared</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" @click="selected = row" style="cursor:pointer">
                <td>{{ formatDate(row.createdAt) }}</td>
                <td>{{ row.companyId }}</td>
                <td>{{ shortId(row.receiptMovementId) }}</td>
                <td>{{ row.purchaseInvoiceId || '-' }}</td>
                <td class="text-end">{{ formatMoney(row.clearedAmount ?? row.amount) }}</td>
                <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
              </tr>
              <tr v-if="!rows.length && !loading">
                <td colspan="6" class="text-muted">No clearing history</td>
              </tr>
            </tbody>
          </table>
          <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">Page {{ page }}</small>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" :disabled="page <= 1" @click="page--; load()">Prev</button>
              <button class="btn btn-outline-secondary" @click="page++; load()">Next</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <pre class="small mb-0" style="max-height:70vh;overflow:auto">{{ payload }}</pre>
        </div>
      </div>

      <div v-if="selected" class="card mt-4">
        <div class="card-header d-flex justify-content-between">
          <strong>Clearing Detail</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="selected = null">Close</button>
        </div>
        <div class="card-body small">
          <dl class="row mb-0">
            <dt class="col-4">Receipt Movement</dt>
            <dd class="col-8">
              <NuxtLink to="/inventory/stock-movements">{{ selected.receiptMovementId }}</NuxtLink>
            </dd>
            <dt class="col-4">Purchase Invoice</dt>
            <dd class="col-8">{{ selected.purchaseInvoiceId || '-' }}</dd>
            <dt class="col-4">Journal</dt>
            <dd class="col-8">
              <NuxtLink
                v-if="selected.journalId"
                :to="`/accounting/journals/detail?id=${selected.journalId}`"
              >{{ shortId(selected.journalId) }}</NuxtLink>
              <span v-else>-</span>
            </dd>
            <dt class="col-4">Status / Amount</dt>
            <dd class="col-8">{{ selected.status }} / {{ formatMoney(selected.clearedAmount ?? selected.amount) }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "GRNI", middleware: ['auth', 'check-permission'] })

const { $api, $apiFetch } = useNuxtApp()
const tabs = [
  { key: 'history', label: 'Clearing History' },
  { key: 'reconcile', label: 'Reconciliation' },
  { key: 'aging', label: 'Aging' },
]
const tab = ref('history')
const loading = ref(false)
const error = ref('')
const rows = ref([])
const selected = ref(null)
const payload = ref(null)
const page = ref(1)
const companyId = ref('')
const status = ref('')

function formatDate(v) {
  if (!v) return '-'
  try { return new Date(v).toLocaleString() } catch { return String(v) }
}
function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  return Number.isNaN(n) ? String(v) : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function shortId(id) {
  const s = String(id || '')
  return s.length > 12 ? `${s.slice(0, 8)}…` : s || '-'
}
function parseList(res) {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

async function load() {
  loading.value = true
  error.value = ''
  selected.value = null
  payload.value = null
  try {
    if (tab.value === 'history') {
      const params = new URLSearchParams({ page: String(page.value), limit: '25' })
      if (companyId.value) params.set('companyId', companyId.value)
      if (status.value) params.set('status', status.value)
      const res = await $apiFetch(`${$api.inventoryGrni()}?${params}`)
      rows.value = parseList(res)
    } else if (tab.value === 'reconcile') {
      const params = new URLSearchParams()
      if (companyId.value) params.set('companyId', companyId.value)
      const res = await $apiFetch(`${$api.inventoryGrniReconcile()}?${params}`)
      payload.value = res.data ?? res
      rows.value = []
    } else {
      const params = new URLSearchParams()
      if (companyId.value) params.set('companyId', companyId.value)
      const res = await $apiFetch(`${$api.inventoryGrniAging()}?${params}`)
      payload.value = res.data ?? res
      rows.value = []
    }
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed'
    rows.value = []
  } finally {
    loading.value = false
  }
}
</script>
