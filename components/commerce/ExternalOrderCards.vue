<template>
  <div class="commerce-order-cards">
    <div v-if="empty" class="card mb-3">
      <div class="card-header">
        <h5 class="mb-0">Pesanan marketplace</h5>
      </div>
      <div class="card-body mt-3">
        <div class="alert alert-secondary small mb-0">
          <slot name="empty">Belum ada External Order.</slot>
        </div>
      </div>
    </div>

    <div
      v-if="selectable && !empty"
      class="card mb-3 border-0 bg-label-secondary"
    >
      <div class="card-body py-2">
        <div class="d-flex flex-wrap align-items-center gap-2 justify-content-between">
          <div class="form-check mb-0 d-flex align-items-center gap-2">
            <input
              id="commerce-order-select-all"
              class="form-check-input"
              type="checkbox"
              :checked="pageSelect.allEligibleSelected"
              :indeterminate.prop="pageSelect.indeterminate"
              :disabled="busy || pageSelect.noneEligible"
              :title="selectAllTitle"
              :aria-label="selectAllTitle"
              @change="onToggleSelectAll(($event.target as HTMLInputElement).checked)"
            />
            <label class="form-check-label small mb-0" for="commerce-order-select-all">
              Pilih semua
              <span class="text-muted">
                ({{ pageSelect.eligibleCount }} eligible di halaman ini
                <template v-if="pageSelect.selectedEligibleCount">
                  · {{ pageSelect.selectedEligibleCount }} dipilih
                </template>
                )
              </span>
            </label>
          </div>
          <div class="small text-muted">
            Hanya pesanan yang siap Atur Pengiriman. Maks {{ bulkMax }} / batch.
          </div>
        </div>
      </div>
    </div>

    <div v-for="o in orders" :key="o.id" class="card mb-3">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div class="d-flex align-items-start gap-2 min-w-0">
          <input
            v-if="selectable"
            class="form-check-input mt-1 flex-shrink-0"
            type="checkbox"
            :checked="isSelected(o.id)"
            :disabled="busy || !canBulkSelect(o) || (selected.size >= bulkMax && !isSelected(o.id))"
            :title="rowSelectTitle(o)"
            :aria-label="`Pilih ${o.externalOrderId}`"
            @change="toggleSelect(o, ($event.target as HTMLInputElement).checked)"
          />
          <div class="min-w-0">
            <h5 class="mb-1 text-break">
              <span class="badge me-2" :class="commerceStatusBadge(o.normalizedStatus)">
                {{ commerceEnumLabel(o.statusLabel || o.normalizedStatus) }}
              </span>
              <span class="font-monospace">{{ o.externalOrderId }}</span>
            </h5>
            <p class="mb-0 card-subtitle text-muted small mt-3">
              {{ o.shop?.name || commercePlatformLabel(o.platformCode) }}
              · {{ commercePlatformLabel(o.platformCode) }}
              · {{ commerceEnumLabel(o.fulfillmentType, '—') }}
              <template v-if="o.logistics?.actionDeadlineAt">
                · SLA {{ formatTs(o.logistics.actionDeadlineAt) }}
              </template>
            </p>
          </div>
        </div>
        <div class="small text-muted text-md-end">
          <div>{{ formatTs(o.platformCreatedAt) }}</div>
          <span class="badge mt-3" :class="commerceStatusBadge(o.processingState)">
            {{ commerceEnumLabel(o.processingState) }}
          </span>
        </div>
      </div>

      <div class="card-body mt-3">
        <div class="row g-3">
          <div class="col-md-6 col-xl-4 mt-3">
            <h6 class="mb-2">Produk</h6>
            <div v-if="!(o.items || []).length" class="alert alert-secondary small mb-0 py-2">
              Tidak ada item.
            </div>
            <ul v-else class="list-unstyled mb-0 small">
              <li
                v-for="it in displayItems(o).slice(0, 4)"
                :key="it.id"
                class="border rounded p-2 mb-2 d-flex gap-2"
              >
                <img
                  v-if="it.imageUrl"
                  :src="it.imageUrl"
                  alt=""
                  width="48"
                  height="48"
                  class="rounded flex-shrink-0 object-fit-cover"
                  loading="lazy"
                  @error="onImageError"
                />
                <div
                  v-else
                  class="rounded flex-shrink-0 d-flex align-items-center justify-content-center bg-label-secondary text-muted"
                  style="width: 48px; height: 48px"
                  aria-hidden="true"
                >
                  <i class="ri-image-line" />
                </div>
                <div class="min-w-0 flex-grow-1">
                  <div class="fw-semibold text-break">{{ it.productNameSnapshot || '—' }}</div>
                  <div class="text-muted">{{ it.sellerSku || it.externalSkuId || '—' }}</div>
                  <div>
                    Qty {{ formatQty(it.quantity) }} × {{ formatMoney(it.saleUnitPrice, o.currency) }}
                  </div>
                </div>
              </li>
            </ul>
            <p v-if="displayItems(o).length > 4" class="small text-muted mb-0">
              +{{ displayItems(o).length - 4 }} produk lain
            </p>
          </div>

          <div class="col-md-6 col-xl-4 mt-3">
            <h6 class="mb-2">Ringkasan</h6>
            <dl class="row small mb-0">
              <dt class="col-5 text-muted">Total qty</dt>
              <dd class="col-7">{{ formatQty(o.totalQty ?? o.itemCount ?? 0) }}</dd>
              <dt class="col-5 text-muted">Total harga</dt>
              <dd class="col-7 fw-semibold">{{ formatMoney(o.totalAmount, o.currency) }}</dd>
              <dt class="col-5 text-muted">Pembayaran</dt>
              <dd class="col-7">{{ commerceEnumLabel(o.logistics?.paymentMethod) }}</dd>
              <dt class="col-5 text-muted">Catatan pembeli</dt>
              <dd class="col-7">
                {{ emptyField(o.logistics?.buyerNote, o.logistics?.fieldAvailability?.buyerNote) }}
              </dd>
              <dt class="col-5 text-muted">Catatan seller</dt>
              <dd class="col-7">
                {{ emptyField(o.logistics?.sellerNote, o.logistics?.fieldAvailability?.sellerNote) }}
              </dd>
            </dl>
          </div>

          <div class="col-md-12 col-xl-4 mt-3">
            <h6 class="mb-2">Pengiriman</h6>
            <dl class="row small mb-0">
              <dt class="col-5 text-muted">Pembeli</dt>
              <dd class="col-7">{{ o.logistics?.buyerDisplay || '—' }}</dd>
              <dt class="col-5 text-muted">Alamat</dt>
              <dd class="col-7 text-break">
                {{ emptyField(o.logistics?.addressDisplay, o.logistics?.fieldAvailability?.address) }}
              </dd>
              <dt class="col-5 text-muted">Kurir</dt>
              <dd class="col-7">
                {{ emptyField(o.logistics?.courier, o.logistics?.fieldAvailability?.courier) }}
              </dd>
              <dt class="col-5 text-muted">Resi</dt>
              <dd class="col-7 font-monospace text-break">
                {{
                  emptyField(
                    o.logistics?.trackingNumber,
                    o.logistics?.fieldAvailability?.trackingNumber
                  )
                }}
              </dd>
              <dt class="col-5 text-muted">Warehouse</dt>
              <dd class="col-7 text-break">
                {{
                  o.logistics?.warehouseName ||
                  o.logistics?.warehouseId ||
                  emptyField(null, o.logistics?.fieldAvailability?.warehouse)
                }}
              </dd>
              <dt class="col-5 text-muted">Ops fulfill</dt>
              <dd class="col-7">
                <span class="badge" :class="opsBadge(o)">{{ commerceEnumLabel(o.fulfillOpsStatus, 'NONE') }}</span>
              </dd>
              <dt class="col-5 text-muted">Accounting</dt>
              <dd class="col-7">
                <span class="badge" :class="accountingBadge(o).badgeClass">
                  {{ accountingBadge(o).label }}
                </span>
                <span
                  v-if="o.accountingSummary"
                  class="d-block text-muted small mt-1 text-break"
                  :title="o.accountingSummary"
                >{{ o.accountingSummary }}</span>
              </dd>
              <template v-if="o.retailSaleId">
                <dt class="col-5 text-muted">RetailSale</dt>
                <dd class="col-7 font-monospace small text-break">{{ o.retailSaleId }}</dd>
              </template>
              <dt class="col-5 text-muted">Sync</dt>
              <dd class="col-7">{{ formatTs(o.lastSyncedAt || o.importedAt) }}</dd>
            </dl>
          </div>
        </div>

        <ExternalOrderCardFooter
          :actions="o.actions"
          :busy="Boolean(busy) || busyOrderId === o.id"
          :busy-action="busyOrderId === o.id ? busyAction : null"
          @open-detail="emit('open-detail', o)"
          @action="(key) => emit('action', { key, order: o })"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExternalOrderCardFooter from '~/components/commerce/ExternalOrderCardFooter.vue'
