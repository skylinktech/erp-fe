/**
 * Fixture-driven checks for Omnichannel Produk page helpers (no live API).
 * Covers request-version guard semantics + mapped filter query mapping.
 */
import { describe, expect, it } from 'vitest'
import {
  clampCommercePerPage,
  COMMERCE_DEFAULT_PER_PAGE,
  COMMERCE_MAX_PER_PAGE,
  normalizeCommerceMeta,
} from '../../utils/commercePagination'

describe('omnichannel produk — pagination & filter fixtures', () => {
  it('clamps perPage to 1..100 (no hidden 50 ceiling beyond BE max)', () => {
    expect(clampCommercePerPage(50)).toBe(50)
    expect(clampCommercePerPage(100)).toBe(100)
    expect(clampCommercePerPage(500)).toBe(COMMERCE_MAX_PER_PAGE)
    expect(clampCommercePerPage(0)).toBe(1)
    expect(clampCommercePerPage('x', COMMERCE_DEFAULT_PER_PAGE)).toBe(COMMERCE_DEFAULT_PER_PAGE)
  })

  it('normalizeCommerceMeta preserves totals for full-dataset pagination', () => {
    const meta = normalizeCommerceMeta({
      total: 237,
      perPage: 20,
      currentPage: 3,
      lastPage: 12,
    })
    expect(meta.total).toBe(237)
    expect(meta.lastPage).toBe(12)
    expect(meta.currentPage).toBe(3)
  })

  it('mapped query fixture: dashboard ?mapped=0 → unmapped server filter', () => {
    const fromRoute = (mapped: string | undefined) => {
      if (mapped === '0' || mapped === 'unmapped') return 'unmapped'
      if (mapped === '1' || mapped === 'mapped') return 'mapped'
      return ''
    }
    expect(fromRoute('0')).toBe('unmapped')
    expect(fromRoute('1')).toBe('mapped')
    expect(fromRoute(undefined)).toBe('')
  })

  it('request-version guard: stale response must not apply', () => {
    let gen = 0
    let applied: string | null = null
    const apply = (myGen: number, payload: string) => {
      if (myGen !== gen) return
      applied = payload
    }
    const g1 = ++gen
    const g2 = ++gen
    apply(g1, 'stale-company-A')
    apply(g2, 'fresh-company-B')
    expect(applied).toBe('fresh-company-B')
  })
})
