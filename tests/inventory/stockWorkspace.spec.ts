import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildLegacyStockRedirect,
  coalesceStockMenuDetails,
  coalesceStockMenuGroups,
  isStockWorkspacePath,
  LEGACY_STOCK_REDIRECTS,
  resolveStockTab,
  STOCK_WORKSPACE_PATH,
  STOCK_WORKSPACE_TABS,
  stockTabCreateLabel,
  stockTabHasCreateAction,
} from '../../utils/inventory/stockWorkspace'

describe('stock workspace tab selection', () => {
  const allIds = STOCK_WORKSPACE_TABS.map((tab) => tab.id)

  it('syncs a valid tab from the query', () => {
    expect(resolveStockTab('stock-out', allIds)).toBe('stock-out')
  })

  it('falls back to the first allowed tab for an invalid query', () => {
    expect(resolveStockTab('not-a-tab', allIds)).toBe('overview')
    expect(resolveStockTab('', allIds)).toBe('overview')
    expect(resolveStockTab(undefined, allIds)).toBe('overview')
  })

  it('defaults to the first permitted tab, not always Overview', () => {
    expect(resolveStockTab('overview', ['stock-in', 'movements'])).toBe('stock-in')
    expect(resolveStockTab(undefined, ['stock-out', 'transfer'])).toBe('stock-out')
  })

  it('rejects unauthorized tabs even if they are otherwise valid', () => {
    expect(resolveStockTab('transfer', ['overview', 'stock-in'])).toBe('overview')
  })

  it('returns null when the user has no stock-workspace permission', () => {
    expect(resolveStockTab('overview', [])).toBeNull()
  })
})

describe('stock workspace permission-based tab visibility', () => {
  it('keeps tab ids aligned with existing view permissions', () => {
    expect(STOCK_WORKSPACE_TABS).toEqual([
      { id: 'overview', label: 'Overview', permission: 'view_stock' },
      { id: 'stock-in', label: 'Stock In', permission: 'view_stock_in' },
      { id: 'stock-out', label: 'Stock Out', permission: 'view_stock_out' },
      { id: 'transfer', label: 'Stock Transfer', permission: 'view_stock_transfer' },
      { id: 'movements', label: 'Movements', permission: 'view_stock_movements' },
    ])
  })
})

describe('legacy stock route redirects', () => {
  it('maps each legacy list path to the canonical Stock tab', () => {
    expect(LEGACY_STOCK_REDIRECTS['/inventory/stock-in']).toBe('stock-in')
    expect(LEGACY_STOCK_REDIRECTS['/inventory/barang-masuk']).toBe('stock-in')
    expect(LEGACY_STOCK_REDIRECTS['/inventory/stock-out']).toBe('stock-out')
    expect(LEGACY_STOCK_REDIRECTS['/inventory/barang-keluar']).toBe('stock-out')
    expect(LEGACY_STOCK_REDIRECTS['/inventory/stock-transfer']).toBe('transfer')
    expect(LEGACY_STOCK_REDIRECTS['/inventory/stock-movements']).toBe('movements')
  })

  it('preserves existing query keys while forcing tab', () => {
    expect(buildLegacyStockRedirect('/inventory/stock-in', { search: 'SI-1', page: '2' })).toEqual({
      path: STOCK_WORKSPACE_PATH,
      query: { search: 'SI-1', page: '2', tab: 'stock-in' },
    })
  })

  it('does not redirect the canonical workspace or detail routes', () => {
    expect(buildLegacyStockRedirect('/inventory/stock')).toBeNull()
    expect(buildLegacyStockRedirect('/inventory/stock-in-detail')).toBeNull()
    expect(buildLegacyStockRedirect('/inventory/stock-out-detail')).toBeNull()
    expect(buildLegacyStockRedirect('/inventory/stock-transfer-detail')).toBeNull()
  })
})

