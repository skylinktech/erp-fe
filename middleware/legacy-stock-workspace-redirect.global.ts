/**
 * Legacy Stock In / Out / Transfer / Movements list URLs.
 * Those UIs now live as tabs on /inventory/stock.
 * Preserves existing query params; forces tab=…
 * Uses replace to avoid Back-button redirect loops.
 */
import { buildLegacyStockRedirect } from '~/utils/inventory/stockWorkspace'

export default defineNuxtRouteMiddleware((to) => {
  const redirect = buildLegacyStockRedirect(to.path, { ...to.query })
  if (!redirect) return
  return navigateTo(redirect, { redirectCode: 301, replace: true })
})
