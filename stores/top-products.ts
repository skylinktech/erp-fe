import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

type TopProduct = {
  productId: number
  name: string
  sku: string | null
  totalQty: number
}

export const useTopProductsStore = defineStore('top-products', {
  state: () => ({
    items: [] as TopProduct[],
    visibleCount: 5 as number,
    loading: false as boolean,
    error: null as string | null,
  }),
  getters: {
    visibleItems(state): TopProduct[] {
      return state.items.slice(0, state.visibleCount)
    },
    hasMore(state): boolean {
      return state.visibleCount < Math.min(state.items.length, 10)
    },
    isFullyExpanded(state): boolean {
      return state.visibleCount >= Math.min(state.items.length, 10)
    },
  },
  actions: {
    async fetchTopProducts(period: '1m' | '3m' | '6m' = '1m') {
      const { $api } = useNuxtApp()

      this.loading = true
      this.error = null
      try {
        const url = `${$api.salesOrderTopProducts()}?period=${period}&limit=10`
        const data = await apiFetch<TopProduct[]>(url, {
          credentials: 'include',
        })
        this.items = Array.isArray(data) ? data.slice(0, 10) : []
        this.visibleCount = Math.min(5, this.items.length)
      } catch (err: any) {
        console.error('Error fetchTopProducts:', err)
        this.error = err?.data?.message || err?.message || 'Gagal memuat produk terlaris'
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      const next = Math.min(this.visibleCount + 5, Math.min(this.items.length, 10))
      this.visibleCount = next
    },
    showLess() {
      this.visibleCount = Math.min(5, this.items.length)
    }
  }
})


