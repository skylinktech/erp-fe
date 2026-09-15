import { describe, expect, it } from 'vitest'

/**
 * Quotation: one Site required; no Cost Center; services filtered by site.
 */
function buildQuotationPayload(form: Record<string, unknown>) {
  const dataToAppend = { ...form }
  delete dataToAppend.costCenter
  delete dataToAppend.costCenterId
  delete dataToAppend.customer
  delete dataToAppend.site
  delete dataToAppend.siteInvest

  const errors: string[] = []
  if (!dataToAppend.siteInvestId) errors.push('Site Investment harus dipilih')
  if (!dataToAppend.customerId) errors.push('Customer harus dipilih')
  if (!dataToAppend.siteId) errors.push('Site harus dipilih')
  if (!dataToAppend.up || String(dataToAppend.up).trim() === '') {
    errors.push('Untuk Perhatian harus diisi')
  }
  if (!dataToAppend.date) errors.push('Tanggal Quotation harus diisi')

  return { dataToAppend, errors }
}

function filterServicesBySite(
  services: Array<{ id: number; siteId: number; name: string }>,
  siteId: number | null
) {
  if (!siteId) return []
  return services.filter((s) => Number(s.siteId) === Number(siteId))
}

function assertApprovedSiteImmutable(
  status: string,
  currentSiteId: number,
  incomingSiteId: number
): string | null {
  if (String(status).toLowerCase() !== 'approved') return null
  if (Number(currentSiteId) !== Number(incomingSiteId)) {
    return 'FINAL_QUOTATION_SITE_IMMUTABLE'
  }
  return null
}

describe('Quotation without Cost Center', () => {
  it('allows create payload without costCenterId', () => {
    const { dataToAppend, errors } = buildQuotationPayload({
      siteInvestId: 'si-1',
      customerId: 1,
      siteId: 2,
      up: 'Bapak',
      date: '2026-09-14',
      status: 'draft',
      costCenterId: 99,
      costCenter: { id: 99, name: 'Legacy' },
    })

    expect(errors).toEqual([])
    expect(dataToAppend).not.toHaveProperty('costCenterId')
    expect(dataToAppend).not.toHaveProperty('costCenter')
  })

  it('still requires commercial context fields', () => {
    const { errors } = buildQuotationPayload({
      up: '',
      date: null,
    })
    expect(errors).toContain('Site Investment harus dipilih')
    expect(errors).toContain('Customer harus dipilih')
    expect(errors).toContain('Site harus dipilih')
    expect(errors).toContain('Untuk Perhatian harus diisi')
    expect(errors).toContain('Tanggal Quotation harus diisi')
    expect(errors.some((e) => /cost center/i.test(e))).toBe(false)
  })

  it('filters services by selected Site only', () => {
    const services = [
      { id: 1, siteId: 10, name: 'A' },
      { id: 2, siteId: 20, name: 'B' },
      { id: 3, siteId: 10, name: 'C' },
    ]
    expect(filterServicesBySite(services, 10).map((s) => s.id)).toEqual([1, 3])
    expect(filterServicesBySite(services, null)).toEqual([])
  })

  it('blocks site change on approved quotation', () => {
    expect(assertApprovedSiteImmutable('approved', 10, 11)).toBe('FINAL_QUOTATION_SITE_IMMUTABLE')
    expect(assertApprovedSiteImmutable('approved', 10, 10)).toBeNull()
    expect(assertApprovedSiteImmutable('draft', 10, 11)).toBeNull()
  })
})
