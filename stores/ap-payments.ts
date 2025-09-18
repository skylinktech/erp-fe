import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { useUserStore } from '~/stores/user'

export interface APPayment {
  id?: string
  referenceNumber: string
  date: string
  vendorId: string
  invoiceId?: string
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'giro'
  bankAccountId?: string
  amount: number
  currency: string
  exchangeRate: number
  notes?: string
  status: 'draft' | 'confirmed' | 'cancelled'
  createdBy?: number
  updatedBy?: number
  created_by?: string
  confirmed_by?: string
  confirmed_at?: string
  vendor?: any
  invoice?: any
  bank_account?: any
  created_by_user?: any
  confirmed_by_user?: any
}

interface APPaymentState {
  payments: APPayment[]
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
  form: Partial<APPayment>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  vendors: any[]
  invoices: any[]
  bankAccounts: any[]
  paymentMethods: { value: string; label: string }[]
  currencies: { value: string; label: string }[]
  statuses: { value: string; label: string }[]
}

export const useAPPaymentStore = defineStore('apPayment', {
  state: (): APPaymentState => ({
    payments: [],
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
      referenceNumber: '',
      date: new Date().toISOString().split('T')[0],
      vendorId: '',
      invoiceId: '',
      paymentMethod: 'bank_transfer',
      bankAccountId: '',
      amount: 0,
      currency: 'IDR',
      exchangeRate: 1,
      notes: '',
      status: 'draft'
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    vendors: [],
    invoices: [],
    bankAccounts: [],
    paymentMethods: [
      { value: 'cash', label: 'Tunai' },
      { value: 'bank_transfer', label: 'Transfer Bank' },
      { value: 'check', label: 'Cek' },
      { value: 'credit_card', label: 'Kartu Kredit' },
      { value: 'giro', label: 'Giro' }
    ],
    currencies: [
      { value: 'IDR', label: 'Rupiah (IDR)' },
      { value: 'USD', label: 'US Dollar (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'SGD', label: 'Singapore Dollar (SGD)' },
      { value: 'JPY', label: 'Japanese Yen (JPY)' }
    ],
    statuses: [
      { value: 'draft', label: 'Draft' },
      { value: 'confirmed', label: 'Dikonfirmasi' },
      { value: 'cancelled', label: 'Dibatalkan' }
    ]
  }),

  actions: {
    async fetchPayments() {
      this.loading = true
      this.error = null
      const toast = useToast();
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

        const response = await fetch(`${$api.apPayments()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pembayaran.' }));
          throw new Error(errorData.message || 'Gagal memuat data pembayaran.');
        }

        const result = await response.json()
        
        if (result.data && result.data.data) {
          this.payments = result.data.data
          this.totalRecords = result.data.meta?.total || 0
        } else if (result.data && Array.isArray(result.data)) {
          this.payments = result.data
          this.totalRecords = result.meta?.total || result.data.length
        } else {
          this.payments = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        console.error('Error fetching payments:', e)
        this.error = e.message
        this.payments = []
        this.totalRecords = 0
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data pembayaran: ${e.message}`,
          color: 'red',
          position: 'topRight',
          layout: 2,
          icon: 'error',
        });
      } finally {
        this.loading = false
      }
    },

    async fetchVendors() {
      const { $api } = useNuxtApp()
      const toast = useToast();
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          this.vendors = []
          return
        }
        
        // Gunakan dataVendor endpoint yang mengembalikan semua vendor tanpa pagination
        const response = await fetch($api.dataVendor(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json()
          // dataVendor mengembalikan array langsung, bukan dengan wrapper data
          this.vendors = Array.isArray(result) ? result : []
        } else {
          // Fallback ke endpoint vendor biasa
          try {
            const fallbackResponse = await fetch($api.vendor(), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              credentials: 'include'
            });
            
            if (fallbackResponse.ok) {
              const fallbackResult = await fallbackResponse.json()
              this.vendors = Array.isArray(fallbackResult.data) ? fallbackResult.data : []
            } else {
              this.vendors = []
            }
          } catch (fallbackError) {
            this.vendors = []
          }
          
          if (response.status === 401) {
            toast.error({
              title: 'Error',
              message: 'Sesi Anda telah berakhir. Silakan login kembali.',
              color: 'red',
              position: 'topRight',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
        this.vendors = []
        
        toast.error({
          title: 'Error',
          message: 'Gagal memuat data vendor',
          color: 'red',
          position: 'topRight',
        });
      }
    },

    async fetchInvoices() {
      const { $api } = useNuxtApp()
      const toast = useToast();
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          this.invoices = []
          return
        }
        
        // Tambahkan parameter untuk mengambil semua data
        const params = new URLSearchParams({
          rows: '1000', // Ambil banyak data untuk dropdown
          page: '1'
        });
        
        const response = await fetch(`${$api.purchaseInvoice()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json()
          // Handle both paginated and direct array response
          if (result.data && Array.isArray(result.data)) {
            this.invoices = result.data
          } else if (Array.isArray(result)) {
            this.invoices = result
          } else {
            this.invoices = []
          }
          console.log(`📄 Fetched ${this.invoices.length} invoices for dropdown`);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch invoices:', response.status, response.statusText, errorText);
          this.invoices = []
          
          if (response.status === 401) {
            toast.error({
              title: 'Error',
              message: 'Sesi Anda telah berakhir. Silakan login kembali.',
              color: 'red',
              position: 'topRight',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
        this.invoices = []
        
        toast.error({
          title: 'Error',
          message: 'Gagal memuat data invoice',
          color: 'red',
          position: 'topRight',
        });
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
          this.bankAccounts = Array.isArray(result.data) ? result.data : []
        } else {
          this.bankAccounts = []
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error)
        this.bankAccounts = []
      }
    },

    async savePayment() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()
      const toast = useToast();

      try {
        const token = localStorage.getItem('token')
        const userStore = useUserStore()

        const payload = {
          referenceNumber: this.form.referenceNumber,
          date: this.form.date,
          vendorId: this.form.vendorId,
          invoiceId: this.form.invoiceId || null,
          paymentMethod: this.form.paymentMethod,
          bankAccountId: this.form.bankAccountId || null,
          amount: this.form.amount,
          currency: this.form.currency,
          exchangeRate: this.form.exchangeRate,
          notes: this.form.notes,
          status: this.form.status,
          createdBy: userStore.user?.id || 1,
          updatedBy: userStore.user?.id || 1
        };

        let method = 'POST';
        let url = $api.apPayments();
        if (this.isEditMode && this.form.id) {
          url = $api.apPayments() + '/' + this.form.id;
          method = 'PUT';
        }

        const response = await fetch(url, {
          method: method,
          body: JSON.stringify(payload),
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
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
          throw new Error(result.message || 'Gagal menyimpan data pembayaran');
        }
        
        this.closeModal();
        await this.fetchPayments();
        toast.success({
          title: 'Success',
          message: `Pembayaran berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
          layout: 2,
        });

      } catch (error: any) {
        console.error('Error saving payment:', error)
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
        this.loading = false
      }
    },

    async deletePayment(id: string | number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data pembayaran yang dihapus tidak dapat dikembalikan!",
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
          const url = $api.apPayments() + '/' + id;

          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus pembayaran.' }));
            console.error('Delete response error:', errorData);
            if (response.status === 401) {
              throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
            } else if (response.status === 404) {
              throw new Error('Pembayaran tidak ditemukan atau sudah dihapus.');
            } else if (response.status === 400) {
              throw new Error(errorData.message || 'Tidak dapat menghapus pembayaran.');
            } else {
              throw new Error(errorData.message || 'Gagal menghapus pembayaran.');
            }
          }

          await this.fetchPayments();
          toast.success({
            title: 'Success',
            message: 'Pembayaran berhasil dihapus.',
            color: 'green',
            position: 'topRight',
            layout: 2,
          });
        } catch (error: any) {
          console.error('Error deleting payment:', error)
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus pembayaran',
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

    async confirmPayment(id: string | number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
      try {
        const token = localStorage.getItem('token');
        const url = $api.apPayments() + '/' + id + '/confirm';

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mengkonfirmasi pembayaran.' }));
          throw new Error(errorData.message || 'Gagal mengkonfirmasi pembayaran.');
        }

        await this.fetchPayments();
        toast.success({
          title: 'Success',
          message: 'Pembayaran berhasil dikonfirmasi.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        });
      } catch (error: any) {
        console.error('Error confirming payment:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mengkonfirmasi pembayaran',
          color: 'red',
          position: 'topRight',
          layout: 2,
        });
      }
    },

    openModal(payment?: APPayment) {
      this.isEditMode = !!payment;
      this.validationErrors = [];
      
      if (payment) {
        this.form = { ...payment };
      } else {
        this.form = {
          referenceNumber: '',
          date: new Date().toISOString().split('T')[0],
          vendorId: '',
          invoiceId: '',
          paymentMethod: 'bank_transfer',
          bankAccountId: '',
          amount: 0,
          currency: 'IDR',
          exchangeRate: 1,
          notes: '',
          status: 'draft'
        };
      }
      
      this.showModal = true;
      this.fetchVendors();
      this.fetchInvoices();
      this.fetchBankAccounts();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        referenceNumber: '',
        date: new Date().toISOString().split('T')[0],
        vendorId: '',
        invoiceId: '',
        paymentMethod: 'bank_transfer',
        bankAccountId: '',
        amount: 0,
        currency: 'IDR',
        exchangeRate: 1,
        notes: '',
        status: 'draft'
      };
      this.validationErrors = [];
    },

    setPagination(event: any) {
      this.params.first = event.first || 0;
      this.params.rows = event.rows || 10;
      this.fetchPayments();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || 'date';
      this.params.sortOrder = event.sortOrder || -1;
      this.fetchPayments();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchPayments();
    }
  }
})