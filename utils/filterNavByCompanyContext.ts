import type { FormPageNavItem } from '~/types/form-page'
import { isRouteAllowedForContext, type RouteAllowContext } from '~/utils/businessFlowRoute'

/** Drop form-sidebar shortcuts that are not eligible for Active Company flows. */
export function filterNavByCompanyContext(
  items: FormPageNavItem[],
  ctx: RouteAllowContext
): FormPageNavItem[] {
  return items.filter((item) => {
    const path = typeof item.to === 'string' ? item.to.split('?')[0] : ''
    if (!path) return true
    return isRouteAllowedForContext(path, ctx)
  })
}
