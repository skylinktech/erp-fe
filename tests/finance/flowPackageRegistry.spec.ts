import { describe, it, expect } from 'vitest'
import {
  BUSINESS_FLOW_CAPABILITY_REGISTRY,
  hasCapabilityCode,
} from '../../utils/businessFlowCapabilityRegistry'

describe('S6/S8 flow package FE registry', () => {
  it('registers three known packages without profile boolean explosion', () => {
    expect(BUSINESS_FLOW_CAPABILITY_REGISTRY.ISP_NEW_SUBSCRIPTION).toBeTruthy()
    expect(BUSINESS_FLOW_CAPABILITY_REGISTRY.DIRECT_PRODUCT_SALE).toBeTruthy()
    expect(BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION).toBeTruthy()
    const blob = JSON.stringify(BUSINESS_FLOW_CAPABILITY_REGISTRY)
    expect(blob).not.toContain('isThirdModelContext')
    expect(blob).not.toContain('profile ===')
  })

  it('maps DIRECT_PRODUCT_SALE capability from RETAIL_DIRECT_SALE flow', () => {
    expect(hasCapabilityCode('DIRECT_PRODUCT_SALE', ['RETAIL_DIRECT_SALE'])).toBe(true)
    expect(hasCapabilityCode('DIRECT_PRODUCT_SALE', ['ISP_NEW_SUBSCRIPTION'])).toBe(false)
    expect(hasCapabilityCode('PRODUCT_QUOTATION', ['PRODUCT_QUOTATION'])).toBe(true)
  })
})
