import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Tax {
  id?: number
  name: string
  code: string
  rate: number
  type: 'percentage' | 'fixed'
  description?: string
  is_active: boolean
  is_default: boolean
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
      type: 'percentage',
      description: '',
      is_active: true,
      is_default: false
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    taxTypes: [
      { value: 'percentage', label: 'Persentase (%)' },
      { value: 'fixed', label: 'Nominal Tetap' }
    ]
  }),

  actions: {
    async fetchTaxes() {
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
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        Swal.fire('Error', `Tidak dapat memuat data pajak: ${e.message}`, 'error');
      } finally {
        this.loading = false
      }
    },

    async saveTax() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        
        const fieldsToSend = ['name', 'code', 'rate', 'type', 'description', 'is_active', 'is_default'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        let method = 'POST';
        let url = $api.taxesStore();
        if (this.isEditMode && this.form.id) {
          url = $api.taxesUpdate(this.form.id);
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
          throw new Error(result.message || 'Gagal menyimpan data pajak');
        }
        
        this.closeModal();
        await this.fetchTaxes();
        Swal.fire('Berhasil!', `Pajak berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`, 'success');

      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          Swal.fire('Error', error.message || 'Operasi gagal', 'error');
        }
      } finally {
        this.loading = false
      }
    },

    async deleteTax(id: number) {
      const { $api } = useNuxtApp();
      
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
          Swal.fire('Berhasil!', 'Pajak berhasil dihapus.', 'success');
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Gagal menghapus pajak', 'error');
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
          type: 'percentage',
          description: '',
          is_active: true,
          is_default: false
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
        rate: 0,
        type: 'percentage',
        description: '',
        is_active: true,
        is_default: false
      };
      this.validationErrors = [];
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
