<template>
  <section class="sf-pos-catalog d-flex flex-column gap-3 h-100">
    <form class="d-flex flex-wrap gap-2" @submit.prevent="$emit('search')">
      <div class="flex-grow-1" style="min-width: 12rem">
        <label class="visually-hidden" for="pos-catalog-search">Cari produk</label>
        <input
          id="pos-catalog-search"
          :value="search"
          type="search"
          class="form-control"
          placeholder="Cari nama / SKU / barcode (Enter)…"
          :disabled="disabled"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="disabled || loading">
        Cari
      </button>
    </form>

    <div v-if="error" class="alert alert-danger py-2 mb-0 d-flex flex-wrap justify-content-between gap-2">
      <span class="text-break">{{ error }}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" @click="$emit('retry')">Coba lagi</button>
    </div>

    <div v-if="loading && !items.length" class="text-muted small">Memuat katalog…</div>
    <div v-else-if="!loading && !items.length" class="text-muted small">
      {{ emptyHint }}
    </div>

    <template v-else>
      <div class="sf-pos-catalog-grid">
        <PosProductCard
          v-for="item in items"
          :key="item.productId"
          :item="item"
          :adding="addingProductId === item.productId"
          @add="$emit('add', $event)"
        />
      </div>

      <nav
        v-if="lastPage > 1 || total > 0"
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 border-top pt-2"
        aria-label="Pagination katalog POS"
      >
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="disabled || loading || page <= 1"
          @click="$emit('page-change', page - 1)"
        >
          Sebelumnya
        </button>
        <span class="small text-muted">
          Halaman <span class="fw-semibold text-body">{{ page }}</span>
          dari {{ lastPage }}
          <span class="d-none d-sm-inline"> · {{ total }} produk</span>
          <span class="d-none d-md-inline"> · maks. {{ pageSize }}/halaman</span>
        </span>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="disabled || loading || page >= lastPage"
          @click="$emit('page-change', page + 1)"
        >
          Selanjutnya
        </button>
      </nav>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PosProductCard from '~/components/pos/PosProductCard.vue'
import type { PosCatalogRow } from '~/utils/posCart'

const props = defineProps<{
  search: string
  items: PosCatalogRow[]
  loading: boolean
  page: number
  lastPage: number
  total: number
  pageSize: number
  error: string
  disabled?: boolean
  warehouseSelected: boolean
  addingProductId?: number | null
}>()

defineEmits<{
  'update:search': [value: string]
  search: []
  retry: []
  'page-change': [page: number]
  add: [item: PosCatalogRow]
}>()

const emptyHint = computed(() =>
  props.warehouseSelected
    ? 'Tidak ada produk untuk pencarian ini.'
    : 'Pilih gudang untuk melihat stok tersedia, lalu cari produk.'
)
</script>

<style scoped>
.sf-pos-catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
@media (max-width: 1199.98px) {
  .sf-pos-catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 575.98px) {
  .sf-pos-catalog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
