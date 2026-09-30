<template>
  <div class="card mb-3">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
      <div class="min-w-0">
        <h5 class="mb-0">Toko Terhubung</h5>
        <p class="mb-0 card-subtitle text-muted small mt-1">
          Status koneksi &amp; probe live (cache SkyFlow)
        </p>
      </div>
      <CommerceActionButton
        action="reload"
        btn-class="btn btn-outline-secondary btn-sm"
        :busy="loading"
        @click="reload"
      />
    </div>
    <div class="card-body mt-3">
      <div v-if="error" class="alert alert-warning small text-break mb-3">
        {{ error }}
        <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="reload">Retry</button>
      </div>

      <h6 class="mb-2">Koneksi</h6>
      <div v-if="loading && !connections.length" class="text-muted small mb-3">Memuat…</div>
      <div v-else-if="!connections.length" class="text-muted small mb-3">Belum ada koneksi.</div>
      <div v-else class="table-responsive mb-4">
        <div v-if="loading" class="text-muted small mb-2" aria-live="polite">Memperbarui…</div>
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Platform</th>
              <th>DB</th>
              <th>Probe</th>
              <th>Dicek</th>
              <th class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in connections" :key="c.id">
              <td class="text-break">{{ c.displayName }}</td>
              <td>{{ commercePlatformLabel(c.platformCode) }}</td>
              <td>
                <span class="badge" :class="commerceStatusBadge(c.status)">{{ commerceEnumLabel(c.status) }}</span>
              </td>
              <td>
                <span class="badge" :class="commerceStatusBadge(c.lastProbeStatus)">
                  {{ commerceEnumLabel(c.lastProbeStatus, 'Belum dicek') }}
                </span>
              </td>
              <td class="small text-nowrap">{{ formatCommerceTs(c.lastProbeAt) }}</td>
              <td>
                <CommerceRowActionsMenu
                  :disabled="c.status !== 'ACTIVE'"
                  :busy="actions.isTargetBusy(c.id)"
                  :busy-label="connectionBusyLabel(c.id)"
                  :actions="connectionMenuActions(c.id)"
                  aria-label="Aksi koneksi"
                  @select="(key) => onConnectionAction(key, c.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h6 class="mb-2">Shop aktif</h6>
      <div v-if="loading && !shops.length" class="text-muted small">Memuat…</div>
      <div v-else-if="!shops.length" class="text-muted small">
        Belum ada shop — jalankan Test / Sync shop.
      </div>
      <div v-else class="table-responsive">
        <div v-if="loading" class="text-muted small mb-2" aria-live="polite">Memperbarui…</div>
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Platform</th>
              <th>External ID</th>
              <th>Cipher</th>
              <th>Status</th>
              <th>Sync</th>
              <th class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in shops" :key="s.id">
              <td class="text-break">{{ s.name }}</td>
              <td>{{ commercePlatformLabel(s.platformCode) }}</td>
              <td class="font-monospace small">{{ s.externalShopId }}</td>
              <td>{{ s.hasShopCipher ? 'ya' : 'tidak' }}</td>
              <td>
                <span class="badge" :class="commerceStatusBadge(s.status)">{{ commerceEnumLabel(s.status) }}</span>
              </td>
              <td class="small">
                P {{ formatCommerceTs(s.lastProductSyncAt) }}<br />
                O {{ formatCommerceTs(s.lastOrderSyncAt) }}
              </td>
              <td>
                <CommerceRowActionsMenu
                  :disabled="!s.connectionId"
                  :busy="actions.isTargetBusy(s.id)"
                  :busy-label="shopBusyLabel(s.id)"
                  :actions="shopMenuActions(s.id)"
                  aria-label="Aksi shop"
                  @select="(key) => onShopAction(key, s)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { humanizeLabel } from '~/utils/humanizeLabel'

import { computed, onMounted, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useCommerceActionBusy } from '~/composables/useCommerceActionBusy'
import { useCommerceJobWatch } from '~/composables/useCommerceJobWatch'
import CommerceRowActionsMenu from '~/components/commerce/CommerceRowActionsMenu.vue'
import type { CommerceRowAction } from '~/components/commerce/CommerceRowActionsMenu.vue'
import CommerceActionButton from '~/components/commerce/CommerceActionButton.vue'
import { commerceStatusBadge, commerceEnumLabel, formatCommerceTs } from '~/utils/commerceFormat'
import { commercePlatformLabel } from '~/utils/commercePlatform'
import { commerceActionRunningLabel, isTerminalJobStatus } from '~/utils/commerceActionBusy'
import { readAccessToken } from '~/utils/authCookie'

export type CommerceConnectionRow = {
  id: string
  displayName: string
  platformCode: string
  status: string
  lastProbeStatus?: string | null
  lastProbeAt?: string | null
  lastProductSyncAt?: string | null
  lastOrderSyncAt?: string | null
}

