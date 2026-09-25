import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type DocumentNumberingRule = {
  id: number
  documentType: string
  label: string
  formatTemplate: string
  resetPeriod: 'none' | 'daily' | 'monthly' | 'yearly'
  scopeType: 'global' | 'company'
  isActive: boolean
  usesCounter: boolean
  version: number
  status: 'inactive' | 'migrated' | 'legacy'
  nextNumber: string | null
  exampleNumber?: string | null
  nextSequence: number | null
  notes: string | null
  allowedTokens: string[]
  editable: boolean
  previewDisclaimer?: string | null
  updatedAt?: string | null
}

type ListMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export const useDocumentNumberingStore = defineStore('document-numbering', {
  state: () => ({
    rules: [] as DocumentNumberingRule[],
    meta: { total: 0, perPage: 25, currentPage: 1, lastPage: 1 } as ListMeta,
    loading: false,
    error: null as string | null,
    saving: false,
  }),
  actions: {
    api() {
      const { $api } = useNuxtApp()
      return $api
    },

    async fetchRules(params: {
      page?: number
      perPage?: number
      search?: string
      status?: string
    } = {}) {
      this.loading = true
      this.error = null
      try {
        const query = new URLSearchParams({
          page: String(params.page ?? 1),
          perPage: String(params.perPage ?? 25),
        })
        if (params.search) query.set('search', params.search)
        if (params.status && params.status !== 'all') query.set('status', params.status)

        const data = await apiFetch<{ data: DocumentNumberingRule[]; meta?: ListMeta }>(
          `${this.api().documentNumbering()}?${query.toString()}`,
          { credentials: 'include' }
        )
        this.rules = data?.data ?? []
        this.meta = data?.meta ?? this.meta
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Gagal memuat aturan penomoran'
        this.rules = []
        throw e
      } finally {
        this.loading = false
      }
    },

    async preview(payload: {
      documentType: string
      formatTemplate?: string
      resetPeriod?: string
      scopeType?: string
    }) {
      const data = await apiFetch<{ data: { nextNumber: string; nextSequence: number } }>(
        this.api().documentNumberingPreview(),
        {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      return data?.data as {
        nextNumber: string
        nextSequence: number
        exampleNumber?: string
        disclaimer?: string
      }
    },

    async updateRule(
      documentType: string,
      payload: {
        formatTemplate?: string
        resetPeriod?: string
        scopeType?: string
        isActive?: boolean
        expectedVersion: number
      }
    ) {
      this.saving = true
      try {
        const data = await apiFetch<{ data: DocumentNumberingRule }>(
          this.api().documentNumberingRule(documentType),
          {
            method: 'PATCH',
            credentials: 'include',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          }
        )
        return data?.data as DocumentNumberingRule
      } finally {
        this.saving = false
      }
    },
  },
})
