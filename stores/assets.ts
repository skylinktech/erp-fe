import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Asset {
  id?: number
  name: string
  code: string
  category: string
  purchase_date: string
  purchase_cost: number
  current_value: number
  depreciation_method: 'straight_line' | 'declining_balance' | 'sum_of_years'
  useful_life: number
  salvage_value: number
  location: string
  status: 'active' | 'inactive' | 'sold' | 'disposed'
  description?: string
  serial_number?: string
  warranty_expiry?: string
  supplier?: string
  created_by?: number
  created_by_user?: any
}

interface AssetState {
  assets: Asset[]
  selectedAsset: Asset | null
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
  form: Partial<Asset>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  assetCategories: { value: string; label: string }[]
  depreciationMethods: { value: string; label: string }[]
  assetStatuses: { value: string; label: string }[]
}

export const useAssetStore = defineStore('asset', {
  state: (): AssetState => ({
    assets: [],
    selectedAsset: null,
    loading: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'name',
      sortOrder: 1,
      search: '',
    },
    form: {
      name: '',
      code: '',
      category: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_cost: 0,
      current_value: 0,
      depreciation_method: 'straight_line',
      useful_life: 1,
      salvage_value: 0,
      location: '',
      status: 'active',
      description: '',
      serial_number: '',
      warranty_expiry: '',
      supplier: ''
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    assetCategories: [
      { value: 'land', label: 'Tanah' },
      { value: 'building', label: 'Bangunan' },
      { value: 'vehicle', label: 'Kendaraan' },
      { value: 'equipment', label: 'Peralatan' },
      { value: 'furniture', label: 'Furnitur' },
      { value: 'computer', label: 'Komputer' },
      { value: 'software', label: 'Software' },
      { value: 'intangible', label: 'Aset Tidak Berwujud' },
      { value: 'other', label: 'Lainnya' }
    ],
    depreciationMethods: [
      { value: 'straight_line', label: 'Garis Lurus' },
      { value: 'declining_balance', label: 'Saldo Menurun' },
      { value: 'sum_of_years', label: 'Jumlah Angka Tahun' }
    ],
    assetStatuses: [
      { value: 'active', label: 'Aktif' },
      { value: 'inactive', label: 'Tidak Aktif' },
      { value: 'sold', label: 'Terjual' },
      { value: 'disposed', label: 'Dibuang' }
    ]
  }),

  actions: {
    async fetchAssets() {
      this.loading = true
      this.error = null
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

        const response = await fetch(`${$api.assets()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data aset.' }));
          throw new Error(errorData.message || 'Gagal memuat data aset.');
        }

        const result = await response.json()
        this.assets = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        Swal.fire('Error', `Tidak dapat memuat data aset: ${e.message}`, 'error');
      } finally {
        this.loading = false
      }
    },

    async saveAsset() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        
        const fieldsToSend = ['name', 'code', 'category', 'purchase_date', 'purchase_cost', 'current_value', 'depreciation_method', 'useful_life', 'salvage_value', 'location', 'status', 'description', 'serial_number', 'warranty_expiry', 'supplier'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        let method = 'POST';
        let url = $api.assetsStore();
        if (this.isEditMode && this.form.id) {
          url = $api.assetsUpdate(this.form.id);
          method = 'PUT';
        }

        const response = await fetch(url, {
          method: method,
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
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
          throw new Error(result.message || 'Gagal menyimpan data aset');
        }
        
        this.closeModal();
        await this.fetchAssets();
        Swal.fire('Berhasil!', `Aset berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`, 'success');

      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          Swal.fire('Error', error.message || 'Operasi gagal', 'error');
        }
      } finally {
        this.loading = false
      }
    },

    async deleteAsset(id: number) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data aset yang dihapus tidak dapat dikembalikan!",
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
          const response = await fetch($api.assetsDelete(id), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus aset.' }));
            throw new Error(errorData.message || 'Gagal menghapus aset.');
          }

          await this.fetchAssets();
          Swal.fire('Berhasil!', 'Aset berhasil dihapus.', 'success');
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Gagal menghapus aset', 'error');
        }
      }
    },

    openModal(asset?: Asset) {
      this.isEditMode = !!asset;
      this.validationErrors = [];
      
      if (asset) {
        this.form = { ...asset };
      } else {
        this.form = {
          name: '',
          code: '',
          category: '',
          purchase_date: new Date().toISOString().split('T')[0],
          purchase_cost: 0,
          current_value: 0,
          depreciation_method: 'straight_line',
          useful_life: 1,
          salvage_value: 0,
          location: '',
          status: 'active',
          description: '',
          serial_number: '',
          warranty_expiry: '',
          supplier: ''
        };
      }
      
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        name: '',
        code: '',
        category: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_cost: 0,
        current_value: 0,
        depreciation_method: 'straight_line',
        useful_life: 1,
        salvage_value: 0,
        location: '',
        status: 'active',
        description: '',
        serial_number: '',
        warranty_expiry: '',
        supplier: ''
      };
      this.validationErrors = [];
    },

    setPagination(event: any) {
      this.params.first = event.first;
      this.params.rows = event.rows;
      this.fetchAssets();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField;
      this.params.sortOrder = event.sortOrder;
      this.fetchAssets();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchAssets();
    },

    calculateDepreciation() {
      const cost = this.form.purchase_cost || 0;
      const salvage = this.form.salvage_value || 0;
      const life = this.form.useful_life || 1;
      const method = this.form.depreciation_method;

      let depreciation = 0;

      switch (method) {
        case 'straight_line':
          depreciation = (cost - salvage) / life;
          break;
        case 'declining_balance':
          depreciation = cost * (2 / life);
          break;
        case 'sum_of_years':
          const sumOfYears = (life * (life + 1)) / 2;
          depreciation = (cost - salvage) * (life / sumOfYears);
          break;
      }

      this.form.current_value = Math.max(cost - depreciation, salvage);
    }
  }
})
