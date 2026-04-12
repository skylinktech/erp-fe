import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

type UserSession = {
  id: number
  userId: number
  sessionId: string
  ipAddress: string
  userAgent: string
  deviceType: string
  isActive: boolean
  lastActivity: string
  loginAt: string
  logoutAt: string | null
  user: {
    id: number
    email: string
    fullName: string
  }
}

// Helper function untuk mendapatkan sesi terbaru per user
const getLatestSessionPerUser = (sessions: UserSession[]) => {
  const userSessionMap = new Map<number, UserSession>()
  
  sessions.forEach(session => {
    const existingSession = userSessionMap.get(session.userId)
    
    if (!existingSession || 
        new Date(session.lastActivity).getTime() > new Date(existingSession.lastActivity).getTime()) {
      userSessionMap.set(session.userId, session)
    }
  })
  
  return Array.from(userSessionMap.values())
}

export const useUserSessionStore = defineStore('userSession', {
  state: () => ({
    activeUsers: [] as UserSession[],
    loading: false,
    error: null as string | null,
    // Pagination state
    displayedCount: 3, // Jumlah user yang ditampilkan
    showLoadMore: false, // Apakah tombol load more ditampilkan
    isExpanded: false, // Apakah data sudah di-expand semua
  }),

  getters: {
    totalActiveUsers: (state) => {
      return getLatestSessionPerUser(state.activeUsers).length
    },
    
    activeUsersByDevice: (state) => {
      const deviceCount = {
        desktop: 0,
        mobile: 0,
        tablet: 0,
      }
      
      const latestSessions = getLatestSessionPerUser(state.activeUsers)
      
      latestSessions.forEach(session => {
        if (deviceCount[session.deviceType as keyof typeof deviceCount] !== undefined) {
          deviceCount[session.deviceType as keyof typeof deviceCount]++
        }
      })
      
      return deviceCount
    },

    recentActiveUsers: (state) => {
      const latestSessions = getLatestSessionPerUser(state.activeUsers)
        .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      
      // Update showLoadMore berdasarkan jumlah data
      state.showLoadMore = latestSessions.length > state.displayedCount
      
      // Update isExpanded jika semua data sudah ditampilkan
      state.isExpanded = state.displayedCount >= latestSessions.length
      
      return latestSessions.slice(0, state.displayedCount)
    },

    hasMoreUsers: (state) => {
      return getLatestSessionPerUser(state.activeUsers).length > state.displayedCount
    },

    isFullyExpanded: (state) => {
      return state.displayedCount >= getLatestSessionPerUser(state.activeUsers).length
    }
  },

  actions: {
    // Load more users
    loadMoreUsers() {
      this.displayedCount += 3
    },

    // Show less users (collapse back to initial state)
    showLessUsers() {
      this.displayedCount = 3
    },

    // Reset pagination
    resetPagination() {
      this.displayedCount = 3
    },

    async fetchActiveUsers() {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()

        const response = await apiFetch<{ success: boolean; data: UserSession[] }>($api.userSessionsActiveUsers(), {
          credentials: 'include',
          skip403Redirect: true,
        })

        if (response.success) {
          this.activeUsers = response.data || []
          
          // Reset pagination saat refresh data
          this.resetPagination()
        } else {
          this.error = 'Response tidak berhasil'
        }
      } catch (error: any) {
        this.error = error.message || 'Gagal mengambil data user aktif'
      } finally {
        this.loading = false
      }
    },

    async forceLogoutUser(sessionId: string) {
      try {
        const { $api } = useNuxtApp()

        await apiFetch($api.userSessionsForceLogout(sessionId), {
          method: 'POST',
          credentials: 'include',
          skip403Redirect: true,
        })

        // Refresh data setelah force logout
        await this.fetchActiveUsers()
      } catch (error: any) {
        throw error
      }
    },

    async cleanupExpiredSessions() {
      try {
        const { $api } = useNuxtApp()

        await apiFetch($api.userSessionsCleanupExpired(), {
          method: 'POST',
          credentials: 'include',
          skip403Redirect: true,
        })

        // Refresh data setelah cleanup
        await this.fetchActiveUsers()
      } catch (error: any) {
        throw error
      }
    }
  },
})
