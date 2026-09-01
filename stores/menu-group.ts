import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import { useUserStore } from './user'
import type { MenuDetail } from './menu-detail'
import { coalesceStockMenuGroups } from '~/utils/inventory/stockWorkspace'

export interface MenuGroup {
  id: number
  name: string
  icon: string
  order: number
  jenisMenu: number
  menuDetails?: MenuDetail[]
}

interface MenuGroupState {
  menuGroups: MenuGroup[]
  sidebarMenuGroups: MenuGroup[]
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
  form: Partial<MenuGroup>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useMenuGroupStore = defineStore('menu-group', {
    state: (): MenuGroupState => ({
        menuGroups: [],
        sidebarMenuGroups: [],
        loading: true,
        error: null,
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
  getters: {
    // Menu groups sudah difilter di backend, jadi kita hanya perlu mengembalikan data yang sudah ada
    filteredMenuGroups: (state) => {
      // Pastikan sidebarMenuGroups ada dan merupakan array
      if (!state.sidebarMenuGroups || !Array.isArray(state.sidebarMenuGroups)) {
        return []
      }
      
      // Backend sudah memfilter berdasarkan permission; coalesce stock children into one Stock item
      return coalesceStockMenuGroups(state.sidebarMenuGroups)
    }
  },
  actions: {
    async fetchMenuGroups() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
            page     : ((this.params.first / this.params.rows) + 1).toString(),
            rows     : this.params.rows.toString(),
            sortField: this.params.sortField || 'id',
            sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
            search   : this.params.search || '',
            all      : 'true',
        });

        const response = await fetch(`${$api.menuGroups()}?${params.toString()}`, {
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data menu group');
        }

        const result = await response.json();
        this.menuGroups = result.data || [];
        this.totalRecords = result.meta?.total || 0;

      } catch (e: any) {
        this.error = e.message
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data menu group: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false
      }
    },

    async prefetchMenuGroups() {
        if (this.menuGroups.length > 0 && this.params.rows === 999) { // Already fetched all
            return;
        }
        if(this.loading) return;
        
        // This store has two fetch actions, we should prefetch the one for the main page, not fetchAll
        await this.fetchMenuGroups();
    },

    async fetchAllMenuGroups() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
            page     : '1',
            rows     : '999', // Ambil semua data
        });

        const response = await fetch(`${$api.menuGroupsAll()}?${params.toString()}`, {
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil semua data menu group');
        }

        const result = await response.json();
        
        // Handle pagination response format
        const menuGroups = result.data || result || [];
        this.sidebarMenuGroups = Array.isArray(menuGroups) ? menuGroups : [];
      } catch (e: any) {
        this.error = e.message
        console.error(`Tidak dapat memuat data menu group untuk sidebar: ${e.message}`, e);
      } finally {
        this.loading = false
      }
    },

    async saveMenuGroup() {
      this.loading = true;
      this.validationErrors = [];
      const { $api } = useNuxtApp();

      try {
        let url = $api.menuGroups();
        let method = 'POST';

        const body = JSON.stringify(this.form);

        if (this.isEditMode && this.form.id) {
          url = `${$api.menuGroups()}/${this.form.id}`;
          method = 'PUT';
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: body,
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
            const err = await normalizeFailedResponse(
                response,
                this.isEditMode ? 'Menu Group gagal diperbarui.' : 'Menu Group gagal dibuat.'
            )
            this.validationErrors = err.fieldErrorList
            toastNormalizedError(err)
            return false
        }
        
        this.closeModal();
        await this.fetchMenuGroups();
        const toast = useToast()        
        toast.success({
          title: 'Success',
          message: `Menu group berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        });

      } catch (error: any) {
        const err = normalizeApiError(error, 'Menu Group gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false;
      }
    },

    async deleteMenuGroup(id: number) {
      this.loading = true;
      const { $api } = useNuxtApp();

      const result = await Swal.fire({
          title: 'Apakah Anda yakin?',
          text: "Data menu group yang dihapus tidak dapat dikembalikan!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#008fec',
          cancelButtonColor: '#f13636',
          confirmButtonText: 'Ya, hapus!',
          cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) {
          this.loading = false;
          return;
      }

      try {
          const response = await fetch(`${$api.menuGroups()}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Cookie-based auth
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Menu Group gagal dihapus.')
              toastNormalizedError(err)
              return false
          }

          await this.fetchMenuGroups();
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Menu group berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
      } catch (error: any) {
          const err = normalizeApiError(error, 'Menu Group gagal dihapus.')
          toastNormalizedError(err)
      } finally {
          this.loading = false;
      }
    },

    openModal(menuGroup: MenuGroup | null = null) {
        this.isEditMode = !!menuGroup;
        this.validationErrors = [];
        if (menuGroup) {
            this.form = { ...menuGroup };
        } else {
            this.form = {
                name: '',
                icon: '',
                order: undefined,
                jenisMenu: undefined,
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
        this.fetchMenuGroups();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchMenuGroups();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchMenuGroups();
    },
  }
})