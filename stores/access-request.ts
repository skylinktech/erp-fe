import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface AccessRequestForm {
  pegawaiId: number | null
  description: string
  permissionIds: number[]
  workflowId: number | null
  accessPeriod: 'permanent' | 'temporary'
  expiryDate: string | null
  priority: 'low' | 'medium' | 'high'
}

interface AccessRequestState {
  accessRequests: any[]
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    status: string
  }
  form: AccessRequestForm
  stats: Record<string, number>
  isEditMode: boolean
  showModal: boolean
  selectedRequest: any
}

export const useAccessRequestStore = defineStore('accessRequest', {
  state: (): AccessRequestState => ({
    accessRequests: [],
    loading: true,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'createdAt',
      sortOrder: -1,
      search: '',
      status: '',
    },
    form: {
      pegawaiId: null,
      description: '',
      permissionIds: [],
      workflowId: null,
      accessPeriod: 'permanent',
      expiryDate: null,
      priority: 'medium',
    },
    stats: {},
    isEditMode: false,
    showModal: false,
    selectedRequest: null,
  }),
  actions: {
    async fetchAccessRequests(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const queryParams = new URLSearchParams({
          page: '1',
          rows: String(this.params.rows),
          search: this.params.search || '',
        })
        if (this.params.sortField) {
          queryParams.set('sortField', this.params.sortField)
          queryParams.set('sortOrder', String(this.params.sortOrder))
        }
        if (this.params.status) queryParams.set('status', this.params.status)

        const response = await fetch(`${$api.accessRequests()}?${queryParams.toString()}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) throw new Error('Gagal mengambil data permintaan akses')
        const result = await response.json()
        this.accessRequests = result.data || []
        this.totalRecords = result.meta?.total || result.total || this.accessRequests.length
      } catch (e: any) {
        this.error = e.message
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
            icon: 'error',
          })
        }
      } finally {
        this.loading = false
      }
    },
    async fetchCountByStatus() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.accessRequestsCountByStatus(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          this.stats = data
        }
      } catch (e) {
        // ignore
      }
    },
    async fetchDetail(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.accessRequestShow(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal mengambil detail')
        return await response.json()
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal mengambil detail',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
        return null
      }
    },
    async save() {
      this.loading = true
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const payload = {
          pegawaiId: this.form.pegawaiId,
          description: this.form.description || null,
          permissionIds: this.form.permissionIds.filter((id) => typeof id === 'number' && id > 0),
          workflowId: this.form.workflowId || null,
          accessPeriod: this.form.accessPeriod,
          expiryDate: this.form.accessPeriod === 'temporary' ? this.form.expiryDate : null,
          priority: this.form.priority,
        }

        const url = this.isEditMode && this.selectedRequest?.id
          ? `${$api.accessRequests()}/${this.selectedRequest.id}`
          : $api.accessRequests()
        const response = await fetch(url, {
          method: this.isEditMode ? 'PUT' : 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.message || 'Gagal menyimpan')
        }

        this.closeModal()
        await this.fetchAccessRequests()
        toast.success({
          title: 'Berhasil',
          message: `Permintaan akses berhasil ${this.isEditMode ? 'diperbarui' : 'ditambahkan'}.`,
          color: 'green',
          position: 'bottomRight',
          layout: 2,
          icon: 'success',
        })
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal menyimpan',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
      } finally {
        this.loading = false
      }
    },
    async submit(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.accessRequestSubmit(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Gagal submit')
        }
        toast.success({
          title: 'Berhasil',
          message: 'Permintaan akses berhasil di-submit.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
          icon: 'success',
        })
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal submit',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
        return false
      }
    },
    async approve(id: number | string, remarks?: string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.accessRequestApprove(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ remarks: remarks || '' }),
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Gagal approve')
        }
        toast.success({
          title: 'Berhasil',
          message: 'Permintaan akses berhasil disetujui.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
          icon: 'success',
        })
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal approve',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
        return false
      }
    },
    async reject(id: number | string, remarks: string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.accessRequestReject(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ remarks }),
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Gagal reject')
        }
        toast.success({
          title: 'Berhasil',
          message: 'Permintaan akses berhasil direject.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
          icon: 'success',
        })
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal reject',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
        return false
      }
    },
    async cancel(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.accessRequestCancel(id), {
          method: 'PATCH',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Gagal membatalkan')
        }
        toast.success({
          title: 'Berhasil',
          message: 'Permintaan akses berhasil dibatalkan.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
          icon: 'success',
        })
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal membatalkan',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
        return false
      }
    },
    async deleteRequest(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Permintaan akses yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })
      if (!result.isConfirmed) return false

      try {
        const response = await fetch(`${$api.accessRequests()}/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Gagal menghapus')
        }
        toast.success({
          title: 'Berhasil',
          message: 'Permintaan akses berhasil dihapus.',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
          icon: 'success',
        })
        await this.fetchAccessRequests()
        return true
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal menghapus',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
          icon: 'error',
        })
        return false
      }
    },
    openModal(ar?: any) {
      this.isEditMode = !!ar
      this.selectedRequest = ar || null
      if (ar) {
        this.form = {
          pegawaiId: ar.pegawai?.id_pegawai ?? ar.pegawaiId,
          description: ar.description || '',
          permissionIds: Array.isArray(ar.permissions) ? ar.permissions.map((p: any) => (typeof p === 'number' ? p : p.id)) : [],
          workflowId: ar.workflowId ?? ar.workflow?.id ?? null,
          accessPeriod: ar.accessPeriod || 'permanent',
          expiryDate: ar.expiryDate || null,
          priority: ar.priority || 'medium',
        }
      } else {
        this.form = {
          pegawaiId: null,
          description: '',
          permissionIds: [],
          workflowId: null,
          accessPeriod: 'permanent',
          expiryDate: null,
          priority: 'medium',
        }
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.selectedRequest = null
      this.form = {
        pegawaiId: null,
        description: '',
        permissionIds: [],
        workflowId: null,
        accessPeriod: 'permanent',
        expiryDate: null,
        priority: 'medium',
      }
    },
    setPagination(event: any) {
      this.params.first = event.first
      this.params.rows = event.rows
      this.fetchAccessRequests()
    },
    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchAccessRequests()
    },
    setStatusFilter(status: string) {
      this.params.status = status
      this.params.first = 0
      this.fetchAccessRequests()
    },
  },
})
