import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Tax {
  id?: string
  name: string
  code: string
  rate: number
  type: 'ppn' | 'pph' | 'lainnya'
  isActive: boolean
  createdBy?: number
  updatedBy?: number
  createdAt?: string
  updatedAt?: string
  createdByUser?: any
  updatedByUser?: any
}

interface TaxState {
  taxes: Tax[]
  selectedTax: Tax | null
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
  form: Partial<Tax>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  taxTypes: { value: string; label: string }[]
}

export const useTaxStore = defineStore('tax', {
  state: (): TaxState => ({
    taxes: [],
    selectedTax: null,
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
      rate: 0,
      type: 'ppn',
      isActive: true
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    taxTypes: [
      { value: 'ppn', label: 'PPN (Pajak Pertambahan Nilai)' },
      { value: 'pph', label: 'PPh (Pajak Penghasilan)' },
      { value: 'lainnya', label: 'Lainnya' }
    ]
  }),

  actions: {
    async fetchTaxes() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.taxes()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pajak.' }));
          throw new Error(errorData.message || 'Gagal memuat data pajak.');
        }

        const result = await response.json()
        this.taxes = result.data
        this.totalRecords = Number(result?.meta?.total) || 0
      } catch (e: any) {
        this.error = e.message
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data pajak: ${e.message}`,
          color: 'red',
          position: 'topRight',
          layout: 2,
        });
      } finally {
        this.loading = false
      }
    },

    async saveTax() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()
      const toast = useToast()

      try {
        const token = localStorage.getItem('token')

        // Debug: log form data
        console.log('Form data:', this.form)
        console.log('Is edit mode:', this.isEditMode)
        console.log('Form ID:', this.form.id)

        // Gunakan JSON data instead of FormData
        const payload = {
          name: this.form.name,
          code: this.form.code,
          rate: this.form.rate,
          type: this.form.type,
          isActive: this.form.isActive
        };

        let method = 'POST';
        let url = $api.taxesStore();
        if (this.isEditMode && this.form.id) {
          url = $api.taxesUpdate(this.form.id);
          method = 'PUT';
          console.log('Update URL:', url)
          console.log('Update method:', method)
        }

        console.log('Final payload:', payload)

        const response = await fetch(url, {
          method: method,
          body: JSON.stringify(payload),
          headers: {
            'Authorization': `Bearer ${token}`,
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

        console.log('Response status:', response.status)
        console.log('Response result:', result)

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            this.validationErrors = Object.values(result.errors).flat();
            return;
          }
          throw new Error(result.message || 'Gagal menyimpan data pajak');
        }
        
        this.closeModal();
        await this.fetchTaxes();
        toast.success({
          title: 'Success',
          message: `Pajak berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
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
        this.loading = false
      }
    },

    async deleteTax(id: string) {
      const { $api } = useNuxtApp();
      const toast = useToast();

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data pajak yang dihapus tidak dapat dikembalikan!",
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
          const response = await fetch($api.taxesDelete(id), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus pajak.' }));
            throw new Error(errorData.message || 'Gagal menghapus pajak.');
          }

          await this.fetchTaxes();
          toast.success({
            title: 'Success',
            message: 'Pajak berhasil dihapus.',
            color: 'green',
            position: 'topRight',
            layout: 2,
          });
        } catch (error: any) {
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus pajak',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        }
      }
    },

    openModal(tax?: Tax) {
      this.isEditMode = !!tax;
      this.validationErrors = [];
      
      if (tax) {
        this.form = { ...tax };
      } else {
        this.form = {
          name: '',
          code: '',
          rate: 0,
          type: 'ppn',
          isActive: true
        };
      }
      
      this.showModal = true;
    },

    resetForm() {
      this.form = {
        name: '',
        code: '',
        rate: 0,
        type: 'ppn',
        isActive: true
      }
      this.validationErrors = []
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.resetForm()
    },

    setPagination(event: any) {
      this.params.first = event.first;
      this.params.rows = event.rows;
      this.fetchTaxes();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField;
      this.params.sortOrder = event.sortOrder;
      this.fetchTaxes();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchTaxes();
    }
  }
})
