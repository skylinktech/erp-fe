import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import type { ActivityFeedItem } from '~/utils/activityFeed'

const PAGE_SIZE = 15

type FeedResponse = {
  success: boolean
  data: ActivityFeedItem[]
  meta?: {
    hasMore?: boolean
    currentPage?: number
    perPage?: number
  }
}

export const useDashboardActivityFeedStore = defineStore('dashboardActivityFeed', {
  state: () => ({
    items: [] as ActivityFeedItem[],
    page: 0,
    hasMore: false,
    loading: false,
    loadingMore: false,
    error: null as string | null,
  }),

  getters: {
    isEmpty: (state) => !state.loading && state.items.length === 0,
  },

  actions: {
    async fetchPage(page: number, append = false) {
      const { $api } = useNuxtApp()
      const response = await apiFetch<FeedResponse>($api.activityLogsFeed(PAGE_SIZE, page), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      if (!response.success) {
        throw new Error('Response tidak berhasil')
      }

      const rows = response.data || []
      this.items = append ? [...this.items, ...rows] : rows
      this.page = page
      this.hasMore = !!response.meta?.hasMore
    },

    /** Muat ulang dari halaman 1 (refresh / interval). */
    async fetchFeed() {
      this.loading = true
      this.error = null

      try {
        await this.fetchPage(1, false)
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat activity feed'
        this.items = []
        this.hasMore = false
        this.page = 0
      } finally {
        this.loading = false
      }
    },

    async loadMore() {
      if (!this.hasMore || this.loading || this.loadingMore) return

      this.loadingMore = true
      this.error = null
      try {
        await this.fetchPage(this.page + 1, true)
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat activity feed'
      } finally {
        this.loadingMore = false
      }
    },

    handleScroll(event: Event) {
      const el = event.target as HTMLElement | null
      if (!el) return
      const threshold = 64
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
      if (nearBottom) {
        void this.loadMore()
      }
    },
  },
})
