<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Balance Sheet</h4>
          <p class="mb-0 text-muted">Neraca berbasis GL (as of {{ asOf }})</p>
        </div>
        <div class="d-flex gap-2 align-items-end flex-wrap">
          <div>
            <label class="form-label mb-0 small">As of</label>
            <input v-model="asOf" type="date" class="form-control form-control-sm" />
          </div>
          <button class="btn btn-outline-secondary" :disabled="loading" @click="load">Refresh</button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="row g-3 mb-4" v-if="report">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Assets</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.assets) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Liabilities</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.liabilities) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Equity</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.equity) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Code</th>
                  <th>Account</th>
                  <th class="text-end">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in rows" :key="row.id || row.code || idx">
                  <td>{{ row.section || row.category || '—' }}</td>
                  <td>{{ row.code || '—' }}</td>
                  <td>{{ row.name || row.accountName || '—' }}</td>
                  <td class="text-end">{{ formatMoney(row.balance ?? row.amount ?? 0) }}</td>
                </tr>
                <tr v-if="!rows.length">
                  <td colspan="4" class="text-center text-muted">Tidak ada data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Balance Sheet',
})

const report = ref<any>(null)
const loading = ref(false)
const error = ref('')
const asOf = ref(new Date().toISOString().slice(0, 10))

const rows = computed(() => {
  const data = report.value
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.rows || data.lines || data.accounts || []
})

const summary = computed(() => {
  const data = report.value || {}
  return {
    assets: Number(data.totalAssets ?? data.assets ?? 0),
    liabilities: Number(data.totalLiabilities ?? data.liabilities ?? 0),
    equity: Number(data.totalEquity ?? data.equity ?? 0),
  }
})

function formatMoney(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(n || 0)
  )
}

async function load() {
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    const qs = new URLSearchParams()
    if (asOf.value) {
      qs.set('asOf', asOf.value)
      qs.set('endDate', asOf.value)
    }
    const res = await fetch($api.balanceSheet(qs.toString()), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat balance sheet')
    report.value = json.data
  } catch (e: any) {
    error.value = e.message
    report.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
