import { defineStore } from 'pinia'
import type { Warehouse } from './warehouse'
import type { Product } from './product'
import Swal from 'sweetalert2'

export interface StockTransfer {
  id                 : string
  noTransfer         : string
  perusahaanId       : number
  penerima           : string
  cabangId           : number
  date               : string
  fromWarehouseId    : string
  toWarehouseId      : string
  status             : string
  ttdDigital         : boolean
  fromWarehouse?     : Warehouse
  toWarehouse?       : Warehouse
  stockTransferDetails?: any[]
  stockTransferItems?: any[]
  createdAt          : string
  updatedAt          : string
  product?           : Product
}

interface Stats {
  total   : number | undefined
  draft   : number | undefined
  approved: number | undefined
  rejected: number | undefined
}

interface StockTransferState {
  totalRecords         : number
  stockTransfers       : StockTransfer[]
  selectedStockTransfer: StockTransfer | null
  stats                : Stats
  loading              : boolean
  error                : any
  productsInWarehouse: any[]
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
  }
  form: any
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  isLoadingEditData: boolean
}

export const useStockTransferStore = defineStore('stockTransfer', {
  state: (): StockTransferState => ({
    stockTransfers: [],
    selectedStockTransfer: null,
    totalRecords: 0,
    stats: {
      total: undefined,
      draft: undefined,
      approved: undefined,
      rejected: undefined
    },
    loading       : false,
    error         : null,
    productsInWarehouse: [],
    params: {
        first: 0,
        rows: 10,
        sortField: null,
        sortOrder: null,
        draw: 1,
        search: '',
    },
    form: {
      perusahaanId: null,
      cabangId: null,
      penerima: '',
      noTransfer: '',
      ttdDigital: false,
      date: '',
      fromWarehouseId: null,
      toWarehouseId: null,
      status: '',
      stockTransferItems: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    isLoadingEditData: false,
  }),
  actions: {
    async fetchStockTransfersPaginated() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const params = new URLSearchParams({
            page     : Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows     : Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder ? this.params.sortOrder.toString() : '',
            draw     : (this.params.draw || 1).toString(),
            search   : this.params.search || '',
        });

        const response = await fetch(`${$api.stockTransfer()}?${params.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data stock transfer dengan status: ' + response.status }));
            throw new Error(errorData.message || 'Gagal memuat data stock transfer');
        }

        const result = await response.json();
        this.stockTransfers = result.data || []; 
        this.totalRecords = parseInt(result.meta.total) || 0;
        
        return result;
      } catch (error) {
          this.stockTransfers = [];
          this.totalRecords = 0;
          throw error;
      } finally {
          this.loading = false;
      }
    },

    async saveStockTransfer() {
      const toast     = useToast();
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        let response
        let url
  
        const payload: any = {
          perusahaanId   : this.form.perusahaanId,
          penerima       : this.form.penerima,
          cabangId       : this.form.cabangId,
          date           : this.form.date,
          ttdDigital     : this.form.ttdDigital,
          fromWarehouseId: this.form.fromWarehouseId,
          toWarehouseId  : this.form.toWarehouseId,
          description    : this.form.description,
          stockTransferDetails: this.form.stockTransferItems?.map((item: any) => ({
            productId  : item.stock?.product?.id,
            quantity   : Number(item.quantity) || 0,
            description: item.description || ''
          })).filter((item: any) => item.productId) || []
        }
  
        if (this.isEditMode) {
          if (!this.form.id) {
            throw new Error('ID Stock Transfer tidak ditemukan untuk update.')
          }
          url = `${$api.stockTransfer()}/${this.form.id}`
          response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
          })
        }
        else {
          payload.status = 'draft'
          url = $api.stockTransfer()
          response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
          })
        }
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Gagal ${this.isEditMode ? 'memperbarui' : 'membuat'} stock transfer` }))
          if(response.status === 422) {
            this.validationErrors = errorData.errors;
          } else if (errorData.message) {
            // Menangkap error custom dari backend (misal: stok tidak cukup)
            this.validationErrors = [{ message: errorData.message }];
          }
          throw new Error(errorData.message || 'Terjadi kesalahan');
        } else {
          this.closeModal();
          this.selectedStockTransfer = null;
          await this.fetchStockTransfersPaginated();
          toast.success({
            title: 'Success',
            message: `Stock Transfer berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
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
    // Fungsi untuk mengambil data stock transfer
    async fetchStockTransfers() {
      try {
        this.loading = true;
        const { $api }     = useNuxtApp();
        const url          = `${$api.stockTransfer()}`;

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch Stock Transfer details! status: ${response.status}. Response: ${errorBody}`);
        }

        const resData = await response.json();
        this.stockTransfers = resData
      } catch (e) {
        console.error('Error fetching stock in details:', e);
        this.error = e;
      } finally {
        this.loading = false;
      }
    },
    // Fungsi untuk menghapus stock transfer
    async deleteStockTransfer(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useNuxtApp()

        const url = `${$api.stockTransfer()}/${id}`

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus stock transfer' }))
          throw new Error(errorData.message)
        }

        return true
      }
      catch (e: any) {
        console.error('Terjadi kesalahan saat menghapus stock transfer:', e)
        throw e
      }
        finally {
          this.loading = false
      }
    },
    async approveStockTransfer(stockTransferId: string) {
      const toast = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
          const response = await fetch($api.approveStockTransfer(stockTransferId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Gagal mengapprove stock transfer' }));
              throw new Error(errorData.message || 'Gagal mengapprove stock transfer');
          }

          await this.fetchStockTransfers();
          await toast.success({
            title: 'Success',
            message: 'Stock Transfer berhasil diapprove.',
            color: 'green'
          });

          return true;
      } catch (error: any) {
          console.error('Error approving stock transfer:', error);
          await toast.error({
            title: 'Error',
            message: error.message || 'Gagal mengapprove stock transfer.',
            color: 'red'
          });
          return false;
      } finally {
          this.loading = false;
      }
    },
    // Fungsi untuk mengambil data statistik stock transfer
    async fetchStats() {
      const defaultStats = {
        total   : undefined,
        draft   : undefined,
        approved: undefined,
        rejected: undefined,
      };
      try {
        const { $api } = useNuxtApp()
        const response = await fetch($api.countStockTransfer(), {
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Cookie-based auth
        });
    
        if (response.ok) {
          const result = await response.json();
          if (result && typeof result === 'object' && result !== null) {
            this.stats = {
                total   : result.total,
                draft   : result.draft,
                approved: result.approved,
                rejected: result.rejected,
            };
          } else {
            this.stats = defaultStats;
            console.warn('Data statistik dari API tidak dalam format objek yang diharapkan atau null:', result);
          }
        } else {
            this.stats = defaultStats;
            console.error('Gagal mengambil data statistik, status respons:', response.status);
        }
      } catch (error: any) {
        console.error('Gagal mengambil data statistik (exception):', error);
        this.stats = defaultStats;
        this.error = error;
      }
    },
    async openModal(stockTransferData: StockTransfer | null = null) {
      const toast = useToast();
      this.isEditMode = !!stockTransferData;
      this.validationErrors = [];
      
      // Set flag untuk prevent watcher trigger saat load edit data
      if (stockTransferData && stockTransferData.id) {
        this.isLoadingEditData = true;
      }

      if (stockTransferData && stockTransferData.id) {
          // Ambil detail lengkap dari server
          await this.fetchStockTransferById(stockTransferData.id);
          const detailedData = this.selectedStockTransfer;

          if (!detailedData) {
              toast.error({
                title: 'Error',
                message: 'Gagal memuat detail stock transfer.',
                color: 'red'
              });
              this.closeModal();
              return;
          }

          // Fetch products dulu dan tunggu sampai selesai
          if (detailedData.fromWarehouseId) {
            await this.fetchProductsByWarehouse(detailedData.fromWarehouseId);
          }

          const items = (detailedData.stockTransferDetails || []).map((detail: any) => {
            // Cari stock yang matching berdasarkan productId
            let matchingStock = this.productsInWarehouse.find(p => p.product?.id === detail.productId);
            
            // Jika stock tidak ditemukan di productsInWarehouse, buat dummy object untuk display
            if (!matchingStock) {
              // Parse detail.product untuk memastikan bukan Proxy
              const productData = detail.product ? JSON.parse(JSON.stringify(detail.product)) : null;
              
              const dummyStock = {
                id: detail.stockId || `temp-${detail.productId}`,
                productId: detail.productId,
                warehouseId: detailedData.fromWarehouseId,
                quantity: detail.quantity || 0,
                product: productData || { 
                  id: detail.productId, 
                  name: 'Unknown Product', 
                  sku: '-' 
                },
                warehouse: detailedData.fromWarehouse,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              // Tambahkan ke productsInWarehouse agar bisa dipilih di dropdown
              this.productsInWarehouse.push(dummyStock);
              matchingStock = dummyStock;
            }
            
            return {
              stock: matchingStock, // Keep as reference, tidak di-convert
              productId: detail.productId,
              quantity: detail.quantity,
              description: detail.description,
            };
          });

          this.form = {
            ...JSON.parse(JSON.stringify(detailedData)),
            date: detailedData.date ? new Date(detailedData.date).toISOString().slice(0, 10) : '',
            stockTransferItems: items,
          };

          if (this.form.stockTransferItems.length === 0) {
            this.addItem();
          }
          
          // Reset flag di nextTick supaya watcher sempat di-skip dulu
          const { nextTick } = await import('vue');
          await nextTick();
          this.isLoadingEditData = false;
      } else {
          this.form = {
            noTransfer: '',
            date: '',
            fromWarehouseId: null,
            toWarehouseId: null,
            status: '',
            stockTransferItems: [],
          };
          this.addItem();
      }
      this.showModal = true;
    },

    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {};
        this.validationErrors = [];
        this.productsInWarehouse = [];
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
          color: 'red'
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
          color: 'red'
        });
        return [];
      }
    },

    // Fungsi untuk mengambil data warehouse menggunakan endpoint data
    async fetchWarehouseData() {
      const toast = useToast();
      try {
        const { $api } = useNuxtApp();
        const response = await fetch($api.dataWarehouse(), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
          throw new Error('Gagal memuat data warehouse.');
        }

        const result = await response.json();
        return result;

      } catch (error) {
        console.error(error);
        toast.error({
          title: 'Error',
          message: 'Gagal memuat daftar warehouse.',
          color: 'red'
        });
        return [];
      }
    },

    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchStockTransfersPaginated();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchStockTransfersPaginated();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchStockTransfersPaginated();
    },

    handleRowsChange() {
        this.params.first = 0;
        this.fetchStockTransfersPaginated();
    },

    async fetchStockTransferById(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useNuxtApp()

        const response = await fetch(`${$api.getStockTransferDetails(id)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data stock transfer',
          }))
          throw new Error(errorData.message)
        }

        const result = await response.json()
        this.selectedStockTransfer = result
      }
      catch (e) {
        this.error = e
        throw e
      }
      finally {
        this.loading = false
      }
    },
    resetStockTransfer() {
      this.selectedStockTransfer = null;
      this.error = null;
    },
    addItem() {
      if (!this.form.stockTransferItems) {
          this.form.stockTransferItems = [];
      }
      this.form.stockTransferItems.push({
          stock: null,
          productId: null,
          quantity: 0
      });
    },
    removeItem(index: number) {
        if (this.form.stockTransferItems) {
            this.form.stockTransferItems.splice(index, 1);
        }
    },
    async fetchProductsByWarehouse(warehouseId: string) {
      const toast = useToast();
      if (!warehouseId) {
        this.productsInWarehouse = [];
        return;
      }
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await fetch(`${$api.stock()}?warehouseId=${warehouseId}&all=true`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
          throw new Error('Gagal memuat data produk dari gudang.');
        }

        const result = await response.json();
        
        // Ensure proper data structure with reactive copy and validation
        this.productsInWarehouse = (result.data || [])
          .filter((stock: any) => stock && stock.product) // Filter out items without product
          .map((stock: any) => ({
            ...stock,
            // Ensure nested objects are properly structured
            product: stock.product ? { ...stock.product } : null,
            warehouse: stock.warehouse ? { ...stock.warehouse } : null
          }));

      } catch (error) {
        this.productsInWarehouse = [];
        console.error('Error fetching products by warehouse:', error);
        toast.error({
          title: 'Error',
          message: 'Gagal memuat daftar produk.',
          color: 'red'
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchAllStockTransfersForExport() {
        const toast = useToast();
        const { $api } = useNuxtApp();
        try {
            // Buat URL dengan parameter yang sama seperti filter saat ini
            const url = new URL($api.stockTransfer());
            const params = new URLSearchParams({
                page: '1',
                rows: '10000', // Ambil semua data
                sortField: this.params.sortField || 'created_at',
                sortOrder: this.params.sortOrder?.toString() || '2',
                draw: '1',
                search: this.params.search || '',
                includeItems: 'true',
            });

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
            console.error('Error fetching all stock transfers for export:', error);
            toast.error({
                title: 'Error',
                message: 'Gagal mengambil data untuk export',
                color: 'red',
                position: 'topRight',
            });
            return [];
        }
    },
  }
})
