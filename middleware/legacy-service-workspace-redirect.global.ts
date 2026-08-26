/**
 * Legacy URLs for standalone Service Monitoring / Service Events pages.
 * Those UIs now live as tabs on Customer Service workspace.
 * Preserves relevant query params (serviceId, customerId, …); forces tab=…
 * Uses replace to avoid Back-button redirect loops.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/service-management/monitoring') {
    const query = { ...to.query, tab: 'monitoring' }
    return navigateTo(
      { path: '/service-management/customer-service', query },
      { redirectCode: 301, replace: true }
    )
  }

  if (to.path === '/service-management/events') {
    const query = { ...to.query, tab: 'events' }
    return navigateTo(
      { path: '/service-management/customer-service', query },
      { redirectCode: 301, replace: true }
    )
  }
})
