import { describe, expect, it } from 'vitest'
import { retailConflictMessage, retailDraftActions, retailTotalsFromServer } from '../../utils/retailSaleDraft'

describe('Retail draft workspace', () => {
  it('hides create and edit without permission and never offers payment', () => {
    expect(retailDraftActions({ status: 'DRAFT', canCreate: false })).toEqual({
      canCreate: false,
      canEdit: false,
      canConfirm: false,
      canCancel: false,
      canFulfill: false,
      canInvoice: false,
      canResumeSubmit: false,
      canPay: false,
    })
    expect(retailDraftActions({ status: 'DRAFT', canCreate: true }).canEdit).toBe(true)
    expect(retailDraftActions({ status: 'CONFIRMED', canCreate: true }).canEdit).toBe(false)
    expect(retailDraftActions({ status: 'DRAFT', canCreate: false, canConfirm: true }).canConfirm).toBe(true)
    expect(retailDraftActions({ status: 'CONFIRMED', canCreate: false, canConfirm: true }).canConfirm).toBe(false)
    expect(retailDraftActions({ status: 'CONFIRMED', canCreate: false, canCancel: true }).canCancel).toBe(true)
    expect(retailDraftActions({ status: 'CANCELLED', canCreate: false, canCancel: true }).canCancel).toBe(false)
    expect(retailDraftActions({ status: 'CONFIRMED', canCreate: false, canFulfill: true }).canFulfill).toBe(true)
    expect(retailDraftActions({ status: 'DRAFT', canCreate: false, canFulfill: true }).canFulfill).toBe(false)
    expect(retailDraftActions({ status: 'FULFILLED', canCreate: false, canInvoice: true, financeState: 'NOT_INVOICED' }).canInvoice).toBe(true)
    expect(retailDraftActions({ status: 'CONFIRMED', canCreate: false, canInvoice: true, financeState: 'NOT_INVOICED' }).canInvoice).toBe(false)
    expect(retailDraftActions({ status: 'FULFILLED', canCreate: false, canPay: true, financeState: 'INVOICED' }).canPay).toBe(true)
    expect(retailDraftActions({ status: 'FULFILLED', canCreate: false, canPay: true, financeState: 'INVOICE_PENDING' }).canPay).toBe(false)
    expect(retailDraftActions({ status: 'FULFILLED', canCreate: false, canInvoice: true, financeState: 'INVOICE_PENDING', invoiceDocumentStatus: 'draft' }).canResumeSubmit).toBe(true)
    expect(retailDraftActions({ status: 'FULFILLED', canCreate: false, canInvoice: true, financeState: 'INVOICE_PENDING', invoiceDocumentStatus: 'pending_approval' }).canResumeSubmit).toBe(false)
  })

  it('shows a price conflict without confirming', () => {
    expect(retailConflictMessage({
      code: 'RETAIL_PRICE_CHANGED',
      message: 'Harga berubah',
      data: { proposedGrandTotal: 120 },
    })).toContain('120')
  })

  it('renders stored server totals', () => {
    expect(retailTotalsFromServer({ subtotal: 30001.5, grandTotal: 30001.5 }).grandTotal).toBe(30001.5)
    expect(retailTotalsFromServer(null).subtotal).toBe(0)
  })
})
