/**
 * Documents actual backend lookup response shapes used by dismantle wizard.
 * Values are contract snapshots from local dev QA (2026-09-01).
 */
import { describe, expect, it } from 'vitest'
import { unwrapApiArray } from '~/utils/dismantleAdapter'

describe('lookup endpoint response shapes (contract snapshot)', () => {
  it('GET /api/data/customer returns flat array', () => {
    const sample = [{ id: 356, name: 'Customer QA-DISMANTLE-20260901-054444', email: null }]
    expect(unwrapApiArray(sample)).toEqual(sample)
    expect(unwrapApiArray({ data: sample })).toEqual(sample)
  })

  it('GET /api/data/perusahaan returns flat array with nmPerusahaan', () => {
    const sample = [{ id: 344, nmPerusahaan: 'PT DV DV17882414840391b1a' }]
    expect(unwrapApiArray(sample)[0]).toMatchObject({ id: 344 })
  })

  it('GET /api/company/site returns paginator envelope', () => {
    const sample = {
      data: [{ id: 403, name: 'Site QA-DISMANTLE-20260901-054444', code: 'QA' }],
      meta: { total: 1, per_page: 50 },
    }
    expect(unwrapApiArray(sample)).toHaveLength(1)
    expect(unwrapApiArray(sample)[0].name).toContain('QA-DISMANTLE')
  })

  it('GET /api/data/warehouse returns flat array', () => {
    const sample = [{ id: 1178, name: 'Warehouse QA-DISMANTLE-20260901-054444', address: 'QA' }]
    expect(unwrapApiArray(sample)).toHaveLength(1)
  })

  it('GET /api/customers/:id/service-instances returns envelope with data array', () => {
    const sample = {
      data: [
        {
          id: 'e482bd44-36b0-43c6-a1f2-a53fe85b0529',
          service_number: 'SN-DV17882414840391b1a-cbf9cc',
          status: 'active',
          site_id: 403,
        },
      ],
    }
    expect(unwrapApiArray(sample)).toHaveLength(1)
  })
})
