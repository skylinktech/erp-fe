import { defineStore, storeToRefs } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useImageUrl } from '~/composables/useImageUrl'
import { useUserStore } from '~/stores/user'
import { useStocksStore } from '~/stores/stocks'
import { useProductStore } from '~/stores/product'
import type { Customer } from './customer'
import type { User } from './userManagement'
import type { Perusahaan } from './perusahaan'
import type { Cabang } from './cabang'
import type { Product } from './product'
import type { Quotation } from './quotation'

interface SalesReturnInfo {
  id: string;
  status: string;
}

interface SalesReturnItemInfo {
  id: string;
  salesReturn: SalesReturnInfo;
}

interface Stats {
  total               : number | undefined
  approved            : number | undefined
  rejected            : number | undefined
  partial             : number | undefined
  delivered           : number | undefined
  deliveredLast4Months: number | undefined
}

export interface SalesOrderItem {
  id           : string
  salesOrderId : string
  productId    : number
  warehouseId  : number
  quantity     : number
  price        : number
  description  : string
  subtotal     : number
  statusPartial: boolean
  deliveredQty : number
  createdAt    : string
  updatedAt    : string
  product?     : Product
  salesReturnItems?: SalesReturnItemInfo[]
}

export interface SalesOrder {
  id              : string
  name?           : string
  noSo            : string
  noPo            : string
  up              : string
  customerId      : number
  perusahaanId    : number
  cabangId        : number
  quotationId     : string
  termOfPayment   : string
  date            : string
  dueDate         : string
  status          : string
  paymentMethod   : string
  source          : string
  total           : string
  discountPercent : string
  taxPercent      : string
  description     : string
  attachment?     : string
  createdAt       : string
  updatedAt       : string
  createdBy       : number
  approvedBy      : number | null
  deliveredBy     : number | null
  rejectedBy      : number | null
  approvedAt      : string | null
  deliveredAt     : string | null
  currentApprovalStep?: number | null
  submittedAt?    : string | null
  approvalLogs?   : Array<{ id: number; stepOrder: number; action: string; remarks?: string; user?: { fullName?: string }; createdAt?: string }>
  currentApprovers?: Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  rejectedAt      : string | null
  customer?       : Customer
  perusahaan?     : Perusahaan
  cabang?         : Cabang
  quotation?      : Quotation
  createdByUser?  : User
  approvedByUser? : User
  deliveredByUser?: User
  salesOrderItems?: SalesOrderItem[]
}

export interface SalesOrderCustomerProduct extends Product {
  priceSell: number;
}

interface SalesOrderState {
  salesOrders       : SalesOrder[]
  salesOrdersForSelect: SalesOrder[] // ✅ FIX: State terpisah untuk select dropdown agar tidak tertimpa
  salesOrder        : SalesOrder | null
  originalSalesOrder: SalesOrder | null
  customerProducts  : SalesOrderCustomerProduct[]
  loading           : boolean
  saving            : boolean
  error             : any
  stats             : Stats
  totalRecords      : number
      params: {
        first      : number
        rows       : number
        sortField  : string | null
        sortOrder  : number | null
        draw       : number
        search     : string
        customerId?: number | null
        source?    : string | null
        status?    : string | null
        startDate? : string | null
        endDate?   : string | null
    }
  form            : any,
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
}

