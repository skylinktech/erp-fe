import { defineStore, storeToRefs } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { Vendor } from './vendor'



export interface PurchaseInvoiceItem {
  id              : string
  purchaseInvoiceId  : string
  purchaseOrderItemId: string
  productId       : number
  warehouseId     : number | null
  quantity        : number
  price           : number
  subtotal        : number
  description     : string | null
  receivedQty    : number
  createdAt       : string
  updatedAt       : string
  product?        : {
    id      : number
    name    : string
    sku     : string
    priceSell: number
    unitId? : number
    unit?   : {
      id  : number
      name: string
    }
  }
  warehouse?      : {
    id  : number
    name: string
  }
  purchaseOrderItem? : {
    id          : string
    quantity    : number
    price       : number
    subtotal    : number
    statusPartial: boolean
    receivedQty: number
  }
}

export interface PurchaseInvoice {
  id              : string
  name?           : string
  noInvoice       : string
  up              : string
  email           : string
  paymentDate            : string
  paymentMethod   : string // ✅ NEW: Tambahkan payment method
  dueDate         : string
  status          : string
  paidAmount      : number
  remainingAmount : number
  source?         : string
  total           : number
  discountPercent : number
  taxPercent      : number
  description     : string
  attachment?     : string
  vendorId      : number
  purchaseOrderId?   : string
  createdAt       : string
  updatedAt       : string
  createdBy       : number
  updatedBy       : number
  vendor?       : Vendor
  purchaseOrder?     : {
    id          : string
    noPo        : string
    status      : string
    paymentDate        : string
    dueDate     : string
    up          : string
    description : string
    discountPercent: number
    taxPercent  : number
    total       : number
    vendorId  : number
    perusahaanId: number
    cabangId    : number
    vendor?   : Vendor
    perusahaan? : {
      id             : number
      nmPerusahaan   : string
      alamatPerusahaan: string
      kodePerusahaan : string
      npwpPerusahaan : string
      tlpPerusahaan  : string
      emailPerusahaan: string
      logoPerusahaan : string
    }
    cabang?     : {
      id           : number
      nmCabang     : string
      alamatCabang : string
      perusahaanId : number
    }
    createdByUser? : {
      id          : number
      fullName    : string
    }
    updatedByUser? : {
      id          : number
      fullName    : string
    }
    purchaseOrderItems?: Array<{
      id          : string
      quantity    : number
      price       : number
      subtotal    : number
      statusPartial: boolean
      deliveredQty: number
      product?    : {
        id  : number
        name: string
        sku : string
        priceSell: number
      }
    }>
  }
  purchaseInvoiceItems?: PurchaseInvoiceItem[]
}

interface PurchaseInvoiceState {
  purchaseInvoices       : PurchaseInvoice[]
  purchaseInvoice        : PurchaseInvoice | null
  selectedPurchaseInvoice: PurchaseInvoice | null
  originalPurchaseInvoice: PurchaseInvoice | null
  loading                : boolean
  error                  : any
  totalRecords           : number
  // ✅ NEW: Tambahkan state untuk statistik
  statistics          : {
    counts: {
      total  : number
      unpaid : number
      partial: number
      paid   : number
    }
    amounts: {
      total      : number
      unpaid     : number
      partial    : number
      paid       : number
      outstanding: number
    }
    percentages: {
      unpaid : number
      partial: number
      paid   : number
    }
  } | null
  params: {
    first     : number
    rows      : number
    sortField : string | null
    sortOrder : number | null
    draw      : number
    search    : string
    vendorId ?: number | null
    source?   : string | null
    status?    : string | null
  }
  form            : any,
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
}

