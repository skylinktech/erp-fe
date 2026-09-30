import { describe, expect, it } from 'vitest'
import { humanizeLabel } from '~/utils/humanizeLabel'

describe('humanizeLabel', () => {
  it('turns snake_case into Title Case with known acronyms', () => {
    expect(humanizeLabel('ar_receipt')).toBe('AR Receipt')
    expect(humanizeLabel('sales_invoice')).toBe('Sales Invoice')
    expect(humanizeLabel('inventory_movement')).toBe('Inventory Movement')
    expect(humanizeLabel('ap_payment')).toBe('AP Payment')
    expect(humanizeLabel('inventory_grni_clearing')).toBe('Inventory GRNI Clearing')
  })

  it('handles SCREAMING_SNAKE and kebab-case', () => {
    expect(humanizeLabel('SALES_ISSUE')).toBe('Sales Issue')
    expect(humanizeLabel('inventory-movement')).toBe('Inventory Movement')
  })

  it('honors explicit label overrides', () => {
    expect(
      humanizeLabel('payroll_run', {
        labels: { payroll_run: 'Payroll' },
      })
    ).toBe('Payroll')
  })

  it('leaves already-readable labels alone', () => {
    expect(humanizeLabel('AR Receipt')).toBe('AR Receipt')
    expect(humanizeLabel('Posted')).toBe('Posted')
  })

  it('title-cases plain lowercase tokens', () => {
    expect(humanizeLabel('posted')).toBe('Posted')
  })

  it('returns fallback for empty values', () => {
    expect(humanizeLabel(null, { fallback: '—' })).toBe('—')
    expect(humanizeLabel('', { fallback: '—' })).toBe('—')
    expect(humanizeLabel(undefined)).toBe('')
  })
})
