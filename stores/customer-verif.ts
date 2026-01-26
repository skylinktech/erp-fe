import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import { useImageUrl } from '~/composables/useImageUrl'

export interface CustomerVerifDoc {
  id?: number
  customerVerifId?: number
  akta: boolean
  npwp: boolean
  nib: boolean
  ktp: boolean
  suratKuasa?: boolean | null
}

export interface CustomerVerif {
  id: number
  iroId: string
  customerId: number | null
  status: 'draft' | 'pending' | 'verified' | 'unverified'
  noVerif: string
  notes: string | null
  attachment: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  customerAddress: string | null
  customerNpwp: string | null
  verifiedBy: number | null
  unverifiedBy: number | null
  createdBy: number
  verifiedAt: string | null
  unverifiedAt: string | null
  createdAt: string
  updatedAt: string
  iro?: any
  customer?: any
  createdByUser?: any
  verifiedByUser?: any
  unverifiedByUser?: any
  customerVerifDocs?: CustomerVerifDoc[]
}

interface Stats {
  total: number | undefined
  draft: number | undefined
  pending: number | undefined
  verified: number | undefined
  unverified: number | undefined
}

interface CustomerVerifState {
  customerVerifs: CustomerVerif[]
  customerVerif: CustomerVerif | null
  originalCustomerVerif: CustomerVerif | null
  loading: boolean
  error: any
  totalRecords: number
  stats: Stats
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    status?: string | null
    iroId?: string | null
    customerId?: number | null
  }
  form: any
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  approvedIros: any[]
}

