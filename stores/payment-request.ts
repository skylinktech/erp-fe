import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export type PaymentRequestSourceType = 'purchase_order' | 'material_request' | 'arf'

export type PaymentRequestItemType = 'source' | 'other'

export interface PaymentRequestItemForm {
  description: string
  qty: number
  unitAmount: number
  subtotal: number
  remarks?: string | null
  sortOrder?: number
  itemType?: PaymentRequestItemType
}

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface PaymentRequestSourceOption {
  id: string
  number: string
  label: string
  totalAmount: number
  status: string
  date?: string | null
}

export interface PaymentRequestTax {
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

export interface PaymentRequest {
  id: string
  prqNumber?: string
  prq_number?: string
  requestDate?: string
  request_date?: string
  sourceType?: PaymentRequestSourceType
  source_type?: PaymentRequestSourceType
  sourceId?: string
  source_id?: string
  sourceNumber?: string | null
  source_number?: string | null
  requestedBy?: number | null
  departmentId?: number | null
  vendorId?: number | null
  payeeName?: string | null
  payee_name?: string | null
  bankName?: string | null
  bank_name?: string | null
  bankAccountNumber?: string | null
  bank_account_number?: string | null
  bankAccountName?: string | null
  bank_account_name?: string | null
  priority?: string
  status: string
  purpose?: string | null
  neededDate?: string | null
  dueDate?: string | null
  due_date?: string | null
  approvalStatus?: string | null
  rejectionReason?: string | null
  rejectReason?: string | null
  totalAmount?: number
  discountPercent?: number
  discount_percent?: number
  taxPercent?: number
  tax_percent?: number
  dpp?: number
  taxAmount?: number
  tax_amount?: number
  applyTax?: boolean
  apply_tax?: boolean
  taxes?: PaymentRequestTax[]
  currency?: string
  notes?: string | null
  attachment?: string | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
  paymentRequestItems?: PaymentRequestItemForm[]
  payment_request_items?: PaymentRequestItemForm[]
  requestedByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string; roles?: Array<{ name?: string }> }
  department?: { id: number; nm_departemen?: string; nmDepartemen?: string }
  vendor?: { id: number; name: string }
  approvalLogs?: ApprovalLogEntry[]
  approval_logs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  signatureProgress?: { count: number; required: number }
  nextApprovalStep?: number | null
  approvedAt?: string | null
}

interface PaymentRequestState {
  paymentRequests: PaymentRequest[]
  paymentRequest: PaymentRequest | null
  loading: boolean
  saving: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    status?: string | null
    priority?: string | null
    sourceType?: PaymentRequestSourceType | null
    departmentId?: number | null
  }
  form: {
    id?: string | null
    status?: string
    requestDate: string
    sourceType: PaymentRequestSourceType | null
    sourceId: string | null
    sourceNumber: string
    departmentId: number | null
    vendorId: number | null
    payeeName: string
    bankName: string
    bankAccountNumber: string
    bankAccountName: string
    priority: string
    purpose: string
    neededDate: string
    dueDate: string
    discountPercent: number
    taxPercent: number
    applyTax: boolean
    taxMasterIds: string[]
    currency: string
    notes: string
    paymentRequestItems: PaymentRequestItemForm[]
    otherCharges: PaymentRequestItemForm[]
  }
  isEditMode: boolean
  validationErrors: any[]
  statistics: {
    totalPaymentRequests: number
    approvedPaymentRequests: number
    draftPaymentRequests: number
    pendingPaymentRequests: number
    rejectedPaymentRequests: number
    completedPaymentRequests: number
    totalValue: number
  }
}

function recalcItem(d: PaymentRequestItemForm) {
  const qty = Number(d.qty) || 0
  const unitAmount = Number(d.unitAmount) || 0
  d.subtotal = qty * unitAmount
}

