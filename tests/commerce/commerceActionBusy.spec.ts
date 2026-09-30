/**
 * Unit tests for Omnichannel keyed action busy helpers (no live API).
 */
import { describe, expect, it } from 'vitest'
import {
  commerceActionKey,
  commerceActionPhaseLabel,
  commerceActionRunningLabel,
  isTerminalJobStatus,
  mapJobStatusToPhase,
  parseCommerceActionKey,
} from '../../utils/commerceActionBusy'

describe('commerceActionBusy keys & labels', () => {
  it('builds stable action:target:company keys', () => {
    expect(commerceActionKey('validate', 'draft-1', 9)).toBe('validate:draft-1:9')
    expect(commerceActionKey('sync', null, null)).toBe('sync:_:_')
    expect(parseCommerceActionKey('sync-orders:shop-a:12')).toEqual({
      action: 'sync-orders',
      targetId: 'shop-a',
      companyId: '12',
    })
  })

  it('returns running / phase labels for sync & validate', () => {
    expect(commerceActionRunningLabel('validate')).toBe('Memvalidasi…')
    expect(commerceActionRunningLabel('sync')).toBe('Menyinkronkan…')
    expect(commerceActionPhaseLabel('sync', 'queued')).toBe('Dalam antrean')
    expect(commerceActionPhaseLabel('sync', 'processing')).toBe('Sedang diproses')
    expect(commerceActionPhaseLabel('publish', 'unconfirmed')).toBe('Belum terkonfirmasi')
    expect(commerceActionPhaseLabel('publish', 'ambiguous')).toBe('Ambigu — cek status')
  })

  it('maps job statuses to phases and terminals', () => {
    expect(mapJobStatusToPhase('PENDING')).toBe('queued')
    expect(mapJobStatusToPhase('PROCESSING')).toBe('processing')
    expect(mapJobStatusToPhase('DONE')).toBe('done')
    expect(mapJobStatusToPhase('DEAD')).toBe('error')
    expect(mapJobStatusToPhase('AMBIGUOUS')).toBe('ambiguous')
    expect(isTerminalJobStatus('DONE')).toBe(true)
    expect(isTerminalJobStatus('PROCESSING')).toBe(false)
    expect(isTerminalJobStatus('PENDING')).toBe(false)
  })

  it('request-gen stale guard: older gen must be ignored', () => {
    let requestGen = 0
    const bump = () => ++requestGen
    const isCurrent = (g: number) => g === requestGen
    const g1 = bump()
    const g2 = bump()
    expect(isCurrent(g1)).toBe(false)
    expect(isCurrent(g2)).toBe(true)
    // Simulate late response from g1 must not win
    const apply = (gen: number, value: string, sink: { v: string }) => {
      if (!isCurrent(gen)) return
      sink.v = value
    }
    const sink = { v: 'fresh' }
    apply(g1, 'stale', sink)
    expect(sink.v).toBe('fresh')
    apply(g2, 'ok', sink)
    expect(sink.v).toBe('ok')
  })
})
