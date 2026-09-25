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

    <div v-for="o in orders" :key="o.id" class="card mb-3">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div class="min-w-0">
          <h5 class="mb-1 text-break">
            <span class="badge me-2" :class="commerceStatusBadge(o.normalizedStatus)">
              {{ o.statusLabel || o.normalizedStatus }}
            </span>
            <span class="font-monospace">{{ o.externalOrderId }}</span>
          </h5>
          <p class="mb-0 card-subtitle text-muted small mt-3">
            {{ o.shop?.name || o.platformCode }}
            · {{ o.platformCode }}
            · {{ o.fulfillmentType || '—' }}
            <template v-if="o.logistics?.actionDeadlineAt">
              · SLA {{ formatTs(o.logistics.actionDeadlineAt) }}
            </template>
          </p>
        </div>
        <div class="small text-muted text-md-end">
          <div>{{ formatTs(o.platformCreatedAt) }}</div>
          <span class="badge mt-3" :class="commerceStatusBadge(o.processingState)">
            {{ o.processingState }}
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
              <dd class="col-7">{{ o.logistics?.paymentMethod || '—' }}</dd>
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
              <dt class="col-5 text-muted">Sync</dt>
              <dd class="col-7">{{ formatTs(o.lastSyncedAt || o.importedAt) }}</dd>
            </dl>
          </div>
        </div>

        <ExternalOrderCardFooter
          :actions="o.actions"
          @open-detail="$emit('open-detail', o)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExternalOrderCardFooter from '~/components/commerce/ExternalOrderCardFooter.vue'
import {
  aggregateCommerceLineItems,
  commerceStatusBadge,
  formatCommerceMoney,
  formatCommerceQty,
  formatCommerceTs,
} from '~/utils/commerceFormat'

const props = defineProps<{
  orders: any[]
}>()

defineEmits<{
  (e: 'open-detail', order: any): void
}>()

const empty = computed(() => !props.orders?.length)

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
