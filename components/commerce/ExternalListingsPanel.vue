<template>
  <div class="commerce-external-listings">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="h6 mb-0">{{ title }}</h2>
        <p v-if="subtitle" class="small text-muted mb-0">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>

    <div v-if="empty" class="text-muted">
      <slot name="empty">Belum ada listing eksternal.</slot>
    </div>

    <div v-else class="table-responsive d-none d-md-block">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th style="width: 3.5rem">Gambar</th>
            <th>Judul</th>
            <th>Toko</th>
            <th>Seller SKU</th>
            <th>Produk SkyFlow</th>
            <th>Status</th>
            <th>Mapping</th>
            <th>Synced</th>
            <th v-if="canMap" class="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in listings" :key="l.id">
            <td>
              <a
                v-if="l.imageUrl"
                class="commerce-thumb commerce-thumb--link"
                :href="l.imageUrl"
                target="_blank"
                rel="noopener noreferrer"
                :title="`Buka gambar: ${l.title || l.sellerSku || 'produk'}`"
                @click.stop
              >
                <img
                  :src="l.imageUrl"
                  :alt="l.title || l.sellerSku || 'produk'"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @error="onImgError"
                />
              </a>
              <div v-else class="commerce-thumb" aria-hidden="true">
                <span class="commerce-thumb-placeholder">
                  <i class="ri-image-line"></i>
                </span>
              </div>
            </td>
            <td class="text-break">
              <div>{{ l.title || '—' }}</div>
              <div class="small font-monospace text-muted text-break">{{ l.externalProductId }}</div>
            </td>
            <td class="text-break small">
              <div>{{ l.shopName || '—' }}</div>
              <div class="text-muted">{{ commercePlatformLabel(l.platformCode) }}</div>
            </td>
            <td class="font-monospace small text-break">{{ l.sellerSku || '—' }}</td>
            <td class="text-break small">
              <div v-if="l.mappedProductName">
                {{ l.mappedProductName }}
                <span v-if="l.mappedUnitName" class="text-muted"> · {{ l.mappedUnitName }}</span>
              </div>
              <div v-else class="text-muted">Belum terhubung</div>
            </td>
            <td>
              <span class="badge" :class="commerceStatusBadge(l.status)">
                {{ commerceEnumLabel(l.status) }}
              </span>
            </td>
            <td>
              <span class="badge" :class="mappingBadge(l)">
                {{ mappingLabel(l) }}
              </span>
            </td>
            <td class="small text-nowrap">{{ formatCommerceTs(l.lastSyncedAt) }}</td>
            <td v-if="canMap" class="text-end">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="emit('map', l)"
              >
                {{ l.mappedListingId ? 'Ubah' : 'Hubungkan' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!empty" class="d-md-none">
      <article v-for="l in listings" :key="l.id" class="border rounded p-3 mb-2 d-flex gap-3">
        <a
          v-if="l.imageUrl"
          class="commerce-thumb commerce-thumb--link flex-shrink-0"
          :href="l.imageUrl"
          target="_blank"
          rel="noopener noreferrer"
          :title="`Buka gambar: ${l.title || l.sellerSku || 'produk'}`"
          @click.stop
        >
          <img
            :src="l.imageUrl"
            :alt="l.title || l.sellerSku || 'produk'"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="onImgError"
          />
        </a>
        <div v-else class="commerce-thumb flex-shrink-0" aria-hidden="true">
          <span class="commerce-thumb-placeholder">
            <i class="ri-image-line"></i>
          </span>
        </div>
        <div class="min-w-0 flex-grow-1">
          <div class="fw-semibold text-break">{{ l.title || l.sellerSku || l.externalProductId }}</div>
          <div class="small font-monospace text-break">{{ l.sellerSku || '—' }}</div>
          <div class="small text-muted text-break">{{ l.shopName || commercePlatformLabel(l.platformCode) }}</div>
          <div class="small text-break">
            <span v-if="l.mappedProductName">{{ l.mappedProductName }} · {{ l.mappedUnitName || '—' }}</span>
            <span v-else>Belum terhubung ke Product Master</span>
          </div>
          <div class="d-flex flex-wrap gap-1 mt-1">
            <span class="badge" :class="commerceStatusBadge(l.status)">{{ commerceEnumLabel(l.status) }}</span>
            <span class="badge" :class="mappingBadge(l)">{{ mappingLabel(l) }}</span>
          </div>
          <div class="small text-muted mt-1">{{ formatCommerceTs(l.lastSyncedAt) }}</div>
          <button
            v-if="canMap"
            type="button"
            class="btn btn-sm btn-outline-primary mt-2"
            @click="emit('map', l)"
          >
            {{ l.mappedListingId ? 'Ubah mapping' : 'Hubungkan' }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { commerceStatusBadge, commerceEnumLabel, formatCommerceTs } from '~/utils/commerceFormat'
import { commercePlatformLabel } from '~/utils/commercePlatform'

export type CommerceExternalListingRow = {
  id: string
  title?: string | null
  sellerSku?: string | null
  externalProductId: string
  externalSkuId?: string | null
  shopId?: string
  shopName?: string | null
  platformCode?: string | null
  status?: string | null
  imageUrl?: string | null
  mapped?: boolean
  mappedListingId?: string | null
  mappedProductId?: number | null
  mappedProductName?: string | null
  mappedProductSku?: string | null
  mappedUnitId?: number | null
  mappedUnitName?: string | null
  mappingStatus?: string | null
  lastSyncedAt?: string | null
}

const props = withDefaults(
  defineProps<{
    listings: CommerceExternalListingRow[]
    title?: string
    subtitle?: string
    canMap?: boolean
  }>(),
  {
    title: 'Listing eksternal (cache)',
    subtitle: 'Tidak menimpa Product / Price List RETAIL',
    canMap: false,
  }
)

const emit = defineEmits<{
  map: [listing: CommerceExternalListingRow]
}>()

const empty = computed(() => !props.listings?.length)

function mappingStatus(l: CommerceExternalListingRow) {
  return String(l.mappingStatus || (l.mapped ? 'MAPPED' : 'UNMAPPED')).toUpperCase()
}

function mappingLabel(l: CommerceExternalListingRow) {
  return commerceEnumLabel(mappingStatus(l))
}

function mappingBadge(l: CommerceExternalListingRow) {
  return commerceStatusBadge(mappingStatus(l))
}

function onImgError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  el.style.display = 'none'
  const wrap = el.parentElement
  if (wrap && !wrap.querySelector('.commerce-thumb-placeholder')) {
    const ph = document.createElement('span')
    ph.className = 'commerce-thumb-placeholder'
    ph.innerHTML = '<i class="ri-image-line"></i>'
    wrap.appendChild(ph)
  }
}
</script>

<style scoped>
.commerce-thumb {
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  overflow: hidden;
  background: var(--bs-secondary-bg, #f1f3f5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.commerce-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.22s ease, filter 0.22s ease;
}
.commerce-thumb--link {
  color: inherit;
  text-decoration: none;
  cursor: zoom-in;
  transition: box-shadow 0.22s ease, transform 0.22s ease;
}
.commerce-thumb--link:hover,
.commerce-thumb--link:focus-visible {
  transform: scale(1.12);
  box-shadow: 0 0 0 2px var(--bs-primary, #696cff);
  outline: none;
  z-index: 1;
}
.commerce-thumb--link:hover img,
.commerce-thumb--link:focus-visible img {
  transform: scale(1.08);
  filter: brightness(1.05);
}
.commerce-thumb--link:active {
  transform: scale(1.04);
}
@media (prefers-reduced-motion: reduce) {
  .commerce-thumb img,
  .commerce-thumb--link {
    transition: none;
  }
  .commerce-thumb--link:hover,
  .commerce-thumb--link:focus-visible,
  .commerce-thumb--link:hover img,
  .commerce-thumb--link:focus-visible img {
    transform: none;
  }
}
.commerce-thumb-placeholder {
  color: var(--bs-secondary-color, #6c757d);
  font-size: 1.1rem;
  line-height: 1;
}
</style>
