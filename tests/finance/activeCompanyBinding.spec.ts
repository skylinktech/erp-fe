import { describe, it, expect } from 'vitest'
import {
  bindActiveCompany,
  formatActiveCompanyLabel,
  requireActiveCompanyId,
} from '../../utils/activeCompanyBinding'

describe('activeCompanyBinding', () => {
  it('formats label with name and code', () => {
    expect(formatActiveCompanyLabel({ name: 'PT A', code: 'A' }, 9)).toBe('PT A (A)')
    expect(formatActiveCompanyLabel(null, 9)).toBe('Perusahaan #9')
    expect(formatActiveCompanyLabel(null, null)).toBe('Belum dipilih')
  })

  it('binds ready company fail-closed', () => {
    const ok = bindActiveCompany({
      companyId: 12,
      company: { id: 12, code: 'RTL', name: 'Retail Co' },
      initialized: true,
    })
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.companyId).toBe(12)
      expect(ok.label).toContain('Retail Co')
    }
  })

  it('requires selection when multi-company', () => {
    const blocked = bindActiveCompany({
      companyId: null,
      company: null,
      selectionRequired: true,
      initialized: true,
    })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) {
      expect(blocked.code).toBe('COMPANY_CONTEXT_REQUIRED')
    }
  })

  it('never invents a company id', () => {
    expect(
      bindActiveCompany({ companyId: 0, company: null, initialized: true }).ok
    ).toBe(false)
    expect(
      bindActiveCompany({ companyId: null, company: null, initialized: true }).ok
    ).toBe(false)
  })

  it('requireActiveCompanyId throws with stable code', () => {
    try {
      requireActiveCompanyId({ companyId: null, company: null, initialized: true })
      expect.fail('should throw')
    } catch (error: any) {
      expect(error.code).toBe('COMPANY_CONTEXT_REQUIRED')
    }
  })
})