export type CommerceShopRow = {
  id: string
  name: string
  platformCode: string
  externalShopId: string
  status: string
  connectionId: string | null
  hasShopCipher: boolean
  lastProductSyncAt?: string | null
  lastOrderSyncAt?: string | null
}

const emit = defineEmits<{
  notice: [message: string]
  error: [message: string]
}>()

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()
const actions = useCommerceActionBusy({ companyId })

const loading = ref(false)
const error = ref('')
const connections = ref<CommerceConnectionRow[]>([])
const shops = ref<CommerceShopRow[]>([])

const CONNECTION_ACTIONS: CommerceRowAction[] = [
  { key: 'test', label: 'Test Connection', icon: 'ri-pulse-line' },
  { key: 'sync-shops', label: 'Sync Shop', icon: 'ri-store-2-line' },
]

const SHOP_ACTIONS: CommerceRowAction[] = [
  { key: 'sync-products', label: 'Sync Produk', icon: 'ri-box-3-line' },
  { key: 'sync-orders', label: 'Sync Order', icon: 'ri-file-list-3-line' },
  { key: 'sync-returns', label: 'Sync Aftersales', icon: 'ri-arrow-go-back-line' },
]

const enabled = computed(() => Boolean(companyId.value))

const jobWatch = useCommerceJobWatch({
  intervalMs: 4000,
  timeoutMs: 120_000,
  fetchJobs: async (jobIds) => {
    if (!companyId.value || !jobIds.length) return []
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: String(Math.max(20, jobIds.length)),
      ids: jobIds.join(',')})
    const json = await fetchJson(`${$api.commerceSyncJobs()}?${qs}`)
    const rows = (json.data || []) as Array<{
      id: string
      status: string
      lastError?: string | null
      commandType?: string | null
    }>
    const want = new Set(jobIds.map(String))
    return rows.filter((r) => want.has(String(r.id)))
  },
  onUnconfirmed: ({ jobId, action, targetId }) => {
    actions.markPhase(action, targetId, 'unconfirmed')
    emit(
      'notice',
      `Status job ${jobId} belum terkonfirmasi — cek tab Sinkronisasi (request dipantau dihentikan, job backend tetap berjalan).`
    )
    // Allow UI to recover; job remains visible in Sync Jobs panel
    actions.clear(actions.key(action, targetId))
  }})

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Company-Id'] = String(companyId.value)
  return h
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) }})
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Permintaan gagal (${res.status})`)
  }
  return json
}

function connectionMenuActions(id: string): CommerceRowAction[] {
  const active = actions.busyActionForTarget(id)
  return CONNECTION_ACTIONS.map((a) => ({
    ...a,
    busy: active === a.key,
    disabled: Boolean(active && active !== a.key)}))
}

function shopMenuActions(id: string): CommerceRowAction[] {
  const active = actions.busyActionForTarget(id)
  return SHOP_ACTIONS.map((a) => ({
    ...a,
    busy: active === a.key,
    disabled: Boolean(active && active !== a.key)}))
}

function connectionBusyLabel(id: string) {
  const a = actions.busyActionForTarget(id)
  return a ? actions.labelOf(a, id) : commerceActionRunningLabel('sync')
}

function shopBusyLabel(id: string) {
  const a = actions.busyActionForTarget(id)
  return a ? actions.labelOf(a, id) : commerceActionRunningLabel('sync')
}

function watchQueuedJob(opts: {
  jobId: string
  action: string
  targetId: string
  successLabel: string
}) {
  actions.markQueued(opts.action, opts.targetId, opts.jobId)
  emit('notice', `Dalam antrean (job ${opts.jobId}).`)
  jobWatch.watch({
    jobId: opts.jobId,
    action: opts.action,
    targetId: opts.targetId,
    onUpdate: (row) => {
      const phase = actions.applyJobStatus(opts.action, opts.targetId, row.status)
      if (phase === 'processing') {
        emit('notice', `Sedang diproses (job ${opts.jobId}).`)
      } else if (phase === 'done' || isTerminalJobStatus(row.status)) {
        if (String(row.status).toUpperCase() === 'DONE' || String(row.status).toUpperCase() === 'SUCCEEDED') {
          emit('notice', `${opts.successLabel} (job ${opts.jobId}).`)
        } else if (String(row.status).toUpperCase() === 'DEAD' || String(row.status).toUpperCase() === 'FAILED') {
          emit('error', row.lastError || `Job ${opts.jobId} gagal`)
        } else if (String(row.status).toUpperCase() === 'AMBIGUOUS') {
          emit('error', `Job ${opts.jobId} ambigu — cek status di Sinkronisasi`)
        }
        void reload()
      }
    }})
}

/**
 * Parallel connections + shops (2 queries). Sync timestamps on shops come from
 * the connection map — no per-row follow-up (anti N+1).
 */
async function reload() {
  if (!companyId.value) {
    connections.value = []
    shops.value = []
    error.value = 'Active Company belum dipilih'
    return
  }
  const gen = actions.bumpRequestGen()
  loading.value = true
  error.value = ''
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: '50'})
    const [connJson, shopJson] = await Promise.all([
      fetchJson(`${$api.commerceConnections()}?${qs}`),
      fetchJson(`${$api.commerceShops()}?${qs}`),
    ])
    if (!actions.isCurrentGen(gen)) return
    const connRows = (connJson.data || []) as CommerceConnectionRow[]
    connections.value = connRows

    const syncByConn = new Map(
      connRows.map((c) => [
        c.id,
        {
          lastProductSyncAt: c.lastProductSyncAt ?? null,
          lastOrderSyncAt: c.lastOrderSyncAt ?? null},
      ])
    )

    shops.value = ((shopJson.data || []) as CommerceShopRow[])
      .filter((s) => String(s.status || '').toUpperCase() === 'ACTIVE')
      .map((s) => {
        const sync = s.connectionId ? syncByConn.get(s.connectionId) : null
        return {
          ...s,
          lastProductSyncAt: sync?.lastProductSyncAt ?? null,
          lastOrderSyncAt: sync?.lastOrderSyncAt ?? null}
      })
  } catch (e: any) {
    if (!actions.isCurrentGen(gen)) return
    error.value = e?.message || 'Gagal memuat toko terhubung'
    connections.value = []
    shops.value = []
  } finally {
    if (actions.isCurrentGen(gen)) loading.value = false
  }
}

async function onConnectionAction(key: string, id: string) {
  if (actions.isTargetBusy(id)) return
  let enqueued = false
  await actions
    .run(
      key,
      id,
      async () => {
        if (key === 'test') {
          const json = await fetchJson($api.commerceConnectionTest(id), { method: 'POST' })
          emit(
            'notice',
            `Probe ${json.data?.probeStatus} · shops=${json.data?.shopCount ?? 0}`
          )
          await reload()
          return
        }
        if (key === 'sync-shops') {
          const json = await fetchJson($api.commerceConnectionSyncShops(id), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})})
          if (json.data?.queued && json.data?.jobId) {
            enqueued = true
            watchQueuedJob({
              jobId: String(json.data.jobId),
              action: key,
              targetId: id,
              successLabel: 'Sync shop selesai'})
            return
          }
          emit('notice', 'Shop disinkronkan.')
          await reload()
        }
      },
      { keepBusyUntilClear: true }
    )
    .catch((e: any) => {
      emit('error', e?.message || 'Aksi koneksi gagal')
    })
  if (!enqueued) actions.clear(actions.key(key, id))
}

async function onShopAction(key: string, shop: CommerceShopRow) {
  if (!shop.connectionId) return
  if (actions.isTargetBusy(shop.id)) return
  let enqueued = false
  await actions
    .run(
      key,
      shop.id,
      async () => {
        let json: any
        if (key === 'sync-products') {
          json = await fetchJson($api.commerceConnectionSyncProducts(shop.connectionId!), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId: shop.id })})
          if (json.data?.queued && json.data?.jobId) {
            enqueued = true
            watchQueuedJob({
              jobId: String(json.data.jobId),
              action: key,
              targetId: shop.id,
              successLabel: 'Sync produk selesai'})
            return
          }
          emit('notice', `Produk: ${json.data?.imported ?? 0} baris`)
        } else if (key === 'sync-orders') {
          json = await fetchJson($api.commerceConnectionSyncOrders(shop.connectionId!), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId: shop.id, days: 7 })})
          if (json.data?.queued && json.data?.jobId) {
            enqueued = true
            watchQueuedJob({
              jobId: String(json.data.jobId),
              action: key,
              targetId: shop.id,
              successLabel: 'Sync order selesai'})
            return
          }
          emit('notice', `Order: ${json.data?.imported ?? 0} diimpor`)
        } else if (key === 'sync-returns') {
          json = await fetchJson($api.commerceConnectionSyncReturns(shop.connectionId!), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId: shop.id, days: 7 })})
          if (json.data?.queued && json.data?.jobId) {
            enqueued = true
            watchQueuedJob({
              jobId: String(json.data.jobId),
              action: key,
              targetId: shop.id,
              successLabel: 'Sync aftersales selesai'})
            return
          }
          emit('notice', `Aftersales: ${json.data?.imported ?? 0} diimpor (tanpa restock)`)
        }
        await reload()
      },
      { keepBusyUntilClear: true }
    )
    .catch((e: any) => {
      emit('error', e?.message || 'Aksi shop gagal')
    })
  if (!enqueued) actions.clear(actions.key(key, shop.id))
}

watch(companyId, () => {
  actions.clearAll()
  jobWatch.clear()
  actions.bumpRequestGen()
  if (enabled.value) void reload()
})
onMounted(() => {
  if (enabled.value) void reload()
})

defineExpose({ reload })
</script>
