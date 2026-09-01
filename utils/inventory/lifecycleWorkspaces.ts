import { normalizeMenuRoute, type CoalesceableMenuNode } from '~/utils/inventory/stockWorkspace'

export type EquipmentWorkspaceTabId =
  | 'register'
  | 'inspection'
  | 'replacement'
  | 'repair'
  | 'scrap'

export type WarrantyWorkspaceTabId = 'assessments' | 'claims' | 'rma'

export interface LifecycleWorkspaceTab<T extends string = string> {
  id: T
  label: string
  permission: string
}

export const EQUIPMENT_WORKSPACE_PATH = '/inventory/equipment'
export const WARRANTY_WORKSPACE_PATH = '/inventory/warranty'

export const EQUIPMENT_WORKSPACE_TABS: readonly LifecycleWorkspaceTab<EquipmentWorkspaceTabId>[] = [
  { id: 'register', label: 'Equipment Register', permission: 'view_equipment' },
  { id: 'inspection', label: 'Inspection', permission: 'view_equipment_inspection' },
  { id: 'replacement', label: 'Replacement', permission: 'view_equipment_replacement' },
  { id: 'repair', label: 'Repair', permission: 'view_equipment_repair' },
  { id: 'scrap', label: 'Scrap', permission: 'view_equipment_scrap' },
] as const

export const WARRANTY_WORKSPACE_TABS: readonly LifecycleWorkspaceTab<WarrantyWorkspaceTabId>[] = [
  { id: 'assessments', label: 'Assessments', permission: 'view_warranty_assessment' },
  { id: 'claims', label: 'Claims', permission: 'view_warranty_claim' },
  { id: 'rma', label: 'RMA', permission: 'view_warranty_rma' },
] as const

export const EQUIPMENT_WORKSPACE_PERMISSIONS = EQUIPMENT_WORKSPACE_TABS.map((tab) => tab.permission)
export const WARRANTY_WORKSPACE_PERMISSIONS = WARRANTY_WORKSPACE_TABS.map((tab) => tab.permission)

export const LEGACY_EQUIPMENT_REDIRECTS: Record<string, EquipmentWorkspaceTabId> = {
  '/inventory/equipment-inspection': 'inspection',
  '/inventory/equipment-replacement': 'replacement',
  '/inventory/equipment-repair': 'repair',
  '/inventory/equipment-scrap': 'scrap',
}

export const LEGACY_WARRANTY_REDIRECTS: Record<string, WarrantyWorkspaceTabId> = {
  '/inventory/warranty-assessment': 'assessments',
  '/inventory/warranty-claim': 'claims',
  '/inventory/warranty-rma': 'rma',
}

const EQUIPMENT_CHILD_PREFIXES = [
  '/inventory/equipment-inspection',
  '/inventory/equipment-replacement',
  '/inventory/equipment-repair',
  '/inventory/equipment-scrap',
] as const

const WARRANTY_CHILD_PREFIXES = [
  '/inventory/warranty-assessment',
  '/inventory/warranty-claim',
  '/inventory/warranty-rma',
] as const

export function equipmentTabHasCreateAction(tabId: string): boolean {
  return tabId === 'replacement'
}

export function equipmentTabCreateLabel(tabId: string): string | null {
  return tabId === 'replacement' ? 'Buat Replacement' : null
}

export function warrantyTabHasCreateAction(_tabId: string): boolean {
  return false
}

export function warrantyTabCreateLabel(_tabId: string): string | null {
  return null
}

export function resolveLifecycleTab<T extends string>(
  requested: string | null | undefined,
  allowedIds: readonly T[]
): T | null {
  if (!allowedIds.length) return null
  const first = allowedIds[0]
  if (!requested) return first
  return allowedIds.includes(requested as T) ? (requested as T) : first
}

export function buildLegacyRedirect(
  path: string,
  query: Record<string, unknown>,
  map: Record<string, string>,
  canonicalPath: string
): { path: string; query: Record<string, unknown> } | null {
  const tab = map[normalizeMenuRoute(path)]
  if (!tab) return null
  return { path: canonicalPath, query: { ...query, tab } }
}

export function buildLegacyEquipmentRedirect(path: string, query: Record<string, unknown> = {}) {
  return buildLegacyRedirect(path, query, LEGACY_EQUIPMENT_REDIRECTS, EQUIPMENT_WORKSPACE_PATH)
}

