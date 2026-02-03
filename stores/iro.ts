import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'

export interface IroDetailForm {
  serviceId: number | null
  servicePlanId: number | null
  productId: number | null
  didId: number | null
  itemType: 'PRODUCT' | 'SERVICE' | 'DID'
  minimumPeriod?: string
  quantity: number
  price: number
  subtotal: number
  service?: { id: number; name: string; code?: string; price?: number }
  servicePlan?: { id: number; name: string }
  product?: { id: number; name: string; sku?: string; priceSell?: number }
  did?: { id: number; code: string; name: string; price?: number }
}

export interface ApprovalLogEntry {
  id: number
  entityType?: string
  entityId?: string
  stepOrder: number
  action: 'approved' | 'rejected'
  remarks?: string | null
  createdAt?: string
  user?: { id: number; full_name?: string; fullName?: string; email?: string }
  workflow?: { steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string }> }
  workflow?: { id: number; name?: string }
}

export interface ApproverInfo {
  userId: number
  fullName?: string
  email?: string
  source?: 'role' | 'jabatan' | 'user'
}

export interface Iro {
  id: string
  noIro: string
  siteInvestId: string
  quotationId: string
  customerId: number
  termsOfPayment: string
  materialSubtotal: number
  didSubtotal: number
  grandTotal: number
  status: string
  jenisIro?: string
  createdBy: number | null
  approvedBy: number | null
  rejectedBy: number | null
  currentApprovalStep?: number | null
  submittedAt?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt: string
  updatedAt: string
  customer?: { id: number; name: string; code?: string; email?: string; phone?: string }
  siteInvest?: { id: string; siNumber?: string; name?: string }
  quotation?: { id: string; noQuotation?: string; status?: string }
  iroDetails?: IroDetailForm[]
  createdByUser?: { id: number; full_name?: string; fullName?: string; email?: string }
  approvedByUser?: { id: number; full_name?: string; fullName?: string }
  rejectedByUser?: { id: number; full_name?: string; fullName?: string }
  approvalLogs?: ApprovalLogEntry[]
  currentApprovers?: ApproverInfo[]
}

interface IroState {
  iros: Iro[]
  iro: Iro | null
  loading: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    draw: number
    search: string
    customerId?: number | null
    status?: string | null
  }
  form: {
    id?: string | null
    siteInvestId: string | null
    quotationId: string | null
    customerId: number | null
    termsOfPayment: string
    status: string
    jenisIro: string
    iroDetails: IroDetailForm[]
  }
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  statistics: {
    totalIros: number
    approvedIros: number
    draftIros: number
    pendingIros: number
    rejectedIros: number
    totalValue: number
  }
}

/** 1 baris = 1 tipe: PRODUCT (hanya productId), SERVICE (serviceId+servicePlanId), DID (hanya didId). */
function validateDetailsByItemType(details: IroDetailForm[]): string | null {
  for (let i = 0; i < details.length; i++) {
    const d = details[i]
    const t = String(d.itemType || '').toUpperCase()
    if (t === 'PRODUCT') {
      if (d.productId == null || d.productId === 0) return `Item #${i + 1}: productId wajib untuk PRODUCT`
      if (d.serviceId != null && d.serviceId !== 0) return `Item #${i + 1}: serviceId harus kosong untuk PRODUCT`
      if (d.servicePlanId != null && d.servicePlanId !== 0) return `Item #${i + 1}: servicePlanId harus kosong untuk PRODUCT`
      if (d.didId != null && d.didId !== 0) return `Item #${i + 1}: didId harus kosong untuk PRODUCT`
    } else if (t === 'SERVICE') {
      if (d.serviceId == null || d.serviceId === 0) return `Item #${i + 1}: serviceId wajib untuk SERVICE`
      if (d.servicePlanId == null || d.servicePlanId === 0) return `Item #${i + 1}: servicePlanId wajib untuk SERVICE`
      if (d.productId != null && d.productId !== 0) return `Item #${i + 1}: productId harus kosong untuk SERVICE`
      if (d.didId != null && d.didId !== 0) return `Item #${i + 1}: didId harus kosong untuk SERVICE`
    } else if (t === 'DID') {
      if (d.didId == null || d.didId === 0) return `Item #${i + 1}: didId wajib untuk DID`
      if (d.serviceId != null && d.serviceId !== 0) return `Item #${i + 1}: serviceId harus kosong untuk DID`
      if (d.servicePlanId != null && d.servicePlanId !== 0) return `Item #${i + 1}: servicePlanId harus kosong untuk DID`
      if (d.productId != null && d.productId !== 0) return `Item #${i + 1}: productId harus kosong untuk DID`
    } else {
      return `Item #${i + 1}: item_type tidak valid (PRODUCT, SERVICE, DID)`
    }
  }
  return null
}

