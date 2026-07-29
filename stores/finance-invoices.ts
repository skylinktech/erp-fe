import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

// ─── Interfaces (camelCase — sesuai Lucid serialize) ───────────────────────────

export interface FinanceInvoiceCustomer {
  id: number
  name: string
  email: string | null
  phone: string | null
  address?: string | null
  npwp?: string | null
}

export interface FinanceInvoiceProduct {
  id: number
  name: string
  sku: string | null
  billingType?: 'one_time' | 'recurring' | string | null
}

export interface FinanceInvoiceItem {
  id: string
  salesInvoiceId: string
  productId: number | null
  quantity: number
  price: number
  subtotal: number
  description: string | null
  product: FinanceInvoiceProduct | null
}

export interface FinanceInvoicePerusahaan {
  id: number
  nmPerusahaan: string
  kodePerusahaan: string | null
  logoPerusahaan?: string | null
  alamatPerusahaan?: string | null
  tlpPerusahaan?: string | null
  emailPerusahaan?: string | null
  npwpPerusahaan?: string | null
  namaBankPerusahaan?: string | null
  nomorRekeningPerusahaan?: string | null
}

export interface FinanceInvoiceSubscription {
  id: string
  noSubscription: string
  status: string
  customerId?: number
  customerName?: string
  poReference?: string | null
}

export interface FinanceInvoice {
  id: string
  noInvoice: string
  up: string
  email: string
  date: string
  dueDate: string
  status: 'unpaid' | 'partial' | 'paid'
  documentStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  currentApprovalStep?: number | null
  nextApprovalStep?: number | null
  documentSource: 'manual' | 'cron_monthly' | 'subscription_signed' | 'billing_prep'
  billingPeriod: string | null
  discountPercent: number
  taxPercent: number
  dpp: number
  materaiAmount?: number
  total: number
  paidAmount: number
  remainingAmount: number
  paidAt: string | null
  description: string | null
  ttdDigital: boolean
  signatureToken?: string | null
  customerId: number | null
  perusahaanId: number | null
  subscriptionId: string | null
  sentAt: string | null
  customer: FinanceInvoiceCustomer | null
  perusahaan: FinanceInvoicePerusahaan | null
  subscription: FinanceInvoiceSubscription | null
  salesInvoiceItems: FinanceInvoiceItem[]
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  approvalLogs?: any[]
  signatureProgress?: { count: number; required: number; isFully?: boolean; percentage?: number; remaining?: number }
  createdAt: string
  updatedAt: string
}

export interface FinanceInvoiceStatistics {
  counts: {
    total: number
    unpaid: number
    partial: number
    paid: number
  }
  amounts: {
    grandTotal: number
    unpaid: number
    partial: number
    paid: number
    outstanding: number
  }
  percentages: {
    unpaid: number
    partial: number
    paid: number
  }
}

export interface BillableItem {
  id: string
  siNumber: string
  name: string
  location: string | null
  priority: 'low' | 'medium' | 'high'
  grandTotal: number
  approvedAt: string | null
  customerId: number | null
  siteId: number | null
  customer: FinanceInvoiceCustomer | null
  site: { id: number; code: string; name: string; type: string | null; address: string | null } | null
  businessScheme: { id: number; name: string } | null
}

export interface FinanceInvoiceUpdatePayload {
  up?: string
  email?: string
  date?: string
  dueDate?: string
  description?: string
  ttdDigital?: boolean
  status?: 'unpaid' | 'partial' | 'paid'
  paidAt?: string | null
}

interface InvoiceParams {
  first: number
  rows: number
  sortField: string | null
  sortOrder: number
  search: string
  customerId: number | null
  status: string
  documentSource: string
  billingPeriod: string
  dateFrom: string
  dateTo: string
}

interface BillableParams {
  first: number
  rows: number
  search: string
  customerId: number | null
}

interface FinanceInvoiceState {
  invoices: FinanceInvoice[]
  selectedInvoice: FinanceInvoice | null
  billableItems: BillableItem[]
  statistics: FinanceInvoiceStatistics | null
  loading: boolean
  loadingDetail: boolean
  loadingStats: boolean
  loadingBillable: boolean
  saving: boolean
  sending: boolean
  error: Error | null
  totalRecords: number
  totalBillable: number
  params: InvoiceParams
  billableParams: BillableParams
  activeTab: 'invoices' | 'billable'
}

