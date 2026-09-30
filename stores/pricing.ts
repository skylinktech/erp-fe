import { defineStore } from 'pinia'
import { readAccessToken } from '~/utils/authCookie'
import {
  PRICING_CHANNELS,
  normalizePricingChannel,
  type PricingChannel,
  type PricingChannelInput,
} from '~/utils/pricingChannel'

export type { PricingChannel, PricingChannelInput }
export type PricingStatus = 'draft' | 'pending' | 'approved' | 'active' | 'inactive'

export interface PricingLineForm {
  id?: number | null
  productId: number | null
  unitId: number | null
  officialUnitPrice: number | null
  productName?: string
  productSku?: string
  unitName?: string
  isBundling?: boolean
}

export interface PricingFormState {
  id: number | null
  code: string
  channel: PricingChannel
  currency: string
  validFrom: string
  validTo: string
  perusahaanId: number | null
  status: PricingStatus | null
  lines: PricingLineForm[]
  /** MARKETPLACE only — shop currently assigned to this price list, if any. */
  shopId: string | null
  shopName?: string | null
}

function emptyLine(): PricingLineForm {
  return {
    id: null,
    productId: null,
    unitId: null,
    officialUnitPrice: null,
    productName: '',
    productSku: '',
    unitName: '',
    isBundling: false,
  }
}

function emptyForm(): PricingFormState {
  return {
    id: null,
    code: '',
    channel: PRICING_CHANNELS.POS,
    currency: 'IDR',
    validFrom: '',
    validTo: '',
    perusahaanId: null,
    status: null,
    lines: [emptyLine()],
    shopId: null,
    shopName: null,
  }
}

function dateOf(value: unknown) {
  return value ? String(value).slice(0, 10) : ''
}

