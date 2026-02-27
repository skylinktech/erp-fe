import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

/** Price type for price_list_lines: default = sell price; starlink/skylink = context; terminal_access_charge, open_service_line, additional_data */
export type PriceType =
  | 'default'
  | 'starlink'
  | 'skylink'
  | 'terminal_access_charge'
  | 'open_service_line'
  | 'additional_data'

export interface PriceListLine {
  id?: number
  priceableType: 'product' | 'service' | 'did'
  priceableId: number
  priceType?: PriceType
  price: number
  priceBuy?: number | null
  quantity: number
  subtotal: number
  billingType: 'one_time' | 'recurring'
  billingCycle?: 'monthly' | 'quarterly' | 'semi_annually' | 'yearly' | null
  terminalKitCount?: number | null
  quotaPriority?: number | null
  newServiceLine?: number | null
  additionalData?: number | null
  delPrice?: number | null
  insPrice?: number | null
  disPrice?: number | null
  /** Comma-separated DID service categories from did_services (e.g. "delivery,installation") */
  categoryDid?: string | null
  // Polymorphic relations
  product?: {
    id: number
    name: string
    sku: string
  }
  service?: {
    id: number
    name: string
    code: string
  }
  did?: {
    id: number
    code: string
    name: string
    services?: { id: number; didId: number; servicePlanId: number; category: string }[]
  }
}

export interface PriceList {
  id: number
  name: string
  type: 'site_investment' | 'walk_in' | 'promo' | 'starlink' | 'skylink'
  isActive: boolean
  validFrom: string
  validTo?: string | null
  total?: number
  createdAt: string
  updatedAt: string
  lines?: PriceListLine[]
}

interface PriceListState {
  priceLists: PriceList[]
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    type?: string
    isActive?: boolean
  }
  form: {
    id?: number
    name: string
    type: 'site_investment' | 'walk_in' | 'promo' | 'starlink' | 'skylink'
    isActive: boolean
    validFrom: string
    validTo?: string | null
    lines: PriceListLine[]
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
}

