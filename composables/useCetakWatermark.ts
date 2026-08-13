import {
  onBeforeUnmount,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { PrintDocumentType } from '~/constants/print/documents'
import {
  resolvePrintWatermark,
  type PrintWatermarkLabel,
} from '~/constants/print/watermark'

const CETAK_WATERMARK_KEY = 'cetak-print-watermark'

function useCetakWatermarkState() {
  return useState<PrintWatermarkLabel | null>(CETAK_WATERMARK_KEY, () => null)
}

/** Layout reads this to render the overlay. */
export function useCetakWatermarkVisible() {
  return useCetakWatermarkState()
}

/**
 * Register document status with the shared print watermark overlay.
 * Clears automatically on unmount.
 */
export function useRegisterCetakWatermark(
  typeSource: MaybeRefOrGetter<PrintDocumentType>,
  statusSource: MaybeRefOrGetter<unknown>
) {
  const watermark = useCetakWatermarkState()

  watch(
    () => [toValue(typeSource), toValue(statusSource)] as const,
    ([type, status]) => {
      watermark.value = resolvePrintWatermark(type, status)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    watermark.value = null
  })

  return watermark
}

export { resolvePrintWatermark }
export type { PrintWatermarkLabel }
