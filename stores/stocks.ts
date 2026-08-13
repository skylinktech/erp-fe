import { defineStore } from 'pinia'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import type { PurchaseOrder } from './purchaseOrder'
import type { Warehouse } from './warehouse'
import type { User } from './userManagement'
import type { SalesOrder } from './sales-order'
import type { Product } from './product'

export interface StockIn {
  id             : string
  noSi           : string
  date           : string
  purchaseOrderId: number
  warehouseId    : number
  userId         : number
  stockId        : number
  quantity       : number
  description    : string
  status         : string
  purchaseOrder  : PurchaseOrder
  warehouse      : Warehouse
  user           : User
  stock          : Stock
  createdAt      : string
  updatedAt      : string
  product?       : Product
}

export interface StockOut {
  id          : number
  noSo        : string
  date        : string
  salesOrderId: number
  userId      : number
  stockId     : number
  description : string
  status      : string
  salesOrder  : SalesOrder
  user        : User
  stock       : Stock
  createdAt   : string
  updatedAt   : string
}

export interface Stock {
  id          : number
  productId   : number
  warehouseId : number
  quantity    : number
  createdAt   : string
  updatedAt   : string
}

export interface StockInDetail {
  id          : number
  nmCabang    : string
  alamatCabang: string
  kodeCabang  : string
  perusahaanId: number
  createdAt   : string
  updatedAt   : string
}

export interface StockOutDetail {
  id        : number
  name      : string
  sku       : string
  unitId    : number
  categoryId: number
  stockMin  : string
  priceBuy  : string
  priceSell : string
  isService : boolean
  image     : string
  createdAt : string
  updatedAt : string
}

export interface StockTransferItem {
  id             : string
  purchaseOrderId: string
  productId      : number
  quantity       : string
  price          : string
  description    : string
  subtotal       : string
  statusPartial  : boolean
  receivedQty    : string
  createdAt      : string
  updatedAt      : string
  product?       : Product
}

interface Stats {
  total : number | undefined
  perWarehouse: {
    warehouse_id: number
    total: number
  }[]
}

