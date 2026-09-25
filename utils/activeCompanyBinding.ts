/**
 * Pure Active Company binding helpers (no Pinia / fetch).
 * Forms that do not need ADMIN_TARGET_company should use these instead of manual ID inputs.
 */

export type ActiveCompanySnapshot = {
  companyId: number | null
  company: { id: number; code?: string | null; name?: string | null } | null
  selectionRequired?: boolean
  initialized?: boolean
}

export type ActiveCompanyBindResult =
  | { ok: true; companyId: number; label: string }
  | { ok: false; companyId: null; label: string; code: string; message: string }

export function formatActiveCompanyLabel(
  company: { code?: string | null; name?: string | null } | null | undefined,
  companyId?: number | null
): string {
  if (!company && (companyId == null || companyId <= 0)) return 'Belum dipilih'
  const name = company?.name?.trim() || ''
  const code = company?.code?.trim() || ''
  if (name && code) return `${name} (${code})`
  if (name) return name
  if (code) return code
  if (companyId != null && companyId > 0) return `Perusahaan #${companyId}`
  return 'Belum dipilih'
}

/**
 * Resolve the transaction company from Active Company context.
 * Fail-closed: never invent company id 1 or first list row.
 */
export function bindActiveCompany(snapshot: ActiveCompanySnapshot): ActiveCompanyBindResult {
  if (snapshot.selectionRequired) {
    return {
      ok: false,
      companyId: null,
      label: 'Belum dipilih',
      code: 'COMPANY_CONTEXT_REQUIRED',
      message: 'Pilih Active Company terlebih dahulu. Akun Anda terhubung ke lebih dari satu perusahaan.',
    }
  }

  const id = snapshot.companyId != null ? Number(snapshot.companyId) : null
  if (id == null || !Number.isFinite(id) || id <= 0) {
    return {
      ok: false,
      companyId: null,
      label: 'Belum dipilih',
      code: 'COMPANY_CONTEXT_REQUIRED',
      message:
        snapshot.initialized === false
          ? 'Konteks perusahaan sedang dimuat.'
          : 'Active Company belum tersedia. Pastikan akun tertaut ke pegawai aktif atau Anda punya akses perusahaan.',
    }
  }

  const company = snapshot.company && Number(snapshot.company.id) === id ? snapshot.company : snapshot.company
  return {
    ok: true,
    companyId: id,
    label: formatActiveCompanyLabel(company, id),
  }
}

/** For writes: return companyId or throw a stable operator-facing Error with `.code`. */
export function requireActiveCompanyId(snapshot: ActiveCompanySnapshot): number {
  const bound = bindActiveCompany(snapshot)
  if (!bound.ok) {
    const err = new Error(bound.message) as Error & { code: string }
    err.code = bound.code
    throw err
  }
  return bound.companyId
}
