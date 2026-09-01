import { describe, expect, it } from 'vitest'
import { normalizeStatistics, unwrapApiArray, unwrapListPayload } from '~/utils/dismantleAdapter'

describe('unwrapApiArray', () => {
  it('accepts empty and populated flat arrays without mutating items', () => {
    const row = { id: 1, name: 'QA' }
    const flat = [row]
    expect(unwrapApiArray([])).toEqual([])
    expect(unwrapApiArray(flat)).toBe(flat)
    expect(unwrapApiArray(flat)[0]).toBe(row)
  })

  it('accepts wrapped paginator envelope { data: [...] }', () => {
    expect(unwrapApiArray({ data: [] })).toEqual([])
    expect(unwrapApiArray({ data: [{ id: 1 }] })).toEqual([{ id: 1 }])
  })

  it('does not treat nested data object or alternate keys as arrays', () => {
    expect(unwrapApiArray({ data: { data: [] } })).toEqual([])
    expect(unwrapApiArray({ results: [{ id: 1 }] })).toEqual([])
    expect(unwrapApiArray({ data: 'not-array' })).toEqual([])
  })

  it('returns empty array for null, undefined, and malformed payloads', () => {
    expect(unwrapApiArray(null)).toEqual([])
    expect(unwrapApiArray(undefined)).toEqual([])
    expect(unwrapApiArray('bad')).toEqual([])
    expect(unwrapApiArray(42)).toEqual([])
    expect(unwrapApiArray({})).toEqual([])
  })
})

describe('dismantleAdapter', () => {

  it('unwrapListPayload handles paginator envelope', () => {
    const { items, total } = unwrapListPayload({
      data: [{ id: 'a', request_number: 'RD-1', status: 'draft', services: [] }],
      meta: { total: 1 },
    })
    expect(items).toHaveLength(1)
    expect(items[0].requestNumber).toBe('RD-1')
    expect(total).toBe(1)
  })

  it('normalizeStatistics maps backend counters', () => {
    const stats = normalizeStatistics({ total: 5, draft: 2, in_progress: 1 })
    expect(stats.total).toBe(5)
    expect(stats.draft).toBe(2)
    expect(stats.in_progress).toBe(1)
    expect(stats.completed).toBe(0)
  })
})
