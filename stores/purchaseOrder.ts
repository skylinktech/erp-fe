import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useImageUrl } from '~/composables/useImageUrl'
import { useUserStore } from '~/stores/user'
import type { Vendor } from './vendor'
import type { User } from './userManagement'
import type { Perusahaan } from './perusahaan'
import type { Cabang } from './cabang'
import type { Product } from './product'

export interface PurchaseOrderItem {
  id             : string
  purchaseOrderId: string
  productId      : number
  quantity       : number
  price          : number
  description    : string
  subtotal       : number
  statusPartial  : boolean
  receivedQty    : string
  createdAt      : string
  updatedAt      : string
  product?       : Product
}

export interface PurchaseOrder {
  id                 : string
  name?              : string
  noPo               : string
  up                 : string
  termOfPayment      : string
  extNamaPerusahaan  : string
  vendorId           : number
  perusahaanId       : number
  cabangId           : number
  purchaseRequestId? : number | null
  budgetId?          : number | null
  departmentId?      : number | null
  rejectionReason?   : string | null
  budgetExceeded?    : boolean
  date               : string
  dueDate            : string
  status             : string
  poType             : string
  total              : string
  discountPercent    : string
  taxPercent         : string
  description        : string
  ttdDigital?        : boolean
  attachment?        : string
  createdAt          : string
  updatedAt          : string
  createdBy          : number
  approvedBy         : number | null
  receivedBy         : number | null
  rejectedBy         : number | null
  approvedAt         : string | null
  receivedAt         : string | null
  rejectedAt         : string | null
  currentApprovalStep?: number | null
  submittedAt?       : string | null
  approvalLogs?      : Array<{ id: number; stepOrder: number; action: string; remarks?: string; user?: { fullName?: string }; createdAt?: string }>
  currentApprovers?  : Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  vendor?            : Vendor
  perusahaan?        : Perusahaan
  cabang?            : Cabang
  budget?            : { id: number; budgetCode?: string; budgetName?: string; totalAmount?: number | string }
  department?        : { id: number; nmDepartemen?: string; nm_departemen?: string }
  createdByUser?     : User
  approvedByUser?    : User
  receivedByUser?    : User
  purchaseOrderItems?: PurchaseOrderItem[]
}

interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[]
  purchaseOrder : PurchaseOrder | null
  loading       : boolean
  saving        : boolean
  error         : any
  totalRecords  : number
  params        : {
    first    : number
    rows     : number
    sortField: string | null
    sortOrder: number | null
    draw     : number
    search   : string
    vendorId?: number | null
    poType?  : string | null
    status?  : string | null
  }
  form            : any,
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
  stats: any
}

