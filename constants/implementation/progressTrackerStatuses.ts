export const PROGRESS_TRACKER_STATUSES = [
  'material_readiness',
  'material_on_delivery',
  'material_on_site',
  'ongoing_progress',
  'activation',
  'online',
  'ba',
] as const

export type ProgressTrackerStatus = (typeof PROGRESS_TRACKER_STATUSES)[number]

export const PROGRESS_TRACKER_STATUS_LABELS: Record<ProgressTrackerStatus, string> = {
  material_readiness: 'Material Readiness',
  material_on_delivery: 'Material on Delivery',
  material_on_site: 'Material on Site',
  ongoing_progress: 'On Going Progress',
  activation: 'Activation',
  online: 'Online',
  ba: 'BA',
}

export const PROGRESS_TRACKER_STATUS_OPTIONS = PROGRESS_TRACKER_STATUSES.map((value) => ({
  value,
  label: PROGRESS_TRACKER_STATUS_LABELS[value],
}))

export const PROJECT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
]

/** Alias status lama dari API (mor/mod/…) */
const LEGACY_STATUS_ALIASES: Record<string, ProgressTrackerStatus> = {
  mor: 'material_readiness',
  mod: 'material_on_delivery',
  mos: 'material_on_site',
  ogp: 'ongoing_progress',
}

export function getProgressTrackerStatusIndex(
  status: string | undefined | null
): number {
  const normalized = normalizeProgressTrackerStatus(status, 'material_readiness')
  const idx = PROGRESS_TRACKER_STATUSES.indexOf(normalized)
  return idx >= 0 ? idx : 0
}

/** Persentase progres linier berdasarkan urutan tahap (1–7 → ~14% … 100%). */
export function getProgressTrackerPercent(status: string | undefined | null): number {
  const idx = getProgressTrackerStatusIndex(status)
  const total = PROGRESS_TRACKER_STATUSES.length
  if (total <= 0) return 0
  return Math.round(((idx + 1) / total) * 100)
}

export function normalizeProgressTrackerStatus(
  status: string | undefined | null,
  fallback: ProgressTrackerStatus = 'material_readiness'
): ProgressTrackerStatus {
  const raw = String(status ?? '').trim()
  if (!raw) return fallback
  if ((PROGRESS_TRACKER_STATUSES as readonly string[]).includes(raw)) {
    return raw as ProgressTrackerStatus
  }
  return LEGACY_STATUS_ALIASES[raw] ?? fallback
}

export function getProgressStatusBadge(status: string | undefined) {
  const normalized = normalizeProgressTrackerStatus(status, 'material_readiness')
  const map: Record<string, { class: string; text: string }> = {
    material_readiness: { class: 'badge bg-label-secondary', text: 'Material Readiness' },
    material_on_delivery: { class: 'badge bg-label-info', text: 'Material on Delivery' },
    material_on_site: { class: 'badge bg-label-primary', text: 'Material on Site' },
    ongoing_progress: { class: 'badge bg-label-warning', text: 'On Going Progress' },
    activation: { class: 'badge bg-label-warning', text: 'Activation' },
    online: { class: 'badge bg-label-success', text: 'Online' },
    ba: { class: 'badge bg-label-success', text: 'BA' },
  }
  return (
    map[normalized] || {
      class: 'badge bg-label-secondary',
      text: PROGRESS_TRACKER_STATUS_LABELS[normalized] || status || '—',
    }
  )
}

export function getProjectStatusBadge(status: string | undefined) {
  const map: Record<string, { class: string; text: string }> = {
    active: { class: 'badge bg-label-success', text: 'Active' },
    completed: { class: 'badge bg-label-primary', text: 'Completed' },
    on_hold: { class: 'badge bg-label-warning', text: 'On Hold' },
    cancelled: { class: 'badge bg-label-danger', text: 'Cancelled' },
  }
  return map[status || ''] || { class: 'badge bg-label-secondary', text: status || '—' }
}
