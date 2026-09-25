<template>
  <div class="card h-100 commerce-rank-card">
    <div class="card-header d-flex align-items-center gap-1 py-3">
      <h5 class="mb-0">Toko Teratas</h5>
      <InfoPopover
        title="Toko Teratas"
        description="Peringkat toko berdasarkan nominal External Order marketplace (cache SkyFlow). Bukan revenue Finance. Penjualan selesai = status SHIPPED/DELIVERED/COMPLETED."
        label="Info Toko Teratas"
      />
    </div>
    <div class="card-body pt-0">
      <div v-if="error" class="alert alert-warning small mb-2">
        {{ error }}
        <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="resetAndLoad">Retry</button>
      </div>
      <div v-if="!items.length && !loading" class="text-muted small py-4 text-center">
        Belum ada toko dengan order pada periode ini.
      </div>
      <div v-else ref="scrollRoot" class="commerce-rank-scroll">
        <article
          v-for="shop in items"
          :key="shop.shopId || shop.shopName"
          class="commerce-top-shop py-3 border-bottom"
        >
          <div class="commerce-top-shop__row">
            <span class="commerce-platform-pill" :title="shop.shopName">
              <i :class="platformIcon(shop.platformCode)" aria-hidden="true" />
              <span class="text-truncate">{{ shop.shopName }}</span>
            </span>
            <div class="commerce-shop-metrics" aria-label="Metrik toko">
              <div>
                <div class="commerce-metric-label">Potensi Penjualan</div>
                <div class="commerce-metric-value">
                  {{ formatCommerceMoney(shop.marketplaceNominal) }}
                </div>
              </div>
              <div>
                <div class="commerce-metric-label">Produk Terjual</div>
                <div class="commerce-metric-value">{{ formatQty(shop.qtySold) }}</div>
              </div>
              <div>
                <div class="commerce-metric-label">Penjualan Selesai</div>
                <div class="commerce-metric-value">
                  {{ formatCommerceMoney(shop.completedNominal) }}
                </div>
              </div>
              <div>
                <div class="commerce-metric-label">Pesanan Selesai</div>
                <div class="commerce-metric-value">{{ formatQty(shop.completedOrderCount) }}</div>
              </div>
            </div>
          </div>
        </article>
        <div ref="sentinelEl" class="commerce-rank-sentinel" aria-hidden="true" />
        <div v-if="loading" class="text-center text-muted small py-2">
          <span class="spinner-border spinner-border-sm me-1" role="status" />
          Memuat…
        </div>
        <p v-else-if="!hasMore && items.length" class="text-muted small text-center mb-0 py-2">
          Semua toko ditampilkan
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useInfiniteScrollLoader } from '~/composables/useInfiniteScrollLoader'
import InfoPopover from '~/components/common/InfoPopover.vue'
import { formatCommerceMoney } from '~/utils/commerceFormat'
import { commercePlatformIcon } from '~/utils/commercePlatform'
import { emptyRankPage, fetchCommerceRankPage } from '~/utils/commerceRankFetch'

export type CommerceTopShopRow = {
  shopId: string | null
  shopName: string
  platformCode: string
  marketplaceNominal: number
  qtySold: number
  completedNominal: number
  completedOrderCount: number
  orderCount: number
}

const props = withDefaults(
  defineProps<{
    days?: number
    perPage?: number
  }>(),
  { days: 14, perPage: 10 }
)

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()
const scrollRoot = ref<HTMLElement | null>(null)
const resetKey = computed(() => `${companyId.value || ''}:${props.days}`)
const enabled = computed(() => Boolean(companyId.value))

const { items, loading, error, hasMore, sentinelEl, resetAndLoad } =
  useInfiniteScrollLoader<CommerceTopShopRow>({
    resetKey,
    enabled,
    scrollRoot,
    fetchPage: async (page) => {
      if (!companyId.value) return emptyRankPage<CommerceTopShopRow>(props.perPage)
      return fetchCommerceRankPage<CommerceTopShopRow>({
        endpoint: $api.commerceDashboardTopShops(),
        companyId: companyId.value,
        days: props.days,
        page,
        perPage: props.perPage,
        errorLabel: 'Gagal memuat toko teratas',
      })
    },
  })

function platformIcon(code?: string | null) {
  return commercePlatformIcon(code)
}

function formatQty(n: number) {
  return new Intl.NumberFormat('id-ID').format(n || 0)
}
</script>

<style scoped>
.commerce-rank-scroll {
  max-height: 28rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.commerce-top-shop:last-of-type {
  border-bottom: 0 !important;
}

.commerce-top-shop__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.75rem 1rem;
}

.commerce-platform-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 11rem;
  min-width: 0;
  flex-shrink: 0;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--bs-border-color, #d9dee3);
  background: var(--bs-body-bg, #fff);
  font-size: 0.8rem;
  font-weight: 600;
}

.commerce-shop-metrics {
  flex: 1 1 16rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  min-width: 0;
}

.commerce-metric-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color, #a1acb8);
  line-height: 1.2;
}

.commerce-metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bs-heading-color, #566a7f);
  word-break: break-word;
  line-height: 1.35;
}

.commerce-rank-sentinel {
  height: 1px;
}
</style>
