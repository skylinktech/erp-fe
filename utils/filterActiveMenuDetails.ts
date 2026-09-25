/**
 * Prune sidebar menu trees so inactive menu_detail rows are hidden.
 * Mirrors backend MenuTreeService.filterActiveSidebarDetails (status === 1).
 * Defense-in-depth if a stale API payload still includes nonaktif items.
 */

export const MENU_ACTIVE_STATUS = 1

export type ActiveMenuTreeNode = {
  id: number | string
  status?: number | string | null
  children?: ActiveMenuTreeNode[] | null
  [key: string]: unknown
}

export function isMenuActiveStatus(status: number | string | null | undefined): boolean {
  // Missing status (e.g. FE-coalesced workspace nodes) stays visible.
  if (status === undefined || status === null || status === '') return true
  return Number(status) === MENU_ACTIVE_STATUS
}

function pruneActiveNode<T extends ActiveMenuTreeNode>(node: T): T | null {
  if (!isMenuActiveStatus(node.status)) return null

  const children = Array.isArray(node.children)
    ? (node.children.map((c) => pruneActiveNode(c)).filter(Boolean) as T[])
    : []

  return { ...node, children }
}

export function filterActiveMenuDetails<T extends ActiveMenuTreeNode>(
  details: T[] | null | undefined
): T[] {
  if (!details?.length) return []
  return details.map((d) => pruneActiveNode(d)).filter(Boolean) as T[]
}
