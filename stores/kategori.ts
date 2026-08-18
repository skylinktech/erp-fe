import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import { apiFetch } from '~/utils/apiFetch'

export interface Category {
  id: number
  name: string
  description: string
}

interface Stats {
    total     : number | undefined
    sparepart : number | undefined
    oli       : number | undefined
    alat_berat: number | undefined
    tooling   : number | undefined
}

interface KategoriState {
  kategori    : Category[]
  loading     : boolean
  error       : any
  stats       : Stats
  totalRecords: number
  params      : {
    first    : number
    rows     : number
    sortField: string | null
    sortOrder: number | null
    search   : string
  }
  form: Partial<Category>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useKategoriStore = defineStore('kategori', {
    state: (): KategoriState => ({
    kategori: [],
    loading: false,
    error: null,
    stats: {
        total: undefined,
        sparepart: undefined,
        oli: undefined,
        alat_berat: undefined,
        tooling: undefined
    },
    totalRecords: 0,
    params: {
        first: 0,
        rows: 10,
        sortField: 'id',
        sortOrder: 1,
        search: '',
    },
    form: {},
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchKategori() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
            page     : ((this.params.first / this.params.rows) + 1).toString(),
            rows     : this.params.rows.toString(),
            sortField: this.params.sortField || '',
            sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
            search   : this.params.search || '',
        })

        const response = await fetch(`${$api.categories()}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Cookie-based auth
        })
        if (!response.ok) throw new Error('Gagal mengambil data kategori')

        const result = await response.json()
        this.kategori = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data kategori: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false
      }
    },
    
    async fetchStats() {
        const { $api } = useNuxtApp();
            const defaultStats = {
            total: undefined,
            sparepart: undefined,
            oli: undefined,
            alat_berat: undefined,
            tooling: undefined,
        };
        try {
            const response = await fetch($api.countProductByCategory(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Cookie-based auth
            });
            if (!response.ok) throw new Error('Gagal mengambil data statistik')

            const result = await response.json()
            this.stats = result
        } catch (error: any) {
            console.error('Gagal mengambil data statistik (exception):', error);
            this.stats = defaultStats;
        }
    },

    async saveKategori() {
        this.loading = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();

        try {
            let url = $api.categories();
            let method = 'POST';

            // Jika edit mode, gunakan endpoint /api/categories/:id dan method PUT
            if (this.isEditMode && this.form.id) {
                url = `${$api.categories()}/${this.form.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.form),
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
                const err = await normalizeFailedResponse(
                    response,
                    this.isEditMode ? 'Kategori gagal diperbarui.' : 'Kategori gagal dibuat.'
                )
                this.validationErrors = err.fieldErrorList
                toastNormalizedError(err)
                return false
            }

            const result = await response.json();
            
            this.closeModal();
            await this.fetchKategori();
            await this.fetchStats();
            const toast = useToast()
            toast.success({
              title: 'Success',
              message: `Kategori berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
              color: 'green',
              position: 'bottomRight',
            });

        } catch (error: any) {
            const err = normalizeApiError(error, 'Kategori gagal disimpan.')
            toastNormalizedError(err)
            return false
        } finally {
            this.loading = false;
        }
    },

    async deleteKategori(id: number) {
      this.loading = true;
      const { $api } = useNuxtApp();

      const result = await Swal.fire({
          title: 'Apakah Anda yakin?',
          text: "Data kategori yang dihapus tidak dapat dikembalikan!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#008fec',
          cancelButtonColor: '#f13636',
          confirmButtonText: 'Ya, hapus!',
          cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) {
          return;
      }

      try {
          const response = await fetch($api.categories() + `/${id}`, {
              method: 'DELETE',
              headers: {
                  'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Kategori gagal dihapus.')
              toastNormalizedError(err)
              return false
          }

          await this.fetchKategori();
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: 'Kategori berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
      } catch (error: any) {
          const err = normalizeApiError(error, 'Kategori gagal dihapus.')
          toastNormalizedError(err)
      } finally {
          this.loading = false;
      }
    },

    openModal(kategori: Category | null = null) {
        this.isEditMode = !!kategori;
        this.validationErrors = [];
        if (kategori) {
            this.form = { ...kategori };
        } else {
            this.form = {
                name: '', description: ''
            };
        }
        this.showModal = true;
    },

    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {};
        this.validationErrors = [];
    },

    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchKategori();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchKategori();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchKategori();
    },
  }
})
