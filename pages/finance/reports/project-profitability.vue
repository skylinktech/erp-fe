<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Project Profitability</h4>
          <p class="mb-0 text-muted">
            Memisahkan Estimate / Recognized / Cash — bukan estimate SI saja.
          </p>
        </div>
        <div class="d-flex gap-2 align-items-end flex-wrap">
          <div style="min-width: 280px">
            <label class="form-label mb-0 small">Project</label>
            <CustomSelect2
              v-model="projectId"
              :options="projectOptions"
              :get-option-label="(p) => p ? `${p.projectCode || p.code || ''} — ${p.name || ''}` : ''"
              :reduce="(p) => p?.id"
              searchable
              clearable
              placeholder="Pilih project (historical)"
              @search="onProjectSearch"
            />
          </div>
          <button class="btn btn-primary" :disabled="loading || !projectId" @click="load">
            Load
          </button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="text-muted">Memuat profitability…</div>

      <template v-if="report && !loading">
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="border rounded p-3 h-100">
              <span class="badge text-bg-secondary mb-2">ESTIMATE</span>
              <div class="small text-muted">Revenue / Cost / Margin</div>
              <div>{{ formatMoney(report.estimatedRevenue) }} / {{ formatMoney(report.estimatedCost) }}</div>
              <div class="fw-semibold">{{ formatMoney(report.estimatedMargin) }}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="border rounded p-3 h-100">
              <span class="badge text-bg-primary mb-2">RECOGNIZED</span>
              <div class="small text-muted">Revenue − Direct Cost = Gross Margin</div>
              <div>{{ formatMoney(report.recognizedRevenue) }} − {{ formatMoney(report.recognizedDirectCost) }}</div>
              <div class="fw-semibold">{{ formatMoney(report.recognizedGrossMargin) }}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="border rounded p-3 h-100">
              <span class="badge text-bg-warning mb-2">CASH</span>
              <div class="small text-muted">In / Out / Position</div>
              <div>{{ formatMoney(report.cashIn) }} / {{ formatMoney(report.cashOut) }}</div>
              <div class="fw-semibold">{{ formatMoney(report.cashPosition) }}</div>
            </div>
          </div>
        </div>

        <div class="mb-3 small text-muted">
          Variance estimate vs recognized margin:
          <strong>{{ formatMoney(report.estimateVsActualVariance) }}</strong>
          <span v-if="report.project?.archivedAt" class="badge text-bg-dark ms-2">ARCHIVED</span>
        </div>

        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Document</th>
                <th>Category</th>
                <th>Cost Category</th>
                <th>Account</th>
                <th class="text-end">Estimate</th>
                <th class="text-end">Recognized</th>
                <th class="text-end">Cash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in report.details || []" :key="idx">
                <td>{{ row.date || '—' }}</td>
                <td>{{ row.source || '—' }}</td>
                <td>
                  <NuxtLink
                    v-if="row.journalId"
                    :to="`/finance/journals/detail/${row.journalId}`"
                    class="link-primary"
                  >
                    {{ row.documentNumber || row.journalId }}
                  </NuxtLink>
                  <span v-else>{{ row.documentNumber || '—' }}</span>
                </td>
                <td>{{ row.category }}</td>
                <td>{{ row.costCategory || '—' }}</td>
                <td>{{ row.account || '—' }}</td>
                <td class="text-end">{{ formatMoney(row.estimate) }}</td>
                <td class="text-end">{{ formatMoney(row.recognized) }}</td>
                <td class="text-end">{{ formatMoney(row.cash) }}</td>
                <td>
                  <span class="badge" :class="badgeClass(row.status)">{{ row.status }}</span>
                </td>
              </tr>
              <tr v-if="!(report.details || []).length">
                <td colspan="10" class="text-center text-muted">Belum ada baris GL untuk project ini</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { buildProjectOptionsQuery } from '~/utils/projectOptionsContext'

definePageMeta({ layout: 'default' })

const projectId = ref(null)
const projectOptions = ref([])
const report = ref(null)
const loading = ref(false)
const error = ref('')

function formatMoney(v) {
  const n = Number(v || 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function badgeClass(status) {
  if (status === 'ESTIMATE') return 'text-bg-secondary'
  if (status === 'RECOGNIZED') return 'text-bg-primary'
  if (status === 'CASH') return 'text-bg-warning'
  if (status === 'REVERSED') return 'text-bg-dark'
  return 'text-bg-light'
}

async function fetchProjectOptions(search = '') {
  const { $api } = useNuxtApp()
  const qs = buildProjectOptionsQuery({ context: 'historical', search, perPage: 40 })
  const res = await fetch($api.generalLedgerFormOptions(qs.toString()), {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) {
    projectOptions.value = []
    return
  }
  const json = await res.json()
  projectOptions.value = json.data || []
}

const onProjectSearch = useDebounceFn((term) => fetchProjectOptions(term || ''), 300)

async function load() {
  if (!projectId.value) return
  loading.value = true
  error.value = ''
  report.value = null
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.projectProfitability(String(projectId.value)), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value =
        json.message ||
        json.error?.message ||
        `Gagal memuat project profitability (HTTP ${res.status}).`
      return
    }
    report.value = json.data || json
  } catch (e) {
    error.value = e?.message || 'Gagal memuat project profitability (network).'
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProjectOptions())
</script>
