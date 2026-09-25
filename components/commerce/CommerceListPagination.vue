<template>
  <nav
    v-if="visible"
    class="commerce-list-pagination"
    :class="compact ? 'commerce-list-pagination--compact' : 'commerce-list-pagination--full'"
    :aria-label="ariaLabel"
  >
    <template v-if="compact">
      <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 small">
        <span class="text-muted">Halaman</span>
        <span class="fw-semibold">{{ normalized.currentPage }}</span>
        <span class="text-muted">/</span>
        <span class="text-muted">{{ normalized.lastPage }}</span>
        <label class="d-inline-flex align-items-center gap-1 mb-0 text-muted" :for="`${idPrefix}-per-top`">
          Per halaman
          <select
            :id="`${idPrefix}-per-top`"
            class="form-select form-select-sm commerce-list-pagination__per"
            :value="perPage"
            :disabled="disabled"
            @change="onPerPageChange"
          >
            <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
    </template>

    <template v-else>
      <div
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 px-1 border-top mt-3"
      >
        <button
          type="button"
          class="btn btn-sm btn-link text-decoration-none px-0"
          :disabled="disabled || page <= 1"
          @click="go(page - 1)"
        >
          <i class="ri-arrow-left-s-line" aria-hidden="true" />
          Sebelumnya
        </button>

        <div class="d-flex flex-wrap align-items-center justify-content-center gap-2 small">
          <span
            class="commerce-list-pagination__page fw-semibold"
            aria-current="page"
          >
            {{ normalized.currentPage }}
          </span>
          <span class="text-muted">dari {{ normalized.lastPage }}</span>
          <span class="text-muted d-none d-sm-inline">· {{ normalized.total }} data</span>
          <label class="d-inline-flex align-items-center gap-1 mb-0 text-muted" :for="`${idPrefix}-per`">
            Per halaman
            <select
              :id="`${idPrefix}-per`"
              class="form-select form-select-sm commerce-list-pagination__per"
              :value="perPage"
              :disabled="disabled"
              @change="onPerPageChange"
            >
              <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-link text-decoration-none px-0"
          :disabled="disabled || page >= normalized.lastPage"
          @click="go(page + 1)"
        >
          Selanjutnya
          <i class="ri-arrow-right-s-line" aria-hidden="true" />
        </button>
      </div>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  COMMERCE_DEFAULT_PER_PAGE,
  COMMERCE_PER_PAGE_OPTIONS,
  clampCommercePerPage,
  normalizeCommerceMeta,
  type CommerceListMeta,
} from '~/utils/commercePagination'

const props = withDefaults(
  defineProps<{
    page: number
    perPage: number
    meta?: CommerceListMeta | null
    disabled?: boolean
    /** Compact top bar (page + per page only). */
    compact?: boolean
    /** Show even when only one page (so per-page remains usable). */
    alwaysShow?: boolean
    idPrefix?: string
    ariaLabel?: string
    perPageOptions?: readonly number[]
  }>(),
  {
    meta: null,
    disabled: false,
    compact: false,
    alwaysShow: true,
    idPrefix: 'commerce-page',
    ariaLabel: 'Pagination daftar',
    perPageOptions: () => [...COMMERCE_PER_PAGE_OPTIONS],
  }
)

const emit = defineEmits<{
  'update:page': [page: number]
  'update:perPage': [perPage: number]
}>()

const normalized = computed(() => normalizeCommerceMeta(props.meta))

const visible = computed(() => {
  if (!props.meta) return false
  if (props.alwaysShow) return normalized.value.total > 0 || props.page > 1
  return normalized.value.lastPage > 1
})

function go(next: number) {
  const last = normalized.value.lastPage
  const safe = Math.min(last, Math.max(1, next))
  if (safe === props.page) return
  emit('update:page', safe)
}

function onPerPageChange(e: Event) {
  const next = clampCommercePerPage(
    (e.target as HTMLSelectElement).value,
    props.perPage || COMMERCE_DEFAULT_PER_PAGE
  )
  if (next === props.perPage) return
  emit('update:perPage', next)
}
</script>

<style scoped>
.commerce-list-pagination__per {
  width: auto;
  min-width: 4.5rem;
  display: inline-block;
}
.commerce-list-pagination__page {
  min-width: 1.5rem;
  text-align: center;
  border-top: 2px solid var(--bs-primary, #696cff);
  padding-top: 0.15rem;
}
.commerce-list-pagination--compact {
  margin-bottom: 0.75rem;
}
</style>
