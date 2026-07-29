import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export type TaxMasterType = 'OUTPUT' | 'WITHHOLDING'
export type TaxCalculationType = 'PERCENTAGE' | 'FIXED'

export interface TaxRateRow {
  id?: string
  rate: number
  effectiveFrom: string
  effectiveUntil: string | null
  isDefault: boolean
  createdAt?: string
}

export interface TaxMaster {
  id: string
  code: string
  name: string
  type: TaxMasterType
  calculationType: TaxCalculationType
  defaultRate: number
  accountCode: string | null
  description: string | null
  isActive: boolean
  taxRates: TaxRateRow[]
  createdAt?: string
  updatedAt?: string
}

export interface TaxMasterPayload {
  code: string
  name: string
  type: TaxMasterType
  calculationType: TaxCalculationType
  defaultRate: number
  accountCode?: string | null
  description?: string | null
  isActive?: boolean
  taxRates?: TaxRateRow[]
}

function normalizeRate(raw: any): TaxRateRow {
  return {
    id: raw.id,
    rate: Number(raw.rate ?? 0),
    effectiveFrom: String(raw.effectiveFrom ?? raw.effective_from ?? '').slice(0, 10),
    effectiveUntil: (raw.effectiveUntil ?? raw.effective_until)
      ? String(raw.effectiveUntil ?? raw.effective_until).slice(0, 10)
      : null,
    isDefault: !!(raw.isDefault ?? raw.is_default),
    createdAt: raw.createdAt ?? raw.created_at,
  }
}

function normalizeMaster(raw: any): TaxMaster {
  const rates = raw.taxRates ?? raw.tax_rates ?? []
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    type: raw.type,
    calculationType: raw.calculationType ?? raw.calculation_type,
    defaultRate: Number(raw.defaultRate ?? raw.default_rate ?? 0),
    accountCode: raw.accountCode ?? raw.account_code ?? null,
    description: raw.description ?? null,
    isActive: !!(raw.isActive ?? raw.is_active),
    taxRates: (Array.isArray(rates) ? rates : []).map(normalizeRate),
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  }
}

export const useTaxMasterStore = defineStore('taxMaster', {
  state: () => ({
    rows: [] as TaxMaster[],
    selected: null as TaxMaster | null,
    loading: false,
    loadingStats: false,
    saving: false,
    totalRecords: 0,
    statistics: {
      total: 0,
      active: 0,
      output: 0,
      withholding: 0,
      rates: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'code',
      sortOrder: 1,
      search: '',
      type: '',
      isActive: '',
    },
  }),

  actions: {
    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.taxMastersStatistics(), {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        this.statistics = {
          total: Number(json.total ?? 0),
          active: Number(json.active ?? 0),
          output: Number(json.output ?? 0),
          withholding: Number(json.withholding ?? 0),
          rates: Number(json.rates ?? 0),
        }
      } catch (e) {
        console.error('Tax master statistics:', e)
      } finally {
        this.loadingStats = false
      }
    },

    async fetchList() {
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const page = Math.floor(this.params.first / this.params.rows) + 1
        const qs = new URLSearchParams({
          page: String(page),
          rows: String(this.params.rows),
          sortField: this.params.sortField,
          sortOrder: this.params.sortOrder > 0 ? '1' : '-1',
          search: this.params.search || '',
        })
        if (this.params.type) qs.set('type', this.params.type)
        if (this.params.isActive !== '') qs.set('isActive', this.params.isActive)

        const res = await fetch(`${$api.taxMasters()}?${qs}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || `HTTP ${res.status}`)
        }
        const json = await res.json()
        this.rows = (json.data || []).map(normalizeMaster)
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        useToast().error({
          title: 'Error',
          message: e.message || 'Gagal memuat tax master',
          color: 'red',
          position: 'topRight',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchById(id: string) {
      const { $api } = useNuxtApp()
      const res = await fetch($api.taxMastersShow(id), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      const json = await res.json()
      this.selected = normalizeMaster(json.data)
      return this.selected
    },

    async create(payload: TaxMasterPayload) {
      this.saving = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.taxMasters(), {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message || 'Tax master dibuat',
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return normalizeMaster(json.data)
      } catch (e: any) {
        useToast().error({
          title: 'Error',
          message: e.message || 'Gagal membuat tax master',
          color: 'red',
          position: 'topRight',
        })
        throw e
      } finally {
        this.saving = false
      }
    },

    async update(id: string, payload: TaxMasterPayload) {
      this.saving = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.taxMastersShow(id), {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message || 'Tax master diperbarui',
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return normalizeMaster(json.data)
      } catch (e: any) {
        useToast().error({
          title: 'Error',
          message: e.message || 'Gagal memperbarui tax master',
          color: 'red',
          position: 'topRight',
        })
        throw e
      } finally {
        this.saving = false
      }
    },

    async remove(id: string) {
      const confirm = await Swal.fire({
        title: 'Hapus Tax Master?',
        text: 'Semua histori tarif terkait juga akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ea5455',
      })
      if (!confirm.isConfirmed) return false

      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.taxMastersShow(id), {
          method: 'DELETE',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message || 'Tax master dihapus',
          color: 'green',
          position: 'topRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({
          title: 'Error',
          message: e.message || 'Gagal menghapus tax master',
          color: 'red',
          position: 'topRight',
        })
        return false
      }
    },

    setPagination(event: { first: number; rows: number }) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchList()
    },

    setSort(event: { sortField?: string; sortOrder?: number }) {
      this.params.sortField = event.sortField || 'code'
      this.params.sortOrder = event.sortOrder ?? 1
      this.params.first = 0
      this.fetchList()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchList()
    },

    setFilter(key: 'type' | 'isActive', value: string) {
      this.params[key] = value
      this.params.first = 0
      this.fetchList()
    },

    /** Dropdown options — 1 request, rates default sudah di-preload di BE. */
    async fetchActiveOptions(): Promise<
      Array<{
        id: string
        code: string
        name: string
        type: string
        calculationType: string
        defaultRate: number
        taxRates: Array<{ id?: string; rate: number; isDefault: boolean; effectiveFrom?: string }>
      }>
    > {
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.taxMastersActive(), {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        return (json.data || []).map((raw: any) => ({
          id: raw.id,
          code: raw.code,
          name: raw.name,
          type: raw.type,
          calculationType: raw.calculationType ?? raw.calculation_type,
          defaultRate: Number(raw.defaultRate ?? raw.default_rate ?? 0),
          taxRates: (raw.taxRates ?? raw.tax_rates ?? []).map((r: any) => ({
            id: r.id,
            rate: Number(r.rate ?? 0),
            isDefault: !!(r.isDefault ?? r.is_default),
            effectiveFrom: String(r.effectiveFrom ?? r.effective_from ?? '').slice(0, 10),
          })),
        }))
      } catch (e) {
        console.error('fetchActiveOptions:', e)
        return []
      }
    },
  },
})
