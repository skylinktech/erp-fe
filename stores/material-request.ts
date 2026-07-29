import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export interface MaterialRequestItemForm {
  siteInvestMaterialId?: string | null
  productName: string
  specification?: string | null
  productId?: number | null
  qty: number
  uomId?: number | null
  estimatedPrice: number
  subtotal: number
  remarks?: string | null
  sortOrder?: number
  product?: { id: number; name: string; sku?: string; priceSell?: number; unitId?: number }
  uom?: { id: number; name: string; symbol?: string }
}

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface MaterialRequest {
  id: string
  mrfNumber?: string
  mrf_number?: string
  requestDate?: string
  request_date?: string
  siteInvestmentId?: string
  site_investment_id?: string
  customerId?: number | null
  siteId?: number | null
  projectName?: string | null
  project_name?: string | null
  requestedBy?: number | null
  departmentId?: number | null
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
  materialRequestItems?: MaterialRequestItemForm[]
  material_request_items?: MaterialRequestItemForm[]
  requestedByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  department?: { id: number; nm_departemen?: string; nmDepartemen?: string }
  siteInvestment?: {
    id: string
    siNumber?: string
    si_number?: string
    name?: string
    customer?: { id: number; name: string; kodeCustomer?: string }
    site?: { id: number; name: string }
  }
  customer?: { id: number; name: string; kodeCustomer?: string }
  site?: { id: number; name: string }
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  signatureProgress?: { count: number; required: number }
  nextApprovalStep?: number | null
}

interface MaterialRequestState {
  materialRequests: MaterialRequest[]
  materialRequest: MaterialRequest | null
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
    siteInvestmentId?: string | null
  }
  form: {
    id?: string | null
    status?: string
    requestDate: string
    siteInvestmentId: string | null
    siteInvestment?: MaterialRequest['siteInvestment'] | null
    customerId: number | null
    siteId: number | null
    projectName: string
    departmentId: number | null
    priority: string
    purpose: string
    neededDate: string
    currency: string
    notes: string
    materialRequestItems: MaterialRequestItemForm[]
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    totalMaterialRequests: number
    approvedMaterialRequests: number
    draftMaterialRequests: number
    pendingMaterialRequests: number
    rejectedMaterialRequests: number
    completedMaterialRequests: number
    totalValue: number
  }
}

function recalcItem(d: MaterialRequestItemForm) {
  const qty = Number(d.qty) || 0
  const estimatedPrice = Number(d.estimatedPrice) || 0
  d.subtotal = qty * estimatedPrice
}

