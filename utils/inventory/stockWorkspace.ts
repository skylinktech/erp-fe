export type StockWorkspaceTabId =
  | 'overview'
  | 'stock-in'
  | 'stock-out'
  | 'transfer'
  | 'movements'

export interface StockWorkspaceTab {
  id: StockWorkspaceTabId
  label: string
  permission: string
}

export const STOCK_WORKSPACE_PATH = '/inventory/stock'
export const STOCK_WORKSPACE_PATH_ALIAS = '/inventory/stok'

export const STOCK_WORKSPACE_TABS: readonly StockWorkspaceTab[] = [
  { id: 'overview', label: 'Overview', permission: 'view_stock' },
  { id: 'stock-in', label: 'Stock In', permission: 'view_stock_in' },
  { id: 'stock-out', label: 'Stock Out', permission: 'view_stock_out' },
  { id: 'transfer', label: 'Stock Transfer', permission: 'view_stock_transfer' },
  { id: 'movements', label: 'Movements', permission: 'view_stock_movements' },
] as const

export const STOCK_WORKSPACE_PERMISSIONS = STOCK_WORKSPACE_TABS.map((tab) => tab.permission)

export const STOCK_TAB_IDS: readonly StockWorkspaceTabId[] = STOCK_WORKSPACE_TABS.map((tab) => tab.id)

export const LEGACY_STOCK_REDIRECTS: Record<string, StockWorkspaceTabId> = {
  '/inventory/stock-in': 'stock-in',
  '/inventory/barang-masuk': 'stock-in',
  '/inventory/stock-out': 'stock-out',
  '/inventory/barang-keluar': 'stock-out',
  '/inventory/stock-transfer': 'transfer',
  '/inventory/stock-movements': 'movements',
}

export const STOCK_MENU_CHILD_ROUTES = [
  '/inventory/stock-in',
  '/inventory/barang-masuk',
  '/inventory/stock-out',
  '/inventory/barang-keluar',
  '/inventory/stock-transfer',
  '/inventory/stock-movements',
] as const

export const STOCK_WORKSPACE_RELATED_PATHS = [
  STOCK_WORKSPACE_PATH,
  STOCK_WORKSPACE_PATH_ALIAS,
  '/inventory/stock-in-detail',
  '/inventory/stock-out-detail',
  '/inventory/stock-transfer-detail',
] as const

const TABS_WITH_CREATE: ReadonlySet<StockWorkspaceTabId> = new Set([
  'stock-in',
  'stock-out',
  'transfer',
])

export function normalizeMenuRoute(route: string | null | undefined): string {
  if (!route) return ''
  const path = route.split('?')[0]?.trim() || ''
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

export function isStockWorkspacePath(path: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(path)
  return (
    normalized === STOCK_WORKSPACE_PATH ||
    normalized === STOCK_WORKSPACE_PATH_ALIAS ||
    STOCK_WORKSPACE_RELATED_PATHS.includes(normalized as (typeof STOCK_WORKSPACE_RELATED_PATHS)[number])
  )
}

export function isStockMenuChildRoute(route: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(route)
  return (STOCK_MENU_CHILD_ROUTES as readonly string[]).includes(normalized)
}

export function isStockMenuParentRoute(route: string | null | undefined): boolean {
  const normalized = normalizeMenuRoute(route)
  return normalized === STOCK_WORKSPACE_PATH || normalized === STOCK_WORKSPACE_PATH_ALIAS
}

export function isValidStockTabId(value: string | null | undefined): value is StockWorkspaceTabId {
  return !!value && (STOCK_TAB_IDS as readonly string[]).includes(value)
}

export function resolveStockTab(
  requested: string | null | undefined,
  allowedIds: readonly string[]
): StockWorkspaceTabId | null {
  if (!allowedIds.length) return null
  const first = allowedIds[0] as StockWorkspaceTabId
  if (!requested) return first
  return allowedIds.includes(requested) ? (requested as StockWorkspaceTabId) : first
}

export function stockTabCreateLabel(tabId: string): string | null {
  switch (tabId) {
    case 'stock-in':
      return 'Buat Stock In'
    case 'stock-out':
      return 'Buat Stock Out'
    case 'transfer':
      return 'Buat Stock Transfer'
    default:
      return null
  }
}

export function stockTabHasCreateAction(tabId: string): boolean {
  return TABS_WITH_CREATE.has(tabId as StockWorkspaceTabId)
}

export function buildLegacyStockRedirect(
  path: string,
  query: Record<string, unknown> = {}
): { path: string; query: Record<string, unknown> } | null {
  const tab = LEGACY_STOCK_REDIRECTS[normalizeMenuRoute(path)]
  if (!tab) return null
  return {
    path: STOCK_WORKSPACE_PATH,
    query: { ...query, tab },
  }
}

export interface CoalesceableMenuNode {
  id?: number | string
  name?: string
  route?: string | null
  order?: number
  children?: CoalesceableMenuNode[]
  [key: string]: unknown
}

export function coalesceStockMenuDetails<T extends CoalesceableMenuNode>(details: T[]): T[] {
  const result: T[] = []
  let stockItem: T | null = null
  let sawChild = false
  let insertAt = -1

  for (const item of details) {
    const children = Array.isArray(item.children)
      ? coalesceStockMenuDetails(item.children as T[])
      : item.children
    const next = (children !== item.children ? { ...item, children } : item) as T

    if (isStockMenuParentRoute(next.route as string | null | undefined)) {
      stockItem = { ...next, route: STOCK_WORKSPACE_PATH, name: next.name || 'Stock' }
      if (insertAt < 0) insertAt = result.length
      continue
    }

    if (isStockMenuChildRoute(next.route as string | null | undefined)) {
      sawChild = true
      if (insertAt < 0) insertAt = result.length
      continue
    }

    result.push(next)
  }

  if (stockItem || sawChild) {
    const merged = (stockItem ||
      ({
        id: 'stock-workspace-coalesced',
        name: 'Stock',
        route: STOCK_WORKSPACE_PATH,
      } as T)) as T
    const idx = insertAt < 0 ? result.length : insertAt
    result.splice(idx, 0, merged)
  }

  return result
}

export function coalesceStockMenuGroups<G extends { menuDetails?: CoalesceableMenuNode[] }>(
  groups: G[]
): G[] {
  return groups.map((group) => ({
    ...group,
    menuDetails: coalesceStockMenuDetails(group.menuDetails || []),
  }))
}
