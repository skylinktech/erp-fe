import { describe, expect, it } from 'vitest'
import { activationLabel, configurationAccess, grantControlsPrimaryFlow } from '../../utils/businessModelConfiguration'

describe('Business model configuration actions', () => {
  it('gates each configuration action and keeps primary flows out of grant toggles', () => {
    const viewer = configurationAccess({ isAdmin: false, permissions: ['view_business_model_configuration'] })
    expect(viewer.canView).toBe(true)
    expect(viewer.canChangeProfile).toBe(false)
    expect(viewer.canChangeWarehouse).toBe(false)
    const admin = configurationAccess({ isAdmin: true, permissions: [] })
    expect(admin.canChangeProfile).toBe(true)
    expect(admin.canChangeEligibility).toBe(true)
    expect(grantControlsPrimaryFlow('PRIMARY_PROFILE')).toBe(false)
    expect(grantControlsPrimaryFlow('EXPLICIT_GRANT')).toBe(true)
    expect(grantControlsPrimaryFlow('NONE')).toBe(true)
    expect(activationLabel('ISP', 'READY')).toBe('NOT_RETAIL_PROFILE')
    expect(activationLabel('RETAIL', 'BLOCKED')).toBe('CONFIGURED_NOT_READY')
    expect(activationLabel('RETAIL', 'READY')).toBe('READY_FOR_ACTIVATION')
    expect(activationLabel('RETAIL', 'BLOCKED')).not.toBe('Retail Active')
  })
})
