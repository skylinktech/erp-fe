import { describe, expect, it } from 'vitest'
import { getDismantleErrorLabel, getDismantleStatusBadge } from '~/utils/dismantleLabels'

describe('dismantleLabels', () => {
  it('maps known status separately from phase', () => {
    const status = getDismantleStatusBadge('in_progress')
    expect(status.text).toBe('Berjalan')
  })

  it('falls back safely for unknown error codes', () => {
    expect(getDismantleErrorLabel('STALE_DISMANTLE_VERSION')).toContain('berubah')
    expect(getDismantleErrorLabel('CUSTOM_CODE', 'Backend msg')).toBe('Backend msg')
  })
})
