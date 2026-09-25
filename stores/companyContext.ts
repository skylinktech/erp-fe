import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { readAccessToken } from '~/utils/authCookie'
import {
  ACTIVE_COMPANY_STORAGE_KEY,
  COMPANY_CONTEXT_EVENT,
  notifyCompanyContextChanged,
  parsePersistedCompanyId,
  persistActiveCompanyId,
  shouldApplyCompanyPayload,
} from '~/utils/companyContextSync'

export type CompanyContextCompany = {
  id: number
  code: string
  name: string
  businessProfileId?: number
  businessProfileCode?: string | null
  businessProfileName?: string | null
}

export type EffectiveFlow = {
  code: string
  name: string
  version: number
  flowVersionId: string
  status: string
  source: 'PROFILE' | 'ELIGIBILITY'
}

export type CompanyContextState = {
  companyId: number | null
  company: { id: number; code: string; name: string } | null
  businessProfile: { id: number; code: string; name: string } | null
  effectiveFlows: EffectiveFlow[]
  defaultCompanyId: number | null
  allowedCompanies: CompanyContextCompany[]
  canSwitchCompany: boolean
  loading: boolean
  initialized: boolean
  selectionRequired: boolean
  generation: number
}

function authHeaders(extra: Record<string, string> = {}) {
  const token = readAccessToken()
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

export const useCompanyContextStore = defineStore('companyContext', {
  state: (): CompanyContextState => ({
    companyId: null,
    company: null,
    businessProfile: null,
    effectiveFlows: [],
    defaultCompanyId: null,
    allowedCompanies: [],
    canSwitchCompany: false,
    loading: false,
    initialized: false,
    selectionRequired: false,
    generation: 0,
  }),
  getters: {
    profileCode: (s) => s.businessProfile?.code ?? null,
    effectiveFlowCodes: (s) => s.effectiveFlows.map((f) => f.code),
    hasFlow: (s) => (code: string) => s.effectiveFlows.some((f) => f.code === code),
    isIspContext: (s) =>
      s.businessProfile?.code === 'ISP' ||
      s.effectiveFlows.some((f) => f.code === 'ISP_NEW_SUBSCRIPTION'),
    isRetailContext: (s) =>
      s.businessProfile?.code === 'RETAIL' ||
      s.effectiveFlows.some((f) => f.code === 'RETAIL_DIRECT_SALE'),
  },
  actions: {
    applyPayload(data: any, expectedGeneration?: number | null) {
      if (!shouldApplyCompanyPayload(this.generation, expectedGeneration)) return false
      this.companyId = data.companyId
      this.company = data.company
      this.businessProfile = data.businessProfile
      this.effectiveFlows = data.effectiveFlows || []
      this.defaultCompanyId = data.defaultCompanyId ?? null
      this.allowedCompanies = data.allowedCompanies || []
      this.canSwitchCompany = Boolean(data.canSwitchCompany)
      this.selectionRequired = false
      this.generation += 1
      persistActiveCompanyId(this.companyId)
      notifyCompanyContextChanged()
      return true
    },
    clearCompanyScopedCaches() {
      this.generation += 1
    },
    async bootstrap() {
      if (this.loading) return
      this.loading = true
      const expected = this.generation
      try {
        const { $api } = useNuxtApp() as any
        const persisted = parsePersistedCompanyId(
          typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY) : null
        )
        const headers = authHeaders(persisted ? { 'X-Company-Id': String(persisted) } : {})
        const res = await fetch($api.companyContext(), {
          credentials: 'include',
          headers,
        })
        const body = await res.json().catch(() => ({}))
        if (res.status === 409 && body.code === 'COMPANY_CONTEXT_REQUIRED') {
          if (!shouldApplyCompanyPayload(this.generation, expected)) return
          this.allowedCompanies = body.data?.allowedCompanies || []
          this.defaultCompanyId = body.data?.defaultCompanyId ?? null
          this.canSwitchCompany = true
          this.selectionRequired = true
          this.companyId = null
          this.company = null
          this.businessProfile = null
          this.effectiveFlows = []
          this.initialized = true
          return
        }
        if (!res.ok) {
          throw new Error(body.message || 'Company context gagal dimuat')
        }
        this.applyPayload(body.data, expected)
        this.initialized = true
      } finally {
        this.loading = false
      }
    },
    async switchCompany(companyId: number) {
      const previous = {
        companyId: this.companyId,
        company: this.company,
        businessProfile: this.businessProfile,
        effectiveFlows: this.effectiveFlows,
        generation: this.generation,
      }
      this.loading = true
      try {
        const { $api } = useNuxtApp() as any
        const res = await fetch($api.companyContextSwitch(), {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...authHeaders({ 'Content-Type': 'application/json' }),
            ...(this.companyId ? { 'X-Company-Id': String(this.companyId) } : {}),
          },
          body: JSON.stringify({ companyId }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.message || 'Gagal ganti perusahaan')
        this.clearCompanyScopedCaches()
        this.applyPayload(body.data)
      } catch (error) {
        this.companyId = previous.companyId
        this.company = previous.company
        this.businessProfile = previous.businessProfile
        this.effectiveFlows = previous.effectiveFlows
        throw error
      } finally {
        this.loading = false
      }
    },
    async setDefaultCompany(companyId: number | null) {
      const { $api } = useNuxtApp() as any
      const res = await fetch($api.companyContextDefault(), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...authHeaders({ 'Content-Type': 'application/json' }),
          ...(this.companyId ? { 'X-Company-Id': String(this.companyId) } : {}),
        },
        body: JSON.stringify({ companyId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message || 'Gagal set default company')
      this.defaultCompanyId = body.data?.defaultCompanyId ?? null
    },
    listenForCrossTab() {
      if (typeof window === 'undefined') return
      const onStorage = (event: StorageEvent) => {
        if (event.key !== ACTIVE_COMPANY_STORAGE_KEY) return
        const next = parsePersistedCompanyId(event.newValue)
        if (next && next !== this.companyId) void this.bootstrap()
      }
      const onCustom = () => {
        const next = parsePersistedCompanyId(localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY))
        if (next && next !== this.companyId) void this.bootstrap()
      }
      window.addEventListener('storage', onStorage)
      window.addEventListener(COMPANY_CONTEXT_EVENT, onCustom)
      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(COMPANY_CONTEXT_EVENT, onCustom)
      }
    },
  },
})
