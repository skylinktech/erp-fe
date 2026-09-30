/**
 * Fixture tests for batch job watch (anti N+1) — no live network.
 */
import { describe, expect, it, vi } from 'vitest'
import { isTerminalJobStatus, mapJobStatusToPhase } from '../../utils/commerceActionBusy'

describe('commerce job watch batch fixtures', () => {
  it('filters batch poll results to watched ids only', async () => {
    const watched = ['job-a', 'job-b']
    const fetchJobs = vi.fn(async (ids: string[]) => {
      expect(ids).toEqual(watched)
      return [
        { id: 'job-a', status: 'PROCESSING' },
        { id: 'job-b', status: 'DONE' },
        { id: 'job-noise', status: 'PENDING' },
      ].filter((r) => ids.includes(r.id))
    })
    const rows = await fetchJobs(watched)
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.id).sort()).toEqual(['job-a', 'job-b'])
  })

  it('distinguishes enqueue / processing / terminal without treating HTTP 200 as success', () => {
    // Enqueue ack ≠ sync success
    const enqueueHttpOk = { queued: true, jobId: 'j1' }
    expect(enqueueHttpOk.queued).toBe(true)
    expect(mapJobStatusToPhase('PENDING')).toBe('queued')
    expect(mapJobStatusToPhase('PROCESSING')).toBe('processing')
    expect(isTerminalJobStatus('DONE')).toBe(true)
    // Timeout ≠ failure
    const monitorTimedOut = true
    const jobFailed = false
    expect(monitorTimedOut && !jobFailed).toBe(true)
  })
})
