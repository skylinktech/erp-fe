import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import {
  mapRecipientToFeedItem,
  type NotificationFeedItem,
} from '~/utils/notificationFeed'
import { useNotificationFeedStore } from '~/stores/notificationFeed'

const IMPORTANT_EVENTS = 'submitted,approved,rejected'
const DASHBOARD_LIMIT = 8

export const useDashboardImportantNotificationsStore = defineStore('dashboardImportantNotifications', {
  state: () => ({
    items: [] as NotificationFeedItem[],
    unreadCount: 0,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isEmpty: (state) => !state.loading && state.items.length === 0,
  },

  actions: {
    async fetchNotifications() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const params = new URLSearchParams({
          page: '1',
          limit: String(DASHBOARD_LIMIT),
          unreadOnly: 'true',
          events: IMPORTANT_EVENTS,
          includeCounts: '1',
        })

        const res = await apiFetch<{
          data: Record<string, unknown>[]
          counts?: { inbox?: number }
        }>(`${$api.notifications()}?${params.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        this.items = (res.data || []).map((row) => mapRecipientToFeedItem(row))
        this.unreadCount = res.counts?.inbox ?? this.items.length
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat notifikasi penting'
        this.items = []
        this.unreadCount = 0
      } finally {
        this.loading = false
      }
    },

    async markAsRead(recipientId: number | string) {
      const { $api } = useNuxtApp()
      const id = String(recipientId)

      if (/^\d+$/.test(id)) {
        await apiFetch($api.notificationMarkAsRead(id), {
          method: 'PATCH',
          credentials: 'include',
        })
      }

      const before = this.items.length
      this.items = this.items.filter((item) => String(item.recipientId) !== id)
      if (this.items.length < before && this.unreadCount > 0) {
        this.unreadCount -= 1
      }

      try {
        const feedStore = useNotificationFeedStore()
        await feedStore.fetchCountsOnly()
      } catch {
        /* sinkronisasi badge opsional */
      }
    },
  },
})
