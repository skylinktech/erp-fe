import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { ApprovalLogEntry } from '~/types/approval'

export type ArfType = 'installation' | 'dismantle' | 'survey'

export interface ArfItemForm {
  budgetId?: number | null
  description: string
  qty: number
  unit?: string | null
  unitPrice: number
  subtotal: number
  notes?: string | null
  budget?: { id: number; budgetCode?: string; budget_code?: string; budgetName?: string; budget_name?: string }
}

export interface ArfEmployeeForm {
  pegawaiId: number | null
  salaryAmount: number
  notes?: string | null
  pegawai?: {
    id_pegawai?: number
    idPegawai?: number
    nm_pegawai?: string
    nmPegawai?: string
    nik_pegawai?: string
    nikPegawai?: string
  }
}

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface Arf {
  id: number
  requestNo?: string
  request_no?: string
  requestDate?: string
  request_date?: string
  siteInvestmentId?: string | null
  site_investment_id?: string | null
  requestedBy?: number | null
  type?: ArfType
  departmentId?: number | null
  status: string
  approvalStatus?: string | null
  rejectionReason?: string | null
  rejectReason?: string | null
  totalAmount?: number
  currency?: string
  notes?: string | null
  attachment?: string | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
  arfItems?: ArfItemForm[]
  arf_items?: ArfItemForm[]
  arfEmployees?: ArfEmployeeForm[]
  arf_employees?: ArfEmployeeForm[]
  requestedByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  department?: { id: number; nm_departemen?: string; nmDepartemen?: string }
  siteInvestment?: {
    id: string
    siNumber?: string
    si_number?: string
    name?: string
    status?: string
  }
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
  nextApprovalStep?: number | null
}

interface ArfState {
  arfs: Arf[]
  arf: Arf | null
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
    type?: string | null
    departmentId?: number | null
  }
  form: {
    id?: number | null
    status?: string
    requestDate: string
    siteInvestmentId: string | null
    type: ArfType
    departmentId: number | null
    currency: string
    notes: string
    attachment: string
    arfItems: ArfItemForm[]
    arfEmployees: ArfEmployeeForm[]
  }
  isEditMode: boolean
  validationErrors: any[]
  statistics: {
    totalArfs: number
    approvedArfs: number
    draftArfs: number
    pendingArfs: number
    rejectedArfs: number
    completedArfs: number
    totalValue: number
  }
}

function recalcItem(d: ArfItemForm) {
  const qty = Number(d.qty) || 0
  const unitPrice = Number(d.unitPrice) || 0
  d.subtotal = qty * unitPrice
}

function mapEmployeeFromApi(d: any): ArfEmployeeForm {
  return {
    pegawaiId: d.pegawaiId ?? d.pegawai_id ?? d.pegawai?.id_pegawai ?? d.pegawai?.idPegawai ?? null,
    salaryAmount: Number(d.salaryAmount ?? d.salary_amount ?? 0),
    notes: d.notes ?? null,
    pegawai: d.pegawai,
  }
}

