import { useCompanyContextStore } from '~/stores/companyContext'
import { useUserStore } from '~/stores/user'
import { isRouteAllowedForContext, businessAwareLanding } from '~/utils/businessFlowRoute'

/**
 * Bootstrap company context after auth, then guard business-flow routes.
 * Fail-closed for gated routes while context is loading / uninitialized.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const userStore = useUserStore()
  if (!userStore.user) return

  const companyStore = useCompanyContextStore()
  if (!companyStore.initialized && !companyStore.loading) {
    try {
      await companyStore.bootstrap()
    } catch {
      // fail closed on next API call; do not block layout paint forever
    }
  }

  if (companyStore.selectionRequired) return

  const contextReady = companyStore.initialized && !companyStore.loading
  const routeCtx = {
    effectiveFlowCodes: companyStore.effectiveFlowCodes,
    profileCode: companyStore.profileCode,
  }

  if (!isRouteAllowedForContext(to.path, routeCtx, { contextReady })) {
    // Avoid redirect loop when landing itself is not yet decidable
    const landing = contextReady ? businessAwareLanding(routeCtx) : '/dashboard'
    if (to.path === landing || to.path.startsWith(landing + '/')) return
    return navigateTo(landing)
  }
})
