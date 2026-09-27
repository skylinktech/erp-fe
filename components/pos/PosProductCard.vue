<template>
  <article
    class="card h-100 sf-pos-product-card"
    :class="{ 'border-warning': !hasPrice, 'opacity-75': stockTone === 'zero' }"
  >
    <div class="card-body d-flex flex-column gap-2 p-3">
      <div class="d-flex gap-2 align-items-start">
        <div class="sf-pos-product-card__thumb flex-shrink-0">
          <img
            :src="imageSrc"
            :alt="item.name || 'Produk'"
            loading="lazy"
            @error="(e) => handleImageError(e, '/img/default-product-image.png')"
          />
        </div>
        <div class="min-w-0 flex-grow-1 d-flex flex-column gap-1">
          <div class="d-flex flex-column align-items-start gap-1">
            <span class="badge bg-label-secondary text-truncate mw-100" :title="item.sku || undefined">
              {{ item.sku || '—' }}
            </span>
            <span
              class="badge"
              :class="{
                'bg-label-success': stockTone === 'ok',
                'bg-label-danger': stockTone === 'zero',
                'bg-label-secondary': stockTone === 'unknown',
              }"
            >
              {{ stockLabel }}
            </span>
          </div>
          <h3 class="h6 mb-0 sf-pos-product-card__name" :title="item.name">{{ item.name }}</h3>
          <p class="small text-muted mb-0">
            <span
              v-if="item.isBundling || item.isKit"
              class="badge bg-label-info me-1"
            >Bundling</span>
            <span v-if="item.categoryName">{{ item.categoryName }} · </span>
            {{ item.unitName || item.unitSymbol || 'UOM' }}
          </p>
        </div>
      </div>

      <div class="mt-auto d-flex justify-content-between align-items-center gap-2">
        <div class="fw-semibold text-primary text-break small">{{ priceLabel }}</div>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="!canAdd || adding"
          :title="addTitle"
          @click="$emit('add', item)"
        >
          <span v-if="adding" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          <span v-else>+</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useImageUrl } from '~/composables/useImageUrl'
import {
  formatPosAvailableStock,
  formatPosOfficialPrice,
  type PosCatalogRow,
} from '~/utils/posCart'

const props = defineProps<{
  item: PosCatalogRow
  adding?: boolean
}>()

defineEmits<{
  add: [item: PosCatalogRow]
}>()

const { getProductImage, handleImageError } = useImageUrl()

const stock = computed(() => formatPosAvailableStock(props.item.availableQty))
const stockLabel = computed(() => stock.value.label)
const stockTone = computed(() => stock.value.tone)
const hasPrice = computed(() => props.item.officialUnitPrice != null)
const priceLabel = computed(() => formatPosOfficialPrice(props.item.officialUnitPrice))
const canAdd = computed(() => !!props.item.unitId)
const imageSrc = computed(() => getProductImage(props.item.image))
const addTitle = computed(() => {
  if (!hasPrice.value) return 'Harga satuan default belum tersedia — pilih satuan lain'
  return 'Tambah ke keranjang'
})
</script>

<style scoped>
.sf-pos-product-card {
  min-height: 10.5rem;
}
.sf-pos-product-card__thumb {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--bs-tertiary-bg, #f5f5f9);
  border: 1px solid var(--bs-border-color, #e0e0e6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sf-pos-product-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.sf-pos-product-card__name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}
</style>
