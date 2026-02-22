/** Composable untuk status approval (Approved by X / Rejected by X): Jabatan → Role → fullName → username */

/** Ambil jabatan user dari pegawai.PegawaiHistory (terbaru).nm_jabatan */
function getUserJabatan(user: any): string {
  if (!user) return ''
  const ph = user?.pegawai?.PegawaiHistory ?? user?.pegawai?.pegawai_history ?? []
  const latest = Array.isArray(ph) ? ph[0] : null
  return latest?.jabatan?.nm_jabatan ?? latest?.jabatan?.nmJabatan ?? ''
}

/** Ambil display name user: prioritas jabatan → role → fullName → username */
function getUserDisplayName(user: any): string {
  if (!user) return ''
  const jabatan = getUserJabatan(user)
  if (jabatan) return jabatan
  const roles = user?.roles ?? []
  const roleName = Array.isArray(roles) ? roles[0]?.name : ''
  if (roleName) return roleName
  const fullName = user?.fullName ?? user?.full_name ?? ''
  if (fullName) return fullName
  return user?.username ?? user?.email ?? ''
}

export function useApprovalStatus() {
  /**
   * Dapatkan (currentStep, totalSteps) untuk approved.
   * Hanya hitung approval SETELAH reject terakhir (setelah resubmit, approval sebelumnya dianggap void).
   */
  function getApprovedStepCount(row: any): { current: number; total: number } | null {
    const logs = row?.approvalLogs || row?.approval_logs || []
    const sorted = [...logs].sort((a: any, b: any) => {
      const ta = new Date(a.createdAt ?? a.created_at ?? 0).getTime()
      const tb = new Date(b.createdAt ?? b.created_at ?? 0).getTime()
      return ta - tb || (a.id ?? 0) - (b.id ?? 0)
    })
    const lastRejectIdx = sorted.map((l: any) => (l.action ?? l.Action) === 'rejected').lastIndexOf(true)
    const logsAfterReject = lastRejectIdx >= 0 ? sorted.slice(lastRejectIdx + 1) : sorted
    const approvedLogs = logsAfterReject.filter((l: any) => (l.action ?? l.Action) === 'approved')
    if (approvedLogs.length === 0) return null
    const last = approvedLogs[approvedLogs.length - 1]
    const wf = last?.workflow ?? last?.Workflow
    const steps = Array.isArray(wf?.steps) ? wf.steps : (Array.isArray(wf?.Steps) ? wf.Steps : [])
    const total = steps.length
    if (total === 0) return null
    const current = Math.min(approvedLogs.length, total)
    return { current, total }
  }

  /** Label untuk "Approved by X" / "Rejected by X": prioritas Jabatan → Role → step_name → displayName user (jabatan > role > fullName > username); fallback approvedByUser/rejectedByUser jika tidak ada approvalLogs */
  function getApprovalStepJabatan(row: any, action: 'approved' | 'rejected') {
    const logs = row?.approvalLogs ?? row?.approval_logs ?? []
    const last = logs.filter((l: any) => (l.action ?? l.Action) === action).pop()
    if (last) {
      const steps = last.workflow?.steps || []
      const step = steps.find((s: any) => (s.step_order ?? s.stepOrder) === (last.stepOrder ?? last.step_order))
      const jabatan = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
      if (jabatan) return jabatan
      const role = step?.role?.name ?? ''
      if (role) return role
      const stepName = step?.step_name ?? step?.stepName ?? ''
      if (stepName) return stepName
      const userDisplay = getUserDisplayName(last?.user)
      if (userDisplay) return userDisplay
    }
    if (action === 'approved') return getUserDisplayName(row?.approvedByUser ?? row?.approved_by_user)
    if (action === 'rejected') return getUserDisplayName(row?.rejectedByUser ?? row?.rejected_by_user)
    return ''
  }

  /**
   * Dapatkan step count untuk approved (dari approvalLogs atau fallback signatureProgress).
   * Berguna untuk badge "(1/2)" dan pengecekan partial approval.
   */
  function getStepCountForApproved(row: any): { current: number; total: number } | null {
    const fromLogs = getApprovedStepCount(row)
    if (fromLogs && fromLogs.total > 0) return fromLogs
    const prog = row?.signatureProgress ?? row?.signature_progress
    if (prog && typeof prog.count === 'number' && typeof prog.required === 'number' && prog.required > 0) {
      return { current: prog.count, total: prog.required }
    }
    return null
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
      const stepCount = getStepCountForApproved(row)
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
      const stepCount = getStepCountForApproved(row)
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

  return { getApprovalStepJabatan, getApprovedStepCount, getStepCountForApproved, getStatusBadge, getStatusText, getUserDisplayName }
}
