<template>
  <div class="card mb-3">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
      <div class="min-w-0">
        <h5 class="mb-0">Sinkronisasi</h5>
        <p class="mb-0 card-subtitle text-muted small mt-1">
          <template v-if="worker">
            Mode {{ worker.mode }} — {{ worker.note }} ·
            backlog outbox {{ worker.backlog?.outboxPending ?? 0 }} ·
            last success {{ formatCommerceTs(worker.lastSuccess?.processedAt) }}
          </template>
          <template v-else>Antrian worker commerce (cache SkyFlow)</template>
        </p>
      </div>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        :disabled="loading"
        @click="reload"
      >
        Muat ulang
      </button>
    </div>
    <div class="card-body mt-3">
      <div v-if="error" class="alert alert-warning small text-break mb-3">
        {{ error }}
        <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="reload">Retry</button>
      </div>
      <div v-if="loading && !jobs.length" class="text-muted small">Memuat…</div>
      <div v-else-if="!jobs.length" class="text-muted small">Belum ada job sync.</div>
      <div v-else class="table-responsive">
        <table class="table table-sm mb-0">
          <thead>
            <tr>
              <th>Command</th>
              <th>Status</th>
              <th>Records</th>
              <th>Durasi</th>
              <th>Error</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="j in jobs" :key="j.id">
              <td class="small">
                <div class="fw-semibold">{{ j.commandType }}</div>
                <div class="text-muted">{{ j.platformCode }}</div>
              </td>
              <td>
                <span class="badge" :class="commerceStatusBadge(j.status)">{{ j.status }}</span>
              </td>
              <td>{{ j.recordCount ?? '—' }}</td>
              <td>{{ j.durationMs != null ? `${j.durationMs} ms` : '—' }}</td>
              <td class="small text-danger text-break" style="max-width: 12rem">
                {{ j.lastError || '—' }}
              </td>
              <td class="small text-nowrap">
                {{ formatCommerceTs(j.processedAt || j.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { commerceStatusBadge, formatCommerceTs } from '~/utils/commerceFormat'
import { readAccessToken } from '~/utils/authCookie'

export type CommerceSyncJobRow = {
  id: string
  commandType: string
  platformCode?: string | null
  status: string
  recordCount?: number | null
  durationMs?: number | null
  lastError?: string | null
  processedAt?: string | null
  createdAt?: string | null
}

export type CommerceWorkerHealth = {
  mode?: string
  note?: string
  backlog?: { outboxPending?: number }
  lastSuccess?: { processedAt?: string | null }
}

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()

const loading = ref(false)
const error = ref('')
const jobs = ref<CommerceSyncJobRow[]>([])
const worker = ref<CommerceWorkerHealth | null>(null)

const enabled = computed(() => Boolean(companyId.value))

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: headers(), credentials: 'include' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Permintaan gagal (${res.status})`)
  }
  return json
}

/** Parallel jobs + worker health — two round-trips, no N+1. */
async function reload() {
  if (!companyId.value) {
    jobs.value = []
    worker.value = null
    error.value = 'Active Company belum dipilih'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: '20',
    })
    const [jobsJson, healthJson] = await Promise.all([
      fetchJson(`${$api.commerceSyncJobs()}?${qs}`),
      fetchJson(`${$api.commerceWorkerHealth()}?${qs}`),
    ])
    jobs.value = (jobsJson.data || []) as CommerceSyncJobRow[]
    worker.value = (healthJson.data || null) as CommerceWorkerHealth | null
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat sinkronisasi'
    jobs.value = []
    worker.value = null
  } finally {
    loading.value = false
  }
}

watch(companyId, () => {
  if (enabled.value) reload()
})
onMounted(() => {
  if (enabled.value) reload()
})

defineExpose({ reload })
</script>
