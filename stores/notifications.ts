import { defineStore } from 'pinia'

// Use localStorage safely
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage
  }
  return null
}

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

export interface OrderNotification {
  id: string
  type: 'purchase_order' | 'sales_order'
  noPo?: string
  noSo?: string
  status: string
  createdAt: string
  createdBy: string
  createdByName?: string
  vendorName?: string
  customerName?: string
  total: number
  description?: string
}

export type Notification = StockNotification | OrderNotification

interface NotificationState {
  notifications: Notification[]
  stockNotifications: StockNotification[]
  orderNotifications: OrderNotification[]
  unreadCount: number
  loading: boolean
  error: any
  lastChecked: Date | null
  readNotifications: Set<string>
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    stockNotifications: [],
    orderNotifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastChecked: null,
    readNotifications: new Set<string>()
  }),

  getters: {
    stockInNotifications: (state) => 
      state.stockNotifications.filter(n => n.type === 'stock_in'),
    
    stockOutNotifications: (state) => 
      state.stockNotifications.filter(n => n.type === 'stock_out'),
    
    purchaseOrderNotifications: (state) => 
      state.orderNotifications.filter(n => n.type === 'purchase_order'),
    
    salesOrderNotifications: (state) => 
      state.orderNotifications.filter(n => n.type === 'sales_order'),
    
    // Getter untuk notifikasi navbar (maksimal 5 terbaru)
    navbarNotifications: (state) => 
      state.notifications.slice(0, 5),
    
    unreadNotifications: (state) => 
      state.notifications.filter(n => {
        if (n.type === 'stock_in' || n.type === 'stock_out') {
          return n.status !== 'posted'
        }
        return n.status === 'draft'
      }),
    
    hasUnreadNotifications: (state) => 
      state.unreadCount > 0
  },

  actions: {
    // Load read notifications from localStorage
    loadReadNotifications() {
      try {
        const storage = getLocalStorage()
        if (storage) {
          const stored = storage.getItem('readNotifications')
          if (stored) {
            this.readNotifications = new Set(JSON.parse(stored))
          }
        }
      } catch (error) {
        console.warn('Failed to load read notifications from localStorage:', error)
      }
    },

    // Save read notifications to localStorage
    saveReadNotifications() {
      try {
        const storage = getLocalStorage()
        if (storage) {
          storage.setItem('readNotifications', JSON.stringify([...this.readNotifications]))
        }
      } catch (error) {
        console.warn('Failed to save read notifications to localStorage:', error)
      }
    },

    async fetchNotifications() {
      this.loading = true
      this.error = null
      
      // Load read notifications from localStorage first
      this.loadReadNotifications()
      
      try {
        const { $api } = useNuxtApp()
        
        // Cookie-based auth: token otomatis dikirim via httpOnly cookie

        // Fetch all notifications in parallel
        const [stockInResponse, stockOutResponse, purchaseOrderResponse, salesOrderResponse] = await Promise.all([
          fetch(`${$api.stockInNotifications()}?status=not_posted&limit=10`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          }),
          fetch(`${$api.stockOutNotifications()}?status=not_posted&limit=10`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          }),
          fetch(`${$api.purchaseOrderNotifications()}?status=draft&limit=10`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          }),
          fetch(`${$api.salesOrderNotifications()}?status=draft&limit=10`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          })
        ])

        const stockNotifications: StockNotification[] = []
        const orderNotifications: OrderNotification[] = []

        // Process stock in notifications
        if (stockInResponse.ok) {
          const stockInData = await stockInResponse.json()
          const stockIns = Array.isArray(stockInData.data) ? stockInData.data : stockInData
          
          stockIns.forEach((item: any) => {
            if (item.status !== 'posted') {
              stockNotifications.push({
                id: item.id,
                type: 'stock_in',
                noSi: item.noSi,
                quantity: item.quantity || 0,
                status: item.status,
                createdAt: item.createdAt,
                createdBy: item.createdBy || item.userId || '',
                createdByName: item.user?.fullName || item.createdByName || 'Unknown',
                warehouseName: item.warehouseName || item.warehouse?.name || 'Unknown Warehouse',
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
              stockNotifications.push({
                id: item.id,
                type: 'stock_out',
                noSo: item.noSo,
                quantity: item.quantity || 0,
                status: item.status,
                createdAt: item.createdAt,
                createdBy: item.createdBy || item.userId || '',
                createdByName: item.user?.fullName || item.createdByName || 'Unknown',
                warehouseName: item.warehouseName || item.warehouse?.name || 'Unknown Warehouse',
                description: item.description || ''
              })
            }
          })
        }

        // Process purchase order notifications
        if (purchaseOrderResponse.ok) {
          const purchaseOrderData = await purchaseOrderResponse.json()
          const purchaseOrders = Array.isArray(purchaseOrderData.data) ? purchaseOrderData.data : purchaseOrderData
          
          purchaseOrders.forEach((item: any) => {
            if (item.status === 'draft') {
              orderNotifications.push({
                id: item.id,
                type: 'purchase_order',
                noPo: item.noPo,
                status: item.status,
                createdAt: item.createdAt,
                createdBy: item.createdBy || '',
                createdByName: item.createdByName || 'Unknown',
                vendorName: item.vendorName || 'Unknown Vendor',
                total: item.total || 0,
                description: item.description || ''
              })
            }
          })
        }

        // Process sales order notifications
        if (salesOrderResponse.ok) {
          const salesOrderData = await salesOrderResponse.json()
          const salesOrders = Array.isArray(salesOrderData.data) ? salesOrderData.data : salesOrderData
          
          salesOrders.forEach((item: any) => {
            if (item.status === 'draft') {
              orderNotifications.push({
                id: item.id,
                type: 'sales_order',
                noSo: item.noSo,
                status: item.status,
                createdAt: item.createdAt,
                createdBy: item.createdBy || '',
                createdByName: item.createdByName || 'Unknown',
                customerName: item.customerName || 'Unknown Customer',
                total: item.total || 0,
                description: item.description || ''
              })
            }
          })
        }

        // Combine all notifications
        const allNotifications: Notification[] = [...stockNotifications, ...orderNotifications]
        
        // Sort by creation date (newest first)
        allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Store all notifications
        this.notifications = allNotifications
        this.stockNotifications = stockNotifications
        this.orderNotifications = orderNotifications
        
        // Calculate unread count based on read notifications
        this.unreadCount = allNotifications.filter(notification => 
          !this.readNotifications.has(notification.id)
        ).length
        
        // Clean up read notifications for items that are no longer relevant
        this.cleanupReadNotifications()
        
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
      this.readNotifications.add(notificationId)
      this.saveReadNotifications()
      
      // Recalculate unread count
      this.unreadCount = this.notifications.filter(notification => 
        !this.readNotifications.has(notification.id)
      ).length
    },

    async markAllAsRead() {
      // Mark all current notifications as read
      this.notifications.forEach(notification => {
        this.readNotifications.add(notification.id)
      })
      this.saveReadNotifications()
      
      // Set unread count to 0
      this.unreadCount = 0
    },

    clearNotifications() {
      this.notifications = []
      this.unreadCount = 0
      this.error = null
    },

    // Clean up read notifications for items that are no longer in the notifications list
    cleanupReadNotifications() {
      const currentNotificationIds = new Set(this.notifications.map(n => n.id))
      const cleanedReadNotifications = new Set<string>()
      
      this.readNotifications.forEach(id => {
        if (currentNotificationIds.has(id)) {
          cleanedReadNotifications.add(id)
        }
      })
      
      this.readNotifications = cleanedReadNotifications
      this.saveReadNotifications()
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