interface StockState {
  stocks       : StockIn[]
  totalRecords   : number
  stockOuts      : StockOut[]
  stockInDetails : StockInDetail[]
  stockOutDetails: StockOutDetail[]
  stockTransfers : StockTransferItem[]
  stats          : Stats
  loading        : boolean
  error          : any
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    productId?: number
    warehouseId?: number
  }
  form: any
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useStocksStore = defineStore('stocks', {
  state: (): StockState => ({
    stocks: [],
    stockOuts: [],
    stockInDetails: [],
    stockOutDetails: [],
    stockTransfers: [],
    totalRecords: 0,
    stats: {
      total: undefined,
      perWarehouse: []
    },
    loading       : false,
    error         : null,
    params: {
        first: 0,
        rows: 10,
        sortField: null,
        sortOrder: null,
        draw: 1,
        search: '',
        productId: undefined,
        warehouseId: undefined,
    },
    form: {},
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    openModal(data?: Partial<Stock>) {
      this.validationErrors = []
      if (data) {
        this.isEditMode = true
        this.form = {
          id: (data as any).id,
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantity: data.quantity,
          description: (data as any).description || ''
        }
      } else {
        this.isEditMode = false
        this.form = {
          productId: undefined,
          warehouseId: undefined,
          quantity: 0,
          description: ''
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    async saveStock() {
      const toast = useToast();
      this.loading = true
      this.validationErrors = []
      try {
        const { $api } = useNuxtApp()

        let url = $api.stock()
        let method: 'POST' | 'PUT' = 'POST'
        if (this.isEditMode && this.form.id) {
          url = `${$api.stock()}/${this.form.id}`
          method = 'PUT'
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: Number(this.form.productId),
            warehouseId: Number(this.form.warehouseId),
            quantity: Number(this.form.quantity),
            description: this.form.description || ''
          }),
          credentials: 'include' // Cookie-based auth
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Stock gagal diperbarui.' : 'Stock gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }

        this.closeModal()
        await this.fetchStocksPaginated({ productId: this.params.productId, warehouseId: this.params.warehouseId })
        await this.fetchStats()
        toast.success({ title: 'Success', message: `Stock berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}`, color: 'green' })
      } catch (error: any) {
        const err = normalizeApiError(error, 'Stock gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },
    async validateStockBatch(items: { productId: number, warehouseId: number, quantity: number }[]) {
        const { $api } = useNuxtApp();
        try {
            const response = await fetch(`${$api.validateStockBatch()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ items }),
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal memvalidasi stok dengan status: ' + response.status }));
                throw new Error(errorData.message || 'Gagal memvalidasi stok');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error in validateStockBatch:', error);
            throw error;
        }
    },

    async fetchStocksPaginated(filters: { productId?: number; warehouseId?: number } = {}) {
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

        if (filters.productId) {
          params.append('productId', filters.productId.toString())
        }
        if (filters.warehouseId) {
          params.append('warehouseId', filters.warehouseId.toString())
        }

        const response = await fetch(`${$api.stock()}?${params.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data stock dengan status: ' + response.status }));
            throw new Error(errorData.message || 'Gagal memuat data stock');
        }

        const result = await response.json();
        this.stocks = result.data || []; 
        this.totalRecords = parseInt(result.meta.total) || 0;
        
        return result;
      } catch (error) {
          this.stocks = [];
          this.totalRecords = 0;
          throw error;
      } finally {
          this.loading = false;
      }
    },

    // Fungsi untuk mengambil data stock
    async fetchStocks() {
      try {
        this.loading = true;
        const { $api }     = useNuxtApp();
        const url          = `${$api.stock()}`;

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch Stock details! status: ${response.status}. Response: ${errorBody}`);
        }

        const resData = await response.json();
        this.stocks = resData
      } catch (e) {
        console.error('Error fetching stock details:', e);
        this.error = e;
      } finally {
        this.loading = false;
      }
    },
    // Fungsi untuk menghapus stock
    async deleteStock(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useNuxtApp()

        const url = `${$api.stock()}/${id}`

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Stock gagal dihapus.')
          throw new Error(err.message)
        }

        return true
      }
      catch (e: any) {
        const err = normalizeApiError(e, 'Stock gagal dihapus.')
        throw new Error(err.message)
      }
        finally {
          this.loading = false
      }
    },
    // Fungsi untuk mengambil data statistik stock
    async fetchStats() {
      const defaultStats = {
        total: undefined,
        perWarehouse: []
      };
      try {
        const { $api } = useNuxtApp()
        const response = await fetch($api.getTotalStock(), {
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Cookie-based auth
        });
    
        if (response.ok) {
          const result = await response.json();
          if (result && typeof result === 'object' && result !== null) {
            this.stats = {
                total : result.total,
                perWarehouse: result.perWarehouse
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

    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchStocksPaginated();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchStocksPaginated();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchStocksPaginated();
    },

    handleRowsChange() {
        this.params.first = 0;
        this.fetchStocksPaginated();
    },

    setFilter(filters: { productId?: number; warehouseId?: number }) {
        if (filters.productId !== undefined) {
            this.params.productId = filters.productId;
        }
        if (filters.warehouseId !== undefined) {
            this.params.warehouseId = filters.warehouseId;
        }
        this.params.first = 0;
        this.fetchStocksPaginated();
    },

    async fetchStocksForExport() {
        const { $api } = useNuxtApp()
        try {
            const params = new URLSearchParams({
                search: this.params.search || '',
                all: 'true' // Tambahkan parameter all untuk mengambil semua data
            });

            // Tambahkan parameter filter yang aktif
            if (this.params.productId) {
                params.append('productId', this.params.productId.toString())
            }
            if (this.params.warehouseId) {
                params.append('warehouseId', this.params.warehouseId.toString())
            }

            const response = await fetch(`${$api.stockExportExcel()}?${params.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data stock untuk export dengan status: ' + response.status }));
                throw new Error(errorData.message || 'Gagal memuat data stock untuk export');
            }
            
            const result = await response.json()
            return {
              data: result.data || [],
              nmPerusahaan: result.nmPerusahaan || '',
            }
        } catch (error: any) {
            console.error('Error fetching stocks for export:', error)
            throw error
        }
    },

    async fetchAllStocksForExport() {
        const toast = useToast();
        const { $api } = useNuxtApp();
        try {
            const url = new URL($api.stock());
            const params = new URLSearchParams({
                page: '1',
                rows: '10000', // Ambil semua data
                sortField: this.params.sortField || 'created_at',
                sortOrder: this.params.sortOrder?.toString() || '2',
                draw: '1',
                search: this.params.search || '',
                includeItems: 'true',
            });
            
            if (this.params.productId) {
                params.append('productId', this.params.productId.toString());
            }
            if (this.params.warehouseId) {
                params.append('warehouseId', this.params.warehouseId.toString());
            }
            
            url.search = params.toString();
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include' // Cookie-based auth
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data untuk export');
            }

            const result = await response.json();
            return Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error('Error fetching all stocks for export:', error);
            toast.error({
                title: 'Error',
                message: 'Gagal mengambil data stock untuk export',
                color: 'red',
            });
            return [];
        }
    }
  }
})
