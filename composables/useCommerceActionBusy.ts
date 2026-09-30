import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import {
  COMMERCE_TARGET_CONFLICT_ACTIONS,
  commerceActionKey,
  commerceActionPhaseLabel,
  commerceActionRunningLabel,
  mapJobStatusToPhase,
  parseCommerceActionKey,
  type CommerceActionPhase,
} from '~/utils/commerceActionBusy'

export type RunCommerceActionOptions = {
  runningLabel?: string
  /** When true, keep busy until clear()/watchJob finishes — for enqueue→poll flows */
  keepBusyUntilClear?: boolean
}

/**
 * Keyed busy registry for Omnichannel actions.
 * - Per target loading (not one global boolean)
 * - Double-submit guard per key
 * - Request-generation for stale read responses
 */
export function useCommerceActionBusy(opts?: { companyId?: Ref<string | number | null | undefined> }) {
  const busyMap = ref<Record<string, true>>({})
  const phaseMap = ref<Record<string, CommerceActionPhase>>({})
  const labelMap = ref<Record<string, string>>({})
  const jobByKey = ref<Record<string, string>>({})
  let requestGen = 0

  const anyBusy = computed(() => Object.keys(busyMap.value).length > 0)

  function key(action: string, targetId?: string | number | null) {
    return commerceActionKey(action, targetId, opts?.companyId?.value)
  }

  function isBusy(actionOrKey: string, targetId?: string | number | null) {
    const k = targetId !== undefined || !actionOrKey.includes(':') ? key(actionOrKey, targetId) : actionOrKey
    return Boolean(busyMap.value[k])
  }

  function phaseOf(actionOrKey: string, targetId?: string | number | null): CommerceActionPhase {
    const k = targetId !== undefined || !actionOrKey.includes(':') ? key(actionOrKey, targetId) : actionOrKey
    return phaseMap.value[k] || 'idle'
  }

  function labelOf(actionOrKey: string, targetId?: string | number | null, idleFallback?: string) {
    const k = targetId !== undefined || !actionOrKey.includes(':') ? key(actionOrKey, targetId) : actionOrKey
    if (labelMap.value[k]) return labelMap.value[k]
    const { action } = parseCommerceActionKey(k)
    return commerceActionPhaseLabel(action, phaseMap.value[k] || 'idle', idleFallback)
  }

  function isTargetBusy(targetId: string | number | null | undefined) {
    if (targetId == null || targetId === '') return false
    const needle = `:${String(targetId)}:`
    return Object.keys(busyMap.value).some((k) => k.includes(needle))
  }

  function busyActionForTarget(targetId: string | number | null | undefined): string | null {
    if (targetId == null || targetId === '') return null
    const needle = `:${String(targetId)}:`
    const hit = Object.keys(busyMap.value).find((k) => k.includes(needle))
    return hit ? parseCommerceActionKey(hit).action : null
  }

  function isConflicted(action: string, targetId?: string | number | null) {
    if (!targetId && targetId !== 0) return false
    if (!COMMERCE_TARGET_CONFLICT_ACTIONS.has(action)) return false
    const active = busyActionForTarget(targetId)
    return Boolean(active && active !== action)
  }

  function setBusy(k: string, phase: CommerceActionPhase, label?: string) {
    busyMap.value = { ...busyMap.value, [k]: true }
    phaseMap.value = { ...phaseMap.value, [k]: phase }
    if (label) labelMap.value = { ...labelMap.value, [k]: label }
  }

  function clear(k: string) {
    if (!busyMap.value[k] && !phaseMap.value[k]) return
    const nextBusy = { ...busyMap.value }
    const nextPhase = { ...phaseMap.value }
    const nextLabel = { ...labelMap.value }
    const nextJob = { ...jobByKey.value }
    delete nextBusy[k]
    delete nextPhase[k]
    delete nextLabel[k]
    delete nextJob[k]
    busyMap.value = nextBusy
    phaseMap.value = nextPhase
    labelMap.value = nextLabel
    jobByKey.value = nextJob
  }

  function clearAll() {
    busyMap.value = {}
    phaseMap.value = {}
    labelMap.value = {}
    jobByKey.value = {}
  }

  function bumpRequestGen() {
    requestGen += 1
    return requestGen
  }

  function isCurrentGen(gen: number) {
    return gen === requestGen
  }

  async function run<T>(
    action: string,
    targetId: string | number | null | undefined,
    fn: () => Promise<T>,
    options?: RunCommerceActionOptions
  ): Promise<T | undefined> {
    const k = key(action, targetId)
    if (busyMap.value[k]) return undefined
    const runningLabel = options?.runningLabel || commerceActionRunningLabel(action)
    setBusy(k, 'running', runningLabel)
    try {
      const result = await fn()
      if (!options?.keepBusyUntilClear) {
        clear(k)
      } else {
        phaseMap.value = { ...phaseMap.value, [k]: 'queued' }
        labelMap.value = {
          ...labelMap.value,
          [k]: commerceActionPhaseLabel(action, 'queued'),
        }
      }
      return result
    } catch (err) {
      clear(k)
      throw err
    }
  }

  function markQueued(action: string, targetId: string | number | null | undefined, jobId?: string | null) {
    const k = key(action, targetId)
    setBusy(k, 'queued', commerceActionPhaseLabel(action, 'queued'))
    if (jobId) jobByKey.value = { ...jobByKey.value, [k]: String(jobId) }
  }

  function markPhase(
    action: string,
    targetId: string | number | null | undefined,
    phase: CommerceActionPhase,
    label?: string
  ) {
    const k = key(action, targetId)
    if (phase === 'idle' || phase === 'done') {
      clear(k)
      return
    }
    setBusy(k, phase, label || commerceActionPhaseLabel(action, phase))
  }

  function applyJobStatus(action: string, targetId: string | number | null | undefined, status: string) {
    const phase = mapJobStatusToPhase(status)
    const k = key(action, targetId)
    if (phase === 'done' || phase === 'error') {
      clear(k)
      return phase
    }
    setBusy(k, phase, commerceActionPhaseLabel(action, phase))
    return phase
  }

  onBeforeUnmount(() => {
    bumpRequestGen()
    clearAll()
  })

  return {
    busyMap,
    phaseMap,
    labelMap,
    jobByKey,
    anyBusy,
    key,
    isBusy,
    phaseOf,
    labelOf,
    isTargetBusy,
    busyActionForTarget,
    isConflicted,
    run,
    clear,
    clearAll,
    markQueued,
    markPhase,
    applyJobStatus,
    bumpRequestGen,
    isCurrentGen,
  }
}
