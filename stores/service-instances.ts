import { defineStore } from 'pinia'

export type ServiceInstanceListParams = {
  page?: number
  rows?: number
  first?: number
  status?: string | null
  statuses?: string[] | null
  search?: string
  customerId?: string | number
  technology?: string | null
  perusahaanId?: string | number | null
}

const DEFAULT_CUSTOMER_SERVICE_STATUSES = ['active', 'suspended', 'terminated']

export const useServiceInstanceStore = defineStore('serviceInstance', {
  state: () => ({
    items: [] as any[],
    totalRecords: 0,
    loading: false,
    error: null as string | null,
    selected: null as any,
    summary: null as any,
    monitoring: null as any,
    events: [] as any[],
    listParams: {
      page: 1,
      rows: 10,
      first: 0,
      status: null as string | null,
      statuses: [...DEFAULT_CUSTOMER_SERVICE_STATUSES] as string[] | null,
      search: '',
      technology: null as string | null,
    },
  }),

  actions: {
    async fetchList(params: ServiceInstanceListParams = {}) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      const page =
        params.page ??
        (params.first != null
          ? Math.floor(Number(params.first) / Number(params.rows || this.listParams.rows || 10)) + 1
          : this.listParams.page)
      const rows = Number(params.rows ?? this.listParams.rows) || 10
      const status = params.status !== undefined ? params.status : this.listParams.status
      const statuses =
        params.statuses !== undefined ? params.statuses : this.listParams.statuses
      const search = params.search !== undefined ? params.search : this.listParams.search
      const technology =
        params.technology !== undefined ? params.technology : this.listParams.technology

      try {
        const qs = new URLSearchParams({
          page: String(page),
          rows: String(rows),
        })
        if (statuses?.length) qs.set('statuses', statuses.join(','))
        else if (status) qs.set('status', status)
        if (search) qs.set('search', search)
        if (params.customerId) qs.set('customerId', String(params.customerId))
        if (params.perusahaanId) qs.set('perusahaanId', String(params.perusahaanId))
        if (technology) qs.set('technology', technology)

        const res = await fetch(`${$api.serviceInstances()}?${qs}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Gagal memuat Service Instances')

        this.items = Array.isArray(json.data) ? json.data : []
        this.totalRecords = Number(json.meta?.total) || this.items.length
        if (json.meta?.summary) this.summary = json.meta.summary

        this.listParams = {
          ...this.listParams,
          page,
          rows,
          first: (page - 1) * rows,
          status: status ?? null,
          statuses: statuses ?? null,
          search: search || '',
          technology: technology ?? null,
        }
      } catch (e: any) {
        this.error = e.message
        this.items = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    async fetchCustomerService(params: ServiceInstanceListParams = {}) {
      return this.fetchList({
        ...params,
        statuses:
          params.statuses ??
          (params.status ? [params.status] : DEFAULT_CUSTOMER_SERVICE_STATUSES),
        status: null,
      })
    },

    setPagination(e: { first?: number; rows?: number; page?: number }) {
      const rows = Number(e.rows ?? this.listParams.rows) || 10
      const first = Number(e.first ?? 0)
      const page = e.page != null ? Number(e.page) + 1 : Math.floor(first / rows) + 1
      return this.fetchCustomerService({ page, rows, first })
    },

    setSearch(search: string) {
      return this.fetchCustomerService({ search, page: 1, first: 0 })
    },

    setStatusFilter(status: string | null) {
      if (!status) {
        return this.fetchCustomerService({
          status: null,
          statuses: [...DEFAULT_CUSTOMER_SERVICE_STATUSES],
          page: 1,
          first: 0,
        })
      }
      return this.fetchCustomerService({
        status: null,
        statuses: [status],
        page: 1,
        first: 0,
      })
    },

    async fetchOne(id: string) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const res = await fetch($api.serviceInstancesShow(id), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Gagal memuat detail')
        this.selected = json.data
        return json.data
      } catch (e: any) {
        this.error = e.message
        this.selected = null
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchDashboard() {
      const { $api } = useNuxtApp()
      const res = await fetch($api.serviceInstancesDashboard(), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memuat dashboard')
      this.summary = json.data
      return json.data
    },

    async fetchMonitoring() {
      const { $api } = useNuxtApp()
      const res = await fetch($api.serviceInstancesMonitoring(), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memuat monitoring')
      this.monitoring = json.data
      return json.data
    },

    async fetchEvents(params: { page?: number; serviceInstanceId?: string } = {}) {
      const { $api } = useNuxtApp()
      const qs = new URLSearchParams({ page: String(params.page || 1), limit: '50' })
      if (params.serviceInstanceId) qs.set('serviceInstanceId', params.serviceInstanceId)
      const url = params.serviceInstanceId
        ? `${$api.serviceInstancesEvents(params.serviceInstanceId)}?${qs}`
        : `${$api.serviceInstancesGlobalEvents()}?${qs}`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memuat events')
      this.events = Array.isArray(json.data) ? json.data : []
      return this.events
    },

    async fetchByCustomer(customerId: string | number) {
      const { $api } = useNuxtApp()
      const res = await fetch($api.customerServiceInstances(customerId), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memuat layanan customer')
      return Array.isArray(json.data) ? json.data : []
    },

    async transition(
      id: string,
      action: 'activate' | 'suspend' | 'resume' | 'terminate' | 'archive',
      payload: { reason?: string; reasonCode?: string } = {}
    ) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      const map = {
        activate: $api.serviceInstancesActivate,
        suspend: $api.serviceInstancesSuspend,
        resume: $api.serviceInstancesResume,
        terminate: $api.serviceInstancesTerminate,
        archive: $api.serviceInstancesArchive,
      }
      try {
        const res = await fetch(map[action](id), {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || `Gagal ${action}`)
        toast.success({
          title: 'Sukses',
          message: json.message || 'Berhasil',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
        return json.data
      } catch (e: any) {
        toast.error({
          title: 'Gagal',
          message: e.message,
          color: 'red',
          position: 'topRight',
          layout: 2,
        })
        return null
      }
    },
  },
})