export const usePriceListStore = defineStore('priceList', {
  state: (): PriceListState => ({
    priceLists: [],
    loading: true,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'id',
      sortOrder: -1,
      search: '',
      type: undefined,
      isActive: undefined,
    },
    form: {
      name: '',
      type: 'site_investment',
      isActive: true,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: null,
      lines: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
  }),
  actions: {
    async fetchPriceLists(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor(this.params.first / this.params.rows + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || 'id',
          sortOrder: this.params.sortOrder === -1 ? '-1' : '1',
          search: this.params.search || '',
        })

        if (this.params.type) {
          params.append('type', this.params.type)
        }
        if (this.params.isActive !== undefined) {
          params.append('isActive', String(this.params.isActive))
        }

        const response = await fetch(`${$api.priceList()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Gagal memuat data price list dengan status: ' + response.status,
          }))
          throw new Error(errorData.message || 'Gagal memuat data price list')
        }

        const result = await response.json()

        this.priceLists = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message

        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data price list: ${e.message}`,
            color: 'red',
            position: 'topRight',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async savePriceList() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()

      try {
        const total = this.form.lines.reduce((s, line) => s + (Number(line.subtotal) || 0), 0)
        const payload = {
          name: this.form.name,
          type: this.form.type,
          isActive: this.form.isActive,
          validFrom: this.form.validFrom,
          validTo: this.form.validTo,
          total,
          lines: this.form.lines.map((line) => ({
            ...line,
            priceType: line.priceType || 'default',
          })),
        }

        let url = $api.priceList()
        let method = 'POST'

        if (this.isEditMode && this.form.id) {
          url = `${$api.priceList()}/${this.form.id}`
          method = 'PUT'
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (!response.ok) {
          if (result.errors) {
            this.validationErrors = Object.entries(result.errors).map(([field, messages]) => ({
              field,
              message: Array.isArray(messages) ? messages[0] : messages,
            }))
          }
          throw new Error(result.message || 'Gagal menyimpan price list')
        }

        toast.success({
          title: 'Berhasil',
          message: this.isEditMode ? 'Price list berhasil diperbarui' : 'Price list berhasil ditambahkan',
          color: 'green',
          position: 'topRight',
        })

        this.closeModal()
        await this.fetchPriceLists()
      } catch (e: any) {
        toast.error({
          title: 'Error',
          message: e.message,
          color: 'red',
          position: 'topRight',
        })
      } finally {
        this.loading = false
      }
    },

    async deletePriceList(id: number) {
      const toast = useToast()
      const { $api } = useNuxtApp()

      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Data price list akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
      })

      if (result.isConfirmed) {
        try {
          this.loading = true
          const response = await fetch(`${$api.priceList()}/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Gagal menghapus price list')
          }

          toast.success({
            title: 'Berhasil',
            message: 'Price list berhasil dihapus',
            color: 'green',
            position: 'topRight',
          })

          await this.fetchPriceLists()
        } catch (e: any) {
          toast.error({
            title: 'Error',
            message: e.message,
            color: 'red',
            position: 'topRight',
          })
        } finally {
          this.loading = false
        }
      }
    },

    openModal(priceList?: PriceList) {
      if (priceList) {
        this.isEditMode = true
        const didCategories = ['delivery', 'installation', 'dismantle']
        const expandedLines: PriceListLine[] = []
        for (const l of priceList.lines || []) {
          const base = {
            ...l,
            priceType: l.priceType || 'default',
            priceBuy: l.priceBuy ?? null,
            terminalKitCount: l.terminalKitCount ?? null,
            quotaPriority: l.quotaPriority ?? null,
            newServiceLine: l.newServiceLine ?? null,
            additionalData: l.additionalData ?? null,
            delPrice: l.delPrice ?? null,
            insPrice: l.insPrice ?? null,
            disPrice: l.disPrice ?? null,
            categoryDid: l.categoryDid ?? null,
          }
          if (l.priceableType === 'did' && l.categoryDid && String(l.categoryDid).includes(',')) {
            const cats = String(l.categoryDid).split(',').map((c) => c.trim().toLowerCase()).filter((c) => didCategories.includes(c))
            for (const cat of cats) {
              expandedLines.push({
                ...base,
                categoryDid: cat,
                delPrice: cat === 'delivery' ? (l.delPrice ?? null) : null,
                insPrice: cat === 'installation' ? (l.insPrice ?? null) : null,
                disPrice: cat === 'dismantle' ? (l.disPrice ?? null) : null,
              })
            }
          } else {
            expandedLines.push(base)
          }
        }
        // Deduplicate DID lines: when user deleted DID and re-added, backend may keep old lines
        // (if referenced). Keep one per (priceableId, categoryDid), prefer higher id (newer).
        const seenDid = new Map<string, { line: PriceListLine; index: number }>()
        const deduped: PriceListLine[] = []
        for (const l of expandedLines) {
          if (l.priceableType === 'did' && l.priceableId != null && l.categoryDid) {
            const key = `${l.priceableId}:${String(l.categoryDid).trim().toLowerCase()}`
            const entry = seenDid.get(key)
            if (entry) {
              const keep = ((l.id ?? 0) > (entry.line.id ?? 0)) ? l : entry.line
              deduped[entry.index] = keep
              seenDid.set(key, { line: keep, index: entry.index })
            } else {
              const idx = deduped.length
              deduped.push(l)
              seenDid.set(key, { line: l, index: idx })
            }
          } else {
            deduped.push(l)
          }
        }
        this.form = {
          ...priceList,
          lines: deduped,
        }
      } else {
        this.isEditMode = false
        this.resetForm()
        // show one empty row by default
        this.addEmptyLine()
      }
      this.showModal = true
      this.validationErrors = []
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
      this.validationErrors = []
    },

    resetForm() {
      this.form = {
        name: '',
        type: 'site_investment' as const,
        isActive: true,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: null,
        lines: [],
      }
    },

    addLine(line: PriceListLine) {
      this.form.lines.push(line)
    },

    /** Removes the line at index. For DID lines, removes all lines for the same DID (same priceableId) so the price list doesn't keep orphan DID rows. */
    removeLine(index: number) {
      const line = this.form.lines[index]
      if (line?.priceableType === 'did' && line?.priceableId != null) {
        const didId = line.priceableId
        const indicesToRemove = this.form.lines
          .map((l, i) => (l.priceableType === 'did' && l.priceableId === didId ? i : -1))
          .filter((i) => i >= 0)
          .sort((a, b) => b - a)
        for (const i of indicesToRemove) {
          this.form.lines.splice(i, 1)
        }
      } else {
        this.form.lines.splice(index, 1)
      }
    },
    
    // Add empty line for inline editing in modal
    addEmptyLine() {
      this.form.lines.push({
        priceableType: 'product',
        priceableId: null as any,
        priceType: 'default',
        price: 0,
        priceBuy: null,
        quantity: 1,
        subtotal: 0,
        billingType: 'one_time',
        billingCycle: null,
        terminalKitCount: null,
        quotaPriority: null,
        newServiceLine: null,
        additionalData: null,
        delPrice: null,
        insPrice: null,
        disPrice: null,
        categoryDid: null,
      })
    },

    // Update subtotal: untuk service = (price + newServiceLine) * qty + additionalData. Terminal Access Charge & Quota Priority adalah breakdown dari New Service Line (tidak dikalikan terpisah). Additional Data hanya tambahan harga (sekali).
    updateLineSubtotal(index: number) {
      const line = this.form.lines[index]
      if (!line) return
      const qty = line.quantity || 0
      if (line.priceableType === 'service') {
        const price = Number(line.price) || 0
        const newServiceLine = Number(line.newServiceLine) || 0
        const additionalData = Number(line.additionalData) || 0
        line.subtotal = (price + newServiceLine) * qty + additionalData
      } else if (line.priceableType === 'did') {
        const price = Number(line.price) || 0
        line.subtotal = price * qty
      } else {
        line.subtotal = (Number(line.price) || 0) * qty
      }
    },
  },
})
