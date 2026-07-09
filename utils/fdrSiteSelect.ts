export const MANUAL_SITE_ID = -1

export const MANUAL_SITE_OPTION = {
  id: MANUAL_SITE_ID,
  code: '',
  name: 'Tambah Site',
  isManual: true,
} as const

export type SiteSelectOption = {
  id: number
  code?: string
  name?: string
  address?: string | null
  isManual?: boolean
}

export function buildSiteSelectOptions(sites: SiteSelectOption[]): SiteSelectOption[] {
  return [MANUAL_SITE_OPTION, ...sites]
}

export function isManualSiteSelection(siteId: number | null | undefined): boolean {
  return Number(siteId) === MANUAL_SITE_ID
}

export function getSiteSelectLabel(
  site: SiteSelectOption | null | undefined,
  manualName?: string | null
): string {
  if (!site) return ''
  if (site.isManual || site.id === MANUAL_SITE_ID) {
    const name = String(manualName ?? '').trim()
    return name || 'Tambah Site'
  }
  const code = site.code || ''
  const name = site.name || ''
  return code ? `${code} - ${name}` : name
}

export function resolveSiteFormState(fdr: {
  siteId?: number | null
  site_id?: number | null
  siteName?: string | null
  site_name?: string | null
}): { siteId: number | null; siteName: string } {
  const siteId = fdr.siteId ?? fdr.site_id ?? null
  const siteName = String(fdr.siteName ?? fdr.site_name ?? '').trim()
  if (!siteId && siteName) {
    return { siteId: MANUAL_SITE_ID, siteName }
  }
  return { siteId, siteName }
}

export function resolveSitePayload(
  siteId: number | null | undefined,
  siteName: string | null | undefined
): { siteId: number | null; siteName: string | null } {
  if (isManualSiteSelection(siteId)) {
    const name = String(siteName ?? '').trim()
    return { siteId: null, siteName: name || null }
  }
  const id = siteId != null && Number(siteId) > 0 ? Number(siteId) : null
  return { siteId: id, siteName: null }
}