function mapItemFromApi(d: any): ArfItemForm {
  const qty = Number(d.qty) || 1
  const unitPrice = Number(d.unitPrice ?? d.unit_price ?? 0)
  return {
    budgetId: d.budgetId ?? d.budget_id ?? d.budget?.id ?? null,
    description: d.description ?? '',
    qty,
    unit: d.unit ?? null,
    unitPrice,
    subtotal: Number(d.subtotal) || qty * unitPrice,
    notes: d.notes ?? null,
    budget: d.budget,
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export const useArfStore = defineStore('arf', {
  state: (): ArfState => ({
    arfs: [],
    arf: null,
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
      type: null,
      departmentId: null,
    },
    form: {
      requestDate: todayIso(),
      siteInvestmentId: null,
      type: 'installation',
      departmentId: null,
      currency: 'IDR',
      notes: '',
      attachment: '',
      arfItems: [],
      arfEmployees: [],
    },
    isEditMode: false,
    validationErrors: [],
    statistics: {
      totalArfs: 0,
      approvedArfs: 0,
      draftArfs: 0,
      pendingArfs: 0,
      rejectedArfs: 0,
      completedArfs: 0,
      totalValue: 0,
    },
  }),

  getters: {
    formItemsTotal: (state) => state.form.arfItems.reduce((s, d) => s + (Number(d.subtotal) || 0), 0),
    formEmployeesTotal: (state) =>
      state.form.arfEmployees.reduce((s, d) => s + (Number(d.salaryAmount) || 0), 0),
    formGrandTotal: (state) => {
      const items = state.form.arfItems.reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
      const employees = state.form.arfEmployees.reduce((s, d) => s + (Number(d.salaryAmount) || 0), 0)
      return items + employees
    },
  },

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: () => $api.arf(),
        details: (id: number | string) => $api.getArfDetails(id),
        statistics: () => $api.countArfByStatus(),
        approve: (id: number | string) => $api.approveArf(id),
        reject: (id: number | string) => $api.rejectArf(id),
        submit: (id: number | string) => $api.submitArf(id),
      }
    },

    async fetchArfs(suppressError = false) {
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
        })
        if (this.params.status) sp.append('status', this.params.status)
        if (this.params.type) sp.append('type', this.params.type)
        if (this.params.departmentId) sp.append('departmentId', String(this.params.departmentId))
        url.search = sp.toString()

        const res = await fetch(String(url), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Gagal mengambil data ARF')
        const json = await res.json()
        this.arfs = json.data ?? []
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

    async getArfDetails(id: number | string) {
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.details(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (res?.data) this.arf = res.data
        else if (res?.id) this.arf = res
      } finally {
        this.loading = false
      }
    },

    async fetchArfForEdit(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const data = await apiFetch(api.details(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (data?.data) this.loadFormFromArf(data.data)
        else throw new Error('Data tidak valid')
      } catch {
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

    loadFormFromArf(arf: Arf) {
      const items = arf.arfItems ?? arf.arf_items ?? []
      const employees = arf.arfEmployees ?? arf.arf_employees ?? []
      this.isEditMode = true
      this.form = {
        id: arf.id,
        status: arf.status,
        requestDate: (arf.requestDate ?? arf.request_date ?? todayIso()).toString().slice(0, 10),
        siteInvestmentId: arf.siteInvestmentId ?? arf.site_investment_id ?? null,
        type: (arf.type as ArfType) || 'installation',
        departmentId: arf.departmentId ?? null,
        currency: arf.currency || 'IDR',
        notes: arf.notes || '',
        attachment: arf.attachment || '',
        arfItems: items.map(mapItemFromApi),
        arfEmployees: employees.map(mapEmployeeFromApi),
      }
    },

    resetForm() {
      this.isEditMode = false
      this.form = {
        requestDate: todayIso(),
        siteInvestmentId: null,
        type: 'installation',
        departmentId: null,
        currency: 'IDR',
        notes: '',
        attachment: '',
        arfItems: [],
        arfEmployees: [],
      }
    },

    addItem() {
      this.form.arfItems.push({
        budgetId: null,
        description: '',
        qty: 1,
        unit: '',
        unitPrice: 0,
        subtotal: 0,
        notes: null,
      })
    },

    removeItem(index: number) {
      this.form.arfItems.splice(index, 1)
    },

    updateItemField(index: number, field: keyof ArfItemForm, value: unknown) {
      const item = this.form.arfItems[index]
      if (!item) return
      ;(item as Record<string, unknown>)[field] = value
      if (field === 'qty' || field === 'unitPrice') recalcItem(item)
    },

    addEmployee() {
      this.form.arfEmployees.push({
        pegawaiId: null,
        salaryAmount: 0,
        notes: null,
      })
    },

    removeEmployee(index: number) {
      this.form.arfEmployees.splice(index, 1)
    },

    updateEmployeeField(index: number, field: keyof ArfEmployeeForm, value: unknown) {
      const row = this.form.arfEmployees[index]
      if (!row) return
      ;(row as Record<string, unknown>)[field] = value
    },

    async saveArf(): Promise<boolean> {
      const toast = useToast()
      this.saving = true
      const api = this.apiEndpoints()
      const userStore = useUserStore()

      const validItems = this.form.arfItems.filter(
        (d) => d.description?.trim() && (Number(d.qty) || 0) > 0
      )
      if (!this.form.type) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Tipe wajib dipilih',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }
      if (!this.form.siteInvestmentId) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Site Investment wajib dipilih',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }
      if (!this.form.departmentId) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Departemen wajib dipilih',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }
      if (!validItems.length) {
        this.saving = false
        toast.error({
          title: 'Validasi',
          message: 'Minimal 1 item dengan deskripsi dan qty valid',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return false
      }

      const validEmployees = this.form.arfEmployees.filter(
        (d) => d.pegawaiId && (Number(d.salaryAmount) || 0) >= 0
      )
      const pegawaiSeen = new Set<number>()
      for (const d of validEmployees) {
        const pid = Number(d.pegawaiId)
        if (pegawaiSeen.has(pid)) {
          this.saving = false
          toast.error({
            title: 'Validasi',
            message: 'Pegawai tidak boleh duplikat',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
          return false
        }
        pegawaiSeen.add(pid)
      }

      const body: Record<string, unknown> = {
        requestDate: this.form.requestDate || todayIso(),
        siteInvestmentId: this.form.siteInvestmentId,
        type: this.form.type,
        departmentId: this.form.departmentId,
        currency: this.form.currency || 'IDR',
        notes: this.form.notes?.trim() || null,
        attachment: this.form.attachment?.trim() || null,
        createdBy: this.isEditMode ? undefined : (userStore.user?.id ?? null),
        arfItems: validItems.map((d) => ({
          budgetId: d.budgetId,
          description: d.description.trim(),
          qty: Number(d.qty) || 1,
          unit: d.unit?.trim() || null,
          unitPrice: Number(d.unitPrice) || 0,
          subtotal: Number(d.subtotal) || 0,
          notes: d.notes?.trim() || null,
        })),
        arfEmployees: validEmployees.map((d) => ({
          pegawaiId: Number(d.pegawaiId),
          salaryAmount: Number(d.salaryAmount) || 0,
          notes: d.notes?.trim() || null,
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
          const err = await normalizeFailedResponse(
            res,
            this.isEditMode ? 'ARF gagal diperbarui.' : 'ARF gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        const saved = await res.json().catch(() => ({}))
        const savedId = saved?.data?.id ?? saved?.id
        if (savedId) this.form.id = savedId
        await this.fetchArfs()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: `ARF berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'ARF gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteArf(id: number | string) {
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
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'ARF gagal dihapus.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchArfs()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'ARF berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (e: any) {
        const err = normalizeApiError(e, 'ARF gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    async approveArf(id: number | string, remarks?: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.approve(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks }),
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'ARF gagal disetujui.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchArfs()
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
        const err = normalizeApiError(e, 'ARF gagal disetujui.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectArf(id: number | string, reason?: string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.reject(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rejection_reason: reason, reject_reason: reason }),
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'ARF gagal ditolak.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchArfs()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'Berhasil direject',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'ARF gagal ditolak.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async submitArf(id: number | string) {
      const toast = useToast()
      this.loading = true
      const api = this.apiEndpoints()
      try {
        const res = await fetch(api.submit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await normalizeFailedResponse(res, 'ARF gagal disubmit.')
          toastNormalizedError(err)
          return false
        }
        await this.fetchArfs()
        await this.fetchStatistics()
        toast.success({
          title: 'Sukses',
          message: 'ARF berhasil di-submit',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return true
      } catch (e: any) {
        const err = normalizeApiError(e, 'ARF gagal disubmit.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics() {
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch(api.statistics(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (res?.data) this.statistics = res.data
      } catch {
        /* ignore */
      }
    },
  },
})

export function getArfRequestNo(arf: Arf | null | undefined): string {
  if (!arf) return ''
  return arf.requestNo ?? arf.request_no ?? ''
}

export function getArfItemsList(arf: Arf | null | undefined): ArfItemForm[] {
  if (!arf) return []
  return arf.arfItems ?? arf.arf_items ?? []
}

export function getArfEmployeesList(arf: Arf | null | undefined): ArfEmployeeForm[] {
  if (!arf) return []
  const raw = arf.arfEmployees ?? arf.arf_employees ?? []
  return raw.map((d) => mapEmployeeFromApi(d))
}

export function getArfEmployeesTotal(arf: Arf | null | undefined): number {
  return getArfEmployeesList(arf).reduce((s, d) => s + (Number(d.salaryAmount) || 0), 0)
}

export function getArfItemsTotal(arf: Arf | null | undefined): number {
  return getArfItemsList(arf).reduce((s, d) => s + (Number(d.subtotal) || 0), 0)
}

export function getArfTotal(arf: Arf | null | undefined): number {
  if (!arf) return 0
  if (arf.totalAmount != null) return Number(arf.totalAmount)
  return getArfItemsTotal(arf) + getArfEmployeesTotal(arf)
}

export const ARF_TYPE_OPTIONS = [
  { label: 'Installation', value: 'installation' },
  { label: 'Dismantle', value: 'dismantle' },
  { label: 'Survey', value: 'survey' },
] as const

export const ARF_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
] as const
