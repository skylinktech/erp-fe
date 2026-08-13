import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse } from '~/utils/apiError'

export interface BudgetAllo {
  id?: number
  budgetId?: number
  siteId?: number | null
  amount: number
  site?: {
    id: number
    code: string
    name: string
  }
}

export interface Budget {
  id?: number
  budgetCode?: string
  budgetName: string
  status?: 'draft' | 'approved' | 'rejected' | 'received'
  costCenterId?: number | null
  totalAmount: number
  startDate?: string | null
  endDate?: string | null
  createdBy?: number | null
  approvedBy?: number | null
  rejectedBy?: number | null
  receivedBy?: number | null
  approvedAt?: string | null
  rejectedAt?: string | null
  costCenter?: {
    id: number
    code: string
    name: string
  }
  creator?: {
    id: number
    fullName: string
    email: string
  }
  approver?: {
    id: number
    fullName: string
  }
  budgetAllos?: BudgetAllo[]
}

interface BudgetState {
  budgets: Budget[]
  selectedBudget: Budget | null
  loading: boolean
  saving: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
  }
  form: Partial<Budget> & { budgetAllos: BudgetAllo[] }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    totalBudgets: number
    draftBudgets: number
    approvedBudgets: number
    rejectedBudgets: number
  }
}

export const useBudgetStore = defineStore('budget', {
  state: (): BudgetState => ({
    budgets: [],
    selectedBudget: null,
    loading: false,
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'budgetCode',
      sortOrder: 1,
      search: '',
    },
    form: {
      budgetCode: '',
      budgetName: '',
      status: 'draft',
      costCenterId: null,
      totalAmount: 0,
      startDate: null,
      endDate: null,
      budgetAllos: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    statistics: {
      totalBudgets: 0,
      draftBudgets: 0,
      approvedBudgets: 0,
      rejectedBudgets: 0,
    },
  }),

  actions: {
    async fetchBudgets(suppressError = false) {
      this.loading = true
      this.error = null
      const toast = useToast()
      const { $api } = useNuxtApp()

      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? '1' : '-1',
          search: this.params.search || '',
          includeAllocations: 'false',
        })

        const response = await fetch(`${$api.budgets()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data budget.',
          }))
          throw new Error(errorData.message || 'Gagal memuat data budget.')
        }

        const result = await response.json()

        if (result.data && Array.isArray(result.data)) {
          this.budgets = result.data
          this.totalRecords = result.meta?.total || result.data.length
        } else {
          this.budgets = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        console.error('Error fetching budgets:', e)
        this.error = e.message
        this.budgets = []
        this.totalRecords = 0

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data budget: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
            icon: 'error',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchBudgetById(id: number) {
      this.loading = true
      this.error = null
      const toast = useToast()
      const { $api } = useNuxtApp()

      try {
        const response = await fetch(`${$api.budgets()}/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat detail budget.',
          }))
          throw new Error(errorData.message || 'Gagal memuat detail budget.')
        }

        const result = await response.json()
        this.selectedBudget = result
        return result
      } catch (e: any) {
        console.error('Error fetching budget:', e)
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat detail budget: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        throw e
      } finally {
        this.loading = false
      }
    },

    async saveBudget() {
      this.saving = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const toast = useToast()

      try {
        const payload = {
          budgetName: this.form.budgetName,
          status: this.form.status || 'draft',
          costCenterId: this.form.costCenterId || null,
          totalAmount: this.form.totalAmount,
          startDate: this.form.startDate || null,
          endDate: this.form.endDate || null,
          budgetAllos: this.form.budgetAllos || [],
        }

        let method = 'POST'
        let url = $api.budgets()

        if (this.isEditMode && this.form.id) {
          url = `${$api.budgets()}/${this.form.id}`
          method = 'PUT'
        }

        const response = await fetch(url, {
          method,
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Budget gagal diperbarui.' : 'Budget gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toast.error({
            title: err.type === 'validation' ? 'Validasi' : 'Error',
            message: err.message,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
          return false
        }

        this.closeModal()
        await this.fetchBudgets(true)
        await this.fetchStatistics()

        toast.success({
          title: 'Success',
          message: `Budget berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (error: any) {
        console.error('Error saving budget:', error)
        if (this.validationErrors.length === 0) {
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
        }
      } finally {
        this.saving = false
      }
    },

    async deleteBudget(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data budget yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        customClass: {
          container: 'swal2-container-custom',
        },
        zIndex: 9999,
      })

      if (result.isConfirmed) {
        this.loading = true
        try {
          const url = `${$api.budgets()}/${id}`

          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Budget gagal dihapus.')
            throw new Error(err.message)
          }

          await this.fetchBudgets(true)
          await this.fetchStatistics()

          toast.success({
            title: 'Success',
            message: 'Budget berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          })
        } catch (error: any) {
          console.error('Error deleting budget:', error)
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus budget',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
        } finally {
          this.loading = false
        }
      }
    },

    async approveBudget(id: number) {
      const { $api } = useNuxtApp()
      const toast = useToast()

      try {
        // Ambil detail budget termasuk alokasi untuk pengecekan
        const budgetDetail = await this.fetchBudgetById(id)
        const totalAllocated = (budgetDetail.budgetAllos || []).reduce(
          (sum: number, allo: any) => sum + (Number(allo.amount) || 0),
          0
        )

        let alertText = 'Apakah Anda yakin ingin meng-approve budget ini?'
        if (budgetDetail.totalAmount && totalAllocated > budgetDetail.totalAmount) {
          alertText =
            'Total alokasi lebih besar dari budget yang dibuat. Apakah Anda tetap ingin meng-approve budget ini?'
        }

        const result = await Swal.fire({
          title: 'Approve Budget?',
          text: alertText,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#008fec',
          cancelButtonColor: '#f13636',
          confirmButtonText: 'Ya, Approve!',
          cancelButtonText: 'Batal',
          customClass: {
            container: 'swal2-container-custom',
          },
          zIndex: 9999,
        })

        if (!result.isConfirmed) {
          return
        }

        this.loading = true
        const response = await fetch(`${$api.budgets()}/${id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Budget gagal disetujui.')
          throw new Error(err.message)
        }

        await this.fetchBudgets(true)
        await this.fetchStatistics()

        toast.success({
          title: 'Success',
          message: 'Budget berhasil di-approve.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
      } catch (error: any) {
        console.error('Error approving budget:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal approve budget',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async rejectBudget(id: number) {
      const { $api } = useNuxtApp()
      const toast = useToast()

      const result = await Swal.fire({
        title: 'Reject Budget?',
        text: 'Apakah Anda yakin ingin menolak budget ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, Tolak!',
        cancelButtonText: 'Batal',
        customClass: {
          container: 'swal2-container-custom',
        },
        zIndex: 9999,
      })

      if (result.isConfirmed) {
        this.loading = true
        try {
          const response = await fetch(`${$api.budgets()}/${id}/reject`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Budget gagal ditolak.')
            throw new Error(err.message)
          }

          await this.fetchBudgets(true)
          await this.fetchStatistics()

          toast.success({
            title: 'Success',
            message: 'Budget berhasil ditolak.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          })
        } catch (error: any) {
          console.error('Error rejecting budget:', error)
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal reject budget',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
        } finally {
          this.loading = false
        }
      }
    },

    async fetchStatistics() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch(`${$api.budgetStatistics()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (response.ok) {
          const result = await response.json()
          this.statistics = result
        }
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
    },

    addAllocation() {
      this.form.budgetAllos.push({
        siteId: null,
        amount: 0,
      })
    },

    removeAllocation(index: number) {
      this.form.budgetAllos.splice(index, 1)
    },

    openModal(budget?: Budget) {
      this.isEditMode = !!budget
      this.validationErrors = []

      if (budget) {
        this.form = {
          ...budget,
          budgetAllos: budget.budgetAllos || [],
        }
      } else {
        this.form = {
          budgetCode: '',
          budgetName: '',
          status: 'draft',
          costCenterId: null,
          totalAmount: 0,
          startDate: null,
          endDate: null,
          budgetAllos: [],
        }
      }

      // Tambahkan 1 alokasi default jika kosong (seperti di PO)
      if (!this.form.budgetAllos || this.form.budgetAllos.length === 0) {
        this.form.budgetAllos = [{
          siteId: null,
          amount: 0,
        }]
      }

      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        budgetCode: '',
        budgetName: '',
        status: 'draft',
        costCenterId: null,
        totalAmount: 0,
        startDate: null,
        endDate: null,
        budgetAllos: [],
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first || 0
      this.params.rows = event.rows || 10
      this.fetchBudgets(true)
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || 'budgetCode'
      this.params.sortOrder = event.sortOrder || 1
      this.fetchBudgets(true)
    },

    setSearch(search: string) {
      this.params.search = search
      this.params.first = 0
      this.fetchBudgets(true)
    },

    async fetchBudgetsForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.budgetExportExcel()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data budget untuk export dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data budget untuk export')
        }

        const result = await response.json()
        return {
          data: result.data || [],
        }
      } catch (error: any) {
        console.error('Error fetching budgets for export:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data budget untuk export',
          color: 'red',
          position: 'bottomRight',
        })
        throw error
      }
    },
  },
})
