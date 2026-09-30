import { onBeforeUnmount, ref } from 'vue'
import { isTerminalJobStatus } from '~/utils/commerceActionBusy'

export type CommerceJobWatchRow = {
  id: string
  status: string
  lastError?: string | null
  commandType?: string | null
}

type WatchEntry = {
  jobId: string
  action: string
  targetId: string
  onUpdate: (row: CommerceJobWatchRow) => void
}

/**
 * Batch-poll commerce sync jobs (anti N+1). One interval for all watched IDs.
 * Timeout → unconfirmed callback; does NOT imply job failure.
 */
export function useCommerceJobWatch(opts: {
  fetchJobs: (jobIds: string[]) => Promise<CommerceJobWatchRow[]>
  intervalMs?: number
  timeoutMs?: number
  onUnconfirmed?: (entry: { jobId: string; action: string; targetId: string }) => void
}) {
  const watching = ref<Record<string, WatchEntry>>({})
  let timer: ReturnType<typeof setInterval> | null = null
  let startedAt: Record<string, number> = {}
  const intervalMs = opts.intervalMs ?? 4000
  const timeoutMs = opts.timeoutMs ?? 120_000

  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function ensureTimer() {
    if (timer || !Object.keys(watching.value).length) return
    timer = setInterval(() => {
      void tick()
    }, intervalMs)
  }

  async function tick() {
    const entries = Object.values(watching.value)
    if (!entries.length) {
      stopTimer()
      return
    }
    const now = Date.now()
    const timedOut: WatchEntry[] = []
    const active: WatchEntry[] = []
    for (const e of entries) {
      const t0 = startedAt[e.jobId] || now
      if (now - t0 >= timeoutMs) timedOut.push(e)
      else active.push(e)
    }
    for (const e of timedOut) {
      opts.onUnconfirmed?.({ jobId: e.jobId, action: e.action, targetId: e.targetId })
      unwatch(e.jobId)
    }
    if (!active.length) return
    try {
      const rows = await opts.fetchJobs(active.map((e) => e.jobId))
      const byId = new Map(rows.map((r) => [String(r.id), r]))
      for (const e of active) {
        const row = byId.get(e.jobId)
        if (!row) continue
        e.onUpdate(row)
        if (isTerminalJobStatus(row.status)) unwatch(e.jobId)
      }
    } catch {
      /* keep watching — transient read failure ≠ job fail */
    }
  }

  function watch(input: {
    jobId: string
    action: string
    targetId: string
    onUpdate: (row: CommerceJobWatchRow) => void
  }) {
    const id = String(input.jobId)
    watching.value = {
      ...watching.value,
      [id]: {
        jobId: id,
        action: input.action,
        targetId: String(input.targetId),
        onUpdate: input.onUpdate,
      },
    }
    startedAt[id] = Date.now()
    ensureTimer()
    void tick()
  }

  function unwatch(jobId: string) {
    const id = String(jobId)
    if (!watching.value[id]) return
    const next = { ...watching.value }
    delete next[id]
    watching.value = next
    delete startedAt[id]
    if (!Object.keys(next).length) stopTimer()
  }

  function clear() {
    watching.value = {}
    startedAt = {}
    stopTimer()
  }

  onBeforeUnmount(clear)

  return { watch, unwatch, clear, watching }
}
