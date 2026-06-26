import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Customer {
  id?: number
  name: string
  code: string
  address: string
  email: string
  phone: string
  npwp: string
  ktp: string
  type?: 'prospect' | 'regular' | 'vip'
  logo: string | File
}

interface CustomerState {
  customers: Customer[]
  selectedCustomer: Customer | null
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
  form: Partial<Customer>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useCustomerStore = defineStore('customer', {
    state: (): CustomerState => ({
    customers: [],
    selectedCustomer: null,
    loading: false,
    error: null,
    totalRecords: 0,
    params: {
        first: 0,
        rows: 10,
        sortField: 'id',
        sortOrder: 1,
        search: '',
    },
    form: {
      name: '',
      address: '',
      email: '',
      phone: '',
      npwp: '',
      ktp: '',
      type: '' as '' | 'prospect' | 'regular' | 'vip',
      logo: '',
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchCustomers(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
            page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows: Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
            search: this.params.search || '',
        });

        const response = await fetch(`${$api.customer()}?${params.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pelanggan.' }));
            throw new Error(errorData.message || 'Gagal memuat data pelanggan.');
        }

        const result = await response.json()
        this.customers = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
        if (!suppressError) {
          const toast = useToast()        
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data pelanggan: ${e.message}`,
            color: 'red',
            position: 'topRight',
          });
        }
      } finally {
        this.loading = false
      }
    },
    async prefetchCustomers() {
      if (this.customers.length > 0 || this.loading) {
        return;
      }
      await this.fetchCustomers();
    },
    async saveCustomer() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const formData = new FormData()
        
        // Hanya kirim field yang diperlukan untuk backend (code digenerate otomatis di backend)
        const fieldsToSend = ['name', 'address', 'email', 'phone', 'npwp', 'ktp', 'type'];
        fieldsToSend.forEach(key => {
            const value = this.form[key as keyof typeof this.form];
            if (value !== null && value !== undefined) {
                if (key === 'type') {
                    if (['prospect', 'regular', 'vip'].includes(String(value))) {
                        formData.append(key, String(value));
                    }
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        
        // Handle logo file
        if (this.form.logo instanceof File) {
            formData.append('logo', this.form.logo);
        }

        let method = 'POST';
        let url = $api.customer();
        if (this.isEditMode && this.form.id) {
          url = `${$api.customer()}/${this.form.id}`;
          method = 'PUT';
        }

        const response = await fetch(url, {
          method: method,
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        // Handle response parsing dengan error catching
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
                return; // Stop execution - jangan throw error agar validation error muncul di modal
            }
            throw new Error(result.message || 'Gagal menyimpan data pelanggan');
        }
        
        this.closeModal();
        await this.fetchCustomers();
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: `Customer berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
        });

      } catch (error: any) {
        // Jangan tampilkan Swal jika ada validation errors (sudah ditampilkan di modal)
        if (this.validationErrors.length === 0) {
            const toast = useToast()            
            toast.error({
              title: 'Error',
              message: error.message || 'Operasi gagal',
              color: 'red',
              position: 'topRight',
            });
        }
      } finally {
        this.loading = false
      }
    },
    async deleteCustomer(id: number) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      
      const result = await Swal.fire({
          title: 'Apakah Anda yakin?',
          text: "Data pelanggan yang dihapus tidak dapat dikembalikan!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, hapus!',
          cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) return;

      this.loading = true;
      try {
          const response = await fetch($api.customer() + `/${id}`, {
              method: 'DELETE',
              headers: {
                  'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Gagal menghapus pelanggan');
          }

          await this.fetchCustomers();
          toast.success({
            title: 'Berhasil!',
            message: 'Customer berhasil dihapus.',
            color: 'green'
          });
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus pelanggan',
          color: 'red'
        });
      } finally {
          this.loading = false;
      }
    },

    async getCustomerDetails(customerId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      try {
        const response = await fetch(`${$api.customer()}/${customerId}`, {
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat detail pelanggan.' }));
            throw new Error(errorData.message || 'Gagal memuat detail pelanggan.');
        }

        const result = await response.json();
        this.selectedCustomer = result.data;

      } catch (e: any) {
        this.error = e.message;
        this.selectedCustomer = null;
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat detail pelanggan: ${e.message}`,
          color: 'red',
          position: 'topRight',
        });
      } finally {
        this.loading = false;
      }
    },

    async openModal(customer: Customer | null = null) {
        this.isEditMode = !!customer;
        this.validationErrors = [];
        
        if (customer && customer.id) {
            // Fetch complete data for editing
            this.loading = true;
            const { $api } = useNuxtApp();
            try {
                const response = await fetch(`${$api.customer()}/${customer.id}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include' // Cookie-based auth
                });
                if (!response.ok) throw new Error('Gagal mengambil detail data pelanggan.');
                const result = await response.json();
                const data = result.data;
                this.form = { 
                    ...data,
                    type: data.type || '',
                };
            } catch (error: any) {
                const toast = useToast()                
                toast.error({
                  title: 'Error',
                  message: error.message,
                  color: 'red',
                  position: 'topRight',
                });
            } finally {
                this.loading = false;
            }
        } else {
            // New customer
            this.form = {
                name: '',
                address: '',
                email: '',
                phone: '',
                npwp: '',
                ktp: '',
                type: '',
                logo: '',
            };
        }
        this.showModal = true;
    },

    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {
            name: '',
            address: '',
            email: '',
            phone: '',
            npwp: '',
            ktp: '',
            type: '',
            logo: '',
        };
        this.validationErrors = [];
    },

    setPagination(event: any) {
        this.params.first = Number(event.first) || 0;
        this.params.rows = Number(event.rows) || 10;
        this.fetchCustomers();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchCustomers();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchCustomers();
    },

    handleLogoChange(file: File) {
        if (file) {
            this.form.logo = file;
        }
    },
  }
})