export function buildLegacyWarrantyRedirect(path: string, query: Record<string, unknown> = {}) {
  return buildLegacyRedirect(path, query, LEGACY_WARRANTY_REDIRECTS, WARRANTY_WORKSPACE_PATH)
}

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`)
}

export function isEquipmentWorkspacePath(path: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(path)
  if (normalized === EQUIPMENT_WORKSPACE_PATH || normalized.startsWith(`${EQUIPMENT_WORKSPACE_PATH}/`)) {
    return true
  }
  return EQUIPMENT_CHILD_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix))
}

export function isWarrantyWorkspacePath(path: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(path)
  if (normalized === WARRANTY_WORKSPACE_PATH || normalized.startsWith(`${WARRANTY_WORKSPACE_PATH}/`)) {
    return true
  }
  return WARRANTY_CHILD_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix))
}

export function isEquipmentMenuParentRoute(route: string | null | undefined): boolean {
  return normalizeMenuRoute(route) === EQUIPMENT_WORKSPACE_PATH
}

export function isWarrantyMenuParentRoute(route: string | null | undefined): boolean {
  return normalizeMenuRoute(route) === WARRANTY_WORKSPACE_PATH
}

export function isEquipmentMenuChildRoute(route: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(route)
  return EQUIPMENT_CHILD_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix))
}

export function isWarrantyMenuChildRoute(route: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(route)
  return WARRANTY_CHILD_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix))
}

function isEquipmentFolder(node: CoalesceableMenuNode): boolean {
  if (node.route) return false
  const name = String(node.name || '').toLowerCase()
  return name === 'equipment' || name === 'equipment register'
}

function isWarrantyFolder(node: CoalesceableMenuNode): boolean {
  if (node.route) return false
  return String(node.name || '').toLowerCase() === 'warranty'
}

function asLeaf<T extends CoalesceableMenuNode>(node: T | null, name: string, route: string, fallbackId: string): T {
  if (node) {
    return { ...node, name, route, children: undefined }
  }
  return { id: fallbackId, name, route } as T
}

export function coalesceEquipmentWarrantyMenuDetails<T extends CoalesceableMenuNode>(details: T[]): T[] {
  const result: T[] = []
  let equipmentItem: T | null = null
  let warrantyItem: T | null = null
  let sawEquipment = false
  let sawWarranty = false
  let insertAt = -1

  for (const item of details) {
    const children = Array.isArray(item.children)
      ? coalesceEquipmentWarrantyMenuDetails(item.children as T[])
      : item.children
    const next = (children !== item.children ? { ...item, children } : item) as T

    if (isWarrantyFolder(next) || isWarrantyMenuChildRoute(next.route as string | null | undefined)) {
      sawWarranty = true
      if (isWarrantyFolder(next) || isWarrantyMenuParentRoute(next.route as string | null | undefined)) {
        warrantyItem = asLeaf(next, 'Warranty', WARRANTY_WORKSPACE_PATH, 'warranty-workspace-coalesced')
      }
      if (insertAt < 0) insertAt = result.length
      continue
    }

    if (isEquipmentFolder(next)) {
      sawEquipment = true
      const nested = Array.isArray(next.children) ? (next.children as T[]) : []
      const nestedWarranty = nested.find(
        (child) =>
          isWarrantyMenuParentRoute(child.route as string | null | undefined) ||
          String(child.name || '').toLowerCase() === 'warranty'
      )
      if (nestedWarranty) {
        sawWarranty = true
        warrantyItem = asLeaf(
          nestedWarranty,
          'Warranty',
          WARRANTY_WORKSPACE_PATH,
          'warranty-workspace-coalesced'
        )
      }
      equipmentItem = asLeaf(next, 'Equipment', EQUIPMENT_WORKSPACE_PATH, 'equipment-workspace-coalesced')
      if (insertAt < 0) insertAt = result.length
      continue
    }

    if (isEquipmentMenuChildRoute(next.route as string | null | undefined)) {
      sawEquipment = true
      if (insertAt < 0) insertAt = result.length
      continue
    }

    if (isEquipmentMenuParentRoute(next.route as string | null | undefined)) {
      sawEquipment = true
      equipmentItem = asLeaf(next, next.name === 'Equipment Register' ? 'Equipment' : next.name || 'Equipment', EQUIPMENT_WORKSPACE_PATH, 'equipment-workspace-coalesced')
      if (insertAt < 0) insertAt = result.length
      continue
    }

    if (isWarrantyMenuParentRoute(next.route as string | null | undefined)) {
      sawWarranty = true
      warrantyItem = asLeaf(next, 'Warranty', WARRANTY_WORKSPACE_PATH, 'warranty-workspace-coalesced')
      if (insertAt < 0) insertAt = result.length
      continue
    }

    result.push(next)
  }

  const idx = insertAt < 0 ? result.length : insertAt
  const injected: T[] = []
  if (equipmentItem || sawEquipment) {
    injected.push(asLeaf(equipmentItem, 'Equipment', EQUIPMENT_WORKSPACE_PATH, 'equipment-workspace-coalesced'))
  }
  if (warrantyItem || sawWarranty) {
    injected.push(asLeaf(warrantyItem, 'Warranty', WARRANTY_WORKSPACE_PATH, 'warranty-workspace-coalesced'))
  }
  if (injected.length) result.splice(idx, 0, ...injected)
  return result
}

export function coalesceEquipmentWarrantyMenuGroups<G extends { menuDetails?: CoalesceableMenuNode[] }>(
  groups: G[]
): G[] {
  return groups.map((group) => ({
    ...group,
    menuDetails: coalesceEquipmentWarrantyMenuDetails(group.menuDetails || []),
  }))
}
