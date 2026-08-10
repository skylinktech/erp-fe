import { defineStore } from 'pinia'

export const useCreditNoteStore = defineStore('creditNote', {
  state: () => ({
    items: [] as any[],
    totalRecords: 0,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCreditNotes(params: { page?: number; rows?: number; search?: string; originalInvoiceId?: string } = {}) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const qs = new URLSearchParams({
          page: String(params.page || 1),
          rows: String(params.rows || 10),
          search: params.search || '',
        })
        if (params.originalInvoiceId) qs.set('originalInvoiceId', params.originalInvoiceId)
        const res = await fetch(`${$api.creditNotes()}?${qs}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Gagal memuat Credit Note')
        this.items = Array.isArray(json.data) ? json.data : []
        this.totalRecords = json.meta?.total || this.items.length
      } catch (e: any) {
        this.error = e.message
        this.items = []
      } finally {
        this.loading = false
      }
    },

    async createFromInvoice(originalInvoiceId: string, reason?: string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const res = await fetch($api.creditNotes(), {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ originalInvoiceId, reason }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Gagal membuat Credit Note')
        toast.success({
          title: 'Sukses',
          message: 'Credit Note draft dibuat',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        })
        return json.data
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message,
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        })
        return null
      }
    },
  },
})
