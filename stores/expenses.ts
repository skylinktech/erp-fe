import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface Expense {
  id?: string
  expenseNumber: string
  date: string
  description: string
  amount: number
  paymentMethod: string
  bankAccountId?: string
  departemenId: number
  createdBy?: number
  updatedBy?: number
  departemen?: any
  bankAccount?: any
  createdByUser?: any
  updatedByUser?: any
}

interface ExpenseState {
  expenses: Expense[]
  selectedExpense: Expense | null
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
  form: Partial<Expense>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  paymentMethods: { value: string; label: string }[]
  bankAccounts: any[]
  departments: any[]
}

export const useExpenseStore = defineStore('expense', {
  state: (): ExpenseState => ({
    expenses: [],
    selectedExpense: null,
    loading: false,
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'date',
      sortOrder: -1,
      search: '',
    },
    form: {
      expenseNumber: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      paymentMethod: 'cash',
      bankAccountId: undefined,
      departemenId: undefined,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    paymentMethods: [
      { value: 'cash', label: 'Tunai' },
      { value: 'bank_transfer', label: 'Transfer Bank' },
      { value: 'check', label: 'Cek' },
      { value: 'credit_card', label: 'Kartu Kredit' }
    ],
    bankAccounts: [],
    departments: []
  }),

  actions: {
    async fetchExpenses() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          limit: Math.floor(this.params.rows).toString(),
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.expenses()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pengeluaran.' }));
          throw new Error(errorData.message || 'Gagal memuat data pengeluaran.');
        }

        const result = await response.json()
        
        // Handle paginated response format from AdonisJS
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          this.expenses = result.data.data
          this.totalRecords = result.data.meta?.total || 0
        } else if (result.data && Array.isArray(result.data)) {
          this.expenses = result.data
          this.totalRecords = result.data.length
        } else {
          this.expenses = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        this.error = e.message
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data pengeluaran: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false
      }
    },

    async fetchBankAccounts() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.bankAccounts(), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (response.ok) {
          const result = await response.json()
          this.bankAccounts = result.data
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error)
      }
    },

    async fetchDepartments() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.dataDepartemen(), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (response.ok) {
          const result = await response.json()
          this.departments = Array.isArray(result) ? result : []
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    },

    async saveExpense() {
      this.saving = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const formData = new FormData()
        
        const fieldsToSend = ['expenseNumber', 'date', 'description', 'amount', 'paymentMethod', 'bankAccountId', 'departemenId'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        // Add user info
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        formData.append('createdBy', String(user.id || 1))
        formData.append('updatedBy', String(user.id || 1))

        let method = 'POST';
        let url = $api.expensesStore();
        if (this.isEditMode && this.form.id) {
          url = $api.expensesUpdate(this.form.id);
          method = 'PUT';
        }

        const response = await fetch(url, {
          method: method,
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Pengeluaran gagal diperbarui.' : 'Pengeluaran gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        
        this.closeModal();
        await this.fetchExpenses();
        const toast = useToast()        
        toast.success({
          title: 'Success',
          message: `Pengeluaran berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        });

      } catch (error: any) {
        const err = normalizeApiError(error, 'Pengeluaran gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteExpense(id: string) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data pengeluaran yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch($api.expensesDelete(id), {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Pengeluaran gagal dihapus.')
            toastNormalizedError(err)
            return false
          }

          await this.fetchExpenses();
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Pengeluaran berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
        } catch (error: any) {
          const err = normalizeApiError(error, 'Pengeluaran gagal dihapus.')
          toastNormalizedError(err)
        }
      }
    },


    openModal(expense?: Expense) {
      this.isEditMode = !!expense;
      this.validationErrors = [];
      
      if (expense) {
        this.form = { ...expense };
      } else {
        this.form = {
          expenseNumber: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: 0,
          paymentMethod: 'cash',
          bankAccountId: undefined,
          departemenId: undefined,
        };
      }
      
      this.showModal = true;
      this.fetchBankAccounts();
      this.fetchDepartments();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        expenseNumber: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        paymentMethod: 'cash',
        bankAccountId: undefined,
        departemenId: undefined,
      };
      this.validationErrors = [];
    },

    setPagination(event: any) {
      this.params.first = event.first;
      this.params.rows = event.rows;
      this.fetchExpenses();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField;
      this.params.sortOrder = event.sortOrder;
      this.fetchExpenses();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchExpenses();
    },

  }
})
