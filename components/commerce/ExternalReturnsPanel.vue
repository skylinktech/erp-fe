<template>
  <div class="commerce-external-returns">
    <div v-if="empty" class="card mb-3">
      <div class="card-header">
        <h5 class="mb-0">Pengembalian marketplace</h5>
      </div>
      <div class="card-body mt-3">
        <div class="alert alert-secondary small mb-0">
          <slot name="empty">Belum ada kasus aftersales.</slot>
        </div>
      </div>
    </div>

    <div v-for="r in returns" :key="r.id" class="card mb-3">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div class="min-w-0">
          <h5 class="mb-1 text-break">
            <span class="badge me-2" :class="statusBadge(r.normalizedStatus)">
              {{ r.normalizedStatus }}
            </span>
            <span class="font-monospace">{{ r.externalReturnId }}</span>
          </h5>
          <p class="mb-0 card-subtitle text-muted small mt-3">
            {{ r.shop?.name || r.platformCode }}
            · {{ r.platformCode || '—' }}
            · {{ caseTypeLabel(r) }}
            <template v-if="r.actionDeadlineAt">
              · Tenggat {{ formatTs(r.actionDeadlineAt) }}
            </template>
          </p>
        </div>
        <div class="small text-muted text-md-end">
          <div>{{ formatTs(r.platformCreatedAt) }}</div>
          <div class="mt-2">Pembeli: {{ buyerLabel(r) }}</div>
        </div>
      </div>

      <div class="card-body mt-3">
        <div class="row g-3">
          <div class="col-md-6 col-xl-4 mt-3">
            <h6 class="mb-2">Produk</h6>
            <div v-if="!displayItems(r).length" class="alert alert-secondary small mb-0 py-2">
              Tidak ada item.
            </div>
            <ul v-else class="list-unstyled mb-0 small">
              <li
                v-for="it in displayItems(r).slice(0, 4)"
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
                  <div class="text-muted">
                    {{ it.skuNameSnapshot || it.sellerSku || it.externalSkuId || '—' }}
                  </div>
                  <div>
                    Qty {{ formatQty(it.quantity) }} ·
                    {{ formatMoney(it.refundTotalAmount, r.currency) }}
                  </div>
                </div>
              </li>
            </ul>
            <p v-if="displayItems(r).length > 4" class="small text-muted mb-0">
              +{{ displayItems(r).length - 4 }} produk lain
            </p>
          </div>

          <div class="col-md-6 col-xl-4 mt-3">
            <h6 class="mb-2">Ringkasan</h6>
            <dl class="row small mb-0">
              <dt class="col-5 text-muted">Total refund</dt>
              <dd class="col-7 fw-semibold">{{ formatMoney(r.refundTotalAmount, r.currency) }}</dd>
              <dt class="col-5 text-muted">Kompensasi</dt>
              <dd class="col-7">
                <template v-if="r.compensationAvailable">
                  {{ formatMoney(r.compensationAmount, r.currency) }}
                </template>
                <span
                  v-else
                  class="text-muted"
                  :title="r.fieldAvailability?.compensationAmount"
                >
                  Tidak tersedia dari marketplace
                </span>
              </dd>
              <dt class="col-5 text-muted">Alasan</dt>
              <dd class="col-7">{{ r.returnReasonText || r.returnReasonCode || '—' }}</dd>
              <dt class="col-5 text-muted">Catatan seller</dt>
              <dd class="col-7">
                {{ r.sellerNote != null && r.sellerNote !== '' ? r.sellerNote : '—' }}
              </dd>
              <dt class="col-5 text-muted">No. pesanan</dt>
              <dd class="col-7 font-monospace text-break">{{ r.externalOrderId || '—' }}</dd>
            </dl>
          </div>

          <div class="col-md-12 col-xl-4 mt-3">
            <h6 class="mb-2">Pengiriman retur</h6>
            <dl class="row small mb-0">
              <dt class="col-5 text-muted">Tenggat</dt>
              <dd class="col-7">{{ formatTs(r.actionDeadlineAt) }}</dd>
              <dt class="col-5 text-muted">Kurir</dt>
              <dd class="col-7">{{ r.courierName || '—' }}</dd>
              <dt class="col-5 text-muted">Resi</dt>
              <dd class="col-7 font-monospace text-break">{{ r.trackingNumber || '—' }}</dd>
              <dt class="col-5 text-muted">Sync</dt>
              <dd class="col-7">{{ formatTs(r.lastSyncedAt) }}</dd>
              <dt class="col-5 text-muted">Jenis</dt>
              <dd class="col-7">
                <span v-if="r.hasPhysicalReturn" class="badge bg-label-info">Retur fisik</span>
                <span v-else class="badge bg-label-secondary">Refund tanpa barang</span>
                <span v-if="r.isPartial" class="badge bg-label-warning ms-1">Parsial</span>
              </dd>
            </dl>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="$emit('open-detail', r.id)"
          >
            <i class="ri-file-list-3-line me-1" aria-hidden="true" />
            Detail
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            disabled
            :title="r.actions?.chatBuyer?.reason || 'Chat Pembeli belum dihubungkan di SkyFlow.'"
          >
            <i class="ri-chat-3-line me-1 text-success" aria-hidden="true" />
            Chat Pembeli
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  aggregateCommerceLineItems,
  commerceStatusBadge,
  formatCommerceMoney,
  formatCommerceQty,
  formatCommerceTs,
} from '~/utils/commerceFormat'

const props = defineProps<{
  returns: any[]
}>()

defineEmits<{
  (e: 'open-detail', id: string): void
}>()

const empty = computed(() => !props.returns?.length)

function displayItems(r: any) {
  return aggregateCommerceLineItems(r?.items)
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
function buyerLabel(r: any) {
  return r.buyer?.display || '—'
}
function statusBadge(s: string) {
  return commerceStatusBadge(s)
}
function caseTypeLabel(r: any) {
  return r.caseTypeLabel || r.caseType || '—'
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
