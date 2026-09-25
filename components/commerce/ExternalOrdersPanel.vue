<template>
  <div class="commerce-external-orders">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="h6 mb-0">{{ title }}</h2>
        <p v-if="subtitle" class="small text-muted mb-0">{{ subtitle }}</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="empty" class="text-muted">
      <slot name="empty">Belum ada External Order tersimpan.</slot>
    </div>

    <div v-else class="table-responsive d-none d-lg-block">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th style="width: 2rem"></th>
            <th>External ID</th>
            <th>Shop</th>
            <th>Status</th>
            <th>Fulfillment</th>
            <th>Processing</th>
            <th class="text-end">Items</th>
            <th class="text-end">Total</th>
            <th>Paid / Platform</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="o in orders" :key="o.id">
            <tr>
              <td>
                <button
                  type="button"
                  class="btn btn-sm btn-link p-0 text-muted"
                  :aria-expanded="expandedId === o.id"
                  :aria-label="expandedId === o.id ? 'Tutup detail' : 'Buka detail'"
                  @click="toggle(o.id)"
                >
                  <i :class="expandedId === o.id ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>
                </button>
              </td>
              <td class="font-monospace small text-break">{{ o.externalOrderId }}</td>
              <td class="small text-break">{{ shopLabel(o) }}</td>
              <td>
                <span class="badge" :class="commerceStatusBadge(o.normalizedStatus)">
                  {{ o.normalizedStatus }}
                </span>
                <div v-if="o.rawStatus && o.rawStatus !== o.normalizedStatus" class="small text-muted">
                  {{ o.rawStatus }}
                </div>
              </td>
              <td class="small">{{ o.fulfillmentType || '—' }}</td>
              <td>
                <span class="badge" :class="commerceStatusBadge(o.processingState)">
                  {{ o.processingState }}
                </span>
              </td>
              <td class="text-end">{{ o.itemCount ?? o.items?.length ?? 0 }}</td>
              <td class="text-end text-nowrap fw-semibold">
                {{ formatCommerceMoney(o.totalAmount, o.currency) }}
              </td>
              <td class="small">
                <div>{{ formatCommerceTs(o.paidAt) }}</div>
                <div class="text-muted">{{ formatCommerceTs(o.platformCreatedAt) }}</div>
              </td>
            </tr>
            <tr v-if="expandedId === o.id">
              <td colspan="9" class="bg-light">
                <div class="p-2">
                  <div class="row g-2 small mb-2">
                    <div class="col-6 col-md-3">
                      <div class="text-muted">Subtotal</div>
                      <div>{{ formatCommerceMoney(o.subtotalAmount, o.currency) }}</div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="text-muted">Diskon seller</div>
                      <div>{{ formatCommerceMoney(o.sellerDiscountAmount, o.currency) }}</div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="text-muted">Diskon platform</div>
                      <div>{{ formatCommerceMoney(o.platformDiscountAmount, o.currency) }}</div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="text-muted">Ongkir / Pajak</div>
                      <div>
                        {{ formatCommerceMoney(o.shippingFeeAmount, o.currency) }}
                        /
                        {{ formatCommerceMoney(o.taxAmount, o.currency) }}
                      </div>
                    </div>
                  </div>

                  <div v-if="!(o.items && o.items.length)" class="text-muted">Tidak ada line item.</div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm mb-0 bg-white">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th>SKU</th>
                          <th class="text-end">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="line in o.items" :key="line.id">
                          <td class="text-break small">{{ line.productNameSnapshot || '—' }}</td>
                          <td class="font-monospace small">{{ line.sellerSku || line.externalSkuId || '—' }}</td>
                          <td class="text-end">{{ line.quantity }}</td>
                          <td class="text-end text-nowrap">
                            {{ formatCommerceMoney(line.saleUnitPrice, o.currency) }}
                          </td>
                          <td class="text-end text-nowrap">
                            {{ formatCommerceMoney(line.lineTotalAmount, o.currency) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="!empty" class="d-lg-none">
      <article v-for="o in orders" :key="o.id" class="border rounded p-3 mb-2">
        <div class="d-flex justify-content-between gap-2">
          <div class="font-monospace small text-break">{{ o.externalOrderId }}</div>
          <span class="badge align-self-start" :class="commerceStatusBadge(o.normalizedStatus)">
            {{ o.normalizedStatus }}
          </span>
        </div>
        <div class="small text-muted">{{ shopLabel(o) }}</div>
        <div class="small">{{ o.fulfillmentType }} · {{ o.processingState }}</div>
        <div class="fw-semibold mt-1">{{ formatCommerceMoney(o.totalAmount, o.currency) }}</div>
        <div class="small text-muted">{{ formatCommerceTs(o.paidAt) }}</div>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary mt-2"
          @click="toggle(o.id)"
        >
          {{ expandedId === o.id ? 'Sembunyikan item' : `Item (${o.itemCount ?? o.items?.length ?? 0})` }}
        </button>
        <ul v-if="expandedId === o.id && o.items?.length" class="list-unstyled small mt-2 mb-0">
          <li v-for="line in o.items" :key="line.id" class="border-top py-1">
            <div class="fw-semibold text-break">{{ line.productNameSnapshot || line.sellerSku || '—' }}</div>
            <div>
              qty {{ line.quantity }} ·
              {{ formatCommerceMoney(line.lineTotalAmount ?? line.saleUnitPrice, o.currency) }}
            </div>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  commerceStatusBadge,
  formatCommerceMoney,
  formatCommerceTs,
} from '~/utils/commerceFormat'

export type CommerceExternalOrderLine = {
  id: string
  externalLineId?: string
  externalSkuId?: string | null
  sellerSku?: string | null
  productNameSnapshot?: string | null
  quantity?: string | number | null
  saleUnitPrice?: string | number | null
  lineTotalAmount?: string | number | null
}

export type CommerceExternalOrderRow = {
  id: string
  externalOrderId: string
  shopId?: string
  shop?: { id: string; name?: string; externalShopId?: string; region?: string | null } | null
  platformCode?: string
  rawStatus?: string
  normalizedStatus?: string
  fulfillmentType?: string
  processingState?: string
  currency?: string
  subtotalAmount?: string | number | null
  sellerDiscountAmount?: string | number | null
  platformDiscountAmount?: string | number | null
  shippingFeeAmount?: string | number | null
  taxAmount?: string | number | null
  totalAmount?: string | number | null
  itemCount?: number
  paidAt?: string | null
  platformCreatedAt?: string | null
  items?: CommerceExternalOrderLine[]
}

const props = withDefaults(
  defineProps<{
    orders: CommerceExternalOrderRow[]
    title?: string
    subtitle?: string
  }>(),
  {
    title: 'External Orders',
    subtitle: 'Data dari TikTok (cache import) · stok/GL tidak berubah',
  }
)

const empty = computed(() => !props.orders?.length)
const expandedId = ref<string | null>(null)

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function shopLabel(o: CommerceExternalOrderRow) {
  if (o.shop?.name) return o.shop.name
  return o.platformCode || '—'
}
</script>
