<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Inventory Valuation</h4>
      <p class="mb-4 text-muted">VIEW ONLY — Moving WAC valuation entries. Amounts are system-generated.</p>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div v-for="f in filterFields" :key="f.key" class="col-md-2">
              <label class="form-label">{{ f.label }}</label>
              <input v-model="filters[f.key]" class="form-control" />
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
                <th>Product</th>
                <th>WH</th>
                <th>Type</th>
                <th>Dir</th>
                <th class="text-end">Qty</th>
                <th class="text-end">Unit Cost</th>
                <th class="text-end">Value</th>
                <th>Status</th>
                <th>Movement</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.id"
                style="cursor: pointer"
                @click="selected = row"
              >
                <td>{{ formatDate(row.valuationDate || row.createdAt) }}</td>
                <td>{{ row.productId }}</td>
                <td>{{ row.warehouseId }}</td>
                <td>{{ row.movementType }}</td>
                <td>{{ row.direction }}</td>
                <td class="text-end">{{ row.quantity }}</td>
                <td class="text-end">{{ formatMoney(row.unitCost) }}</td>
                <td class="text-end">{{ formatMoney(row.movementValue) }}</td>
                <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
                <td>{{ shortId(row.stockMovementId) }}</td>
              </tr>
              <tr v-if="!rows.length && !loading">
                <td colspan="10" class="text-muted">No data — click Load</td>
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
        <div class="card-header d-flex justify-content-between">
          <strong>Valuation Detail (VIEW ONLY)</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="selected = null">Close</button>
        </div>
        <div class="card-body">
          <div class="row g-3 small">
            <div class="col-md-6">
              <dl class="row mb-0">
                <dt class="col-5">Opening Qty / Value</dt>
                <dd class="col-7">{{ selected.quantityBefore }} / {{ formatMoney(selected.valueBefore) }}</dd>
                <dt class="col-5">Movement Qty / Value</dt>
                <dd class="col-7">{{ selected.quantity }} / {{ formatMoney(selected.movementValue) }}</dd>
                <dt class="col-5">Closing Qty / Value</dt>
                <dd class="col-7">{{ selected.quantityAfter }} / {{ formatMoney(selected.valueAfter) }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row mb-0">
                <dt class="col-5">WAC Before / After</dt>
                <dd class="col-7">{{ formatMoney(selected.averageCostBefore) }} / {{ formatMoney(selected.averageCostAfter) }}</dd>
                <dt class="col-5">Cost Source</dt>
                <dd class="col-7">{{ selected.costSourceType }} / {{ selected.costSourceId || '-' }}</dd>
                <dt class="col-5">Source Movement</dt>
                <dd class="col-7">
                  <NuxtLink to="/inventory/stock-movements">{{ shortId(selected.stockMovementId) }}</NuxtLink>
                </dd>
                <dt class="col-5">Company / Status</dt>
                <dd class="col-7">{{ selected.companyId }} / {{ selected.status }}</dd>
              </dl>
            </div>
          </div>
          <details class="mt-3">
            <summary class="small text-muted">Technical IDs</summary>
            <pre class="small mt-2 mb-0">{{ { id: selected.id, idempotencyKey: selected.idempotencyKey } }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'check-permission'] })

const route = useRoute()
const { $api, $apiFetch } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const rows = ref([])
const selected = ref(null)
const page = ref(1)
const filterFields = [
  { key: 'productId', label: 'Product ID' },
  { key: 'warehouseId', label: 'Warehouse ID' },
  { key: 'status', label: 'Status' },
  { key: 'companyId', label: 'Company ID' },
  { key: 'stockMovementId', label: 'Movement ID' },
]
const filters = reactive(Object.fromEntries(filterFields.map((f) => [f.key, ''])))

if (route.query.stockMovementId) {
  filters.stockMovementId = String(route.query.stockMovementId)
}

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
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: '25' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
    const res = await $apiFetch(`${$api.inventoryValuation()}?${params}`)
    rows.value = parseList(res)
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (filters.stockMovementId) load()
})
</script>
