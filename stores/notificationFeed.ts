import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import {
  getTabQueryParams,
  mapRecipientToFeedItem,
  type NotificationFeedItem,
  type NotificationTab,
} from '~/utils/notificationFeed'

const PAGE_SIZE = 20

interface TabCounts {
  inbox: number
  general: number
  archived: number
}

interface NotificationFeedState {
  activeTab: NotificationTab
  items: NotificationFeedItem[]
  page: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  error: string | null
  counts: TabCounts
  initialized: boolean
}

export const useNotificationFeedStore = defineStore('notificationFeed', {
  state: (): NotificationFeedState => ({
    activeTab: 'inbox',
    items: [],
    page: 0,
    hasMore: false,
    loading: false,
    loadingMore: false,
    error: null,
    counts: { inbox: 0, general: 0, archived: 0 },
    initialized: false,
  }),

  getters: {
    unreadCount: (state) => state.counts.inbox,
    isEmpty: (state) => !state.loading && state.items.length === 0,
  },

  actions: {
    apiEndpoints() {
      const { $api } = useNuxtApp()
      return {
        list: $api.notifications(),
        markRead: $api.notificationMarkAsRead,
        markAllRead: $api.notificationMarkAllRead,
      }
    },

    async fetchCountsOnly() {
      const api = this.apiEndpoints()
      try {
        const res = await apiFetch<{
          data: unknown[]
          counts?: TabCounts
        }>(`${api.list}?page=1&limit=1&includeCounts=1`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (res.counts) this.counts = res.counts
      } catch {
        /* ignore badge count errors */
      }
    },

    async fetchPage(page: number, append = false) {
      const api = this.apiEndpoints()
      const tabParams = getTabQueryParams(this.activeTab)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        includeCounts: page === 1 ? '1' : '0',
        ...tabParams,
      })

      const res = await apiFetch<{
        data: Record<string, unknown>[]
        meta?: { hasMore?: boolean; currentPage?: number; lastPage?: number }
        counts?: TabCounts
      }>(`${api.list}?${params.toString()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      const mapped = (res.data || []).map((row) => mapRecipientToFeedItem(row))
      this.items = append ? [...this.items, ...mapped] : mapped
      this.page = page
      this.hasMore = !!res.meta?.hasMore
      if (res.counts) this.counts = res.counts
    },

    async openDropdown() {
      this.error = null
      this.loading = true
      try {
        await this.fetchPage(1, false)
        this.initialized = true
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat notifikasi'
        this.items = []
        this.hasMore = false
      } finally {
        this.loading = false
      }
    },

    async switchTab(tab: NotificationTab) {
      if (this.activeTab === tab && this.initialized) return
      this.activeTab = tab
      this.error = null
      this.loading = true
      try {
        await this.fetchPage(1, false)
        this.initialized = true
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat notifikasi'
        this.items = []
        this.hasMore = false
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
        this.error = e?.message || 'Gagal memuat notifikasi'
      } finally {
        this.loadingMore = false
      }
    },

    async markAsRead(recipientId: number | string) {
      const api = this.apiEndpoints()
      const id = String(recipientId)
      if (/^\d+$/.test(id)) {
        await apiFetch(api.markRead(id), {
          method: 'PATCH',
          credentials: 'include',
        })
      }

      const item = this.items.find((row) => String(row.recipientId) === id)
      if (item && !item.isRead) {
        item.isRead = true
        if (this.counts.inbox > 0) this.counts.inbox -= 1
        if (this.activeTab === 'inbox') {
          this.items = this.items.filter((row) => String(row.recipientId) !== id)
        }
      }
    },

    async markAllAsRead() {
      const api = this.apiEndpoints()
      await apiFetch(api.markAllRead(), {
        method: 'PATCH',
        credentials: 'include',
      })

      this.items = this.items.map((item) => ({ ...item, isRead: true }))
      this.counts.inbox = 0
      if (this.activeTab === 'inbox') {
        this.items = []
      }
      await this.fetchCountsOnly()
    },

    prependFeedItem(recipientLike: Record<string, unknown>) {
      const mapped = mapRecipientToFeedItem(recipientLike)
      const exists = this.items.some((row) => String(row.recipientId) === String(mapped.recipientId))
      if (!exists && (this.activeTab === 'general' || (this.activeTab === 'inbox' && !mapped.isRead))) {
        this.items.unshift(mapped)
      }
      if (!mapped.isRead) {
        this.counts.inbox += 1
        this.counts.general += 1
      }
    },

    handleScroll(event: Event) {
      const el = event.target as HTMLElement | null
      if (!el) return
      const threshold = 48
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
      if (nearBottom) {
        void this.loadMore()
      }
    },
  },
})
