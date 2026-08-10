import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface BillingPrepItem {
  id: string
  sourceType: string
  sourceId: string | null
  description: string
  qty: number
  price: number
  amount: number
  selected: boolean
  sortOrder: number
  serviceLine?: {
    id: string
    serviceName?: string
    planName?: string
    subscriptionId?: string
  } | null
}

export interface BillingPrepSources {
  subscriptions: Array<{
    id: string
    noSubscription: string
    status?: string
    contractPeriod?: number
    serviceLineCount?: number
  }>
  adjustments: Array<{
    id: string
    type: string
    description: string | null
    amount: number
    billingPeriod?: string
    status?: string
  }>
}

export interface BillingPrepTax {
  id?: string
  taxMasterId: string
  taxRateId?: string | null
  taxCode: string
  taxName: string
  taxType: 'OUTPUT' | 'WITHHOLDING'
  calculationType: 'PERCENTAGE' | 'FIXED'
  rate: number
  amount: number
  sortOrder?: number
}

export interface BillingPreparation {
  id: string
  customerId: number
  fakturPajak: string | null
  applyTax: boolean
  billingPeriod: string
  status: 'draft' | 'ready' | 'invoiced'
  attachment: string | null
  preparedAt?: string | null
  generatedInvoiceAt?: string | null
  /** ID Finance Invoice yang digenerate (bukan Sales Invoice toko) */
  financeInvoiceId?: string | null
  /** @deprecated gunakan financeInvoiceId */
  salesInvoiceId?: string | null
  customer?: { id: number; name: string; email?: string } | null
  items?: BillingPrepItem[]
  taxes?: BillingPrepTax[]
  sources?: BillingPrepSources
  totalAmount?: number
  itemCount?: number
  selectedCount?: number
  financeInvoice?: { id: string; noInvoice?: string; no_invoice?: string } | null
  /** @deprecated gunakan financeInvoice */
  salesInvoice?: { id: string; noInvoice?: string; no_invoice?: string } | null
}

function normalizeItem(raw: any): BillingPrepItem {
  const serviceLine = raw.serviceLine || raw.service_line
  return {
    id: raw.id,
    sourceType: raw.sourceType ?? raw.source_type,
    sourceId: raw.sourceId ?? raw.source_id ?? null,
    description: raw.description,
    qty: Number(raw.qty ?? 1),
    price: Number(raw.price ?? 0),
    amount: Number(raw.amount ?? 0),
    selected: !!(raw.selected ?? true),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
    serviceLine: serviceLine
      ? {
          id: serviceLine.id,
          serviceName: serviceLine.serviceName ?? serviceLine.service_name,
          planName: serviceLine.planName ?? serviceLine.plan_name,
          subscriptionId: serviceLine.subscriptionId ?? serviceLine.subscription_id,
        }
      : null,
  }
}

function normalizeSources(raw: any): BillingPrepSources {
  return {
    subscriptions: (raw?.subscriptions || []).map((s: any) => ({
      id: s.id,
      noSubscription: s.noSubscription ?? s.no_subscription,
      status: s.status,
      contractPeriod: s.contractPeriod ?? s.contract_period,
      serviceLineCount: Number(s.serviceLineCount ?? s.service_line_count ?? 0),
    })),
    adjustments: (raw?.adjustments || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      description: a.description ?? null,
      amount: Number(a.amount ?? 0),
      billingPeriod: a.billingPeriod ?? a.billing_period,
      status: a.status,
    })),
  }
}

function normalizeTax(raw: any): BillingPrepTax {
  return {
    id: raw.id,
    taxMasterId: raw.taxMasterId ?? raw.tax_master_id,
    taxRateId: raw.taxRateId ?? raw.tax_rate_id ?? null,
    taxCode: raw.taxCode ?? raw.tax_code,
    taxName: raw.taxName ?? raw.tax_name,
    taxType: raw.taxType ?? raw.tax_type,
    calculationType: raw.calculationType ?? raw.calculation_type,
    rate: Number(raw.rate ?? 0),
    amount: Number(raw.amount ?? 0),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
  }
}

