/**
 * TikTok Get Categories is usually a flat list (id, parent_id, is_leaf).
 * Assemble forest + emit only true leaves for Select2.
 * Pure / unit-testable — no HTTP.
 */

export type ListingCategoryNode = {
  id: string
  name: string
  parentId?: string | null
  isLeaf: boolean
  children?: ListingCategoryNode[]
}

export type ListingCategoryLeafOption = {
  id: string
  name: string
  /** Breadcrumb label for search + display, e.g. "Elektronik › Mouse" */
  pathLabel: string
  depth: number
}

/**
 * Build parent→children forest from a flat (or already nested) category list.
 * Prefer explicit `isLeaf` from API; parents that gain children become non-leaf.
 */
export function assembleListingCategoryForest(
  nodes: ListingCategoryNode[] | null | undefined
): ListingCategoryNode[] {
  const list = Array.isArray(nodes) ? nodes : []
  if (!list.length) return []

  const hasNestedChildren = list.some((n) => Array.isArray(n.children) && n.children!.length > 0)
  if (hasNestedChildren) {
    return list.map((n) => normalizeNested(n))
  }

  const byId = new Map<string, ListingCategoryNode>()
  for (const raw of list) {
    const id = String(raw?.id || '').trim()
    if (!id || byId.has(id)) continue
    byId.set(id, {
      id,
      name: String(raw.name || id).trim() || id,
      parentId: raw.parentId != null && String(raw.parentId).trim() ? String(raw.parentId) : null,
      isLeaf: raw.isLeaf === true,
      children: [],
    })
  }

  const roots: ListingCategoryNode[] = []
  for (const node of byId.values()) {
    const pid = node.parentId
    if (pid && byId.has(pid)) {
      byId.get(pid)!.children!.push(node)
    } else {
      roots.push(node)
    }
  }

  const mark = (n: ListingCategoryNode) => {
    const kids = n.children || []
    for (const c of kids) mark(c)
    if (kids.length > 0) {
      n.isLeaf = false
    } else {
      // Keep API leaf flag; default to leaf when unset and no children.
      n.isLeaf = n.isLeaf === true || n.isLeaf !== false
    }
  }
  for (const r of roots) mark(r)
  return roots
}

function normalizeNested(n: ListingCategoryNode): ListingCategoryNode {
  const children = (n.children || []).map(normalizeNested)
  return {
    id: String(n.id || '').trim(),
    name: String(n.name || n.id || '').trim(),
    parentId: n.parentId ?? null,
    isLeaf: children.length > 0 ? false : n.isLeaf === true,
    children,
  }
}

/**
 * Walk assembled forest; emit only nodes with isLeaf === true.
 * Never treat a parent (`isLeaf: false`) as selectable even if children[] is empty.
 */
export function flattenListingCategoryLeaves(
  nodes: ListingCategoryNode[] | null | undefined,
  opts?: { separator?: string }
): ListingCategoryLeafOption[] {
  const sep = opts?.separator ?? ' › '
  const forest = assembleListingCategoryForest(nodes)
  const out: ListingCategoryLeafOption[] = []
  const seen = new Set<string>()

  function walk(list: ListingCategoryNode[], ancestors: string[]) {
    for (const node of list || []) {
      const id = String(node?.id || '').trim()
      if (!id) continue
      const name = String(node?.name || id).trim() || id
      const path = [...ancestors, name]
      const children = Array.isArray(node.children) ? node.children : []

      if (children.length > 0) {
        walk(children, path)
        continue
      }

      // Strict: only explicit leaves (after assemble, childless non-leaves are skipped).
      if (node.isLeaf !== true) continue
      if (seen.has(id)) continue
      seen.add(id)
      out.push({
        id,
        name,
        pathLabel: path.join(sep),
        depth: path.length,
      })
    }
  }

  walk(forest, [])
  return out
}
