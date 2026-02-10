/**
 * Shared ApprovalLogEntry interface - used by ARF, IRO, Legal Tech, MGRF, Purchase Request
 */
export interface ApprovalLogEntry {
  id: number
  entityType?: string
  entityId?: string
  stepOrder: number
  action: 'approved' | 'rejected'
  remarks?: string | null
  createdAt?: string
  user?: { id?: number; full_name?: string; fullName?: string; email?: string }
  workflow?: { id?: number; name?: string; steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string; jabatan?: { nm_jabatan?: string; nmJabatan?: string } }> }
}
