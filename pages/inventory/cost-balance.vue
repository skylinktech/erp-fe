<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-4 text-muted">VIEW ONLY — current financial cost balances (Moving WAC). No manual cost edit.</p>

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
      <div v-if="summary" class="alert alert-secondary small mb-3">
        Total inventory value: <strong>{{ formatMoney(summary.totalInventoryValue) }}</strong>
        · Total qty: <strong>{{ summary.totalQuantity }}</strong>
      </div>

      <div class="card">
        <div class="card-body table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>WH</th>
                <th>Company</th>
                <th class="text-end">On Hand Qty</th>
                <th class="text-end">Moving WAC</th>
                <th class="text-end">Inventory Cost Value</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id || `${row.productId}-${row.warehouseId}`">
                <td>{{ row.productId }}</td>
                <td>{{ row.warehouseId }}</td>
                <td>{{ row.companyId }}</td>
                <td class="text-end">{{ row.quantity }}</td>
                <td class="text-end">{{ formatMoney(row.averageCost ?? row.movingAverageCost ?? row.unitCost) }}</td>
                <td class="text-end">{{ formatMoney(row.inventoryValue) }}</td>
                <td>{{ formatDate(row.updatedAt) }}</td>
              </tr>
              <tr v-if="!rows.length && !loading">
                <td colspan="7" class="text-muted">No data — click Load</td>
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
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Inventory Cost Balance", middleware: ['auth', 'check-permission'] })

const { $api, $apiFetch } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const rows = ref([])
const summary = ref(null)
const page = ref(1)
const filterFields = [
  { key: 'productId', label: 'Product ID' },
  { key: 'warehouseId', label: 'Warehouse ID' },
  { key: 'companyId', label: 'Company ID' },
]
const filters = reactive(Object.fromEntries(filterFields.map((f) => [f.key, ''])))

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

function parseList(res) {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

async function load() {
  loading.value = true
  error.value = ''
  summary.value = null
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: '25' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
    const res = await $apiFetch(`${$api.inventoryCostBalances()}?${params}`)
    rows.value = parseList(res)
    if (res.aggregates) summary.value = res.aggregates
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed'
    rows.value = []
  } finally {
    loading.value = false
  }
}
</script>
