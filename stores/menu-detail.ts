import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import type { MenuGroup } from './menu-group'
import { useMenuGroupStore } from './menu-group'

export interface MenuDetail {
  id: number
  name: string
  route: string | null
  status: number
  order: number
  isReferenceable: boolean
  referenceCode: string | null
  menuGroupId: number
  parentId?: number | null
  menuGroup?: MenuGroup
  parent?: MenuDetail | null
  children?: MenuDetail[]
  depth?: number
  label?: string
}

export interface MenuDetailParentOption {
  id: number
  name: string
  label: string
  route: string | null
  parentId: number | null
  menuGroupId: number
  depth: number
  order: number
}

interface MenuDetailState {
  menuDetails: MenuDetail[]
  menuGroups: MenuGroup[]
  parentOptions: MenuDetailParentOption[]
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
  form: Partial<MenuDetail>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const useMenuDetailStore = defineStore('menu-detail', {
    state: (): MenuDetailState => ({
        menuDetails: [],
        menuGroups: [],
        parentOptions: [],
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
  actions: {
    async fetchMenuDetails() {
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
        });

        const response = await fetch(`${$api.menuDetails()}?${params.toString()}`, {
            headers: {
              'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data menu detail');
        }

        const result = await response.json();
        this.menuDetails = result.data || [];
        this.totalRecords = result.meta?.total || 0;

      } catch (e: any) {
        this.error = e.message
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data menu detail: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false
      }
    },
    
    async fetchMenuGroupsForSelect(search = '') {
        const { $api } = useNuxtApp();
        try {
            const params = new URLSearchParams();
            if (search.trim()) {
                params.set('search', search.trim());
            }
            const query = params.toString();
            const url = query ? `${$api.menuGroupsOptions()}?${query}` : $api.menuGroupsOptions();
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Gagal mengambil data menu groups');
            const result = await response.json();
            this.menuGroups = result.data || [];
        } catch (error) {
            console.error('Error fetching menu groups:', error);
            const toast = useToast()            
            toast.error({
              title: 'Error',
              message: 'Gagal mengambil data Menu Group untuk pilihan.',
              color: 'red',
              position: 'bottomRight',
            });
        }
    },

    async fetchParentOptions(menuGroupId: number | null | undefined, excludeId: number | null = null) {
      this.parentOptions = []
      if (!menuGroupId) return

      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          menu_group_id: String(menuGroupId),
        })
        if (excludeId != null) {
          params.set('exclude_id', String(excludeId))
        }

        const response = await fetch(`${$api.menuDetailParentOptions()}?${params.toString()}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal mengambil opsi parent')
        const result = await response.json()
        this.parentOptions = result.data || []
      } catch (error) {
        console.error('Error fetching parent options:', error)
        this.parentOptions = []
      }
    },

    async saveMenuDetail() {
      const toast = useToast();
      this.loading = true;
      this.validationErrors = [];
      const { $api } = useNuxtApp();

      try {
        let url = $api.menuDetails();
        let method = 'POST';

        const routeValue = (this.form.route ?? '').toString().trim()
        const payload = {
          name: this.form.name,
          route: routeValue.length > 0 ? routeValue : null,
          status: Number(this.form.status ?? 1),
          order: Number(this.form.order ?? 0),
          isReferenceable: this.form.isReferenceable ?? false,
          referenceCode: this.form.referenceCode ?? null,
          menuGroupId: this.form.menuGroupId,
          parentId: this.form.parentId ?? null,
        };

        const body = JSON.stringify(payload);

        if (this.isEditMode && this.form.id) {
          url = `${$api.menuDetails()}/${this.form.id}`;
          method = 'PUT';
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: body,
          credentials: 'include',
        });

        if (!response.ok) {
            const err = await normalizeFailedResponse(
                response,
                this.isEditMode ? 'Menu Detail gagal diperbarui.' : 'Menu Detail gagal dibuat.'
            )
            this.validationErrors = err.fieldErrorList
            toastNormalizedError(err)
            return false
        }
        
        this.closeModal();
        await this.fetchMenuDetails();

        const menuGroupStore = useMenuGroupStore();
        await menuGroupStore.fetchAllMenuGroups();
        
        toast.success({
            title: 'Success',
            icon: 'ri-check-line',
            message: `Menu detail berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
            timeout: 3000,
            position: 'bottomRight',
            layout: 2,
        })

      } catch (error: any) {
        const err = normalizeApiError(error, 'Menu Detail gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false;
      }
    },

    async deleteMenuDetail(id: number) {
      this.loading = true;
      const { $api } = useNuxtApp();
      const toast = useToast();
      const result = await Swal.fire({
          title: 'Apakah Anda yakin?',
          text: "Data menu detail yang dihapus tidak dapat dikembalikan!",
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
          const response = await fetch(`${$api.menuDetails()}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
              const err = await normalizeFailedResponse(response, 'Menu Detail gagal dihapus.')
              toastNormalizedError(err)
              return false
          }

          await this.fetchMenuDetails();
          const menuGroupStore = useMenuGroupStore();
          await menuGroupStore.fetchAllMenuGroups();

          toast.success({
            title: 'Success',
            icon: 'ri-check-line',
            message: 'Menu detail berhasil dihapus.',
            timeout: 3000,
            position: 'bottomRight',
            layout: 2,
          })
      } catch (error: any) {
          const err = normalizeApiError(error, 'Menu Detail gagal dihapus.')
          toastNormalizedError(err)
      } finally {
          this.loading = false;
      }
    },

    async openModal(menuDetail: MenuDetail | null = null) {
      this.isEditMode = !!menuDetail;
      this.validationErrors = [];
      if (menuDetail) {
        this.form = { 
          ...menuDetail,
          isReferenceable: menuDetail.isReferenceable ?? (menuDetail as any).is_referenceable ?? false,
          referenceCode: menuDetail.referenceCode ?? (menuDetail as any).reference_code ?? '',
          parentId: menuDetail.parentId ?? (menuDetail as any).parent_id ?? null,
          route: menuDetail.route ?? '',
        };
      } else {
        this.form = {
          name: '',
          route: '',
          order: undefined,
          status: 1,
          isReferenceable: false,
          referenceCode: '',
          menuGroupId: undefined,
          parentId: null,
        };
      }
      this.showModal = true;
      
      await this.fetchMenuGroupsForSelect();
      await this.fetchParentOptions(
        this.form.menuGroupId,
        this.isEditMode ? this.form.id ?? null : null
      );
    },

    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {};
        this.parentOptions = [];
        this.validationErrors = [];
    },

    setPagination(event: any) {
        this.params.first = event.first;
        this.params.rows = event.rows;
        this.fetchMenuDetails();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchMenuDetails();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchMenuDetails();
    },
  }
})
