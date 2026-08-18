import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse } from '~/utils/apiError'
import type { Category } from './kategori'
import type { Customer } from './customer'
import type { Unit } from './unit'
import type { Stock } from './stocks'
import { useImageUrl } from '~/composables/useImageUrl'

export interface Product {
  id: number
  sku: string
  name: string
  unitId: number
  isDevice: boolean
  isKit: boolean
  isInternal?: boolean | null
  billingType: 'one_time' | 'recurring'
  condition?: 'baru' | 'bekas' | 'rusak'
  categoryId: number
  productType?: string | null
  image: string | File
  createdBy?: number | null
  createdAt: string
  updatedAt: string
  category?: Category
  unit?: Unit
  customer?: Customer
  stocks?: Stock[]
  imagePreview?: string
  createdByUser?: { id: number; fullName: string; email: string }
  productKits?: ProductKit[]
}

export interface ProductKit {
  id?: number
  name: string
  serialNumber: string
  type: 'router' | 'adaptor' | 'cable'
}

export interface ProductStatistics {
  total: number
  internal: number
  external: number
  both: number
  device: number
  kit: number
}

interface ProductState {
  products: Product[]
  allProducts: Product[]
  loading: boolean
  error: any
  totalRecords: number
  totalProducts: number
  statistics: ProductStatistics
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    warehouseId?: number | null
    customerId?: number | null
    categoryId?: number | null
    isInternal?: 'true' | 'false' | 'null' | null
    isDevice?: 'true' | 'false' | null
    isKit?: 'true' | 'false' | null
    billingType?: 'one_time' | 'recurring' | null
    condition?: 'baru' | 'bekas' | 'rusak' | null
  }
  form: Partial<Product>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    allProducts: [], // ✅ NEW: Initialize allProducts array
    loading: true,
    error: null,
    totalRecords: 0,
    totalProducts: 0,
    statistics: {
      total: 0,
      internal: 0,
      external: 0,
      both: 0,
      device: 0,
      kit: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: 1,
      search: '',
      warehouseId: null,
      customerId: null,
      categoryId: null,
      isInternal: null,
      isDevice: null,
      isKit: null,
      billingType: null,
      condition: null,
    },
    form: {
      name: '',
      sku: '',
      unitId: undefined,
      isDevice: false,
      isKit: false,
      isInternal: null as boolean | null,
      billingType: 'one_time' as 'one_time' | 'recurring',
      condition: 'baru' as 'baru' | 'bekas' | 'rusak',
      productType: null as string | null,
      image: '',
      categoryId: undefined,
      productKits: [] as ProductKit[],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    normalizeNullableBoolean(value: unknown): boolean | null {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      if (value === true || value === 'true' || value === 1 || value === '1') {
        return true;
      }
      if (value === false || value === 'false' || value === 0 || value === '0') {
        return false;
      }
      return null;
    },

    normalizeId(value: unknown): number | undefined {
      if (value === null || value === undefined || value === '') return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    },

    normalizeProductKits(input: unknown): ProductKit[] {
      if (!Array.isArray(input)) return [];

      return input
        .map((item: any) => {
          const name = String(item?.name ?? '').trim();
          const serialNumber = String(item?.serialNumber ?? item?.serial_number ?? '').trim();

          // Support bentuk type string atau object { label, value }
          const rawType = typeof item?.type === 'object'
            ? String(item?.type?.value ?? item?.type?.label ?? '')
            : String(item?.type ?? '');

          const normalizedType = rawType.trim().toLowerCase();
          const type = normalizedType === 'adapter' ? 'adaptor' : normalizedType;

          // Buang row repeater kosong total
          if (!name && !serialNumber && !type) {
            return null;
          }

          return {
            name,
            serialNumber,
            type: (['router', 'adaptor', 'cable'].includes(type) ? type : 'router') as ProductKit['type'],
          };
        })
        .filter((item): item is ProductKit => item !== null);
    },

    validateProductKitsBeforeSubmit(productKits: ProductKit[]): string | null {
      for (let i = 0; i < productKits.length; i += 1) {
        const row = productKits[i];
        if (!row.name || !String(row.name).trim()) {
          return `Nama kit pada baris ${i + 1} wajib diisi`;
        }
      }
      return null;
    },

    appendProductFilters(params: URLSearchParams) {
      const {
        categoryId,
        isInternal,
        isDevice,
        isKit,
        billingType,
        condition,
      } = this.params;

      if (categoryId) {
        params.append('categoryId', String(categoryId));
      }
      if (isInternal) {
        params.append('isInternal', isInternal);
      }
      if (isDevice) {
        params.append('isDevice', isDevice);
      }
      if (isKit) {
        params.append('isKit', isKit);
      }
      if (billingType) {
        params.append('billingType', billingType);
      }
      if (condition) {
        params.append('condition', condition);
      }
    },

    async fetchProducts(suppressError = false) {
      const toast     = useToast();
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
            page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows: Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || 'id',
            sortOrder: this.params.sortOrder === -1 ? 'desc' : 'asc',
            search: this.params.search || '',
        });


        if (this.params.warehouseId) {
          params.append('warehouseId', this.params.warehouseId.toString());
          params.append('includeStocks', 'true');
        } else {
          params.append('includeStocks', 'true');
        }

        this.appendProductFilters(params);

        const response = await fetch(`${$api.product()}?${params.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data produk dengan status: ' + response.status }));
            throw new Error(errorData.message || 'Gagal memuat data produk');
        }
        
                 const result = await response.json()
         
         
         
         this.products = result.data
         this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data produk: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
          });
        }
      } finally {
        this.loading = false
      }
    },

    // ✅ NEW: Method untuk mengambil semua produk tanpa pagination (untuk select dropdown)
    // Method ini digunakan untuk mengisi data produk di select dropdown seperti di halaman customer
    // Menggunakan rows=10000 untuk mengambil semua produk tanpa pagination
    async fetchAllProducts() {
      const toast = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const params = new URLSearchParams({
          rows: '10000', // Ambil semua produk dengan limit yang sangat besar
          sortField: 'name', // Urutkan berdasarkan nama untuk kemudahan pencarian
          sortOrder: 'asc',
          search: '', // Tanpa filter search
          includeStocks: 'true', // Include stocks untuk validasi stock
        });

        const response = await fetch(`${$api.product()}?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          throw new Error('Gagal memuat semua data produk');
        }

        const result = await response.json();
        this.allProducts = result.data || [];
        return this.allProducts;
        
      } catch (e: any) {
        this.error = e.message;
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data produk: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
        this.allProducts = [];
        return [];
      } finally {
        this.loading = false;
      }
    },

    // ✅ NEW: Method untuk mengambil produk berdasarkan warehouse tertentu
    async fetchProductsByWarehouse(warehouseId: number) {
      if (!warehouseId) return;
      
      const toast = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      
      try {
        const params = new URLSearchParams({
          warehouseId: warehouseId.toString(),
          includeStocks: 'true',
          rows: '1000', // Ambil semua produk untuk warehouse ini
        });

        const response = await fetch(`${$api.product()}?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          throw new Error('Gagal memuat data produk untuk gudang ini');
        }

        const result = await response.json();
        this.products = result.data || [];
        this.totalRecords = result.data?.length || 0;
        
      } catch (e: any) {
        this.error = e.message;
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data produk untuk gudang: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false;
      }
    },
    
    async saveProduct() {
        const toast     = useToast();
      this.loading = true;
      this.validationErrors = [];
      const { $api } = useNuxtApp();

      try {
          const formData = new FormData();
          const allowedKeys = [
            'name',
            'sku',
            'unitId',
            'categoryId',
            'isDevice',
            'isKit',
            'isInternal',
            'billingType',
            'condition',
            'productType',
            'productKits',
          ] as const;

          allowedKeys.forEach((key) => {
            const value = this.form[key as keyof typeof this.form];
            if (key === 'isDevice' || key === 'isKit') {
              formData.append(key, value ? 'true' : 'false');
            } else if (key === 'isInternal') {
              if (value === null || value === undefined) {
                formData.append(key, '');
              } else {
                formData.append(key, value ? 'true' : 'false');
              }
            } else if (key === 'productKits') {
              const productKits = this.normalizeProductKits(value);
              if (this.form.isKit) {
                const kitValidationError = this.validateProductKitsBeforeSubmit(productKits);
                if (kitValidationError) {
                  throw new Error(kitValidationError);
                }
              }
              formData.append(key, JSON.stringify(productKits));
            } else if (value !== null && value !== undefined && value !== '') {
              formData.append(key, String(value));
            }
          });

          if (this.form.image instanceof File) {
            formData.append('image', this.form.image);
          }
          
          
          
          let url = $api.product();
          let method = 'POST';

          if (this.isEditMode && this.form.id) {
              url = `${$api.product()}/${this.form.id}`;
              formData.append('_method', 'PUT');
          }

          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
              },
              body: formData,
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(
                  response,
                  this.isEditMode ? 'Produk gagal diperbarui.' : 'Produk gagal dibuat.'
              )
              this.validationErrors = err.fieldErrorList
              toast.error({
                title: err.type === 'validation' ? 'Validasi' : 'Error',
                message: err.message,
                color: 'red',
                position: 'bottomRight',
                layout: 2,
              })
              return false
          }
          
          this.closeModal();
          await this.fetchProducts();
          await this.fetchStatistics();
          await this.refreshAllProducts();
          toast.success({
            title: 'Success',
            message: `Produk berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
            color: 'green',
            position: 'bottomRight',
          });

      } catch (error: any) {
          // Jangan tampilkan Swal jika ada validation errors (sudah ditampilkan di modal)
          if (this.validationErrors.length === 0) {
              toast.error({
                title: 'Error',
                message: error.message || 'Operasi gagal',
                color: 'red',
                position: 'bottomRight',
              });
          }
      } finally {
          this.loading = false;
      }
    },

    async deleteProduct(id: number) {
      const toast     = useToast();
      const { $api } = useNuxtApp();

      const result = await Swal.fire({
          title: 'Apakah Anda yakin?',
          text: "Data produk yang dihapus tidak dapat dikembalikan!",
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
      
      this.loading = true;
      try {
          const response = await fetch($api.product() + `/${id}`, {
              method: 'DELETE',
              headers: {
                  'Accept': 'application/json',
              },
              credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Produk gagal dihapus.')
              throw new Error(err.message)
          }

          await this.fetchProducts();
          await this.fetchStatistics();
          await this.refreshAllProducts();
          toast.success({
            title: 'Success',
            message: 'Produk berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
      } catch (error: any) {
          console.error('Gagal menghapus produk:', error);
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus produk',
            color: 'red',
            position: 'bottomRight',
          });
      } finally {
          this.loading = false;
      }
    },

    async openModal(product: Product | null = null) {
        this.isEditMode = !!product;
        this.validationErrors = [];
        if (product) {
            const detail = await this.fetchProductDetail(product.id);
            const source: any = detail || product;
            this.form = { 
              ...source,
              unitId: this.normalizeId(source.unitId ?? source.unit_id ?? source.unit?.id ?? product.unitId),
              categoryId: this.normalizeId(source.categoryId ?? source.category_id ?? source.category?.id ?? product.categoryId),
              productType: source.productType ?? source.product_type ?? product.productType ?? null,
              billingType: source.billingType ?? source.billing_type ?? product.billingType ?? 'one_time',
              isDevice: source.isDevice ?? source.is_device ?? product.isDevice ?? false,
              isKit: source.isKit ?? source.is_kit ?? false,
              isInternal: this.normalizeNullableBoolean(source.isInternal ?? source.is_internal),
              condition: source.condition ?? 'baru',
              productKits: (source.productKits || []).map((kit) => ({
                id: kit.id,
                name: kit.name || '',
                serialNumber: kit.serialNumber || kit.serial_number || '',
                type: ((String(kit.type || 'router').toLowerCase() === 'adapter' ? 'adaptor' : String(kit.type || 'router').toLowerCase()) || 'router') as 'router' | 'adaptor' | 'cable',
              })),
            };
            
            // Set image preview jika ada
            if (source.image && typeof source.image === 'string') {
                const { getProductImage } = useImageUrl();
                this.form.imagePreview = getProductImage(source.image);
            } else {
                this.form.imagePreview = '';
            }
        } else {
            this.form = {
                name: '',
                sku: '',
                unitId: undefined,
                isDevice: false,
                isKit: false,
                isInternal: null,
                billingType: 'one_time',
                condition: 'baru',
                productType: null,
                image: '',
                imagePreview: '',
                categoryId: undefined,
                productKits: [],
            };
        }
        this.showModal = true;
    },

    closeModal() {
        this.showModal = false
        this.isEditMode = false
        this.form = {
            name: '',
            sku: '',
            unitId: undefined,
            isDevice: false,
            isKit: false,
            isInternal: null,
            billingType: 'one_time',
            condition: 'baru',
            productType: null,
            image: '',
            imagePreview: '',
            categoryId: undefined,
            productKits: [],
        }
        this.validationErrors = []
    },

    async fetchProductDetail(id: number) {
      const { $api } = useNuxtApp();
      try {
        const response = await fetch(`${$api.product()}/${id}`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          return null;
        }

        return await response.json();
      } catch (_error: any) {
        return null;
      }
    },

    addProductKit() {
      if (!Array.isArray(this.form.productKits)) {
        this.form.productKits = [];
      }
      this.form.productKits.push({
        name: '',
        serialNumber: '',
        type: 'router',
      });
    },

    removeProductKit(index: number) {
      if (!Array.isArray(this.form.productKits)) {
        return;
      }
      this.form.productKits.splice(index, 1);
    },

    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchProducts();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchProducts();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchProducts();
    },

    setWarehouseFilter(warehouseId: number | null) {
      this.params.warehouseId = warehouseId;
      this.params.first = 0;
      this.fetchProducts();
    },

    handleImageChange(file: File) { 
      const toast     = useToast();
        if (file) {
            // Validasi file tidak kosong
            if (!file.size || file.size === 0) {
                toast.error({
                  title: 'Error',
                  message: 'File gambar kosong atau tidak valid',
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
                toast.error({
                  title: 'Error',
                  message: 'Ukuran file terlalu besar (maksimal 5MB)',
                  color: 'red',
                  position: 'bottomRight',
                });
                return;
            }

            this.form.image = file;
            this.form.imagePreview = URL.createObjectURL(file);
        }
    },

    async fetchStatistics() {
      const { $api } = useNuxtApp();
      try {
        const response = await fetch($api.productStatistics(), {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        });

        const result = await response.json().catch(() => null);

        if (response.ok) {
          const data = result?.data ?? result;
          if (data && typeof data === 'object') {
            this.statistics = {
              total: Number(data.total) || 0,
              internal: Number(data.internal) || 0,
              external: Number(data.external) || 0,
              both: Number(data.both) || 0,
              device: Number(data.device) || 0,
              kit: Number(data.kit) || 0,
            };
            this.totalProducts = this.statistics.total;
            return;
          }
        }

        await this.fetchTotalProducts();
        this.statistics = {
          ...this.statistics,
          total: this.totalProducts,
          both: this.totalProducts,
        };
      } catch (error: any) {
        console.error('Error fetching product statistics:', error);
        await this.fetchTotalProducts();
        this.statistics = {
          ...this.statistics,
          total: this.totalProducts,
          both: this.totalProducts,
        };
      }
    },

    async fetchTotalProducts() {
      const toast     = useToast();
        const { $api } = useNuxtApp()
        try {
            const response = await fetch(`${$api.product()}/totalProducts`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include' // Cookie-based auth
            });

            if (!response.ok) {
                throw new Error('Gagal memuat total produk');
            }
            
            const result = await response.json()
            this.totalProducts = Number(result.total) || 0
        } catch (error: any) {
            console.error('Error fetching total products:', error)
            toast.error({
              title: 'Error',
              message: error.message || 'Gagal memuat data produk untuk export',
              color: 'red',
              position: 'bottomRight',
            });
        }
    },

    async fetchProductsForExport() {
      const toast     = useToast();
        const { $api } = useNuxtApp()
        try {
            const params = new URLSearchParams({
                search: this.params.search || '',
            });

            if (this.params.warehouseId) {
                params.append('warehouseId', this.params.warehouseId.toString());
                params.append('includeStocks', 'true');
            }

            this.appendProductFilters(params);

            const response = await fetch(`${$api.productExportExcel()}?${params.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include' // Cookie-based auth
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data produk untuk export dengan status: ' + response.status }));
                throw new Error(errorData.message || 'Gagal memuat data produk untuk export');
            }
            
            const result = await response.json()
            return {
              data: result.data || [],
              nmPerusahaan: result.nmPerusahaan || ''
            }
        } catch (error: any) {
            console.error('Error fetching products for export:', error)
            toast.error({
              title: 'Error',
              message: error.message || 'Gagal memuat data produk untuk export',
              color: 'red',
              position: 'bottomRight',
            });
            throw error
        }
    },

    openImageInNewTab(imagePath: string) {
      if (imagePath) {
        const { getProductImage } = useImageUrl();
        const fullImageUrl = getProductImage(imagePath);
        window.open(fullImageUrl, '_blank');
      }
    },

    // ✅ NEW: Method untuk refresh allProducts setelah ada perubahan produk
    async refreshAllProducts() {
      await this.fetchAllProducts();
    }
  }
})
