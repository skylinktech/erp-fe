import { describe, it, expect } from 'vitest'
import {
  classifyBusinessRoute,
  isRouteAllowedForContext,
  businessAwareLanding,
} from '../../utils/businessFlowRoute'
import {
  BUSINESS_FLOW_CAPABILITY_REGISTRY,
  withHypotheticalCapability,
  capabilityAllows,
  pathMatchesPrefixes,
  hasCapabilityCode,
} from '../../utils/businessFlowCapabilityRegistry'

describe('businessFlowRoute', () => {
  it('classifies ISP, Direct Sale POS, and Retail routes', () => {
    expect(classifyBusinessRoute('/sales/quotation/1')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/sales/retail-sale')).toBe('RETAIL_ONLY')
    expect(classifyBusinessRoute('/sales/pos')).toBe('DIRECT_SALE_POS')
    expect(classifyBusinessRoute('/sales/sales-order')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/dashboard')).toBe('SHARED')
  })

  it('blocks ISP route under Retail context (legacy shim)', () => {
    expect(
      isRouteAllowedForContext('/sales/subscription', {
        isIspContext: false,
        isRetailContext: true,
      })
    ).toBe(false)
  })

  it('allows Retail route under Retail effective flows', () => {
    expect(
      isRouteAllowedForContext('/sales/retail-return', {
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
        profileCode: 'RETAIL',
      })
    ).toBe(true)
  })

  it('POS requires DIRECT_PRODUCT_SALE (RETAIL_DIRECT_SALE flow), not ISP Sales Order', () => {
    expect(
      isRouteAllowedForContext('/sales/pos', {
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
      })
    ).toBe(true)
    expect(
      isRouteAllowedForContext('/sales/pos', {
        effectiveFlowCodes: ['ISP_NEW_SUBSCRIPTION'],
      })
    ).toBe(false)
    expect(
      isRouteAllowedForContext('/sales/sales-order', {
        effectiveFlowCodes: ['ISP_NEW_SUBSCRIPTION'],
      })
    ).toBe(true)
  })

  it('ISP + Direct Sale grant unlocks both commercial and POS', () => {
    const codes = ['ISP_NEW_SUBSCRIPTION', 'RETAIL_DIRECT_SALE']
    expect(isRouteAllowedForContext('/sales/quotation', { effectiveFlowCodes: codes })).toBe(true)
    expect(isRouteAllowedForContext('/sales/pos', { effectiveFlowCodes: codes })).toBe(true)
    expect(hasCapabilityCode('DIRECT_PRODUCT_SALE', codes)).toBe(true)
    expect(hasCapabilityCode('ISP_COMMERCIAL', codes)).toBe(true)
  })

  it('Omnichannel requires RETAIL profile — not ISP with RETAIL_DIRECT_SALE grant alone', () => {
    expect(
      isRouteAllowedForContext('/sales/omnichannel', {
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
        profileCode: 'ISP',
      })
    ).toBe(false)
    expect(
      isRouteAllowedForContext('/sales/omnichannel/produk', {
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
        profileCode: 'RETAIL',
      })
    ).toBe(true)
    expect(
      isRouteAllowedForContext('/sales/pos', {
        effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
        profileCode: 'ISP',
      })
    ).toBe(true)
  })

  it('lands on POS for Direct Sale context', () => {
    expect(businessAwareLanding({ isIspContext: false, isRetailContext: true })).toBe('/sales/pos')
    expect(
      businessAwareLanding({ effectiveFlowCodes: ['RETAIL_DIRECT_SALE'], profileCode: 'RETAIL' })
    ).toBe('/sales/pos')
  })

  it('PRODUCT_QUOTATION third-flow is registered without isThirdContext', () => {
    expect(BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION).toBeTruthy()
    expect(
      capabilityAllows(BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION, ['PRODUCT_QUOTATION'])
    ).toBe(true)
    expect(
      capabilityAllows(BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION, ['ISP_NEW_SUBSCRIPTION'])
    ).toBe(false)
    expect((BUSINESS_FLOW_CAPABILITY_REGISTRY as any).isThirdModelContext).toBeUndefined()
  })

  it('registry is extensible without isThirdContext', () => {
    const extended = withHypotheticalCapability(BUSINESS_FLOW_CAPABILITY_REGISTRY, 'HYPOTHETICAL_CONSULTING', {
      flowCodes: ['HYPOTHETICAL_CONSULTING'],
      prefixes: ['/sales/consulting'],
      landingRoute: '/sales/consulting',
      menuKeys: ['consulting'],
    })
    expect(extended.HYPOTHETICAL_CONSULTING).toBeTruthy()
    expect(capabilityAllows(extended.HYPOTHETICAL_CONSULTING, ['HYPOTHETICAL_CONSULTING'])).toBe(true)
    expect(capabilityAllows(extended.HYPOTHETICAL_CONSULTING, ['RETAIL_DIRECT_SALE'])).toBe(false)
    expect(pathMatchesPrefixes('/sales/consulting/1', extended.HYPOTHETICAL_CONSULTING.prefixes)).toBe(true)
    expect((extended as any).isThirdContext).toBeUndefined()
    expect(Object.keys(BUSINESS_FLOW_CAPABILITY_REGISTRY)).not.toContain('HYPOTHETICAL_CONSULTING')
  })
})
