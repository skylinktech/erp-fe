<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          
          <p class="mb-0 text-muted">Import statement &amp; match ke AR Receipt / AP Payment</p>
        </div>
        <button class="btn btn-outline-secondary" :disabled="loading" @click="load">Refresh</button>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="card mb-4">
        <div class="card-body">
          <h6 class="mb-3">Import statement</h6>
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label">Bank Account</label>
              <select v-model="form.bankAccountId" class="form-select">
                <option value="">Pilih rekening</option>
                <option v-for="a in bankAccounts" :key="a.id" :value="a.id">
                  {{ a.bankName || a.bank_name }} — {{ a.accountNumber || a.account_number }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Statement date</label>
              <input v-model="form.statementDate" type="date" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Reference</label>
              <input v-model="form.reference" class="form-control" />
            </div>
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">Lines</label>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="addLine">+ Line</button>
              </div>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Direction</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>Description</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(line, idx) in form.lines" :key="idx">
                      <td><input v-model="line.lineDate" type="date" class="form-control form-control-sm" /></td>
                      <td>
                        <select v-model="line.direction" class="form-select form-select-sm">
                          <option value="credit">credit (in / AR)</option>
                          <option value="debit">debit (out / AP)</option>
                        </select>
                      </td>
                      <td><input v-model.number="line.amount" type="number" min="0" class="form-control form-control-sm" /></td>
                      <td><input v-model="line.reference" class="form-control form-control-sm" /></td>
                      <td><input v-model="line.description" class="form-control form-control-sm" /></td>
                      <td><button type="button" class="btn btn-sm btn-outline-danger" @click="form.lines.splice(idx, 1)">×</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-12">
              <button class="btn btn-primary" :disabled="loading" @click="createStatement">Create &amp; Import</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Lines</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in statements" :key="row.id">
                <td>{{ row.statementDate || row.statement_date }}</td>
                <td>{{ row.reference || '—' }}</td>
                <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
                <td>{{ (row.lines || []).length }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openDetail(row.id)">Open</button>
                  <button class="btn btn-sm btn-outline-success" @click="suggest(row.id)">Suggest</button>
                </td>
              </tr>
              <tr v-if="!statements.length">
                <td colspan="5" class="text-center text-muted">Belum ada statement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="detail" class="card mt-4">
        <div class="card-header bg-transparent d-flex justify-content-between">
          <h6 class="mb-0">Statement {{ detail.id }}</h6>
          <button class="btn btn-sm btn-outline-secondary" @click="detail = null">Close</button>
        </div>
        <div class="card-body">
          <div v-if="suggestions" class="alert alert-info small mb-3">
            Suggestions loaded for {{ suggestions.results?.length || 0 }} lines
          </div>
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Dir</th>
                <th>Amount</th>
                <th>Ref</th>
                <th>Status</th>
                <th>Match</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in detail.lines || []" :key="line.id">
                <td>{{ line.lineDate || line.line_date }}</td>
                <td>{{ line.direction }}</td>
                <td>{{ formatMoney(line.amount) }}</td>
                <td>{{ line.reference || '—' }}</td>
                <td>{{ line.matchStatus || line.match_status }}</td>
                <td class="small">
                  <span v-if="line.matchedType || line.matched_type">
                    {{ line.matchedType || line.matched_type }} / {{ line.matchedId || line.matched_id }}
                  </span>
                  <span v-else>—</span>
                </td>
                <td class="text-end text-nowrap">
                  <button
                    v-if="bestSuggestion(line.id)"
                    class="btn btn-sm btn-success me-1"
                    @click="confirmBest(line.id)"
                  >
                    Match top
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="ignore(line.id)">Ignore</button>
                  <button class="btn btn-sm btn-outline-danger" @click="unmatch(line.id)">Unmatch</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Bank Reconciliation',
})

const loading = ref(false)
const error = ref('')
const statements = ref<any[]>([])
const bankAccounts = ref<any[]>([])
const detail = ref<any>(null)
const suggestions = ref<any>(null)
const form = reactive({
  bankAccountId: '',
  statementDate: new Date().toISOString().slice(0, 10),
  reference: '',
  lines: [
    {
      lineDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      direction: 'credit' as 'credit' | 'debit',
      reference: '',
      description: '',
    },
  ],
})

function addLine() {
  form.lines.push({
    lineDate: form.statementDate,
    amount: 0,
    direction: 'credit',
    reference: '',
    description: '',
  })
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))
}

function bestSuggestion(lineId: string) {
  const row = suggestions.value?.results?.find((r: any) => r.lineId === lineId)
  return row?.suggestions?.[0] || null
}

async function loadBankAccounts() {
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.bankAccounts()}?limit=200`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  const data = json.data
  bankAccounts.value = Array.isArray(data) ? data : data?.data || []
}

async function load() {
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.bankStatements(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat statements')
    statements.value = Array.isArray(json.data) ? json.data : []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function createStatement() {
  loading.value = true
  error.value = ''
  const toast = useToast()
  const { $api } = useNuxtApp()
  try {
    if (!form.bankAccountId) throw new Error('Pilih bank account')
    const lines = form.lines.filter((l) => Number(l.amount) > 0)
    if (!lines.length) throw new Error('Minimal 1 line dengan amount > 0')
    const res = await fetch($api.bankStatements(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bankAccountId: form.bankAccountId,
        statementDate: form.statementDate,
        reference: form.reference,
        lines,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal create statement')
    toast.success('Statement dibuat')
    await load()
    detail.value = json.data
  } catch (e: any) {
    error.value = e.message
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  const { $api } = useNuxtApp()
  const res = await fetch($api.bankStatementShow(id), {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) {
    error.value = json.message || 'Gagal memuat detail'
    return
  }
  detail.value = json.data
  suggestions.value = null
}

async function suggest(id: string) {
  const { $api } = useNuxtApp()
  const toast = useToast()
  const res = await fetch($api.bankStatementSuggest(id), {
    method: 'POST',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) {
    toast.error(json.message || 'Suggest gagal')
    return
  }
  suggestions.value = json.data
  await openDetail(id)
  toast.success('Suggestions siap')
}

async function confirmBest(lineId: string) {
  const top = bestSuggestion(lineId)
  if (!top) return
  const { $api } = useNuxtApp()
  const toast = useToast()
  const res = await fetch($api.bankStatementLineConfirmMatch(lineId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      matchedType: top.candidate.type,
      matchedId: top.candidate.id,
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    toast.error(json.message || 'Match gagal')
    return
  }
  toast.success('Matched')
  if (detail.value?.id) await openDetail(detail.value.id)
}

async function ignore(lineId: string) {
  const { $api } = useNuxtApp()
  await fetch($api.bankStatementLineIgnore(lineId), {
    method: 'POST',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (detail.value?.id) await openDetail(detail.value.id)
}

async function unmatch(lineId: string) {
  const { $api } = useNuxtApp()
  await fetch($api.bankStatementLineUnmatch(lineId), {
    method: 'POST',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (detail.value?.id) await openDetail(detail.value.id)
}

onMounted(async () => {
  await Promise.all([load(), loadBankAccounts()])
})
</script>