export const useCustomerVerifStore = defineStore('customerVerif', {
  state: (): CustomerVerifState => ({
    customerVerifs: [],
    customerVerif: null,
    originalCustomerVerif: null,
    loading: true,
    error: null,
    totalRecords: 0,
    stats: {
      total: 0,
      draft: 0,
      pending: 0,
      verified: 0,
      unverified: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      status: null,
      iroId: null,
      customerId: null,
    },
    form: {
      iroId: null,
      customerId: null,
      status: 'draft',
      notes: '',
      attachment: null,
      attachmentPreview: null,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      customerNpwp: '',
      customerVerifDocs: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    approvedIros: [],
  }),

  actions: {
    async fetchCustomerVerifs(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.customerVerif())
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: this.params.sortOrder?.toString() || '',
          draw: this.params.draw.toString(),
          search: this.params.search || '',
        })

        if (this.params.status) {
          params.append('status', this.params.status)
        }
        if (this.params.iroId) {
          params.append('iroId', this.params.iroId)
        }
        if (this.params.customerId) {
          params.append('customerId', this.params.customerId.toString())
        }

        url.search = params.toString()

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) throw new Error('Gagal mengambil data customer verification')

        const result = await response.json()
        this.customerVerifs = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data customer verification:', e)
        this.error = e

        if (!suppressError) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Customer Verification: ${e?.message || e}`,
            color: 'red'
          })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      const { $api } = useNuxtApp()
      const defaultStats = {
        total: undefined,
        draft: undefined,
        pending: undefined,
        verified: undefined,
        unverified: undefined,
      }
      try {
        const response = await fetch($api.customerVerifCountByStatus(), {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          this.stats = result
        } else {
          this.stats = defaultStats
        }
      } catch (error) {
        console.error('Gagal mengambil data statistik:', error)
        this.stats = defaultStats
      }
    },

    async fetchApprovedIros() {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.customerVerifApprovedIros(), {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) throw new Error('Gagal mengambil data IRO approved')

        const result = await response.json()
        this.approvedIros = result.data || []
        return this.approvedIros
      } catch (e: any) {
        console.error('Gagal mengambil data IRO approved:', e)
        this.approvedIros = []
        return []
      }
    },

    async fetchIroCustomer(iroId: string) {
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.customerVerifIroCustomer(iroId), {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) throw new Error('Gagal mengambil data customer dari IRO')

        const result = await response.json()
        return result.data
      } catch (e: any) {
        console.error('Gagal mengambil data customer dari IRO:', e)
        throw e
      }
    },

    async saveCustomerVerif() {
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      try {
        const formData = new FormData()

        const dataToAppend = { ...this.form }
        delete dataToAppend.customerVerifDocs
        delete dataToAppend.iro
        delete dataToAppend.customer
        delete dataToAppend.createdByUser
        delete dataToAppend.verifiedByUser
        delete dataToAppend.unverifiedByUser
        delete dataToAppend.attachment
        delete dataToAppend.attachmentPreview

        // Always append createdBy for new records first (before other data)
        if (!this.isEditMode) {
          if (userStore.user && userStore.user.id) {
            formData.append('createdBy', userStore.user.id.toString())
          } else {
            console.error('User tidak ditemukan untuk createdBy')
            const toast = useToast()
            toast.error({
              title: 'Error',
              message: 'User tidak terautentikasi. Silakan login ulang.',
              color: 'red',
            })
            this.loading = false
            return
          }
          // Remove status from dataToAppend, it will be set to 'draft' in backend
          delete dataToAppend.status
        }

        Object.keys(dataToAppend).forEach(key => {
          const value = dataToAppend[key]
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value)
          }
        })

        this.form.customerVerifDocs.forEach((item: any, i: number) => {
          Object.keys(item).forEach(itemKey => {
            const value = item[itemKey]
            if (value !== null && value !== undefined) {
              formData.append(`customerVerifDocs[${i}][${itemKey}]`, value)
            }
          })
        })

        if (this.form.attachment instanceof File) {
          formData.append('attachment', this.form.attachment)
        }

        const method = this.isEditMode ? 'POST' : 'POST'
        const url = this.isEditMode ? `${$api.customerVerif()}/${this.form.id}` : $api.customerVerif()
        if (this.isEditMode) {
          formData.append('_method', 'PUT')
        }

        const response = await fetch(url, {
          method: method,
          headers: {
            'Accept': 'application/json',
          },
          body: formData,
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 422) {
            this.validationErrors = errorData.errors
            const toast = useToast()
            toast.error({
              title: 'Error',
              message: 'Gagal Validasi',
              color: 'red'
            })
          } else {
            throw new Error(errorData.message || 'Gagal menyimpan data customer verification')
          }
        } else {
          this.closeModal()
          await this.fetchCustomerVerifs()
          await this.fetchStats()
          const toast = useToast()
          toast.success({
            title: 'Success',
            message: `Customer Verification berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
            color: 'green',
            position: 'topRight',
            layout: 2,
          })
        }
      } catch (error: any) {
        this.validationErrors = []
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Operasi gagal',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async deleteCustomerVerif(id: number) {
      this.loading = true
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      })

      if (!result.isConfirmed) {
        this.loading = false
        return
      }

      try {
        const response = await fetch(`${$api.customerVerif()}/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gagal menghapus Customer Verification')
        }

        await this.fetchCustomerVerifs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Customer Verification berhasil dihapus.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      } catch (error: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus Customer Verification',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
      } finally {
        this.loading = false
      }
    },

    async submitCustomerVerif(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.submitCustomerVerif(id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal submit customer verification' }))
          throw new Error(errorData.message || 'Gagal submit customer verification')
        }

        await this.fetchCustomerVerifs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Customer Verification berhasil di-submit (status: pending).',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error submit customer verification:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal submit customer verification.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async getCustomerVerifDetails(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const resData = await apiFetch(`${$api.customerVerif()}/${id}`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (resData && resData.data) {
          this.customerVerif = resData.data
        } else {
          throw new Error('Struktur data tidak valid diterima dari API getCustomerVerifDetails.')
        }
      } catch (e: any) {
        console.error('Error details:', e)
        this.error = e
        throw new Error(e.message || 'Gagal mengambil detail customer verification')
      } finally {
        this.loading = false
      }
    },

    async openModal(customerVerifData: CustomerVerif | null = null) {
      this.isEditMode = !!customerVerifData
      this.validationErrors = []

      if (customerVerifData) {
        await this.getCustomerVerifDetails(customerVerifData.id)
        const fullData = this.customerVerif

        if (!fullData) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tidak dapat memuat data Customer Verification.',
            color: 'red',
            position: 'topRight',
            layout: 2,
          })
          return
        }

        this.originalCustomerVerif = JSON.parse(JSON.stringify(fullData))

        const formData: { [key: string]: any } = {
          ...JSON.parse(JSON.stringify(fullData)),
        }

        this.form = formData
        this.form.attachment = null
        const { getAttachmentUrl } = useImageUrl()
        this.form.attachmentPreview = fullData.attachment ? getAttachmentUrl(fullData.attachment) : null

        if (this.form.customerVerifDocs && this.form.customerVerifDocs.length === 0) {
          this.addCustomerVerifDoc()
        }
      } else {
        this.resetForm()
        this.addCustomerVerifDoc()
      }
      this.showModal = true
    },

    async onIroChange(iroId: string) {
      if (!iroId) {
        this.form.customerName = ''
        this.form.customerEmail = ''
        this.form.customerPhone = ''
        this.form.customerAddress = ''
        this.form.customerNpwp = ''
        this.form.customerId = null
        return
      }

      try {
        const customerData = await this.fetchIroCustomer(iroId)
        this.form.customerId = customerData.customerId
        this.form.customerName = customerData.customerName || ''
        this.form.customerEmail = customerData.customerEmail || ''
        this.form.customerPhone = customerData.customerPhone || ''
        this.form.customerAddress = customerData.customerAddress || ''
        this.form.customerNpwp = customerData.customerNpwp || ''
      } catch (e: any) {
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: e.message || 'Gagal mengambil data customer dari IRO',
          color: 'red',
        })
      }
    },

    addCustomerVerifDoc() {
      if (!this.form.customerVerifDocs) {
        this.form.customerVerifDocs = []
      }
      this.form.customerVerifDocs.push({
        akta: false,
        npwp: false,
        nib: false,
        ktp: false,
        suratKuasa: null,
      })
    },

    removeCustomerVerifDoc(index: number) {
      if (!this.form.customerVerifDocs) return
      this.form.customerVerifDocs.splice(index, 1)
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.originalCustomerVerif = null
      this.resetForm()
      this.validationErrors = []
    },

    async verifyCustomerVerif(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.verifyCustomerVerif(id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal verify customer verification' }))
          throw new Error(errorData.message || 'Gagal verify customer verification')
        }

        await this.fetchCustomerVerifs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Customer Verification berhasil diverify.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error verifying customer verification:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal verify customer verification.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    async unverifyCustomerVerif(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch($api.unverifyCustomerVerif(id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal unverify customer verification' }))
          throw new Error(errorData.message || 'Gagal unverify customer verification')
        }

        await this.fetchCustomerVerifs()
        await this.fetchStats()
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: 'Customer Verification berhasil diunverify.',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })

        return true
      } catch (error: any) {
        console.error('Error unverifying customer verification:', error)
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal unverify customer verification.',
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.form = {
        iroId: null,
        customerId: null,
        status: 'draft',
        notes: '',
        attachment: null,
        attachmentPreview: null,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerNpwp: '',
        customerVerifDocs: [],
      }
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchCustomerVerifs()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField || null
      this.params.sortOrder = Number(event.sortOrder) || null
      this.fetchCustomerVerifs()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchCustomerVerifs()
    },

    setFilters(filters: { status?: string | null, iroId?: string | null, customerId?: number | null, search?: string }) {
      this.params.status = filters.status
      this.params.iroId = filters.iroId
      this.params.customerId = filters.customerId
      this.params.search = filters.search || ''
      this.params.first = 0
      this.fetchCustomerVerifs()
    },
  }
})
