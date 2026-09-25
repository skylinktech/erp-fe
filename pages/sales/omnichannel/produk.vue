<template>
  <OmnichannelShell
    title="Product"
    subtitle="Listing eksternal marketplace — tidak menimpa Product Master / Price List RETAIL"
  >
    <div class="card card-body mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-6">
          <label class="form-label" for="produk-shop">Filter shop</label>
          <select id="produk-shop" v-model="selectedShopId" class="form-select">
            <option value="">Semua shop</option>
            <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="load">
            Muat ulang
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>

    <div class="card">
      <div class="card-body">
        <ExternalListingsPanel :listings="filteredListings" title="Listing marketplace (cache)">
          <template #empty>Belum ada listing — sync produk dari Dashboard → Toko Terhubung.</template>
        </ExternalListingsPanel>
      </div>
    </div>
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp, useRoute } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import ExternalListingsPanel from '~/components/commerce/ExternalListingsPanel.vue'
import { readAccessToken } from '~/utils/authCookie'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp() as any
const route = useRoute()
const { companyId } = useActiveCompany()

const shops = ref<any[]>([])
const listings = ref<any[]>([])
const selectedShopId = ref(String(route.query.shopId || ''))
const mappedOnly = ref(route.query.mapped === '0' ? '0' : '')
const loading = ref(false)
const error = ref('')

const filteredListings = computed(() => {
  let rows = listings.value
  if (mappedOnly.value === '0') rows = rows.filter((l) => !l.mapped)
  return rows
})

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

async function loadShops() {
  if (!companyId.value) return
  const res = await fetch(
    `${$api.commerceShops()}?perusahaanId=${companyId.value}&page=1&perPage=50`,
    { headers: headers(), credentials: 'include' }
  )
  const json = await res.json()
  if (res.ok) shops.value = json.data || []
}

async function load() {
  if (!companyId.value) return
  loading.value = true
  error.value = ''
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: '50',
    })
    if (selectedShopId.value) qs.set('shopId', selectedShopId.value)
    const res = await fetch(`${$api.commerceListings()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal memuat listing'
      return
    }
    listings.value = json.data || []
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat listing'
  } finally {
    loading.value = false
  }
}

watch([companyId, selectedShopId], async () => {
  await loadShops()
  await load()
})
onMounted(async () => {
  if (route.query.mapped === '0') mappedOnly.value = '0'
  await loadShops()
  await load()
})
</script>
