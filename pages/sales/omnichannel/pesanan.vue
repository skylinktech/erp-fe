<template>
  <OmnichannelShell
    title="Kelola Pesanan"
    subtitle="Pesanan marketplace (cache SkyFlow) — tanpa stok / GL / auto-release / fulfill write"
  >
    <CommerceOrdersFilterCard
      title="Pesanan"
      :tabs="statusTabs"
      :active-tab="activeStatusTab"
      :shops="shops"
      :q="q"
      :shop-id="selectedShopId"
      :processing-state="processingState"
      :date-from="dateFrom"
      :date-to="dateTo"
      :sort="sort"
      :busy="loading"
      @update:active-tab="onStatusTab"
      @update:q="q = $event"
      @update:shop-id="selectedShopId = $event"
      @update:processing-state="onProcessingChange"
      @update:date-from="dateFrom = $event"
      @update:date-to="dateTo = $event"
      @update:sort="onSortChange"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>
    <div v-if="loading" class="text-muted small mb-2">Memuat…</div>

    <CommerceListPagination
      compact
      id-prefix="pesanan-page-top"
      aria-label="Pagination pesanan (atas)"
      :page="page"
      :per-page="perPage"
      :meta="meta"
      :disabled="loading"
      @update:page="onPageChange"
      @update:per-page="onPerPageChange"
    />

    <ExternalOrderCards :orders="orders" @open-detail="openDetail">
      <template #empty>Belum ada External Order. Jalankan Sync Order di Settings Omnichannel.</template>
    </ExternalOrderCards>

    <CommerceListPagination
      id-prefix="pesanan-page"
      aria-label="Pagination pesanan"
      :page="page"
      :per-page="perPage"
      :meta="meta"
      :disabled="loading"
      @update:page="onPageChange"
      @update:per-page="onPerPageChange"
    />

    <!-- Detail modal -->
    <div
      v-if="detail"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.35)"
      @click.self="detail = null"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5">Detail {{ detail.externalOrderId }}</h2>
            <button type="button" class="btn-close" aria-label="Tutup" @click="detail = null" />
          </div>
          <div class="modal-body small">
            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <div class="text-muted">Status</div>
                <div>{{ detail.statusLabel }} ({{ detail.rawStatus }})</div>
              </div>
              <div class="col-md-4">
                <div class="text-muted">Fulfillment</div>
                <div>{{ detail.fulfillmentType }}</div>
              </div>
              <div class="col-md-4">
                <div class="text-muted">Processing</div>
                <div>{{ detail.processingState }}</div>
              </div>
            </div>
            <h3 class="h6">Money snapshot</h3>
            <div class="row g-2 mb-3">
              <div class="col-6 col-md-3">
                <div class="text-muted">Subtotal</div>
                <div>{{ formatMoney(detail.subtotalAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Ongkir</div>
                <div>{{ formatMoney(detail.shippingFeeAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Total</div>
                <div class="fw-semibold">{{ formatMoney(detail.totalAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Refund</div>
                <div>{{ formatMoney(detail.refundAmount, detail.currency) }}</div>
              </div>
            </div>
            <h3 class="h6">Item</h3>
            <ul class="list-unstyled mb-0">
              <li
                v-for="it in aggregateItems(detail.items)"
                :key="it.id"
                class="border-bottom py-2 d-flex gap-2"
              >
                <img
                  v-if="it.imageUrl"
                  :src="it.imageUrl"
                  alt=""
                  width="48"
                  height="48"
                  class="rounded flex-shrink-0 object-fit-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="rounded flex-shrink-0 d-flex align-items-center justify-content-center bg-label-secondary text-muted"
                  style="width: 48px; height: 48px"
                  aria-hidden="true"
                >
                  <i class="ri-image-line" />
                </div>
                <div class="min-w-0">
                  <div class="fw-semibold">{{ it.productNameSnapshot || it.sellerSku }}</div>
                  <div class="text-muted small">{{ it.sellerSku || it.externalSkuId || '—' }}</div>
                  <div>
                    qty {{ formatQty(it.quantity) }} · {{ formatMoney(it.lineTotalAmount ?? it.saleUnitPrice, detail.currency) }}
                    · mapped {{ it.mappedProductId || '—' }}
                  </div>
                </div>
              </li>
            </ul>
            <p class="text-muted mt-3 mb-0">
              Data dari cache External Order. RetailSale / jurnal tidak berubah.
            </p>
          </div>
        </div>
      </div>
    </div>
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useNuxtApp, useRoute, useRouter } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import ExternalOrderCards from '~/components/commerce/ExternalOrderCards.vue'
import CommerceOrdersFilterCard from '~/components/commerce/CommerceOrdersFilterCard.vue'
import CommerceListPagination from '~/components/commerce/CommerceListPagination.vue'
import type { WorkspaceTab } from '~/types/workspaceTab'
import { readAccessToken } from '~/utils/authCookie'
import { aggregateCommerceLineItems, formatCommerceMoney, formatCommerceQty } from '~/utils/commerceFormat'
import {
  COMMERCE_DEFAULT_PER_PAGE,
  clampCommercePerPage,
} from '~/utils/commercePagination'

const { $api } = useNuxtApp() as any
const route = useRoute()
const router = useRouter()
const { companyId } = useActiveCompany()

const shops = ref<any[]>([])
const orders = ref<any[]>([])
const counts = ref<{ all?: number; buckets?: any[] }>({})
const selectedShopId = ref(String(route.query.shopId || ''))
const statusBucket = ref(String(route.query.statusBucket || ''))
const processingState = ref(String(route.query.processingState || ''))
const q = ref(String(route.query.q || ''))
const dateFrom = ref(String(route.query.dateFrom || ''))
const dateTo = ref(String(route.query.dateTo || ''))
const sort = ref(String(route.query.sort || 'platform_created_at_desc'))
const page = ref(Number(route.query.page || 1) || 1)
const perPage = ref(clampCommercePerPage(route.query.perPage, COMMERCE_DEFAULT_PER_PAGE))
const meta = ref<any>(null)
const loading = ref(false)
const error = ref('')
const detail = ref<any>(null)

const activeStatusTab = computed(() => statusBucket.value || 'all')

const statusTabs = computed<WorkspaceTab[]>(() => [
  { id: 'all', label: 'Semua Pesanan', count: counts.value.all ?? 0 },
  ...(counts.value.buckets || []).map((b: any) => ({
    id: String(b.key),
    label: String(b.label),
    count: Number(b.count ?? 0),
  })),
  { id: 'returns', label: 'Pengembalian' },
])

function onStatusTab(id: string) {
  if (id === 'returns') {
    router.push('/sales/omnichannel/pengembalian')
    return
  }
  statusBucket.value = id === 'all' ? '' : id
  page.value = 1
  reload()
}

function applyFilters() {
  page.value = 1
  reload()
}

function resetFilters() {
  q.value = ''
  selectedShopId.value = ''
  processingState.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sort.value = 'platform_created_at_desc'
  page.value = 1
  reload()
}

function onProcessingChange(v: string) {
  processingState.value = v
  page.value = 1
  reload()
}

function onSortChange(v: string) {
  sort.value = v
  page.value = 1
  reload()
}

function onPageChange(next: number) {
  page.value = next
  reload()
}

function onPerPageChange(next: number) {
  perPage.value = clampCommercePerPage(next)
  page.value = 1
  reload()
}

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

function formatMoney(v: any, c?: string) {
  return formatCommerceMoney(v, c)
}
function formatQty(v: any) {
  return formatCommerceQty(v)
}
function aggregateItems(items: any) {
  return aggregateCommerceLineItems(items)
}

function syncQuery() {
  router.replace({
    query: {
      ...(statusBucket.value ? { statusBucket: statusBucket.value } : {}),
      ...(selectedShopId.value ? { shopId: selectedShopId.value } : {}),
      ...(processingState.value ? { processingState: processingState.value } : {}),
      ...(q.value ? { q: q.value } : {}),
      ...(dateFrom.value ? { dateFrom: dateFrom.value } : {}),
      ...(dateTo.value ? { dateTo: dateTo.value } : {}),
      ...(sort.value !== 'platform_created_at_desc' ? { sort: sort.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
      ...(perPage.value !== COMMERCE_DEFAULT_PER_PAGE ? { perPage: String(perPage.value) } : {}),
    },
  })
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

async function loadCounts() {
  if (!companyId.value) return
  const qs = new URLSearchParams({ perusahaanId: String(companyId.value) })
  if (selectedShopId.value) qs.set('shopId', selectedShopId.value)
  if (q.value) qs.set('q', q.value)
  if (dateFrom.value) qs.set('dateFrom', dateFrom.value)
  if (dateTo.value) qs.set('dateTo', dateTo.value)
  const res = await fetch(`${$api.commerceExternalOrderCounts()}?${qs}`, {
    headers: headers(),
    credentials: 'include',
  })
  const json = await res.json()
  if (res.ok && json.success !== false) counts.value = json.data || {}
}

async function reload() {
  if (!companyId.value) return
  loading.value = true
  error.value = ''
  syncQuery()
  try {
    await loadCounts()
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: String(page.value),
      perPage: String(perPage.value),
      sort: sort.value,
    })
    if (statusBucket.value) qs.set('statusBucket', statusBucket.value)
    if (selectedShopId.value) qs.set('shopId', selectedShopId.value)
    if (processingState.value) qs.set('processingState', processingState.value)
    if (q.value) qs.set('q', q.value)
    if (dateFrom.value) qs.set('dateFrom', dateFrom.value)
    if (dateTo.value) qs.set('dateTo', dateTo.value)
    const res = await fetch(`${$api.commerceExternalOrders()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal memuat order'
      return
    }
    orders.value = json.data || []
    meta.value = json.meta || null
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat order'
  } finally {
    loading.value = false
  }
}

function openDetail(o: any) {
  detail.value = o
}

watch(companyId, async () => {
  page.value = 1
  await loadShops()
  await reload()
})

onMounted(async () => {
  await loadShops()
  await reload()
})
</script>
