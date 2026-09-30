import { describe, expect, it } from 'vitest'
import {
  getSelectedValueIds,
  upsertProductAttribute,
} from '~/utils/commerceProductAttributes'

describe('commerceProductAttributes', () => {
  it('upserts and clears attribute selections', () => {
    let rows = upsertProductAttribute([], '100107', [{ id: '9', name: 'Garansi resmi' }])
    expect(rows).toEqual([{ id: '100107', values: [{ id: '9', name: 'Garansi resmi' }] }])
    expect(getSelectedValueIds(rows, '100107')).toEqual(['9'])
    rows = upsertProductAttribute(rows, '100107', [])
    expect(rows).toEqual([])
  })
})
