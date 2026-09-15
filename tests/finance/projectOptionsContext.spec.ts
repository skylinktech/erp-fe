import { describe, expect, it } from 'vitest'
import { buildProjectOptionsQuery, filterProjectsForContext } from '~/utils/projectOptionsContext'

describe('project options context', () => {
  it('builds historical GL query with context=historical', () => {
    const qs = buildProjectOptionsQuery({ context: 'historical', search: 'ABC' })
    expect(qs.get('kind')).toBe('project')
    expect(qs.get('context')).toBe('historical')
    expect(qs.get('search')).toBe('ABC')
  })

  it('builds transaction query with context=transaction', () => {
    const qs = buildProjectOptionsQuery({ context: 'transaction' })
    expect(qs.get('context')).toBe('transaction')
  })

  it('hides archived and PRE_SALES from transaction selector', () => {
    const projects = [
      { id: '1', commercialStatus: 'CONTRACTED', archived: false },
      { id: '2', commercialStatus: 'ARCHIVED', archived: true },
      { id: '3', commercialStatus: 'PRE_SALES', archived: false },
      { id: '4', commercialStatus: 'ACTIVE', archivedAt: null },
    ]
    expect(filterProjectsForContext(projects, 'transaction').map((p) => p.id)).toEqual(['1', '4'])
    expect(filterProjectsForContext(projects, 'historical').map((p) => p.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
    ])
  })
})

describe('project profitability lanes (UI contract)', () => {
  function classifyRow(row: { source: string; isReversal?: boolean; isEstimate?: boolean }) {
    if (row.isEstimate) return 'ESTIMATE'
    if (row.isReversal) return 'REVERSED'
    if (['ap_payment', 'expense_payment', 'ar_receipt', 'bank_transfer'].includes(row.source)) {
      return 'CASH'
    }
    if (['purchase_invoice', 'expense', 'sales_issue', 'cogs'].includes(row.source)) {
      return 'RECOGNIZED'
    }
    return 'CASH'
  }

  it('does not classify AP Payment as recognized cost', () => {
    expect(classifyRow({ source: 'ap_payment' })).toBe('CASH')
    expect(classifyRow({ source: 'expense' })).toBe('RECOGNIZED')
    expect(classifyRow({ source: 'quotation_si', isEstimate: true })).toBe('ESTIMATE')
    expect(classifyRow({ source: 'expense', isReversal: true })).toBe('REVERSED')
  })
})
