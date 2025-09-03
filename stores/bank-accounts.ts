import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface BankAccount {
  id?: number
  account_name: string
  account_number: string
  bank_name: string
  currency: string
  opening_balance: number
}

interface BankAccountState {
  bankAccounts: BankAccount[]
  selectedBankAccount: BankAccount | null
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
  form: Partial<BankAccount>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  accountTypes: { value: string; label: string }[]
  currencies: { value: string; label: string }[]
}

export const useBankAccountStore = defineStore('bankAccount', {
  state: (): BankAccountState => ({
    bankAccounts: [],
    selectedBankAccount: null,
    loading: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'account_name',
      sortOrder: 1,
      search: '',
    },
    form: {
      account_name: '',
      account_number: '',
      bank_name: '',
      currency: 'IDR',
      opening_balance: 0
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    accountTypes: [
      { value: 'savings', label: 'Tabungan' },
      { value: 'checking', label: 'Giro' },
      { value: 'current', label: 'Koran' }
    ],
    currencies: [
      { value: 'IDR', label: 'Rupiah (IDR)' },
      { value: 'USD', label: 'US Dollar (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'SGD', label: 'Singapore Dollar (SGD)' },
      { value: 'JPY', label: 'Japanese Yen (JPY)' }
    ]
  }),

  actions: {
    async fetchBankAccounts() {
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

        const response = await fetch(`${$api.bankAccounts()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data rekening bank.' }));
          throw new Error(errorData.message || 'Gagal memuat data rekening bank.');
        }

        const result = await response.json()
        this.bankAccounts = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        Swal.fire('Error', `Tidak dapat memuat data rekening bank: ${e.message}`, 'error');
      } finally {
        this.loading = false
      }
    },

    async saveBankAccount() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        
        const fieldsToSend = ['account_name', 'account_number', 'bank_name', 'currency', 'opening_balance'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        let method = 'POST';
        let url = $api.bankAccountsStore();
        if (this.isEditMode && this.form.id) {
          url = $api.bankAccountsUpdate(this.form.id);
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
          throw new Error(result.message || 'Gagal menyimpan data rekening bank');
        }
        
        this.closeModal();
        await this.fetchBankAccounts();
        Swal.fire('Berhasil!', `Rekening bank berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`, 'success');

      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          Swal.fire('Error', error.message || 'Operasi gagal', 'error');
        }
      } finally {
        this.loading = false
      }
    },

    async deleteBankAccount(id: number) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data rekening bank yang dihapus tidak dapat dikembalikan!",
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
          const response = await fetch($api.bankAccountsDelete(id), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus rekening bank.' }));
            throw new Error(errorData.message || 'Gagal menghapus rekening bank.');
          }

          await this.fetchBankAccounts();
          Swal.fire('Berhasil!', 'Rekening bank berhasil dihapus.', 'success');
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Gagal menghapus rekening bank', 'error');
        }
      }
    },

    openModal(bankAccount?: BankAccount) {
      this.isEditMode = !!bankAccount;
      this.validationErrors = [];
      
      if (bankAccount) {
        this.form = { ...bankAccount };
      } else {
        this.form = {
          account_name: '',
          account_number: '',
          bank_name: '',
          currency: 'IDR',
          opening_balance: 0
        };
      }
      
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        account_name: '',
        account_number: '',
        bank_name: '',
        currency: 'IDR',
        opening_balance: 0
      };
      this.validationErrors = [];
    },

    setPagination(event: any) {
      this.params.first = event.first;
      this.params.rows = event.rows;
      this.fetchBankAccounts();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField;
      this.params.sortOrder = event.sortOrder;
      this.fetchBankAccounts();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchBankAccounts();
    }
  }
})
