import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface Did {
  id        : number
  code      : string
  name      : string
  price     : number | null
  category  : 'delivery' | 'installation' | 'survey' | 'dismantle'
  unitId    : number
  unit     ?: { id: number; name: string; symbol?: string } | null
  createdAt?: string
  updatedAt?: string
}

interface DidState {
  dids        : Did[]
  loading     : boolean
  error       : any
  totalRecords: number
  totalDids   : number
  params      : {
    first    : number
    rows     : number
    sortField: string | null
    sortOrder: number | null
    search   : string
  }
  form            : Partial<Did>
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
}

export const useDidStore = defineStore('did', {
  state: (): DidState => ({
    dids: [],
    loading: true,
    error: null,
    totalRecords: 0,
    totalDids: 0,
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
      price: 0,
      category: 'delivery',
      unitId: null as number | null,
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
      } catch (e: any) {
        this.error = e.message
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data DID: ${e.message}`,
            color: 'red',
            position: 'topRight',
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
          price: this.form.price != null ? Number(this.form.price) || 0 : null,
          category: this.form.category || 'delivery',
          unitId: this.form.unitId,
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

        let result
        try {
          result = await response.json()
        } catch {
          toast.error({
            title: 'Error',
            message: 'Server response tidak valid',
            color: 'red',
          })
          throw new Error('Server response tidak valid')
        }

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            const errors = result.errors
            if (Array.isArray(errors)) {
              this.validationErrors = errors
            } else if (errors && typeof errors === 'object') {
              this.validationErrors = Object.entries(errors as Record<string, string | string[]>)
                .flatMap(([field, messages]) => {
                  const messageList = Array.isArray(messages) ? messages : [messages]
                  return messageList
                    .filter(Boolean)
                    .map((message) => ({ field, message, rule: 'unique' }))
                })
            } else {
              this.validationErrors = []
            }
            return
          }
          throw new Error(result.message || 'Gagal menyimpan data DID')
        }

        this.closeModal()
        await this.fetchDids()
        await this.fetchTotalDids()
        toast.success({
          title: 'Success',
          message: `DID berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
        })
      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'topRight',
          })
        }
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
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
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
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus DID')
        }

        await this.fetchDids()
        await this.fetchTotalDids()
        toast.success({
          title: 'Success',
          message: 'DID berhasil dihapus.',
          color: 'green',
          position: 'topRight',
        })
      } catch (error: any) {
        console.error('Gagal menghapus DID:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus DID',
          color: 'red',
          position: 'topRight',
        })
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
          price: did.price ?? 0,
          category: did.category ?? 'delivery',
          unitId: did.unitId ?? did.unit?.id ?? null,
        }
      } else {
        this.form = {
          code: '',
          name: '',
          price: 0,
          category: 'delivery',
          unitId: null as number | null,
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        code: '',
        name: '',
        price: 0,
        category: 'delivery',
        unitId: null as number | null,
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

    async fetchTotalDids() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.totalDids(), {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) throw new Error('Gagal memuat total DID')

        const result = await response.json()
        this.totalDids = result.total ?? 0
      } catch (error: any) {
        console.error('Error fetching total DID:', error)
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal memuat total DID',
          color: 'red',
        })
      }
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
  },
})