export const useSalesOrderStore = defineStore('salesOrder', {
  state: (): SalesOrderState => ({
    salesOrders       : [],
    salesOrdersForSelect: [], // ✅ FIX: State terpisah untuk select dropdown
    salesOrder        : null,
    originalSalesOrder: null,
    customerProducts  : [],
    loading           : true,
    saving            : false,
    error             : null,
    totalRecords      : 0,
    stats             : {
      total: 0,
      approved: 0,
      rejected: 0,
      partial: 0,
      delivered: 0,
      deliveredLast4Months: 0,
    },
    params: {
        first     : 0,
        rows      : 10,
        sortField : 'created_at',
        sortOrder : 2, // 2 = descending, 1 = ascending
        draw      : 1,
        search    : '',
        customerId: null,
        source    : null,
        status    : null,
        startDate : null,
        endDate   : null,
    },
    form: {
        noSo           : '',
        noPo           : '',
        up             : '',
        customerId     : null,
        perusahaanId   : null,
        quotationId    : null,
        cabangId       : null,
        termOfPayment  : '',
        date           : new Date().toISOString().split('T')[0],
        dueDate        : new Date().toISOString().split('T')[0],
        discountPercent: 0,
        taxPercent     : 0,
        description    : '',
        attachment     : null,
        status         : 'draft',
        paymentMethod  : null,
        source         : null,
        salesOrderItems: []
    },
    isEditMode      : false,
    showModal       : false,
    validationErrors: [],
  }),
  getters: {
    // Getter to combine products from different sources
    allAvailableProducts(state) {
      const productStore = useProductStore()
      // Safely access products from the product store
      const generalProducts = productStore.products || []
      const customerSpecificProducts = state.customerProducts || []
      
      // Combine and deduplicate products based on ID
      const allProductsMap = new Map()
      generalProducts.forEach(p => allProductsMap.set(p.id, p))
      customerSpecificProducts.forEach(p => allProductsMap.set(p.id, p))
      
      return Array.from(allProductsMap.values())
    }
  },
  actions: {
    async fetchSalesOrders(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
        try {
        const url = new URL($api.salesOrder())
        const params = new URLSearchParams({
            page     : Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows     : Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder?.toString() || '',
            draw     : this.params.draw.toString(),
            search   : this.params.search || '',
            includeItems: 'true', // Always include salesOrderItems with product relation
        });

        if (this.params.customerId) {
          params.append('customerId', this.params.customerId.toString());
        }
        if (this.params.source) {
          params.append('source', this.params.source);
        }
        if (this.params.status) {
          params.append('status', this.params.status);
        }
        if (this.params.startDate) {
          params.append('startDate', this.params.startDate);
        }
        if (this.params.endDate) {
          params.append('endDate', this.params.endDate);
        }
          
        url.search = params.toString();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
          },
          credentials: 'include' // Cookie-based auth
        })

        if (!response.ok) throw new Error('Gagal mengambil data salesOrder')

        const result = await response.json()
        this.salesOrders = result.data
        this.totalRecords = result.meta.total
        if (this.salesOrders.length > 0) {
          this.salesOrders[0]?.salesOrderItems
        }
      } catch (e: any) {
        console.error('Gagal mengambil data salesOrder:', e)
        this.error = e
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
        if (!suppressError) {
          const toast = useToast();
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Sales Order: ${e?.message || e}`,
            color: 'red'
          });
        }
      } finally {
        this.loading = false
      }
    },

    // ✅ NEW: Method untuk fetch semua sales orders tanpa pagination (untuk select2 dropdown)
    async fetchAllSalesOrdersForSelect(suppressError = false) {
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.salesOrder())
        const params = new URLSearchParams({
            page: '1',
            rows: '500', // ✅ FIX: Limit ke 500 untuk performa (backend juga limit 1000)
            sortField: 'created_at',
            sortOrder: '2', // Descending (terbaru dulu)
            draw: '1',
            search: '',
            includeItems: 'false', // Tidak perlu items untuk dropdown
        });
          
        url.search = params.toString();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Cookie-based auth
        })

        if (!response.ok) throw new Error('Gagal mengambil data salesOrder untuk select')

        const result = await response.json()
        // ✅ FIX: Update salesOrdersForSelect (state terpisah) agar tidak tertimpa oleh fetchSalesOrders
        this.salesOrdersForSelect = Array.isArray(result.data) ? result.data : []
      } catch (e: any) {
        console.error('Gagal mengambil data salesOrder untuk select:', e)
        this.error = e
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress
        if (!suppressError) {
          const toast = useToast();
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Sales Order: ${e?.message || e}`,
            color: 'red'
          });
        }
      }
    },

    async fetchStats() {
        const { $api } = useNuxtApp();
        const defaultStats = {
          total: undefined,
          approved: undefined,
          rejected: undefined,
          partial: undefined,
          delivered: undefined,
          deliveredLast4Months: undefined,
        };
        try {
          const response = await fetch($api.countSalesOrderByStatus(), {
              headers: { 
                  'Content-Type': 'application/json'
              },
              credentials: 'include' // Cookie-based auth
          });
      
          if (response.ok) {
            const result = await response.json();
            this.stats = result;
          } else {
            this.stats = defaultStats;
          }
        } catch (error) {
          console.error('Gagal mengambil data statistik (exception):', error);
          this.stats = defaultStats;
        }
    },

    async fetchProductsForCustomer(customerId: number) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      if (!customerId) {
        this.customerProducts = []
        return
      }
      try {
        const response = await fetch($api.customer() + '/' + customerId, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })
        if (!response.ok) throw new Error('Gagal mengambil data produk untuk customer')
        const result = await response.json()
        // ✅ FIX: Filter out undefined/null values untuk menghindari error di component
        const products = result.data.customerProducts || []
        this.customerProducts = Array.isArray(products) 
          ? products.filter(p => p !== null && p !== undefined && p.id) 
          : []
      } catch (error) {
        console.error('Error fetching products for customer:', error)
        // Jangan hapus produk yang ada jika fetch gagal
        // this.customerProducts = [] 
        const toast = useToast();
        toast.error({
          title: 'Error',
          message: 'Gagal memuat produk untuk customer yang dipilih.',
          color: 'red'
        });
      } finally {
        this.loading = false
      }
    },

    async saveSalesOrder() {
        this.saving = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();
        const userStore = useUserStore();
        // Hapus validasi stok sebelum membuat Sales Order agar tetap bisa membuat SO meski stok < 1

        try {
            const formData = new FormData()

            // Append main form data
            const dataToAppend = { ...this.form };
            // Hapus data relasi dan data yang tidak perlu dikirim
            delete dataToAppend.salesOrderItems;
            delete dataToAppend.attachment;
            delete dataToAppend.customer;
            delete dataToAppend.perusahaan;
            delete dataToAppend.cabang;
            delete dataToAppend.quotation;
            delete dataToAppend.createdByUser;
            delete dataToAppend.approvedByUser;
            delete dataToAppend.deliveredByUser;
            delete dataToAppend.rejectedByUser;

            Object.keys(dataToAppend).forEach(key => {
                const value = dataToAppend[key];
                // Khusus untuk field source, selalu kirim meskipun null/undefined
                if (key === 'source') {
                    formData.append(key, value ?? '');
                } else if (key === 'discountPercent' || key === 'taxPercent') {
                    // Pastikan discountPercent dan taxPercent selalu berupa number
                    // Handle jika value adalah string dengan koma (format Indonesia)
                    let numValue = 0;
                    if (typeof value === 'number') {
                        numValue = value;
                    } else if (typeof value === 'string') {
                        // Konversi koma ke titik untuk parsing
                        const normalizedValue = value.replace(',', '.');
                        numValue = parseFloat(normalizedValue) || 0;
                    } else {
                        numValue = Number(value) || 0;
                    }
                    formData.append(key, numValue.toString());
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            // Append createdBy hanya untuk PO baru
            if (!this.isEditMode && userStore.user && userStore.user.id) {
                formData.append('createdBy', userStore.user.id.toString())
                if(this.form.status === 'approved') {
                    formData.append('approvedBy', userStore.user.id.toString())
                }
                if(this.form.status === 'rejected') {
                    formData.append('rejectedBy', userStore.user.id.toString())
                }
                if(this.form.status === 'delivered') {
                    formData.append('deliveredBy', userStore.user.id.toString())
                }
            }

            // Append attachment if it's a file
            if (this.form.attachment instanceof File) {
                formData.append('attachment', this.form.attachment);
            }

            // Append sales order items using camelCase keys
            this.form.salesOrderItems.forEach((item: any, i: number) => {
                if (item.productId && item.quantity > 0) {
                    Object.keys(item).forEach(itemKey => {
                        const value = item[itemKey];
                        if (value !== null && value !== undefined) {
                           formData.append(`salesOrderItems[${i}][${itemKey}]`, value);
                        }
                    });
                }
            });

            const method = this.isEditMode ? 'POST' : 'POST';
            const url = this.isEditMode ? `${$api.salesOrder()}/${this.form.id}` : $api.salesOrder();
            if (this.isEditMode) {
                formData.append('_method', 'PUT');
            }
            
            // Kirim data ke API
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
                const err = await normalizeFailedResponse(
                    response,
                    this.isEditMode ? 'Sales Order gagal diperbarui.' : 'Sales Order gagal dibuat.'
                )
                this.validationErrors = err.fieldErrorList
                const toast = useToast();
                toast.error({
                  title: err.type === 'validation' ? 'Validasi' : 'Error',
                  message: err.message,
                  color: 'red',
                  position: 'bottomRight',
                  layout: 2,
                })
                return false
            } else {
                this.closeModal();
                await this.fetchSalesOrders();
                const toast = useToast();
                toast.success({
                  title: 'Success',
                  message: `Sales Order berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
                  color: 'green',
                  position: 'bottomRight',
                  layout: 2,
                });
                return true
            }


        } catch (error: any) {
            const err = normalizeApiError(error, 'Sales Order gagal disimpan.')
            toastNormalizedError(err)
            return false
        } finally {
            this.saving = false;
        }
    },

    async deleteSalesOrder(id: string) {
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
          const response = await fetch(`${$api.salesOrder()}/${id}`, {
              method: 'DELETE',
              headers: {
                  'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Sales Order gagal dihapus.')
              throw new Error(err.message)
          }

          await this.fetchSalesOrders();
          const toast = useToast();
          toast.success({
            title: 'Success',
            message: 'Sales Order berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          });
      } catch (error: any) {
          const err = normalizeApiError(error, 'Sales Order gagal dihapus.')
          toastNormalizedError(err)
      } finally {
          this.loading = false;
      }
    },
    
    async submitSalesOrder(salesOrderId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.submitSalesOrder(salesOrderId), {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({}),
          });
          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Sales Order gagal disubmit.')
              throw new Error(err.message)
          }
          await this.fetchSalesOrders();
          const toast = useToast();
          toast.success({ title: 'Success', message: 'Sales Order berhasil di-submit.', color: 'green', position: 'bottomRight', layout: 2 });
          return true;
      } catch (error: any) {
          const toast = useToast();
          const err = normalizeApiError(error, 'Sales Order gagal disubmit.')
          toastNormalizedError(err)
          return false;
      } finally {
          this.loading = false;
      }
    },

    async approveSalesOrder(salesOrderId: string, remarks?: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.approveSalesOrder(salesOrderId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ remarks: remarks ?? undefined }),
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Sales Order gagal disetujui.')
              throw new Error(err.message)
          }

          await this.fetchSalesOrders();
            const toast = useToast();
            toast.success({
            title: 'Success',
            message: 'Sales Order berhasil diapprove.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          });

          return true;
      } catch (error: any) {
          const err = normalizeApiError(error, 'Sales Order gagal disetujui.')
          toastNormalizedError(err)
          return false;
      } finally {
          this.loading = false;
      }
    },

    async rejectSalesOrder(salesOrderId: string, remarks?: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.rejectSalesOrder(salesOrderId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ remarks: remarks ?? undefined }),
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Sales Order gagal ditolak.')
              throw new Error(err.message)
          }

          await this.fetchSalesOrders();
          const toast = useToast();
          toast.success({
            title: 'Success',
            message: 'Sales Order berhasil direject.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          });

          return true;
      } catch (error: any) {
          const err = normalizeApiError(error, 'Sales Order gagal ditolak.')
          toastNormalizedError(err)
          return false;
      } finally {
          this.loading = false;
      }
    },    

    async updateStatusPartial(itemId: string, status: boolean, deliveredQty: number) {
        this.loading = true;
        this.error = null;
        const { $api } = useNuxtApp();
        try {
            const resData = await apiFetch($api.salesOrderItemUpdateStatusPartial(itemId), {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: { 
                    deliveredQty: deliveredQty 
                },
                credentials: 'include', // Cookie-based auth (apiFetch already handles this)
            });

            const updatedSalesOrderItem = resData.data.salesOrderItem;
            const updatedSalesOrder = resData.data.salesOrder;

            if (this.salesOrder && this.salesOrder.salesOrderItems) {
                const index = this.salesOrder.salesOrderItems.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    this.salesOrder.salesOrderItems[index].statusPartial = updatedSalesOrderItem.statusPartial;
                    this.salesOrder.salesOrderItems[index].deliveredQty = updatedSalesOrderItem.deliveredQty;
                }
                if (this.salesOrder.status !== updatedSalesOrder.status) {
                    this.salesOrder.status = updatedSalesOrder.status;
                }
            }
            
        } catch (error: any) {
            this.error = error;
            const err = normalizeApiError(error, 'Sales Order gagal diproses.')
            toastNormalizedError(err)
            throw new Error(err.message)
        } finally {
            this.loading = false;
        }
    },

    // Fungsi untuk mengambil data perusahaan menggunakan endpoint data
    async fetchPerusahaanData() {
      try {
        const { $api } = useNuxtApp();
        const response = await fetch($api.dataPerusahaan(), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
          throw new Error('Gagal memuat data perusahaan.');
        }

        const result = await response.json();
        return result;

      } catch (error) {
        console.error(error);
        const toast = useToast();
        toast.error({
          title: 'Error',
          message: 'Gagal memuat daftar perusahaan.',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        });
        return [];
      }
    },

    // Fungsi untuk mengambil data cabang menggunakan endpoint data
    async fetchCabangData(perusahaanId?: number) {
        try {
            const { $api } = useNuxtApp();
            const url = perusahaanId 
            ? `${$api.dataCabang()}?perusahaanId=${perusahaanId}`
            : $api.dataCabang();
            
            const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
            throw new Error('Gagal memuat data cabang.');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(error);
            const toast = useToast();
            toast.error({
            title: 'Error',
            message: 'Gagal memuat daftar cabang.',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
            });
            return [];
        }
    },

    // Fungsi untuk mengambil data warehouse menggunakan endpoint data
    async fetchCustomerData() {
        try {
            const { $api } = useNuxtApp();
            const response = await fetch($api.dataCustomer(), {
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
            throw new Error('Gagal memuat data customer.');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(error);
            const toast = useToast();
            toast.error({ 
            title: 'Error',
            message: 'Gagal memuat daftar customer.',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
            });
            return [];
        }
    },

    async openModal(salesOrderData: SalesOrder | null = null, source: 'admin' | 'pos' | null = null) {
      this.isEditMode = !!salesOrderData;
      this.validationErrors = [];

      if (salesOrderData) {
          await this.getSalesOrderDetails(salesOrderData.id);
          const fullData = this.salesOrder;

          if (!fullData) {
              const toast = useToast();
              toast.error({
                title: 'Error',
                message: 'Tidak dapat memuat data Sales Order.',
                color: 'red',
                position: 'bottomRight',
                layout: 2,
              });
              return;
          }
          this.originalSalesOrder = JSON.parse(JSON.stringify(fullData));
          const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
          
          // Salin data dan format tanggal dengan benar
          const formData: { [key: string]: any } = {
              ...JSON.parse(JSON.stringify(fullData)),
              attachment: null, // Reset attachment, akan ditangani secara terpisah
          };

          const dateFields = ['date', 'dueDate', 'approvedAt', 'deliveredAt'];
          dateFields.forEach(field => {
              if (formData[field]) {
                  formData[field] = formatDate(formData[field]);
              }
          });

          // Pastikan discountPercent dan taxPercent selalu berupa number
          formData.discountPercent = Number(formData.discountPercent) || 0;
          formData.taxPercent = Number(formData.taxPercent) || 0;

          this.form = formData;
          
          // Set attachment preview jika ada
          if (fullData.attachment) {
              const { getAttachmentUrl } = useImageUrl();
              this.form.attachmentPreview = getAttachmentUrl(fullData.attachment);
          } else {
              this.form.attachmentPreview = '';
          }
          
          // Selalu set source, baik untuk edit maupun create
          if (source) {
            this.form.source = source;
          } else if (!this.form.source) {
            // Default ke 'admin' jika tidak ada source
            this.form.source = 'admin';
          }

          // Wait for products to be fetched before showing modal
          if (this.form.customerId) {
              await this.fetchProductsForCustomer(this.form.customerId);
          }

          // Pastikan salesOrderItems ada dan tambahkan stock jika belum ada
          if (this.form.salesOrderItems && this.form.salesOrderItems.length > 0) {
            this.form.salesOrderItems = this.form.salesOrderItems.map((item: any) => {
                return {
                    ...item,
                    stock: item.stock || null, // Jangan set default 0, biarkan null sampai di-fetch
                }
            })
          } else {
            this.form.salesOrderItems = [];
            this.addItem();
          }
      } else {
          this.resetForm(source);
          this.addItem(); // Tambahkan satu item default untuk SO baru
          
      }
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.originalSalesOrder = null;
      this.resetForm();
      this.validationErrors = [];
    },
    
    resetForm(source: 'admin' | 'pos' | null = null) {
      
      this.form = {
        noSo: '',
        noPo: '',
        up: '',
        customerId: null,
        perusahaanId: null,
        quotationId: null,
        cabangId: null,
        termOfPayment: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        discountPercent: 0,
        taxPercent: 0,
        description: '',
        attachment: null,
        attachmentPreview: '',
        status: 'draft',
        paymentMethod: null,
        source: source,
        salesOrderItems: [],
      };
      
    },

    addItem() {
        if (!this.form.salesOrderItems) {
            this.form.salesOrderItems = [];
        }
        this.form.salesOrderItems.push({
            productId: null,
            warehouseId: null,
            quantity: 1,
            price: 0,
            description: '',
            subtotal: 0,
            stock: null, // Jangan set default 0, biarkan null sampai di-fetch
        });
    },

    removeItem(index: number) {
        this.form.salesOrderItems.splice(index, 1);
    },

    setPagination(event: any) {
        this.params.first = Number(event.first) || 0;
        this.params.rows = Number(event.rows) || 10;
        this.fetchSalesOrders();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField || null;
        this.params.sortOrder = Number(event.sortOrder) || null;
        this.fetchSalesOrders();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchSalesOrders();
    },

    setFilters(filters: { customerId?: number | null, source?: string | null, status?: string | null, startDate?: string | null, endDate?: string | null, search?: string }) {
        this.params.customerId = filters.customerId;
        this.params.source = filters.source;
        this.params.status = filters.status;
        this.params.startDate = filters.startDate;
        this.params.endDate = filters.endDate;
        this.params.search = filters.search || '';
        this.params.first = 0; // reset pagination
        this.fetchSalesOrders();
    },

    async deliverAllItems(salesOrderId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
          const response = await fetch($api.deliverAllSalesOrderItems(salesOrderId), {
              method: 'POST',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Gagal mengirim semua item sales order' }));
              throw new Error(errorData.message || 'Gagal mengirim semua item sales order');
          }

          const result = await response.json();

          const toast = useToast();
          toast.success({
            title: 'Success',
            message: `Berhasil mengirim semua item. ${result.data?.totalStockOutsCreated || 0} Stock Out telah dibuat.`,
            color: 'green'
          });

          return result;
      } catch (error: any) {
          this.error = error;
          const err = normalizeApiError(error, 'Sales Order gagal diproses.')
          toastNormalizedError(err)
          throw new Error(err.message)
      } finally {
          this.loading = false;
      }
    },

    async fetchAllSalesOrdersForExport() {
        this.loading = true;
        this.error = null;
        const { $api } = useNuxtApp();
        
        try {
            const url = new URL($api.salesOrder())
            const params = new URLSearchParams({
                page: '1',
                rows: '1000', // Batasi maksimal 1000 data untuk export
                sortField: this.params.sortField || '',
                sortOrder: this.params.sortOrder?.toString() || '',
                draw: this.params.draw.toString(),
                search: this.params.search || '',
            });

            if (this.params.customerId) {
                params.append('customerId', this.params.customerId.toString());
            }
            if (this.params.source) {
                params.append('source', this.params.source);
            }
            if (this.params.status) {
                params.append('status', this.params.status);
            }
            if (this.params.startDate) {
                params.append('startDate', this.params.startDate);
            }
            if (this.params.endDate) {
                params.append('endDate', this.params.endDate);
            }
                
            url.search = params.toString();

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Cookie-based auth
            });

            if (!response.ok) throw new Error('Gagal mengambil data salesOrder untuk export');

            const result = await response.json();
            return result.data;
        } catch (e: any) {
            console.error('Gagal mengambil data salesOrder untuk export:', e);
            this.error = e;
            const toast = useToast();
            toast.error({
                title: 'Error',
                message: `Tidak dapat memuat data Sales Order untuk export: ${e?.message || e}`,
                color: 'red'
            });
            return [];
        } finally {
            this.loading = false;
        }
    },

    async getSalesOrderDetails(soId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const resData = await apiFetch($api.getSalesOrderDetails(soId), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth (apiFetch already handles this)
        });
        
        
        if (resData && resData.data) {
          this.salesOrder = resData.data;
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getSalesOrderDetails.');
        }
      } catch (e: any) {
        console.error('❌ Store Debug - Error details:', {
          message: e.message,
          status: e.status,
          statusText: e.statusText,
          data: e.data,
          response: e.response
        });
        
        // Try fallback with standard show endpoint
        if (e.status === 404) {
          try {
            const fallbackUrl = `${$api.salesOrder()}/${soId}`;
            
            const fallbackData = await apiFetch(fallbackUrl, {
              headers: {
                'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth (apiFetch already handles this)
            });
            
            if (fallbackData && fallbackData.data) {
              this.salesOrder = fallbackData.data;
              return; // Exit successfully
            }
          } catch (fallbackError) {
            console.error('❌ Store Debug - Fallback also failed:', fallbackError);
          }
        }
        
        this.error = e
        const err = normalizeApiError(e, 'Gagal mengambil detail sales order')
        throw new Error(err.message)
      } finally {
        this.loading = false;
      }
    },
  }
})
