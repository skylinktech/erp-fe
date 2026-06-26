<template>
  <div v-if="showPanel" class="pr-stock-info rounded border px-3 py-3 mb-0" :class="panelClass">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <span class="fw-medium small d-flex align-items-center gap-1">
        <i class="ri-stack-line text-primary"></i>
        Informasi stok
      </span>
      <span :class="['badge', badgeClass]">{{ badgeText }}</span>
    </div>

    <div v-if="info.status === 'pending'" class="small text-muted mb-0">
      <i class="ri-information-line me-1"></i>
      Pilih <strong>produk katalog</strong> dan <strong>gudang</strong> (atau gunakan gudang default PR) untuk melihat stok.
    </div>

    <div v-else class="row g-2 small mb-0">
      <div class="col-sm-4">
        <span class="text-muted d-block">Gudang</span>
        <span class="fw-medium">{{ info.warehouseName || '—' }}</span>
      </div>
      <div class="col-sm-4">
        <span class="text-muted d-block">Stok tersedia</span>
        <span class="fw-medium" :class="availableClass">{{ formatQty(info.availableQty) }}</span>
      </div>
      <div class="col-sm-4">
        <span class="text-muted d-block">Qty diminta</span>
        <span class="fw-medium">{{ formatQty(info.requestedQty) }}</span>
      </div>
      <div v-if="info.status !== 'sufficient'" class="col-12">
        <span class="text-muted">Kekurangan:</span>
        <span class="fw-semibold text-danger ms-1">{{ formatQty(info.shortfall) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getStockInfoForLine, stockLineBadgeClass } from '~/utils/purchasing/stockAvailability'
import type { LineStockInfo } from '~/utils/purchasing/stockAvailability'

const props = defineProps<{
  productType?: string
  productId?: number | null
  warehouseId?: number | null
  defaultWarehouseId?: number | null
  qty?: number
  stockMap: Map<string, number>
  warehouses?: Array<{ id: number; name?: string; code?: string }>
}>()

const showPanel = computed(() => (props.productType ?? 'product') === 'product')

const resolvedWarehouseId = computed(
  () => props.warehouseId ?? props.defaultWarehouseId ?? null
)

const warehouseName = computed(() => {
  const id = resolvedWarehouseId.value
  if (!id || !props.warehouses?.length) return null
  const w = props.warehouses.find((x) => Number(x.id) === Number(id))
  if (!w) return null
  return `${w.name || ''}${w.code ? ` (${w.code})` : ''}`
})

const info = computed<LineStockInfo>(() =>
  getStockInfoForLine(
    props.stockMap,
    props.productId,
    resolvedWarehouseId.value,
    props.qty ?? 0,
    warehouseName.value
  )
)

const badgeClass = computed(() => {
  if (info.value.status === 'pending') return 'bg-label-secondary'
  return stockLineBadgeClass(
    info.value.status === 'pending' ? 'skipped' : info.value.status
  )
})

const badgeText = computed(() => {
  if (info.value.status === 'pending') return 'Belum dicek'
  if (info.value.status === 'sufficient') return 'Mencukupi'
  return 'Tidak mencukupi'
})

const panelClass = computed(() => {
  switch (info.value.status) {
    case 'sufficient':
      return 'pr-stock-info--ok border-success border-opacity-25 bg-label-success'
    case 'insufficient':
      return 'pr-stock-info--warn border-warning border-opacity-25 bg-label-warning'
    case 'not_found':
      return 'pr-stock-info--bad border-danger border-opacity-25 bg-label-danger'
    default:
      return 'bg-lighter'
  }
})

const availableClass = computed(() => {
  if (info.value.status === 'sufficient') return 'text-success'
  if (info.value.status === 'insufficient') return 'text-warning'
  if (info.value.status === 'not_found') return 'text-danger'
  return ''
})

function formatQty(n: number) {
  return Number.isFinite(n) ? String(Math.floor(n)) : '0'
}
</script>

<style scoped>
.pr-stock-info--ok,
.pr-stock-info--warn,
.pr-stock-info--bad {
  background-color: rgba(var(--bs-body-color-rgb, 67, 89, 113), 0.04);
}
</style>
