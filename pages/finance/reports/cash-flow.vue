<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          
          <p class="mb-0 text-muted">Arus kas dari Bank Ledger settled (bukan pengakuan expense)</p>
        </div>
        <div class="d-flex gap-2 align-items-end flex-wrap">
          <div>
            <label class="form-label mb-0 small">Start</label>
            <input v-model="startDate" type="date" class="form-control form-control-sm" />
          </div>
          <div>
            <label class="form-label mb-0 small">End</label>
            <input v-model="endDate" type="date" class="form-control form-control-sm" />
          </div>
          <button class="btn btn-outline-secondary" :disabled="loading" @click="load">Refresh</button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="row g-3 mb-4" v-if="report">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Cash In (Ledger IN)</div>
              <div class="fs-5 fw-semibold text-success">{{ formatMoney(summary.inflow) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Cash Out (Ledger OUT)</div>
              <div class="fs-5 fw-semibold text-danger">{{ formatMoney(summary.outflow) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Net Cash Flow</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.netChange) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Description</th>
                  <th class="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in rows" :key="row.id || idx">
                  <td>{{ row.section || row.category || '—' }}</td>
                  <td>{{ row.description || row.name || row.accountName || '—' }}</td>
                  <td class="text-end">{{ formatMoney(row.amount ?? row.balance ?? 0) }}</td>
                </tr>
                <tr v-if="!rows.length">
                  <td colspan="3" class="text-center text-muted">Tidak ada data</td>
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
  title: 'Cash Flow',
})

const report = ref<any>(null)
const loading = ref(false)
const error = ref('')
const endDate = ref(new Date().toISOString().slice(0, 10))
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))

const rows = computed(() => {
  const data = report.value
  if (!data) return []
  return [
    { section: 'Inflow', description: 'Bank Ledger settled IN', amount: data.inflows?.total ?? data.inflows?.bankLedger ?? 0 },
    { section: 'Outflow', description: 'Bank Ledger settled OUT', amount: -(data.outflows?.total ?? data.outflows?.bankLedger ?? 0) },
  ]
})

const summary = computed(() => {
  const data = report.value || {}
  const inflow = Number(data.inflows?.total ?? data.inflows?.bankLedger ?? 0)
  const outflow = Number(data.outflows?.total ?? data.outflows?.bankLedger ?? 0)
  return {
    inflow,
    outflow,
    netChange: Number(data.netCashFlow ?? inflow - outflow),
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
    if (startDate.value) qs.set('startDate', startDate.value)
    if (endDate.value) qs.set('endDate', endDate.value)
    const res = await fetch(`${$api.financeCashFlow()}?${qs.toString()}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat cash flow')
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
