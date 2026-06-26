import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Asset {
  id?: number
  name: string
  category: string
  acquisitionDate: string
  acquisitionCost: number
  depreciationMethod: 'straight_line' | 'declining_balance' | 'sum_of_years'
  usefulLife: number
  residualValue: number
  location: string
  status: 'active' | 'inactive' | 'sold' | 'trashed'
  description?: string
  serialNumber?: string
  warrantyExpiry?: string
  cabangId?: number | null
  vendorId?: number | null
  perusahaanId?: number | null
  createdBy?: number
  createdByUser?: any
}

interface AssetState {
  assets: Asset[]
  selectedAsset: Asset | null
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
    saving: false,
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
      category: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: 0,
      depreciationMethod: 'straight_line',
      usefulLife: 1,
      residualValue: 0,
      location: '',
      status: 'active',
      description: '',
      serialNumber: '',
      warrantyExpiry: '',
      cabangId: null,
      vendorId: null,
      perusahaanId: null,
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
      { value: 'trashed', label: 'Dibuang' }
    ]
  }),

  actions: {
    async fetchAssets() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const toast = useToast();
      try {
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.assets()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data aset.' }));
          throw new Error(errorData.message || 'Gagal memuat data aset.');
        }

        const result = await response.json()
        this.assets = result.data
        this.totalRecords = Number(result?.meta?.total) || 0
      } catch (e: any) {
        this.error = e.message
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data aset: ${e.message}`,
          color: 'red',
          position: 'topRight',
          layout: 2,
        });
      } finally {
        this.loading = false
      }
    },

    async fetchAssetsSummary() {
      try {
        const { $api } = useNuxtApp()
        const response = await fetch($api.assetsSummary(), {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        })

        if (response.ok) {
          const result = await response.json()
          return result.data
        }
        return null
      } catch (error) {
        console.error('Error fetching assets summary:', error)
        return null
      }
    },

    async saveAsset() {
      this.saving = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()
      const toast = useToast();
      try {
        // Gunakan JSON data instead of FormData
        const payload = {
          name: this.form.name,
          category: this.form.category,
          acquisitionDate: this.form.acquisitionDate,
          acquisitionCost: this.form.acquisitionCost,
          depreciationMethod: this.form.depreciationMethod,
          usefulLife: this.form.usefulLife,
          residualValue: this.form.residualValue,
          location: this.form.location,
          status: this.form.status,
          description: this.form.description,
          serialNumber: this.form.serialNumber,
          warrantyExpiry: this.form.warrantyExpiry,
          cabangId: this.form.cabangId,
          vendorId: this.form.vendorId,
          perusahaanId: this.form.perusahaanId
        };

        let method = 'POST';
        let url = $api.assetsStore();
        if (this.isEditMode && this.form.id) {
          url = $api.assetsUpdate(this.form.id);
          method = 'PUT';
        }

        const response = await fetch(url, {
          method: method,
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
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
        toast.success({
          title: 'Success',
          message: `Aset berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
          layout: 2,
        });

      } catch (error: any) {
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
        this.saving = false
      }
    },

    async deleteAsset(id: number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
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
          const response = await fetch($api.assetsDelete(id), {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus aset.' }));
            throw new Error(errorData.message || 'Gagal menghapus aset.');
          }

          await this.fetchAssets();
          toast.success({
            title: 'Success',
            message: 'Aset berhasil dihapus.',
            color: 'green',
            position: 'topRight',
            layout: 2,
          });
        } catch (error: any) {
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus aset',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        }
      }
    },

    openModal(asset?: Asset) {
      this.isEditMode = !!asset;
      this.validationErrors = [];
      
      if (asset) {
        // Format tanggal agar sesuai dengan input type="date"
        const formattedAsset = { ...asset };
        
        // Format acquisitionDate
        if (formattedAsset.acquisitionDate) {
          const date = new Date(formattedAsset.acquisitionDate);
          if (!isNaN(date.getTime())) {
            formattedAsset.acquisitionDate = date.toISOString().split('T')[0];
          }
        }
        
        // Format warrantyExpiry
        if (formattedAsset.warrantyExpiry) {
          const date = new Date(formattedAsset.warrantyExpiry);
          if (!isNaN(date.getTime())) {
            formattedAsset.warrantyExpiry = date.toISOString().split('T')[0];
          }
        }
        
        this.form = formattedAsset;
      } else {
        this.form = {
          name: '',
          category: '',
          acquisitionDate: new Date().toISOString().split('T')[0],
          acquisitionCost: 0,
          depreciationMethod: 'straight_line',
          usefulLife: 1,
          residualValue: 0,
          location: '',
          status: 'active',
          description: '',
          serialNumber: '',
          warrantyExpiry: '',
          cabangId: null,
          vendorId: null,
          perusahaanId: null,
        };
      }
      
      this.showModal = true;
    },

    resetForm() {
      this.form = {
        name: '',
        category: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionCost: 0,
        depreciationMethod: 'straight_line',
        usefulLife: 1,
        residualValue: 0,
        location: '',
        status: 'active',
        description: '',
        serialNumber: '',
        warrantyExpiry: '',
        cabangId: null,
        vendorId: null,
        perusahaanId: null,
      }
      this.validationErrors = []
    },

    // Method untuk mengatur nilai field dengan format rupiah
    setAcquisitionCost(value: string) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
      this.form.acquisitionCost = numericValue
    },

    setResidualValue(value: string) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
      this.form.residualValue = numericValue
    },



    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.resetForm()
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
      const cost = this.form.acquisitionCost || 0;
      const salvage = this.form.residualValue || 0;
      const life = this.form.usefulLife || 1;
      const method = this.form.depreciationMethod;

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

      // Calculate current value but don't store it since it's not in the model
      const currentValue = Math.max(cost - depreciation, salvage);
      console.log('Calculated current value:', currentValue);
    }
  }
})
