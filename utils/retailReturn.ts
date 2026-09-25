export function retailReturnActions(input: {
  status?: string | null
  canCreate?: boolean
  canApprove?: boolean
  canReceive?: boolean
  canPost?: boolean
  canCompensate?: boolean
  canCredit?: boolean
  canRequestRefund?: boolean
  canApproveRefund?: boolean
  canConfirmRefund?: boolean
  compensationStatus?: string | null
  creditStatus?: string | null
  refundStatus?: string | null
  refundMethod?: string | null
  refundableCash?: number | null
}) {
  const received = input.status === 'RECEIVED' || input.status === 'POSTED'
  return {
    canCreate: Boolean(input.canCreate),
    canApprove: Boolean(input.canApprove) && input.status === 'DRAFT',
    canReceive: Boolean(input.canReceive) && input.status === 'APPROVED',
    canPost: Boolean(input.canPost) && input.status === 'RECEIVED',
    canCompensate: Boolean(input.canCompensate) && received && !input.compensationStatus,
    canCredit: Boolean(input.canCredit) && input.compensationStatus === 'APPROVED' && input.creditStatus !== 'POSTED',
    canRequestRefund: Boolean(input.canRequestRefund) && input.creditStatus === 'POSTED' && Number(input.refundableCash || 0) > 0 && !input.refundStatus,
    canApproveRefund: Boolean(input.canApproveRefund) && input.refundStatus === 'REQUESTED',
    canConfirmCashRefund: Boolean(input.canConfirmRefund) && input.refundStatus === 'APPROVED' && input.refundMethod === 'cash',
    refundCompleted: input.refundStatus === 'POSTED' && input.refundMethod === 'cash',
    bankTransferCompleted: false,
  }
}
