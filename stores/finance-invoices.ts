import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface FinanceInvoiceCustomer {
  id      : number
  name    : string
  email   : string | null
  phone   : string | null
}

export interface FinanceInvoiceProduct {
  id  : number
  name: string
  sku : string | null
}

export interface FinanceInvoiceItem {
  id              : string
  sales_invoice_id: string
  product_id      : number | null
  quantity        : number
  price           : number
  subtotal        : number
  description     : string | null
  product         : FinanceInvoiceProduct | null
}

export interface FinanceInvoice {
  id              : string
  no_invoice      : string
  date            : string
  due_date        : string
  status          : 'unpaid' | 'partial' | 'paid'
  document_status : 'draft' | 'pending_approval' | 'approved' | 'rejected'
  document_source : 'manual' | 'cron_monthly'
  billing_period  : string | null
  total           : number
  paid_amount     : number
  remaining_amount: number
  description     : string | null
  customer_id     : number | null
  perusahaan_id   : number | null
  customer        : FinanceInvoiceCustomer | null
  perusahaan      : { id: number; nm_perusahaan: string; kode_perusahaan: string | null } | null
  sales_invoice_items: FinanceInvoiceItem[]
  created_at      : string
  updated_at      : string
}

export interface FinanceInvoiceStatistics {
  counts: {
    total  : number
    unpaid : number
    partial: number
    paid   : number
  }
  amounts: {
    grandTotal : number
    unpaid     : number
    partial    : number
    paid       : number
    outstanding: number
  }
  percentages: {
    unpaid : number
    partial: number
    paid   : number
  }
}

export interface BillableItem {
  id            : string
  si_number     : string
  name          : string
  location      : string | null
  priority      : 'low' | 'medium' | 'high'
  grand_total   : number
  approved_at   : string | null
  customer_id   : number | null
  site_id       : number | null
  customer      : FinanceInvoiceCustomer | null
  site          : { id: number; code: string; name: string; type: string | null; address: string | null } | null
  business_scheme: { id: number; name: string } | null
}

interface InvoiceParams {
  first         : number
  rows          : number
  sortField     : string | null
  sortOrder     : number
  search        : string
  customerId    : number | null
  status        : string
  documentSource: string
  billingPeriod : string
  dateFrom      : string
  dateTo        : string
}

interface BillableParams {
  first     : number
  rows      : number
  search    : string
  customerId: number | null
}

