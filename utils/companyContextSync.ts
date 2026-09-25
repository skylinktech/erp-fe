export const ACTIVE_COMPANY_STORAGE_KEY = 'skyflow.activeCompanyId'
export const COMPANY_CONTEXT_EVENT = 'skyflow:company-context-changed'

export function shouldApplyCompanyPayload(
  storeGeneration: number,
  expectedGeneration: number | null | undefined
): boolean {
  if (expectedGeneration == null) return true
  return storeGeneration === expectedGeneration
}

export function parsePersistedCompanyId(raw: string | null): number | null {
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function persistActiveCompanyId(id: number | null) {
  if (typeof localStorage === 'undefined') return
  if (id == null) localStorage.removeItem(ACTIVE_COMPANY_STORAGE_KEY)
  else localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, String(id))
}

export function notifyCompanyContextChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(COMPANY_CONTEXT_EVENT))
}
