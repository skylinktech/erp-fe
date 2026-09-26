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
  SHARED_FE_PREFIXES,
  BUSINESS_FE_ROOTS,
  allGatedFePrefixes,
  FLOW_FEATURE_ALIGNMENT_PREFIXES,
} from '../../utils/businessFlowCapabilityRegistry'
import { filterMenuDetailsByCompanyContext } from '../../utils/filterMenusByCompanyContext'

describe('businessFlowRoute', () => {
  it('classifies ISP, Direct Sale POS, and Retail routes', () => {
    expect(classifyBusinessRoute('/sales/quotation/1')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/sales/retail-sale')).toBe('RETAIL_ONLY')
    expect(classifyBusinessRoute('/sales/pos')).toBe('DIRECT_SALE_POS')
    expect(classifyBusinessRoute('/sales/sales-order')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/order-process/subscription')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/operations/request-activation')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/implementation/arf')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/service-management/pending')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/dashboard')).toBe('SHARED')
  })

  it('blocks ISP route under Retail context (legacy shim)', () => {
    expect(
      isRouteAllowedForContext('/sales/subscription', {
        isIspContext: false,
        isRetailContext: true,
      })
    ).toBe(false)
    expect(
      isRouteAllowedForContext('/order-process/subscription', {
        isIspContext: false,
        isRetailContext: true,
      })
    ).toBe(false)
  })

  it('Retail murni hides the four reported module groups', () => {
    const retail = { effectiveFlowCodes: ['RETAIL_DIRECT_SALE'], profileCode: 'RETAIL' }
    expect(isRouteAllowedForContext('/order-process/pks', retail)).toBe(false)
    expect(isRouteAllowedForContext('/service/service-plan', retail)).toBe(false)
    expect(isRouteAllowedForContext('/implementation/progress-tracker', retail)).toBe(false)
    expect(isRouteAllowedForContext('/operations/berita-acara', retail)).toBe(false)
    expect(isRouteAllowedForContext('/sales/pos', retail)).toBe(true)
    expect(isRouteAllowedForContext('/inventory/stock', retail)).toBe(true)
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
    expect(isRouteAllowedForContext('/order-process/subscription', { effectiveFlowCodes: codes })).toBe(true)
    expect(hasCapabilityCode('DIRECT_PRODUCT_SALE', codes)).toBe(true)
    expect(hasCapabilityCode('ISP_COMMERCIAL', codes)).toBe(true)
    expect(hasCapabilityCode('ISP_FULFILLMENT', codes)).toBe(true)
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

  it('fails closed for gated routes when context is not ready', () => {
    expect(
      isRouteAllowedForContext(
        '/order-process/subscription',
        { effectiveFlowCodes: [], profileCode: null },
        { contextReady: false }
      )
    ).toBe(false)
    expect(
      isRouteAllowedForContext(
        '/dashboard',
        { effectiveFlowCodes: [], profileCode: null },
        { contextReady: false }
      )
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

  it('coverage: reported business samples are classified (not UNCLASSIFIED_BUSINESS)', () => {
    const samples = [
      '/order-process/subscription',
      '/order-process/customer-verif',
      '/operations/work-order-request/detail/1',
      '/implementation/arf/form',
      '/service/service-plan',
      '/service-management/customer-service',
      '/sales/fdr/detail/1',
      '/sales/sales-pipeline',
      '/sales/pos',
      '/sales/omnichannel/pesanan',
      '/inventory/service',
      '/finance/billing/billing-adjustments',
      '/finance/billing-preparations',
    ]
    for (const path of samples) {
      expect(classifyBusinessRoute(path)).not.toBe('UNCLASSIFIED_BUSINESS')
    }
    expect(SHARED_FE_PREFIXES).toContain('/inventory')
    expect(BUSINESS_FE_ROOTS).toContain('/order-process')
    expect(allGatedFePrefixes()).toContain('/order-process')
  })

  it('FE↔BE alignment contract prefixes are gated and inventory aliases win over shared /inventory', () => {
    const gated = new Set(allGatedFePrefixes())
    for (const prefix of FLOW_FEATURE_ALIGNMENT_PREFIXES) {
      expect(gated.has(prefix)).toBe(true)
      expect(classifyBusinessRoute(prefix)).not.toBe('UNCLASSIFIED_BUSINESS')
    }
    expect(classifyBusinessRoute('/inventory/service-plan')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/inventory/stock')).toBe('SHARED')
    expect(classifyBusinessRoute('/finance/journals')).toBe('SHARED')
    expect(classifyBusinessRoute('/finance/billing-adjustments')).toBe('ISP_ONLY')
    expect(classifyBusinessRoute('/sales/sales-pipeline')).toBe('ISP_ONLY')
  })

  it('Retail murni hides sales-pipeline and subscription billing finance pages', () => {
    const retail = { effectiveFlowCodes: ['RETAIL_DIRECT_SALE'], profileCode: 'RETAIL' }
    expect(isRouteAllowedForContext('/sales/sales-pipeline', retail)).toBe(false)
    expect(isRouteAllowedForContext('/finance/billing/billing-adjustments', retail)).toBe(false)
    expect(isRouteAllowedForContext('/finance/billing-preparations', retail)).toBe(false)
    expect(isRouteAllowedForContext('/finance/journals', retail)).toBe(true)
  })

  it('prunes empty ISP folders under Retail while keeping shared children', () => {
    const details = [
      {
        id: 1,
        route: null,
        children: [
          { id: 2, route: '/order-process/subscription', children: [] },
          { id: 3, route: '/order-process/pks', children: [] },
        ],
      },
      {
        id: 4,
        route: null,
        children: [{ id: 5, route: '/inventory/stock', children: [] }],
      },
    ]
    const pruned = filterMenuDetailsByCompanyContext(details, {
      effectiveFlowCodes: ['RETAIL_DIRECT_SALE'],
      profileCode: 'RETAIL',
    })
    expect(pruned).toHaveLength(1)
    expect(pruned[0].children?.[0]?.route).toBe('/inventory/stock')
  })
})