function normalizePrep(raw: any): BillingPreparation {
  const items = (raw.items || []).map(normalizeItem)
  const taxes = (raw.taxes || []).map(normalizeTax)
  return {
    id: raw.id,
    customerId: raw.customerId ?? raw.customer_id,
    fakturPajak: raw.fakturPajak ?? raw.faktur_pajak ?? null,
    applyTax: !!(raw.applyTax ?? raw.apply_tax),
    billingPeriod: raw.billingPeriod ?? raw.billing_period,
    status: raw.status,
    attachment: raw.attachment ?? null,
    preparedAt: raw.preparedAt ?? raw.prepared_at ?? null,
    generatedInvoiceAt: raw.generatedInvoiceAt ?? raw.generated_invoice_at ?? null,
    financeInvoiceId:
      raw.financeInvoiceId ??
      raw.finance_invoice_id ??
      raw.salesInvoiceId ??
      raw.sales_invoice_id ??
      null,
    salesInvoiceId: raw.salesInvoiceId ?? raw.sales_invoice_id ?? null,
    customer: raw.customer
      ? { id: raw.customer.id, name: raw.customer.name, email: raw.customer.email }
      : null,
    items,
    taxes,
    sources: raw.sources ? normalizeSources(raw.sources) : undefined,
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? 0),
    itemCount: Number(raw.itemCount ?? raw.item_count ?? items.length),
    selectedCount: Number(
      raw.selectedCount ?? raw.selected_count ?? items.filter((i) => i.selected).length
    ),
    financeInvoice: raw.financeInvoice || raw.finance_invoice || raw.salesInvoice || raw.sales_invoice || null,
    salesInvoice: raw.salesInvoice || raw.sales_invoice || null,
  }
}