/** Normalisasi snake_case → camelCase agar robust terhadap kedua format. */
function normalizeInvoice(raw: any): FinanceInvoice {
  if (!raw) return raw
  const items = raw.salesInvoiceItems ?? raw.sales_invoice_items ?? []
  return {
    id: raw.id,
    noInvoice: raw.noInvoice ?? raw.no_invoice,
    up: raw.up ?? '',
    email: raw.email ?? '',
    date: raw.date,
    dueDate: raw.dueDate ?? raw.due_date,
    status: raw.status,
    documentStatus: raw.documentStatus ?? raw.document_status,
    currentApprovalStep: raw.currentApprovalStep ?? raw.current_approval_step ?? null,
    nextApprovalStep: raw.nextApprovalStep ?? raw.next_approval_step ?? null,
    documentSource: raw.documentSource ?? raw.document_source,
    billingPeriod: raw.billingPeriod ?? raw.billing_period ?? null,
    discountPercent: Number(raw.discountPercent ?? raw.discount_percent ?? 0),
    taxPercent: Number(raw.taxPercent ?? raw.tax_percent ?? 0),
    dpp: Number(raw.dpp ?? 0),
    materaiAmount: Number(raw.materaiAmount ?? raw.materai_amount ?? 0),
    total: Number(raw.total ?? 0),
    paidAmount: Number(raw.paidAmount ?? raw.paid_amount ?? 0),
    remainingAmount: Number(raw.remainingAmount ?? raw.remaining_amount ?? 0),
    paidAt: raw.paidAt ?? raw.paid_at ?? null,
    description: raw.description ?? null,
    ttdDigital: !!(raw.ttdDigital ?? raw.ttd_digital),
    signatureToken: raw.signatureToken ?? raw.signature_token ?? null,
    customerId: raw.customerId ?? raw.customer_id ?? null,
    perusahaanId: raw.perusahaanId ?? raw.perusahaan_id ?? null,
    subscriptionId: raw.subscriptionId ?? raw.subscription_id ?? null,
    sentAt: raw.sentAt ?? raw.sent_at ?? null,
    customer: raw.customer ?? null,
    perusahaan: raw.perusahaan
      ? {
          id: raw.perusahaan.id,
          nmPerusahaan: raw.perusahaan.nmPerusahaan ?? raw.perusahaan.nm_perusahaan,
          kodePerusahaan: raw.perusahaan.kodePerusahaan ?? raw.perusahaan.kode_perusahaan ?? null,
          logoPerusahaan: raw.perusahaan.logoPerusahaan ?? raw.perusahaan.logo_perusahaan ?? null,
          alamatPerusahaan: raw.perusahaan.alamatPerusahaan ?? raw.perusahaan.alamat_perusahaan ?? null,
          tlpPerusahaan: raw.perusahaan.tlpPerusahaan ?? raw.perusahaan.tlp_perusahaan ?? null,
          emailPerusahaan: raw.perusahaan.emailPerusahaan ?? raw.perusahaan.email_perusahaan ?? null,
          npwpPerusahaan: raw.perusahaan.npwpPerusahaan ?? raw.perusahaan.npwp_perusahaan ?? null,
          namaBankPerusahaan:
            raw.perusahaan.namaBankPerusahaan ?? raw.perusahaan.nama_bank_perusahaan ?? null,
          nomorRekeningPerusahaan:
            raw.perusahaan.nomorRekeningPerusahaan ??
            raw.perusahaan.nomor_rekening_perusahaan ??
            null,
        }
      : null,
    subscription: raw.subscription
      ? {
          id: raw.subscription.id,
          noSubscription: raw.subscription.noSubscription ?? raw.subscription.no_subscription,
          status: raw.subscription.status,
          customerId: raw.subscription.customerId ?? raw.subscription.customer_id,
          customerName: raw.subscription.customerName ?? raw.subscription.customer_name,
          poReference: raw.subscription.poReference ?? raw.subscription.po_reference ?? null,
        }
      : null,
    salesInvoiceItems: (Array.isArray(items) ? items : []).map((item: any) => ({
      id: item.id,
      salesInvoiceId: item.salesInvoiceId ?? item.sales_invoice_id,
      productId: item.productId ?? item.product_id ?? null,
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
      subtotal: Number(item.subtotal ?? 0),
      description: item.description ?? null,
      product: item.product ?? null,
    })),
    currentApprovers: raw.currentApprovers ?? raw.current_approvers ?? [],
    approvalLogs: raw.approvalLogs ?? raw.approval_logs ?? [],
    signatureProgress: raw.signatureProgress ?? raw.signature_progress ?? undefined,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  }
}