function mapItemFromApi(d: any): MaterialRequestItemForm {
  const qty = Number(d.qty ?? d.quantity) || 1
  const estimatedPrice = Number(d.estimatedPrice ?? d.estimated_price ?? d.unitPrice ?? d.unit_price ?? 0)
  return {
    siteInvestMaterialId: d.siteInvestMaterialId ?? d.site_invest_material_id ?? null,
    productName: d.productName ?? d.product_name ?? d.product?.name ?? '',
    specification: d.specification ?? null,
    productId: d.productId ?? d.product_id ?? d.product?.id ?? null,
    qty,
    uomId: d.uomId ?? d.uom_id ?? d.uom?.id ?? d.product?.unitId ?? null,
    estimatedPrice,
    subtotal: Number(d.subtotal) || qty * estimatedPrice,
    remarks: d.remarks ?? d.notes ?? null,
    sortOrder: d.sortOrder ?? d.sort_order ?? 0,
    product: d.product,
    uom: d.uom,
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export const useMaterialRequestStore = defineStore('materialRequest', {
  state: (): MaterialRequestState => ({
    materialRequests: [],
    materialRequest: null,
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
      siteInvestmentId: null,
    },
    form: {
      requestDate: todayIso(),
      siteInvestmentId: null,
      siteInvestment: null,
      customerId: null,
      siteId: null,
      projectName: '',
      departmentId: null,
      priority: 'normal',
      purpose: '',
      neededDate: '',
      currency: 'IDR',
      notes: '',
      materialRequestItems: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    statistics: {
      totalMaterialRequests: 0,
      approvedMaterialRequests: 0,
      draftMaterialRequests: 0,
      pendingMaterialRequests: 0,
      rejectedMaterialRequests: 0,
      completedMaterialRequests: 0,
      totalValue: 0,
    },
  }),

  getters: {
    formGrandTotal: (state) =>
      state.form.materialRequestItems.reduce((s, d) => s + (Number(d.subtotal) || 0), 0),
  },

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: () => $api.materialRequest(),
        details: (id: string) => $api.getMaterialRequestDetails(id),
        statistics: () => $api.materialRequestStatistics(),
        approve: (id: string) => $api.approveMaterialRequest(id),
        reject: (id: string) => $api.rejectMaterialRequest(id),
        submit: (id: string) => $api.submitMaterialRequest(id),
        siteInvestmentItems: (siId: string) => $api.materialRequestSiteInvestmentItems(siId),
      }
    },

    async fetchMaterialRequests(suppressError = false) {
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
        if (this.params.siteInvestmentId) sp.append('siteInvestmentId', this.params.siteInvestmentId)
        url.search = sp.toString()

        const res = await fetch(String(url), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil data Material Request Form')
        const json = await res.json()
        this.materialRequests = json.data ?? []
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

    async getMaterialRequestDetails(id: string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.details(id), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (res?.data) this.materialRequest = res.data
        else if (res?.id) this.materialRequest = res
      } finally {
        this.loading = false
      }
    },

    async fetchMaterialRequestForEdit(id: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const data = await apiFetch(api.details(id), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.openModal(data.data)
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        toast.error({ title: 'Error', message: 'Gagal memuat data untuk edit', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async loadSiteInvestmentItems(siteInvestmentId: string) {
      const toast = useToast()
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.siteInvestmentItems(siteInvestmentId), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        const payload = res?.data ?? res
        const si = payload?.siteInvestment
        const items = payload?.items ?? []
        if (si) {
          this.form.siteInvestmentId = si.id
          this.form.siteInvestment = si
          this.form.customerId = si.customerId ?? si.customer?.id ?? null
          this.form.siteId = si.siteId ?? si.site?.id ?? null
          this.form.projectName = si.name ?? ''
        }
        if (items.length) {
          this.form.materialRequestItems = items.map(mapItemFromApi)
        } else {
          toast.info({ title: 'Info', message: 'Tidak ada material produk pada SI ini', color: 'blue', position: 'topRight', layout: 2 })
        }
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal memuat item SI', color: 'red', position: 'topRight', layout: 2 })
      }
    },

    async saveMaterialRequest(): Promise<boolean> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      if (!this.form.siteInvestmentId) {
        this.saving = false
        toast.error({ title: 'Validasi', message: 'Site Investment wajib dipilih', color: 'red', position: 'topRight', layout: 2 })
        return false
      }

      const validItems = this.form.materialRequestItems.filter(
        (d) => d.productName?.trim() && (Number(d.qty) || 0) > 0
      )
      if (!validItems.length) {
        this.saving = false
        toast.error({ title: 'Validasi', message: 'Minimal 1 item dengan nama barang dan qty valid', color: 'red', position: 'topRight', layout: 2 })
        return false
      }

      const body: Record<string, any> = {
        requestDate: this.form.requestDate || todayIso(),
        siteInvestmentId: this.form.siteInvestmentId,
        customerId: this.form.customerId,
        siteId: this.form.siteId,
        projectName: this.form.projectName?.trim() || null,
        departmentId: this.form.departmentId,
        priority: this.form.priority || 'normal',
        purpose: this.form.purpose?.trim() || null,
        neededDate: this.form.neededDate || null,
        currency: this.form.currency || 'IDR',
        notes: this.form.notes?.trim() || null,
        createdBy: this.isEditMode ? undefined : (userStore.user?.id ?? null),
        materialRequestItems: validItems.map((d, idx) => ({
          siteInvestMaterialId: d.siteInvestMaterialId ?? null,
          productName: d.productName.trim(),
          specification: d.specification?.trim() || null,
          productId: d.productId,
          qty: Number(d.qty) || 1,
          uomId: d.uomId,
          estimatedPrice: Number(d.estimatedPrice) || 0,
          subtotal: Number(d.subtotal) || 0,
          remarks: d.remarks?.trim() || null,
          sortOrder: d.sortOrder ?? idx,
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
          toast.error({ title: 'Error', message: ed.message || 'Gagal menyimpan', color: 'red', position: 'topRight', layout: 2 })
          return false
        }
        this.closeModal()
        await this.fetchMaterialRequests()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: `Material Request Form berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteMaterialRequest(id: string) {
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
        const res = await fetch(`${api.list()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        await this.fetchMaterialRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Material Request Form dihapus', color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async approveMaterialRequest(id: string, remarks?: string, options?: { refreshList?: boolean }) {
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
        if (refreshList) await this.fetchMaterialRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Berhasil diapprove', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectMaterialRequest(id: string, reason?: string, options?: { refreshList?: boolean }) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      const refreshList = options?.refreshList !== false
      try {
        const res = await fetch(api.reject(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rejection_reason: reason, reject_reason: reason }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        if (refreshList) await this.fetchMaterialRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Berhasil direject', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitMaterialRequest(id: string, options?: { refreshList?: boolean }) {
      const toast = useToast()
      const api = this.apiEndpoints()
      const refreshList = options?.refreshList !== false
      try {
        const res = await fetch(api.submit(id), { method: 'PATCH', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message)
        if (refreshList) await this.fetchMaterialRequests()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'Berhasil di-submit', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
        return false
      }
    },

    openModal(data: MaterialRequest | null = null) {
      this.loading = false
      this.saving = false
      this.isEditMode = !!data
      if (data) {
        const raw = data as any
        const items = raw.materialRequestItems ?? raw.material_request_items ?? []
        this.form = {
          id: raw.id,
          status: raw.status ?? 'draft',
          requestDate: (raw.requestDate ?? raw.request_date ?? todayIso()).toString().slice(0, 10),
          siteInvestmentId: raw.siteInvestmentId ?? raw.site_investment_id ?? null,
          siteInvestment: raw.siteInvestment ?? raw.site_investment ?? null,
          customerId: raw.customerId ?? raw.customer_id ?? raw.siteInvestment?.customerId ?? null,
          siteId: raw.siteId ?? raw.site_id ?? raw.siteInvestment?.siteId ?? null,
          projectName: raw.projectName ?? raw.project_name ?? raw.siteInvestment?.name ?? '',
          departmentId: raw.departmentId ?? raw.department_id ?? null,
          priority: raw.priority ?? 'normal',
          purpose: raw.purpose ?? raw.description ?? '',
          neededDate: (raw.neededDate ?? raw.needed_date ?? '')?.toString?.()?.slice(0, 10) ?? '',
          currency: raw.currency ?? 'IDR',
          notes: raw.notes ?? '',
          materialRequestItems: items.map(mapItemFromApi),
        }
      } else {
        this.form = {
          status: 'draft',
          requestDate: todayIso(),
          siteInvestmentId: null,
          siteInvestment: null,
          customerId: null,
          siteId: null,
          projectName: '',
          departmentId: null,
          priority: 'normal',
          purpose: '',
          neededDate: '',
          currency: 'IDR',
          notes: '',
          materialRequestItems: [],
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
        siteInvestmentId: null,
        siteInvestment: null,
        customerId: null,
        siteId: null,
        projectName: '',
        departmentId: null,
        priority: 'normal',
        purpose: '',
        neededDate: '',
        currency: 'IDR',
        notes: '',
        materialRequestItems: [],
      }
    },

    addItem() {
      this.form.materialRequestItems.push({
        productName: '',
        productId: null,
        qty: 1,
        uomId: null,
        estimatedPrice: 0,
        subtotal: 0,
        remarks: '',
      })
    },

    removeDetail(index: number) {
      this.form.materialRequestItems.splice(index, 1)
    },

    onQtyOrPriceChange(index: number) {
      const row = this.form.materialRequestItems[index]
      if (row) recalcItem(row)
    },

    onProductChange(index: number, product: MaterialRequestItemForm['product'] | null) {
      const row = this.form.materialRequestItems[index]
      if (!row) return
      if (!product) {
        row.productId = null
        row.product = undefined
        return
      }
      row.product = product
      row.productId = product.id ?? null
      row.productName = product.name ?? row.productName
      row.uomId = product.unitId ?? product.unit_id ?? row.uomId
      const price = Number(product.priceSell ?? product.price_sell ?? 0)
      if (price > 0) row.estimatedPrice = price
      recalcItem(row)
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchMaterialRequests()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchMaterialRequests()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchMaterialRequests()
    },

    setFilters(f: {
      status?: string | null
      priority?: string | null
      departmentId?: number | null
      siteInvestmentId?: string | null
      search?: string
    }) {
      if (f.status !== undefined) this.params.status = f.status
      if (f.priority !== undefined) this.params.priority = f.priority
      if (f.departmentId !== undefined) this.params.departmentId = f.departmentId
      if (f.siteInvestmentId !== undefined) this.params.siteInvestmentId = f.siteInvestmentId
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchMaterialRequests()
    },

    async fetchStatistics() {
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.statistics(), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) return
        const json = await res.json()
        const d = json.data ?? {}
        this.statistics = {
          totalMaterialRequests: d.totalMaterialRequests ?? 0,
          approvedMaterialRequests: d.approvedMaterialRequests ?? 0,
          draftMaterialRequests: d.draftMaterialRequests ?? 0,
          pendingMaterialRequests: d.pendingMaterialRequests ?? 0,
          rejectedMaterialRequests: d.rejectedMaterialRequests ?? 0,
          completedMaterialRequests: d.completedMaterialRequests ?? 0,
          totalValue: d.totalValue ?? 0,
        }
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export function getMaterialRequestNo(mrf: MaterialRequest | null | undefined): string {
  if (!mrf) return ''
  return mrf.mrfNumber ?? mrf.mrf_number ?? ''
}

export function getMaterialRequestTotal(mrf: MaterialRequest | null | undefined): number {
  if (!mrf) return 0
  return Number(mrf.totalAmount ?? mrf.grandTotal ?? 0)
}

export function getMaterialRequestItemsList(mrf: MaterialRequest | null | undefined): MaterialRequestItemForm[] {
  if (!mrf) return []
  return mrf.materialRequestItems ?? mrf.material_request_items ?? []
}