export const usePricingStore = defineStore('pricing', {
  state: () => ({
    form: emptyForm() as PricingFormState,
    loading: false,
    saving: false,
    assigningShop: false,
    duplicating: false,
    error: '' as string,
    isEditMode: false,
  }),

  getters: {
    isDraftEditable(state): boolean {
      return !state.isEditMode || state.form.status === 'draft' || state.form.status == null
    },
    filledLines(state): PricingLineForm[] {
      return (state.form.lines || []).filter(
        (line) =>
          line.productId &&
          line.unitId &&
          line.officialUnitPrice != null &&
          Number(line.officialUnitPrice) > 0
      )
    },
  },

  actions: {
    resetForm(defaults?: Partial<PricingFormState>) {
      this.form = { ...emptyForm(), ...defaults, lines: defaults?.lines?.length ? defaults.lines : [emptyLine()] }
      this.isEditMode = false
      this.error = ''
    },

    addLine() {
      this.form.lines.push(emptyLine())
    },

    removeLine(index: number) {
      if (this.form.lines.length <= 1) {
        this.form.lines = [emptyLine()]
        return
      }
      this.form.lines.splice(index, 1)
    },

    applyProductToLine(index: number, product: any | null) {
      const line = this.form.lines[index]
      if (!line) return
      if (!product) {
        line.productId = null
        line.unitId = null
        line.productName = ''
        line.productSku = ''
        line.unitName = ''
        line.isBundling = false
        return
      }
      line.productId = Number(product.id) || null
      line.unitId = product.unitId != null ? Number(product.unitId) : null
      line.productName = product.name || product.nmProduct || ''
      line.productSku = product.sku || ''
      line.unitName = product.unit?.name || product.unitName || ''
      line.isBundling = Boolean(product.isBundling ?? product.isKit)
    },

    headers(companyId?: number | null) {
      const token = readAccessToken()
      const h: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
      if (token) h.Authorization = `Bearer ${token}`
      if (companyId) h['X-Company-Id'] = String(companyId)
      return h
    },

    async fetchForEdit(id: number, companyId?: number | null) {
      this.loading = true
      this.error = ''
      const { $api } = useNuxtApp()
      try {
        const res = await fetch(`${$api.productSellingPrices()}/${id}`, {
          headers: this.headers(companyId),
          credentials: 'include',
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          this.error = payload?.message || 'Daftar harga tidak dapat dimuat.'
          return false
        }
        const data = payload.data || {}
        const lines = Array.isArray(data.lines) && data.lines.length
          ? data.lines.map((ln: any) => ({
              id: ln.id ?? null,
              productId: ln.productId ?? ln.product_id ?? null,
              unitId: ln.unitId ?? ln.unit_id ?? null,
              officialUnitPrice:
                ln.officialUnitPrice != null
                  ? Number(ln.officialUnitPrice)
                  : ln.official_unit_price != null
                    ? Number(ln.official_unit_price)
                    : null,
              productName: ln.product?.name || '',
              productSku: ln.product?.sku || '',
              unitName: ln.unit?.name || ln.unit?.symbol || '',
              isBundling: Boolean(ln.product?.isBundling ?? ln.product?.isKit),
            }))
          : [emptyLine()]

        this.form = {
          id: Number(data.id) || null,
          code: data.code || '',
          channel: normalizePricingChannel(data.channel) || PRICING_CHANNELS.POS,
          currency: data.currency || 'IDR',
          validFrom: dateOf(data.validFrom ?? data.valid_from),
          validTo: dateOf(data.validTo ?? data.valid_to),
          perusahaanId: data.perusahaanId ?? data.perusahaan_id ?? companyId ?? null,
          status: data.status || null,
          lines,
          shopId: data.shopId ?? data.shop?.id ?? null,
          shopName: data.shop?.name ?? data.shopName ?? null,
        }
        this.isEditMode = true
        return true
      } catch (err: any) {
        this.error = err?.message || 'Daftar harga tidak dapat dimuat.'
        return false
      } finally {
        this.loading = false
      }
    },

    async save(companyId: number) {
      this.saving = true
      this.error = ''
      const { $api } = useNuxtApp()
      const lines = this.filledLines.map((line) => ({
        productId: Number(line.productId),
        unitId: Number(line.unitId),
        officialUnitPrice: Number(line.officialUnitPrice),
      }))
      const body = {
        code: this.form.code.trim(),
        perusahaanId: companyId,
        channel: this.form.channel,
        currency: this.form.currency || 'IDR',
        validFrom: this.form.validFrom,
        validTo: this.form.validTo || null,
        lines,
      }
      try {
        const isUpdate = Boolean(this.form.id)
        const url = isUpdate
          ? `${$api.productSellingPrices()}/${this.form.id}`
          : $api.productSellingPrices()
        const res = await fetch(url, {
          method: isUpdate ? 'PUT' : 'POST',
          headers: this.headers(companyId),
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          this.error = payload?.message || 'Draft harga gagal disimpan.'
          return false
        }
        const data = payload.data || {}
        this.form.id = Number(data.id) || this.form.id
        this.form.status = data.status || 'draft'
        this.isEditMode = true
        return true
      } catch (err: any) {
        this.error = err?.message || 'Draft harga gagal disimpan.'
        return false
      } finally {
        this.saving = false
      }
    },

    /**
     * MARKETPLACE only — assign a connected shop to this (saved) price list.
     * POST /product-selling-prices/:id/assign-shop — @assumed BE alignment, see
     * plugins/api.client.ts#productSellingPriceAssignShop.
     */
    async assignShop(shopId: string, companyId?: number | null) {
      if (!this.form.id) {
        this.error = 'Simpan draft terlebih dahulu sebelum menugaskan shop.'
        return false
      }
      if (this.assigningShop) return false
      this.assigningShop = true
      this.error = ''
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.productSellingPriceAssignShop(this.form.id), {
          method: 'POST',
          headers: this.headers(companyId),
          credentials: 'include',
          body: JSON.stringify({ shopId }),
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          this.error = payload?.message || 'Penugasan shop gagal.'
          return false
        }
        const data = payload.data || {}
        this.form.shopId = data.shopId ?? data.shop?.id ?? shopId
        this.form.shopName = data.shop?.name ?? this.form.shopName ?? null
        return true
      } catch (err: any) {
        this.error = err?.message || 'Penugasan shop gagal.'
        return false
      } finally {
        this.assigningShop = false
      }
    },

    /**
     * Duplicate an existing price list as a new draft, optionally on a different channel.
     * POST /product-selling-prices/:id/duplicate — @assumed BE alignment, see
     * plugins/api.client.ts#productSellingPriceDuplicate.
     * Returns the new draft's id on success, or null on failure (this.error is set).
     */
    async duplicateDraft(
      sourceId: number,
      targetChannel: PricingChannel,
      companyId?: number | null
    ): Promise<number | null> {
      if (this.duplicating) return null
      this.duplicating = true
      this.error = ''
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.productSellingPriceDuplicate(sourceId), {
          method: 'POST',
          headers: this.headers(companyId),
          credentials: 'include',
          body: JSON.stringify({ targetChannel }),
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          this.error = payload?.message || 'Duplikasi draft gagal.'
          return null
        }
        const newId = Number(payload.data?.id)
        return Number.isFinite(newId) && newId > 0 ? newId : null
      } catch (err: any) {
        this.error = err?.message || 'Duplikasi draft gagal.'
        return null
      } finally {
        this.duplicating = false
      }
    },
  },
})
