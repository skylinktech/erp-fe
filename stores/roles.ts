import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import type { Permission } from './permissions'

export interface Role {
  id: number
  name: string
  permissions?: Permission[] | number[]
}

interface RolesState {
    roles: Role[]
    permissions: Permission[]
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
    form: {
        id?: number;
        name: string;
        permissionIds: number[];
    }
    isEditMode: boolean
    showModal: boolean
    validationErrors: any[]
}

export const useRolesStore = defineStore('roles', {
    state: (): RolesState => ({
        roles: [],
        permissions: [],
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
        form: {
            name: '',
            permissionIds: [],
        },
        isEditMode: false,
        showModal: false,
        validationErrors: [],
    }),
    actions: {
        async fetchRoles(suppressError = false) {
            this.loading = true
            this.error = null
            const { $api } = useNuxtApp()
            const toast = useToast();
            try {
                const queryParams = new URLSearchParams({
                    draw: '1',
                    start: this.params.first.toString(),
                    length: this.params.rows.toString(),
                    'search[value]': this.params.search || '',
                });
                
                const response = await fetch(`${$api.roles()}?${queryParams.toString()}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'include', // Cookie-based auth
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil data roles');
                }

                const result = await response.json();
                this.roles = result.data || [];
                this.totalRecords = Number(result.recordsFiltered) || 0;

            } catch (e: any) {
                this.error = e.message;
                
                // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
                if (!suppressError) {
                    toast.error({
                        title: 'Error',
                        message: `Tidak dapat memuat data roles: ${e.message}`,
                        color: 'red',
                        position: 'bottomRight',
                        layout: 2,
                        icon: 'error',
                    });
                }
            } finally {
                this.loading = false;
            }
        },

        async fetchPermissions() {
            const { $api } = useNuxtApp()
            const toast = useToast();
            try {
                const res = await fetch($api.getPermissions(), {
                    headers: { 
                        'Accept': 'application/json'
                    },
                    credentials: 'include', // Cookie-based auth
                });

                if (!res.ok) {
                    throw new Error(`HTTP Error fetching all permissions: ${res.status}`);
                }
                const apiResponse = await res.json();
                this.permissions = apiResponse.data || apiResponse || [];
            } catch (error: any) {
                this.permissions = [];
                toast.error({
                    title: 'Error',
                    message: `Gagal memuat permissions: ${error.message}`,
                    color: 'red',
                    position: 'bottomRight',
                    layout: 2,
                    icon: 'error',
                });
            }
        },

        async saveRole() {
            this.loading = true;
            this.validationErrors = [];
            const { $api } = useNuxtApp();
            const toast = useToast();

            try {
                let url = $api.roleStore();
                let method = 'POST';

                if (this.isEditMode && this.form.id) {
                    url = $api.roleUpdate(this.form.id);
                    method = 'PUT';
                }
                
                const payload = {
                    name: this.form.name,
                    permissionIds: this.form.permissionIds.filter(id => typeof id === 'number' && id > 0),
                };

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    credentials: 'include', // Cookie-based auth
                });

                if (!response.ok) {
                    const err = await normalizeFailedResponse(
                        response,
                        this.isEditMode ? 'Role gagal diperbarui.' : 'Role gagal dibuat.'
                    )
                    this.validationErrors = err.fieldErrorList
                    toastNormalizedError(err)
                    return false
                }
                
                this.closeModal();
                await this.fetchRoles();
                
                toast.success({
                    title: 'Success',
                    message: `Role berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
                    color: 'green',
                    position: 'bottomRight',
                    layout: 2,
                    icon: 'success',
                });

            } catch (error: any) {
                const err = normalizeApiError(error, 'Role gagal disimpan.')
                toastNormalizedError(err)
                return false
            } finally {
                this.loading = false;
            }
        },

        async deleteRole(id: number) {
            const { $api } = useNuxtApp();
            const toast = useToast();
            const result = await Swal.fire({
                title: 'Apakah Anda yakin?',
                text: "Role yang dihapus tidak dapat dikembalikan!",
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
                const response = await fetch($api.roleDelete(id), {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'include', // Cookie-based auth
                });

                if (!response.ok) {
                    const err = await normalizeFailedResponse(response, 'Role gagal dihapus.')
                    toastNormalizedError(err)
                    return false
                }

                await this.fetchRoles();
                toast.success({
                    title: 'Success',
                    message: 'Role berhasil dihapus.',
                    color: 'green',
                    position: 'bottomRight',
                    layout: 2,
                    icon: 'success',
                });
            } catch (error: any) {
                const err = normalizeApiError(error, 'Role gagal dihapus.')
                toastNormalizedError(err)
            } finally {
                this.loading = false;
            }
        },

        async openModal(role: Role | null = null) {
            this.isEditMode = !!role;
            this.validationErrors = [];

            if (role) {
                const { $api } = useNuxtApp();
                const toast = useToast();

                try {
                    const response = await fetch($api.roleShow(role.id), {
                        headers: { 
                            'Accept': 'application/json'
                        },
                        credentials: 'include', // Cookie-based auth
                    });
                    if (!response.ok) throw new Error('Gagal memuat detail role.');
                    const roleData = await response.json();
                    
                    this.form = {
                        id: roleData.id,
                        name: roleData.name || '',
                        permissionIds: Array.isArray(roleData.permissions) ? roleData.permissions : [],
                    };

                } catch (error: any) {
                    toast.error({
                        title: 'Error',
                        message: error.message,
                        color: 'red',
                        position: 'bottomRight',
                        layout: 2,
                        icon: 'error',
                    });
                    return; // jangan buka modal jika gagal fetch
                }
            } else {
                this.form = {
                    id: undefined,
                    name: '',
                    permissionIds: [],
                };
            }
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.isEditMode = false;
            this.form = { id: undefined, name: '', permissionIds: [] };
            this.validationErrors = [];
        },

        setPagination(event: any) {
            this.params.first = event.first;
            this.params.rows = event.rows;
            this.fetchRoles();
        },
    
        setSort(event: any) {
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.fetchRoles();
        },
            
        setSearch(value: string) {
            this.params.search = value;
            this.params.first = 0;
            this.fetchRoles();
        },
    },
})