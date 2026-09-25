import { describe, expect, it } from 'vitest'
import { retailReturnActions } from '../../utils/retailReturn'

describe('Retail return finance workspace', () => {
  it('keeps physical posting, credit, and cash refund on separate states', () => {
    expect(retailReturnActions({ status: 'DRAFT', canApprove: true }).canApprove).toBe(true)
    expect(retailReturnActions({ status: 'RECEIVED', canPost: true }).canPost).toBe(true)
    expect(retailReturnActions({ status: 'POSTED', canPost: true }).canPost).toBe(false)
    expect(retailReturnActions({ status: 'POSTED', canCompensate: true }).canCompensate).toBe(true)
    expect(retailReturnActions({ status: 'APPROVED', canCompensate: true }).canCompensate).toBe(false)
    expect(retailReturnActions({
      status: 'RECEIVED', compensationStatus: 'APPROVED', canCredit: true,
    }).canCredit).toBe(true)
    expect(retailReturnActions({
      status: 'POSTED', creditStatus: 'POSTED', refundableCash: 10000, canRequestRefund: true,
    }).canRequestRefund).toBe(true)
    expect(retailReturnActions({
      status: 'POSTED', creditStatus: 'POSTED', refundableCash: 0, canRequestRefund: true,
    }).canRequestRefund).toBe(false)
    expect(retailReturnActions({
      refundStatus: 'APPROVED', refundMethod: 'bank_transfer', canConfirmRefund: true,
    }).canConfirmCashRefund).toBe(false)
    expect(retailReturnActions({
      refundStatus: 'APPROVED', refundMethod: 'bank_transfer',
    }).bankTransferCompleted).toBe(false)
    expect(retailReturnActions({ status: 'POSTED' }).refundCompleted).toBe(false)
    expect(retailReturnActions({
      refundStatus: 'POSTED', refundMethod: 'cash',
    }).refundCompleted).toBe(true)
  })
})
