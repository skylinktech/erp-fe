<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Cash Flow</h4>
          <p class="mb-0 text-muted">Arus kas berbasis GL</p>
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
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Operating</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.operating) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Investing</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.investing) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Financing</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(summary.financing) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">Net Change</div>
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
  if (Array.isArray(data)) return data
  return data.rows || data.lines || data.items || []
})

const summary = computed(() => {
  const data = report.value || {}
  const operating = Number(data.operating ?? data.totalOperating ?? 0)
  const investing = Number(data.investing ?? data.totalInvesting ?? 0)
  const financing = Number(data.financing ?? data.totalFinancing ?? 0)
  return {
    operating,
    investing,
    financing,
    netChange: Number(data.netChange ?? data.netCashFlow ?? operating + investing + financing),
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
    const res = await fetch($api.cashFlowGl(qs.toString()), {
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