export const usePurchaseInvoiceStore = defineStore('purchaseInvoice', {
  state: (): PurchaseInvoiceState => ({
    purchaseInvoices       : [],
    purchaseInvoice        : null,
    selectedPurchaseInvoice: null,
    originalPurchaseInvoice: null,
    loading                : true,
    error                  : null,
    totalRecords           : 0,
      // ✅ NEW: Tambahkan state untuk statistik
    statistics: null,
    params    : {
        first    : 0,
        rows     : 10,
        sortField: 'createdAt',
        sortOrder: -1,
        draw     : 1,
        search   : '',
        vendorId : null,
        source   : null,
        status   : null,
    },
    form: {
        noInvoice           : '',
        up                  : '',
        email               : '',
        paymentDate         : '',
        paymentMethod       : 'cash', // ✅ NEW: Tambahkan payment method
        status              : '',
        paidAmount          : 0,
        remainingAmount     : 0,
        source              : '',
        total               : 0,
        dpp                 : 0,
        discountPercent     : 0,
        taxPercent          : 0,
        description         : '',
        attachment          : null,
        vendorId            : null,
        purchaseOrderId     : null,
        perusahaanId        : null,
        cabangId            : null,
        createdBy           : null,
        updatedBy           : null,
        purchaseInvoiceItems: [],
    },
    isEditMode      : false,
    showModal       : false,
    validationErrors: [],
  }),
  getters: {
  },
  actions: {
    async fetchPurchaseInvoices() {
      const toast     = useToast();
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
        try {
        const token        = localStorage.getItem('token');

        const url = new URL($api.purchaseInvoice())
        const params = new URLSearchParams({
            page     : Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows     : Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder?.toString() || '',
            draw     : this.params.draw.toString(),
            search   : this.params.search || '',
        });

        if (this.params.vendorId) {
          params.append('vendorId', this.params.vendorId.toString());
        }
        if (this.params.source) {
          params.append('source', this.params.source);
        }
        if (this.params.status) {
          params.append('status', this.params.status);
        }
          
        url.search = params.toString();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) throw new Error('Gagal mengambil data purchaseInvoice')

        const result = await response.json()
        this.purchaseInvoices = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data purchaseInvoice:', e)
        this.error = e
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data Purchase Invoice: ${e.message}`,
          color: 'red'
        });
      } finally {
        this.loading = false
      }
    },

    // ✅ NEW: Method untuk fetch statistik invoice
    async fetchInvoiceStatistics() {
      const toast = useToast();
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch($api.purchaseInvoiceStatistics(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil statistik invoice');
        }

        const result = await response.json();
        this.statistics = result.data;
      } catch (e: any) {
        console.error('Gagal mengambil statistik invoice:', e);
        this.error = e;
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat statistik invoice: ${e.message}`,
          color: 'red'
        });
      }
    },

    async fetchPurchaseInvoiceDetails(invoiceId: string) {
      const toast     = useToast();
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const token = localStorage.getItem('token');

        const resData = await apiFetch($api.purchaseInvoiceShow(invoiceId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        })
        
        if (resData && resData.data) {
          this.purchaseInvoice = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API.')
        }
      } catch (error) {
        console.error('Error fetching purchase invoice:', error)
        toast.error({
          title: 'Error',
          message: 'Gagal memuat data purchase invoice.',
          color: 'red'
        });
      } finally {
        this.loading = false
      }
    },

    async savePurchaseInvoice() {
      const toast     = useToast();
        this.loading = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();
        const userStore = useUserStore();

        try {
            const token = localStorage.getItem('token');

            // Prepare FormData for file upload
            const formData = new FormData();
            
            // Add basic fields
            formData.append('vendorId', this.form.vendorId?.toString() || '');
            formData.append('purchaseOrderId', this.form.purchaseOrderId?.toString() || '');
            formData.append('perusahaanId', this.form.perusahaanId?.toString() || '');
            formData.append('cabangId', this.form.cabangId?.toString() || '');
            formData.append('up', this.form.up || '');
            formData.append('email', this.form.email || '');
            formData.append('paymentDate', this.form.paymentDate || '');
            formData.append('paymentMethod', this.form.paymentMethod || 'cash'); // ✅ NEW: Tambahkan payment method
            formData.append('createdBy', this.form.createdBy?.toString() || '');
            formData.append('updatedBy', this.form.updatedBy?.toString() || '');
            
            formData.append('status', this.form.status || 'unpaid');
            formData.append('paidAmount', this.form.paidAmount?.toString() || '0');
            formData.append('discountPercent', this.form.discountPercent?.toString() || '0');
            formData.append('taxPercent', this.form.taxPercent?.toString() || '0');
            formData.append('dpp', this.form.dpp?.toString() || '0');
            formData.append('description', this.form.description || '');
            formData.append('total', this.form.total?.toString() || '0');
            
            // Calculate grand total (total - discount + tax)
            const total = Number(this.form.total) || 0;
            const discountPercent = Number(this.form.discountPercent) || 0;
            const taxPercent = Number(this.form.taxPercent) || 0;
            
            const discountAmount = total * (discountPercent / 100);
            const totalAfterDiscount = total - discountAmount;
            const taxAmount = totalAfterDiscount * (taxPercent / 100);
            const grandTotal = totalAfterDiscount + taxAmount;
            
            // Calculate remaining amount based on grand total
            const paidAmount = Number(this.form.paidAmount) || 0;
            const remainingAmount = grandTotal - paidAmount;
            
            // Send grand total as the final total
            formData.set('total', grandTotal.toString());
            formData.append('remainingAmount', remainingAmount.toString());

            // ✅ ADD: Append sales invoice items to FormData
            if (this.form.purchaseInvoiceItems && Array.isArray(this.form.purchaseInvoiceItems)) {
                this.form.purchaseInvoiceItems.forEach((item: any, i: number) => {
                    if (item.productId && item.quantity > 0) {
                        Object.keys(item).forEach(itemKey => {
                            const value = item[itemKey];
                            if (value !== null && value !== undefined) {
                                formData.append(`purchaseInvoiceItems[${i}][${itemKey}]`, value);
                            }
                        });
                    }
                });
            }

            const method = this.isEditMode ? 'PUT' : 'POST';
            const url = this.isEditMode ? `${$api.purchaseInvoice()}/${this.form.id}` : $api.purchaseInvoice();
            
            // Send data to API
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422) {
                    this.validationErrors = errorData.errors;
                    toast.error({
                      title: 'Error',
                      message: errorData.errors.map((e: any) => e.message).join('<br>'),
                      color: 'red'
                    });
                } else {
                    throw new Error(errorData.message || 'Gagal menyimpan data Purchase Invoice');
                }
            } else {
                this.closeModal();
                await this.fetchPurchaseInvoices();
                toast.success({
                  title: 'Success',
                  message: `Purchase Invoice berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
                  color: 'green'
                });
            }

        } catch (error: any) {
            // Clear validation errors on new general error
            this.validationErrors = [];
            toast.error({
              title: 'Error',
              message: error.message || 'Operasi gagal',
              color: 'red'
            });
        } finally {
            this.loading = false;
        }
    },

    async deletePurchaseInvoice(id: string) {
      const toast     = useToast();
      this.loading = true;
      const { $api } = useNuxtApp();

      const result = await Swal.fire({
          title: 'Apakah Anda yakin?',
          text: "Data yang dihapus tidak dapat dikembalikan!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, hapus!',
          cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) {
          this.loading = false;
          return;
      }

      try {
          const token = localStorage.getItem('token');

          const response = await fetch(`${$api.purchaseInvoice()}/${id}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
              },
              credentials: 'include',
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Gagal menghapus Purchase Invoice');
          }

          await this.fetchPurchaseInvoices();
          toast.success({
            title: 'Success',
            message: 'Purchase Invoice berhasil dihapus.',
            color: 'green'
          });
      } catch (error: any) {
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus Purchase Invoice',
            color: 'red'
          });
      } finally {
          this.loading = false;
      }
    },

    async openModal(purchaseInvoiceData: PurchaseInvoice | null = null) {
      const toast     = useToast();
      this.isEditMode = !!purchaseInvoiceData;
      this.validationErrors = [];

      if (purchaseInvoiceData) {
          await this.fetchPurchaseInvoiceDetails(purchaseInvoiceData.id);
          const fullData = this.purchaseInvoice;

          if (!fullData) {
              toast.error({
                title: 'Error',
                message: 'Tidak dapat memuat data Purchase Invoice.',
                color: 'red'
              });
              return;
          }
          this.originalPurchaseInvoice = JSON.parse(JSON.stringify(fullData));
          const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
          
          // Salin data ke form state dan format tanggal dengan benar
          this.form = {
              ...JSON.parse(JSON.stringify(fullData)),
              attachment: null, // Reset attachment, akan ditangani secara terpisah
              paymentMethod: fullData.paymentMethod || 'cash', // ✅ NEW: Pastikan payment method terisi
          };

          // ✅ DEBUG: Log form data setelah diisi
          console.log('🔍 Form Data After Fill:', {
            paymentMethod: this.form.paymentMethod,
            fullDataPaymentMethod: fullData.paymentMethod,
            formData: this.form
          });

          const dateFields = ['paymentDate'];
          dateFields.forEach(field => {
              if (this.form[field]) {
                  this.form[field] = formatDate(this.form[field]);
              }
          });
      } else {
          this.resetForm();
          // Set createdBy dari current user untuk mode baru
          const userStore = useUserStore();
          if (userStore.user && userStore.user.id) {
              this.form.createdBy = userStore.user.id;
          }
      }
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.originalPurchaseInvoice = null;
      this.resetForm();
      this.validationErrors = [];
    },
    
    resetForm() {
      this.form = {
        noInvoice: '',
        vendorId: null,
        purchaseOrderId: null,
        perusahaanId: null,
        cabangId: null,
        up: '',
        email: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash', // ✅ NEW: Default payment method
        discountPercent: 0,
        taxPercent: 0,
        total: 0,
        dpp: 0,
        description: '',
        attachment: null,
        status: 'unpaid',
        paidAmount: 0,
        remainingAmount: 0,
        purchaseInvoiceItems: [],
      };
      
      // ✅ DEBUG: Log form data setelah reset
      console.log('🔍 Form Data After Reset:', {
        paymentMethod: this.form.paymentMethod,
        formData: this.form
      });
    },

    setPagination(event: any) {
        this.params.first = Number(event.first) || 0;
        this.params.rows = Number(event.rows) || 10;
        this.fetchPurchaseInvoices();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField || null;
        this.params.sortOrder = Number(event.sortOrder) || null;
        this.fetchPurchaseInvoices();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchPurchaseInvoices();
    },

    setFilters(filters: { vendorId?: number | null, source?: string | null, status?: string | null, search?: string }) {
        this.params.vendorId = filters.vendorId;
        this.params.source = filters.source;
        this.params.status = filters.status;
        this.params.search = filters.search || '';
        this.params.first = 0; // reset pagination
        this.fetchPurchaseInvoices();
    },

    async fetchPurchaseInvoiceById(invoiceId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const token = localStorage.getItem('token');

        const resData = await apiFetch($api.purchaseInvoiceShow(invoiceId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
        
        
        if (resData && resData.data) {
          this.selectedPurchaseInvoice = resData.data;
        } else {
          console.error('❌ Store Debug - Invalid response structure:', resData);
          throw new Error('Struktur data tidak valid diterima dari API.');
        }
      } catch (e: any) {
        console.error('❌ Store Debug - fetchPurchaseInvoiceById Error details:', {
          message: e.message,
          status: e.status,
          statusText: e.statusText,
          data: e.data,
          response: e.response
        });
        
        this.error = e;
        
        // Create more specific error messages
        let errorMessage = 'Gagal mengambil detail purchase invoice';
        
        if (e.status === 404) {
          errorMessage = `Purchase Invoice dengan ID ${invoiceId} tidak ditemukan`;
        } else if (e.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk melihat Purchase Invoice ini';
        } else if (e.status === 403) {
          errorMessage = 'Tidak memiliki izin untuk melihat Purchase Invoice ini';
        } else if (e.status === 500) {
          errorMessage = 'Terjadi kesalahan server, silakan coba lagi';
        } else if (e.message) {
          errorMessage = e.message;
        }
        
        // Throw error with more specific message
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    // ✅ NEW: Fetch invoice detail dengan purchaseInvoiceItems untuk detail page
    async fetchInvoiceDetailWithItems(invoiceId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const token = localStorage.getItem('token');

        const resData = await apiFetch($api.purchaseInvoiceShow(invoiceId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
        
        
        if (resData && resData.data) {
          // Set purchaseInvoice dengan data lengkap termasuk purchaseInvoiceItems
          this.purchaseInvoice = resData.data;
          return resData.data;
        } else {
          console.error('❌ Store Debug - Invalid response structure:', resData);
          throw new Error('Struktur data tidak valid diterima dari API.');
        }
      } catch (e: any) {
        console.error('❌ Store Debug - fetchInvoiceDetailWithItems Error details:', {
          message: e.message,
          status: e.status,
          statusText: e.statusText,
          data: e.data,
          response: e.response
        });
        
        this.error = e;
        
        // Create more specific error messages
        let errorMessage = 'Gagal mengambil detail purchase invoice';
        
        if (e.status === 404) {
          errorMessage = `Purchase Invoice dengan ID ${invoiceId} tidak ditemukan`;
        } else if (e.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk melihat Purchase Invoice ini';
        } else if (e.status === 403) {
          errorMessage = 'Tidak memiliki izin untuk melihat Purchase Invoice ini';
        } else if (e.status === 500) {
          errorMessage = 'Terjadi kesalahan server, silakan coba lagi';
        } else if (e.message) {
          errorMessage = e.message;
        }
        
        // Throw error dengan specific message
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },
  }
})