import { COMMERCE_BULK_ARRANGE_MAX, commerceBulkSelectReason, isCommerceOrderBulkSelectable, resolvePageBulkSelectState, toggleOrderSelection, toggleSelectAllOnPage } from '~/utils/commerceBulkSelect'
import { aggregateCommerceLineItems, commerceStatusBadge, formatCommerceMoney, formatCommerceQty, formatCommerceTs, commerceEnumLabel } from '~/utils/commerceFormat'
import { commercePlatformLabel } from '~/utils/commercePlatform'
import { commerceAccountingBadgeMeta } from '~/utils/commerceAccountingStatus'

const emit = defineEmits<{
  'open-detail': [order: any]
  action: [payload: { key: string; order: any }]
  'update:selected-ids': [ids: string[]]
}>()

const props = withDefaults(
  defineProps<{
    orders: any[]
    /** Global busy (e.g. bulk) — disables selection across cards */
    busy?: boolean
    /** Per-order action loading */
    busyOrderId?: string | null
    busyAction?: string | null
    selectable?: boolean
    selectedIds?: string[]
    bulkMax?: number
  }>(),
  {
    busy: false,
    busyOrderId: null,
    busyAction: null,
    selectable: false,
    selectedIds: () => [],
    bulkMax: COMMERCE_BULK_ARRANGE_MAX}
)

