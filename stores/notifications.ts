import { defineStore } from 'pinia'
import { showBrowserNotification, canSendBrowserNotifications } from '~/utils/browserNotifications'
import { useNotificationFeedStore } from '~/stores/notificationFeed'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    initialized: false,
  }),

  actions: {
    pushBrowserNotification(title: string, message: string, tag?: string) {
      if (!canSendBrowserNotifications()) return
      showBrowserNotification(title, {
        body: message,
        tag: tag || title,
      })
    },

    async refreshFeedCounts() {
      const feedStore = useNotificationFeedStore()
      await feedStore.fetchCountsOnly()
    },

    async refreshOpenFeed() {
      const feedStore = useNotificationFeedStore()
      if (!feedStore.initialized) return
      await feedStore.openDropdown()
    },

    handleRealtimeEvent(options: {
      title: string
      message: string
      tag?: string
      recipient?: Record<string, unknown>
    }) {
      try {
        const toast = useToast()
        if (toast?.info) {
          toast.info({ title: options.title, message: options.message })
        }
      } catch {
        /* ignore toast errors */
      }

      this.pushBrowserNotification(options.title, options.message, options.tag)

      const feedStore = useNotificationFeedStore()
      if (options.recipient) {
        feedStore.prependFeedItem(options.recipient)
      } else {
        void feedStore.fetchCountsOnly()
        void this.refreshOpenFeed()
      }
    },

    async initRealtime() {
      if (this.initialized || typeof window === 'undefined') return

      const feedStore = useNotificationFeedStore()
      await feedStore.fetchCountsOnly()

      if ((window as any).__notifications_socket_opened) {
        this.initialized = true
        return
      }

      try {
        const socketModule = await import('socket.io-client')
        const io = (socketModule && (socketModule.io || socketModule.default || socketModule)) as any
        const config = useRuntimeConfig?.() || {}
        const publicConfig = config.public || {}
        const socketPort = publicConfig.socketPort || null
        const socketUrl = socketPort
          ? `${window.location.protocol}//${window.location.hostname}:${socketPort}`
          : window.location.origin
        const socket = io(socketUrl, { withCredentials: true })

        socket.on('connect', () => {
          const userStore = useUserStore()
          const uid = userStore?.user?.id
          socket.emit('authenticate', { userId: uid })
        })

        socket.on('price_adjustment', (payload: any) => {
          try {
            const p = payload.data || payload
            const productName = p.product?.name || p.service?.name || p.did?.code || ''
            const msg = productName
              ? `Price adjustment - ${productName} membutuhkan approval`
              : 'Permintaan price adjustment membutuhkan approval'
            this.handleRealtimeEvent({
              title: 'Price Adjustment',
              message: msg,
              tag: `price_adjustment-${p.id}`,
              recipient: payload.recipient,
            })
          } catch (e) {
            console.error('WS payload handle error', e)
          }
        })

        socket.on('quotation', (payload: any) => {
          try {
            const p = payload.data || payload
            const noQuotation = p.noQuotation || p.no_quotation || ''
            const msg = noQuotation
              ? `Quotation ${noQuotation} membutuhkan approval`
              : `Quotation ${payload.event}`
            this.handleRealtimeEvent({
              title: 'Quotation',
              message: msg,
              tag: `quotation-${p.id}`,
              recipient: payload.recipient,
            })
          } catch (e) {
            console.error('WS payload handle error (quotation)', e)
          }
        })

        socket.on('fdr', (payload: any) => {
          try {
            const p = payload.data || payload
            const fdrNumber = p.fdrNumber || p.fdr_number || ''
            const msg =
              payload.event === 'submitted'
                ? fdrNumber
                  ? `FDR ${fdrNumber} membutuhkan approval`
                  : 'FDR membutuhkan approval'
                : fdrNumber
                  ? `FDR ${fdrNumber} telah diapprove`
                  : 'FDR telah diapprove'
            this.handleRealtimeEvent({
              title: 'FDR',
              message: msg,
              tag: `fdr-${p.id}`,
              recipient: payload.recipient,
            })
          } catch (e) {
            console.error('WS payload handle error (fdr)', e)
          }
        })

        socket.on('notification', (payload: any) => {
          try {
            const recipient = payload.recipient || payload.data?.recipient || payload
            const notification = recipient?.notification || payload.notification
            const type = notification?.type || payload.type || 'Notifikasi'
            const msg = payload.message || notification?.payload?.title || 'Anda memiliki notifikasi baru'
            this.handleRealtimeEvent({
              title: String(type),
              message: String(msg),
              tag: `notification-${recipient?.id || notification?.id || Date.now()}`,
              recipient: recipient?.notification ? recipient : undefined,
            })
          } catch (e) {
            console.error('WS payload handle error (notification)', e)
          }
        })

        socket.on('disconnect', () => {
          console.warn('Notification socket disconnected')
        })

        ;(window as any).__notifications_socket_opened = true
        ;(window as any).__notifications_socket = socket
        this.initialized = true
      } catch (e) {
        console.error('Failed to init socket.io client for notifications', e)
      }
    },
  },
})
