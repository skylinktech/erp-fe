import { defineStore } from 'pinia'

export interface StockNotification {
  id: string
  type: 'stock_in' | 'stock_out'
  noSi?: string
  noSo?: string
  quantity: number
  status: string
  createdAt: string
  createdBy: string
  createdByName?: string
  warehouseName?: string
  description?: string
}

interface NotificationState {
  notifications: StockNotification[]
  unreadCount: number
  loading: boolean
  error: any
  lastChecked: Date | null
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastChecked: null
  }),

  getters: {
    stockInNotifications: (state) => 
      state.notifications.filter(n => n.type === 'stock_in'),
    
    stockOutNotifications: (state) => 
      state.notifications.filter(n => n.type === 'stock_out'),
    
    unreadNotifications: (state) => 
      state.notifications.filter(n => n.status !== 'posted'),
    
    hasUnreadNotifications: (state) => 
      state.unreadCount > 0
  },

  actions: {
    async fetchNotifications() {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const token = localStorage.getItem('token')
        
        if (!token) {
          throw new Error('Token tidak ditemukan')
        }

        // Fetch stock in notifications
        const stockInResponse = await fetch(`${$api.stockInNotifications()}?status=not_posted&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        })

        // Fetch stock out notifications
        const stockOutResponse = await fetch(`${$api.stockOutNotifications()}?status=not_posted&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        })

        const notifications: StockNotification[] = []

        // Process stock in notifications
        if (stockInResponse.ok) {
          const stockInData = await stockInResponse.json()
          const stockIns = Array.isArray(stockInData.data) ? stockInData.data : stockInData
          
          stockIns.forEach((item: any) => {
            if (item.status !== 'posted') {
              notifications.push({
                id: item.id,
                type: 'stock_in',
                noSi: item.noSi,
                quantity: item.quantity || 0,
                status: item.status,
                createdAt: item.createdAt,
                createdBy: item.createdBy || item.userId || '',
                createdByName: item.user?.fullName || item.createdByName || 'Unknown',
                warehouseName: item.warehouse?.name || 'Unknown Warehouse',
                description: item.description || ''
              })
            }
          })
        }

        // Process stock out notifications
        if (stockOutResponse.ok) {
          const stockOutData = await stockOutResponse.json()
          const stockOuts = Array.isArray(stockOutData.data) ? stockOutData.data : stockOutData
          
          stockOuts.forEach((item: any) => {
            if (item.status !== 'posted') {
              notifications.push({
                id: item.id,
                type: 'stock_out',
                noSo: item.noSo,
                quantity: item.quantity || 0,
                status: item.status,
                createdAt: item.createdAt,
                createdBy: item.createdBy || item.userId || '',
                createdByName: item.user?.fullName || item.createdByName || 'Unknown',
                warehouseName: item.warehouse?.name || 'Unknown Warehouse',
                description: item.description || ''
              })
            }
          })
        }

        // Sort by creation date (newest first)
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        this.notifications = notifications
        this.unreadCount = notifications.length
        this.lastChecked = new Date()

      } catch (error) {
        console.error('Error fetching notifications:', error)
        this.error = error
        this.notifications = []
        this.unreadCount = 0
      } finally {
        this.loading = false
      }
    },

    async markAsRead(notificationId: string) {
      // In a real implementation, you might want to call an API to mark as read
      // For now, we'll just remove it from the unread count
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification && notification.status !== 'posted') {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },

    async markAllAsRead() {
      // In a real implementation, you might want to call an API to mark all as read
      this.unreadCount = 0
    },

    clearNotifications() {
      this.notifications = []
      this.unreadCount = 0
      this.error = null
    },

    // Format time ago for display
    formatTimeAgo(dateString: string): string {
      const now = new Date()
      const date = new Date(dateString)
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return 'Baru saja'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} menit yang lalu`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} jam yang lalu`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} hari yang lalu`
      }
    }
  }
})