const busy = computed(() => Boolean(props.busy))
const busyOrderId = computed(() => props.busyOrderId || null)
const busyAction = computed(() => props.busyAction || null)
const empty = computed(() => !props.orders?.length)
const bulkMax = computed(() =>
  Math.max(1, Math.min(COMMERCE_BULK_ARRANGE_MAX, Number(props.bulkMax) || COMMERCE_BULK_ARRANGE_MAX))
)
const selected = computed(() => new Set((props.selectedIds || []).map(String)))
const pageSelect = computed(() =>
  resolvePageBulkSelectState({
    orders: props.orders,
    selectedIds: props.selectedIds,
    max: bulkMax.value})
)

const selectAllTitle = computed(() => {
  if (pageSelect.value.noneEligible) {
    return 'Tidak ada pesanan eligible Atur Pengiriman di halaman ini (reservasi stok dulu).'
  }
  if (pageSelect.value.allEligibleSelected) {
    return 'Batalkan pilihan semua di halaman ini'
  }
  return `Pilih semua ${pageSelect.value.eligibleCount} pesanan eligible di halaman ini`
})

function isSelected(id: string) {
  return selected.value.has(String(id))
}

function canBulkSelect(o: any) {
  return isCommerceOrderBulkSelectable(o)
}

function rowSelectTitle(o: any) {
  if (!canBulkSelect(o)) return commerceBulkSelectReason(o)
  if (selected.value.size >= bulkMax.value && !isSelected(o.id)) {
    return `Maksimal ${bulkMax.value} pesanan per batch bulk.`
  }
  return 'Pilih untuk bulk atur pengiriman'
}

function onToggleSelectAll(checked: boolean) {
  if (busy.value || pageSelect.value.noneEligible) return
  emit('update:selected-ids', toggleSelectAllOnPage({
    orders: props.orders,
    selectAll: checked,
    max: bulkMax.value}))
}

function toggleSelect(o: any, checked: boolean) {
  if (!canBulkSelect(o) || busy.value) return
  emit(
    'update:selected-ids',
    toggleOrderSelection({
      selectedIds: props.selectedIds,
      orderId: String(o.id),
      selected: checked,
      max: bulkMax.value})
  )
}

function displayItems(o: any) {
  return aggregateCommerceLineItems(o?.items)
}

function formatMoney(v: any, c?: string) {
  if (v == null || v === '') return '—'
  return formatCommerceMoney(v, c)
}
function formatTs(v: any) {
  return formatCommerceTs(v)
}
function formatQty(v: any) {
  return formatCommerceQty(v)
}
function emptyField(value: any, availability?: string) {
  if (value != null && value !== '') return value
  if (availability === 'EMPTY' || availability === 'NOT_IN_SNAPSHOT') return '—'
  return 'Tidak tersedia dari marketplace'
}

function opsBadge(o: any) {
  const s = String(o?.fulfillOpsStatus || 'NONE').toUpperCase()
  if (s === 'STOCK_ISSUED') return 'bg-label-success'
  if (s === 'CANCELLED_OPS') return 'bg-label-danger'
  if (s === 'SHIP_ARRANGED' || s === 'LABEL_READY' || s === 'HANDED_OVER') return 'bg-label-info'
  if (s === 'RESERVED' || s === 'PICKED' || s === 'PACKED') return 'bg-label-warning'
  return 'bg-label-secondary'
}

function accountingBadge(o: any) {
  return commerceAccountingBadgeMeta({
    stockIssuedAt: o?.stockIssuedAt,
    accountingStatus: o?.accountingStatus,
    releaseBlockerCodes: o?.releaseBlockerCodes || null})
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (!img) return
  img.style.display = 'none'
  const ph = document.createElement('div')
  ph.className =
    'rounded flex-shrink-0 d-flex align-items-center justify-content-center bg-label-secondary text-muted'
  ph.style.width = '48px'
  ph.style.height = '48px'
  ph.setAttribute('aria-hidden', 'true')
  ph.innerHTML = '<i class="ri-image-line"></i>'
  img.parentElement?.insertBefore(ph, img)
}
</script>
