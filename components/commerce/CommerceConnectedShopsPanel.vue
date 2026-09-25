<template>
  <div class="card mb-3">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
      <div class="min-w-0">
        <h5 class="mb-0">Toko Terhubung</h5>
        <p class="mb-0 card-subtitle text-muted small mt-1">
          Status koneksi &amp; probe live (cache SkyFlow)
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

      <h6 class="mb-2">Koneksi</h6>
      <div v-if="loading && !connections.length" class="text-muted small mb-3">Memuat…</div>
      <div v-else-if="!connections.length" class="text-muted small mb-3">Belum ada koneksi.</div>
      <div v-else class="table-responsive mb-4">
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
              <td>{{ c.platformCode }}</td>
              <td>
                <span class="badge" :class="commerceStatusBadge(c.status)">{{ c.status }}</span>
              </td>
              <td>
                <span class="badge" :class="commerceStatusBadge(c.lastProbeStatus)">
                  {{ c.lastProbeStatus || 'NEVER_PROBED' }}
                </span>
              </td>
              <td class="small text-nowrap">{{ formatCommerceTs(c.lastProbeAt) }}</td>
              <td>
                <CommerceRowActionsMenu
                  :disabled="c.status !== 'ACTIVE' || busyConnectionId === c.id"
                  :actions="connectionActions"
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
              <td>{{ s.platformCode }}</td>
              <td class="font-monospace small">{{ s.externalShopId }}</td>
              <td>{{ s.hasShopCipher ? 'ya' : 'tidak' }}</td>
              <td>
                <span class="badge" :class="commerceStatusBadge(s.status)">{{ s.status }}</span>
              </td>
              <td class="small">
                P {{ formatCommerceTs(s.lastProductSyncAt) }}<br />
                O {{ formatCommerceTs(s.lastOrderSyncAt) }}
              </td>
              <td>
                <CommerceRowActionsMenu
                  :disabled="!s.connectionId || busyShopId === s.id"
                  :actions="shopActions"
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
import { computed, onMounted, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import CommerceRowActionsMenu from '~/components/commerce/CommerceRowActionsMenu.vue'
import type { CommerceRowAction } from '~/components/commerce/CommerceRowActionsMenu.vue'
import { commerceStatusBadge, formatCommerceTs } from '~/utils/commerceFormat'
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

const loading = ref(false)
const error = ref('')
const connections = ref<CommerceConnectionRow[]>([])
const shops = ref<CommerceShopRow[]>([])
const busyConnectionId = ref<string | null>(null)
const busyShopId = ref<string | null>(null)

const connectionActions: CommerceRowAction[] = [
  { key: 'test', label: 'Test Connection', icon: 'ri-pulse-line' },
  { key: 'sync-shops', label: 'Sync Shop', icon: 'ri-store-2-line' },
]

const shopActions: CommerceRowAction[] = [
  { key: 'sync-products', label: 'Sync Produk', icon: 'ri-box-3-line' },
  { key: 'sync-orders', label: 'Sync Order', icon: 'ri-file-list-3-line' },
  { key: 'sync-returns', label: 'Sync Aftersales', icon: 'ri-arrow-go-back-line' },
]

const enabled = computed(() => Boolean(companyId.value))

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { credentials: 'include', ...init, headers: { ...headers(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Permintaan gagal (${res.status})`)
  }
  return json
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
  loading.value = true
  error.value = ''
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: '50',
    })
    const [connJson, shopJson] = await Promise.all([
      fetchJson(`${$api.commerceConnections()}?${qs}`),
      fetchJson(`${$api.commerceShops()}?${qs}`),
    ])
    const connRows = (connJson.data || []) as CommerceConnectionRow[]
    connections.value = connRows

    const syncByConn = new Map(
      connRows.map((c) => [
        c.id,
        {
          lastProductSyncAt: c.lastProductSyncAt ?? null,
          lastOrderSyncAt: c.lastOrderSyncAt ?? null,
        },
      ])
    )

    shops.value = ((shopJson.data || []) as CommerceShopRow[])
      .filter((s) => String(s.status || '').toUpperCase() === 'ACTIVE')
      .map((s) => {
        const sync = s.connectionId ? syncByConn.get(s.connectionId) : null
        return {
          ...s,
          lastProductSyncAt: sync?.lastProductSyncAt ?? null,
          lastOrderSyncAt: sync?.lastOrderSyncAt ?? null,
        }
      })
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat toko terhubung'
    connections.value = []
    shops.value = []
  } finally {
    loading.value = false
  }
}

async function onConnectionAction(key: string, id: string) {
  busyConnectionId.value = id
  try {
    if (key === 'test') {
      const json = await fetchJson($api.commerceConnectionTest(id), { method: 'POST' })
      emit(
        'notice',
        `Probe ${json.data?.probeStatus} · shops=${json.data?.shopCount ?? 0}`
      )
    } else if (key === 'sync-shops') {
      const json = await fetchJson($api.commerceConnectionSyncShops(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      emit(
        'notice',
        json.data?.queued
          ? `Sync shop diantrekan (job ${json.data.jobId}).`
          : 'Shop disinkronkan.'
      )
    }
    await reload()
  } catch (e: any) {
    emit('error', e?.message || 'Aksi koneksi gagal')
  } finally {
    busyConnectionId.value = null
  }
}

async function onShopAction(key: string, shop: CommerceShopRow) {
  if (!shop.connectionId) return
  busyShopId.value = shop.id
  try {
    if (key === 'sync-products') {
      const json = await fetchJson($api.commerceConnectionSyncProducts(shop.connectionId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id }),
      })
      emit(
        'notice',
        json.data?.queued
          ? `Sync produk diantrekan (job ${json.data.jobId}).`
          : `Produk: ${json.data?.imported ?? 0} baris`
      )
    } else if (key === 'sync-orders') {
      const json = await fetchJson($api.commerceConnectionSyncOrders(shop.connectionId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, days: 7 }),
      })
      emit(
        'notice',
        json.data?.queued
          ? `Sync order diantrekan (job ${json.data.jobId}).`
          : `Order: ${json.data?.imported ?? 0} diimpor`
      )
    } else if (key === 'sync-returns') {
      const json = await fetchJson($api.commerceConnectionSyncReturns(shop.connectionId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, days: 7 }),
      })
      emit(
        'notice',
        json.data?.queued
          ? `Sync aftersales diantrekan (job ${json.data.jobId}).`
          : `Aftersales: ${json.data?.imported ?? 0} diimpor (tanpa restock)`
      )
    }
    await reload()
  } catch (e: any) {
    emit('error', e?.message || 'Aksi shop gagal')
  } finally {
    busyShopId.value = null
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
