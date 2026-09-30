<template>
  <OmnichannelShell
    title="Kelola Pesanan"
    subtitle="Pesanan marketplace — reserve → pick/pack → atur pengiriman → label → serah kurir (stok)"
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

    <div v-if="actionMsg" class="alert alert-info small text-break mb-3">{{ actionMsg }}</div>
    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>
    <div v-if="loading" class="text-muted small mb-2">Memuat…</div>

    <div
      v-if="selectedIds.length || bulkResults"
      class="card mb-3"
    >
      <div class="card-body py-2">
        <div class="d-flex flex-wrap align-items-center gap-2 justify-content-between">
          <div class="small">
            <span v-if="selectedIds.length">{{ selectedIds.length }} pesanan dipilih</span>
            <span v-else class="text-muted">Tidak ada pilihan</span>
            <span class="text-muted"> — hanya yang eligible atur pengiriman</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              :disabled="!selectedIds.length || actionBusy"
              @click="selectedIds = []"
            >
              Bersihkan
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              :disabled="!selectedIds.length || actionBusy"
              :title="selectedIds.length ? 'Atur pengiriman untuk pilihan' : 'Pilih pesanan dulu'"
              @click="() => runBulkArrange()"
            >
              {{ actionBusy ? 'Memproses…' : 'Bulk Atur Pengiriman' }}
            </button>
            <button
              v-if="retryableBulkIds.length"
              type="button"
              class="btn btn-sm btn-warning"
              :disabled="actionBusy"
              title="Retry hanya item gagal/ambigu — sukses tidak diulang"
              @click="retryFailedBulk"
            >
              Retry gagal/ambigu ({{ retryableBulkIds.length }})
            </button>
          </div>
        </div>

        <div v-if="bulkResults" class="table-responsive mt-3">
          <div class="small mb-2">
            Hasil batch: {{ bulkResults.success }} sukses ·
            {{ bulkResults.ambiguous || 0 }} ambigu ·
            {{ bulkResults.failed }} gagal
            <span v-if="!bulkResults.allSucceeded" class="text-danger">
              — HTTP OK ≠ seluruh batch berhasil
            </span>
          </div>
          <table class="table table-sm table-bordered mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Alasan / catatan</th>
                <th>Tindakan lanjut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in bulkResults.results || []" :key="r.orderId">
                <td class="font-monospace small">{{ orderLabel(r.orderId) }}</td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-success': r.status === 'SUCCESS',
                      'bg-warning text-dark': r.status === 'AMBIGUOUS',
                      'bg-danger': r.status === 'FAILED',
                      'bg-secondary': r.status === 'SKIPPED',
                    }"
                  >{{ r.status }}</span>
                </td>
                <td class="small text-break">{{ r.error || r.nextAction || '—' }}</td>
                <td class="small text-break">{{ r.nextAction || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CommerceListPagination
      compact
      id-prefix="pesanan-page-top"
      aria-label="Pagination pesanan (atas)"
      :page="page"
      :per-page="perPage"
      :meta="meta"
      :disabled="loading || actionBusy"
      @update:page="onPageChange"
      @update:per-page="onPerPageChange"
    />

    <ExternalOrderCards
      :orders="orders"
      :busy="actionBusy"
      selectable
      :selected-ids="selectedIds"
      @update:selected-ids="selectedIds = $event"
      @open-detail="openDetail"
      @action="onOrderAction"
    >
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

            <h3 class="h6">Money snapshot (transaction)</h3>
            <div class="row g-2 mb-2">
              <div class="col-6 col-md-3">
                <div class="text-muted">Merchandise</div>
                <div>{{ formatMoney(detail.subtotalAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Diskon seller</div>
                <div>{{ formatMoney(detail.sellerDiscountAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Diskon platform</div>
                <div>{{ formatMoney(detail.platformDiscountAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Ongkir</div>
                <div>{{ formatMoney(detail.shippingFeeAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Pajak</div>
                <div>{{ formatMoney(detail.taxAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Pembayaran pembeli</div>
                <div class="fw-semibold">{{ formatMoney(detail.totalAmount, detail.currency) }}</div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-muted">Refund</div>
                <div>{{ formatMoney(detail.refundAmount, detail.currency) }}</div>
              </div>
            </div>

            <div
              class="alert small py-2 mb-3"
              :class="reconciliation.status === 'MATCH' ? 'alert-success' : reconciliation.status === 'MISMATCH' ? 'alert-danger' : 'alert-secondary'"
            >
              <strong>Rekonsiliasi:</strong>
              <template v-if="reconciliation.status === 'MATCH'">
                Cocok — merchandise − diskon + ongkir + pajak = pembayaran pembeli.
              </template>
              <template v-else-if="reconciliation.status === 'MISMATCH'">
                Tidak cocok — selisih {{ formatMoney(reconciliation.difference, detail.currency) }}
                (hitungan {{ formatMoney(reconciliation.expectedTotal, detail.currency) }} vs
                pembayaran {{ formatMoney(reconciliation.actualTotal, detail.currency) }}).
              </template>
              <template v-else>
                Belum bisa direkonsiliasi — field belum lengkap dari platform ({{ reconciliation.missingFields.join(', ') }}).
              </template>
            </div>

            <h3 class="h6">Status Rilis &amp; Accounting</h3>
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span class="badge" :class="accountingBadge.badgeClass">{{ accountingBadge.label }}</span>
              <span v-if="detail.retailSaleId" class="badge bg-label-info font-monospace">
                RetailSale: {{ detail.retailSaleId }}
              </span>
              <span v-if="detail.accountingSummary" class="text-muted">{{ detail.accountingSummary }}</span>
            </div>

            <div v-if="releasePreview" class="mb-2">
              <div v-if="releasePreview.blockerCodes?.length" class="alert alert-warning small py-2 mb-2">
                <strong>Blokir rilis:</strong>
                <ul class="mb-0 ps-3">
                  <li v-for="code in releasePreview.blockerCodes" :key="code">
                    {{ blockerLabel(code) }} <span class="text-muted">({{ code }})</span>
                  </li>
                </ul>
              </div>
              <div v-else class="alert alert-success small py-2 mb-2">
                Order eligible untuk dirilis. Accounting tetap mengikuti kebijakan yang berlaku
                (bisa pending sampai syarat/settlement terpenuhi).
              </div>
            </div>
            <div v-if="releaseError" class="alert alert-secondary small py-2 mb-2 text-break">
              {{ releaseError }}
            </div>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                :disabled="releaseBusy"
                @click="previewRelease(detail)"
              >
                {{ releaseBusy && releaseStep === 'preview' ? 'Memeriksa…' : 'Cek Kelayakan Rilis' }}
              </button>
              <button
                v-if="releasePreview && !releasePreview.blockerCodes?.length"
                type="button"
                class="btn btn-sm btn-primary"
                :disabled="releaseBusy"
                @click="confirmRelease(detail)"
              >
                {{ releaseBusy && releaseStep === 'confirm' ? 'Memproses…' : 'Konfirmasi Rilis' }}
              </button>
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
                  <div
                    v-if="it.originalUnitPrice != null && Number(it.originalUnitPrice) !== Number(it.saleUnitPrice)"
                    class="text-muted small"
                  >
                    Harga listing: {{ formatMoney(it.originalUnitPrice, detail.currency) }}
                    (transaksi {{ formatMoney(it.saleUnitPrice, detail.currency) }})
                  </div>
                </div>
              </li>
            </ul>
            <p class="text-muted mt-3 mb-0">
              Data dari cache External Order. COGS / settlement belum ditampilkan di sini —
              lihat RetailSale terkait untuk rincian tersebut bila sudah dirilis.
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
import { COMMERCE_BULK_ARRANGE_MAX } from '~/utils/commerceBulkSelect'
import { reconcileCommerceOrderMoney } from '~/utils/commerceMoneyReconciliation'
import { commerceAccountingBadgeMeta, commerceReleaseBlockerLabel } from '~/utils/commerceAccountingStatus'

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
const actionMsg = ref('')
const actionBusy = ref(false)
const detail = ref<any>(null)
const selectedIds = ref<string[]>([])
const bulkResults = ref<any>(null)

const retryableBulkIds = computed(() =>
  (bulkResults.value?.results || [])
    .filter((r: any) => r.status === 'FAILED' || r.status === 'AMBIGUOUS')
    .map((r: any) => String(r.orderId))
)

function orderLabel(id: string) {
  const o = orders.value.find((x) => String(x.id) === String(id))
  return o?.externalOrderId || id
}

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

function clearBulkSelection() {
  selectedIds.value = []
}

function onStatusTab(id: string) {
  if (id === 'returns') {
    router.push('/sales/omnichannel/pengembalian')
    return
  }
  statusBucket.value = id === 'all' ? '' : id
  page.value = 1
  clearBulkSelection()
  reload()
}

function applyFilters() {
  page.value = 1
  clearBulkSelection()
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
  clearBulkSelection()
  reload()
}

function onProcessingChange(v: string) {
  processingState.value = v
  page.value = 1
  clearBulkSelection()
  reload()
}

function onSortChange(v: string) {
  sort.value = v
  page.value = 1
  clearBulkSelection()
  reload()
}

function onPageChange(next: number) {
  page.value = next
  clearBulkSelection()
  reload()
}

function onPerPageChange(next: number) {
  perPage.value = clampCommercePerPage(next)
  page.value = 1
  clearBulkSelection()
  reload()
}

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) {
    h['X-Company-Id'] = String(companyId.value)
    h['X-Active-Company-Id'] = String(companyId.value)
  }
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
  releasePreview.value = null
  releaseError.value = ''
}

const reconciliation = computed(() => (detail.value ? reconcileCommerceOrderMoney(detail.value) : null))
const accountingBadge = computed(() =>
  detail.value
    ? commerceAccountingBadgeMeta({
        stockIssuedAt: detail.value.stockIssuedAt,
        accountingStatus: detail.value.accountingStatus,
        releaseBlockerCodes: releasePreview.value?.blockerCodes || null,
      })
    : { key: 'NOT_APPLICABLE', label: '—', badgeClass: 'bg-label-secondary' }
)

function blockerLabel(code: string) {
  return commerceReleaseBlockerLabel(code)
}

const releaseBusy = ref(false)
const releaseStep = ref<'preview' | 'confirm' | null>(null)
const releasePreview = ref<{ allowed: boolean; blockerCodes: string[]; reasons: string[] } | null>(null)
const releaseError = ref('')

/**
 * Release preview/execute — POST /commerce/external-orders/:id/release
 * Body: { execute?: boolean, idempotencyKey?: uuid }
 */
async function previewRelease(order: any) {
  if (releaseBusy.value) return
  releaseBusy.value = true
  releaseStep.value = 'preview'
  releaseError.value = ''
  releasePreview.value = null
  try {
    const json = await postJson($api.commerceExternalOrderRelease(order.id), { execute: false })
    const gate = json.data?.gate || {}
    releasePreview.value = {
      allowed: Boolean(json.data?.allowed ?? gate.allowed),
      blockerCodes: gate.blockerCodes || json.data?.blockerCodes || [],
      reasons: gate.reasons || json.data?.reasons || [],
    }
  } catch (e: any) {
    releaseError.value = e?.message || 'Pratinjau rilis gagal.'
  } finally {
    releaseBusy.value = false
    releaseStep.value = null
  }
}

async function confirmRelease(order: any) {
  if (releaseBusy.value || !releasePreview.value || releasePreview.value.blockerCodes.length) return
  releaseBusy.value = true
  releaseStep.value = 'confirm'
  releaseError.value = ''
  try {
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-0000-4000-8000-${String(Math.floor(Math.random() * 1e12)).padStart(12, '0')}`
    const json = await postJson($api.commerceExternalOrderRelease(order.id), {
      execute: true,
      idempotencyKey,
    })
    const accountingComplete = Boolean(json?.data?.accountingComplete)
    const revenueStatus = json?.data?.revenue?.status
    actionMsg.value = accountingComplete
      ? `Rilis + accounting posted: ${order.externalOrderId}`
      : `Rilis OK (RetailSale ${json?.data?.retailSaleId || 'terbentuk'}); accounting ${
          revenueStatus || 'pending'
        } — jangan anggap selesai penuh: ${order.externalOrderId}`
    releasePreview.value = null
    await reload()
    if (detail.value?.id === order.id) detail.value = null
  } catch (e: any) {
    releaseError.value = e?.message || 'Konfirmasi rilis gagal.'
  } finally {
    releaseBusy.value = false
    releaseStep.value = null
  }
}

async function postJson(url: string, body?: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json', 'Idempotency-Key': `${Date.now()}` },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    const code = json?.data?.code || json?.code
    const detail =
      typeof json?.data?.availableQty === 'number' && typeof json?.data?.requested === 'number'
        ? ` (available ${json.data.availableQty}/${json.data.requested})`
        : ''
    throw new Error(
      [json.message || `Gagal (${res.status})`, code ? `[${code}]` : '', detail].filter(Boolean).join(' ')
    )
  }
  return json
}

async function runBulkArrange(ids?: string[]) {
  const orderIds = (ids || selectedIds.value).slice(0, COMMERCE_BULK_ARRANGE_MAX)
  if (!orderIds.length || actionBusy.value) return
  actionBusy.value = true
  actionMsg.value = ''
  error.value = ''
  try {
    const json = await postJson($api.commerceExternalOrderArrangeShipmentBulk(), {
      orderIds,
      handoverMethod: 'PICKUP',
    })
    bulkResults.value = json.data
    const d = json.data || {}
    if (d.allSucceeded) {
      actionMsg.value = `Bulk arrange: ${d.success}/${d.total} sukses.`
      selectedIds.value = []
    } else {
      error.value = `Bulk arrange selesai sebagian: ${d.success} sukses, ${d.ambiguous || 0} ambigu, ${d.failed} gagal. Cek tabel hasil — jangan anggap seluruh batch berhasil.`
      // Keep only non-success selected for clarity
      selectedIds.value = (d.results || [])
        .filter((r: any) => r.status !== 'SUCCESS')
        .map((r: any) => String(r.orderId))
    }
    await reload()
  } catch (e: any) {
    error.value = e?.message || 'Bulk arrange gagal'
  } finally {
    actionBusy.value = false
  }
}

async function retryFailedBulk() {
  if (!retryableBulkIds.value.length) return
  // AMBIGUOUS should reconcile first — only auto-retry FAILED here; AMBIGUOUS stays listed with nextAction
  const failedOnly = (bulkResults.value?.results || [])
    .filter((r: any) => r.status === 'FAILED')
    .map((r: any) => String(r.orderId))
  if (!failedOnly.length) {
    error.value =
      'Item tersisa AMBIGUOUS — jalankan reconcile-ship per pesanan sebelum retry atur pengiriman.'
    return
  }
  await runBulkArrange(failedOnly)
}

async function onOrderAction(payload: { key: string; order: any }) {
  if (actionBusy.value) return
  const { key, order } = payload
  if (!order?.id) return
  actionBusy.value = true
  actionMsg.value = ''
  error.value = ''
  try {
    if (key === 'reserveStock') {
      await postJson($api.commerceExternalOrderReserve(order.id))
      actionMsg.value = `Reservasi stok OK untuk ${order.externalOrderId}`
    } else if (key === 'markPicked') {
      await postJson($api.commerceExternalOrderMarkPicked(order.id))
      actionMsg.value = `Picking dicatat: ${order.externalOrderId}`
    } else if (key === 'markPacked') {
      await postJson($api.commerceExternalOrderMarkPacked(order.id))
      actionMsg.value = `Packing dicatat: ${order.externalOrderId}`
    } else if (key === 'printPickingList' || key === 'printPackingList') {
      const kind = key === 'printPickingList' ? 'picking' : 'packing'
      const url = $api.commerceFulfillmentPrintDoc(order.id, kind)
      window.open(url, '_blank', 'noopener')
      actionMsg.value = `${kind} list dibuka di tab cetak.`
      return
    } else if (key === 'confirmHandover') {
      const res = await postJson($api.commerceExternalOrderConfirmHandover(order.id))
      const acct = res?.data?.accounting || res?.accounting
      actionMsg.value = acct?.allPosted
        ? `Serah kurir + stok + accounting OK: ${order.externalOrderId}`
        : `Serah kurir + stok OK; accounting pending — gunakan Retry Accounting bila perlu: ${order.externalOrderId}`
    } else if (key === 'retryAccounting') {
      const res = await postJson($api.commerceExternalOrderRetryAccounting(order.id))
      const allPosted = res?.data?.allPosted ?? res?.allPosted
      actionMsg.value = allPosted
        ? `Retry accounting posted: ${order.externalOrderId}`
        : `Retry accounting dijalankan (cek status pending): ${order.externalOrderId}`
    } else if (key === 'cancelFulfillOps') {
      const mpActive = String(order.normalizedStatus || '') !== 'CANCELLED'
      if (mpActive) {
        const ok = window.confirm(
          `Lepas reservation lokal untuk ${order.externalOrderId}?\n\nIni BUKAN pembatalan TikTok. Order marketplace masih aktif. Lanjutkan hanya jika Anda sengaja melepas stok lokal (confirmLocalOnly).`
        )
        if (!ok) {
          actionMsg.value = 'Dibatalkan — reservation tidak diubah.'
          return
        }
      }
      await postJson($api.commerceExternalOrderReleaseReservation(order.id), {
        reason: 'cancel_before_handover_ui',
        confirmLocalOnly: mpActive,
      })
      actionMsg.value = `Ops lokal dibatalkan / reservasi dilepas: ${order.externalOrderId}`
    } else if (key === 'cancelOrder') {
      const reason =
        window.prompt(
          'Alasan seller cancel TikTok (kunci resmi).\nContoh: seller_cancel_reason_out_of_stock',
          'seller_cancel_reason_out_of_stock'
        ) || ''
      if (!reason.trim()) {
        actionMsg.value = 'Seller cancel dibatalkan — alasan wajib.'
        return
      }
      const ok = window.confirm(
        `Kirim seller cancel ke TikTok untuk ${order.externalOrderId}?\nAlasan: ${reason}\nReservation lokal hanya dilepas setelah status CANCELLED terverifikasi.`
      )
      if (!ok) return
      const res = await postJson($api.commerceExternalOrderSellerCancel(order.id), {
        cancelReason: reason.trim(),
        idempotencyKey: `ui-cancel-${order.id}-${Date.now()}`,
      })
      actionMsg.value =
        res?.data?.note ||
        res?.message ||
        `Seller cancel dikirim: ${order.externalOrderId} (${res?.data?.normalizedStatus || ''})`
    } else if (key === 'printShippingLabel') {
      const res = await fetch($api.commerceExternalOrderShippingLabel(order.id), {
        headers: headers(),
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal ambil label')
      const docUrl = json.data?.docUrl
      if (docUrl) window.open(docUrl, '_blank', 'noopener')
      else actionMsg.value = 'Label berhasil dipanggil tetapi docUrl kosong dari platform.'
      if (docUrl) actionMsg.value = `Label dibuka untuk ${order.externalOrderId}`
    } else if (key === 'arrangeShipment') {
      // Prefer first available pickup slot when present
      let pickupSlot: { startTime: number; endTime: number } | null = null
      let handoverMethod: string = 'PICKUP'
      try {
        const slotRes = await fetch($api.commerceExternalOrderHandoverSlots(order.id), {
          headers: headers(),
          credentials: 'include',
        })
        const slotJson = await slotRes.json()
        if (slotRes.ok && slotJson.success !== false) {
          const slots = slotJson.data?.pickupSlots || []
          const available = slots.find((s: any) => s.available !== false) || slots[0]
          if (available) {
            pickupSlot = { startTime: Number(available.startTime), endTime: Number(available.endTime) }
          }
          const methods = slotJson.data?.handoverMethods || []
          if (methods.includes('PICKUP')) handoverMethod = 'PICKUP'
          else if (methods[0]) handoverMethod = methods[0]
        }
      } catch {
        /* continue with PICKUP default — platform may not require slots */
      }
      await postJson($api.commerceExternalOrderArrangeShipment(order.id), {
        handoverMethod,
        ...(pickupSlot ? { pickupSlot } : {}),
        packageId: order.packageIds?.[0] || order.fulfillOpsMeta?.lastShipPackageId || null,
      })
      actionMsg.value = `Atur pengiriman OK (stok belum keluar): ${order.externalOrderId}`
    } else {
      actionMsg.value = `Aksi ${key} belum dihubungkan di UI.`
    }
    await reload()
  } catch (e: any) {
    error.value = e?.message || 'Aksi gagal'
  } finally {
    actionBusy.value = false
  }
}

watch(companyId, async () => {
  page.value = 1
  clearBulkSelection()
  bulkResults.value = null
  await loadShops()
  await reload()
})

onMounted(async () => {
  await loadShops()
  await reload()
})
</script>
