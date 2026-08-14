<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-4 text-muted">
        Exception queue from failed/blocked accounting events and outbox. Retry only via authorized backend path.
      </p>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Limit</label>
              <input v-model="limit" class="form-control" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" :disabled="loading" @click="load">
                {{ loading ? 'Loading…' : 'Refresh' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="card">
        <div class="card-body table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Document / Event</th>
                <th>Error Code</th>
                <th>Classification</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Last Error</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in rows" :key="row.id || i" style="cursor:pointer" @click="selected = row">
                <td>{{ formatDate(row.updatedAt || row.createdAt || row.date) }}</td>
                <td>{{ row.source || row.sourceType || '-' }}</td>
                <td class="text-truncate" style="max-width:160px">{{ row.movementId || row.sourceId || row.eventId || row.id || '-' }}</td>
                <td>{{ row.errorCode || '-' }}</td>
                <td><span class="badge bg-label-warning">{{ row.retryClass || row.classification || '-' }}</span></td>
                <td>{{ row.attemptCount ?? row.attempts ?? (row.retryable ? 'retryable' : '-') }}</td>
                <td><span class="badge bg-label-secondary">{{ row.status || '-' }}</span></td>
                <td class="text-truncate" style="max-width:220px">{{ row.errorMessage || row.lastError || '-' }}</td>
              </tr>
              <tr v-if="!rows.length && !loading">
                <td colspan="8" class="text-muted">No exceptions — click Refresh</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="selected" class="card mt-4">
        <div class="card-header d-flex justify-content-between">
          <strong>Exception Detail</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="selected = null">Close</button>
        </div>
        <div class="card-body small">
          <dl class="row mb-0">
            <dt class="col-md-3">Classification</dt>
            <dd class="col-md-9">{{ selected.classification || selected.retryClass || '-' }}</dd>
            <dt class="col-md-3">Required Action</dt>
            <dd class="col-md-9">{{ selected.requiredAction || selected.guidance || selected.message || '-' }}</dd>
            <dt class="col-md-3">Error</dt>
            <dd class="col-md-9">{{ selected.errorCode }} — {{ selected.errorMessage || selected.lastError || '-' }}</dd>
          </dl>
          <details class="mt-3">
            <summary class="text-muted">Technical</summary>
            <pre class="mt-2 mb-0">{{ selected }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Accounting Exceptions", middleware: ['auth', 'check-permission'] })

const { $api, $apiFetch } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const rows = ref([])
const selected = ref(null)
const limit = ref('100')

function formatDate(v) {
  if (!v) return '-'
  try { return new Date(v).toLocaleString() } catch { return String(v) }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ limit: String(limit.value || 100) })
    const res = await $apiFetch(`${$api.inventoryAccountingExceptions()}?${params}`)
    const data = res.data ?? res
    rows.value = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
