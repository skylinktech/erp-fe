/**
 * Business-flow-aware route classification.
 * Flow is never a user preference — it comes from Active Company context.
 */

import {
  BUSINESS_FLOW_CAPABILITY_REGISTRY,
  SHARED_FE_PREFIXES,
  BUSINESS_FE_ROOTS,
  capabilitiesForPath,
  capabilityAllows,
  pathMatchesPrefixes,
} from '~/utils/businessFlowCapabilityRegistry'

export type BusinessRouteClass = 'SHARED' | 'ISP_ONLY' | 'RETAIL_ONLY' | 'DIRECT_SALE_POS' | 'UNCLASSIFIED_BUSINESS'

export type FlowRouteContext = {
  effectiveFlowCodes: readonly string[]
  profileCode?: string | null
}

/** @deprecated Prefer effectiveFlowCodes — kept for call-site compatibility. */
export type LegacyRouteContext = {
  isIspContext: boolean
  isRetailContext: boolean
}

export type RouteAllowContext = FlowRouteContext | LegacyRouteContext

export function isIspContextFromFlows(
  _effectiveFlowCodes: readonly string[],
  profileCode?: string | null
): boolean {
  // ISP shell is profile-bound. Extra ISP flow grants on a Retail company do not flip ISP context.
  return profileCode === 'ISP'
}

export function isRetailContextFromFlows(
  effectiveFlowCodes: readonly string[],
  profileCode?: string | null
): boolean {
  return (
    profileCode === 'RETAIL' ||
    effectiveFlowCodes.includes('RETAIL_DIRECT_SALE')
  )
}

/** Compatibility shims derived from effective flows / profile. */
export function isIspContext(ctx: FlowRouteContext | LegacyRouteContext): boolean {
  if ('effectiveFlowCodes' in ctx) {
    return isIspContextFromFlows(ctx.effectiveFlowCodes, ctx.profileCode)
  }
  return ctx.isIspContext
}

export function isRetailContext(ctx: FlowRouteContext | LegacyRouteContext): boolean {
  if ('effectiveFlowCodes' in ctx) {
    return isRetailContextFromFlows(ctx.effectiveFlowCodes, ctx.profileCode)
  }
  return ctx.isRetailContext
}

function normalizeContext(ctx: RouteAllowContext): FlowRouteContext {
  if ('effectiveFlowCodes' in ctx && Array.isArray(ctx.effectiveFlowCodes)) {
    return {
      effectiveFlowCodes: ctx.effectiveFlowCodes,
      profileCode: ctx.profileCode ?? null,
    }
  }
  const legacy = ctx as LegacyRouteContext
  const codes: string[] = []
  if (legacy.isIspContext) codes.push('ISP_NEW_SUBSCRIPTION')
  if (legacy.isRetailContext) codes.push('RETAIL_DIRECT_SALE')
  // Legacy boolean context has no profile field — derive the matching profile so
  // requiresProfileCodes gates (ISP shell / Omnichannel) still evaluate correctly.
  let profileCode: string | null = null
  if (legacy.isIspContext && !legacy.isRetailContext) profileCode = 'ISP'
  else if (legacy.isRetailContext && !legacy.isIspContext) profileCode = 'RETAIL'
  else if (legacy.isIspContext && legacy.isRetailContext) profileCode = 'ISP'
  return { effectiveFlowCodes: codes, profileCode }
}

export function classifyBusinessRoute(path: string): BusinessRouteClass {
  const isDirectSale = pathMatchesPrefixes(
    path,
    BUSINESS_FLOW_CAPABILITY_REGISTRY.DIRECT_PRODUCT_SALE.prefixes
  )
  const isIsp = pathMatchesPrefixes(
    path,
    BUSINESS_FLOW_CAPABILITY_REGISTRY.ISP_NEW_SUBSCRIPTION.prefixes
  )
  if (isDirectSale) {
    if (path === '/sales/pos' || path.startsWith('/sales/pos/')) return 'DIRECT_SALE_POS'
    // Dual-gated with ISP (e.g. Sales Order): keep ISP_ONLY label; allow uses capability OR.
    if (!isIsp) return 'RETAIL_ONLY'
  }
  if (pathMatchesPrefixes(path, BUSINESS_FLOW_CAPABILITY_REGISTRY.OMNICHANNEL.prefixes)) {
    return 'RETAIL_ONLY'
  }
  if (isIsp) {
    return 'ISP_ONLY'
  }
  if (pathMatchesPrefixes(path, BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION.prefixes)) {
    return 'ISP_ONLY'
  }
  if (pathMatchesPrefixes(path, SHARED_FE_PREFIXES)) return 'SHARED'
  if (BUSINESS_FE_ROOTS.some((root) => path === root || path.startsWith(root + '/'))) {
    return 'UNCLASSIFIED_BUSINESS'
  }
  return 'SHARED'
}

/**
 * When context is not ready, gated routes are denied (fail-closed).
 * Ungated / shared routes remain allowed so shell / auth / dashboard can paint.
 */
export function isRouteAllowedForContext(
  path: string,
  ctx: RouteAllowContext,
  options?: { contextReady?: boolean }
): boolean {
  const normalized = normalizeContext(ctx)
  const caps = capabilitiesForPath(path)
  if (!caps.length) return true
  if (options?.contextReady === false) return false
  return caps.some((cap) =>
    capabilityAllows(cap, normalized.effectiveFlowCodes, normalized.profileCode)
  )
}

export function businessAwareLanding(ctx: RouteAllowContext): string {
  const normalized = normalizeContext(ctx)
  if (
    capabilityAllows(
      BUSINESS_FLOW_CAPABILITY_REGISTRY.DIRECT_PRODUCT_SALE,
      normalized.effectiveFlowCodes,
      normalized.profileCode
    )
  ) {
    return BUSINESS_FLOW_CAPABILITY_REGISTRY.DIRECT_PRODUCT_SALE.landingRoute
  }
  if (
    capabilityAllows(
      BUSINESS_FLOW_CAPABILITY_REGISTRY.ISP_NEW_SUBSCRIPTION,
      normalized.effectiveFlowCodes,
      normalized.profileCode
    )
  ) {
    return BUSINESS_FLOW_CAPABILITY_REGISTRY.ISP_NEW_SUBSCRIPTION.landingRoute
  }
  if (
    capabilityAllows(
      BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION,
      normalized.effectiveFlowCodes,
      normalized.profileCode
    )
  ) {
    return BUSINESS_FLOW_CAPABILITY_REGISTRY.PRODUCT_QUOTATION.landingRoute
  }
  return '/dashboard'
}
