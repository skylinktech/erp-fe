/**
 * Capability registry keyed by flow / capability codes.
 * Route prefixes and landing routes are derived from effective company flows — never user preference.
 *
 * Keep FE prefixes aligned with BE `flow_package_catalog` + `flow_feature_policy`.
 * Coverage tests assert business roots are not silently SHARED.
 *
 * S7: POS is DIRECT_PRODUCT_SALE (via RETAIL_DIRECT_SALE flow), not Sales Order.
 * Sales Order remains ISP_NEW_SUBSCRIPTION only.
 * S8: PRODUCT_QUOTATION registered as third-flow proof — not production-activated here.
 */

export type BusinessFlowCapability = {
  /** Flow codes that unlock this capability when present in effectiveFlowCodes. */
  flowCodes: readonly string[]
  /** Extra flow codes that must also be present (AND). Empty = only flowCodes (OR within flowCodes). */
  requiresFlowCodes?: readonly string[]
  /** When set, Active Company business profile must match one of these codes. */
  requiresProfileCodes?: readonly string[]
  prefixes: readonly string[]
  landingRoute: string
  menuKeys: readonly string[]
  /** First-class capability codes (not profile booleans). */
  capabilityCodes?: readonly string[]
}

/**
 * Explicit shared FE prefixes — not gated by business flow.
 * Used by classifyBusinessRoute + coverage tests.
 */
export const SHARED_FE_PREFIXES: readonly string[] = [
  '/dashboard',
  '/errors',
  '/login',
  '/auth',
  '/callback',
  '/master',
  '/admin',
  '/settings',
  '/inventory',
  '/purchasing',
  '/finance',
  '/hr',
  '/payroll',
  '/approvals',
  '/notifications',
  '/profile',
  '/sales/customer',
  '/sales/company-flow-eligibility',
  '/sales/product-price-list',
]

/** Business roots that must be classified (gated or shared). */
export const BUSINESS_FE_ROOTS: readonly string[] = [
  '/sales',
  '/order-process',
  '/operations',
  '/implementation',
  '/service',
  '/service-management',
]

export const BUSINESS_FLOW_CAPABILITY_REGISTRY: Record<string, BusinessFlowCapability> = {
  ISP_NEW_SUBSCRIPTION: {
    flowCodes: ['ISP_NEW_SUBSCRIPTION'],
    capabilityCodes: [
      'ISP_COMMERCIAL',
      'FDR',
      'SITE_INVESTMENT',
      'QUOTATION',
      'SUBSCRIPTION',
      'ISP_ORDER_PROCESS',
      'ISP_SERVICE_CATALOG',
      'ISP_FULFILLMENT',
    ],
    prefixes: [
      '/sales/quotation',
      '/sales/site-investment',
      '/sales/fdr',
      '/sales/business-case',
      '/sales/sales-order',
      // Legacy alias; live subscription UI is under /order-process/subscription
      '/sales/subscription',
      '/sales/sales-pipeline',
      '/order-process',
      '/service/service-plan',
      '/service/service',
      '/service/did',
      '/inventory/service-plan',
      '/inventory/service',
      '/implementation',
      '/operations',
      '/service-management',
      '/finance/billing/billing-adjustments',
      '/finance/billing-adjustments',
      '/finance/billing/billing-preparations',
      '/finance/billing-preparations',
    ],
    landingRoute: '/dashboard',
    menuKeys: [
      'quotation',
      'site-investment',
      'fdr',
      'subscription',
      'business-case',
      'sales-order',
      'sales_pipeline',
      'customer-verif',
      'legal-tech',
      'pks',
      'service-plan',
      'service',
      'did',
      'arf',
      'progress-tracker',
      'work-order-request',
      'request-activation',
      'berita-acara',
      'customer-service',
      'billing_adjustment',
      'billing_preparation',
    ],
  },
  /**
   * Direct physical product sale — POS + retail sale management + returns.
   * Unlocked by RETAIL_DIRECT_SALE flow (grantable to ISP without changing profile).
   * Omnichannel is NOT here — marketplace requires RETAIL profile (see OMNICHANNEL).
   */
  DIRECT_PRODUCT_SALE: {
    flowCodes: ['RETAIL_DIRECT_SALE'],
    capabilityCodes: ['DIRECT_PRODUCT_SALE', 'RETURN'],
    prefixes: ['/sales/pos', '/sales/retail-sale', '/sales/retail-return'],
    landingRoute: '/sales/pos',
    menuKeys: ['pos', 'retail-sale', 'retail-return'],
  },
  /** @deprecated alias — prefer DIRECT_PRODUCT_SALE */
  RETAIL_DIRECT_SALE: {
    flowCodes: ['RETAIL_DIRECT_SALE'],
    capabilityCodes: ['DIRECT_PRODUCT_SALE', 'RETURN'],
    prefixes: ['/sales/retail-sale', '/sales/retail-return'],
    landingRoute: '/sales/retail-sale',
    menuKeys: ['retail-sale', 'retail-return'],
  },
  /**
   * Marketplace Omnichannel — RETAIL profile only (matches CommerceEligibilityService).
   * Flow RETAIL_DIRECT_SALE alone on an ISP company does not unlock this.
   */
  OMNICHANNEL: {
    flowCodes: ['RETAIL_DIRECT_SALE'],
    requiresProfileCodes: ['RETAIL'],
    capabilityCodes: ['OMNICHANNEL'],
    prefixes: ['/sales/omnichannel'],
    landingRoute: '/sales/omnichannel',
    menuKeys: ['omnichannel'],
  },
  /**
   * Third-flow architecture proof. Registered only — do not activate in production.
   * Shares quotation route prefix with ISP; eligibility still requires PRODUCT_QUOTATION flow.
   */
  PRODUCT_QUOTATION: {
    flowCodes: ['PRODUCT_QUOTATION'],
    capabilityCodes: ['PRODUCT_QUOTATION', 'QUOTATION'],
    prefixes: ['/sales/quotation'],
    landingRoute: '/sales/quotation',
    menuKeys: ['quotation'],
  },
}

