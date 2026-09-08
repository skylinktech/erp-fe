import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse, normalizeApiError, toastNormalizedError } from '~/utils/apiError'

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
  /** Dropdown catalog — isolated from list-page search/pagination. */
  customersForSelect: Customer[]
  customersForSelectLoadedAt: number | null
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

const SELECT_DEFAULT_ROWS = 500
const SELECT_CACHE_TTL_MS = 5 * 60 * 1000

/** In-flight dedupe so FDR/SI/Quotation mounting together share one request. */
let customersForSelectInFlight: Promise<Customer[]> | null = null

function parseCustomerList(result: any): Customer[] {
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result)) return result
  return []
}

export const useCustomerStore = defineStore('customer', {
  state: (): CustomerState => ({
    customers: [],
    customersForSelect: [],
    customersForSelectLoadedAt: null,
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
  getters: {
    /** Prefer select catalog; fall back to list so older callers still work. */
    customerSelectOptions(state): Customer[] {
      if (state.customersForSelect.length > 0) return state.customersForSelect
      return state.customers
    },
  },
  actions: {
    async fetchCustomers(suppressError = false) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        })

        const response = await fetch(`${$api.customer()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pelanggan.' }))
          throw new Error(errorData.message || 'Gagal memuat data pelanggan.')
        }

        const result = await response.json()
        this.customers = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message

        if (!suppressError) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data pelanggan: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Load customers for dropdowns without using (or mutating) list-page search/pagination.
     * Cached briefly and de-duplicated in-flight to avoid N+1 across FDR/SI/etc.
     */
    async fetchCustomersForSelect(opts?: {
      rows?: number
      force?: boolean
      suppressError?: boolean
    }): Promise<Customer[]> {
      const rows = opts?.rows ?? SELECT_DEFAULT_ROWS
      const force = opts?.force === true
      const suppressError = opts?.suppressError === true
      const fresh =
        this.customersForSelect.length > 0 &&
        this.customersForSelectLoadedAt != null &&
        Date.now() - this.customersForSelectLoadedAt < SELECT_CACHE_TTL_MS

      if (!force && fresh) return this.customersForSelect
      if (!force && customersForSelectInFlight) return customersForSelectInFlight

      const { $api } = useNuxtApp()
      customersForSelectInFlight = (async () => {
        try {
          const params = new URLSearchParams({
            page: '1',
            rows: String(Math.min(Math.max(rows, 1), 1000)),
            sortField: 'name',
            sortOrder: 'asc',
            search: '',
          })
          const response = await fetch(`${$api.customer()}?${params.toString()}`, {
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            credentials: 'include',
          })
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pelanggan.' }))
            throw new Error(errorData.message || 'Gagal memuat data pelanggan.')
          }
          const result = await response.json()
          const list = parseCustomerList(result)
          this.customersForSelect = list
          this.customersForSelectLoadedAt = Date.now()
          return list
        } catch (e: any) {
          if (!suppressError) {
            const toast = useToast()
            toast.error({
              title: 'Error',
              message: `Tidak dapat memuat daftar customer: ${e?.message || e}`,
              color: 'red',
              position: 'bottomRight',
            })
          }
          return this.customersForSelect
        } finally {
          customersForSelectInFlight = null
        }
      })()

      return customersForSelectInFlight
    },

    /** Ensure a single customer appears in the select catalog (edit/prefill). */
    mergeCustomerIntoSelect(customer: Partial<Customer> | null | undefined) {
      const id = Number(customer?.id)
      if (!id || !customer) return
      const list = Array.isArray(this.customersForSelect) ? [...this.customersForSelect] : []
      const idx = list.findIndex((c) => Number(c.id) === id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...customer, id } as Customer
      } else {
        list.push({ ...(customer as Customer), id })
      }
      list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'id'))
      this.customersForSelect = list
    },

    async prefetchCustomers() {
      if (this.customers.length > 0 || this.loading) {
        return
      }
      await this.fetchCustomers()
    },
    validateCustomerForm(): string[] {
      const errors: string[] = []
      this.form.email = String(this.form.email || '').trim()
      this.form.phone = String(this.form.phone || '').replace(/\D/g, '')

      const email = this.form.email
      const phone = this.form.phone
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!email) {
        errors.push('Email wajib diisi')
      } else if (!emailPattern.test(email)) {
        errors.push('Email harus menggunakan format email yang valid')
      }

      if (!phone) {
        errors.push('Nomor telepon wajib diisi')
      } else if (!/^\d+$/.test(phone)) {
        errors.push('Nomor telepon hanya boleh berisi angka, tidak boleh ada karakter lain')
      }

      return errors
    },

    async saveCustomer() {
      this.validationErrors = this.validateCustomerForm()
      if (this.validationErrors.length > 0) {
        return
      }

      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      try {
        const formData = new FormData()

        const fieldsToSend = ['name', 'address', 'email', 'phone', 'npwp', 'ktp', 'type']
        fieldsToSend.forEach((key) => {
          const value = this.form[key as keyof typeof this.form]
          if (value !== null && value !== undefined) {
            if (key === 'type') {
              if (['prospect', 'regular', 'vip'].includes(String(value))) {
                formData.append(key, String(value))
              }
            } else {
              formData.append(key, String(value))
            }
          }
        })

        if (this.form.logo instanceof File) {
          formData.append('logo', this.form.logo)
        }

        let method = 'POST'
        let url = $api.customer()
        if (this.isEditMode && this.form.id) {
          url = `${$api.customer()}/${this.form.id}`
          method = 'PUT'
        }

        const response = await fetch(url, {
          method: method,
          body: formData,
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
            const err = await normalizeFailedResponse(
                response,
                this.isEditMode ? 'Customer gagal diperbarui.' : 'Customer gagal dibuat.'
            )
            this.validationErrors = (err.fieldErrorList || [])
              .map((e) => e?.message || '')
              .filter(Boolean)
            if (this.validationErrors.length === 0 && err.message) {
              this.validationErrors = [err.message]
            }
            const toast = useToast()
            toast.error({
              title: err.type === 'validation' ? 'Validasi' : 'Error',
              message: err.message,
              color: 'red',
              position: 'bottomRight',
              layout: 2,
            })
            return false
        }

        this.closeModal()
        this.customersForSelectLoadedAt = null
        await Promise.all([
          this.fetchCustomers(),
          this.fetchCustomersForSelect({ force: true, suppressError: true }),
        ])
        const toast = useToast()
        toast.success({
          title: 'Success',
          message: `Customer berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          toastNormalizedError(normalizeApiError(error, 'Customer gagal disimpan.'))
        }
      } finally {
        this.loading = false
      }
    },
    async deleteCustomer(id: number) {
      const { $api } = useNuxtApp()
      const toast = useToast()

      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data pelanggan yang dihapus tidak dapat dikembalikan!',
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
        const response = await fetch($api.customer() + `/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Customer gagal dihapus.')
          throw new Error(err.message)
        }

        this.customersForSelectLoadedAt = null
        this.customersForSelect = this.customersForSelect.filter((c) => Number(c.id) !== Number(id))
        await this.fetchCustomers()
        toast.success({
          title: 'Berhasil!',
          message: 'Customer berhasil dihapus.',
          color: 'green',
        })
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal menghapus pelanggan',
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },

    async getCustomerDetails(customerId: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const response = await fetch(`${$api.customer()}/${customerId}`, {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat detail pelanggan.' }))
          throw new Error(errorData.message || 'Gagal memuat detail pelanggan.')
        }

        const result = await response.json()
        this.selectedCustomer = result.data
      } catch (e: any) {
        this.error = e.message
        this.selectedCustomer = null
        const toast = useToast()
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat detail pelanggan: ${e.message}`,
          color: 'red',
          position: 'bottomRight',
        })
      } finally {
        this.loading = false
      }
    },

    async openModal(customer: Customer | null = null) {
      this.isEditMode = !!customer
      this.validationErrors = []

      if (customer && customer.id) {
        this.loading = true
        const { $api } = useNuxtApp()
        try {
          const response = await fetch(`${$api.customer()}/${customer.id}`, {
            headers: { Accept: 'application/json' },
            credentials: 'include',
          })
          if (!response.ok) throw new Error('Gagal mengambil detail data pelanggan.')
          const result = await response.json()
          const data = result.data
          this.form = {
            ...data,
            type: data.type || '',
          }
        } catch (error: any) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: error.message,
            color: 'red',
            position: 'bottomRight',
          })
        } finally {
          this.loading = false
        }
      } else {
        this.form = {
          name: '',
          address: '',
          email: '',
          phone: '',
          npwp: '',
          ktp: '',
          type: '',
          logo: '',
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        name: '',
        address: '',
        email: '',
        phone: '',
        npwp: '',
        ktp: '',
        type: '',
        logo: '',
      }
      this.validationErrors = []
    },

    setPagination(event: any) {
      this.params.first = Number(event.first) || 0
      this.params.rows = Number(event.rows) || 10
      this.fetchCustomers()
    },

    setSort(event: any) {
      this.params.sortField = event.sortField
      this.params.sortOrder = event.sortOrder
      this.fetchCustomers()
    },

    setSearch(value: string) {
      this.params.search = value
      this.params.first = 0
      this.fetchCustomers()
    },

    handleLogoChange(file: File) {
      if (file) {
        this.form.logo = file
      }
    },
  },
})