function mapItemFromApi(d: any): PaymentRequestItemForm {
  const qty = Number(d.qty) || 1
  const unitAmount = Number(d.unitAmount ?? d.unit_amount ?? d.amount ?? 0)
  const rawType = d.itemType ?? d.item_type
  return {
    description: d.description ?? '',
    qty,
    unitAmount,
    subtotal: Number(d.subtotal) || qty * unitAmount,
    remarks: d.remarks ?? null,
    sortOrder: d.sortOrder ?? d.sort_order ?? 0,
    itemType: rawType === 'other' ? 'other' : 'source',
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function blankCharge(): PaymentRequestItemForm {
  return {
    description: '',
    qty: 1,
    unitAmount: 0,
    subtotal: 0,
    remarks: null,
    sortOrder: 0,
    itemType: 'other',
  }
}

export function partitionItemsFromApi(items: any[]): {
  sourceItems: PaymentRequestItemForm[]
  otherCharges: PaymentRequestItemForm[]
} {
  const sourceItems: PaymentRequestItemForm[] = []
  const otherCharges: PaymentRequestItemForm[] = []
  for (const raw of items || []) {
    const mapped = mapItemFromApi(raw)
    if (mapped.itemType === 'other') otherCharges.push(mapped)
    else sourceItems.push(mapped)
  }
  return { sourceItems, otherCharges }
}

export function getPaymentRequestNo(row: PaymentRequest | null | undefined) {
  return row?.prqNumber || row?.prq_number || ''
}

export function getPaymentRequestAllItems(row: PaymentRequest | null | undefined) {
  return row?.paymentRequestItems || row?.payment_request_items || []
}

export function getPaymentRequestSourceItems(row: PaymentRequest | null | undefined) {
  return getPaymentRequestAllItems(row).filter((d: any) => {
    const t = d.itemType ?? d.item_type
    return t !== 'other'
  })
}

export function getPaymentRequestOtherCharges(row: PaymentRequest | null | undefined) {
  return getPaymentRequestAllItems(row).filter((d: any) => {
    const t = d.itemType ?? d.item_type
    return t === 'other'
  })
}

export function getPaymentRequestItemsSubtotal(row: PaymentRequest | null | undefined) {
  const items = getPaymentRequestAllItems(row)
  if (items.length) {
    return items.reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
  }
  const total = Number(row?.totalAmount ?? 0)
  const taxPct = Number(row?.taxPercent ?? row?.tax_percent ?? 0)
  const discPct = Number(row?.discountPercent ?? row?.discount_percent ?? 0)
  if (taxPct <= 0 && discPct <= 0) return total
  return Number(row?.dpp ?? total)
}

export function getPaymentRequestSourceSubtotal(row: PaymentRequest | null | undefined) {
  const items = getPaymentRequestSourceItems(row)
  if (items.length) {
    return items.reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
  }
  return getPaymentRequestItemsSubtotal(row)
}

export function getPaymentRequestOtherSubtotal(row: PaymentRequest | null | undefined) {
  return getPaymentRequestOtherCharges(row).reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
}

export function getPaymentRequestDiscountAmount(row: PaymentRequest | null | undefined) {
  const sourceSubtotal = getPaymentRequestSourceSubtotal(row)
  const discPct = Number(row?.discountPercent ?? row?.discount_percent ?? 0)
  return (sourceSubtotal * discPct) / 100
}

export function getPaymentRequestTaxes(row: PaymentRequest | null | undefined): PaymentRequestTax[] {
  const taxes = row?.taxes
  if (!Array.isArray(taxes)) return []
  return taxes.map((t: any) => ({
    id: t.id,
    taxMasterId: t.taxMasterId ?? t.tax_master_id,
    taxRateId: t.taxRateId ?? t.tax_rate_id ?? null,
    taxCode: t.taxCode ?? t.tax_code ?? '',
    taxName: t.taxName ?? t.tax_name ?? '',
    taxType: t.taxType ?? t.tax_type ?? 'OUTPUT',
    calculationType: t.calculationType ?? t.calculation_type ?? 'PERCENTAGE',
    rate: Number(t.rate ?? 0),
    amount: Number(t.amount ?? 0),
    sortOrder: t.sortOrder ?? t.sort_order ?? 0,
  }))
}

export function getPaymentRequestTaxAmount(row: PaymentRequest | null | undefined) {
  const taxes = getPaymentRequestTaxes(row)
  if (row?.applyTax || row?.apply_tax || taxes.length) {
    if (taxes.length) {
      return taxes.reduce((sum, t) => sum + Number(t.amount || 0), 0)
    }
  }
  const stored = Number(row?.taxAmount ?? row?.tax_amount ?? 0)
  if (stored !== 0) return stored
  const sourceSubtotal = getPaymentRequestSourceSubtotal(row)
  const otherSubtotal = getPaymentRequestOtherSubtotal(row)
  const discPct = Number(row?.discountPercent ?? row?.discount_percent ?? 0)
  const taxPct = Number(row?.taxPercent ?? row?.tax_percent ?? 0)
  const dpp = Math.max(0, sourceSubtotal - (sourceSubtotal * discPct) / 100) + otherSubtotal
  return (dpp * taxPct) / 100
}

export function getPaymentRequestTotal(row: PaymentRequest | null | undefined) {
  const stored = Number(row?.totalAmount ?? 0)
  if (stored > 0) return stored
  const sourceSubtotal = getPaymentRequestSourceSubtotal(row)
  const otherSubtotal = getPaymentRequestOtherSubtotal(row)
  const discount = getPaymentRequestDiscountAmount(row)
  const tax = getPaymentRequestTaxAmount(row)
  return Math.max(0, sourceSubtotal - discount) + otherSubtotal + tax
}

export function getSourceTypeLabel(type?: string | null) {
  switch (type) {
    case 'purchase_order':
      return 'Purchase Order'
    case 'material_request':
      return 'Material Request Form'
    case 'arf':
      return 'Advanced Request Form'
    default:
      return type || '—'
  }
}

export const usePaymentRequestStore = defineStore('paymentRequest', {
  state: (): PaymentRequestState => ({
    paymentRequests: [],
    paymentRequest: null,
    loading: false,
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      status: null,
      priority: null,
      sourceType: null,
      departmentId: null,
    },
    form: {
      requestDate: todayIso(),
      sourceType: null,
      sourceId: null,
      sourceNumber: '',
      departmentId: null,
      vendorId: null,
      payeeName: '',
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      priority: 'normal',
      purpose: '',
      neededDate: '',
      dueDate: '',
      discountPercent: 0,
      taxPercent: 0,
      applyTax: false,
      taxMasterIds: [],
      currency: 'IDR',
      notes: '',
      paymentRequestItems: [],
      otherCharges: [],
    },
    isEditMode: false,
    validationErrors: [],
    statistics: {
      totalPaymentRequests: 0,
      approvedPaymentRequests: 0,
      draftPaymentRequests: 0,
      pendingPaymentRequests: 0,
      rejectedPaymentRequests: 0,
      completedPaymentRequests: 0,
      totalValue: 0,
    },
  }),

  getters: {
    formItemsSubtotal: (state) =>
      state.form.paymentRequestItems.reduce((s, d) => s + (Number(d.subtotal) || 0), 0),
    formOtherChargesSubtotal: (state) =>
      state.form.otherCharges.reduce((s, d) => s + (Number(d.subtotal) || 0), 0),
    formDiscountAmount: (state) => {
      const sourceSubtotal = state.form.paymentRequestItems.reduce(
        (s, d) => s + (Number(d.subtotal) || 0),
        0
      )
      return (sourceSubtotal * (Number(state.form.discountPercent) || 0)) / 100
    },
    formDpp(): number {
      return (
        Math.max(0, this.formItemsSubtotal - this.formDiscountAmount) + this.formOtherChargesSubtotal
      )
    },
    formTaxAmount(): number {
      if (this.form.applyTax) {
        return 0
      }
      return (this.formDpp * (Number(this.form.taxPercent) || 0)) / 100
    },
    formGrandTotal(): number {
      return this.formDpp + this.formTaxAmount
    },
  },

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: () => $api.paymentRequests(),
        show: (id: string) => $api.paymentRequestsShow(id),
        statistics: () => $api.paymentRequestsStatistics(),
        sources: () => $api.paymentRequestsSources(),
        loadSource: (type: string, id: string) => $api.paymentRequestsLoadSource(type, id),
        submit: (id: string) => $api.paymentRequestsSubmit(id),
        approve: (id: string) => $api.paymentRequestsApprove(id),
        reject: (id: string) => $api.paymentRequestsReject(id),
      }
    },

    resetForm() {
      this.isEditMode = false
      this.form = {
        requestDate: todayIso(),
        sourceType: null,
        sourceId: null,
        sourceNumber: '',
        departmentId: null,
        vendorId: null,
        payeeName: '',
        bankName: '',
        bankAccountNumber: '',
        bankAccountName: '',
        priority: 'normal',
        purpose: '',
        neededDate: '',
        dueDate: '',
        discountPercent: 0,
        taxPercent: 0,
        applyTax: false,
        taxMasterIds: [],
        currency: 'IDR',
        notes: '',
        paymentRequestItems: [],
        otherCharges: [],
      }
    },

    openModal(data: PaymentRequest) {
      this.isEditMode = true
      const allItems = data.paymentRequestItems || data.payment_request_items || []
      const { sourceItems, otherCharges } = partitionItemsFromApi(allItems)
      const taxes = getPaymentRequestTaxes(data)
      const applyTax = !!(data.applyTax ?? data.apply_tax) || taxes.length > 0
      this.form = {
        id: data.id,
        status: data.status,
        requestDate: String(data.requestDate || data.request_date || todayIso()).slice(0, 10),
        sourceType: (data.sourceType || data.source_type || null) as PaymentRequestSourceType | null,
        sourceId: data.sourceId || data.source_id || null,
        sourceNumber: data.sourceNumber || data.source_number || '',
        departmentId: data.departmentId ?? null,
        vendorId: data.vendorId ?? null,
        payeeName: data.payeeName || data.payee_name || '',
        bankName: data.bankName || data.bank_name || '',
        bankAccountNumber: data.bankAccountNumber || data.bank_account_number || '',
        bankAccountName: data.bankAccountName || data.bank_account_name || '',
        priority: data.priority || 'normal',
        purpose: data.purpose || '',
        neededDate: data.neededDate ? String(data.neededDate).slice(0, 10) : '',
        dueDate: data.dueDate || data.due_date ? String(data.dueDate || data.due_date).slice(0, 10) : '',
        discountPercent: Number(data.discountPercent ?? data.discount_percent ?? 0),
        taxPercent: applyTax ? 0 : Number(data.taxPercent ?? data.tax_percent ?? 0),
        applyTax,
        taxMasterIds: taxes.map((t) => t.taxMasterId).filter(Boolean),
        currency: data.currency || 'IDR',
        notes: data.notes || '',
        paymentRequestItems: sourceItems,
        otherCharges,
      }
    },

    addItem() {
      this.form.paymentRequestItems.push({
        description: '',
        qty: 1,
        unitAmount: 0,
        subtotal: 0,
        remarks: null,
        sortOrder: this.form.paymentRequestItems.length,
        itemType: 'source',
      })
    },

    removeItem(index: number) {
      this.form.paymentRequestItems.splice(index, 1)
    },

    updateItemAmount(index: number) {
      const item = this.form.paymentRequestItems[index]
      if (item) recalcItem(item)
    },

    addOtherCharge() {
      this.form.otherCharges.push({
        ...blankCharge(),
        sortOrder: this.form.otherCharges.length,
      })
    },

    removeOtherCharge(index: number) {
      this.form.otherCharges.splice(index, 1)
    },

    updateOtherChargeAmount(index: number) {
      const item = this.form.otherCharges[index]
      if (item) recalcItem(item)
    },

    async fetchPaymentRequests(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const api = this.apiEndpoints()
      try {
        const url = new URL(api.list())
        const sp = new URLSearchParams({
          page: String(Math.floor(this.params.first / this.params.rows) + 1),
          rows: String(this.params.rows),
          sortField: this.params.sortField || '',
          sortOrder: String(this.params.sortOrder ?? ''),
          draw: String(this.params.draw),
          search: this.params.search || '',
          includeItems: 'false',
        })
        if (this.params.status) sp.append('status', this.params.status)
        if (this.params.priority) sp.append('priority', this.params.priority)
        if (this.params.sourceType) sp.append('sourceType', this.params.sourceType)
        if (this.params.departmentId) sp.append('departmentId', String(this.params.departmentId))
        url.search = sp.toString()

        const res = await fetch(String(url), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Gagal mengambil data Payment Request')
        const json = await res.json()
        this.paymentRequests = json.data ?? []
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        this.error = e
        if (!suppressError) {
          toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Ambil semua PR sesuai filter aktif + items/taxes (untuk export CSV).
     * 1 request list + preload items & taxes di BE (anti N+1).
     */
    async fetchAllForExport(): Promise<PaymentRequest[]> {
      const api = this.apiEndpoints()
      const url = new URL(api.list())
      const sp = new URLSearchParams({
        page: '1',
        rows: '10000',
        sortField: this.params.sortField || 'created_at',
        sortOrder: String(this.params.sortOrder ?? '2'),
        search: this.params.search || '',
        includeItems: 'true',
        forExport: 'true',
      })
      if (this.params.status) sp.append('status', this.params.status)
      if (this.params.priority) sp.append('priority', this.params.priority)
      if (this.params.sourceType) sp.append('sourceType', this.params.sourceType)
      if (this.params.departmentId) sp.append('departmentId', String(this.params.departmentId))
      url.search = sp.toString()

      const res = await fetch(String(url), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Gagal mengambil data export (HTTP ${res.status})`)
      const json = await res.json()
      return (json.data ?? []) as PaymentRequest[]
    },

    async getPaymentRequestDetails(id: string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.show(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (res?.data) this.paymentRequest = res.data
        else if (res?.id) this.paymentRequest = res
      } finally {
        this.loading = false
      }
    },

    async fetchPaymentRequestForEdit(id: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const data = await apiFetch(api.show(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (data?.data) this.openModal(data.data)
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: 'Gagal memuat data untuk edit',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async searchSources(sourceType: PaymentRequestSourceType, search = '') {
      const api = this.apiEndpoints()
      const url = new URL(api.sources())
      url.searchParams.set('sourceType', sourceType)
      if (search) url.searchParams.set('search', search)
      const res = await apiFetch(String(url), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      return (res?.data ?? []) as PaymentRequestSourceOption[]
    },

    async loadSourceIntoForm(sourceType: PaymentRequestSourceType, sourceId: string) {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.loadSource(sourceType, sourceId), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        const data = res?.data ?? res
        if (!data) throw new Error('Sumber dokumen kosong')

        const discountPercent = Number(
          data.discountPercent ?? data.discount_percent ?? 0
        )
        const taxPercent = Number(data.taxPercent ?? data.tax_percent ?? 0)

        // Replace form slice agar reactive — otherCharges tidak dihapus saat muat sumber
        this.form = {
          ...this.form,
          sourceType,
          sourceId: String(data.sourceId ?? sourceId),
          sourceNumber: data.sourceNumber || data.source_number || '',
          departmentId: data.departmentId ?? data.department_id ?? this.form.departmentId,
          vendorId: data.vendorId ?? data.vendor_id ?? null,
          payeeName: data.payeeName || data.payee_name || this.form.payeeName || '',
          purpose: data.purpose || this.form.purpose || '',
          neededDate: data.neededDate
            ? String(data.neededDate).slice(0, 10)
            : this.form.neededDate,
          dueDate: data.dueDate || data.due_date
            ? String(data.dueDate || data.due_date).slice(0, 10)
            : this.form.dueDate,
          currency: data.currency || this.form.currency || 'IDR',
          discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
          taxPercent: Number.isFinite(taxPercent) ? taxPercent : 0,
          applyTax: false,
          taxMasterIds: [],
          paymentRequestItems: (data.items || []).map((it: any) => ({
            ...mapItemFromApi(it),
            itemType: 'source' as const,
          })),
          otherCharges: this.form.otherCharges || [],
        }
        if (!this.form.paymentRequestItems.length) this.addItem()

        const taxNote =
          this.form.taxPercent > 0 || this.form.discountPercent > 0
            ? ` (diskon ${this.form.discountPercent}%, pajak ${this.form.taxPercent}%)`
            : ''
        toast.success({
          title: 'Sumber dimuat',
          message: `Data dari ${data.sourceNumber || sourceType} berhasil diisi${taxNote}`,
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal memuat sumber dokumen',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      }
    },

    async savePaymentRequest(): Promise<string | false> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      if (!this.form.sourceType || !this.form.sourceId) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Sumber dokumen (PO / MRF / ARF) wajib dipilih',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      }

      const validItems = this.form.paymentRequestItems.filter(
        (d) => d.description?.trim() && (Number(d.qty) || 0) > 0
      )
      const validOtherCharges = (this.form.otherCharges || []).filter(
        (d) => d.description?.trim() && (Number(d.qty) || 0) > 0
      )
      if (!validItems.length) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Minimal 1 item sumber dengan deskripsi dan qty valid',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      }

      if (this.form.applyTax && !(this.form.taxMasterIds || []).length) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Pilih minimal 1 Tax Master jika pajak diaktifkan',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      }

      const mergedItems = [
        ...validItems.map((d, idx) => ({
          description: d.description.trim(),
          qty: Number(d.qty) || 1,
          unitAmount: Number(d.unitAmount) || 0,
          subtotal: Number(d.subtotal) || 0,
          remarks: d.remarks?.trim() || null,
          sortOrder: d.sortOrder ?? idx,
          itemType: 'source' as const,
        })),
        ...validOtherCharges.map((d, idx) => ({
          description: d.description.trim(),
          qty: Number(d.qty) || 1,
          unitAmount: Number(d.unitAmount) || 0,
          subtotal: Number(d.subtotal) || 0,
          remarks: d.remarks?.trim() || null,
          sortOrder: d.sortOrder ?? idx,
          itemType: 'other' as const,
        })),
      ]

      const body: Record<string, any> = {
        requestDate: this.form.requestDate || todayIso(),
        sourceType: this.form.sourceType,
        sourceId: this.form.sourceId,
        departmentId: this.form.departmentId,
        vendorId: this.form.vendorId,
        payeeName: this.form.payeeName?.trim() || null,
        bankName: this.form.bankName?.trim() || null,
        bankAccountNumber: this.form.bankAccountNumber?.trim() || null,
        bankAccountName: this.form.bankAccountName?.trim() || null,
        priority: this.form.priority || 'normal',
        purpose: this.form.purpose?.trim() || null,
        neededDate: this.form.neededDate || null,
        dueDate: this.form.dueDate || null,
        discountPercent: Number(this.form.discountPercent) || 0,
        taxPercent: this.form.applyTax ? 0 : Number(this.form.taxPercent) || 0,
        applyTax: !!this.form.applyTax,
        taxMasterIds: this.form.applyTax ? this.form.taxMasterIds || [] : [],
        currency: this.form.currency || 'IDR',
        notes: this.form.notes?.trim() || null,
        createdBy: this.isEditMode ? undefined : (userStore.user?.id ?? null),
        paymentRequestItems: mergedItems,
      }

      const isEdit = this.isEditMode && this.form.id
      const url = isEdit ? `${api.list()}/${this.form.id}` : api.list()
      const method = isEdit ? 'PUT' : 'POST'

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const ed = await res.json().catch(() => ({}))
          toast.error({
            title: 'Error',
            message: ed.message || 'Gagal menyimpan',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
          return false
        }
        const json = await res.json()
        const savedId = json?.data?.id || this.form.id
        await this.fetchPaymentRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: `Payment Request berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return savedId
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.saving = false
      }
    },

    async deletePaymentRequest(id: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const ok = await Swal.fire({
        title: 'Yakin?',
        text: 'Data akan dihapus (soft delete).',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus',
      })
      if (!ok.isConfirmed) {
        this.loading = false
        return
      }
      try {
        const res = await fetch(`${api.list()}/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        await this.fetchPaymentRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Payment Request dihapus',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async approvePaymentRequest(id: string, remarks?: string, options?: { refreshList?: boolean }) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const refreshList = options?.refreshList !== false
      try {
        const res = await fetch(api.approve(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        if (refreshList) await this.fetchPaymentRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Berhasil diapprove',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectPaymentRequest(id: string, reason: string, options?: { refreshList?: boolean }) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const refreshList = options?.refreshList !== false
      try {
        const res = await fetch(api.reject(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rejection_reason: reason }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        if (refreshList) await this.fetchPaymentRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Payment Request ditolak',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitPaymentRequest(id: string, options?: { refreshList?: boolean }) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const refreshList = options?.refreshList !== false
      try {
        const res = await fetch(api.submit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        if (refreshList) await this.fetchPaymentRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Payment Request diajukan ke Direktur Utama',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics() {
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.statistics(), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) return
        const json = await res.json()
        if (json?.data) this.statistics = { ...this.statistics, ...json.data }
      } catch {
        /* ignore */
      }
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchPaymentRequests()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchPaymentRequests()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchPaymentRequests()
    },

    setFilters(f: {
      status?: string | null
      priority?: string | null
      sourceType?: PaymentRequestSourceType | null
      departmentId?: number | null
      search?: string
    }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.priority !== undefined) this.params.priority = f.priority
      if (f.sourceType !== undefined) this.params.sourceType = f.sourceType
      if (f.departmentId !== undefined) this.params.departmentId = f.departmentId
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchPaymentRequests()
    },
  },
})