function sanitizeDetailForPayload(d: IroDetailForm, itemType: string): Record<string, any> {
  const t = String(itemType || d.itemType || '').toUpperCase()
  const qty = Number(d.quantity) || 1
  const pr = Number(d.price) || 0
  const minPeriod = String(d.minimumPeriod ?? '12')
  const periodNum = Number(minPeriod) || 12
  const subtotal = t === 'SERVICE' ? qty * pr * periodNum : Number(d.subtotal) || qty * pr
  return {
    serviceId: t === 'SERVICE' ? (d.serviceId ?? null) : null,
    servicePlanId: t === 'SERVICE' ? (d.servicePlanId ?? null) : null,
    productId: t === 'PRODUCT' ? (d.productId ?? null) : null,
    didId: t === 'DID' ? (d.didId ?? null) : null,
    itemType: t || d.itemType,
    minimumPeriod: minPeriod,
    quantity: qty,
    price: pr,
    subtotal,
  }
}

export const useIroStore = defineStore('iro', {
  state: (): IroState => ({
    iros: [],
    iro: null,
    loading: true,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 2,
      draw: 1,
      search: '',
      customerId: null,
      status: null,
    },
    form: {
      siteInvestId: null,
      quotationId: null,
      customerId: null,
      termsOfPayment: 'postpaid',
      status: 'draft',
      jenisIro: 'capex',
      iroDetails: [],
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    statistics: {
      totalIros: 0,
      approvedIros: 0,
      draftIros: 0,
      pendingIros: 0,
      rejectedIros: 0,
      totalValue: 0,
    },
  }),

  actions: {
    async fetchIros(suppressError = false) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.iro())
        const sp = new URLSearchParams({
          page: String(Math.floor(this.params.first / this.params.rows) + 1),
          rows: String(this.params.rows),
          sortField: this.params.sortField || '',
          sortOrder: String(this.params.sortOrder ?? ''),
          draw: String(this.params.draw),
          search: this.params.search || '',
          includeDetails: 'true',
        })
        if (this.params.customerId != null) sp.append('customerId', String(this.params.customerId))
        if (this.params.status) sp.append('status', this.params.status)
        url.search = sp.toString()

        const res = await fetch(String(url), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil data IRO')
        const json = await res.json()
        this.iros = json.data ?? []
        this.totalRecords = json.meta?.total ?? 0
      } catch (e: any) {
        this.error = e
        if (!suppressError) {
          toast.error({ title: 'Error', message: `Tidak dapat memuat data IRO: ${e.message}`, color: 'red', position: 'topRight', layout: 2 })
        }
      } finally {
        this.loading = false
      }
    },

    async getIroDetails(id: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const data = await apiFetch($api.getIroDetails(id), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.iro = data.data
        else throw new Error('Struktur data tidak valid')
      } catch (e: any) {
        this.error = e
      } finally {
        this.loading = false
      }
    },

    async fetchIroForEdit(id: string) {
      const toast = useToast()
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const data = await apiFetch($api.getIroDetails(id), { headers: { Accept: 'application/json' }, credentials: 'include' })
        if (data?.data) this.openModal(data.data)
        else throw new Error('Data tidak valid')
      } catch (e: any) {
        this.error = e
        toast.error({ title: 'Error', message: 'Gagal mengambil data IRO untuk edit', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async saveIro() {
      const toast = useToast()
      this.loading = true
      this.validationErrors = []
      const { $api } = useNuxtApp()
      const userStore = useUserStore()

      const err = validateDetailsByItemType(this.form.iroDetails)
      if (err) {
        this.loading = false
        toast.error({ title: 'Validasi', message: err, color: 'red', position: 'topRight', layout: 2 })
        return
      }
      if (!this.form.siteInvestId || !this.form.quotationId || !this.form.customerId) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Site Investment, Quotation, dan Customer wajib diisi', color: 'red', position: 'topRight', layout: 2 })
        return
      }

      const validDetails = this.form.iroDetails.filter((d) => {
        const t = String(d.itemType || '').toUpperCase()
        const q = (Number(d.quantity) || 0) > 0
        const p = (Number(d.price) || 0) >= 0
        if (t === 'PRODUCT') return (d.productId != null && d.productId !== 0) && q && p
        if (t === 'SERVICE') return (d.serviceId != null && d.serviceId !== 0) && (d.servicePlanId != null && d.servicePlanId !== 0) && q && p
        if (t === 'DID') return (d.didId != null && d.didId !== 0) && q && p
        return false
      })
      if (validDetails.length === 0) {
        this.loading = false
        toast.error({ title: 'Validasi', message: 'Minimal 1 item (PRODUCT, SERVICE, atau DID) dengan data yang valid', color: 'red', position: 'topRight', layout: 2 })
        return
      }

      // Status tidak dikirim: create → backend default 'draft'; update → backend pakai status lama
      const body: Record<string, any> = {
        siteInvestId: this.form.siteInvestId,
        quotationId: this.form.quotationId,
        customerId: this.form.customerId,
        termsOfPayment: this.form.termsOfPayment || 'postpaid',
        jenisIro: this.form.jenisIro || 'capex',
        createdBy: this.isEditMode ? undefined : (userStore.user?.id ?? null),
        iroDetails: validDetails.map((d) => sanitizeDetailForPayload(d, d.itemType)),
      }

      const url = this.isEditMode && this.form.id ? `${$api.iro()}/${this.form.id}` : $api.iro()

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const ed = await res.json().catch(() => ({}))
          this.validationErrors = ed.errors || []
          toast.error({ title: 'Error', message: ed.message || (this.isEditMode ? 'Gagal memperbarui IRO' : 'Gagal menyimpan IRO'), color: 'red', position: 'topRight', layout: 2 })
          return
        }
        this.closeModal()
        await this.fetchIros()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: `IRO berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}`, color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Operasi gagal', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async deleteIro(id: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      const ok = await Swal.fire({ title: 'Yakin?', text: 'Data yang dihapus tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' })
      if (!ok.isConfirmed) { this.loading = false; return }
      try {
        const res = await fetch(`${$api.iro()}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal menghapus IRO')
        await this.fetchIros()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'IRO berhasil dihapus', color: 'green', position: 'topRight', layout: 2 })
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal menghapus IRO', color: 'red', position: 'topRight', layout: 2 })
      } finally {
        this.loading = false
      }
    },

    async approveIro(id: string, remarks?: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.approveIro(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks: remarks || undefined }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal approve IRO')
        await this.fetchIros()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'IRO berhasil diapprove', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal approve IRO', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectIro(id: string, remarks?: string) {
      const toast = useToast()
      this.loading = true
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.rejectIro(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks: remarks || undefined }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal reject IRO')
        await this.fetchIros()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'IRO berhasil direject', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal reject IRO', color: 'red', position: 'topRight', layout: 2 })
        return false
      } finally {
        this.loading = false
      }
    },

    async submitIro(id: string, remarks?: string) {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.submitIro(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks: remarks || undefined }),
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Gagal submit IRO')
        await this.fetchIros()
        await this.fetchStatistics()
        toast.success({ title: 'Sukses', message: 'IRO berhasil di-submit', color: 'green', position: 'topRight', layout: 2 })
        return true
      } catch (e: any) {
        toast.error({ title: 'Error', message: e.message || 'Gagal submit IRO', color: 'red', position: 'topRight', layout: 2 })
        return false
      }
    },

    openModal(data: Iro | null = null) {
      this.isEditMode = !!data
      this.validationErrors = []
      if (data) {
        const raw = data as any
        this.form = {
          id: raw.id,
          siteInvestId: raw.siteInvestId ?? raw.site_invest_id ?? raw.siteInvest?.id ?? null,
          quotationId: raw.quotationId ?? raw.quotation_id ?? raw.quotation?.id ?? null,
          customerId: raw.customerId ?? raw.customer_id ?? raw.customer?.id ?? null,
          termsOfPayment: raw.termsOfPayment ?? raw.terms_of_payment ?? 'postpaid',
          status: raw.status ?? 'draft',
          jenisIro: raw.jenisIro ?? raw.jenis_iro ?? 'capex',
          iroDetails: (raw.iroDetails ?? raw.iro_details ?? []).map((d: any) => {
            const t = String(d.itemType ?? d.item_type ?? 'SERVICE').toUpperCase()
            const qty = Number(d.quantity) || 1
            const pr = Number(d.price) || 0
            const minPeriod = String(d.minimumPeriod ?? d.minimum_period ?? '12')
            const periodNum = Number(minPeriod) || 12
            const subtotal = t === 'SERVICE' ? qty * pr * periodNum : Number(d.subtotal) || qty * pr
            const o: IroDetailForm = {
              serviceId: d.serviceId ?? d.service_id ?? d.service?.id ?? null,
              servicePlanId: d.servicePlanId ?? d.service_plan_id ?? d.servicePlan?.id ?? d.service?.servicePlan?.id ?? null,
              productId: d.productId ?? d.product_id ?? d.product?.id ?? null,
              didId: d.didId ?? d.did_id ?? d.did?.id ?? null,
              itemType: t as 'PRODUCT' | 'SERVICE' | 'DID',
              minimumPeriod: minPeriod,
              quantity: qty,
              price: pr,
              subtotal,
              service: d.service,
              servicePlan: d.servicePlan ?? d.service_plan,
              product: d.product,
              did: d.did,
            }
            if (t === 'PRODUCT') { o.serviceId = null; o.servicePlanId = null; o.didId = null }
            else if (t === 'SERVICE') { o.productId = null; o.didId = null }
            else if (t === 'DID') { o.serviceId = null; o.servicePlanId = null; o.productId = null }
            return o
          }),
        }
      } else {
        this.form = {
          id: null,
          siteInvestId: null,
          quotationId: null,
          customerId: null,
          termsOfPayment: 'postpaid',
          status: 'draft',
          jenisIro: 'capex',
          iroDetails: [],
        }
      }
      this.showModal = true
    },

    /**
     * Resolve didId from item that has priceListLine (quotation_dids / site_invest_dids).
     * Backend returns priceListLine with did (after loadPriceable) or priceableType + priceableId.
     */
    resolveDidIdFromItem(item: any): number | null {
      if (!item) return null
      const direct = item.didId ?? item.did_id ?? item.did?.id ?? null
      if (direct != null && direct !== 0) return direct
      const pl = item.priceListLine ?? item.price_list_line
      if (!pl) return null
      const fromDid = pl.did?.id ?? pl.did_id ?? null
      if (fromDid != null && fromDid !== 0) return fromDid
      if (String(pl.priceableType ?? pl.priceable_type ?? '').toLowerCase() === 'did') {
        const pid = pl.priceableId ?? pl.priceable_id ?? null
        if (pid != null && pid !== 0) return pid
      }
      return null
    },

    /**
     * Isi form.iroDetails: 1 baris = 1 tipe. PRODUCT dari quotation_items; SERVICE dari quotation_services;
     * DID: prioritas quotation.quotationDids (jika ada), else siteInvestDids. didId dari priceListLine.did.id atau priceableId.
     */
    setIroDetailsFromQuotation(quotation: any, siteInvestDids: any[] | null) {
      const details: IroDetailForm[] = []

      if (quotation) {
        const svcs = quotation.quotationServices ?? quotation.quotation_services ?? []
        const items = quotation.quotationItems ?? quotation.quotation_items ?? []

        for (const it of items) {
          const productId = it.productId ?? it.product_id ?? it.product?.id ?? null
          if (!productId) continue
          details.push({
            serviceId: null,
            servicePlanId: null,
            productId,
            didId: null,
            itemType: 'PRODUCT',
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
            subtotal: Number(it.subtotal) || (Number(it.quantity) || 1) * (Number(it.price) || 0),
            product: it.product,
          })
        }

        const minPeriod = quotation.minimumPeriod ?? quotation.minimum_period ?? '12'
        const periodNum = Number(minPeriod) || 12
        for (const s of svcs) {
          const serviceId = s.serviceId ?? s.service_id ?? s.service?.id ?? null
          const servicePlanId = s.servicePlanId ?? s.service_plan_id ?? s.service?.servicePlanId ?? s.service?.service_plan_id ?? s.service?.servicePlan?.id ?? null
          if (!serviceId || !servicePlanId) continue
          const qty = Number(s.quantity) || 1
          const pr = Number(s.price) || 0
          details.push({
            serviceId,
            servicePlanId,
            productId: null,
            didId: null,
            itemType: 'SERVICE',
            minimumPeriod: minPeriod,
            quantity: qty,
            price: pr,
            subtotal: qty * pr * periodNum,
            service: s.service,
            servicePlan: s.servicePlan ?? s.service_plan ?? s.service?.servicePlan,
          })
        }

        const quotationDids = quotation.quotationDids ?? quotation.quotation_dids ?? []
        if (quotationDids.length > 0) {
          for (const qd of quotationDids) {
            const didId = this.resolveDidIdFromItem(qd)
            if (didId == null || didId === 0) continue
            const qty = Number(qd.quantity) ?? Number(qd.priceListLine?.quantity) ?? 1
            const pr = Number(qd.price) ?? Number(qd.priceListLine?.price) ?? 0
            const pl = qd.priceListLine ?? qd.price_list_line
            details.push({
              serviceId: null,
              servicePlanId: null,
              productId: null,
              didId,
              itemType: 'DID',
              quantity: qty,
              price: pr,
              subtotal: Number(qd.subtotal) || qty * pr,
              did: pl?.did ? { id: pl.did.id, code: pl.did.code, name: pl.did.name } : undefined,
            })
          }
        } else {
          for (const sid of siteInvestDids || []) {
            const didId = this.resolveDidIdFromItem(sid)
            if (didId == null || didId === 0) continue
            const qty = Number(sid.quantity) || 1
            const pr = Number(sid.price) || 0
            const pl = sid.priceListLine ?? sid.price_list_line
            details.push({
              serviceId: null,
              servicePlanId: null,
              productId: null,
              didId,
              itemType: 'DID',
              quantity: qty,
              price: pr,
              subtotal: Number(sid.subtotal) || qty * pr,
              did: pl?.did ? { id: pl.did.id, code: pl.did.code, name: pl.did.name } : undefined,
            })
          }
        }
      } else {
        for (const sid of siteInvestDids || []) {
          const didId = this.resolveDidIdFromItem(sid)
          if (didId == null || didId === 0) continue
          const qty = Number(sid.quantity) || 1
          const pr = Number(sid.price) || 0
          const pl = sid.priceListLine ?? sid.price_list_line
          details.push({
            serviceId: null,
            servicePlanId: null,
            productId: null,
            didId,
            itemType: 'DID',
            quantity: qty,
            price: pr,
            subtotal: Number(sid.subtotal) || qty * pr,
            did: pl?.did ? { id: pl.did.id, code: pl.did.code, name: pl.did.name } : undefined,
          })
        }
      }

      this.form.iroDetails = details
    },

    /** Ganti baris DID: hapus yang lama, tambah dari siteInvestDids. didId dari priceListLine.did atau priceableId. */
    applyDidRows(siteInvestDids: any[] | null) {
      this.form.iroDetails = this.form.iroDetails.filter((d) => String(d.itemType || '').toUpperCase() !== 'DID')
      for (const sid of siteInvestDids || []) {
        const didId = this.resolveDidIdFromItem(sid)
        if (didId == null || didId === 0) continue
        const qty = Number(sid.quantity) || 1
        const pr = Number(sid.price) || 0
        const pl = sid.priceListLine ?? sid.price_list_line
        this.form.iroDetails.push({
          serviceId: null,
          servicePlanId: null,
          productId: null,
          didId,
          itemType: 'DID',
          quantity: qty,
          price: pr,
          subtotal: Number(sid.subtotal) || qty * pr,
          did: pl?.did ? { id: pl.did.id, code: pl.did.code, name: pl.did.name } : undefined,
        })
      }
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.form = {
        id: null,
        siteInvestId: null,
        quotationId: null,
        customerId: null,
        termsOfPayment: 'postpaid',
        status: 'draft',
        jenisIro: 'capex',
        iroDetails: [],
      }
      this.validationErrors = []
    },

    addDetail() {
      this.form.iroDetails.push({ serviceId: null, servicePlanId: null, productId: null, didId: null, itemType: 'SERVICE', minimumPeriod: '12', quantity: 1, price: 0, subtotal: 0 })
    },

    removeDetail(index: number) {
      this.form.iroDetails.splice(index, 1)
    },

    setPagination(e: any) {
      this.params.first = Number(e?.first) || 0
      this.params.rows = Number(e?.rows) || 10
      this.fetchIros()
    },

    setSort(e: any) {
      this.params.sortField = e?.sortField ?? null
      this.params.sortOrder = e?.sortOrder ?? null
      this.fetchIros()
    },

    setSearch(v: string) {
      this.params.search = v || ''
      this.params.first = 0
      this.fetchIros()
    },

    setFilters(f: { customerId?: number | null; status?: string | null; search?: string }) {
      this.params.customerId = f.customerId
      this.params.status = f.status ?? null
      if (f.search !== undefined) this.params.search = f.search
      this.params.first = 0
      this.fetchIros()
    },

    async fetchStatistics() {
      const toast = useToast()
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.iroStatistics(), { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' })
        if (!res.ok) throw new Error('Gagal mengambil statistik IRO')
        const json = await res.json()
        this.statistics = json.data ?? this.statistics
      } catch (e: any) {
        toast.error({ title: 'Error', message: 'Gagal memuat statistik IRO', color: 'red', position: 'topRight', layout: 2 })
      }
    },
  },
})
