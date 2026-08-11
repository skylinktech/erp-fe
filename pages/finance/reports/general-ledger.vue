<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-1">General Ledger</h4>
          <p class="mb-0 text-muted">Detail mutasi akun dari jurnal posted</p>
        </div>
        <div class="d-flex gap-2 align-items-end flex-wrap">
          <div>
            <label class="form-label mb-0 small">Account ID</label>
            <input v-model="accountId" type="text" class="form-control form-control-sm" placeholder="Opsional" />
          </div>
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

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Journal</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th class="text-end">Debit</th>
                  <th class="text-end">Credit</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in rows" :key="row.id || idx">
                  <td>{{ row.date || row.journalDate || '—' }}</td>
                  <td>{{ row.journalNumber || row.journal_number || '—' }}</td>
                  <td>{{ row.accountCode || row.code || row.account?.code || '—' }} {{ row.accountName || row.account?.name || '' }}</td>
                  <td>{{ row.description || row.lineDescription || '—' }}</td>
                  <td class="text-end">{{ formatMoney(row.debit ?? 0) }}</td>
                  <td class="text-end">{{ formatMoney(row.credit ?? 0) }}</td>
                  <td>
                    <span v-if="row.referenceType || row.sourceType" class="badge bg-label-secondary">
                      {{ row.referenceType || row.sourceType }}
                    </span>
                    <span v-else class="text-muted">—</span>
                  </td>
                </tr>
                <tr v-if="!rows.length">
                  <td colspan="7" class="text-center text-muted">Tidak ada data</td>
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
  title: 'General Ledger',
})

const report = ref<any>(null)
const loading = ref(false)
const error = ref('')
const accountId = ref('')
const endDate = ref(new Date().toISOString().slice(0, 10))
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))

const rows = computed(() => {
  const data = report.value
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.rows || data.lines || data.entries || []
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
    if (accountId.value) qs.set('accountId', accountId.value)
    const res = await fetch($api.generalLedger(qs.toString()), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat general ledger')
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
