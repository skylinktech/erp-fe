import { describe, expect, it } from 'vitest'
import {
  formatPosAvailableStock,
  formatPosOfficialPrice,
  posCartIndicativeSubtotal,
  posCheckoutFingerprint,
  removePosCartLine,
  shouldIgnoreStaleCatalog,
  updatePosCartQuantity,
  upsertPosCartLine,
  type PosCartLine,
} from '../../utils/posCart'

function line(partial: Partial<PosCartLine> & Pick<PosCartLine, 'productId' | 'unitId'>): PosCartLine {
  return {
    quantity: 1,
    productName: 'Item',
    sku: 'SKU',
    unitName: 'PCS',
    officialUnitPrice: 1000,
    ...partial,
  }
}

describe('POS cart helpers', () => {
  it('merges same product+UOM and keeps separate UOM lines', () => {
    let cart: PosCartLine[] = []
    cart = upsertPosCartLine(cart, line({ productId: 1, unitId: 10, quantity: 2 }))
    cart = upsertPosCartLine(cart, line({ productId: 1, unitId: 10, quantity: 3 }))
    cart = upsertPosCartLine(cart, line({ productId: 1, unitId: 11, quantity: 1 }))
    expect(cart).toHaveLength(2)
    expect(cart[0].quantity).toBe(5)
    expect(cart[1].unitId).toBe(11)
  })

  it('rejects non-positive quantity on upsert', () => {
    const cart = upsertPosCartLine([], line({ productId: 1, unitId: 1, quantity: 0 }))
    expect(cart).toHaveLength(0)
  })

  it('updates quantity and removes line when qty invalid', () => {
    let cart = [line({ productId: 1, unitId: 1, quantity: 2 })]
    cart = updatePosCartQuantity(cart, 0, 4)
    expect(cart[0].quantity).toBe(4)
    cart = updatePosCartQuantity(cart, 0, 0)
    expect(cart).toHaveLength(0)
  })

  it('removes by index and totals indicative subtotal', () => {
    let cart = [
      line({ productId: 1, unitId: 1, quantity: 2, officialUnitPrice: 1500 }),
      line({ productId: 2, unitId: 1, quantity: 1, officialUnitPrice: 500 }),
    ]
    expect(posCartIndicativeSubtotal(cart)).toBe(3500)
    cart = removePosCartLine(cart, 0)
    expect(cart).toHaveLength(1)
    expect(posCartIndicativeSubtotal(cart)).toBe(500)
  })

  it('formats missing price and distinguishes unknown vs zero stock', () => {
    expect(formatPosOfficialPrice(null)).toBe('Harga belum tersedia')
    expect(formatPosOfficialPrice(0)).toMatch(/Rp/)
    expect(formatPosAvailableStock(null).tone).toBe('unknown')
    expect(formatPosAvailableStock(0).tone).toBe('zero')
    expect(formatPosAvailableStock(3).tone).toBe('ok')
  })

  it('keeps checkout fingerprint stable for identical cart context', () => {
    const a = posCheckoutFingerprint({
      companyId: 1,
      warehouseId: 2,
      customerMode: 'WALK_IN',
      customerId: null,
      walkInName: 'Ali',
      items: [
        { productId: 9, unitId: 1, quantity: 2 },
        { productId: 3, unitId: 1, quantity: 1 },
      ],
    })
    const b = posCheckoutFingerprint({
      companyId: 1,
      warehouseId: 2,
      customerMode: 'WALK_IN',
      customerId: null,
      walkInName: 'Ali',
      items: [
        { productId: 3, unitId: 1, quantity: 1 },
        { productId: 9, unitId: 1, quantity: 2 },
      ],
    })
    expect(a).toBe(b)
    const c = posCheckoutFingerprint({
      companyId: 1,
      warehouseId: 2,
      customerMode: 'WALK_IN',
      customerId: null,
      walkInName: 'Ali',
      items: [{ productId: 9, unitId: 1, quantity: 3 }],
    })
    expect(c).not.toBe(a)
  })

  it('ignores stale catalog responses after search/warehouse/generation/company change', () => {
    expect(shouldIgnoreStaleCatalog(1, 2, 'a', 'a', 1, 1)).toBe(true)
    expect(shouldIgnoreStaleCatalog(1, 1, 'a', 'b', 1, 1)).toBe(true)
    expect(shouldIgnoreStaleCatalog(1, 1, 'a', 'a', 1, 2)).toBe(true)
    expect(shouldIgnoreStaleCatalog(1, 1, 'a', 'a', 1, 1)).toBe(false)
    expect(shouldIgnoreStaleCatalog(1, 1, 'a', 'a', 1, 1, 10, 20)).toBe(true)
    expect(shouldIgnoreStaleCatalog(1, 1, 'a', 'a', 1, 1, 10, 10)).toBe(false)
  })
})
