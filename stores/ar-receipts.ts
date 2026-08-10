import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface ARReceipt {
  id?: string
  reference_number: string
  date: string
  customer_id: string
  invoice_id?: string
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'giro'
  bank_account_id?: string
  amount: number
  currency: string
  exchange_rate: number
  notes?: string
  status: 'draft' | 'confirmed' | 'cancelled'
  created_by?: string
  confirmed_by?: string
  confirmed_at?: string
  customer?: any
  invoice?: any
  bank_account?: any
  created_by_user?: any
  confirmed_by_user?: any
  allocations?: Array<{ salesInvoiceId: string; amount: number }>
  settlementLines?: any[]
  settlement_lines?: any[]
}

interface ARReceiptState {
  receipts: ARReceipt[]
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
  form: Partial<ARReceipt>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  customers: any[]
  invoices: any[]
  bankAccounts: any[]
  paymentMethods: { value: string; label: string }[]
  currencies: { value: string; label: string }[]
  statuses: { value: string; label: string }[]
}

export const useARReceiptStore = defineStore('arReceipt', {
  state: (): ARReceiptState => ({
    receipts: [],
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
      reference_number: '',
      date: new Date().toISOString().split('T')[0],
      customer_id: '',
      invoice_id: '',
      payment_method: 'bank_transfer',
      bank_account_id: '',
      amount: 0,
      currency: 'IDR',
      exchange_rate: 1,
      notes: '',
      status: 'draft',
      allocations: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    customers: [],
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
    async fetchReceipts() {
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

        const response = await fetch(`${$api.arReceipts()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data penerimaan.' }));
          throw new Error(errorData.message || 'Gagal memuat data penerimaan.');
        }

        const result = await response.json()
        
        // Support ApiResponse { data, meta } and Lucid nested paginator
        if (result.data && result.data.data) {
          this.receipts = result.data.data
          this.totalRecords = result.data.meta?.total || 0
        } else if (Array.isArray(result.data)) {
          this.receipts = result.data
          this.totalRecords = result.meta?.total || result.data.length
        } else {
          this.receipts = []
          this.totalRecords = 0
        }

        // Normalize display fields for FE that still reads snake_case
        this.receipts = this.receipts.map((r: any) => ({
          ...r,
          reference_number: r.reference_number || r.receiptNumber,
          customer_id: r.customer_id || r.customerId,
          invoice_id: r.invoice_id || r.salesInvoiceId,
          bank_account_id: r.bank_account_id || r.bankAccountId,
          payment_method: r.payment_method || r.method,
          notes: r.notes || r.description,
          status: r.status || 'draft',
          invoice: r.invoice || r.salesInvoice,
          bank_account: r.bank_account || r.bankAccount,
        }))
      } catch (e: any) {
        console.error('Error fetching receipts:', e)
        this.error = e.message
        this.receipts = []
        this.totalRecords = 0
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data penerimaan: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        });
      } finally {
        this.loading = false
      }
    },

    async fetchCustomers() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.customer(), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (response.ok) {
          const result = await response.json()
          this.customers = Array.isArray(result.data) ? result.data : []
        } else {
          this.customers = []
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        this.customers = []
      }
    },

    async fetchInvoices() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.salesInvoice(), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (response.ok) {
          const result = await response.json()
          this.invoices = Array.isArray(result.data) ? result.data : []
        } else {
          this.invoices = []
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
        this.invoices = []
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
          this.bankAccounts = Array.isArray(result.data) ? result.data : []
        } else {
          this.bankAccounts = []
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error)
        this.bankAccounts = []
      }
    },

    async saveReceipt() {
      this.saving = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()
      const toast = useToast();

      try {
        const payload = {
          receiptNumber: this.form.reference_number || this.form.receiptNumber,
          date: this.form.date,
          customerId: Number(this.form.customer_id || this.form.customerId),
          salesInvoiceId: this.form.invoice_id || this.form.salesInvoiceId || this.form.invoiceId,
          method: this.form.payment_method || this.form.method || 'bank_transfer',
          bankAccountId: this.form.bank_account_id || this.form.bankAccountId,
          amount: this.form.amount,
          description: this.form.notes || this.form.description || '',
        }
        const allocations = this.buildAllocationsPayload()
        if (allocations.length) {
          payload.allocations = allocations
          if (!payload.salesInvoiceId) {
            payload.salesInvoiceId = allocations[0].salesInvoiceId
          }
        }

        let method = 'POST'
        let url = $api.arReceipts()
        if (this.isEditMode && this.form.id) {
          url = $api.arReceipts() + '/' + this.form.id
          method = 'PUT'
        }

        const response = await fetch(url, {
          method: method,
          body: JSON.stringify(payload),
          headers: {
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
          throw new Error(result.message || 'Gagal menyimpan data penerimaan');
        }
        
        this.closeModal();
        await this.fetchReceipts();
        toast.success({
          title: 'Success',
          message: `Penerimaan berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        });

      } catch (error: any) {
        console.error('Error saving receipt:', error)
        if (this.validationErrors.length === 0) {
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          });
        }
      } finally {
        this.saving = false
      }
    },

    async deleteReceipt(id: string | number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data penerimaan yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const url = $api.arReceipts() + '/' + id;

          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus penerimaan.' }));
            console.error('Delete response error:', errorData);
            if (response.status === 401) {
              throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
            } else if (response.status === 404) {
              throw new Error('Penerimaan tidak ditemukan atau sudah dihapus.');
            } else if (response.status === 400) {
              throw new Error(errorData.message || 'Tidak dapat menghapus penerimaan.');
            } else {
              throw new Error(errorData.message || 'Gagal menghapus penerimaan.');
            }
          }

          await this.fetchReceipts();
          toast.success({
            title: 'Success',
            message: 'Penerimaan berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          });
        } catch (error: any) {
          console.error('Error deleting receipt:', error)
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus penerimaan',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          });
        } finally {
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    },

    async confirmReceipt(id: string | number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
      try {
        const url = $api.arReceiptsConfirm?.(id) || ($api.arReceipts() + '/' + id + '/confirm');

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal mengkonfirmasi penerimaan.' }));
          throw new Error(errorData.message || 'Gagal mengkonfirmasi penerimaan.');
        }

        await this.fetchReceipts();
        toast.success({
          title: 'Success',
          message: 'Penerimaan berhasil dikonfirmasi dan invoice di-settle.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        });
      } catch (error: any) {
        console.error('Error confirming receipt:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal mengkonfirmasi penerimaan',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        });
      }
    },

    async cancelReceipt(id: string | number, reason?: string) {
      const { $api } = useNuxtApp();
      const toast = useToast();

      const prompt = await Swal.fire({
        title: 'Batalkan penerimaan?',
        input: 'text',
        inputLabel: 'Alasan pembatalan',
        inputValue: reason || '',
        inputValidator: (value) => (!value?.trim() ? 'Alasan wajib diisi' : null),
        showCancelButton: true,
        confirmButtonText: 'Ya, batalkan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
      });

      if (!prompt.isConfirmed) return;

      try {
        const url = $api.arReceiptsCancel?.(id) || ($api.arReceipts() + '/' + id + '/cancel');
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason: String(prompt.value).trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal membatalkan penerimaan.' }));
          throw new Error(errorData.message || 'Gagal membatalkan penerimaan.');
        }

        await this.fetchReceipts();
        toast.success({
          title: 'Success',
          message: 'Penerimaan dibatalkan; settlement invoice dihitung ulang.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        });
      } catch (error: any) {
        console.error('Error cancelling receipt:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal membatalkan penerimaan',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        });
      }
    },

    openModal(receipt?: ARReceipt) {
      this.isEditMode = !!receipt;
      this.validationErrors = [];
      
      if (receipt) {
        const lines = (receipt as any).settlementLines || (receipt as any).settlement_lines || []
        this.form = {
          ...receipt,
          allocations: lines.length
            ? lines.map((l: any) => ({
                salesInvoiceId: l.salesInvoiceId || l.sales_invoice_id,
                amount: Number(l.amount || 0),
              }))
            : receipt.invoice_id || (receipt as any).salesInvoiceId
              ? [
                  {
                    salesInvoiceId: String(receipt.invoice_id || (receipt as any).salesInvoiceId),
                    amount: Number(receipt.amount || 0),
                  },
                ]
              : [],
        };
      } else {
        this.form = {
          reference_number: '',
          date: new Date().toISOString().split('T')[0],
          customer_id: '',
          invoice_id: '',
          payment_method: 'bank_transfer',
          bank_account_id: '',
          amount: 0,
          currency: 'IDR',
          exchange_rate: 1,
          notes: '',
          status: 'draft',
          allocations: [],
        };
      }
      
      this.showModal = true;
      this.fetchCustomers();
      this.fetchInvoices();
      this.fetchBankAccounts();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        reference_number: '',
        date: new Date().toISOString().split('T')[0],
        customer_id: '',
        invoice_id: '',
        payment_method: 'bank_transfer',
        bank_account_id: '',
        amount: 0,
        currency: 'IDR',
        exchange_rate: 1,
        notes: '',
        status: 'draft',
        allocations: [],
      };
      this.validationErrors = [];
    },

    addAllocation() {
      if (!this.form.allocations) this.form.allocations = []
      this.form.allocations.push({ salesInvoiceId: '', amount: 0 })
    },

    removeAllocation(index: number) {
      this.form.allocations?.splice(index, 1)
    },

    syncPrimaryAllocation() {
      const invoiceId = this.form.invoice_id || (this.form as any).salesInvoiceId
      const amount = Number(this.form.amount || 0)
      if (!invoiceId || !amount) return
      if (!this.form.allocations?.length) {
        this.form.allocations = [{ salesInvoiceId: String(invoiceId), amount }]
      } else if (this.form.allocations.length === 1) {
        this.form.allocations[0].salesInvoiceId = String(invoiceId)
        this.form.allocations[0].amount = amount
      }
    },

    buildAllocationsPayload() {
      const rows = (this.form.allocations || []).filter(
        (a) => a.salesInvoiceId && Number(a.amount) > 0
      )
      return rows.map((a) => ({
        salesInvoiceId: String(a.salesInvoiceId),
        amount: Number(a.amount),
      }))
    },

    allocationTotal() {
      return (this.form.allocations || []).reduce((s, a) => s + Number(a.amount || 0), 0)
    },

    setPagination(event: any) {
      this.params.first = event.first || 0;
      this.params.rows = event.rows || 10;
      this.fetchReceipts();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || 'date';
      this.params.sortOrder = event.sortOrder || -1;
      this.fetchReceipts();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchReceipts();
    }
  }
})