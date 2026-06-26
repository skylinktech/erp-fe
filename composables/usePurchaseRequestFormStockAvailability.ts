import { computed, type Ref } from 'vue'
import type { StockAvailabilityResult } from '~/types/purchasing/stock-availability'
import { evaluateFormItemsStock } from '~/utils/purchasing/stockAvailability'
import type { FormStockItemInput } from '~/utils/purchasing/stockAvailability'

export function usePurchaseRequestFormStockAvailability(
  form: Ref<{
    warehouseId?: number | null
    purchaseRequestItems?: FormStockItemInput[]
  }>,
  stockMap: Ref<Map<string, number>>,
  products: Ref<Array<{ id: number; sku?: string; name?: string }>>,
  warehouses: Ref<Array<{ id: number; name?: string; code?: string }>>,
  options?: { enabled?: Ref<boolean> }
) {
  const enabled = options?.enabled

  const result = computed<StockAvailabilityResult | null>(() => {
    if (enabled && !enabled.value) return null
    if (!stockMap.value.size && !form.value.purchaseRequestItems?.length) return null
    return evaluateFormItemsStock(
      form.value.purchaseRequestItems ?? [],
      form.value.warehouseId,
      stockMap.value,
      products.value,
      warehouses.value
    )
  })

  const hasStockableItems = computed(() => !!result.value?.hasStockableItems)

  return {
    result,
    loading: computed(() => false),
    error: computed(() => null as string | null),
    hasStockableItems,
    refresh: () => {},
  }
}
