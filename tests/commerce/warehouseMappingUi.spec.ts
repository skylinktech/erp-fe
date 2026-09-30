import { describe, expect, it } from 'vitest'
import { commerceEnumLabel, commerceStatusBadge } from '~/utils/commerceFormat'
import {
  marketplaceWarehouseNameById,
  marketplaceWarehouseOptionLabel,
  withCurrentWarehouseOption,
} from '~/utils/commerceMarketplaceWarehouse'

describe('omnichannel warehouse / SKU mapping labels', () => {
  it('uses operator labels instead of machine fields', () => {
    expect(commerceEnumLabel('CONNECTED')).toBe('Terhubung')
    expect(commerceEnumLabel('INCOMPLETE')).toBe('Belum lengkap')
    expect(commerceEnumLabel('INACTIVE')).toBe('Tidak aktif')
    expect(commerceEnumLabel('MAPPED')).toBe('Terhubung')
    expect(commerceEnumLabel('UNMAPPED')).toBe('Belum terhubung')
    expect(commerceEnumLabel('PROBLEM')).toBe('Bermasalah')
  })

  it('keeps mapping success/incomplete badge classes distinct', () => {
    expect(commerceStatusBadge('CONNECTED')).toBe('bg-label-success')
    expect(commerceStatusBadge('MAPPED')).toBe('bg-label-success')
    expect(commerceStatusBadge('UNMAPPED')).toBe('bg-label-secondary')
    expect(commerceStatusBadge('INCOMPLETE')).toBe('bg-label-secondary')
  })

  it('legacy inventory URL maps to Settings Warehouse tab', () => {
    const next = '/sales/omnichannel/settings?tab=warehouse'
    expect(next).toContain('tab=warehouse')
    expect(next).not.toContain('/inventory')
  })

  it('legacy inventory SKU deep-link maps to Produk', () => {
    const mapped = '0'
    const next = mapped
      ? `/sales/omnichannel/produk?mapped=${mapped}&tab=cache`
      : '/sales/omnichannel/settings?tab=warehouse'
    expect(next).toBe('/sales/omnichannel/produk?mapped=0&tab=cache')
  })

  it('marketplace warehouse option shows name, not raw id only', () => {
    expect(
      marketplaceWarehouseOptionLabel({
        id: '711',
        name: 'Gudang TREECOCO',
        type: 'SALES_WAREHOUSE',
        effectStatus: 'ENABLED',
        isDefault: true,
        usable: true,
      })
    ).toBe('Gudang TREECOCO (Utama)')
    expect(
      marketplaceWarehouseOptionLabel({
        id: 'r1',
        name: 'Gudang Retur',
        type: 'RETURN_WAREHOUSE',
        effectStatus: 'ENABLED',
        usable: false,
      })
    ).toBe('Gudang Retur (Retur)')
  })

  it('keeps a mapped id that is missing from the live list', () => {
    const next = withCurrentWarehouseOption(
      [{ id: 'a', name: 'A', usable: true }],
      'legacy-id'
    )
    expect(next[0].id).toBe('legacy-id')
    expect(next.some((o) => o.id === 'a')).toBe(true)
  })

  it('edit mapping seeds SkyFlow warehouse label from the list row', () => {
    const row = {
      warehouseId: 12,
      warehouseName: 'Gudang UniCharm POS',
      warehouseCode: 'GU-UC-01',
    }
    const option = {
      id: Number(row.warehouseId),
      nmWarehouse: row.warehouseName || 'Gudang SkyFlow',
      kodeWarehouse: row.warehouseCode || '',
    }
    expect(option.id).toBe(12)
    expect(`${option.nmWarehouse} (${option.kodeWarehouse})`).toBe('Gudang UniCharm POS (GU-UC-01)')
  })

  it('list column uses TikTok warehouse name instead of connected placeholder', () => {
    const name = marketplaceWarehouseNameById(
      [{ id: '7684129099187046164', name: 'Sandbox ID Local Sales warehouse', usable: true }],
      '7684129099187046164'
    )
    expect(name).toBe('Sandbox ID Local Sales warehouse')
    expect(name).not.toBe('Gudang marketplace terhubung')
    expect(marketplaceWarehouseNameById([], '7684129099187046164')).toBeNull()
  })
})
