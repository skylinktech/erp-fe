import { describe, expect, it } from 'vitest'
import {
  assembleListingCategoryForest,
  flattenListingCategoryLeaves,
  type ListingCategoryNode,
} from '~/utils/commerceListingCategories'

describe('listing category forest + leaves', () => {
  it('assembles flat TikTok parent_id list into forest', () => {
    const flat: ListingCategoryNode[] = [
      { id: '1', name: 'Komputer & Peralatan Kantor', parentId: '0', isLeaf: false },
      { id: '11', name: 'Mouse & Keyboard', parentId: '1', isLeaf: false },
      { id: '111', name: 'Mouse', parentId: '11', isLeaf: true },
      { id: '112', name: 'Keyboard', parentId: '11', isLeaf: true },
    ]
    const forest = assembleListingCategoryForest(flat)
    expect(forest).toHaveLength(1)
    expect(forest[0].id).toBe('1')
    expect(forest[0].isLeaf).toBe(false)
    expect(forest[0].children?.[0]?.id).toBe('11')
    expect(forest[0].children?.[0]?.children?.map((c) => c.id)).toEqual(['111', '112'])
  })

  it('flatten emits only true leaves with full path (not top-level parents)', () => {
    const flat: ListingCategoryNode[] = [
      { id: '1', name: 'Komputer & Peralatan Kantor', parentId: null, isLeaf: false },
      { id: '11', name: 'Mouse & Keyboard', parentId: '1', isLeaf: false },
      { id: '111', name: 'Mouse', parentId: '11', isLeaf: true },
    ]
    const leaves = flattenListingCategoryLeaves(flat)
    expect(leaves.map((l) => l.id)).toEqual(['111'])
    expect(leaves[0].pathLabel).toBe('Komputer & Peralatan Kantor › Mouse & Keyboard › Mouse')
  })

  it('never treats isLeaf:false + empty children as selectable', () => {
    const leaves = flattenListingCategoryLeaves([
      { id: '1', name: 'Parent Only', isLeaf: false, children: [] },
    ])
    expect(leaves).toHaveLength(0)
  })

  it('nested tree still works', () => {
    const tree: ListingCategoryNode[] = [
      {
        id: '1',
        name: 'Elektronik',
        isLeaf: false,
        children: [
          {
            id: '11',
            name: 'Komputer',
            isLeaf: false,
            children: [{ id: '111', name: 'Mouse', isLeaf: true }],
          },
        ],
      },
    ]
    const leaves = flattenListingCategoryLeaves(tree)
    expect(leaves).toHaveLength(1)
    expect(leaves[0].pathLabel).toBe('Elektronik › Komputer › Mouse')
  })
})
