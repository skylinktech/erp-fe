import { defineStore } from 'pinia'
import type { StockIn, StockOut, Stock, StockInDetail, StockOutDetail, StockTransfer } from './stocks'

interface Stats {
  total : number | undefined
  draft : number | undefined
  posted: number | undefined
}

interface StockState {
  stockIns       : StockIn[]
  selectedStockIn: StockIn | null
  totalRecords   : number
  stockOuts      : StockOut[]
  stockInDetails : StockInDetail[]
  stockOutDetails: StockOutDetail[]
  stockTransfers : StockTransfer[]
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
    id: string
  }
  selectedIds: string[]
  selectAll: boolean
}

export const useStockStore = defineStore('stock', {
  state: (): StockState => ({
    stockIns: [],
    stockOuts: [],
    stockInDetails: [],
    stockOutDetails: [],
    stockTransfers: [],
    selectedStockIn: null,
    totalRecords: 0,
    stats: {
      total: undefined,
      draft: undefined,
      posted: undefined
    },
    loading       : false,
    error         : null,
    params: {
        first: 0,
        rows: 10,
        sortField: 'created_at',
        sortOrder: 2, // 2 = descending, 1 = ascending
        draw: 1,
        search: '',
        id: '',
    },
    selectedIds: [],
    selectAll: false,
  }),
  getters: {
    // Getter untuk memastikan selectedIds selalu array
    getSelectedIds: (state) => {
      return Array.isArray(state.selectedIds) ? state.selectedIds : [];
    },
    
    // Getter untuk memastikan stockIns selalu array
    getStockIns: (state) => {
      return Array.isArray(state.stockIns) ? state.stockIns : [];
    }
  },
  actions: {
    async fetchStockInsPaginated() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            page     : ((this.params.first / this.params.rows) + 1).toString(),
            rows     : this.params.rows.toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder ? this.params.sortOrder.toString() : '',
            draw     : (this.params.draw || 1).toString(),
            search   : this.params.search || '',
        });

        const response = await fetch(`${$api.stockIn()}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data stock in dengan status: ' + response.status }));
            throw new Error(errorData.message || 'Gagal memuat data stock in');
        }

        const result = await response.json();
        this.stockIns = result.data || []; 
        this.totalRecords = parseInt(result.meta.total) || 0;
        
        // Ensure selectedIds is always an array and clear selection
        this.ensureSelectedIdsArray();
        this.clearSelection();
        
        return result;
      } catch (error) {
          this.stockIns = [];
          this.totalRecords = 0;
          // Clear selection jika terjadi error
          this.clearSelection();
          throw error;
      } finally {
          this.loading = false;
      }
    },
    // Fungsi untuk mengambil data stock in
    async fetchStockIns() {
      try {
        this.loading = true;
        const { $api }     = useNuxtApp();
        const url          = `${$api.stockIn()}`;
        const token        = localStorage.getItem('token');

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch Stock In details! status: ${response.status}. Response: ${errorBody}`);
        }

        const resData = await response.json();
        this.stockIns = resData;
        
        // Ensure selectedIds is always an array
        this.ensureSelectedIdsArray();
      } catch (e) {
        console.error('Error fetching stock in details:', e);
        this.error = e;
      } finally {
        this.loading = false;
      }
    },
    // Fungsi untuk menghapus stock in
    async deleteStockIn(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useNuxtApp()
        const token = localStorage.getItem('token')

        const url = `${$api.stockIn()}/${id}`

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus stock in' }))
          throw new Error(errorData.message)
        }

        return true
      }
      catch (e: any) {
        console.error('Terjadi kesalahan saat menghapus stock in:', e)
        throw e
      }
        finally {
          this.loading = false
      }
    },

    // Fungsi untuk mengambil data statistik stock in
    async fetchStats() {
      const defaultStats = {
        total: undefined,
        draft: undefined,
        posted: undefined,
      };
      try {
        const { $api } = useNuxtApp()
        const token = localStorage.getItem('token')
        const response = await fetch($api.countStockIn(), {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    
        if (response.ok) {
          const result = await response.json();
          if (result && typeof result === 'object' && result !== null) {
            this.stats = {
                total : result.total,
                draft : result.draft,
                posted: result.posted,
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
        try {
            this.params.first = event.first;
            this.params.rows = event.rows;
            this.clearSelection(); // Clear selection saat pagination berubah
            this.fetchStockInsPaginated();
        } catch (error) {
            console.error('Error in setPagination:', error);
            this.clearSelection();
        }
    },

    setSort(event: any) {
        try {
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.clearSelection(); // Clear selection saat sort berubah
            this.fetchStockInsPaginated();
        } catch (error) {
            console.error('Error in setSort:', error);
            this.clearSelection();
        }
    },
        
    setSearch(value: string) {
        try {
            this.params.search = value;
            this.params.first = 0;
            this.clearSelection(); // Clear selection saat search berubah
            this.fetchStockInsPaginated();
        } catch (error) {
            console.error('Error in setSearch:', error);
            this.clearSelection();
        }
    },

    handleRowsChange() {
        try {
            this.params.first = 0;
            this.clearSelection(); // Clear selection saat rows berubah
            this.fetchStockInsPaginated();
        } catch (error) {
            console.error('Error in handleRowsChange:', error);
            this.clearSelection();
        }
    },

    async fetchStockInById(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useNuxtApp()
        const token = localStorage.getItem('token')

        const response = await fetch(`${$api.getStockInDetails(id)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data stock in',
          }))
          throw new Error(errorData.message)
        }

        const result = await response.json()
        this.selectedStockIn = result
      }
      catch (e) {
        this.error = e
        throw e
      }
      finally {
        this.loading = false
      }
    },
    resetStockIn() {
      this.selectedStockIn = null;
      this.error = null;
    },

    // Methods untuk checkbox selection
    toggleSelectAll() {
      this.selectAll = !this.selectAll;
      if (this.selectAll) {
        // Pilih semua stock in yang berstatus draft
        this.selectedIds = this.stockIns
          .filter(stock => stock.status === 'draft')
          .map(stock => stock.id);
      } else {
        this.selectedIds = [];
      }
    },

    selectAllStockIns() {
      // Pilih semua stock in yang berstatus draft
      if (!this.stockIns || !Array.isArray(this.stockIns)) {
        console.warn('stockIns is not available or not an array');
        this.selectedIds = [];
        this.selectAll = false;
        return;
      }
      
      try {
        // Pastikan selectedIds adalah array yang valid
        if (!Array.isArray(this.selectedIds)) {
          this.selectedIds = [];
        }
        
        const draftStockIns = this.stockIns
          .filter(stock => stock && stock.status === 'draft')
          .map(stock => stock.id);
        
        // Gunakan spread operator dengan aman
        this.selectedIds = [...draftStockIns];
        this.selectAll = true;
      } catch (error) {
        console.error('Error in selectAllStockIns:', error);
        this.selectedIds = [];
        this.selectAll = false;
      }
    },

    selectStockIn(id: string) {
      // Hanya select jika status draft dan belum terpilih
      if (!this.stockIns || !Array.isArray(this.stockIns)) {
        console.warn('stockIns is not available or not an array');
        return;
      }
      
      try {
        // Pastikan selectedIds adalah array yang valid
        if (!Array.isArray(this.selectedIds)) {
          this.selectedIds = [];
        }
        
        const stockIn = this.stockIns.find(stock => stock && stock.id === id);
        if (stockIn && stockIn.status === 'draft' && !this.selectedIds.includes(id)) {
          this.selectedIds.push(id);
        }
      } catch (error) {
        console.error('Error in selectStockIn:', error);
        // Reset selectedIds jika terjadi error
        this.selectedIds = [];
      }
    },

    deselectStockIn(id: string) {
      try {
        // Pastikan selectedIds adalah array yang valid
        if (!Array.isArray(this.selectedIds)) {
          this.selectedIds = [];
          return;
        }
        
        const index = this.selectedIds.indexOf(id);
        if (index > -1) {
          this.selectedIds.splice(index, 1);
        }
      } catch (error) {
        console.error('Error in deselectStockIn:', error);
        // Reset selectedIds jika terjadi error
        this.selectedIds = [];
      }
    },

    toggleSelection(id: string) {
      try {
        // Pastikan selectedIds dan stockIns adalah array yang valid
        if (!Array.isArray(this.selectedIds)) {
          this.selectedIds = [];
        }
        
        if (!this.stockIns || !Array.isArray(this.stockIns)) {
          console.warn('stockIns is not available or not an array');
          return;
        }
        
        const index = this.selectedIds.indexOf(id);
        if (index > -1) {
          this.selectedIds.splice(index, 1);
        } else {
          this.selectedIds.push(id);
        }
        
        // Update selectAll status
        const draftStockIns = this.stockIns.filter(stock => stock && stock.status === 'draft');
        this.selectAll = this.selectedIds.length === draftStockIns.length && draftStockIns.length > 0;
      } catch (error) {
        console.error('Error in toggleSelection:', error);
        // Reset selectedIds jika terjadi error
        this.selectedIds = [];
        this.selectAll = false;
      }
    },

    clearSelection() {
      try {
        // Pastikan selectedIds selalu array yang valid
        this.selectedIds = [];
        this.selectAll = false;
        
        // Double check untuk memastikan konsistensi
        this.ensureSelectedIdsArray();
      } catch (error) {
        console.error('Error in clearSelection:', error);
        // Fallback: reset to initial state
        this.selectedIds = [];
        this.selectAll = false;
      }
    },

    // Method untuk reset state ke kondisi awal
    resetState() {
      try {
        // Pastikan semua array di-reset dengan benar
        this.selectedIds = [];
        this.selectAll = false;
        this.stockIns = [];
        this.totalRecords = 0;
        this.loading = false;
        this.error = null;
        
        // Pastikan selectedIds selalu array
        this.ensureSelectedIdsArray();
      } catch (error) {
        console.error('Error in resetState:', error);
        // Force reset dengan nilai default
        this.selectedIds = [];
        this.selectAll = false;
        this.stockIns = [];
        this.totalRecords = 0;
        this.loading = false;
        this.error = null;
      }
    },

    // Method untuk memastikan selectedIds selalu array
    ensureSelectedIdsArray() {
      try {
        if (!this.selectedIds || !Array.isArray(this.selectedIds)) {
          console.warn('selectedIds is not an array, resetting to empty array');
          this.selectedIds = [];
        }
        
        // Pastikan selectedIds tidak memiliki nilai undefined atau null
        this.selectedIds = this.selectedIds.filter(id => id !== undefined && id !== null);
      } catch (error) {
        console.error('Error in ensureSelectedIdsArray:', error);
        // Force reset jika terjadi error
        this.selectedIds = [];
      }
    },

    // Method untuk export data dengan detail
    async exportStockInWithDetails() {
      try {
        const { $api } = useNuxtApp();
        const token = localStorage.getItem('token');
        
        // Ambil semua data stock in dengan detail untuk export
        const response = await fetch(`${$api.stockInExport()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal export data stock in' }));
            throw new Error(errorData.message || 'Gagal export data stock in');
        }

        const result = await response.json();
        
        return result.data || [];
      } catch (error) {
          throw error;
      }
    },

    // Method untuk posting multiple stock in
    async postAllStockIn(ids: string[]) {
      try {
        console.log('Store: Starting postAllStockIn with ids:', ids);
        
        const { $api } = useNuxtApp();
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Token tidak ditemukan');
        }

        const response = await fetch($api.postAllStockIn(), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids }),
          credentials: 'include',
        });

        console.log('Store: Response status:', response.status);
        console.log('Store: Response headers:', response.headers);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('Store: Error response data:', errorData);
          } catch (parseError) {
            console.error('Store: Failed to parse error response:', parseError);
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }
          
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Store: Success response:', result);
        return result;
        
      } catch (e) {
        console.error('Store: Error posting all stock in:', e);
        console.error('Store: Error details:', {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
          type: typeof e
        });
        this.error = e;
        throw e;
      }
    },

    // Method untuk posting single stock in
    async postStockIn(id: string) {
      try {
        const { $api } = useNuxtApp();
        const token = localStorage.getItem('token');

        const url = `${$api.postStockIn(id)}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memposting stock in' }));
          throw new Error(errorData.message);
        }

        return true;
      } catch (e) {
        console.error('Error posting stock in:', e);
        this.error = e;
        throw e;
      } finally {
        this.loading = false;
      }
    },

            // Method untuk posting multiple stock in dengan UI feedback
        async postAllSelectedStockIn(ids: string[]) {
          try {
            this.loading = true;
            const result = await this.postAllStockIn(ids);
            
            // Refresh data setelah posting
            await this.fetchStockInsPaginated();
            
            return result;
          } catch (error) {
            throw error;
          } finally {
            this.loading = false;
          }
        },
        
        // Override $reset untuk memastikan state selalu valid
        $reset() {
          try {
            this.selectedIds = [];
            this.selectAll = false;
            this.stockIns = [];
            this.totalRecords = 0;
            this.loading = false;
            this.error = null;
            this.stats = {
              total: undefined,
              draft: undefined,
              posted: undefined
            };
            this.params = {
              first: 0,
              rows: 10,
              sortField: null,
              sortOrder: null,
              draw: 1,
              search: '',
              id: '',
            };
            
            // Pastikan selectedIds selalu array
            this.ensureSelectedIdsArray();
          } catch (error) {
            console.error('Error in $reset:', error);
            // Force reset dengan nilai default
            this.selectedIds = [];
            this.selectAll = false;
            this.stockIns = [];
            this.totalRecords = 0;
            this.loading = false;
            this.error = null;
          }
        }
      }
    })
