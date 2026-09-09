import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { journalSourcePath, journalDetailPath } from '~/utils/journalSourceRoutes'

const pageSrc = readFileSync(
  fileURLToPath(new URL('../../pages/finance/reports/general-ledger.vue', import.meta.url)),
  'utf8'
)

describe('general ledger page contract', () => {
  it('does not request detail API before an account is selected', () => {
    expect(pageSrc).toContain("Pilih akun dan periode untuk menampilkan General Ledger.")
    expect(pageSrc).toMatch(/if \(!accountId\.value\)/)
    expect(pageSrc).toMatch(/if \(accountId\.value\) await load\(\)/)
    expect(pageSrc).not.toMatch(/onMounted\(\(\) => \{\s*load\(\)/)
  })

  it('reads canonical camelCase fields only', () => {
    expect(pageSrc).toContain('row.journalNumber')
    expect(pageSrc).toContain('row.lineDescription')
    expect(pageSrc).toContain('row.journalDescription')
    expect(pageSrc).toContain('row.runningBalance')
    expect(pageSrc).toContain('row.referenceType')
    expect(pageSrc).not.toMatch(/row\.journal_number/)
    expect(pageSrc).not.toMatch(/row\.line_description/)
    expect(pageSrc).not.toMatch(/journalNumber \|\| row\.journal_number/)
  })

  it('uses searchable account form-options instead of a raw UUID input', () => {
    expect(pageSrc).toContain("fetchOptions('account'")
    expect(pageSrc).toContain('generalLedgerFormOptions')
    expect(pageSrc).not.toMatch(/placeholder=["']Account ID/)
  })

  it('maps journal and known source drill-down to valid routes', () => {
    expect(journalDetailPath('abc')).toBe('/finance/journals/detail/abc')
    expect(journalSourcePath('sales_invoice', 'abc')).toBe('/finance/invoices/detail/abc')
    expect(journalSourcePath('unknown_type', 'abc')).toBeNull()
  })
})