interface FinanceInvoiceState {
  invoices        : FinanceInvoice[]
  selectedInvoice : FinanceInvoice | null
  billableItems   : BillableItem[]
  statistics      : FinanceInvoiceStatistics | null
  loading         : boolean
  loadingStats    : boolean
  loadingBillable : boolean
  totalRecords    : number
  totalBillable   : number
  params          : InvoiceParams
  billableParams  : BillableParams
  activeTab       : 'invoices' | 'billable'
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFinanceInvoiceStore = defineStore('financeInvoice', {
  state: (): FinanceInvoiceState => ({
    invoices       : [],
    selectedInvoice: null,
    billableItems  : [],
    statistics     : null,
    loading        : false,
    loadingStats   : false,
    loadingBillable: false,
    totalRecords   : 0,
    totalBillable  : 0,
    params: {
      first         : 0,
      rows          : 10,
      sortField     : 'created_at',
      sortOrder     : -1,
      search        : '',
      customerId    : null,
      status        : '',
      documentSource: '',
      billingPeriod : '',
      dateFrom      : '',
      dateTo        : '',
    },
    billableParams: {
      first     : 0,
      rows      : 10,
      search    : '',
      customerId: null,
    },
    activeTab: 'invoices',
  }),

  actions: {
    // ─── Invoices List ─────────────────────────────────────────────────────────

    async fetchInvoices() {
      this.loading = true
      const { $api } = useNuxtApp()

      try {
        const page = Math.floor(this.params.first / this.params.rows) + 1
        const urlParams = new URLSearchParams({
          page     : String(page),
          rows     : String(this.params.rows),
          sortField: this.params.sortField  || 'created_at',
          sortOrder: this.params.sortOrder > 0 ? '1' : '-1',
          search   : this.params.search    || '',
        })

        if (this.params.customerId)     urlParams.set('customerId',     String(this.params.customerId))
        if (this.params.status)         urlParams.set('status',         this.params.status)
        if (this.params.documentSource) urlParams.set('documentSource', this.params.documentSource)
        if (this.params.billingPeriod)  urlParams.set('billingPeriod',  this.params.billingPeriod)
        if (this.params.dateFrom)       urlParams.set('dateFrom',       this.params.dateFrom)
        if (this.params.dateTo)         urlParams.set('dateTo',         this.params.dateTo)

        const response = await fetch(`${$api.financeInvoices()}?${urlParams.toString()}`, {
          headers    : { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result = await response.json()
        this.invoices     = result.data       ?? []
        this.totalRecords = result.meta?.total ?? 0
      } catch (error: any) {
        useToast().error({
          title   : 'Error',
          message : `Gagal memuat daftar invoice: ${error.message}`,
          color   : 'red',
          position: 'topRight',
        })
      } finally {
        this.loading = false
      }
    },

    // ─── Statistics ────────────────────────────────────────────────────────────

    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()

      try {
        const urlParams = new URLSearchParams()
        if (this.params.customerId) urlParams.set('customerId', String(this.params.customerId))
        if (this.params.dateFrom)   urlParams.set('dateFrom',   this.params.dateFrom)
        if (this.params.dateTo)     urlParams.set('dateTo',     this.params.dateTo)
        if (this.params.billingPeriod) urlParams.set('billingPeriod', this.params.billingPeriod)

        const response = await fetch(`${$api.financeInvoicesStatistics()}?${urlParams.toString()}`, {
          headers    : { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result      = await response.json()
        this.statistics   = result.data ?? null
      } catch (error: any) {
        console.error('fetchStatistics error:', error)
      } finally {
        this.loadingStats = false
      }
    },

    // ─── Billable Items (SiteInvest Approved) ─────────────────────────────────

    async fetchBillableItems() {
      this.loadingBillable = true
      const { $api } = useNuxtApp()

      try {
        const page = Math.floor(this.billableParams.first / this.billableParams.rows) + 1
        const urlParams = new URLSearchParams({
          page  : String(page),
          rows  : String(this.billableParams.rows),
          search: this.billableParams.search || '',
        })
        if (this.billableParams.customerId) {
          urlParams.set('customerId', String(this.billableParams.customerId))
        }

        const response = await fetch(`${$api.financeInvoicesBillableItems()}?${urlParams.toString()}`, {
          headers    : { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result         = await response.json()
        this.billableItems   = result.data       ?? []
        this.totalBillable   = result.meta?.total ?? 0
      } catch (error: any) {
        useToast().error({
          title   : 'Error',
          message : `Gagal memuat perangkat aktif: ${error.message}`,
          color   : 'red',
          position: 'topRight',
        })
      } finally {
        this.loadingBillable = false
      }
    },

    // ─── Parameter Setters ─────────────────────────────────────────────────────

    setPagination(event: { first: number; rows: number }) {
      this.params.first = event.first
      this.params.rows  = event.rows
      this.fetchInvoices()
    },

    setSort(event: { sortField: string; sortOrder: number }) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchInvoices()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first  = 0
      this.fetchInvoices()
    },

    setFilter(key: keyof Pick<InvoiceParams, 'customerId' | 'status' | 'documentSource' | 'billingPeriod' | 'dateFrom' | 'dateTo'>, value: any) {
      (this.params as any)[key] = value
      this.params.first = 0
      this.fetchInvoices()
      this.fetchStatistics()
    },

    resetFilters() {
      this.params.customerId     = null
      this.params.status         = ''
      this.params.documentSource = ''
      this.params.billingPeriod  = ''
      this.params.dateFrom       = ''
      this.params.dateTo         = ''
      this.params.search         = ''
      this.params.first          = 0
      this.fetchInvoices()
      this.fetchStatistics()
    },

    setBillablePagination(event: { first: number; rows: number }) {
      this.billableParams.first = event.first
      this.billableParams.rows  = event.rows
      this.fetchBillableItems()
    },

    setBillableSearch(value: string) {
      this.billableParams.search = value
      this.billableParams.first  = 0
      this.fetchBillableItems()
    },

    setActiveTab(tab: 'invoices' | 'billable') {
      this.activeTab = tab
      if (tab === 'billable' && this.billableItems.length === 0) {
        this.fetchBillableItems()
      }
    },
  },
})
