/**
 * Legacy URLs for standalone AR/AP Aging pages.
 * Aging now lives as a tab on AR Receipts / AP Payments.
 * Preserves existing query params (customerId, vendorId, bucket, asOf, …).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/finance/reports/ar-aging') {
    return navigateTo(
      { path: '/finance/ar-receipts', query: { ...to.query, tab: 'aging' } },
      { redirectCode: 301, replace: true }
    )
  }

  if (to.path === '/finance/reports/ap-aging') {
    return navigateTo(
      { path: '/finance/ap-payments', query: { ...to.query, tab: 'aging' } },
      { redirectCode: 301, replace: true }
    )
  }
})
