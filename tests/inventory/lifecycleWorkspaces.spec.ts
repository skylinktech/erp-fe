import { describe, expect, it } from 'vitest'
import {
  EQUIPMENT_WORKSPACE_PATH,
  WARRANTY_WORKSPACE_PATH,
  buildLegacyEquipmentRedirect,
  buildLegacyWarrantyRedirect,
  coalesceEquipmentWarrantyMenuDetails,
  equipmentTabCreateLabel,
  equipmentTabHasCreateAction,
  isEquipmentWorkspacePath,
  isWarrantyWorkspacePath,
  resolveLifecycleTab,
  warrantyTabCreateLabel,
  warrantyTabHasCreateAction,
} from '~/utils/inventory/lifecycleWorkspaces'

describe('lifecycleWorkspaces', () => {
  it('defaults to the first allowed tab and rejects unauthorized ids', () => {
    expect(resolveLifecycleTab('scrap', ['inspection', 'repair'])).toBe('inspection')
    expect(resolveLifecycleTab('repair', ['inspection', 'repair'])).toBe('repair')
    expect(resolveLifecycleTab(undefined, ['claims'])).toBe('claims')
    expect(resolveLifecycleTab('rma', [])).toBeNull()
  })

  it('redirects exact list routes without consuming detail pages', () => {
    expect(buildLegacyEquipmentRedirect('/inventory/equipment-repair', { q: 'SN-1' })).toEqual({
      path: EQUIPMENT_WORKSPACE_PATH,
      query: { q: 'SN-1', tab: 'repair' },
    })
    expect(buildLegacyEquipmentRedirect('/inventory/equipment-replacement/abc')).toBeNull()
    expect(buildLegacyWarrantyRedirect('/inventory/warranty-claim', { status: 'SUBMITTED' })).toEqual({
      path: WARRANTY_WORKSPACE_PATH,
      query: { status: 'SUBMITTED', tab: 'claims' },
    })
    expect(buildLegacyWarrantyRedirect('/inventory/warranty-claim/abc')).toBeNull()
    expect(buildLegacyWarrantyRedirect('/inventory/warranty-assessment')).toEqual({
      path: WARRANTY_WORKSPACE_PATH,
      query: { tab: 'assessments' },
    })
  })

  it('matches equipment and warranty workspaces without overlapping prefixes', () => {
    expect(isEquipmentWorkspacePath('/inventory/equipment')).toBe(true)
    expect(isEquipmentWorkspacePath('/inventory/equipment/eq-1')).toBe(true)
    expect(isEquipmentWorkspacePath('/inventory/equipment-inspection')).toBe(true)
    expect(isEquipmentWorkspacePath('/inventory/warranty')).toBe(false)
    expect(isWarrantyWorkspacePath('/inventory/warranty')).toBe(true)
    expect(isWarrantyWorkspacePath('/inventory/warranty-claim/abc')).toBe(true)
    expect(isWarrantyWorkspacePath('/inventory/warranty-assessment')).toBe(true)
    expect(isWarrantyWorkspacePath('/inventory/equipment')).toBe(false)
  })

  it('collapses nested equipment/warranty folders into sibling leaves', () => {
    const details = coalesceEquipmentWarrantyMenuDetails([
      { id: 'stock', name: 'Stock', route: '/inventory/stock' },
      {
        id: 'eq-folder',
        name: 'Equipment',
        route: null,
        children: [
          { id: 'reg', name: 'Equipment Register', route: '/inventory/equipment' },
          { id: 'insp', name: 'Inspection', route: '/inventory/equipment-inspection' },
          {
            id: 'war-folder',
            name: 'Warranty',
            route: null,
            children: [
              { id: 'wa', name: 'Assessments', route: '/inventory/warranty-assessment' },
              { id: 'wc', name: 'Claims', route: '/inventory/warranty-claim' },
            ],
          },
        ],
      },
    ])

    expect(details.map((item) => ({ name: item.name, route: item.route }))).toEqual([
      { name: 'Stock', route: '/inventory/stock' },
      { name: 'Equipment', route: '/inventory/equipment' },
      { name: 'Warranty', route: '/inventory/warranty' },
    ])
  })

  it('only exposes Replacement as a standalone create action', () => {
    expect(equipmentTabHasCreateAction('register')).toBe(false)
    expect(equipmentTabHasCreateAction('inspection')).toBe(false)
    expect(equipmentTabHasCreateAction('replacement')).toBe(true)
    expect(equipmentTabCreateLabel('replacement')).toBe('Buat Replacement')
    expect(equipmentTabCreateLabel('scrap')).toBeNull()
    expect(warrantyTabHasCreateAction('assessments')).toBe(false)
    expect(warrantyTabHasCreateAction('claims')).toBe(false)
    expect(warrantyTabHasCreateAction('rma')).toBe(false)
    expect(warrantyTabCreateLabel('rma')).toBeNull()
  })

  it('injects parent leaves when only child routes are visible', () => {
    const details = coalesceEquipmentWarrantyMenuDetails([
      { id: 'insp', name: 'Inspection', route: '/inventory/equipment-inspection' },
      { id: 'rma', name: 'RMA', route: '/inventory/warranty-rma' },
    ])

    expect(details.map((item) => item.route)).toEqual([
      '/inventory/equipment',
      '/inventory/warranty',
    ])
  })
})
