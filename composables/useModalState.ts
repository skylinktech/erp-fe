import { computed, toValue, type MaybeRefOrGetter, type WritableComputedRef } from 'vue'

/**
 * v-model helper for store-backed modals.
 * Opening still goes through store.openModal(); every close path calls closeModal().
 */
export function useModalState(
  showModal: MaybeRefOrGetter<boolean>,
  closeModal: () => void
): WritableComputedRef<boolean> {
  return computed({
    get: () => Boolean(toValue(showModal)),
    set: (open: boolean) => {
      if (!open) closeModal()
    },
  })
}
