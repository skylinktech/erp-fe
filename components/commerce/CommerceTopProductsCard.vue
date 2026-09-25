<template>
  <div class="card h-100 commerce-rank-card">
    <div class="card-header d-flex align-items-center gap-1 py-3">
      <h5 class="mb-0">Produk Terjual Teratas</h5>
      <InfoPopover
        title="Produk Terjual Teratas"
        description="Peringkat berdasarkan kuantitas line item External Order (cache SkyFlow). Gambar diambil dari listing marketplace yang sudah tersinkron."
        label="Info Produk Terjual Teratas"
      />
    </div>
    <div class="card-body pt-0">
      <div v-if="error" class="alert alert-warning small mb-2">
        {{ error }}
        <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="resetAndLoad">Retry</button>
      </div>
      <div v-if="!items.length && !loading" class="text-muted small py-4 text-center">
        Belum ada produk terjual pada periode ini.
      </div>
      <div v-else ref="scrollRoot" class="commerce-rank-scroll">
        <article
          v-for="(p, idx) in items"
          :key="`${p.sellerSku || p.productName}-${idx}`"
          class="commerce-top-product py-3 border-bottom"
        >
          <a
            v-if="p.imageUrl"
            class="commerce-product-thumb commerce-product-thumb--link"
            :href="p.imageUrl"
            target="_blank"
            rel="noopener noreferrer"
            :title="p.productName || p.sellerSku || 'produk'"
            @click.stop
          >
            <img
              :src="p.imageUrl"
              :alt="p.productName || p.sellerSku || 'produk'"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="onImgError"
            />
          </a>
          <div v-else class="commerce-product-thumb" aria-hidden="true">
            <i class="ri-image-line" />
          </div>
          <div class="commerce-product-meta min-w-0 flex-grow-1">
            <div class="fw-semibold text-break">{{ p.productName || p.sellerSku || '—' }}</div>
            <div class="small text-muted text-break">{{ p.variantLabel || '—' }}</div>
            <div class="small text-muted text-break">{{ p.sellerSku || '—' }}</div>
          </div>
          <div class="commerce-product-qty text-end flex-shrink-0">
            <div class="commerce-metric-label">Kuantitas</div>
            <div class="commerce-metric-value text-nowrap">{{ formatQty(p.qty) }} Pcs</div>
          </div>
        </article>
        <div ref="sentinelEl" class="commerce-rank-sentinel" aria-hidden="true" />
        <div v-if="loading" class="text-center text-muted small py-2">
          <span class="spinner-border spinner-border-sm me-1" role="status" />
          Memuat…
        </div>
        <p v-else-if="!hasMore && items.length" class="text-muted small text-center mb-0 py-2">
          Semua produk ditampilkan
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
import { emptyRankPage, fetchCommerceRankPage } from '~/utils/commerceRankFetch'

export type CommerceTopProductRow = {
  sellerSku?: string | null
  productName?: string | null
  variantLabel?: string | null
  qty: number
  orderCount?: number
  lineNominal?: number
  imageUrl?: string | null
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
  useInfiniteScrollLoader<CommerceTopProductRow>({
    resetKey,
    enabled,
    scrollRoot,
    fetchPage: async (page) => {
      if (!companyId.value) return emptyRankPage<CommerceTopProductRow>(props.perPage)
      return fetchCommerceRankPage<CommerceTopProductRow>({
        endpoint: $api.commerceDashboardTopProducts(),
        companyId: companyId.value,
        days: props.days,
        page,
        perPage: props.perPage,
        errorLabel: 'Gagal memuat produk terlaris',
      })
    },
  })

function formatQty(n: number) {
  return new Intl.NumberFormat('id-ID').format(n || 0)
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const wrap = img.closest('.commerce-product-thumb')
  if (wrap) wrap.classList.add('is-broken')
}
</script>

<style scoped>
.commerce-rank-scroll {
  max-height: 28rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.commerce-top-product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.commerce-top-product:last-of-type {
  border-bottom: 0 !important;
}

.commerce-product-thumb {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bs-gray-100, #f5f5f9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary-color, #a1acb8);
}

.commerce-product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.commerce-product-thumb--link {
  text-decoration: none;
}

.commerce-product-thumb.is-broken::after {
  content: '';
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
  line-height: 1.35;
}

.commerce-rank-sentinel {
  height: 1px;
}
</style>
