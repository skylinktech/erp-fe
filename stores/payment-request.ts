import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export type PaymentRequestSourceType = 'purchase_order' | 'material_request' | 'arf'

export type PaymentRequestRequestType = 'project' | 'operational' | 'reimbursement'

export type PaymentRequestPaymentMethod = 'advance' | 'reimbursement'

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

export interface PaymentRequestEmployeeForm {
  employeeId: number | null
  /** Nominal gaji harian (Rp / hari) */
  salaryAmount?: number
  notes?: string | null
  sortOrder?: number
}

export interface ActiveServiceInstanceOption {
  id: string
  label: string
  serviceNumber?: string
  serviceName?: string | null
  customerId?: number | null
  customerName?: string | null
  locationName?: string | null
  status?: string
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
  requestType?: PaymentRequestRequestType
  request_type?: PaymentRequestRequestType
  paymentMethod?: PaymentRequestPaymentMethod | null
  payment_method?: PaymentRequestPaymentMethod | null
  projectId?: string | null
  project_id?: string | null
  serviceInstanceId?: string | null
  service_instance_id?: string | null
  customerId?: number | null
  customer_id?: number | null
  employeeId?: number | null
  employee_id?: number | null
  employees?: Array<{
    employeeId?: number
    employee_id?: number
    salaryAmount?: number
    salary_amount?: number
    notes?: string | null
    employee?: { id_pegawai?: number; nm_pegawai?: string; nmPegawai?: string }
    nm_pegawai?: string
    nmPegawai?: string
  }>
  paymentRequestEmployees?: Array<{
    employeeId?: number
    employee_id?: number
    salaryAmount?: number
    salary_amount?: number
    notes?: string | null
    employee?: { id_pegawai?: number; nm_pegawai?: string; nmPegawai?: string }
  }>
  estimatedStartDate?: string | null
  estimated_start_date?: string | null
  estimatedEndDate?: string | null
  estimated_end_date?: string | null
  estimatedDurationDays?: number | null
  estimated_duration_days?: number | null
  settlementStatus?: string | null
  settlement_status?: string | null
  requestDate?: string
  request_date?: string
  serviceInstance?: {
    id: string
    serviceNumber?: string
    service_number?: string
    serviceName?: string | null
    service_name?: string | null
    locationName?: string | null
    location_name?: string | null
    status?: string
    customer?: { id: number; name?: string; code?: string }
  } | null
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
  settlements?: any[]
  project?: { id: string; projectCode?: string; project_code?: string; name?: string }
  customer?: { id: number; name?: string }
  employee?: { id_pegawai?: number; nm_pegawai?: string }
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
    requestType?: PaymentRequestRequestType | null
    departmentId?: number | null
  }
  form: {
    id?: string | null
    status?: string
    requestType: PaymentRequestRequestType
    paymentMethod: PaymentRequestPaymentMethod | null
    serviceInstanceId: string | null
    customerId: number | null
    estimatedStartDate: string
    estimatedEndDate: string
    estimatedDurationDays: number | null
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
    attachment: File | string | null
    attachmentPreview: string | null
    paymentRequestItems: PaymentRequestItemForm[]
    otherCharges: PaymentRequestItemForm[]
    employees: PaymentRequestEmployeeForm[]
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

/** Inclusive days (e.g. 3–5 Aug = 3 hari). */
export function calcEstimatedDurationDays(
  start?: string | null,
  end?: string | null
): number | null {
  if (!start || !end) return null
  const s = new Date(`${start}T00:00:00`)
  const e = new Date(`${end}T00:00:00`)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null
  const days = Math.floor((e.getTime() - s.getTime()) / 86400000) + 1
  return days >= 1 ? days : null
}

export function formatDurationDaysLabel(days?: number | null) {
  if (days == null || !Number.isFinite(days) || days < 1) return '—'
  return `${days} Hari`
}

function mapEmployeesFromApi(data: PaymentRequest | any): PaymentRequestEmployeeForm[] {
  const rows = data?.employees || []
  if (Array.isArray(rows) && rows.length) {
    return rows.map((e: any, idx: number) => ({
      employeeId: Number(e.employeeId ?? e.employee_id ?? e.employee?.id_pegawai) || null,
      salaryAmount: Number(e.salaryAmount ?? e.salary_amount ?? 0) || 0,
      notes: e.notes ?? null,
      sortOrder: e.sortOrder ?? e.sort_order ?? idx,
    }))
  }
  const legacyId = data?.employeeId ?? data?.employee_id
  if (legacyId) {
    return [{ employeeId: Number(legacyId), salaryAmount: 0, notes: null, sortOrder: 0 }]
  }
  return []
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

export function getPaymentRequestEmployeeSalarySubtotal(row: PaymentRequest | null | undefined) {
  const rows = row?.employees || row?.paymentRequestEmployees || []
  if (!Array.isArray(rows) || !rows.length) return 0
  return rows.reduce((s, e: any) => s + (Number(e.salaryAmount ?? e.salary_amount ?? 0) || 0), 0)
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
  const salarySubtotal = getPaymentRequestEmployeeSalarySubtotal(row)
  const discPct = Number(row?.discountPercent ?? row?.discount_percent ?? 0)
  const taxPct = Number(row?.taxPercent ?? row?.tax_percent ?? 0)
  const dpp =
    Math.max(0, sourceSubtotal - (sourceSubtotal * discPct) / 100) + otherSubtotal + salarySubtotal
  return (dpp * taxPct) / 100
}

export function getPaymentRequestTotal(row: PaymentRequest | null | undefined) {
  const stored = Number(row?.totalAmount ?? 0)
  if (stored > 0) return stored
  const sourceSubtotal = getPaymentRequestSourceSubtotal(row)
  const otherSubtotal = getPaymentRequestOtherSubtotal(row)
  const salarySubtotal = getPaymentRequestEmployeeSalarySubtotal(row)
  const discount = getPaymentRequestDiscountAmount(row)
  const tax = getPaymentRequestTaxAmount(row)
  return Math.max(0, sourceSubtotal - discount) + otherSubtotal + salarySubtotal + tax
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

export function getRequestTypeLabel(type?: string | null) {
  switch (type) {
    case 'operational':
      return 'Operational Request'
    case 'reimbursement':
      return 'Reimbursement'
    case 'project':
    default:
      return 'Project Request'
  }
}

export function getPaymentMethodLabel(method?: string | null) {
  switch (method) {
    case 'advance':
      return 'Advance'
    case 'reimbursement':
      return 'Reimbursement'
    default:
      return method || '—'
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
      requestType: 'project',
      departmentId: null,
    },
    form: {
      requestType: 'project',
      paymentMethod: null,
      serviceInstanceId: null,
      customerId: null,
      estimatedStartDate: '',
      estimatedEndDate: '',
      estimatedDurationDays: null,
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
      attachment: null,
      attachmentPreview: null,
      paymentRequestItems: [],
      otherCharges: [],
      employees: [],
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
    formEmployeeSalarySubtotal: (state) =>
      (state.form.employees || []).reduce((s, e) => {
        if (e.employeeId == null || !(Number(e.employeeId) > 0)) return s
        return s + (Number(e.salaryAmount) || 0)
      }, 0),
    formDiscountAmount: (state) => {
      const sourceSubtotal = state.form.paymentRequestItems.reduce(
        (s, d) => s + (Number(d.subtotal) || 0),
        0
      )
      return (sourceSubtotal * (Number(state.form.discountPercent) || 0)) / 100
    },
    formDpp(): number {
      return (
        Math.max(0, this.formItemsSubtotal - this.formDiscountAmount) +
        this.formOtherChargesSubtotal +
        this.formEmployeeSalarySubtotal
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
        settlements: (id: string) => $api.paymentRequestsSettlements(id),
        settlementSubmit: (id: string, settlementId: string) =>
          $api.paymentRequestsSettlementSubmit(id, settlementId),
        settlementApprove: (id: string, settlementId: string) =>
          $api.paymentRequestsSettlementApprove(id, settlementId),
        settlementReject: (id: string, settlementId: string) =>
          $api.paymentRequestsSettlementReject(id, settlementId),
        settlementSettle: (id: string, settlementId: string) =>
          $api.paymentRequestsSettlementSettle(id, settlementId),
      }
    },

    resetForm(requestType: PaymentRequestRequestType = 'project') {
      this.isEditMode = false
      this.form = {
        requestType,
        paymentMethod:
          requestType === 'reimbursement'
            ? 'reimbursement'
            : requestType === 'operational'
              ? 'advance'
              : null,
        serviceInstanceId: null,
        customerId: null,
        estimatedStartDate: '',
        estimatedEndDate: '',
        estimatedDurationDays: null,
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
        attachment: null,
        attachmentPreview: null,
        paymentRequestItems: [],
        otherCharges: [],
        employees: [],
      }
    },

    openModal(data: PaymentRequest) {
      this.isEditMode = true
      const allItems = data.paymentRequestItems || data.payment_request_items || []
      const { sourceItems, otherCharges } = partitionItemsFromApi(allItems)
      const taxes = getPaymentRequestTaxes(data)
      const applyTax = !!(data.applyTax ?? data.apply_tax) || taxes.length > 0
      const requestType = (data.requestType || data.request_type || 'project') as PaymentRequestRequestType
      const estimatedStartDate = data.estimatedStartDate || data.estimated_start_date
        ? String(data.estimatedStartDate || data.estimated_start_date).slice(0, 10)
        : ''
      const estimatedEndDate = data.estimatedEndDate || data.estimated_end_date
        ? String(data.estimatedEndDate || data.estimated_end_date).slice(0, 10)
        : ''
      this.form = {
        id: data.id,
        status: data.status,
        requestType,
        paymentMethod: (data.paymentMethod || data.payment_method || null) as PaymentRequestPaymentMethod | null,
        serviceInstanceId: data.serviceInstanceId || data.service_instance_id || null,
        customerId: data.customerId ?? data.customer_id ?? null,
        estimatedStartDate,
        estimatedEndDate,
        estimatedDurationDays:
          data.estimatedDurationDays ??
          data.estimated_duration_days ??
          calcEstimatedDurationDays(estimatedStartDate, estimatedEndDate),
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
        attachment: data.attachment || null,
        attachmentPreview: data.attachment || null,
        paymentRequestItems: sourceItems.length ? sourceItems : otherCharges.length ? otherCharges.map((c) => ({ ...c, itemType: 'source' as const })) : [],
        otherCharges: sourceItems.length ? otherCharges : [],
        employees: mapEmployeesFromApi(data),
      }
    },

    addEmployee() {
      if (!Array.isArray(this.form.employees)) this.form.employees = []
      this.form.employees.push({
        employeeId: null,
        salaryAmount: 0,
        notes: null,
        sortOrder: this.form.employees.length,
      })
    },

    removeEmployee(index: number) {
      if (!Array.isArray(this.form.employees)) return
      this.form.employees.splice(index, 1)
    },

    syncEstimatedDuration() {
      this.form.estimatedDurationDays = calcEstimatedDurationDays(
        this.form.estimatedStartDate,
        this.form.estimatedEndDate
      )
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
        if (this.params.requestType) sp.append('requestType', this.params.requestType)
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
          toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
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
      if (this.params.requestType) sp.append('requestType', this.params.requestType)
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
          position: 'bottomRight',
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
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal memuat sumber dokumen',
          color: 'red',
          position: 'bottomRight',
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
      const requestType = this.form.requestType || 'project'
      const isProject = requestType === 'project'

      if (isProject && (!this.form.sourceType || !this.form.sourceId)) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Sumber dokumen (PO / MRF / ARF) wajib dipilih',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }

      if (requestType === 'operational' && !this.form.paymentMethod) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Pilih metode: Advance atau Reimbursement',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }

      const start = this.form.estimatedStartDate || ''
      const end = this.form.estimatedEndDate || ''
      if ((start && !end) || (!start && end)) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Estimasi durasi wajib diisi lengkap (tanggal mulai dan selesai)',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }
      const durationDays = calcEstimatedDurationDays(start, end)
      if (start && end && !durationDays) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Tanggal selesai harus sama atau setelah tanggal mulai',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }
      this.form.estimatedDurationDays = durationDays

      const validEmployees = (this.form.employees || []).filter(
        (e) => e.employeeId != null && Number(e.employeeId) > 0
      )

      const validItems = this.form.paymentRequestItems.filter(
        (d) => d.description?.trim() && (Number(d.qty) || 0) > 0
      )
      const validOtherCharges = (this.form.otherCharges || []).filter(
        (d) => d.description?.trim() && (Number(d.qty) || 0) > 0
      )

      if (this.form.applyTax && !(this.form.taxMasterIds || []).length) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Pilih minimal 1 Tax Master jika pajak diaktifkan',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }

      // Item & pegawai opsional — baris kosong diabaikan
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
        requestType,
        paymentMethod:
          requestType === 'reimbursement'
            ? 'reimbursement'
            : this.form.paymentMethod,
        serviceInstanceId: this.form.serviceInstanceId || null,
        customerId: this.form.customerId,
        employees: validEmployees.map((e, idx) => ({
          employeeId: Number(e.employeeId),
          salaryAmount: Number(e.salaryAmount) || 0,
          notes: e.notes?.trim() || null,
          sortOrder: e.sortOrder ?? idx,
        })),
        estimatedStartDate: start || null,
        estimatedEndDate: end || null,
        requestDate: this.form.requestDate || todayIso(),
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

      if (isProject) {
        body.sourceType = this.form.sourceType
        body.sourceId = this.form.sourceId
      }

      const isEdit = this.isEditMode && this.form.id
      const url = isEdit ? `${api.list()}/${this.form.id}` : api.list()
      const method = isEdit ? 'PUT' : 'POST'
      const hasFile = this.form.attachment instanceof File

      try {
        let savedId: string | undefined
        if (hasFile) {
          const formData = new FormData()
          Object.keys(body).forEach((key) => {
            const value = body[key]
            if (value === undefined) return
            if (value === null) {
              formData.append(key, '')
              return
            }
            if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value))
              return
            }
            if (typeof value === 'boolean') {
              formData.append(key, value ? 'true' : 'false')
              return
            }
            formData.append(key, String(value))
          })
          formData.append('attachment', this.form.attachment as File)

          const json = await apiFetch(url, { method, body: formData })
          savedId = json?.data?.id || this.form.id
        } else {
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
              position: 'bottomRight',
              layout: 2,
            })
            return false
          }
          const json = await res.json()
          savedId = json?.data?.id || this.form.id
        }

        await this.fetchPaymentRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: `Payment Request berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return savedId
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e?.data?.message || e.message || 'Gagal menyimpan',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
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
          position: 'bottomRight',
          layout: 2,
        })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
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
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
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
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
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
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics() {
      const api = this.apiEndpoints()
      try {
        const url = new URL(api.statistics())
        if (this.params.requestType) {
          url.searchParams.set('requestType', this.params.requestType)
        }
        const res = await fetch(String(url), {
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

    setRequestType(type: PaymentRequestRequestType) {
      this.params.requestType = type
      this.params.first = 0
      this.fetchPaymentRequests()
      this.fetchStatistics()
    },

    setFilters(f: {
      status?: string | null
      priority?: string | null
      sourceType?: PaymentRequestSourceType | null
      requestType?: PaymentRequestRequestType | null
      departmentId?: number | null
      search?: string
    }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.priority !== undefined) this.params.priority = f.priority
      if (f.sourceType !== undefined) this.params.sourceType = f.sourceType
      if (f.requestType !== undefined) this.params.requestType = f.requestType
      if (f.departmentId !== undefined) this.params.departmentId = f.departmentId
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchPaymentRequests()
    },

    async createSettlement(paymentRequestId: string, payload: {
      notes?: string | null
      returnedAmount?: number
      items: Array<{
        category?: string | null
        description: string
        amount: number
        receiptAttachment?: string | null
        expenseDate?: string | null
      }>
    }) {
      const api = this.apiEndpoints()
      const res = await fetch(api.settlements(paymentRequestId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Gagal membuat settlement')
      return json.data
    },

    async submitSettlement(paymentRequestId: string, settlementId: string) {
      const api = this.apiEndpoints()
      const res = await fetch(api.settlementSubmit(paymentRequestId, settlementId), {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Gagal submit settlement')
      return json.data
    },

    async approveSettlement(paymentRequestId: string, settlementId: string) {
      const api = this.apiEndpoints()
      const res = await fetch(api.settlementApprove(paymentRequestId, settlementId), {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Gagal approve settlement')
      return json.data
    },

    async rejectSettlement(paymentRequestId: string, settlementId: string, reason: string) {
      const api = this.apiEndpoints()
      const res = await fetch(api.settlementReject(paymentRequestId, settlementId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rejection_reason: reason }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Gagal reject settlement')
      return json.data
    },

    async settleSettlement(
      paymentRequestId: string,
      settlementId: string,
      returnedAmount?: number
    ) {
      const api = this.apiEndpoints()
      const res = await fetch(api.settlementSettle(paymentRequestId, settlementId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ returnedAmount }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Gagal settle')
      return json.data
    },
  },
})
