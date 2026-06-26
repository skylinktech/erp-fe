import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Account {
  id?: string
  code: string
  name: string
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  normalBalance: 'debit' | 'credit'
  isParent: boolean
  parentId?: string | null
  level: number
  parent?: Account
  children?: Account[]
}

interface AccountState {
  accounts: Account[]
  selectedAccount: Account | null
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
  form: Partial<Account>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  parentAccounts: Account[]
  accountTypes: { value: string; label: string }[]
  accountCategories: { value: string; label: string }[]
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    accounts: [],
    selectedAccount: null,
    loading: false,
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'code',
      sortOrder: 1,
      search: '',
    },
    form: {
      code: '',
      name: '',
      category: 'asset' as const,
      normalBalance: 'debit' as const,
      isParent: false,
      parentId: null,
      level: 1
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    parentAccounts: [],
    accountTypes: [
      { value: 'asset' as const, label: 'Asset' },
      { value: 'liability' as const, label: 'Liability' },
      { value: 'equity' as const, label: 'Equity' },
      { value: 'revenue' as const, label: 'Revenue' },
      { value: 'expense' as const, label: 'Expense' }
    ],
    accountCategories: [
      { value: 'asset' as const, label: 'Asset' },
      { value: 'liability' as const, label: 'Liability' },
      { value: 'equity' as const, label: 'Equity' },
      { value: 'revenue' as const, label: 'Revenue' },
      { value: 'expense' as const, label: 'Expense' }
    ]
  }),

  actions: {
    async fetchAccounts(suppressError = false) {
      this.loading = true
      this.error = null
      const toast = useToast();
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.accounts()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data akun.' }));
          throw new Error(errorData.message || 'Gagal memuat data akun.');
        }

        const result = await response.json()
        
        // Pastikan accounts selalu berupa array
        if (result.data && result.data.data) {
          this.accounts = result.data.data
          this.totalRecords = result.data.meta?.total || 0
        } else if (result.data && Array.isArray(result.data)) {
          this.accounts = result.data
          this.totalRecords = result.meta?.total || result.data.length
        } else {
          this.accounts = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        console.error('Error fetching accounts:', e)
        this.error = e.message
        this.accounts = []
        this.totalRecords = 0
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data akun: ${e.message}`,
            color: 'red',
            position: 'topRight',
            layout: 2,
            icon: 'error',
          });
        }
      } finally {
        this.loading = false
      }
    },

    async fetchChartOfAccounts() {
      this.loading = true
      this.error = null
      const toast = useToast();
      const { $api } = useNuxtApp()
      try {
        // Gunakan endpoint chart-of-accounts yang mengembalikan semua top-level accounts
        const response = await fetch($api.accountsChartOfAccounts(), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat Chart of Accounts.' }));
          throw new Error(errorData.message || 'Gagal memuat Chart of Accounts.');
        }

        const result = await response.json()
        
        // Chart of Accounts mengembalikan data langsung tanpa pagination
        if (result.data && Array.isArray(result.data)) {
          this.accounts = result.data
          this.totalRecords = result.data.length
        } else {
          this.accounts = []
          this.totalRecords = 0
        }
        
      } catch (e: any) {
        console.error('Error fetching Chart of Accounts:', e)
        this.error = e.message
        this.accounts = []
        this.totalRecords = 0
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat Chart of Accounts: ${e.message}`,
          color: 'red',
          position: 'topRight',
          layout: 2,
          icon: 'error',
        });
      } finally {
        this.loading = false
      }
    },

    async fetchParentAccounts() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.accountsParentAccounts(), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (response.ok) {
          const result = await response.json()
          this.parentAccounts = Array.isArray(result.data) ? result.data : []
        } else {
          this.parentAccounts = []
        }
      } catch (error) {
        console.error('Error fetching parent accounts:', error)
        this.parentAccounts = []
      }
    },

    async saveAccount() {
      this.saving = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()
      const toast = useToast();

      try {
        // Gunakan JSON data instead of FormData
        const payload = {
          code: this.form.code,
          name: this.form.name,
          category: this.form.category,
          normalBalance: this.form.normalBalance,
          isParent: this.form.isParent,
          parentId: this.form.parentId || null,
          level: this.form.level || 1
        };

        let method = 'POST';
        let url = $api.accounts();
        if (this.isEditMode && this.form.id) {
          url = $api.accounts() + '/' + this.form.id;
          method = 'PUT';
        }



        const response = await fetch(url, {
          method: method,
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
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
          throw new Error(result.message || 'Gagal menyimpan data akun');
        }
        
        this.closeModal();
        await this.fetchAccounts();
        toast.success({
          title: 'Success',
          message: `Akun berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
          layout: 2,
        });

      } catch (error: any) {
        console.error('Error saving account:', error)
        if (this.validationErrors.length === 0) {
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        }
      } finally {
        this.saving = false
      }
    },

    async deleteAccount(id: string | number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data akun yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const url = $api.accounts() + '/' + id;

          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus akun.' }));
            console.error('Delete response error:', errorData);
            if (response.status === 401) {
              throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
            } else if (response.status === 404) {
              throw new Error('Akun tidak ditemukan atau sudah dihapus.');
            } else if (response.status === 400) {
              throw new Error(errorData.message || 'Tidak dapat menghapus akun. Pastikan akun tidak memiliki sub-akun atau digunakan dalam jurnal.');
            } else {
              throw new Error(errorData.message || 'Gagal menghapus akun.');
            }
          }

          await this.fetchAccounts();
          toast.success({
            title: 'Success',
            message: 'Akun berhasil dihapus.',
            color: 'green',
            position: 'topRight',
            layout: 2,
          });
        } catch (error: any) {
          console.error('Error deleting account:', error)
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus akun',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        } finally {
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    },

    openModal(account?: Account) {
      this.isEditMode = !!account;
      this.validationErrors = [];
      
      if (account) {
        this.form = { ...account };
      } else {
        this.form = {
          code: '',
          name: '',
          category: 'asset' as const,
          normalBalance: 'debit' as const,
          isParent: false,
          parentId: null,
          level: 1
        };
      }
      
      this.showModal = true;
      this.fetchParentAccounts();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        code: '',
        name: '',
        category: 'asset' as const,
        normalBalance: 'debit' as const,
        isParent: false,
        parentId: null,
        level: 1
      };
      this.validationErrors = [];
    },

    setPagination(event: any) {
      this.params.first = event.first || 0;
      this.params.rows = event.rows || 10;
      this.fetchAccounts();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || 'code';
      this.params.sortOrder = event.sortOrder || 1;
      this.fetchAccounts();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchAccounts();
    }
  }
})
