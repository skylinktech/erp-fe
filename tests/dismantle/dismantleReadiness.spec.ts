import { describe, expect, it } from 'vitest'
import { normalizeReadiness } from '~/utils/dismantleAdapter'

describe('dismantle readiness normalization', () => {
  it('maps eligible and blockers from backend payload', () => {
    const r = normalizeReadiness({
      eligible: false,
      blockers: [{ code: 'CUSTODY_OPEN', message: 'Open custody' }],
      warnings: [{ code: 'AR_OUTSTANDING', message: 'AR due' }],
    })
    expect(r.eligible).toBe(false)
    expect(r.blockers).toHaveLength(1)
    expect(r.blockers[0].code).toBe('CUSTODY_OPEN')
    expect(r.warnings[0].code).toBe('AR_OUTSTANDING')
  })

  it('completion button should stay disabled when eligible is false', () => {
    const r = normalizeReadiness({ eligible: false, blockers: [{ code: 'X', message: 'blocked' }] })
    expect(r.eligible).toBe(false)
  })
})
