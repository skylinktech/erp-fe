/** Level hierarki jabatan: 1 = tertinggi, 5 = terendah. */

export const JABATAN_LEVEL_MIN = 1
export const JABATAN_LEVEL_MAX = 5
export const JABATAN_LEVEL_DEFAULT = 5

export const JABATAN_LEVEL_OPTIONS = [
  { value: 1, label: 'Level 1 — Tertinggi (Direksi)' },
  { value: 2, label: 'Level 2 — Senior Management' },
  { value: 3, label: 'Level 3 — Middle Management' },
  { value: 4, label: 'Level 4 — Supervisor / Koordinator' },
  { value: 5, label: 'Level 5 — Staff / Terendah' },
] as const

export function getJabatanLevelLabel(level: number | null | undefined): string {
  const opt = JABATAN_LEVEL_OPTIONS.find((o) => o.value === level)
  return opt?.label ?? `Level ${level ?? '-'}`
}

export function getJabatanLevelShort(level: number | null | undefined): string {
  if (!level) return '-'
  return `L${level}`
}

export const JABATAN_LEVEL_BADGE_CLASS: Record<number, string> = {
  1: 'bg-label-danger',
  2: 'bg-label-warning',
  3: 'bg-label-info',
  4: 'bg-label-primary',
  5: 'bg-label-secondary',
}

export function getJabatanLevelBadgeClass(level: number | null | undefined): string {
  if (!level) return 'bg-label-light'
  return JABATAN_LEVEL_BADGE_CLASS[level] ?? 'bg-label-light'
}
