<template>
  <div class="card mb-3 commerce-orders-filter-card">
    <!-- Header: title + toolbar -->
    <div class="card-body pb-0">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="h5 mb-0">{{ title }}</h2>
        <div v-if="showToolbar" class="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary btn-icon"
            :disabled="!archived.enabled"
            :title="archived.reason"
            :aria-label="archived.label"
            @click="emit('toolbar', archived.key)"
          >
            <i :class="archived.icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary btn-icon"
            :disabled="!email.enabled"
            :title="email.reason"
            :aria-label="email.label"
            @click="emit('toolbar', email.key)"
          >
            <i :class="email.icon" aria-hidden="true" />
          </button>
          <div class="dropdown">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              data-bs-popper-config='{"strategy":"fixed"}'
              aria-expanded="false"
            >
              Unduh
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li v-for="item in downloads" :key="item.key">
                <button
                  type="button"
                  class="dropdown-item"
                  :disabled="!item.enabled"
                  :title="item.reason"
                  @click="emit('toolbar', item.key)"
                >
                  {{ item.label }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <WorkspaceTabs
        :id-prefix="tabsIdPrefix"
        embedded
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="emit('update:activeTab', $event)"
      />

      <WorkspaceTabs
        v-if="secondaryTabs?.length"
        :id-prefix="secondaryTabsIdPrefix"
        embedded
        class="mt-2"
        :tabs="secondaryTabs"
        :model-value="activeSecondaryTab"
        @update:model-value="emit('update:activeSecondaryTab', $event)"
      />
    </div>

    <hr class="my-0" />

    <!-- Filters -->
    <div class="card-body">
      <div class="row g-2 align-items-end">
        <div :class="showProcessing ? 'col-12 col-lg-3' : 'col-12 col-lg-4'">
          <label class="form-label" :for="`${idPrefix}-q`">Cari</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="ri-search-line" aria-hidden="true" /></span>
            <input
              :id="`${idPrefix}-q`"
              :value="q"
              type="search"
              class="form-control form-control-sm"
              :placeholder="searchPlaceholder"
              @input="emit('update:q', ($event.target as HTMLInputElement).value)"
              @keyup.enter="emit('apply')"
            />
          </div>
        </div>
        <div :class="showProcessing ? 'col-6 col-md-4 col-lg-2' : 'col-6 col-md-4 col-lg-3'">
          <label class="form-label" :for="`${idPrefix}-shop`">Shop</label>
          <select
            :id="`${idPrefix}-shop`"
            class="form-select form-select-sm"
            :value="shopId"
            @change="emit('update:shopId', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Semua</option>
            <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div v-if="showProcessing" class="col-6 col-md-4 col-lg-2">
          <label class="form-label" :for="`${idPrefix}-proc`">{{ processingLabel }}</label>
          <select
            :id="`${idPrefix}-proc`"
            class="form-select form-select-sm"
            :value="processingState"
            @change="emit('update:processingState', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="opt in processingOptions" :key="opt.value || 'all'" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div :class="showProcessing ? 'col-12 col-md-6 col-lg-5' : 'col-12 col-md-8 col-lg-5'">
          <label class="form-label" :for="`${idPrefix}-from`">Dari – Sampai</label>
          <div class="d-flex align-items-center gap-2">
            <input
              :id="`${idPrefix}-from`"
              type="date"
              class="form-control form-control-sm"
              :value="dateFrom"
              @input="emit('update:dateFrom', ($event.target as HTMLInputElement).value)"
            />
            <span class="text-muted flex-shrink-0" aria-hidden="true">–</span>
            <input
              :id="`${idPrefix}-to`"
              type="date"
              class="form-control form-control-sm"
              :value="dateTo"
              @input="emit('update:dateTo', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <div class="row g-2 align-items-end mt-1">
        <div class="col-12">
          <label class="form-label" :for="`${idPrefix}-sort`">Urutkan</label>
          <div class="filter-sort-actions d-flex flex-wrap gap-2">
            <select
              :id="`${idPrefix}-sort`"
              class="form-select form-select-sm filter-sort-select"
              :value="sort"
              @change="emit('update:sort', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary filter-action-btn"
              :disabled="busy"
              @click="emit('reset')"
            >
              <i class="ri-refresh-line" aria-hidden="true"></i>
              <span>Reset</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary filter-action-btn"
              :disabled="busy"
              @click="emit('apply')"
            >
              <i class="ri-filter-3-line" aria-hidden="true"></i>
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <p v-if="hint" class="form-text small mb-0 mt-2">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceTabs from '~/components/common/WorkspaceTabs.vue'
import type { WorkspaceTab } from '~/types/workspaceTab'
import {
  PESANAN_ARCHIVED_ACTION,
  PESANAN_DOWNLOAD_ACTIONS,
  PESANAN_EMAIL_ACTION,
  type CommerceListToolbarAction,
} from '~/utils/commercePesananToolbar'

export type CommerceFilterOption = { value: string; label: string }

const props = withDefaults(
  defineProps<{
    title?: string
    tabs: WorkspaceTab[]
    activeTab: string
    tabsIdPrefix?: string
    secondaryTabs?: WorkspaceTab[]
    activeSecondaryTab?: string
    secondaryTabsIdPrefix?: string
    idPrefix?: string
    shops?: Array<{ id: string; name: string }>
    q?: string
    shopId?: string
    processingState?: string
    dateFrom?: string
    dateTo?: string
    sort?: string
    busy?: boolean
    searchPlaceholder?: string
    hint?: string
    showProcessing?: boolean
    processingLabel?: string
    showToolbar?: boolean
    archivedAction?: CommerceListToolbarAction
    emailAction?: CommerceListToolbarAction
    downloadActions?: CommerceListToolbarAction[]
    processingOptions?: CommerceFilterOption[]
    sortOptions?: CommerceFilterOption[]
  }>(),
  {
    title: 'Pesanan',
    tabsIdPrefix: 'omni-pesanan-status',
    secondaryTabs: () => [],
    activeSecondaryTab: 'all',
    secondaryTabsIdPrefix: 'omni-secondary',
    idPrefix: 'pesanan',
    shops: () => [],
    q: '',
    shopId: '',
    processingState: '',
    dateFrom: '',
    dateTo: '',
    sort: 'platform_created_at_desc',
    busy: false,
    searchPlaceholder: 'Produk, nomor pesanan, nomor resi, SKU',
    hint: 'Nominal = snapshot marketplace.',
    showProcessing: true,
    processingLabel: 'Processing SkyFlow',
    showToolbar: true,
    processingOptions: () => [
      { value: '', label: 'Semua' },
      { value: 'IMPORTED', label: 'IMPORTED' },
      { value: 'MAPPED', label: 'MAPPED' },
      { value: 'EXCEPTION', label: 'EXCEPTION' },
      { value: 'RELEASE_BLOCKED', label: 'RELEASE_BLOCKED' },
    ],
    sortOptions: () => [
      { value: 'platform_created_at_desc', label: 'Terbaru dibuat' },
      { value: 'platform_created_at_asc', label: 'Terlama dibuat' },
      { value: 'platform_updated_at_desc', label: 'Terbaru diubah' },
      { value: 'total_amount_desc', label: 'Nominal tertinggi' },
      { value: 'total_amount_asc', label: 'Nominal terendah' },
    ],
  }
)

const emit = defineEmits<{
  'update:activeTab': [id: string]
  'update:activeSecondaryTab': [id: string]
  'update:q': [v: string]
  'update:shopId': [v: string]
  'update:processingState': [v: string]
  'update:dateFrom': [v: string]
  'update:dateTo': [v: string]
  'update:sort': [v: string]
  apply: []
  reset: []
  toolbar: [key: string]
}>()

const archived = computed(() => props.archivedAction || PESANAN_ARCHIVED_ACTION)
const email = computed(() => props.emailAction || PESANAN_EMAIL_ACTION)
const downloads = computed(() => props.downloadActions || PESANAN_DOWNLOAD_ACTIONS)
</script>

<style scoped>
.btn-icon {
  width: calc(2.0001875rem + 2px);
  height: calc(2.0001875rem + 2px);
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.filter-sort-actions {
  align-items: stretch;
}
.filter-sort-select {
  flex: 1 1 12rem;
  min-width: 0;
  width: auto;
}
/* Match Vuexy .form-select-sm / .btn-sm vertical metrics. */
.filter-action-btn {
  --bs-btn-padding-y: calc(0.629rem - 1px);
  --bs-btn-font-size: 0.8125rem;
  --bs-btn-line-height: 1.375;
  box-sizing: border-box;
  flex: 0 0 auto;
  align-self: stretch;
  height: auto !important;
  min-height: 0 !important;
  padding-top: calc(0.629rem - 1px) !important;
  padding-bottom: calc(0.629rem - 1px) !important;
  font-size: 0.8125rem !important;
  line-height: 1.375 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}
.commerce-orders-filter-card :deep(.workspace-tabs) {
  border-bottom: 0;
}
.commerce-orders-filter-card .form-label {
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
}
</style>
