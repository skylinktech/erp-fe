import { useCompanyContextStore } from '~/stores/companyContext'
import { useUserStore } from '~/stores/user'
import { isRouteAllowedForContext, businessAwareLanding } from '~/utils/businessFlowRoute'

/**
 * Bootstrap company context after auth, then guard business-flow routes.
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

  const routeCtx = {
    effectiveFlowCodes: companyStore.effectiveFlowCodes,
    profileCode: companyStore.profileCode,
  }

  if (companyStore.initialized && !isRouteAllowedForContext(to.path, routeCtx)) {
    return navigateTo(businessAwareLanding(routeCtx))
  }
})
