import { describe, expect, it } from 'vitest'
import { getDismantleIdempotencyKey, clearDismantleIdempotencyKey } from '~/utils/dismantleIdempotency'

describe('dismantleIdempotency', () => {
  it('reuses key for same intent', () => {
    const a = getDismantleIdempotencyKey('intent-1')
    const b = getDismantleIdempotencyKey('intent-1')
    expect(a).toBe(b)
    clearDismantleIdempotencyKey('intent-1')
    const c = getDismantleIdempotencyKey('intent-1')
    expect(c).not.toBe(a)
  })
})
