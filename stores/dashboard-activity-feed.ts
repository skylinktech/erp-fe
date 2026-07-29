import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import type { ActivityFeedItem } from '~/utils/activityFeed'

const FEED_LIMIT = 15

export const useDashboardActivityFeedStore = defineStore('dashboardActivityFeed', {
  state: () => ({
    items: [] as ActivityFeedItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isEmpty: (state) => !state.loading && state.items.length === 0,
  },

  actions: {
    async fetchFeed() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const response = await apiFetch<{ success: boolean; data: ActivityFeedItem[] }>(
          $api.activityLogsFeed(FEED_LIMIT),
          {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }
        )

        if (response.success) {
          this.items = response.data || []
        } else {
          this.error = 'Response tidak berhasil'
        }
      } catch (e: any) {
        this.error = e?.message || 'Gagal memuat activity feed'
        this.items = []
      } finally {
        this.loading = false
      }
    },
  },
})
