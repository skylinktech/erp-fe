/**
 * Prune sidebar menu trees so capability-gated routes (e.g. Omnichannel)
 * disappear when Active Company profile/flows do not allow them.
 */
import { isRouteAllowedForContext, type RouteAllowContext } from '~/utils/businessFlowRoute'

export type MenuTreeNode = {
  id: number | string
  route?: string | null
  children?: MenuTreeNode[] | null
  [key: string]: unknown
}

function pruneNode(node: MenuTreeNode, ctx: RouteAllowContext): MenuTreeNode | null {
  const children = Array.isArray(node.children)
    ? node.children.map((c) => pruneNode(c, ctx)).filter(Boolean) as MenuTreeNode[]
    : []

  const route = typeof node.route === 'string' ? node.route : null
  if (route) {
    if (!isRouteAllowedForContext(route, ctx)) return null
    return { ...node, children }
  }

  // Folder (null route): keep only if any child survives
  if (!children.length) return null
  return { ...node, children }
}

export function filterMenuDetailsByCompanyContext<T extends MenuTreeNode>(
  details: T[] | null | undefined,
  ctx: RouteAllowContext
): T[] {
  if (!details?.length) return []
  return details.map((d) => pruneNode(d, ctx)).filter(Boolean) as T[]
}
