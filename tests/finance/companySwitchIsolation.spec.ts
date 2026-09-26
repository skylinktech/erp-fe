import { describe, expect, it } from 'vitest'
import {
  shouldApplyCompanyPayload,
  parsePersistedCompanyId,
} from '~/utils/companyContextSync'

describe('company context switch isolation', () => {
  it('drops stale payload after generation bump (company switch)', () => {
    const genBefore = 3
    expect(shouldApplyCompanyPayload(genBefore, 3)).toBe(true)
    // clearCompanyScopedCaches / applyPayload bumps generation
    const genAfter = 4
    expect(shouldApplyCompanyPayload(genAfter, 3)).toBe(false)
  })

  it('parses persisted active company id fail-closed', () => {
    expect(parsePersistedCompanyId(null)).toBeNull()
    expect(parsePersistedCompanyId('')).toBeNull()
    expect(parsePersistedCompanyId('0')).toBeNull()
    expect(parsePersistedCompanyId('-1')).toBeNull()
    expect(parsePersistedCompanyId('12')).toBe(12)
  })
})
