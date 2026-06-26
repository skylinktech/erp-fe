import { ref, watch, type Ref } from 'vue'
import type { StockAvailabilityResult } from '~/types/purchasing/stock-availability'

export function usePurchaseRequestStockAvailability(
  purchaseRequestId: Ref<string | number | null | undefined>,
  options?: { enabled?: Ref<boolean> }
) {
  const result = ref<StockAvailabilityResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAvailability(id?: string | number | null) {
    const targetId = id ?? purchaseRequestId.value
    if (!targetId) {
      result.value = null
      return
    }

    loading.value = true
    error.value = null
    const { $api } = useNuxtApp()

    try {
      const response = await fetch($api.purchaseRequestStockAvailability(targetId), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message || 'Gagal memeriksa stok')
      }
      const json = await response.json()
      result.value = (json.data ?? json) as StockAvailabilityResult
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof (e as { message?: unknown })?.message === 'string'
            ? (e as { message: string }).message
            : 'Gagal memeriksa stok'
      error.value = msg
      result.value = null
    } finally {
      loading.value = false
    }
  }

  const enabled = options?.enabled

  if (enabled) {
    watch(
      [purchaseRequestId, enabled],
      ([id, isOn]) => {
        if (isOn && id) fetchAvailability(id)
        else if (!isOn) {
          result.value = null
          error.value = null
        }
      },
      { immediate: true }
    )
  } else {
    watch(
      purchaseRequestId,
      (id) => {
        if (id) fetchAvailability(id)
        else result.value = null
      },
      { immediate: true }
    )
  }

  return {
    result,
    loading,
    error,
    refresh: fetchAvailability,
  }
}