export const usePurchaseOrderStore = defineStore('purchaseOrder', {
  state: (): PurchaseOrderState => ({
    purchaseOrders: [] as PurchaseOrder[], // Explicitly type as array
    purchaseOrder : null,
    loading       : true,
    saving        : false,
    error         : null,
    totalRecords  : 0,
    params        : {
        first    : 0,
        rows     : 10,
        sortField: 'created_at',
        sortOrder: 2, // 2 = descending, 1 = ascending
        draw     : 1,
        search   : '',
        vendorId : null,
        poType   : null,
        status   : null,
    },
    form: {
        noPo: '',
        up: '',
        vendorId: null,
        perusahaanId: null,
        cabangId: null,
        termOfPayment: '',
        extNamaPerusahaan: '',
        date: new Date().toISOString().split('T')[0], 
        dueDate: new Date().toISOString().split('T')[0], 
        discountPercent: 0, 
        taxPercent: 0, 
        description: '',
        ttdDigital: false,
        attachment: null, 
        status: 'draft',
        poType: 'internal',
        purchaseRequestId: null as number | null,
        budgetId: null as number | null,
        departmentId: null as number | null,
        purchaseOrderItems: []
      },
    stats: {
        total: undefined,
        approved: undefined,
        rejected: undefined,
        received: undefined,
        draft: undefined
    },
    isEditMode      : false,
    showModal       : false,
    validationErrors: [],
  }),
  actions: {
    async fetchPurchaseOrders(suppressError = false) {
      const toast     = useToast();
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.purchaseOrder())
        const params = new URLSearchParams({
            page     : Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows     : Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder?.toString() || '',
            draw     : this.params.draw.toString(),
            search   : this.params.search || '',
            includeItems: 'true', // Always include purchaseOrderItems with product relation
        });

        if (this.params.vendorId) {
            params.append('vendorId', this.params.vendorId.toString());
          }
          if (this.params.poType) {
            params.append('poType', this.params.poType);
          }
          if (this.params.status) {
            params.append('status', this.params.status);
          }

        url.search = params.toString();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Cookie-based auth
        })

        if (!response.ok) throw new Error('Gagal mengambil data purchaseOrder')

        const result = await response.json()
        
        // Pastikan purchaseOrders selalu berupa array
        this.purchaseOrders = Array.isArray(result.data) ? result.data : []
        this.totalRecords = result.meta?.total || 0
      } catch (e: any) {
        console.error('Gagal mengambil data purchaseOrder:', e)
        this.error = e
        // Pastikan tetap array kosong jika error
        this.purchaseOrders = []
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Purchase Order: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
          });
        }
      } finally {
        this.loading = false
        // Pastikan purchaseOrders selalu berupa array setelah operasi selesai
        if (!Array.isArray(this.purchaseOrders)) {
          this.purchaseOrders = []
        }
      }
    },

    async savePurchaseOrder() {
      const toast     = useToast();
        this.saving = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();
        const userStore = useUserStore();

        try {
            const formData = new FormData()

            const dataToAppend = { ...this.form };
            delete dataToAppend.purchaseOrderItems;
            delete dataToAppend.attachment;
            delete dataToAppend.vendor;
            delete dataToAppend.perusahaan;
            delete dataToAppend.cabang;
            delete dataToAppend.budget;
            delete dataToAppend.department;
            delete dataToAppend.purchaseRequest;
            delete dataToAppend.createdByUser;
            delete dataToAppend.approvedByUser;
            delete dataToAppend.receivedByUser;
            delete dataToAppend.rejectedByUser;
            delete dataToAppend.approvalLogs;
            delete dataToAppend.currentApprovers;
            delete dataToAppend.budgetCheck;
            delete dataToAppend.rejectionReason;
            delete dataToAppend.budgetExceeded;
            // Lifecycle fields — tidak boleh dikirim dari client; create selalu draft di backend
            delete dataToAppend.status;
            delete dataToAppend.approvedBy;
            delete dataToAppend.rejectedBy;
            delete dataToAppend.approvedAt;
            delete dataToAppend.rejectedAt;
            delete dataToAppend.receivedBy;
            delete dataToAppend.receivedAt;
            delete dataToAppend.cancelledAt;
            delete dataToAppend.cancelledBy;
            delete dataToAppend.cancellationReason;
            delete dataToAppend.submittedAt;
            delete dataToAppend.currentApprovalStep;
            
            // Untuk create, hapus noPo karena di-generate di backend
            if (!this.isEditMode) {
                delete dataToAppend.noPo;
            }

            // Conditional logic berdasarkan poType
            if (dataToAppend.poType === 'internal') {
                // Untuk PO Internal: hapus extNamaPerusahaan, pastikan ada perusahaanId dan cabangId
                delete dataToAppend.extNamaPerusahaan;
                if (!dataToAppend.perusahaanId) {
                    throw new Error('Perusahaan harus dipilih untuk PO Internal');
                }
                if (!dataToAppend.cabangId) {
                    throw new Error('Cabang harus dipilih untuk PO Internal');
                }
            } else if (dataToAppend.poType === 'external') {
                // Untuk PO External: hapus perusahaanId dan cabangId, pastikan ada extNamaPerusahaan
                delete dataToAppend.perusahaanId;
                delete dataToAppend.cabangId;
                if (!dataToAppend.extNamaPerusahaan || dataToAppend.extNamaPerusahaan.trim() === '') {
                    throw new Error('Nama Perusahaan External harus diisi untuk PO External');
                }
            }

            // Validasi frontend sebelum kirim
            if (!dataToAppend.vendorId) {
                throw new Error('Vendor harus dipilih');
            }
            if (!dataToAppend.up || dataToAppend.up.trim() === '') {
                throw new Error('Untuk Perhatian harus diisi');
            }
            if (!dataToAppend.date) {
                throw new Error('Tanggal PO harus diisi');
            }
            if (!dataToAppend.dueDate) {
                throw new Error('Jatuh Tempo harus diisi');
            }
            if (!dataToAppend.poType) {
                throw new Error('Tipe PO harus dipilih');
            }

            Object.keys(dataToAppend).forEach(key => {
                const value = dataToAppend[key];
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });

            // Pastikan ttdDigital selalu terkirim sebagai 'true'/'false'
            formData.delete('ttdDigital');
            formData.append('ttdDigital', this.form.ttdDigital ? 'true' : 'false');

            if (!this.isEditMode && userStore.user && userStore.user.id) {
                formData.append('createdBy', userStore.user.id.toString())
            }

            if (this.form.attachment instanceof File) {
                formData.append('attachment', this.form.attachment);
            }

            // Validasi items
            if (!this.form.purchaseOrderItems || this.form.purchaseOrderItems.length === 0) {
                throw new Error('Minimal harus ada 1 item produk');
            }

            // Validasi setiap item
            const validItems = this.form.purchaseOrderItems.filter((item: any) => 
                item.productId && item.quantity && item.quantity > 0 && item.price && item.price > 0
            );
            
            if (validItems.length === 0) {
                throw new Error('Minimal harus ada 1 item produk yang valid (produk, quantity > 0, harga > 0)');
            }

            // ✅ UPDATED: Warehouse sekarang opsional, tidak ada validasi khusus

            // Append hanya items yang valid
            validItems.forEach((item: any, i: number) => {
                Object.keys(item).forEach(itemKey => {
                    const value = item[itemKey];
                    if (value !== null && value !== undefined) {
                       formData.append(`purchaseOrderItems[${i}][${itemKey}]`, value);
                    }
                });
            });

            const method = this.isEditMode ? 'POST' : 'POST';
            const url = this.isEditMode ? `${$api.purchaseOrder()}/${this.form.id}` : $api.purchaseOrder();
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
                    this.isEditMode ? 'Purchase Order gagal diperbarui.' : 'Purchase Order gagal dibuat.'
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
            } else {
                const result = await response.json().catch(() => ({} as any));
                this.closeModal();
                await this.fetchPurchaseOrders();
                const budgetExceeded =
                  !!(result?.data?.budgetExceeded ?? result?.data?.budget_exceeded) ||
                  result?.data?.budgetCheck?.ok === false;
                if (budgetExceeded) {
                  toast.error({
                    title: 'Peringatan Budget',
                    message:
                      result?.message ||
                      'Budget untuk departemen ini tidak mencukupi, silakan mengajukan tambahan budget terlebih dahulu',
                    color: 'orange',
                    position: 'bottomRight',
                  });
                } else {
                  toast.success({
                    title: 'Success',
                    message: `Purchase Order berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
                    color: 'green',
                    position: 'bottomRight',
                  });
                }
                return true;
            }


        } catch (error: any) {
            const err = normalizeApiError(error, 'Purchase Order gagal disimpan.')
            toastNormalizedError(err)
            return false;
        } finally {
            this.saving = false;
        }
    },

    async deletePurchaseOrder(id: string) {
      const toast     = useToast();
        this.loading = true;
        const { $api } = useNuxtApp();
  
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#008fec',
            cancelButtonColor: '#f13636',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
  
        if (!result.isConfirmed) {
            this.loading = false;
            return;
        }
  
        try {
            const response = await fetch(`${$api.purchaseOrder()}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth
            });
  
            if (!response.ok) {
                const err = await normalizeFailedResponse(response, 'Purchase Order gagal dihapus.')
                throw new Error(err.message)
            }
  
            await this.fetchPurchaseOrders();
            toast.success({
              title: 'Success',
              message: 'Purchase Order berhasil dihapus.',
              color: 'green',
              position: 'bottomRight',
            });
        } catch (error: any) {
            toast.error({
              title: 'Error',
              message: error.message || 'Gagal menghapus Purchase Order',
              color: 'red',
              position: 'bottomRight',
            });
        } finally {
            this.loading = false;
        }
      },
    
    async submitPurchaseOrder(purchaseOrderId: string) {
      const toast = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.submitPurchaseOrder(purchaseOrderId), {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({}),
          });
          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Purchase Order gagal disubmit.')
              throw new Error(err.message)
          }
          await this.fetchPurchaseOrders();
          toast.success({ title: 'Success', message: 'Purchase Order berhasil di-submit.', color: 'green', position: 'bottomRight' });
          return true;
      } catch (error: any) {
          toast.error({ title: 'Error', message: error.message || 'Gagal submit purchase order.', color: 'red', position: 'bottomRight' });
          return false;
      } finally {
          this.loading = false;
      }
    },

    async approvePurchaseOrder(purchaseOrderId: string, remarks?: string) {
      const toast     = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.approvePurchaseOrder(purchaseOrderId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ remarks: remarks ?? undefined }),
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Purchase Order gagal disetujui.')
              throw new Error(err.message)
          }

          await this.fetchPurchaseOrders();
          toast.success({
            title: 'Success',
            message: 'Purchase Order berhasil diapprove.',
            color: 'green',
            position: 'bottomRight',
          });
          return true;
      } catch (error: any) {
          console.error('Error approving purchase order:', error);
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal mengapprove purchase order.',
            color: 'red',
            position: 'bottomRight',
          });
          return false;
      } finally {
          this.loading = false;
      }
    },

    async rejectPurchaseOrder(purchaseOrderId: string, remarks?: string) {
      const toast     = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.rejectPurchaseOrder(purchaseOrderId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ remarks: remarks ?? undefined }),
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Purchase Order gagal ditolak.')
              throw new Error(err.message)
          }

          await this.fetchPurchaseOrders();
          toast.success({
            title: 'Success',
            message: 'Purchase Order berhasil direject.',
            color: 'green',
            position: 'bottomRight',
          });

          return true;
      } catch (error: any) {
          console.error('Error rejecting purchase order:', error);
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal mereject purchase order.',
            color: 'red',
            position: 'bottomRight',
          });
          return false;
      } finally {
          this.loading = false;
      }
    },

    async cancelPurchaseOrder(purchaseOrderId: string, reason?: string) {
      const toast = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.purchaseOrderCancel(purchaseOrderId), {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ reason: reason ?? undefined }),
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Purchase Order gagal dibatalkan.')
              throw new Error(err.message)
          }

          await this.fetchPurchaseOrders();
          toast.success({
            title: 'Success',
            message: 'Purchase Order berhasil dibatalkan.',
            color: 'green',
            position: 'bottomRight',
          });
          return true;
      } catch (error: any) {
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal membatalkan purchase order.',
            color: 'red',
            position: 'bottomRight',
          });
          return false;
      } finally {
          this.loading = false;
      }
    },

    async updateStatusPartial(itemId: string, status: boolean, receivedQty: number) {
      const toast     = useToast();
        this.loading = true;
        this.error = null;
        const { $api } = useNuxtApp();
        try {
            const resData = await apiFetch($api.purchaseOrderItemUpdateStatusPartial(itemId), {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: { 
                    receivedQty: receivedQty 
                },
                credentials: 'include', // Cookie-based auth (apiFetch already handles this)
            });

            const updatedPurchaseOrderItem = resData.data.purchaseOrderItem;
            const updatedPurchaseOrder = resData.data.purchaseOrder;

            if (this.purchaseOrder && this.purchaseOrder.purchaseOrderItems) {
                const index = this.purchaseOrder.purchaseOrderItems.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    this.purchaseOrder.purchaseOrderItems[index].statusPartial = updatedPurchaseOrderItem.statusPartial;
                    this.purchaseOrder.purchaseOrderItems[index].receivedQty = updatedPurchaseOrderItem.receivedQty;
                }
                if (this.purchaseOrder.status !== updatedPurchaseOrder.status) {
                    this.purchaseOrder.status = updatedPurchaseOrder.status;
                }
            }
            
            // ✅ Toast dihapus karena sudah ada di component yang memanggilnya
            
        } catch (error: any) {
            console.error('Gagal memperbarui status item PO atau PO:', error);
            this.error = error;
            toast.error({
              title: 'Error',
              message: error.data?.message || error.message || 'Operasi gagal',
              color: 'red',
              position: 'bottomRight',
            });
            throw error;
        } finally {
            this.loading = false;
        }
    },

    async receiveAllItems(purchaseOrderId: string) {
      const toast = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
          const response = await fetch($api.receiveAllPurchaseOrderItems(purchaseOrderId), {
              method: 'POST',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Gagal menerima semua item purchase order' }));
              throw new Error(errorData.message || 'Gagal menerima semua item purchase order');
          }

          const result = await response.json();

          return result;
      } catch (error: any) {
          console.error('Error receiving all items:', error);
          this.error = error;
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menerima semua item purchase order.',
            color: 'red',
            position: 'bottomRight',
          });
          throw error;
      } finally {
          this.loading = false;
      }
    },

    // Fungsi untuk mengambil data perusahaan menggunakan endpoint data
    async fetchPerusahaanData() {
        const toast = useToast();
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
          toast.error({
            title: 'Error',
            message: 'Gagal memuat daftar perusahaan.',
            color: 'red',
            position: 'bottomRight',
          });
          return [];
        }
    },
  
    // Fungsi untuk mengambil data cabang menggunakan endpoint data
    async fetchCabangData(perusahaanId?: number) {
        const toast = useToast();
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
            toast.error({
            title: 'Error',
            message: 'Gagal memuat daftar cabang.',
            color: 'red',
            position: 'bottomRight',
            });
            return [];
        }
    },

    // Fungsi untuk mengambil data warehouse menggunakan endpoint data
    async fetchVendorData() {
        const toast = useToast();
        try {
            const { $api } = useNuxtApp();
            const response = await fetch($api.dataVendor(), {
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
            throw new Error('Gagal memuat data vendor.');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(error);
            toast.error({
            title: 'Error',
            message: 'Gagal memuat daftar vendor.',
            color: 'red',
            position: 'bottomRight',
            });
            return [];
        }
    },

    // ✅ UPDATED: Method untuk mengambil produk berdasarkan warehouse (opsional)
    async fetchProductsByWarehouse(warehouseId?: number) {
        const toast = useToast();
        try {
            const { $api } = useNuxtApp();
            
            // Selalu muat semua produk dengan jumlah yang besar
            let url = `${$api.product()}?includeStocks=true&rows=10000`;
            
            // Jika warehouseId dipilih, tambahkan filter warehouse
            if (warehouseId) {
                url += `&warehouseId=${warehouseId}`;
            } else {
                // Fetch ALL products (no warehouse filter)
            }
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });
            
            if (response.ok) {
                const result = await response.json();
                const products = result.data || [];
                return products;
            } else {
                throw new Error(warehouseId ? 'Gagal memuat data produk untuk gudang ini' : 'Gagal memuat data produk');
            }
        } catch (error) {
            console.error('Error fetching products by warehouse:', error);
            toast.error({
                title: 'Error',
                message: warehouseId ? 'Gagal memuat data produk untuk gudang yang dipilih' : 'Gagal memuat data produk',
                color: 'red',
                position: 'bottomRight',
            });
            return [];
        }
    },

    // ✅ NEW: Method untuk memuat semua produk tanpa filter
    async fetchAllProducts() {
        const toast = useToast();
        try {
            const { $api } = useNuxtApp();
            
            const response = await fetch(`${$api.product()}?includeStocks=true&rows=10000`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth
            });
            
            if (response.ok) {
                const result = await response.json();
                const products = result.data || [];
                return products;
            } else {
                throw new Error('Gagal memuat semua produk');
            }
        } catch (error) {
            console.error('Error fetching all products:', error);
            toast.error({
                title: 'Error',
                message: 'Gagal memuat semua produk',
                color: 'red',
                position: 'bottomRight',
            });
            return [];
        }
    },

    openModal(purchaseOrderData: PurchaseOrder | null = null) {
        this.isEditMode = !!purchaseOrderData;
        this.validationErrors = [];

        if (purchaseOrderData) {
            const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
            
            // Salin data dan format tanggal dengan benar
            const formData: { [key: string]: any } = {
                ...JSON.parse(JSON.stringify(purchaseOrderData)),
                attachment: null, // Reset attachment, akan ditangani secara terpisah
            };

            const dateFields = ['date', 'dueDate', 'approvedAt', 'receivedAt'];
            dateFields.forEach(field => {
                if (formData[field]) {
                    formData[field] = formatDate(formData[field]);
                }
            });

            this.form = formData;

            // Set attachment preview jika ada
            if (purchaseOrderData.attachment) {
                const { getAttachmentUrl } = useImageUrl();
                this.form.attachmentPreview = getAttachmentUrl(purchaseOrderData.attachment);
            } else {
                this.form.attachmentPreview = '';
            }

            // Pastikan purchaseOrderItems ada
            if (!this.form.purchaseOrderItems || this.form.purchaseOrderItems.length === 0) {
                this.form.purchaseOrderItems = [];
                this.addItem();
            }

            // ✅ FIXED: Load cabang data untuk perusahaan yang dipilih saat edit mode
            if (this.form.perusahaanId && this.form.poType === 'internal') {
                this.loadCabangForPerusahaan(this.form.perusahaanId);
            }
        } else {
            this.form = {
                noPo: '',
                up: '',
                vendorId: null,
                perusahaanId: null,
                cabangId: null,
                termOfPayment: '',
                extNamaPerusahaan: '',
                date: new Date().toISOString().split('T')[0], 
                dueDate: new Date().toISOString().split('T')[0], 
                discountPercent: 0, 
                taxPercent: 0, 
                description: '',
                attachment: null, 
                status: 'draft',
                poType: 'internal', // Default ke internal
                purchaseRequestId: null,
                budgetId: null,
                departmentId: null,
                purchaseOrderItems: [],
            };
            this.addItem(); // Tambahkan satu item default untuk PO baru
        }
        this.showModal = true;
    },

    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {
            noPo: '',
            up: '',
            vendorId: null,
            perusahaanId: null,
            cabangId: null,
            termOfPayment: '',
            extNamaPerusahaan: '',
            date: new Date().toISOString().split('T')[0], 
            dueDate: new Date().toISOString().split('T')[0], 
            discountPercent: 0, 
            taxPercent: 0, 
            description: '',
          ttdDigital: false,
            attachment: null, 
            attachmentPreview: '',
            status: 'draft',
            poType: 'internal',
            purchaseRequestId: null,
            budgetId: null,
            departmentId: null,
            purchaseOrderItems: [],
        };
        this.validationErrors = [];
    },

    addItem() {
        this.form.purchaseOrderItems.push({
            productId: null, 
            warehouseId: null, 
            quantity: 1, 
            price: 0,
            description: '', 
            subtotal: 0,
        });
    },

    removeItem(index: number) {
        this.form.purchaseOrderItems.splice(index, 1);
    },

    setPagination(event: any) {
        this.params.first = Number(event.first) || 0;
        this.params.rows = Number(event.rows) || 10;
        this.fetchPurchaseOrders();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField || null;
        this.params.sortOrder = Number(event.sortOrder) || null;
        this.fetchPurchaseOrders();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchPurchaseOrders();
    },

    setFilters(filters: { vendorId?: number | null, poType?: string | null, status?: string | null, search?: string }) {
        this.params.vendorId = filters.vendorId;
        this.params.poType = filters.poType;
        this.params.status = filters.status;
        this.params.search = filters.search || '';
        this.params.first = 0; // reset pagination
        this.fetchPurchaseOrders();
    },

    async getPurchaseOrderDetails(poId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const resData = await apiFetch($api.getPurchaseOrderDetails(poId), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth (apiFetch already handles this)
        });
        
        if (resData && resData.data) {
          this.purchaseOrder = resData.data;
        } else {
          console.error('Invalid data structure received:', resData);
          throw new Error('Struktur data tidak valid diterima dari API getPurchaseOrderDetails.');
        }
      } catch (e: any) {
        console.error('Error in getPurchaseOrderDetails:', e);
        console.error('Error details:', {
          message: e.message,
          status: e.status,
          statusText: e.statusText,
          data: e.data
        });
        this.error = e;
      } finally {
        this.loading = false;
      }
    },

    async fetchPurchaseOrderForEdit(purchaseOrderId: string) {
      const toast     = useToast();
        this.loading = true;
        this.error = null;
        const { $api } = useNuxtApp();
        
        try {
            const resData = await apiFetch($api.getPurchaseOrderDetails(purchaseOrderId), {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth (apiFetch already handles this)
            });
            
            if (resData && resData.data) {
                
                // Panggil openModal dengan data lengkap
                this.openModal(resData.data);
            } else {
                console.error('Invalid data structure received:', resData);
                throw new Error('Data tidak valid diterima dari API.');
            }
        } catch (e: any) {
            console.error('Error in fetchPurchaseOrderForEdit:', e);
            this.error = e;
            toast.error({
              title: 'Error',
              message: 'Gagal mengambil data purchase order untuk edit',
              color: 'red',
              position: 'bottomRight',
            });
        } finally {
            this.loading = false;
        }
    },

    async fetchStats() {
        const toast = useToast();
        const { $api } = useNuxtApp()
        const defaultStats = { total: 0, approved: 0, rejected: 0, draft: 0, received: 0 };
        try {
            const response = await fetch($api.countPurchaseOrderByStatus(), {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
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
            this.stats = defaultStats;
        }
    },

    async fetchAllPurchaseOrdersForExport() {
        const toast = useToast();
        const { $api } = useNuxtApp();
        try {
            // Buat URL dengan parameter yang sama seperti filter saat ini
            const url = new URL($api.purchaseOrder());
            const params = new URLSearchParams({
                page: '1',
                rows: '10000', // Ambil semua data
                sortField: this.params.sortField || 'created_at',
                sortOrder: this.params.sortOrder?.toString() || '2',
                draw: '1',
                search: this.params.search || '',
                includeItems: 'true',
            });

            // Tambahkan filter yang aktif
            if (this.params.vendorId) {
                params.append('vendorId', this.params.vendorId.toString());
            }
            if (this.params.poType) {
                params.append('poType', this.params.poType);
            }
            if (this.params.status) {
                params.append('status', this.params.status);
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

            if (!response.ok) {
                throw new Error('Gagal mengambil data untuk export');
            }

            const result = await response.json();
            return Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error('Error fetching all purchase orders for export:', error);
            toast.error({
                title: 'Error',
                message: 'Gagal mengambil data untuk export',
                color: 'red',
                position: 'bottomRight',
            });
            return [];
        }
    },

    // ✅ NEW: Method untuk load cabang berdasarkan perusahaan
    async loadCabangForPerusahaan(perusahaanId: number) {
        try {
            const { $api } = useNuxtApp();
            const response = await fetch(`${$api.dataCabang()}?perusahaanId=${perusahaanId}`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth
            });
            
            if (response.ok) {
                const cabangData = await response.json();
                // Import cabangStore untuk mengupdate data cabang
                const { useCabangStore } = await import('~/stores/cabang');
                const cabangStore = useCabangStore();
                cabangStore.cabangs = cabangData;
            }
        } catch (error) {
            console.error('Error loading cabang for perusahaan:', error);
        }
    },
  }
})