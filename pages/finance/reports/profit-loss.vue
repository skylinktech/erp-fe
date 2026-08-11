<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Profit &amp; Loss</h4>
          <p class="mb-0 text-muted">Laporan laba rugi berbasis GL</p>
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
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Revenue</div>
              <div class="fs-5 fw-semibold text-success">{{ formatMoney(summary.revenue) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Expense</div>
              <div class="fs-5 fw-semibold text-danger">{{ formatMoney(summary.expense) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Net Income</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.netIncome) }}</div>
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
                  <th class="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in rows" :key="row.id || row.code || idx">
                  <td>{{ row.section || row.type || '—' }}</td>
                  <td>{{ row.code || '—' }}</td>
                  <td>{{ row.name || row.accountName || '—' }}</td>
                  <td class="text-end">{{ formatMoney(row.amount ?? row.balance ?? 0) }}</td>
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
  title: 'Profit & Loss',
})

const report = ref<any>(null)
const loading = ref(false)
const error = ref('')
const endDate = ref(new Date().toISOString().slice(0, 10))
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))

const rows = computed(() => {
  const data = report.value
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.rows || data.lines || data.accounts || []
})

const summary = computed(() => {
  const data = report.value || {}
  return {
    revenue: Number(data.totalRevenue ?? data.revenue ?? 0),
    expense: Number(data.totalExpense ?? data.expense ?? 0),
    netIncome: Number(data.netIncome ?? data.netProfit ?? (Number(data.totalRevenue ?? data.revenue ?? 0) - Number(data.totalExpense ?? data.expense ?? 0))),
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
    const res = await fetch($api.profitLoss(qs.toString()), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat profit & loss')
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
