import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import type {
  OrgStructureLevelDto,
  OrgStructureResponse,
} from '~/constants/hrd/orgStructure'

interface HrOrgStructureState {
  data: OrgStructureLevelDto[]
  meta: OrgStructureResponse['meta'] | null
  loading: boolean
  filters: {
    search: string
    divisi_id: number | null
    departemen_id: number | null
  }
  divisiOptions: Array<{ id: number; label: string }>
  departemenOptions: Array<{ id: number; label: string }>
}

export const useHrOrgStructureStore = defineStore('hr-org-structure', {
  state: (): HrOrgStructureState => ({
    data: [],
    meta: null,
    loading: false,
    filters: {
      search: '',
      divisi_id: null,
      departemen_id: null,
    },
    divisiOptions: [],
    departemenOptions: [],
  }),

  actions: {
    async fetchFilterOptions() {
      const { $api } = useNuxtApp()
      try {
        const [divRes, depRes] = await Promise.all([
          fetch(`${$api.divisi()}?rows=500&page=1`, { credentials: 'include' }),
          fetch($api.dataDepartemen(), { credentials: 'include' }),
        ])
        const divJson = await divRes.json().catch(() => ({}))
        const depJson = await depRes.json().catch(() => ({}))
        const divList = divJson?.data ?? []
        const depList = depJson?.data ?? depJson ?? []
        this.divisiOptions = (Array.isArray(divList) ? divList : []).map((d: any) => ({
          id: Number(d.id),
          label: d.nm_divisi ?? d.nmDivisi ?? d.nama ?? `#${d.id}`,
        }))
        this.departemenOptions = (Array.isArray(depList) ? depList : []).map((d: any) => ({
          id: Number(d.id),
          label: d.nm_departemen ?? d.nmDepartemen ?? d.nama ?? `#${d.id}`,
        }))
      } catch {
        this.divisiOptions = []
        this.departemenOptions = []
      }
    },

    async fetchStructure() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const qs = new URLSearchParams()
        if (this.filters.search.trim()) qs.set('search', this.filters.search.trim())
        if (this.filters.divisi_id) qs.set('divisi_id', String(this.filters.divisi_id))
        if (this.filters.departemen_id) qs.set('departemen_id', String(this.filters.departemen_id))

        const url = qs.toString()
          ? `${$api.hrStrukturOrganisasi()}?${qs.toString()}`
          : $api.hrStrukturOrganisasi()

        const res = await apiFetch<{ data: OrgStructureResponse }>(url, {
          credentials: 'include',
        })
        this.data = res.data?.levels ?? []
        this.meta = res.data?.meta ?? null
      } catch (error: any) {
        this.data = []
        this.meta = null
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal memuat struktur organisasi',
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },
  },
})
