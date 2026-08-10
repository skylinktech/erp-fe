import { defineStore, storeToRefs } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { Customer } from './customer'
import { useStocksStore } from '~/stores/stocks'


export interface SuratJalanItem {
  id              : string
  suratJalanId    : string
  salesOrderItemId: string
  productId       : number
  warehouseId     : number | null
  description     : string | null
  createdAt       : string
  updatedAt       : string
  product?        : {
    id       : number
    name     : string
    sku      : string
    priceSell: number
    unitId?  : number
    unit?    : {
      id  : number
      name: string
    }
  }
  warehouse?      : {
    id  : number
    name: string
  }
  salesOrderItem? : {
    id          : string
    quantity    : number
    price       : number
    subtotal    : number
    statusPartial: boolean
    deliveredQty: number
  }
}

export interface SuratJalan {
  id           : string
  noSuratJalan : string
  picName      : string
  penerima     : string
  date         : string
  description  : string
  alamatPengiriman: string
  ttdDigital?  : boolean
  customerId   : number
  salesOrderId?: string
  createdAt    : string
  updatedAt    : string
  customer?    : Customer
  salesOrder?     : {
    id          : string
    noSo        : string
    status      : string
    date        : string
    dueDate     : string
    up          : string
    description : string
    discountPercent: number
    taxPercent  : number
    total       : number
    customerId  : number
    perusahaanId: number
    cabangId    : number
    customer?   : Customer
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
    salesOrderItems?: Array<{
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
  suratJalanItems?: SuratJalanItem[]
}

interface SuratJalanState {
  suratJalans         : SuratJalan[]
  suratJalan          : SuratJalan | null
  selectedSuratJalan  : SuratJalan | null
  originalSuratJalan  : SuratJalan | null
  loading             : boolean
  saving              : boolean
  error               : any
  totalRecords        : number
  params: {
    first      : number
    rows       : number
    sortField  : string | null
    sortOrder  : number | null
    draw       : number
    search     : string
    customerId?: number | null
    salesOrderId?: string | null
  }
  form            : any,
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
  statistics      : {
    totalSuratJalans   : number
    withApprovedSO     : number
    withPartialSO      : number
    withDeliveredSO    : number
    manualSuratJalans  : number
  }
}

export const useSuratJalanStore = defineStore('suratJalan', {
  state: (): SuratJalanState => ({
    suratJalans         : [],
    suratJalan          : null,
    selectedSuratJalan  : null,
    originalSuratJalan  : null,
    loading             : true,
    saving              : false,
    error               : null,
    totalRecords        : 0,
    params: {
        first     : 0,
        rows      : 10,
        sortField : 'createdAt',
        sortOrder : -1,
        draw      : 1,
        search    : '',
        customerId: null,
        salesOrderId: null,
    },
    form: {
        noSuratJalan    : '',
        picName         : '',
        penerima        : '',
        date            : '',
        description     : '',
        alamatPengiriman: '',
        ttdDigital      : false,
        customerId      : null,
        salesOrderId    : null,
        suratJalanItems : [],
    },
    isEditMode      : false,
    showModal       : false,
    validationErrors: [],
    statistics      : {
        totalSuratJalans  : 0,
        withApprovedSO    : 0,
        withPartialSO     : 0,
        withDeliveredSO   : 0,
        manualSuratJalans : 0,
    },
  }),
  getters: {
  },
  actions: {
    async fetchSuratJalans(suppressError = false) {
      this.loading = true
      this.error   = null
      const { $api } = useNuxtApp()
        try {
        const url = new URL($api.suratJalan())
        const params = new URLSearchParams({
            page     : Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows     : Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder?.toString() || '',
            draw     : this.params.draw.toString(),
            search   : this.params.search || '',
        });

        if (this.params.customerId) {
          params.append('customerId', this.params.customerId.toString());
        }
        if (this.params.salesOrderId) {
          params.append('salesOrderId', this.params.salesOrderId.toString());
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

        if (!response.ok) throw new Error('Gagal mengambil data suratJalan')

        const result = await response.json()
        this.suratJalans = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data suratJalan:', e)
        this.error = e
        this.loading = false
      } finally {
        this.loading = false
      }
    },

    async fetchSuratJalanDetails(suratJalanId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        // ✅ PERBAIKAN: Add cache-busting parameter untuk force fresh data
        const url = `${$api.suratJalanShow(suratJalanId)}?_t=${Date.now()}`;

        const resData = await apiFetch(url, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache', // ✅ Force no cache
          },
          credentials: 'include', // Cookie-based auth (apiFetch already handles this)
        })
        
        
        if (resData && resData.data) {
          this.suratJalan = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API.')
        }
      } catch (error) {
        console.error('Error fetching suratJalan:', error)
      } finally {
        this.loading = false
      }
    },

    async saveSuratJalan() {
        const toast     = useToast();
        this.saving = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();
        const userStore = useUserStore();

        try {
            // ✅ VALIDASI STOK: Berlaku untuk semua kasus (dari SO maupun input manual)
            if (Array.isArray(this.form.suratJalanItems)) {
                const stockStore = useStocksStore();
                for (const [idx, item] of this.form.suratJalanItems.entries()) {
                    if (!item) continue;

                    // Validasi wajib pilih product & warehouse
                    if (!item.productId || !item.warehouseId) {
                        this.saving = false;
                        toast.error({
                          title  : 'Form Tidak Lengkap',
                          message: `Produk dan gudang wajib diisi pada baris ${idx + 1}.`,
                          color  : 'red',
                          position: 'bottomRight'
                        });
                        return;
                    }

                    // Normalisasi quantity minimal 0
                    const requestedQty = Math.max(0, Number(item.quantity) || 0);

                    try {
                        // Ambil stok terbaru per item-product-warehouse
                        stockStore.params.search = ''
                        stockStore.params.rows = 1
                        const res = await stockStore.fetchStocksPaginated({
                            productId  : Number(item.productId),
                            warehouseId: Number(item.warehouseId),
                        })
                        const availableQty = (res && res.data && res.data[0] && typeof res.data[0].quantity !== 'undefined')
                          ? Number(res.data[0].quantity) : 0

                        // Simpan ke item.stock agar UI konsisten
                        if (!item.stock) item.stock = {}
                        item.stock.quantity = availableQty

                        // Cegah jika qty melebihi stok
                        if (requestedQty > availableQty) {
                            this.saving = false
                            const productName = item?.product?.name || `Produk ID ${item.productId}`
                            const warehouseName = item?.warehouse?.name || `Gudang ID ${item.warehouseId}`
                            toast.error({
                              title  : 'Qty Melebihi Stok',
                              message: `Baris ${idx + 1}: ${productName} di ${warehouseName} tersedia ${availableQty}, diminta ${requestedQty}.`,
                              color  : 'red',
                              position: 'bottomRight'
                            })
                            return
                        }

                        // Cegah jika tidak ada stok sama sekali
                        if (availableQty < 1) {
                            this.saving = false
                            toast.error({
                              title  : 'Stok Tidak Cukup',
                              message: `Produk pada baris ${idx + 1} tidak memiliki stok di gudang terpilih.`,
                              color  : 'red',
                              position: 'bottomRight'
                            })
                            return
                        }
                    } catch (e) {
                        this.saving = false
                        toast.error({
                          title  : 'Error Stok',
                          message: `Gagal memeriksa stok untuk item ke-${idx + 1}.`,
                          color  : 'red',
                          position: 'bottomRight'
                        })
                        return
                    }
                }
            }

            // Prepare payload data - Always include all fields for update
            const payload: any = {
                customerId: Number(this.form.customerId) || null,
                salesOrderId: this.form.salesOrderId || null,
                date: this.form.date || '',
                description: this.form.description !== undefined ? this.form.description : '', // ✅ Always include
                alamatPengiriman: this.form.alamatPengiriman !== undefined ? this.form.alamatPengiriman : '', // ✅ Always include
                picName: this.form.picName || '',
                penerima: this.form.penerima || '',
                ttdDigital: !!this.form.ttdDigital,
            };

            

            // ✅ ADD: Format surat jalan items properly
            if (this.form.suratJalanItems && Array.isArray(this.form.suratJalanItems)) {
                payload.suratJalanItems = this.form.suratJalanItems
                    .filter((item: any) => item.productId && item.quantity > 0)
                    .map((item: any) => ({
                        salesOrderItemId: item.salesOrderItemId || null,
                        productId: Number(item.productId),
                        warehouseId: Number(item.warehouseId),
                        quantity: Number(item.quantity),
                        description: item.description || '',
                    }));
            } else {
                payload.suratJalanItems = [];
            }

            const method = this.isEditMode ? 'PUT' : 'POST';
            const url = this.isEditMode ? `${$api.suratJalan()}/${this.form.id}` : $api.suratJalan();
            
            
            
            // Send data to API
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
              const errorData = await response.json();
              if (response.status === 422) {
                  this.validationErrors = errorData.errors;
                  toast.error({
                    title: 'Error',
                    message: errorData.errors.map((e: any) => e.message).join('<br>'),
                    color: 'red',
                    position: 'bottomRight'
                  });
                  return false;
              } else {
                  throw new Error(errorData.message || 'Gagal menyimpan data suratJalan');
              }
            } else {
              this.closeModal();
              this.suratJalan = null;
              this.selectedSuratJalan = null;
              await this.fetchSuratJalans();
              await this.fetchStatistics(); // Refresh statistik setelah save
              
              toast.success({
                  title: 'Success',
                  message: `Surat Jalan berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
                  color: 'green',
                  position: 'bottomRight'
              });
              return true;
            }

        } catch (error: any) {
            // Error saving surat jalan
            // Clear validation errors on new general error
            this.validationErrors = [];
            
            toast.error({
              title: 'Error',
              message: error.message || 'Operasi gagal',
              color: 'red',
              position: 'bottomRight'
            });
            return false;
        } finally {
            this.saving = false;
        }
    },

    async deleteSuratJalan(id: string) {
      const toast     = useToast();
      this.error = null;
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
        const deleteUrl = `${$api.suratJalan()}/${id}`;
        
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus Surat Jalan');
        }

        // Optimistic update - remove from list immediately
        this.suratJalans = this.suratJalans.filter(item => item.id !== id);

        // Refresh data
        try {
          await this.fetchSuratJalans();
          await this.fetchStatistics(); // Refresh statistik setelah delete
        } catch (fetchError) {
          this.loading = false;
        }
        
        toast.success({
          title: 'Success',
          message: `Surat Jalan berhasil dihapus.`,
          color: 'green',
          position: 'bottomRight'
        });

      } catch (error: any) {
          let errorMessage = 'Gagal menghapus Surat Jalan';
          
          if (error?.message) {
            errorMessage = error.message;
          }
          
          toast.error({
            title: 'Error',
            message: errorMessage,
            color: 'red',
            position: 'bottomRight'
          });
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
          color: 'red'
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
            color: 'red'
            });
            return [];
        }
    },

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
          color: 'red'
          });
          return [];
      }
  },

    async openModal(suratJalanData: SuratJalan | null = null) {
      const toast     = useToast();
      this.isEditMode = !!suratJalanData;
      this.validationErrors = [];

      if (suratJalanData) {
          await this.fetchSuratJalanDetails(suratJalanData.id);
          const fullData = this.suratJalan;

          if (!fullData) {
              toast.error({
                title: 'Error',
                message: 'Tidak dapat memuat data Surat Jalan.',
                color: 'red',
                position: 'bottomRight'
              });
              return;
          }
          this.originalSuratJalan = JSON.parse(JSON.stringify(fullData));
          const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
          
          // Salin data ke form state dan format tanggal dengan benar
          this.form = {
              id: fullData.id,
              noSuratJalan: fullData.noSuratJalan || '',
              picName: fullData.picName || '',
              penerima: fullData.penerima || '',
              date: formatDate(fullData.date),
              description: fullData.description || '',
              alamatPengiriman: fullData.alamatPengiriman || '',
              customerId: fullData.customerId || null,
              salesOrderId: fullData.salesOrderId || null,
              suratJalanItems: fullData.suratJalanItems ? fullData.suratJalanItems.map((item: any) => ({
                  id: item.id,
                  suratJalanId: item.suratJalanId,
                  salesOrderItemId: item.salesOrderItemId,
                  productId: item.productId,
                  warehouseId: item.warehouseId,
                  quantity: item.quantity,
                  description: item.description || '',
                  product: item.product,
                  warehouse: item.warehouse,
                  salesOrderItem: item.salesOrderItem,
              })) : [],
          };

          
      } else {
          this.resetForm();
      }
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.originalSuratJalan = null;
      this.resetForm();
      this.validationErrors = [];
    },
    
    resetForm() {
      this.form = {
        noSuratJalan: '',
        customerId: null,
        picName: '',
        salesOrderId: null,
        penerima: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        alamatPengiriman: '',
        ttdDigital: false,
        suratJalanItems: [],
      };
    },

    setPagination(event: any) {
        this.params.first = Number(event.first) || 0;
        this.params.rows = Number(event.rows) || 10;
        this.fetchSuratJalans();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchSuratJalans();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchSuratJalans();
    },

    setFilters(filters: { customerId?: number | null, salesOrderId?: string | null, search?: string }) {
        this.params.customerId = filters.customerId;
        this.params.salesOrderId = filters.salesOrderId;
        this.params.search = filters.search || '';
        this.params.first = 0; // reset pagination
        this.fetchSuratJalans();
    },

    async fetchSuratJalanById(suratJalanId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const resData = await apiFetch($api.suratJalanShow(suratJalanId), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth (apiFetch already handles this)
        });
        
        
        if (resData && resData.data) {
          this.selectedSuratJalan = resData.data;
        } else {
          throw new Error('Struktur data tidak valid diterima dari API.');
        }
      } catch (e: any) {
        // Error fetching surat jalan by ID
        
        this.error = e;
        
        // Create more specific error messages
        let errorMessage = 'Gagal mengambil detail surat jalan';
        
        if (e.status === 404) {
          errorMessage = `Surat Jalan dengan ID ${suratJalanId} tidak ditemukan`;
        } else if (e.status === 401) {
            errorMessage = 'Tidak memiliki akses untuk melihat Surat Jalan ini';
        } else if (e.status === 403) {
          errorMessage = 'Tidak memiliki izin untuk melihat Surat Jalan ini';
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

    // ✅ NEW: Fetch invoice detail dengan salesInvoiceItems untuk detail page
    async fetchSuratJalanDetailWithItems(suratJalanId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const resData = await apiFetch($api.suratJalanShow(suratJalanId), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth (apiFetch already handles this)
        });
        
        
        if (resData && resData.data) {
          // Set salesInvoice dengan data lengkap termasuk salesInvoiceItems
          this.suratJalan = resData.data;
          return resData.data;
        } else {
          throw new Error('Struktur data tidak valid diterima dari API.');
        }
      } catch (e: any) {
        // Error fetching surat jalan detail with items
        
        this.error = e;
        
        // Create more specific error messages
        let errorMessage = 'Gagal mengambil detail surat jalan';
        
        if (e.status === 404) {
          errorMessage = `Surat Jalan dengan ID ${suratJalanId} tidak ditemukan`;
        } else if (e.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk melihat Surat Jalan ini';
        } else if (e.status === 403) {
          errorMessage = 'Tidak memiliki izin untuk melihat Surat Jalan ini';
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

    async fetchStatistics() {
        const toast = useToast();
        this.error = null;
        const { $api } = useNuxtApp();
        
        try {
            const response = await fetch($api.suratJalan() + '/statistics', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Cookie-based auth
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil statistik surat jalan');
            }

            const result = await response.json();
            this.statistics = result.data;
            
        } catch (error: any) {
            console.error('Error fetching surat jalan statistics:', error);
            this.error = error;
            toast.error({
                title: 'Error',
                message: 'Gagal memuat statistik surat jalan',
                color: 'red',
                position: 'bottomRight',
                layout: 2,
            });
        }
    },
  }
})
