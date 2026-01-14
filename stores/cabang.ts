import { defineStore } from 'pinia'
import type { Perusahaan } from './perusahaan'
import Swal from 'sweetalert2'
// We will use native fetch as requested, so apiFetch is no longer needed here.

export interface Cabang {
  id: number
  kodeCabang: string
  nmCabang: string
  alamatCabang: string
  perusahaanId: number
  createdAt: string
  updatedAt: string
  perusahaan?: Perusahaan
}

interface CabangState {
  cabangs: Cabang[]
  loading: boolean
  totalRecords: number
  showModal: boolean
  isEditMode: boolean
  form: Partial<Cabang>
  validationErrors: any
  error: string | null
  params: {
    page: number
    rows: number
    sortField?: string
    sortOrder?: number
    filters?: any
  }
}

const initialFormState: Partial<Cabang> = {
  id: undefined,
  kodeCabang: '',
  nmCabang: '',
  alamatCabang: '',
  perusahaanId: undefined,
}

export const useCabangStore = defineStore('cabang', {
  state: (): CabangState => ({
    cabangs: [],
    loading: false,
    totalRecords: 0,
    showModal: false,
    isEditMode: false,
    form: { ...initialFormState },
    validationErrors: [],
    error: null,
    params: {
      page: 1,
      rows: 10,
    },
  }),
  actions: {
    async fetchCabangs() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const url = new URL($api.cabang())
        url.searchParams.append('page', this.params.page.toString())
        url.searchParams.append('rows', this.params.rows.toString())
        if (this.params.sortField) {
          url.searchParams.append('sortField', this.params.sortField)
          url.searchParams.append('sortOrder', this.params.sortOrder === 1 ? 'asc' : 'desc')
        }
        if (this.params.filters?.global?.value) {
          url.searchParams.append('search', this.params.filters.global.value)
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include', // Cookie-based auth
        })
        
        if (!response.ok) throw new Error('Gagal mengambil data cabang')

        const result = await response.json()
        this.cabangs = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data cabang:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchCabangByPerusahaan(perusahaanId: number) {
        if (!perusahaanId) {
            this.cabangs = []
            return
        }
        this.loading = true
        const { $api } = useNuxtApp()
        try {
            const response = await fetch($api.cabang() + `?perusahaan_id=${perusahaanId}`, {
                 method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth
            })
            const result = await response.json()
            this.cabangs = result.data || []
        } catch (error) {
            console.error('Gagal mengambil data cabang by perusahaan:', error)
        } finally {
            this.loading = false
        }
    },

    async createCabang() {
      const toast = useToast();
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      try {
        await fetch($api.cabang(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(this.form),
          credentials: 'include', // Cookie-based auth
        })
        this.closeModal()
        await this.fetchCabangs()
      } catch (error: any) {
        if (error.response && error.response.status === 422) {
          this.validationErrors = error.response._data.errors
        } else {
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal membuat cabang',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        }
      } finally {
        this.loading = false
      }
    },

    async updateCabang() {
      const toast = useToast();
      this.loading = true
      this.validationErrors = []
      if (!this.form.id) return
      
      const { $api } = useNuxtApp()
      try {
        await fetch($api.cabang() + `/${this.form.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(this.form),
          credentials: 'include', // Cookie-based auth
        })
        this.closeModal()
        await this.fetchCabangs()
        toast.success({
          title: 'Berhasil!',
          message: 'Cabang berhasil diperbarui.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        });
      } catch (error: any) {
        if (error.response && error.response.status === 422) {
          this.validationErrors = error.response._data.errors
        } else {
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal memperbarui cabang',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        }
      } finally {
        this.loading = false
      }
    },

    async deleteCabang(id: number) {
      const toast = useToast();
      this.loading = true
      const { $api } = useNuxtApp()

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
        await fetch($api.cabang() + `/${id}`, {
          method: 'DELETE',
           headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })
        await this.fetchCabangs()
        toast.success({
          title: 'Berhasil!',
          message: 'Cabang berhasil dihapus.',
          color: 'green'
        });
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus cabang',
          color: 'red',
          position: 'topRight',
          layout: 2,
        });
      } finally {
        this.loading = false
      }
    },

    openModal(cabang?: Cabang) {
      this.validationErrors = []
      if (cabang) {
        this.isEditMode = true
        this.form = { 
          id: cabang.id,
          kodeCabang: cabang.kodeCabang,
          nmCabang: cabang.nmCabang,
          alamatCabang: cabang.alamatCabang,
          perusahaanId: cabang.perusahaanId
        }
      } else {
        this.isEditMode = false
        this.form = { ...initialFormState }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = { ...initialFormState }
    },

    setPage(page: number, rows: number) {
      this.params.page = page
      this.params.rows = rows
      this.fetchCabangs()
    },

    setSort(sortField: string, sortOrder: number) {
      this.params.sortField = sortField
      this.params.sortOrder = sortOrder
      this.fetchCabangs()
    },
    
    setFilters(filters: any) {
      this.params.filters = filters;
      this.fetchCabangs();
    }
  },
})
