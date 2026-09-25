import { describe, it, expect } from 'vitest'
import {
  parsePersistedCompanyId,
  shouldApplyCompanyPayload,
} from '../../utils/companyContextSync'
import {
  classifyBusinessRoute,
  isRouteAllowedForContext,
  businessAwareLanding,
} from '../../utils/businessFlowRoute'

describe('companyContextSync', () => {
  it('ignores stale generation', () => {
    expect(shouldApplyCompanyPayload(2, 1)).toBe(false)
    expect(shouldApplyCompanyPayload(2, 2)).toBe(true)
    expect(shouldApplyCompanyPayload(0, null)).toBe(true)
  })

  it('parses persisted company id fail-closed', () => {
    expect(parsePersistedCompanyId('12')).toBe(12)
    expect(parsePersistedCompanyId('0')).toBe(null)
    expect(parsePersistedCompanyId('abc')).toBe(null)
  })

  it('redirects ISP page after Retail switch using effectiveFlowCodes', () => {
    expect(classifyBusinessRoute('/sales/quotation')).toBe('ISP_ONLY')
    expect(
      isRouteAllowedForContext('/sales/quotation', {
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
        profileCode: 'RETAIL',
      })
    ).toBe(false)
    expect(
      businessAwareLanding({
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
        profileCode: 'RETAIL',
      })
    ).toBe('/sales/pos')
  })

  it('keeps legacy isIspContext/isRetailContext overload', () => {
    expect(
      isRouteAllowedForContext('/sales/quotation', { isIspContext: false, isRetailContext: true })
    ).toBe(false)
  })
})
