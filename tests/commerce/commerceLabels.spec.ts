import { describe, expect, it } from 'vitest'
import { commerceEnumLabel, commerceStatusLabel } from '~/utils/commerceFormat'
import { commercePlatformLabel } from '~/utils/commercePlatform'
import { commerceReleaseBlockerLabel } from '~/utils/commerceAccountingStatus'

describe('commerce display labels', () => {
  it('normalizes processing and fulfillment enums', () => {
    expect(commerceEnumLabel('RELEASE_BLOCKED')).toBe('Release Blocked')
    expect(commerceEnumLabel('AWAITING_FULFILLMENT')).toBe('Menunggu Fulfillment')
    expect(commerceEnumLabel('FULFILLMENT_BY_SELLER')).toBe('Fulfillment by Seller')
    expect(commerceStatusLabel('STOCK_ISSUED')).toBe('Stock Issued')
  })

  it('falls back to Title Case for unknown codes', () => {
    expect(commerceEnumLabel('SOME_NEW_CODE')).toBe('Some New Code')
  })

  it('labels platforms and release blockers', () => {
    expect(commercePlatformLabel('TIKTOK_SHOP')).toBe('TikTok Shop')
    expect(commerceReleaseBlockerLabel('SKU_UNMAPPED')).toBe('Mapping SKU belum lengkap')
    expect(commerceReleaseBlockerLabel('BRAND_NEW_BLOCKER')).toBe('Brand New Blocker')
  })
})
