/** Composable untuk status approval (Approved by X / Rejected by X): Jabatan → Role → fullName */

export function useApprovalStatus() {
  /** Dapatkan (currentStep, totalSteps) untuk approved: dari approvalLogs + workflow.steps */
  function getApprovedStepCount(row: any): { current: number; total: number } | null {
    const logs = row?.approvalLogs || row?.approval_logs || []
    const approvedLogs = logs.filter((l: any) => (l.action ?? l.Action) === 'approved')
    if (approvedLogs.length === 0) return null
    const last = approvedLogs[approvedLogs.length - 1]
    const steps = last?.workflow?.steps || []
    const total = steps.length
    if (total === 0) return null
    const current = approvedLogs.length
    return { current, total }
  }

  /** Label untuk "Approved by X" / "Rejected by X": prioritas Jabatan → Role → step_name → fullName user; fallback approvedByUser/rejectedByUser jika tidak ada approvalLogs */
  function getApprovalStepJabatan(row: any, action: 'approved' | 'rejected') {
    const logs = row?.approvalLogs || []
    const last = logs.filter((l: any) => l.action === action).pop()
    if (last) {
      const steps = last.workflow?.steps || []
      const step = steps.find((s: any) => (s.step_order ?? s.stepOrder) === last.stepOrder)
      const jabatan = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
      if (jabatan) return jabatan
      const role = step?.role?.name ?? ''
      if (role) return role
      const stepName = step?.step_name ?? step?.stepName ?? ''
      if (stepName) return stepName
      const userName = last?.user?.fullName ?? last?.user?.full_name ?? last?.user?.email ?? ''
      if (userName) return userName
    }
    if (action === 'approved') return row?.approvedByUser?.fullName ?? row?.approvedByUser?.full_name ?? ''
    if (action === 'rejected') return row?.rejectedByUser?.fullName ?? row?.rejectedByUser?.full_name ?? ''
    return ''
  }

  /** Badge untuk status dengan "Approved by [jabatan]" / "Rejected by [jabatan]" */
  function getStatusBadge(row: any, statusMap?: Record<string, { text: string; class: string }>) {
    const status = row?.status
    if (!status) return { text: '—', class: 'badge rounded-pill bg-label-light' }
    const defaultMap: Record<string, { text: string; class: string }> = {
      draft: { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' },
      pending: { text: 'Pending', class: 'badge rounded-pill bg-label-warning' },
      submitted: { text: 'Submitted', class: 'badge rounded-pill bg-label-info' },
      approved: { text: 'Approved', class: 'badge rounded-pill bg-label-success' },
      rejected: { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' },
      disbursed: { text: 'Disbursed', class: 'badge rounded-pill bg-label-warning' },
      settled: { text: 'Settled', class: 'badge rounded-pill bg-label-success' },
      cancelled: { text: 'Cancelled', class: 'badge rounded-pill bg-label-dark' },
      partial: { text: 'Partial', class: 'badge rounded-pill bg-label-info' },
      delivered: { text: 'Delivered', class: 'badge rounded-pill bg-label-success' },
      received: { text: 'Received', class: 'badge rounded-pill bg-label-success' },
      expired: { text: 'Expired', class: 'badge rounded-pill bg-label-dark' },
    }
    const map = { ...defaultMap, ...statusMap }
    const base = map[status] ?? { text: status, class: 'badge rounded-pill bg-label-light' }
    if (status === 'approved') {
      const by = getApprovalStepJabatan(row, 'approved')
      const stepCount = getApprovedStepCount(row)
      const stepSuffix = stepCount && stepCount.total > 0 ? ` (${stepCount.current}/${stepCount.total})` : ''
      return { text: by ? `Approved by ${by}${stepSuffix}` : base.text, class: base.class }
    }
    if (status === 'rejected') {
      const by = getApprovalStepJabatan(row, 'rejected')
      return { text: by ? `Rejected by ${by}` : base.text, class: base.class }
    }
    if (status === 'pending') {
      const prog = row?.signatureProgress ?? row?.signature_progress
      if (prog && typeof prog.count === 'number' && typeof prog.required === 'number' && prog.required > 0) {
        return { text: `Pending (${prog.count}/${prog.required})`, class: base.class }
      }
    }
    return base
  }

  /** Status text untuk ApprovalCard (DRAFT, APPROVED, PENDING, dll) — dengan "Approved by X" saat approved */
  function getStatusText(row: any, statusMap?: Record<string, string>) {
    const status = row?.status
    if (!status) return '—'
    const defaultMap: Record<string, string> = {
      draft: 'DRAFT',
      pending: 'PENDING',
      submitted: 'SUBMITTED',
      approved: 'APPROVED',
      rejected: 'REJECTED',
      disbursed: 'DISBURSED',
      settled: 'SETTLED',
      cancelled: 'CANCELLED',
      partial: 'PARTIAL',
      delivered: 'DELIVERED',
      received: 'RECEIVED',
      expired: 'EXPIRED',
    }
    const map = { ...defaultMap, ...statusMap }
    if (status === 'approved') {
      const by = getApprovalStepJabatan(row, 'approved')
      const stepCount = getApprovedStepCount(row)
      const stepSuffix = stepCount && stepCount.total > 0 ? ` (${stepCount.current}/${stepCount.total})` : ''
      return by ? `Approved by ${by}${stepSuffix}` : (map[status] ?? status.toUpperCase())
    }
    if (status === 'rejected') {
      const by = getApprovalStepJabatan(row, 'rejected')
      return by ? `Rejected by ${by}` : (map[status] ?? status.toUpperCase())
    }
    if (status === 'pending') {
      const prog = row?.signatureProgress ?? row?.signature_progress
      if (prog && typeof prog.count === 'number' && typeof prog.required === 'number' && prog.required > 0) {
        return `Pending (${prog.count}/${prog.required})`
      }
    }
    return map[status] ?? status.toUpperCase()
  }

  return { getApprovalStepJabatan, getApprovedStepCount, getStatusBadge, getStatusText }
}
