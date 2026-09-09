import { journalSourceLabel, journalSourcePath } from '~/utils/journalSourceRoutes'

export function bankLedgerSourcePath(referenceType?: string | null, referenceId?: string | null): string | null {
  return journalSourcePath(referenceType, referenceId)
}

export function bankLedgerSourceLabel(referenceType?: string | null): string {
  return journalSourceLabel(referenceType)
}
