import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Expense {
  id?: number
  reference_number: string
  date: string
  description: string
  amount: number
  category: string
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card'
  bank_account_id?: number
  vendor_id?: number
  tax_id?: number
  tax_amount: number
  total_amount: number
  status: 'draft' | 'approved' | 'paid' | 'cancelled'
  notes?: string
  attachments?: File[]
  created_by?: number
  approved_by?: number
  approved_at?: string
  bank_account?: any
  vendor?: any
  tax?: any
  created_by_user?: any
  approved_by_user?: any
}

interface ExpenseState {
  expenses: Expense[]
  selectedExpense: Expense | null
  loading: boolean
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
  expenseCategories: { value: string; label: string }[]
  expenseStatuses: { value: string; label: string }[]
  bankAccounts: any[]
  vendors: any[]
  taxes: any[]
}

export const useExpenseStore = defineStore('expense', {
  state: (): ExpenseState => ({
    expenses: [],
    selectedExpense: null,
    loading: false,
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
      reference_number: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: '',
      payment_method: 'cash',
      bank_account_id: undefined,
      vendor_id: undefined,
      tax_id: undefined,
      tax_amount: 0,
      total_amount: 0,
      status: 'draft',
      notes: '',
      attachments: []
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
    expenseCategories: [
      { value: 'office_supplies', label: 'Perlengkapan Kantor' },
      { value: 'utilities', label: 'Utilitas' },
      { value: 'rent', label: 'Sewa' },
      { value: 'salary', label: 'Gaji' },
      { value: 'marketing', label: 'Pemasaran' },
      { value: 'travel', label: 'Perjalanan' },
      { value: 'maintenance', label: 'Pemeliharaan' },
      { value: 'insurance', label: 'Asuransi' },
      { value: 'legal', label: 'Hukum' },
      { value: 'other', label: 'Lainnya' }
    ],
    expenseStatuses: [
      { value: 'draft', label: 'Draft' },
      { value: 'approved', label: 'Disetujui' },
      { value: 'paid', label: 'Dibayar' },
      { value: 'cancelled', label: 'Dibatalkan' }
    ],
    bankAccounts: [],
    vendors: [],
    taxes: []
  }),

  actions: {
    async fetchExpenses() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.expenses()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pengeluaran.' }));
          throw new Error(errorData.message || 'Gagal memuat data pengeluaran.');
        }

        const result = await response.json()
        this.expenses = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        Swal.fire('Error', `Tidak dapat memuat data pengeluaran: ${e.message}`, 'error');
      } finally {
        this.loading = false
      }
    },

    async fetchBankAccounts() {
      const { $api } = useNuxtApp()
      try {
        const token = localStorage.getItem('token');
        const response = await fetch($api.bankAccounts(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json()
          this.bankAccounts = result.data
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error)
      }
    },

    async fetchVendors() {
      const { $api } = useNuxtApp()
      try {
        const token = localStorage.getItem('token');
        const response = await fetch($api.vendor(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json()
          this.vendors = result.data
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
      }
    },

    async fetchTaxes() {
      const { $api } = useNuxtApp()
      try {
        const token = localStorage.getItem('token');
        const response = await fetch($api.taxes(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json()
          this.taxes = result.data
        }
      } catch (error) {
        console.error('Error fetching taxes:', error)
      }
    },

    async saveExpense() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        
        const fieldsToSend = ['reference_number', 'date', 'description', 'amount', 'category', 'payment_method', 'bank_account_id', 'vendor_id', 'tax_id', 'tax_amount', 'total_amount', 'status', 'notes'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        // Handle attachments
        if (this.form.attachments && Array.isArray(this.form.attachments)) {
          this.form.attachments.forEach((file, index) => {
            if (file instanceof File) {
              formData.append(`attachments[${index}]`, file);
            }
          });
        }

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
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Server response tidak valid');
        }

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            this.validationErrors = Object.values(result.errors).flat();
            return;
          }
          throw new Error(result.message || 'Gagal menyimpan data pengeluaran');
        }
        
        this.closeModal();
        await this.fetchExpenses();
        Swal.fire('Berhasil!', `Pengeluaran berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`, 'success');

      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          Swal.fire('Error', error.message || 'Operasi gagal', 'error');
        }
      } finally {
        this.loading = false
      }
    },

    async deleteExpense(id: number) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data pengeluaran yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch($api.expensesDelete(id), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus pengeluaran.' }));
            throw new Error(errorData.message || 'Gagal menghapus pengeluaran.');
          }

          await this.fetchExpenses();
          Swal.fire('Berhasil!', 'Pengeluaran berhasil dihapus.', 'success');
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Gagal menghapus pengeluaran', 'error');
        }
      }
    },

    async approveExpense(id: number) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Setujui Pengeluaran?',
        text: "Apakah Anda yakin ingin menyetujui pengeluaran ini?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Setujui!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${$api.expenses()}/approve/${id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menyetujui pengeluaran.' }));
            throw new Error(errorData.message || 'Gagal menyetujui pengeluaran.');
          }

          await this.fetchExpenses();
          Swal.fire('Berhasil!', 'Pengeluaran berhasil disetujui.', 'success');
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Gagal menyetujui pengeluaran', 'error');
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
          reference_number: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: 0,
          category: '',
          payment_method: 'cash',
          bank_account_id: undefined,
          vendor_id: undefined,
          tax_id: undefined,
          tax_amount: 0,
          total_amount: 0,
          status: 'draft',
          notes: '',
          attachments: []
        };
      }
      
      this.showModal = true;
      this.fetchBankAccounts();
      this.fetchVendors();
      this.fetchTaxes();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        reference_number: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: '',
        payment_method: 'cash',
        bank_account_id: undefined,
        vendor_id: undefined,
        tax_id: undefined,
        tax_amount: 0,
        total_amount: 0,
        status: 'draft',
        notes: '',
        attachments: []
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

    calculateTotalAmount() {
      const amount = this.form.amount || 0;
      const taxAmount = this.form.tax_amount || 0;
      this.form.total_amount = amount + taxAmount;
    },

    handleTaxChange() {
      const amount = this.form.amount || 0;
      const tax = this.taxes.find(t => t.id === this.form.tax_id);
      
      if (tax) {
        if (tax.type === 'percentage') {
          this.form.tax_amount = (amount * tax.rate) / 100;
        } else {
          this.form.tax_amount = tax.rate;
        }
      } else {
        this.form.tax_amount = 0;
      }
      
      this.calculateTotalAmount();
    }
  }
})
