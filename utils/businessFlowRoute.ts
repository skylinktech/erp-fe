/**
 * Business-flow-aware route classification.
 * Flow is never a user preference — it comes from Active Company context.
 */

import {
  BUSINESS_FLOW_CAPABILITY_REGISTRY,
  capabilitiesForPath,
  capabilityAllows,
  pathMatchesPrefixes,
} from '~/utils/businessFlowCapabilityRegistry'

export type BusinessRouteClass = 'SHARED' | 'ISP_ONLY' | 'RETAIL_ONLY' | 'DIRECT_SALE_POS'

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
  effectiveFlowCodes: readonly string[],
  profileCode?: string | null
): boolean {
  return (
    profileCode === 'ISP' ||
    effectiveFlowCodes.includes('ISP_NEW_SUBSCRIPTION')
  )
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
  const codes: string[] = []
  if ((ctx as LegacyRouteContext).isIspContext) codes.push('ISP_NEW_SUBSCRIPTION')
  if ((ctx as LegacyRouteContext).isRetailContext) codes.push('RETAIL_DIRECT_SALE')
  return { effectiveFlowCodes: codes }
}

export function classifyBusinessRoute(path: string): BusinessRouteClass {
  if (pathMatchesPrefixes(path, BUSINESS_FLOW_CAPABILITY_REGISTRY.DIRECT_PRODUCT_SALE.prefixes)) {
    if (path === '/sales/pos' || path.startsWith('/sales/pos/')) return 'DIRECT_SALE_POS'
    return 'RETAIL_ONLY'
  }
  if (pathMatchesPrefixes(path, BUSINESS_FLOW_CAPABILITY_REGISTRY.ISP_NEW_SUBSCRIPTION.prefixes)) {
    return 'ISP_ONLY'
  }
  return 'SHARED'
}

export function isRouteAllowedForContext(path: string, ctx: RouteAllowContext): boolean {
  const normalized = normalizeContext(ctx)
  const caps = capabilitiesForPath(path)
  if (!caps.length) return true
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
