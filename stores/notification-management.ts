import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export interface NotificationPolicyRecipientRule {
  id?: number
  recipientType: string
  permissionName?: string | null
  roleId?: number | null
  scopeRule?: string
  excludeActor?: boolean
  contributesToUnreadCount?: boolean | null
  specificUserIds?: number[] | null
}

export interface NotificationPolicy {
  id: number
  eventName: string
  enabled: boolean
  category: string
  priority: string
  channels: string[]
  notifyActor: boolean
  notifyMaker: boolean
  notifySuperadmin: boolean
  contributesToUnreadCount: boolean
  aggregationStrategy: string
  deepLinkTemplate?: string | null
  version: number
  recipients?: NotificationPolicyRecipientRule[]
  templates?: Array<{ recipientType: string; titleTemplate: string; bodyTemplate: string }>
}

export interface NotificationCatalogRow {
  eventName: string
  module: string
  entityType?: string | null
  description?: string
  category: string
  priority: string
  registryStatus: string
  policyStatus: string
  publisherStatus: string
  effectiveStatus?: string
  recipientSummary?: string
  unread: boolean
  superadmin: boolean
  lastEmittedAt?: string | null
  deliverySuccess?: number
  deliveryFailure?: number
  policyId?: number | null
  enabled?: boolean
  version?: number
  batch?: string | null
  allowedRecipientTypes?: string[]
  payloadSchema?: unknown[]
  policy?: NotificationPolicy | null
}

export interface NotificationGlobalSettings {
  channels: Array<{
    name: string
    label: string
    available: boolean
    enabled: boolean
    realtime: boolean
    provider: string | null
    defaultRetry: number | null
    description: string
  }>
  superadminFeed: {
    enabled: boolean
    receiveAllPolicyEvents: boolean
    minPriority: string
    includeActionable: boolean
    includeInformational: boolean
    includeWarning: boolean
    includeCritical: boolean
    informationalContributesUnread: boolean
    aggregationBehavior: string
    excludedModules: string[]
  }
  deliveryDefaults: {
    defaultMaxAttempts: number
    envMaxAttempts: number
    retentionDays: number
    policyEngineEnabled: boolean
    batchFlags: Record<string, boolean>
  }
  version: number
  updatedBy?: number | null
  updatedAt?: string | null
}

export interface NotificationHealth {
  worker: { status: string; policyEngineEnabled: boolean }
  outbox: {
    pending: number
    processing: number
    failed: number
    delivered: number
    lastProcessedAt: string | null
  }
  registry: {
    registeredEventCount: number
    activePolicyCount: number
    invalidConfigurationCount: number
  }
}

