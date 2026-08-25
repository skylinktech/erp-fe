<template>
  <div v-if="productRows.length" class="card border mb-4 bg-lighter">
    <div class="card-body py-3">
      <h6 class="mb-3 d-flex align-items-center gap-2">
        <i class="ri-bar-chart-horizontal-line text-primary"></i>
        Ringkasan stok item barang
      </h6>
      <div class="table-responsive">
        <table class="table table-sm table-borderless mb-0 align-middle">
          <thead>
            <tr class="text-muted small">
              <th>#</th>
              <th>Produk</th>
              <th>Gudang</th>
              <th class="text-end">On Hand</th>
              <th class="text-end">Diminta</th>
              <th class="text-center">Status Stok</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in productRows" :key="row.key">
              <td class="small">{{ row.index + 1 }}</td>
              <td class="small text-break">{{ row.productName }}</td>
              <td class="small text-muted">{{ row.warehouseName || '—' }}</td>
              <td class="text-end small fw-medium" :class="row.availableClass">
                {{ row.availableText }}
              </td>
              <td class="text-end small">{{ row.requestedText }}</td>
              <td class="text-center">
                <span :class="['badge', row.badgeClass]">{{ row.badgeText }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getStockInfoForLine,
  stockLineBadgeClass,
  stockLineBadgeLabel,
} from '~/utils/purchasing/stockAvailability'
import type { FormStockItemInput } from '~/utils/purchasing/stockAvailability'

const props = defineProps<{
  items: FormStockItemInput[]
  defaultWarehouseId?: number | null
  stockMap: Map<string, number>
  products?: Array<{ id: number; name?: string; sku?: string }>
  warehouses?: Array<{ id: number; name?: string; code?: string }>
}>()

function warehouseNameById(id: number | null | undefined) {
  if (!id || !props.warehouses?.length) return null
  const w = props.warehouses.find((x) => Number(x.id) === Number(id))
  if (!w) return null
  return `${w.name || ''}${w.code ? ` (${w.code})` : ''}`
}

const productRows = computed(() => {
  const rows: Array<{
    key: string
    index: number
    productName: string
    warehouseName: string | null
    availableText: string
    requestedText: string
    badgeClass: string
    badgeText: string
    availableClass: string
  }> = []

  props.items.forEach((item, index) => {
    if ((item.productType ?? 'product') !== 'product' || !item.productId) return

    const whId = item.warehouseId ?? props.defaultWarehouseId ?? null
    const product = props.products?.find((p) => Number(p.id) === Number(item.productId))
    const name = item.productName || product?.name || `Produk #${item.productId}`
    const sku = product?.sku ? `${product.sku} — ` : ''
    const info = getStockInfoForLine(
      props.stockMap,
      item.productId,
      whId,
      item.qty ?? 0,
      warehouseNameById(whId)
    )

    let badgeText = 'Belum dicek'
    let badgeClass = 'bg-label-secondary'
    let availableText = '—'
    let availableClass = ''

    if (info.status !== 'pending') {
      badgeText = stockLineBadgeLabel(info.status)
      badgeClass = stockLineBadgeClass(info.status)
      availableText = String(Math.floor(info.availableQty))
      availableClass =
        info.status === 'sufficient'
          ? 'text-success'
          : info.status === 'insufficient'
            ? 'text-warning'
            : 'text-danger'
    }

    rows.push({
      key: `${index}-${item.productId}-${whId}`,
      index,
      productName: `${sku}${name}`,
      warehouseName: info.warehouseName ?? warehouseNameById(whId),
      availableText,
      requestedText: String(Math.floor(info.requestedQty)),
      badgeClass,
      badgeText,
      availableClass,
    })
  })

  return rows
})
</script>