export function capabilityAllows(
  capability: BusinessFlowCapability,
  effectiveFlowCodes: readonly string[],
  profileCode?: string | null
): boolean {
  const set = new Set(effectiveFlowCodes)
  const anyFlow = capability.flowCodes.some((code) => set.has(code))
  if (!anyFlow) return false
  if (capability.requiresFlowCodes?.length) {
    if (!capability.requiresFlowCodes.every((code) => set.has(code))) return false
  }
  if (capability.requiresProfileCodes?.length) {
    if (!profileCode || !capability.requiresProfileCodes.includes(profileCode)) return false
  }
  return true
}

export function pathMatchesPrefixes(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(prefix + '/'))
}

export function capabilitiesForPath(path: string): BusinessFlowCapability[] {
  return Object.values(BUSINESS_FLOW_CAPABILITY_REGISTRY).filter((cap) =>
    pathMatchesPrefixes(path, cap.prefixes)
  )
}

/**
 * Extensibility hook: register a hypothetical flow without inventing isThirdContext flags.
 * Used by tests; production registry is the source of truth above.
 */
export function withHypotheticalCapability(
  registry: Record<string, BusinessFlowCapability>,
  key: string,
  capability: BusinessFlowCapability
): Record<string, BusinessFlowCapability> {
  return { ...registry, [key]: capability }
}

/** Capability present when any registered capability lists it and effective flows allow. */
export function hasCapabilityCode(
  capabilityCode: string,
  effectiveFlowCodes: readonly string[],
  profileCode?: string | null
): boolean {
  return Object.values(BUSINESS_FLOW_CAPABILITY_REGISTRY).some(
    (cap) =>
      (cap.capabilityCodes || []).includes(capabilityCode) &&
      capabilityAllows(cap, effectiveFlowCodes, profileCode)
  )
}

/** All gated prefixes (sorted) — for alignment / coverage checks. */
export function allGatedFePrefixes(): string[] {
  const set = new Set<string>()
  for (const cap of Object.values(BUSINESS_FLOW_CAPABILITY_REGISTRY)) {
    for (const p of cap.prefixes) set.add(p)
  }
  return [...set].sort()
}

/**
 * Frozen FE↔BE alignment contract for critical gated prefixes.
 * Keep identical to BE `FLOW_FEATURE_ALIGNMENT_PREFIXES` (erp_skl flow_feature_policy).
 */
export const FLOW_FEATURE_ALIGNMENT_PREFIXES: readonly string[] = [
  '/sales/quotation',
  '/sales/site-investment',
  '/sales/fdr',
  '/sales/sales-pipeline',
  '/sales/pos',
  '/sales/omnichannel',
  '/order-process',
  '/operations',
  '/implementation',
  '/service-management',
  '/service/service-plan',
  '/service/service',
  '/service/did',
  '/inventory/service-plan',
  '/inventory/service',
  '/finance/billing/billing-adjustments',
  '/finance/billing/billing-preparations',
  '/finance/billing-adjustments',
  '/finance/billing-preparations',
] as const
