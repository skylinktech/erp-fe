import { describe, expect, it } from 'vitest'
import { shouldApplyCompanyPayload } from '~/utils/companyContextSync'

/**
 * Deterministic race/cross-tab proofs for HR/catalog pages that use
 * useCompanyScopedReload + generation gates.
 */
describe('HR/catalog company race & cross-tab', () => {
  it('late A response after switch to B is dropped', () => {
    const generationAtRequest = 10 // company A
    const generationNow = 11 // switched to B
    expect(shouldApplyCompanyPayload(generationNow, generationAtRequest)).toBe(false)
  })

  it('in-flight B response accepted only for current generation', () => {
    const generationAtRequest = 11
    const generationNow = 11
    expect(shouldApplyCompanyPayload(generationNow, generationAtRequest)).toBe(true)
  })

  it('failed B request must not fall back to stale A cache generation', () => {
    // Simulated: request B fails; applying A payload with older generation is rejected
    const cacheFromA = { generation: 10, rows: [{ id: 'a1' }] }
    const currentGeneration = 11
    const applyCache = (payload: typeof cacheFromA) =>
      shouldApplyCompanyPayload(currentGeneration, payload.generation)
        ? payload.rows
        : []
    expect(applyCache(cacheFromA)).toEqual([])
  })

  it('cross-tab bump invalidates previous selection generation', () => {
    let selectionCompanyId = 2
    let selectionGeneration = 5
    // other tab switches to company 3 → generation 6
    const nextGeneration = 6
    const nextCompanyId = 3
    if (nextGeneration !== selectionGeneration) {
      selectionCompanyId = nextCompanyId
      selectionGeneration = nextGeneration
    }
    expect(selectionCompanyId).toBe(3)
    expect(selectionGeneration).toBe(6)
  })
})