export const useNotificationManagementStore = defineStore('notification-management', {
  state: () => ({
    policies: [] as NotificationPolicy[],
    catalog: [] as NotificationCatalogRow[],
    events: [] as Array<Record<string, unknown>>,
    modules: [] as string[],
    recipientTypes: [] as string[],
    logs: [] as Array<Record<string, unknown>>,
    logDetail: null as Record<string, unknown> | null,
    settings: null as NotificationGlobalSettings | null,
    health: null as NotificationHealth | null,
    coverage: null as Record<string, unknown> | null,
    loading: false,
    logsLoading: false,
    settingsLoading: false,
    healthLoading: false,
    logDetailLoading: false,
    error: null as string | null,
    totalRecords: 0,
    logsTotal: 0,
    params: {
      page: 1,
      rows: 10,
      search: '',
      module: '',
      category: '',
      enabled: '',
      policyStatus: '',
      publisherStatus: '',
    },
    logParams: {
      page: 1,
      rows: 10,
      status: '',
      eventName: '',
    },
    preview: null as { title: string; body: string } | null,
  }),

  actions: {
    api() {
      const { $api } = useNuxtApp()
      return $api
    },

    async fetchEvents() {
      const res = await apiFetch<{
        data: Array<Record<string, unknown>>
        modules: string[]
        recipientTypes: string[]
      }>(this.api().notificationAdminEvents(), { credentials: 'include' })
      this.events = res.data || []
      this.modules = res.modules || []
      this.recipientTypes = res.recipientTypes || []
    },

    async fetchPolicies() {
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams({
          page: String(this.params.page),
          limit: String(this.params.rows),
        })
        if (this.params.search) params.set('search', this.params.search)
        if (this.params.module) params.set('module', this.params.module)
        if (this.params.category) params.set('category', this.params.category)
        if (this.params.enabled) params.set('enabled', this.params.enabled)
        if (this.params.policyStatus) params.set('policyStatus', this.params.policyStatus)
        if (this.params.publisherStatus) params.set('publisherStatus', this.params.publisherStatus)
        const res = await apiFetch<{ data: NotificationCatalogRow[]; meta?: { total?: number } }>(
          `${this.api().notificationAdminCatalog()}?${params.toString()}`,
          { credentials: 'include' }
        )
        this.catalog = res.data || []
        this.policies = this.catalog.map((row) => row.policy).filter(Boolean) as NotificationPolicy[]
        this.totalRecords = res.meta?.total || this.catalog.length
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat catalog'
      } finally {
        this.loading = false
      }
    },

    async createPolicy(eventName: string) {
      return apiFetch<{ data: NotificationPolicy }>(this.api().notificationAdminPolicies(), {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ eventName }),
        headers: { 'Content-Type': 'application/json' },
      })
    },

    async dryRun(eventName: string) {
      return apiFetch<{ data: Record<string, unknown> }>(this.api().notificationAdminDryRun(), {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ eventName }),
        headers: { 'Content-Type': 'application/json' },
      })
    },

    async fetchCoverage() {
      const res = await apiFetch<Record<string, unknown>>(this.api().notificationAdminCoverage(), {
        credentials: 'include',
      })
      this.coverage = res
      return res
    },

    async updatePolicy(id: number, payload: Record<string, unknown>) {
      return apiFetch(this.api().notificationAdminPolicy(id), {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
    },

    async previewTemplate(payload: {
      eventName: string
      recipientType: string
      title: string
      body: string
    }) {
      const res = await apiFetch<{ data: { title: string; body: string } }>(
        this.api().notificationAdminPreview(),
        {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      this.preview = res.data
      return res.data
    },

    async fetchLogs() {
      this.logsLoading = true
      try {
        const params = new URLSearchParams({
          page: String(this.logParams.page),
          limit: String(this.logParams.rows),
        })
        if (this.logParams.status) params.set('status', this.logParams.status)
        if (this.logParams.eventName) params.set('eventName', this.logParams.eventName)
        const res = await apiFetch<{ data: Array<Record<string, unknown>>; meta?: { total?: number } }>(
          `${this.api().notificationAdminLogs()}?${params.toString()}`,
          { credentials: 'include' }
        )
        this.logs = res.data || []
        this.logsTotal = res.meta?.total || this.logs.length
      } finally {
        this.logsLoading = false
      }
    },

    async retryOutbox(id: number) {
      return apiFetch(this.api().notificationAdminRetry(id), {
        method: 'POST',
        credentials: 'include',
      })
    },

    async fetchLogDetail(id: number) {
      this.logDetailLoading = true
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>(
          this.api().notificationAdminLog(id),
          { credentials: 'include' }
        )
        this.logDetail = res.data || null
        return this.logDetail
      } finally {
        this.logDetailLoading = false
      }
    },

    async fetchSettings() {
      this.settingsLoading = true
      try {
        const res = await apiFetch<{ data: NotificationGlobalSettings }>(
          this.api().notificationAdminSettings(),
          { credentials: 'include' }
        )
        this.settings = res.data || null
        return this.settings
      } finally {
        this.settingsLoading = false
      }
    },

    async updateSettings(payload: Record<string, unknown>) {
      return apiFetch<{ data: NotificationGlobalSettings }>(this.api().notificationAdminSettings(), {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
    },

    async fetchHealth() {
      this.healthLoading = true
      try {
        const res = await apiFetch<{ data: NotificationHealth }>(
          this.api().notificationAdminHealth(),
          { credentials: 'include' }
        )
        this.health = res.data || null
        return this.health
      } finally {
        this.healthLoading = false
      }
    },
  },
})
