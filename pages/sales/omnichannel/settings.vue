<template>
  <OmnichannelShell
    title="Tambahkan semua toko marketplace Anda"
    subtitle="Toko, sinkronisasi, dan konfigurasi kanal marketplace"
    company-input-id="omni-settings-company"
  >
    <template #actions>
      <button
        v-if="activeTab === 'toko'"
        type="button"
        class="btn btn-primary btn-sm"
        :disabled="!tiktokReady || connecting || !companyId"
        @click="connectTikTok"
      >
        {{ connecting ? 'Menyiapkan OAuth…' : 'Connect TikTok Shop' }}
      </button>
    </template>

    <div v-if="notice" class="alert alert-success text-break mb-3">{{ notice }}</div>
    <div v-if="fatalError" class="alert alert-danger text-break mb-3">
      <div class="fw-semibold">{{ fatalError.title }}</div>
      <div class="small">{{ fatalError.detail }}</div>
    </div>

    <WorkspaceTabs
      id-prefix="omni-settings"
      :tabs="tabs"
      :model-value="activeTab"
      @update:model-value="setTab"
    />

    <div
      v-show="activeTab === 'toko'"
      :id="'omni-settings-panel-toko'"
      role="tabpanel"
      aria-labelledby="omni-settings-tab-toko"
    >
      <CommerceConnectedShopsPanel @notice="onNotice" @error="onPanelError" />
    </div>

    <div
      v-show="activeTab === 'sinkronisasi'"
      :id="'omni-settings-panel-sinkronisasi'"
      role="tabpanel"
      aria-labelledby="omni-settings-tab-sinkronisasi"
    >
      <CommerceSyncJobsPanel />
    </div>

    <div
      v-show="activeTab === 'pesanan'"
      :id="'omni-settings-panel-pesanan'"
      role="tabpanel"
      aria-labelledby="omni-settings-tab-pesanan"
    >
      <div class="card mb-3">
        <div class="card-body text-muted small py-5 text-center">
          Pengaturan Pesanan belum tersedia pada fase ini.
        </div>
      </div>
    </div>

    <div
      v-show="activeTab === 'addon'"
      :id="'omni-settings-panel-addon'"
      role="tabpanel"
      aria-labelledby="omni-settings-tab-addon"
    >
      <div class="card mb-3">
        <div class="card-body text-muted small py-5 text-center">
          Add on belum tersedia pada fase ini.
        </div>
      </div>
    </div>
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useNuxtApp, useRoute, useRouter } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import CommerceConnectedShopsPanel from '~/components/commerce/CommerceConnectedShopsPanel.vue'
import CommerceSyncJobsPanel from '~/components/commerce/CommerceSyncJobsPanel.vue'
import WorkspaceTabs from '~/components/common/WorkspaceTabs.vue'
import type { WorkspaceTab } from '~/types/workspaceTab'
import { readAccessToken } from '~/utils/authCookie'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const TAB_IDS = ['toko', 'sinkronisasi', 'pesanan', 'addon'] as const
type SettingsTabId = (typeof TAB_IDS)[number]

const tabs: WorkspaceTab[] = [
  { id: 'toko', label: 'Toko Terhubung' },
  { id: 'sinkronisasi', label: 'Sinkronisasi' },
  { id: 'pesanan', label: 'Pesanan' },
  { id: 'addon', label: 'Add on' },
]

const { $api } = useNuxtApp() as any
const route = useRoute()
const router = useRouter()
const { companyId } = useActiveCompany()

const notice = ref('')
const fatalError = ref<{ title: string; detail: string } | null>(null)
const connecting = ref(false)
const tiktokReady = ref(false)

const activeTab = computed<SettingsTabId>(() => {
  const raw = String(route.query.tab || 'toko').toLowerCase()
  return (TAB_IDS as readonly string[]).includes(raw) ? (raw as SettingsTabId) : 'toko'
})

function setTab(id: string) {
  const next = (TAB_IDS as readonly string[]).includes(id) ? id : 'toko'
  router.replace({ path: route.path, query: { ...route.query, tab: next } })
}

function onNotice(message: string) {
  notice.value = message
  fatalError.value = null
}

function onPanelError(message: string) {
  fatalError.value = { title: 'Aksi gagal', detail: message }
}

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

async function loadPlatforms() {
  try {
    const res = await fetch($api.commercePlatforms(), { headers: headers(), credentials: 'include' })
    const json = await res.json().catch(() => ({}))
    tiktokReady.value = Boolean(json?.data?.tiktok?.configured)
  } catch {
    tiktokReady.value = false
  }
}

async function connectTikTok() {
  connecting.value = true
  notice.value = ''
  fatalError.value = null
  try {
    const res = await fetch($api.commerceOauthTikTokStart(), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ perusahaanId: companyId.value }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) throw new Error(json.message || 'OAuth start gagal')
    const url = json.data?.authorizeUrl
    if (!url) throw new Error('authorizeUrl kosong')
    window.location.href = url
  } catch (e: any) {
    fatalError.value = { title: 'Connect gagal', detail: e?.message || 'OAuth gagal' }
  } finally {
    connecting.value = false
  }
}

watch(companyId, () => loadPlatforms())

onMounted(() => {
  if (route.query.oauth === 'ok') {
    notice.value = 'OAuth TikTok selesai — jalankan Test Connection di tab Toko Terhubung.'
    router.replace({ path: route.path, query: { tab: 'toko' } })
  } else if (!route.query.tab) {
    setTab('toko')
  }
  loadPlatforms()
})
</script>
