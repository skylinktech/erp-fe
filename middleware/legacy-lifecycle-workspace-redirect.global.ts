/**
 * Legacy Equipment / Warranty list URLs now live as tabs.
 * Exact list paths only — detail routes stay standalone.
 * Preserves query params; uses replace to avoid Back-button loops.
 */
import {
  buildLegacyEquipmentRedirect,
  buildLegacyWarrantyRedirect,
} from '~/utils/inventory/lifecycleWorkspaces'

export default defineNuxtRouteMiddleware((to) => {
  const equipment = buildLegacyEquipmentRedirect(to.path, { ...to.query })
  if (equipment) return navigateTo(equipment, { redirectCode: 301, replace: true })
  const warranty = buildLegacyWarrantyRedirect(to.path, { ...to.query })
  if (warranty) return navigateTo(warranty, { redirectCode: 301, replace: true })
})
