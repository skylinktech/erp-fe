import {
  onBeforeUnmount,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'

/** HRD modules (cuti / lembur / perjalanan dinas) use numeric status; 11 = draft. */
const HRD_DRAFT_STATUS = 11

const CETAK_DRAFT_STATE_KEY = 'cetak-draft-watermark'

/**
 * Normalize document status from various modules into a draft flag.
 * Supports string `"draft"` and HRD numeric `11` (also numeric string).
 */
export function isDraftDocumentStatus(status: unknown): boolean {
  if (status === null || status === undefined || status === '') return false

  if (typeof status === 'number') {
    return status === HRD_DRAFT_STATUS
  }

  const normalized = String(status).trim().toLowerCase()
  if (normalized === 'draft') return true

  if (/^\d+$/.test(normalized)) {
    return Number(normalized) === HRD_DRAFT_STATUS
  }

  return false
}

function useCetakDraftFlag() {
  return useState<boolean>(CETAK_DRAFT_STATE_KEY, () => false)
}

/** Layout reads this to show/hide the DRAFT watermark. */
export function useCetakDraftWatermarkVisible() {
  return useCetakDraftFlag()
}

/**
 * Register the current document status with the shared cetak layout.
 * Call once per cetak page; clears automatically on unmount (avoids stale watermark).
 */
export function useRegisterCetakDraftStatus(statusSource: MaybeRefOrGetter<unknown>) {
  const isDraft = useCetakDraftFlag()

  watch(
    () => toValue(statusSource),
    (status) => {
      isDraft.value = isDraftDocumentStatus(status)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    isDraft.value = false
  })

  return isDraft
}
