import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('site investment list fetch payload', () => {
  it('does not request line items on the list endpoint', () => {
    const src = readFileSync(fileURLToPath(new URL('../../stores/site-invest.ts', import.meta.url)), 'utf8')
    const listFetch = src.slice(src.indexOf('async fetchSiteInvests'), src.indexOf('async fetchStats'))
    expect(listFetch).toMatch(/includeItems:\s*'false'/)
    expect(listFetch).not.toMatch(/includeItems:\s*'true'/)
  })
})
