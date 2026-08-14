<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          
          <p class="mb-0 text-muted">Piutang outstanding per bucket umur (as of {{ report?.asOf || '—' }})</p>
        </div>
        <div class="d-flex gap-2 align-items-end">
          <div>
            <label class="form-label mb-0 small">As of</label>
            <input v-model="asOf" type="date" class="form-control form-control-sm" />
          </div>
          <button class="btn btn-outline-secondary" :disabled="loading" @click="load">Refresh</button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="row g-3 mb-4">
        <div v-for="b in report?.buckets || []" :key="b.key" class="col-md">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small">{{ b.label }}</div>
              <div class="fs-5 fw-semibold">{{ formatMoney(b.amount) }}</div>
              <div class="small text-muted">{{ b.count }} invoice</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-body d-flex justify-content-between">
          <span>Total outstanding</span>
          <strong>{{ formatMoney(report?.totalAmount || 0) }} ({{ report?.totalCount || 0 }})</strong>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Due</th>
                  <th>Days</th>
                  <th>Bucket</th>
                  <th class="text-end">Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in report?.rows || []" :key="row.id">
                  <td>{{ row.number }}</td>
                  <td>{{ row.partyName || row.partyId || '—' }}</td>
                  <td>{{ row.dueDate || '—' }}</td>
                  <td>{{ row.daysPastDue }}</td>
                  <td><span class="badge bg-label-secondary">{{ row.bucket }}</span></td>
                  <td class="text-end">{{ formatMoney(row.remainingAmount) }}</td>
                </tr>
                <tr v-if="!(report?.rows || []).length">
                  <td colspan="6" class="text-center text-muted">Tidak ada outstanding</td>
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
  title: 'AR Aging',
})

const report = ref<any>(null)
const loading = ref(false)
const error = ref('')
const asOf = ref(new Date().toISOString().slice(0, 10))

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
    if (asOf.value) qs.set('asOf', asOf.value)
    const res = await fetch($api.arAgingReport(qs.toString()), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat AR aging')
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
