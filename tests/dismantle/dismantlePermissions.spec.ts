import { describe, expect, it } from 'vitest'

/** Mirrors detail page action visibility rules for regression testing */
function dismantleActionVisibility(opts: {
  status: string
  permissions: string[]
}) {
  const { status, permissions } = opts
  const has = (p: string) => permissions.includes(p)
  return {
    canEdit: status === 'draft' && has('edit_dismantle_request'),
    canSubmit: status === 'draft' && has('submit_dismantle_request'),
    canApprove: status === 'submitted' && has('approve_dismantle_request'),
    canReject: status === 'submitted' && has('reject_dismantle_request'),
    canStart: ['approved', 'scheduled'].includes(status),
    canExecute: ['approved', 'scheduled', 'in_progress'].includes(status),
    canReceive: status === 'in_progress',
    canFinanceReview: has('review_dismantle_finance'),
    canViewFinancial: has('view_dismantle_financial_summary'),
    canComplete:
      has('approve_dismantle_request') || has('edit_dismantle_request'),
  }
}

describe('dismantle action permission visibility', () => {
  const ops = [
    'edit_dismantle_request',
    'submit_dismantle_request',
    'approve_dismantle_request',
    'view_dismantle_financial_summary',
  ]

  it('draft shows create/edit/submit only with matching permissions', () => {
    const v = dismantleActionVisibility({ status: 'draft', permissions: ops })
    expect(v.canEdit).toBe(true)
    expect(v.canSubmit).toBe(true)
    expect(v.canApprove).toBe(false)
    expect(v.canStart).toBe(false)
  })

  it('submitted shows approve/reject for approver permission', () => {
    const v = dismantleActionVisibility({
      status: 'submitted',
      permissions: ['approve_dismantle_request', 'reject_dismantle_request'],
    })
    expect(v.canApprove).toBe(true)
    expect(v.canReject).toBe(true)
    expect(v.canEdit).toBe(false)
  })

  it('approved enables start and execute (Opsi A contract)', () => {
    const v = dismantleActionVisibility({ status: 'approved', permissions: ops })
    expect(v.canStart).toBe(true)
    expect(v.canExecute).toBe(true)
    expect(v.canReceive).toBe(false)
  })

  it('in_progress enables receive but not start', () => {
    const v = dismantleActionVisibility({ status: 'in_progress', permissions: ops })
    expect(v.canStart).toBe(false)
    expect(v.canExecute).toBe(true)
    expect(v.canReceive).toBe(true)
  })

  it('finance review requires review_dismantle_finance not summary alone', () => {
    const summaryOnly = dismantleActionVisibility({
      status: 'in_progress',
      permissions: ['view_dismantle_financial_summary'],
    })
    expect(summaryOnly.canViewFinancial).toBe(true)
    expect(summaryOnly.canFinanceReview).toBe(false)

    const finance = dismantleActionVisibility({
      status: 'in_progress',
      permissions: ['review_dismantle_finance', 'view_dismantle_financial_summary'],
    })
    expect(finance.canFinanceReview).toBe(true)
  })
})