export const useBillingPreparationStore = defineStore('billingPreparation', {
  state: () => ({
    rows: [] as BillingPreparation[],
    selected: null as BillingPreparation | null,
    loading: false,
    loadingStats: false,
    loadingDetail: false,
    saving: false,
    totalRecords: 0,
    statistics: {
      total: 0,
      draft: 0,
      ready: 0,
      invoiced: 0,
      readyAmount: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: -1,
      search: '',
      customerId: null as number | null,
      status: '',
      billingPeriod: '',
    },
  }),

  actions: {
    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.billingPreparationsStatistics(), {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        this.statistics = {
          total: Number(json.total ?? 0),
          draft: Number(json.draft ?? 0),
          ready: Number(json.ready ?? 0),
          invoiced: Number(json.invoiced ?? 0),
          readyAmount: Number(json.readyAmount ?? 0),
        }
      } catch (e: any) {
        console.error('Billing preparation statistics:', e)
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
        if (this.params.customerId) qs.set('customerId', String(this.params.customerId))
        if (this.params.status) qs.set('status', this.params.status)
        if (this.params.billingPeriod) qs.set('billingPeriod', this.params.billingPeriod)

        const res = await fetch(`${$api.billingPreparations()}?${qs}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || err.error || `HTTP ${res.status}`)
        }
        const json = await res.json()
        this.rows = (json.data || []).map(normalizePrep)
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
      } finally {
        this.loading = false
      }
    },

    async fetchById(id: string) {
      this.loadingDetail = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.billingPreparationsShow(id), {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        this.selected = json.data ? normalizePrep(json.data) : null
        return this.selected
      } catch (e: any) {
        this.selected = null
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
        return null
      } finally {
        this.loadingDetail = false
      }
    },

    async create(
      payload: {
        customerId: number
        billingPeriod: string
        fakturPajak?: string
        subscriptionIds?: string[]
        adjustmentIds?: string[]
        applyTax?: boolean
        taxMasterIds?: string[]
      },
      file?: File | null
    ) {
      this.saving = true
      const { $api } = useNuxtApp()
      try {
        const body = new FormData()
        body.append('customerId', String(payload.customerId))
        body.append('billingPeriod', payload.billingPeriod)
        if (payload.fakturPajak) body.append('fakturPajak', payload.fakturPajak)
        body.append('subscriptionIds', JSON.stringify(payload.subscriptionIds || []))
        body.append('adjustmentIds', JSON.stringify(payload.adjustmentIds || []))
        body.append('applyTax', payload.applyTax ? 'true' : 'false')
        body.append('taxMasterIds', JSON.stringify(payload.taxMasterIds || []))
        if (file) body.append('attachment', file)

        const res = await fetch($api.billingPreparations(), {
          method: 'POST',
          credentials: 'include',
          body,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'bottomRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return json.data?.id as string | undefined
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
        return null
      } finally {
        this.saving = false
      }
    },

    async previewSources(customerId: number, billingPeriod?: string) {
      const { $api } = useNuxtApp()
      try {
        const qs = new URLSearchParams({
          customerId: String(customerId),
        })
        if (billingPeriod) qs.set('billingPeriod', billingPeriod)
        const res = await fetch(`${$api.billingPreparationsPreviewSources()}?${qs}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        return normalizeSources(json.data || {})
      } catch (e: any) {
        console.error('previewSources:', e)
        return { subscriptions: [], adjustments: [] } as BillingPrepSources
      }
    },

    async update(id: string, payload: Record<string, any>, file?: File | null) {
      this.saving = true
      const { $api } = useNuxtApp()
      try {
        let res: Response
        if (file) {
          const body = new FormData()
          if (payload.fakturPajak !== undefined) body.append('fakturPajak', payload.fakturPajak ?? '')
          if (payload.applyTax !== undefined) body.append('applyTax', payload.applyTax ? 'true' : 'false')
          if (payload.taxMasterIds !== undefined) {
            body.append('taxMasterIds', JSON.stringify(payload.taxMasterIds || []))
          }
          if (payload.items) body.append('items', JSON.stringify(payload.items))
          body.append('attachment', file)
          res = await fetch($api.billingPreparationsShow(id), {
            method: 'PUT',
            credentials: 'include',
            body,
          })
        } else {
          res = await fetch($api.billingPreparationsShow(id), {
            method: 'PUT',
            credentials: 'include',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        }
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        this.selected = json.data ? normalizePrep(json.data) : this.selected
        // refresh sources after update
        if (this.selected) {
          await this.fetchById(id)
        }
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'bottomRight',
        })
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
        return false
      } finally {
        this.saving = false
      }
    },

    async rebuildItems(id: string) {
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.billingPreparationsRebuild(id), {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        this.selected = json.data ? normalizePrep(json.data) : this.selected
        if (this.selected?.id) await this.fetchById(this.selected.id)
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'bottomRight',
        })
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
        return false
      }
    },

    async markReady(id: string) {
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({
        title: 'Set Ready & Generate Finance Invoice?',
        text: 'Status akan menjadi Ready dan worker akan membuat Finance Invoice (bukan Sales Invoice toko).',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Ready',
      })
      if (!ok.isConfirmed) return false
      try {
        const res = await fetch($api.billingPreparationsReady(id), {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'bottomRight',
        })
        await this.fetchById(id)
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
        return false
      }
    },

    async remove(id: string) {
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({
        title: 'Hapus Preparation?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        confirmButtonColor: '#ea5455',
      })
      if (!ok.isConfirmed) return false
      try {
        const res = await fetch($api.billingPreparationsShow(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
        useToast().success({
          title: 'Berhasil',
          message: json.message,
          color: 'green',
          position: 'bottomRight',
        })
        await Promise.all([this.fetchList(), this.fetchStatistics()])
        return true
      } catch (e: any) {
        useToast().error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight' })
        return false
      }
    },
  },
})
