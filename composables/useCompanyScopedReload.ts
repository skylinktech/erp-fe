import { computed, watch, type WatchStopHandle } from 'vue'
import { useCompanyContextStore } from '~/stores/companyContext'
import { COMPANY_CONTEXT_EVENT } from '~/utils/companyContextSync'

/**
 * Reload company-scoped lists/summaries when Active Company changes.
 * Uses generation so in-flight responses from the previous company are ignored.
 */
export function useCompanyScopedReload(reload: (companyId: number, generation: number) => void | Promise<void>) {
  const store = useCompanyContextStore()
  const companyId = computed(() => store.companyId)
  const generation = computed(() => store.generation)

  let stop: WatchStopHandle | null = null

  function start() {
    stop = watch(
      [companyId, generation],
      async ([id, gen]) => {
        if (!id || id <= 0) return
        await reload(id, gen)
      },
      { immediate: true }
    )
    return stop
  }

  function isCurrent(expectedGeneration: number) {
    return store.generation === expectedGeneration
  }

  return {
    companyId,
    generation,
    start,
    stop: () => stop?.(),
    isCurrent,
  }
}

/** Listen for cross-tab / switcher company change without duplicating store logic. */
export function onCompanyContextChanged(handler: () => void) {
  if (typeof window === 'undefined') return () => {}
  const listener = () => handler()
  window.addEventListener(COMPANY_CONTEXT_EVENT, listener)
  return () => window.removeEventListener(COMPANY_CONTEXT_EVENT, listener)
}
