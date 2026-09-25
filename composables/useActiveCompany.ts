import { computed, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyContextStore } from '~/stores/companyContext'
import {
  bindActiveCompany,
  requireActiveCompanyId,
  type ActiveCompanySnapshot,
} from '~/utils/activeCompanyBinding'

/**
 * Reusable Active Company facade for transaction forms.
 * Single store read — no per-row company lookups (anti N+1).
 */
export function useActiveCompany() {
  const store = useCompanyContextStore()
  const { companyId, company, selectionRequired, initialized, canSwitchCompany, allowedCompanies } =
    storeToRefs(store)

  const snapshot = computed<ActiveCompanySnapshot>(() => ({
    companyId: companyId.value,
    company: company.value,
    selectionRequired: selectionRequired.value,
    initialized: initialized.value,
  }))

  const bound = computed(() => bindActiveCompany(snapshot.value))
  const ready = computed(() => bound.value.ok)
  const label = computed(() => bound.value.label)
  const missingMessage = computed(() => (bound.value.ok ? '' : bound.value.message))
  const missingCode = computed(() => (bound.value.ok ? null : bound.value.code))

  async function ensureBootstrapped() {
    if (!store.initialized && !store.loading) {
      await store.bootstrap()
    }
  }

  /** Returns active company id or null; sets nothing. */
  function getCompanyId(): number | null {
    return bound.value.ok ? bound.value.companyId : null
  }

  /** Fail-closed for submit handlers. */
  function requireCompanyId(): number {
    return requireActiveCompanyId(snapshot.value)
  }

  /**
   * Keep a form field in sync with Active Company (one-way).
   * When context is missing, clears the field so stale IDs cannot submit.
   */
  function syncFormCompanyId(target: Ref<number | null | undefined>) {
    return watch(
      bound,
      (next) => {
        target.value = next.ok ? next.companyId : null
      },
      { immediate: true }
    )
  }

  return {
    companyId,
    company,
    label,
    ready,
    missingMessage,
    missingCode,
    selectionRequired,
    initialized,
    canSwitchCompany,
    allowedCompanies,
    bound,
    snapshot,
    ensureBootstrapped,
    getCompanyId,
    requireCompanyId,
    syncFormCompanyId,
  }
}
