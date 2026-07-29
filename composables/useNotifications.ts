import { useNotificationFeedStore } from '~/stores/notificationFeed'
import { useNotificationsStore } from '~/stores/notifications'
import { formatNotificationTimeAgo } from '~/utils/notificationFeed'

export const useNotifications = () => {
  const notificationsStore = useNotificationsStore()
  const feedStore = useNotificationFeedStore()

  return {
    unreadCount: computed(() => feedStore.unreadCount),
    loading: computed(() => feedStore.loading),
    error: computed(() => feedStore.error),
    items: computed(() => feedStore.items),
    counts: computed(() => feedStore.counts),
    initRealtime: () => notificationsStore.initRealtime(),
    fetchCounts: () => feedStore.fetchCountsOnly(),
    openDropdown: () => feedStore.openDropdown(),
    switchTab: (tab: Parameters<typeof feedStore.switchTab>[0]) => feedStore.switchTab(tab),
    loadMore: () => feedStore.loadMore(),
    markAsRead: (id: number | string) => feedStore.markAsRead(id),
    markAllAsRead: () => feedStore.markAllAsRead(),
    formatTimeAgo: formatNotificationTimeAgo,
  }
}
