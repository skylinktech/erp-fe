import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export interface PurchaseRequestItemForm {
  productType: 'product' | 'service'
  productName: string
  specification?: string | null
  productId?: number | null
  warehouseId?: number | null
  qty: number
  uomId?: number | null
  estimatedPrice: number
  subtotal: number
  neededDate?: string | null
  remarks?: string | null
  product?: { id: number; name: string; sku?: string; priceSell?: number; unitId?: number }
  warehouse?: { id: number; name: string; code?: string }
  uom?: { id: number; name: string; symbol?: string }
}

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface PurchaseRequest {
  id: number
  prNumber?: string
  pr_number?: string
  noPurchaseRequest?: string
  requestDate?: string
  request_date?: string
  requestedBy?: number | null
  departmentId?: number | null
  budgetId?: number | null
  warehouseId?: number | null
  priority?: string
  status: string
  purpose?: string | null
  neededDate?: string | null
  approvalStatus?: string | null
  rejectionReason?: string | null
  rejectReason?: string | null
  totalAmount?: number
  grandTotal?: number
  currency?: string
  notes?: string | null
  attachment?: string | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
  purchaseRequestItems?: PurchaseRequestItemForm[]
  purchase_request_items?: PurchaseRequestItemForm[]
  purchaseRequestDetails?: PurchaseRequestItemForm[]
  requestedByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  department?: { id: number; nm_departemen?: string; nmDepartemen?: string }
  budget?: { id: number; budgetCode?: string; budget_code?: string; budgetName?: string; budget_name?: string }
  warehouse?: { id: number; name: string; code?: string }
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  signatureProgress?: { count: number; required: number }
  nextApprovalStep?: number | null
}

interface PurchaseRequestState {
  purchaseRequests: PurchaseRequest[]
  purchaseRequest: PurchaseRequest | null
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
    departmentId?: number | null
  }
  form: {
    id?: number | null
    status?: string
    requestDate: string
    departmentId: number | null
    budgetId: number | null
    warehouseId: number | null
    priority: string
    purpose: string
    neededDate: string
    currency: string
    notes: string
    purchaseRequestItems: PurchaseRequestItemForm[]
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    totalPurchaseRequests: number
    approvedPurchaseRequests: number
    draftPurchaseRequests: number
    pendingPurchaseRequests: number
    rejectedPurchaseRequests: number
    completedPurchaseRequests: number
    totalValue: number
  }
}

function recalcItem(d: PurchaseRequestItemForm) {
  const qty = Number(d.qty) || 0
  const estimatedPrice = Number(d.estimatedPrice) || 0
  d.subtotal = qty * estimatedPrice
}

