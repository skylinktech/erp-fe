import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

export interface DidService {
  id?: number
  servicePlanId: number
  category: 'delivery' | 'installation' | 'survey' | 'dismantle'
  servicePlan?: { id: number; name: string; description?: string } | null
}

export interface Did {
  id        : number
  code      : string
  name      : string
  sla       : string | null
  provinceId: number
  province ?: { id: number; name: string; code?: string } | null
  regencyId : number
  regency  ?: { id: number; name: string; code?: string } | null
  services ?: DidService[]
  createdAt?: string
  updatedAt?: string
}

interface DidState {
  dids        : Did[]
  loading     : boolean
  loadingStats: boolean
  error       : any
  totalRecords: number
  totalDids   : number
  statistics  : {
    total: number
    withServices: number
    provinces: number
    linkedServices: number
  }
  params      : {
    first    : number
    rows     : number
    sortField: string | null
    sortOrder: number | null
    search   : string
  }
  form            : Partial<Did> & { services?: DidService[] }
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
}

export const useDidStore = defineStore('did', {
  state: (): DidState => ({
    dids: [],
    loading: true,
    loadingStats: false,
    error: null,
    totalRecords: 0,
    totalDids: 0,
    statistics: {
      total: 0,
      withServices: 0,
      provinces: 0,
      linkedServices: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'code',
      sortOrder: 1,
      search: '',
    },
    form: {
      code: '',
      name: '',
      sla: '',
      provinceId: null as number | null,
      regencyId: null as number | null,
      services: [] as DidService[],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchDids(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || 'code',
          sortOrder: this.params.sortOrder === -1 ? 'desc' : 'asc',
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.did()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data DID dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data DID')
        }

        const result = await response.json()
        this.dids = result.data ?? []
        this.totalRecords = result.meta?.total ?? 0
        
        // Jika tidak ada search/filter, update totalDids juga
        if (!this.params.search) {
          this.totalDids = this.totalRecords
        }
      } catch (e: any) {
        this.error = e.message
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data DID: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async saveDid() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      try {
        const body = {
          code: this.form.code,
          name: this.form.name,
          sla: this.form.sla || null,
          provinceId: this.form.provinceId,
          regencyId: this.form.regencyId,
          services: this.form.services || [],
        }

        const url = this.isEditMode && this.form.id
          ? `${$api.did()}/${this.form.id}`
          : $api.did()
        const method = this.isEditMode ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'DID gagal diperbarui.' : 'DID gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          toastNormalizedError(err)
          return false
        }

        this.closeModal()
        await Promise.all([this.fetchDids(), this.fetchStatistics()])
        toast.success({
          title: 'Success',
          message: `DID berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'DID gagal disimpan.')
        toastNormalizedError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteDid(id: number) {
      const toast = useToast()
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data DID yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#008fec',
        cancelButtonColor: '#f13636',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (!result.isConfirmed) return

      this.loading = true
      try {
        const response = await fetch(`${$api.did()}/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'DID gagal dihapus.')
          toastNormalizedError(err)
          return false
        }

        await Promise.all([this.fetchDids(), this.fetchStatistics()])
        toast.success({
          title: 'Success',
          message: 'DID berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        const err = normalizeApiError(error, 'DID gagal dihapus.')
        toastNormalizedError(err)
      } finally {
        this.loading = false
      }
    },

    openModal(did: Did | null = null) {
      this.isEditMode = !!did
      this.validationErrors = []
      if (did) {
        this.form = {
          id: did.id,
          code: did.code,
          name: did.name,
          sla: did.sla || '',
          provinceId: did.provinceId ?? did.province?.id ?? null,
          regencyId: did.regencyId ?? did.regency?.id ?? null,
          services: did.services?.map((s) => ({
            id: s.id,
            servicePlanId: s.servicePlanId,
            category: s.category,
          })) || [],
        }
      } else {
        this.form = {
          code: '',
          name: '',
          sla: '',
          provinceId: null as number | null,
          regencyId: null as number | null,
          services: [],
        }
        // Default tampilkan 1 form service
        this.addServiceItem()
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        code: '',
        name: '',
        sla: '',
        provinceId: null as number | null,
        regencyId: null as number | null,
        services: [],
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchDids()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchDids()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchDids()
    },

    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.didStatistics(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        this.statistics = {
          total: Number(result.total ?? 0),
          withServices: Number(result.withServices ?? 0),
          provinces: Number(result.provinces ?? 0),
          linkedServices: Number(result.linkedServices ?? 0),
        }
        this.totalDids = this.statistics.total
      } catch (error: any) {
        console.error('Error fetching DID statistics:', error)
      } finally {
        this.loadingStats = false
      }
    },

    /** @deprecated gunakan fetchStatistics */
    async fetchTotalDids() {
      await this.fetchStatistics()
    },

    async fetchDidsForExport() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          search: this.params.search || '',
        })
        const response = await fetch(`${$api.exportExcelDids()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data DID untuk export',
          }))
          throw new Error(errorData.message || 'Gagal memuat data DID untuk export')
        }

        const result = await response.json()
        return {
          data: result.data ?? [],
          nmPerusahaan: result.nmPerusahaan ?? '',
        }
      } catch (error: any) {
        console.error('Error fetching DID for export:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat data DID untuk export',
          color: 'red',
        })
        throw error
      }
    },

    addServiceItem() {
      if (!this.form.services) {
        this.form.services = []
      }
      this.form.services.push({
        servicePlanId: null as any,
        category: 'delivery',
      } as DidService)
    },

    removeServiceItem(index: number) {
      if (this.form.services && this.form.services.length > index) {
        this.form.services.splice(index, 1)
      }
    },
  },
})
