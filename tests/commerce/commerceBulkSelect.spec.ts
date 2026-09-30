import { describe, expect, it } from 'vitest'
import {
  COMMERCE_BULK_ARRANGE_MAX,
  isCommerceOrderBulkSelectable,
  listBulkSelectableOrderIds,
  resolvePageBulkSelectState,
  toggleOrderSelection,
  toggleSelectAllOnPage,
} from '../../utils/commerceBulkSelect'

function order(id: string, enabled: boolean) {
  return {
    id,
    actions: { arrangeShipment: { enabled, reason: enabled ? null : 'blocked' } },
  }
}

describe('commerceBulkSelect', () => {
  it('filters only arrangeShipment-enabled orders and caps at max', () => {
    const orders = [
      order('a', true),
      order('b', false),
      order('c', true),
      order('d', true),
    ]
    expect(listBulkSelectableOrderIds(orders, 2)).toEqual(['a', 'c'])
    expect(isCommerceOrderBulkSelectable(orders[1])).toBe(false)
  })

  it('resolvePageBulkSelectState supports checked / indeterminate / empty', () => {
    const orders = [order('a', true), order('b', true), order('c', false)]
    expect(resolvePageBulkSelectState({ orders, selectedIds: [] }).noneEligible).toBe(false)
    expect(resolvePageBulkSelectState({ orders, selectedIds: ['a', 'b'] }).allEligibleSelected).toBe(
      true
    )
    const partial = resolvePageBulkSelectState({ orders, selectedIds: ['a'] })
    expect(partial.indeterminate).toBe(true)
    expect(partial.selectedEligibleCount).toBe(1)
    expect(
      resolvePageBulkSelectState({ orders: [order('x', false)], selectedIds: [] }).noneEligible
    ).toBe(true)
  })

  it('toggleSelectAllOnPage selects eligible or clears', () => {
    const orders = [order('a', true), order('b', false), order('c', true)]
    expect(toggleSelectAllOnPage({ orders, selectAll: true })).toEqual(['a', 'c'])
    expect(toggleSelectAllOnPage({ orders, selectAll: false })).toEqual([])
  })

  it('toggleOrderSelection respects max cap', () => {
    const ids = Array.from({ length: COMMERCE_BULK_ARRANGE_MAX }, (_, i) => `id-${i}`)
    const blocked = toggleOrderSelection({
      selectedIds: ids,
      orderId: 'extra',
      selected: true,
    })
    expect(blocked).toHaveLength(COMMERCE_BULK_ARRANGE_MAX)
    expect(blocked.includes('extra')).toBe(false)
  })
})