function mapItemFromApi(d: any): PurchaseRequestItemForm {
  const qty = Number(d.qty ?? d.quantity) || 1
  const estimatedPrice = Number(d.estimatedPrice ?? d.estimated_price ?? d.unitPrice ?? d.unit_price ?? 0)
  return {
    productType: d.productType ?? d.product_type ?? 'product',
    productName: d.productName ?? d.product_name ?? d.product?.name ?? '',
    specification: d.specification ?? null,
    productId: d.productId ?? d.product_id ?? d.product?.id ?? null,
    warehouseId: d.warehouseId ?? d.warehouse_id ?? d.warehouse?.id ?? null,
    qty,
    uomId: d.uomId ?? d.uom_id ?? d.uom?.id ?? null,
    estimatedPrice,
    subtotal: Number(d.subtotal) || qty * estimatedPrice,
    neededDate: d.neededDate ?? d.needed_date ?? null,
    remarks: d.remarks ?? d.notes ?? null,
    product: d.product,
    warehouse: d.warehouse,
    uom: d.uom,
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export const usePurchaseRequestStore = defineStore('purchaseRequest', {
  state: (): PurchaseRequestState => ({
    purchaseRequests: [],
    purchaseRequest: null,
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
      departmentId: null,
    },
    form: {
      requestDate: todayIso(),
      departmentId: null,
      budgetId: null,
      warehouseId: null,
      priority: 'normal',
      purpose: '',
      neededDate: '',
      currency: 'IDR',
      notes: '',
      purchaseRequestItems: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    statistics: {
      totalPurchaseRequests: 0,
      approvedPurchaseRequests: 0,
      draftPurchaseRequests: 0,
      pendingPurchaseRequests: 0,
      rejectedPurchaseRequests: 0,
      completedPurchaseRequests: 0,
      totalValue: 0,
    },
  }),

  getters: {
    formGrandTotal: (state) =>
      state.form.purchaseRequestItems.reduce((s, d) => s + (Number(d.subtotal) || 0), 0),
  },

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: () => $api.purchaseRequest(),
        details: (id: number | string) => $api.getPurchaseRequestDetails(id),
        statistics: () => $api.purchaseRequestStatistics(),
        approve: (id: number | string) => $api.approvePurchaseRequest(id),
        reject: (id: number | string) => $api.rejectPurchaseRequest(id),
        submit: (id: number | string) => $api.submitPurchaseRequest(id),
      }
    },

    async fetchPurchaseRequests(suppressError = false) {
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
          includeItems: 'true',
        })
        if (this.params.status) sp.append('status', this.params.status)
        if (this.params.priority) sp.append('priority', this.params.priority)
        if (this.params.departmentId) sp.append('departmentId', String(this.params.departmentId))
        url.search = sp.toString()

        const res = await fetch(String(url), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil data Purchase Request')
        const json = await res.json()
        this.purchaseRequests = json.data ?? []
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

    async getPurchaseRequestDetails(id: number | string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.details(id), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (res?.data) this.purchaseRequest = res.data
        else if (res?.id) this.purchaseRequest = res
      } finally {
        this.loading = false
      }
    },

    async fetchPurchaseRequestForEdit(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const data = await apiFetch(api.details(id), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.openModal(data.data)
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        toast.error({ title: 'Error', message: 'Gagal memuat data untuk edit', color: 'red', position: 'bottomRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async savePurchaseRequest(): Promise<boolean> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      const validItems = this.form.purchaseRequestItems.filter(
        (d) => d.productName?.trim() && (Number(d.qty) || 0) > 0
      )
      if (!validItems.length) {
        this.saving = false
        toast.error({ title: 'Validasi', message: 'Minimal 1 item dengan nama barang dan qty valid', color: 'red', position: 'bottomRight', layout: 2 })
        return false
      }

      const body: Record<string, any> = {
        requestDate: this.form.requestDate || todayIso(),
        departmentId: this.form.departmentId,
        budgetId: this.form.budgetId,
        warehouseId: this.form.warehouseId,
        priority: this.form.priority || 'normal',
        purpose: this.form.purpose?.trim() || null,
        neededDate: this.form.neededDate || null,
        currency: this.form.currency || 'IDR',
        notes: this.form.notes?.trim() || null,
        createdBy: this.isEditMode ? undefined : (userStore.user?.id ?? null),
        purchaseRequestItems: validItems.map((d) => ({
          productType: d.productType || 'product',
          productName: d.productName.trim(),
          specification: d.specification?.trim() || null,
          productId: d.productId,
          warehouseId: d.warehouseId,
          qty: Number(d.qty) || 1,
          uomId: d.uomId,
          estimatedPrice: Number(d.estimatedPrice) || 0,
          subtotal: Number(d.subtotal) || 0,
          neededDate: d.neededDate || null,
          remarks: d.remarks?.trim() || null,
        })),
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
          toast.error({ title: 'Error', message: ed.message || 'Gagal menyimpan', color: 'red', position: 'bottomRight', layout: 2 })
          return false
        }
        this.closeModal()
        await this.fetchPurchaseRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: `Purchase Request berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`, color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
        return false
      } finally {
        this.saving = false
      }
    },

    async deletePurchaseRequest(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const ok = await Swal.fire({ title: 'Yakin?', text: 'Data akan dihapus (soft delete).', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, hapus' })
      if (!ok.isConfirmed) { this.loading = false; return }
      try {
        const res = await fetch(`${api.list()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        await this.fetchPurchaseRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Purchase Request dihapus', color: 'green', position: 'bottomRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async approvePurchaseRequest(id: number | string, remarks?: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.approve(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include', body: JSON.stringify({ remarks }) })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        await this.fetchPurchaseRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Berhasil diapprove', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectPurchaseRequest(id: number | string, reason?: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.reject(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include', body: JSON.stringify({ rejection_reason: reason, reject_reason: reason }) })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        await this.fetchPurchaseRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Berhasil direject', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitPurchaseRequest(id: number | string) {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.submit(id), { method: 'PATCH', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        await this.fetchPurchaseRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Berhasil di-submit', color: 'green', position: 'bottomRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'bottomRight', layout: 2 })
        return false
      }
    },

    openModal(data: PurchaseRequest | null = null) {
      this.loading = false
      this.saving = false
      this.isEditMode = !!data
      if (data) {
        const raw = data as any
        const items = raw.purchaseRequestItems ?? raw.purchase_request_items ?? raw.purchaseRequestDetails ?? []
        this.form = {
          id: raw.id,
          status: raw.status ?? 'draft',
          requestDate: (raw.requestDate ?? raw.request_date ?? todayIso()).toString().slice(0, 10),
          departmentId: raw.departmentId ?? raw.department_id ?? null,
          budgetId: raw.budgetId ?? raw.budget_id ?? null,
          warehouseId: raw.warehouseId ?? raw.warehouse_id ?? null,
          priority: raw.priority ?? 'normal',
          purpose: raw.purpose ?? raw.description ?? '',
          neededDate: (raw.neededDate ?? raw.needed_date ?? '')?.toString?.()?.slice(0, 10) ?? '',
          currency: raw.currency ?? 'IDR',
          notes: raw.notes ?? '',
          purchaseRequestItems: items.map(mapItemFromApi),
        }
      } else {
        this.form = {
          status: 'draft',
          requestDate: todayIso(),
          departmentId: null,
          budgetId: null,
          warehouseId: null,
          priority: 'normal',
          purpose: '',
          neededDate: '',
          currency: 'IDR',
          notes: '',
          purchaseRequestItems: [],
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.saving = false
      this.loading = false
      this.form = {
        status: 'draft',
        requestDate: todayIso(),
        departmentId: null,
        budgetId: null,
        warehouseId: null,
        priority: 'normal',
        purpose: '',
        neededDate: '',
        currency: 'IDR',
        notes: '',
        purchaseRequestItems: [],
      }
    },

    addItem() {
      this.form.purchaseRequestItems.push({
        productType: 'product',
        productName: '',
        productId: null,
        warehouseId: this.form.warehouseId,
        qty: 1,
        uomId: null,
        estimatedPrice: 0,
        subtotal: 0,
        remarks: '',
      })
    },

    removeDetail(index: number) {
      this.form.purchaseRequestItems.splice(index, 1)
    },

    onProductChange(index: number, product: any) {
      const row = this.form.purchaseRequestItems[index]
      if (!row) return
      row.product = product
      row.productId = product?.id ?? null
      row.productName = product?.name ?? row.productName
      row.productType = 'product'
      row.uomId = product?.unitId ?? product?.unit_id ?? row.uomId
      const price = Number(product?.priceSell ?? product?.price_sell ?? product?.price ?? 0)
      if (price > 0) row.estimatedPrice = price
      recalcItem(row)
    },

    onQtyOrPriceChange(index: number) {
      const row = this.form.purchaseRequestItems[index]
      if (row) recalcItem(row)
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchPurchaseRequests()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchPurchaseRequests()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchPurchaseRequests()
    },

    setFilters(f: { status?: string | null; priority?: string | null; departmentId?: number | null; search?: string }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.priority !== undefined) this.params.priority = f.priority
      if (f.departmentId !== undefined) this.params.departmentId = f.departmentId
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchPurchaseRequests()
    },

    async fetchStatistics() {
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.statistics(), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) return
        const json = await res.json()
        const d = json.data ?? {}
        this.statistics = {
          totalPurchaseRequests: d.totalPurchaseRequests ?? 0,
          approvedPurchaseRequests: d.approvedPurchaseRequests ?? 0,
          draftPurchaseRequests: d.draftPurchaseRequests ?? 0,
          pendingPurchaseRequests: d.pendingPurchaseRequests ?? 0,
          rejectedPurchaseRequests: d.rejectedPurchaseRequests ?? 0,
          completedPurchaseRequests: d.completedPurchaseRequests ?? 0,
          totalValue: d.totalValue ?? 0,
        }
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export function getPurchaseRequestNo(pr: PurchaseRequest | null | undefined): string {
  if (!pr) return ''
  return pr.prNumber ?? pr.pr_number ?? pr.noPurchaseRequest ?? pr.no_purchase_request ?? ''
}

export function getPurchaseRequestTotal(pr: PurchaseRequest | null | undefined): number {
  if (!pr) return 0
  return Number(pr.totalAmount ?? pr.grandTotal ?? 0)
}

export function getPurchaseRequestItemsList(pr: PurchaseRequest | null | undefined): PurchaseRequestItemForm[] {
  if (!pr) return []
  return (
    pr.purchaseRequestItems ??
    pr.purchase_request_items ??
    pr.purchaseRequestDetails ??
    []
  )
}

/** @deprecated use getPurchaseRequestItemsList */
export function getPurchaseRequestDetailsList(pr: PurchaseRequest | null | undefined): PurchaseRequestItemForm[] {
  return getPurchaseRequestItemsList(pr)
}
