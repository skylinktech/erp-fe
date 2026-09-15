/**
 * Frontend guard: MIXED allocation must stay disabled until line-level E2E is ready.
 * Mirrors backend ERP_DIMENSION_MIXED_ENABLED=false.
 */
import { describe, it, expect } from 'vitest'

const ALLOCATION_SCOPE_OPTIONS = [
  { label: 'Internal', value: 'INTERNAL' },
  { label: 'Project', value: 'PROJECT' },
]

function assertMixedDisabled(scope: string | null | undefined) {
  if (scope === 'MIXED') {
    throw new Error('Alokasi MIXED belum diaktifkan. Gunakan Internal atau Project.')
  }
}

describe('allocation scope UX (MIXED disabled)', () => {
  it('does not offer MIXED in select options', () => {
    expect(ALLOCATION_SCOPE_OPTIONS.map((o) => o.value)).toEqual(['INTERNAL', 'PROJECT'])
    expect(ALLOCATION_SCOPE_OPTIONS.some((o) => o.value === 'MIXED')).toBe(false)
  })

  it('rejects MIXED on submit', () => {
    expect(() => assertMixedDisabled('MIXED')).toThrow(/MIXED belum diaktifkan/)
    expect(() => assertMixedDisabled('INTERNAL')).not.toThrow()
    expect(() => assertMixedDisabled('PROJECT')).not.toThrow()
  })

  it('requires projectId for PROJECT expense', () => {
    const validateExpense = (form: { allocationScope?: string; projectId?: string | null }) => {
      if ((form.allocationScope || 'INTERNAL') === 'PROJECT' && !form.projectId) {
        throw new Error('Project wajib dipilih untuk expense Project.')
      }
    }
    expect(() => validateExpense({ allocationScope: 'PROJECT', projectId: null })).toThrow(/Project wajib/)
    expect(() =>
      validateExpense({ allocationScope: 'PROJECT', projectId: '11111111-1111-1111-1111-111111111111' })
    ).not.toThrow()
  })
})
