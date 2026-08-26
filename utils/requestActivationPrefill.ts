/** Prefill DTO from GET /request-activation/subscription-options */

export type SignedSubscriptionOption = {
  id: string
  label: string
  noSubscription: string
  customerId: number | null
  customerName: string
  servicePlanId: number | null
  planName: string
  locationName: string
  picName: string
  picPhone: string
  address: string
  latitude: number | null
  longitude: number | null
}

export type RequestActivationPrefillFields = {
  subscriptionId: string | null
  customerId: number | null
  servicePlanId: number | null
  planName: string
  locationName: string
  picName: string
  picPhone: string
  address: string
  latitude: number | null
  longitude: number | null
  /** Cleared — Form Berlangganan is linked via subscriptionId, not free-text URL. */
  subscriptionFormUrl: string
}

/** Apply signed-subscription option → RA form fields (pure). */
export function applySignedSubscriptionPrefill(
  option: SignedSubscriptionOption | null
): RequestActivationPrefillFields {
  if (!option) {
    return {
      subscriptionId: null,
      customerId: null,
      servicePlanId: null,
      planName: '',
      locationName: '',
      picName: '',
      picPhone: '',
      address: '',
      latitude: null,
      longitude: null,
      subscriptionFormUrl: '',
    }
  }

  return {
    subscriptionId: option.id,
    customerId: option.customerId,
    servicePlanId: option.servicePlanId,
    planName: option.planName || '',
    locationName: option.locationName || '',
    picName: option.picName || '',
    picPhone: option.picPhone || '',
    address: option.address || '',
    latitude: sanitizeCoord(option.latitude, 'lat'),
    longitude: sanitizeCoord(option.longitude, 'lng'),
    subscriptionFormUrl: '',
  }
}

function sanitizeCoord(value: number | null | undefined, kind: 'lat' | 'lng'): number | null {
  if (value == null || value === ('' as any)) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (kind === 'lat' && (n < -90 || n > 90)) return null
  if (kind === 'lng' && (n < -180 || n > 180)) return null
  return Math.round(n * 1e7) / 1e7
}
