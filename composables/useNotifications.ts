import { useNotificationsStore } from '~/stores/notifications'

export const useNotifications = () => {
  const notificationsStore = useNotificationsStore()

  const fetchNotifications = async () => {
    await notificationsStore.fetchNotifications()
  }

  const markAsRead = async (notificationId: string) => {
    await notificationsStore.markAsRead(notificationId)
  }

  const markAllAsRead = async () => {
    await notificationsStore.markAllAsRead()
  }

  const clearNotifications = () => {
    notificationsStore.clearNotifications()
  }

  const formatTimeAgo = (dateString: string) => {
    return notificationsStore.formatTimeAgo(dateString)
  }

  return {
    // State
    notifications: computed(() => notificationsStore.notifications),
    unreadCount: computed(() => notificationsStore.unreadCount),
    hasUnreadNotifications: computed(() => notificationsStore.hasUnreadNotifications),
    loading: computed(() => notificationsStore.loading),
    error: computed(() => notificationsStore.error),
    
    // Getters
    stockInNotifications: computed(() => notificationsStore.stockInNotifications),
    stockOutNotifications: computed(() => notificationsStore.stockOutNotifications),
    unreadNotifications: computed(() => notificationsStore.unreadNotifications),
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    formatTimeAgo
  }
}
