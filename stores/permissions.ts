import { defineStore } from 'pinia'

export interface Permission {
    id: number
    name: string
    description?: string
    menuGroups?: any[]
    menuDetails?: any[]
}

interface PermissionsState {
    permissions: Permission[]
    loading: boolean
    totalRecords: number
    params: {
        first: number
        rows: number
        sortField: string | null
        sortOrder: string | null
        search: string
        draw: number
    }
    form: {
        id: number | null
        name: string
        menuGroupIds: number[]
        menuDetailIds: number[]
    }
    validationErrors: any[]
}

export const usePermissionsStore = defineStore('permissions', {
    state: (): PermissionsState => ({
        permissions: [],
        loading: false,
        totalRecords: 0,
        params: {
            first: 0,
            rows: 10,
            sortField: 'id',
            sortOrder: 'desc',
            search: '',
            draw: 1,
        },
        form: {
            id: null,
            name: '',
            menuGroupIds: [],
            menuDetailIds: [],
        },
        validationErrors: [],
    }),
    actions: {
        async fetchPermissions() {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const params = new URLSearchParams({
                    draw: this.params.draw.toString(),
                    start: this.params.first.toString(),
                    length: this.params.rows.toString(),
                    search: this.params.search || '',
                    sortField: this.params.sortField || 'id',
                    sortOrder: this.params.sortOrder || 'desc',
                })

                const response = await fetch(`${$api.permissions()}?${params.toString()}`, {
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'include', // Cookie-based auth
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} saat mengambil permissions`)
                }

                const data = await response.json()
                this.permissions = data?.data ?? []
                this.totalRecords = parseInt(data.recordsFiltered ?? data.recordsTotal ?? 0, 10)
                
                if (data.draw) {
                    this.params.draw = parseInt(data.draw)
                }
            } catch (error) {
                console.error('Failed to fetch permissions:', error)
                this.permissions = []
                this.totalRecords = 0
            } finally {
                this.loading = false
            }
        },
        
        async savePermission(payload: { name: string; menuGroupIds: number[]; menuDetailIds: number[]; id?: number }) {
            this.loading = true
            this.validationErrors = []
            try {
                const { $api } = useNuxtApp()
                let url: string
                let method: string

                if (payload.id) {
                    url = $api.permissionUpdate(payload.id)
                    method = 'PUT'
                } else {
                    url = $api.permissionStore()
                    method = 'POST'
                }

                const response = await fetch(url, {
                    method,
                    body: JSON.stringify({
                        name: payload.name,
                        menuGroupIds: payload.menuGroupIds,
                        menuDetailIds: payload.menuDetailIds,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Cookie-based auth
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    if (errorData.errors) {
                        this.validationErrors = Object.values(errorData.errors).flat()
                    }
                    throw new Error(errorData.message || 'Gagal menyimpan permission')
                }

                await this.fetchPermissions()
                return { success: true }
            } catch (error: any) {
                throw error
            } finally {
                this.loading = false
            }
        },

        async deletePermission(permissionId: number) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const url = $api.permissionDelete(permissionId)

                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Cookie-based auth
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Gagal menghapus permission')
                }

                await this.fetchPermissions()
                return { success: true }
            } catch (error: any) {
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteBatchPermissions(permissionIds: number[]) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const deletePromises = permissionIds.map(async (permissionId) => {
                    const url = $api.permissionDelete(permissionId)
                    const response = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include', // Cookie-based auth
                    })
                    
                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(`Gagal menghapus permission ID ${permissionId}: ${errorData.message || 'Unknown error'}`)
                    }
                    
                    return { id: permissionId, success: true }
                })

                const results = await Promise.allSettled(deletePromises)
                const successful = results.filter(result => result.status === 'fulfilled').length
                const failed = results.filter(result => result.status === 'rejected').length

                await this.fetchPermissions()
                return { successful, failed }
            } catch (error: any) {
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateBatchPermissions(permissionIds: number[], payload: { menuGroupIds: number[]; menuDetailIds: number[] }) {
            this.loading = true
            this.validationErrors = []
            try {
                const { $api } = useNuxtApp()
                const updatePromises = permissionIds.map(async (permissionId) => {
                    const response = await fetch($api.permissionUpdate(permissionId), {
                        method: 'PUT',
                        body: JSON.stringify({
                            name: this.permissions.find(p => p.id === permissionId)?.name,
                            menuGroupIds: payload.menuGroupIds,
                            menuDetailIds: payload.menuDetailIds,
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include', // Cookie-based auth
                    })
                    
                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(`Gagal mengupdate permission ID ${permissionId}: ${errorData.message || 'Unknown error'}`)
                    }
                    
                    return { id: permissionId, success: true }
                })

                const results = await Promise.allSettled(updatePromises)
                const successful = results.filter(result => result.status === 'fulfilled').length
                const failed = results.filter(result => result.status === 'rejected').length

                await this.fetchPermissions()
                return { successful, failed }
            } catch (error: any) {
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchStats() {
            try {
                const { $api } = useNuxtApp()
                const response = await fetch($api.getTotalPermission(), {
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'include', // Cookie-based auth
                })

                if (response.ok) {
                    const result = await response.json()
                    return result
                }
                return { total: undefined, roles: [] }
            } catch (error) {
                console.error('Gagal mengambil data statistik:', error)
                return { total: undefined, roles: [] }
            }
        },

        resetForm() {
            this.form = {
                id: null,
                name: '',
                menuGroupIds: [],
                menuDetailIds: [],
            }
            this.validationErrors = []
        },

        setParams(params: Partial<PermissionsState['params']>) {
            this.params = { ...this.params, ...params }
        },
    },
})