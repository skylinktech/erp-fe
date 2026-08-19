import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface BankAccount {
  id?: number | string
  account_name: string
  account_number: string
  bank_name: string
  currency: string
  opening_balance: number
  ledger_balance?: number
  unreconciled_count?: number
  account_id?: string | null
  gl_account?: { id: string; code: string; name: string } | null
  is_active?: boolean
}

interface BankAccountState {
  bankAccounts: BankAccount[]
  selectedBankAccount: BankAccount | null
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
  form: Partial<BankAccount>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  accountTypes: { value: string; label: string }[]
  currencies: { value: string; label: string }[]
  cashAccounts: { id: string; code: string; name: string }[]
}

export const useBankAccountStore = defineStore('bankAccount', {
  state: (): BankAccountState => ({
    bankAccounts: [],
    selectedBankAccount: null,
    loading: false,
    saving: false,
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
      opening_balance: 0,
      account_id: '',
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
    ],
    cashAccounts: [],
  }),

  actions: {
    async fetchBankAccounts() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.bankAccounts()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
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
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data rekening bank: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false
      }
    },

    async saveBankAccount() {
      this.saving = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const formData = new FormData()
        
        const fieldsToSend = ['account_name', 'account_number', 'bank_name', 'currency', 'opening_balance', 'account_id'];
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
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Rekening Bank gagal diperbarui.' : 'Rekening Bank gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }
        
        this.closeModal();
        await this.fetchBankAccounts();
        const toast = useToast()        
        toast.success({
          title: 'Success',
          message: `Rekening bank berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        });

      } catch (error: any) {
        const err = normalizeApiError(error, 'Rekening Bank gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteBankAccount(id: number) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data rekening bank yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f13636',
        cancelButtonColor: '#008fec',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch($api.bankAccountsDelete(id), {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Rekening Bank gagal dihapus.')
            toastNormalizedError(err)
            return false
          }

          await this.fetchBankAccounts();
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Rekening bank berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
        } catch (error: any) {
          const err = normalizeApiError(error, 'Rekening Bank gagal dihapus.')
          toastNormalizedError(err)
        }
      }
    },

    openModal(bankAccount?: BankAccount) {
      this.isEditMode = !!bankAccount;
      this.validationErrors = [];
      
      if (bankAccount) {
      this.form = { ...bankAccount, account_id: bankAccount.account_id || bankAccount.gl_account?.id || '' };
      } else {
        this.form = {
          account_name: '',
          account_number: '',
          bank_name: '',
          currency: 'IDR',
          opening_balance: 0,
          account_id: '',
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
        opening_balance: 0,
        account_id: '',
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
    },

    async fetchCashAccounts() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.accountsByCategory('asset'), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) return
        const result = await response.json()
        const rows = Array.isArray(result.data) ? result.data : result.data?.data || []
        this.cashAccounts = rows.filter((a: any) => {
          const code = String(a.code || '')
          const name = String(a.name || '').toLowerCase()
          return !a.is_parent && (code.startsWith('1-10') || name.includes('bank') || name.includes('kas') || name.includes('cash'))
        }).map((a: any) => ({ id: a.id, code: a.code, name: a.name }))
      } catch {
        this.cashAccounts = []
      }
    },

    async fetchBankAccount(id: string | number) {
      const { $api } = useNuxtApp()
      const response = await fetch($api.bankAccountsShow(id), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal memuat rekening bank')
      this.selectedBankAccount = result.data
      return result.data
    },

    async fetchLedger(id: string | number, query: Record<string, string | number> = {}) {
      const { $api } = useNuxtApp()
      const params = new URLSearchParams()
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
      })
      const response = await fetch($api.bankAccountLedger(id, params.toString()), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal memuat bank ledger')
      return {
        rows: Array.isArray(result.data) ? result.data : result.data?.data || [],
        meta: result.meta || {},
      }
    },
  }
})
