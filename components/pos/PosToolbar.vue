<template>
  <header class="card card-body py-2 px-3 mb-3 sf-pos-toolbar">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div class="d-flex flex-wrap align-items-center gap-2 min-w-0">
        <h1 class="h5 mb-0">POS</h1>
        <span class="badge bg-label-primary">{{ companyLabel || '—' }}</span>
        <div class="pos-toolbar-warehouse" style="min-width: 12rem; max-width: 18rem">
          <WarehouseSelect
            :model-value="warehouseId"
            :company-id="companyId"
            :disabled="!companyReady"
            placeholder="Pilih gudang…"
            @update:model-value="$emit('update:warehouseId', $event)"
          />
        </div>
        <span v-if="cashierName" class="small text-muted text-truncate">Kasir: {{ cashierName }}</span>
      </div>
      <div class="d-flex flex-wrap align-items-center gap-2">
        <NuxtLink to="/sales/retail-sale" class="btn btn-outline-secondary btn-sm">
          Riwayat Transaksi
        </NuxtLink>
        <button
          type="button"
          class="btn btn-outline-primary btn-sm"
          :aria-pressed="isFullscreen"
          @click="$emit('toggle-fullscreen')"
        >
          {{ isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen Terminal' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import WarehouseSelect from '~/components/reference/WarehouseSelect.vue'

defineProps<{
  companyId: number | null
  companyReady: boolean
  companyLabel: string
  warehouseId: number | null
  cashierName: string
  isFullscreen: boolean
}>()

defineEmits<{
  'update:warehouseId': [value: number | null]
  'toggle-fullscreen': []
}>()
</script>
