<template>
  <OmnichannelShell
    title="Kelola Pengembalian"
    subtitle="Kelola pengembalian di sellercenter, lihat proses pengembalian, dan kembalikan stok produk retur di SkyFlow"
  >
    <CommerceOrdersFilterCard
      title="Pengembalian"
      id-prefix="ret"
      tabs-id-prefix="omni-return-type"
      :tabs="workspaceTypeTabs"
      :active-tab="activeTypeTab"
      :shops="shops"
      :q="q"
      :shop-id="shopId"
      :date-from="dateFrom"
      :date-to="dateTo"
      :sort="sort"
      :busy="loading"
      :show-processing="false"
      search-placeholder="No. pesanan, pengembalian, SKU, produk"
      hint="Refund = snapshot marketplace. Tidak ada restock / RetailReturn otomatis."
      :archived-action="PENGEMBALIAN_ARCHIVED_ACTION"
      :email-action="PENGEMBALIAN_EMAIL_ACTION"
      :download-actions="PENGEMBALIAN_DOWNLOAD_ACTIONS"
      :sort-options="returnSortOptions"
      @update:active-tab="onTypeTab"
      @update:q="q = $event"
      @update:shop-id="shopId = $event"
      @update:date-from="dateFrom = $event"
      @update:date-to="dateTo = $event"
      @update:sort="onSortChange"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div class="card mb-3">
      <div class="card-body py-2">
        <WorkspaceTabs
          id-prefix="omni-return-status"
          embedded
          :tabs="workspaceStatusTabs"
          :model-value="activeStatusTab"
          @update:model-value="onStatusTab"
        />
      </div>
    </div>

    <div
      v-if="replacementWarning"
      class="alert alert-warning small mb-3"
    >
      {{ replacementWarning }}
    </div>

    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>
    <div v-if="loading" class="text-muted small mb-2">Memuat…</div>

    <CommerceListPagination
      compact
      id-prefix="ret-page-top"
      aria-label="Pagination pengembalian (atas)"
      :page="page"
      :per-page="perPage"
      :meta="meta"
      :disabled="loading"
      @update:page="onPageChange"
      @update:per-page="onPerPageChange"
    />

    <ExternalReturnsPanel
      :returns="rows"
      @open-detail="openDetail"
    >
      <template #empty>
        Belum ada kasus aftersales di cache SkyFlow.
        Jalankan sync aftersales di Settings (memerlukan scope Return/Refund TikTok).
      </template>
    </ExternalReturnsPanel>

    <CommerceListPagination
      id-prefix="ret-page"
      aria-label="Pagination pengembalian"
      :page="page"
      :per-page="perPage"
      :meta="meta"
      :disabled="loading"
      @update:page="onPageChange"
      @update:per-page="onPerPageChange"
    />

    <!-- Detail drawer -->
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
            <h2 class="modal-title h5">Detail {{ detail.externalReturnId }}</h2>
            <button type="button" class="btn-close" aria-label="Tutup" @click="detail = null" />
          </div>
          <div class="modal-body small">
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <div class="text-muted">Status SkyFlow</div>
                <div>{{ detail.normalizedStatus }} · raw {{ detail.rawStatus }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-muted">Jenis</div>
                <div>{{ detail.caseType }} ({{ detail.rawType }})</div>
              </div>
              <div class="col-md-6">
                <div class="text-muted">External Order</div>
                <div v-if="detail.linkedExternalOrder">
                  <NuxtLink :to="`/sales/omnichannel/pesanan?q=${detail.linkedExternalOrder.externalOrderId}`">
                    {{ detail.linkedExternalOrder.externalOrderId }}
                  </NuxtLink>
                  · {{ detail.linkedExternalOrder.normalizedStatus }}
                </div>
                <div v-else class="text-muted">{{ detail.externalOrderId || 'Tidak tertaut' }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-muted">Fisik / parsial</div>
                <div>
                  Fisik: {{ detail.hasPhysicalReturn ? 'Ya' : 'Tidak' }} ·
                  Parsial: {{ detail.isPartial ? 'Ya' : 'Tidak' }}
                </div>
              </div>
            </div>

            <h3 class="h6">Item</h3>
            <div v-if="!(detail.items || []).length" class="text-muted mb-3">Tidak ada line item.</div>
            <ul v-else class="list-unstyled mb-3">
              <li v-for="it in aggregateItems(detail.items)" :key="it.id" class="border rounded p-2 mb-2 d-flex gap-2">
                <img
                  v-if="it.imageUrl"
                  :src="it.imageUrl"
                  alt=""
                  width="48"
                  height="48"
                  class="rounded object-fit-cover"
                />
                <div class="min-w-0 flex-grow-1">
                  <div class="fw-semibold text-break">{{ it.productNameSnapshot || '—' }}</div>
                  <div class="text-muted">{{ it.skuNameSnapshot || it.sellerSku || it.externalSkuId || '—' }}</div>
                  <div>
                    Qty {{ displayQty(it.quantity) }} ·
                    {{ formatMoney(it.refundTotalAmount, detail.currency) }}
                  </div>
                </div>
              </li>
            </ul>

            <h3 class="h6">Histori</h3>
            <ul v-if="(detail.events || []).length" class="list-unstyled mb-3">
              <li v-for="ev in detail.events" :key="ev.id" class="border-bottom py-1">
                <span class="fw-semibold">{{ ev.eventKind }}</span>
                {{ ev.fromNormalizedStatus || '—' }} → {{ ev.toNormalizedStatus || '—' }}
                <span class="text-muted">({{ formatTs(ev.occurredAt || ev.createdAt) }})</span>
              </li>
            </ul>
            <p v-else class="text-muted">Belum ada histori status.</p>

            <h3 class="h6">Ketersediaan field</h3>
            <ul class="mb-0">
              <li v-for="(msg, key) in detail.fieldAvailability || {}" :key="key">
                <code>{{ key }}</code>: {{ msg }}
              </li>
            </ul>

            <p class="text-muted mt-3 mb-0">
              {{ detail.provenance?.note }}
              Aksi write (approve/chat/resi) belum aktif —
              {{ detail.actions?.sellerCenterHint }}
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
import ExternalReturnsPanel from '~/components/commerce/ExternalReturnsPanel.vue'
import CommerceOrdersFilterCard from '~/components/commerce/CommerceOrdersFilterCard.vue'
import CommerceListPagination from '~/components/commerce/CommerceListPagination.vue'
import WorkspaceTabs from '~/components/common/WorkspaceTabs.vue'
import type { WorkspaceTab } from '~/types/workspaceTab'
import { readAccessToken } from '~/utils/authCookie'
import { aggregateCommerceLineItems, formatCommerceMoney, formatCommerceQty, formatCommerceTs } from '~/utils/commerceFormat'
import {
  COMMERCE_DEFAULT_PER_PAGE,
  clampCommercePerPage,
} from '~/utils/commercePagination'
import {
  PENGEMBALIAN_ARCHIVED_ACTION,
  PENGEMBALIAN_DOWNLOAD_ACTIONS,
  PENGEMBALIAN_EMAIL_ACTION,
} from '~/utils/commercePesananToolbar'

const { $api } = useNuxtApp() as any
const route = useRoute()
const router = useRouter()
const { companyId } = useActiveCompany()

const shops = ref<any[]>([])
const rows = ref<any[]>([])
const typeCounts = ref<any[]>([])
const statusCounts = ref<any[]>([])
const replacementNotes = ref<any[]>([])
const caseType = ref(String(route.query.caseType || ''))
const normalizedStatus = ref(String(route.query.normalizedStatus || ''))
const shopId = ref(String(route.query.shopId || ''))
const q = ref(String(route.query.q || ''))
const dateFrom = ref(String(route.query.dateFrom || ''))
const dateTo = ref(String(route.query.dateTo || ''))
const sort = ref(String(route.query.sort || 'platform_updated_at_desc'))
const page = ref(Number(route.query.page || 1) || 1)
const perPage = ref(clampCommercePerPage(route.query.perPage, COMMERCE_DEFAULT_PER_PAGE))
const meta = ref<any>(null)
const loading = ref(false)
const error = ref('')
const detail = ref<any>(null)

const activeTypeTab = computed(() => caseType.value || 'all')
const activeStatusTab = computed(() => normalizedStatus.value || 'all')

const workspaceTypeTabs = computed<WorkspaceTab[]>(() => [
  { id: 'all', label: 'Semua' },
  ...typeCounts.value.map((t: any) => ({
    id: String(t.caseType),
    label: String(t.label),
    count: String(t.countSemantics || '').startsWith('ZERO_MAY')
      ? null
      : Number(t.count ?? 0),
  })),
])

const workspaceStatusTabs = computed<WorkspaceTab[]>(() => [
  { id: 'all', label: 'Semua status' },
  ...statusCounts.value.map((s: any) => ({
    id: String(s.normalizedStatus),
    label: String(s.label),
    count: Number(s.count ?? 0),
  })),
])

const returnSortOptions = [
  { value: 'platform_updated_at_desc', label: 'Terbaru diubah' },
  { value: 'platform_created_at_desc', label: 'Terbaru dibuat' },
  { value: 'platform_created_at_asc', label: 'Terlama dibuat' },
  { value: 'refund_total_desc', label: 'Refund tertinggi' },
  { value: 'refund_total_asc', label: 'Refund terendah' },
]

const replacementWarning = computed(() => {
  if (caseType.value !== 'REPLACEMENT') return ''
  const notes = replacementNotes.value || []
  const unverified = notes.find(
    (n: any) =>
      n.replacement?.status === 'UNVERIFIED_FOR_ID_MARKET' ||
      n.replacement?.status === 'UNVERIFIED' ||
      n.replacement?.status === 'UNSUPPORTED'
  )
  if (unverified) {
    return (
      unverified.replacement?.message ||
      'Penggantian belum terverifikasi untuk shop terhubung. Angka nol tidak berarti sync aktif.'
    )
  }
  return ''
})

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
function formatTs(v: any) {
  return formatCommerceTs(v)
}
function displayQty(v: any) {
  return formatCommerceQty(v)
}
function aggregateItems(items: any) {
  return aggregateCommerceLineItems(items)
}

function syncQuery() {
  router.replace({
    query: {
      ...(caseType.value ? { caseType: caseType.value } : {}),
      ...(normalizedStatus.value ? { normalizedStatus: normalizedStatus.value } : {}),
      ...(shopId.value ? { shopId: shopId.value } : {}),
      ...(q.value ? { q: q.value } : {}),
      ...(dateFrom.value ? { dateFrom: dateFrom.value } : {}),
      ...(dateTo.value ? { dateTo: dateTo.value } : {}),
      ...(sort.value !== 'platform_updated_at_desc' ? { sort: sort.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
      ...(perPage.value !== COMMERCE_DEFAULT_PER_PAGE ? { perPage: String(perPage.value) } : {}),
    },
  })
}

function onTypeTab(id: string) {
  caseType.value = id === 'all' ? '' : id
  page.value = 1
  reload()
}

function onStatusTab(id: string) {
  normalizedStatus.value = id === 'all' ? '' : id
  page.value = 1
  reload()
}

function applyFilters() {
  page.value = 1
  reload()
}

function resetFilters() {
  q.value = ''
  shopId.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sort.value = 'platform_updated_at_desc'
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
  if (shopId.value) qs.set('shopId', shopId.value)
  if (dateFrom.value) qs.set('dateFrom', dateFrom.value)
  if (dateTo.value) qs.set('dateTo', dateTo.value)
  if (q.value) qs.set('q', q.value)
  const res = await fetch(`${$api.commerceExternalReturnCounts()}?${qs}`, {
    headers: headers(),
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || json.success === false) return
  typeCounts.value = (json.data?.byType || []).filter(
    (t: any) => t.caseType !== 'UNKNOWN' || Number(t.count) > 0
  )
  statusCounts.value = (json.data?.byStatus || []).filter(
    (s: any) => s.normalizedStatus !== 'UNKNOWN' || Number(s.count) > 0
  )
  replacementNotes.value = json.data?.replacementNotes || []
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
    if (caseType.value) qs.set('caseType', caseType.value)
    if (normalizedStatus.value) qs.set('normalizedStatus', normalizedStatus.value)
    if (shopId.value) qs.set('shopId', shopId.value)
    if (q.value) qs.set('q', q.value)
    if (dateFrom.value) qs.set('dateFrom', dateFrom.value)
    if (dateTo.value) qs.set('dateTo', dateTo.value)
    const res = await fetch(`${$api.commerceExternalReturns()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal memuat pengembalian'
      return
    }
    rows.value = json.data || []
    meta.value = json.meta || null
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat pengembalian'
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  if (!companyId.value) return
  const qs = new URLSearchParams({ perusahaanId: String(companyId.value) })
  const res = await fetch(`${$api.commerceExternalReturnDetail(id)}?${qs}`, {
    headers: headers(),
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || json.success === false) {
    error.value = json.message || 'Gagal memuat detail'
    return
  }
  detail.value = json.data
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
