import { defineStore } from 'pinia'
import Swal from 'sweetalert2'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, toastApiError } from '~/utils/apiError'
import { PAYROLL_SUCCESS } from '~/constants/payroll'
import { unwrapCollection, type PayrollEmployeeSummary, type PayrollPaymentBatch, type PayrollPeriod, type PayrollRunSummary } from '~/types/payroll'

function qs(params: Record<string, unknown>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') search.set(k, String(v))
  })
  const s = search.toString()
  return s ? `?${s}` : ''
}

export const usePayrollStore = defineStore('payroll', {
  state: () => ({
    loading: false,
    dashboard: null as Record<string, unknown> | null,
    periods: [] as PayrollPeriod[],
    runs: [] as PayrollRunSummary[],
    runTotal: 0,
    runParams: { first: 0, rows: 20, page: 1 },
    currentRun: null as PayrollRunSummary | null,
    employees: [] as PayrollEmployeeSummary[],
    employeeTotal: 0,
    employeeParams: { first: 0, rows: 20, page: 1 },
    exceptionEmployees: [] as PayrollEmployeeSummary[],
    payments: [] as PayrollPaymentBatch[],
    paymentTotal: 0,
    paymentParams: { first: 0, rows: 20, page: 1 },
    payslipParams: { first: 0, rows: 20, page: 1 },
    currentPayment: null as PayrollPaymentBatch | null,
    variableInputs: [] as Record<string, unknown>[],
    components: [] as Record<string, unknown>[],
    structures: [] as Record<string, unknown>[],
    profiles: [] as Record<string, unknown>[],
    compensations: [] as Record<string, unknown>[],
    taxProfiles: [] as Record<string, unknown>[],
    bpjsProfiles: [] as Record<string, unknown>[],
    payslips: [] as Record<string, unknown>[],
    payslipTotal: 0,
    runStats: null as Record<string, number> | null,
    paymentStats: null as Record<string, number> | null,
    variableStats: null as Record<string, number> | null,
    payslipStats: null as Record<string, number> | null,
    loadingStats: false,
  }),
  actions: {
    async request<T>(fn: () => Promise<T>, fallback: string): Promise<T | null> {
      this.loading = true
      try {
        return await fn()
      } catch (error) {
        toastApiError(error, fallback)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchDashboard(perusahaanId?: number | null) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: Record<string, unknown> }>(`${$api.payrollDashboard()}${qs({ perusahaan_id: perusahaanId })}`, { credentials: 'include' }),
        'Dashboard payroll gagal dimuat.'
      )
      if (res) this.dashboard = res.data
      return res?.data ?? null
    },

    async fetchPeriods(perusahaanId?: number | null) {
      const { $api } = useNuxtApp()
      const res = await apiFetch<{ data: unknown }>(`${$api.payrollPeriods()}${qs({ perusahaan_id: perusahaanId })}`, { credentials: 'include' })
      const { rows } = unwrapCollection<PayrollPeriod>(res.data)
      this.periods = rows
      return rows
    },

    async fetchRuns(filters: Record<string, unknown> = {}) {
      const { $api } = useNuxtApp()
      const page = Number(filters.page ?? this.runParams.page ?? 1)
      const perPage = Number(filters.per_page ?? this.runParams.rows ?? 20)
      this.loading = true
      try {
        const res = await apiFetch<{ data: unknown }>(
          `${$api.payrollRuns()}${qs({
            page,
            per_page: perPage,
            period_id: filters.period_id,
            run_type: filters.run_type,
            status: filters.status,
            search: filters.search,
            perusahaan_id: filters.perusahaan_id,
          })}`,
          { credentials: 'include' }
        )
        const pageData = unwrapCollection<PayrollRunSummary>(res.data)
        this.runs = pageData.rows
        this.runTotal = pageData.total
        this.runParams = { first: (page - 1) * perPage, rows: perPage, page }
        return pageData
      } catch (error) {
        toastApiError(error, 'Payroll Run gagal dimuat.')
        return unwrapCollection<PayrollRunSummary>([])
      } finally {
        this.loading = false
      }
    },

    async fetchRun(id: number | string) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: PayrollRunSummary }>($api.payrollRunShow(id), { credentials: 'include' }),
        'Payroll Run gagal dimuat.'
      )
      if (res) this.currentRun = res.data
      return res?.data ?? null
    },

    async fetchEmployees(id: number | string, filters: Record<string, unknown> = {}) {
      const { $api } = useNuxtApp()
      const page = Number(filters.page ?? this.employeeParams.page ?? 1)
      const perPage = Number(filters.per_page ?? this.employeeParams.rows ?? 20)
      this.loading = true
      try {
        const res = await apiFetch<{ data: unknown }>(
          `${$api.payrollRunEmployees(id)}${qs({
            page,
            per_page: perPage,
            search: filters.search,
            departemen_id: filters.departemen_id,
            exception: filters.exception,
            payment_status: filters.payment_status,
          })}`,
          { credentials: 'include' }
        )
        const pageData = unwrapCollection<PayrollEmployeeSummary>(res.data)
        this.employees = pageData.rows
        this.employeeTotal = pageData.total
        this.employeeParams = { first: (page - 1) * perPage, rows: perPage, page }
        return pageData
      } catch (error) {
        toastApiError(error, 'Daftar employee payroll gagal dimuat.')
        return unwrapCollection<PayrollEmployeeSummary>([])
      } finally {
        this.loading = false
      }
    },

    async fetchExceptionEmployees(id: number | string) {
      const { $api } = useNuxtApp()
      const load = async (exception: string) => {
        const res = await apiFetch<{ data: unknown }>(
          `${$api.payrollRunEmployees(id)}${qs({ page: 1, per_page: 100, exception })}`,
          { credentials: 'include' }
        )
        return unwrapCollection<PayrollEmployeeSummary>(res.data).rows
      }
      try {
        const [blocked, warning] = await Promise.all([load('blocked'), load('warning')])
        const map = new Map<number, PayrollEmployeeSummary>()
        for (const row of [...blocked, ...warning]) map.set(row.id, row)
        this.exceptionEmployees = [...map.values()]
      } catch (error) {
        toastApiError(error, 'Exception payroll gagal dimuat.')
        this.exceptionEmployees = []
      }
      return this.exceptionEmployees
    },

    async fetchEmployeeDetail(runId: number | string, employeeId: number | string) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: unknown }>($api.payrollRunEmployee(runId, employeeId), { credentials: 'include' }),
        'Detail employee payroll gagal dimuat.'
      )
      return res?.data ?? null
    },

    async createRun(body: { payroll_period_id: string; run_type?: string }) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await apiFetch<{ data: PayrollRunSummary }>($api.payrollRuns(), {
          method: 'POST',
          credentials: 'include',
          body,
        })
        toast.success({ title: 'Berhasil', message: 'Payroll Run berhasil dibuat.', color: 'green' })
        return res.data
      } catch (error) {
        toastApiError(error, 'Payroll Run gagal dibuat.')
        throw normalizeApiError(error, 'Payroll Run gagal dibuat.')
      }
    },

    async confirmAction(message: string) {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Lanjutkan',
        cancelButtonText: 'Batal',
        customClass: { confirmButton: 'btn btn-primary', cancelButton: 'btn btn-label-secondary' },
        buttonsStyling: false,
      })
      return result.isConfirmed
    },

    async runAction(
      id: number | string,
      action: 'calculate' | 'recalculate' | 'submit' | 'approve' | 'reject' | 'post',
      extra: { remarks?: string; confirm?: string } = {}
    ) {
      if (extra.confirm) {
        const ok = await this.confirmAction(extra.confirm)
        if (!ok) return null
      }
      const { $api } = useNuxtApp()
      const toast = useToast()
      const map = {
        calculate: $api.payrollRunCalculate,
        recalculate: $api.payrollRunRecalculate,
        submit: $api.payrollRunSubmit,
        approve: $api.payrollRunApprove,
        reject: $api.payrollRunReject,
        post: $api.payrollRunPost,
      }
      const messages = {
        calculate: PAYROLL_SUCCESS.calculated,
        recalculate: PAYROLL_SUCCESS.recalculated,
        submit: PAYROLL_SUCCESS.submitted,
        approve: PAYROLL_SUCCESS.approved,
        reject: PAYROLL_SUCCESS.rejected,
        post: PAYROLL_SUCCESS.posted,
      }
      this.loading = true
      try {
        const res = await apiFetch<{ data: unknown }>(map[action](id), {
          method: 'POST',
          credentials: 'include',
          body: extra.remarks ? { remarks: extra.remarks } : {},
        })
        toast.success({ title: 'Berhasil', message: messages[action], color: 'green' })
        const payload = res.data as { run?: PayrollRunSummary } | PayrollRunSummary
        const run = payload && typeof payload === 'object' && 'run' in payload ? payload.run : (payload as PayrollRunSummary)
        if (run) this.currentRun = run
        return res.data
      } catch (error) {
        toastApiError(error, `Aksi ${action} gagal.`)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchPayments(filters: Record<string, unknown> = {}) {
      const { $api } = useNuxtApp()
      const page = Number(filters.page ?? 1)
      const perPage = Number(filters.per_page ?? 20)
      this.loading = true
      try {
        const res = await apiFetch<{ data: unknown }>(
          `${$api.payrollPaymentBatches()}${qs({
            page,
            per_page: perPage,
            run_id: filters.run_id,
            status: filters.status,
            search: filters.search,
          })}`,
          { credentials: 'include' }
        )
        const pageData = unwrapCollection<PayrollPaymentBatch>(res.data)
        this.payments = pageData.rows
        this.paymentTotal = pageData.total
        this.paymentParams = { first: (page - 1) * perPage, rows: perPage, page }
        return pageData
      } catch (error) {
        toastApiError(error, 'Payment batch gagal dimuat.')
        return unwrapCollection<PayrollPaymentBatch>([])
      } finally {
        this.loading = false
      }
    },

    async fetchPayment(id: number | string) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: PayrollPaymentBatch }>($api.payrollPaymentShow(id), { credentials: 'include' }),
        'Payment batch gagal dimuat.'
      )
      if (res) this.currentPayment = res.data
      return res?.data ?? null
    },

    async createPayment(body: { payroll_run_id: string; bank_account_id: number | string; payment_date: string }) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await apiFetch<{ data: PayrollPaymentBatch }>($api.payrollPaymentBatches(), {
          method: 'POST',
          credentials: 'include',
          body,
        })
        toast.success({ title: 'Berhasil', message: PAYROLL_SUCCESS.paymentCreated, color: 'green' })
        return res.data
      } catch (error) {
        toastApiError(error, 'Payment batch gagal dibuat.')
        return null
      }
    },

    async processPayment(id: number | string, confirm?: string) {
      if (confirm && !(await this.confirmAction(confirm))) return null
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await apiFetch<{ data: PayrollPaymentBatch }>($api.payrollPaymentProcess(id), {
          method: 'POST',
          credentials: 'include',
          body: {},
        })
        toast.success({ title: 'Berhasil', message: PAYROLL_SUCCESS.paymentProcessed, color: 'green' })
        this.currentPayment = res.data
        return res.data
      } catch (error) {
        toastApiError(error, 'Payment gagal diproses.')
        return null
      }
    },

    async retryFailedPayment(id: number | string, confirm?: string) {
      if (confirm && !(await this.confirmAction(confirm))) return null
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await apiFetch<{ data: PayrollPaymentBatch }>($api.payrollPaymentRetry(id), {
          method: 'POST',
          credentials: 'include',
          body: {},
        })
        toast.success({ title: 'Berhasil', message: PAYROLL_SUCCESS.paymentRetried, color: 'green' })
        this.currentPayment = res.data
        return res.data
      } catch (error) {
        toastApiError(error, 'Retry payment gagal.')
        return null
      }
    },

    async fetchVariableInputs(periodId?: string | null) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () =>
          apiFetch<{ data: unknown }>(`${$api.payrollVariableInputs()}${qs({ payroll_period_id: periodId })}`, {
            credentials: 'include',
          }),
        'Variable input gagal dimuat.'
      )
      this.variableInputs = unwrapCollection<Record<string, unknown>>(res?.data).rows
      return this.variableInputs
    },

    async fetchMasters() {
      const { $api } = useNuxtApp()
      const [components, structures, profiles, compensations, tax, bpjs] = await Promise.all([
        apiFetch<{ data: unknown }>($api.payrollComponents(), { credentials: 'include' }).catch(() => ({ data: [] })),
        apiFetch<{ data: unknown }>($api.payrollStructures(), { credentials: 'include' }).catch(() => ({ data: [] })),
        apiFetch<{ data: unknown }>($api.payrollProfiles(), { credentials: 'include' }).catch(() => ({ data: [] })),
        apiFetch<{ data: unknown }>($api.payrollCompensations(), { credentials: 'include' }).catch(() => ({ data: [] })),
        apiFetch<{ data: unknown }>($api.payrollTaxProfiles(), { credentials: 'include' }).catch(() => ({ data: [] })),
        apiFetch<{ data: unknown }>($api.payrollBpjsProfiles(), { credentials: 'include' }).catch(() => ({ data: [] })),
      ])
      this.components = unwrapCollection<Record<string, unknown>>(components.data).rows
      this.structures = unwrapCollection<Record<string, unknown>>(structures.data).rows
      this.profiles = unwrapCollection<Record<string, unknown>>(profiles.data).rows
      this.compensations = unwrapCollection<Record<string, unknown>>(compensations.data).rows
      this.taxProfiles = unwrapCollection<Record<string, unknown>>(tax.data).rows
      this.bpjsProfiles = unwrapCollection<Record<string, unknown>>(bpjs.data).rows
    },

    async persistMaster(url: string, body: Record<string, unknown>, success: string, fallback: string) {
      const toast = useToast()
      try {
        await apiFetch(url, { method: 'POST', credentials: 'include', body })
        toast.success({ title: 'Berhasil', message: success, color: 'green' })
        await this.fetchMasters()
        return true
      } catch (error) {
        toastApiError(error, fallback)
        return false
      }
    },

    async saveComponent(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      return this.persistMaster($api.payrollComponents(), body, 'Salary component disimpan.', 'Salary component gagal disimpan.')
    },

    async updateComponent(id: number | string, body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        await apiFetch($api.payrollComponent(id), { method: 'PUT', credentials: 'include', body })
        toast.success({ title: 'Berhasil', message: 'Salary component diperbarui.', color: 'green' })
        await this.fetchMasters()
        return true
      } catch (error) {
        toastApiError(error, 'Salary component gagal diperbarui.')
        return false
      }
    },

    async deleteComponent(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await apiFetch<{ data?: { deactivated?: boolean }; message?: string }>(
          $api.payrollComponent(id),
          { method: 'DELETE', credentials: 'include' }
        )
        toast.success({
          title: 'Berhasil',
          message: res.message || 'Salary component dihapus.',
          color: 'green',
        })
        await this.fetchMasters()
        return true
      } catch (error) {
        toastApiError(error, 'Salary component gagal dihapus.')
        return false
      }
    },

    async saveProfile(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      return this.persistMaster($api.payrollProfiles(), body, 'Payroll profile disimpan.', 'Payroll profile gagal disimpan.')
    },

    async saveCompensation(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      return this.persistMaster($api.payrollCompensations(), body, 'Compensation version disimpan.', 'Compensation gagal disimpan.')
    },

    async updateCompensation(id: number | string, body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        await apiFetch($api.payrollCompensationShow(id), { method: 'PUT', credentials: 'include', body })
        toast.success({ title: 'Berhasil', message: 'Compensation diperbarui.', color: 'green' })
        await this.fetchMasters()
        return true
      } catch (error) {
        toastApiError(error, 'Compensation gagal diperbarui.')
        return false
      }
    },

    async fetchCompensation(id: number | string) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: Record<string, unknown> }>($api.payrollCompensationShow(id), { credentials: 'include' }),
        'Compensation gagal dimuat.'
      )
      return res?.data ?? null
    },

    async fetchStructureComponents(id: number | string) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: Record<string, unknown> }>($api.payrollStructureComponents(id), { credentials: 'include' }),
        'Komponen structure gagal dimuat.'
      )
      return res?.data ?? null
    },

    async activateCompensation(id: number | string) {
      const { $api } = useNuxtApp()
      if (!(await this.confirmAction('Aktifkan compensation version ini? Versi overlapping aktif tidak diizinkan.'))) return false
      return this.persistMaster($api.payrollCompensationActivate(id), {}, 'Compensation diaktifkan.', 'Aktivasi compensation gagal.')
    },

    async saveTaxProfile(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      return this.persistMaster($api.payrollTaxProfiles(), body, 'Tax profile disimpan.', 'Tax profile gagal disimpan.')
    },

    async saveBpjsProfile(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      return this.persistMaster($api.payrollBpjsProfiles(), body, 'BPJS profile disimpan.', 'BPJS profile gagal disimpan.')
    },

    async savePeriod(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        await apiFetch($api.payrollPeriods(), { method: 'POST', credentials: 'include', body })
        toast.success({ title: 'Berhasil', message: 'Payroll Period disimpan.', color: 'green' })
        await this.fetchPeriods()
        return true
      } catch (error) {
        toastApiError(error, 'Payroll Period gagal disimpan.')
        return false
      }
    },

    async saveStructure(body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      return this.persistMaster($api.payrollStructures(), body, 'Salary structure disimpan.', 'Salary structure gagal disimpan.')
    },

    async fetchStructure(id: number | string) {
      const { $api } = useNuxtApp()
      const res = await this.request(
        () => apiFetch<{ data: Record<string, unknown> }>($api.payrollStructureShow(id), { credentials: 'include' }),
        'Salary structure gagal dimuat.'
      )
      return res?.data ?? null
    },

    async attachStructureComponent(id: number | string, body: Record<string, unknown>) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await apiFetch<{ data: Record<string, unknown> }>($api.payrollStructureComponents(id), {
          method: 'POST',
          credentials: 'include',
          body,
        })
        toast.success({ title: 'Berhasil', message: 'Komponen ditambahkan ke structure.', color: 'green' })
        return res.data
      } catch (error) {
        toastApiError(error, 'Komponen structure gagal ditambahkan.')
        return null
      }
    },

    async fetchPayslips(filters: Record<string, unknown> = {}) {
      const { $api } = useNuxtApp()
      const page = Number(filters.page ?? 1)
      const perPage = Number(filters.per_page ?? 20)
      this.loading = true
      try {
        const res = await apiFetch<{ data: unknown }>(
          `${$api.payrollPayslips()}${qs({ page, per_page: perPage, run_id: filters.run_id, search: filters.search })}`,
          { credentials: 'include' }
        )
        const pageData = unwrapCollection<Record<string, unknown>>(res.data)
        this.payslips = pageData.rows
        this.payslipTotal = pageData.total
        this.payslipParams = { first: (page - 1) * perPage, rows: perPage, page }
        return pageData
      } catch (error) {
        toastApiError(error, 'Payslip gagal dimuat.')
        return unwrapCollection<Record<string, unknown>>([])
      } finally {
        this.loading = false
      }
    },

    async fetchListStats(kind: 'runs' | 'payments' | 'variables' | 'payslips', filters: Record<string, unknown> = {}) {
      const { $api } = useNuxtApp()
      const url =
        kind === 'runs'
          ? $api.payrollRunStatistics()
          : kind === 'payments'
            ? $api.payrollPaymentStatistics()
            : kind === 'variables'
              ? $api.payrollVariableStatistics()
              : $api.payrollPayslipStatistics()
      this.loadingStats = true
      try {
        const res = await apiFetch<{ data: Record<string, number> }>(`${url}${qs(filters)}`, { credentials: 'include' })
        const data = res.data || {}
        if (kind === 'runs') this.runStats = data
        if (kind === 'payments') this.paymentStats = data
        if (kind === 'variables') this.variableStats = data
        if (kind === 'payslips') this.payslipStats = data
        return data
      } catch (error) {
        toastApiError(error, 'Statistik payroll gagal dimuat.')
        return null
      } finally {
        this.loadingStats = false
      }
    },
  },
})
