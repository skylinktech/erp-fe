<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Stock Movements</h4>
      <p class="mb-4 text-muted">
        Operational ledger. No create/edit/delete — reverse only when permitted.
      </p>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Product ID</label>
              <input v-model="filters.productId" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Warehouse ID</label>
              <input v-model="filters.warehouseId" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Movement Type</label>
              <input v-model="filters.movementType" class="form-control" placeholder="SALES_ISSUE" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Direction</label>
              <select v-model="filters.direction" class="form-select">
                <option value="">All</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Source Type</label>
              <input v-model="filters.sourceDocumentType" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Status</label>
              <input v-model="filters.status" class="form-control" placeholder="posted" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Date From</label>
              <input v-model="filters.dateFrom" type="date" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Date To</label>
              <input v-model="filters.dateTo" type="date" class="form-control" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" :disabled="loading" @click="page = 1; load()">
                {{ loading ? 'Loading…' : 'Load' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="card">
        <div class="card-body table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>SKU</th>
                <th>WH</th>
                <th>Dir</th>
                <th class="text-end">Qty</th>
                <th class="text-end">Before</th>
                <th class="text-end">After</th>
                <th>Source</th>
                <th>Status</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in rows"
                :key="m.id"
                style="cursor: pointer"
                @click="openDetail(m.id)"
              >
                <td>{{ formatDate(m.postedAt) }}</td>
                <td>{{ m.movementType }}</td>
                <td>{{ productLabel(m) }}</td>
                <td>{{ m.product?.sku || m.product?.code || '-' }}</td>
                <td>{{ m.warehouse?.name || m.warehouseId }}</td>
                <td>{{ m.direction }}</td>
                <td class="text-end">{{ m.quantity }}</td>
                <td class="text-end">{{ m.beforeQuantity }}</td>
                <td class="text-end">{{ m.afterQuantity }}</td>
                <td class="text-truncate" style="max-width: 140px">{{ m.sourceDocumentType || '-' }}</td>
                <td><span :class="statusBadge(m.status)">{{ getDocumentStatusLabel(m.status) }}</span></td>
                <td>{{ m.referenceNumber || '-' }}</td>
              </tr>
              <tr v-if="!rows.length && !loading">
                <td colspan="12" class="text-muted">No data — click Load</td>
              </tr>
            </tbody>
          </table>
          <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">Page {{ page }}</small>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" :disabled="page <= 1 || loading" @click="page--; load()">Prev</button>
              <button class="btn btn-outline-secondary" :disabled="loading || rows.length < 25" @click="page++; load()">Next</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selected" class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Movement Detail</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="selected = null">Close</button>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <h6 class="text-muted">Document Information</h6>
              <dl class="row mb-0 small">
                <dt class="col-5">Movement ID</dt><dd class="col-7 text-break">{{ selected.id }}</dd>
                <dt class="col-5">Posted At</dt><dd class="col-7">{{ formatDate(selected.postedAt) }}</dd>
                <dt class="col-5">Type</dt><dd class="col-7">{{ selected.movementType }}</dd>
                <dt class="col-5">Direction</dt><dd class="col-7">{{ selected.direction }}</dd>
                <dt class="col-5">Status</dt><dd class="col-7"><span :class="statusBadge(selected.status)">{{ getDocumentStatusLabel(selected.status) }}</span></dd>
                <dt class="col-5">Reference</dt><dd class="col-7">{{ selected.referenceNumber || '-' }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <h6 class="text-muted">Business Context</h6>
              <dl class="row mb-0 small">
                <dt class="col-5">Product</dt><dd class="col-7">{{ productLabel(selected) }}</dd>
                <dt class="col-5">Warehouse</dt><dd class="col-7">{{ selected.warehouse?.name || selected.warehouseId }}</dd>
                <dt class="col-5">Qty / Before / After</dt>
                <dd class="col-7">{{ selected.quantity }} / {{ selected.beforeQuantity }} / {{ selected.afterQuantity }}</dd>
                <dt class="col-5">Source</dt>
                <dd class="col-7">{{ selected.sourceDocumentType || '-' }} #{{ selected.sourceDocumentId || '-' }}</dd>
                <dt class="col-5">Source Line</dt><dd class="col-7">{{ selected.sourceDocumentLineId || '-' }}</dd>
                <dt class="col-5">Actor</dt><dd class="col-7">{{ selected.actorUser?.name || selected.actor || '-' }}</dd>
                <dt class="col-5">Reason / Notes</dt>
                <dd class="col-7">{{ selected.reason || '-' }} / {{ selected.notes || '-' }}</dd>
              </dl>
            </div>
          </div>

          <div v-if="selected.valuations?.length" class="mt-4">
            <h6 class="text-muted">Valuation</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Unit Cost</th><th>Value</th><th>WAC Before</th><th>WAC After</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in selected.valuations" :key="v.id">
                    <td>{{ formatMoney(v.unitCost) }}</td>
                    <td>{{ formatMoney(v.movementValue) }}</td>
                    <td>{{ formatMoney(v.averageCostBefore) }}</td>
                    <td>{{ formatMoney(v.averageCostAfter) }}</td>
                    <td><span :class="statusBadge(v.status)">{{ getDocumentStatusLabel(v.status) }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="selected.accountingEvents?.length" class="mt-4">
            <h6 class="text-muted">Accounting Events</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Status</th><th>Amount</th><th>Journal</th><th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in selected.accountingEvents" :key="e.id">
                    <td><span :class="statusBadge(e.status)">{{ getDocumentStatusLabel(e.status) }}</span></td>
                    <td>{{ formatMoney(e.amount) }}</td>
                    <td>
                      <NuxtLink
                        v-if="e.journalId"
                        :to="`/accounting/journals/detail?id=${e.journalId}`"
                        class="text-primary"
                      >{{ shortId(e.journalId) }}</NuxtLink>
                      <span v-else>-</span>
                    </td>
                    <td class="text-truncate" style="max-width: 200px">{{ e.errorCode || e.errorMessage || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2 mt-3">
            <NuxtLink class="btn btn-sm btn-outline-primary" to="/inventory/stock-card">Open Stock Card</NuxtLink>
            <NuxtLink
              v-if="selected.id"
              class="btn btn-sm btn-outline-primary"
              :to="`/inventory/valuation?stockMovementId=${selected.id}`"
            >Valuation</NuxtLink>
            <button
              v-if="canReverse(selected)"
              class="btn btn-sm btn-outline-danger"
              :disabled="reversing"
              @click="reverseSelected"
            >
              Reverse Movement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api, $apiFetch, $toast } = useNuxtApp()
const loading = ref(false)
const reversing = ref(false)
const error = ref('')
const rows = ref([])
const selected = ref(null)
const page = ref(1)
const filters = reactive({
  productId: '',
  warehouseId: '',
  movementType: '',
  direction: '',
  sourceDocumentType: '',
  status: '',
  dateFrom: '',
  dateTo: '',
})

function formatDate(v) {
  if (!v) return '-'
  try { return new Date(v).toLocaleString() } catch { return String(v) }
}

function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

const statusBadge = (s) => ({
  posted: 'badge bg-label-info',
  reversed: 'badge bg-label-dark',
}[s] || 'badge bg-label-secondary')

const getDocumentStatusLabel = (s) => ({
  posted: 'Posted',
  reversed: 'Reversed',
}[s] || s)

function shortId(id) {
  if (!id) return '-'
  const s = String(id)
  return s.length > 12 ? `${s.slice(0, 8)}…` : s
}

function productLabel(m) {
  return m?.product?.name || m?.product?.sku || m?.productId || '-'
}

function canReverse(m) {
  return m?.status === 'posted' && !m?.reversalOfMovementId && !m?.reversedByMovementId
}

function parseList(res) {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res)) return res
  return []
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: '25' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
    const res = await $apiFetch(`${$api.stockMovements()}?${params}`)
    rows.value = parseList(res)
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed to load'
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function openDetail(id) {
  error.value = ''
  try {
    const res = await $apiFetch($api.stockMovementShow(id))
    selected.value = res.data || res
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed to load detail'
  }
}

async function reverseSelected() {
  const reason = window.prompt('Reason for reverse (required):')
  if (!reason || !reason.trim()) return
  reversing.value = true
  try {
    await $apiFetch($api.reverseStockMovement(selected.value.id), {
      method: 'POST',
      body: { reason: reason.trim() },
    })
    $toast?.success?.('Reversed') || alert('Reversed')
    selected.value = null
    await load()
  } catch (e) {
    $toast?.error?.(e?.data?.message || e?.message) || alert(e?.data?.message || e?.message)
  } finally {
    reversing.value = false
  }
}
</script>
