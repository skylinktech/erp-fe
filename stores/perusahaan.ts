import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import { useImageUrl } from '~/composables/useImageUrl'

export interface Perusahaan {
  id: number
  kodePerusahaan: string
  nmPerusahaan: string
  npwpPerusahaan: string
  alamatPerusahaan: string
  tlpPerusahaan: string
  emailPerusahaan: string
  logoPerusahaan: string
  namaBankPerusahaan?: string | null
  nomorRekeningPerusahaan?: string | null
  cabangCount?: number
  createdAt: string
  updatedAt: string
}

interface PerusahaanState {
  perusahaans: Perusahaan[]
  loading: boolean
  loadingStats: boolean
  error: any
  totalRecords: number
  statistics: {
    total: number
    withCabang: number
    withBank: number
    cabangCount: number
  }
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
  }
  form: any
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  selectedPerusahaan: Perusahaan | null
}

export const usePerusahaanStore = defineStore('perusahaan', {
  state: (): PerusahaanState => ({
    perusahaans: [],
    loading: true,
    loadingStats: false,
    error: null,
    totalRecords: 0,
    statistics: {
      total: 0,
      withCabang: 0,
      withBank: 0,
      cabangCount: 0,
    },
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
    selectedPerusahaan: null,
  }),
  actions: {
    async fetchPerusahaans() {
      const toast = useToast();
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

        const response = await fetch(`${$api.perusahaan()}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        })
        
        if (!response.ok) throw new Error('Gagal mengambil data perusahaan')
        
        const result = await response.json()
        this.perusahaans = (result.data || []).map((row: any) => ({
          ...row,
          cabangCount: Number(
            row.cabangCount ?? row.$extras?.cabang_count ?? row.meta?.cabang_count ?? 0
          ),
        }))
        this.totalRecords = result.meta.total
      } catch (error: any) {
        this.error = error.message;
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data perusahaan: ${error.message}`,
          color: 'red'
        });
      } finally {
        this.loading = false
      }
    },
    async savePerusahaan() {
        this.loading = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();

        try {
            const formData = new FormData();
            Object.keys(this.form).forEach(key => {
                if (key === 'logoPerusahaan' && this.form[key] instanceof File) {
                    formData.append(key, this.form[key]);
                } else if (this.form[key] !== null && this.form[key] !== undefined) {
                    formData.append(key, this.form[key]);
                }
            });

            let url = $api.perusahaan();
            let method = 'POST';

            if (this.isEditMode && this.form.id) {
                url = `${$api.perusahaan()}/${this.form.id}`;
                formData.append('_method', 'PUT');
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
                const err = await normalizeFailedResponse(
                    response,
                    this.isEditMode ? 'Perusahaan gagal diperbarui.' : 'Perusahaan gagal dibuat.'
                )
                this.validationErrors = err.fieldErrorList
                toastNormalizedError(err)
                return false
           }

            this.closeModal();
            await Promise.all([this.fetchPerusahaans(), this.fetchStatistics()]);
            const toast = useToast()
            toast.success({
              title: 'Success',
              message: `Perusahaan berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
              color: 'green',
              position: 'bottomRight',
            });

        } catch (error: any) {
            const err = normalizeApiError(error, 'Perusahaan gagal disimpan.')
            toastNormalizedError(err)
            return false
        } finally {
            this.loading = false;
        }
    },
    async deletePerusahaan(id: number) {
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
          const response = await fetch(`${$api.perusahaan()}/${id}`, {
              method: 'DELETE',
              headers: {
                  'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Perusahaan gagal dihapus.')
              toastNormalizedError(err)
              return false
          }

          await Promise.all([this.fetchPerusahaans(), this.fetchStatistics()]);
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: 'Perusahaan berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
      } catch (error: any) {
          const err = normalizeApiError(error, 'Perusahaan gagal dihapus.')
          toastNormalizedError(err)
      } finally {
          this.loading = false;
      }
    },
    openModal(perusahaan: Perusahaan | null = null) {
        this.isEditMode = !!perusahaan;
        this.validationErrors = [];
        if (perusahaan) {
            this.form = { ...perusahaan };
            
            // Set logo preview jika ada
            if (perusahaan.logoPerusahaan) {
                const { getCompanyLogo } = useImageUrl();
                this.form.logoPreview = getCompanyLogo(perusahaan.logoPerusahaan);
            } else {
                this.form.logoPreview = '';
            }
            this.form.logoPerusahaan = null; // Reset file input
        } else {
            this.form = {
                kodePerusahaan: '',
                nmPerusahaan: '',
                npwpPerusahaan: '',
                alamatPerusahaan: '',
                tlpPerusahaan: '',
                emailPerusahaan: '',
                namaBankPerusahaan: '',
                nomorRekeningPerusahaan: '',
                logoPerusahaan: null,
                logoPreview: '',
            };
        }
        this.showModal = true;
    },
    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {
            kodePerusahaan: '',
            nmPerusahaan: '',
            npwpPerusahaan: '',
            alamatPerusahaan: '',
            tlpPerusahaan: '',
            emailPerusahaan: '',
            namaBankPerusahaan: '',
            nomorRekeningPerusahaan: '',
            logoPerusahaan: null,
            logoPreview: '',
        };
        this.validationErrors = [];
        this.selectedPerusahaan = null;
    },
    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchPerusahaans();
    },
    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchPerusahaans();
    },
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchPerusahaans();
    },
    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.perusahaanStatistics(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        this.statistics = {
          total: Number(result.total ?? 0),
          withCabang: Number(result.withCabang ?? 0),
          withBank: Number(result.withBank ?? 0),
          cabangCount: Number(result.cabangCount ?? 0),
        }
      } catch (error: any) {
        console.error('Error fetching perusahaan statistics:', error)
      } finally {
        this.loadingStats = false
      }
    },
    handleLogoChange(file: File) {
        if (file) {
            // Validasi file tidak kosong
            if (!file.size || file.size === 0) {
                const toast = useToast()
                toast.error({
                  title: 'Error',
                  message: 'File logo kosong atau tidak valid',
                  color: 'red',
                  position: 'bottomRight',
                });
                return;
            }

            // Validasi file adalah image
            const fileType = file.type || '';
            const fileExtension = file.name?.split('.').pop()?.toLowerCase() || '';

            const allowedMimeTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/x-png',
                'image/gif',
                'image/webp',
                'image/svg+xml'
            ];

            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

            const isValidMimeType = allowedMimeTypes.includes(fileType);
            const isValidExtension = allowedExtensions.includes(fileExtension);

            if (!isValidMimeType && !isValidExtension) {
                const toast = useToast()
                toast.error({
                  title: 'Error',
                  message: `File harus berupa gambar (JPEG, PNG, GIF, WebP). Detected: MIME=${fileType}, Ext=${fileExtension}`,
                  color: 'red',
                  position: 'bottomRight',
                });
                return;
            }

            // Validasi file size
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                const toast = useToast()
                toast.error({
                  title: 'Error',
                  message: 'Ukuran file terlalu besar (maksimal 5MB)',
                  color: 'red',
                  position: 'bottomRight',
                });
                return;
            }

            this.form.logoPerusahaan = file;
            this.form.logoPreview = URL.createObjectURL(file);
        }
    },

    openImageInNewTab(imagePath: string) {
      if (imagePath) {
        const { getCompanyLogo } = useImageUrl();
        const fullImageUrl = getCompanyLogo(imagePath);
        window.open(fullImageUrl, '_blank');
      }
    }
  },
})
