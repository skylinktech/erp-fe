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
            <th>Seller SKU</th>
            <th>Product ID</th>
            <th>Status</th>
            <th>Mapped</th>
            <th>Synced</th>
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
            <td class="text-break">{{ l.title || '—' }}</td>
            <td class="font-monospace small">{{ l.sellerSku || '—' }}</td>
            <td class="font-monospace small">{{ l.externalProductId }}</td>
            <td>
              <span class="badge" :class="commerceStatusBadge(l.status)">
                {{ l.status || '—' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="l.mapped ? 'bg-label-success' : 'bg-label-secondary'">
                {{ l.mapped ? 'ya' : 'belum' }}
              </span>
            </td>
            <td class="small text-nowrap">{{ formatCommerceTs(l.lastSyncedAt) }}</td>
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
          <div class="d-flex flex-wrap gap-1 mt-1">
            <span class="badge" :class="commerceStatusBadge(l.status)">{{ l.status || '—' }}</span>
            <span class="badge" :class="l.mapped ? 'bg-label-success' : 'bg-label-secondary'">
              {{ l.mapped ? 'mapped' : 'belum' }}
            </span>
          </div>
          <div class="small text-muted mt-1">{{ formatCommerceTs(l.lastSyncedAt) }}</div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { commerceStatusBadge, formatCommerceTs } from '~/utils/commerceFormat'

export type CommerceExternalListingRow = {
  id: string
  title?: string | null
  sellerSku?: string | null
  externalProductId: string
  status?: string | null
  imageUrl?: string | null
  mapped?: boolean
  lastSyncedAt?: string | null
}

const props = withDefaults(
  defineProps<{
    listings: CommerceExternalListingRow[]
    title?: string
    subtitle?: string
  }>(),
  {
    title: 'Listing eksternal (cache)',
    subtitle: 'Tidak menimpa Product / Price List RETAIL',
  }
)

const empty = computed(() => !props.listings?.length)

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
