import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface Jabatan {
  id: number
  nmJabatan: string
  level: number
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number | undefined
  direktur_utama: number | undefined
  direktur_keuangan: number | undefined
  direktur_operasional: number | undefined
  general_manager: number | undefined
}

interface JabatanState {
  jabatans: Jabatan[]
  loading: boolean
  error: any
  stats: Stats
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
  }
  form: Partial<Jabatan> & { nmJabatan?: string; level?: number }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useJabatanStore = defineStore('jabatan', {
  state: (): JabatanState => ({
    jabatans: [],
    loading: false,
    error: null,
    stats: {
        total: undefined,
        direktur_utama: undefined,
        direktur_keuangan: undefined,
        direktur_operasional: undefined,
        general_manager: undefined
    },
    totalRecords: 0,
    params: {
        first: 0,
        rows: 10,
        sortField: 'id',
        sortOrder: 1,
        search: '',
    },
    form: {
        nmJabatan: '',
        level: 5,
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchJabatans() {
      this.loading = true
      const { $api } = useNuxtApp()
      
      try {
        const params = new URLSearchParams({
            page     : ((this.params.first / this.params.rows) + 1).toString(),
            rows     : this.params.rows.toString(),
            sortField: this.params.sortField || '',
            sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
            search   : this.params.search || '',
        });

        const response = await fetch(`${$api.jabatan()}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        })
        const result = await response.json()
        this.jabatans = (result.data || []).map((item: any) => ({
          id       : item.idJabatan,
          nmJabatan: item.nmJabatan,
          level    : item.level ?? 5,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))
        this.totalRecords = result.meta.total
      } catch (error) {
        console.error('Gagal mengambil data jabatan:', error)
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: 'Gagal mengambil data jabatan',
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
            direktur_utama: undefined,
            direktur_keuangan: undefined,
            direktur_operasional: undefined,
            general_manager: undefined,
        };
        try {
            const response = await fetch($api.countPegawaiByJabatan(), {
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Cookie-based auth
            });

            if (response.ok) {
                const result = await response.json();
                this.stats = result
            } else {
                this.stats = defaultStats;
            }
        } catch (error) {
            console.error('Gagal mengambil data statistik (exception):', error);
            this.stats = defaultStats;
        }
    },
    async saveJabatan() {
        this.loading = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();

        try {
            let url = $api.jabatan();
            let method = 'POST';

            if (this.isEditMode && this.form.id) {
                url = `${$api.jabatan()}/${this.form.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nm_jabatan: this.form.nmJabatan, level: this.form.level ?? 5 }),
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
                const err = await normalizeFailedResponse(
                    response,
                    this.isEditMode ? 'Jabatan gagal diperbarui.' : 'Jabatan gagal dibuat.'
                )
                this.validationErrors = err.fieldErrorList
                toastNormalizedError(err)
                return false
           }

            this.closeModal();
            await this.fetchJabatans();
            await this.fetchStats();
            const toast = useToast()            
            toast.success({
              title: 'Success',
              message: `Jabatan berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
              color: 'green',
              position: 'bottomRight',
            });

        } catch (error: any) {
            const err = normalizeApiError(error, 'Jabatan gagal disimpan.')
            toastNormalizedError(err)
            return false
        } finally {
            this.loading = false;
        }
    },
    async deleteJabatan(id: number) {
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
          const response = await fetch(`${$api.jabatan()}/${id}`, {
              method: 'DELETE',
              headers: {
                  'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Jabatan gagal dihapus.')
              toastNormalizedError(err)
              return false
          }

          await this.fetchJabatans();
          await this.fetchStats();
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Jabatan berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
      } catch (error: any) {
          const err = normalizeApiError(error, 'Jabatan gagal dihapus.')
          toastNormalizedError(err)
      } finally {
          this.loading = false;
      }
    },
    openModal(jabatan: Jabatan | null = null) {
        this.isEditMode = !!jabatan;
        this.validationErrors = [];
        if (jabatan) {
            this.form = { id: jabatan.id, nmJabatan: jabatan.nmJabatan, level: jabatan.level ?? 5 };
        } else {
            this.form = {
                nmJabatan: '',
                level: 5,
            };
        }
        this.showModal = true;
    },
    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = { nmJabatan: '', level: 5 };
        this.validationErrors = [];
    },
    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchJabatans();
    },
    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchJabatans();
    },
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchJabatans();
    },
  }
})
