<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          
          <p class="mb-0 text-muted">Opening + period movement = closing (GL)</p>
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

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Category</th>
                  <th class="text-end">Debit</th>
                  <th class="text-end">Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in rows" :key="row.id || row.code">
                  <td>{{ row.code }}</td>
                  <td>{{ row.name }}</td>
                  <td>{{ row.category || '—' }}</td>
                  <td class="text-end">{{ formatMoney(row.total_debit ?? row.totalDebit ?? row.debit ?? 0) }}</td>
                  <td class="text-end">{{ formatMoney(row.total_credit ?? row.totalCredit ?? row.credit ?? 0) }}</td>
                </tr>
                <tr v-if="!rows.length">
                  <td colspan="5" class="text-center text-muted">Tidak ada data</td>
                </tr>
              </tbody>
              <tfoot v-if="rows.length">
                <tr>
                  <th colspan="3">Total</th>
                  <th class="text-end">{{ formatMoney(totalDebit) }}</th>
                  <th class="text-end">{{ formatMoney(totalCredit) }}</th>
                </tr>
              </tfoot>
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
  title: 'Trial Balance',
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
  return data.trialBalance || data.rows || data.accounts || []
})

const totalDebit = computed(() =>
  rows.value.reduce((s: number, r: any) => s + Number(r.total_debit ?? r.totalDebit ?? r.debit ?? 0), 0)
)
const totalCredit = computed(() =>
  rows.value.reduce((s: number, r: any) => s + Number(r.total_credit ?? r.totalCredit ?? r.credit ?? 0), 0)
)

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
    let res = await fetch($api.trialBalance(qs.toString()), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    let json = await res.json().catch(() => ({}))
    if (!res.ok && $api.journalsTrialBalance) {
      res = await fetch($api.journalsTrialBalance(qs.toString()), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      json = await res.json().catch(() => ({}))
    }
    if (!res.ok) throw new Error(json.message || 'Gagal memuat trial balance')
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