function normalizeBillable(raw: any): BillableItem {
  return {
    id: raw.id,
    siNumber: raw.siNumber ?? raw.si_number,
    name: raw.name,
    location: raw.location ?? null,
    priority: raw.priority,
    grandTotal: Number(raw.grandTotal ?? raw.grand_total ?? 0),
    approvedAt: raw.approvedAt ?? raw.approved_at ?? null,
    customerId: raw.customerId ?? raw.customer_id ?? null,
    siteId: raw.siteId ?? raw.site_id ?? null,
    customer: raw.customer ?? null,
    site: raw.site ?? null,
    businessScheme: raw.businessScheme ?? raw.business_scheme ?? null,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFinanceInvoiceStore = defineStore('financeInvoice', {
  state: (): FinanceInvoiceState => ({
    invoices: [],
    selectedInvoice: null,
    billableItems: [],
    statistics: null,
    loading: false,
    loadingDetail: false,
    loadingStats: false,
    loadingBillable: false,
    saving: false,
    sending: false,
    error: null,
    totalRecords: 0,
    totalBillable: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: -1,
      search: '',
      customerId: null,
      status: '',
      documentSource: '',
      billingPeriod: '',
      dateFrom: '',
      dateTo: '',
    },
    billableParams: {
      first: 0,
      rows: 10,
      search: '',
      customerId: null,
    },
    activeTab: 'invoices',
  }),

  actions: {
    async fetchInvoices() {
      this.loading = true
      const { $api } = useNuxtApp()

      try {
        const page = Math.floor(this.params.first / this.params.rows) + 1
        const urlParams = new URLSearchParams({
          page: String(page),
          rows: String(this.params.rows),
          sortField: this.params.sortField || 'created_at',
          sortOrder: this.params.sortOrder > 0 ? '1' : '-1',
          search: this.params.search || '',
        })

        if (this.params.customerId) urlParams.set('customerId', String(this.params.customerId))
        if (this.params.status) urlParams.set('status', this.params.status)
        if (this.params.documentSource) urlParams.set('documentSource', this.params.documentSource)
        if (this.params.billingPeriod) urlParams.set('billingPeriod', this.params.billingPeriod)
        if (this.params.dateFrom) urlParams.set('dateFrom', this.params.dateFrom)
        if (this.params.dateTo) urlParams.set('dateTo', this.params.dateTo)

        const response = await fetch(`${$api.financeInvoices()}?${urlParams.toString()}`, {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result = await response.json()
        this.invoices = (result.data ?? []).map(normalizeInvoice)
        this.totalRecords = result.meta?.total ?? 0
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: `Gagal memuat daftar invoice: ${error.message}`,
          color: 'red',
          position: 'topRight',
        })
      } finally {
        this.loading = false
      }
    },

    /** Semua invoice sesuai filter aktif (untuk export CSV). */
    async fetchAllInvoicesForExport(): Promise<FinanceInvoice[]> {
      const { $api } = useNuxtApp()

      const urlParams = new URLSearchParams({
        page: '1',
        rows: '10000',
        sortField: this.params.sortField || 'created_at',
        sortOrder: this.params.sortOrder > 0 ? '1' : '-1',
        search: this.params.search || '',
      })

      if (this.params.customerId) urlParams.set('customerId', String(this.params.customerId))
      if (this.params.status) urlParams.set('status', this.params.status)
      if (this.params.documentSource) urlParams.set('documentSource', this.params.documentSource)
      if (this.params.billingPeriod) urlParams.set('billingPeriod', this.params.billingPeriod)
      if (this.params.dateFrom) urlParams.set('dateFrom', this.params.dateFrom)
      if (this.params.dateTo) urlParams.set('dateTo', this.params.dateTo)

      const response = await fetch(`${$api.financeInvoices()}?${urlParams.toString()}`, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      return (result.data ?? []).map(normalizeInvoice)
    },

    async fetchInvoiceById(id: string) {
      this.loadingDetail = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await fetch($api.financeInvoicesShow(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}))
          throw new Error(errBody.message || `HTTP ${response.status}`)
        }

        const result = await response.json()
        this.selectedInvoice = result.data ? normalizeInvoice(result.data) : null
        return this.selectedInvoice
      } catch (error: any) {
        this.error = error
        this.selectedInvoice = null
        useToast().error({
          title: 'Error',
          message: `Gagal memuat detail invoice: ${error.message}`,
          color: 'red',
          position: 'topRight',
        })
        return null
      } finally {
        this.loadingDetail = false
      }
    },

    async updateInvoice(id: string, payload: FinanceInvoiceUpdatePayload) {
      this.saving = true
      const { $api } = useNuxtApp()

      try {
        const response = await fetch($api.financeInvoicesUpdate(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}`)
        }

        const updated = normalizeInvoice(result.data)
        this.selectedInvoice = updated
        const idx = this.invoices.findIndex((inv) => inv.id === id)
        if (idx !== -1) this.invoices[idx] = updated

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Invoice berhasil diperbarui',
          color: 'green',
          position: 'topRight',
        })
        return updated
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal memperbarui invoice',
          color: 'red',
          position: 'topRight',
        })
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteInvoice(id: string) {
      const { $api } = useNuxtApp()

      const confirm = await Swal.fire({
        title: 'Hapus Invoice?',
        text: 'Invoice yang dihapus tidak dapat dikembalikan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ea5455',
      })

      if (!confirm.isConfirmed) return false

      try {
        const response = await fetch($api.financeInvoicesDelete(id), {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}`)
        }

        this.invoices = this.invoices.filter((inv) => inv.id !== id)
        if (this.selectedInvoice?.id === id) this.selectedInvoice = null
        this.totalRecords = Math.max(0, this.totalRecords - 1)

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Invoice berhasil dihapus',
          color: 'green',
          position: 'topRight',
        })
        return true
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal menghapus invoice',
          color: 'red',
          position: 'topRight',
        })
        return false
      }
    },

    async sendInvoice(id: string) {
      this.sending = true
      const { $api } = useNuxtApp()

      const confirm = await Swal.fire({
        title: 'Kirim Invoice?',
        text: 'Invoice akan dikirim ke email customer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) {
        this.sending = false
        return false
      }

      try {
        const response = await fetch($api.financeInvoicesSend(id), {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}`)
        }

        const sentAt = result.data?.sentAt || new Date().toISOString()
        if (this.selectedInvoice?.id === id) {
          this.selectedInvoice = { ...this.selectedInvoice, sentAt }
        }
        const idx = this.invoices.findIndex((inv) => inv.id === id)
        if (idx !== -1) {
          this.invoices[idx] = { ...this.invoices[idx], sentAt }
        }

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Invoice berhasil dikirim',
          color: 'green',
          position: 'topRight',
        })
        return true
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal mengirim invoice',
          color: 'red',
          position: 'topRight',
        })
        return false
      } finally {
        this.sending = false
      }
    },

    /**
     * Bulk send — satu request API, partial success ditampilkan ke user.
     */
    async sendInvoicesBulk(ids: string[]) {
      const uniqueIds = [...new Set((ids || []).filter(Boolean))]
      if (!uniqueIds.length) {
        useToast().error({
          title: 'Error',
          message: 'Pilih minimal 1 invoice',
          color: 'red',
          position: 'topRight',
        })
        return null
      }
      if (uniqueIds.length > 50) {
        useToast().error({
          title: 'Error',
          message: 'Maksimal 50 invoice per bulk send',
          color: 'red',
          position: 'topRight',
        })
        return null
      }

      this.sending = true
      const { $api } = useNuxtApp()

      const confirm = await Swal.fire({
        title: 'Kirim Invoice Terpilih?',
        html: `${uniqueIds.length} invoice akan dikirim ke email customer masing-masing.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) {
        this.sending = false
        return null
      }

      try {
        const response = await fetch($api.financeInvoicesSendBulk(), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ ids: uniqueIds }),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}`)
        }

        const data = result.data || {}
        const results = Array.isArray(data.results) ? data.results : []

        for (const row of results) {
          if (!row?.ok || !row.id) continue
          const idx = this.invoices.findIndex((inv) => inv.id === row.id)
          if (idx !== -1) {
            this.invoices[idx] = {
              ...this.invoices[idx],
              sentAt: row.sentAt || new Date().toISOString(),
            }
          }
          if (this.selectedInvoice?.id === row.id) {
            this.selectedInvoice = {
              ...this.selectedInvoice,
              sentAt: row.sentAt || new Date().toISOString(),
            }
          }
        }

        const failedRows = results.filter((r: any) => !r.ok)
        if (failedRows.length && data.success > 0) {
          const failList = failedRows
            .slice(0, 5)
            .map((r: any) => `${r.noInvoice || r.id}: ${r.error || 'gagal'}`)
            .join('<br>')
          await Swal.fire({
            title: 'Sebagian berhasil',
            html: `${data.success} terkirim, ${data.failed} gagal.<br><br>${failList}`,
            icon: 'warning',
          })
        } else if (failedRows.length && !data.success) {
          const failList = failedRows
            .slice(0, 5)
            .map((r: any) => `${r.noInvoice || r.id}: ${r.error || 'gagal'}`)
            .join('<br>')
          await Swal.fire({
            title: 'Gagal mengirim',
            html: failList || result.message || 'Semua invoice gagal dikirim',
            icon: 'error',
          })
        } else {
          useToast().success({
            title: 'Berhasil',
            message: result.message || `${data.success || uniqueIds.length} invoice terkirim`,
            color: 'green',
            position: 'topRight',
          })
        }

        return data
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal mengirim invoice bulk',
          color: 'red',
          position: 'topRight',
        })
        return null
      } finally {
        this.sending = false
      }
    },

    async submitInvoice(id: string) {
      const { $api } = useNuxtApp()
      const confirm = await Swal.fire({
        title: 'Submit Invoice?',
        text: 'Invoice akan dikirim ke alur approval.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Submit',
        cancelButtonText: 'Batal',
      })
      if (!confirm.isConfirmed) return false

      try {
        const response = await fetch($api.financeInvoicesSubmit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`)

        if (result.data) {
          const updated = normalizeInvoice(result.data)
          this.selectedInvoice = updated
          const idx = this.invoices.findIndex((inv) => inv.id === id)
          if (idx !== -1) this.invoices[idx] = { ...this.invoices[idx], ...updated }
        }

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Invoice berhasil di-submit',
          color: 'green',
          position: 'topRight',
        })
        return true
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal submit invoice',
          color: 'red',
          position: 'topRight',
        })
        return false
      }
    },

    async approveInvoice(id: string, remarks = '', skipConfirm = false) {
      const { $api } = useNuxtApp()
      if (!skipConfirm) {
        const confirm = await Swal.fire({
          title: 'Approve Invoice?',
          text: 'Anda akan menyetujui invoice ini.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ya, Approve',
          cancelButtonText: 'Batal',
        })
        if (!confirm.isConfirmed) return false
      }

      try {
        const response = await fetch($api.financeInvoicesApprove(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`)

        if (result.data) {
          const updated = normalizeInvoice(result.data)
          this.selectedInvoice = updated
          const idx = this.invoices.findIndex((inv) => inv.id === id)
          if (idx !== -1) this.invoices[idx] = { ...this.invoices[idx], ...updated }
        }

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Invoice berhasil disetujui',
          color: 'green',
          position: 'topRight',
        })
        return true
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal approve invoice',
          color: 'red',
          position: 'topRight',
        })
        return false
      }
    },

    async rejectInvoice(id: string, remarks = '', skipConfirm = false) {
      const { $api } = useNuxtApp()
      if (!skipConfirm) {
        const confirm = await Swal.fire({
          title: 'Reject Invoice?',
          text: 'Anda akan menolak invoice ini.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, Reject',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#ea5455',
        })
        if (!confirm.isConfirmed) return false
      }

      try {
        const response = await fetch($api.financeInvoicesReject(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`)

        if (result.data) {
          const updated = normalizeInvoice(result.data)
          this.selectedInvoice = updated
          const idx = this.invoices.findIndex((inv) => inv.id === id)
          if (idx !== -1) this.invoices[idx] = { ...this.invoices[idx], ...updated }
        }

        useToast().success({
          title: 'Berhasil',
          message: result.message || 'Invoice berhasil ditolak',
          color: 'green',
          position: 'topRight',
        })
        return true
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal reject invoice',
          color: 'red',
          position: 'topRight',
        })
        return false
      }
    },

    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()

      try {
        const urlParams = new URLSearchParams()
        if (this.params.customerId) urlParams.set('customerId', String(this.params.customerId))
        if (this.params.dateFrom) urlParams.set('dateFrom', this.params.dateFrom)
        if (this.params.dateTo) urlParams.set('dateTo', this.params.dateTo)
        if (this.params.billingPeriod) urlParams.set('billingPeriod', this.params.billingPeriod)

        const response = await fetch(`${$api.financeInvoicesStatistics()}?${urlParams.toString()}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result = await response.json()
        this.statistics = result.data ?? null
      } catch (error: any) {
        console.error('fetchStatistics error:', error)
      } finally {
        this.loadingStats = false
      }
    },

    async fetchBillableItems() {
      this.loadingBillable = true
      const { $api } = useNuxtApp()

      try {
        const page = Math.floor(this.billableParams.first / this.billableParams.rows) + 1
        const urlParams = new URLSearchParams({
          page: String(page),
          rows: String(this.billableParams.rows),
          search: this.billableParams.search || '',
        })
        if (this.billableParams.customerId) {
          urlParams.set('customerId', String(this.billableParams.customerId))
        }

        const response = await fetch(`${$api.financeInvoicesBillableItems()}?${urlParams.toString()}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const result = await response.json()
        this.billableItems = (result.data ?? []).map(normalizeBillable)
        this.totalBillable = result.meta?.total ?? 0
      } catch (error: any) {
        useToast().error({
          title: 'Error',
          message: `Gagal memuat perangkat aktif: ${error.message}`,
          color: 'red',
          position: 'topRight',
        })
      } finally {
        this.loadingBillable = false
      }
    },

    setPagination(event: { first: number; rows: number }) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchInvoices()
    },

    setSort(event: { sortField: string; sortOrder: number }) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchInvoices()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchInvoices()
    },

    setFilter(
      key: keyof Pick<InvoiceParams, 'customerId' | 'status' | 'documentSource' | 'billingPeriod' | 'dateFrom' | 'dateTo'>,
      value: any
    ) {
      ;(this.params as any)[key] = value
      this.params.first = 0
      this.fetchInvoices()
      this.fetchStatistics()
    },

    resetFilters() {
      this.params.customerId = null
      this.params.status = ''
      this.params.documentSource = ''
      this.params.billingPeriod = ''
      this.params.dateFrom = ''
      this.params.dateTo = ''
      this.params.search = ''
      this.params.first = 0
      this.fetchInvoices()
      this.fetchStatistics()
    },

    setBillablePagination(event: { first: number; rows: number }) {
      this.billableParams.first = event.first
      this.billableParams.rows = event.rows
      this.fetchBillableItems()
    },

    setBillableSearch(value: string) {
      this.billableParams.search = value
      this.billableParams.first = 0
      this.fetchBillableItems()
    },

    setActiveTab(tab: 'invoices' | 'billable') {
      this.activeTab = tab
      if (tab === 'billable' && this.billableItems.length === 0) {
        this.fetchBillableItems()
      }
    },

    clearSelected() {
      this.selectedInvoice = null
      this.error = null
    },
  },
})