describe('contextual stock page actions', () => {
  it('has no create action on Overview or Movements', () => {
    expect(stockTabHasCreateAction('overview')).toBe(false)
    expect(stockTabHasCreateAction('movements')).toBe(false)
    expect(stockTabCreateLabel('overview')).toBeNull()
    expect(stockTabCreateLabel('movements')).toBeNull()
  })

  it('uses Buat labels for transactional tabs', () => {
    expect(stockTabCreateLabel('stock-in')).toBe('Buat Stock In')
    expect(stockTabCreateLabel('stock-out')).toBe('Buat Stock Out')
    expect(stockTabCreateLabel('transfer')).toBe('Buat Stock Transfer')
  })
})

describe('sidebar stock menu coalescing', () => {
  it('collapses Stock In/Out/Transfer/Movements into a single Stock item', () => {
    const coalesced = coalesceStockMenuDetails([
      { id: 1, name: 'Stock', route: '/inventory/stock', order: 1 },
      { id: 2, name: 'Stock In', route: '/inventory/stock-in', order: 2 },
      { id: 3, name: 'Stock Out', route: '/inventory/stock-out', order: 3 },
      { id: 4, name: 'Transfer', route: '/inventory/stock-transfer', order: 4 },
      { id: 5, name: 'Buffer Stock', route: '/inventory/buffer', order: 5 },
      { id: 6, name: 'Stock Movements', route: '/inventory/stock-movements', order: 6 },
    ])

    expect(coalesced.map((item) => item.route)).toEqual(['/inventory/stock', '/inventory/buffer'])
    expect(coalesced[0].name).toBe('Stock')
  })

  it('injects Stock when the user only has a child inventory menu', () => {
    const coalesced = coalesceStockMenuDetails([
      { id: 2, name: 'Stock In', route: '/inventory/barang-masuk' },
      { id: 9, name: 'Gudang', route: '/inventory/gudang' },
    ])
    expect(coalesced).toEqual([
      { id: 'stock-workspace-coalesced', name: 'Stock', route: '/inventory/stock' },
      { id: 9, name: 'Gudang', route: '/inventory/gudang' },
    ])
  })

  it('coalesces nested children without dropping unrelated folders', () => {
    const [inventory] = coalesceStockMenuGroups([
      {
        name: 'Inventory',
        menuDetails: [
          {
            id: 10,
            name: 'Ops',
            children: [
              { id: 11, name: 'Stock Out', route: '/inventory/stock-out' },
              { id: 12, name: 'Equipment', route: '/inventory/equipment' },
            ],
          },
        ],
      },
    ])
    expect(inventory.menuDetails?.[0].children?.map((child) => child.route)).toEqual([
      '/inventory/stock',
      '/inventory/equipment',
    ])
  })
})

describe('stock workspace related paths', () => {
  it('keeps the Stock sidebar item active on detail routes', () => {
    expect(isStockWorkspacePath('/inventory/stock')).toBe(true)
    expect(isStockWorkspacePath('/inventory/stock-in-detail')).toBe(true)
    expect(isStockWorkspacePath('/inventory/stock-out-detail')).toBe(true)
    expect(isStockWorkspacePath('/inventory/buffer')).toBe(false)
  })
})

describe('stock workspace presentation contracts', () => {
  it('lazy-mounts each tab behind isTabActivated', () => {
    const src = readFileSync(fileURLToPath(new URL('../../pages/inventory/stock.vue', import.meta.url)), 'utf8')
    expect(src).toMatch(/v-if="isTabActivated\('overview'\)"/)
    expect(src).toMatch(/v-if="isTabActivated\('stock-in'\)"/)
    expect(src).toMatch(/v-if="isTabActivated\('stock-out'\)"/)
    expect(src).toMatch(/v-if="isTabActivated\('transfer'\)"/)
    expect(src).toMatch(/v-if="isTabActivated\('movements'\)"/)
    expect(src).toMatch(/useFinanceWorkspaceTabs/)
  })

  it('keeps Movements read-only: no create action in the tab source', () => {
    const src = readFileSync(
      fileURLToPath(new URL('../../components/inventory/stock/StockMovementsTab.vue', import.meta.url)),
      'utf8'
    )
    expect(src).not.toMatch(/Create Movement|Buat Movement|Tambah Movement/i)
    expect(src).toMatch(/Reverse Movement/)
  })
})
